CREATE TABLE `hubDrafts` (
	`hubId` text NOT NULL,
	`draftId` text NOT NULL,
	`source` text NOT NULL,
	`label` text,
	`archivedAt` text,
	`addedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`draftId`, `hubId`),
	FOREIGN KEY (`hubId`) REFERENCES `hubs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`draftId`) REFERENCES `drafts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `hubSliceSets` (
	`id` text PRIMARY KEY NOT NULL,
	`hubId` text NOT NULL,
	`presetId` text NOT NULL,
	`title` text NOT NULL,
	`archivedAt` text,
	`addedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`hubId`) REFERENCES `hubs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`presetId`) REFERENCES `draftPresets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `hubs` (
	`id` text PRIMARY KEY NOT NULL,
	`ownerId` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`globalName` text,
	`avatar` text,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`lastSeenAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `hub_drafts_draft_id_index` ON `hubDrafts` (`draftId`);--> statement-breakpoint
CREATE INDEX `hub_slice_sets_hub_id_index` ON `hubSliceSets` (`hubId`);--> statement-breakpoint
CREATE UNIQUE INDEX `hub_slice_sets_hub_preset_unique` ON `hubSliceSets` (`hubId`,`presetId`);--> statement-breakpoint
CREATE UNIQUE INDEX `hubs_ownerId_unique` ON `hubs` (`ownerId`);--> statement-breakpoint
CREATE UNIQUE INDEX `hubs_slug_unique` ON `hubs` (`slug`);--> statement-breakpoint
CREATE INDEX `hubs_slug_index` ON `hubs` (`slug`);