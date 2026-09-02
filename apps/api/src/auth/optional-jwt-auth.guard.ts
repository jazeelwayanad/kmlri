import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Never blocks the request: attaches req.user when a valid token is present,
  // but proceeds as an anonymous request otherwise (used for public submissions
  // that optionally associate a logged-in member).
  handleRequest(err: any, user: any) {
    return user || null;
  }
}
