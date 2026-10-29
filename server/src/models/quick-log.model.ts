import { Schema, model, Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';

/**
 * QuickLog: a free-form, timestamped entry that belongs to a QuickRecord.
 * The note text carries no enforced meaning ("started", "finished ep 3",
 * anything). The createdAt/stampedAt timestamp is the payload that matters:
 * these stamps are what the web app later amps into full sessions.
 */
export interface IQuickLog extends Document {
  _id: Types.ObjectId;
  publicId: string; // client-generated UUID, stable across devices
  userId: Types.ObjectId;
  recordId: string; // QuickRecord publicId
  note: string; // free text, may be empty
  stampedAt: number; // epoch ms captured on the phone (the precious timestamp)
  ampedAt: number | null; // epoch ms once promoted into a full session on the web app
  clientUpdatedAt: number;
  serverUpdatedAt: number;
}

const QuickLogSchema = new Schema<IQuickLog>(
  {
    publicId: {
      type: String,
      required: true,
      default: () => randomUUID(),
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recordId: {
      type: String,
      required: true,
      index: true,
    },
    note: {
      type: String,
      default: '',
      maxlength: 5000,
    },
    stampedAt: {
      type: Number,
      required: true,
    },
    ampedAt: {
      type: Number,
      default: null,
      index: true,
    },
    clientUpdatedAt: {
      type: Number,
      required: true,
    },
    serverUpdatedAt: {
      type: Number,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret.publicId;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

QuickLogSchema.index({ userId: 1, publicId: 1 }, { unique: true });
QuickLogSchema.index({ userId: 1, recordId: 1, stampedAt: -1 });
QuickLogSchema.index({ userId: 1, serverUpdatedAt: -1 });

export const QuickLogModel = model<IQuickLog>('QuickLog', QuickLogSchema);
