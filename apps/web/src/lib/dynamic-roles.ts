'use client';

export interface DynamicRole {
  id: string;
  name: string;
  slug: string;
  description: string;
  isSystem: boolean; // Only true for super-admin
  permissions: string[];
  defaultDays: number;
  maxQuota: number;
  gracePeriodDays: number;
  memberCount?: number;
}

export const INITIAL_DYNAMIC_ROLES: DynamicRole[] = [
  {
    id: 'role-super-admin',
    name: 'Super Administrator',
    slug: 'super-admin',
    description: 'Unrestricted master clearance with full root administrative capabilities over all library modules, security parameters, and data partitions.',
    isSystem: true, // Only Super Admin is the default system role
    permissions: ['*'],
    defaultDays: 60,
    maxQuota: 20,
    gracePeriodDays: 7,
    memberCount: 2,
  },
  {
    id: 'role-faculty',
    name: 'Faculty & Professors',
    slug: 'faculty',
    description: 'Academic teaching staff and senior faculty with semester-long circulation and specialized vault consultation clearances.',
    isSystem: false,
    permissions: ['CATALOG_READ', 'CIRCULATION_CHECKOUT', 'HOLD_PLACE', 'RESERVATION_CREATE'],
    defaultDays: 30,
    maxQuota: 12,
    gracePeriodDays: 3,
    memberCount: 14,
  },
  {
    id: 'role-researcher',
    name: 'Research Fellows',
    slug: 'researcher',
    description: 'Postdoctoral scholars, Visiting Fellows, and archival researchers with extended borrow limits and digital access.',
    isSystem: false,
    permissions: ['CATALOG_READ', 'CIRCULATION_CHECKOUT', 'HOLD_PLACE', 'DIGITAL_VIEW'],
    defaultDays: 21,
    maxQuota: 8,
    gracePeriodDays: 2,
    memberCount: 28,
  },
  {
    id: 'role-student',
    name: 'Student Patron',
    slug: 'student',
    description: 'Enrolled undergraduate and postgraduate students with standard circulation and digital reading privileges.',
    isSystem: false,
    permissions: ['CATALOG_READ', 'CIRCULATION_CHECKOUT', 'HOLD_PLACE'],
    defaultDays: 14,
    maxQuota: 5,
    gracePeriodDays: 1,
    memberCount: 142,
  },
  {
    id: 'role-librarian',
    name: 'Librarian & Circulation Desk',
    slug: 'librarian',
    description: 'Library staff authorized to execute check-ins, check-outs, hold fulfillment, and cataloging intake.',
    isSystem: false,
    permissions: ['CATALOG_WRITE', 'CIRCULATION_CHECKOUT', 'CIRCULATION_CHECKIN', 'FINES_MANAGE'],
    defaultDays: 30,
    maxQuota: 10,
    gracePeriodDays: 3,
    memberCount: 6,
  },
  {
    id: 'role-staff',
    name: 'Institutional Staff',
    slug: 'staff',
    description: 'Administrative and operational staff of KMLRI with internal circulation quotas.',
    isSystem: false,
    permissions: ['CATALOG_READ', 'CIRCULATION_CHECKOUT', 'HOLD_PLACE'],
    defaultDays: 30,
    maxQuota: 6,
    gracePeriodDays: 2,
    memberCount: 18,
  },
];

const STORAGE_KEY = 'kmlri_dynamic_roles_v2';

export function getDynamicRoles(): DynamicRole[] {
  if (typeof window === 'undefined') return INITIAL_DYNAMIC_ROLES;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DYNAMIC_ROLES));
      return INITIAL_DYNAMIC_ROLES;
    }
    const parsed = JSON.parse(data);
    // Ensure Super Admin is always enforced as the ONLY system role
    return parsed.map((r: DynamicRole) => ({
      ...r,
      isSystem: r.slug === 'super-admin',
    }));
  } catch {
    return INITIAL_DYNAMIC_ROLES;
  }
}

export function saveDynamicRoles(roles: DynamicRole[]): void {
  if (typeof window === 'undefined') return;
  try {
    const sanitized = roles.map((r) => ({
      ...r,
      isSystem: r.slug === 'super-admin',
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(new Event('kmlri_roles_updated'));
  } catch (e) {
    console.error('Could not save dynamic roles to storage', e);
  }
}
