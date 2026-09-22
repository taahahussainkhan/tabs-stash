import { SecurityAuditLogModel } from '../models/audit-log.model';
import { Types } from 'mongoose';

export interface AuditLogPayload {
  userId?: Types.ObjectId | string;
  event: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Asynchronous Security Audit Logger.
 * Executes writes in the background so that user-facing HTTP responses (login, register)
 * are never stalled waiting on telemetry database persistence.
 */
export class AuditService {
  /**
   * Record a security audit event asynchronously without blocking caller execution.
   */
  static record(payload: AuditLogPayload): void {
    // Fire-and-forget on the Node microtask queue
    setImmediate(async () => {
      try {
        const uId = payload.userId
          ? typeof payload.userId === 'string'
            ? new Types.ObjectId(payload.userId)
            : payload.userId
          : undefined;

        await SecurityAuditLogModel.create({
          userId: uId,
          event: payload.event,
          ipAddress: payload.ipAddress || '',
          userAgent: payload.userAgent || '',
          metadata: payload.metadata,
        });
      } catch (err) {
        // Silently log failure to stderr without crashing or impacting user experience
        console.warn('⚠️ Non-blocking security audit write failed:', err);
      }
    });
  }
}
