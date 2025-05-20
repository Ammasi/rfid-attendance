import express, { Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Employee from '../../Models/userSchema.js';
import mongoose from "mongoose";
import ChatSchema from '../../Models/chatUserSchema.js'

const authRoute: Router = express.Router();

// Register User
authRoute.post("/register", async (req: Request, res: Response): Promise<any> => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await ChatSchema.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new ChatSchema({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error: any) {
    console.error("Error during registration:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// Login User
authRoute.post("/login", async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and Password are required" });
  }

  try {
    const user = await ChatSchema.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Invalid Email ID" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid Password" });
    }

    const employee = await Employee.aggregate([
      { $match: { email } },
      {
        $project: {
          _id: 1,
          name: 1,
          designation: 1,
          employeecode: 1,
          rfidcardno: 1,
        },
      },
    ]);

    if (!employee.length) {
      return res.status(404).json({ success: false, message: "Employee details not found" });
    }

    const employeeDetails = employee[0];
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rfidcardno: employeeDetails.rfidcardno,
        empcode: employeeDetails.employeecode,
        designation: employeeDetails.designation,
        employeeId: employeeDetails._id,
      },
      token,
    });
  } catch (error: any) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// Logout User
authRoute.post("/logout", async (req: Request, res: Response): Promise<any> => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error: any) {
    console.error("Error during logout:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// Verify Session Endpoint
authRoute.get("/verify", async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "defaultsecret") as { id: string };
    
    const userId = decoded.id;
    
    const objectId = new mongoose.Types.ObjectId(userId);
    
    const chatUser = await ChatSchema.findById(objectId).select("name email");
    if (!chatUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const employee = await Employee.findOne({ email: chatUser.email }).select("designation _id rfidcardno employeecode");
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee details not found" });
    }
    return res.status(200).json({
      success: true,
      id: chatUser._id,
      name: chatUser.name,
      email: chatUser.email,
      designation: employee.designation,
      rfidcardno: employee.rfidcardno,
      empcode: employee.employeecode,
      employeeId: employee._id,
      token:token
    });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
});

export default authRoute;
