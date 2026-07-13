-- Add multi-context storage for cards; backfill from legacy sentence columns.
ALTER TABLE "cards"
  ADD COLUMN IF NOT EXISTS "contexts" jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "active_context_id" uuid;

UPDATE "cards" AS c
SET
  "contexts" = jsonb_build_array(
    jsonb_build_object(
      'id', v.context_id,
      'text', coalesce(c."question_sentences", ''),
      'translation', coalesce(c."answer_sentences", ''),
      'createdAt', coalesce(
        to_char(c."created_at" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
      )
    )
  ),
  "active_context_id" = v.context_id::uuid
FROM (
  SELECT
    id,
    gen_random_uuid()::text AS context_id
  FROM "cards"
  WHERE
    ("question_sentences" IS NOT NULL OR "answer_sentences" IS NOT NULL)
    AND ("contexts" = '[]'::jsonb OR "contexts" IS NULL)
) AS v
WHERE c.id = v.id;
