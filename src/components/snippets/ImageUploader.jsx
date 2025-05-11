import React, { useState } from "react";
import api from "../../hooks/api";
import { useToast } from "../Toast";

const ImageUploader = ({
  folder = "misc",
  multiple = false,
  extraFormData = {},
}) => {
  const { showToast } = useToast();

  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      showToast("Please select at least one file", "error", {
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();

    if (multiple) {
      files.forEach((file) => {
        formData.append("images", file);
      });
    } else {
      formData.append("image", files[0]);
    }

    // Append extra form data if provided
    if (extraFormData && typeof extraFormData === "object") {
      Object.entries(extraFormData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    try {
      const endpoint = multiple
        ? `/upload/uploads/${folder}`
        : `/upload/upload/${folder}`;

      const response = await api.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const urls = multiple
        ? response.data.data.imageUrls
        : [response.data.data.imageUrl];

      setUploadedUrls(urls);
      showToast(
        multiple
          ? "Images uploaded successfully!"
          : "Image uploaded successfully!",
        "success",
        {
          duration: 3000,
          position: "top-right",
        }
      );
      setFiles([]);
    } catch (error) {
      console.error("Upload error:", error);
      showToast(error.response?.data?.message || "Upload failed", "error", {
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg">
      <h2 className="text-xl font-semibold mb-4">
        {multiple ? "Upload Multiple Images" : "Upload Image"}
      </h2>

      <div className="mb-4">
        <label className="flex flex-col items-center px-4 py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100">
          <svg
            className="w-8 h-8 text-gray-500 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className="text-sm text-gray-600">
            {files.length > 0
              ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
              : "Choose file" + (multiple ? "s" : "")}
          </span>
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
            multiple={multiple}
          />
        </label>
      </div>

      {files.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Selected files:
          </h3>
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm"
              >
                <span className="truncate max-w-xs">{file.name}</span>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={isUploading || files.length === 0}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          isUploading || files.length === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isUploading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Uploading...
          </span>
        ) : (
          `Upload ${multiple ? "Images" : "Image"}`
        )}
      </button>

      {uploadedUrls.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Uploaded {multiple ? "Images" : "Image"}:
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="aspect-square">
                <img
                  src={`${BACKEND_BASE_URL}${url}`}
                  alt={`Uploaded ${index}`}
                  className="w-full h-full object-cover rounded-md border border-gray-200"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
