-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'CLERK', 'DOCTOR') NOT NULL DEFAULT 'CLERK',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Questionnaire` (
    `id` VARCHAR(191) NOT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'NEW',
    `priority` INTEGER NULL DEFAULT 0,
    `fullName` VARCHAR(191) NOT NULL,
    `idNumber` VARCHAR(191) NOT NULL,
    `age` INTEGER NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `hmo` VARCHAR(191) NOT NULL,
    `language` VARCHAR(191) NOT NULL,
    `maritalStatus` VARCHAR(191) NOT NULL,
    `hasChildren` BOOLEAN NOT NULL,
    `childrenAges` VARCHAR(191) NULL,
    `employmentStatus` VARCHAR(191) NOT NULL,
    `receivesDisability` BOOLEAN NOT NULL,
    `militaryService` VARCHAR(191) NOT NULL,
    `scoreSafety` INTEGER NOT NULL,
    `scoreFunctioning` INTEGER NOT NULL,
    `scorePhysicalDrug` INTEGER NOT NULL,
    `scoreEnvironment` INTEGER NOT NULL,
    `scoreStress` INTEGER NOT NULL,
    `scoreReadiness` INTEGER NOT NULL,
    `isFirstVisit` BOOLEAN NOT NULL,
    `pastTreatment` VARCHAR(191) NULL,
    `rehabBasket` BOOLEAN NOT NULL,
    `hasCoordinator` BOOLEAN NOT NULL,
    `referringSource` VARCHAR(191) NOT NULL,
    `reasonForReferral` VARCHAR(191) NOT NULL,
    `substanceUse` VARCHAR(191) NULL,
    `expectations` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Decision` (
    `id` VARCHAR(191) NOT NULL,
    `questionnaireId` VARCHAR(191) NOT NULL,
    `doctorId` VARCHAR(191) NOT NULL,
    `decisionType` VARCHAR(191) NOT NULL,
    `argumentation` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConfigItem` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,

    UNIQUE INDEX `ConfigItem_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Decision` ADD CONSTRAINT `Decision_questionnaireId_fkey` FOREIGN KEY (`questionnaireId`) REFERENCES `Questionnaire`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Decision` ADD CONSTRAINT `Decision_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
