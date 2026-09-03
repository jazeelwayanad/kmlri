import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ALL_PERMISSIONS = [
  'ADMIN_ACCESS',
  'CIRCULATION_VIEW',
  'CIRCULATION_ISSUE',
  'CIRCULATION_RETURN',
  'CIRCULATION_FINES',
  'CATALOG_VIEW',
  'CATALOG_CREATE',
  'CATALOG_EDIT',
  'CATALOG_DELETE',
  'CATALOG_PRINT_BARCODES',
  'USERS_VIEW',
  'USERS_EDIT',
  'ROLES_MANAGE',
  'REPORTS_VIEW',
  'REPORTS_EXPORT',
];

async function main() {
  console.log('🌱 Starting KMLRI database seeding with dynamic roles...');

  // 1. Clean existing records
  await prisma.auditLog.deleteMany();
  await prisma.fine.deleteMany();
  await prisma.circulationLoan.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.acquisitionRequest.deleteMany();
  await prisma.digitalFolio.deleteMany();
  await prisma.itemCopy.deleteMany();
  await prisma.bibliographicRecord.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();

  // 2. Create the single default role. Super Administrator is the only
  // system-seeded role — additional roles can be created from the Roles &
  // Permissions admin screen as needed.
  const superAdminRole = await prisma.role.create({
    data: {
      name: 'Super Administrator',
      slug: 'super-admin',
      description: 'Complete unrestricted administrative access across the institute.',
      isSystem: true,
      permissions: JSON.stringify(ALL_PERMISSIONS),
    },
  });

  // 3. Create Users
  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('Admin@123456', salt);

  const admin = await prisma.user.create({
    data: {
      membershipNumber: 'KMLRI-ADMIN-01',
      email: 'admin@kmlri.in',
      fullName: 'Chief Librarian & Curator',
      passwordHash: adminPass,
      role: 'SUPER_ADMIN',
      roleId: superAdminRole.id,
      phone: '+91 97452 34786',
      status: 'ACTIVE',
      permissions: JSON.stringify(ALL_PERMISSIONS),
      maxBorrowLimit: 20,
    },
  });

  console.log('✅ Created default Super Administrator role and admin user');

  // 4. Create Bibliographic Records
  const rec1 = await prisma.bibliographicRecord.create({
    data: {
      titleLatin: 'Bayān al-Fawāʾid',
      titleArabic: 'بيان الفوائد',
      authors: JSON.stringify(['Unnamed scribe, Malabar coast']),
      shelfmark: 'MS 0142',
      callNumber: 'MS-ARA-0142',
      format: 'MANUSCRIPT',
      language: 'Arabic, with Arabi-Malayalam glosses',
      extent: '84 folios, 21 × 15 cm',
      material: 'Laid paper, brown ink, red rubrication',
      binding: 'Limp leather over paper boards',
      provenance: 'Family deposit, Parappur, 2019',
      summary: 'A Malabar coast manuscript containing jurisprudential glosses and marginal notes.',
      subjects: JSON.stringify(['Islamic Jurisprudence', 'Manuscript Culture', 'Malabar History']),
      accessLevel: 'DIGITISED_FULL',
      digitalFolios: {
        create: [
          { folioNumber: 1, label: 'Title page with opening incipit (1r)', imageUrl: '/assets/wordmark-arabic.svg' },
          { folioNumber: 2, label: 'First folio with glosses (1v)', imageUrl: '/assets/wordmark-latin.svg' },
          { folioNumber: 3, label: 'Section on transactional law (2r)', imageUrl: '/assets/wordmark-arabic.svg' },
          { folioNumber: 4, label: 'Marginalia by nineteenth-century reader (2v)', imageUrl: '/assets/wordmark-latin.svg' },
        ],
      },
      copies: {
        create: [
          { barcode: 'MS0142-01', rfidTag: 'RFID-MS0142-01', location: 'Rare Manuscript Vault Shelf A-1', status: 'AVAILABLE', copyNumber: 1 },
        ],
      },
    },
  });

  const rec2 = await prisma.bibliographicRecord.create({
    data: {
      titleLatin: 'Muḥyiddīn Mālā',
      titleArabic: 'محي الدين مالا',
      authors: JSON.stringify(['Qāḍī Muḥammad']),
      shelfmark: 'AM 0311',
      callNumber: 'AM-LIT-0311',
      format: 'ARABI_MALAYALAM_PRINT',
      language: 'Arabi-Malayalam',
      extent: '32 pages, lithograph print',
      material: 'Lithographic paper, black ink',
      binding: 'Stitched paper wrapper',
      provenance: 'Purchased from Calicut bookstall, 2021',
      summary: 'Classical Arabi-Malayalam devotional poem celebrating Shaykh Abd al-Qadir al-Jilani.',
      subjects: JSON.stringify(['Arabi-Malayalam Poetry', 'Sufism', 'Malabar Lithographs']),
      accessLevel: 'DIGITISED_FULL',
      digitalFolios: {
        create: [
          { folioNumber: 1, label: 'Lithographed front cover', imageUrl: '/assets/wordmark-arabic.svg' },
          { folioNumber: 2, label: 'Opening stanzas in Arabi-Malayalam script (Page 1)', imageUrl: '/assets/wordmark-latin.svg' },
        ],
      },
      copies: {
        create: [
          { barcode: 'AM0311-01', rfidTag: 'RFID-AM0311-01', location: 'Arabi-Malayalam Section Stack B-2', status: 'AVAILABLE', copyNumber: 1 },
        ],
      },
    },
  });

  const rec3 = await prisma.bibliographicRecord.create({
    data: {
      titleLatin: 'Fatḥ al-Muʿīn, annotated copy',
      titleArabic: 'فتح المعين شرح قرة العين',
      authors: JSON.stringify(['Zayn al-Dīn al-Malībārī']),
      shelfmark: 'RB 0908',
      callNumber: 'RB-FIQ-0908',
      format: 'RARE_BOOK',
      language: 'Arabic',
      extent: '312 pages, bound volume',
      material: 'Imported mill paper, typeset print with handwritten margins',
      binding: 'Full cloth boards with blind stamping',
      provenance: 'Donated by Sabeelul Hidaya Faculty Archives, 2018',
      summary: 'The seminal Malabar Shafi’i jurisprudence text with commentary.',
      subjects: JSON.stringify(['Shafi’i Fiqh', 'Malabar Scholars', 'Rare Printed Books']),
      accessLevel: 'READING_ROOM_ONLY',
      copies: {
        create: [
          { barcode: 'RB0908-01', rfidTag: 'RFID-RB0908-01', location: 'Main Reading Room Stack C-4', status: 'ON_LOAN', copyNumber: 1 },
          { barcode: 'RB0908-02', rfidTag: 'RFID-RB0908-02', location: 'Main Reading Room Stack C-4', status: 'AVAILABLE', copyNumber: 2 },
        ],
      },
    },
  });

  const rec4 = await prisma.bibliographicRecord.create({
    data: {
      titleLatin: 'Al-Bayān monthly, bound run 1954–1961',
      titleArabic: 'مجلة البيان',
      authors: JSON.stringify(['Editorial Board, Kerala Jam’iyyatul Ulama']),
      shelfmark: 'PER 0044',
      callNumber: 'PER-ARA-0044',
      format: 'PERIODICAL',
      language: 'Arabic and Malayalam',
      extent: '8 bound volumes',
      summary: 'Mid-twentieth century monthly journal documenting educational and social developments.',
      subjects: JSON.stringify(['Periodicals', 'Social History', 'Kerala Ulama']),
      accessLevel: 'READING_ROOM_ONLY',
      copies: {
        create: [
          { barcode: 'PER0044-01', rfidTag: 'RFID-PER0044-01', location: 'Periodicals Archive Shelf P-1', status: 'ON_LOAN', copyNumber: 1 },
        ],
      },
    },
  });

  // 6. Create Content Items (Events, News, Stories, Opportunities)
  await prisma.contentItem.deleteMany();

  const contentSeedData = [
    // --- EVENTS ---
    {
      slug: 'national-seminar-arabi-malayalam-manuscripts',
      category: 'EVENT',
      title: 'National Seminar on Arabi-Malayalam Manuscripts and Islamic Littoral Trade',
      kicker: 'Academic Seminar',
      summary: 'Scholars from across South and Southeast Asia gather to present findings on Arabi-Malayalam maritime trade logs and scholarly networks.',
      content: 'This two-day international seminar brings together paleographers, maritime historians, and manuscript conservators to analyze historical commerce, littoral fatwa networks, and scholarly transmission between Malabar, Hadramaut, and the Malay Archipelago from the 16th to early 20th centuries.',
      date: '18 September 2026',
      time: '09:30 AM - 04:30 PM',
      venue: 'Main Auditorium, KMLRI Campus',
      capacity: 150,
      registered: 142,
      author: 'Prof. K. M. Bahauddin & Dr. Zayd Al-Hadhrami',
      featured: true,
      status: 'ACTIVE',
      tags: JSON.stringify(['Seminar', 'Arabi-Malayalam', 'Trade Networks', 'Maritime History']),
    },
    {
      slug: 'workshop-palm-leaf-deacidification-scribe-inks',
      category: 'EVENT',
      title: 'Hands-on Workshop: Palm-leaf De-acidification and Scribe Inks Conservation',
      kicker: 'Conservation Lab Workshop',
      summary: 'Practical session in the conservation lab on handling, surface-cleaning, and stabilizing tannin-iron and lampblack inks.',
      content: 'A hands-on laboratory intensive limited to twelve conservators and advanced students. Participants will work under master conservators learning non-aqueous de-acidification, humidification, and mending of brittle leaves with Japanese tissue and wheat starch paste.',
      date: '24 September 2026',
      time: '10:00 AM - 01:00 PM',
      venue: 'Conservation Lab (Restricted Entry)',
      capacity: 25,
      registered: 25,
      author: 'Senior Conservator Aisha Rahmani',
      featured: false,
      status: 'ACTIVE',
      tags: JSON.stringify(['Workshop', 'Conservation', 'Palm-Leaf', 'Inks']),
    },
    {
      slug: 'exhibition-100-rare-inscriptions-malabar',
      category: 'EVENT',
      title: 'Exhibition: 100 Rare Inscriptions and Folios of Malabar & Coromandel Coast',
      kicker: 'Public Exhibition',
      summary: 'Curated public showcase displaying unique illuminated Quranic folios, royal decrees, and merchant seals dating back four centuries.',
      content: 'Featuring 100 curated artifacts selected from private collections and institute vaults, with high-resolution digital magnification stations and audio guides in Malayalam, Arabic, and English.',
      date: '01 October - 15 October 2026',
      time: '10:00 AM - 07:00 PM Daily',
      venue: 'Gallery Hall A & B',
      capacity: 500,
      registered: 320,
      author: 'KMLRI Curatorial Team',
      featured: true,
      status: 'ACTIVE',
      tags: JSON.stringify(['Exhibition', 'Inscriptions', 'Rare Folios', 'Public Access']),
    },
    {
      slug: 'evening-lecture-malabar-manuscript-networks',
      category: 'EVENT',
      title: 'Evening Lecture on Malabar’s Historical Manuscript Networks',
      kicker: 'Public Lecture',
      summary: 'How codices, scribes, and Madrasa students moved between coastal trading towns.',
      content: 'An illustrated evening lecture mapping the geographic flow of legal commentaries and mystical poetry across coastal ports including Calicut, Ponnani, Cannanore, and Mahe.',
      date: '27 September 2026',
      time: '05:30 PM - 07:00 PM',
      venue: 'Reference Library Seminar Room',
      capacity: 80,
      registered: 64,
      author: 'Dr. Tariq Al-Malabari',
      featured: false,
      status: 'ACTIVE',
      tags: JSON.stringify(['Lecture', 'Codicology', 'History']),
    },

    // --- NEWS ---
    {
      slug: 'nine-hundred-folios-added-to-digital-reading-room',
      category: 'NEWS',
      title: 'Nine hundred folios added to the digital reading room',
      kicker: 'Digitisation Update',
      summary: 'The largest single batch since digitisation began, featuring high-resolution multi-spectral scans.',
      content: 'The digitization lab has uploaded 900 new folios encompassing 18th-century medical treatises and astronomy codices, complete with deep zoom IIIF manifests and full-text Arabic transcriptions.',
      date: '2 October 2026',
      author: 'Digital Repository Division',
      featured: true,
      status: 'ACTIVE',
      tags: JSON.stringify(['Digitisation', 'IIIF', 'Open Access']),
    },
    {
      slug: 'conservation-lab-completes-first-full-year-survey',
      category: 'NEWS',
      title: 'Conservation lab completes its first full-year condition survey',
      kicker: 'Conservation Milestone',
      summary: 'Comprehensive condition reports and micro-climate assessments now exist for every manuscript on the shelves.',
      content: 'Over 1,200 codices and loose-leaf bundles were surveyed, cleaned, and rehoused in custom archival clamshell boxes with phase-box enclosures for vulnerable bindings.',
      date: '14 October 2026',
      author: 'Preservation Team',
      featured: false,
      status: 'ACTIVE',
      tags: JSON.stringify(['Survey', 'Preservation', 'Archives']),
    },
    {
      slug: 'reading-room-open-house-for-research-scholars',
      category: 'NEWS',
      title: 'Reading room open house for research scholars and university faculty',
      kicker: 'Community',
      summary: 'An afternoon of short presentations, catalogue walk-throughs, and rare book handling orientations.',
      content: 'New readers received personalized orientations on using the OPAC search, requesting restricted manuscripts, and applying for digitization scan vouchers.',
      date: '12 September 2026',
      author: 'Reader Services Desk',
      featured: false,
      status: 'ACTIVE',
      tags: JSON.stringify(['Open House', 'Scholars', 'Orientation']),
    },

    // --- STORIES ---
    {
      slug: 'what-a-margin-note-reveals-about-a-19th-century-reader',
      category: 'STORY',
      title: 'What a margin note reveals about a nineteenth-century reader',
      kicker: 'Featured Story',
      summary: 'A single line in the margin of a jurisprudence manuscript tells us who read the book, where they sat, and what they disagreed with.',
      content: 'When examining MS-1049, a leather-bound commentary on Fatḥ al-Muʿīn copied in 1842, archivist Dr. Mariam discovered layered glosses in purple ink. The scribbled notes critique an earlier ruling on riverine water rights in Tanur, providing rare social-historical evidence of how regional scholars interpreted classic Shafi‘i texts in light of local Kerala agrarian practices.',
      date: 'Autumn 2026',
      author: 'Dr. Mariam Farooqi',
      featured: true,
      status: 'ACTIVE',
      tags: JSON.stringify(['Marginalia', 'Jurisprudence', 'Social History']),
    },
    {
      slug: 'tracing-one-poem-across-four-handwritten-copies',
      category: 'STORY',
      title: 'Tracing one poem across four handwritten copies',
      kicker: 'Research notes',
      summary: 'How slight variations in rhyme schemes reveal the movement of Sufi poetry along the Arabian Sea.',
      content: 'Comparing four distinct scribal copies of a 17th-century devotional qasida held across Ponnani, Calicut, and Zanzibar demonstrates how oral performance shaped textual transmission.',
      date: 'September 2026',
      author: 'Research Fellow H. Navas',
      featured: false,
      status: 'ACTIVE',
      tags: JSON.stringify(['Research Notes', 'Poetry', 'Transmission']),
    },
    {
      slug: 'the-paper-the-ink-and-the-hands-that-made-a-book',
      category: 'STORY',
      title: 'The paper, the ink and the hands that made a book',
      kicker: 'Materials',
      summary: 'Microscopic examination of Venetian watermarks and local soot inks in 18th-century Malabar manuscripts.',
      content: 'Paper analysis reveals that coastal scholars imported Tre Lune rag paper from Venice while synthesizing carbon inks from charred coconut shells and gum arabic locally.',
      date: 'August 2026',
      author: 'Conservation Scientist P. V. Salim',
      featured: false,
      tags: JSON.stringify(['Materials', 'Watermarks', 'Ink Analysis']),
    },
    {
      slug: 'how-a-family-collection-came-to-the-reading-room',
      category: 'STORY',
      title: 'How a family collection came to the reading room',
      kicker: 'Donors',
      summary: 'Three generations of ancestral legal deeds and astronomical tables safeguarded from monsoon moisture.',
      content: 'The Vattoli family preserved more than eighty fragile manuscripts in wooden dowry chests for over 150 years before entrusting them to KMLRI for permanent climate-controlled conservation.',
      date: 'July 2026',
      author: 'Archivist K. Zainaba',
      featured: false,
      tags: JSON.stringify(['Donors', 'Family Archives', 'Preservation']),
    },
    {
      slug: 'rehousing-a-binding-that-had-travelled-too-far',
      category: 'STORY',
      title: 'Rehousing a binding that had travelled too far',
      kicker: 'Conservation',
      summary: 'A journey from Hadramaut to Ponnani, repairing damaged fore-edge flap leather.',
      content: 'Step-by-step restoration of an embossed goatskin flap binding damaged by desiccated adhesive and tropical humidity.',
      date: 'June 2026',
      author: 'Conservation Lab',
      featured: false,
      tags: JSON.stringify(['Conservation', 'Leather Binding', 'Restoration']),
    },

    // --- OPPORTUNITIES ---
    {
      slug: 'short-term-research-fellowships-2026',
      category: 'OPPORTUNITY',
      title: 'Short-term Research Fellowships in Manuscript Studies 2026–2027',
      kicker: 'Research Fellowships',
      summary: 'Four fully-funded residential fellowships for scholars working on Arabic and Arabi-Malayalam primary codices.',
      content: 'KMLRI invites applications for 3-month and 6-month visiting fellowships. Fellows receive unrestricted reading room access, a dedicated study desk, archival scan credits, accommodation on campus, and a monthly research stipend.',
      date: 'Applications Close: 30 October 2026',
      deadline: '30 October 2026',
      stipend: '₹45,000 / month + On-campus Housing',
      venue: 'KMLRI Research Wing, Calicut',
      capacity: 4,
      registered: 18,
      author: 'Academic Advisory Board',
      featured: true,
      status: 'ACTIVE',
      tags: JSON.stringify(['Fellowship', 'Fully Funded', 'Research', 'Stipend']),
    },
    {
      slug: 'resident-internship-manuscript-conservation',
      category: 'OPPORTUNITY',
      title: 'Graduate Resident Internship in Book & Paper Conservation',
      kicker: 'Internship',
      summary: 'A 6-month intensive training placement in paper deacidification, Japanese tissue repair, and leather tooling.',
      content: 'Designed for recent graduates of conservation, museum studies, or chemistry. Interns work alongside senior conservators treating 17th-19th century items.',
      date: 'Applications Close: 15 November 2026',
      deadline: '15 November 2026',
      stipend: '₹22,000 / month',
      venue: 'Conservation & Digitization Lab',
      capacity: 3,
      registered: 9,
      author: 'Conservation Department',
      featured: false,
      status: 'ACTIVE',
      tags: JSON.stringify(['Internship', 'Conservation', 'Paid']),
    },
    {
      slug: 'call-for-papers-indian-ocean-codicology-symposium',
      category: 'OPPORTUNITY',
      title: 'Call for Papers: 3rd International Indian Ocean Codicology Symposium',
      kicker: 'Call for Papers',
      summary: 'Submissions invited on scribal traditions, watermark chronologies, and littoral text transmission.',
      content: 'Selected peer-reviewed papers will be published in the KMLRI Journal of Manuscript Studies. Travel grants available for selected early-career scholars.',
      date: 'Abstract Deadline: 10 December 2026',
      deadline: '10 December 2026',
      stipend: 'Travel Grants & Publication',
      venue: 'Hybrid / KMLRI Auditorium',
      capacity: 30,
      registered: 12,
      author: 'Editorial Committee',
      featured: false,
      status: 'ACTIVE',
      tags: JSON.stringify(['Call for Papers', 'Symposium', 'Publication']),
    },
    {
      slug: 'graduate-assistantship-arabic-paleography-cataloguing',
      category: 'OPPORTUNITY',
      title: 'Graduate Assistantship in Arabic & Persian Paleography Cataloguing',
      kicker: 'Assistantship',
      summary: 'Part-time position for postgraduate scholars to assist in Dublin Core metadata encoding and incipit transcription.',
      content: 'Flexible 15-20 hours per week role assisting senior cataloguers in deciphering colophons, identifying watermarks, and inputting Dublin Core/MARC21 metadata.',
      date: 'Applications Close: 25 October 2026',
      deadline: '25 October 2026',
      stipend: '₹18,000 / month',
      venue: 'Cataloguing Department',
      capacity: 2,
      registered: 7,
      author: 'Cataloguing Team',
      featured: false,
      status: 'ACTIVE',
      tags: JSON.stringify(['Assistantship', 'Cataloguing', 'Paleography']),
    },
  ];

  for (const item of contentSeedData) {
    await prisma.contentItem.create({ data: item });
  }

  console.log(`✅ Seeded ${contentSeedData.length} Content Items across Events, News, Stories, and Opportunities`);

  console.log('✅ Seed completed successfully with dynamic roles and permissions.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
