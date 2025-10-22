CREATE TABLE `comments` (
	`id` integer PRIMARY KEY NOT NULL,
	`parentId` integer NOT NULL,
	`status` integer DEFAULT 0,
	`author` text NOT NULL,
	`description` text NOT NULL,
	`votes` text DEFAULT '[]',
	`downvotes` text DEFAULT '[]',
	`voteCount` integer GENERATED ALWAYS AS (length("votes")-length(replace("votes", ',', ''))-length("downvotes")+length(replace("downvotes", ',', ''))) STORED,
	FOREIGN KEY (`parentId`) REFERENCES `suggestions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `parentIdx` ON `comments` (`parentId`,`id`,`description`,`votes`,`downvotes`,`voteCount`);--> statement-breakpoint
CREATE TABLE `suggestions` (
	`id` integer PRIMARY KEY NOT NULL,
	`voteCount` integer GENERATED ALWAYS AS (length("votes")-length(replace("votes", ',', ''))-length("downvotes")+length(replace("downvotes", ',', ''))) STORED,
	`status` integer DEFAULT 0,
	`author` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`votes` text DEFAULT '[]',
	`downvotes` text DEFAULT '[]',
	`metadata` blob
);
--> statement-breakpoint
CREATE INDEX `titleVoteIdx` ON `suggestions` (`title`,`voteCount`,`votes`,`downvotes`,`id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`role` integer DEFAULT 2 NOT NULL,
	`picture` text NOT NULL,
	`lastName` text NOT NULL,
	`firstName` text NOT NULL,
	`name` text NOT NULL,
	`moderationNotifications` integer DEFAULT true,
	`replyNotifications` integer DEFAULT true,
	`voteNotifications` integer DEFAULT false,
	`milestoneNotifications` integer DEFAULT true
);
--> statement-breakpoint
CREATE INDEX `roleIdx` ON `users` (`role`,`email`,`name`,`picture`,`id`);