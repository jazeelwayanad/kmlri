import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { PERMISSIONS_KEY } from './permissions.decorator';

// Mirrors the effective-permission resolution used client-side in
// apps/web/src/lib/auth-context.tsx (hasPermission): SUPER_ADMIN bypasses
// everything; otherwise the user's effective permission set is the union of
// their role's `permissions` JSON array and their own per-user `permissions`
// override JSON array. Defensive about malformed JSON, same spirit as
// CatalogService's safeJsonParse helper.
function safeParsePermissionsArray(val: string | null | undefined): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed.filter((p): p is string => typeof p === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Real granular-permission enforcement, stacked alongside (not replacing)
 * RolesGuard. RolesGuard only checks the coarse user.role against a
 * hardcoded @Roles(...) list; this guard checks the fine-grained
 * SYSTEM_PERMISSIONS keys declared via @RequirePermissions(...), sourced
 * from Role.permissions / User.permissions.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user?.id) {
      throw new ForbiddenException('User is not authenticated');
    }

    // SUPER_ADMIN has access to everything, same as RolesGuard.
    if (user.role === 'SUPER_ADMIN' || user.role === 'super-admin') {
      return true;
    }

    // One lightweight query per request to load the user's role + override permissions.
    const record = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        permissions: true,
        roleRel: { select: { permissions: true } },
      },
    });

    const rolePerms = safeParsePermissionsArray(record?.roleRel?.permissions);
    const userPerms = safeParsePermissionsArray(record?.permissions);
    const effective = new Set([...rolePerms, ...userPerms]);

    const hasAll = requiredPermissions.every((perm) => effective.has(perm));
    if (!hasAll) {
      throw new ForbiddenException(
        `Access denied. Missing required permission(s): ${requiredPermissions.join(', ')}`,
      );
    }
    return true;
  }
}
