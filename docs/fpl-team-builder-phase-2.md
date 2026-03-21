# FPL Team Builder Phase 2 Outline

## Objective

Move from manual CSV updates to a reliable automated ingestion pipeline that merges three source websites into one canonical player dataset.

## Proposed architecture

1. Add a dedicated ingestion package at `scripts/ingest-fpl`.
2. Build one adapter per data source:
   - fetch raw payloads,
   - normalize fields to internal names,
   - attach metadata (`source`, `fetched_at`).
3. Add an identity resolution layer:
   - normalize player names,
   - resolve duplicates using team + position rules,
   - keep a manual override map for ambiguous matches.
4. Merge outputs into a canonical record shape matching `lib/fpl-team-builder/types.ts`.
5. Validate merged records using the existing schema pipeline.
6. Publish a generated artifact (`data/fplData.csv` and optional JSON).

## Delivery workflow

- Run ingestion on demand locally with `npm run ingest:fpl`.
- Add scheduled automation via GitHub Actions/cron.
- Commit or upload generated artifact after passing quality checks.

## Data quality gates

- Required field completeness threshold.
- Numeric bounds checks (`>= 0`).
- Duplicate player detection.
- Schema drift alerts when a source changes columns.

## Suggested enhancements after initial automation

- Persist snapshots to Postgres for historical trend views.
- Add confidence scoring for merged metrics.
- Add audit log and source-level lineage in UI.
