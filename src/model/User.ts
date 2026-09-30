import mongoose, { Schema, Document, Types } from "mongoose";

export interface IActivity {
  _id?: Types.ObjectId;
  tool: string;
  toolName: string;
  summary: string;
  details: Record<string, string>;
  timestamp: string;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name?: string;
  email: string;
  passwordHash: string;
  activities: IActivity[];
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    tool: { type: String, required: true },
    toolName: { type: String, required: true },
    summary: { type: String, required: true },
    details: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: String, required: true },
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  activities: { type: [ActivitySchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

  // is this file is matching with my all features?