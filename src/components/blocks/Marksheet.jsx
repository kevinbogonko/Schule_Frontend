import React, { useState, useEffect } from "react";
import ReusableDiv from "../ReusableDiv";
import ReusableSelect from "../ReusableSelect";
import { FaUsersGear, FaSpinner } from "react-icons/fa6";
import { GrDocumentDownload } from "react-icons/gr";
import api from "../../hooks/api";
import { useToast } from "../Toast";
import { formOptions, yearOptions, termOptions } from "../../utils/CommonData";

const Marksheet = () => {
  const { showToast } = useToast();

  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedStream, setSelectedStream] = useState(null);

  const [streamOptions, setStreamOptions] = useState([]);
  const [examOptions, setExamOptions] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const resetBelow = (field) => {
    switch (field) {
      case "year":
        setSelectedForm(null);
        setSelectedTerm(null);
        setSelectedExam(null);
        setSelectedStream(null);
        setStreamOptions([]);
        setExamOptions([]);
        setPdfUrl(null);
        break;
      case "form":
        setSelectedTerm(null);
        setSelectedExam(null);
        setSelectedStream(null);
        setStreamOptions([]);
        setExamOptions([]);
        setPdfUrl(null);
        break;
      case "term":
        setSelectedExam(null);
        setSelectedStream(null);
        setExamOptions([]);
        setPdfUrl(null);
        break;
      case "exam":
        setSelectedStream(null);
        setPdfUrl(null);
        break;
      default:
        break;
    }
  };

  const fetchStreamOptions = async () => {
    if (selectedForm && selectedYear) {
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
      } catch (error) {
        console.log(error)
        showToast("Error fetching streams", "error", {
          duration: 3000,
          position: "top-right",
        });
      }
    }
  };

  const fetchExamOptions = async () => {
    if (selectedForm && selectedYear && selectedTerm) {
      try {
        const response = await api.post("/exam/exams", {
          form: selectedForm,
          year: selectedYear,
          term: selectedTerm,
        });

        const formatted = response.data.map((exam) => ({
          value: exam.exam_name,
          label: exam.exam_name,
        }));

        setExamOptions(formatted);
      } catch (error) {
        showToast("Error fetching exams", "error",{ duration: 3000, position: "top-right"});
      }
    }
  };

  useEffect(() => {
    fetchStreamOptions();
  }, [selectedForm, selectedYear]);

  useEffect(() => {
    fetchExamOptions();
  }, [selectedTerm, selectedForm, selectedYear]);

  const fetchPdf = async (streamId) => {
    if (
      selectedForm &&
      selectedExam &&
      selectedTerm &&
      selectedYear &&
      streamId
    ) {
      setLoading(true);
      setPdfUrl(null);
      try {
        const response = await api.post(
          "/report/marksheetpdf",
          {
            year: selectedYear,
            form: selectedForm,
            term: selectedTerm,
            exam: selectedExam,
            stream: streamId,
          },
          { responseType: "blob" }
        );

        const pdfBlob = new Blob([response.data], { type: "application/pdf" });
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
        showToast("PDF loaded successfully", "success", {
          duration: 3000,
          position: "top-right",
        });
      } catch (error) {
        showToast("Error fetching PDF", "error", {
          duration: 3000,
          position: "top-right",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-0">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">
        Marksheet
      </h1>
  
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg text-center max-w-xs md:max-w-sm">
              <FaSpinner className="animate-spin text-2xl md:text-3xl text-blue-500 mx-auto mb-3 md:mb-4" />
              <p className="text-base md:text-lg font-medium text-gray-700 dark:text-gray-300">
                Loading Marksheet...
              </p>
            </div>
          </div>
        )}
  
        {/* Form Controls */}
        <div className="w-full lg:w-1/4">
          <ReusableDiv
            className="ml-0 mr-0 ring-1 h-fit bg-blue-100 dark:bg-gray-800"
            tag="Manage Marks"
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
                      (option) => option.label === selectedExam
                    ) || undefined
                  }
                  onChange={(e) => {
                    const selected = examOptions.find(
                      (opt) => opt.value === e.target.value
                    );
                    setSelectedExam(selected ? selected.label : null);
                    resetBelow("exam");
                  }}
                  disabled={!selectedTerm}
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
                    streamOptions.find(
                      (option) => option.value === selectedStream
                    ) || undefined
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedStream(value);
                    fetchPdf(value);
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </ReusableDiv>
        </div>
  
        {/* PDF Viewer */}
        <div className="w-full lg:w-3/4">
          <ReusableDiv
            icon={GrDocumentDownload}
            tag="Marksheet"
            className="ml-0 mr-0 ring-1 bg-white dark:bg-gray-800 rounded-md shadow-sm dark:shadow-md h-full"
            collapsible={true}
          >
            <div className="p-0">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <FaSpinner className="animate-spin text-xl text-blue-600 dark:text-blue-400" />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    Loading PDF...
                  </span>
                </div>
              ) : pdfUrl ? (
                <div className="flex flex-col h-full" style={{ minHeight: '70vh' }}>
                  <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                    Marksheet:
                  </h2>
                  <div className="flex-1 overflow-hidden rounded-md border border-gray-200 dark:border-gray-600">
                    <iframe
                      src={pdfUrl}
                      title="Marksheet PDF"
                      width="100%"
                      height="100%"
                      className="min-h-[70vh]"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">
                  Select all required options to view marksheet
                </div>
              )}
            </div>
          </ReusableDiv>
        </div>
      </div>
    </div>
  );
};

export default Marksheet;
