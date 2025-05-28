import React, { useState, useEffect } from "react";
import ModalForm from "../ui/raw/ModalForm";
import ReusableInput from "../ui/ReusableInput";
import { FiUserPlus, FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import ReusableSelect from "../ReusableSelect";
import ReusableTextarea from "../ReusableTextarea";
import api from "../../hooks/api";
import { FaSpinner } from "react-icons/fa";
import { useToast } from "../Toast";
import Button from "../ui/raw/Button";
import { sexOptions, formOptions, yearOptions } from "../../utils/CommonData";

const AddStudent = ({
  modalState,
  setModalState,
  selectedForm,
  selectedYear,
  streamOptions,
  rowData,
  refreshTable,
  onDelete,
}) => {
  const { showToast } = useToast();
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [modalReady, setModalReady] = useState(false);

  const initialFormData = {
    id: "",
    fname: "",
    mname: "",
    lname: "",
    sex: "",
    dob: "",
    stream_id: "",
    kcpe_marks: "",
    year: "",
    phone: "",
    upi_number: "",
    address: "",
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reset modal ready state when modal closes
  useEffect(() => {
    if (!modalState.viewStudent && !modalState.editStudent) {
      setModalReady(false);
    }
  }, [modalState.viewStudent, modalState.editStudent]);

  // Fetch student data when view modal opens
  useEffect(() => {
    if (modalState.viewStudent && rowData && !modalReady) {
      setShowLoadingOverlay(true);
      fetchStudentData();
    }
  }, [modalState.viewStudent, rowData]);

  // Set edit form data when edit modal opens
  useEffect(() => {
    if (modalState.editStudent && rowData && !modalReady) {
      setShowLoadingOverlay(true);
      if (studentData) {
        const dob = studentData.dob
          ? new Date(studentData.dob).toISOString().split("T")[0]
          : "";
        setEditFormData({
          ...studentData,
          form: selectedForm,
          dob: dob,
        });
        setTimeout(() => {
          setModalReady(true);
          setShowLoadingOverlay(false);
        }, 300);
      } else {
        fetchStudentData();
      }
    }
  }, [modalState.editStudent, rowData, studentData]);

  const fetchStudentData = async () => {
    setIsLoading(true);
    try {
      const response = await api.post("/student/getstudent", {
        year: selectedYear,
        form: selectedForm,
        student_id: rowData,
      });
      const formattedStudentData = response.data;
      setStudentData({
        ...formattedStudentData,
        year: formattedStudentData.year_of_enrolment,
      });

      // If we're in edit mode, also set the edit form data
      if (modalState.editStudent) {
        const dob = formattedStudentData.dob
          ? new Date(formattedStudentData.dob).toISOString().split("T")[0]
          : "";
        setEditFormData({
          ...formattedStudentData,
          form: selectedForm,
          dob: dob,
          year: formattedStudentData.year_of_enrolment,
        });
      }

      setTimeout(() => {
        setModalReady(true);
        setShowLoadingOverlay(false);
      }, 300);
    } catch (error) {
      showToast("Failed to fetch student data", "error", {
        duration: 3000,
        position: "top-center",
      });
      setShowLoadingOverlay(false);
      setModalState((prev) => ({
        ...prev,
        viewStudent: false,
        editStudent: false,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formValues) => {
    if (
      !formValues.id ||
      !formValues.fname ||
      !formValues.lname ||
      !formValues.sex ||
      !formValues.dob ||
      !formValues.stream_id
    ) {
      setError("Please fill in all required fields!");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        ...formValues,
        phone: formValues.phone.startsWith("+")
          ? formValues.phone.slice(1)
          : formValues.phone,
      };
      const response = await api.post("/student/addstudent", payload);

      if (response.status === 200 || response.status === 201) {
        setModalState((prev) => ({ ...prev, addStudent: false }));
        showToast("Student Added Successfully", "success", {
          duration: 3000,
          position: "top-center",
        });
        refreshTable();
      }
    } catch (error) {
      showToast("Failed to add student", "error", {
        duration: 3000,
        position: "top-center",
      });
      setError(
        error.response?.data?.message ||
          "Failed to add student. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (formValues) => {
    if (
      !formValues.id ||
      !formValues.fname ||
      !formValues.lname ||
      !formValues.sex ||
      !formValues.dob ||
      !formValues.stream_id
    ) {
      setError("Please fill in all required fields!");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await api.put(
        `/student/updatestudent/${rowData}`,
        formValues
      );

      if (response.status === 200 || response.status === 201) {
        setModalState((prev) => ({ ...prev, editStudent: false }));
        showToast("Student Updated Successfully", "success", {
          duration: 3000,
          position: "top-center",
        });
        refreshTable();
      }
    } catch (error) {
      showToast("Failed to update student", "error", {
        duration: 3000,
        position: "top-center",
      });
      setError(
        error.response?.data?.message ||
          "Failed to update student. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;

    setIsLoading(true);
    try {
      const response = await api.delete(`/student/deletestudent/${rowData}`, {
        data: {
          form: selectedForm,
        },
      });

      if (response.status === 200 || response.status === 201) {
        showToast("Student Deleted Successfully", "success", {
          duration: 3000,
          position: "top-center",
        });
        setModalState((prev) => ({ ...prev, viewStudent: false }));
        onDelete();
      }
    } catch (error) {
      showToast("Failed to delete student", "error", {
        duration: 3000,
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKcpeMarksChange = (e, handleChange) => {
    let value = e.target.value;
    if (value === "") {
      handleChange(e);
      return;
    }
    const marks = parseInt(value);
    if (!isNaN(marks) && marks >= 0 && marks <= 500 && value.length <= 3) {
      e.target.value = marks;
      handleChange(e);
    }
  };

  return (
    <>
      {(showLoadingOverlay || isLoading) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm">
            <FaSpinner className="animate-spin text-3xl text-blue-500 dark:text-blue-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Loading Students...
            </p>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      <ModalForm
        isOpen={modalState.addStudent}
        onClose={() => {
          setError("");
          setModalState((prev) => ({ ...prev, addStudent: false }));
        }}
        title="Add Student"
        icon={FiUserPlus}
        initialValues={initialFormData}
        onSubmit={handleSubmit}
        closeOnOutsideClick={false}
        size="lg"
        submitText={
          isSubmitting ? <FaSpinner className="animate-spin" /> : "Submit"
        }
        submitDisabled={isSubmitting}
      >
        {({ values, handleChange }) => (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
                {error}
              </div>
            )}

            <div>
              <div className="mb-2">
                <label
                  htmlFor="id"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Registration Number *
                </label>
                <ReusableInput
                  name="id"
                  id="id"
                  className="w-full mt-1"
                  value={values.id}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid items-center grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-2">
                  <label
                    htmlFor="fname"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    First Name *
                  </label>
                  <ReusableInput
                    name="fname"
                    id="fname"
                    className="w-full mt-1"
                    value={values.fname}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="mname"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Middle Name
                  </label>
                  <ReusableInput
                    name="mname"
                    id="mname"
                    className="w-full mt-1"
                    value={values.mname}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="lname"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Last Name *
                  </label>
                  <ReusableInput
                    name="lname"
                    id="lname"
                    className="w-full mt-1"
                    value={values.lname}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="upi_number"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    UPI Number
                  </label>
                  <ReusableInput
                    name="upi_number"
                    id="upi_number"
                    className="w-full mt-1"
                    value={values.upi_number}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="sex"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Sex *
                  </label>
                  <ReusableSelect
                    name="sex"
                    id="sex"
                    options={sexOptions}
                    placeholder="Select Sex"
                    className="w-full"
                    value={values.sex}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleChange(e);
                      }
                    }}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="dob"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Date of Birth *
                  </label>
                  <ReusableInput
                    name="dob"
                    id="dob"
                    type="date"
                    className="w-full mt-1"
                    value={values.dob}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="form"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Form *
                  </label>
                  <ReusableSelect
                    name="form"
                    id="form"
                    options={formOptions}
                    placeholder="Select Form"
                    className="w-full"
                    value={values.form || selectedForm}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleChange(e);
                      }
                    }}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="stream_id"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Stream *
                  </label>
                  <ReusableSelect
                    name="stream_id"
                    id="stream_id"
                    options={streamOptions}
                    placeholder="Select Stream"
                    className="w-full"
                    value={values.stream_id}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleChange(e);
                      }
                    }}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="kcpe_marks"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    KCPE Marks
                  </label>
                  <ReusableInput
                    name="kcpe_marks"
                    id="kcpe_marks"
                    type="number"
                    className="w-full mt-1"
                    value={values.kcpe_marks}
                    onChange={(e) => handleKcpeMarksChange(e, handleChange)}
                    max="500"
                    min="0"
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="year"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Year
                  </label>
                  <ReusableSelect
                    name="year"
                    id="year"
                    options={yearOptions}
                    placeholder="Select Year"
                    className="w-full"
                    value={values.year || selectedYear}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleChange(e);
                      }
                    }}
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Phone
                  </label>
                  <ReusableInput
                    name="phone"
                    id="phone"
                    type="tel"
                    className="w-full mt-1"
                    value={values.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mb-2 md:col-span-2">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Address
                </label>
                <ReusableTextarea
                  name="address"
                  id="address"
                  className="w-full mt-1"
                  value={values.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          </>
        )}
      </ModalForm>

      {/* View Student Modal */}
      <ModalForm
        isOpen={modalState.viewStudent && modalReady}
        onClose={() => {
          setModalState((prev) => ({ ...prev, viewStudent: false }));
          setModalReady(false);
        }}
        title="Student Details"
        icon={FiEye}
        isForm={false}
        submitText="Close"
        closeOnOutsideClick={false}
        size="lg"
        footerButtons={[
          <Button
            key="edit"
            variant="primary"
            onClick={() => {
              setModalState((prev) => ({
                ...prev,
                viewStudent: false,
                editStudent: true,
              }));
              setModalReady(false);
            }}
            className="mr-2"
          >
            <FiEdit2 className="mr-1" /> Edit
          </Button>,
          <Button
            key="delete"
            variant="danger"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <FaSpinner className="animate-spin mr-1" />
            ) : (
              <FiTrash2 className="mr-1" />
            )}
            Delete
          </Button>,
        ]}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <FaSpinner className="animate-spin text-2xl text-blue-500 dark:text-blue-400" />
          </div>
        ) : studentData ? (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 p-1 space-y-1">
              <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Registration Number
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {studentData.id}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  First Name
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {studentData.fname}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Middle Name
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {studentData.mname || "-"}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Last Name
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {studentData.lname}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Sex
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {studentData.sex === "F" ? "Female" : "Male"}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Date of Birth
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {studentData.dob
                    ? new Date(studentData.dob).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 p-1 space-y-1">
              <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Form
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  Form {selectedForm}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Stream
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {streamOptions.find(
                    (s) => s.value === String(studentData.stream_id)
                  )?.label || "-"}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  UPI Number
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {studentData.upi_number || "-"}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  KCPE Marks
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {studentData.kcpe_marks || "-"}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Year
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {studentData.year || "-"}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Phone
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {studentData.phone || "-"}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Address
                </label>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {studentData.address || "-"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No student data available
          </div>
        )}
      </ModalForm>

      {/* Edit Student Modal */}
      <ModalForm
        isOpen={modalState.editStudent && modalReady}
        onClose={() => {
          setError("");
          setModalState((prev) => ({ ...prev, editStudent: false }));
          setModalReady(false);
        }}
        title="Edit Student"
        icon={FiEdit2}
        initialValues={editFormData || initialFormData}
        onSubmit={handleUpdate}
        closeOnOutsideClick={false}
        size="lg"
        submitText={
          isSubmitting ? <FaSpinner className="animate-spin" /> : "Update"
        }
        submitDisabled={isSubmitting}
      >
        {({ values, handleChange }) => (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
                {error}
              </div>
            )}

            <div>
              <div className="mb-2">
                <label
                  htmlFor="id"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Registration Number *
                </label>
                <ReusableInput
                  name="id"
                  id="id"
                  className="w-full mt-1"
                  value={values.id}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid items-center grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-2">
                  <label
                    htmlFor="fname"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    First Name *
                  </label>
                  <ReusableInput
                    name="fname"
                    id="fname"
                    className="w-full mt-1"
                    value={values.fname}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="mname"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Middle Name
                  </label>
                  <ReusableInput
                    name="mname"
                    id="mname"
                    className="w-full mt-1"
                    value={values.mname}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="lname"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Last Name *
                  </label>
                  <ReusableInput
                    name="lname"
                    id="lname"
                    className="w-full mt-1"
                    value={values.lname}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="upi_number"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    UPI Number
                  </label>
                  <ReusableInput
                    name="upi_number"
                    id="upi_number"
                    className="w-full mt-1"
                    value={values.upi_number}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="sex"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Sex *
                  </label>
                  <ReusableSelect
                    name="sex"
                    id="sex"
                    options={sexOptions}
                    placeholder="Select Sex"
                    className="w-full"
                    value={values.sex}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleChange(e);
                      }
                    }}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="dob"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Date of Birth *
                  </label>
                  <ReusableInput
                    name="dob"
                    id="dob"
                    type="date"
                    className="w-full mt-1"
                    value={values.dob}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="form"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Form *
                  </label>
                  <ReusableSelect
                    name="form"
                    id="form"
                    options={formOptions}
                    placeholder="Select Form"
                    className="w-full"
                    value={values.form || selectedForm}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleChange(e);
                      }
                    }}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="stream_id"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Stream *
                  </label>
                  <ReusableSelect
                    name="stream_id"
                    id="stream_id"
                    options={streamOptions}
                    placeholder="Select Stream"
                    className="w-full"
                    value={values.stream_id}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleChange(e);
                      }
                    }}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="kcpe_marks"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    KCPE Marks
                  </label>
                  <ReusableInput
                    name="kcpe_marks"
                    id="kcpe_marks"
                    type="number"
                    className="w-full mt-1"
                    value={values.kcpe_marks}
                    onChange={(e) => handleKcpeMarksChange(e, handleChange)}
                    max="500"
                    min="0"
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="year"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Year
                  </label>
                  <ReusableSelect
                    name="year"
                    id="year"
                    options={yearOptions}
                    placeholder="Select Year"
                    className="w-full"
                    value={values.year || selectedYear}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleChange(e);
                      }
                    }}
                  />
                </div>

                <div className="mb-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Phone
                  </label>
                  <ReusableInput
                    name="phone"
                    id="phone"
                    type="tel"
                    className="w-full mt-1"
                    value={
                      values.phone && values.phone.startsWith("+")
                        ? values.phone
                        : values.phone
                        ? "+" + values.phone
                        : ""
                    }
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mb-2 md:col-span-2">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Address
                </label>
                <ReusableTextarea
                  name="address"
                  id="address"
                  className="w-full mt-1"
                  value={values.address || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </>
        )}
      </ModalForm>
    </>
  );
};

export default AddStudent;
