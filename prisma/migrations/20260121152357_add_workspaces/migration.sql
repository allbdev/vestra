/*
  Warnings:

  - You are about to drop the column `user_id` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `transaction_templates` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `owner_id` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspace_id` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_id` to the `transaction_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspace_id` to the `transaction_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_id` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspace_id` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `categories` DROP FOREIGN KEY `categories_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `transaction_templates` DROP FOREIGN KEY `transaction_templates_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_user_id_fkey`;

-- DropIndex
DROP INDEX `categories_user_id_idx` ON `categories`;

-- DropIndex
DROP INDEX `transaction_templates_user_id_idx` ON `transaction_templates`;

-- DropIndex
DROP INDEX `transactions_user_id_idx` ON `transactions`;

-- AlterTable
ALTER TABLE `categories` DROP COLUMN `user_id`,
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `owner_id` INTEGER NOT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD COLUMN `workspace_id` VARCHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `transaction_templates` DROP COLUMN `user_id`,
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `owner_id` INTEGER NOT NULL,
    ADD COLUMN `workspace_id` VARCHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `transactions` DROP COLUMN `user_id`,
    ADD COLUMN `owner_id` INTEGER NOT NULL,
    ADD COLUMN `workspace_id` VARCHAR(36) NOT NULL;

-- CreateTable
CREATE TABLE `workspaces` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `owner_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `workspaces_owner_id_idx`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workspace_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workspace_id` VARCHAR(36) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `workspace_users_workspace_id_idx`(`workspace_id`),
    INDEX `workspace_users_user_id_idx`(`user_id`),
    UNIQUE INDEX `workspace_users_workspace_id_user_id_key`(`workspace_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `categories_workspace_id_idx` ON `categories`(`workspace_id`);

-- CreateIndex
CREATE INDEX `categories_owner_id_idx` ON `categories`(`owner_id`);

-- CreateIndex
CREATE INDEX `transaction_templates_workspace_id_idx` ON `transaction_templates`(`workspace_id`);

-- CreateIndex
CREATE INDEX `transaction_templates_owner_id_idx` ON `transaction_templates`(`owner_id`);

-- CreateIndex
CREATE INDEX `transactions_workspace_id_idx` ON `transactions`(`workspace_id`);

-- CreateIndex
CREATE INDEX `transactions_owner_id_idx` ON `transactions`(`owner_id`);

-- AddForeignKey
ALTER TABLE `workspaces` ADD CONSTRAINT `workspaces_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workspace_users` ADD CONSTRAINT `workspace_users_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workspace_users` ADD CONSTRAINT `workspace_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_templates` ADD CONSTRAINT `transaction_templates_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_templates` ADD CONSTRAINT `transaction_templates_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
