/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "members" TEXT[],
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Team_user_id_key" ON "Team"("user_id");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
