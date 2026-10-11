CREATE TABLE `presetMapViews` (
	`day` text NOT NULL,
	`presetMapId` text NOT NULL,
	`viewer` text NOT NULL,
	PRIMARY KEY(`day`, `presetMapId`, `viewer`)
);
--> statement-breakpoint
ALTER TABLE `presetMaps` ADD `draftCount` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `presetMaps` ADD `hidden` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `presetMaps` ADD `featured` integer DEFAULT false NOT NULL;