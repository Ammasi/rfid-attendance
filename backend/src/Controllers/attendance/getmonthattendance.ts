// src/routes/attendanceRoutes.ts
import express, { Request, Response, NextFunction } from "express";
import Attendance from "../../Models/Attendance.js";
import Employee from "../../Models/userSchema.js";
import Leave from "../../Models/leaveSchema.js";

const router = express.Router();

interface MonthQuery {
  from?: string;
  to?: string;
  employeeId?: string;
}

router.get(
  "/attendance/month",
  async (
    req: Request<{}, any, any, MonthQuery>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { from, to, employeeId } = req.query;
      if (!from || !to || !employeeId) {
        res.status(400).json({ message: "from, to, and employeeId are required." });
        return;
      }

      const fromDate = new Date(`${from}T00:00:00.000Z`);
      const toDate   = new Date(`${to}T23:59:59.999Z`);
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        res.status(400).json({ message: "Invalid date format (YYYY-MM-DD)." });
        return;
      }
      if (fromDate > toDate) {
        res.status(400).json({ message: "`from` must be on or before `to`." });
        return;
      }

      // Ensure employee exists
      const emp = await Employee.findById(employeeId).exec(); // Executes the query and returns a promise
      if (!emp) {
        res.status(404).json({ message: "Employee not found." });
        return;
      };

      // Fetch attendance & approved leaves in range
      const attendanceRecs = await Attendance.find({
        employeeId,
        date: { $gte: fromDate, $lte: toDate },
      }).exec();

      const leaveRecs = await Leave.find({
        employeeId,
        status: "Approved",
        fromDate: { $lte: toDate },
        toDate:   { $gte: fromDate },
      }).exec();

      // Build each date in the range

      // <= Step	d.getUTCDate()	 d.setUTCDate(...)	 Resulting Date (d) =>
      // Init	1	(1 + 1 = 2)	2024-01-02T00:00:00.000Z
      // Next	2	(2 + 1 = 3)	2024-01-03T00:00:00.000Z
      // Next	3	(3 + 1 = 4)	2024-01-04T00:00:00.000Z
      const dates: Date[] = [];
      for (let d = new Date(fromDate); d <= toDate; d.setUTCDate(d.getUTCDate() + 1)) {
        dates.push(new Date(d));
      }

      // Map to response rows
      const rows = dates.map((date) => {
        const isoDay = date.toISOString().slice(0, 10); // Extracts the first 10 characters: YYYY-MM-DD.

        // Sunday?
        if (date.getUTCDay() === 0) {
          return {
            date:         date.toISOString(),
            checkInTime:  null,
            checkOutTime: null,
            status:       "Sunday",
          };
        }

        // Attendance record
        const rec = attendanceRecs.find(
          (r) => r.date.toISOString().slice(0, 10) === isoDay
        );
        if (rec) {
          let status = rec.status;
          if (rec.wasLate && status === "Present")       status = "Late";
          if (rec.wasLate && status === "Early Going")   status = "Late & Early Checkout";
          return {
            date:         rec.date.toISOString(),
            checkInTime:  rec.checkInTime?.toISOString()  ?? null,
            checkOutTime: rec.checkOutTime?.toISOString() ?? null,
            status,
          };
        }

        // Leave record
        const lv = leaveRecs.find(
          (l) =>
            l.fromDate.toISOString().slice(0, 10) <= isoDay &&
            l.toDate.toISOString().slice(0, 10)   >= isoDay
        );
        if (lv) {
          const lt = lv.leaveType.replace(/([A-Z])/g, " $1").trim();
          return {
            date:         date.toISOString(),
            checkInTime:  null,
            checkOutTime: null,
            status:       `On Leave (${lt})`,
          };
        }

        // Absent
        return {
          date:         date.toISOString(),
          checkInTime:  null,
          checkOutTime: null,
          status:       "Absent",
        };
      });

      res.json(rows);
    } catch (err) {
      console.error("Error in /attendance/month:", err);
      next(err);
    }
  }
);

export default router;
