import { faCalendar, faHomeUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

const DateWise: React.FC = () => {
  const backend_URI = import.meta.env.VITE_Backend_URI;
  const [attendance, setAttendance] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);
  const [maxPageButtons, setMaxPageButtons] = useState<number>(5);

  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  const formatTime = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getAttendance = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both dates.");
      return;
    }
    try {
      const res = await fetch(
        `${backend_URI}/api/employee/attendance/today?from=${fromDate}&to=${toDate}`
      );
      const data = await res.json();
      if (res.ok) {
        setAttendance(data);
        setCurrentPage(1);
      } else {
        toast.error(data.message || "Error fetching attendance.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to the server.");
    }
  };

  useEffect(() => {
    getAttendance();
  }, [fromDate, toDate]);

  const totalPages = Math.ceil(attendance.length / recordsPerPage);
  const idxLast = currentPage * recordsPerPage;
  const idxFirst = idxLast - recordsPerPage;
  const currentAttendances = attendance.slice(idxFirst, idxLast);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

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
  const pageNumbers = [];
  for (let p = startPage; p <= endPage; p++) pageNumbers.push(p);

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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const exportToExcel = () => {
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
        formatDate(rec.date),
        rec.name,
        rec.employeecode,
        formatTime(rec.checkInTime),
        formatTime(rec.checkOutTime),
        rec.status,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    XLSX.writeFile(
      wb,
      `Attendance_Report_${fromDate.replace(/-/g, "")}_to_${toDate.replace(
        /-/g,
        ""
      )}.xlsx`
    );
  };
  // changed from to date functionality add 08-05-2025
  // changed pagination 09-05-2025
  return (
    <div className="p-4 md:p-6 bg-gradient-to-b from-[#f8f9fc] to-[#e9ecef] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="inline-flex  overflow-hidden rounded-full shadow-sm">
          {/* Icon Circle */}
          <div className="bg-indigo-600 p-3 flex items-center justify-center">
            <div className="bg-white rounded-full p-2 px-3">
              <FontAwesomeIcon
                icon={faCalendar}
                className="text-cyan-500 text-lg"
              />
            </div>
          </div>

          {/* Text Panel */}
          <div className="bg-blue-500 px-4 py-4 flex items-center">
            <h1 className="text-white font-semibold lg:text-xl md:text-xl">
              Attendance Report
            </h1>
          </div>
        </div>

        {/* Date Filter & Export */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 w-fit h-fit flex items-center mt-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Export to Excel
          </button>
        </div>

        {/* Attendance Table */}
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
                    Employee
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
                {attendance.length ? (
                  currentAttendances.map((rec, idx) => (
                    <tr key={`${rec.name}-${rec.date}-${idx}`}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {idxFirst + idx + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(rec.date)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {rec.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {rec.employeecode}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatTime(rec.checkInTime)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatTime(rec.checkOutTime)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            rec.status
                          )}`}
                        >
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No attendance records found
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
                {/* Left: selectors */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center">
                    <label className="text-sm text-gray-700 mr-2">
                      Records per page:
                    </label>
                    <select
                      className="px-2 py-1 border rounded"
                      value={recordsPerPage}
                      onChange={(e) => {
                        setRecordsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      {[5, 10, 20, 50].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center">
                    <label className="text-sm text-gray-700 mr-2">
                      Page buttons:
                    </label>
                    <select
                      className="px-2 py-1 border rounded"
                      value={maxPageButtons}
                      onChange={(e) => {
                        setMaxPageButtons(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      {[3, 5, 7, 9].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right: pagination controls */}
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

export default DateWise;
