-- CreateTable
CREATE TABLE `BorrowRequest` (
    `requestId` INTEGER NOT NULL AUTO_INCREMENT,
    `requestType` ENUM('BORROW', 'RESERVE') NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `itemId` INTEGER NOT NULL,
    `patronId` INTEGER NOT NULL,
    `librarianId` INTEGER NULL,

    PRIMARY KEY (`requestId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BorrowRequest` ADD CONSTRAINT `BorrowRequest_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`itemId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BorrowRequest` ADD CONSTRAINT `BorrowRequest_patronId_fkey` FOREIGN KEY (`patronId`) REFERENCES `Patron`(`patronId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BorrowRequest` ADD CONSTRAINT `BorrowRequest_librarianId_fkey` FOREIGN KEY (`librarianId`) REFERENCES `Librarian`(`librarianId`) ON DELETE SET NULL ON UPDATE CASCADE;
