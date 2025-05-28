import React, { useState, useEffect, useRef } from "react";
import TableComponent from "../TableComponent";
import { FiPlus } from "react-icons/fi";
import { BsEye, BsPencil, BsTrash } from "react-icons/bs";
import ReusableDiv from "../ReusableDiv";
import ReusableSelect from "../ReusableSelect";
import { FaSpinner } from "react-icons/fa";
import { FaUsersGear } from "react-icons/fa6";
import api from "../../hooks/api";
import { useToast } from "../Toast";
import { formOptions, yearOptions } from "../../utils/CommonData";
import AddStudent from "../snippets/AddStudent";

const Student = ({user}) => {
  const { showToast } = useToast();
  const [studentData, setStudentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [rowData, setRowData] = useState("");
  const [streamOptions, setStreamOptions] = useState([]);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const loadingTimeoutRef = useRef(null);

  const [modalState, setModalState] = useState({
    addStudent: false,
    viewStudent: false,
    editStudent: false,
  });

  const columns = [
    { name: "REG NO.", uid: "id", sortable: true },
    { name: "NAME", uid: "name", sortable: true },
    { name: "STREAM", uid: "stream", sortable: true },
    {
      name: "D.O.B",
      uid: "dob",
      sortable: true,
      format: (value) => new Date(value).toLocaleDateString(),
    },
    { name: "ACTIONS", uid: "actions" },
  ];

  const excludedColumns = [];

  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setSelectedForm("");
    setStreamOptions([]);
  }, [selectedYear]);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedForm && selectedYear) {
        // Show overlay after 50ms to prevent flash on quick loads
        loadingTimeoutRef.current = setTimeout(() => {
          setShowLoadingOverlay(true);
        }, 50);

        setLoading(true);
        try {
          const streamRes = await api.post("/stream/getstreams", {
            year: selectedYear,
            form: selectedForm,
          });
          const formattedStreams = streamRes.data.map((item) => ({
            value: item.id,
            label: item.stream_name,
          }));
          setStreamOptions(formattedStreams);

          const payload = { year: selectedYear, form: selectedForm };
          const studentRes = await api.post("/student/getstudents", payload);
          const transformedData = studentRes.data.map((student) => ({
            ...student,
            name: `${student.fname} ${student.lname}`,
            status: "Active",
            stream:
              formattedStreams.find((opt) => opt.value === student.stream_id)
                ?.label || "N/A",
          }));
          setStudentData(transformedData);
        } catch (err) {
          setError(err.message || "Something went wrong");
          console.error("Error fetching data:", err);
        } finally {
          // Minimum 300ms display time for smooth UX
          loadingTimeoutRef.current = setTimeout(() => {
            setLoading(false);
            setShowLoadingOverlay(false);
          }, 500);
        }
      }
    };

    fetchData();

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [
    selectedForm,
    modalState.addStudent,
    modalState.editStudent,
    modalState.viewStudent,
  ]);

  const handleDelete = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;

    setShowLoadingOverlay(true);
    setLoading(true);

    try {
      const response = await api.post(`/student/deletestudent/${studentId}`, {
        form: selectedForm,
      });

      if ([200, 201, 204].includes(response.status)) {
        showToast("Student Deleted Successfully", "success", {
          duration: 3000,
          position: "top-center",
        });
        const payload = { form: selectedForm };
        const updatedResponse = await api.post("/student/getstudents", payload);
        const transformedData = updatedResponse.data.map((student) => ({
          ...student,
          name: `${student.fname} ${student.lname}`,
          status: "Active",
          stream:
            streamOptions.find((opt) => opt.value === student.stream_id)
              ?.label || "N/A",
        }));
        setStudentData(transformedData);
      }
    } catch (error) {
      console.error("Failed to delete student:", error);
      showToast("Error deleting student", "error");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setShowLoadingOverlay(false);
      }, 300);
    }
  };

  return (
    <div className="p-0">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">
        Student Management
      </h1>

      <div className="flex flex-col lg:flex-row gap-2">
        {/* Loading Overlay */}
        {(showLoadingOverlay || loading) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg text-center max-w-xs md:max-w-sm">
              <FaSpinner className="animate-spin text-2xl md:text-3xl text-blue-500 mx-auto mb-3 md:mb-4" />
              <p className="text-base md:text-lg font-medium text-gray-700 dark:text-gray-300">
                Loading Students...
              </p>
            </div>
          </div>
        )}

        {/* Form Controls */}
        <div className="w-full lg:w-1/4">
          <ReusableDiv
            className="ml-0 mr-0 mb-2 ring-1 h-fit bg-blue-100 dark:bg-gray-800"
            tag="Manage Students"
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
                  onChange={(e) => setSelectedYear(e.target.value)}
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
                  onChange={(e) => setSelectedForm(e.target.value)}
                  disabled={!selectedYear}
                  className="w-full"
                />
              </div>
            </div>
          </ReusableDiv>
        </div>

        {/* Table Content */}
        <div className="w-full lg:w-3/4">
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm dark:shadow-md p-2 md:p-4">
            <TableComponent
              columns={columns}
              data={studentData}
              loading={loading}
              horizontalTableFlow={true}
              excludedColumns={excludedColumns}
              showSelectAllCheckbox={false}
              striped={true}
              buttons={{
                addButton: {
                  show: user === "admin",
                  label: "Add Student",
                  icon: <FiPlus className="w-4 h-4" />,
                  onClick: () =>
                    setModalState((prev) => ({ ...prev, addStudent: true })),
                },
                actionButtons: {
                  show: true,
                  options:
                    user === "admin"
                      ? [
                          {
                            label: "View",
                            icon: <BsEye className="w-4 h-4" />,
                            onClick: (row) => {
                              setRowData(row);
                              setModalState((prev) => ({
                                ...prev,
                                viewStudent: true,
                              }));
                            },
                          },
                          {
                            label: "Edit",
                            icon: <BsPencil className="w-4 h-4" />,
                            onClick: (row) => {
                              console.log(row);
                              setRowData(row);
                              setModalState((prev) => ({
                                ...prev,
                                editStudent: true,
                              }));
                            },
                          },
                          {
                            label: "Delete",
                            icon: <BsTrash className="w-4 h-4" />,
                            onClick: (row) => handleDelete(row),
                          },
                        ]
                      : [
                          {
                            label: "View",
                            icon: <BsEye className="w-4 h-4" />,
                            onClick: (row) => {
                              setRowData(row);
                              setModalState((prev) => ({
                                ...prev,
                                viewStudent: true,
                              }));
                            },
                          }
                        ],
                },
              }}
              borderColor="blue-200 dark:border-gray-600"
              rowColors={{
                default: "hover:bg-blue-50 dark:hover:bg-gray-700",
                selected: "bg-blue-100 dark:bg-gray-700",
              }}
              defaultVisibleColumns={["name", "stream", "status", "actions"]}
              mobileBreakpoint="sm"
            />
          </div>
        </div>
      </div>

      <AddStudent
        modalState={modalState}
        setModalState={setModalState}
        selectedForm={selectedForm}
        selectedYear={selectedYear}
        streamOptions={streamOptions}
        rowData={rowData}
        loading={loading}
        refreshTable={() => {
          const payload = { year: selectedYear, form: selectedForm };
          api.post("/student/getstudents", payload).then((response) => {
            const transformedData = response.data.map((student) => ({
              ...student,
              name: `${student.fname} ${student.lname}`,
              status: "Active",
              stream:
                streamOptions.find((opt) => opt.value === student.stream_id)
                  ?.label || "N/A",
            }));
            setStudentData(transformedData);
          });
        }}
        onDelete={() => {
          const payload = { form: selectedForm };
          api.post("/student/getstudents", payload).then((response) => {
            const transformedData = response.data.map((student) => ({
              ...student,
              name: `${student.fname} ${student.lname}`,
              status: "Active",
              stream:
                streamOptions.find((opt) => opt.value === student.stream_id)
                  ?.label || "N/A",
            }));
            setStudentData(transformedData);
          });
        }}
      />
    </div>
  );
};

export default Student;
