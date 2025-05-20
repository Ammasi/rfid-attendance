import { Router, Request, Response } from 'express';
import Attendance from '../../Models/Attendance.js';
import Employee from '../../Models/userSchema.js';
import Leave from '../../Models/leaveSchema.js';  // adjust path as needed

const routerattendance = Router();
// create attendence daily
routerattendance.post(
  "/attendance",
  async (req: Request, res: Response): Promise<any> => {
    const { rfidcardno } = req.body;
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

    try {
      // 1. Find employee by RFID
      const employee = await Employee.findOne({ rfidcardno });
      if (!employee) {
        return res
          .status(400)
          .json({ message: 'RFID card not found. Please register the employee details.' });
      }

      // 2. Check for an Approved leave covering today
      const todayLeave = await Leave.findOne({
        employeeId: employee._id,
        status: 'Approved',
        fromDate: { $lte: now },
        toDate:   { $gte: now },
      });

      if (todayLeave && todayLeave.leaveType.toLowerCase() !== 'permission') {
        return res
          .status(400)
          .json({ message: `You have applied ${todayLeave.leaveType} today.` });
      }

      // 3. Look for existing attendance record for today
      let attendance = await Attendance.findOne({ rfidcardno, date: currentDate });

      if (attendance) {
        // --- CHECK‑OUT FLOW ---
        if (!attendance.checkOutTime) {
          attendance.checkOutTime = now;

          // If checking out at or before 5:00pm → Early Going; else Present
          const h = now.getHours(), m = now.getMinutes();
          if (h < 17 || (h === 17 && m === 0)) {
            attendance.status = 'Early Going';
          } else {
            attendance.status = 'Present';
          }

          await attendance.save();
          return res.json({ message: 'Checked out successfully.', attendance });
        } else {
          return res.status(400).json({ message: 'Already checked out for today.' });
        }

      } else {
        // --- CHECK‑IN FLOW ---
        // Late if after 10:00AM
        const wasLate = now.getHours() > 10 || (now.getHours() === 10 && now.getMinutes() > 0);

        const newAttendance = new Attendance({
          rfidcardno,
          employeeId: employee._id,
          checkInTime: now,
          status: 'Present',
          wasLate,
          date: currentDate,
        });

        await newAttendance.save();
        return res.json({ message: 'Checked in successfully.', attendance: newAttendance });
      }

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

export default routerattendance;
