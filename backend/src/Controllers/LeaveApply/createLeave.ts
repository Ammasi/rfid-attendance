import express, { NextFunction, Request, Response } from "express";
import Leave from "../../Models/leaveSchema.js";
import Employee from "../../Models/userSchema.js";
import mongoose from "mongoose";
import chatUserSchema from "../../Models/chatUserSchema.js";
const leaveRouter = express.Router();

// Create a new leave
leaveRouter.post(
  "/createleave",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { employeeId, leaveType, fromDate, toDate, reason } = req.body;
      const newLeave = new Leave({
        employeeId,
        leaveType,
        fromDate: fromDate ? new Date(fromDate) : null,
        toDate: toDate ? new Date(toDate) : null,
        reason: reason || null,
        createdate: new Date(),
        status: "Pending",
      });
      await newLeave.save();
      res
        .status(201)
        .json({ message: "Leave Applied Successfully", leave: newLeave });
    } catch (error) {
      console.error("Error Creating Leave", error);
      next(error);
    }
  }
);

// Get today's requests
leaveRouter.get(
  "/leave/todayRequests",
  async (_: Request, res: Response, next: NextFunction) => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(todayStart);
      todayEnd.setHours(23, 59, 59, 999);

      const leaveRequests = await Leave.find({
        createdate: { $gte: todayStart, $lte: todayEnd },
      })
        .populate("employeeId", "name")
        .exec();

      res.status(200).json({ leaveRequests });
    } catch (error) {
      console.error("Error fetching today's leave requests", error);
      next(error);
    }
  }
);

// Get all requests
leaveRouter.get(
  "/leave/Requests",
  async (_: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const leaveRequests = await Leave.find()
        .populate("employeeId", "name")
        .exec();
      if (!leaveRequests.length) {
        return res.status(404).json({ message: "No leave requests found." });
      }
      res.status(200).json({ leaveRequests });
    } catch (error) {
      console.error("Error fetching leave requests", error);
      next(error);
    }
  }
);

// Get by current user leave requests with status
leaveRouter.get(
  "/user/leave/Request/:employeeId",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { employeeId } = req.params;

      const leaveRequests = await Leave.find({ employeeId })
        .populate("employeeId", "name")
        .exec();
      res.status(200).json({ leaveRequests });
    } catch (error) {
      console.error("Error fetching leave requests", error);
      next(error);
    }
  }
);

// Approve or deny a leave by admin, and on approval deduct days
leaveRouter.put(
  "/confirmLeave/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["Approved", "Denied"].includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status. Must be 'Approved' or 'Denied'." });
      }

      // Load the leave request
      const leave = await Leave.findById(id).session(session);
      if (!leave) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Leave request not found." });
      }

      // If approving a currently-pending leave
      if (status === "Approved" && leave.status === "Pending") {
        const from = leave.fromDate!;
        const to = leave.toDate ?? from;
        const msPerDay = 1000 * 60 * 60 * 24;
        const days = Math.floor((to.getTime() - from.getTime()) / msPerDay) + 1;

        const user = await chatUserSchema.findById(leave.employeeId).select("email").lean();
        if (!user || !user.email) {
          await session.abortTransaction();
          return res.status(404).json({ message: 'User with email not found.' });
        }

        const emp = await Employee.findOne({ email: user.email }).select("_id").lean();
        if (!emp) {
          await session.abortTransaction();
          return res.status(404).json({ message: 'Employee not found.' });
        }

        // Deduct based on leave type
        const updateFields: any = {};
        if (leave.leaveType === "SickLeave") {
          updateFields.sickleave = -days;
        } else if (leave.leaveType === "PersonalLeave") {
          updateFields.personalleave = -days;
        }

        if (Object.keys(updateFields).length > 0) {
          await Employee.findByIdAndUpdate(
            emp._id,
            { $inc: updateFields },
            { new: true, session }
          );
        }
      }

      // Update leave status
      leave.status = status;
      const updatedLeave = await leave.save({ session });

      await session.commitTransaction();
      res.status(200).json({ message: `Leave ${status}`, leave: updatedLeave });
    } catch (error) {
      await session.abortTransaction();
      console.error("Error updating leave status", error);
      next(error);
    } finally {
      session.endSession();
    }
  }
);

export default leaveRouter;
