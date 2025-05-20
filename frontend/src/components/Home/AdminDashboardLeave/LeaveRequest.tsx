import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import { useAuth } from "../../Context/AuthContext";
import { faBed, faHomeUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Data {
  _id: string;
  employeeId: { _id: string | null; name: string } | null;
  status: string;
  reason: string;
  fromDate: string;
  toDate: string;
  leaveType: string;
  createdate: Date;
}

const LeaveRequest = () => {
  const backend_URI = import.meta.env.VITE_Backend_URI;
  const [leaveData, setLeaveData] = useState<Data[]>([]);
  const [existingRequests, setExistingRequests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const recordsPerPage = 10;
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // 2. Modify your fetch to filter pending requests
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const { data } = await axios.get(
          `${backend_URI}/api/employee/leave/todayRequests`
        );
        // Filter only pending requests
        setLeaveData(
          data.leaveRequests.filter((req: Data) => req.status === "Pending")
        );
      } catch (err) {
        console.error("Error fetching leave requests:", err);
        setError("Could not load leave requests.");
      }
    };
    fetchLeaveRequests();
  }, [backend_URI]);

  // 1. Update the status update handler
  const updateLeaveStatus = async (
    leaveId: string,
    status: "Approved" | "Denied"
  ) => {
    try {
      setExistingRequests((prev) => [...prev, leaveId]);

      // Immediate status update in UI
      setLeaveData((prev) =>
        prev.map((req) => (req._id === leaveId ? { ...req, status } : req))
      );

      await axios.put(`${backend_URI}/api/employee/confirmLeave/${leaveId}`, {
        status,
      });
    } catch (err) {
      console.error(`Error setting leave to ${status}:`, err);
      setError(`Could not ${status.toLowerCase()} leave.`);
      // Rollback status on error
      setLeaveData((prev) =>
        prev.map((req) =>
          req._id === leaveId ? { ...req, status: "Pending" } : req
        )
      );
    } finally {
      setExistingRequests((prev) => prev.filter((id) => id !== leaveId));
    }
  };

  const acceptLeave = (id: string) => updateLeaveStatus(id, "Approved");
  const rejectLeave = (id: string) => updateLeaveStatus(id, "Denied");

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    });

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-red-50">
        <div className="text-red-600 font-semibold text-lg p-4 rounded-lg bg-white shadow-lg">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  // Pagination
  const totalPages = Math.ceil(leaveData.length / recordsPerPage);
  const currentLeaveRequests = leaveData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="inline-flex overflow-hidden rounded-full shadow-sm">
          {/* Icon Circle */}
          <div className="bg-indigo-600 p-2 flex items-center justify-center">
            <div className="bg-white rounded-full p-2">
              <FontAwesomeIcon icon={faBed} className="text-cyan-500 text-xl" />
            </div>
          </div>

          {/* Text Panel */}
          <div className="bg-blue-500 px-4 py-4 flex items-center">
            <h1 className="text-white font-semibold lg:text-xl md:text-xl">
              Leave Requests List
            </h1>
          </div>
        </div>

        <div className="bg-white rounded-xl pt-4 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <tr>
                  {[
                    "#",
                    "Name",
                    "LeaveType",
                    "From – To",
                    "Reason",
                    "Status / Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left font-semibold text-sm "
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {currentLeaveRequests.map((req, i) => (
                  <tr key={req._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {(currentPage - 1) * recordsPerPage + i + 1}
                    </td>
                    <td className="px-6 py-4 font-poppins text-sm">
                      {req.employeeId?.name
                        ? req.employeeId.name.charAt(0).toUpperCase() +
                          req.employeeId.name.slice(1).toLowerCase()
                        : ""}
                    </td>
                    <td className="px-6 py-4 font-poppins text-sm">
                      {req.leaveType}
                    </td>
                    <td className="px-6 py-4 font-poppins text-sm">
                      {formatDate(req.fromDate)} – {formatDate(req.toDate)}
                    </td>
                    <td className="px-6 py-4 font-poppins text-sm">
                      {req.reason}
                    </td>
                    {/* <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            req.status === "Approved"
                              ? "py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                              : req.status === "Pending"
                              ? "focus:outline-none text-white bg-yellow-500 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-3 me-2 mb-2 dark:focus:ring-yellow-900"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {req.status}
                        </span>

                        {isAdmin && req.status !== "Approved" (
                          <>
                            <button
                              onClick={() => acceptLeave(req._id)}
                              disabled={existingRequests.includes(req._id)}
                              className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => rejectLeave(req._id)}
                              disabled={existingRequests.includes(req._id)}
                              className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td> */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            req.status === "Approved"
                              ? "py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                              : req.status === "Pending"
                              ? "focus:outline-none text-white bg-yellow-500 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-3 me-2 mb-2 dark:focus:ring-yellow-900"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {req.status}
                        </span>

                        {isAdmin && req.status !== "Approved" && (
                          <>
                            <button
                              onClick={() => acceptLeave(req._id)}
                              disabled={existingRequests.includes(req._id)}
                              className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => rejectLeave(req._id)}
                              disabled={existingRequests.includes(req._id)}
                              className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center px-6 py-4 border-t">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentPage === idx + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequest;
