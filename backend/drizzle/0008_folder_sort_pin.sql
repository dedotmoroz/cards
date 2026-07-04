ALTER TABLE "folders" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "folders" ADD COLUMN "pinned" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "folder_sort_mode" text DEFAULT 'created_desc' NOT NULL;
