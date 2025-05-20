import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlusCircle,
  faEdit,
  faTrash,
  faHomeUser,
} from "@fortawesome/free-solid-svg-icons";

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

// Employee Dashboard All Employees List:-
const Dashboard = () => {
  const backend_URI = import.meta.env.VITE_Backend_URI;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const recordsPerPage = 10;
  const navigate = useNavigate();

  // Helper function to format dates
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  // Function to handle deletion once confirmed
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${backend_URI}/api/employee/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setEmployees(employees.filter((employee) => employee._id !== id));
        toast.success("Employee Deleted", { position: "top-center" });
      } else {
        console.error("Error deleting employee");
        toast.error("Error deleting employee", { position: "top-center" });
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Error deleting employee", { position: "top-center" });
    }
  };

  // Toast confirmation for delete using a custom component inside the toast message.
  const confirmDelete = (id: string) => {
    toast.info(
      ({ closeToast }) => (
        <div className="flex flex-col items-center">
          <p>Are you sure you want to delete this data?</p>
          <div className="flex mt-2 space-x-4">
            <button
              onClick={() => {
                handleDelete(id);
                closeToast();
              }}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Yes
            </button>
            <button
              onClick={closeToast}
              className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              No
            </button>
          </div>
        </div>
      ),
      { position: "top-center", autoClose: false, closeOnClick: false }
    );
  };

  // Use <Navigate /> when error occurs
  if (error) {
    return <Navigate to="/servererror" replace />;
  }

  // Pagination logic
  const totalPages = Math.ceil(employees.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentEmployees = employees.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div className="inline-flex overflow-hidden rounded-full shadow-sm">
          {/* Icon Circle */}
          <div className="bg-indigo-600 p-2 flex items-center justify-center">
            <div className="bg-white rounded-full p-2">
              <FontAwesomeIcon
                icon={faHomeUser}
                className="text-cyan-500 text-xl"
              />
            </div>
          </div>

          {/* Text Panel */}
          <div className="bg-blue-500 px-4 py-4 flex items-center">
            <h1 className="text-white sm:text-sm font-semibold lg:text-xl md:text-xl">
              Employee Management
            </h1>
          </div>
        </div>
        <button
          onClick={() => navigate("/form")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors self-baseline"
        >
          <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
          Add Employee
        </button>
      </div>

      <div className="bg-[#eeecec] rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                  S.No
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                  RFID No
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                  Photo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                  DOB
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                  Mobile No
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                  Employee Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                  Marital Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                  Joining Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className=" divide-y divide-gray-200">
              {currentEmployees.map((employee, index) => {
                // added to image show both cloudinary and local images in frontend 08-05-2025
                const photoStr = employee.photo ?? ""; // ?? nullish coalescing operator.It only checks for null or undefined.
                const src = photoStr.startsWith("http")
                  ? employee.photo
                  : `${backend_URI}${employee.photo}`;

                return (
                  <tr
                    key={employee._id}
                    className=" transition-colors odd:bg-[#eeecec] even: bg-[#e4e1e1]"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {indexOfFirstRecord + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {employee.rfidcardno}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={src}
                        alt={employee.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {employee.name.charAt(0).toUpperCase() +
                        employee.name.slice(1).toLowerCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(employee.dob)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.mobileno}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.employeecode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.maritalstatus}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(employee.joiningdate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate">
                      {employee.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => navigate(`/edit/${employee._id}`)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => confirmDelete(employee._id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-1 rounded-md text-sm ${
                  currentPage === index + 1
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                } transition-colors`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
