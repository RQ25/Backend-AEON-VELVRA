/*
  Warnings:

  - You are about to drop the `order_list` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `order_list` DROP FOREIGN KEY `order_list_idMenu_fkey`;

-- DropForeignKey
ALTER TABLE `order_list` DROP FOREIGN KEY `order_list_idOrder_fkey`;

-- DropTable
DROP TABLE `order_list`;

-- CreateTable
CREATE TABLE `orderList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL DEFAULT '',
    `idOrder` INTEGER NULL,
    `idMenu` INTEGER NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `note` VARCHAR(191) NOT NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orderList` ADD CONSTRAINT `orderList_idOrder_fkey` FOREIGN KEY (`idOrder`) REFERENCES `order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderList` ADD CONSTRAINT `orderList_idMenu_fkey` FOREIGN KEY (`idMenu`) REFERENCES `menu`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
