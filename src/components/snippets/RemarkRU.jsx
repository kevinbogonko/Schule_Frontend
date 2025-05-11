import React, { useState, useEffect } from "react";
import ModalForm from "../ui/raw/ModalForm";
import { FiEdit2 } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import { useToast } from "../Toast";
import api from "../../hooks/api";
import ReusableTextarea from "../ReusableTextarea";

const RemarkRU = ({
  modalState,
  setModalState,
  selectedItem,
  rowData,
  refreshTable,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const { showToast } = useToast();

  // Load comment data when modal opens
  useEffect(() => {
    const loadCommentData = async () => {
      if (modalState.editRemark && rowData) {
        setIsLoading(true);
        try {
          const response = await api.post("/remark/getremark", {
            item: selectedItem,
            id: rowData,
          });
          setComment(response.data.comment || "");
        } catch (err) {
          setError(err.response?.data?.message || "Failed to load remark data");
          showToast(error || "Failed to load remark", "error", {
            duration: 3000,
            position: "top-center",
          });
          setModalState({ editRemark: false });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadCommentData();
  }, [modalState.editRemark, rowData, selectedItem]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await api.put(`/remark/updateremark/${rowData}`, {
        item: selectedItem,
        comment: comment,
      });
      showToast("Remark updated successfully", "success", {
        duration: 3000,
      });
      setModalState({ editRemark: false });
      refreshTable();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Update failed. Please try again.";
      setError(errorMsg);
      showToast(errorMsg, "error", {
        duration: 3000,
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <ModalForm
        isOpen={modalState.editRemark && !isLoading}
        onClose={() => {
          setError("");
          setComment("");
          setModalState({ editRemark: false });
        }}
        title="Update Remark/Comment"
        icon={FiEdit2}
        onSubmit={handleSubmit}
        closeOnOutsideClick={false}
        size="lg"
        submitText={
          isSubmitting ? <FaSpinner className="animate-spin" /> : "Submit"
        }
        submitDisabled={isSubmitting || !comment}
      >
        {() => (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <FaSpinner className="animate-spin text-2xl text-blue-500" />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment/Remark *
                </label>
                <ReusableTextarea
                  className="w-full"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            )}
          </>
        )}
      </ModalForm>
    </div>
  );
};

export default RemarkRU;
