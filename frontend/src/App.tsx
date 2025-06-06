import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import Form from "./components/Form/Form";
import "./index.css";
import RFIDscanner from "./components/CardScaner/RFIDscanner";
import LeaveApply from "./components/Form/LeaveApply";
import Login from "./components/UserLogin/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "./components/Context/AuthContext";
import InternalError from "./components/Error/500Page";
import NotFoundPage from "./components/Error/404Page";
import Navbar from "./components/Home/Navbar/Navbar";
import HomeDashboard from "./components/Home/Dashboard/HomeDashboard";
import Dashboard from "./components/Home/EmployeeList/Dashboard";
import DateWise from "./components/Attendance/DateWise";
import MonthWise from "./components/Attendance/MonthWise";
import TotalMonth from "./components/Attendance/TotalMonth";
import SinglePersonAttendance from "./components/Attendance/SinglePersonAttendance";
import CurrentUser from "./components/Home/CurrentUserPage/CurrentUser";
import ChatApp from "./components/ChatApplication/ChatBox";
import LeaveRequest from "./components/Home/AdminDashboardLeave/LeaveRequest";
import { useEffect } from "react";
import {
  registerServiceWorkerAndSubscribe,
  sendSubscriptionToServer,
} from "./pushSetup";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { authorized, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return authorized ? <Navbar /> : <Navigate to="/login" replace />;
  return children;
};

const ApplyLeaveRedirect: React.FC = () => {
  const { currentUserId } = useAuth();
  // if you ever need to handle loading or missing ID, add logic here
  return <Navigate to={`/applyleave/${currentUserId}`} replace />;
};

const App: React.FC = () => {
  const { currentUserId } = useAuth();

  useEffect(() => {
    if (!currentUserId) return;
    registerServiceWorkerAndSubscribe().then((subscription) => {
      if (subscription) {
        sendSubscriptionToServer(subscription);
      }
    });
  }, [currentUserId]);
  
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/applyleave"
          element={
            <ProtectedRoute>
              <ApplyLeaveRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navbar />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomeDashboard />} />
          <Route path="/home" element={<HomeDashboard />} />
          <Route path="/form" element={<Form />} />
          <Route path="/chat" element={<ChatApp />} />
          <Route path="/chat/:groupId" element={<ChatApp />} />
          <Route path="/edit/:id" element={<Form />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leave-request" element={<LeaveRequest />} />
          <Route path="/datewise" element={<DateWise />} />
          <Route path="/monthwise" element={<MonthWise />} />
          <Route path="/totalmonth" element={<TotalMonth menu={false} />} />
          <Route
            path="/person-attendance"
            element={<SinglePersonAttendance />}
          />
          <Route path="/currentuser" element={<CurrentUser />} />
          <Route path="/rfidscanner" element={<RFIDscanner />} />
          <Route path="/applyleave" element={<LeaveApply />} />
          <Route path="/applyleave/:employeeId" element={<LeaveApply />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/servererror" element={<InternalError />} />
        </Route>
        {/* Fallback if not logged in */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

export default App;
