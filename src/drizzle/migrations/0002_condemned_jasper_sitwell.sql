CREATE TABLE `multiDrafts` (
	`id` text PRIMARY KEY NOT NULL,
	`urlName` text,
	`draftUrlNames` text,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `multiDrafts_urlName_index` ON `multiDrafts` (`urlName`);