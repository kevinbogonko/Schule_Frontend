import React, { useState, useEffect, useRef } from "react";
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiMail,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiMenu,
  FiX,
  FiLogOut,
  FiUser,
  FiMessageSquare,
  FiChevronRight,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { FaChalkboard, FaChalkboardTeacher } from "react-icons/fa";
import {
  PiChalkboardTeacherBold,
  PiExamBold,
  PiBookOpen,
  PiBriefcase,
  PiGraduationCap,
  PiMedal,
  PiTrophy,
} from "react-icons/pi";
import { TbReportAnalytics } from "react-icons/tb";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../hooks/api";

// Import your components
import Student from "../../components/blocks/Student";
import StudentPhotos from "../../components/blocks/StudentPhotos";
import Stream from "./Stream";
import ClassTeacher from "./ClassTeacher";
import Staff from "./Staff";
import StaffPhotos from "../../components/blocks/StaffPhotos";
import SubjectTeacher from "./SubjectTeacher";
import AddMark from "./AddMark";
import Grading from "./Grading";
import Marklist2 from "./Marklist2";
import Particulars from "./Particulars";
import ResultSMS from "./ResultSMS";
import COSMS from "./COSMS";
import Marksheet from "./Marksheet";
import MarklistPDFReport from "./MarklistPDFReport";
import StudentReport from "./StudentReport";
import StudentInfo from "./StudentInfo";
import StudentAttemptedExams from "./StudentAttemptedExams";
import StaffInfo from "./StaffInfo";
import GlobalStream from "./GlobalStream";
import AddMarkTeacher from "./AddMarkTeacher";
import Subject from "./Subject";
import MarkAnalysis from "./MarkAnalysis";
import Promotion from "./Promotion";
import HomeDash from "./HomeDash";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState("home");
  const [activeComponent, setActiveComponent] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem("darkMode") === "true" ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches &&
        localStorage.getItem("darkMode") !== "false")
    );
  });
  const [imagePath, setImagePath] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const sidebarRef = useRef(null);
  const profileRef = useRef(null);

  const { user, logout, checkAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileDropdownOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Fetch user photo based on role
  useEffect(() => {
    const fetchUserPhoto = async () => {
      if (!user?.user_id || !user?.role) return;

      try {
        let response;
        if (user.role === "teacher") {
          response = await api.post("/teacher/getteacherphoto", {
            id: user.user_id,
          });
          setImagePath(response.data.path);
        } else if (user.role === "student") {
          response = await api.post("/student/getstudentphoto", {
            id: user.user_id,
            form: 1,
          });
          setImagePath(response.data.path);
        } else if (user.role === "admin") {
          response = await api.get("/particular/getparticulars");
          setImagePath(
            response.data?.logo_path || "/images/defaults/logo.webp"
          );
        }
      } catch (error) {
        console.error("Error fetching user photo:", error);
        setImagePath("");
      }
    };

    fetchUserPhoto();
  }, [user]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        const response = await api.post("/dashboard/dashboarddata", {
          role: user.role,
          id: user.user_id,
        });
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      try {
        await checkAuth();
        if (!user && isMounted) {
          navigate("/login");
        }
      } catch (error) {
        if (isMounted) {
          navigate("/login");
        }
      }
    };

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [user, navigate, checkAuth]);

  // Apply smooth dark mode transitions
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("transition-colors", "duration-500");

    if (darkMode) {
      html.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }

    const timer = setTimeout(() => {
      html.classList.remove("transition-colors", "duration-500");
    }, 500);

    return () => {
      clearTimeout(timer);
      html.classList.remove("transition-colors", "duration-500");
    };
  }, [darkMode]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        windowWidth < 768 &&
        isMobileMenuOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
      if (
        isProfileDropdownOpen &&
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen, isProfileDropdownOpen, windowWidth]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Find menu items that match the search query
    const matchedItems = [];
    menuItems.forEach((item) => {
      if (item.label.toLowerCase().includes(searchQuery.toLowerCase())) {
        matchedItems.push(item);
      }
      if (item.subItems) {
        item.subItems.forEach((subItem) => {
          if (subItem.label.toLowerCase().includes(searchQuery.toLowerCase())) {
            matchedItems.push({ ...subItem, parentLabel: item.label });
          }
        });
      }
    });

    if (matchedItems.length > 0) {
      // If we found matches, handle the first one
      const firstMatch = matchedItems[0];
      if (firstMatch.component) {
        setActiveComponent(firstMatch.component);
      } else if (firstMatch.subItems) {
        setActiveMenu(firstMatch.id);
        setActiveSubmenu(firstMatch.id);
      }
    }
  };

  // Role-based menu items
  const getMenuItems = () => {
    const baseItems = [
      {
        id: "home",
        label: "Home",
        icon: <FiHome className="text-lg" />,
        component: <HomeDash role={user?.role} data={dashboardData} />,
      },
    ];

    if (user?.role === "admin") {
      baseItems.push(
        {
          id: "streams",
          label: "Forms",
          icon: <FaChalkboard className="text-lg" />,
          subItems: [
            { id: "class-streams", label: "Streams", component: <Stream /> },
            {
              id: "class-teachers",
              label: "Class Teachers",
              component: <ClassTeacher />,
            },
          ],
        },
        {
          id: "students",
          label: "Students",
          icon: <FiUsers className="text-lg" />,
          subItems: [
            {
              id: "student-list",
              label: "Student List",
              component: <Student user={user?.role} />,
            },
            {
              id: "student-photos",
              label: "Student Photos",
              component: <StudentPhotos />,
            },
          ],
        },
        {
          id: "staff",
          label: "Teachers",
          icon: <PiChalkboardTeacherBold className="text-lg" />,
          subItems: [
            { id: "staff-list", label: "Teacher List", component: <Staff /> },
            {
              id: "staff-photos",
              label: "Teachers' Photos",
              component: <StaffPhotos />,
            },
            {
              id: "subject-teachers",
              label: "Subject Teachers",
              component: <SubjectTeacher />,
            },
          ],
        },
        {
          id: "exams",
          label: "Examinations",
          icon: <PiExamBold className="text-lg" />,
          subItems: [
            { id: "add-mark", label: "Add Marks", component: <AddMark /> },
            {
              id: "grading-scheme",
              label: "Grading Scheme",
              component: <Grading />,
            },
            { id: "marklist", label: "Marklist", component: <Marklist2 /> },
          ],
        },
        {
          id: "messages",
          label: "Communication",
          icon: <FiMail className="text-lg" />,
          subItems: [
            { id: "result-sms", label: "Result SMS", component: <ResultSMS /> },
            {
              id: "co-sms",
              label: "Opening/Closing SMS",
              component: <COSMS />,
            },
          ],
        },
        {
          id: "reports",
          label: "Reports",
          icon: <TbReportAnalytics className="text-lg" />,
          subItems: [
            { id: "marksheet", label: "Marksheet", component: <Marksheet /> },
            {
              id: "marklist",
              label: "Marklist",
              component: <MarklistPDFReport />,
            },
            {
              id: "markanalysis",
              label: "Subject Analysis",
              component: <MarkAnalysis />,
            },
            {
              id: "report-form",
              label: "Report Form",
              component: <StudentReport />,
            },
          ],
        },
        {
          id: "settings",
          label: "Settings",
          icon: <FiSettings className="text-lg" />,
          subItems: [
            {
              id: "particulars",
              label: "Particulars",
              component: <Particulars />,
            },
            {
              id: "stream-names",
              label: "Register Stream Names",
              component: <GlobalStream />,
            },
            {
              id: "subjects",
              label: "Manage Subjects",
              component: <Subject />,
            },
            {
              id: "promotion",
              label: "Promote Students",
              component: <Promotion />,
            },
            {
              id: "users",
              label: "Users",
              component: <Promotion />,
            },
            { id: "account", label: "Account" },
          ],
        }
      );
    } else if (user?.role === "teacher") {
      baseItems.push(
        {
          id: "students",
          label: "Students",
          icon: <FiUsers className="text-lg" />,
          subItems: [
            {
              id: "student-list",
              label: "Student List",
              component: <Student />,
            },
          ],
        },
        {
          id: "exams",
          label: "Examinations",
          icon: <PiExamBold className="text-lg" />,
          subItems: [
            {
              id: "add-mark",
              label: "Add Marks",
              component: <AddMarkTeacher />,
            },
            { id: "marklist", label: "Marklist", component: <Marklist2 /> },
          ],
        },
        {
          id: "information",
          label: "My Information",
          icon: <PiExamBold className="text-lg" />,
          subItems: [
            {
              id: "my-information",
              label: "My Information",
              component: <StaffInfo staffId={user?.user_id} />,
            },
          ],
        },
        {
          id: "settings",
          label: "Settings",
          icon: <FiSettings className="text-lg" />,
          subItems: [{ id: "account", label: "Account" }],
        }
      );
    } else if (user?.role === "student") {
      baseItems.push(
        {
          id: "info",
          label: "Information",
          icon: <PiExamBold className="text-lg" />,
          subItems: [
            {
              id: "marklist",
              label: "My Information",
              component: <StudentInfo studentId={user?.user_id} />,
            },
          ],
        },
        {
          id: "exams",
          label: "Examinations",
          icon: <PiExamBold className="text-lg" />,
          subItems: [
            {
              id: "marklist",
              label: "My Marks",
              component: <StudentAttemptedExams studentId={user?.user_id} />,
            },
          ],
        },
        {
          id: "settings",
          label: "Settings",
          icon: <FiSettings className="text-lg" />,
          subItems: [{ id: "account", label: "Account" }],
        }
      );
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const toggleSubmenu = (menuId) => {
    setActiveSubmenu(activeSubmenu === menuId ? null : menuId);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isSidebarOpen && !isMobileMenuOpen) {
      setIsSidebarOpen(true);
    }
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleMenuClick = (menuId, hasSubItems) => {
    setActiveMenu(menuId);

    // Reset active component when clicking main menu items
    if (!hasSubItems) {
      setActiveComponent(null);
    }

    // Open sidebar if closed (for all items)
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
      // For items with submenus, open the submenu after a small delay
      if (hasSubItems) {
        setTimeout(() => toggleSubmenu(menuId), 300);
      }
    } else if (hasSubItems) {
      // Toggle submenu if sidebar is already open
      toggleSubmenu(menuId);
    }

    // Close mobile menu if on mobile
    if (windowWidth < 768 && !hasSubItems) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleSubmenuItemClick = (subItem) => {
    // Set the active component if the subItem has one
    if (subItem.component) {
      setActiveComponent(subItem.component);
    }

    // Close mobile menu when submenu item is clicked
    if (windowWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  const renderActiveComponent = () => {
    if (activeComponent) {
      return activeComponent;
    }

    // Default to HomeDash when no component is selected
    return <HomeDash role={user?.role} data={dashboardData} />;
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans transition-colors duration-500">
      {!isMobileMenuOpen && (
        <button
          onClick={toggleMobileMenu}
          className="md:hidden fixed top-4 left-4 z-50 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
        >
          <FiMenu size={20} />
        </button>
      )}

      <div
        ref={sidebarRef}
        className={`bg-indigo-800 dark:bg-gray-800 text-white transition-all duration-300 ease-in-out fixed md:relative z-40 h-full
          ${isSidebarOpen ? "w-64" : "w-20"}
          ${isMobileMenuOpen ? "left-0" : "-left-full md:left-0"}
        `}
      >
        {windowWidth < 768 && (
          <div className="p-4 flex items-center justify-between border-b border-indigo-700 dark:border-gray-700 h-16 transition-colors duration-500">
            <div className="text-xl font-semibold">EduDash</div>
            <button
              onClick={toggleMobileMenu}
              className="p-1 text-white hover:text-indigo-200 dark:hover:text-gray-300 transition-colors duration-300"
            >
              <FiX size={20} />
            </button>
          </div>
        )}

        {windowWidth >= 768 && (
          <div
            className={`p-4 flex items-center justify-between border-b border-indigo-700 dark:border-gray-700 h-16 transition-colors duration-500`}
          >
            {isSidebarOpen ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 dark:bg-gray-700 rounded-md transition-colors duration-500" />
                <span className="text-xl font-semibold">EduDash</span>
              </div>
            ) : (
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-full hover:bg-indigo-700 dark:hover:bg-gray-700 w-full flex justify-center transition-colors duration-300"
              >
                <FiChevronRight className="h-5 w-5" />
              </button>
            )}
            {isSidebarOpen && (
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-full hover:bg-indigo-700 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        <nav className="mt-6">
          <ul className="space-y-2 px-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <div
                  onMouseEnter={() => !isSidebarOpen && setHoveredItem(item.id)}
                  onMouseLeave={() => !isSidebarOpen && setHoveredItem(null)}
                  onClick={() => handleMenuClick(item.id, item.subItems)}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 group
                    ${!isSidebarOpen ? "justify-center" : "justify-between"}
                    ${
                      activeMenu === item.id
                        ? "bg-indigo-700 dark:bg-gray-700"
                        : "hover:bg-indigo-700 dark:hover:bg-gray-700"
                    }
                    relative
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <span>{item.icon}</span>
                    {isSidebarOpen && (
                      <span
                        className={`transition-opacity duration-300 ${
                          isSidebarOpen ? "opacity-100 delay-100" : "opacity-0"
                        }`}
                      >
                        {item.label}
                      </span>
                    )}
                  </div>
                  {isSidebarOpen && item.subItems && (
                    <span
                      className={`transition-transform duration-300 ${
                        activeSubmenu === item.id ? "rotate-180" : "rotate-0"
                      }`}
                    >
                      <FiChevronDown />
                    </span>
                  )}
                  {!isSidebarOpen && hoveredItem === item.id && (
                    <div className="absolute left-full ml-3 px-2 py-1 bg-indigo-800 dark:bg-gray-800 text-white text-sm rounded-md opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-indigo-700 dark:border-gray-700">
                      {item.label}
                    </div>
                  )}
                </div>
                {isSidebarOpen && item.subItems && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out
                      ${activeSubmenu === item.id ? "max-h-96" : "max-h-0"}
                    `}
                  >
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.id}>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleSubmenuItemClick(subItem);
                            }}
                            className="block p-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-gray-700 transition-colors duration-300 text-sm"
                          >
                            {subItem.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm z-30 transition-colors duration-500">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div
              className={`flex items-center ${windowWidth < 768 ? "w-8" : ""}`}
            >
              {windowWidth >= 768 && <div className="w-8" />}
            </div>

            <div className="flex-1 mx-2 sm:mx-4 max-w-md">
              <form
                onSubmit={handleSearch}
                className="relative flex items-center"
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full pl-8 sm:pl-10 pr-3 py-1 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 text-sm sm:text-base dark:text-white transition-colors duration-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-1 rounded-full text-gray-600 dark:text-yellow-300 hover:text-gray-900 dark:hover:text-yellow-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center h-8 w-8 transition-all duration-500 transform hover:scale-110"
                aria-label={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {darkMode ? (
                  <FiSun className="h-5 w-5 transition-transform duration-500" />
                ) : (
                  <FiMoon className="h-5 w-5 transition-transform duration-500" />
                )}
              </button>

              <button className="p-1 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 relative flex items-center justify-center h-8 w-8 transition-colors duration-300">
                <FiMessageSquare className="h-5 w-5" />
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full transition-transform duration-300">
                  3
                </span>
              </button>

              <div
                className="relative flex items-center justify-center h-8 w-8"
                ref={profileRef}
              >
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center justify-center focus:outline-none h-full w-full transition-transform duration-300 hover:scale-110"
                >
                  {imagePath ? (
                    <img
                      src={`${BACKEND_BASE_URL}${imagePath}`}
                      alt="Profile"
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-indigo-600 dark:bg-gray-600 flex items-center justify-center text-white font-semibold text-sm sm:text-base transition-colors duration-500">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </button>
                {isProfileDropdownOpen && (
                  <div className="origin-top-right absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black dark:ring-gray-600 ring-opacity-5 py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                      Logged in as{" "}
                      <span className="font-medium">{user?.role}</span>
                    </div>
                    <a
                      href="#"
                      className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center transition-colors duration-300"
                    >
                      <FiUser className="mr-2" /> Profile
                    </a>
                    <a
                      href="#"
                      className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center transition-colors duration-300"
                    >
                      <FiSettings className="mr-2" /> Settings
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center transition-colors duration-300"
                    >
                      <FiLogOut className="mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400 transition-colors duration-500" />
            </div>
          ) : (
            <div className="flex flex-col min-h-[calc(100vh-8rem)]">
              <div className="flex-1">{renderActiveComponent()}</div>

              <footer className="mt-8 py-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-500">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 md:mb-0 transition-colors duration-500">
                      © 2023 EduDash. All rights reserved.
                    </div>
                    <div className="flex space-x-6">
                      <a
                        href="#"
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm transition-colors duration-300"
                      >
                        Privacy Policy
                      </a>
                      <a
                        href="#"
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm transition-colors duration-300"
                      >
                        Terms of Service
                      </a>
                      <a
                        href="#"
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm transition-colors duration-300"
                      >
                        Contact Us
                      </a>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
