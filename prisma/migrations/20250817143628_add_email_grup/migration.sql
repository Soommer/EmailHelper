-- CreateTable
CREATE TABLE "public"."EmailGrup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emails" TEXT[],
    "template" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sendTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailGrup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."EmailGrup" ADD CONSTRAINT "EmailGrup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
