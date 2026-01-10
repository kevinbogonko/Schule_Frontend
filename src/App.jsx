import React from "react";
import "./App.css";
import { ToastProvider } from "./components/ui/Toast";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/LoginPage";
import ForgotPasswordOTP from "./components/blocks/Auth/ForgotPasswordOTP";
import VerifyResetOTP from "./components/blocks/Auth/VerifyResetOTP";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./components/context/AuthContext";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import GenerateTT from "./components/blocks/TT/GenerateTT"
import TimeTableSubjects from "./components/blocks/TT/TimeTableSubjects";
import DayClusters from "./components/blocks/TT/DayClusters";
import TimeSlots from "./components/blocks/TT/TimeSlots";
import OptimizeTT from "./components/blocks/TT/OptimizeTT";
import TTPDFReport from "./components/blocks/TT/TTPDFReport";

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
                <LoadingSpinner />     {" "}
      </div>
    );
  }

  return (
    // <TTPDFReport />
    // <TimeSlots />
    // <GenerateTT />
    // <OptimizeTT />
    // <TimeTableSubjects />
    // <DayClusters />
    <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPasswordOTP />} />
            <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />     {" "}
      {/* Protected Routes */}     {" "}
      <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />     {" "}
      </Route>
            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />   {" "}
    </Routes>
  );
}

function App() {
  return (
    <ToastProvider>
           {" "}
      <Router>
               {" "}
        <AuthProvider>
                    <AppRoutes />       {" "}
        </AuthProvider>
             {" "}
      </Router>
         {" "}
    </ToastProvider>
  );
}

export default App;



// import { useEffect, useState } from "react";
// import { PDFDocument, rgb } from "pdf-lib";
// import PdfViewer from "./components/blocks/PdfViewer";

// function App() {
//   const [pdfUrl, setPdfUrl] = useState(null);

//   useEffect(() => {
//     const createPdf = async () => {
//       const pdfDoc = await PDFDocument.create();
//       const page = pdfDoc.addPage([400, 600]);
//       const { width, height } = page.getSize();

//       page.drawText("Hello, world!", {
//         x: 50,
//         y: height - 100,
//         size: 30,
//         color: rgb(0, 0.53, 0.71),
//       });

//       const pdfBytes = await pdfDoc.save();
//       const blob = new Blob([pdfBytes], { type: "application/pdf" });
//       const blobUrl = URL.createObjectURL(blob);

//       setPdfUrl(blobUrl);
//     };

//     createPdf();
//   }, []);

//   return (
//     <div>
//       <h2>Generated PDF Viewer</h2>
//       {pdfUrl ? <PdfViewer pdfBlobUrl={pdfUrl} /> : <p>Creating PDF...</p>}
//     </div>
//   );
// }

// export default App;
