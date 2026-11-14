---
title: Backup and restore
summary: The database's own tools for backing up and restoring, used to prove that a backup can actually be restored.
sensors: [smoke-probe]
layer: system
vendors:
  - name: PostgreSQL
    url: https://www.postgresql.org/docs/current/backup.html
    note: "`pg_dump` and `pg_restore`"
  - name: pgBackRest
    url: https://pgbackrest.org/
    note: PostgreSQL, with restores to a point in time
  - name: MySQL
    url: https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html
    note: "`mysqldump` and the `mysql` client"
  - name: MongoDB Database Tools
    url: https://www.mongodb.com/docs/database-tools/
    note: "`mongodump` and `mongorestore`"
  - name: Amazon RDS
    url: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_RestoreFromSnapshot.html
    note: a managed database's snapshots, restored to a new instance; other clouds have their own
---

A backup is proven only by restoring it. This tool is the database's own backup and restore, or the managed service's
snapshots. Look for it in the project's operations config rather than assume it.

## Finding it

- **The backup job**: a scheduled job, a Kubernetes `CronJob`, or the managed database's backup settings.
- **Where backups go**: the bucket or the list of snapshots, and who may read them.
- **The database's version**, so the restore tool matches it: `pg_restore` cannot read a file from a newer
  `pg_dump`.

When no backup job turns up, report that to a person: backups need storage and access that the people who run the
database grant.

## Using it

- **Restore the latest backup into a scratch database**, never over a live one: a new instance from a snapshot, or
  the restore tool that matches the dump's format. `pg_restore --dbname=<scratch> <file>` reads `pg_dump`'s custom
  format (`-Fc`); a plain SQL dump goes through `psql --dbname=<scratch> -f <file>`.
- **Check what came back**: the main tables hold rows, in numbers close to the live database's, and the newest row is
  close to the backup's time. That gap is the data an outage would lose; the project decides how much it can afford.
- **Time the restore**: an outage that needs a restore lasts at least this long. Compare it with how long the project
  can afford to be down.
- **Run the whole drill on a schedule**, more often than backups expire, so a broken backup is found while an older
  good one is still kept; and again after any change to the backup job.

A restore that errors, or a check above that does not hold, is a failed step, and the signal names it. Give the
restore a time limit: one that never finishes is a failure too.
