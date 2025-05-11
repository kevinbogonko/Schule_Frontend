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
              value={yearOptions.find((opt) => opt.value === selectedYear)}
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
              value={formOptions.find((opt) => opt.value === selectedForm)}
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
              value={termOptions.find((opt) => opt.value === selectedTerm)}
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
              value={examOptions.find((opt) => opt.label === selectedExam)}
              onChange={(e) => {
                const selected = examOptions.find(
                  (opt) => opt.value === e.target.value
                );
                setSelectedExam(selected ? selected.label : null);
                resetBelow("exam");
              }}
              disabled={!selectedTerm}
            />
          </div>

          <div className="w-full flex flex-col mb-2">
            <label htmlFor="stream">Stream</label>
            <ReusableSelect
              id="stream"
              placeholder="Select Stream"
              options={streamOptions}
              value={streamOptions.find((opt) => opt.value === selectedStream)}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedStream(value);
                fetchPdf(value);
              }}
              // disabled={!selectedExam}
            />
          </div>
        </div>
      </ReusableDiv>

      <ReusableDiv
        icon={GrDocumentDownload}
        tag="Marksheet"
        className="flex-1 flex flex-col ring-1 h-full overflow-hidden mb-4 bg-blue-100"
        collapsible={true}
      >
        {loading && (
          <div className="flex justify-center items-center h-full">
            <FaSpinner className="animate-spin text-xl text-blue-600" />
            <span className="ml-2">Loading PDF...</span>
          </div>
        )}

        {pdfUrl && !loading && (
          <div
            className="flex flex-col h-full overflow-auto pb-12"
            style={{ height: "90vh" }}
          >
            <h2>Marksheet:</h2>
            <iframe
              src={pdfUrl}
              title="Marksheet PDF"
              width="100%"
              height="100%"
              style={{ border: "1px solid #ddd", borderRadius: "4px" }}
            />
          </div>
        )}
      </ReusableDiv>
    </div>
  );
};

export default Marksheet;
