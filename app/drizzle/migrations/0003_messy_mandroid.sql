CREATE TABLE `draftDiscordMessages` (
	`messageId` text PRIMARY KEY NOT NULL,
	`draftId` text NOT NULL,
	`pick` integer NOT NULL,
	FOREIGN KEY (`draftId`) REFERENCES `drafts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `draft_discord_messages_draft_id_index` ON `draftDiscordMessages` (`draftId`);--> statement-breakpoint
CREATE UNIQUE INDEX `draft_id_pick_unique` ON `draftDiscordMessages` (`draftId`,`pick`);