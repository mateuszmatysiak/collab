ALTER TABLE "list_items" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
CREATE INDEX "list_items_list_id_deleted_at_idx" ON "list_items" USING btree ("list_id","deleted_at");