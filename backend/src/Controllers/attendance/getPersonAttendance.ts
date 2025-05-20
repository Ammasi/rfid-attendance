import express from 'express';
import { Request, Response } from 'express';
import Attendance from '../../Models/Attendance.js';
import Employee from '../../Models/userSchema.js';
import Leave from '../../Models/leaveSchema.js';

const personrouter = express.Router();

const formatTime = (timeString?: string): string => {
  if (!timeString) return '';
  const [h, m] = timeString.split(':');
  const hours = parseInt(h, 10);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${m} ${period}`;
};

personrouter.get(
  '/attendance/person',
  async (req: Request, res: Response): Promise<any> => {
    const { fromdate, todate, rfidcardno } = req.query;
    if (!fromdate || !todate || !rfidcardno) {
      return res.status(400).json({
        message: 'Missing required parameters: fromdate, todate, rfidcardno'
      });
    }

    try {
      const startDate = new Date(fromdate as string);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(todate as string);
      endDate.setUTCHours(23, 59, 59, 999);

      const employee = await Employee.findOne({ rfidcardno }).lean();
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

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
        for (
          let d = new Date(Math.max(from.getTime(), startDate.getTime()));
          d <= to && d <= endDate;
          d.setUTCDate(d.getUTCDate() + 1)
        ) {
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
      const lateTracker = new Set<string>();
      const earlyTracker = new Set<string>();
      const dailyStatuses: any[] = [];

      dateArray.forEach(dateStr => {
        const dow = new Date(dateStr).getUTCDay();
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
          const isLate = att.wasLate || false;
          const isEarly = att.status === 'Early Going';

          if (isLate && !lateTracker.has(dateStr)) {
            lateDays++;
            lateTracker.add(dateStr);
          }
          if (isEarly && !earlyTracker.has(dateStr)) {
            earlyDays++;
            earlyTracker.add(dateStr);
          }

          let status = 'Present';
          if (isLate && isEarly) status = 'Late & Early Checkout';
          else if (isLate) status = 'Late';
          else if (isEarly) status = 'Early Checkout';

          dailyStatuses.push({
            date: dateStr,
            status,
            checkInTime: formatTime(att.checkInTime?.toISOString().split('T')[1]),
            checkOutTime: formatTime(att.checkOutTime?.toISOString().split('T')[1])
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
            details: `${formatTime(p.from.toISOString().split('T')[1])} to ${formatTime(
              p.to.toISOString().split('T')[1]
            )}`
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
        fromDate: startDate.toISOString().split('T')[0],
        toDate: endDate.toISOString().split('T')[0],
        employee: {
          name: employee.name,
          employeecode: employee.employeecode,
          rfidcardno: employee.rfidcardno
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
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

export default personrouter;