// import React, { useState, useEffect } from "react";
// import axios from "axios";

// // UploadDropzone Component
// const UploadDropzone = ({ onFilesSelected, selectedFiles, onRemoveFile }) => {
//   const [isDragging, setIsDragging] = useState(false);

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const files = Array.from(e.dataTransfer.files);
//     onFilesSelected(files);
//   };

//   const handleFileInput = (e) => {
//     const files = Array.from(e.target.files || []);
//     onFilesSelected(files);
//   };

//   return (
//     <div
//       style={{
//         border: `2px dashed ${isDragging ? "#2563eb" : "#d1d5db"}`,
//         borderRadius: 12,
//         padding: 40,
//         textAlign: "center",
//         background: isDragging ? "#f0f9ff" : "#f9fafb",
//         transition: "all 0.2s ease",
//         marginBottom: 20,
//       }}
//       onDragOver={handleDragOver}
//       onDragLeave={handleDragLeave}
//       onDrop={handleDrop}
//     >
//       <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
//       <p
//         style={{
//           fontSize: 18,
//           fontWeight: 600,
//           marginBottom: 8,
//           color: "#374151",
//         }}
//       >
//         Drop files here or click to browse
//       </p>
//       <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20 }}>
//         Supports PDF, DOC, DOCX, TXT files
//       </p>

//       <input
//         type="file"
//         multiple
//         onChange={handleFileInput}
//         style={{ display: "none" }}
//         id="file-input"
//       />
//       <label
//         htmlFor="file-input"
//         style={{
//           display: "inline-block",
//           padding: "10px 20px",
//           background: "#2563eb",
//           color: "white",
//           borderRadius: 8,
//           cursor: "pointer",
//           fontSize: 14,
//           fontWeight: 500,
//         }}
//       >
//         Choose Files
//       </label>

//       {selectedFiles.length > 0 && (
//         <div style={{ marginTop: 20 }}>
//           <h4 style={{ margin: "16px 0 8px 0", color: "#374151" }}>
//             Selected Files:
//           </h4>
//           {selectedFiles.map((file, index) => (
//             <div
//               key={index}
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 padding: "8px 12px",
//                 background: "white",
//                 border: "1px solid #e5e7eb",
//                 borderRadius: 6,
//                 marginBottom: 6,
//               }}
//             >
//               <span style={{ fontSize: 14 }}>{file.name}</span>
//               <button
//                 onClick={() => onRemoveFile(index)}
//                 style={{
//                   background: "#ef4444",
//                   color: "white",
//                   border: "none",
//                   borderRadius: 4,
//                   padding: "4px 8px",
//                   fontSize: 12,
//                   cursor: "pointer",
//                 }}
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // FileMetadataForm Component
// const FileMetadataForm = ({ metadata, onMetadataChange }) => {
//   const handleChange = (field, value) => {
//     onMetadataChange({
//       ...metadata,
//       [field]: value,
//     });
//   };

//   return (
//     <div
//       style={{
//         background: "#fff",
//         padding: 20,
//         borderRadius: 12,
//         border: "1px solid #e5e7eb",
//         marginBottom: 20,
//       }}
//     >
//       <h3 style={{ margin: "0 0 16px 0", color: "#374151" }}>
//         Document Metadata
//       </h3>

//       <div style={{ display: "grid", gap: 16 }}>
//         <div>
//           <label
//             style={{
//               display: "block",
//               marginBottom: 6,
//               fontWeight: 500,
//               color: "#374151",
//             }}
//           >
//             Title *
//           </label>
//           <input
//             type="text"
//             value={metadata.title || ""}
//             onChange={(e) => handleChange("title", e.target.value)}
//             style={{
//               width: "100%",
//               padding: "8px 12px",
//               border: "1px solid #d1d5db",
//               borderRadius: 6,
//               fontSize: 14,
//             }}
//             placeholder="Enter document title"
//           />
//         </div>

//         <div>
//           <label
//             style={{
//               display: "block",
//               marginBottom: 6,
//               fontWeight: 500,
//               color: "#374151",
//             }}
//           >
//             Subject
//           </label>
//           <input
//             type="text"
//             value={metadata.subject || ""}
//             onChange={(e) => handleChange("subject", e.target.value)}
//             style={{
//               width: "100%",
//               padding: "8px 12px",
//               border: "1px solid #d1d5db",
//               borderRadius: 6,
//               fontSize: 14,
//             }}
//             placeholder="Enter subject"
//           />
//         </div>

//         <div>
//           <label
//             style={{
//               display: "block",
//               marginBottom: 6,
//               fontWeight: 500,
//               color: "#374151",
//             }}
//           >
//             Tags
//           </label>
//           <input
//             type="text"
//             value={metadata.tags || ""}
//             onChange={(e) => handleChange("tags", e.target.value)}
//             style={{
//               width: "100%",
//               padding: "8px 12px",
//               border: "1px solid #d1d5db",
//               borderRadius: 6,
//               fontSize: 14,
//             }}
//             placeholder="Comma-separated tags (e.g., research, notes, important)"
//           />
//         </div>

//         <div>
//           <label
//             style={{
//               display: "block",
//               marginBottom: 6,
//               fontWeight: 500,
//               color: "#374151",
//             }}
//           >
//             Description
//           </label>
//           <textarea
//             value={metadata.description || ""}
//             onChange={(e) => handleChange("description", e.target.value)}
//             rows={3}
//             style={{
//               width: "100%",
//               padding: "8px 12px",
//               border: "1px solid #d1d5db",
//               borderRadius: 6,
//               fontSize: 14,
//               resize: "vertical",
//             }}
//             placeholder="Enter document description"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// // IngestionProgress Component
// const IngestionProgress = ({ currentStep, progress, steps }) => {
//   return (
//     <div
//       style={{
//         background: "#fff",
//         padding: 20,
//         borderRadius: 12,
//         border: "1px solid #e5e7eb",
//         marginBottom: 20,
//       }}
//     >
//       <h3 style={{ margin: "0 0 16px 0", color: "#374151" }}>
//         Ingestion Progress
//       </h3>

//       <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
//         <div
//           style={{
//             flex: 1,
//             height: 8,
//             background: "#f3f4f6",
//             borderRadius: 999,
//             overflow: "hidden",
//           }}
//         >
//           <div
//             style={{
//               height: "100%",
//               width: `${progress}%`,
//               background: "#2563eb",
//               transition: "width 0.3s ease",
//             }}
//           />
//         </div>
//         <span
//           style={{
//             marginLeft: 12,
//             fontSize: 14,
//             fontWeight: 600,
//             color: "#374151",
//           }}
//         >
//           {progress}%
//         </span>
//       </div>

//       <div style={{ display: "grid", gap: 8 }}>
//         {steps.map((step, index) => (
//           <div
//             key={step.name}
//             style={{
//               display: "flex",
//               alignItems: "center",
//               padding: "8px 12px",
//               background: currentStep === step.name ? "#f0f9ff" : "transparent",
//               border:
//                 currentStep === step.name
//                   ? "1px solid #2563eb"
//                   : "1px solid transparent",
//               borderRadius: 6,
//             }}
//           >
//             <div
//               style={{
//                 width: 20,
//                 height: 20,
//                 borderRadius: "50%",
//                 background:
//                   currentStep === step.name
//                     ? "#2563eb"
//                     : index < steps.findIndex((s) => s.name === currentStep)
//                     ? "#10b981"
//                     : "#d1d5db",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 marginRight: 12,
//                 fontSize: 12,
//                 color: "white",
//                 fontWeight: "bold",
//               }}
//             >
//               {index < steps.findIndex((s) => s.name === currentStep)
//                 ? "✓"
//                 : index + 1}
//             </div>
//             <span
//               style={{
//                 fontSize: 14,
//                 color: currentStep === step.name ? "#2563eb" : "#6b7280",
//                 fontWeight: currentStep === step.name ? 600 : 400,
//               }}
//             >
//               {step.label}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // UploadedFilesList Component
// const UploadedFilesList = ({ files }) => {
//   const getStatusBadge = (status) => {
//     const statusConfig = {
//       uploaded: { color: "#3b82f6", bgColor: "#dbeafe", label: "Uploaded" },
//       processing: { color: "#f59e0b", bgColor: "#fef3c7", label: "Processing" },
//       processed: { color: "#10b981", bgColor: "#d1fae5", label: "Processed" },
//       error: { color: "#ef4444", bgColor: "#fee2e2", label: "Error" },
//     };

//     const config = statusConfig[status] || statusConfig.uploaded;

//     return (
//       <span
//         style={{
//           padding: "4px 8px",
//           borderRadius: 999,
//           fontSize: 12,
//           fontWeight: 600,
//           background: config.bgColor,
//           color: config.color,
//         }}
//       >
//         {config.label}
//       </span>
//     );
//   };

//   return (
//     <div
//       style={{
//         background: "#fff",
//         padding: 20,
//         borderRadius: 12,
//         border: "1px solid #e5e7eb",
//       }}
//     >
//       <h3 style={{ margin: "0 0 16px 0", color: "#374151" }}>
//         Uploaded Documents
//       </h3>

//       {files.length === 0 ? (
//         <p
//           style={{
//             color: "#6b7280",
//             fontStyle: "italic",
//             textAlign: "center",
//             padding: 20,
//           }}
//         >
//           No documents uploaded yet
//         </p>
//       ) : (
//         <div style={{ display: "grid", gap: 12 }}>
//           {files.map((file, index) => (
//             <div
//               key={index}
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 padding: 16,
//                 background: "#f9fafb",
//                 borderRadius: 8,
//                 border: "1px solid #e5e7eb",
//               }}
//             >
//               <div style={{ flex: 1 }}>
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     marginBottom: 4,
//                   }}
//                 >
//                   <span
//                     style={{ fontSize: 16, fontWeight: 600, color: "#374151" }}
//                   >
//                     {file.filename}
//                   </span>
//                   {getStatusBadge(file.status)}
//                 </div>

//                 <div style={{ fontSize: 12, color: "#6b7280" }}>
//                   {file.size && `${(file.size / 1024).toFixed(1)} KB`}
//                   {file.chunks && ` • ${file.chunks} chunks`}
//                   {file.toc_entries && ` • ${file.toc_entries} TOC entries`}
//                   {file.uploadedAt &&
//                     ` • ${new Date(file.uploadedAt).toLocaleDateString()}`}
//                 </div>

//                 {file.metadata && (
//                   <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
//                     {file.metadata.title && <strong>Title:</strong>}{" "}
//                     {file.metadata.title}
//                     {file.metadata.subject && (
//                       <span> • {file.metadata.subject}</span>
//                     )}
//                     {file.metadata.tags && (
//                       <span> • Tags: {file.metadata.tags}</span>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // Main Component
// const UploadIngestion = () => {
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [status, setStatus] = useState("idle");
//   const [uploadedFiles, setUploadedFiles] = useState([]);
//   const [error, setError] = useState("");
//   const [metadata, setMetadata] = useState({
//     title: "",
//     subject: "",
//     tags: "",
//     description: "",
//   });
//   const [ingestionProgress, setIngestionProgress] = useState(0);
//   const [currentStep, setCurrentStep] = useState("");

//   const ingestionSteps = [
//     { name: "uploading", label: "Uploading file..." },
//     { name: "extracting", label: "Extracting text..." },
//     { name: "chunking", label: "Creating chunks..." },
//     { name: "embedding", label: "Embedding to Qdrant..." },
//     { name: "indexing", label: "Creating TOC entries..." },
//     { name: "complete", label: "Processing complete!" },
//   ];

//   const handleFilesSelected = (files) => {
//     setSelectedFiles(files);
//     setError("");
//   };

//   const handleRemoveFile = (index) => {
//     setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
//   };

//   const simulateIngestionProgress = () => {
//     let progress = 0;
//     const steps = ingestionSteps.map((step) => step.name);
//     let currentStepIndex = 0;

//     const interval = setInterval(() => {
//       progress += Math.random() * 15;
//       if (progress >= 100) {
//         progress = 100;
//         clearInterval(interval);
//       }

//       setIngestionProgress(progress);

//       // Update current step based on progress
//       const stepProgress = 100 / steps.length;
//       const newStepIndex = Math.min(
//         Math.floor(progress / stepProgress),
//         steps.length - 1
//       );
//       if (newStepIndex !== currentStepIndex) {
//         currentStepIndex = newStepIndex;
//         setCurrentStep(steps[currentStepIndex]);
//       }
//     }, 500);

//     return interval;
//   };

//   const handleUpload = async () => {
//     if (!selectedFiles.length) {
//       setError("Please select one or more files to upload.");
//       return;
//     }

//     if (!metadata.title.trim()) {
//       setError("Please provide a title for the document.");
//       return;
//     }

//     setStatus("uploading");
//     setUploadProgress(0);
//     setIngestionProgress(0);
//     setCurrentStep("uploading");
//     setError("");

//     const formData = new FormData();
//     selectedFiles.forEach((f) => formData.append("files", f));
//     formData.append("metadata", JSON.stringify(metadata));

//     try {
//       const resp = await axios.post("http://localhost:8000/upload", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         onUploadProgress: (evt) => {
//           if (!evt.total) return;
//           const percent = Math.round((evt.loaded * 100) / evt.total);
//           setUploadProgress(percent);
//         },
//       });

//       // Start simulating ingestion progress
//       const progressInterval = simulateIngestionProgress();

//       // In a real app, you might use WebSocket or polling for actual progress
//       setTimeout(() => {
//         clearInterval(progressInterval);
//         setIngestionProgress(100);
//         setCurrentStep("complete");

//         // Add the uploaded file to the list
//         const newFile = {
//           filename: selectedFiles[0].name,
//           size: selectedFiles[0].size,
//           status: "processed",
//           chunks: Math.floor(Math.random() * 50) + 10, // Mock data
//           toc_entries: Math.floor(Math.random() * 20) + 5, // Mock data
//           uploadedAt: new Date().toISOString(),
//           metadata: { ...metadata },
//         };

//         setUploadedFiles((prev) => [newFile, ...prev]);
//         setStatus("success");
//         setSelectedFiles([]);
//         setMetadata({ title: "", subject: "", tags: "", description: "" });
//       }, 4000);
//     } catch (err) {
//       console.error("Upload error:", err);
//       setError(
//         err?.response?.data?.detail ||
//           "Upload failed. Ensure the backend is running and CORS is enabled."
//       );
//       setStatus("error");
//       setIngestionProgress(0);
//       setCurrentStep("");
//     }
//   };

//   return (
//     <div
//       style={{
//         fontFamily: "system-ui, Arial, sans-serif",
//         padding: 20,
//         maxWidth: 800,
//         margin: "0 auto",
//       }}
//     >
//       <h1
//         style={{
//           fontSize: 32,
//           marginBottom: 24,
//           color: "#1f2937",
//           textAlign: "center",
//         }}
//       >
//         📤 Document Upload & Ingestion
//       </h1>

//       <UploadDropzone
//         onFilesSelected={handleFilesSelected}
//         selectedFiles={selectedFiles}
//         onRemoveFile={handleRemoveFile}
//       />

//       {selectedFiles.length > 0 && (
//         <>
//           <FileMetadataForm
//             metadata={metadata}
//             onMetadataChange={setMetadata}
//           />

//           <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
//             <button
//               onClick={handleUpload}
//               disabled={status === "uploading"}
//               style={{
//                 flex: 1,
//                 padding: "12px 16px",
//                 background: status === "uploading" ? "#9ca3af" : "#2563eb",
//                 color: "white",
//                 border: "none",
//                 borderRadius: 8,
//                 cursor: status === "uploading" ? "default" : "pointer",
//                 fontSize: 16,
//                 fontWeight: 600,
//               }}
//             >
//               {status === "uploading"
//                 ? "Uploading…"
//                 : "Start Upload & Processing"}
//             </button>

//             <button
//               onClick={() => {
//                 setSelectedFiles([]);
//                 setError("");
//                 setStatus("idle");
//                 setMetadata({
//                   title: "",
//                   subject: "",
//                   tags: "",
//                   description: "",
//                 });
//               }}
//               style={{
//                 padding: "12px 16px",
//                 background: "#e5e7eb",
//                 border: "none",
//                 borderRadius: 8,
//                 cursor: "pointer",
//                 fontSize: 14,
//               }}
//             >
//               Clear All
//             </button>
//           </div>

//           {status === "uploading" && (
//             <>
//               <div style={{ marginBottom: 20 }}>
//                 <div style={{ marginBottom: 8 }}>
//                   <strong>Upload Progress:</strong> {uploadProgress}%
//                 </div>
//                 <div
//                   style={{
//                     height: 8,
//                     background: "#f3f4f6",
//                     borderRadius: 999,
//                     overflow: "hidden",
//                   }}
//                 >
//                   <div
//                     style={{
//                       height: "100%",
//                       width: `${uploadProgress}%`,
//                       background: "#2563eb",
//                       transition: "width 200ms linear",
//                     }}
//                   />
//                 </div>
//               </div>

//               <IngestionProgress
//                 currentStep={currentStep}
//                 progress={ingestionProgress}
//                 steps={ingestionSteps}
//               />
//             </>
//           )}

//           {status === "success" && (
//             <div
//               style={{
//                 marginBottom: 20,
//                 padding: 16,
//                 borderRadius: 8,
//                 background: "#ecfdf5",
//                 border: "1px solid #bbf7d0",
//                 color: "#065f46",
//                 textAlign: "center",
//               }}
//             >
//               ✅ Upload and processing completed successfully!
//             </div>
//           )}

//           {status === "error" && (
//             <div
//               style={{
//                 marginBottom: 20,
//                 padding: 16,
//                 borderRadius: 8,
//                 background: "#fff1f2",
//                 border: "1px solid #fecaca",
//                 color: "#991b1b",
//               }}
//             >
//               ❌ {error}
//             </div>
//           )}
//         </>
//       )}

//       <UploadedFilesList files={uploadedFiles} />
//     </div>
//   );
// };

// export default UploadIngestion;


import React, { useState, useEffect } from "react";
import { fakeApi } from "./fakeApiService";

// UploadDropzone Component (same as before)
const UploadDropzone = ({ onFilesSelected, selectedFiles, onRemoveFile }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    onFilesSelected(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    onFilesSelected(files);
  };

  return (
    <div
      style={{
        border: `2px dashed ${isDragging ? "#2563eb" : "#d1d5db"}`,
        borderRadius: 12,
        padding: 40,
        textAlign: "center",
        background: isDragging ? "#f0f9ff" : "#f9fafb",
        transition: "all 0.2s ease",
        marginBottom: 20,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
      <p
        style={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 8,
          color: "#374151",
        }}
      >
        Drop files here or click to browse
      </p>
      <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20 }}>
        Supports PDF, DOC, DOCX, TXT files
      </p>

      <input
        type="file"
        multiple
        onChange={handleFileInput}
        style={{ display: "none" }}
        id="file-input"
      />
      <label
        htmlFor="file-input"
        style={{
          display: "inline-block",
          padding: "10px 20px",
          background: "#2563eb",
          color: "white",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Choose Files
      </label>

      {selectedFiles.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h4 style={{ margin: "16px 0 8px 0", color: "#374151" }}>
            Selected Files:
          </h4>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 14 }}>{file.name}</span>
              <button
                onClick={() => onRemoveFile(index)}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  padding: "4px 8px",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// FileMetadataForm Component (same as before)
const FileMetadataForm = ({ metadata, onMetadataChange }) => {
  const handleChange = (field, value) => {
    onMetadataChange({
      ...metadata,
      [field]: value,
    });
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: 20,
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        marginBottom: 20,
      }}
    >
      <h3 style={{ margin: "0 0 16px 0", color: "#374151" }}>
        Document Metadata
      </h3>

      <div style={{ display: "grid", gap: 16 }}>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              fontWeight: 500,
              color: "#374151",
            }}
          >
            Title *
          </label>
          <input
            type="text"
            value={metadata.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: 14,
            }}
            placeholder="Enter document title"
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              fontWeight: 500,
              color: "#374151",
            }}
          >
            Subject
          </label>
          <input
            type="text"
            value={metadata.subject || ""}
            onChange={(e) => handleChange("subject", e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: 14,
            }}
            placeholder="Enter subject"
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              fontWeight: 500,
              color: "#374151",
            }}
          >
            Tags
          </label>
          <input
            type="text"
            value={metadata.tags || ""}
            onChange={(e) => handleChange("tags", e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: 14,
            }}
            placeholder="Comma-separated tags (e.g., research, notes, important)"
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              fontWeight: 500,
              color: "#374151",
            }}
          >
            Description
          </label>
          <textarea
            value={metadata.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: 14,
              resize: "vertical",
            }}
            placeholder="Enter document description"
          />
        </div>
      </div>
    </div>
  );
};

// IngestionProgress Component
const IngestionProgress = ({
  currentStep,
  progress,
  steps,
  currentDocument,
}) => {
  return (
    <div
      style={{
        background: "#fff",
        padding: 20,
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        marginBottom: 20,
      }}
    >
      <h3 style={{ margin: "0 0 16px 0", color: "#374151" }}>
        Processing: {currentDocument?.filename}
      </h3>

      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div
          style={{
            flex: 1,
            height: 8,
            background: "#f3f4f6",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "#2563eb",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <span
          style={{
            marginLeft: 12,
            fontSize: 14,
            fontWeight: 600,
            color: "#374151",
          }}
        >
          {progress}%
        </span>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {steps.map((step, index) => {
          const isCompleted =
            index < steps.findIndex((s) => s.name === currentStep);
          const isCurrent = currentStep === step.name;

          return (
            <div
              key={step.name}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 12px",
                background: isCurrent ? "#f0f9ff" : "transparent",
                border: isCurrent
                  ? "1px solid #2563eb"
                  : "1px solid transparent",
                borderRadius: 6,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: isCurrent
                    ? "#2563eb"
                    : isCompleted
                    ? "#10b981"
                    : "#d1d5db",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                  fontSize: 12,
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {isCompleted ? "✓" : index + 1}
              </div>
              <span
                style={{
                  fontSize: 14,
                  color: isCurrent
                    ? "#2563eb"
                    : isCompleted
                    ? "#10b981"
                    : "#6b7280",
                  fontWeight: isCurrent ? 600 : 400,
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// UploadedFilesList Component
const UploadedFilesList = ({ files, onDeleteDocument, onRefresh }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      uploaded: { color: "#3b82f6", bgColor: "#dbeafe", label: "Uploaded" },
      processing: { color: "#f59e0b", bgColor: "#fef3c7", label: "Processing" },
      processed: { color: "#10b981", bgColor: "#d1fae5", label: "Processed" },
      error: { color: "#ef4444", bgColor: "#fee2e2", label: "Error" },
    };

    const config = statusConfig[status] || statusConfig.uploaded;

    return (
      <span
        style={{
          padding: "4px 8px",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 600,
          background: config.bgColor,
          color: config.color,
        }}
      >
        {config.label}
      </span>
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: 20,
        borderRadius: 12,
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h3 style={{ margin: 0, color: "#374151" }}>Uploaded Documents</h3>
        <button
          onClick={onRefresh}
          style={{
            padding: "6px 12px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Refresh
        </button>
      </div>

      {files.length === 0 ? (
        <p
          style={{
            color: "#6b7280",
            fontStyle: "italic",
            textAlign: "center",
            padding: 20,
          }}
        >
          No documents uploaded yet
        </p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {files.map((file, index) => (
            <div
              key={file.id}
              style={{
                padding: 16,
                background: "#f9fafb",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      {file.metadata?.title || file.filename}
                    </span>
                    {getStatusBadge(file.status)}
                  </div>

                  <div
                    style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}
                  >
                    <strong>File:</strong> {file.filename} •{" "}
                    {formatFileSize(file.size)}
                  </div>

                  {file.metadata && (
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {file.metadata.subject && (
                        <span>
                          <strong>Subject:</strong> {file.metadata.subject} •{" "}
                        </span>
                      )}
                      {file.metadata.tags && (
                        <span>
                          <strong>Tags:</strong> {file.metadata.tags} •{" "}
                        </span>
                      )}
                      {file.chunks > 0 && (
                        <span>
                          <strong>Chunks:</strong> {file.chunks} •{" "}
                        </span>
                      )}
                      {file.toc_entries > 0 && (
                        <span>
                          <strong>TOC Entries:</strong> {file.toc_entries}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onDeleteDocument(file.id)}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    padding: "4px 8px",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>

              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
                Uploaded: {new Date(file.uploadedAt).toLocaleString()}
                {file.processingLogs &&
                  ` • Last step: ${
                    file.processingLogs[file.processingLogs.length - 1]?.step
                  }`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Component
const UploadIngestion = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState("idle");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState("");
  const [metadata, setMetadata] = useState({
    title: "",
    subject: "",
    tags: "",
    description: "",
  });
  const [ingestionProgress, setIngestionProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [currentDocument, setCurrentDocument] = useState(null);
  const [loading, setLoading] = useState(false);

  const ingestionSteps = [
    { name: "uploading", label: "Uploading file..." },
    { name: "extracting", label: "Extracting text..." },
    { name: "chunking", label: "Creating chunks..." },
    { name: "embedding", label: "Embedding to Qdrant..." },
    { name: "indexing", label: "Creating TOC entries..." },
    { name: "complete", label: "Processing complete!" },
  ];

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await fakeApi.getDocuments();
      setUploadedFiles(response.documents);
    } catch (err) {
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleFilesSelected = (files) => {
    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();
      const isValidType =
        fakeApi.db.settings.supportedFormats.includes(fileExtension);
      const isValidSize = file.size <= fakeApi.db.settings.maxFileSize;

      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError("Some files were skipped due to invalid type or size (>10MB)");
    }

    setSelectedFiles(validFiles);
    setError("");
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      setError("Please select one or more files to upload.");
      return;
    }

    if (!metadata.title.trim()) {
      setError("Please provide a title for the document.");
      return;
    }

    setStatus("uploading");
    setUploadProgress(0);
    setIngestionProgress(0);
    setCurrentStep("uploading");
    setError("");

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));
      formData.append("metadata", JSON.stringify(metadata));

      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(uploadInterval);
            return 100;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      const response = await fakeApi.uploadFiles(formData);

      clearInterval(uploadInterval);
      setUploadProgress(100);

      // Set current document for progress tracking
      if (response.files.length > 0) {
        setCurrentDocument(response.files[0]);

        // Listen for ingestion progress
        fakeApi.onIngestionProgress(response.files[0].id, (progress) => {
          setCurrentStep(progress.step);
          setIngestionProgress(progress.progress);

          // Refresh documents list when complete
          if (progress.step === "complete") {
            setTimeout(() => {
              loadDocuments();
              setStatus("success");
              setCurrentDocument(null);
            }, 1000);
          }
        });
      }

      // Refresh documents list to show new upload
      await loadDocuments();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed.");
      setStatus("error");
      setIngestionProgress(0);
      setCurrentStep("");
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await fakeApi.deleteDocument(documentId);
        await loadDocuments();
      } catch (err) {
        setError("Failed to delete document");
      }
    }
  };

  return (
    <div
      style={{
        fontFamily: "system-ui, Arial, sans-serif",
        padding: 20,
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: 32,
          marginBottom: 24,
          color: "#1f2937",
          textAlign: "center",
        }}
      >
        📤 Document Upload & Ingestion
      </h1>

      <UploadDropzone
        onFilesSelected={handleFilesSelected}
        selectedFiles={selectedFiles}
        onRemoveFile={handleRemoveFile}
      />

      {selectedFiles.length > 0 && (
        <>
          <FileMetadataForm
            metadata={metadata}
            onMetadataChange={setMetadata}
          />

          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <button
              onClick={handleUpload}
              disabled={status === "uploading"}
              style={{
                flex: 1,
                padding: "12px 16px",
                background: status === "uploading" ? "#9ca3af" : "#2563eb",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: status === "uploading" ? "default" : "pointer",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {status === "uploading"
                ? "Uploading…"
                : "Start Upload & Processing"}
            </button>

            <button
              onClick={() => {
                setSelectedFiles([]);
                setError("");
                setStatus("idle");
                setMetadata({
                  title: "",
                  subject: "",
                  tags: "",
                  description: "",
                });
              }}
              style={{
                padding: "12px 16px",
                background: "#e5e7eb",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Clear All
            </button>
          </div>

          {status === "uploading" && (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ marginBottom: 8 }}>
                  <strong>Upload Progress:</strong> {Math.round(uploadProgress)}
                  %
                </div>
                <div
                  style={{
                    height: 8,
                    background: "#f3f4f6",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${uploadProgress}%`,
                      background: "#2563eb",
                      transition: "width 200ms linear",
                    }}
                  />
                </div>
              </div>

              {currentDocument && (
                <IngestionProgress
                  currentStep={currentStep}
                  progress={ingestionProgress}
                  steps={ingestionSteps}
                  currentDocument={currentDocument}
                />
              )}
            </>
          )}

          {status === "success" && (
            <div
              style={{
                marginBottom: 20,
                padding: 16,
                borderRadius: 8,
                background: "#ecfdf5",
                border: "1px solid #bbf7d0",
                color: "#065f46",
                textAlign: "center",
              }}
            >
              ✅ Upload and processing completed successfully!
            </div>
          )}

          {status === "error" && (
            <div
              style={{
                marginBottom: 20,
                padding: 16,
                borderRadius: 8,
                background: "#fff1f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
              }}
            >
              ❌ {error}
            </div>
          )}
        </>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 20, color: "#6b7280" }}>
          Loading documents...
        </div>
      ) : (
        <UploadedFilesList
          files={uploadedFiles}
          onDeleteDocument={handleDeleteDocument}
          onRefresh={loadDocuments}
        />
      )}
    </div>
  );
};

export default UploadIngestion;