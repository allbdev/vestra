-- AlterTable
ALTER TABLE `transaction_templates` DROP COLUMN `end_date`;

-- AlterTable
ALTER TABLE `transaction_templates` DROP COLUMN `day_of_period`;

-- AlterTable
ALTER TABLE `transaction_templates` MODIFY `frequency` INT NULL;

