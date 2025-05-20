import mongoose from "mongoose";
const { Schema } = mongoose;

const leaveData = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: "ChatSchema", required: true },
  leaveType: { type: String, default: null },
  fromDate: { type: Date, default: null },
  toDate: { type: Date, default: null },
  reason: { type: String, default: null },
  createdate: { type: Date, default: Date.now },
  status: { type: String, default: "Pending" },
});

export default mongoose.model("Leave", leaveData);
