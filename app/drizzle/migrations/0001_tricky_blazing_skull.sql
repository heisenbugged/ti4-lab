ALTER TABLE `drafts` ADD `urlName` text;--> statement-breakpoint
CREATE INDEX `urlName_index` ON `drafts` (`urlName`);