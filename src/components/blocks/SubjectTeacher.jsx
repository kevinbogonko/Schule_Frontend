import React, { useState } from "react";
import ReusableDiv from "../ReusableDiv";
import TableComponent from "../TableComponent";
import ReusableSelect from "../ReusableSelect";
import Dropdown from "../Dropdown";
import { FaUsersGear, FaSpinner } from "react-icons/fa6";
import { BsPencil } from "react-icons/bs";
import { MdDone } from "react-icons/md";
import { formOptions, yearOptions } from "../../utils/CommonData";
import { useToast } from "../Toast";
import api from "../../hooks/api";
import Button from "../ui/raw/Button";
import SubjectTeacherRU from "../snippets/SubjectTeacherRU";

const SubjectTeacher = () => {
  const { showToast } = useToast();

  const [subTeacherData, setSubTeacherData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [selectedStream, setSelectedStream] = useState("");
  const [streams, setStreams] = useState([]);
  const [unassignedSubjects, setUnassignedSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [rowData, setRowData] = useState("");
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  const [modalState, setModalState] = useState({
    editSubjectTeacher: false,
  });

  const columns = [
    { name: "CODE", uid: "code", sortable: true },
    { name: "SUBJECT", uid: "name", sortable: true },
    { name: "INSTRUCTOR", uid: "instructor", sortable: true },
    { name: "ACTIONS", uid: "actions" },
  ];

  const excludedColumns = [];

  const resetBelow = (field) => {
    switch (field) {
      case "year":
        setSelectedForm("");
        setStreams([]);
        setSelectedStream("");
        setSubTeacherData([]);
        setUnassignedSubjects([]);
        setTeachers([]);
        break;
      case "form":
        setStreams([]);
        setSelectedStream("");
        setSubTeacherData([]);
        setUnassignedSubjects([]);
        setTeachers([]);
        break;
      default:
        break;
    }
  };

  const fetchStreams = async (form, year) => {
    try {
      setLoading(true);
      const response = await api.post("/stream/getstreams", { form, year });
      const formattedStreams = response.data.map((s) => ({
        value: s.id,
        label: s.stream_name,
      }));
      setStreams(formattedStreams);
    } catch (err) {
      if (err.response?.data?.status === 404) {
        showToast("No streams available. Please Add Stream.", "error", {
          duration: 3000,
        });
      } else if (err.response?.data?.status !== 404) {
        showToast("Failed to fetch streams", "error", { duration: 3000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectTeachers = async (stream) => {
    try {
      setLoading(true);
      const res = await api.post("/teacher/getsubjectteachers", {
        form: selectedForm,
        year: selectedYear,
        stream_id: stream,
      });

      setSubTeacherData(res.data.assignedSubjects || []);
      setUnassignedSubjects(res.data.unassignedSubjects || []);

      if ((res.data.unassignedSubjects || []).length > 0) {
        const teacherRes = await api.post("/teacher/getteachers", {
          year: selectedYear,
        });
        const formattedTeachers = teacherRes.data.map((t) => ({
          value: t.id,
          label: `${t.title} ${t.fname} ${t.lname}`,
        }));
        setTeachers(formattedTeachers);
      } else {
        setTeachers([]);
      }
    } catch (error) {
      showToast("Error fetching subject teachers", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStreamChange = async (e) => {
    const stream = e.target.value;
    setSelectedStream(stream);
    await fetchSubjectTeachers(stream);
  };

  const handleAssign = async () => {
    if (!selectedSubject || !selectedTeacher) {
      showToast("Select both subject and teacher", "error", { duration: 3000 });
      return;
    }

    try {
      setAssignLoading(true);
      await api.post("/teacher/addsubjectteacher", {
        form: selectedForm,
        stream_id: selectedStream,
        teacher_id: selectedTeacher,
        subject_id: selectedSubject.value,
        year: selectedYear,
      });

      showToast("Teacher assigned successfully", "success", { duration: 3000 });
      await fetchSubjectTeachers(selectedStream);
      setSelectedSubject(null);
      setSelectedTeacher(null);
    } catch (err) {
      showToast("Assignment failed", "error", { duration: 3000 });
    } finally {
      setAssignLoading(false);
    }
  };

  const handleEditClick = async (row) => {
    try {
      setShowLoadingOverlay(true);
      setRowData(row);

      // Simulate loading delay
      setTimeout(() => {
        setModalState((prev) => ({ ...prev, editSubjectTeacher: true }));
        setShowLoadingOverlay(false);
      }, 300);
    } catch (err) {
      showToast("Failed to load teacher data", "error");
      setShowLoadingOverlay(false);
    }
  };

return (
  <div className="p-4">
    <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">
      Subject Teachers
    </h1>

    <div className="flex flex-col lg:flex-row gap-4">
      {(showLoadingOverlay || loading) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg text-center max-w-xs md:max-w-sm">
            <FaSpinner className="animate-spin text-2xl md:text-3xl text-blue-500 mx-auto mb-3 md:mb-4" />
            <p className="text-base md:text-lg font-medium text-gray-700 dark:text-gray-300">
              Loading ...
            </p>
          </div>
        </div>
      )}

      <div className="w-full lg:w-1/4">
        <ReusableDiv
          className="ring-1 h-fit bg-blue-100 dark:bg-gray-800 mb-4"
          tag="Subject Teachers"
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
                value={selectedYear}
                onChange={(e) => {
                  const year = e.target.value;
                  setSelectedYear(year);
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
                placeholder="Select Form"
                options={formOptions}
                value={selectedForm}
                onChange={async (e) => {
                  const form = e.target.value;
                  setSelectedForm(form);
                  resetBelow("form");
                  if (form && selectedYear) {
                    await fetchStreams(form, selectedYear);
                  }
                }}
                disabled={!selectedYear}
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
                options={streams}
                value={selectedStream}
                onChange={handleStreamChange}
                disabled={
                  !selectedYear || !selectedForm || streams.length === 0
                }
                className="w-full"
              />
            </div>
          </div>
        </ReusableDiv>

        {unassignedSubjects.length > 0 && (
          <ReusableDiv
            className="ring-1 h-fit bg-blue-100 dark:bg-gray-800"
            tag="Assign Instructor"
            icon={FaUsersGear}
            collapsible={true}
          >
            <div className="flex flex-col space-y-3 pb-4">
              <div className="w-full">
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Subject
                </label>
                <ReusableSelect
                  id="subject"
                  placeholder="Select Subject"
                  options={unassignedSubjects}
                  value={selectedSubject?.value || ""}
                  onChange={(e) => {
                    const sub = unassignedSubjects.find(
                      (s) => s.value === parseInt(e.target.value)
                    );
                    setSelectedSubject(sub || null);
                  }}
                  className="w-full"
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Teacher
                </label>
                <Dropdown
                  options={teachers}
                  value={selectedTeacher}
                  onChange={setSelectedTeacher}
                  placeholder={"Select Teacher"}
                  menuPlacement="auto"
                  searchable
                  clearable
                  className="z-50 w-full"
                />
              </div>

              <div className="w-full">
                <Button
                  variant="primary"
                  icon={MdDone}
                  className="w-fit"
                  onClick={handleAssign}
                  loading={assignLoading}
                >
                  Assign
                </Button>
              </div>
            </div>
          </ReusableDiv>
        )}
      </div>

      <div className="w-full lg:w-3/4">
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm dark:shadow-md p-2 md:p-4">
          <TableComponent
            columns={columns}
            data={subTeacherData}
            loading={loading}
            horizontalTableFlow={true}
            showSelectAllCheckbox={false}
            striped={true}
            buttons={{
              actionButtons: {
                show: true,
                options: [
                  {
                    label: "Edit",
                    icon: <BsPencil className="w-4 h-4" />,
                    onClick: handleEditClick,
                  },
                ],
              },
            }}
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

export default SubjectTeacher;
