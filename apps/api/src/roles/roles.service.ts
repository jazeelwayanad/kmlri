import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const SYSTEM_PERMISSIONS = [
  // General
  { key: 'ADMIN_ACCESS', label: 'Admin Portal Access', category: 'General', desc: 'Sign in to and view the Librarian & Admin Console' },

  // Circulation
  { key: 'CIRCULATION_VIEW', label: 'View Circulation Loans', category: 'Circulation', desc: 'Inspect checked out books, due dates, and patron history' },
  { key: 'CIRCULATION_ISSUE', label: 'Issue Books (Check-Out)', category: 'Circulation', desc: 'Scan and issue catalog items to patrons' },
  { key: 'CIRCULATION_RETURN', label: 'Return Books (Check-In)', category: 'Circulation', desc: 'Process book returns and calculate late fines' },
  { key: 'CIRCULATION_FINES', label: 'Settle / Waive Fines', category: 'Circulation', desc: 'Collect cash or waive overdue patron fines' },
  { key: 'CIRCULATION_HOLDS_MANAGE', label: 'Manage Holds & Reservations Queue', category: 'Circulation', desc: 'Mark holds ready, cancel, and fulfil reservation queues' },

  // Catalogue & Collections
  { key: 'CATALOG_VIEW', label: 'View Catalog Items', category: 'Catalogue', desc: 'Search and inspect repository items and shelf locations' },
  { key: 'CATALOG_CREATE', label: 'Create Bibliographic Records', category: 'Catalogue', desc: 'Add new Dublin Core & MARC21 bibliographic entries' },
  { key: 'CATALOG_EDIT', label: 'Edit Records & Metadata', category: 'Catalogue', desc: 'Update titles, extent, transliterations, and physical descriptions' },
  { key: 'CATALOG_DELETE', label: 'Delete Records', category: 'Catalogue', desc: 'Permanently remove or archive bibliographic entries' },
  { key: 'CATALOG_PRINT_BARCODES', label: 'Generate & Print Barcodes', category: 'Catalogue', desc: 'Create item copies and generate printable barcode labels' },
  { key: 'COLLECTIONS_MANAGE', label: 'Manage Curated Collections', category: 'Catalogue', desc: 'Create collections and assign catalogue records to them' },
  { key: 'SERIALS_MANAGE', label: 'Manage Serials & Periodicals', category: 'Catalogue', desc: 'Track serial subscriptions and issue check-in' },

  // Digital Library
  { key: 'DIGITAL_VIEW', label: 'View Digital Library', category: 'Digital Library', desc: 'Browse and read digitised manuscripts and IIIF manifests' },
  { key: 'DIGITAL_MANAGE', label: 'Upload & Manage Digital Assets', category: 'Digital Library', desc: 'Upload scans, manage digitisation metadata, and access tiers' },

  // Members & Users
  { key: 'USERS_VIEW', label: 'View Patron Registry', category: 'Members & Users', desc: 'Browse registered members, students, and research fellows' },
  { key: 'USERS_EDIT', label: 'Edit Member Details', category: 'Members & Users', desc: 'Update patron status, borrow quotas, and contact info' },
  { key: 'MEMBERSHIP_TYPES_MANAGE', label: 'Manage Membership Types', category: 'Members & Users', desc: 'Configure borrow limits and loan durations per membership tier' },
  { key: 'ROLES_MANAGE', label: 'Manage Roles & Permissions', category: 'Members & Users', desc: 'Create custom roles, edit clearances, and assign permissions' },

  // Website Management
  { key: 'WEBSITE_NEWS_MANAGE', label: 'Manage News Articles', category: 'Website Management', desc: 'Publish, edit, and remove news posts' },
  { key: 'WEBSITE_STORIES_MANAGE', label: 'Manage Stories', category: 'Website Management', desc: 'Publish, edit, and remove featured stories' },
  { key: 'WEBSITE_EVENTS_MANAGE', label: 'Manage Events', category: 'Website Management', desc: 'Publish events and configure registration forms' },
  { key: 'WEBSITE_OPPORTUNITIES_MANAGE', label: 'Manage Opportunities', category: 'Website Management', desc: 'Publish fellowships/opportunities and manage applications' },
  { key: 'WEBSITE_REGISTRATIONS_VIEW', label: 'View Event & Opportunity Registrations', category: 'Website Management', desc: 'View and export submitted registrations and applications' },
  { key: 'WEBSITE_CONFIGURATION_MANAGE', label: 'Manage Website Configuration', category: 'Website Management', desc: 'Edit homepage, navigation, footer, and site-wide settings' },

  // Support & Services
  { key: 'REFERENCE_QUESTIONS_MANAGE', label: 'Answer Reference Questions', category: 'Support & Services', desc: 'Respond to patron reference and research queries' },
  { key: 'REPRODUCTION_REQUESTS_MANAGE', label: 'Process Reproduction Requests', category: 'Support & Services', desc: 'Approve and fulfil scan/photocopy reproduction requests' },
  { key: 'REPOSITORY_SUBMISSIONS_MANAGE', label: 'Review Repository Submissions', category: 'Support & Services', desc: 'Review and approve patron-submitted repository deposits' },
  { key: 'ACQUISITIONS_MANAGE', label: 'Manage Acquisitions', category: 'Support & Services', desc: 'Process purchase/acquisition requests and vendor orders' },

  // System Administration
  { key: 'SETTINGS_MANAGE', label: 'Manage System Settings', category: 'System Administration', desc: 'Edit institutional and system-wide configuration' },
  { key: 'ASSETS_MANAGE', label: 'Manage Assets & Inventory', category: 'System Administration', desc: 'Track equipment, maintenance, and asset audits' },
  { key: 'VENDORS_MANAGE', label: 'Manage Vendors', category: 'System Administration', desc: 'Maintain the vendor and supplier registry' },
  { key: 'DEPARTMENTS_MANAGE', label: 'Manage Departments', category: 'System Administration', desc: 'Maintain the institutional department registry' },
  { key: 'NOTIFICATIONS_MANAGE', label: 'Broadcast Notifications', category: 'System Administration', desc: 'Send system notifications to staff and patrons' },
  { key: 'AUDIT_VIEW', label: 'View Audit Logs', category: 'System Administration', desc: 'Inspect the system-wide audit trail of actions' },

  // Reports & Audits
  { key: 'REPORTS_VIEW', label: 'View Operational Reports', category: 'Reports & Audits', desc: 'Inspect circulation KPIs, overdue lists, and usage trends' },
  { key: 'REPORTS_EXPORT', label: 'Export Data (CSV / Audit)', category: 'Reports & Audits', desc: 'Export academic audit and transaction ledgers to CSV' },

  // Client / Member-side capabilities
  { key: 'MEMBER_HOLD_PLACE', label: 'Place Holds & Reservations', category: 'Member (Client-side)', desc: 'Reserve physical holding copies from the member portal' },
  { key: 'MEMBER_DIGITAL_ACCESS', label: 'Access Digital Reading Room', category: 'Member (Client-side)', desc: 'Read digitised manuscripts within the member portal' },
  { key: 'MEMBER_REFERENCE_QUESTION_SUBMIT', label: 'Submit Reference Questions', category: 'Member (Client-side)', desc: 'Ask the reference desk a research question' },
  { key: 'MEMBER_REPRODUCTION_REQUEST_SUBMIT', label: 'Request Reproductions', category: 'Member (Client-side)', desc: 'Request scans or photocopies of catalogue items' },
  { key: 'MEMBER_REPOSITORY_SUBMISSION_SUBMIT', label: 'Submit to Repository', category: 'Member (Client-side)', desc: 'Deposit works into the institutional repository' },
  { key: 'MEMBER_ACQUISITION_REQUEST_SUBMIT', label: 'Suggest Acquisitions', category: 'Member (Client-side)', desc: 'Recommend new titles for the library to acquire' },
  { key: 'MEMBER_EVENT_REGISTER', label: 'Register for Events & Opportunities', category: 'Member (Client-side)', desc: 'Sign up for public events and apply to opportunities' },
  { key: 'MEMBER_READING_LIST_MANAGE', label: 'Manage Reading Lists', category: 'Member (Client-side)', desc: 'Create and maintain personal reading lists' },
  { key: 'MEMBER_SAVED_SEARCH_MANAGE', label: 'Manage Saved Searches', category: 'Member (Client-side)', desc: 'Save and re-run catalogue search queries' },
];

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async getAvailablePermissions() {
    return SYSTEM_PERMISSIONS;
  }

  async findAll() {
    const roles = await this.prisma.role.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return roles.map((r) => {
      let perms: string[] = [];
      try {
        perms = JSON.parse(r.permissions);
      } catch {
        perms = [];
      }
      return {
        ...r,
        permissionsList: perms,
        memberCount: r._count.users,
      };
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
            membershipNumber: true,
            status: true,
          },
        },
      },
    });
    if (!role) throw new NotFoundException('Role not found');

    let perms: string[] = [];
    try {
      perms = JSON.parse(role.permissions);
    } catch {
      perms = [];
    }

    return {
      ...role,
      permissionsList: perms,
    };
  }

  async create(data: { name: string; slug?: string; description?: string; permissions: string[] }) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = await this.prisma.role.findFirst({
      where: { OR: [{ name: data.name }, { slug }] },
    });
    if (existing) {
      throw new BadRequestException('A role with this name or slug already exists');
    }

    return this.prisma.role.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        isSystem: false,
        permissions: JSON.stringify(data.permissions || []),
      },
    });
  }

  async update(id: string, data: { name?: string; description?: string; permissions?: string[] }) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');

    const updatePayload: any = {};
    if (data.name) updatePayload.name = data.name;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.permissions) updatePayload.permissions = JSON.stringify(data.permissions);

    return this.prisma.role.update({
      where: { id },
      data: updatePayload,
    });
  }

  async delete(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem) {
      throw new BadRequestException('System protected roles cannot be deleted');
    }
    if (role._count.users > 0) {
      throw new BadRequestException(`Cannot delete role with ${role._count.users} active members. Reassign members first.`);
    }

    return this.prisma.role.delete({ where: { id } });
  }
}
