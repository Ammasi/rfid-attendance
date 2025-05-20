import axios from "axios";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../Context/AuthContext";

interface FormData {
  leaveType: string;
  fromDate: Date | null;
  toDate: Date | null;
  reason: string;
}

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

interface Available {
  // _id: string;
  defaultSickLeavedays: number;
  defaultPersonalLeavedays: number;
  sickLeaveAvailable: number;
  personalLeaveAvailable: number;
  takenPersonalLeave: number;
  takenSickLeave: number;
}

const LeaveApply = () => {
  const backend_URI = import.meta.env.VITE_Backend_URI;
  const { employeeId } = useParams();
  const { currentUserId } = useAuth();
  const [leaveData, setLeaveData] = useState<Data[]>([]);
  const [availableLeave, setAvailableLeave] = useState<Available[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const recordsPerPage = 10;
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    leaveType: "choose",
    fromDate: null,
    toDate: null,
    reason: "",
  });

  // Reset dates when user switches leave type back to “choose”
  useEffect(() => {
    if (formData.leaveType === "choose") {
      setFormData((f) => ({ ...f, fromDate: null, toDate: null }));
    }
  }, [formData.leaveType]);

  const onChangeHandler = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitData = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.leaveType === "choose") {
      alert("Please select a leave type.");
      return;
    }
    if (!formData.fromDate || !formData.toDate) {
      alert("Please pick both From and To dates.");
      return;
    }

    // Build payload, converting to ISO strings
    const payload = {
      employeeId,
      leaveType: formData.leaveType,
      fromDate: formData.fromDate.toISOString(),
      toDate: formData.toDate.toISOString(),
      reason: formData.reason.trim(),
    };

    try {
      await axios.post(`${backend_URI}/api/employee/createleave`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      alert("Leave applied successfully!");
      setFormData({
        leaveType: "choose",
        fromDate: null,
        toDate: null,
        reason: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to apply for leave.");
    }
  };

  // fetch leave requests
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get(
          `${backend_URI}/api/employee/user/leave/Request/${employeeId}`
        );
        setLeaveData(response.data.leaveRequests);
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      }
    };
    fetchLeaveRequests();
  }, [employeeId]);

  // fetch leave availability
  useEffect(() => {
    const fetchLeaveAvailable = async () => {
      try {
        const response = await axios.get(
          `${backend_URI}/api/employee/leave/available/${employeeId}`
        );
        const data = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setAvailableLeave(data);
      } catch (error) {
        console.error("Error fetching leave available:", error);
      }
    };
    fetchLeaveAvailable();
  }, [employeeId]);

  // Whether to show time picker
  const isPermission = formData.leaveType === "Permission";

  // Pagination
  const totalPages = Math.ceil(leaveData.length / recordsPerPage);
  const currentLeaveRequests = leaveData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

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

  return (
    <div className="min-h-screen flex flex-col  items-center w-full  bg-gradient-to-r from-slate-400 to-blue-300 p-4">
      <div className="w-full max-w-3xl">
        {" "}
        {/* changed for width decrease */}
        <div className="flex gap-8 w-full min-h-fit ">
          <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-xl w-full max-w-2xl ">
            <h2 className="text-2xl text-center font-bold text-blue-700 mb-6">
              Leave Application
            </h2>
            <form onSubmit={submitData} className="space-y-2">
              {/* Leave Type */}
              <div>
                <label htmlFor="leaveType" className="block font-medium">
                  Leave Type
                </label>
                <select
                  id="leaveType"
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={onChangeHandler}
                  className="mt-1 w-full p-2 border rounded-xl"
                >
                  <option value="choose">— Choose —</option>
                  <option value="SickLeave">Sick Leave</option>
                  <option value="PersonalLeave">Personal Leave</option>
                  {/* <option value="MedicalLeave">Medical Leave</option> */}
                  <option value="Permission">Permission</option>
                </select>
              </div>

              {/* From Date */}
              <div className="w-full">
                <label htmlFor="fromDate" className="block font-medium">
                  From
                </label>
                <DatePicker
                  id="fromDate"
                  selected={formData.fromDate}
                  onChange={(d) => setFormData((f) => ({ ...f, fromDate: d }))}
                  showTimeSelect={isPermission}
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  wrapperClassName="w-full"
                  dateFormat={isPermission ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy"}
                  className="mt-1 w-full p-2 border rounded-xl"
                  placeholderText={
                    isPermission ? "Select date & time" : "Select date"
                  }
                />
              </div>

              {/* To Date */}
              <div className="w-full">
                <label htmlFor="toDate" className="block font-medium">
                  To
                </label>
                <DatePicker
                  id="toDate"
                  selected={formData.toDate}
                  onChange={(d) => setFormData((f) => ({ ...f, toDate: d }))}
                  showTimeSelect={isPermission}
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  wrapperClassName="w-full"
                  dateFormat={isPermission ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy"}
                  className="mt-1 w-full p-2 border rounded-xl"
                  placeholderText={
                    isPermission ? "Select date & time" : "Select date"
                  }
                />
              </div>

              {/* Reason */}
              <div>
                <label htmlFor="reason" className="block font-medium">
                  Reason
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={4}
                  value={formData.reason}
                  onChange={onChangeHandler}
                  className="mt-1 w-full p-2 border rounded-xl"
                  placeholder="Briefly describe your reason..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Submit
              </button>
            </form>
          </div>
          
          {/*Balance leave box*/}
          <div className="relative bg-white bg-opacity-90 p-6 rounded-2xl shadow-2xl w-full max-w-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
            <div className="flex justify-center mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Leave Details
              </h1>
            </div>
            {availableLeave.map((leave, index) => (
              <div className="space-y-4" key={index}>
                {/* Available Leave Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-6 h-6 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    <h2 className="text-xl font-semibold text-gray-700">
                      Available Leave
                    </h2>
                  </div>

                  <div className="space-y-3 pl-8">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center space-x-2 text-gray-600">
                        <svg
                          className="w-5 h-5 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        <span>Personal Leave:</span>
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        {leave.defaultPersonalLeavedays}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="flex items-center space-x-2 text-gray-600">
                        <svg
                          className="w-5 h-5 text-red-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H5a1 1 0 010-2V4zm3 1h2v2H7V5zm0 4h2v2H7V9zm0 4h2v2H7v-2z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        <span>Sick Leave:</span>
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        {leave.defaultSickLeavedays}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-gray-200"></div>

                {/* Balance Leave Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-6 h-6 text-purple-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <h2 className="text-xl font-semibold text-gray-700">
                      Balance Leave
                    </h2>
                  </div>

                  <div className="space-y-3 pl-8">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center space-x-2 text-gray-600">
                        <svg
                          className="w-5 h-5 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        <span>Personal Leave:</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-blue-600">
                          {leave.personalLeaveAvailable}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="flex items-center space-x-2 text-gray-600">
                        <svg
                          className="w-5 h-5 text-red-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H5a1 1 0 010-2V4zm3 1h2v2H7V5zm0 4h2v2H7V9zm0 4h2v2H7v-2z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        <span>Sick Leave:</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-blue-600">
                          {leave.sickLeaveAvailable}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-gray-200"></div>

                {/* Taken Leave Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-6 h-6 text-purple-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10m-9 4h4m-7 4h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z"
                      />
                    </svg>
                    <h2 className="text-xl font-semibold text-gray-700">
                      Taken Leave
                    </h2>
                  </div>

                  <div className="space-y-3 pl-8">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center space-x-2 text-gray-600">
                        <svg
                          className="w-5 h-5 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        <span>Personal Leave:</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-blue-600">
                          {leave.takenPersonalLeave}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="flex items-center space-x-2 text-gray-600">
                        <svg
                          className="w-5 h-5 text-red-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H5a1 1 0 010-2V4zm3 1h2v2H7V5zm0 4h2v2H7V9zm0 4h2v2H7v-2z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        <span>Sick Leave:</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-blue-600">
                          {leave.takenSickLeave}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/*Leave Request status*/}
      <div className="mt-8 w-full">
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen rounded-xl">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Leave Requests List</h1>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
      </div>
    </div>
  );
};

export default LeaveApply;
