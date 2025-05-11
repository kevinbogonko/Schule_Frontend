import React, { useState, useEffect } from "react";
import ReusableDiv from "../ReusableDiv";
import TableComponent from "../TableComponent";
import ReusableSelect from "../ReusableSelect";
import { FaUsersGear, FaSpinner } from "react-icons/fa6";
import { BsPencil } from "react-icons/bs";
import { formOptions, yearOptions } from "../../utils/CommonData";
import { useToast } from "../Toast";
import api from "../../hooks/api";
import ClassTeacherRU from "../snippets/ClassTeacherRU";

const ClassTeacher = () => {
  const { showToast } = useToast();

  const [subTeacherData, setSubTeacherData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [rowData, setRowData] = useState("");
  const [teacherId, setTeacherId] = useState(null);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [modalDataLoaded, setModalDataLoaded] = useState(false);

  const [modalState, setModalState] = useState({
    editClassTeacher: false,
  });

  const columns = [
    { name: "STREAM", uid: "stream_name", sortable: true },
    { name: "CLASS TEACHER", uid: "teacher_name", sortable: true },
    { name: "ACTIONS", uid: "actions" },
  ];

  const resetBelow = (field) => {
    if (field === "year" || field === "form") {
      setSubTeacherData([]);
      setTeachers([]);
    }
  };

  const fetchClassTeachers = async (form, year) => {
    try {
      setLoading(true);

      const [classRes, teacherRes] = await Promise.all([
        api.post("/teacher/getclassteachers", { form, year }),
        api.post("/teacher/getteachers", { year }),
      ]);

      const teacherMap = {};
      teacherRes.data.forEach((t) => {
        teacherMap[t.id] = `${t.title} ${t.fname} ${t.lname}`;
      });

      const formattedData = classRes.data.map((c) => ({
        ...c,
        teacher_name: teacherMap[c.teacher_id] || "N/A",
      }));

      setSubTeacherData(formattedData);

      const formattedTeachers = teacherRes.data.map((t) => ({
        value: t.id,
        label: `${t.title} ${t.fname} ${t.lname}`,
      }));
      setTeachers(formattedTeachers);
    } catch (err) {
      if (err.response?.data?.status === 404) {
        showToast("No streams available. Please Add Stream.", "error", {
          duration: 3000,
          position: "top-center",
        });
      } else if (err.response?.data?.status !== 404) {
        showToast("Failed to fetch class teachers", "error", {
          duration: 3000,
          position: "top-center",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = async (row) => {
    try {
      setShowLoadingOverlay(true);
      setModalDataLoaded(false);

      const res = await api.post("/teacher/getclassteacher", {
        form: selectedForm,
        id: row,
      });
      setTeacherId(res.data.teacher_id);
      setRowData(row);
      setModalDataLoaded(true);

      // Delay modal opening until data is loaded and overlay has shown
      setTimeout(() => {
        setModalState((prev) => ({ ...prev, editClassTeacher: true }));
        setShowLoadingOverlay(false);
      }, 300);
    } catch (err) {
      showToast("Failed to load teacher data", "error", {
        duration: 3000,
        position: "top-center",
      });
      setShowLoadingOverlay(false);
    }
  };

  useEffect(() => {
    if (!modalState.editClassTeacher) {
      setModalDataLoaded(false);
    }
  }, [modalState.editClassTeacher]);

  return (
    <div className="p-4">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">
        Class Teachers
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
            tag="Class Teachers"
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
                      await fetchClassTeachers(form, selectedYear);
                    }
                  }}
                  disabled={!selectedYear}
                  className="w-full"
                />
              </div>
            </div>
          </ReusableDiv>
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

      {modalDataLoaded && (
        <ClassTeacherRU
          modalState={modalState}
          setModalState={setModalState}
          selectedForm={selectedForm}
          rowData={rowData}
          teacherOptions={teachers}
          selectedTeacherId={teacherId}
          refreshTable={() => fetchClassTeachers(selectedForm, selectedYear)}
        />
      )}
    </div>
  );
};

export default ClassTeacher;
