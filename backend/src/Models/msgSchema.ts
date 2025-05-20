import { Schema } from "mongoose";
import mongoose from "mongoose";

export interface IMessage extends Document {
  groupId: string;
  sender: { _id: string | null; name: string } | string; 
  content: string;
  file?: string;
  tempId:string;
  timestamp: Date;
}

const MessageSchema:Schema = new Schema({
    groupId: {type:String},
    sender: {type:String},
    content: {type:String},
    file:{type:String,default:""},
    tempId:{type:String},
    timestamp: { type: Date, default: Date.now },
  });
  export default mongoose.model<IMessage>("Message", MessageSchema);