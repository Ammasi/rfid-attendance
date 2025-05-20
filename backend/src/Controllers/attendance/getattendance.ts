import express, { Request, Response, NextFunction } from "express";
import Attendance from "../../Models/Attendance.js";
import Employee from "../../Models/userSchema.js";
import Leave from "../../Models/leaveSchema.js";

const router = express.Router();

interface AttendanceQuery {
  from?: string;  // YYYY-MM-DD
  to?: string;    // YYYY-MM-DD
}

router.get(
  "/attendance/today",
  async (
    req: Request<{}, any, any, AttendanceQuery>,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const { from, to } = req.query;
      if (!from || !to) {
        return res
          .status(400)
          .json({ message: "Both `from` and `to` dates are required." });
      }

      const fromDate = new Date(`${from}T00:00:00.000Z`);
      const toDate   = new Date(`${to}T23:59:59.999Z`);
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return res
          .status(400)
          .json({ message: "Invalid date format. Use YYYY-MM-DD." });
      }
      if (fromDate > toDate) {
        return res
          .status(400)
          .json({ message: "`from` must be on or before `to`." });
      }

      // 1) Load all employees
      const employees = await Employee.find(
        {},
        "_id name employeecode rfidcardno"
      ).exec();

      // 2) Load attendance & approved leaves for the entire range
      const attendanceRecords = await Attendance.find({
        date: { $gte: fromDate, $lte: toDate },
      }).exec();

      const leaveData = await Leave.find({
        status: "Approved",
        fromDate: { $lte: toDate },
        toDate:   { $gte: fromDate },
      }).exec();

      // 3) Build an array of each date in the range
      const dates: Date[] = [];
      for (
        let d = new Date(fromDate);
        d <= toDate;
        d.setUTCDate(d.getUTCDate() + 1)
      ) {
        dates.push(new Date(d));
      }

      // 4) Build result rows
      const rows: any[] = [];
      for (const date of dates) {
        const dateKey = date.toISOString().split("T")[0]; // "YYYY-MM-DD"

        for (const emp of employees) {
          // **NEW**: If this date is Sunday, mark as Sunday
          if (date.getUTCDay() === 0) {
            rows.push({
              date,
              name:         emp.name,
              employeecode: emp.employeecode,
              checkInTime:  null,
              checkOutTime: null,
              status:       "Sunday",
            });
            continue;
          }

          // a) find attendance
          const rec = attendanceRecords.find(
            (r: any) =>
              r.employeeId.toString() === emp._id.toString() &&
              r.date.toISOString().split("T")[0] === dateKey
          );

          if (rec) {
            let status = rec.status;
            if (rec.wasLate && status === "Present")       status = "Late";
            if (rec.wasLate && status === "Early Going")   status = "Late & Early Checkout";

            rows.push({
              date,
              name:         emp.name,
              employeecode: emp.employeecode,
              checkInTime:  rec.checkInTime  ?? null,
              checkOutTime: rec.checkOutTime ?? null,
              status,
            });
            continue;
          }

          // b) find overlapping approved leave
          const lv = leaveData.find(
            (l) =>
              l.employeeId.toString() === emp._id.toString() &&
              new Date(l.fromDate) <= date &&
              new Date(l.toDate)   >= date
          );
          if (lv) {
            rows.push({
              date,
              name:         emp.name,
              employeecode: emp.employeecode,
              checkInTime:  null,
              checkOutTime: null,
              status:       `On Leave (${lv.leaveType})`,
            });
            continue;
          }

          // c) otherwise absent
          rows.push({
            date,
            name:         emp.name,
            employeecode: emp.employeecode,
            checkInTime:  null,
            checkOutTime: null,
            status:       "Absent",
          });
        }
      }

      // 5) Sort by date then name
      rows.sort((a, b) => {
        const t1 = new Date(a.date).getTime();
        const t2 = new Date(b.date).getTime();
        if (t1 !== t2) return t1 - t2;
        return a.name.localeCompare(b.name);
      });

      return res.json(rows);
    } catch (err) {
      console.error("Error fetching attendance records:", err);
      next(err);
    }
  }
);

export default router;
