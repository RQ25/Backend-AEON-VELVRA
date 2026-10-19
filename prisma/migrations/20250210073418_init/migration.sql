/*
  Warnings:

  - The values [SNACK] on the enum `menu_category` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `menu` MODIFY `category` ENUM('FOOD', 'DRINK', 'DESSERT') NOT NULL DEFAULT 'FOOD';
