CREATE TABLE "external_accounts" (
	"provider" text NOT NULL,
	"external_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telegram_auth_nonce" (
	"nonce" text PRIMARY KEY NOT NULL,
	"telegram_user_id" bigint NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
