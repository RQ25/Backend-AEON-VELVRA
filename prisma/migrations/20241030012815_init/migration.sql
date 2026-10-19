/*
  Warnings:

  - The primary key for the `menu` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `menu` table. All the data in the column will be lost.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `user` table. All the data in the column will be lost.
  - Added the required column `menuId` to the `menu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `order_idUser_fkey`;

-- DropForeignKey
ALTER TABLE `orderlist` DROP FOREIGN KEY `orderList_idMenu_fkey`;

-- AlterTable
ALTER TABLE `menu` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `menuId` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`menuId`);

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `userId` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`userId`);

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `User`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderList` ADD CONSTRAINT `orderList_idMenu_fkey` FOREIGN KEY (`idMenu`) REFERENCES `menu`(`menuId`) ON DELETE SET NULL ON UPDATE CASCADE;
