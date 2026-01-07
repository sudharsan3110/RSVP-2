-- AlterTable
ALTER TABLE `events` ADD COLUMN `venue_city_id` VARCHAR(36) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `city_id` VARCHAR(36) NULL;

-- CreateTable
CREATE TABLE `cities` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `state_id` VARCHAR(36) NOT NULL,
    `country_id` VARCHAR(36) NOT NULL,

    INDEX `cities_state_id_idx`(`state_id`),
    INDEX `cities_country_id_idx`(`country_id`),
    UNIQUE INDEX `cities_name_state_id_key`(`name`, `state_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_venue_city_id_fkey` FOREIGN KEY (`venue_city_id`) REFERENCES `cities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cities` ADD CONSTRAINT `cities_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
