import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path from "path";
import http from "http";
import { Server } from "socket.io";

// Import routes
import createroute from "./Controllers/Employee/create.js";
import getroute from "./Controllers/Employee/getemployee.js";
import attendanceroute from "./Controllers/attendance/attendanceroute.js";
import getattendance from "./Controllers/attendance/getattendance.js";
import routerdelete from "./Controllers/Employee/deleteEmployee.js";
import routeredit from "./Controllers/Employee/updateEmployee.js";
import getmonthattendance from "./Controllers/attendance/getmonthattendance.js";
import leaveroute from "./Controllers/LeaveApply/createLeave.js";
import gettotalmonthroute from "./Controllers/attendance/getMonthTotally.js";
import addmembers from "./Controllers/ChatApplication/Group/addMembers.js";
import createGroup from "./Controllers/ChatApplication/Group/createGroup.js";
import getMessages from "./Controllers/ChatApplication/Group/getMessages.js";
import sendmsgroute from "./Controllers/ChatApplication/Group/sendMessage.js";
import authRoute from "./Controllers/User/authRoute.js";
import getGroupRoute from "./Controllers/ChatApplication/Group/getGroups.js";
import previewroute from "./Controllers/ChatApplication/Group/previewUrl.js";
import personrouter from "./Controllers/attendance/getPersonAttendance.js";
import groupeditroute from "./Controllers/ChatApplication/Group/editgroupname.js";
import dashboardroute from "./Controllers/attendance/dashboard.js";
import currentUserRoute from "./Controllers/attendance/currentUserReport.js";
import LeaveRouter from "./Controllers/LeaveApply/AvailableLeave.js";
import connect from "./Config/db.js";
import errorHandler from "./Middleware/Error.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const frontend_URL = ["http://192.168.1.8:5174"];
const backendURL = "192.168.1.8";

// Create HTTP and WebSocket servers
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: frontend_URL, methods: ["GET", "POST", "DELETE", "PUT"] },
});
export default io;

// Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(
  cors({
    origin: frontend_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Routes
// Employee routes
app.use("/api/employee", createroute); // Create employee
app.use("/api/employee", getroute); // Get employee
app.use("/api/employee", routerdelete); // Delete employee
app.use("/api/employee", routeredit); // Edit employee

// Attendance routes
app.use("/api/employee", dashboardroute); // dashboard api

app.use("/api/employee", attendanceroute); // Create attendance
app.use("/api/employee", getattendance); // Get today's attendance
app.use("/api/employee", getmonthattendance); // Get from to month's attendance
app.use("/api/employee", gettotalmonthroute); // Get total month's attendance by box

app.use("/api/employee", leaveroute); // Apply leave or permission by leave type
app.use("/api/employee", personrouter); //get single person attendance with box design
app.use("/api/employee", LeaveRouter); // get currentuser balance leave

app.use("/api/employee", currentUserRoute); //get attendance details after login the user attendance

//login logout routes
app.use("/api/auth", authRoute); //register user, login, logout,check

// Group routes
app.use("/api/employee/groups", addmembers); // Add members to a group
app.use("/api/employee/groups", createGroup); // Create group
app.use("/api/employee/groups", getGroupRoute); // get all group
app.use("/api/employee/groups", getMessages); // Get messages
app.use("/api/employee/groups", sendmsgroute); // Send message with optional file
app.use("/api/employee/groups", previewroute); //preview image from link
app.use("/api/employee/groups", groupeditroute); //groupname edit and delete

// Default route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to the API" });
});

app.use(errorHandler);

// WebSocket Setup
io.on("connection", (socket) => {
  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    // console.log(`User joined group: ${groupId}`);
  });

  // Disconnect
  socket.on("disconnect", (groupId) => {
    socket.leave(groupId);
    // console.log("Leaving group");
  });
});

// Start server
const startServer = async () => {
  await connect();
  server.listen(port, () => {
    console.log(`Server is running at http://${backendURL}:${port}`);
  });
};

startServer();
