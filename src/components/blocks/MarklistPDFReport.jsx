import React, { useState, useEffect } from "react";
import ReusableDiv from "../ReusableDiv";
import ReusableSelect from "../ReusableSelect";
import { FaUsersGear, FaSpinner } from "react-icons/fa6";
import { GrDocumentDownload } from "react-icons/gr";
import api from "../../hooks/api";
import { formOptions, yearOptions, termOptions } from "../../utils/CommonData";

const MarklistPDFReport = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examOptions, setExamOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

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
                name: examOptions.find(
                  (opt) => String(opt.value) === String(selectedExam)
                )?.value,
                outof: "100",
              },
            },
          },
          {
            responseType: "blob",
          }
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
            }))
          );
        } catch (error) {
          console.error("Error fetching exam options:", error);
        }
      }
    };
    fetchExamOptions();
  }, [selectedForm, selectedTerm, selectedYear]);

  return (
    <div className="p-0">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">
        Marklist
      </h1>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg text-center max-w-xs md:max-w-sm">
              <FaSpinner className="animate-spin text-2xl md:text-3xl text-blue-500 mx-auto mb-3 md:mb-4" />
              <p className="text-base md:text-lg font-medium text-gray-700 dark:text-gray-300">
                Loading Marklist Report...
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
                      (option) => option.value === selectedYear
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
                  Form
                </label>
                <ReusableSelect
                  id="form"
                  placeholder={
                    selectedYear ? "Select Form" : "Please select year first"
                  }
                  options={formOptions}
                  value={
                    formOptions.find(
                      (option) => option.value === selectedForm
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
                      (option) => option.value === selectedTerm
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
                      (option) => option.value === selectedExam
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
            tag="Marklist Report"
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
                  <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                    Marklist:
                  </h2>
                  <div className="flex-1 overflow-hidden rounded-md border border-gray-200 dark:border-gray-600">
                    <iframe
                      src={pdfUrl}
                      title="Student Report PDF"
                      width="100%"
                      height="100%"
                      className="min-h-[70vh]"
                    />
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
