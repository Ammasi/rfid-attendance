import express from 'express'
import { Request,Response } from 'express';
import Employee from '../../Models/userSchema.js';

const getroute = express.Router();
// get employee
getroute.get("/", async(req:Request, res:Response)=>{
    try {
        const employees=await Employee.find();
        res.status(200).send(employees);
    } catch (error) {
        console.log("Error fetching employee",error);
        res.status(500).send({message:"server error"})
        
    }
})
// get employee
getroute.get("/:id", async(req:Request, res:Response):Promise<any>=>{
    const{id}=req.params;
    try {
        const employee=await Employee.findById(id);
        if(!employee){
           return res.status(404).send({message:"Employee Not Found"})
        }
        res.status(200).send(employee);
    } catch (error) {
        console.log("Error fetching employee:", error);
        res.status(500).send({message:"Server Error"});    
    }
})

export default getroute;