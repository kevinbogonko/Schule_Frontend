import { useState, useEffect } from "react";
import ReusableDiv from "../../ui/ReusableDiv";
import ReusableSelect from "../../ui/ReusableSelect";
import { FaUsersGear } from "react-icons/fa6";
import { GrDocumentConfig } from "react-icons/gr";
import { MdDone } from "react-icons/md";
import api from "../../../hooks/api";
import TableMarkComponent from "../../ui/TableMarkComponent";
import {
  formOptions,
  yearOptions,
  termOptions,
  paperOptions,
  formulaOptions,
} from "../../../utils/CommonData";
import { useToast } from "../../ui/Toast";
import ReusableInput from "../../ui/ReusableInput";
import Button from "../../ui/Button";
import { motion, AnimatePresence } from "framer-motion";

const AddMark = ({ syst_level }) => {
  const { showToast } = useToast();
  const [studentData, setStudentData] = useState([]);
  const [optimisticData, setOptimisticData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedExamKey, setSelectedExamKey] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [examOptions, setExamOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
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

  // Forms that support multiple papers (non-CBC)
  const multiPaperNonCBC = [21, 22];

  const setFormOptions =
    formOptions.find((option) => option.label === syst_level)?.options || [];

  const isCBC = syst_level !== "Secondary (8-4-4)";

  // ─── Reset helpers ────────────────────────────────────────────────────────────
  const resetBelow = (level) => {
    if (level === "year") {
      setSelectedForm("");
      setSelectedTerm("");
      setSelectedExam("");
      setSelectedSubject("");
      setExamOptions([]);
      setSubjectOptions([]);
      setStudentData([]);
    } else if (level === "form") {
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
      setSubjectOptions([]);
      setStudentData([]);
    } else if (level === "exam") {
      setSelectedSubject("");
      setSubjectOptions([]);
      setStudentData([]);
    } else if (level === "subject") {
      setStudentData([]);
    }
  };

  // ─── Fetch exams when form + term are selected ────────────────────────────────
  useEffect(() => {
    const fetchExams = async () => {
      if (selectedForm && selectedTerm) {
        const payload = {
          form: selectedForm,
          term: selectedTerm,
          year: selectedYear,
        };
        try {
          const response = await api.post("/exam/exams", payload);
          setExamOptions(
            response.data.map((exam) => ({
              value: exam.exam_name,
              label: exam.exam_name,
              key: exam.id,
            })),
          );
        } catch (err) {
          resetBelow("term");
          showToast(
            err.response?.data?.message || "Failed to fetch exams",
            "error",
            { duration: 3000, position: "top-right" },
          );
        }
      }
    };
    fetchExams();
  }, [selectedTerm]);

  // ─── Fetch subjects when exam is selected ────────────────────────────────────
  useEffect(() => {
    const fetchSubjects = async () => {
      if (selectedForm && selectedExam) {
        const payload = {
          form: selectedForm,
          exam: selectedExam,
        };
        try {
          const response = await api.post("/exam/examsubject", payload);
          setSubjectOptions(
            response.data.map((subject) => ({
              value: subject.id,
              label: subject.id + " " + subject.name,
            })),
          );
        } catch (err) {
          resetBelow("exam");
          showToast(
            err.response?.data?.message || "Failed to fetch subjects",
            "error",
            { duration: 3000, position: "top-right" },
          );
        }
      }
    };
    fetchSubjects();
  }, [selectedExam]);

  // ─── Fetch grading scale when subject is selected ────────────────────────────
  useEffect(() => {
    const fetchGradingScale = async () => {
      if (selectedForm && selectedExam && selectedSubject) {
        try {
          const response = await api.post("grading/gradingscale", {
            form: selectedForm,
            subject: selectedSubject,
            exam_id: selectedExamKey,
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

  // ─── Mark calculation (mirrors TableMarkComponent logic) ─────────────────────
  const calculateMark = (item) => {
    if (!multiPaperNonCBC.includes(Number(selectedForm))) {
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
      if (calculationMethod === "threePaperAvgAdd")
        return Math.round(((p1 + p2) / 160) * 60 + p3);
      if (calculationMethod === "threePaperAddAgr")
        return Math.round((p1 + p2 + p3) / 2);
      return Math.round((p1 + p2 + p3) / 3);
    }
    return 0;
  };

  // ─── Fetch students + paper setup ────────────────────────────────────────────
  const fetchStudents = async () => {
    if (!selectedForm || !selectedExamKey || !selectedSubject) return;

    setIsRefreshing(true);
    const paperSetupPayload = {
      form: selectedForm,
      exam_id: selectedExamKey,
      subject: selectedSubject,
    };

    // Fetch paper setup first
    try {
      const setupResponse = await api.post(
        "/exam/papersetup",
        paperSetupPayload,
      );
      const papersValue = setupResponse.data[0]?.papers || 1;
      setPapers(papersValue);

      if (papersValue === 2) {
        setCalculationMethod("twoPaperAvg");
      } else {
        setCalculationMethod(setupResponse.data[0]?.formula || "threePaperAvg");
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to fetch paper setup",
        "error",
        { duration: 3000, position: "top-right" },
      );
    }

    // Fetch student marks
    try {
      const response = await api.post("/exam/subjectmarks", paperSetupPayload);
      const transformed = response.data.map((s) => {
        const student = {
          ...s,
          name: `${s.fname} ${s.lname}`,
          status: "Active",
        };

        if (!multiPaperNonCBC.includes(Number(selectedForm))) {
          // Single-paper subject: just use the subject column directly
          student[selectedSubject] = s[selectedSubject] || 0;
          student.mark = student[selectedSubject];
        } else {
          // Multi-paper subject: populate each paper column
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
      console.error(err);
      showToast(
        err.response?.data?.message || "Failed to fetch student data",
        "error",
        { duration: 3000, position: "top-right" },
      );
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
        setOptimisticData(null);
      }, 300);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedSubject]);

  // Keep calculationMethod in sync when papers change
  useEffect(() => {
    if (papers === 2) {
      setCalculationMethod("twoPaperAvg");
    } else if (papers === 3 && calculationMethod === "twoPaperAvg") {
      // Only reset to default 3-paper formula if it was previously a 2-paper method
      setCalculationMethod("threePaperAvg");
    }
  }, [papers]);

  // ─── Update paper setup ───────────────────────────────────────────────────────
  const handleUpdatePaperSetup = async () => {
    if (!selectedSubject || !selectedExamKey) {
      showToast("Please select subject/learning area and exam first", "error", {
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    setIsUpdatingPaperSetup(true);

    try {
      const formData = {
        id: selectedSubject,
        exam_id: selectedExamKey,
        results: { papers },
      };

      if (papers === 3 && calculationMethod) {
        formData.results.formula = calculationMethod;
      }

      await api.put("exam/updatepapersetup", formData);
      showToast("Paper setup updated successfully", "success", {
        duration: 3000,
        position: "top-right",
      });

      setIsRefreshing(true);
      setTimeout(() => {
        fetchStudents();
      }, 500);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update paper setup",
        "error",
        { duration: 3000, position: "top-right" },
      );
    } finally {
      setIsUpdatingPaperSetup(false);
    }
  };

  // ─── Column definitions ───────────────────────────────────────────────────────
  const getColumns = () => {
    const baseColumns = [
      { uid: "id", name: "Reg No.", sortable: true },
      { uid: "name", name: "Name", sortable: true },
    ];

    const markCol = {
      uid: "mark",
      name: isCBC ? "Score" : "Mark",
      sortable: true,
    };
    const gradeCol = {
      uid: "grade",
      name: isCBC ? "PL" : "Grade",
      sortable: true,
    };

    if (!multiPaperNonCBC.includes(Number(selectedForm))) {
      return [
        ...baseColumns,
        { uid: selectedSubject, name: selectedSubject, sortable: true },
        markCol,
        gradeCol,
      ];
    }

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

      return [...baseColumns, ...paperColumns, markCol, gradeCol];
    }

    return [
      ...baseColumns,
      { uid: selectedSubject, name: selectedSubject, sortable: true },
      markCol,
      gradeCol,
    ];
  };

  // ─── Number columns passed to TableMarkComponent ──────────────────────────────
  // These keys MUST exactly match the Excel column headers your sheet uses.
  // e.g. if subject is "102", numberColumns will be ["102_1", "102_2", "102_3"]
  const getNumberColumns = () => {
    if (!multiPaperNonCBC.includes(Number(selectedForm))) {
      return [selectedSubject];
    }
    if (showPapers) {
      const cols = [];
      if (papers >= 1) cols.push(`${selectedSubject}_1`);
      if (papers >= 2) cols.push(`${selectedSubject}_2`);
      if (papers >= 3) cols.push(`${selectedSubject}_3`);
      return cols;
    }
    return [selectedSubject];
  };

  const getMarkCalculation = () => {
    if (!multiPaperNonCBC.includes(Number(selectedForm))) return null;
    if (!showPapers) return null;
    if (papers === 2) return "twoPaperAvg";
    if (papers === 3) return calculationMethod;
    return null;
  };

  // ─── Submit (save marks) ──────────────────────────────────────────────────────
  const handleSubmit = async (data) => {
    try {
      setOptimisticData(data);

      const payload = {
        exam_id: selectedExamKey,
        results: data,
      };

      await api.put("/exam/updatemarks", payload);
      showToast("Marks saved successfully", "success", {
        duration: 3000,
        position: "top-right",
      });

      setIsRefreshing(true);
      setTimeout(() => {
        fetchStudents();
      }, 500);
    } catch (error) {
      setOptimisticData(null);
      showToast("Failed to save marks", "error", {
        duration: 3000,
        position: "top-right",
      });
    }
  };

  // ─── Cancel / reset ───────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (selectedForm && selectedExam && selectedSubject) {
      setIsRefreshing(true);
      setTimeout(() => {
        fetchStudents();
      }, 300);
    }
  };

  // Merge optimistic update into display data
  const displayData = optimisticData
    ? studentData.map((student) => ({
        ...student,
        ...(optimisticData[student.id] || {}),
      }))
    : studentData;

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-0">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">
        Add Student&apos;s {isCBC ? "Score" : "Mark"}
      </h1>
      <div className="flex flex-col lg:flex-row gap-2">
        {/* ── Controls ── */}
        <div className="w-full lg:w-1/4">
          <ReusableDiv
            className="ml-0 mr-0 ring-1 h-fit bg-blue-100 dark:bg-gray-800 mb-2"
            tag="Manage Students"
            icon={FaUsersGear}
          >
            <div className="flex flex-col space-y-3 pb-4">
              {/* Year */}
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

              {/* Form / Grade */}
              <div className="w-full">
                <label
                  htmlFor="form"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {isCBC ? "Grade" : "Form"}
                </label>
                <ReusableSelect
                  id="form"
                  placeholder={`Select ${isCBC ? "grade" : "form"}`}
                  options={setFormOptions}
                  value={
                    setFormOptions.find((opt) => opt.value === selectedForm) ||
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

              {/* Term */}
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
                  disabled={!selectedForm}
                  className="w-full"
                />
              </div>

              {/* Exam */}
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
                    setSelectedExamKey(
                      examOptions.find(
                        (opt) => opt.value === String(e.target.value),
                      )?.key,
                    );
                    resetBelow("exam");
                  }}
                  disabled={!selectedTerm}
                  className="w-full"
                />
              </div>

              {/* Subject / Learning Area */}
              <div className="w-full">
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {isCBC ? "Learning Area" : "Subject"}
                </label>
                <ReusableSelect
                  id="subject"
                  placeholder={`Select ${isCBC ? "learning area" : "Subject"}`}
                  options={subjectOptions}
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    resetBelow("subject");
                  }}
                  disabled={!selectedExam}
                  className="w-full"
                />
              </div>
            </div>
          </ReusableDiv>

          {/* Paper Setup panel — only for multi-paper non-CBC forms */}
          {studentData.length > 0 &&
            multiPaperNonCBC.includes(Number(selectedForm)) && (
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

        {/* ── Table ── */}
        <div className="w-full lg:w-3/4 relative min-h-[400px]">
          {isRefreshing && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/70 dark:bg-gray-900/70">
              <div className="p-4 rounded-lg">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm dark:shadow-md p-2 md:p-4">
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

export default AddMark;
