import { SessionRepository } from '../../../database/repositories/session.repository';
import { UserRepository } from '../../../database/repositories/user.repository';
import { ApplicationSession, BranchSettings } from '../../../shared/types/entities.types';
import { UserRole, MembershipStatus } from '../../../shared/enums/roles.enum';
import { VerifyPinInput } from '../../../shared/types/auth.types';
import { verifyPin } from './pin-hasher';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../../errors/app-error';
import { D1DatabaseLike } from '../../../database/types';

const SESSION_SIGNING_SECRET =
  process.env.SESSION_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  'melt-icecream-secure-session-signing-secret-2025';

function toBase64Url(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(b64: string): string {
  const base64 = b64.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + '='.repeat(padLen === 4 ? 0 : padLen);
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(padded, 'base64').toString('utf-8');
  }
  return decodeURIComponent(escape(atob(padded)));
}

async function signWithHmac(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyHmac(data: string, signatureHex: string, secret: string): Promise<boolean> {
  const expectedHex = await signWithHmac(data, secret);
  return expectedHex === signatureHex;
}

export class SessionService {
  constructor(
    private sessionRepo: SessionRepository,
    private userRepo: UserRepository,
    private db: D1DatabaseLike,
  ) {}

  /**
   * Hashes a session token for secure database storage.
   */
  private async hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Computes timeout in milliseconds based on branch settings or defaults.
   */
  private async getSessionDurationMs(branchId?: string | null): Promise<number> {
    const DEFAULT_HOURS = 8;
    if (!branchId) {
      return DEFAULT_HOURS * 60 * 60 * 1000;
    }

    const settings = await this.db
      .prepare('SELECT * FROM branch_settings WHERE branch_id = ?')
      .bind(branchId)
      .first<BranchSettings>();

    if (!settings) {
      return DEFAULT_HOURS * 60 * 60 * 1000;
    }

    const val = settings.session_timeout_value;
    const unit = (settings.session_timeout_unit ?? 'HOURS').toUpperCase();

    if (unit === 'MINUTES') {
      return val * 60 * 1000;
    }
    if (unit === 'DAYS') {
      return val * 24 * 60 * 60 * 1000;
    }
    // Default HOURS
    return val * 60 * 60 * 1000;
  }

  /**
   * Verifies PIN and creates a time-bounded application session.
   */
  async verifyPinAndCreateSession(input: VerifyPinInput): Promise<{
    session: ApplicationSession;
    sessionToken: string;
  }> {
    const user = await this.userRepo.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isOwner = user.role === UserRole.OWNER;
    const memberships = await this.userRepo.getMemberships(user.id);
    const hasOperatorMembership = memberships.some(
      (m) => m.role === UserRole.BRANCH_OPERATOR && m.status === MembershipStatus.ACTIVE,
    );

    // 1. Role validation: PIN is strictly for OWNER and users with active BRANCH_OPERATOR memberships
    if (!isOwner && !hasOperatorMembership) {
      throw new ForbiddenError('Customers cannot create application sessions');
    }

    // 2. Status validation: account must be ACTIVE
    if (user.status !== 'ACTIVE') {
      throw new ForbiddenError('User account is inactive or suspended');
    }

    // 3. Brute-force lockout check
    if (user.pin_locked_until && new Date(user.pin_locked_until) > new Date()) {
      throw new UnauthorizedError('Account PIN is temporarily locked due to repeated failed attempts. Please retry later.');
    }

    // 4. Check user has configured a PIN
    if (!user.pin_hash) {
      throw new UnauthorizedError('User has no PIN configured');
    }

    // 5. Verify PIN cryptographically
    const isPinValid = await verifyPin(input.pin, user.pin_hash);
    if (!isPinValid) {
      const lockStatus = await this.userRepo.recordFailedPinAttempt(user.id);
      if (lockStatus.isLocked) {
        throw new UnauthorizedError('Account PIN is now temporarily locked for 5 minutes due to 5 consecutive failed attempts.');
      }
      throw new UnauthorizedError('Invalid PIN');
    }

    // Reset lockout on successful PIN verification
    await this.userRepo.resetPinLockout(user.id);

    const scope = input.scope ?? (isOwner && !input.branchId ? 'GLOBAL' : 'BRANCH');

    // 3. For BRANCH scope, verify operator membership or owner access
    let targetBranchId: string | null = null;
    if (scope === 'BRANCH') {
      if (!input.branchId) {
        throw new ForbiddenError('branchId is required for branch-scoped session');
      }
      targetBranchId = input.branchId;

      if (!isOwner) {
        const membership = await this.userRepo.getActiveMembership(user.id, targetBranchId);
        if (!membership) {
          throw new ForbiddenError('User has no active membership for the specified branch');
        }
      }
    } else {
      // GLOBAL scope is reserved for OWNER
      if (!isOwner) {
        throw new ForbiddenError('Global scope is reserved for Owners only');
      }
    }

    // 4. Calculate session timeout
    const now = new Date();
    const durationMs = await this.getSessionDurationMs(targetBranchId);
    const expiresAt = new Date(now.getTime() + durationMs).toISOString();

    // 5. Generate secure signed session token with encoded claims
    const sessionId = `ses_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const payload = {
      id: sessionId,
      uid: user.id,
      bid: targetBranchId,
      scp: scope,
      aat: now.toISOString(),
      pat: now.toISOString(),
      exp: expiresAt,
    };
    const b64Payload = toBase64Url(JSON.stringify(payload));
    const signature = await signWithHmac(b64Payload, SESSION_SIGNING_SECRET);
    const sessionToken = `st_${b64Payload}.${signature}`;

    const tokenHash = await this.hashToken(sessionToken);

    const session = await this.sessionRepo.create({
      id: sessionId,
      session_token_hash: tokenHash,
      user_id: user.id,
      branch_id: targetBranchId,
      scope,
      authenticated_at: now.toISOString(),
      pin_verified_at: now.toISOString(),
      expires_at: expiresAt,
    });

    return { session, sessionToken };
  }

  /**
   * Validates an application session by token.
   * Throws UnauthorizedError if missing, expired, or revoked.
   * Compatible across isolated serverless lambda instances.
   */
  async validateSession(sessionToken: string): Promise<ApplicationSession> {
    if (!sessionToken || sessionToken.trim().length === 0) {
      throw new UnauthorizedError('Session token is missing');
    }

    const trimmed = sessionToken.trim();

    // 1. Signed session token validation across serverless lambda containers
    if (trimmed.startsWith('st_')) {
      const dotIndex = trimmed.lastIndexOf('.');
      if (dotIndex > 3) {
        const b64Payload = trimmed.substring(3, dotIndex);
        const sig = trimmed.substring(dotIndex + 1);
        const isValid = await verifyHmac(b64Payload, sig, SESSION_SIGNING_SECRET);
        if (!isValid) {
          throw new UnauthorizedError('Invalid application session');
        }

        try {
          const jsonStr = fromBase64Url(b64Payload);
          const payload = JSON.parse(jsonStr);

          // Check expiration
          if (new Date(payload.exp).getTime() <= Date.now()) {
            throw new UnauthorizedError('Application session has expired');
          }

          // Check revocation in local SQLite if recorded
          const existing = await this.sessionRepo.findById(payload.id);
          if (existing?.revoked_at) {
            throw new UnauthorizedError('Application session has been revoked');
          }

          const reconstructedSession: ApplicationSession = {
            id: payload.id,
            session_token_hash: await this.hashToken(trimmed),
            user_id: payload.uid,
            branch_id: payload.bid ?? null,
            scope: payload.scp,
            authenticated_at: payload.aat,
            pin_verified_at: payload.pat ?? null,
            expires_at: payload.exp,
            revoked_at: null,
            created_at: payload.aat || new Date().toISOString(),
          };

          // Cache in local SQLite database container if not present
          if (!existing) {
            try {
              await this.sessionRepo.create(reconstructedSession);
            } catch {
              // Ignore local container caching error
            }
          }

          return reconstructedSession;
        } catch (err) {
          if (err instanceof UnauthorizedError) throw err;
          throw new UnauthorizedError('Invalid application session');
        }
      }
    }

    // 2. Fallback: Database lookup for legacy tokens
    const tokenHash = await this.hashToken(trimmed);
    const session = await this.sessionRepo.findActiveByTokenHash(tokenHash);

    if (!session) {
      const existing = await this.sessionRepo.findByTokenHash(tokenHash);
      if (existing?.revoked_at) {
        throw new UnauthorizedError('Application session has been revoked');
      }
      if (existing && existing.expires_at <= new Date().toISOString()) {
        throw new UnauthorizedError('Application session has expired');
      }
      throw new UnauthorizedError('Invalid application session');
    }

    return session;
  }

  /**
   * Revokes an application session by id.
   */
  async revokeSession(sessionId: string): Promise<void> {
    await this.sessionRepo.revoke(sessionId);
  }

  /**
   * Revokes all active application sessions for a user.
   */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.sessionRepo.revokeAllForUser(userId);
  }
}
