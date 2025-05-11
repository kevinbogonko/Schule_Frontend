import React, { useState, useEffect } from "react";
import TableComponent from "../TableComponent";
import ReusableDiv from "../ReusableDiv";
import ReusableSelect from "../ReusableSelect";
import { FaUsersGear } from "react-icons/fa6";
import api from "../../hooks/api";
import { formOptions, yearOptions, termOptions } from "../../utils/CommonData";

const Marklist2 = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedStream, setSelectedStream] = useState(null);
  const [studentData, setStudentData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [examOptions, setExamOptions] = useState([]);
  const [streamOptions, setStreamOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allStreamsChecked, setAllStreamsChecked] = useState(false);
  const [columns, setColumns] = useState([
    { name: "ID", uid: "id", sortable: true },
    { name: "Name", uid: "name", sortable: true },
  ]);

  const staticColumns = ["id", "name"];

    const resetBelow = (field) => {
    switch (field) {
        case "year":
        setSelectedForm(null);
        setSelectedTerm(null);
        setSelectedExam(null);
        setSelectedStream(null);
        setStudentData([]);
        setDisplayData([]);
        setExamOptions([]);
        setStreamOptions([]);
        setAllStreamsChecked(false);
        break;
        case "form":
        setSelectedTerm(null);
        setSelectedExam(null);
        setSelectedStream(null);
        setStudentData([]);
        setDisplayData([]);
        setExamOptions([]);
        setStreamOptions([]);
        setAllStreamsChecked(false);
        break;
        case "term":
        setSelectedExam(null);
        setSelectedStream(null);
        setStudentData([]);
        setDisplayData([]);
        setExamOptions([]);
        // setStream*Options([]);
        setAllStreamsChecked(false);
        break;
        case "exam":
        setSelectedStream(null);
        setDisplayData([]);
        setAllStreamsChecked(false);
        break;
        case "stream":
        setDisplayData([]);
        setAllStreamsChecked(false);
        break;
        default:
        break;
    }
    };

  const fetchStudentData = async () => {
    if (selectedForm && selectedExam) {
      setLoading(true);
      try {
        const response = await api.post("/exam/marklist", {
          form: selectedForm,
          formula: "self",
          yearValue: selectedYear,
          exams: {
            exam_1: {
              alias: "EXAM",
              name: examOptions.find((exam) => exam.value === selectedExam)
                ?.value,
              outof: 100,
            },
          },
        });

        if (response.data.length > 0) {
          const firstStudent = response.data[0];
          const subjectColumns = Object.keys(firstStudent.subjects).map(
            (subject) => ({
              name: subject,
              uid: subject,
              sortable: true,
            })
          );

          const newColumns = [
            { name: "ID", uid: "id", sortable: true },
            { name: "Name", uid: "name", sortable: true },
            { name: "Stream", uid: "stream", sortable: true },
            ...subjectColumns,
            { name: "Marks", uid: "marks", sortable: true },
            { name: "Points", uid: "points", sortable: true },
            { name: "Grade", uid: "grade", sortable: true },
            { name: "S.Rank", uid: "stream_rank", sortable: true },
            { name: "O.Rank", uid: "overal_rank", sortable: true },
          ];

          setColumns(newColumns);
          setStudentData(response.data);
        } else {
          setStudentData([]);
          setDisplayData([]);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchStreamOptions = async () => {
    if (selectedForm && selectedYear) {
      try {
        const response = await api.post("/stream/getstreams", {
          form: selectedForm,
          year: selectedYear,
        });
        const formattedStreams = response.data.map((stream) => ({
          value: stream.id,
          label: stream.stream_name,
        }));
        setStreamOptions(formattedStreams);
      } catch (error) {
        console.error("Error fetching stream options:", error);
      }
    }
  };

  // Load streams on form/year select
  useEffect(() => {
    fetchStreamOptions();
  }, [selectedForm, selectedYear]);

  // Load student data when form or exam is selected
  useEffect(() => {
    fetchStudentData();
  }, [selectedForm, selectedExam]);

  // Load exam options
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

  // Control displayData based on stream selection or allStreams
  useEffect(() => {
    if (allStreamsChecked) {
      setDisplayData(studentData);
    } else if (selectedStream) {
      const filtered = studentData.filter(
        (stu) => String(stu.stream_id) === selectedStream
      );
      setDisplayData(filtered);
    } else {
      setDisplayData([]);
    }
  }, [selectedStream, allStreamsChecked, studentData]);

  const handleAllStreamsChange = (e) => {
    const checked = e.target.checked;
    setAllStreamsChecked(checked);
    if (checked) {
      setSelectedStream(null); // disable stream-specific filter
    }
  };

return (
  <div className="p-0">
    <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">
      Exam Marklist
    </h1>

    <div className="flex flex-col lg:flex-row gap-2">
      <div className="w-full lg:w-1/4">
        <ReusableDiv
          className="ml-0 mr-0 ring-1 h-fit bg-blue-100 dark:bg-gray-800 mb-2"
          tag="Manage Student Marks"
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
                value={yearOptions.find((opt) => opt.value === selectedYear)}
                onChange={(e) => {
                  resetBelow("year");
                  setSelectedYear(e.target.value);
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
                placeholder="Select Form"
                options={formOptions}
                value={formOptions.find((opt) => opt.value === selectedForm)}
                onChange={(e) => {
                  resetBelow("form");
                  setSelectedForm(e.target.value);
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
                placeholder="Select Term"
                options={termOptions}
                value={termOptions.find((opt) => opt.value === selectedTerm)}
                onChange={(e) => {
                  resetBelow("term");
                  setSelectedTerm(e.target.value);
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
                placeholder="Select Exam"
                options={examOptions}
                value={examOptions.find((opt) => opt.value === selectedExam)}
                onChange={(e) => {
                  resetBelow("exam");
                  setSelectedExam(e.target.value);
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
                value={streamOptions.find(
                  (opt) => opt.value === selectedStream
                )}
                onChange={(e) => {
                  setSelectedStream(e.target.value);
                  setAllStreamsChecked(false);
                }}
                disabled={!selectedExam || allStreamsChecked}
                className="w-full"
              />
            </div>

            <div className="w-full flex items-center">
              <input
                type="checkbox"
                id="allStreams"
                checked={allStreamsChecked}
                onChange={handleAllStreamsChange}
                disabled={!selectedExam}
                className="mr-2"
              />
              <label
                htmlFor="allStreams"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                All Streams
              </label>
            </div>
          </div>
        </ReusableDiv>
      </div>

      <div className="w-full lg:w-3/4">
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm dark:shadow-md p-2 md:p-4">
          <TableComponent
            columns={columns}
            data={displayData.map((student) => ({
              ...student,
              ...student.subjects,
            }))}
            loading={loading}
            showSelectAllCheckbox={false}
            staticColumns={staticColumns}
            staticColumnBg="bg-gray-50"
            horizontalTableFlow={true}
            striped={true}
            borderColor="blue-200 dark:border-gray-600"
            rowColors={{
              default: "hover:bg-blue-50 dark:hover:bg-gray-700",
              selected: "bg-blue-100 dark:bg-gray-700",
            }}
            mobileBreakpoint="sm"
          />
        </div>
      </div>
    </div>
  </div>
);
};

export default Marklist2;
