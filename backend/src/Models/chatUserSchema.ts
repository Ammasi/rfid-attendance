import mongoose from 'mongoose';
import {Schema,Document} from 'mongoose'

export interface IUser extends Document{
    name: string;
    email: string;
    password: string;
    pushSubscription?: any;
}

const chatUser = new Schema({
    name: { type: Schema.Types.String, required: true },
    email: { type: Schema.Types.String, required: true, unique: true },
    password: { type: Schema.Types.String, required: true },
    pushSubscription: { type: Object, default: null },
  });
export default mongoose.model<IUser>("ChatSchema", chatUser);