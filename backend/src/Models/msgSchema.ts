import { Schema } from "mongoose";
import mongoose from "mongoose";

export interface IMessage extends Document {
  groupId: string;
  sender: { _id: string | null; name: string } | string;
  content: string;
  file?: string;
  tempId: string;
  timestamp: Date;
  seenBy: string[];
}

const MessageSchema: Schema = new Schema({
  groupId: { type: String },
  // sender: {type:String},
  sender: {
    _id: { type: String, required: true },
    name: { type: String, required: true },
  },
  content: { type: String },
  file: { type: String, default: "" },
  tempId: { type: String },
  timestamp: { type: Date, default: Date.now },
  seenBy: [{ type: String, required: true }],
});

export default mongoose.model<IMessage>("Message", MessageSchema);
