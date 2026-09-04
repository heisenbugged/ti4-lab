CREATE TABLE `draftPresets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`data` text NOT NULL,
	`keepFactions` integer DEFAULT true NOT NULL,
	`playerCount` integer NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `draftPresets_name_unique` ON `draftPresets` (`name`);--> statement-breakpoint
CREATE INDEX `draft_presets_name_index` ON `draftPresets` (`name`);