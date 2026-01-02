CREATE TABLE "context_reading_states" (
	"user_id" text NOT NULL,
	"folder_id" text NOT NULL,
	"used_card_ids" text[] NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "context_reading_states_user_id_folder_id_pk" PRIMARY KEY("user_id","folder_id")
);
--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "question_sentences" text;--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "answer_sentences" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_guest" boolean;