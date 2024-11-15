/*
  Warnings:

  - You are about to alter the column `venue_type` on the `events` table. The data in that column could be lost. The data in that column will be cast from `VarChar(256)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `events` MODIFY `venue_type` ENUM('physical', 'virtual') NOT NULL,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
