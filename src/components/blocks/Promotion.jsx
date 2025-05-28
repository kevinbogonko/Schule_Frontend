import React, { useState, useEffect } from "react";
import ReusableDiv from "../ReusableDiv";
import ReusableSelect from "../ReusableSelect";
import { PiExam } from "react-icons/pi";
import { TbReport } from "react-icons/tb";
import { FaPlus, FaMinus, FaSpinner } from "react-icons/fa";
import { MdDone } from "react-icons/md";
import {
  formOptions,
  yearOptions,
  termOptions,
  promotionOptions,
} from "../../utils/CommonData";
import { useToast } from "../Toast";
import ReusableInput from "../ui/ReusableInput";
import Dropdown from "../Dropdown";
import Button from "../ui/raw/Button";
import api from "../../hooks/api";
import TableComponent from "../TableComponent";

const Promotion = () => {
  const { showToast } = useToast();
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [examOptions, setExamOptions] = useState([]);
  const [selectedPromotionOption, setSelectedPromotionOption] = useState("");
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [error, setError] = useState("");
  const [examRows, setExamRows] = useState([
    { exam: null, examAlias: "", outOf: "" },
  ]);
  const [selectedFormula, setSelectedFormula] = useState("");
  const [isAddDisabled, setIsAddDisabled] = useState(true);
  const [studentResults, setStudentResults] = useState(null);
  const [streamOptions, setStreamOptions] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [showGradesDiv, setShowGradesDiv] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [promotedStudents, setPromotedStudents] = useState([]);

  const gradeOptions = [
    { value: "1", label: "E" },
    { value: "2", label: "D-" },
    { value: "3", label: "D" },
    { value: "4", label: "D+" },
    { value: "5", label: "C-" },
    { value: "6", label: "C" },
    { value: "7", label: "C+" },
    { value: "8", label: "B-" },
    { value: "9", label: "B" },
    { value: "10", label: "B+" },
    { value: "11", label: "A-" },
    { value: "12", label: "A" },
  ];

  const studentColumns = [
    { name: "REG NO.", uid: "id", sortable: true },
    { name: "NAME", uid: "name", sortable: true },
    { name: "CURRENT FORM", uid: "current_form", sortable: true },
    { name: "STREAM", uid: "stream", sortable: true },
    { name: "NEXT FORM", uid: "next_form", sortable: true },
  ];

  const promotedStudentColumns = [
    { name: "REG NO.", uid: "id", sortable: true },
    { name: "NAME", uid: "name", sortable: true },
    { name: "CURRENT FORM", uid: "current_form", sortable: true },
    { name: "GRADE", uid: "grade", sortable: true },
    { name: "STREAM", uid: "stream", sortable: true },
    { name: "NEXT FORM", uid: "next_form", sortable: true },
  ];

  useEffect(() => {
    let timeout;
    if (loading || buttonLoading || streamLoading) {
      timeout = setTimeout(() => {
        setShowLoadingOverlay(true);
      }, 300);
    } else {
      setShowLoadingOverlay(false);
    }
    return () => clearTimeout(timeout);
  }, [loading, buttonLoading, streamLoading]);

  const getAvailableOptions = (currentIndex) => {
    const selectedExams = examRows
      .map((row, index) => (index !== currentIndex ? row.exam : null))
      .filter(Boolean);
    return examOptions.filter(
      (option) => !selectedExams.includes(option.value)
    );
  };

  const validateRow = (row) => {
    const isAliasValid = row.examAlias.trim().length >= 3;
    const isOutOfValid = /^([1-9][0-9]?|100)$/.test(row.outOf);
    return row.exam && isAliasValid && isOutOfValid;
  };

  useEffect(() => {
    const valid = examRows.every(validateRow);
    setIsAddDisabled(!valid);
    if (examRows.length > 1 && !selectedFormula) {
      setSelectedFormula("average");
    }
  }, [examRows, selectedFormula]);

  const addExamRow = () => {
    if (examRows.length < 3) {
      setExamRows([...examRows, { exam: null, examAlias: "", outOf: "" }]);
    }
  };

  const removeExamRow = () => {
    if (examRows.length > 1) {
      const newRows = examRows.slice(0, -1);
      setExamRows(newRows);
      if (newRows.length < 2) setSelectedFormula("");
    }
  };

  const handleExamChange = async (index, value) => {
    const newRows = [...examRows];
    newRows[index].exam = value;
    setExamRows(newRows);
    setShowGradesDiv(!!value);
  };

  const handleInputChange = (index, field, value) => {
    const newRows = [...examRows];
    if (field === "outOf") {
      if (!/^(100|[1-9][0-9]?)?$/.test(value)) {
        showToast(
          "Out of value must be 1-100 and cannot start with 0",
          "error",
          { duration: 3000 }
        );
        return;
      }
    }
    newRows[index][field] = value;
    setExamRows(newRows);
  };

  const getFormulaOptions = () => {
    if (examRows.length === 2) {
      return [
        { value: "average", label: "Average" },
        { value: "weighted1", label: "Weighted : E1 + E2 = 100%" },
      ];
    } else if (examRows.length === 3) {
      return [
        { value: "average", label: "Average" },
        { value: "weighted2", label: "Weighted : E1 + E2 + E3 = 100%" },
        { value: "weighted3", label: "Weighted : .15E1 + .15E2 + .7E3 = 100%" },
      ];
    }
    return [];
  };

  const resetBelow = (field) => {
    if (field === "year") {
      setSelectedForm("");
      setSelectedTerm("");
      setExamOptions([]);
      setSelectedFormula("");
      setExamRows([{ exam: null, examAlias: "", outOf: "" }]);
      setStreamOptions([]);
      setSelectedStream(null);
      setStudentResults(null);
      setShowGradesDiv(false);
      setStudentsList([]);
      setPromotedStudents([]);
    }
    if (field === "form") {
      setSelectedTerm("");
      setExamOptions([]);
      setSelectedFormula("");
      setExamRows([{ exam: null, examAlias: "", outOf: "" }]);
      setStreamOptions([]);
      setSelectedStream(null);
      setStudentResults(null);
      setShowGradesDiv(false);
      setStudentsList([]);
      setPromotedStudents([]);
    }
    if (field === "term") {
      setExamOptions([]);
      setSelectedFormula("");
      setExamRows([{ exam: null, examAlias: "", outOf: "" }]);
      setStudentResults(null);
      setShowGradesDiv(false);
      setPromotedStudents([]);
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = {
        form: selectedForm,
        exams: {},
        formula: selectedFormula || "self",
        yearValue: selectedYear,
      };

      examRows.forEach((row, index) => {
        payload.exams[`exam_${index + 1}`] = {
          alias: row.examAlias,
          name: row.exam,
          outof: row.outOf,
        };
      });

      const response = await api.post("/sms/smsres", payload);
      setStudentResults(response.data.studentResults);
      return response.data.studentResults;
    } catch (err) {
      setError("Failed to load results. Please try again.");
      showToast("Failed to load results. Please try again.", "error", {
        duration: 3000,
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFormula = async () => {
    try {
      setButtonLoading(true);
      const results = await fetchResults();

      if (results && selectedGrade) {
        const selectedGradeValue = parseInt(selectedGrade);
        const filteredStudents = results
          .filter((student) => {
            const studentGradeOption = gradeOptions.find(
              (opt) => opt.label === student.ag_grade
            );
            const studentGradeValue = studentGradeOption
              ? parseInt(studentGradeOption.value)
              : 0;
            return studentGradeValue >= selectedGradeValue;
          })
          .map((student) => ({
            id: student.id,
            name: student.name,
            grade: student.ag_grade,
            current_form: selectedForm,
            stream: student.stream,
            next_form: parseInt(selectedForm) + 1,
          }));

        setPromotedStudents(filteredStudents);
        showToast(`Filtered ${filteredStudents.length} students`, "success", {
          duration: 3000,
        });
      }
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to generate results",
        "error",
        { duration: 3000 }
      );
    } finally {
      setButtonLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!selectedYear || !selectedForm) return;

    try {
      setLoading(true);
      const response = await api.post("/student/getstudents", {
        year: selectedYear,
        form: selectedForm,
      });

      if (response.data?.length > 0) {
        const formattedStudentData = response.data.map((student) => ({
          ...student,
          name: `${student.fname} ${student.lname}`,
          next_form: parseInt(student.current_form) + 1,
          stream:
            streamOptions.find((opt) => opt.value === student.stream_id)
              ?.label || "N/A",
        }));
        setStudentsList(formattedStudentData);
      } else {
        setStudentsList([]);
        showToast("No students found for selected form and year", "info", {
          duration: 3000,
        });
      }
    } catch (error) {
      showToast("Failed to fetch students", "error", { duration: 3000 });
      setStudentsList([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteStudents = async () => {
    if (studentsList.length === 0) {
      showToast("No students to promote", "error", { duration: 3000 });
      return;
    }

    try {
      setLoading(true);
      await api.post("/student/promotestudents", {
        form: selectedForm,
        year: selectedYear,
        // studentIds: studentsList.map((s) => s.id),
      });
      showToast("Students promoted successfully!", "success", {
        duration: 3000,
      });
      // fetchStudents();
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to promote students",
        "error",
        { duration: 3000 }
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteFilteredStudents = async () => {
    if (promotedStudents.length === 0) {
      showToast("No students to promote", "error", { duration: 3000 });
      return;
    }

    try {
      setLoading(true);
      await api.post("/student/promotegradedstudents", {
        form: selectedForm,
        year: selectedYear,
        studentIds: promotedStudents.map((s) => s.id),
      });
      setPromotedStudents([])
      showToast("Grade filtered students promoted successfully!", "success", {
        duration: 3000,
      });
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to promote students",
        "error",
        { duration: 3000 }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchExamOptions = async () => {
      if (selectedYear && selectedForm && selectedTerm) {
        setLoading(true);
        try {
          const response = await api.post("/exam/exams", {
            form: selectedForm,
            term: selectedTerm,
            year: selectedYear,
          });

          if (response.data.length === 0) {
            setExamOptions([]);
            showToast("No exams found for selected combination", "error", {
              duration: 3000,
            });
          } else {
            setExamOptions(
              response.data.map((exam) => ({
                value: exam.exam_name,
                label: exam.exam_name,
                key: exam.id,
              }))
            );
          }
        } catch (err) {
          if (err.response?.status === 404) {
            setExamOptions([]);
          } else {
            showToast(
              err?.response?.data?.message || "Failed to fetch exam options",
              "error",
              { duration: 3000 }
            );
          }
        } finally {
          setLoading(false);
        }
      }
    };
    fetchExamOptions();
  }, [selectedYear, selectedForm, selectedTerm]);

  useEffect(() => {
    const fetchStreams = async () => {
      if (selectedYear && selectedForm) {
        try {
          setStreamLoading(true);
          const response = await api.post("/stream/getstreams", {
            year: selectedYear,
            form: selectedForm,
          });

          const formattedStreams = response.data.map((stream) => ({
            value: stream.stream_id,
            label: stream.stream_name,
          }));
          setStreamOptions(formattedStreams);
        } catch (err) {
          if (err.response?.status === 404) {
            setStreamOptions([]);
          } else {
            showToast(
              err?.response?.data?.message || "Failed to fetch streams",
              "error",
              { duration: 3000 }
            );
          }
        } finally {
          setStreamLoading(false);
        }
      }
    };
    fetchStreams();
  }, [selectedYear, selectedForm]);

  return (
    <div className="p-0">
      <div className="my-2 w-full flex flex-col lg:flex-row">
        {(showLoadingOverlay || loading) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg text-center max-w-sm w-full mx-4">
              <FaSpinner className="animate-spin text-3xl text-blue-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Loading ...
              </p>
            </div>
          </div>
        )}

        <div className="w-full lg:w-1/3 lg:pr-4">
          <ReusableDiv className="ml-0 mr-0 mb-2" tag="Promotion Criteria">
            <div className="">
              <ReusableSelect
                id="criteria"
                className="w-full"
                placeholder="Select Criteria"
                options={promotionOptions}
                value={
                  promotionOptions.find(
                    (opt) => opt.value === selectedPromotionOption
                  ) || ''
                }
                onChange={(e) => {
                  const newVal = e.target.value;
                  setSelectedPromotionOption(newVal);
                }}
              />
            </div>
          </ReusableDiv>
          {selectedPromotionOption === "exam" ? (
            <ReusableDiv
              className="ml-0 mr-0 ring-1 h-fit mb-4 bg-blue-100 dark:bg-gray-800"
              tag="Select Exam"
              icon={PiExam}
              collapsible={true}
            >
              <div className="flex flex-wrap pb-4">
                <div className="w-full flex flex-col mb-2">
                  <label htmlFor="year" className="dark:text-gray-300">
                    Year
                  </label>
                  <ReusableSelect
                    id="year"
                    placeholder="Select Year"
                    options={yearOptions}
                    value={
                      yearOptions.find((opt) => opt.value === selectedYear) ||
                      null
                    }
                    onChange={(e) => {
                      const newVal = e.target.value;
                      resetBelow("year");
                      setSelectedYear(newVal);
                    }}
                  />
                </div>
                <div className="w-full flex flex-col mb-2">
                  <label htmlFor="form" className="dark:text-gray-300">
                    Form
                  </label>
                  <ReusableSelect
                    id="form"
                    placeholder="Select Form"
                    options={formOptions}
                    value={
                      selectedForm
                        ? formOptions.find((opt) => opt.value === selectedForm)
                        : null
                    }
                    onChange={(e) => {
                      const newVal = e.target.value;
                      resetBelow("form");
                      setSelectedForm(newVal);
                    }}
                    disabled={!selectedYear}
                  />
                </div>
                <div className="w-full flex flex-col mb-2">
                  <label htmlFor="term" className="dark:text-gray-300">
                    Term
                  </label>
                  <ReusableSelect
                    id="term"
                    placeholder="Select Term"
                    options={termOptions}
                    value={
                      termOptions.find((opt) => opt.value === selectedTerm) ||
                      null
                    }
                    onChange={(e) => {
                      const newVal = e.target.value;
                      resetBelow("term");
                      setSelectedTerm(newVal);
                    }}
                    disabled={!selectedForm}
                  />
                </div>
              </div>
            </ReusableDiv>
          ) : selectedPromotionOption === "all" ? (
            <ReusableDiv
              className="ml-0 mr-0 ring-1 h-fit mb-4 bg-blue-100 dark:bg-gray-800"
              tag="Select Students"
              icon={PiExam}
              collapsible={true}
            >
              <div className="flex flex-wrap pb-4">
                <div className="w-full flex flex-col mb-2">
                  <label htmlFor="year" className="dark:text-gray-300">
                    Year
                  </label>
                  <ReusableSelect
                    id="year"
                    placeholder="Select Year"
                    options={yearOptions}
                    value={
                      yearOptions.find((opt) => opt.value === selectedYear) ||
                      null
                    }
                    onChange={(e) => {
                      const newVal = e.target.value;
                      resetBelow("year");
                      setSelectedYear(newVal);
                    }}
                  />
                </div>
                <div className="w-full flex flex-col mb-2">
                  <label htmlFor="form" className="dark:text-gray-300">
                    Form
                  </label>
                  <ReusableSelect
                    id="form"
                    placeholder="Select Form"
                    options={formOptions}
                    value={
                      selectedForm
                        ? formOptions.find((opt) => opt.value === selectedForm)
                        : null
                    }
                    onChange={(e) => {
                      const newVal = e.target.value;
                      resetBelow("form");
                      setSelectedForm(newVal);
                    }}
                    disabled={!selectedYear}
                  />
                </div>
                <div className="w-full mt-2">
                  <Button
                    variant="primary"
                    onClick={fetchStudents}
                    disabled={!selectedYear || !selectedForm}
                    loading={loading}
                  >
                    Load Students
                  </Button>
                </div>
              </div>
            </ReusableDiv>
          ) : null}
        </div>

        <div className="w-full lg:w-2/3">
          {selectedPromotionOption === "exam" && (
            <ReusableDiv
              className="ml-0 mr-0 ring-0 flex-1 mb-4 bg-blue-100 dark:bg-gray-800"
              tag="Process Promotion Eligibility"
              icon={TbReport}
              collapsible={true}
            >
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <FaSpinner className="animate-spin" size={24} />
                </div>
              ) : (
                <div className="flex flex-col pb-1 space-y-2 h-full">
                  <div className="flex flex-row items-center gap-2 font-medium dark:text-gray-300">
                    <div className="w-2/5">Exam</div>
                    <div className="w-2/5">Exam Alias</div>
                    <div className="w-1/5">Out of %</div>
                  </div>

                  {examRows.map((row, index) => {
                    const isDisabled = examOptions.length === 0;
                    return (
                      <div
                        key={index}
                        className="flex flex-row items-center gap-2"
                      >
                        <div className="w-2/5">
                          <Dropdown
                            options={getAvailableOptions(index)}
                            value={row.exam}
                            onChange={(value) => handleExamChange(index, value)}
                            placeholder={
                              examRows.length === 1
                                ? "Select Exam"
                                : `Select Exam ${index + 1}`
                            }
                            menuPlacement="auto"
                            searchable
                            clearable
                            className="z-50"
                            disabled={isDisabled}
                          />
                        </div>
                        <div className="w-2/5">
                          <ReusableInput
                            type="text"
                            placeholder="Exam Alias"
                            value={row.examAlias}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "examAlias",
                                e.target.value
                              )
                            }
                            disabled={isDisabled}
                          />
                        </div>
                        <div className="w-1/5">
                          <ReusableInput
                            type="number"
                            placeholder="Out of %"
                            value={row.outOf}
                            onChange={(e) =>
                              handleInputChange(index, "outOf", e.target.value)
                            }
                            disabled={isDisabled}
                          />
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex flex-row gap-2">
                    {examRows.length < 3 && (
                      <Button
                        onClick={addExamRow}
                        variant="success"
                        className="my-0.5"
                        disabled={isAddDisabled}
                      >
                        <FaPlus size={12} /> Add Exam
                      </Button>
                    )}
                    {examRows.length > 1 && (
                      <Button
                        onClick={removeExamRow}
                        variant="danger"
                        className="my-0.5"
                      >
                        <FaMinus size={12} /> Remove Exam
                      </Button>
                    )}
                  </div>

                  {showGradesDiv && (
                    <div className="ml-0 mr-0 h-32 overflow-y-auto bg-blue-50 dark:bg-gray-700 mt-2 rounded-md">
                      <div className="p-4">
                        <h4 className="font-medium mb-2 dark:text-gray-300">
                          Select Minimum Grade for Promotion
                        </h4>
                        <div className="space-y-2">
                          {gradeOptions.map((grade) => (
                            <div
                              key={grade.value}
                              className="flex items-center"
                            >
                              <input
                                type="radio"
                                id={`grade-${grade.value}`}
                                name="grade"
                                value={grade.value}
                                className="mr-2"
                                checked={selectedGrade === grade.value}
                                onChange={() => setSelectedGrade(grade.value)}
                              />
                              <label
                                htmlFor={`grade-${grade.value}`}
                                className="dark:text-gray-300"
                              >
                                {grade.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className={`mt-2 flex ${
                      examRows.length > 1
                        ? "flex-row items-center gap-4 justify-between"
                        : "justify-start"
                    }`}
                  >
                    {examRows.length > 1 && (
                      <div className="w-2/5">
                        <ReusableSelect
                          id="formula"
                          placeholder="Select Formula"
                          className="my-0.5"
                          options={getFormulaOptions()}
                          value={
                            getFormulaOptions().find(
                              (opt) => opt.value === selectedFormula
                            ) || null
                          }
                          onChange={(e) => setSelectedFormula(e.target.value)}
                          disabled={examOptions.length === 0}
                        />
                      </div>
                    )}
                    <Button
                      variant="primary"
                      icon={MdDone}
                      onClick={handleApplyFormula}
                      className="my-0.5"
                      loading={buttonLoading}
                      disabled={
                        isAddDisabled ||
                        examOptions.length === 0 ||
                        (examRows.length > 1 && !selectedFormula) ||
                        !selectedGrade
                      }
                    >
                      Apply Formula
                    </Button>
                  </div>
                </div>
              )}
            </ReusableDiv>
          )}

          {selectedPromotionOption === "all" && (
            <div className="flex flex-col h-full">
              <ReusableDiv
                className="ml-0 mr-0 flex-1 bg-blue-100 dark:bg-gray-800"
                tag="Student List"
                icon={TbReport}
                collapsible={true}
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium dark:text-gray-300">
                      {studentsList.length} Students Found
                    </h3>
                    <Button
                      variant="primary"
                      onClick={handlePromoteStudents}
                      disabled={studentsList.length === 0}
                      loading={loading}
                    >
                      Promote Students
                    </Button>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <TableComponent
                      columns={studentColumns}
                      data={studentsList}
                      loading={loading}
                      horizontalTableFlow={true}
                      showSelectAllCheckbox={false}
                      striped={true}
                      borderColor="blue-200 dark:border-gray-700"
                      rowColors={{
                        default: "hover:bg-blue-50 dark:hover:bg-gray-700",
                        selected: "bg-blue-100 dark:bg-gray-600",
                      }}
                      buttons={{
                        addButton: {
                          show: false,
                        },
                      }}
                    />
                  </div>
                </div>
              </ReusableDiv>
            </div>
          )}
        </div>
      </div>

      {selectedPromotionOption === "exam" && promotedStudents.length > 0 && (
        <ReusableDiv
          className="ml-0 mr-0 dark:bg-gray-800"
          tag="Students Eligible for Promotion"
          collapsible={true}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium dark:text-gray-300">
              {promotedStudents.length} Students Eligible
            </h3>
            <Button
              variant="primary"
              onClick={handlePromoteFilteredStudents}
              loading={loading}
            >
              Promote Students
            </Button>
          </div>
          <TableComponent
            columns={promotedStudentColumns}
            data={promotedStudents}
            loading={loading}
            horizontalTableFlow={true}
            showSelectAllCheckbox={false}
            striped={true}
            borderColor="blue-200 dark:border-gray-700"
            rowColors={{
              default: "hover:bg-blue-50 dark:hover:bg-gray-700",
              selected: "bg-blue-100 dark:bg-gray-600",
            }}
            buttons={{
              addButton: {
                show: false,
              },
            }}
          />
        </ReusableDiv>
      )}
    </div>
  );
};

export default Promotion;
