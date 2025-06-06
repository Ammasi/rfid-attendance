// backend/routes/testPush.ts
import express, { Router, Request, Response } from "express";
import UserModel from "../../Models/chatUserSchema.js";
import { sendPushNotification } from "../../../pushService.js";

const testPushRouter = express.Router();

testPushRouter.post("/push", async (req:Request, res:Response):Promise<any> => {
  const { userId, title, body } = req.body as {
    userId: string;
    title: string;
    body: string;
  };
  // console.log("userId:",userId);
  // console.log("title:",title);
  // console.log("body:",body);  

  if (!userId || !title || !body) {
    return res.status(400).json({ error: "Please supply userId, title, body" });
  }

  try {
    // 1) Look up the user’s subscription from Mongo
    const user = await UserModel.findById(userId).select("pushSubscription");
    if (!user || !user.pushSubscription || !user.pushSubscription.endpoint) {
      return res
        .status(404)
        .json({ error: "No pushSubscription found for that user" });
    }

    // 2) Build a payload object that your SW will use
    const payloadData = {
      title,
      body,
      url: "/chat/TEST_GROUP_ID", // wherever you want the SW to navigate
      groupId: "TEST_GROUP_ID",
      messageId: "TEST_MESSAGE_ID",
    };
    const payloadString = JSON.stringify(payloadData);

    // 3) Send it
    await sendPushNotification(user.pushSubscription, payloadString);

    return res.json({ message: "Test push sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send test push" });
  }
});

export default testPushRouter;
