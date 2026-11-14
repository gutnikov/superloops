---
title: Check each migration before it runs
summary: A migration linter names a dangerous operation in a new database migration, such as a table lock or a destructive change, and the agent rewrites the migration; then it is applied, rolled back and applied again on a throwaway database. A bad migration does its damage when it runs, and reverting the code does not undo it.
sensors: [linter, test-runner]
when: On every change that adds a migration or edits one that has not run anywhere yet, in the agent's session before it commits, and again in CI on the pull request.
failure: A violation of a rule set to fail in a new migration, a step of the up, down and up run that errors on the throwaway database, or a run that checked no migration although the change adds one.
next: The agent rewrites the migration the safe way and runs the check again; it never rewrites a migration that has already run. An operation that is dangerous but intended, such as dropping a column nothing reads any more, gets an ignore comment with its reason, and a person approves it in review. When the check still fails after three rounds, or the safe way needs several releases the task did not plan, the agent stops and hands a person the violation and the steps it proposes. Running the migration in production is not part of this loop, and stays with a person.
---

## The loop

1. The agent writes a migration, or changes one that has not run anywhere yet.
2. The linter reads each new migration and names the dangerous operation, with its `file:line` and the rule: an index
   built without `CONCURRENTLY`, which blocks writes to the table in PostgreSQL; a `NOT NULL` column added without a
   default; a column whose type changes; a dropped column or table.
3. The agent rewrites the migration the safe way: the index built concurrently; the column added as nullable, filled,
   and made required in a later migration; a column dropped over two releases, the first of which stops using it.
4. A job starts a throwaway database of the same engine and major version as production, applies the main branch's
   migrations, then applies the new one, rolls it back and applies it again. A step that errors prints
   `<migration>: <up|down> failed: <error>`.
5. The agent fixes what failed and runs both checks again. The CI run on the pull request is the one that counts.

## Why

A migration runs against real data, and a destructive change or a long table lock does its damage the moment it runs:
dropped data is gone, and a locked table stops writes for every user while the lock lasts. Reverting the code undoes
neither. The tests run on a small or empty database, where such a migration passes: a `NOT NULL` column without a
default adds cleanly to an empty table, and fails at once on a populated one. The linter names the dangerous
operation while it is still a file in the pull request, and the run up, down and up again shows that the migration
applies, and that its rollback works before anyone needs it.

## Set up

- **A linter for the engine and the migration tool.** For PostgreSQL migrations in SQL, Squawk
  (`squawk --reporter json` on the new files); for several engines, Atlas `migrate lint` with `--git-base main`,
  which lints the migrations added since the main branch (a feature of Atlas Pro since v0.38); for Ruby on Rails,
  strong_migrations, which stops a dangerous migration when it runs in development and says the safe way.
- **Lint only the new migrations.** A migration that has already run is history: rewriting it changes nothing in the
  databases it ran on, and makes the files disagree with them.
- **A run that checked nothing is not a pass.** The check counts the migrations it linted, and fails on none when the
  change adds one. A linter that crashed exits non-zero too, so the check reads the report, not only the exit code.
- **An ignore is a reviewed line.** `-- squawk-ignore <rule>` above the statement in Squawk, `-- atlas:nolint
  destructive` in Atlas, a `safety_assured` block in strong_migrations: each carries its reason, and a person
  approves it in review.
- **The throwaway database** is a fresh container, started for the run and removed after it, of the same engine and
  major version as production, since what locks a table differs between versions. Testcontainers or a Compose file
  starts it.
- **The check is tested.** It must fire on a migration that adds a `NOT NULL` column without a default, on one that
  builds an index without `CONCURRENTLY`, and on one whose rollback fails. It must pass on a migration that adds a
  nullable column and builds its index concurrently, with a working rollback.
- **Out of the agent's reach.** The CI run counts, and a hook refuses the agent's writes to the linter's
  configuration. The agent holds no production credentials: running a migration in production is an action a person
  confirms.

## Where it does not apply

The linter sees the SQL, not the data: a lock that is harmless on a small table is downtime on a large one, and the
throwaway database holds none of production's volume. A migration that moves or rewrites data can be valid SQL and
still produce wrong data: that needs a test of the data, and when it goes wrong anyway, the way back is a backup
that is known to restore.
