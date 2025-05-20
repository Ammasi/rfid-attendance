import express, { Request, Response } from "express";
import authenticate from "../../../Middleware/authenticate.js"; // Import authentication middleware
import Group from "../../../Models/groupSchema.js"; // Import Group model

const createGroup = express.Router();
// create new group
createGroup.post("/creategroup", authenticate, async (req: Request, res: Response): Promise<Response | any> => {
  const { name, members } = req.body;
  const admin = (req as any).user; // Extracted from middleware

  try {
    // Ensure the user is an admin
    if (!admin || admin.designation.toLowerCase() !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }
    
   //checks if already existing or not
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) return res.status(400).json({ message: "Group already exists" });

    // Create the group with the authenticated admin
    const group = new Group({ name, admin: admin._id, members });

    await group.save();

    res.status(201).json({ success: true, message: "Group created successfully", group });

  } catch (error: any) {
    console.error(" Error Creating Group:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default createGroup;
