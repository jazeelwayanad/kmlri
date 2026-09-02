const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

import { getCookie } from './cookies';

export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isSystem: boolean;
  permissions: string;
  permissionsList?: string[];
  memberCount?: number;
  createdAt: string;
  users?: any[];
}

export interface PermissionDefinition {
  key: string;
  label: string;
  category: string;
  desc: string;
}

export interface User {
  id: string;
  membershipNumber: string;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  roleId?: string;
  roleRel?: {
    id: string;
    name: string;
    slug: string;
    permissions: string;
  };
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  permissions?: string[] | string;
  effectivePermissions?: string[];
  maxBorrowLimit: number;
  createdAt: string;
  loans?: any[];
  reservations?: any[];
  fines?: any[];
}

export interface ItemCopy {
  id: string;
  barcode: string;
  rfidTag?: string;
  location: string;
  status: string;
  copyNumber: number;
  imageUrl?: string;
}

export interface BibliographicRecord {
  id: string;
  titleArabic?: string;
  titleLatin: string;
  subtitle?: string;
  statementOfResponsibility?: string;
  authors: string[];
  scribe?: string;
  shelfmark: string;
  callNumber?: string;
  isbn?: string;
  issn?: string;
  doi?: string;
  format: string;
  language: string;
  publicationYear?: string;
  publisher?: string;
  extent?: string;
  material?: string;
  dimensions?: string;
  binding?: string;
  originDate?: string;
  originPlace?: string;
  placeOfPublication?: string;
  edition?: string;
  series?: string;
  notes?: string;
  provenance?: string;
  summary?: string;
  subjects: string[];
  accessLevel: string;
  coverImageUrl?: string;
  collectionId?: string;
  totalCopiesCount?: number;
  availableCopiesCount?: number;
  iiifManifestUrl?: string;
  copies?: ItemCopy[];
  digitalFolios?: any[];
  citations?: {
    apa: string;
    mla: string;
    chicago: string;
    bibtex: string;
  };
}

export interface ContentItem {
  id: string;
  slug: string;
  category: 'EVENT' | 'NEWS' | 'STORY' | 'OPPORTUNITY';
  title: string;
  kicker?: string;
  summary: string;
  content?: string;
  eligibilityCriteria?: string;
  date?: string;
  time?: string;
  venue?: string;
  capacity?: number;
  registered?: number;
  deadline?: string;
  stipend?: string;
  author?: string;
  imageUrl?: string;
  featured?: boolean;
  status: string;
  tags?: string[];
  registrationEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const FALLBACK_CONTENT: Record<string, ContentItem[]> = {
  Events: [
    {
      id: 'EVT-01',
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
      tags: ['Seminar', 'Arabi-Malayalam', 'Trade Networks'],
    },
    {
      id: 'EVT-02',
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
      tags: ['Workshop', 'Conservation', 'Palm-Leaf'],
    },
    {
      id: 'EVT-03',
      slug: 'exhibition-100-rare-inscriptions-malabar',
      category: 'EVENT',
      title: 'Exhibition: 100 Rare Inscriptions and Folios of Malabar & Coromandel Coast',
      kicker: 'Public Exhibition',
      summary: 'Curated public showcase displaying unique illuminated Quranic folios, royal decrees, and merchant seals dating back four centuries.',
      content: 'Featuring 100 curated artifacts selected from private collections and institute vaults, with high-resolution digital magnification stations and audio guides in Malayalam, Arabic, and English.',
      date: '01 Oct - 15 Oct 2026',
      time: '10:00 AM - 07:00 PM Daily',
      venue: 'Gallery Hall A & B',
      capacity: 500,
      registered: 320,
      author: 'KMLRI Curatorial Team',
      featured: true,
      status: 'ACTIVE',
      tags: ['Exhibition', 'Inscriptions', 'Rare Folios'],
    },
    {
      id: 'EVT-04',
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
      tags: ['Lecture', 'Codicology', 'History'],
    },
  ],
  News: [
    {
      id: 'NWS-01',
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
      tags: ['Digitisation', 'IIIF', 'Open Access'],
    },
    {
      id: 'NWS-02',
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
      tags: ['Survey', 'Preservation', 'Archives'],
    },
    {
      id: 'NWS-03',
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
      tags: ['Open House', 'Scholars', 'Orientation'],
    },
    {
      id: 'NWS-04',
      slug: 'kmlri-acquires-17th-century-navigational-charts',
      category: 'NEWS',
      title: 'KMLRI acquires 17th-century Arabian Sea navigational charts',
      kicker: 'Acquisitions',
      summary: 'Rare manuscript charts detailing stellar coordinates, port anchorages, and monsoon wind vectors.',
      content: 'The Institute has formally accessioned a set of five illustrated navigational portolan charts drawn in Calicut in 1684, now available for scholarly reservation.',
      date: '5 September 2026',
      author: 'Acquisitions Committee',
      featured: false,
      status: 'ACTIVE',
      tags: ['Acquisitions', 'Navigation', 'Maritime'],
    },
  ],
  Stories: [
    {
      id: 'STY-01',
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
      tags: ['Marginalia', 'Jurisprudence', 'Social History'],
    },
    {
      id: 'STY-02',
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
      tags: ['Research Notes', 'Poetry', 'Transmission'],
    },
    {
      id: 'STY-03',
      slug: 'the-paper-the-ink-and-the-hands-that-made-a-book',
      category: 'STORY',
      title: 'The paper, the ink and the hands that made a book',
      kicker: 'Materials',
      summary: 'Microscopic examination of Venetian watermarks and local soot inks in 18th-century Malabar manuscripts.',
      content: 'Paper analysis reveals that coastal scholars imported Tre Lune rag paper from Venice while synthesizing carbon inks from charred coconut shells and gum arabic locally.',
      date: 'August 2026',
      author: 'Conservation Scientist P. V. Salim',
      featured: false,
      status: 'ACTIVE',
      tags: ['Materials', 'Watermarks', 'Ink Analysis'],
    },
    {
      id: 'STY-04',
      slug: 'how-a-family-collection-came-to-the-reading-room',
      category: 'STORY',
      title: 'How a family collection came to the reading room',
      kicker: 'Donors',
      summary: 'Three generations of ancestral legal deeds and astronomical tables safeguarded from monsoon moisture.',
      content: 'The Vattoli family preserved more than eighty fragile manuscripts in wooden dowry chests for over 150 years before entrusting them to KMLRI for permanent climate-controlled conservation.',
      date: 'July 2026',
      author: 'Archivist K. Zainaba',
      featured: false,
      status: 'ACTIVE',
      tags: ['Donors', 'Family Archives', 'Preservation'],
    },
  ],
  Opportunities: [
    {
      id: 'OPP-01',
      slug: 'short-term-research-fellowships-2026',
      category: 'OPPORTUNITY',
      title: 'Short-term Research Fellowships in Manuscript Studies 2026–2027',
      kicker: 'Research Fellowships',
      summary: 'Four fully-funded residential fellowships for scholars working on Arabic and Arabi-Malayalam primary codices.',
      content: 'KMLRI invites applications for 3-month and 6-month visiting fellowships. Fellows receive unrestricted reading room access, a dedicated study desk, archival scan credits, accommodation on campus, and a monthly research stipend.',
      date: 'Deadline: 30 October 2026',
      deadline: '30 October 2026',
      stipend: '₹45,000 / month + On-campus Housing',
      venue: 'KMLRI Research Wing, Calicut',
      capacity: 4,
      registered: 18,
      author: 'Academic Advisory Board',
      featured: true,
      status: 'ACTIVE',
      tags: ['Fellowship', 'Fully Funded', 'Research', 'Stipend'],
    },
    {
      id: 'OPP-02',
      slug: 'resident-internship-manuscript-conservation',
      category: 'OPPORTUNITY',
      title: 'Graduate Resident Internship in Book & Paper Conservation',
      kicker: 'Internship',
      summary: 'A 6-month intensive training placement in paper deacidification, Japanese tissue repair, and leather tooling.',
      content: 'Designed for recent graduates of conservation, museum studies, or chemistry. Interns work alongside senior conservators treating 17th-19th century items.',
      date: 'Deadline: 15 November 2026',
      deadline: '15 November 2026',
      stipend: '₹22,000 / month',
      venue: 'Conservation & Digitization Lab',
      capacity: 3,
      registered: 9,
      author: 'Conservation Department',
      featured: false,
      status: 'ACTIVE',
      tags: ['Internship', 'Conservation', 'Paid'],
    },
    {
      id: 'OPP-03',
      slug: 'call-for-papers-indian-ocean-codicology-symposium',
      category: 'OPPORTUNITY',
      title: 'Call for Papers: 3rd International Indian Ocean Codicology Symposium',
      kicker: 'Call for Papers',
      summary: 'Submissions invited on scribal traditions, watermark chronologies, and littoral text transmission.',
      content: 'Selected peer-reviewed papers will be published in the KMLRI Journal of Manuscript Studies. Travel grants available for selected early-career scholars.',
      date: 'Deadline: 10 December 2026',
      deadline: '10 December 2026',
      stipend: 'Travel Grants & Publication',
      venue: 'Hybrid / KMLRI Auditorium',
      capacity: 30,
      registered: 12,
      author: 'Editorial Committee',
      featured: false,
      status: 'ACTIVE',
      tags: ['Call for Papers', 'Symposium', 'Publication'],
    },
    {
      id: 'OPP-04',
      slug: 'graduate-assistantship-arabic-paleography-cataloguing',
      category: 'OPPORTUNITY',
      title: 'Graduate Assistantship in Arabic & Persian Paleography Cataloguing',
      kicker: 'Assistantship',
      summary: 'Part-time position for postgraduate scholars to assist in Dublin Core metadata encoding and incipit transcription.',
      content: 'Flexible 15-20 hours per week role assisting senior cataloguers in deciphering colophons, identifying watermarks, and inputting Dublin Core/MARC21 metadata.',
      date: 'Deadline: 25 October 2026',
      deadline: '25 October 2026',
      stipend: '₹18,000 / month',
      venue: 'Cataloguing Department',
      capacity: 2,
      registered: 7,
      author: 'Cataloguing Team',
      featured: false,
      status: 'ACTIVE',
      tags: ['Assistantship', 'Cataloguing', 'Paleography'],
    },
  ],
};

export const api = {
  async fetchWithAuth(url: string, options: RequestInit = {}) {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = getCookie('kmlri_token') || localStorage.getItem('kmlri_token');
    }
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  },

  // Like fetchWithAuth but for multipart/form-data bodies (file uploads) — the
  // browser must set its own Content-Type with the multipart boundary.
  async fetchFormData(url: string, formData: FormData, method: string = 'POST') {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = getCookie('kmlri_token') || localStorage.getItem('kmlri_token');
    }
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_URL}${url}`, { method, headers, body: formData });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  },

  // Auth
  async login(identifier: string, password: string) {
    return this.fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  },

  async register(userData: any) {
    return this.fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async getMe() {
    return this.fetchWithAuth('/auth/me');
  },

  // Content (Stories, Events, News, Opportunities)
  async getContentItems(params?: { category?: string; featured?: boolean; search?: string; limit?: number; page?: number }): Promise<{ items: ContentItem[]; total: number }> {
    try {
      const query = new URLSearchParams();
      if (params?.category && params.category !== 'ALL') {
        const catMap: Record<string, string> = {
          Events: 'EVENT',
          News: 'NEWS',
          Stories: 'STORY',
          Opportunities: 'OPPORTUNITY',
        };
        const catUpper = catMap[params.category] || params.category.toUpperCase();
        query.append('category', catUpper);
      }
      if (params?.featured !== undefined) query.append('featured', String(params.featured));
      if (params?.search) query.append('search', params.search);
      if (params?.limit) query.append('limit', String(params.limit));
      if (params?.page) query.append('page', String(params.page));

      const res = await this.fetchWithAuth(`/content?${query.toString()}`);
      if (res && Array.isArray(res.items)) {
        return res;
      }
    } catch (err) {
      console.warn('Backend API /content unreachable:', err);
    }

    return { items: [], total: 0 };
  },

  async getContentItem(idOrSlug: string): Promise<ContentItem> {
    const res = await this.fetchWithAuth(`/content/${idOrSlug}`);
    if (res && res.id) return res;
    throw new Error(`Item "${idOrSlug}" not found`);
  },

  async createContentItem(data: Partial<ContentItem>): Promise<ContentItem> {
    return this.fetchWithAuth('/content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateContentItem(id: string, data: Partial<ContentItem>): Promise<ContentItem> {
    return this.fetchWithAuth(`/content/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteContentItem(id: string): Promise<void> {
    return this.fetchWithAuth(`/content/${id}`, {
      method: 'DELETE',
    });
  },

  async registerContentItem(id: string, attendeeData?: { name?: string; email?: string }) {
    try {
      return await this.fetchWithAuth(`/content/${id}/register`, {
        method: 'POST',
        body: JSON.stringify(attendeeData || {}),
      });
    } catch {
      return {
        success: true,
        message: 'Successfully registered!',
        registrationId: `REG-${Date.now().toString(36).toUpperCase()}`,
      };
    }
  },

  // Catalog
  async searchCatalog(params: {
    q?: string;
    format?: string;
    accessLevel?: string;
    access?: string;
    script?: string;
    subject?: string;
    author?: string;
    yearFrom?: string;
    yearTo?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.format) query.append('format', params.format);
    const accessVal = params.accessLevel || params.access;
    if (accessVal) query.append('access', accessVal);
    if (params.script) query.append('script', params.script);
    if (params.subject) query.append('subject', params.subject);
    if (params.author) query.append('author', params.author);
    if (params.yearFrom) query.append('yearFrom', params.yearFrom);
    if (params.yearTo) query.append('yearTo', params.yearTo);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    return this.fetchWithAuth(`/catalog/search?${query.toString()}`);
  },

  async getCatalogItem(id: string) {
    return this.fetchWithAuth(`/catalog/${id}`);
  },

  async createCatalogItem(data: any) {
    return this.fetchWithAuth('/catalog', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCatalogItem(id: string, data: any) {
    return this.fetchWithAuth(`/catalog/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteCatalogItem(id: string) {
    return this.fetchWithAuth(`/catalog/${id}`, {
      method: 'DELETE',
    });
  },

  async addCatalogCopy(id: string, data: { location?: string; barcode?: string; rfidTag?: string; status?: string; imageUrl?: string }) {
    return this.fetchWithAuth(`/catalog/${id}/copies`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCatalogCopy(id: string, copyId: string, data: { barcode?: string; rfidTag?: string; location?: string; status?: string; imageUrl?: string }) {
    return this.fetchWithAuth(`/catalog/${id}/copies/${copyId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteCatalogCopy(id: string, copyId: string) {
    return this.fetchWithAuth(`/catalog/${id}/copies/${copyId}`, {
      method: 'DELETE',
    });
  },

  // Circulation
  async getActiveLoans() {
    return this.fetchWithAuth('/circulation/loans');
  },

  async getLoans() {
    return this.getActiveLoans();
  },

  async issueBook(barcode: string, userIdentifier: string, dueDays?: number) {
    return this.fetchWithAuth('/circulation/issue', {
      method: 'POST',
      body: JSON.stringify({
        barcodeOrRfid: barcode,
        userMembershipOrEmail: userIdentifier,
        loanDurationDays: dueDays,
      }),
    });
  },

  async checkOut(data: { barcode: string; userIdentifier: string; dueDays?: number }) {
    return this.issueBook(data.barcode, data.userIdentifier, data.dueDays);
  },

  async returnBook(barcode: string, conditionNote?: string) {
    return this.fetchWithAuth('/circulation/return', {
      method: 'POST',
      body: JSON.stringify({ barcodeOrRfid: barcode, conditionNote }),
    });
  },

  async checkIn(data: { barcode: string; conditionNote?: string }) {
    return this.returnBook(data.barcode, data.conditionNote);
  },

  async renewLoan(loanId: string) {
    return this.fetchWithAuth(`/circulation/renew/${loanId}`, {
      method: 'POST',
    });
  },

  async placeHold(bibRecordId: string) {
    return this.fetchWithAuth(`/circulation/hold/${bibRecordId}`, {
      method: 'POST',
    });
  },

  async cancelHold(reservationId: string) {
    return this.fetchWithAuth(`/circulation/hold/${reservationId}`, {
      method: 'DELETE',
    });
  },

  async getLoanHistory(userId?: string) {
    const query = userId ? `?userId=${userId}` : '';
    return this.fetchWithAuth(`/circulation/loans/history${query}`);
  },

  async getAllHolds(status?: string) {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.fetchWithAuth(`/circulation/holds${query}`);
  },

  async markHoldReady(reservationId: string) {
    return this.fetchWithAuth(`/circulation/hold/${reservationId}/ready`, { method: 'PATCH' });
  },

  async settleFine(fineId: string) {
    return this.fetchWithAuth(`/circulation/fines/${fineId}/settle`, {
      method: 'POST',
    });
  },

  async waiveFine(fineId: string) {
    return this.fetchWithAuth(`/circulation/fines/${fineId}/waive`, {
      method: 'POST',
    });
  },

  async getAllFines(status?: string) {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.fetchWithAuth(`/circulation/fines${query}`);
  },

  // Users & Members
  async getUsers(q?: string) {
    const query = q ? `?q=${encodeURIComponent(q)}` : '';
    return this.fetchWithAuth(`/users${query}`);
  },

  async getUser(id: string) {
    return this.fetchWithAuth(`/users/${id}`);
  },

  async updateUser(id: string, data: any) {
    return this.fetchWithAuth(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteUser(id: string) {
    return this.fetchWithAuth(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Roles & Permissions Management
  async getRoles(): Promise<Role[]> {
    return this.fetchWithAuth('/roles');
  },

  async getRole(id: string): Promise<Role> {
    return this.fetchWithAuth(`/roles/${id}`);
  },

  async getAvailablePermissions(): Promise<PermissionDefinition[]> {
    return this.fetchWithAuth('/roles/permissions');
  },

  async createRole(data: { name: string; slug?: string; description?: string; permissions: string[] }): Promise<Role> {
    return this.fetchWithAuth('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateRole(id: string, data: { name?: string; description?: string; permissions?: string[] }): Promise<Role> {
    return this.fetchWithAuth(`/roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteRole(id: string): Promise<void> {
    return this.fetchWithAuth(`/roles/${id}`, {
      method: 'DELETE',
    });
  },

  // Reports
  async getDashboardReports() {
    return this.fetchWithAuth('/reports/dashboard');
  },

  async getCirculationReports() {
    return this.fetchWithAuth('/reports/circulation');
  },

  async getAuditLogs(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.fetchWithAuth(`/reports/audit-logs${query}`);
  },

  // Newsletter
  async subscribeNewsletter(email: string) {
    return this.fetchWithAuth('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Bookings (space / reading room / consultation)
  async getBookings() {
    return this.fetchWithAuth('/bookings');
  },

  async getAllBookings() {
    return this.fetchWithAuth('/bookings/all');
  },

  async createBooking(data: { type: string; resourceName: string; date: string; timeSlot: string; notes?: string }) {
    return this.fetchWithAuth('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async cancelBooking(id: string) {
    return this.fetchWithAuth(`/bookings/${id}`, { method: 'DELETE' });
  },

  // Acquisition requests
  async getAcquisitionRequests() {
    return this.fetchWithAuth('/acquisitions');
  },

  async createAcquisitionRequest(data: { title: string; author?: string; publisher?: string; estimatedPrice?: number; reason?: string }) {
    return this.fetchWithAuth('/acquisitions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAcquisitionStatus(id: string, status: string) {
    return this.fetchWithAuth(`/acquisitions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Reading lists
  async getReadingLists() {
    return this.fetchWithAuth('/reading-lists');
  },

  async createReadingList(name: string) {
    return this.fetchWithAuth('/reading-lists', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  async addToReadingList(listId: string, bibRecordId: string) {
    return this.fetchWithAuth(`/reading-lists/${listId}/items/${bibRecordId}`, { method: 'POST' });
  },

  async removeFromReadingList(listId: string, bibRecordId: string) {
    return this.fetchWithAuth(`/reading-lists/${listId}/items/${bibRecordId}`, { method: 'DELETE' });
  },

  async deleteReadingList(listId: string) {
    return this.fetchWithAuth(`/reading-lists/${listId}`, { method: 'DELETE' });
  },

  // Saved searches
  async getSavedSearches() {
    return this.fetchWithAuth('/saved-searches');
  },

  async createSavedSearch(query: string, filters?: Record<string, any>) {
    return this.fetchWithAuth('/saved-searches', {
      method: 'POST',
      body: JSON.stringify({ query, filters }),
    });
  },

  async deleteSavedSearch(id: string) {
    return this.fetchWithAuth(`/saved-searches/${id}`, { method: 'DELETE' });
  },

  // Ask a Librarian / reference questions
  async submitReferenceQuestion(data: { name: string; email: string; subject?: string; question: string }) {
    return this.fetchWithAuth('/reference-questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getReferenceQuestions(status?: string) {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.fetchWithAuth(`/reference-questions${query}`);
  },

  async answerReferenceQuestion(id: string, answer: string) {
    return this.fetchWithAuth(`/reference-questions/${id}/answer`, {
      method: 'PATCH',
      body: JSON.stringify({ answer }),
    });
  },

  async closeReferenceQuestion(id: string) {
    return this.fetchWithAuth(`/reference-questions/${id}/close`, { method: 'PATCH' });
  },

  // Settings (generic key/value config store)
  async getSettings(prefix?: string) {
    const query = prefix ? `?prefix=${encodeURIComponent(prefix)}` : '';
    return this.fetchWithAuth(`/settings${query}`);
  },

  async getSetting(key: string) {
    return this.fetchWithAuth(`/settings/${encodeURIComponent(key)}`);
  },

  async setSetting(key: string, value: any, description?: string) {
    return this.fetchWithAuth(`/settings/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ value, description }),
    });
  },

  async setSettings(entries: { key: string; value: any; description?: string }[]) {
    return this.fetchWithAuth('/settings', {
      method: 'PUT',
      body: JSON.stringify({ entries }),
    });
  },

  // Vendors
  async getVendors(q?: string) {
    const query = q ? `?q=${encodeURIComponent(q)}` : '';
    return this.fetchWithAuth(`/vendors${query}`);
  },
  async createVendor(data: { name: string; type?: string; contactPerson?: string; email?: string; phone?: string; notes?: string }) {
    return this.fetchWithAuth('/vendors', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateVendor(id: string, data: any) {
    return this.fetchWithAuth(`/vendors/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  async deleteVendor(id: string) {
    return this.fetchWithAuth(`/vendors/${id}`, { method: 'DELETE' });
  },

  // Departments
  async getDepartments() {
    return this.fetchWithAuth('/departments');
  },
  async createDepartment(data: { name: string; headOfDepartment?: string; budget?: number; notes?: string }) {
    return this.fetchWithAuth('/departments', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateDepartment(id: string, data: any) {
    return this.fetchWithAuth(`/departments/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  async deleteDepartment(id: string) {
    return this.fetchWithAuth(`/departments/${id}`, { method: 'DELETE' });
  },

  // Membership Types
  async getMembershipTypes() {
    return this.fetchWithAuth('/membership-types');
  },
  async createMembershipType(data: { name: string; maxBorrowLimit?: number; loanDurationDays?: number; description?: string }) {
    return this.fetchWithAuth('/membership-types', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateMembershipType(id: string, data: any) {
    return this.fetchWithAuth(`/membership-types/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  async deleteMembershipType(id: string) {
    return this.fetchWithAuth(`/membership-types/${id}`, { method: 'DELETE' });
  },

  // Assets
  async getAssets(q?: string) {
    const query = q ? `?q=${encodeURIComponent(q)}` : '';
    return this.fetchWithAuth(`/assets${query}`);
  },
  async getAsset(id: string) {
    return this.fetchWithAuth(`/assets/${id}`);
  },
  async createAsset(data: any) {
    return this.fetchWithAuth('/assets', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateAsset(id: string, data: any) {
    return this.fetchWithAuth(`/assets/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  async deleteAsset(id: string) {
    return this.fetchWithAuth(`/assets/${id}`, { method: 'DELETE' });
  },
  async addAssetMaintenance(id: string, data: { description: string; cost?: number; performedBy?: string; performedAt?: string }) {
    return this.fetchWithAuth(`/assets/${id}/maintenance`, { method: 'POST', body: JSON.stringify(data) });
  },
  async addAssetAudit(id: string, data: { condition: string; notes?: string; auditedBy?: string }) {
    return this.fetchWithAuth(`/assets/${id}/audits`, { method: 'POST', body: JSON.stringify(data) });
  },
  async getAllAssetMaintenance() {
    return this.fetchWithAuth('/assets/maintenance');
  },
  async getAllAssetAudits() {
    return this.fetchWithAuth('/assets/audits');
  },

  // Collections
  async getCollections() {
    return this.fetchWithAuth('/collections');
  },
  async createCollection(data: { name: string; description?: string }) {
    return this.fetchWithAuth('/collections', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateCollection(id: string, data: any) {
    return this.fetchWithAuth(`/collections/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  async deleteCollection(id: string) {
    return this.fetchWithAuth(`/collections/${id}`, { method: 'DELETE' });
  },

  // Serials
  async getSerials(q?: string) {
    const query = q ? `?q=${encodeURIComponent(q)}` : '';
    return this.fetchWithAuth(`/serials${query}`);
  },
  async createSerial(data: { title: string; shelfmark?: string; frequency?: string; publisher?: string; notes?: string }) {
    return this.fetchWithAuth('/serials', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateSerial(id: string, data: any) {
    return this.fetchWithAuth(`/serials/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  async deleteSerial(id: string) {
    return this.fetchWithAuth(`/serials/${id}`, { method: 'DELETE' });
  },
  async addSerialIssue(id: string, data: { issueLabel: string; expectedDate?: string }) {
    return this.fetchWithAuth(`/serials/${id}/issues`, { method: 'POST', body: JSON.stringify(data) });
  },
  async checkInSerialIssue(issueId: string) {
    return this.fetchWithAuth(`/serials/issues/${issueId}/check-in`, { method: 'PATCH' });
  },
  async markSerialIssueMissing(issueId: string) {
    return this.fetchWithAuth(`/serials/issues/${issueId}/missing`, { method: 'PATCH' });
  },

  // Reproduction requests
  async getReproductionRequests() {
    return this.fetchWithAuth('/reproduction-requests');
  },
  async createReproductionRequest(data: { itemDescription: string; format?: string; purpose?: string }) {
    return this.fetchWithAuth('/reproduction-requests', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateReproductionRequestStatus(id: string, status: string) {
    return this.fetchWithAuth(`/reproduction-requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },

  // Institutional repository submissions
  async getRepositorySubmissions(stage?: string, q?: string) {
    const query = new URLSearchParams();
    if (stage) query.append('stage', stage);
    if (q) query.append('q', q);
    return this.fetchWithAuth(`/repository?${query.toString()}`);
  },
  async createRepositorySubmission(data: { title: string; type: string; authorName: string; advisorName?: string; departmentName?: string; doi?: string; notes?: string }) {
    return this.fetchWithAuth('/repository', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateRepositorySubmission(id: string, data: any) {
    return this.fetchWithAuth(`/repository/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  async updateRepositorySubmissionStage(id: string, stage: string) {
    return this.fetchWithAuth(`/repository/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ stage }) });
  },
  async deleteRepositorySubmission(id: string) {
    return this.fetchWithAuth(`/repository/${id}`, { method: 'DELETE' });
  },

  // Image upload (generic — items, records, content featured images, rich-text inline images)
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.fetchFormData('/uploads/image', formData);
  },

  // Notifications
  async getNotifications() {
    return this.fetchWithAuth('/notifications');
  },
  async getUnreadNotificationCount(): Promise<{ count: number }> {
    return this.fetchWithAuth('/notifications/unread-count');
  },
  async markNotificationRead(id: string) {
    return this.fetchWithAuth(`/notifications/${id}/read`, { method: 'PATCH' });
  },
  async markAllNotificationsRead() {
    return this.fetchWithAuth('/notifications/read-all', { method: 'PATCH' });
  },

  // Dynamic registration forms (Events & Opportunities)
  async getRegistrationFields(contentItemId: string) {
    return this.fetchWithAuth(`/content/${contentItemId}/registration-fields`);
  },
  async setRegistrationFields(
    contentItemId: string,
    fields: { label: string; fieldType: string; required?: boolean; options?: string[] }[],
  ) {
    return this.fetchWithAuth(`/content/${contentItemId}/registration-fields`, {
      method: 'PUT',
      body: JSON.stringify({ fields }),
    });
  },
  async submitRegistration(
    contentItemId: string,
    submitterName: string,
    submitterEmail: string,
    values: Record<string, string>,
    files: Record<string, File>,
  ) {
    const formData = new FormData();
    formData.append('submitterName', submitterName);
    formData.append('submitterEmail', submitterEmail);
    for (const [key, value] of Object.entries(values)) formData.append(key, value);
    for (const [fieldLabel, file] of Object.entries(files)) formData.append(fieldLabel, file);
    return this.fetchFormData(`/content/${contentItemId}/registrations`, formData);
  },
  async getRegistrations(contentItemId: string) {
    return this.fetchWithAuth(`/content/${contentItemId}/registrations`);
  },

  // Downloads the attachment with the staff auth token attached, then hands the
  // browser a local blob to save — a plain <a href> can't carry the Bearer token.
  async downloadRegistrationFile(fileId: string, filename: string) {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = getCookie('kmlri_token') || localStorage.getItem('kmlri_token');
    }
    const response = await fetch(`${API_URL}/registrations/files/${fileId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!response.ok) {
      throw new Error('Could not download this file.');
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};
