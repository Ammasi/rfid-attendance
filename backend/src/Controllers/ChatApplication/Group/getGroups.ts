import express from 'express';
import {Request,Response} from 'express';
import Group from '../../../Models/groupSchema.js'

const getGroupRoute=express.Router();
// get all groups
getGroupRoute.get('/getgroups', async(req:Request, res:Response)=>{
     try {
        const groups=await Group.find();
        res.status(200).json(groups);
            
     } catch (error) {
        console.error(error);
     }
});

export default getGroupRoute;