import React, { useState, useEffect } from "react";
import api from "../../hooks/api";
import { useToast } from "../Toast";

const StaffInfo = ({staffId}) => {
  const [staffData, setStaffData] = useState({});
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch staff info
        const staffResponse = await api.post("/teacher/getteacher", {
          teacher_id: staffId,
        });

        if (staffResponse.data) {
          setStaffData(staffResponse.data);
        } else {
          showToast("No teacher data found", "warning");
        }
      } catch (error) {
        showToast(
          error.response?.data?.message || "Failed to fetch teacher data",
          "error"
        );
        console.error("Error fetching teacher data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [staffId, showToast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
        Staff Information
      </h2>

      <div className="dark:bg-gray-900 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b pb-2">
              Personal Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Staff Number
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {staffData.id || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Full Name
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {`${staffData.fname || ""} ${staffData.mname || ""} ${
                    staffData.lname || ""
                  }`.trim() || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Gender
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {staffData.sex === "F" ? "Female" : "Male" || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b pb-2">
              Contact Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Email
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {staffData.email || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Phone Number
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {staffData.phone || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Email Address
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {staffData.email || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StaffInfo;
