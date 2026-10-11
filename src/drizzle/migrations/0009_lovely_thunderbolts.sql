CREATE TABLE `presetMapLikes` (
	`id` text PRIMARY KEY NOT NULL,
	`presetMapId` text NOT NULL,
	`ip` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `presetMaps` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`author` text NOT NULL,
	`mapString` text NOT NULL,
	`mapConfigId` text NOT NULL,
	`likes` integer DEFAULT 0 NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	`avgSliceValue` real,
	`totalResources` integer,
	`totalInfluence` integer,
	`legendaries` integer,
	`techSkips` text,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `preset_map_likes_preset_map_id_index` ON `presetMapLikes` (`presetMapId`);--> statement-breakpoint
CREATE UNIQUE INDEX `preset_map_likes_unique` ON `presetMapLikes` (`presetMapId`,`ip`);--> statement-breakpoint
CREATE UNIQUE INDEX `presetMaps_slug_unique` ON `presetMaps` (`slug`);--> statement-breakpoint
CREATE INDEX `preset_maps_slug_index` ON `presetMaps` (`slug`);--> statement-breakpoint
CREATE INDEX `preset_maps_name_index` ON `presetMaps` (`name`);--> statement-breakpoint
CREATE INDEX `preset_maps_created_at_index` ON `presetMaps` (`createdAt`);