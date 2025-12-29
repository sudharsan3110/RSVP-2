-- AlterTable
ALTER TABLE `events` MODIFY `description` VARCHAR(1000) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `role` ENUM('1', '2') NOT NULL DEFAULT '1';
