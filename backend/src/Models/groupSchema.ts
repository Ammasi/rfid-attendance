import mongoose, { Schema, Types } from 'mongoose';

export interface IGroup extends Document{
    name:string,
    admin: Types.ObjectId; // Reference to the admin (Employee)
    members:string[]
}

const GroupSchema:Schema=new Schema({
    name:{type:String, required:true},
    admin:{type:Schema.Types.String,ref: "Employee", required:true},// Admin reference to employee collection
    members:[{type:String, required:true}]//list of employess to chat
});

export default mongoose.model<IGroup>("Group", GroupSchema);