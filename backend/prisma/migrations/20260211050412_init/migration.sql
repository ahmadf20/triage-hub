-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'PROCESSED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('BILLING', 'TECHNICAL', 'FEATURE_REQUEST');

-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "customerEmail" TEXT,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "category" "Category",
    "sentiment" INTEGER,
    "urgency" "Urgency",
    "aiDraft" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);
