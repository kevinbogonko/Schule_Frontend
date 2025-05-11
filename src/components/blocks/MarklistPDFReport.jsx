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
    <div className="w-full my-4 flex flex-1 gap-2">
      <ReusableDiv
        className="w-1/4 ring-1 h-fit bg-blue-100"
        tag="Manage Student Marks"
        icon={FaUsersGear}
      >
        <div className="flex flex-wrap pb-4">
          <div className="w-full flex flex-col mb-2">
            <label htmlFor="year">Year</label>
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
            />
          </div>
          <div className="w-full flex flex-col mb-2">
            <label htmlFor="form">Form</label>
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
            />
          </div>
          <div className="w-full flex flex-col mb-2">
            <label htmlFor="term">Term</label>
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
            />
          </div>
          <div className="w-full flex flex-col mb-2">
            <label htmlFor="exam">Exam</label>
            <ReusableSelect
              id="exam"
              placeholder="Select Exam"
              options={examOptions}
              value={
                examOptions.find((opt) => opt.value === selectedExam) ||
                undefined
              }
              onChange={(e) => {
                setSelectedExam(e.target.value);
                resetBelow("exam");
              }}
              disabled={!selectedTerm}
            />
          </div>
        </div>
      </ReusableDiv>

      <ReusableDiv
        icon={GrDocumentDownload}
        tag="Student Report"
        className="flex-1 flex flex-col ring-1 h-full overflow-hidden mb-4 bg-blue-100"
        collapsible={true}
      >
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <FaSpinner className="animate-spin text-2xl" />
          </div>
        ) : error ? (
          <div className="text-red-500 p-4">{error}</div>
        ) : pdfUrl ? (
          <div
            className="flex flex-col h-full overflow-auto pb-12"
            style={{ height: "90vh" }}
          >
            <h2 className="p-2 font-semibold">Student Report Form:</h2>
            <iframe
              src={pdfUrl}
              title="PDF Report"
              width="100%"
              height="100%"
              style={{ border: "1px solid #ddd", borderRadius: "4px" }}
            />
          </div>
        ) : (
          <div className="p-4 text-gray-500">
            Select exam to generate report
          </div>
        )}
      </ReusableDiv>
    </div>
  );
};

export default MarklistPDFReport;
