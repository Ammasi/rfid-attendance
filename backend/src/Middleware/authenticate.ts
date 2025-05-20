import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import ChatSchema from "../Models/chatUserSchema.js";  // Login Collection
import Employee from "../Models/userSchema.js";  // Employee Collection

const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // console.log("Inside authenticate middleware");

  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ success: false, message: "Not Authorized. Login Again." });
    return; // No need to return the response; simply end here after sending the response
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "defaultsecret");
    const userId = (decoded as { id: string }).id;

    // Convert userId to ObjectId
    const objectId = new mongoose.Types.ObjectId(userId);

    // Find the user in `chatschema` collection
    const chatUser = await ChatSchema.findById(objectId).select("name email");

    if (!chatUser) {
      res.status(404).json({ success: false, message: "User not found in chatschema" });
      return; // End execution here after sending response
    }

    // Find the user in `employee` collection by email
    const employee = await Employee.findOne({ email: chatUser.email }).select("designation");

    if (!employee) {
      res.status(404).json({ success: false, message: "User designation not found in employee collection" });
      return; // End execution here after sending response
    }

    // Check if the user is an admin
    if (employee.designation.toLowerCase() !== "admin") {
      res.status(403).json({ success: false, message: "Access denied. Admins only." });
      return; // End execution here after sending response
    }

    // Attach user details to request
    (req as any).user = {
      _id: chatUser._id,
      name: chatUser.name,
      email: chatUser.email,
      designation: employee.designation, // Attach designation from `employee`
    };

    // Pass control to the next middleware
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid token. Login Again." });
  }
};

export default authenticate;
