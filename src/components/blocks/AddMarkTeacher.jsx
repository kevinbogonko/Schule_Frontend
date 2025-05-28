import React, { useState, useEffect } from "react";
import ReusableDiv from "../ReusableDiv";
import ReusableSelect from "../ReusableSelect";
import { FaUsersGear } from "react-icons/fa6";
import { GrDocumentConfig } from "react-icons/gr";
import { MdDone } from "react-icons/md";
import api from "../../hooks/api";
import TableMarkComponent from "../TableMarkComponent";
import {
  formOptions,
  yearOptions,
  termOptions,
  paperOptions,
  formulaOptions,
} from "../../utils/CommonData";
import { useToast } from "../Toast";
import ReusableInput from "../ui/ReusableInput";
import Button from "../ui/raw/Button";
import { motion, AnimatePresence } from "framer-motion";

const AddMarkTeacher = () => {
  const { showToast } = useToast();
  const [studentData, setStudentData] = useState([]);
  const [optimisticData, setOptimisticData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [selectedStream, setSelectedStream] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [examOptions, setExamOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [activeSubjects, setActiveSubjects] = useState([]);
  const [streamOptions, setStreamOptions] = useState([]);
  const [gradingScale, setGradingScale] = useState({
    E: { min: 0, max: 29 },
    "D-": { min: 30, max: 34 },
    D: { min: 35, max: 39 },
    "D+": { min: 40, max: 44 },
    "C-": { min: 45, max: 49 },
    C: { min: 50, max: 54 },
    "C+": { min: 55, max: 59 },
    "B-": { min: 60, max: 64 },
    B: { min: 65, max: 69 },
    "B+": { min: 70, max: 74 },
    "A-": { min: 75, max: 79 },
    A: { min: 80, max: 100 },
  });

  // Dynamic paper config state
  const [papers, setPapers] = useState(2);
  const [calculationMethod, setCalculationMethod] =
    useState("threePaperAvgAdd");
  const [isUpdatingPaperSetup, setIsUpdatingPaperSetup] = useState(false);
  const showPapers = true;
  const staffId = 56881; // Hardcoded staff ID as requested

  const resetBelow = (level) => {
    if (level === "year") {
      setSelectedForm("");
      setSelectedStream("");
      setSelectedTerm("");
      setSelectedExam("");
      setSelectedSubject("");
      setExamOptions([]);
      setSubjectOptions([]);
      setStreamOptions([]);
      setStudentData([]);
    } else if (level === "form") {
      setSelectedStream("");
      setSelectedTerm("");
      setSelectedExam("");
      setSelectedSubject("");
      setExamOptions([]);
      setSubjectOptions([]);
      setStreamOptions([]);
      setStudentData([]);
    } else if (level === "stream") {
      setSelectedTerm("");
      setSelectedExam("");
      setSelectedSubject("");
      setExamOptions([]);
      setSubjectOptions([]);
      setStudentData([]);
    } else if (level === "term") {
      setSelectedExam("");
      setSelectedSubject("");
      setExamOptions([]);
      // setSubjectOptions([]);
      setStudentData([]);
    } else if (level === "exam") {
      setSelectedSubject("");
      // setSubjectOptions([]);
      setStudentData([]);
    } else if (level === "subject") {
      setStudentData([]);
    }
  };

  // Fetch streams when form is selected
  useEffect(() => {
    const fetchStreams = async () => {
      if (selectedYear && selectedForm) {
        try {
          const response = await api.post("/stream/getstreams", {
            year: selectedYear,
            form: selectedForm,
          });

          const formattedStreams = response.data.map((stream) => ({
            value: stream.id,
            label: stream.stream_name,
          }));

          setStreamOptions(formattedStreams);
        } catch (err) {
          resetBelow("form");
          showToast(
            err.response?.data?.message || "Failed to fetch streams",
            "error",
            { duration: 3000, position: "top-right" }
          );
        }
      }
    };

    fetchStreams();
  }, [selectedForm]);

  // Fetch active subjects when form is selected
  useEffect(() => {
    const fetchActiveSubjects = async () => {
      if (selectedForm) {
        try {
          const response = await api.post("subject/getsubjects", {
            form: selectedForm,
          });
          const formatted = response.data.map((subject) => ({
            value: subject.id,
            label: subject.id + " " + subject.name,
          }));
          setActiveSubjects(formatted);
        } catch (err) {
          showToast(
            err.response?.data?.message || "Failed to fetch active subjects",
            "error",
            { duration: 3000, position: "top-right" }
          );
        }
      }
    };

    fetchActiveSubjects();
  }, [selectedForm]);

  // Fetch subjects when stream is selected and filter using activeSubjects
  useEffect(() => {
    const fetchSubjects = async () => {
      if (selectedForm && selectedYear && selectedStream) {
        try {
          const response = await api.post("/teacher/getteachersubjects", {
            form: selectedForm,
            year: selectedYear,
            teacher_id: staffId,
            stream_id: selectedStream,
          });

          const formattedSubjects = response.data.map((subject) => ({
            value: subject.subject_id,
            label: subject.subject_id,
          }));

          // Filter subjects
          const filteredSubjects = activeSubjects.filter((active) =>
            formattedSubjects.some((subject) => subject.value === active.value)
          );

          setSubjectOptions(filteredSubjects);
        } catch (err) {
          resetBelow("stream");
          showToast(
            err.response?.data?.message || "Failed to fetch subjects",
            "error",
            { duration: 3000, position: "top-right" }
          );
        }
      }
    };

    fetchSubjects();
  }, [selectedStream, activeSubjects]);

  useEffect(() => {
    const fetchExams = async () => {
      if (selectedForm && selectedTerm && selectedStream) {
        const payload = {
          form: selectedForm,
          term: selectedTerm,
          year: selectedYear,
          stream: selectedStream,
        };

        try {
          const response = await api.post("/exam/exams", payload);
          setExamOptions(
            response.data.map((exam) => ({
              value: exam.exam_name,
              label: exam.exam_name,
            }))
          );
        } catch (err) {
          resetBelow("term");
          showToast(
            err.response?.data?.message || "Failed to fetch exams",
            "error",
            { duration: 3000, position: "top-right" }
          );
        }
      }
    };
    fetchExams();
  }, [selectedTerm, selectedStream]);

  useEffect(() => {
    const fetchGradingScale = async () => {
      if (selectedForm && selectedExam && selectedSubject) {
        try {
          const response = await api.post("grading/gradingscale", {
            form: selectedForm,
            exam: selectedExam,
            subject: selectedSubject,
          });
          setGradingScale(response.data);
        } catch (error) {
          showToast("Failed to fetch grading scale, using default", "warning", {
            duration: 3000,
            position: "top-right",
          });
        }
      }
    };
    fetchGradingScale();
  }, [selectedSubject]);

  const fetchStudents = async () => {
    if (selectedForm && selectedExam && selectedSubject && selectedStream) {
      setIsRefreshing(true);
      const paperSetupPayload = {
        form: selectedForm,
        exam: selectedExam,
        subject: selectedSubject,
        stream: selectedStream,
      };

      try {
        const setupResponse = await api.post(
          "/exam/papersetup",
          paperSetupPayload
        );
        const papersValue = setupResponse.data[0]?.papers || 1;
        setPapers(papersValue);

        if (papersValue === 2) {
          setCalculationMethod("twoPaperAvg");
        } else {
          setCalculationMethod(
            setupResponse.data[0]?.formula || "threePaperAvg"
          );
        }
      } catch (err) {
        showToast(
          err.response?.data?.message || "Failed to fetch paper setup",
          "error",
          { duration: 3000, position: "top-right" }
        );
      }

      try {
        const response = await api.post(
          "/exam/subjectmarks",
          paperSetupPayload
        );

        const transformed = response.data.map((s) => {
          const student = {
            ...s,
            name: `${s.fname} ${s.lname}`,
            status: "Active",
          };

          if (selectedForm === "1" || selectedForm === "2") {
            student[selectedSubject] = s[selectedSubject] || 0;
            student.mark = student[selectedSubject];
          } else {
            student[selectedSubject] = s[selectedSubject] || 0;
            student[`${selectedSubject}_1`] = s[`${selectedSubject}_1`] || 0;
            student[`${selectedSubject}_2`] = s[`${selectedSubject}_2`] || 0;
            student[`${selectedSubject}_3`] = s[`${selectedSubject}_3`] || 0;
            student.mark = showPapers
              ? calculateMark(student)
              : student[selectedSubject];
          }

          return student;
        });

        setStudentData(transformed);
      } catch (err) {
        showToast(
          err.response?.data?.message || "Failed to fetch student data",
          "error",
          { duration: 3000, position: "top-right" }
        );
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setOptimisticData(null);
        }, 300); // Small delay for smoother transition
      }
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedSubject]);

  useEffect(() => {
    if (papers === 2) {
      setCalculationMethod("twoPaperAvg");
    } else if (papers === 3) {
      setCalculationMethod("threePaperAvg");
    }
  }, [papers]);

  const handleUpdatePaperSetup = async () => {
    if (!selectedSubject || !selectedExam) {
      showToast("Please select subject and exam first", "error", {
        duration: 3000,
        position : 'top-right'
      });
      return;
    }

    setIsUpdatingPaperSetup(true);

    try {
      const formData = {
        id: selectedSubject,
        exam: selectedExam,
        results: {
          papers: papers,
        },
      };

      if (papers === 3 && calculationMethod) {
        formData.results.formula = calculationMethod;
      }

      await api.put("exam/updatepapersetup", formData);
      showToast("Paper setup updated successfully", "success", {
        duration: 3000,
        position : 'top-right'
      });

      // Show loading state before refresh
      setIsRefreshing(true);
      setTimeout(() => {
        fetchStudents();
      }, 500); // Delay refresh slightly
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update paper setup",
        "error",
        { duration: 3000, position : 'top-right' }
      );
    } finally {
      setIsUpdatingPaperSetup(false);
    }
  };

  const calculateMark = (item) => {
    if (selectedForm === "1" || selectedForm === "2") {
      return item[selectedSubject] || 0;
    }

    if (!showPapers) {
      return item[selectedSubject] || 0;
    }

    const p1 = parseFloat(item[`${selectedSubject}_1`]) || 0;
    const p2 = parseFloat(item[`${selectedSubject}_2`]) || 0;
    const p3 = parseFloat(item[`${selectedSubject}_3`]) || 0;

    if (papers === 1) return p1;
    if (papers === 2) return Math.round((p1 + p2) / 2);
    if (papers === 3) {
      return calculationMethod === "threePaperAvgAdd"
        ? Math.round(((p1 + p2) / 160) * 60 + p3)
        : calculationMethod === "threePaperAddAgr"
        ? Math.round((p1 + p2 + p3) / 2)
        : Math.round((p1 + p2 + p3) / 3);
    }
    return 0;
  };

  const getColumns = () => {
    const baseColumns = [
      { uid: "id", name: "Reg No.", sortable: true },
      { uid: "name", name: "Name", sortable: true },
    ];

    if (selectedForm === "1" || selectedForm === "2") {
      return [
        ...baseColumns,
        { uid: selectedSubject, name: selectedSubject, sortable: true },
        { uid: "mark", name: "Mark", sortable: true },
        { uid: "grade", name: "Grade", sortable: true },
      ];
    } else {
      if (showPapers) {
        const paperColumns = [];
        if (papers >= 1)
          paperColumns.push({
            uid: `${selectedSubject}_1`,
            name: "Paper 1",
            sortable: true,
          });
        if (papers >= 2)
          paperColumns.push({
            uid: `${selectedSubject}_2`,
            name: "Paper 2",
            sortable: true,
          });
        if (papers >= 3)
          paperColumns.push({
            uid: `${selectedSubject}_3`,
            name: "Paper 3",
            sortable: true,
          });

        return [
          ...baseColumns,
          ...paperColumns,
          { uid: "mark", name: "Mark", sortable: true },
          { uid: "grade", name: "Grade", sortable: true },
        ];
      } else {
        return [
          ...baseColumns,
          { uid: selectedSubject, name: selectedSubject, sortable: true },
          { uid: "mark", name: "Mark", sortable: true },
          { uid: "grade", name: "Grade", sortable: true },
        ];
      }
    }
  };

  const getNumberColumns = () => {
    if (selectedForm === "1" || selectedForm === "2") {
      return [selectedSubject];
    } else {
      if (showPapers) {
        const cols = [];
        if (papers >= 1) cols.push(`${selectedSubject}_1`);
        if (papers >= 2) cols.push(`${selectedSubject}_2`);
        if (papers >= 3) cols.push(`${selectedSubject}_3`);
        return cols;
      } else {
        return [selectedSubject];
      }
    }
  };

  const getMarkCalculation = () => {
    if (selectedForm === "1" || selectedForm === "2") return null;
    if (!showPapers) return null;
    if (papers === 2) return "twoPaperAvg";
    if (papers === 3) return calculationMethod;
    return null;
  };

  const handleSubmit = async (data) => {
    try {
      // Optimistic update - show changes immediately
      setOptimisticData(data);

      const payload = {
        exam_name: selectedExam,
        results: data,
      };

      await api.put("/exam/updatemarks", payload);
      showToast("Marks saved successfully", "success", { duration: 3000, position : 'top-right' });

      // Smooth refresh with slight delay
      setIsRefreshing(true);
      setTimeout(() => {
        fetchStudents();
      }, 500);
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticData(null);
      showToast("Failed to save marks", "error", { duration: 3000, position : 'top-right' });
    }
  };

  const handleCancel = async () => {
    if (selectedForm && selectedExam && selectedSubject) {
      setIsRefreshing(true);
      setTimeout(() => {
        fetchStudents();
      }, 300);
    }
  };

  // Get the data to display (either optimistic or real data)
  const displayData = optimisticData
    ? studentData.map((student) => ({
        ...student,
        ...optimisticData[student.id],
      }))
    : studentData;

  return (
    <div className="p-0">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">
        Add Student's Mark
      </h1>

      <div className="flex flex-col lg:flex-row gap-2">
        {/* Controls Section */}
        <div className="w-full lg:w-1/4">
          <ReusableDiv
            className="ml-0 mr-0 ring-1 h-fit bg-blue-100 dark:bg-gray-800 mb-2"
            tag="Manage Students"
            icon={FaUsersGear}
          >
            <div className="flex flex-col space-y-3 pb-4">
              <div className="w-full">
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Year
                </label>
                <ReusableSelect
                  id="year"
                  placeholder="Select Year"
                  options={yearOptions}
                  value={
                    yearOptions.find((opt) => opt.value === selectedYear) ||
                    undefined
                  }
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    resetBelow("year");
                  }}
                  className="w-full"
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="form"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Form
                </label>
                <ReusableSelect
                  id="form"
                  placeholder="Select Form"
                  options={formOptions}
                  value={
                    formOptions.find((opt) => opt.value === selectedForm) ||
                    undefined
                  }
                  onChange={(e) => {
                    setSelectedForm(e.target.value);
                    resetBelow("form");
                  }}
                  disabled={!selectedYear}
                  className="w-full"
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="stream"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Stream
                </label>
                <ReusableSelect
                  id="stream"
                  placeholder="Select Stream"
                  options={streamOptions}
                  value={
                    streamOptions.find((opt) => opt.value === selectedStream) ||
                    undefined
                  }
                  onChange={(e) => {
                    setSelectedStream(e.target.value);
                    resetBelow("stream");
                  }}
                  disabled={!selectedForm}
                  className="w-full"
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="term"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Term
                </label>
                <ReusableSelect
                  id="term"
                  placeholder="Select Term"
                  options={termOptions}
                  value={
                    termOptions.find((opt) => opt.value === selectedTerm) ||
                    undefined
                  }
                  onChange={(e) => {
                    setSelectedTerm(e.target.value);
                    resetBelow("term");
                  }}
                  disabled={!selectedStream}
                  className="w-full"
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="exam"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Exam
                </label>
                <ReusableSelect
                  id="exam"
                  placeholder="Select Exam"
                  options={examOptions}
                  value={selectedExam}
                  onChange={(e) => {
                    setSelectedExam(e.target.value);
                    resetBelow("exam");
                  }}
                  disabled={!selectedTerm}
                  className="w-full"
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Subject
                </label>
                <ReusableSelect
                  id="subject"
                  placeholder="Select Subject"
                  options={subjectOptions}
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    resetBelow("subject");
                  }}
                  // disabled={!selectedExam}
                  className="w-full"
                />
              </div>
            </div>
          </ReusableDiv>

          {studentData.length > 0 &&
            (selectedForm === "3" || selectedForm === "4") && (
              <ReusableDiv
                className="ml-0 mr-0 ring-1 h-fit bg-blue-100 dark:bg-gray-800"
                tag="Paper Setup"
                icon={GrDocumentConfig}
                collapsible={true}
              >
                <div className="flex flex-col space-y-3 pb-4">
                  <ReusableInput
                    type="text"
                    disabled={true}
                    placeholder="Subject Code"
                    value={selectedSubject}
                  />
                  <ReusableSelect
                    id="paper_subject"
                    placeholder="Select Papers"
                    options={paperOptions}
                    value={papers}
                    onChange={(e) => setPapers(parseInt(e.target.value))}
                    className="w-full"
                  />
                  {papers === 3 && (
                    <ReusableSelect
                      id="formula"
                      placeholder="Select Formula"
                      options={formulaOptions}
                      value={calculationMethod}
                      onChange={(e) => setCalculationMethod(e.target.value)}
                      className="w-full"
                    />
                  )}
                  <Button
                    variant="primary"
                    icon={MdDone}
                    onClick={handleUpdatePaperSetup}
                    loading={isUpdatingPaperSetup}
                    className="mt-2"
                  >
                    Apply
                  </Button>
                </div>
              </ReusableDiv>
            )}
        </div>

        {/* Table Section */}
        <div className="w-full lg:w-3/4 relative min-h-[400px]">
          {isRefreshing && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/70">
              <div className="p-4 rounded-lg">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}
          {/* TableComponent should go here */}
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm dark:shadow-md p-2 md:p-4">
            {/* Add your <TableComponent /> here */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSubject + selectedExam}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <TableMarkComponent
                  columns={getColumns()}
                  data={displayData}
                  subjectCode={selectedSubject}
                  loading={loading}
                  numberColumns={getNumberColumns()}
                  markCalculation={getMarkCalculation()}
                  gradingScale={gradingScale}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMarkTeacher;
