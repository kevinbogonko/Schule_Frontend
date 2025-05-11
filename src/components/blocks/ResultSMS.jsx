import React, { useState, useEffect } from "react";
import ReusableDiv from "../ReusableDiv";
import ReusableSelect from "../ReusableSelect";
import { PiExam } from "react-icons/pi";
import { TbMessage2Cog, TbReport, TbSend } from "react-icons/tb";
import { FaPlus, FaMinus, FaSpinner } from "react-icons/fa";
import { MdDone, MdOutlinePreview } from "react-icons/md";
import { formOptions, yearOptions, termOptions } from "../../utils/CommonData";
import { useToast } from "../Toast";
import ReusableInput from "../ui/ReusableInput";
import Dropdown from "../Dropdown";
import Button from "../ui/raw/Button";
import api from "../../hooks/api";
import { AiOutlineClear } from "react-icons/ai";
import CheckboxGroup from "../CheckboxGroup";
import TableComponent from "../TableComponent";

const ResultSMS = () => {
  const { showToast } = useToast();
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [examOptions, setExamOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [smsLoading, setSMSLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [error, setError] = useState("");
  const [smsError, setSMSError] = useState("");
  const [examRows, setExamRows] = useState([
    { exam: null, examAlias: "", outOf: "" },
  ]);
  const [selectedFormula, setSelectedFormula] = useState("");
  const [isAddDisabled, setIsAddDisabled] = useState(true);
  const [studentResults, setStudentResults] = useState(null);
  const [schoolDetails, setSchoolDetails] = useState(null);
  const [streamOptions, setStreamOptions] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [smsType, setSmsType] = useState(null);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isDropdownCleared, setIsDropdownCleared] = useState(false);
  const [uniVal, setUniVal] = useState("");
  const [smsLogs, setSmsLogs] = useState([]);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  const smsTypeOptions = [
    { value: "single", label: "Student Select - (Single)" },
    { value: "bulk", label: "All Students - (Bulk)" },
  ];

  // Define your columns
  const columns = [
    { name: "REG NO.", uid: "student_id", sortable: true },
    { name: "PHONE", uid: "phone", sortable: true },
    {
      name: "STATUS",
      uid: "response_code",
      sortable: true,
    },
    { name: "DESCRIPTION", uid: "description", sortable: true },
    {
      name: "TIMESTAMP",
      uid: "timestamp",
      sortable: true,
      render: (item) => formatTimestamp(item.timestamp),
    },
  ];

  const excludedColumns = [{ name: "ID", uid: "id", sortable: true }];

  // Format timestamp to readable format
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  useEffect(() => {
    let timeout;
    if (loading || smsLoading || buttonLoading || streamLoading) {
      timeout = setTimeout(() => {
        setShowLoadingOverlay(true);
      }, 300);
    } else {
      setShowLoadingOverlay(false);
    }
    return () => clearTimeout(timeout);
  }, [loading, smsLoading, buttonLoading, streamLoading]);

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

      let newUniVal = "";
      for (let i = 0; i < newRows.length; i++) {
        if (newRows[i].exam) {
          if (newUniVal) {
            newUniVal += `_${newRows[i].exam}`;
          } else {
            newUniVal = newRows[i].exam;
          }
        } else {
          break;
        }
      }
      setUniVal(newUniVal);
    }
  };

  const handleExamChange = async (index, value) => {
    const newRows = [...examRows];

    if (!value && index < newRows.length - 1) {
      for (let i = index; i < newRows.length; i++) {
        newRows[i].exam = null;
      }
    }

    newRows[index].exam = value;
    setExamRows(newRows);

    let newUniVal = "";
    for (let i = 0; i < newRows.length; i++) {
      if (newRows[i].exam) {
        if (newUniVal) {
          newUniVal += `_${newRows[i].exam}`;
        } else {
          newUniVal = newRows[i].exam;
        }
      } else {
        break;
      }
    }

    setUniVal(newUniVal);
  };

  const fetchSmsLogs = async (unival) => {
    try {
      const response = await api.post("/sms/getsmslogs", { unival });
      setSmsLogs(response.data || []);
    } catch (error) {
      if (error.response?.status === 404) {
        setSmsLogs([]);
      } else {
        console.error("Error fetching SMS logs:", error);
        showToast("Failed to fetch SMS logs", "error", { duration: 2000 });
      }
    }
  };

  useEffect(() => {
    if (uniVal) {
      fetchSmsLogs(uniVal);
    } else {
      setSmsLogs([]);
    }
  }, [uniVal]);

  const handleInputChange = (index, field, value) => {
    const newRows = [...examRows];
    if (field === "outOf") {
      if (!/^(100|[1-9][0-9]?)?$/.test(value)) {
        showToast(
          "Out of value must be 1-100 and cannot start with 0",
          "error",
          { duration: 2000 }
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
      setSchoolDetails(null);
      setIsDropdownCleared(false);
      setSelectedStudents([]);
      setSmsType(null);
      setUniVal("");
      setSmsLogs([]);
    }
    if (field === "form") {
      setSelectedTerm("");
      setExamOptions([]);
      setSelectedFormula("");
      setExamRows([{ exam: null, examAlias: "", outOf: "" }]);
      setStreamOptions([]);
      setSelectedStream(null);
      setStudentResults(null);
      setSchoolDetails(null);
      setIsDropdownCleared(false);
      setSelectedStudents([]);
      setSmsType(null);
      setUniVal("");
      setSmsLogs([]);
    }
    if (field === "term") {
      setExamOptions([]);
      setSelectedFormula("");
      setExamRows([{ exam: null, examAlias: "", outOf: "" }]);
      setStudentResults(null);
      setSchoolDetails(null);
      setIsDropdownCleared(false);
      setSelectedStudents([]);
      setSmsType(null);
      setUniVal("");
      setSmsLogs([]);
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

      setSchoolDetails(response.data.schoolDetails);
      setStudentResults(response.data.studentResults);
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Failed to load results. Please try again.");
      showToast("Failed to load results. Please try again.", "error", {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFormula = async () => {
    try {
      setButtonLoading(true);
      await fetchResults();
      showToast("Results generated successfully!", "success", {
        duration: 3000,
      });
    } catch (error) {
      console.error("API Error:", error);
      showToast(
        error?.response?.data?.message || "Failed to generate results",
        "error",
        { duration: 2000 }
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

          if (response.data.length === 0) {
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
          if (err.response?.status === 404) {
            setExamOptions([]);
          } else {
            showToast(
              err?.response?.data?.message || "Failed to fetch exam options",
              "error",
              {
                duration: 3000,
                position: "top-center",
              }
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
            value: stream.id,
            label: stream.stream_name,
          }));

          setStreamOptions(formattedStreams);
        } catch (err) {
          console.error("Error fetching streams:", err);
          if (err.response?.status === 404) {
            setStreamOptions([]);
          } else {
            showToast(
              err?.response?.data?.message || "Failed to fetch streams",
              "error",
              { duration: 2000 }
            );
          }
        } finally {
          setStreamLoading(false);
        }
      }
    };

    fetchStreams();
  }, [selectedYear, selectedForm]);

  useEffect(() => {
    if (selectedStream && smsType && studentResults) {
      const streamLabel = streamOptions.find(
        (stream) => stream.value === selectedStream
      )?.label;

      if (streamLabel) {
        const filteredStudents = studentResults.filter(
          (student) => student.stream === streamLabel
        );

        const mappedPhoneNumbers = filteredStudents.map((student) => ({
          value: student.id,
          label: `${student.id} ${student.name}`,
        }));

        setPhoneNumbers(mappedPhoneNumbers);

        if (smsType === "bulk") {
          setSelectedStudents(mappedPhoneNumbers.map((option) => option.value));
        } else {
          setSelectedStudents([]);
        }
      }
    }
  }, [selectedStream, smsType, studentResults, streamOptions]);

  const isSmsParamsDisabled = !studentResults || !streamOptions.length;
  const showCheckboxGroup =
    smsType === "single" && phoneNumbers.length > 0 && !isDropdownCleared;
  const showButtons = smsType !== null && !isDropdownCleared;
  const isSendDisabled = smsType === "single" && selectedStudents.length === 0;
  const showClearButton = smsType === "single";

  const handleClear = () => {
    setSelectedStudents([]);
  };

  const handleSend = async () => {
    try {
      setSMSLoading(true);
      setSMSError(null);

      const payload = {
        form: selectedForm,
        exams: {},
        formula: selectedFormula || "self",
        yearValue: selectedYear,
        selectedStudents: selectedStudents,
        unival: uniVal,
      };

      examRows.forEach((row, index) => {
        payload.exams[`exam_${index + 1}`] = {
          alias: row.examAlias,
          name: row.exam,
          outof: row.outOf,
        };
      });

      const response = await api.post("/sms/sendresultsms", payload);
      showToast("SMS sent successfully!", "success", { duration: 3000 });
      fetchSmsLogs(uniVal);
    } catch (err) {
      console.error("Error sending SMS:", err);
      setSMSError("Failed to send SMS. Please try again.");
      showToast(err?.response?.data?.message || "Failed to send SMS", "error", {
        duration: 3000,
      });
    } finally {
      setSMSLoading(false);
    }
  };

  return (
    <div>
      <div className="my-4 w-full flex flex-col lg:flex-row">
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
          <ReusableDiv
            className="ring-1 h-fit mb-4 bg-blue-100 dark:bg-gray-800"
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
                    undefined
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
                      : undefined
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
                    undefined
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
        </div>
        <div className="w-full lg:w-2/3">
          <div className="flex flex-col lg:flex-row mb-2 gap-4">
            <div className="w-full lg:w-1/2">
              <ReusableDiv
                className="ring-1 h-fit mb-2 bg-blue-100 dark:bg-gray-800"
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
                              onChange={(value) =>
                                handleExamChange(index, value)
                              }
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
                                handleInputChange(
                                  index,
                                  "outOf",
                                  e.target.value
                                )
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
                          isAddDisabled ||
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
            <div className="w-full lg:w-1/2">
              <ReusableDiv
                className="h-fit bg-blue-100 dark:bg-gray-800"
                tag="SMS Parameters"
                icon={TbMessage2Cog}
                collapsible={true}
              >
                {streamLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <FaSpinner className="animate-spin" size={24} />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-start mb-2 gap-4">
                      <div className="w-full lg:w-1/2">
                        <Dropdown
                          placeholder="Select Stream"
                          options={streamOptions}
                          value={selectedStream}
                          onChange={(value) => {
                            setSelectedStream(value);
                            setSmsType(null);
                            setSelectedStudents([]);
                            setIsDropdownCleared(!value);
                          }}
                          disabled={isSmsParamsDisabled}
                          clearable
                          onClear={() => {
                            setSelectedStream(null);
                            setSmsType(null);
                            setSelectedStudents([]);
                            setIsDropdownCleared(true);
                          }}
                        />
                      </div>
                      <div className="w-full lg:w-1/2">
                        <ReusableSelect
                          options={smsTypeOptions}
                          className="ring-1"
                          value={smsType || ""}
                          disabled={!selectedStream}
                          onChange={(e) => {
                            setSmsType(e.target.value);
                            setSelectedStudents([]);
                          }}
                        />
                      </div>
                    </div>

                    {selectedStream && smsType && (
                      <>
                        {showCheckboxGroup && (
                          <div className="ml-0 mr-0 px-0 flex-1 h-fit mt-4 bg-blue-100 dark:bg-gray-700">
                            <CheckboxGroup
                              label="Phone Numbers"
                              className="mt-1 mr-0 ring-1"
                              options={phoneNumbers}
                              selectedValues={selectedStudents}
                              onChange={(values) => {
                                setSelectedStudents(values);
                              }}
                              name="phone_numbers"
                            />
                          </div>
                        )}

                        {showButtons && (
                          <div className="mt-1 flex items-center justify-start gap-2">
                            {showClearButton && (
                              <Button
                                className="ring-1"
                                variant="secondary"
                                icon={AiOutlineClear}
                                onClick={handleClear}
                                disabled={selectedStudents.length === 0}
                              >
                                Clear
                              </Button>
                            )}
                            <Button
                              variant="primary"
                              icon={TbSend}
                              disabled={isSendDisabled || smsLoading}
                              loading={smsLoading}
                              onClick={handleSend}
                            >
                              Send
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </ReusableDiv>
            </div>
          </div>
        </div>
      </div>
      <ReusableDiv className="dark:bg-gray-800">
        <TableComponent
          columns={columns}
          data={smsLogs}
          loading={loading}
          horizontalTableFlow={true}
          excludedColumns={excludedColumns}
          showSelectAllCheckbox={false}
          striped={true}
          buttons={{
            actionButtons: {
              show: false,
            },
          }}
          borderColor="blue-200 dark:border-gray-700"
          rowColors={{
            default: "hover:bg-blue-50 dark:hover:bg-gray-700",
            selected: "bg-blue-100 dark:bg-gray-600",
          }}
          defaultVisibleColumns={["name", "id", "status", "actions"]}
        />
      </ReusableDiv>
    </div>
  );
};

export default ResultSMS;
