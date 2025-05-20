import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faIdCard,
  faUserClock,
  faCheckCircle,
  faBed,
  faUmbrellaBeach,
  faTimesCircle,
  faClock,
  faSignOutAlt,
  faHandPaper,
  faFileAlt,
  faUser,
  faCode,
  faCalendarTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../Context/AuthContext";

interface Employee {
  _id: string;
  rfidcardno: string;
  photo: string;
  name: string;
  dob: string;
  email: string;
  mobileno: string;
  employeecode: string;
  designation: string;
  department: string;
  gender: string;
  maritalstatus: string;
  joiningdate: string;
  address: string;
}

// Report By RFID Card Number with grid wise
const SinglePersonAttendance = () => {
  const backend_URI = import.meta.env.VITE_Backend_URI;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [rfidCardNo, setRfidCardNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isAdmin, employeeRfid, employeeCode, userName } = useAuth();

  const handleSubmit = async () => {
    if (!fromDate || !toDate || (isAdmin && !rfidCardNo)) {
      // The condition checks !rfidCardNo (if the RFID field is empty).
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${backend_URI}/api/employee/attendance/person?` +
          new URLSearchParams({
            fromdate: fromDate,
            todate: toDate,
            rfidcardno: isAdmin ? rfidCardNo : employeeRfid,
          })
      );

      if (!response.ok) {
        throw new Error("Data not found");
      }

      const data = await response.json();

      setAttendanceData(data);
      setError("");
    } catch (err) {
      setError("Error fetching data. Please check inputs and try again.");
      setAttendanceData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchemployee = async () => {
      try {
        const response = await fetch(`${backend_URI}/api/employee`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: Employee[] = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employee:", error);
        setError("Failed to fetch employee data.");
      }
    };
    fetchemployee();
  }, []);

  // bg-gradient-to-b from-gray-600 to-gray-600
  return (
    // <div className="min-h-screen bg-indigo-950 p-8">
      <div className="mx-auto max-w-7xl bg-gray-800 rounded-xl shadow-lg p-8 min-h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <FontAwesomeIcon icon={faFileAlt} className="text-2xl text-white" />
            <h1 className="text-3xl font-bold font-lato italic text-white">
              Employee Attendance Report
            </h1>
          </div>

          {!attendanceData && (
            <div className="space-y-6 mb-6 bg-[#444950] p-6 rounded-2xl">
              {!isAdmin && (
              <div className="flex justify-between gap-8">
                <div className="flex w-full space-y-1 gap-4 bg-gray-600 px-4 py-4 rounded-xl">
                  <div className="bg-gray-500 p-2 rounded-lg">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-2xl text-gray-300"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-100">Name</p>
                    <p className="font-medium text-xs text-gray-100">
                      {userName}
                    </p>
                  </div>
                </div>
                <div className="flex w-full space-y-1 gap-4 bg-gray-600 px-4 py-4 rounded-xl">
                  <div className="bg-gray-500 p-2 rounded-lg">
                    <FontAwesomeIcon
                      icon={faCode}
                      className="text-2xl text-gray-300"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-100">EmployeeCode</p>
                    <p className="font-medium text-xs text-gray-100">
                      {employeeCode}
                    </p>
                  </div>
                </div>
                <div className="flex w-full space-y-1 gap-4 bg-gray-600 px-4 py-4 rounded-xl">
                  <div className="bg-gray-500 p-2 rounded-lg">
                    <FontAwesomeIcon
                      icon={faIdCard}
                      className="text-2xl text-gray-300"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-100">RfidCardNo</p>
                    <p className="font-medium text-xs text-gray-100">
                      {employeeRfid}
                    </p>
                  </div>
                </div>
              </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="mr-2 text-white"
                    />
                    From Date:
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-gray-200 bg-gray-200 px-4 py-3 focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="mr-2 text-white"
                    />
                    To Date:
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-gray-200 bg-gray-200 px-4 py-3 focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <FontAwesomeIcon
                        icon={faIdCard}
                        className="mr-2 text-white"
                      />
                      RFID Card Number:
                    </label>
                    {/* <input
                    type="text"
                    className="w-full rounded-lg border border-gray-200 bg-gray-200 px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                    value={rfidCardNo}
                    onChange={(e) => setRfidCardNo(e.target.value)}
                    placeholder="Enter RFID Card Number"
                  /> */}
                    <select
                      className="w-full rounded-lg border border-gray-200 bg-gray-200 px-4 py-3 text-gray-700 focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                      value={rfidCardNo}
                      onChange={(e) => setRfidCardNo(e.target.value)}
                    >
                      <option value="">Select RFID Card Number</option>
                      {employees.map((emp, rfid) => (
                        <option key={rfid} value={emp.rfidcardno} className="text-sm font-poppins">
                          {emp.name} - {emp.rfidcardno}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full md:w-auto px-8 py-3 bg-indigo-800 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {loading ? "Generating Report..." : "Generate Report"}
                  </button>
                </div>
                {error && (
                  <div className="text-red-500 text-sm mt-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faTimesCircle} />
                    {error}
                  </div>
                )}
              </div>
            </div>
          )}

          {attendanceData && (
            <div className="space-y-8 bg-[#363a40] p-6 rounded-xl">
              {/* Employee Information Section */}
              <div className="bg-gray-700  rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <FontAwesomeIcon
                    icon={faUserClock}
                    className="text-xl text-gray-500"
                  />
                  <h2 className="text-xl font-semibold text-gray-100">
                    Employee Information
                  </h2>
                </div>
                <hr className="border-gray-700 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex space-y-1 gap-4 bg-gray-600 px-4 py-4 rounded-xl">
                    <div className="bg-gray-500 p-2 rounded-lg">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-2xl text-gray-300"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-100">Name</p>
                      <p className="font-medium text-xs text-gray-100">
                        {attendanceData.employee.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 space-y-1 bg-gray-600 px-4 py-4 rounded-xl">
                    <div className="bg-gray-500 p-2 rounded-lg">
                      <FontAwesomeIcon
                        icon={faCode}
                        className="text-2xl text-gray-300"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-100">Employee Code</p>
                      <p className="font-medium text-gray-100 text-xs">
                        {attendanceData.employee.employeecode}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 space-y-1 bg-gray-600 px-4 py-4 rounded-xl">
                    <div className="bg-gray-500 p-2 rounded-lg">
                      <FontAwesomeIcon
                        icon={faIdCard}
                        className="text-2xl text-gray-300"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-100">RFID Card No</p>
                      <p className="font-medium text-gray-100 text-xs">
                        {attendanceData.employee.rfidcardno}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 space-y-1 bg-gray-600 px-4 py-4 rounded-xl">
                    <div className="bg-gray-500 p-2 rounded-lg">
                      <FontAwesomeIcon
                        icon={faCalendarTimes}
                        className="text-2xl text-gray-300"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-100">Date Range</p>
                      <p className="font-medium text-gray-100 text-xs">
                        {attendanceData.fromDate} - {attendanceData.toDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Summary Section */}
              <div className="bg-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-xl text-emerald-400"
                  />
                  <h2 className="text-xl font-semibold text-gray-100">
                    Attendance Summary
                  </h2>
                </div>
                <hr className="border-gray-700 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Present Days */}
                  <div className="bg-green-500/20 p-4 rounded-lg flex items-center gap-4">
                    <div className="bg-green-500/30 p-3 rounded-lg">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-2xl text-green-400"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-green-300 mb-1">
                        Present Days
                      </p>
                      <p className="text-2xl font-bold text-green-400">
                        {attendanceData.summary.present}
                      </p>
                    </div>
                  </div>

                  {/* Leave Days */}
                  <div className="bg-purple-700/20 p-4 rounded-lg flex items-center gap-4">
                    <div className="bg-purple-700/30 p-3 rounded-lg">
                      <FontAwesomeIcon
                        icon={faBed}
                        className="text-2xl text-purple-400"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-purple-300 mb-1">Leave Days</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {attendanceData.summary.leave}
                      </p>
                    </div>
                  </div>

                  {/* Company Holidays */}
                  <div className="bg-blue-700/20 p-4 rounded-lg flex items-center gap-4">
                    <div className="bg-blue-700/30 p-3 rounded-lg">
                      <FontAwesomeIcon
                        icon={faUmbrellaBeach}
                        className="text-2xl text-blue-400"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-blue-300 mb-1">
                        Company Holidays
                      </p>
                      <p className="text-2xl font-bold text-blue-400">
                        {attendanceData.summary.companyLeave}
                      </p>
                    </div>
                  </div>

                  {/* Absent Days */}
                  <div className="bg-red-500/20 p-4 rounded-lg flex items-center gap-4">
                    <div className="bg-red-500/30 p-3 rounded-lg">
                      <FontAwesomeIcon
                        icon={faTimesCircle}
                        className="text-2xl text-red-400"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-red-300 mb-1">Absent Days</p>
                      <p className="text-2xl font-bold text-red-400">
                        {attendanceData.summary.absent}
                      </p>
                    </div>
                  </div>

                  {/* Total Days */}
                  <div className="bg-teal-500/20 p-4 rounded-lg flex items-center gap-4">
                    <div className="bg-teal-500/30 p-3 rounded-lg">
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="text-2xl text-teal-400"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-teal-300 mb-1">Total Days</p>
                      <p className="text-2xl font-bold text-teal-400">
                        {attendanceData.summary.totalDays}
                      </p>
                    </div>
                  </div>

                  {/* Late Coming Days */}
                  <div className="bg-gray-600 p-4 rounded-lg flex items-center gap-4">
                    <div className="bg-gray-500 p-3 rounded-lg">
                      <FontAwesomeIcon
                        icon={faClock}
                        className="text-2xl text-gray-300"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300 mb-1">
                        Late Coming Days
                      </p>
                      <p className="text-2xl font-bold text-gray-100">
                        {attendanceData.summary.late}
                      </p>
                    </div>
                  </div>

                  {/* Early Going Days */}
                  <div className="bg-pink-500/20 p-4 rounded-lg flex items-center gap-4">
                    <div className="bg-pink-500/30 p-3 rounded-lg">
                      <FontAwesomeIcon
                        icon={faSignOutAlt}
                        className="text-2xl text-pink-400"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-pink-300 mb-1">
                        Early Going Days
                      </p>
                      <p className="text-2xl font-bold text-pink-400">
                        {attendanceData.summary.early}
                      </p>
                    </div>
                  </div>

                  {/* Permission Days */}
                  <div className="bg-lime-500/20 p-4 rounded-lg flex items-center gap-4">
                    <div className="bg-lime-500/30 p-3 rounded-lg">
                      <FontAwesomeIcon
                        icon={faHandPaper}
                        className="text-2xl text-lime-400"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-lime-300 mb-1">
                        Permission Days
                      </p>
                      <p className="text-2xl font-bold text-lime-400">
                        {attendanceData.summary.permission}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    // </div>
  );
};

export default SinglePersonAttendance;
