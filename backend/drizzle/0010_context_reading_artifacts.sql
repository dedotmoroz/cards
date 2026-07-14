CREATE TABLE IF NOT EXISTS "context_reading_artifacts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "folder_id" text NOT NULL,
  "job_id" text NOT NULL,
  "card_ids" text[] NOT NULL,
  "cards_snapshot" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "text" text NOT NULL,
  "translation" text NOT NULL,
  "level" text NOT NULL,
  "has_audio" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "context_reading_artifacts_user_folder_uidx"
  ON "context_reading_artifacts" ("user_id", "folder_id");
