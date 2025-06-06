import {
  faAngleDown,
  faAngleUp,
  faDashboard,
  faDesktopAlt,
  faHomeUser,
  faIdCard,
  faUser,
  faChartBar,
  faUsers,
  faCalendarAlt,
  faCalendarCheck,
  faCommentDots,
  faUmbrellaBeach,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

interface SidebarProps {
  setActiveComponent: (component: string) => void;
  setActive: (component: boolean) => void;
  menu: boolean;
  setMenu: React.Dispatch<React.SetStateAction<boolean>>;
  closeSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  setActiveComponent,
  setActive,
  menu,
  setMenu,
  closeSidebar
}) => {
  const [option, setOption] = useState(false);
  const { isAdmin,currentUserId } = useAuth();


  const handleAttendance = () => {
    setOption((prev) => !prev);
  };

  return (
    <div
  className={`
    h-full flex flex-col relative
    transition-all duration-300 ease-in-out
    ${menu ? "w-20" : "w-64"}
  `}
>
      <div className="text-white">
        <NavLink
          to={"home"}
          className="p-2 flex items-center hover:bg-slate-400 cursor-pointer transition-all duration-300 hover:translate-x-2 rounded-r-lg"
          onClick={() => {
            setActiveComponent("HomeDashboard");
            closeSidebar?.();
          }
          }
        >
          <FontAwesomeIcon
            icon={faDesktopAlt}
            className={`text-white ${menu ? "p-3 mx-auto text-xl" : "mr-3 p-2 text-lg"}`}
          />
          <span className={`text-sm font-poppins ${menu ? "hidden" : "block"}`}>
            Dashboard
          </span>
          
        </NavLink>
        {isAdmin && (
          <>
            <NavLink
              to={"dashboard"}
              className="p-2 flex items-center hover:bg-slate-400 cursor-pointer transition-all duration-300 hover:translate-x-2 rounded-r-lg"
              onClick={() => {
                setActiveComponent("Dashboard")
                closeSidebar?.();
              }
              }
            >
              <FontAwesomeIcon
                icon={faDashboard}
                className={`text-white ${menu ? "p-3 mx-auto text-xl" : "mr-3 p-2 text-lg"}`}
              />
              <span className={`text-sm font-poppins ${menu ? "hidden" : "block"}`}>
                Employee Details
              </span>
            </NavLink>
            <NavLink
              to={"leave-request"}
              className="p-2 flex items-center hover:bg-slate-400 cursor-pointer transition-all duration-300 hover:translate-x-2 rounded-r-lg"
              onClick={() => {
                setActiveComponent("LeaveRequest")
                closeSidebar?.();
              }
              }
            >
              <FontAwesomeIcon
                icon={faUmbrellaBeach}
                className={`text-white ${menu ? "p-3 mx-auto text-xl" : "mr-3 p-2 text-lg"}`}
              />
              <span className={`text-sm font-poppins ${menu ? "hidden" : "block"}`}>
                Leave Requests
              </span>
            </NavLink>
            <div
              className="p-2 flex items-center justify-between hover:bg-slate-400 cursor-pointer transition-all duration-300 hover:translate-x-2 rounded-r-lg"
              onClick={handleAttendance}
            >
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={faChartBar}
                  className={`text-white ${menu ? "p-3 mx-auto ml-3 text-xl" : "mr-3 p-2 text-lg"}`}
                />
                <span className={`text-sm font-poppins ${menu ? "hidden" : "block"}`}>
                  Reports
                </span>
              </div>
              <FontAwesomeIcon
                icon={option ? faAngleUp : faAngleDown}
                className={`${menu ? "hidden" : "block"} transition-transform duration-300 ${
                  option ? "rotate-180" : "rotate-0"
                }`}
              />
            </div>
            <div className={`overflow-hidden transition-max-height duration-300 ease-in-out ${option ? "max-h-40" : "max-h-0"}`}>
              {option && (
                <>
                  <NavLink
                    to={"datewise"}
                    className="p-2 flex items-center hover:bg-slate-400 cursor-pointer transition-all duration-300 hover:translate-x-2 ml-4 rounded-r-lg"
                    onClick={() => {
                      setActiveComponent("DateWise")
                      closeSidebar?.();
                    }
                    }
                  >
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className={`text-white ${menu ? "p-3 mx-auto text-xl" : "mr-3 p-2 text-lg"}`}
                    />
                    <span className={`text-sm font-poppins ${menu ? "hidden" : "block"}`}>
                      Today Report
                    </span>
                  </NavLink>
                  <NavLink to={"monthwise"}
                    className="p-2 flex items-center hover:bg-slate-400 cursor-pointer transition-all duration-300 hover:translate-x-2 ml-4 rounded-r-lg"
                    onClick={() => {
                      setActiveComponent("MonthWise")
                      closeSidebar?.();
                    }
                    }
                  >
                    <FontAwesomeIcon
                      icon={faCalendarCheck}
                      className={`text-white ${menu ? "p-3 mx-auto text-xl" : "mr-3 p-2 text-lg"}`}
                    />
                    <span className={`text-sm font-poppins ${menu ? "hidden" : "block"}`}>
                      Monthly Report
                    </span>
                  </NavLink>
                </>
              )}
            </div>
          </>
        )}
        <NavLink
          to={`applyleave/${currentUserId}`}
          className="p-2 flex items-center hover:bg-slate-400 cursor-pointer transition-all duration-300 hover:translate-x-2 rounded-r-lg"
          onClick={() => {
            setActiveComponent("Employees")
            closeSidebar?.();
          }
          }
        >
          <FontAwesomeIcon
            icon={faUsers}
            className={`text-white ${menu ? "p-3 mx-auto text-xl" : "mr-3 p-2 text-lg"}`}
          />
          <span className={`text-sm font-poppins ${menu ? "hidden" : "block"}`}>
            Employees
          </span>
        </NavLink>
        {isAdmin && (
          <NavLink
            to={"totalmonth"}
            className="p-2 flex items-center hover:bg-slate-400 cursor-pointer transition-all duration-300 hover:translate-x-2 rounded-r-lg"
            onClick={() => {
              setActiveComponent("TotalMonth")
              closeSidebar?.();
            }
            }
          >
            <FontAwesomeIcon
              icon={faCalendarCheck}
              className={`text-white ${menu ? "p-3 mx-auto text-xl" : "mr-3 p-2 text-lg"}`}
            />
            <span className={`text-sm font-poppins ${menu ? "hidden" : "block"}`}>
              Total Month
            </span>
          </NavLink>
        )}
        <NavLink
          to={"person-attendance"}
          className="p-2 flex items-center hover:bg-slate-400 cursor-pointer transition-all duration-300 hover:translate-x-2 rounded-r-lg"
          onClick={() => {
            setActiveComponent("SinglePersonAttendance")
            closeSidebar?.();
          }
          }
        >
          <FontAwesomeIcon
            icon={faUser}
            className={`text-white ${menu ? "p-3 mx-auto text-xl" : "mr-3 p-2 text-lg"}`}
          />
          <span className={`text-sm font-poppins ${menu ? "hidden" : "block"}`}>
            Person Attendance
          </span>
        </NavLink>
        <NavLink to={"chat"}
          className="mt-auto p-2 flex items-center hover:bg-slate-400 cursor-pointer transition-all duration-300 hover:translate-x-2 rounded-r-lg"
          // onClick={() => setActiveComponent("ChatApp")}
           onClick={() => {
            closeSidebar?.();
           }}
        >
          <FontAwesomeIcon
            icon={faCommentDots}
            className={`text-white ${menu ? "p-3 mx-auto text-xl" : "mr-3 p-2 text-lg"}`}
          />
          <span className={`text-sm font-poppins ${menu ? "hidden" : "block"}`}>
            Chat
          </span>
        </NavLink>
        <NavLink to={"rfidscanner"}
          className="mt-auto p-2 flex items-center hover:bg-slate-400 cursor-pointer transition-all duration-300 hover:translate-x-2 rounded-r-lg"
          onClick={() => {
            setActiveComponent("RFIDScanner")
            closeSidebar?.();
          }
          }
        >
          <FontAwesomeIcon
            icon={faIdCard}
            className={`text-white ${menu ? "p-3 mx-auto text-xl" : "mr-3 p-2 text-lg"}`}
          />
          <span className={`text-sm font-poppins ${menu ? "hidden" : "block"}`}>
            Scan Your Card
          </span>
        </NavLink>
        <NavLink
          to={"currentuser"}
          className="mt-auto p-2 flex items-center hover:bg-slate-400 cursor-pointer transition-all duration-300 hover:translate-x-2 rounded-r-lg"
          onClick={() => {
            setActiveComponent("CurrentUser")
            closeSidebar?.();
          }
          }
        >
          <FontAwesomeIcon
            icon={faHomeUser}
            className={`text-white ${menu ? "p-3 mx-auto text-xl" : "mr-3 p-2 text-lg"}`}
          />
          <span className={`text-sm font-poppins ${menu ? "hidden" : "block"}`}>
            User Attendance
          </span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
