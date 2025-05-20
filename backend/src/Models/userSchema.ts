import mongoose, { Schema, Document,Types } from "mongoose";
// Employee Schema
const EmployeeSchema = new Schema({
  rfidcardno: { type: String, required: true, unique: true },
  photo: { type: String },
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  mobileno: { type: String, required: true },
  employeecode: { type: String, required: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  sickleave: { type: Number, default:12 },  
  personalleave: { type: Number, default:0 },
  gender: { type: String, required: true },
  maritalstatus: { type: String, required: true },
  joiningdate: { type: Date, required: true },
  address: { type: String, required: true },
  createDate: { type: Date, default: Date.now },
});

export default mongoose.model("Employee", EmployeeSchema);
