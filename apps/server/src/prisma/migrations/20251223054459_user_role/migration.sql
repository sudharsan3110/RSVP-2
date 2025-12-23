-- AlterTable
ALTER TABLE `users` ADD COLUMN `role` ENUM('1', '2', '3', '4') NOT NULL DEFAULT '1';
