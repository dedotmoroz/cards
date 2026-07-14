DROP INDEX IF EXISTS "context_reading_artifacts_user_folder_uidx";

CREATE INDEX IF NOT EXISTS "context_reading_artifacts_user_folder_created_idx"
  ON "context_reading_artifacts" ("user_id", "folder_id", "created_at");
