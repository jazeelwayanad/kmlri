import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: string) {
    const where: any = {};
    if (query) {
      where.OR = [
        { fullName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { username: { contains: query, mode: 'insensitive' } },
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
        username: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        address: true,
        institution: true,
        gender: true,
        researchInterest: true,
        guarantorId: true,
        relationship: true,
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
            relatives: true,
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

  async findOne(idOrMembershipNumber: string) {
    const include = {
      roleRel: true,
      guarantor: {
        select: {
          id: true,
          fullName: true,
          membershipNumber: true,
          email: true,
          phone: true,
          avatarUrl: true,
          role: true,
          status: true,
        },
      },
      relatives: {
        select: {
          id: true,
          fullName: true,
          username: true,
          membershipNumber: true,
          relationship: true,
          email: true,
          phone: true,
          avatarUrl: true,
          role: true,
          status: true,
          maxBorrowLimit: true,
          _count: {
            select: {
              loans: { where: { status: 'ACTIVE' } },
              fines: { where: { status: 'UNPAID' } },
            },
          },
        },
      },
      loans: {
        include: { copy: { include: { bibRecord: true } } },
        orderBy: { createdAt: 'desc' as const },
      },
      reservations: {
        include: { bibRecord: true },
        orderBy: { createdAt: 'desc' as const },
      },
      fines: {
        include: { loan: { include: { copy: { include: { bibRecord: true } } } } },
        orderBy: { createdAt: 'desc' as const },
      },
    };

    let user = await this.prisma.user.findUnique({ where: { id: idOrMembershipNumber }, include });

    if (!user) {
      user = await this.prisma.user.findUnique({ where: { membershipNumber: idOrMembershipNumber }, include });
    }

    if (!user) {
      user = await this.prisma.user.findUnique({ where: { username: idOrMembershipNumber }, include });
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...safe } = user;
    return safe;
  }

  async updateRoleOrStatus(id: string, data: UpdateUserDto) {
    const updateData: any = { ...data };

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(data.password, salt);
      delete updateData.password;
    }

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
        username: true,
        email: true,
        phone: true,
        avatarUrl: true,
        address: true,
        institution: true,
        gender: true,
        researchInterest: true,
        guarantorId: true,
        relationship: true,
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

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: { select: { loans: true, fines: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user._count.loans > 0 || user._count.fines > 0) {
      throw new ConflictException(
        'This member has circulation history (loans or fines) and cannot be deleted. Suspend the account instead.',
      );
    }

    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }
}
