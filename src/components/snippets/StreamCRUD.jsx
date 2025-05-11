import React, { useState, useEffect } from "react";
import ModalForm from "../ui/raw/ModalForm";
import ReusableInput from "../ui/ReusableInput";
import {
  FiUserPlus,
  FiEdit2,
  FiEye,
  FiGrid,
  FiCalendar,
  FiUser,
} from "react-icons/fi";
import ReusableSelect from "../ReusableSelect";
import api from "../../hooks/api";
import { FaSpinner } from "react-icons/fa";
import { useToast } from "../Toast";
import Dropdown from "../Dropdown";
import { yearOptions } from "../../utils/CommonData";

const StreamCRUD = ({
  modalState,
  setModalState,
  teacherOptions,
  rowData,
  refreshTable,
  selectedForm,
  selectedYear,
}) => {
  const { showToast } = useToast();
  const [streamData, setStreamData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const initialFormData = {
    stream_name: "",
    year: selectedYear,
    form: selectedForm,
    teacher_id: "",
  };

  useEffect(() => {
    if (modalState.editStream || modalState.viewStream) {
      setIsLoading(true);
      api
        .post("/stream/getstream", {
          id: rowData,
          form: selectedForm,
        })
        .then((res) => {
          setStreamData(res.data);
          setEditFormData(res.data);
        })
        .catch(() => {
          showToast("Failed to fetch stream data", "error", {
            duration: 3000,
            position: "top-center",
          });
          setModalState((prev) => ({
            ...prev,
            editStream: false,
            viewStream: false,
          }));
        })
        .finally(() => setIsLoading(false));
    }
  }, [modalState.editStream, modalState.viewStream]);

  const handleSubmit = async (formValues) => {
    if (!formValues.stream_name || !formValues.teacher_id) {
      setError("Please fill in all required fields!");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        ...formValues,
        form: selectedForm,
        year: selectedYear,
      };

      const response = await api.post("/stream/addstream", payload);

      if (response.status === 200 || response.status === 201) {
        setModalState((prev) => ({ ...prev, addStream: false }));
        showToast("Stream Added Successfully", "success", {
          duration: 3000,
          position: "top-center",
        });
        refreshTable();
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to add stream",
        "error",
        {
          duration: 3000,
          position: "top-center",
        }
      );
      setError(
        error.response?.data?.message ||
          "Failed to add stream. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (formValues) => {
    if (!formValues.stream_name || !formValues.teacher_id) {
      setError("Please fill in all required fields!");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        ...formValues,
        form: selectedForm,
      };

      const response = await api.put(
        `/stream/updatestream/${rowData}`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        setModalState((prev) => ({ ...prev, editStream: false }));
        showToast("Stream Updated Successfully", "success", {
          duration: 3000,
          position: "top-center",
        });
        refreshTable();
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update stream",
        "error",
        {
          duration: 3000,
          position: "top-center",
        }
      );
      setError(
        error.response?.data?.message ||
          "Failed to update stream. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Add Stream Modal */}
      <ModalForm
        isOpen={modalState.addStream}
        onClose={() => {
          setError("");
          setModalState((prev) => ({ ...prev, addStream: false }));
        }}
        title="Add Stream"
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
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-md">
                {error}
              </div>
            )}

            <div className="mb-2">
              <label
                htmlFor="stream_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Stream Name *
              </label>
              <ReusableInput
                name="stream_name"
                id="stream_name"
                className="w-full mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={values.stream_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid items-center grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-2">
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Year *
                </label>
                <ReusableSelect
                  id="year"
                  placeholder="Select Year"
                  className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  options={yearOptions}
                  value={values.year || selectedYear}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-2">
                <label
                  htmlFor="teacher_id"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Class Teacher *
                </label>
                <Dropdown
                  options={teacherOptions}
                  value={values.teacher_id}
                  onChange={(value) =>
                    handleChange({ target: { name: "teacher_id", value } })
                  }
                  placeholder="Select Teacher"
                  menuPlacement="auto"
                  searchable
                  clearable
                  className="z-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>
          </>
        )}
      </ModalForm>

      {/* Edit Stream Modal */}
      <ModalForm
        isOpen={modalState.editStream && !!editFormData && !isLoading}
        onClose={() => {
          setError("");
          setModalState((prev) => ({ ...prev, editStream: false }));
        }}
        title="Edit Stream"
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
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-md">
                {error}
              </div>
            )}

            <div className="mb-2">
              <label
                htmlFor="stream_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Stream Name *
              </label>
              <ReusableInput
                name="stream_name"
                id="stream_name"
                className="w-full mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={values.stream_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid items-center grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-2">
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Year *
                </label>
                <ReusableSelect
                  id="year"
                  placeholder="Select Year"
                  className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  options={yearOptions}
                  value={values.year || selectedYear}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-2">
                <label
                  htmlFor="teacher_id"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Class Teacher *
                </label>
                <Dropdown
                  options={teacherOptions}
                  value={values.teacher_id}
                  onChange={(value) =>
                    handleChange({ target: { name: "teacher_id", value } })
                  }
                  placeholder="Select Teacher"
                  menuPlacement="auto"
                  searchable
                  clearable
                  className="z-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>
          </>
        )}
      </ModalForm>

      {/* View Stream Modal */}
      <ModalForm
        isOpen={modalState.viewStream && !!streamData && !isLoading}
        onClose={() =>
          setModalState((prev) => ({ ...prev, viewStream: false }))
        }
        title="View Stream"
        icon={FiEye}
        size="md"
        isForm={false}
        submitText="Close"
        onSubmit={() =>
          setModalState((prev) => ({ ...prev, viewStream: false }))
        }
      >
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 p-1 space-y-1">
            <div className="mt-1 bg-white dark:bg-gray-700 p-3 rounded shadow-sm">
              <FiEdit2 className="text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Stream Name
                </p>
                <p className="font-semibold dark:text-white">
                  {streamData?.stream_name}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm">
              <FiCalendar className="text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Year</p>
                <p className="font-semibold dark:text-white">
                  {streamData?.year}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm">
              <FiUser className="text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Class Teacher
                </p>
                <p className="font-semibold dark:text-white">
                  {(teacherOptions.value = streamData?.teacher_id || "-")}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm">
              <FiUser className="text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Status
                </p>
                <p className="font-semibold dark:text-white">
                  {streamData?.status === 1 ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ModalForm>
    </>
  );
};

export default StreamCRUD;
