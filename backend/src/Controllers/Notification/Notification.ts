// backend/routes/pushRoutes.ts
import express from "express";
import { Request, Response } from "express";
import UserModel from "../../Models/chatUserSchema.js"; // adjust path if needed

const NotificationRouter = express.Router();

// POST /api/push/subscribe
NotificationRouter.post("/subscribe", async (req: Request, res: Response):Promise<any> => {
  try {
    const subscription = req.body; 
    // console.log("Subscription:", subscription);// { endpoint, keys: { p256dh, auth } }
    const userId = (req as any).user._id;
    // console.log("userId:", userId); // assume your auth middleware sets req.user._id
    
    await UserModel.findByIdAndUpdate(userId, {
      pushSubscription: subscription,
    });

    return res.status(201).json({ message: "Subscription saved." });
  } catch (err: any) {
    console.error("Failed to save subscription:", err);
    return res.status(500).json({ error: "Failed to save subscription." });
  }
});

export default NotificationRouter;
