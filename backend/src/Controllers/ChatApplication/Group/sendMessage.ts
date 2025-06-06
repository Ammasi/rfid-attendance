// import express from "express";
// import { Request, Response } from "express";
// import Message from "../../../Models/msgSchema.js";
// import io from "../../../index.js";
// import mongoose from 'mongoose';

// const sendmsgroute = express.Router();

// // post chat using the api (chat messages)
// sendmsgroute.post("/post", async (req: Request, res: Response) => {
//   try {
//     const { groupId, sender, content, tempId,file } = req.body;
//     const fileUrl = file || "";
    
//     const newMessage = new Message({
//       groupId,
//       sender,
//       content,
//       file: fileUrl,
//       tempId,
//       timestamp: new Date(),
//       // seenBy: [sender._id], // seen message for sender
//     });

//     const savedMessage = await newMessage.save();

//     //fetch sender details from database
//      const senderUser=await mongoose.model("ChatSchema").findById(savedMessage.sender);
    
//     if(!senderUser) throw new Error("Sender name not found");

//     //construct message with sender details
//     const messageToEmit={
//       ...savedMessage.toObject(),
//       sender:{
//         _id:senderUser._id.toString(),
//         name:senderUser.name
//       }
//     }    
//     io.to(groupId).emit("message", messageToEmit);
//     res.status(201).json(messageToEmit);
//     // console.log("Message to emit:",messageToEmit);
    
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// });

// export default sendmsgroute;

// backend/routes/chat.ts
import express, { Request, Response } from "express";
import ChatUser from "../../../Models/chatUserSchema.js"; // The user model that has pushSubscription
import MessageModel from "../../../Models/msgSchema.js";     // The unified Message model
import { sendPushNotification } from "../../../../pushService.js";
import io from "../../../index.js";                   // Your Socket.IO server instance
import authenticateUser from "../../../Middleware/userAuthenticate.js"; // JWT/session guard

const sendmsgroute = express.Router();

sendmsgroute.post("/post",authenticateUser , async (req: Request, res: Response):Promise<any> => {
  try {
    const senderId = (req as any).user._id;
    const { groupId, content, tempId, file, recipientIds } = req.body as {
      groupId: string;
      content: string;
      tempId: string;
      file?: string;
      recipientIds: string[];
    };
    // console.log("RecipientId:",recipientIds);

    // 1) Find the sender’s name from the user collection
    const senderUser = await ChatUser.findById(senderId).select("name");
    if (!senderUser) {
      return res.status(404).json({ error: "Sender not found" });
    }
    // console.log("senderUser:", senderUser);

    // 2) Create & save the message document
    const newMsg = await MessageModel.create({
      groupId,
      sender: { _id: senderId, name: senderUser.name },
      content,
      file: file || "",
      tempId,
      timestamp: new Date(),
      seenBy: [senderId], // mark as “seen” by sender immediately
    });

    const messageToEmit = {
      _id: newMsg._id.toString(),
      groupId: newMsg.groupId,
      sender:  { _id: senderId.toString(), name: senderUser.name },
      content: newMsg.content,
      file: newMsg.file,
      tempId: newMsg.tempId,
      timestamp: newMsg.timestamp,
      seenBy: newMsg.seenBy,
    };

    // 4) Emit via Socket.IO so all connected clients in this room see it instantly
    io.to(groupId).emit("message", messageToEmit);

    // 5) Build the push‐notification payload
    const payloadObj = {
      title: `New message from ${senderUser.name}`,
      body:
        newMsg.content.length > 50
          ? newMsg.content.slice(0, 47) + "..."
          : newMsg.content,
      url: `/chat/${groupId}`,
      groupId,
      messageId: newMsg._id.toString(),
    };
    const payloadString = JSON.stringify(payloadObj);

    // 6) Look up each recipient’s pushSubscription and send push
    const recipients = await ChatUser.find({
      name: { $in: recipientIds },
      "pushSubscription.endpoint": { $exists: true, $ne: null },
    }).select("pushSubscription");

    for (const rec of recipients) {
      if (rec.pushSubscription && rec.pushSubscription.endpoint) {
        try {
          await sendPushNotification(rec.pushSubscription, payloadString);
        } catch (err) {
          console.error(`Failed to push to ${rec._id}:`, err);
          // If you detect error.statusCode === 410 (Gone) or 404, you can clear rec.pushSubscription
          // e.g. await ChatUser.findByIdAndUpdate(rec._id, { pushSubscription: null });
        }
      }
    }

    // 7) Return the newly saved message in HTTP response
    return res.status(201).json(messageToEmit);
  } catch (err) {
    console.error("Error in /api/chat/send:", err);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

export default sendmsgroute;
