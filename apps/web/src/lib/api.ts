export const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl !== 'undefined' && !envUrl.includes('undefined')) {
    return envUrl.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return 'http://localhost:4000/api';
};

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
  username?: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  institution?: string;
  gender?: string;
  researchInterest?: string;
  designation?: string;
  department?: string;
  bio?: string;
  orcid?: string;
  researchLanguages?: string;
  avatarUrl?: string;
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
  guarantorId?: string;
  relationship?: string;
  guarantor?: any;
  relatives?: any[];
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
  conditionNote?: string;
  accessionNumber?: string;
  itemTypeCode?: string;
  collectionCode?: string;
  homeLibraryCode?: string;
  currentLibraryCode?: string;
  loans?: {
    dueDate: string;
    user?: { fullName: string; membershipNumber: string };
  }[];
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
  Events: [],
  News: [],
  Stories: [],
  Opportunities: [],
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

    const baseUrl = getApiBaseUrl();
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    const response = await fetch(`${baseUrl}${cleanUrl}`, {
      ...options,
      headers,
    });

    let data: any = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      const err: any = new Error(data.message || `API request failed with status ${response.status}`);
      err.status = response.status;
      throw err;
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

    const baseUrl = getApiBaseUrl();
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    const response = await fetch(`${baseUrl}${cleanUrl}`, { method, headers, body: formData });
    let data: any = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      const err: any = new Error(data.message || `API request failed with status ${response.status}`);
      err.status = response.status;
      throw err;
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

  async updateMyProfile(data: { fullName?: string; phone?: string; designation?: string; department?: string; bio?: string; orcid?: string; researchLanguages?: string; avatarUrl?: string }) {
    return this.fetchWithAuth('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return this.fetchWithAuth('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
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
    return this.fetchWithAuth(`/content/${id}/register`, {
      method: 'POST',
      body: JSON.stringify(attendeeData || {}),
    });
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
    collection?: string;
  }) {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.format) query.append('format', params.format);
    const accessVal = params.accessLevel || params.access;
    if (accessVal) query.append('access', accessVal);
    if (params.script) query.append('script', params.script);
    if (params.collection) query.append('collection', params.collection);
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

  async findCatalogDuplicates(params: { title?: string; author?: string; isbn?: string; issn?: string }) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && query.append(k, v));
    return this.fetchWithAuth(`/catalog/duplicates?${query.toString()}`);
  },

  // Downloads a catalog export (MARCXML or CSV) and returns { blob, filename } for the
  // caller to trigger a browser save via a temporary object URL.
  async exportCatalog(format: 'marcxml' | 'csv', ids?: string[]): Promise<{ blob: Blob; filename: string }> {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = getCookie('kmlri_token') || localStorage.getItem('kmlri_token');
    }
    const query = new URLSearchParams({ format });
    if (ids && ids.length) query.append('ids', ids.join(','));
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/catalog/export?${query.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Export failed');
    }
    const blob = await response.blob();
    const ext = format === 'csv' ? 'csv' : 'xml';
    return { blob, filename: `catalog-export.${ext}` };
  },

  // Imports accession-register-style rows (biblionumber/Barcode/AccDate/CallNo/ISBN/Author/
  // Title/Ed/Year/Place/Pub/Pages/Subject/Location/UniformTitle/Language) as JSON.
  async importCatalogRows(rows: Record<string, string>[]) {
    return this.fetchWithAuth('/catalog/import', {
      method: 'POST',
      body: JSON.stringify({ rows: JSON.stringify(rows) }),
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
  async getBookingConfig() {
    return this.fetchWithAuth('/bookings/config');
  },

  async updateBookingConfig(config: any) {
    return this.fetchWithAuth('/bookings/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  },

  async getBookings(status?: string) {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.fetchWithAuth(`/bookings${query}`);
  },

  async getAllBookings(status?: string) {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.fetchWithAuth(`/bookings/all${query}`);
  },

  async getBooking(id: string) {
    return this.fetchWithAuth(`/bookings/${id}`);
  },

  async createBooking(data: {
    type: string;
    resourceName: string;
    date: string;
    timeSlot: string;
    notes?: string;
    customFieldValues?: Record<string, any>;
  }) {
    return this.fetchWithAuth('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async approveBooking(id: string, note?: string) {
    return this.fetchWithAuth(`/bookings/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    });
  },

  async rejectBooking(id: string, note: string) {
    return this.fetchWithAuth(`/bookings/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    });
  },

  async updateBooking(id: string, data: any) {
    return this.fetchWithAuth(`/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async cancelBooking(id: string, note?: string) {
    return this.fetchWithAuth(`/bookings/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ note }),
    });
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

  // Public mirror of the "website." settings namespace — no auth required,
  // used by the public Navbar/Footer to reflect admin configuration live.
  async getPublicWebsiteSettings(): Promise<Record<string, any>> {
    return this.fetchWithAuth('/public-settings/website');
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
  async getCollection(id: string) {
    return this.fetchWithAuth(`/collections/${id}`);
  },
  async addRecordToCollection(collectionId: string, recordId: string) {
    return this.fetchWithAuth(`/collections/${collectionId}/records/${recordId}`, { method: 'POST' });
  },
  async removeRecordFromCollection(collectionId: string, recordId: string) {
    return this.fetchWithAuth(`/collections/${collectionId}/records/${recordId}`, { method: 'DELETE' });
  },

  // Serials / Subscriptions (Koha-style)
  async getSerials(params?: { q?: string; status?: string; vendorId?: string }) {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.status) query.append('status', params.status);
    if (params?.vendorId) query.append('vendorId', params.vendorId);
    const qs = query.toString();
    return this.fetchWithAuth(`/serials${qs ? `?${qs}` : ''}`);
  },
  async getSerial(id: string) {
    return this.fetchWithAuth(`/serials/${id}`);
  },
  async createSerial(data: {
    title: string;
    shelfmark?: string;
    frequency?: string;
    periodicityCode?: string;
    numberingPattern?: string;
    publisher?: string;
    notes?: string;
    bibRecordId?: string;
    vendorId?: string;
    libraryId?: string;
    locationCode?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    cost?: number;
    currency?: string;
    renewalNote?: string;
  }) {
    return this.fetchWithAuth('/serials', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateSerial(id: string, data: any) {
    return this.fetchWithAuth(`/serials/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  async deleteSerial(id: string) {
    return this.fetchWithAuth(`/serials/${id}`, { method: 'DELETE' });
  },
  async getSerialHistory(id: string) {
    return this.fetchWithAuth(`/serials/${id}/history`);
  },
  async addSerialIssue(
    id: string,
    data: { issueLabel: string; volume?: string; number?: string; publicationDate?: string; expectedDate?: string; isSupplement?: boolean; isIndex?: boolean; bindingNote?: string },
  ) {
    return this.fetchWithAuth(`/serials/${id}/issues`, { method: 'POST', body: JSON.stringify(data) });
  },
  async updateSerialIssue(issueId: string, data: any) {
    return this.fetchWithAuth(`/serials/issues/${issueId}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  async predictSerialIssues(id: string, count?: number) {
    return this.fetchWithAuth(`/serials/${id}/predict`, { method: 'POST', body: JSON.stringify(count ? { count } : {}) });
  },
  async checkInSerialIssue(issueId: string, data?: { receivedDate?: string; volume?: string; number?: string; bindingNote?: string }) {
    return this.fetchWithAuth(`/serials/issues/${issueId}/check-in`, { method: 'PATCH', body: JSON.stringify(data || {}) });
  },
  async markSerialIssueMissing(issueId: string) {
    return this.fetchWithAuth(`/serials/issues/${issueId}/missing`, { method: 'PATCH' });
  },
  async setSerialIssueStatus(issueId: string, status: 'MISSING' | 'LATE') {
    return this.fetchWithAuth(`/serials/issues/${issueId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },
  async getSerialClaimCandidates(daysOverdue?: number) {
    const query = daysOverdue !== undefined ? `?daysOverdue=${daysOverdue}` : '';
    return this.fetchWithAuth(`/serials/claims/candidates${query}`);
  },
  async createSerialClaim(issueId: string, notes?: string) {
    return this.fetchWithAuth(`/serials/issues/${issueId}/claim`, { method: 'POST', body: JSON.stringify({ notes }) });
  },
  async updateSerialClaim(claimId: string, data: { status: 'RESPONDED' | 'RESOLVED'; notes?: string }) {
    return this.fetchWithAuth(`/serials/claims/${claimId}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  async getSerialIssueClaims(issueId: string) {
    return this.fetchWithAuth(`/serials/issues/${issueId}/claims`);
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
  // `folder` optionally selects a Cloudinary sub-folder (see CloudinaryService.resolveFolder
  // on the API: 'catalogCovers' | 'catalogItems' | 'avatars' | 'storiesNews' | 'events' |
  // 'opportunities' | 'misc'); omit to default to 'misc'.
  async uploadImage(file: File, folder?: string): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    return this.fetchFormData('/uploads/image', formData);
  },

  // Looks up a cover image for an ISBN (Google Books -> Open Library -> Amazon) and stores
  // it in Cloudinary, returning its URL. `found: false` means no cover was located anywhere.
  async fetchCoverByIsbn(isbn: string): Promise<{ found: true; url: string; source: string } | { found: false }> {
    return this.fetchWithAuth('/media/fetch-cover-by-isbn', {
      method: 'POST',
      body: JSON.stringify({ isbn }),
    });
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
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/registrations/files/${fileId}`, {
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

  // MARC Frameworks
  async getMarcFrameworks() {
    return this.fetchWithAuth('/marc-frameworks');
  },
  async getMarcFramework(code: string) {
    return this.fetchWithAuth(`/marc-frameworks/${encodeURIComponent(code)}`);
  },
  async createMarcFramework(data: { code: string; description: string; materialType?: string; isDefault?: boolean }) {
    return this.fetchWithAuth('/marc-frameworks', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateMarcFramework(code: string, data: any) {
    return this.fetchWithAuth(`/marc-frameworks/${encodeURIComponent(code)}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  async deleteMarcFramework(code: string) {
    return this.fetchWithAuth(`/marc-frameworks/${encodeURIComponent(code)}`, { method: 'DELETE' });
  },
  async addMarcFrameworkField(code: string, data: any) {
    return this.fetchWithAuth(`/marc-frameworks/${encodeURIComponent(code)}/fields`, { method: 'POST', body: JSON.stringify(data) });
  },
  async updateMarcFrameworkField(fieldId: string, data: any) {
    return this.fetchWithAuth(`/marc-frameworks/fields/${fieldId}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  async removeMarcFrameworkField(fieldId: string) {
    return this.fetchWithAuth(`/marc-frameworks/fields/${fieldId}`, { method: 'DELETE' });
  },
  async reorderMarcFrameworkFields(code: string, order: { id: string; sortOrder: number }[]) {
    return this.fetchWithAuth(`/marc-frameworks/${encodeURIComponent(code)}/fields/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ order }),
    });
  },
  async validateMarcFields(frameworkCode: string, entries: { tag: string; subfield?: string; value?: string }[]) {
    return this.fetchWithAuth('/marc-frameworks/validate', {
      method: 'POST',
      body: JSON.stringify({ frameworkCode, entries }),
    });
  },

  // Authorities
  async searchAuthorities(q?: string, headingType?: string) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (headingType) params.set('headingType', headingType);
    const qs = params.toString();
    return this.fetchWithAuth(`/authorities/search${qs ? `?${qs}` : ''}`);
  },
  async getAuthority(id: string) {
    return this.fetchWithAuth(`/authorities/${id}`);
  },
  async getAuthorityUsage(id: string) {
    return this.fetchWithAuth(`/authorities/${id}/usage`);
  },
  // Returns { duplicate: true, existing } on a 409 possible-duplicate response
  // instead of throwing, so the caller can surface the duplicate-warning flow.
  async createAuthority(data: {
    headingType: string;
    heading: string;
    seeAlso?: string[];
    notes?: string;
    marcXml?: string;
    force?: boolean;
  }): Promise<{ duplicate: false; record: any } | { duplicate: true; existing: any }> {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = getCookie('kmlri_token') || localStorage.getItem('kmlri_token');
    }
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/authorities`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    const body = await response.json();
    if (response.status === 409 && body.possibleDuplicate) {
      return { duplicate: true, existing: body.possibleDuplicate };
    }
    if (!response.ok) {
      throw new Error(body.message || 'Could not create the authority record.');
    }
    return { duplicate: false, record: body };
  },
  async updateAuthority(id: string, data: any) {
    return this.fetchWithAuth(`/authorities/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  async deleteAuthority(id: string) {
    return this.fetchWithAuth(`/authorities/${id}`, { method: 'DELETE' });
  },
  async linkAuthorityHeading(data: { bibRecordId: string; authorityId: string; tag: string; subfield?: string }) {
    return this.fetchWithAuth('/authorities/link', { method: 'POST', body: JSON.stringify(data) });
  },
  async unlinkAuthorityHeading(id: string) {
    return this.fetchWithAuth(`/authorities/link/${id}`, { method: 'DELETE' });
  },

  // Libraries (branches)
  async getLibraries() {
    return this.fetchWithAuth('/libraries');
  },
  async createLibrary(data: { code: string; name: string; address?: string; phone?: string; email?: string; isActive?: boolean }) {
    return this.fetchWithAuth('/libraries', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateLibrary(id: string, data: any) {
    return this.fetchWithAuth(`/libraries/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  async deleteLibrary(id: string) {
    return this.fetchWithAuth(`/libraries/${id}`, { method: 'DELETE' });
  },

  // Item Types
  async getItemTypes() {
    return this.fetchWithAuth('/item-types');
  },
  async createItemType(data: { code: string; description: string; isSerial?: boolean; loanDurationDays?: number }) {
    return this.fetchWithAuth('/item-types', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateItemType(id: string, data: any) {
    return this.fetchWithAuth(`/item-types/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  async deleteItemType(id: string) {
    return this.fetchWithAuth(`/item-types/${id}`, { method: 'DELETE' });
  },

  // Authorised Values
  async getAuthorisedValueCategories() {
    return this.fetchWithAuth('/authorised-values/categories');
  },
  async createAuthorisedValueCategory(data: { category: string; description?: string }) {
    return this.fetchWithAuth('/authorised-values/categories', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateAuthorisedValueCategory(id: string, data: any) {
    return this.fetchWithAuth(`/authorised-values/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  async deleteAuthorisedValueCategory(id: string) {
    return this.fetchWithAuth(`/authorised-values/categories/${id}`, { method: 'DELETE' });
  },
  async getAuthorisedValues(category: string) {
    return this.fetchWithAuth(`/authorised-values/${encodeURIComponent(category)}`);
  },
  async createAuthorisedValue(categoryId: string, data: { code: string; description: string; sortOrder?: number }) {
    return this.fetchWithAuth(`/authorised-values/categories/${categoryId}/values`, { method: 'POST', body: JSON.stringify(data) });
  },
  async updateAuthorisedValue(id: string, data: any) {
    return this.fetchWithAuth(`/authorised-values/values/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  async deleteAuthorisedValue(id: string) {
    return this.fetchWithAuth(`/authorised-values/values/${id}`, { method: 'DELETE' });
  },
};
