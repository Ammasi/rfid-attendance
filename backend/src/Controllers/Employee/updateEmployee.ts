import express from "express";
import { Response, Request } from "express";
import Employee from "../../Models/userSchema.js";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import cloudUpload from "../../Utils/EmpMulter.js";

const routeredit = express.Router();

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local storage setup (same as create)
const localStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const localUpload = multer({
  storage: localStorage,
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "image/svg+xml",
      "image/heic",
      "image/heif",
      "image/x-icon",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPG/PNG/WebP/SVG/HEIC/ICO allowed"));
  },
});

interface MulterRequest extends Request {
  file?: Express.Multer.File & { path?: string; url?: string };
}
// changed update id image can update both cloudinary and dynamic 08-05-2025
routeredit.put("/:id",
  (req,res,next) => {
    const useCloud = req.query.storageType === "cloud";
    const uploader = useCloud ? cloudUpload.single("file") : localUpload.single("file");
    uploader(req,res,next);
  },async (req: MulterRequest, res: Response):Promise<any> => {
     const { id } = req.params;
      
      // Check if `id` is a valid ObjectId
     if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

  try {
   const useCloud = req.query.storageType === "cloud";
   let photoUrl:string | undefined;

   if(req.file){
    photoUrl = useCloud
    ? req.file.path || req.file.url || ""
    : `/uploads/${req.file.filename}`
   }
   
   const updateData:any = {...req.body};
   if(photoUrl) {
    updateData.photo = photoUrl;
   }
      
    const updatedEmployee = await Employee.findByIdAndUpdate(id,
       updateData, {
      new: true, // Return the updated document
      runValidators: true, // Enforce schema validation
    });

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res
      .status(200)
      .json({ message: "Employee updated successfully", updatedEmployee });
      // console.log(updatedEmployee);
      
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

export default routeredit;
