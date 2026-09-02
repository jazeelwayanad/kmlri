import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Marks a route (or an entire controller) as requiring one or more granular
 * SYSTEM_PERMISSIONS keys (see apps/api/src/roles/roles.service.ts). Must be
 * combined with @UseGuards(JwtAuthGuard, PermissionsGuard) — it only supplies
 * the metadata the guard reads.
 */
export const RequirePermissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);
