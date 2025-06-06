// src/middleware/authenticateUser.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import ChatSchema from "../Models/chatUserSchema.js";  // Login Collection

/**
 * Extends Express's Request type to include a `user` property.
 */
interface AuthenticatedRequest extends Request {
  user?: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  };
}

/**
 * Middleware: authenticateUser
 *
 * - Verifies the JWT token from cookies or Authorization header.
 * - Finds the matching user record in the ChatSchema collection.
 * - Attaches { _id, name, email } to req.user.
 * - DOES NOT check for any "admin" designation.
 */
const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // 1. Extract token from cookie or Bearer header
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ success: false, message: "Not Authorized. Please log in again." });
    return;
  }

  try {
    // 2. Verify JWT and extract payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "defaultsecret");
    const userId = (decoded as { id: string }).id;

    // 3. Convert userId string to ObjectId
    const objectId = new mongoose.Types.ObjectId(userId);

    // 4. Look up the user in ChatSchema (login collection)
    const chatUser = await ChatSchema.findById(objectId).select("name email") as { _id: mongoose.Types.ObjectId; name: string; email: string } | null;
    if (!chatUser) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    // 5. Attach basic user details to req.user
    req.user = {
      _id: chatUser._id,
      name: chatUser.name,
      email: chatUser.email,
    };

    // 6. Call next() to proceed to route handler
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid token. Please log in again." });
  }
};

export default authenticateUser;
