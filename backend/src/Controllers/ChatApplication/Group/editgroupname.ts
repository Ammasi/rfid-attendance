// PUT route to update group name
import express from 'express';
import Group from '../../../Models/groupSchema.js';
import authenticate from '../../../Middleware/authenticate.js';
import {Request,Response} from 'express';


const groupeditroute=express.Router();
// edit group name
groupeditroute.put('/:groupId', authenticate, async (req:Request, res:Response):Promise<any> => {
    try {
      const { groupId } = req.params;
      const { name } = req.body;

     if(!name || !groupId){
      res.json({message:"Group name and Id required"})
     }
      // Update group
      const updatedGroup = await Group.findByIdAndUpdate(
        groupId,
        { name },
        { new: true }
      );
  
      if (!updatedGroup) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      res.json(updatedGroup);
    } catch (error) {
      console.error('Error updating group:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
// delete group name
  groupeditroute.delete('/:groupId',authenticate, async(req:Request,res:Response)=>{
    try {
      const {groupId}=req.params;

      const deletegroup=await Group.findByIdAndDelete(groupId);
      if(!deletegroup){
        res.json({message:"Group not found"});
      }
      res.status(200).json({message:"Group Deleted Successfully"});
    } catch (error) {
      console.error("Error:",error)
    }
  })

  export default groupeditroute;