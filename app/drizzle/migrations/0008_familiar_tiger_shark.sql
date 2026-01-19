CREATE TABLE `draftStagedSelections` (
	`id` text PRIMARY KEY NOT NULL,
	`draftId` text NOT NULL,
	`phase` text NOT NULL,
	`playerId` integer NOT NULL,
	`value` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`draftId`) REFERENCES `drafts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `draft_staged_selections_draft_id_index` ON `draftStagedSelections` (`draftId`);--> statement-breakpoint
CREATE INDEX `draft_staged_selections_phase_index` ON `draftStagedSelections` (`draftId`,`phase`);--> statement-breakpoint
CREATE UNIQUE INDEX `draft_phase_player_unique` ON `draftStagedSelections` (`draftId`,`phase`,`playerId`);