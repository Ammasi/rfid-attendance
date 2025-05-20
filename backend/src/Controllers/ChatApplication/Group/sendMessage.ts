import express from "express";
import { Request, Response } from "express";
import Message from "../../../Models/msgSchema.js";
import io from "../../../index.js";
import mongoose from 'mongoose';

const sendmsgroute = express.Router();

// post chat using the api (chat messages)
sendmsgroute.post("/post", async (req: Request, res: Response) => {
  try {
    const { groupId, sender, content, tempId,file } = req.body;
    const fileUrl = file || "";
    
    const newMessage = new Message({
      groupId,
      sender,
      content,
      file: fileUrl,
      tempId,
      timestamp: new Date(),
    });

    const savedMessage = await newMessage.save();

    //fetch sender details from database
     const senderUser=await mongoose.model("ChatSchema").findById(savedMessage.sender);
    
    if(!senderUser) throw new Error("Sender name not found");

    //construct message with sender details
    const messageToEmit={
      ...savedMessage.toObject(),
      sender:{
        _id:senderUser._id.toString(),
        name:senderUser.name
      }
    }    
    io.to(groupId).emit("message", messageToEmit);
    res.status(201).json(messageToEmit);
    // console.log("Message to emit:",messageToEmit);
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default sendmsgroute;