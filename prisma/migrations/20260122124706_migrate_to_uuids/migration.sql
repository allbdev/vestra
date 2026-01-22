-- Migration: Convert all Int IDs to UUIDs
-- This migration cleans all data and converts all integer IDs to UUIDs

-- Step 1: Clean all data (as requested)
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `transactions`;
TRUNCATE TABLE `transaction_templates`;
TRUNCATE TABLE `categories`;
TRUNCATE TABLE `sessions`;
TRUNCATE TABLE `workspace_users`;
TRUNCATE TABLE `workspaces`;
TRUNCATE TABLE `confirmation_codes`;
TRUNCATE TABLE `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- Step 2: Drop all foreign keys
ALTER TABLE `workspaces` DROP FOREIGN KEY `workspaces_owner_id_fkey`;
ALTER TABLE `workspace_users` DROP FOREIGN KEY `workspace_users_workspace_id_fkey`;
ALTER TABLE `workspace_users` DROP FOREIGN KEY `workspace_users_user_id_fkey`;
ALTER TABLE `sessions` DROP FOREIGN KEY `sessions_user_id_fkey`;
ALTER TABLE `categories` DROP FOREIGN KEY `categories_workspace_id_fkey`;
ALTER TABLE `categories` DROP FOREIGN KEY `categories_owner_id_fkey`;
ALTER TABLE `transaction_templates` DROP FOREIGN KEY `transaction_templates_workspace_id_fkey`;
ALTER TABLE `transaction_templates` DROP FOREIGN KEY `transaction_templates_owner_id_fkey`;
ALTER TABLE `transaction_templates` DROP FOREIGN KEY `transaction_templates_category_id_fkey`;
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_workspace_id_fkey`;
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_owner_id_fkey`;
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_category_id_fkey`;
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_template_id_fkey`;

-- Step 3: Convert all Int ID columns to VARCHAR(36) for UUIDs

-- Users table
ALTER TABLE `users` MODIFY COLUMN `id` VARCHAR(36) NOT NULL;
ALTER TABLE `users` DROP PRIMARY KEY;
ALTER TABLE `users` ADD PRIMARY KEY (`id`);

-- Workspaces table - owner_id
ALTER TABLE `workspaces` MODIFY COLUMN `owner_id` VARCHAR(36) NOT NULL;

-- WorkspaceUsers table
ALTER TABLE `workspace_users` MODIFY COLUMN `id` VARCHAR(36) NOT NULL;
ALTER TABLE `workspace_users` MODIFY COLUMN `user_id` VARCHAR(36) NOT NULL;
ALTER TABLE `workspace_users` DROP PRIMARY KEY;
ALTER TABLE `workspace_users` ADD PRIMARY KEY (`id`);

-- Sessions table
ALTER TABLE `sessions` MODIFY COLUMN `id` VARCHAR(36) NOT NULL;
ALTER TABLE `sessions` MODIFY COLUMN `user_id` VARCHAR(36) NOT NULL;
ALTER TABLE `sessions` DROP PRIMARY KEY;
ALTER TABLE `sessions` ADD PRIMARY KEY (`id`);

-- ConfirmationCodes table
ALTER TABLE `confirmation_codes` MODIFY COLUMN `id` VARCHAR(36) NOT NULL;
ALTER TABLE `confirmation_codes` DROP PRIMARY KEY;
ALTER TABLE `confirmation_codes` ADD PRIMARY KEY (`id`);

-- Categories table
ALTER TABLE `categories` MODIFY COLUMN `id` VARCHAR(36) NOT NULL;
ALTER TABLE `categories` MODIFY COLUMN `owner_id` VARCHAR(36) NOT NULL;
ALTER TABLE `categories` DROP PRIMARY KEY;
ALTER TABLE `categories` ADD PRIMARY KEY (`id`);

-- TransactionTemplates table
ALTER TABLE `transaction_templates` MODIFY COLUMN `id` VARCHAR(36) NOT NULL;
ALTER TABLE `transaction_templates` MODIFY COLUMN `owner_id` VARCHAR(36) NOT NULL;
ALTER TABLE `transaction_templates` MODIFY COLUMN `category_id` VARCHAR(36) NULL;
ALTER TABLE `transaction_templates` DROP PRIMARY KEY;
ALTER TABLE `transaction_templates` ADD PRIMARY KEY (`id`);

-- Transactions table
ALTER TABLE `transactions` MODIFY COLUMN `id` VARCHAR(36) NOT NULL;
ALTER TABLE `transactions` MODIFY COLUMN `owner_id` VARCHAR(36) NOT NULL;
ALTER TABLE `transactions` MODIFY COLUMN `category_id` VARCHAR(36) NULL;
ALTER TABLE `transactions` MODIFY COLUMN `template_id` VARCHAR(36) NULL;
ALTER TABLE `transactions` DROP PRIMARY KEY;
ALTER TABLE `transactions` ADD PRIMARY KEY (`id`);

-- Step 4: Recreate all foreign keys
ALTER TABLE `workspaces` ADD CONSTRAINT `workspaces_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `workspace_users` ADD CONSTRAINT `workspace_users_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `workspace_users` ADD CONSTRAINT `workspace_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `categories` ADD CONSTRAINT `categories_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `categories` ADD CONSTRAINT `categories_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `transaction_templates` ADD CONSTRAINT `transaction_templates_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `transaction_templates` ADD CONSTRAINT `transaction_templates_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `transaction_templates` ADD CONSTRAINT `transaction_templates_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `transaction_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

