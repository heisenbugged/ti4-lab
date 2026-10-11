CREATE TABLE `drafts` (
	`id` text PRIMARY KEY,
	`data` blob NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
