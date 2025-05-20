import express from 'express';
import { Request, Response } from 'express';
import Message from '../../../Models/msgSchema.js';
import mongoose from 'mongoose';

const getMessages = express.Router();
// get group Id Messages 
getMessages.get('/messages/:groupId', async (req: Request, res: Response): Promise<any> => {
  const { groupId } = req.params;
  try {
    const messages = await Message.aggregate([
      { $match: { groupId: groupId } },
      { $sort: { timestamp: 1 } },
      {
        $lookup: {
          from: 'chatschemas', // Collection name (auto-pluralized and lowercased)
          let: { senderId: "$sender" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    { $toString: "$_id" }, // Convert ObjectId to string for comparison
                    "$$senderId"
                  ]
                }
              }
            }
          ],
          as: 'senderInfo'
        }
      },
      { $unwind: '$senderInfo' },
      {
        $project: {
          _id: 1,
          groupId: 1,
          content: 1,
          file: 1,
          timestamp: 1,
          sender: {
            _id: '$senderInfo._id',
            name: '$senderInfo.name'
          }
        }
      }
    ]);

    res.status(200).json({ messages });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default getMessages;