import React, { useState, useEffect } from "react";
import ModalForm from "../ui/ModalForm";
import ReusableInput from "../ui/ReusableInput";
import { FiUserPlus, FiEdit2 } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import { useToast } from "../ui/Toast";
import api from "../../hooks/api";

const ExamCRUD = ({
  modalState,
  setModalState,
  selectedForm,
  selectedYear,
  selectedTerm,
  syst_level,
  rowData,
  refreshTable,
}) => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [examName, setExamName] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const handleAddSubmit = async () => {
    if (!examName.trim()) {
      setError("Please enter exam name");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/exam/addexam", {
        year: selectedYear,
        term: selectedTerm,
        form: selectedForm,
        exam_name: examName,
      });
      showToast("Exam added successfully", "success", {
        duration: 3000,
        position: "top-right",
      });
      refreshTable();
      setModalState({ ...modalState, addExam: false });
      setExamName("");
      setScheduledAt("");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to add exam",
        "error",
        {
          duration: 3000,
          position: "top-right",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!examName.trim()) {
      setError("Please enter exam name");
      return;
    }

    if (!scheduledAt.trim()) {
      setError("Please select scheduled date");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/exam/updateexam", {
        id: rowData,
        exam_name: examName,
        scheduled_at: scheduledAt,
      });
      showToast("Exam updated successfully", "success", {
        duration: 3000,
        position: "top-right",
      });
      refreshTable();
      setModalState({ ...modalState, editExam: false });
      setExamName("");
      setScheduledAt("");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update exam",
        "error",
        {
          duration: 3000,
          position: "top-right",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchExamData = async () => {
    setIsLoading(true);
    try {
      const response = await api.post("/exam/exam", { id: rowData });
      setExamName(response.data.exam_name || "");
      setScheduledAt(response.data.scheduled_at || "");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to fetch exam data",
        "error",
        { duration: 3000, position: "top-right" }
      );
      setModalState({ ...modalState, editExam: false });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (modalState.editExam && rowData) {
      fetchExamData();
    }
  }, [modalState.editExam, rowData]);

  useEffect(() => {
    if (modalState.addExam) {
      setExamName("");
      setScheduledAt("");
      setError("");
    }
  }, [modalState.addExam]);

  return (
    <>
      {/* Add Exam Modal */}
      <ModalForm
        isOpen={modalState.addExam}
        onClose={() => {
          setError("");
          setExamName("");
          setScheduledAt("");
          setModalState({ ...modalState, addExam: false });
        }}
        title="Add Exam"
        icon={FiUserPlus}
        onSubmit={handleAddSubmit}
        closeOnOutsideClick={false}
        size="lg"
        submitText={
          isSubmitting ? <FaSpinner className="animate-spin" /> : "Submit"
        }
        submitDisabled={isSubmitting}
      >
        <div className="space-y-4">
          <ReusableInput
            label="Exam Name"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="Enter exam name"
            required
          />
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-md">
            {error}
          </div>
        )}
      </ModalForm>

      {/* Edit Exam Modal */}
      <ModalForm
        isOpen={modalState.editExam && !isLoading}
        onClose={() => {
          setError("");
          setExamName("");
          setScheduledAt("");
          setModalState({ ...modalState, editExam: false });
        }}
        title="Edit Exam"
        icon={FiEdit2}
        onSubmit={handleEditSubmit}
        closeOnOutsideClick={false}
        size="lg"
        submitText={
          isSubmitting ? <FaSpinner className="animate-spin" /> : "Update"
        }
        submitDisabled={isSubmitting}
      >
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="animate-spin text-2xl text-blue-500" />
            <span className="ml-3">Loading exam data...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <ReusableInput
              label="Exam Name"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="Enter exam name"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Scheduled Date
              </label>
              <input
                type="date"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>
        )}
        {error && !isLoading && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-md">
            {error}
          </div>
        )}
      </ModalForm>
    </>
  );
};

export default ExamCRUD;
