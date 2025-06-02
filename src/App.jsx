import React, { useState } from "react";
import "./App.css";
import Badge from "./components/Badge";
import AddMark from "./components/blocks/AddMark";
import GradingScale from "./components/blocks/Grading";
import Marklist from "./components/blocks/Marklist";
import Student from "./components/blocks/Student";
import StudentReport from "./components/blocks/StudentReport";
import Dropdown from "./components/Dropdown";
import { ToastProvider } from "./components/Toast";
import Report from "./components/blocks/Report";
import Staff from "./components/blocks/Staff";
import SubjectTeacher from "./components/blocks/SubjectTeacher";
import ClassTeacher from "./components/blocks/ClassTeacher";
import Stream from "./components/blocks/Stream";
import Remark from "./components/blocks/Remark";
import ResultSMS from "./components/blocks/ResultSMS";
import GenerateTT from "./components/blocks/GenerateTT";
import TimetableDnD from "./components/blocks/TimeTableDnD";
import COSMS from "./components/blocks/COSMS";
import Dashboard from "./components/blocks/Dashboard";
import ImageUploader from "./components/snippets/ImageUploader";
import StudentPhotos from "./components/blocks/StudentPhotos";
import StaffPhotos from "./components/blocks/StaffPhotos"
import Login from "./components/blocks/Login";
import Particulars from "./components/blocks/Particulars";
import Marksheet from "./components/blocks/Marksheet";
import Marklist2 from "./components/blocks/Marklist2";
import MarklistPDFReport from "./components/blocks/MarklistPDFReport";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentInfo from "./components/blocks/StudentInfo";
import StudentAttemptedExams from "./components/blocks/StudentAttemptedExams";
import StaffInfo from "./components/blocks/StaffInfo";
import GlobalStream from "./components/blocks/GlobalStream";
import AddMark2 from "./components/blocks/AddMarkTeacher";
import AddMarkTeacher from "./components/blocks/AddMarkTeacher";
import Subject from "./components/blocks/Subject";
import Promotion from "./components/blocks/Promotion";
import Users from "./components/blocks/Users";
import HomeDash from "./components/blocks/HomeDash";


function App() {

  return (
    <ToastProvider>
      <>
        {/* <StudentReport /> */}
        {/* <ResultSMS /> */}
        {/* <Student /> */}
        {/* <StudentPhotos /> */}
        {/* <Stream /> */}
        {/* <Staff /> */}
        {/* <StaffPhotos /> */}
        {/* <SubjectTeacher /> */}
        {/* <ClassTeacher/> */}
        {/* <AddMark /> */}
        {/* <GradingScale /> */}
        {/* <MarklistPDFReport /> */}
        {/* <Marklist /> */}
        {/* <Marklist2 /> */}
        {/* <Marksheet /> */}
        {/* <Report /> */}
        {/* <Remark /> */}
        {/* <GenerateTT /> */}
        {/* <COSMS /> */}
        {/* <Particulars /> */}
        {/* <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes> */}
        {/* <Dashboard /> */}
        {/* <StudentInfo /> */}
        {/* <StudentAttemptedExams /> */}
        {/* <StaffInfo /> */}
        {/* <GlobalStream /> */}
        {/* <AddMarkTeacher /> */}
        {/* <Subject /> */}
        {/* <Promotion /> */}
        {/* <Users /> */}
        {/* <HomeDash /> */}

        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AuthProvider>
        </Router>
      </>
    </ToastProvider>
  );
}

export default App;