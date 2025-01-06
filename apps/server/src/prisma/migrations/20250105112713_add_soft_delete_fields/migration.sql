/*
  Warnings:

  - Added the required column `updated_at` to the `attendees` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `attendees` ADD COLUMN `deleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;
