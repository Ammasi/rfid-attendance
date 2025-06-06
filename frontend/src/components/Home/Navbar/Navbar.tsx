import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import Sidebar from "../Sidebar/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import { Outlet } from "react-router-dom";

interface Employee {
  _id: string;
  photo: string;
  email: string | null;
  name: string | null;
}

const Navbar = () => {
  const backend_URI = import.meta.env.VITE_Backend_URI;
  const [data, setData] = useState<Employee[]>([]);
  const { userEmail, authorized, userName, logout } = useAuth();
  const isAuthenticated = !!authorized;
  const [userPhoto, setUserPhoto] = useState<string | null>(
    Cookies.get("userPhoto") || null
  );
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeComponent, setActiveComponent] = useState(
    Cookies.get("activeComponent") || "Dashboard"
  );


  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await fetch(`${backend_URI}/api/employee`);
        const employees: Employee[] = await response.json();
        setData(employees);
        if (userEmail) {
          const currentUser = employees.find(
            (employee) => employee.email === userEmail
          );
          if (currentUser) {
            setUserPhoto(currentUser.photo);
            Cookies.set("userPhoto", currentUser.photo);
          } else {
            setUserPhoto(null);
          }
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    if (!userPhoto) {
      getUserData();
    }
  }, [userEmail, userPhoto, backend_URI]);

  useEffect(() => {
    Cookies.set("activeComponent", activeComponent);
  }, [activeComponent]);

  const handleLogout = async () => {
    try {
      await logout();
      setActive(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed: ", error);
    }
  };

  const [active, setActive] = useState(() => {
    const storedValue = Cookies.get("chatActive");
    try {
      return storedValue ? JSON.parse(storedValue) : false;
    } catch (e) {
      console.error("Error parsing stored chatActive value", e);
      return false;
    }
  });

  const [menu, setMenu] = useState(true); // sidebar
  const toggleDesktopSidebar = () => {
    setMenu(!menu);
  };

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  useEffect(() => {
    Cookies.set("chatActive", JSON.stringify(active));
  }, [active]);

  return (
    <>
      {/* Navbar */}
      <div className="fixed text-white top-0 left-0 w-full h-16 bg-[#111C44] z-10 flex justify-between items-center px-4">
        <div className="flex items-center space-x-4">
          <FontAwesomeIcon
            onClick={() => {
              toggleDesktopSidebar();
              toggleMobileSidebar();
            }}
            icon={faBars}
            className="cursor-pointer text-lg italic font-bold"
          />
          <h1 className="cursor-pointer font-grechenfuemen text-2xl md:text-3xl italic font-bold">
            Dashboard
          </h1>
        </div>
        {/* Profile Section */}
        <div className="relative">
          <div className="absolute -left-10 text-xl"></div>
          {isAuthenticated ? (
            <div
              className="relative flex items-center space-x-2"
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              {userPhoto ? (
                <img
                  className="w-8 h-8 rounded-full cursor-pointer bg-white"
                  src={`${backend_URI}${userPhoto}`}
                  alt="User"
                />
              ) : (
                <span className="text-white text-sm"></span>
              )}
              {showDropdown && (
                <div className="absolute right-0 top-8 w-32 bg-white shadow-lg rounded-md border border-gray-200 overflow-hidden">
                  {/* Notch (triangle) at the top-right */}
                  <div className="absolute -top-2 right-3 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-200 z-10"></div>

                  <ul className="py-1">
                    <li
                      className="px-3 py-2 cursor-pointer flex items-center hover:bg-gray-100 text-sm text-gray-700 transition-colors"
                      onClick={handleLogout}
                    >
                      <FontAwesomeIcon
                        icon={faSignOutAlt}
                        className="mr-2 text-gray-500 w-3 h-3"
                      />
                      Logout
                    </li>
                  </ul>
                </div>
              )}
              {userName ? (
                <h3 className="font-poppins text-sm">
                  {userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase()}
                </h3>
              ) : (
                <span>Loading..</span>
              )}
            </div>
          ) : (
            <button
              className="text-white bg-blue-600 px-4 py-1 rounded cursor-pointer hover:bg-blue-500"
              onClick={() => navigate("/")}
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Desktop Sidebar bg-gradient-to-b from-[hsl(217,51%,87%)] to-[hsl(214,41%,68%)]  */}
      {!active && (
        <div className="hidden md:block">
          <div
            className={`fixed top-16 left-0  ${
              menu
                ? "w-20 xl:w-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-indigo-100 scrollbar-thumb-rounded-lg"
                : "w-64 xl:w-[260px]"
            } h-[calc(100vh-3.5rem)] transition-all duration-300 bg-[#111C44]`}
          >
            {/* Desktop Toggle Button (Less-than arrow icon) */}
            <button
              onClick={() => setMenu(!menu)}
              className={`absolute top-0 ${
                menu ? "right-0 translate-x-full" : "-right-6"
              } bg-slate-600 text-white rounded-r-2xl p-1 shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center`}
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">Toggle sidebar</span>
            </button>

            <Sidebar
              setActiveComponent={setActiveComponent}
              setActive={setActive}
              menu={menu}
              setMenu={setMenu}
            />
          </div>
        </div>
      )}

      {!active && (
        <div
          className={`md:hidden fixed inset-0 z-30 transition-transform duration-300 ${
            mobileSidebarOpen ? "translate-x-0 mt-14" : "-translate-x-full"
          }`}
        >
          <div className="relative w-64 h-full bg-[#111C44] overflow-y-auto overflow-x-visible">
            {/* Mobile Close Button (X icon) */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-0 -right-0 p-1 z-50 bg-slate-600 text-white rounded-l-2xl shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center"
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">Close menu</span>
            </button>

            <Sidebar
              setActiveComponent={setActiveComponent}
              setActive={setActive}
              menu={false}
              setMenu={setMenu}
              closeSidebar={() => setMobileSidebarOpen(false)}
            />
          </div>

          {/* The gray "backdrop" that closes sidebar on click */}
          <div className="flex-1" onClick={toggleMobileSidebar}></div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`${
          menu ? "md:ml-20" : "md:ml-64"
        } mt-14 h-[calc(100vh-3.5rem)] bg-gradient-to-b from-[#dde6f4] to-[#e4ebfd] transition-all duration-300`}
      >
        <Outlet />
      </div>
    </>
  );
};

export default Navbar;
