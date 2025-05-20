// File Created for Image Change to Cloudinary Link 06-05-2025
import path from "path";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./CloudinaryConfig.js";

// set up Cloudinary storage
const cloudStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: "employeeimages",
    resource_type: "auto",
    public_id: `${Date.now()}-${path.parse(file.originalname).name}`, // Unique ID
    overwrite: false,
    format: file.mimetype.split("/")[1],
    
  }),
  
});

const cloudUpload = multer({ storage: cloudStorage });
export default cloudUpload;
