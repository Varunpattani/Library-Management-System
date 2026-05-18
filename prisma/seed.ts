const { PrismaClient, ItemType, ItemStatus } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding process started...');

  // 1. Clear existing data in the correct order to avoid foreign key constraints
  console.log('Clearing existing data...');
  await prisma.transaction.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.faculty.deleteMany({});
  await prisma.patron.deleteMany({});
  await prisma.item.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.librarian.deleteMany({});
  await prisma.librarySettings.deleteMany({});
  console.log('Existing data cleared.');

  // 2. Reset AUTO_INCREMENT for all tables
  console.log('Resetting AUTO_INCREMENT counters...');
  await prisma.$executeRaw`ALTER TABLE Transaction AUTO_INCREMENT = 1`;
  await prisma.$executeRaw`ALTER TABLE Reservation AUTO_INCREMENT = 1`;
  await prisma.$executeRaw`ALTER TABLE Student AUTO_INCREMENT = 1`;
  await prisma.$executeRaw`ALTER TABLE Faculty AUTO_INCREMENT = 1`;
  await prisma.$executeRaw`ALTER TABLE Patron AUTO_INCREMENT = 1`;
  await prisma.$executeRaw`ALTER TABLE Item AUTO_INCREMENT = 1`;
  console.log('AUTO_INCREMENT counters reset.');

  // 3. Seed Patrons (Students and Faculty)
  console.log('Seeding patrons...');
  const patrons = [
    // Students
    {
      patronEmail: 'john.doe@university.edu',
      patronPassword: 'password123',
      patronFirstName: 'John',
      patronLastName: 'Doe',
      isStudent: true,
      studentProfile: {
        create: {
          studentDepartment: 'Computer Science',
          studentSemester: 3,
          studentRollNo: 101,
          studentEnrollmentNumber: 20230101,
        },
      },
    },
    {
      patronEmail: 'emma.smith@university.edu',
      patronPassword: 'password123',
      patronFirstName: 'Emma',
      patronLastName: 'Smith',
      isStudent: true,
      studentProfile: {
        create: {
          studentDepartment: 'Electrical Engineering',
          studentSemester: 5,
          studentRollNo: 102,
          studentEnrollmentNumber: 20220102,
        },
      },
    },
    // ... Add 18 more students
    {
        patronEmail: 'liam.johnson@university.edu',
        patronPassword: 'password123',
        patronFirstName: 'Liam',
        patronLastName: 'Johnson',
        isStudent: true,
        studentProfile: { create: { studentDepartment: 'Mechanical Engineering', studentSemester: 1, studentRollNo: 103, studentEnrollmentNumber: 20240103 } },
    },
    {
        patronEmail: 'olivia.williams@university.edu',
        patronPassword: 'password123',
        patronFirstName: 'Olivia',
        patronLastName: 'Williams',
        isStudent: true,
        studentProfile: { create: { studentDepartment: 'Civil Engineering', studentSemester: 7, studentRollNo: 104, studentEnrollmentNumber: 20210104 } },
    },
    {
        patronEmail: 'noah.brown@university.edu',
        patronPassword: 'password123',
        patronFirstName: 'Noah',
        patronLastName: 'Brown',
        isStudent: true,
        studentProfile: { create: { studentDepartment: 'Physics', studentSemester: 3, studentRollNo: 105, studentEnrollmentNumber: 20230105 } },
    },
    {
        patronEmail: 'ava.jones@university.edu',
        patronPassword: 'password123',
        patronFirstName: 'Ava',
        patronLastName: 'Jones',
        isStudent: true,
        studentProfile: { create: { studentDepartment: 'Chemistry', studentSemester: 5, studentRollNo: 106, studentEnrollmentNumber: 20220106 } },
    },
    {
        patronEmail: 'william.garcia@university.edu',
        patronPassword: 'password123',
        patronFirstName: 'William',
        patronLastName: 'Garcia',
        isStudent: true,
        studentProfile: { create: { studentDepartment: 'Mathematics', studentSemester: 2, studentRollNo: 107, studentEnrollmentNumber: 20230207 } },
    },
    {
        patronEmail: 'sophia.martinez@university.edu',
        patronPassword: 'password123',
        patronFirstName: 'Sophia',
        patronLastName: 'Martinez',
        isStudent: true,
        studentProfile: { create: { studentDepartment: 'Biology', studentSemester: 6, studentRollNo: 108, studentEnrollmentNumber: 20210208 } },
    },
    {
        patronEmail: 'james.davis@university.edu',
        patronPassword: 'password123',
        patronFirstName: 'James',
        patronLastName: 'Davis',
        isStudent: true,
        studentProfile: { create: { studentDepartment: 'History', studentSemester: 4, studentRollNo: 109, studentEnrollmentNumber: 20220209 } },
    },
    {
        patronEmail: 'isabella.rodriguez@university.edu',
        patronPassword: 'password123',
        patronFirstName: 'Isabella',
        patronLastName: 'Rodriguez',
        isStudent: true,
        studentProfile: { create: { studentDepartment: 'English Literature', studentSemester: 8, studentRollNo: 110, studentEnrollmentNumber: 20200210 } },
    },
    {
        patronEmail: 'benjamin.wilson@university.edu',
        patronPassword: 'password123',
        patronFirstName: 'Benjamin',
        patronLastName: 'Wilson',
        isStudent: true,
        studentProfile: { create: { studentDepartment: 'Political Science', studentSemester: 1, studentRollNo: 111, studentEnrollmentNumber: 20240111 } },
    },
    {
        patronEmail: 'mia.anderson@university.edu',
        patronPassword: 'password123',
        patronFirstName: 'Mia',
        patronLastName: 'Anderson',
        isStudent: true,
        studentProfile: { create: { studentDepartment: 'Economics', studentSemester: 3, studentRollNo: 112, studentEnrollmentNumber: 20230112 } },
    },
    {
        patronEmail: 'jacob.thomas@university.edu',
        patronPassword: 'password123',
        patronFirstName: 'Jacob',
        patronLastName: 'Thomas',
        isStudent: true,
        studentProfile: { create: { studentDepartment: 'Sociology', studentSemester: 5, studentRollNo: 113, studentEnrollmentNumber: 20220113 } },
    },
    {
        patronEmail: 'evelyn.taylor@university.edu',
        patronPassword: 'password123',
        patronFirstName: 'Evelyn',
        patronLastName: 'Taylor',
        isStudent: true,
        studentProfile: { create: { studentDepartment: 'Psychology', studentSemester: 7, studentRollNo: 114, studentEnrollmentNumber: 20210114 } },
    },
    {
        patronEmail: 'michael.moore@university.edu',
        patronPassword: 'password123',
        patronFirstName: 'Michael',
        patronLastName: 'Moore',
        isStudent: true,
        studentProfile: { create: { studentDepartment: 'Computer Science', studentSemester: 2, studentRollNo: 115, studentEnrollmentNumber: 20230215 } },
    },

    // Faculty
    {
      patronEmail: 'prof.davies@university.edu',
      patronPassword: 'password123',
      patronFirstName: 'Eleanor',
      patronLastName: 'Davies',
      isFaculty: true,
      facultyProfile: {
        create: {
          facultyDepartment: 'Physics',
        },
      },
    },
    {
      patronEmail: 'prof.clark@university.edu',
      patronPassword: 'password123',
      patronFirstName: 'Henry',
      patronLastName: 'Clark',
      isFaculty: true,
      facultyProfile: {
        create: {
          facultyDepartment: 'History',
        },
      },
    },
    {
        patronEmail: 'prof.lewis@university.edu',
        patronPassword: 'password123',
        patronFirstName: 'Charlotte',
        patronLastName: 'Lewis',
        isFaculty: true,
        facultyProfile: { create: { facultyDepartment: 'Computer Science' } },
    },
    {
        patronEmail: 'prof.walker@university.edu',
        patronPassword: 'password123',
        patronFirstName: 'Daniel',
        patronLastName: 'Walker',
        isFaculty: true,
        facultyProfile: { create: { facultyDepartment: 'Mathematics' } },
    },
    {
        patronEmail: 'prof.hall@university.edu',
        patronPassword: 'password123',
        patronFirstName: 'Grace',
        patronLastName: 'Hall',
        isFaculty: true,
        facultyProfile: { create: { facultyDepartment: 'Biology' } },
    },
    {
        patronEmail: 'prof.allen@university.edu',
        patronPassword: 'password123',
        patronFirstName: 'Joseph',
        patronLastName: 'Allen',
        isFaculty: true,
        facultyProfile: { create: { facultyDepartment: 'Chemistry' } },
    },
  ];

  for (const patron of patrons) {
    await prisma.patron.create({
      data: patron,
    });
  }
  console.log('Patrons seeded.');

  // 4. Seed Admin users
  console.log('Seeding admin users...');
  const admins = [
    {
      adminEmail: 'admin@library.edu',
      adminPassword: 'admin123',
      adminFirstName: 'System',
      adminLastName: 'Administrator',
    },
    {
      adminEmail: 'head.admin@library.edu',
      adminPassword: 'admin123',
      adminFirstName: 'Sarah',
      adminLastName: 'Mitchell',
    },
  ];

  for (const admin of admins) {
    await prisma.admin.create({
      data: admin,
    });
  }
  console.log('Admin users seeded.');

  // 5. Seed Librarian users
  console.log('Seeding librarian users...');
  const librarians = [
    {
      librarianEmail: 'librarian@library.edu',
      librarianPassword: 'librarian123',
      librarianFirstName: 'John',
      librarianLastName: 'Smith',
    },
    {
      librarianEmail: 'head.librarian@library.edu',
      librarianPassword: 'librarian123',
      librarianFirstName: 'Emily',
      librarianLastName: 'Johnson',
    },
  ];

  for (const librarian of librarians) {
    await prisma.librarian.create({
      data: librarian,
    });
  }
  console.log('Librarian users seeded.');

  // 6. Seed Library Settings
  console.log('Seeding library settings...');
  await prisma.librarySettings.create({
    data: {
      librarySettingsId: 1,
      borrowingLimit: 5,
      loanPeriodDays: 14,
      finePerDay: 1.0,
      // updatedByAdminId: 1, // Will be set later when admins update settings
    },
  });
  console.log('Library settings seeded.');

  // 7. Seed Items
  console.log('Seeding items...');
  const items = [
    // Books
    {
      title: 'The Lord of the Rings',
      author: 'J.R.R. Tolkien',
      isbn: '978-0-618-64015-7',
      subject: 'Fantasy',
      keywords: 'fantasy, epic, adventure',
      description: 'A classic epic fantasy novel.',
      itemType: ItemType.BOOK,
      status: ItemStatus.AVAILABLE,
      price: 25.99,
      imageUrl: 'https://images.unsplash.com/photo-1593642532400-2682810df593?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      publisher: 'George Allen & Unwin',
      publicationYear: 1954,
      totalCopies: 5,
      availableCopies: 5,
    },
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      isbn: '978-0-141-43951-8',
      subject: 'Romance',
      keywords: 'romance, classic, england',
      description: 'A romantic novel of manners.',
      itemType: ItemType.BOOK,
      status: ItemStatus.BORROWED,
      price: 15.50,
      imageUrl: 'https://images.unsplash.com/photo-1588282322673-c31965a75c3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      publisher: 'T. Egerton, Whitehall',
      publicationYear: 1813,
      totalCopies: 3,
      availableCopies: 2,
    },
    // Journals
    {
      title: 'Nature',
      author: 'Nature Publishing Group',
      isbn: '0028-0836',
      subject: 'Science',
      keywords: 'science, research, nature',
      description: 'A weekly international journal publishing the finest peer-reviewed research.',
      itemType: ItemType.JOURNAL,
      status: ItemStatus.RESERVED,
      price: 5.99,
      imageUrl: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      publisher: 'Nature Publishing Group',
      publicationYear: 1869,
      totalCopies: 10,
      availableCopies: 9,
    },
    // Multimedia
    {
      title: 'Planet Earth II',
      author: 'David Attenborough',
      isbn: 'B01M_8L4S7W',
      subject: 'Documentary',
      keywords: 'nature, documentary, animals',
      description: 'A documentary series on the natural world.',
      itemType: ItemType.MULTIMEDIA,
      status: ItemStatus.DAMAGED,
      price: 35.00,
      imageUrl: 'https://images.unsplash.com/photo-1502674252220-1347484a8c9b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      publisher: 'BBC',
      publicationYear: 2016,
      totalCopies: 2,
      availableCopies: 1,
    },
    {
        title: 'Abbey Road',
        author: 'The Beatles',
        isbn: 'B0000_025KV',
        subject: 'Music',
        keywords: 'music, rock, classic',
        description: 'The eleventh studio album by the English rock band the Beatles.',
        itemType: ItemType.CD,
        status: ItemStatus.LOST,
        price: 12.99,
      imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        publisher: 'Apple Records',
        publicationYear: 1969,
        totalCopies: 1,
        availableCopies: 0,
      },
      // 20+ More Items
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '978-0-446-31078-9',
      subject: 'Fiction',
      keywords: 'classic, southern gothic, racism',
      description: 'A novel about the seriousness of racism and the loss of innocence.',
      itemType: ItemType.BOOK,
      status: ItemStatus.AVAILABLE,
      price: 18.00,
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      publisher: 'J. B. Lippincott & Co.',
      publicationYear: 1960,
      totalCopies: 7,
      availableCopies: 7,
    },
    {
      title: '1984',
      author: 'George Orwell',
      isbn: '978-0-452-28423-4',
      subject: 'Dystopian',
      keywords: 'dystopian, totalitarianism, surveillance',
      description: 'A dystopian novel set in Airstrip One, a province of the superstate Oceania in a world of perpetual war.',
      itemType: ItemType.BOOK,
      status: ItemStatus.BORROWED,
      price: 15.99,
      imageUrl: 'https://images.unsplash.com/photo-1588224883454-9b5a45b729cf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      publisher: 'Secker & Warburg',
      publicationYear: 1949,
      totalCopies: 4,
      availableCopies: 3,
    },
    {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '978-0-7432-7356-5',
        subject: 'Fiction',
        keywords: 'jazz age, american dream, tragedy',
        description: 'A novel about the American dream and its corruption.',
        itemType: ItemType.BOOK,
        status: ItemStatus.RESERVED,
        price: 14.00,
      imageUrl: 'https://images.unsplash.com/photo-1549032304-fe7835b7b9ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        publisher: 'Charles Scribner\'s Sons',
        publicationYear: 1925,
        totalCopies: 5,
        availableCopies: 4,
      },
      {
        title: 'Dune',
        author: 'Frank Herbert',
        isbn: '978-0-441-01359-3',
        subject: 'Science Fiction',
        keywords: 'sci-fi, adventure, politics',
        description: 'A science fiction novel set in the distant future amidst a feudal interstellar society.',
        itemType: ItemType.EBOOK,
        status: ItemStatus.AVAILABLE,
        price: 19.99,
      imageUrl: 'https://images.unsplash.com/photo-1608178388427-440b54be4a21?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        publisher: 'Chilton Books',
        publicationYear: 1965,
        totalCopies: 10,
        availableCopies: 10,
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        isbn: '978-0-06-231609-7',
        subject: 'Non-fiction',
        keywords: 'history, anthropology, science',
        description: 'A book that surveys the history of humankind, from the Stone Age to the 21st century.',
        itemType: ItemType.AUDIOBOOK,
        status: ItemStatus.AVAILABLE,
        price: 24.99,
      imageUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        publisher: 'Dvir Publishing House',
        publicationYear: 2011,
        totalCopies: 8,
        availableCopies: 8,
      },
      {
        title: 'National Geographic',
        author: 'National Geographic Society',
        isbn: '0027-9358',
        subject: 'Geography',
        keywords: 'science, history, culture, photography',
        description: 'A monthly magazine of geography, cartography, archaeology, natural science, and world culture.',
        itemType: ItemType.MAGAZINE,
        status: ItemStatus.AVAILABLE,
        price: 6.99,
      imageUrl: 'https://images.unsplash.com/photo-1574631835952-4a00a196245c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        publisher: 'National Geographic Society',
        publicationYear: 1888,
        totalCopies: 20,
        availableCopies: 20,
      },
      {
        title: 'The Godfather',
        author: 'Francis Ford Coppola',
        isbn: 'B0000_3CXA4',
        subject: 'Crime',
        keywords: 'mafia, crime, drama',
        description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
        itemType: ItemType.DVD,
        status: ItemStatus.DAMAGED,
        price: 19.99,
      imageUrl: 'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        publisher: 'Paramount Pictures',
        publicationYear: 1972,
        totalCopies: 3,
        availableCopies: 2,
      },
      {
        title: 'The Dark Side of the Moon',
        author: 'Pink Floyd',
        isbn: 'B01LTHN0DG',
        subject: 'Music',
        keywords: 'progressive rock, concept album, classic rock',
        description: 'The eighth studio album by the English rock band Pink Floyd.',
        itemType: ItemType.CD,
        status: ItemStatus.MAINTENANCE,
        price: 14.99,
      imageUrl: 'https://images.unsplash.com/photo-1559523161-0d4d232c5e5c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        publisher: 'Harvest Records',
        publicationYear: 1973,
        totalCopies: 2,
        availableCopies: 1,
      },
      {
        title: 'The Martian',
        author: 'Andy Weir',
        isbn: '978-0-8041-3902-1',
        subject: 'Science Fiction',
        keywords: 'sci-fi, survival, space',
        description: 'An astronaut, presumed dead, is left behind on Mars and must find a way to survive.',
        itemType: ItemType.EBOOK,
        status: ItemStatus.RESERVED,
        price: 12.99,
      imageUrl: 'https://images.unsplash.com/photo-1534723328319-6a3f4a3de3aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        publisher: 'Crown Publishing Group',
        publicationYear: 2014,
        totalCopies: 15,
        availableCopies: 14,
      },
      {
        title: 'Becoming',
        author: 'Michelle Obama',
        isbn: '978-1-5247-6313-8',
        subject: 'Autobiography',
        keywords: 'memoir, first lady, non-fiction',
        description: 'The memoir of former United States First Lady Michelle Obama.',
        itemType: ItemType.AUDIOBOOK,
        status: ItemStatus.BORROWED,
        price: 29.95,
      imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        publisher: 'Crown Publishing Group',
        publicationYear: 2018,
        totalCopies: 6,
        availableCopies: 5,
      },
      {
        title: 'The Lancet',
        author: 'Elsevier',
        isbn: '0140-6736',
        subject: 'Medicine',
        keywords: 'medical journal, science, health',
        description: 'A weekly peer-reviewed general medical journal.',
        itemType: ItemType.JOURNAL,
        status: ItemStatus.AVAILABLE,
        price: 8.99,
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        publisher: 'Elsevier',
        publicationYear: 1823,
        totalCopies: 12,
        availableCopies: 12,
      },
      {
        title: 'Time Magazine',
        author: 'Time USA, LLC',
        isbn: '0040-781X',
        subject: 'News',
        keywords: 'current events, politics, news magazine',
        description: 'An American weekly news magazine and news website.',
        itemType: ItemType.MAGAZINE,
        status: ItemStatus.BORROWED,
        price: 4.99,
      imageUrl: 'https://images.unsplash.com/photo-1521295121783-8a321d551282?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        publisher: 'Time USA, LLC',
        publicationYear: 1923,
        totalCopies: 25,
        availableCopies: 24,
      },
      {
        title: 'Pulp Fiction',
        author: 'Quentin Tarantino',
        isbn: 'B07B_4KE48J',
        subject: 'Crime',
        keywords: 'neo-noir, crime, dark comedy',
        description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
        itemType: ItemType.DVD,
        status: ItemStatus.AVAILABLE,
        price: 14.99,
      imageUrl: 'https://images.unsplash.com/photo-1594950393433-7e8e589a1f28?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        publisher: 'Miramax',
        publicationYear: 1994,
        totalCopies: 4,
        availableCopies: 4,
      },
      {
        title: 'Thriller',
        author: 'Michael Jackson',
        isbn: 'B0000_02O9P',
        subject: 'Music',
        keywords: 'pop, r&b, funk, king of pop',
        description: 'The sixth studio album by American singer Michael Jackson.',
        itemType: ItemType.CD,
        status: ItemStatus.LOST,
        price: 11.99,
      imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
        publisher: 'Epic Records',
        publicationYear: 1982,
        totalCopies: 2,
        availableCopies: 1,
      },
    {
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      isbn: '978-0-06-231500-7',
      subject: 'Fiction',
      keywords: 'adventure, fantasy, spiritual',
      description: 'A novel that tells the story of Santiago, an Andalusian shepherd boy who dreams of a treasure in the pyramids of Egypt.',
      itemType: ItemType.BOOK,
      status: ItemStatus.MAINTENANCE,
      price: 16.95,
      imageUrl: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      publisher: 'HarperCollins',
      publicationYear: 1988,
      totalCopies: 5,
      availableCopies: 4,
    },
    {
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      isbn: '978-0-618-26030-0',
      subject: 'Fantasy',
      keywords: 'fantasy, adventure, classic',
      description: 'A children\'s fantasy novel, the predecessor to The Lord of the Rings.',
      itemType: ItemType.EBOOK,
      status: ItemStatus.AVAILABLE,
      price: 14.99,
      imageUrl: 'https://images.unsplash.com/photo-1505036647614-ee186c36294a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      publisher: 'George Allen & Unwin',
      publicationYear: 1937,
      totalCopies: 12,
      availableCopies: 12,
    },
    {
      title: 'The Catcher in the Rye',
      author: 'J.D. Salinger',
      isbn: '978-0-316-76948-0',
      subject: 'Fiction',
      keywords: 'coming-of-age, alienation, classic',
      description: 'A novel about a few days in the life of a troubled teenager, Holden Caulfield.',
      itemType: ItemType.BOOK,
      status: ItemStatus.AVAILABLE,
      price: 15.00,
      imageUrl: 'https://images.unsplash.com/photo-1618666012174-83b448c2c3e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      publisher: 'Little, Brown and Company',
      publicationYear: 1951,
      totalCopies: 3,
      availableCopies: 3,
    },
    {
      title: 'Journal of the American Medical Association (JAMA)',
      author: 'American Medical Association',
      isbn: '0098-7484',
      subject: 'Medicine',
      keywords: 'medical journal, research, clinical practice',
      description: 'An international peer-reviewed general medical journal.',
      itemType: ItemType.JOURNAL,
      status: ItemStatus.RESERVED,
      price: 9.50,
      imageUrl: 'https://images.unsplash.com/photo-1584820847952-3a52e12a8b98?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      publisher: 'American Medical Association',
      publicationYear: 1883,
      totalCopies: 15,
      availableCopies: 14,
    },
    {
      title: 'Harry Potter and the Sorcerer\'s Stone',
      author: 'J.K. Rowling',
      isbn: '978-0-590-35342-7',
      subject: 'Fantasy',
      keywords: 'magic, young adult, fantasy',
      description: 'The first novel in the Harry Potter series and Rowling\'s debut novel.',
      itemType: ItemType.BOOK,
      status: ItemStatus.DAMAGED,
      price: 24.99,
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      publisher: 'Scholastic Corporation',
      publicationYear: 1997,
      totalCopies: 10,
      availableCopies: 9,
    },
    {
      title: 'Rumours',
      author: 'Fleetwood Mac',
      isbn: 'B0000_02J0B',
      subject: 'Music',
      keywords: 'rock, soft rock, classic rock',
      description: 'The eleventh studio album by the British-American rock band Fleetwood Mac.',
      itemType: ItemType.CD,
      status: ItemStatus.AVAILABLE,
      price: 13.99,
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      publisher: 'Warner Bros. Records',
      publicationYear: 1977,
      totalCopies: 3,
      availableCopies: 3,
    }
  ];

  for (const item of items) {
    await prisma.item.create({
      data: item,
    });
  }
  console.log('Items seeded.')

  // 8. Seed some sample transactions
  console.log('Seeding sample transactions...')
  
  // Calculate due dates using system settings
  const borrowedDate1 = new Date()
  borrowedDate1.setDate(borrowedDate1.getDate() - 10) // 10 days ago
  const dueDate1 = new Date(borrowedDate1)
  dueDate1.setDate(dueDate1.getDate() + 14) // 14 days loan period
  
  const borrowedDate2 = new Date()
  borrowedDate2.setDate(borrowedDate2.getDate() - 20) // 20 days ago  
  const dueDate2 = new Date(borrowedDate2)
  dueDate2.setDate(dueDate2.getDate() + 14) // This will be overdue
  
  const transactions = [
    {
      itemId: 1, // The Lord of the Rings
      patronId: 1, // John Doe
      borrowedAt: borrowedDate1,
      dueDate: dueDate1,
      isReturned: false
    },
    {
      itemId: 2, // Pride and Prejudice
      patronId: 2, // Emma Smith
      borrowedAt: borrowedDate2,
      dueDate: dueDate2,
      isReturned: false
    },
    {
      itemId: 7, // 1984
      patronId: 3, // Liam Johnson
      borrowedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
      dueDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), // 11 days overdue
      returnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Returned 5 days ago
      isReturned: true,
      finePaid: 11.0 // 11 days * $1.00
    }
  ]
  
  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: transaction
    })
  }
  
  // Update item availability based on transactions
  await prisma.item.update({
    where: { itemId: 1 },
    data: { availableCopies: 4, status: 'BORROWED' }
  })
  
  await prisma.item.update({
    where: { itemId: 2 },
    data: { availableCopies: 1, status: 'BORROWED' }
  })
  
  console.log('Sample transactions seeded.')
  
  // 9. Seed some reservations
  console.log('Seeding sample reservations...')
  
  const reservations = [
    {
      itemId: 2, // Pride and Prejudice (currently borrowed)
      patronId: 4, // Olivia Williams
      reservedAt: new Date()
    },
    {
      itemId: 13, // Abbey Road (lost)
      patronId: 5, // Noah Brown
      reservedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    }
  ]
  
  for (const reservation of reservations) {
    await prisma.reservation.create({
      data: reservation
    })
  }
  
  console.log('Sample reservations seeded.')

  console.log('Seeding process finished.')
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

