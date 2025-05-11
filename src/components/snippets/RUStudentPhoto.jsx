import React, { useState, useEffect } from "react";
import ModalForm from "../ui/raw/ModalForm";
import { FiEdit2 } from "react-icons/fi";
import { useToast } from "../Toast";
import ImageUploader from "./ImageUploader";
import { FaSpinner } from "react-icons/fa";
import api from "../../hooks/api";

const RUStudentPhoto = ({
  modalState,
  setModalState,
  rowData,
  selectedForm,
  selectedYear,
  refreshTable,
}) => {
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePath, setImagePath] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    let timeoutId;

    if (modalState.viewStudentPhoto) {
      setShowOverlay(true);
      timeoutId = setTimeout(() => {
        if (!imagePath) {
          setError("Loading timed out");
          showToast("Failed to load photo - timed out", "error");
          handleCloseViewModal();
        }
      }, 10000); // 10 seconds
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [modalState.viewStudentPhoto, imagePath]); // Added imagePath to dependencies

  const fetchStudentPhoto = async () => {
    if (!rowData || !selectedForm) {
      setError("Missing student data or form selection");
      return;
    }

    setIsLoading(true);
    setError("");
    setImagePath(null); // Reset image path before fetching
    try {
      const response = await api.post("/student/getstudentphoto", {
        form: selectedForm,
        id: rowData,
      });

      if (response.data?.path) {
        setImagePath(response.data.path);
      } else {
        setError("No photo found for this student");
        showToast("No photo found for this student", "error");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load student photo");
      showToast("Failed to load student photo", "error");
      console.error("Error fetching student photo:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (modalState.viewStudentPhoto) {
      fetchStudentPhoto();
    } else {
      setImagePath(null);
      setShowOverlay(false);
    }
  }, [modalState.viewStudentPhoto]);

  const handleCloseViewModal = () => {
    setError("");
    setImagePath(null);
    setShowOverlay(false);
    setModalState((prev) => ({ ...prev, viewStudentPhoto: false }));
  };

  return (
    <div>
      {/* Edit Photo Modal */}
      <ModalForm
        isForm={false}
        title="Upload Student Photo"
        icon={FiEdit2}
        isOpen={modalState.editStudentPhoto}
        onClose={() => {
          setModalState((prev) => ({ ...prev, editStudentPhoto: false }));
        }}
        submitText={"Close"}
      >
        <ImageUploader
          folder="student_photo"
          extraFormData={{
            form: selectedForm,
            year: selectedYear,
            id: rowData,
          }}
          onSuccess={() => {
            refreshTable();
            setModalState((prev) => ({ ...prev, editStudentPhoto: false }));
            showToast("Student photo updated successfully", "success");
          }}
          onError={(error) => {
            setError(error);
            showToast("Failed to upload photo", "error");
          }}
        />
        {error && <div className="text-red-500 mt-2 text-center">{error}</div>}
      </ModalForm>

      {/* View Photo Modal */}
      <ModalForm
        isForm={false}
        title={`View Student Photo - ${rowData?.name || ""}`}
        icon={FiEdit2}
        isOpen={modalState.viewStudentPhoto}
        onClose={handleCloseViewModal}
        submitText={"Close"}
      >
        <div className="flex flex-col items-center">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-2xl text-blue-500" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">
              {error}
              <button
                onClick={fetchStudentPhoto}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : imagePath ? (
            <div className="w-full max-w-xs">
              <div className="aspect-square border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={`${BACKEND_BASE_URL}${imagePath}`}
                  alt={`Student ${rowData || ""}`}
                  className="w-full h-full object-contain"
                  onLoad={() => setShowOverlay(false)} // Hide overlay when image loads
                />
              </div>
              <div className="mt-2 text-sm text-gray-500 text-center">
                {rowData || "N/A"} (ID: {rowData || "N/A"})
              </div>
            </div>
          ) : null}
        </div>
      </ModalForm>

      {/* Loading Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
            <FaSpinner className="animate-spin text-3xl text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Loading Student Photo...
            </p>
            <p className="text-sm text-gray-500">
              This will automatically close in 10 seconds if the photo fails to
              load
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RUStudentPhoto;
