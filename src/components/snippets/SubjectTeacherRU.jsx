import React, { useEffect, useState } from "react";
import ModalForm from "../ui/raw/ModalForm";
import ReusableSelect from "../ReusableSelect";
import { FiEdit2 } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import { useToast } from "../Toast";
import api from "../../hooks/api";

const SubjectTeacherRU = ({
  modalState,
  setModalState,
  teacherOptions,
  rowData,
  selectedForm,
  refreshTable,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [teacherId, setTeacherId] = useState("");
  const [error, setError] = useState("");
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const { showToast } = useToast();

  // Fetch teacher_id when dialog is about to open
  useEffect(() => {
    const fetchTeacher = async () => {
      if (modalState.editSubjectTeacher && rowData) {
        setShowLoadingOverlay(true);
        setIsLoading(true);
        try {
          const res = await api.post("/teacher/getsubjectteacher", {
            form: selectedForm,
            id: rowData,
          });
          setTeacherId(res.data.teacher_id);

          // Add slight delay before showing modal to ensure data is loaded
          setTimeout(() => {
            setShowLoadingOverlay(false);
          }, 300);
        } catch (err) {
          setError("Failed to fetch teacher");
          setShowLoadingOverlay(false);
        }
        setIsLoading(false);
      }
    };
    fetchTeacher();
  }, [modalState.editSubjectTeacher, rowData, selectedForm]);

  const handleSubmit = async (formValues) => {
    setIsSubmitting(true);
    setError("");
    try {
      await api.put(`/teacher/updatesubjectteacher/${parseInt(rowData)}`, {
        form: selectedForm,
        teacher_id: teacherId,
      });
      showToast("Subject teacher updated successfully", "success", {
        duration: 3000,
      });
      setModalState((prev) => ({ ...prev, editSubjectTeacher: false }));
      refreshTable(); // refresh data after update
    } catch (err) {
      setError("Update failed. Please try again.");
    }
    setIsSubmitting(false);
  };

  return (
    <div>
      {(showLoadingOverlay || isLoading) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg text-center max-w-xs md:max-w-sm">
            <FaSpinner className="animate-spin text-2xl md:text-3xl text-blue-500 mx-auto mb-3 md:mb-4" />
            <p className="text-base md:text-lg font-medium text-gray-700 dark:text-gray-300">
              Loading ...
            </p>
          </div>
        </div>
      )}

      <ModalForm
        isOpen={
          modalState.editSubjectTeacher && !isLoading && !showLoadingOverlay
        }
        onClose={() => {
          setError("");
          setTeacherId("");
          setModalState((prev) => ({ ...prev, editSubjectTeacher: false }));
        }}
        title="Update Subject Teacher"
        icon={FiEdit2}
        initialValues={{ teacher: teacherId }}
        onSubmit={handleSubmit}
        closeOnOutsideClick={false}
        size="lg"
        submitText={
          isSubmitting ? <FaSpinner className="animate-spin" /> : "Submit"
        }
        submitDisabled={isSubmitting}
        className="dark:bg-gray-800"
      >
        {({ values, handleChange, setFieldValue }) => (
          <div className="dark:text-white">
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-md">
                {error}
              </div>
            )}
            <div>
              <label
                htmlFor="teacher"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Teacher *
              </label>
              <ReusableSelect
                name="teacher"
                id="teacher"
                options={teacherOptions}
                placeholder="Select Teacher"
                className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                required
              />
            </div>
          </div>
        )}
      </ModalForm>
    </div>
  );
};

export default SubjectTeacherRU;
