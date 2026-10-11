ALTER TABLE `drafts` ADD `mode` text;--> statement-breakpoint
ALTER TABLE `drafts` ADD `phase` text;--> statement-breakpoint
ALTER TABLE `drafts` ADD `selectionsCount` integer;--> statement-breakpoint
ALTER TABLE `drafts` ADD `pickOrderCount` integer;--> statement-breakpoint
ALTER TABLE `drafts` ADD `progressPercent` real;--> statement-breakpoint
ALTER TABLE `drafts` ADD `playerCount` integer;--> statement-breakpoint
ALTER TABLE `drafts` ADD `playerNames` text;--> statement-breakpoint
ALTER TABLE `drafts` ADD `playerNamesSearch` text;--> statement-breakpoint
CREATE INDEX `drafts_mode_index` ON `drafts` (`mode`);--> statement-breakpoint
CREATE INDEX `drafts_phase_index` ON `drafts` (`phase`);--> statement-breakpoint
CREATE INDEX `drafts_player_count_index` ON `drafts` (`playerCount`);--> statement-breakpoint
CREATE INDEX `drafts_mode_complete_updated_index` ON `drafts` (`mode`,`isComplete`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `drafts_phase_complete_updated_index` ON `drafts` (`phase`,`isComplete`,`updatedAt`);
