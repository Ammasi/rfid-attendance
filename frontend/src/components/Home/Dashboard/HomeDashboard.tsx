import {
  faCalendarAlt,
  faClipboardCheck,
  faClock,
  faGift,
  faHomeAlt,
  faIdCardAlt,
  faSignOutAlt,
  faTimesCircle,
  faUmbrellaBeach,
  faUsers,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { useAuth } from "../../Context/AuthContext";
import { ApexOptions } from "apexcharts";

interface DashboardData {
  series: Array<{ name: string; data: number[] }>;
  categories: string[];
  totalEmployees: number;
  onTimeCount: number;
  checkOutCount: number;
  lateCount: number;
  earlyGoingCount: number;
  permissionCount: number;
  onLeaveCount: number;
  absentCount: number;
  sundayCount: number;
  presentCount: number;
  lateComerCount: number;
  lateComers: number;
  chartData: { date: string; count: number }[];
  status: string;
}

interface Data {
  map(
    arg0: (request: any) => import("react/jsx-runtime").JSX.Element
  ): import("react").ReactNode;
  _id: string;
  employeeId: { _id: string | null; name: string } | null;
  name: string;
  status: string;
  reason: string;
  leaveType: string;
  createdate: Date;
}

const HomeDashboard = () => {
  const backend_URI = import.meta.env.VITE_Backend_URI;
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [leaveRequests, setLeaveRequests] = useState<Data[]>([]);
  const [exitingRequests, setExitingRequests] = useState<string[]>([]);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(
          `${backend_URI}/api/employee/home/dashboard1`
        );
        const data = response.data;
        const chartDataFromAPI = data.chartData || [];

        const series = [
          {
            name: "Attendance",
            data: chartDataFromAPI.map((d: { count: number }) => d.count),
          },
        ];
        const categories = chartDataFromAPI.map(
          (d: { date: string }) => d.date
        );

        setDashboardData({ ...data, series, categories });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get(
          `${backend_URI}/api/employee/leave/todayRequests`
        );
        setLeaveRequests(response.data.leaveRequests);
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      }
    };
    fetchLeaveRequests();
  }, []);

  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      foreColor: "#ffffff",
      animations: { enabled: false },
    },
    series: dashboardData?.series || [],
    xaxis: {
      categories: dashboardData?.categories || [],
    },
    yaxis: {
      labels: {
        style: { colors: ["#ffffff"] },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        colors: ["#000000"],
      },
      background: { enabled: false },
    },
    tooltip: { theme: "dark" },
  };

  const acceptLeave = async (LeaveId: string) => {
    try {
      setExitingRequests((prev) => [...prev, LeaveId]);
      setTimeout(async () => {
        await axios.put(`${backend_URI}/api/employee/confirmLeave/${LeaveId}`, {
          status: "Approved",
        });
        setLeaveRequests((prev) =>
          prev.filter((request) => request._id !== LeaveId)
        );
        setExitingRequests((prev) => prev.filter((id) => id !== LeaveId));
      }, 300);
    } catch (error) {
      console.error("Error accepting leave request:", error);
    }
  };

  const rejectLeave = async (LeaveId: string) => {
    try {
      setExitingRequests((prev) => [...prev, LeaveId]);
      setTimeout(async () => {
        await axios.put(`${backend_URI}/api/employee/confirmLeave/${LeaveId}`, {
          status: "Denied",
        });
        setLeaveRequests((prev) =>
          prev.filter((request) => request._id !== LeaveId)
        );
        setExitingRequests((prev) => prev.filter((id) => id !== LeaveId));
      }, 300);
    } catch (error) {
      console.error("Error rejecting leave request:", error);
    }
  };

  const statCards = [
    {
      icon: faUsers,
      title: "Total Employees",
      value: dashboardData?.totalEmployees,
      color: "text-blue-500",
    },
    {
      icon: faCalendarAlt,
      title: "On Time CheckIn",
      value: dashboardData?.onTimeCount,
      color: "text-green-500",
    },
    {
      icon: faIdCardAlt,
      title: "Present",
      value: dashboardData?.presentCount,
      color: "text-rose-500",
    },
    {
      icon: faSignOutAlt,
      title: "Checked Out",
      value: dashboardData?.checkOutCount,
      color: "text-purple-500",
    },
    {
      icon: faWarning,
      title: "Not Checked In",
      value: dashboardData?.absentCount,
      color: "text-red-500",
    },
    {
      icon: faSignOutAlt,
      title: "Early Going",
      value: dashboardData?.earlyGoingCount,
      color: "text-red-500",
    },
    {
      icon: faClipboardCheck,
      title: "Permission",
      value: dashboardData?.permissionCount,
      color: "text-red-500",
    },
    {
      icon: faClock,
      title: "Late Today",
      value: dashboardData?.lateCount,
      color: "text-yellow-500",
    },
    {
      icon: faUmbrellaBeach,
      title: "On Leave",
      value: dashboardData?.onLeaveCount,
      color: "text-teal-500",
    },
    {
      icon: faTimesCircle,
      title: "Absent",
      value: dashboardData?.absentCount,
      color: "text-pink-500",
    },
    {
      icon: faGift,
      title: "No.Of.Holidays",
      value: dashboardData?.sundayCount,
      color: "text-indigo-500",
    },
  ];

  if (!dashboardData) {
    return (
      <div className="w-full text-center justify-center items-center text-lg text-green-500">
        Loading...
      </div>
    );
  }
  // bg-gradient-to-b from-[#dde6f4] to-[#e4ebfd]
  return (
    <div className="p-4 md:p-6 bg-[#1c1c32] text-white min-h-screen  animate-slide-in-right">
      <style>
        {`
          @keyframes slideInUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes slideOutUp {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(-20px); opacity: 0; }
          }
          @keyframes slideInRight {
            from { transform: translateX(20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .animate-slide-in-up { animation: slideInUp 2s ease-out forwards; }
          .animate-slide-out-up { animation: slideOutUp 2s ease-out forwards; }
          .animate-slide-in-right { animation: slideInRight 2s ease-out; }
        `}
      </style>

      {/* Header Section */}
      <div className="mb-4  md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center animate-slide-in-up">
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          <FontAwesomeIcon icon={faHomeAlt} className="text-sm md:text-base" />
          <h1 className="text-lg md:text-xl font-bold text-white font-poppins">
            Dashboard
          </h1>
        </div>
        <div className="text-sm md:text-base text-white font-poppins flex gap-2">
          <FontAwesomeIcon icon={faCalendarAlt} className="hidden md:block" />
          <span>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className=" bg-[#484974] p-2 md:p-4 rounded-xl animate-slide-in-up">
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-3 mb-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-[#58587e] p-3 md:p-6 rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 animate-slide-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className={`text-2xl md:text-3xl ${stat.color}`}>
                  <FontAwesomeIcon icon={stat.icon} />
                </div>
                <div className="text-right">
                  <p className="text-xs md:text-sm text-white mb-1">
                    {stat.title}
                  </p>
                  <p className="text-lg md:text-2xl font-bold text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 mt-4">
        {/* Chart Section */}
        <div
          className="w-full lg:w-[60%] animate-slide-in-up"
          style={{ animationDelay: "200ms" }}
        >
          <div className="bg-[#484974] rounded-xl p-4">
            <div className="bg-[#58587e] text-white p-4 md:p-6 rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300">
              <h3 className="text-md md:text-lg font-poppins text-white mb-4">
                Attendance Overview
              </h3>

              {/* scoped wrapper + style override for the burger icon */}
              <div className="relative chart-wrapper">
                <style>{`
    /* burger icon → black */
    .chart-wrapper .apexcharts-toolbar .apexcharts-menu-icon {
      color: #000 !important;
    }
    .chart-wrapper .apexcharts-toolbar .apexcharts-menu-icon path {
      stroke: #ffffff !important;
    }

    /* menu container → dark background */
    .chart-wrapper .apexcharts-toolbar .apexcharts-menu {
      background: #2d2d4f !important;   /* or whatever dark you’re using */
      border: none !important;          /* drop the white border */
      box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
    }

    /* menu list items → white text on dark */
    .chart-wrapper .apexcharts-toolbar .apexcharts-menu-list,
    .chart-wrapper .apexcharts-toolbar .apexcharts-menu-item {
      background: transparent !important;
      color: #fff !important;
    }

    /* hover state */
    .chart-wrapper .apexcharts-toolbar .apexcharts-menu-item:hover {
      background: rgba(255,255,255,0.1) !important;
    }
  `}</style>

                <Chart
                  options={chartOptions}
                  series={chartOptions.series}
                  type="bar"
                  height={350}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Leave Requests Section */}

        {isAdmin && (
          <div
            className="w-full lg:w-[40%] animate-slide-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <div className="bg-[#484974] rounded-xl p-4">
              <div className="bg-[#58587e] p-4 md:p-6 rounded-xl shadow-sm hover:shadow-2xl h-full transition-all duration-300">
                <h3 className="text-md md:text-lg text-white mb-4 font-poppins">
                  Recent Leave Requests
                </h3>
                <div className="space-y-3">
                  {leaveRequests.map((request) => (
                    <div
                      key={request._id}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-[#616187] rounded-lg hover:shadow-xl transition-all duration-300 ${
                        exitingRequests.includes(request._id)
                          ? "animate-slide-out-up"
                          : "animate-slide-in-up"
                      }`}
                    >
                      <div className="mb-2 sm:mb-0">
                        <p className="font-medium text-sm md:text-base text-white">
                          {request.employeeId?.name}
                        </p>
                        <p className="text-xs md:text-sm text-white">
                          {request.leaveType}
                        </p>
                        <p className="text-xs md:text-sm text-white">
                          {request.reason}
                        </p>
                        <p className="text-xs md:text-sm text-white">
                          {new Date(request.createdate).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs md:text-sm rounded-full ${
                            request.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : request.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-400 text-red-800"
                          }`}
                        >
                          {request.status}
                        </span>
                        {isAdmin && request.status === "Pending" && (
                          <div>
                            <button
                              onClick={() => acceptLeave(request._id)}
                              className="px-2 py-1 text-xs md:text-sm rounded-full bg-green-300 hover:bg-green-400 transition-colors duration-300"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => rejectLeave(request._id)}
                              className="px-2 py-1 text-xs md:text-sm rounded-full bg-green-300 hover:bg-green-400 transition-colors duration-300"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeDashboard;
