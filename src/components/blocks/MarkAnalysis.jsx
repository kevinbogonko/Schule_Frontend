import React, { useState, useEffect } from "react";
import ReusableDiv from "../ReusableDiv";
import ReusableSelect from "../ReusableSelect";
// import { FaUsersGear } from 'react-icons/fa6';
import { PiExam } from "react-icons/pi";
import { TbReport } from "react-icons/tb";
import { FaPlus, FaMinus, FaSpinner } from "react-icons/fa";
import { MdDone } from "react-icons/md";
import { formOptions, yearOptions, termOptions } from "../../utils/CommonData";
import { useToast } from "../Toast";
import ReusableInput from "../ui/ReusableInput";
import Dropdown from "../Dropdown";
import Button from "../ui/raw/Button";
import api from "../../hooks/api";
import { GrDocumentDownload } from "react-icons/gr";

const MarkAnalysis = ({ syst_level }) => {
  const { showToast } = useToast();

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [examOptions, setExamOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [error, setError] = useState("");
  const [examRows, setExamRows] = useState([{ exam: null, outOf: "" }]);
  const [examAliasSingle, setExamAliasSingle] = useState("");
  const [selectedFormula, setSelectedFormula] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const setFormOptions =
    formOptions.find((option) => option.label === syst_level)?.options || [];

  const isCBC = syst_level !== "Secondary (8-4-4)";

  const getAvailableOptions = (currentIndex) => {
    const selectedExams = examRows
      .map((row, idx) => (idx !== currentIndex ? row.exam : null))
      .filter(Boolean);
    return examOptions.filter(
      (option) => !selectedExams.includes(option.value)
    );
  };

  const validateOutOf = (value) => /^([1-9][0-9]?|100)$/.test(String(value));

  // Overall validation: different rules for single vs multiple exam rows
  useEffect(() => {
    if (!examRows || examRows.length === 0) {
      setIsFormValid(false);
      return;
    }

    // Every row must have an exam selected and a valid outOf
    const rowsValid = examRows.every(
      (r) => r.exam && validateOutOf(r.outOf || "100")
    );

    if (examRows.length === 1) {
      // single exam: alias is the selected exam (no separate alias input required)
      setIsFormValid(Boolean(rowsValid));
      // ensure examAliasSingle is synced to the single exam value for clarity (optional)
      setExamAliasSingle(examRows[0].exam || "");
      // clear formula for single exam
      if (selectedFormula) setSelectedFormula("");
    } else {
      // multiple exams: need global alias min 3 chars and rows valid
      const aliasValid = examAliasSingle.trim().length >= 3;
      setIsFormValid(rowsValid && aliasValid);
      // set default formula to average if not set
      if (!selectedFormula) setSelectedFormula("average");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examRows, examAliasSingle, selectedFormula]);

  const addExamRow = () => {
    if (examRows.length >= 3) return;
    setExamRows((prev) => [...prev, { exam: null, outOf: "" }]);
  };

  const removeExamRow = () => {
    setExamRows((prev) => {
      if (prev.length <= 1) return prev;
      const newRows = prev.slice(0, -1);
      // if now single row, sync alias to that exam (if any)
      if (newRows.length === 1) {
        setExamAliasSingle(newRows[0].exam || "");
        setSelectedFormula("");
      }
      return newRows;
    });
  };

  const handleExamChange = (index, value) => {
    setExamRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], exam: value };
      // If there's only one row, sync examAliasSingle for single exam behavior
      if (next.length === 1) setExamAliasSingle(value || "");
      return next;
    });
  };

  const handleInputChange = (index, field, value) => {
    // sanitize outOf input (only allow empty or 1-100)
    if (field === "outOf") {
      if (!/^(100|[1-9][0-9]?)?$/.test(value)) {
        showToast(
          "Out of value must be 1-100 and cannot start with 0",
          "error",
          {
            duration: 2000,
          }
        );
        return;
      }
    }
    setExamRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const getFormulaOptions = () => {
    if (examRows.length === 2) {
      return [
        { value: "average", label: "Average" },
        { value: "weighted1", label: "Weighted : E1 + E2 = 100%" },
      ];
    }
    if (examRows.length === 3) {
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
      setExamRows([{ exam: null, outOf: "" }]);
      setExamAliasSingle("");
    } else if (field === "form") {
      setSelectedTerm("");
      setExamOptions([]);
      setSelectedFormula("");
      setExamRows([{ exam: null, outOf: "" }]);
      setExamAliasSingle("");
    } else if (field === "term") {
      setExamOptions([]);
      setSelectedFormula("");
      setExamRows([{ exam: null, outOf: "" }]);
      setExamAliasSingle("");
    }
  };

  const fetchPdf = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        form: selectedForm,
        exams: {},
        formula: selectedFormula || "self",
        yearValue: selectedYear,
        year: selectedYear,
        term: selectedTerm,
        examname: "",
      };

      // examname: single exam -> that exam value; multiple -> global alias
      if (examRows.length > 1) {
        payload.examname = examAliasSingle.trim();
      } else {
        payload.examname = examRows[0]?.exam || "";
      }

      examRows.forEach((row, index) => {
        const aliasVal = row.exam; // per your choice C: keep alias as exam value
        const nameKey =
          examOptions.find((opt) => opt.value === row.exam)?.key || row.exam;
        payload.exams[`exam_${index + 1}`] = {
          alias: aliasVal,
          name: nameKey,
          outof: row.outOf || "100",
        };
      });

      const response = await api.post("/report/markanalysis", payload, {
        responseType: "blob",
      });

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
    } catch (err) {
      console.error("Error fetching PDF:", err);
      setError("Failed to load PDF. Please try again.");
      showToast("Failed to load PDF. Please try again.", "error", {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFormula = async () => {
    try {
      setButtonLoading(true);
      await fetchPdf();
      showToast("Report generated successfully!", "success", {
        duration: 3000,
      });
    } catch (err) {
      console.error("API Error:", err);
      showToast(
        err?.response?.data?.message || "Failed to generate report",
        "error",
        {
          duration: 2000,
        }
      );
    } finally {
      setButtonLoading(false);
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

          if (!response?.data || response.data.length === 0) {
            setExamOptions([]);
            showToast("No exams found for selected combination", "error", {
              duration: 3000,
              position: "top-center",
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
          setExamOptions([]);
          showToast(
            err?.response?.data?.message || "Failed to fetch exam options",
            "error",
            {
              duration: 3000,
              position: "top-center",
            }
          );
        } finally {
          setLoading(false);
        }
      }
    };

    fetchExamOptions();
  }, [selectedYear, selectedForm, selectedTerm]);

  return (
    <div className="p-0">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">
        Exam Report Processing
      </h1>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Form Controls */}
        <div className="w-full lg:w-1/2">
          <ReusableDiv
            className="ml-0 mr-0 ring-1 h-fit bg-blue-100 dark:bg-gray-800"
            tag="Select Exam"
            icon={PiExam}
            collapsible={true}
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
                    yearOptions.find(
                      (option) => option.value === selectedYear
                    ) || undefined
                  }
                  onChange={(e) => {
                    const newVal = e.target.value;
                    resetBelow("year");
                    setSelectedYear(newVal);
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
                  placeholder={
                    selectedYear ? "Select Form" : "Please select year first"
                  }
                  options={setFormOptions}
                  value={
                    selectedForm
                      ? setFormOptions.find((opt) => opt.value === selectedForm)
                      : undefined
                  }
                  onChange={(e) => {
                    const newVal = e.target.value;
                    resetBelow("form");
                    setSelectedForm(newVal);
                  }}
                  disabled={!selectedYear}
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
                  placeholder={
                    selectedForm ? "Select Term" : "Please select form first"
                  }
                  options={termOptions}
                  value={
                    termOptions.find(
                      (option) => option.value === selectedTerm
                    ) || undefined
                  }
                  onChange={(e) => {
                    const newVal = e.target.value;
                    resetBelow("term");
                    setSelectedTerm(newVal);
                  }}
                  disabled={!selectedForm}
                  className="w-full"
                />
              </div>
            </div>
          </ReusableDiv>
        </div>

        {/* Process Report Section */}
        <div className="w-full lg:w-1/2">
          <ReusableDiv
            className="ml-0 mr-0 ring-1 h-full mb-4 bg-blue-100 dark:bg-gray-800"
            tag="Process Report"
            icon={TbReport}
            collapsible={true}
          >
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <FaSpinner className="animate-spin" size={24} />
              </div>
            ) : (
              <div className="flex flex-col pb-1 space-y-2">
                <div className="flex flex-row items-center gap-2 font-medium dark:text-gray-300">
                  <div className="w-3/5">Exam</div>
                  <div className="w-2/5">Out of %</div>
                </div>

                {examRows.map((row, index) => {
                  const isDisabled = examOptions.length === 0;
                  return (
                    <div
                      key={index}
                      className="flex flex-row items-center gap-2"
                    >
                      <div className="w-3/5">
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
                          type="number"
                          placeholder="Out of %"
                          value={row.outOf || "100"}
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
                      disabled={!isFormValid && examRows.length > 1}
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

                {/* Global alias input: appears only for 2+ exams */}
                {examRows.length > 1 && (
                  <div className="mt-2 w-full">
                    <label className="dark:text-gray-300">
                      Exam Alias (global)
                    </label>
                    <ReusableInput
                      type="text"
                      placeholder="Enter alias (min 3 chars)"
                      value={examAliasSingle}
                      onChange={(e) => setExamAliasSingle(e.target.value)}
                      className="my-1"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Global alias will be used as <code>examname</code> when
                      submitting.
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
                    <div className="w-3/5 mr-2">
                      <ReusableSelect
                        id="formula"
                        placeholder="Select Formula"
                        className="my-0.5"
                        options={getFormulaOptions()}
                        value={
                          getFormulaOptions().find(
                            (opt) => opt.value === selectedFormula
                          ) || undefined
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
                      !isFormValid ||
                      examOptions.length === 0 ||
                      (examRows.length > 1 && !selectedFormula)
                    }
                  >
                    Apply Formula
                  </Button>
                </div>
              </div>
            )}
          </ReusableDiv>
        </div>
      </div>

      {/* Report Viewer */}
      <div className="mt-4">
        <ReusableDiv
          icon={GrDocumentDownload}
          tag="Subject Analysis Report"
          className="ml-0 mr-0 ring-1 bg-white dark:bg-gray-800 rounded-md shadow-sm dark:shadow-md"
          collapsible={true}
        >
          {pdfUrl ? (
            <div
              className="flex flex-col h-full p-0"
              style={{ minHeight: "70vh" }}
            >
              <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                Subject Analysis Report:
              </h2>
              <div className="flex-1 overflow-hidden rounded-md border border-gray-200 dark:border-gray-600">
                <iframe
                  src={pdfUrl}
                  title="PDF Report"
                  width="100%"
                  height="100%"
                  className="min-h-[70vh]"
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">
              Configure and process exams to generate report
            </div>
          )}
        </ReusableDiv>
      </div>
    </div>
  );
};

export default MarkAnalysis;
