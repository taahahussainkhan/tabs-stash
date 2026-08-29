import { Schema, model, Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';

export interface IUser extends Document {
  _id: Types.ObjectId;
  publicId: string;
  email: string;
  passwordHash: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  dateOfBirth?: Date | null;
  phoneNumber?: string;
  profileImage?: string;
  lastPasswordUpdate?: Date | null;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    publicId: {
      type: String,
      required: true,
      default: () => randomUUID(),
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    firstName: {
      type: String,
      trim: true,
      default: '',
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    lastPasswordUpdate: {
      type: Date,
      default: null,
    },
    tokenVersion: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = model<IUser>('User', UserSchema);
