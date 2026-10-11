ALTER TABLE `drafts` ADD `type` text;--> statement-breakpoint
ALTER TABLE `drafts` ADD `isComplete` integer;--> statement-breakpoint
CREATE INDEX `type_index` ON `drafts` (`type`);--> statement-breakpoint
CREATE INDEX `isComplete_index` ON `drafts` (`isComplete`);