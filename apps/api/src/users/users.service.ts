import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: string) {
    const where: any = {};
    if (query) {
      where.OR = [
        { fullName: { contains: query } },
        { email: { contains: query } },
        { membershipNumber: { contains: query } },
        { phone: { contains: query } },
      ];
    }
    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        membershipNumber: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        roleId: true,
        roleRel: {
          select: {
            id: true,
            name: true,
            slug: true,
            permissions: true,
          },
        },
        status: true,
        permissions: true,
        maxBorrowLimit: true,
        createdAt: true,
        _count: {
          select: {
            loans: { where: { status: 'ACTIVE' } },
            reservations: { where: { status: 'PENDING' } },
            fines: { where: { status: 'UNPAID' } },
          },
        },
      },
    });

    return users.map((u) => {
      let rolePerms: string[] = [];
      let customPerms: string[] = [];
      try {
        if (u.roleRel?.permissions) rolePerms = JSON.parse(u.roleRel.permissions);
      } catch {}
      try {
        if (u.permissions) customPerms = JSON.parse(u.permissions);
      } catch {}

      const effectivePermissions = Array.from(new Set([...rolePerms, ...customPerms]));

      return {
        ...u,
        effectivePermissions,
      };
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roleRel: true,
        loans: {
          include: { copy: { include: { bibRecord: true } } },
          orderBy: { createdAt: 'desc' },
        },
        reservations: {
          include: { bibRecord: true },
          orderBy: { createdAt: 'desc' },
        },
        fines: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...safe } = user;
    return safe;
  }

  async updateRoleOrStatus(
    id: string,
    data: { role?: string; roleId?: string; status?: string; maxBorrowLimit?: number; permissions?: string },
  ) {
    const updateData: any = { ...data };

    // If roleId provided, fetch role to sync role slug
    if (data.roleId) {
      const role = await this.prisma.role.findUnique({ where: { id: data.roleId } });
      if (role) {
        updateData.role = role.slug;
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        membershipNumber: true,
        role: true,
        roleId: true,
        roleRel: true,
        status: true,
        permissions: true,
        maxBorrowLimit: true,
      },
    });
  }
}
