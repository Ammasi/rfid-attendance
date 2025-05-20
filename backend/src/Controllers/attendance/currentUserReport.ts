import express from 'express';
import { Request, Response } from 'express';
import Employee from '../../Models/userSchema.js';
import Attendance from '../../Models/Attendance.js';
import Leave from '../../Models/leaveSchema.js';

const currentUserRoute = express.Router();

const formatLocalTime = (d?: Date): string =>
  d
    ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
    : '';

currentUserRoute.get(
  '/attendance/currentuser',
  async (req: Request, res: Response): Promise<any> => {
    const currentUserEmail = req.header('x-user-email');
    if (!currentUserEmail) {
      return res.status(401).json({ message: 'Unauthorized: user email not found' });
    }

    try {
      const employee = await Employee.findOne({ email: currentUserEmail }).lean();
      if (!employee) {
        return res.status(401).json({ message: 'Employee Not Found' });
      }

      const now = new Date();
      const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999)); // end of month

      const dateArray: string[] = [];
      for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
        dateArray.push(d.toISOString().split('T')[0]);
      }

      const attendanceRecords = await Attendance.find({
        rfidcardno: employee.rfidcardno,
        date: { $gte: startDate, $lte: endDate }
      }).lean();

      const leaveRecords = await Leave.find({
        employeeId: employee._id,
        status: 'Approved',
        fromDate: { $lte: endDate },
        toDate: { $gte: startDate }
      }).lean();

      const permissionMap = new Map<string, { from: Date; to: Date }>();
      const leaveMap = new Map<string, string>();

      leaveRecords.forEach(rec => {
        const from = new Date(rec.fromDate);
        const to = new Date(rec.toDate);
        for (let d = new Date(from); d <= to; d.setUTCDate(d.getUTCDate() + 1)) {
          const key = d.toISOString().split('T')[0];
          if (rec.leaveType === 'Permission') {
            permissionMap.set(key, { from, to });
          } else {
            leaveMap.set(key, rec.leaveType);
          }
        }
      });

      let presentDays = 0,
        permissionDays = 0,
        leaveDays = 0,
        companyLeaveDays = 0,
        absentDays = 0,
        lateDays = 0,
        earlyDays = 0;
      const dailyStatuses: any[] = [];

      dateArray.forEach(dateStr => {
        const currentDate = new Date(dateStr);
        const dow = currentDate.getUTCDay();

        if (dow === 0) {
          companyLeaveDays++;
          dailyStatuses.push({ date: dateStr, status: 'Company Leave' });
          return;
        }

        const att = attendanceRecords.find(
          (r: any) => new Date(r.date).toISOString().split('T')[0] === dateStr
        );

        if (att) {
          presentDays++;
          let status = att.status;
          const isLate = att.wasLate;
          const isEarly = att.status === 'Early Going';

          if (isLate) {
            lateDays++;
            if (status === 'Present') status = 'Late';
            if (isEarly) status = 'Late & Early Checkout';
          }

          if (isEarly) earlyDays++;

          dailyStatuses.push({
            date: dateStr,
            status,
            checkInTime: att.checkInTime ? formatLocalTime(new Date(att.checkInTime)) : '',
            checkOutTime: att.checkOutTime ? formatLocalTime(new Date(att.checkOutTime)) : ''
          });
          return;
        }

        if (permissionMap.has(dateStr)) {
          presentDays++;
          permissionDays++;
          const p = permissionMap.get(dateStr)!;
          dailyStatuses.push({
            date: dateStr,
            status: 'Permission',
            details: `${formatLocalTime(p.from)} to ${formatLocalTime(p.to)}`
          });
          return;
        }

        if (leaveMap.has(dateStr)) {
          leaveDays++;
          const lt = leaveMap.get(dateStr)!;
          const label = lt.replace(/([A-Z])/g, ' $1').trim();
          dailyStatuses.push({ date: dateStr, status: label });
          return;
        }

        absentDays++;
        dailyStatuses.push({ date: dateStr, status: 'Absent' });
      });

      return res.json({
        fromDate: dateArray[0],
        toDate: dateArray[dateArray.length - 1],
        employee: {
          name: employee.name,
          employeecode: employee.employeecode,
          rfidcardno: employee.rfidcardno,
          email: employee.email
        },
        summary: {
          totalDays: dateArray.length,
          present: presentDays,
          late: lateDays,
          early: earlyDays,
          permission: permissionDays,
          leave: leaveDays,
          companyLeave: companyLeaveDays,
          absent: absentDays
        },
        dailyStatuses
      });
    } catch (err) {
      console.error('Error fetching current user attendance:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

export default currentUserRoute;
