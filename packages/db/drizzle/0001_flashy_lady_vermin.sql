ALTER TABLE `transactions` ADD `person_id` text REFERENCES people(id);--> statement-breakpoint
ALTER TABLE `transactions` ADD `from_asset_id` text REFERENCES assets(id);--> statement-breakpoint
ALTER TABLE `transactions` ADD `to_asset_id` text REFERENCES assets(id);--> statement-breakpoint
ALTER TABLE `transactions` ADD `from_owner_id` text REFERENCES sources(id);--> statement-breakpoint
ALTER TABLE `transactions` ADD `to_owner_id` text REFERENCES sources(id);