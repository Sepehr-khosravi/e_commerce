/*
  Warnings:

  - You are about to alter the column `offer` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(5,2)`.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "offer" SET DATA TYPE DECIMAL(5,2);
