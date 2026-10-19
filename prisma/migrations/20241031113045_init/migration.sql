/*
  Warnings:

  - You are about to drop the column `idMenu` on the `orderlist` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `orderlist` DROP FOREIGN KEY `orderList_idMenu_fkey`;

-- AlterTable
ALTER TABLE `order` MODIFY `menuId` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `orderlist` DROP COLUMN `idMenu`,
    ADD COLUMN `menuId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `orderList` ADD CONSTRAINT `orderList_menuId_fkey` FOREIGN KEY (`menuId`) REFERENCES `menu`(`menuId`) ON DELETE SET NULL ON UPDATE CASCADE;
