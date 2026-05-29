ALTER TABLE "folders" ADD COLUMN IF NOT EXISTS "side_a_language" text DEFAULT 'en' NOT NULL;
ALTER TABLE "folders" ADD COLUMN IF NOT EXISTS "side_b_language" text DEFAULT 'ru' NOT NULL;

UPDATE "folders" f
SET
  "side_b_language" = COALESCE(u."language", 'ru')
FROM "users" u
WHERE f."user_id" = u."id";
