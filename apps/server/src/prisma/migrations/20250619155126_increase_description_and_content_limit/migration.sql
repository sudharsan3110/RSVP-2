-- AlterTable
ALTER TABLE `events` MODIFY `description` VARCHAR(1000) NULL;

-- AlterTable
ALTER TABLE `updates` MODIFY `content` VARCHAR(1000) NOT NULL;
