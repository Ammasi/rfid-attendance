// src/components/MonthWise.tsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";

interface Employee {
  _id: string;
  name: string;
  employeecode: string;
}

interface AttendanceRow {
  date: string; // ISO date
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
}

const MonthWise: React.FC = () => {
  const backend_URI = import.meta.env.VITE_Backend_URI as string;

  // Employees & selection
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  // Date filters
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Attendance rows
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);

  // Pagination & UI
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);
  const [maxPageButtons, setMaxPageButtons] = useState<number>(5);

  // Fetch employee list once
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${backend_URI}/api/employee`);
        if (!res.ok) throw new Error("Failed to fetch employees");
        const data: Employee[] = await res.json();
        setEmployees(data);
      } catch (err) {
        console.error(err);
        toast.error("Unable to load employees");
      }
    })();
  }, [backend_URI]);

  // Fetch attendance whenever filters change
  useEffect(() => {
    if (!fromDate || !toDate || !selectedEmployeeId) return;

    (async () => {
      try {
        const res = await fetch(
          `${backend_URI}/api/employee/attendance/month?from=${fromDate}&to=${toDate}&employeeId=${selectedEmployeeId}`
        );
        const data = (await res.json()) as AttendanceRow[];
        if (!res.ok) {
          toast.error((data as any).message || "Error fetching attendance");
        } else {
          setAttendance(data);
          setCurrentPage(1);
        }
      } catch (err) {
        console.error(err);
        toast.error("Server error fetching attendance");
      }
    })();
  }, [backend_URI, fromDate, toDate, selectedEmployeeId]);

  // Helpers to format date/time
  const formatDateLabel = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  const formatTimeLabel = (iso?: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Pagination calculations
  const totalPages = Math.ceil(attendance.length / recordsPerPage);
  const idxLast = currentPage * recordsPerPage;
  const idxFirst = idxLast - recordsPerPage;
  const currentAttendances = attendance.slice(idxFirst, idxLast);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Sliding window of page buttons
  let startPage = 1;
  let endPage = Math.min(totalPages, maxPageButtons);
  if (totalPages > maxPageButtons) {
    const half = Math.floor(maxPageButtons / 2);
    if (currentPage > half && currentPage <= totalPages - half) {
      startPage = currentPage - half;
      endPage = currentPage + half;
    } else if (currentPage > totalPages - maxPageButtons + 1) {
      startPage = totalPages - maxPageButtons + 1;
      endPage = totalPages;
    }
  }
  const pageNumbers: number[] = [];
  for (let p = startPage; p <= endPage; p++) pageNumbers.push(p);

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "present":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      case "half-day":
        return "bg-blue-100 text-blue-800";
      case "sunday":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // added this function to export to excel sheet data 09-05-2025
  // Export current view to Excel
  const exportToExcel = () => {
    const emp = employees.find((e) => e._id === selectedEmployeeId);
    const wsData = [
      [
        "S.No",
        "Date",
        "Employee Name",
        "Employee Code",
        "Check In",
        "Check Out",
        "Status",
      ],
      ...attendance.map((rec, i) => [
        i + 1,
        formatDateLabel(rec.date),
        emp?.name ?? "",
        emp?.employeecode ?? "",
        formatTimeLabel(rec.checkInTime),
        formatTimeLabel(rec.checkOutTime),
        rec.status,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Monthly Attendance");
    XLSX.writeFile(
      wb,
      `Attendance_${emp?.employeecode ?? "ALL"}_${fromDate}_to_${toDate}.xlsx`
    );
  };

  // changed to add employee wise filter in attendance 09-05-2025
  return (
    <div className="p-4 md:p-6 bg-gradient-to-b from-[#f8f9fc] to-[#e9ecef] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex  overflow-hidden rounded-full shadow-sm">
            {/* Icon Circle */}
            <div className="bg-indigo-600 p-3 flex items-center justify-center">
              <div className="bg-white rounded-full p-2 px-3">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="text-cyan-500 text-lg"
                />
              </div>
            </div>

            {/* Text Panel */}
            <div className="bg-blue-500 px-4 py-4 flex items-center">
              <h1 className="text-white font-semibold lg:text-xl md:text-xl">
                Monthly Attendance Report
              </h1>
            </div>
          </div>

          <div className="flex items-center pt-2 text-gray-600">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
            <span className="text-sm">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 flex flex-col md:flex-row gap-6">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
              >
                <option value="">-- Select --</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.employeecode})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={exportToExcel}
              className="mt-8 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Export to Excel
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    S.No
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Check In
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Check Out
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentAttendances.length > 0 ? (
                  currentAttendances.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {idxFirst + idx + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDateLabel(row.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatTimeLabel(row.checkInTime)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatTimeLabel(row.checkOutTime)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            row.status
                          )}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total & Pagination */}
          {attendance.length > 0 && (
            <>
              <div className="px-6 py-2 text-sm text-gray-700">
                Total Records: {attendance.length}
              </div>
              <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center">
                {/* Left selectors */}
                <div className="flex items-center gap-6">
                  <div>
                    <label className="text-sm mr-2">Records per page:</label>
                    <select
                      className="px-2 py-1 border rounded"
                      value={recordsPerPage}
                      onChange={(e) => {
                        setRecordsPerPage(+e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      {[5, 10, 20, 50].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm mr-2">Page buttons:</label>
                    <select
                      className="px-2 py-1 border rounded"
                      value={maxPageButtons}
                      onChange={(e) => {
                        setMaxPageButtons(+e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      {[3, 5, 7].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pagination nav */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    «
                  </button>
                  {pageNumbers.map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`px-3 py-1 rounded-md text-sm ${
                        currentPage === p
                          ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    »
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthWise;
