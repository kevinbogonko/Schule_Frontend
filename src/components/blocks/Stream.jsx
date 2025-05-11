import React, { useState, useEffect } from "react";
import ReusableDiv from "../ReusableDiv";
import TableComponent from "../TableComponent";
import ReusableSelect from "../ReusableSelect";
import { FaUsersGear, FaSpinner } from "react-icons/fa6";
import { BsPencil, BsEye, BsTrash } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";
import { formOptions, yearOptions } from "../../utils/CommonData";
import { useToast } from "../Toast";
import api from "../../hooks/api";
import StreamCRUD from "../snippets/StreamCRUD";

const Stream = () => {
  const { showToast } = useToast();

  const [subTeacherData, setSubTeacherData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [rowData, setRowData] = useState(null);
  const [modalState, setModalState] = useState({
    addStream: false,
    editStream: false,
    viewStream: false,
  });
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  const columns = [
    { name: "STREAM", uid: "stream_name", sortable: true },
    { name: "STREAM TEACHER", uid: "teacher_name", sortable: true },
    { name: "ACTIONS", uid: "actions" },
  ];

  const resetBelow = (field) => {
    if (field === "year" || field === "form") {
      setSubTeacherData([]);
      setTeachers([]);
    }
  };

  const fetchStreamsAndTeachers = async (form, year) => {
    try {
      setLoading(true);

      const teacherRes = await api.post("/teacher/getteachers", { year });
      const formattedTeachers = teacherRes.data.map((t) => ({
        value: t.id,
        label: `${t.title} ${t.fname} ${t.lname}`,
      }));
      setTeachers(formattedTeachers);

      try {
        const classRes = await api.post("/teacher/getclassteachers", {
          form,
          year,
        });
        const teacherMap = {};
        teacherRes.data.forEach((t) => {
          teacherMap[t.id] = `${t.title} ${t.fname} ${t.lname}`;
        });

        const formattedData = classRes.data.map((c) => ({
          ...c,
          teacher_name: teacherMap[c.teacher_id] || "N/A",
        }));

        setSubTeacherData(formattedData);
      } catch (error) {
        setSubTeacherData([]);
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to fetch teachers",
        "error",
        { duration: 3000, position: "top-center" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rowData) => {
    if (!window.confirm("Are you sure you want to delete this stream?")) return;
    setLoading(true);
    try {
      const response = await api.post(`/stream/deletestream/${rowData}`, {
        form: selectedForm,
      });
      if ([200, 201, 204].includes(response.status)) {
        showToast("Stream deleted successfully", "success", {
          duration: 3000,
          position: "top-center",
        });
        fetchStreamsAndTeachers(selectedForm, selectedYear);
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to delete stream",
        "error",
        { duration: 3000, position: "top-center" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = async (e) => {
    const form = e.target.value;
    setSelectedForm(form);
    resetBelow("form");
    if (form && selectedYear) {
      await fetchStreamsAndTeachers(form, selectedYear);
    }
  };

  const handleYearChange = async (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    resetBelow("year");
  };

  const openModalWithData = (modalType, row = null) => {
    setShowLoadingOverlay(true);
    setRowData(row);
    setTimeout(() => {
      setModalState((prev) => ({ ...prev, [modalType]: true }));
      setShowLoadingOverlay(false);
    }, 300);
  };

  useEffect(() => {
    if (selectedForm && selectedYear) {
      fetchStreamsAndTeachers(selectedForm, selectedYear);
    }
  }, [selectedForm, modalState.addStream]);

  return (
    <div className="p-2 md:p-4">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-500">
          Manage Streams
        </h1>
      </div>

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
            tag="Manage Streams"
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
                  onChange={handleYearChange}
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
                  onChange={handleFormChange}
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
              horizontalTableFlow
              showSelectAllCheckbox={false}
              striped
              responsive
              buttons={{
                addButton: {
                  show: true,
                  label: "Add Stream",
                  icon: <FiPlus className="w-4 h-4" />,
                  onClick: () => {
                    if (!selectedYear || !selectedForm) {
                      showToast("Please select year and form first", "error");
                      return;
                    }
                    openModalWithData("addStream");
                  },
                },
                actionButtons: {
                  show: true,
                  options: [
                    {
                      label: "View",
                      icon: <BsEye className="w-4 h-4" />,
                      onClick: (row) => openModalWithData("viewStream", row),
                    },
                    {
                      label: "Edit",
                      icon: <BsPencil className="w-4 h-4" />,
                      onClick: (row) => openModalWithData("editStream", row),
                    },
                    {
                      label: "Delete",
                      icon: <BsTrash className="w-4 h-4" />,
                      onClick: (row) => {
                        setRowData(row);
                        handleDelete(row);
                      },
                    },
                  ],
                },
              }}
              borderColor="blue-200"
              rowColors={{
                default: "hover:bg-blue-50 dark:hover:bg-blue-900",
                selected: "bg-blue-100 dark:bg-blue-800",
              }}
              mobileBreakpoint="sm"
            />
          </div>
        </div>
      </div>

      <StreamCRUD
        modalState={modalState}
        setModalState={setModalState}
        selectedForm={selectedForm}
        selectedYear={selectedYear}
        rowData={rowData}
        teacherOptions={teachers}
        refreshTable={() => fetchStreamsAndTeachers(selectedForm, selectedYear)}
      />
    </div>
  );
};

export default Stream;
