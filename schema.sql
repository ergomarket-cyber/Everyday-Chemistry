-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "song" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "lyrics" TEXT NOT NULL,
    "audioUrl" TEXT,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "pin" TEXT NOT NULL,
    "isCaptain" BOOLEAN NOT NULL DEFAULT false,
    "teamId" TEXT NOT NULL,
    "hasVoted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "scienceScore" INTEGER NOT NULL,
    "bangerScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherVote" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "contentScore" INTEGER NOT NULL,
    "accuracyScore" INTEGER NOT NULL,

    CONSTRAINT "TeacherVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vote_studentId_teamId_key" ON "Vote"("studentId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherVote_teamId_key" ON "TeacherVote"("teamId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherVote" ADD CONSTRAINT "TeacherVote_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

