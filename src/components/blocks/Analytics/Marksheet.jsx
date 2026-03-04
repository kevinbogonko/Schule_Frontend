import React, { useState, useEffect } from "react";
import ReusableDiv from "../../ui/ReusableDiv";
import ReusableSelect from "../../ui/ReusableSelect";
import { FaUsersGear, FaSpinner } from "react-icons/fa6";
import { GrDocumentDownload } from "react-icons/gr";
import api from "../../../hooks/api";
import { useToast } from "../../ui/Toast";
import {
  formOptions,
  yearOptions,
  termOptions,
} from "../../../utils/CommonData";

const Marksheet = ({ syst_level }) => {
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

  // Clean up blob URL when component unmounts or when pdfUrl changes
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const fetchStreamOptions = async () => {
    if (selectedForm && selectedYear) {
      try {
        const response = await api.post("/stream/getstreams", {
          year: selectedYear,
          form: selectedForm,
        });

        const formattedStreams = response.data.map((stream) => ({
          value: stream.stream_id,
          label: stream.stream_name,
        }));

        setStreamOptions(formattedStreams);
      } catch (error) {
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
          key: exam.id,
        }));

        setExamOptions(formatted);
      } catch (error) {
        showToast("Error fetching exams", "error", {
          duration: 3000,
          position: "top-right",
        });
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
          { responseType: "blob" },
        );

        const pdfBlob = new Blob([response.data], { type: "application/pdf" });
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
        showToast("PDF loaded successfully", "success", {
          duration: 3000,
          position: "top-right",
        });
      } catch (error) {
        console.log(error);
        showToast(
          error?.response?.data.message || "Error fetching PDF",
          "error",
          {
            duration: 3000,
            position: "top-right",
          },
        );
      } finally {
        setLoading(false);
      }
    }
  };

  // Get stream name for filename
  const getStreamName = () => {
    const stream = streamOptions.find((s) => s.value === selectedStream);
    return stream ? stream.label : "stream";
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
                  Level
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
                    selectedForm ? "Select Term" : "Please select level first"
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
                      (option) => option.label === selectedExam,
                    ) || undefined
                  }
                  onChange={(e) => {
                    const selected = examOptions.find(
                      (opt) => opt.value === e.target.value,
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
                      (option) => option.value === selectedStream,
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
            <div className="p-2 md:p-4">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <FaSpinner className="animate-spin text-xl text-blue-600 dark:text-blue-400" />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    Loading PDF...
                  </span>
                </div>
              ) : pdfUrl ? (
                <div
                  className="flex flex-col h-full"
                  style={{ minHeight: "70vh" }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                      Marksheet: {selectedForm} - {getStreamName()}
                    </h2>

                    {/* Download button for all devices */}
                    <a
                      href={pdfUrl}
                      download={`marksheet_${selectedForm}_${getStreamName()}_${selectedTerm}_${selectedExam}_${selectedYear}.pdf`}
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
                        title="Marksheet PDF"
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
                            download={`marksheet_${selectedForm}_${getStreamName()}_${selectedTerm}_${selectedExam}_${selectedYear}.pdf`}
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
