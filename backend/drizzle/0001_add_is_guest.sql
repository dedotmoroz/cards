-- Migration: Add is_guest field to users table
ALTER TABLE "users" ADD COLUMN "is_guest" boolean DEFAULT false NOT NULL;

