import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import chatUserSchema from '../../Models/chatUserSchema.js';
import Leave from '../../Models/leaveSchema.js';

const LeaveRouter = express.Router();

// Hardcoded company defaults
const ADMIN_DEFAULT_SICK_LEAVE = 12;
const ADMIN_DEFAULT_PERSONAL_LEAVE = 0;

LeaveRouter.get(
  '/leave/available/:employeeId',
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { employeeId } = req.params;

      // 1) Verify employee exists (no need for email lookup)
      const employeeExists = await chatUserSchema.exists({ _id: employeeId });
      if (!employeeExists) {
        return res.status(404).json({ message: 'User not found' });
      }

      // 2) Calculate taken leaves
      const approvedLeaves = await Leave.find({
        employeeId: new mongoose.Types.ObjectId(employeeId),
        status: 'Approved',
        $or: [
          { leaveType: 'SickLeave' },
          { leaveType: 'PersonalLeave' },
          { leaveType: /sick/i }, // 
          { leaveType: /personal/i }
        ]
      });

      // 3) Calculate taken days
      let takenSickLeave = 0;
      let takenPersonalLeave = 0;

      for (const leave of approvedLeaves) {
        const fromDate = new Date(leave.fromDate);
        const toDate = new Date(leave.toDate);
        const dayDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24)) + 1;

        if (leave.leaveType === 'SickLeave' || /sick/i.test(leave.leaveType)) {
          takenSickLeave += dayDiff;
        } else if (leave.leaveType === 'PersonalLeave' || /personal/i.test(leave.leaveType)) {
          takenPersonalLeave += dayDiff;
        }
      }

      // 4) Calculate available leaves (always based on admin defaults)
      const sickLeaveAvailable = Math.max(0, ADMIN_DEFAULT_SICK_LEAVE - takenSickLeave);
      const personalLeaveAvailable = Math.max(0, ADMIN_DEFAULT_PERSONAL_LEAVE - takenPersonalLeave);

      // 5) Return response
      return res.status(200).json({
        message: 'Leave balances fetched successfully',
        defaultSickLeavedays: ADMIN_DEFAULT_SICK_LEAVE,
        defaultPersonalLeavedays: ADMIN_DEFAULT_PERSONAL_LEAVE,
        takenSickLeave,
        takenPersonalLeave,
        sickLeaveAvailable,
        personalLeaveAvailable,
      });

    } catch (error) {
      console.error('Error fetching leave balances:', error);
      next(error);
    }
  }
);

export default LeaveRouter;