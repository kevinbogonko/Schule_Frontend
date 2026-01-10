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
import Dropdown from "../../ui/Dropdown";

const TTPDFReport = ({ syst_level }) => {
    let isCBC;
    syst_level === "Secondary (8-4-4)" ? (isCBC = false) : (isCBC = true);
  const { showToast } = useToast();

  const [timetableData, setTimetableData] = useState({
    year: null,
    term: null,
    dayCluster: null,
  });
  const [timetableOptions, setTimetableOptions] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [activeForms, setActiveForms] = useState([]);
  const [streamOptions, setStreamOptions] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [entireSchool, setEntireSchool] = useState(false);
  const [entireForm, setEntireForm] = useState(false);
  const [generateForTeacher, setGenerateForTeacher] = useState(false);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [bannerMode, setBannerMode] = useState(false);

  const setFormOptions =
    formOptions.find((option) => option.label === syst_level)?.options || [];

  const handleInputChange = ({ name, value }) => {
    setTimetableData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "year" || name === "term") {
      setTimetableOptions([]);
      setPdfUrl(null);
    }
  };

  const handleFormChange = (value) => {
    setSelectedForm(value);
    setSelectedStream(null);
    setStreamOptions([]);
    setPdfUrl(null);

    if (value) {
      fetchStreams(value);
    }
  };

  const fetchStreams = async (formId) => {
    try {
      const response = await api.post("/stream/getstreams", {
        year: timetableData.year,
        form: formId,
      });

      const formattedStreams = response.data.map((stream) => ({
        value: stream.id,
        label: stream.stream_name,
        stream_tag: formId + stream.stream_name.charAt(0).toUpperCase(),
      }));

      setStreamOptions(formattedStreams);
    } catch (error) {
      showToast("Error fetching streams", "error", {
        duration: 3000,
        position: "top-right",
      });
    }
  };

  const handleStreamChange = async (value) => {
    setSelectedStream(value);
    setPdfUrl(null);

    if (value && timetableData.dayCluster) {
      await generatePdf();
    }
  };

  const fetchTeachers = async () => {
    if (!timetableData.year) return;

    try {
      const response = await api.post("/teacher/getteachers", {
        year: timetableData.year,
      });

      const formattedTeachers = response.data.map((teacher) => ({
        value: teacher.teacher_tag,
        label: `${teacher.title} ${teacher.fname} ${teacher.lname}`,
      }));

      setTeacherOptions(formattedTeachers);
    } catch (error) {
      showToast("Error fetching teachers", "error", {
        duration: 3000,
        position: "top-right",
      });
    }
  };

  const handleTeacherChange = async (selectedOption) => {
    const value = selectedOption ? selectedOption.target.value : null;
    setSelectedTeacher(value);
    setPdfUrl(null);

    if (value && timetableData.dayCluster) {
      await generateTeacherPdf();
    }
  };

  const generateTeacherPdf = async () => {
    if (
      !timetableData.year ||
      !timetableData.term ||
      !timetableData.dayCluster ||
      !selectedTeacher
    ) {
      return;
    }

    setLoading(true);
    setPdfUrl(null);

    try {
      const selectedTimetable = timetableOptions.find(
        (option) => option.value === timetableData.dayCluster
      );

      if (!selectedTimetable) return;

      const payload = {
        year: timetableData.year,
        term: timetableData.term,
        timetablename: selectedTimetable.label,
        utility: "d",
        dayClusterId: timetableData.dayCluster,
        teacher_tag_id: selectedTeacher,
        forms: [2, 3, 4],
      };

      const response = await api.post("/timetable/teachertt", payload, {
        responseType: "blob",
      });

      const pdfBlob = new Blob([response.data], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      showToast("Teacher timetable loaded successfully", "success", {
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      showToast(
        error?.response?.data.message || "Error fetching teacher timetable PDF",
        "error",
        {
          duration: 3000,
          position: "top-right",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const generatePdf = async () => {
    if (
      !timetableData.year ||
      !timetableData.term ||
      !timetableData.dayCluster
    ) {
      return;
    }

    setLoading(true);
    setPdfUrl(null);

    try {
      const selectedTimetable = timetableOptions.find(
        (option) => option.value === timetableData.dayCluster
      );

      if (!selectedTimetable) return;

      let payload = {
        year: timetableData.year,
        term: timetableData.term,
        timetablename: selectedTimetable.label,
        utility: "d",
        dayClusterId: timetableData.dayCluster,
      };

      if (entireSchool) {
        payload.forms = activeForms;
      } else if (entireForm) {
        payload.forms = [selectedForm];
      } else if (selectedStream) {
        const selectedStreamObj = streamOptions.find(
          (s) => s.value === selectedStream
        );
        payload.forms = [selectedForm];
        payload.stream_tag = selectedStreamObj.id;
      }

      const response = await api.post("/timetable/mastertt", payload, {
        responseType: "blob",
      });

      const pdfBlob = new Blob([response.data], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      showToast("Timetable loaded successfully", "success", {
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      showToast(
        error?.response?.data.message || "Error fetching timetable PDF",
        "error",
        {
          duration: 3000,
          position: "top-right",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchActiveForms = async (setFormOptions) => {
      try {
        const response = setFormOptions.map(formOption => {
          return formOption?.value
        })
        setActiveForms(response);
      } catch (err) {
        console.error("Failed to fetch active forms", err);
        setActiveForms([]);
      }
    };

    fetchActiveForms(setFormOptions);
  }, []);

  useEffect(() => {
    const fetchTimetableOptions = async () => {
      if (timetableData.year && timetableData.term) {
        try {
          const response = await api.post("/timetable/gettimetables", {
            year: parseInt(timetableData.year),
            term: parseInt(timetableData.term),
          });

          const formattedTimetables = response.data.map((timetable) => ({
            value: timetable.dayClusterId,
            label: timetable.timetableName,
          }));

          setTimetableOptions(formattedTimetables);
        } catch (error) {
          showToast("Error fetching timetables", "error", {
            duration: 3000,
            position: "top-right",
          });
        }
      }
    };

    fetchTimetableOptions();
  }, [timetableData.year, timetableData.term]);

  useEffect(() => {
    if (timetableData.dayCluster && selectedStream && !generateForTeacher) {
      generatePdf();
    }
  }, [timetableData.dayCluster, selectedStream]);

  useEffect(() => {
    if (generateForTeacher) {
      fetchTeachers();
    }
  }, [generateForTeacher, timetableData.year]);

  return (
    <div className="p-0">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">
        Print Timetable PDF Report
      </h1>

      <div className="flex flex-col lg:flex-row gap-4">
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg text-center max-w-xs md:max-w-sm">
              <FaSpinner className="animate-spin text-2xl md:text-3xl text-blue-500 mx-auto mb-3 md:mb-4" />
              <p className="text-base md:text-lg font-medium text-gray-700 dark:text-gray-300">
                Loading Timetable...
              </p>
            </div>
          </div>
        )}

        <div className="w-full lg:w-1/4 space-y-4">
          <ReusableDiv tag="Create TimeTable">
            <Dropdown
              label="Year"
              placeholder="Select Year"
              options={yearOptions}
              value={timetableData.year}
              onChange={(value) => handleInputChange({ name: "year", value })}
              name="year"
              className="my-2"
            />

            <Dropdown
              label="Term"
              placeholder="Select Term"
              options={termOptions}
              value={timetableData.term}
              onChange={(value) => handleInputChange({ name: "term", value })}
              name="term"
              className="my-2"
            />

            <Dropdown
              label="Form"
              placeholder={isCBC ? "Grade" : "Form"}
              options={setFormOptions}
              value={setFormOptions}
              onChange={handleFormChange}
              name="form"
              className="my-2"
              disabled={!timetableData.year || !timetableData.term}
            />

            <Dropdown
              label="Stream"
              placeholder="Select Stream"
              options={streamOptions}
              value={selectedStream}
              onChange={handleStreamChange}
              name="stream"
              className="my-2"
              disabled={!selectedForm}
            />

            <Dropdown
              label="Timetable"
              placeholder="Select Timetable"
              options={timetableOptions}
              value={timetableData.dayCluster}
              onChange={(value) =>
                handleInputChange({ name: "dayCluster", value })
              }
              name="timetable"
              className="my-2"
              disabled={!timetableData.year || !timetableData.term}
            />

            <div className="mt-4 space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="entireSchool"
                  checked={entireSchool}
                  onChange={(e) => {
                    setEntireSchool(e.target.checked);
                    if (e.target.checked) setEntireForm(false);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="entireSchool"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Entire School Timetable
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="entireForm"
                  checked={entireForm}
                  onChange={(e) => {
                    setEntireForm(e.target.checked);
                    if (e.target.checked) setEntireSchool(false);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="entireForm"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Entire {isCBC ? "Grade" : "Form"}
                </label>
              </div>
            </div>

            <button
              onClick={generatePdf}
              disabled={
                !timetableData.dayCluster ||
                (!entireSchool && !entireForm && !selectedStream) ||
                generateForTeacher
              }
              className={`mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                !timetableData.dayCluster ||
                (!entireSchool && !entireForm && !selectedStream) ||
                generateForTeacher
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
            >
              Generate
            </button>
          </ReusableDiv>

          {timetableOptions.length > 0 && (
            <ReusableDiv tag="Teacher Timetable">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="generateForTeacher"
                  checked={generateForTeacher}
                  onChange={(e) => {
                    setGenerateForTeacher(e.target.checked);
                    if (!e.target.checked) {
                      setSelectedTeacher(null);
                      setPdfUrl(null);
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="generateForTeacher"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Generate for Teacher
                </label>
              </div>

              {generateForTeacher && (
                <ReusableSelect
                  label="Select Teacher"
                  placeholder="Choose teacher"
                  options={teacherOptions}
                  value={teacherOptions.find(
                    (teacher) => teacher.value === selectedTeacher
                  )}
                  onChange={handleTeacherChange}
                  name="teacher"
                  className="my-2"
                  disabled={!timetableData.year}
                />
              )}
            </ReusableDiv>
          )}
        </div>

        <div className="w-full lg:w-3/4">
          <ReusableDiv
            icon={GrDocumentDownload}
            tag="Timetable"
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
                <div
                  className="flex flex-col h-full"
                  style={{ minHeight: "70vh" }}
                >
                  <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                    Timetable:
                  </h2>
                  {(entireSchool || entireForm) && (
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        id="bannerMode"
                        checked={bannerMode}
                        onChange={(e) => setBannerMode(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="bannerMode"
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Banner Mode
                      </label>
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden rounded-md border border-gray-200 dark:border-gray-600">
                    <iframe
                      src={pdfUrl}
                      title="Timetable PDF"
                      width="100%"
                      height="100%"
                      className="min-h-[70vh]"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">
                  Select year, term and timetable to view
                </div>
              )}
            </div>
          </ReusableDiv>
        </div>
      </div>
    </div>
  );
};

export default TTPDFReport;
