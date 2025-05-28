import React, { useState, useEffect } from "react";
import Dropdown from "../Dropdown";
import { useToast } from "../Toast";
import ReusableDiv from "../ReusableDiv";
import api from "../../hooks/api";

const StudentAttemptedExams = ({studentId}) => {
  const { showToast } = useToast();
  const [examOptions, setExamOptions] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedForm, setSelectedForm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [markList, setMarkList] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAttemptedExams = async () => {
      try {
        setLoading(true);
        const response = await api.post("/exam/attemptedexam", {
          id: studentId,
        });

        const options = response.data.map((exam) => ({
          label: exam.exam_name,
          value: exam.exam_name,
        }));

        setExamOptions(options);
      } catch (error) {
        showToast("Failed to fetch attempted exams", "error", {
          duration: 3000,
          position: "top-right",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptedExams();
  }, []);

  const handleExamChange = async (selectedOption) => {
    setSelectedExam(selectedOption);

    const examName = selectedOption;
    const formMatch = examName.match(/term_\d+_form_(\d+)/);
    const yearMatch = examName.match(/(\d{4})$/);

    const form = formMatch ? formMatch[1] : "";
    const year = yearMatch ? yearMatch[1] : "";

    setSelectedForm(form);
    setSelectedYear(year);

    try {
      setLoading(true);
      const payload = {
        form,
        formula: "self",
        yearValue: year,
        exams: {
          exam_1: {
            alias: "EXAM",
            name: selectedOption,
            outof: 100,
          },
        },
      };

      const response = await api.post("/exam/marklist", payload);

      const studentRecord = response.data.find(
        (student) => student.id === studentId
      );

      // Add subjects to markList state
      const subjects = studentRecord?.subjects || {};
      setMarkList({ ...studentRecord, subjects });
    } catch (error) {
      showToast("Failed to fetch mark list", "error", {duration : 3000, position : 'top-right'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex dark:bg-gray-900 p-0 md:p-0">
      <ReusableDiv className="mb-6 pb-4 w-1/4 h-fit">
        <label htmlFor="exam_dropdown">Select Exam</label>
        <Dropdown
          id="exam_dropdown"
          options={examOptions}
          onChange={handleExamChange}
          placeholder={loading ? "Loading..." : "Select an exam"}
          disabled={loading || examOptions.length === 0}
          clearable
        />
      </ReusableDiv>

      <ReusableDiv className="flex-1 h-fit bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Loading marks...
            </p>
          </div>
        ) : markList ? (
          <div className="overflow-x-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              {selectedExam?.label} Results
            </h2>

            {/* Subject Marks */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(markList.subjects || {}).map(
                ([subject, result]) => (
                  <div
                    key={subject}
                    className="bg-gray-100 dark:bg-gray-700 rounded-md p-3 shadow-sm"
                  >
                    <h4 className="font-semibold text-gray-700 dark:text-gray-200">
                      {subject}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {result}
                    </p>
                  </div>
                )
              )}
            </div>

            {/* Summary Section */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2">
                Summary Details
              </h3>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
                <li>Total Points: {markList.points || "N/A"}</li>
                <li>Mean Grade: {markList.grade || "N/A"}</li>
                <li>Stream Rank: {markList.stream_rank || "N/A"}</li>
                <li>Overall Rank: {markList.overal_rank || "N/A"}</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {examOptions.length === 0
              ? "No attempted exams found"
              : "Select an exam to view marks"}
          </div>
        )}
      </ReusableDiv>
    </div>
  );
};

export default StudentAttemptedExams;
