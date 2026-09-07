/*
  Warnings:

  - You are about to alter the column `productPrice` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `totalPrice` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productOffer" DECIMAL(5,2),
ALTER COLUMN "productPrice" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "totalPrice" SET DATA TYPE DECIMAL(12,2);
