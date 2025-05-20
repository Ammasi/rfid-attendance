import { useEffect, useState } from "react";
import { useAuth } from "../../Context/AuthContext";

interface AttendanceData {
  fromDate: string;
  toDate: string;
  employee: {
    name: string;
    employeecode: string;
    rfidcardno: string;
    email: string;
  };
  summary: {
    totalDays: number;
    present: number;
    late: number;
    early: number;
    permission: number;
    leave: number;
    companyLeave: number;
    absent: number;
  };
  dailyStatuses: {
    date: string;
    status: string;
    checkInTime?: string;
    checkOutTime?: string;
    details?: string;
  }[];
}

const CurrentUser = () => {
  const backend_URI = import.meta.env.VITE_Backend_URI;
  const { userEmail } = useAuth();
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const currentUserEmail = userEmail;
        if (!currentUserEmail) {
          alert("User email not found in local storage.");
          return;
        }

        const response = await fetch(
          `${backend_URI}/api/employee/attendance/currentuser`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-user-email": currentUserEmail,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch attendance data");
        }
        const data: AttendanceData = await response.json();
        setAttendanceData(data);
      } catch (err: any) {
        console.error(err);
      }
    };

    fetchAttendance();
  }, [backend_URI, userEmail]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-gradient-to-b from-[#c6dafe] to-[#f6f6f8] shadow-md rounded-lg p-8 w-full max-w-md">
        {attendanceData ? (
          <>
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold">Attendance Data</h2>
              <p className="text-gray-600">
                {attendanceData.fromDate} - {attendanceData.toDate}
              </p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Employee Info</h3>
              <hr className="border-gray-400 mb-1 mt-1"/>
              <p>
                <strong>Name:</strong> {attendanceData.employee.name.charAt(0).toUpperCase() + attendanceData.employee.name.slice(1).toLowerCase()}
              </p>
              <p>
                <strong>Email:</strong> {attendanceData.employee.email}
              </p>
              <p>
                <strong>RFID:</strong> {attendanceData.employee.rfidcardno}
              </p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Summary</h3>
              <p>
                <strong>Total Days:</strong> {attendanceData.summary.totalDays}
              </p>
              <p>
                <strong>Present:</strong> {attendanceData.summary.present}
              </p>
              <p>
                <strong>Absent:</strong> {attendanceData.summary.absent}
              </p>
              <p>
                <strong>Company Leave:</strong> {attendanceData.summary.companyLeave}
              </p>
              <p>
                <strong>Early:</strong> {attendanceData.summary.early}
              </p>
              <p>
                <strong>Late:</strong> {attendanceData.summary.late}
              </p>
              <p>
                <strong>Leave:</strong> {attendanceData.summary.leave}
              </p>
              <p>
                <strong>Permission:</strong> {attendanceData.summary.permission}
              </p>
            </div>
          </>
        ) : (
          <p className="text-center">Loading attendance data...</p>
        )}
      </div>
    </div>
  );
};

export default CurrentUser;
