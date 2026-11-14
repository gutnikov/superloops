---
title: Restore and rollback drills
summary: On a schedule, a job restores the database from a real backup into a throwaway place and checks the data, and rolls a release back on staging; when a check fails, the agent fixes the procedure. A backup never restored may not restore on the day it is needed, and then the data is lost.
sensors: [smoke-probe]
when: The restore weekly, and after every change to the backup job or its configuration; the rollback nightly on staging, against the latest release candidate.
failure: A restore that errors, takes longer than the recovery time the project promises, or brings back tables with too few rows or a newest row older than the backup interval allows. A rollback after which the previous release does not come up or fails its smoke checks. A change whose read-back shows it did not happen. A drill that did not run on schedule.
next: The agent reads the drill's report and fixes the procedure through a pull request (the backup job, the restore script, the rollback command, or a migration the previous release cannot run with), and the next drill must pass. It never holds the drill's credentials, and never restores or rolls back production. When the cause is outside the repository, such as no backup written or access to the storage revoked, or the next drill still fails after its fix, it stops and hands a person the report, since until the drill passes the project may have no way back.
---

## The loop

1. **Restore.** A scheduled job restores the latest production backup into a scratch database, never over a live
   one. It checks that the restore finished without an error, that the schema is at the latest migration, that the
   key tables hold rows in numbers close to the live database's, that the newest row is no older than the backup
   interval allows, and that the whole restore took less than the recovery time the project promises.
2. **Rollback.** On staging, the job deploys the release candidate, which runs its migrations, then rolls back to the
   previous release and waits for the rollout to finish; on Kubernetes, `kubectl rollout undo`, then
   `kubectl rollout status`, which exits non-zero once the rollout passes its deadline. It runs the smoke suite on
   the previous release against the database the candidate migrated. This catches a migration that the previous
   release cannot run with.
3. **Read-backs.** Each change the drill makes is read back: the previous version is the one that answers; for a
   package on a registry, the channel tag points at the previous version again and the bad version is marked
   deprecated.
4. The job saves a report with one line per item, such as `restore: ok (41m, newest row 3h old)`,
   `restore: stale (newest row 52h old)`, `restore: too slow (3h10m > 2h)` or
   `rollback: smoke failed on the previous release`, and exits non-zero on anything but `ok`.
5. On a red item, the agent fixes the procedure through a pull request. The next drill is the reproduction, and it
   must pass.

## Why

A backup that has never been restored, or a rollback that has never been run, may not work on the day it is needed:
the dump is incomplete, the restore tool does not match it, or the previous release cannot read the schema the new
one migrated. None of the checks on a change runs them. A failed rollback leaves users on a broken release, and a
backup that does not restore loses the data for good. A drill on a schedule finds the broken procedure before an
incident does, while an older good backup is still kept.

## Set up

- **The procedure is code**: the backup and restore scripts and the rollback command live in the repository, so a
  drill runs exactly what an incident would. The database's own tools do the work, such as `pg_dump` and
  `pg_restore`, `mysqldump` and the `mysql` client, `mongodump` and `mongorestore`, or a managed database's snapshots.
- **A restore error fails the drill.** By default `pg_restore` goes on after an error and reports the count at the
  end; run it with `--exit-on-error`, or fail the drill on any count above zero. Give the restore a time limit too.
- **What counts as restored** is the project's decision, written beside the drill: the key tables with their minimum
  row counts, the freshness limit and the recovery time.
- **Every read-back fails and passes when it should.** A check after a change must fail when the change did not
  happen and pass when it did, and it is tested both ways. A read-back written only for the failure can fail on
  success: one that asks whether a deleted release exists errors when it is gone. A dry run that skips the changes
  skips their read-backs too, so the drill runs for real, on staging and a scratch registry.
- **A drill that did not run is red.** The job reports each success, and an alert fires when no report arrives on
  schedule.
- **More often than backups expire**, so a broken backup is found while an older good one is still kept.
- **Out of the agent's reach.** The job runs with its own credentials, which read the backups and write only to the
  scratch database and to staging. The agent never gets them: it reads the report and changes the procedure through
  a pull request. A restore or a rollback in production stays with a person or the deploy pipeline.
