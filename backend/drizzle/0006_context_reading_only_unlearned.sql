ALTER TABLE "context_reading_states" ADD COLUMN IF NOT EXISTS "only_unlearned" boolean DEFAULT true NOT NULL;
