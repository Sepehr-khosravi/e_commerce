/*
  Warnings:

  - Added the required column `updatedAt` to the `Banner` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Banner_url_key";

-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
