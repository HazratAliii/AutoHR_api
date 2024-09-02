/*
  Warnings:

  - You are about to drop the column `access_token` on the `Auth` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[refresh_token]` on the table `Auth` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Auth" DROP COLUMN "access_token";

-- CreateIndex
CREATE UNIQUE INDEX "Auth_refresh_token_key" ON "Auth"("refresh_token");
