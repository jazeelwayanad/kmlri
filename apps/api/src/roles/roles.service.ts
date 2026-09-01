import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const SYSTEM_PERMISSIONS = [
  { key: 'ADMIN_ACCESS', label: 'Admin Portal Access', category: 'General', desc: 'Sign in to and view the Librarian & Admin Console' },
  { key: 'CIRCULATION_VIEW', label: 'View Circulation Loans', category: 'Circulation', desc: 'Inspect checked out books, due dates, and patron history' },
  { key: 'CIRCULATION_ISSUE', label: 'Issue Books (Check-Out)', category: 'Circulation', desc: 'Scan and issue catalog items to patrons' },
  { key: 'CIRCULATION_RETURN', label: 'Return Books (Check-In)', category: 'Circulation', desc: 'Process book returns and calculate late fines' },
  { key: 'CIRCULATION_FINES', label: 'Settle / Waive Fines', category: 'Circulation', desc: 'Collect cash or waive overdue patron fines' },
  { key: 'CATALOG_VIEW', label: 'View Catalog Items', category: 'Catalog', desc: 'Search and inspect repository items and shelf locations' },
  { key: 'CATALOG_CREATE', label: 'Create Bibliographic Records', category: 'Catalog', desc: 'Add new Dublin Core & MARC21 bibliographic entries' },
  { key: 'CATALOG_EDIT', label: 'Edit Records & Metadata', category: 'Catalog', desc: 'Update titles, extent, transliterations, and physical descriptions' },
  { key: 'CATALOG_DELETE', label: 'Delete Records', category: 'Catalog', desc: 'Permanently remove or archive bibliographic entries' },
  { key: 'CATALOG_PRINT_BARCODES', label: 'Generate & Print Barcodes', category: 'Catalog', desc: 'Create item copies and generate printable barcode labels' },
  { key: 'USERS_VIEW', label: 'View Patron Registry', category: 'Users & Staff', desc: 'Browse registered members, students, and research fellows' },
  { key: 'USERS_EDIT', label: 'Edit Member Details', category: 'Users & Staff', desc: 'Update patron status, borrow quotas, and contact info' },
  { key: 'ROLES_MANAGE', label: 'Manage Roles & Permissions', category: 'Users & Staff', desc: 'Create custom roles, edit clearances, and assign permissions' },
  { key: 'REPORTS_VIEW', label: 'View Operational Reports', category: 'Reports & Audits', desc: 'Inspect circulation KPIs, overdue lists, and usage trends' },
  { key: 'REPORTS_EXPORT', label: 'Export Data (CSV / Audit)', category: 'Reports & Audits', desc: 'Export academic audit and transaction ledgers to CSV' },
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
