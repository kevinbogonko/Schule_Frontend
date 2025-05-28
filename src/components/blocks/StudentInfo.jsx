import React, { useState, useEffect } from "react";
import api from "../../hooks/api";
import { useToast } from "../Toast";

const StudentInfo = ({studentId}) => {
  const [studentData, setStudentData] = useState({});
  const [streamOptions, setStreamOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStreams, setLoadingStreams] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingStreams(true);

        // Fetch student info
        const studentResponse = await api.post("/student/getstudentinfo", {
          student_id: studentId,
        });

        // Fetch stream names
        const streamsResponse = await api.get("/stream/getstreamnames");

        if (studentResponse.data) {
          setStudentData(studentResponse.data);
        } else {
          showToast("No student data found", "warning");
        }

        if (streamsResponse.data) {
          setStreamOptions(
            streamsResponse.data.map((stream) => ({
              value: stream.id,
              label: stream.stream_name,
            }))
          );
        } else {
          showToast("No stream data found", "warning");
        }
      } catch (error) {
        showToast(
          error.response?.data?.message || "Failed to fetch data",
          "error"
        );
      } finally {
        setLoading(false);
        setLoadingStreams(false);
      }
    };

    fetchData();
  }, []);

  if (loading || loadingStreams) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-0">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        Student Information
      </h2>

      <div className="dark:bg-gray-900 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-0">
          {/* Personal Information Section */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">
              Personal Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Registration Number
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {studentData.id || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Full Name
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {`${studentData.fname || ""} ${studentData.mname || ""} ${
                    studentData.lname || ""
                  }`.trim() || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Sex
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {studentData.sex === "F" ? "Female" : "Male" || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Date of Birth
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {studentData.dob
                    ? new Date(studentData.dob).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">
              Contact Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Phone Number
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {studentData.phone || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Address
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {studentData.address || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Academic Information Section */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">
              Academic Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Current Form
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {studentData.current_form
                    ? `Form ${studentData.current_form}`
                    : "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Stream
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {streamOptions.find(
                    (s) => s.value === String(studentData.stream_id)
                  )?.label || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Enrolment Year
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {studentData.year_of_enrolment || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">
              Additional Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  UPI Number
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {studentData.upi_number || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  KCPE Marks
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {studentData.kcpe_marks || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentInfo;
