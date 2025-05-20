import mongoose, { Schema } from 'mongoose';

const attendanceSchema = new Schema({
    rfidcardno: { type: String, required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    checkInTime: { type: Date},
    checkOutTime: { type: Date },
    status: { type: String, required: true },
    wasLate: { type: Boolean },
    date: { type: Date, required: true },
});

export default mongoose.model('Attendance', attendanceSchema);