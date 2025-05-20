import express from "express";
import { Request, Response } from "express";
import Group from "../../../Models/groupSchema.js";
import mongoose from "mongoose";
import authenticate from "../../../Middleware/authenticate.js";

const addmembers = express.Router();
//add members to group
addmembers.post("/:groupId/addmember",authenticate,async (req: Request, res: Response): Promise<any> => {
    const { userId  } = req.body;
    const {groupId} = req.params;

    try {
      const group: any = await Group.findById(groupId);

      // console.log("Found group:",group);      

      if (!group) {
        res.status(404).json({ message: "Group Not Found......", });
      }

      // Add username to the members array (if it's not already added)
      if (!group.members.includes(userId )) {       
        group.members.push(userId );
        await group.save();       
        return res
          .status(200)
          .json({ message: "User added to group successfully" });
      } else {
        return res
          .status(400)
          .json({ message: "User is already a member of the group" });
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);
export default addmembers;
