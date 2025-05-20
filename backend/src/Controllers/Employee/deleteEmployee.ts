import { Request, Response } from "express";
import Employee from "../../Models/userSchema.js";
import express from "express";

const routerdelete = express.Router();

// Delete employee
routerdelete.delete("/:id", async (req: Request, res: Response):Promise<any> => {
  const { id } = req.params; // Extract the ID from the route parameters

  try {
    const deletedEmployee = await Employee.findByIdAndDelete(id);

    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default routerdelete;
