import React, { useState, useEffect } from "react";
import ReusableDiv from "../../ui/ReusableDiv";
import ReusableSelect from "../../ui/ReusableSelect";
import { FaUsersGear, FaSpinner } from "react-icons/fa6";
import { GrDocumentDownload } from "react-icons/gr";
import api from "../../../hooks/api";
import {
  formOptions,
  yearOptions,
  termOptions,
} from "../../../utils/CommonData";

const MarklistPDFReport = ({ syst_level }) => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examOptions, setExamOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

  const setFormOptions =
    formOptions.find((option) => option.label === syst_level)?.options || [];

  let isCBC;
  syst_level === "Secondary (8-4-4)" ? (isCBC = false) : (isCBC = true);

  const resetBelow = (field) => {
    switch (field) {
      case "year":
        setSelectedForm(null);
        setSelectedTerm(null);
        setSelectedExam(null);
        setExamOptions([]);
        setPdfUrl(null);
        break;
      case "form":
        setSelectedTerm(null);
        setSelectedExam(null);
        setExamOptions([]);
        setPdfUrl(null);
        break;
      case "term":
        setSelectedExam(null);
        setExamOptions([]);
        setPdfUrl(null);
        break;
      case "exam":
        setPdfUrl(null);
        break;
      default:
        break;
    }
  };

  const fetchPdfReport = async () => {
    if (selectedForm && selectedExam && selectedYear) {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post(
          "/report/marklistpdf",
          {
            form: selectedForm,
            formula: "self",
            yearValue: selectedYear,
            exams: {
              exam_1: {
                alias: "TEST EXAM",
                name: examOptions.find((exam) => exam.value === selectedExam)
                  ?.key,
                outof: "100",
              },
            },
            year: selectedYear,
            term: selectedTerm,
            examname: examOptions.find((exam) => exam.value === selectedExam)
              ?.key,
          },
          {
            responseType: "blob",
          },
        );

        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error("Error fetching PDF report:", error);
        setError("Failed to load PDF report. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchPdfReport();
  }, [selectedExam]);

  useEffect(() => {
    const fetchExamOptions = async () => {
      if (selectedForm && selectedTerm && selectedYear) {
        try {
          const response = await api.post("exam/exams", {
            form: selectedForm,
            term: selectedTerm,
            year: selectedYear,
          });
          setExamOptions(
            response.data.map((exam) => ({
              value: exam.exam_name,
              label: exam.exam_name,
              key: exam.id,
            })),
          );
        } catch (error) {
          console.error("Error fetching exam options:", error);
        }
      }
    };
    fetchExamOptions();
  }, [selectedForm, selectedTerm, selectedYear]);

  // Clean up blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <div className="p-0">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">
        {isCBC ? "Scoresheet" : "Marklist"}
      </h1>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg text-center max-w-xs md:max-w-sm">
              <FaSpinner className="animate-spin text-2xl md:text-3xl text-blue-500 mx-auto mb-3 md:mb-4" />
              <p className="text-base md:text-lg font-medium text-gray-700 dark:text-gray-300">
                Loading {isCBC ? "Scoresheet" : "Marklist"} Report...
              </p>
            </div>
          </div>
        )}

        {/* Form Controls */}
        <div className="w-full lg:w-1/4">
          <ReusableDiv
            className="ml-0 mr-0 ring-1 h-fit bg-blue-100 dark:bg-gray-800"
            tag="Manage Reports"
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
                    yearOptions.find(
                      (option) => option.value === selectedYear,
                    ) || undefined
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
                  {isCBC ? "Grade" : "Form"}
                </label>
                <ReusableSelect
                  id="form"
                  placeholder={
                    selectedYear ? "Select Level" : "Please select year first"
                  }
                  options={setFormOptions}
                  value={
                    setFormOptions.find(
                      (option) => option.value === selectedForm,
                    ) || undefined
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
                      (option) => option.value === selectedTerm,
                    ) || undefined
                  }
                  onChange={(e) => {
                    setSelectedTerm(e.target.value);
                    resetBelow("term");
                  }}
                  disabled={!selectedForm}
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
                  placeholder={
                    selectedTerm ? "Select Exam" : "Please select term first"
                  }
                  options={examOptions}
                  value={
                    examOptions.find(
                      (option) => option.value === selectedExam,
                    ) || undefined
                  }
                  onChange={(e) => {
                    setSelectedExam(e.target.value);
                    resetBelow("exam");
                  }}
                  disabled={!selectedTerm}
                  className="w-full"
                />
              </div>
            </div>
          </ReusableDiv>
        </div>

        {/* Report Viewer */}
        <div className="w-full lg:w-3/4">
          <ReusableDiv
            icon={GrDocumentDownload}
            tag={isCBC ? "Scoresheet Report" : "Marklist Report"}
            className="ml-0 mr-0 ring-1 bg-white dark:bg-gray-800 rounded-md shadow-sm dark:shadow-md h-full"
            collapsible={true}
          >
            <div className="p-2 md:p-4">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <FaSpinner className="animate-spin text-xl text-blue-600 dark:text-blue-400" />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    Generating Report...
                  </span>
                </div>
              ) : error ? (
                <div className="text-red-500 dark:text-red-400 p-4 text-center">
                  {error}
                </div>
              ) : pdfUrl ? (
                <div
                  className="flex flex-col h-full"
                  style={{ minHeight: "70vh" }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                      {isCBC ? "Scoresheet" : "Marklist"}
                    </h2>

                    {/* Download button for all devices */}
                    <a
                      href={pdfUrl}
                      download={`${isCBC ? "scoresheet" : "marklist"}_${selectedForm}_${selectedTerm}_${selectedExam}.pdf`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                    >
                      <GrDocumentDownload />
                      Download PDF
                    </a>
                  </div>

                  {/* Responsive PDF Viewer */}
                  <div className="flex-1 overflow-hidden rounded-md border border-gray-200 dark:border-gray-600">
                    {/* Desktop: iframe (hidden on mobile) */}
                    <div className="hidden md:block h-full">
                      <iframe
                        src={pdfUrl}
                        title="Student Report PDF"
                        width="100%"
                        height="100%"
                        className="min-h-[70vh]"
                        style={{ border: "none" }}
                      />
                    </div>

                    {/* Mobile: Google Docs Viewer + Options (visible only on mobile) */}
                    <div className="block md:hidden">
                      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-700 min-h-[50vh]">
                        <p className="text-center mb-6 text-gray-600 dark:text-gray-300">
                          PDF preview is optimized for larger screens. Choose
                          how you'd like to view on your mobile device.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                          <a
                            href={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-center transition-colors"
                          >
                            View in Google Docs
                          </a>
                          <a
                            href={pdfUrl}
                            download={`${isCBC ? "scoresheet" : "marklist"}_${selectedForm}_${selectedTerm}_${selectedExam}.pdf`}
                            className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-center transition-colors"
                          >
                            Download PDF
                          </a>
                        </div>

                        {/* Optional: Open in new tab option */}
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Or open in new tab
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">
                  Select all required options to generate report
                </div>
              )}
            </div>
          </ReusableDiv>
        </div>
      </div>
    </div>
  );
};

export default MarklistPDFReport;
