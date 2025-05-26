import express from "express";
import multer from "multer"; // comment this line 06-05-2025
import Employee from "../../Models/userSchema.js";
import { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import cloudUpload from "../../Utils/EmpMulter.js"; //   Import From Chat Inside Folder Utils Inside EMPMulter -06-05-2025

const createroute = express.Router();

// Manually define __dirname

// set up local disk storage 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// set up local disk storage 07-05-2025
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
// 07-05-2025 File Format Newly Added
const localUpload = multer({
  storage: localStorage,
  fileFilter: (req, file, cb) => {
    if (["image/jpeg","image/png","image/jpg","image/webp","image/svg","image/heic","image/heif","image/ico"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG/PNG allowed"));
    }
  },
});

interface MulterRequest extends Request {
  file?: Express.Multer.File & { path?: string; url?: string };
}
// 07-05-2025 Changed to dynamice local and cloudinary both type now will work;
createroute.post(
  "/create",
  //  choose storage engine dynamically
  (req, res, next) => {
    const useCloud = req.query.storageType === "cloud";
    const uploader = useCloud ? cloudUpload.single("file") : localUpload.single("file");
    uploader(req, res, next); // It applies the file upload middleware manually.
    // Necessary because you’re choosing the upload method dynamically at request time.
    // Without this line, the file would not be parsed or saved, and req.file would be undefined
  },
  //  handle the actual save
  async (req: MulterRequest, res: Response, next: NextFunction) => {
    try {
      const useCloud = req.query.storageType === "cloud";
      // console.log("storageType:",req.body.storageType);
      
      let photoUrl = "";

      if (req.file) {
        if (useCloud) {
          // multer‑storage‑cloudinary attaches public URL to `.path`
          photoUrl = req.file.path || req.file.url || "";
          // console.log("PhotoUrl1:", photoUrl);
          
        } else {
          // diskStorage: just store the relative path for later serving
          photoUrl = `/uploads/${req.file.filename}`;
          // console.log("PhotoUrl2:", photoUrl);
        }
      }

      const newEmp = new Employee({
        ...req.body,
        photo: photoUrl,
        createdate: new Date(),
      });
      await newEmp.save();
      res
        .status(201)
        .json({ message: `Employee saved (${useCloud ? "Cloud" : "Local"})!` });
    } catch (err) {
      console.error("Error creating employee:", err);
      next(err);
    }
  }
);

export default createroute;

 // 06-05-2025 --- URL Format Store Image In Database (Uploads Directory Path)

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "../uploads")); // Correct destination path
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
//       cb(null, true);
//     } else {
//       cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.mimetype));
//     }
//   },
// });

 // 06-05-2025 --- URL Format Store Image In Database (Uploads Directory)

// createroute.post("/create", upload.single("file"), async (req: MulterRequest, res: Response, next: NextFunction) => {
//   try {
//     const newEmployee = new Employee({
//       ...req.body,
//       // photo: req.file ? path.join("/uploads", req.file.filename).replace(/\\/g, "/") : null,
//       photo:file
//       ? ((file as any).path || (file as any).url)
//       : "",
//       createdate: new Date(),
//     });

//     await newEmployee.save();
//     res.status(201).json({ message: "Employee created successfully!" });
//   } catch (error) {
//     console.error("Error creating employee:", error);
//     res.status(500).json({ message: "Failed", error });
//     next(error);
//   }
// });

 // 06-05-2025 --- URL Format Store Image In Database (Link)

//  interface MulterRequest extends Request {
//   file?: Express.Multer.File & {
//     path?: string;
//     url?: string;
//   };
// }



// createroute.post(
//   "/create",
//   upload.single("file"),
//   async (req: MulterRequest, res: Response, next: NextFunction) => {
//     try {
//       // Pull the multer file object off `req.file`
//       const uploaded = req.file as any; 
//       // CloudinaryStorage puts the uploaded file’s URL on `req.file.path`
//       // (or maybe `req.file.url` depending on your version)
//       const photoUrl = uploaded
//         ? uploaded.path || uploaded.url
//         : "";

//       const newEmployee = new Employee({
//         ...req.body,
//         photo: photoUrl,
//         createdate: new Date(),
//       });

//       await newEmployee.save();
//       res.status(201).json({ message: "Employee created successfully!" });
//     } catch (error) {
//       console.error("Error creating employee:", error);
//       res.status(500).json({ message: "Failed", error });
//       next(error);
//     }
//   }
// );


// export default createroute;