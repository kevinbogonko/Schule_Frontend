import React, { useState, useEffect, useRef } from "react";
import ModalForm from "../ui/raw/ModalForm";
import { FiEdit2 } from "react-icons/fi";
import { useToast } from "../Toast";
import ImageUploader from "./ImageUploader";
import { FaSpinner } from "react-icons/fa";
import api from "../../hooks/api";

const RUStaffPhoto = ({
  modalState,
  setModalState,
  rowData,
  selectedYear,
  refreshTable,
}) => {
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePath, setImagePath] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const { showToast } = useToast();
  const timeoutRef = useRef(null);

  const fetchStaffPhoto = async () => {
    if (!rowData) {
      setError("Missing teacher data");
      return;
    }

    setIsLoading(true);
    setError("");
    setImagePath(null);
    setShowOverlay(true);

    try {
      const response = await api.post("/teacher/getteacherphoto", {
        id: rowData,
      });

      if (response.data?.path) {
        setImagePath(response.data.path);
      } else {
        setError("No photo found for this teacher");
        showToast("No photo found for this teacher", "error");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load teacher photo");
      showToast("Failed to load teacher photo", "error");
      console.error("Error fetching teacher photo:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Clear any existing timeout when component unmounts or modal closes
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (modalState.viewStaffPhoto) {
      // Set a timeout to handle cases where the image fails to load
      timeoutRef.current = setTimeout(() => {
        if (!imagePath) {
          setError("Loading timed out");
          showToast("Failed to load photo - timed out", "error");
          handleCloseViewModal();
        }
      }, 10000); // 10 seconds timeout

      fetchStaffPhoto();
    } else {
      // Clean up when modal closes
      setImagePath(null);
      setShowOverlay(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [modalState.viewStaffPhoto]);

  const handleCloseViewModal = () => {
    setError("");
    setImagePath(null);
    setShowOverlay(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setModalState((prev) => ({ ...prev, viewStaffPhoto: false }));
  };

  const handleImageLoad = () => {
    setShowOverlay(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleImageError = () => {
    setError("Failed to load image");
    setShowOverlay(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return (
    <div>
      {/* Edit Photo Modal */}
      <ModalForm
        isForm={false}
        title="Upload Teacher Photo"
        icon={FiEdit2}
        isOpen={modalState.editStaffPhoto}
        onClose={() => {
          setModalState((prev) => ({ ...prev, editStaffPhoto: false }));
        }}
        submitText={"Close"}
      >
        <ImageUploader
          folder="teacher_photo"
          extraFormData={{
            year: selectedYear,
            id: rowData,
          }}
          onSuccess={() => {
            refreshTable();
            setModalState((prev) => ({ ...prev, editStaffPhoto: false }));
            showToast("Teacher photo updated successfully", "success");
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
        title={`View Teacher Photo - ${rowData?.name || ""}`}
        icon={FiEdit2}
        isOpen={modalState.viewStaffPhoto}
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
                onClick={fetchStaffPhoto}
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
                  alt={`Teacher ${rowData || ""}`}
                  className="w-full h-full object-contain"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              </div>
              <div className="mt-2 text-sm text-gray-500 text-center">
                {rowData || "N/A"} (ID: {rowData || "N/A"})
              </div>
            </div>
          ) : (
            <div className="text-center p-4 text-gray-500">
              No photo available
            </div>
          )}
        </div>
      </ModalForm>

      {/* Loading Overlay - Only show when showOverlay is true and image hasn't loaded yet */}
      {showOverlay && !imagePath && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
            <FaSpinner className="animate-spin text-3xl text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Loading Teacher Photo...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RUStaffPhoto;
