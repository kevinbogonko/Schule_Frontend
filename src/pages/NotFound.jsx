import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiHome,
  FiSearch,
  FiAlertTriangle,
  FiArrowLeft,
  FiGlobe,
  FiCompass,
  FiNavigation,
} from "react-icons/fi";
import { MdOutlineSchool } from "react-icons/md";

const NotFound = () => {
  const quickLinks = [
    { label: "Dashboard", path: "/dashboard", icon: <FiHome /> },
    {
      label: "Students",
      path: "/dashboard?tab=students",
      icon: <MdOutlineSchool />,
    },
    {
      label: "Teachers",
      path: "/dashboard?tab=teachers",
      icon: <MdOutlineSchool />,
    },
    { label: "Exams", path: "/dashboard?tab=exams", icon: <FiCompass /> },
  ];

  const searchSuggestions = [
    "Student Management",
    "Exam Results",
    "Timetable",
    "Reports",
    "Settings",
    "User Profile",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                i % 3 === 0
                  ? "bg-green-300/30"
                  : i % 3 === 1
                    ? "bg-blue-300/30"
                    : "bg-gray-300/30"
              }`}
            />
          </motion.div>
        ))}
      </div>

      <div className="pt-4 max-w-4xl w-full relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-green-50 to-blue-50 mb-8">
            <div className="relative">
              <FiAlertTriangle className="w-16 h-16 text-yellow-500" />
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">404</span>
              </div>
            </div>
          </div>

          <h1 className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-green-600 via-green-500 to-blue-600 bg-clip-text text-transparent mb-4">
            404
          </h1>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h2>

          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Oops! The page you're looking for seems to have wandered off. Don't
            worry, let's get you back on track.
          </p>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100"
        >
          {/* Search Bar */}
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiSearch className="mr-2 text-green-600" />
              Search for what you need
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search across Escuela..."
                className="w-full px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 rounded-xl focus:ring-1 focus:ring-green-500 focus:border-green-500 text-gray-800 placeholder-gray-500 text-lg transition-all duration-300 pl-14"
              />
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                <FiSearch className="text-green-500 text-xl" />
              </div>
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-300">
                Search
              </button>
            </div>

            {/* Search Suggestions */}
            <div className="flex flex-wrap gap-2 mt-4">
              {searchSuggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 rounded-lg text-sm text-gray-700 hover:text-green-600 transition-colors duration-300"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <FiNavigation className="mr-2 text-blue-600" />
              Quick Navigation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                >
                  <Link
                    to={link.path}
                    className="block p-5 bg-gradient-to-br from-green-50 to-blue-50 border border-green-100 rounded-xl hover:border-green-300 transition-all duration-300 group"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center mb-3 group-hover:from-green-200 group-hover:to-blue-200 transition-all duration-300">
                        <span className="text-green-600 text-xl">
                          {link.icon}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                        {link.label}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Back to Home Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 pt-8 border-t border-gray-100"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h4 className="font-semibold text-gray-800 mb-1">
                  Can't find what you're looking for?
                </h4>
                <p className="text-sm text-gray-600">
                  Our support team is here to help 24/7
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.history.back()}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-300 font-medium flex items-center"
                >
                  <FiArrowLeft className="mr-2" />
                  Go Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium flex items-center transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <FiHome className="mr-2" />
                  Go to Dashboard
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Error Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-xl p-6 mb-8 border border-green-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-100 to-green-200 flex items-center justify-center mx-auto mb-4">
                <FiGlobe className="text-green-600 text-2xl" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">
                Possible Reasons
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Outdated bookmark</li>
                <li>• Typo in URL</li>
                <li>• Page moved/renamed</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-4">
                <FiCompass className="text-blue-600 text-2xl" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">
                What You Can Do
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use search above</li>
                <li>• Check the URL</li>
                <li>• Contact support</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center mx-auto mb-4">
                <FiAlertTriangle className="text-yellow-500 text-2xl" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Report Issue</h4>
              <p className="text-sm text-gray-600 mb-3">
                Found a broken link? Let us know!
              </p>
              <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg text-sm font-medium transition-all duration-300">
                Report Problem
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-r from-green-600 to-green-700 shadow-lg hover:shadow-xl flex items-center justify-center text-white z-50"
        aria-label="Emergency Help"
      >
        <FiAlertTriangle className="text-xl" />
      </motion.button>
    </div>
  );
};

export default NotFound;
