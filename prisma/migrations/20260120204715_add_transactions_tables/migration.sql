-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `type` VARCHAR(10) NULL,
    `color` VARCHAR(7) NULL,
    `icon` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `categories_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `categories_type_check` CHECK (`type` IN ('revenue', 'expense'))
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_templates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `category_id` INTEGER NULL,
    `description` VARCHAR(255) NOT NULL,
    `base_amount` DECIMAL(15, 2) NOT NULL,
    `frequency` VARCHAR(20) NULL,
    `day_of_period` INTEGER NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `transaction_templates_user_id_idx`(`user_id`),
    INDEX `transaction_templates_category_id_idx`(`category_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `transaction_templates_frequency_check` CHECK (`frequency` IN ('daily', 'weekly', 'monthly', 'yearly'))
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `category_id` INTEGER NULL,
    `template_id` INTEGER NULL,
    `description` VARCHAR(255) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `date` DATE NOT NULL,
    `is_paid` BOOLEAN NOT NULL DEFAULT false,
    `paid_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `transactions_user_id_idx`(`user_id`),
    INDEX `transactions_category_id_idx`(`category_id`),
    INDEX `transactions_template_id_idx`(`template_id`),
    INDEX `transactions_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_templates` ADD CONSTRAINT `transaction_templates_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_templates` ADD CONSTRAINT `transaction_templates_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `transaction_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
