import React, { useState } from "react";
import ModalForm from "../ui/raw/ModalForm";
import ReusableInput from "../ui/ReusableInput";
import { FiUserPlus, FiEdit2 } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import { useToast } from "../Toast";
import api from "../../hooks/api";

const GlobalStreamCRUD = ({
  modalState,
  setModalState,
  rowData,
  refreshTable,
}) => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [streamName, setStreamName] = useState("");

  const handleAddSubmit = async () => {
    if (!streamName) {
      setError("Please enter stream name");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/stream/addstreamname", { stream_name: streamName });
      showToast("Stream added successfully", "success", {duration : 3000, position : 'top-right'});
      refreshTable();
      setModalState({ ...modalState, addStream: false });
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to add stream",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!streamName) {
      setError("Please enter stream name");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.put(`/stream/updatestreamname/${rowData}`, {
        stream_name: streamName,
      });
      showToast("Stream updated successfully", "success", {
        duration: 3000,
        position: "top-right",
      });
      refreshTable();
      setModalState({ ...modalState, editStream: false });
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update stream",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchStreamData = async () => {
    try {
      const response = await api.post('/stream/getstreamname', {id : rowData});
      setStreamName(response.data.stream_name);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to fetch stream",
        "error",
        { duration: 3000, position: "top-right" }
      );
      setModalState({ ...modalState, editStream: false });
    }
  };

  React.useEffect(() => {
    if (modalState.editStream && rowData) {
      fetchStreamData();
    }
  }, [modalState.editStream, rowData]);

  return (
    <>
      {/* Add Stream Modal */}
      <ModalForm
        isOpen={modalState.addStream}
        onClose={() => {
          setError("");
          setStreamName("");
          setModalState({ ...modalState, addStream: false });
        }}
        title="Add Stream Name"
        icon={FiUserPlus}
        onSubmit={handleAddSubmit}
        closeOnOutsideClick={false}
        size="md"
        submitText={
          isSubmitting ? <FaSpinner className="animate-spin" /> : "Submit"
        }
        submitDisabled={isSubmitting}
      >
        <div className="mb-4">
          <ReusableInput
            label="Stream Name"
            value={streamName}
            onChange={(e) => setStreamName(e.target.value)}
            placeholder="Enter stream name"
            required
          />
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-md">
            {error}
          </div>
        )}
      </ModalForm>

      {/* Edit Stream Modal */}
      <ModalForm
        isOpen={modalState.editStream}
        onClose={() => {
          setError("");
          setStreamName("");
          setModalState({ ...modalState, editStream: false });
        }}
        title="Edit Stream Name"
        icon={FiEdit2}
        onSubmit={handleEditSubmit}
        closeOnOutsideClick={false}
        size="md"
        submitText={
          isSubmitting ? <FaSpinner className="animate-spin" /> : "Update"
        }
        submitDisabled={isSubmitting}
      >
        <div className="mb-4">
          <ReusableInput
            label="Stream Name"
            value={streamName}
            onChange={(e) => setStreamName(e.target.value)}
            placeholder="Enter stream name"
            required
          />
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-md">
            {error}
          </div>
        )}
      </ModalForm>
    </>
  );
};

export default GlobalStreamCRUD;
