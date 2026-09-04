import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    let username = dto.username?.trim().toLowerCase();
    if (username) {
      username = username.replace(/[^a-z0-9_-]/g, '-').replace(/(^-|-$)/g, '');
      const existingUsername = await this.prisma.user.findUnique({
        where: { username },
      });
      if (existingUsername) {
        throw new ConflictException('This username is already taken. Please choose another.');
      }
    } else {
      const baseSlug = (dto.fullName || dto.email.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      let candidate = baseSlug || 'patron';
      let suffix = 1;
      while (await this.prisma.user.findUnique({ where: { username: candidate } })) {
        candidate = `${baseSlug}-${suffix}`;
        suffix++;
      }
      username = candidate;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // Find default role
    const defaultRole = await this.prisma.role.findFirst({
      where: { slug: dto.role?.toLowerCase() || 'student' },
    });

    const count = await this.prisma.user.count();
    const membershipNumber = dto.membershipNumber || `KMLRI-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const user = await this.prisma.user.create({
      data: {
        membershipNumber,
        email: dto.email.toLowerCase(),
        username,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        address: dto.address,
        institution: dto.institution,
        gender: dto.gender,
        researchInterest: dto.researchInterest,
        avatarUrl: dto.avatarUrl,
        guarantorId: dto.guarantorId,
        relationship: dto.relationship,
        role: defaultRole?.slug || dto.role || 'STUDENT',
        roleId: defaultRole?.id,
        status: 'ACTIVE',
        maxBorrowLimit: dto.maxBorrowLimit ? Number(dto.maxBorrowLimit) : (dto.role === 'FACULTY' || dto.role === 'RESEARCHER' ? 10 : 5),
      },
      select: {
        id: true,
        membershipNumber: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        address: true,
        institution: true,
        gender: true,
        researchInterest: true,
        guarantorId: true,
        relationship: true,
        designation: true,
        department: true,
        bio: true,
        orcid: true,
        researchLanguages: true,
        avatarUrl: true,
        role: true,
        roleId: true,
        roleRel: true,
        status: true,
        permissions: true,
        maxBorrowLimit: true,
        createdAt: true,
      },
    });

    const token = this.generateToken(user);

    return {
      user: this.computeEffectivePermissions(user),
      accessToken: token,
    };
  }

  async login(dto: LoginDto) {
    const identifier = dto.identifier.trim();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { membershipNumber: identifier },
          { username: identifier.toLowerCase() },
        ],
      },
      include: {
        roleRel: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid membership number, email or password.');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Your account is currently inactive or suspended. Please contact the librarian desk.');
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid membership number, email or password.');
    }

    const { passwordHash, ...userProfile } = user;
    const computedUser = this.computeEffectivePermissions(userProfile);
    const token = this.generateToken(computedUser);

    return {
      user: computedUser,
      accessToken: token,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        membershipNumber: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        address: true,
        institution: true,
        gender: true,
        researchInterest: true,
        designation: true,
        department: true,
        bio: true,
        orcid: true,
        researchLanguages: true,
        avatarUrl: true,
        role: true,
        roleId: true,
        roleRel: true,
        status: true,
        permissions: true,
        maxBorrowLimit: true,
        createdAt: true,
        loans: {
          where: { status: 'ACTIVE' },
          include: {
            copy: {
              include: { bibRecord: true },
            },
          },
        },
        reservations: {
          where: { status: { in: ['PENDING', 'READY_FOR_PICKUP'] } },
          include: { bibRecord: true },
        },
        fines: {
          where: { status: 'UNPAID' },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.computeEffectivePermissions(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isValidPassword = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new BadRequestException('Your current password is incorrect.');
    }

    if (await bcrypt.compare(dto.newPassword, user.passwordHash)) {
      throw new BadRequestException('New password must be different from the current password.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.newPassword, salt);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    return { success: true };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        membershipNumber: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        address: true,
        institution: true,
        gender: true,
        researchInterest: true,
        designation: true,
        department: true,
        bio: true,
        orcid: true,
        researchLanguages: true,
        avatarUrl: true,
        role: true,
        roleId: true,
        roleRel: true,
        status: true,
        permissions: true,
        maxBorrowLimit: true,
        createdAt: true,
      },
    });

    return this.computeEffectivePermissions(user);
  }

  private computeEffectivePermissions(user: any) {
    let rolePerms: string[] = [];
    let customPerms: string[] = [];
    try {
      if (user.roleRel?.permissions) rolePerms = JSON.parse(user.roleRel.permissions);
    } catch {}
    try {
      if (user.permissions) customPerms = JSON.parse(user.permissions);
    } catch {}

    const effectivePermissions = Array.from(new Set([...rolePerms, ...customPerms]));
    return {
      ...user,
      effectivePermissions,
    };
  }

  private generateToken(user: { id: string; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }
}
