CREATE TABLE `decisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`decisionId` varchar(32) NOT NULL,
	`type` enum('PAYMENT','LIMIT_OVERRIDE','AML_EXCEPTION') NOT NULL,
	`subject` varchar(512) NOT NULL,
	`policyCode` varchar(32) NOT NULL,
	`risk` enum('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL,
	`requiredAuthority` enum('SUPERVISOR','COMPLIANCE','DUAL') NOT NULL,
	`status` enum('PENDING','APPROVED','REJECTED','ESCALATED','EXECUTING','COMPLETED') NOT NULL DEFAULT 'PENDING',
	`slaDeadline` timestamp NOT NULL,
	`amount` varchar(64),
	`beneficiary` varchar(256),
	`context` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `decisions_id` PRIMARY KEY(`id`),
	CONSTRAINT `decisions_decisionId_unique` UNIQUE(`decisionId`)
);
--> statement-breakpoint
CREATE TABLE `evidence_packs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`evidenceId` varchar(32) NOT NULL,
	`decisionId` varchar(32) NOT NULL,
	`actorId` int NOT NULL,
	`actorName` varchar(256) NOT NULL,
	`actorRole` varchar(64) NOT NULL,
	`action` enum('APPROVED','REJECTED','ESCALATED') NOT NULL,
	`justification` text NOT NULL,
	`policySnapshot` varchar(64) NOT NULL,
	`merkleHash` varchar(128) NOT NULL,
	`ledgerId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evidence_packs_id` PRIMARY KEY(`id`),
	CONSTRAINT `evidence_packs_evidenceId_unique` UNIQUE(`evidenceId`)
);
--> statement-breakpoint
CREATE TABLE `policies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(32) NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` text,
	`requiredAuthority` enum('SUPERVISOR','COMPLIANCE','DUAL') NOT NULL,
	`riskLevel` enum('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
	`isActive` int NOT NULL DEFAULT 1,
	`version` varchar(16) NOT NULL DEFAULT '1.0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `policies_id` PRIMARY KEY(`id`),
	CONSTRAINT `policies_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','operator','supervisor','compliance') NOT NULL DEFAULT 'user';