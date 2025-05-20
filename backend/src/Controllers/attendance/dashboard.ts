// routes/dashboard.ts
import express, { Request, Response } from "express";
import Employee from "../../Models/userSchema.js";
import Attendance from "../../Models/Attendance.js";
import Leave from "../../Models/leaveSchema.js";

const routerdashboard = express.Router();

routerdashboard.get(
  "/home/dashboard1",
  async (req: Request, res: Response): Promise<any> => {
    try {
      // 1) Today's UTC window
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);
      const todayEnd = new Date(todayStart);
      todayEnd.setUTCHours(23, 59, 59, 999);

      // 2) Total employees
      const totalEmployees = await Employee.countDocuments();

      // 3) Today's attendance
      const todayAttendance = await Attendance.find({
        date: { $gte: todayStart, $lte: todayEnd },
      }).lean();

      // 4) Today's approved leaves (any overlap)
      const leaveRecords = await Leave.find({
        status: "Approved",
        fromDate: { $lte: todayEnd },
        toDate: { $gte: todayStart },
      }).lean();

      // 5) Present, late, early-going
      const presentSet = new Set<string>();
      const lateComers = new Set<string>();
      let earlyGoingCount = 0;

      todayAttendance.forEach((rec: any) => {
        presentSet.add(rec.rfidcardno);
        if (rec.wasLate) lateComers.add(rec.rfidcardno);
        if (rec.status === "Early Going") earlyGoingCount++;
      });

      const lateCount = lateComers.size;
      const onTimeCount = presentSet.size - lateCount;

      // 6) Leave metrics (distinct per employee)
      const seenLeaveEmp = new Set<string>();
      let permissionCount = 0;
      let onLeaveCount = 0;
      // only these types count as “on leave”:
      const nonPermissionLeaves = [
        "MedicalLeave",
        "SickLeave",
        "PersonalLeave",
        "CasualLeave",
      ];

      leaveRecords.forEach((rec: any) => {
        const empId = String(rec.employeeId);
        if (seenLeaveEmp.has(empId)) return;
        seenLeaveEmp.add(empId);

        if (rec.leaveType === "Permission") {
          permissionCount++;
        } else if (nonPermissionLeaves.includes(rec.leaveType)) {
          // since leaveRecords is already filtered to overlap today,
          // this guarantees the span covers today
          onLeaveCount++;
        }
      });

      // 7) Absent
      let absentCount =
        totalEmployees - presentSet.size - permissionCount - onLeaveCount;
      if (absentCount < 0) absentCount = 0;

      // 8) Sundays this month
      const year = todayStart.getUTCFullYear();
      const month = todayStart.getUTCMonth();
      const daysInMonth = new Date(year, month + 1, 0).getUTCDate();
      let sundayCount = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        if (new Date(Date.UTC(year, month, d)).getUTCDay() === 0)
          sundayCount++;
      }

      // 9) Last 7‑day attendance chart
      const chartData: { date: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(todayStart);
        d.setUTCDate(d.getUTCDate() - i);
        const dayStart = new Date(d);
        const dayEnd = new Date(d);
        dayEnd.setUTCHours(23, 59, 59, 999);

        const count = await Attendance.countDocuments({
          date: { $gte: dayStart, $lte: dayEnd },
        });
        chartData.push({ date: dayStart.toISOString().slice(0, 10), count });
      }

      // 10) Response
      return res.json({
        status: "success",
        totalEmployees,
        presentCount: presentSet.size,
        onTimeCount,
        lateCount,
        earlyGoingCount,
        checkOutCount: todayAttendance.filter((r) => r.checkOutTime).length,
        permissionCount,
        onLeaveCount,
        absentCount,
        sundayCount,
        chartData,
        lateComers: Array.from(lateComers),
      });
    } catch (error) {
      console.error("Dashboard Error:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  }
);

export default routerdashboard;
