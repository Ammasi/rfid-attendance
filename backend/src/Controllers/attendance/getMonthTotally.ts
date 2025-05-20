import express, { Request, Response } from 'express';
import Employee from '../../Models/userSchema.js';
import Attendance from '../../Models/Attendance.js';
import Leave from '../../Models/leaveSchema.js';

const gettotalmonthroute = express.Router();

gettotalmonthroute.get(
  '/attendance/totalmonth',
  async (req: Request, res: Response): Promise<any> => {
    try {
      // 1) Date window: start‑of‑month → end‑of‑today (UTC)
      const now = new Date();
      const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      const endOfToday = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)
      );

      // 2) Build array of YYYY‑MM‑DD for each calendar day so far
      const allDates: string[] = [];
      for (
        let d = new Date(startOfMonth);
        d <= endOfToday;
        d.setUTCDate(d.getUTCDate() + 1)
      ) {
        allDates.push(d.toISOString().split('T')[0]);
      }

      // 3) Fetch all attendance & approved leave rows
      const attendanceRecords = await Attendance.find({
        date: { $gte: startOfMonth, $lte: endOfToday },
      }).lean();

      const leaveRecords = await Leave.find({
        status: 'Approved',
        fromDate: { $lte: endOfToday },
        toDate: { $gte: startOfMonth },
      })
        .populate('employeeId', 'rfidcardno')
        .lean();

      // 4) Load all employees
      const employees = await Employee.find({}, 'name employeecode rfidcardno').lean();

      // 5) Summarize per employee
      const summary = employees.map(emp => {
        const myAtt = attendanceRecords.filter(r => r.rfidcardno === emp.rfidcardno);
        const myLeaves = leaveRecords.filter(
          (r: any) => r.employeeId?.rfidcardno === emp.rfidcardno
        );

        // Present days with late/early tracking
        const presentDays = new Set<string>();
        let totalLateDays = 0;
        let totalEarlyDays = 0;

        myAtt.forEach(r => {
          const dateKey = new Date(r.date).toISOString().split('T')[0];
          presentDays.add(dateKey);
          
          if (r.wasLate) totalLateDays++;
          if (r.status === 'Early Going') totalEarlyDays++;
        });

        // Leave days calculation
        const leaveDays = new Set<string>();
        let totalPermissionDays = 0;
        let totalSickLeaves = 0;
        let totalCasualLeaves = 0;

        myLeaves.forEach((r: any) => {
          const from = new Date(r.fromDate);
          const to = new Date(r.toDate);
          for (
            let d = new Date(from);
            d <= to && d <= endOfToday;
            d.setUTCDate(d.getUTCDate() + 1)
          ) {
            const dateKey = d.toISOString().split('T')[0];
            if (!leaveDays.has(dateKey)) {
              leaveDays.add(dateKey);
              switch (r.leaveType) {
                case 'Permission': totalPermissionDays++; break;
                case 'SickLeave': totalSickLeaves++; break;
                case 'CasualLeave': totalCasualLeaves++; break;
              }
            }
          }
        });

        // Absent days calculation
        const totalAbsentDays = allDates.filter(date => 
          !presentDays.has(date) && 
          !leaveDays.has(date) &&
          new Date(date).getUTCDay() !== 0 // Exclude Sundays
        ).length;

        return {
          rfidcardno: emp.rfidcardno,
          name: emp.name,
          employeecode: emp.employeecode,
          totalPresentDays: presentDays.size,
          totalAbsentDays,
          totalLateDays,
          totalEarlyDays,
          totalPermissionDays,
          totalSickLeaves,
          totalCasualLeaves,
        };
      });

      return res.json(summary);
    } catch (err) {
      console.error("Error fetching this month’s attendance:", err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

export default gettotalmonthroute;