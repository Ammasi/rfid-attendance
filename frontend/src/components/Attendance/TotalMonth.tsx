import React, { useEffect, useState } from "react";

// Define the type for employee records
interface EmployeeRecord {
  _id?: string;
  name: string;
  employeecode: string;
  rfidcardno: string;
  totalPresentDays: number;
  totalLateDays: number;
  totalEarlyDays: number;
  totalPermissionDays: number;
  totalSickLeaves: number;
  totalCasualLeaves: number;
  totalAbsentDays: number;
}

interface Total {
  menu:boolean;
}

// All Employees Grid Wise Report
const TotalMonth: React.FC<Total> = ({menu}) => {
  const backend_URI = import.meta.env.VITE_Backend_URI;
  const [total, setTotal] = useState<EmployeeRecord[]>([]);

  const fetchTotalMonth = async () => {
    try {
      const res = await fetch(
        `${backend_URI}/api/employee/attendance/totalmonth`
      );
      const json = await res.json();

      if (!res.ok) {
        // if the server returns { status: "error", message: "xxx" }
        throw new Error(json.message || "Failed to fetch monthly details");
      }

      // Handle both: direct array, or { data: [...] } wrapper
      const payload: EmployeeRecord[] = Array.isArray(json)
        ? json
        : json.data || [];

      setTotal(payload);
    } catch (err: any) {
      console.error("Error fetching TotalMonth:", err);
    }
  };

  useEffect(() => {
    fetchTotalMonth();
  }, []);

  return (
    <div className={`${menu? "pl-36" : "pl-24"} pt-5  bg-gradient-to-b from-[#dde6f4] to-[#e4ebfd] w-screen min-h-screen box-border `} >
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-center mb-5 font-lato italic">
          Employee Attendance
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {total.map((record) => (
            <div
              key={record._id || record.employeecode}
              className="relative bg-gradient-to-b from-[#c6dafe] to-[#f6f6f8] shadow-lg rounded-tr-3xl rounded-tl-3xl rounded-bl-3xl border border-gray-300 p-5"
            >
              {/* Header Pill */}
              <div className="absolute -top-3 left-1/2 w-52 flex items-center justify-center transform -translate-x-1/2 bg-[#c2c2f7] border border-blue-300 text-black px-4 py-1 rounded-full text-sm font-bold font-poppins">
                {record.name.charAt(0).toUpperCase() + record.name.slice(1).toLowerCase()}
              </div>

              {/* Details */}
              <div className="mt-5 text-center text-sm font-poppins space-y-1">
                <p>
                  <strong>Employee Code:</strong> {record.employeecode}
                </p>
                <p>
                  <strong>Present Days:</strong> {record.totalPresentDays}
                </p>
                <p>
                  <strong>Absent Days:</strong> {record.totalAbsentDays}
                </p>
                <p>
                  <strong>Sick Leave Days:</strong> {record.totalSickLeaves}
                </p>
                <p>
                  <strong>Casual Leave Days:</strong> {record.totalCasualLeaves}
                </p>
                <p>
                  <strong>Early Going Days:</strong> {record.totalEarlyDays}
                </p>
                <p>
                  <strong>Late Comming Days:</strong> {record.totalLateDays}
                </p>
                <p>
                  <strong>Permission Days:</strong> {record.totalPermissionDays}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TotalMonth;
