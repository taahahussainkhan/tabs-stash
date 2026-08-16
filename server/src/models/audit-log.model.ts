import { Schema, model, Document, Types } from 'mongoose';

export interface ISecurityAuditLog extends Document {
  userId?: Types.ObjectId;
  event: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const SecurityAuditLogSchema = new Schema<ISecurityAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    event: { type: String, required: true },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

SecurityAuditLogSchema.index({ userId: 1, createdAt: -1 });

export const SecurityAuditLogModel = model<ISecurityAuditLog>(
  'SecurityAuditLog',
  SecurityAuditLogSchema
);
