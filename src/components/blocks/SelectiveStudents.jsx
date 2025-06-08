import React, { useState, useEffect } from "react";
import ReusableDiv from "../ReusableDiv";
import Checkbox from "../Checkbox";
import { formOptions, yearOptions } from "../../utils/CommonData";
import { useToast } from "../Toast";
import api from "../../hooks/api";
import Button from "../ui/raw/Button";
import {
  FaUndo,
  FaSave,
  FaCheckSquare,
  FaSquare,
  FaSearch,
} from "react-icons/fa";
import { FaUsersGear, FaSpinner } from "react-icons/fa6";
import ReusableSelect from "../ReusableSelect";

const SelectiveStudents = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedForm, setSelectedForm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedStream, setSelectedStream] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [entireForm, setEntireForm] = useState(false);
  const [streamOptions, setStreamOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [refinedStudents, setRefinedStudents] = useState([]);
  const [initialCheckedState, setInitialCheckedState] = useState({});
  const [checkedState, setCheckedState] = useState({});
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [allChecked, setAllChecked] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setSelectedForm("");
    setSelectedStream("");
    setSelectedSubject("");
    setStreamOptions([]);
    setSubjectOptions([]);
    setRefinedStudents([]);
  };

  const handleFormChange = async (e) => {
    const form = e.target.value;
    setSelectedForm(form);
    setSelectedStream("");
    setSelectedSubject("");
    setRefinedStudents([]);
    setShowLoadingOverlay(true);

    try {
      // Fetch selective subjects
      const subjectsResponse = await api.post("/subject/selectivesubjects", {
        form: form,
      });
      const formattedSubjects = subjectsResponse.data.map((subject) => ({
        value: subject.id,
        label: `${subject.id} - ${subject.name}`,
      }));
      setSubjectOptions(formattedSubjects);

      // Fetch streams
      const streamsResponse = await api.post("/stream/getstreams", {
        form: form,
        year: selectedYear,
      });
      const formattedStreams = streamsResponse.data.map((stream) => ({
        value: stream.stream_id,
        label: stream.stream_name,
      }));
      setStreamOptions(formattedStreams);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to fetch data",
        "error",
        { duration: 3000, position: "top-right" }
      );
    } finally {
      setShowLoadingOverlay(false);
    }
  };

  const handleStreamChange = async (e) => {
    const streamId = e.target.value;
    setSelectedStream(streamId);
    setShowLoadingOverlay(true);

    try {
      const response = await api.post("/subject/selectivestreamstudents", {
        year: selectedYear,
        form: selectedForm,
        stream_id: streamId,
        subject: selectedSubject,
      });

      const formattedStudents = response.data.map((student) => ({
        value: student.id,
        label: `${student.student_id} - ${student.name}`,
        status: student[selectedSubject] || 0,
      }));

      setRefinedStudents(formattedStudents);

      // Initialize checked state
      const initialChecks = {};
      const currentChecks = {};
      let allSelected = true;

      formattedStudents.forEach((student) => {
        initialChecks[student.value] = student.status === 1;
        currentChecks[student.value] = student.status === 1;
        if (student.status !== 1) allSelected = false;
      });

      setInitialCheckedState(initialChecks);
      setCheckedState(currentChecks);
      setAllChecked(allSelected);
    } catch (error) {
      setRefinedStudents([])
      showToast(
        error.response?.data?.message || "Failed to fetch students",
        "error",
        { duration: 3000, position: "top-right" }
      );
    } finally {
      setShowLoadingOverlay(false);
    }
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
    // setRefinedStudents([]);
    // setShowLoadingOverlay(true);
  };

  const handleEntireFormChange = async (e) => {
    const isChecked = e.target.checked;
    setEntireForm(isChecked);
    setSelectedStream("");

    if (isChecked && selectedForm && selectedSubject) {
      setShowLoadingOverlay(true);
      try {
        const response = await api.post("/subject/selectivestudents", {
          year: selectedYear,
          form: selectedForm,
          subject: selectedSubject,
        });

        const formattedStudents = response.data.map((student) => ({
          value: student.id,
          label: `${student.student_id} - ${student.name}`,
          status: student[selectedSubject] || 0,
        }));

        setRefinedStudents(formattedStudents);

        // Initialize checked state
        const initialChecks = {};
        const currentChecks = {};
        let allSelected = true;

        formattedStudents.forEach((student) => {
          initialChecks[student.value] = student.status === 1;
          currentChecks[student.value] = student.status === 1;
          if (student.status !== 1) allSelected = false;
        });

        setInitialCheckedState(initialChecks);
        setCheckedState(currentChecks);
        setAllChecked(allSelected);
      } catch (error) {
        setRefinedStudents([])
        showToast(
          error.response?.data?.message || "Failed to fetch students",
          "error",
          { duration: 3000, position: "top-right" }
        );
      } finally {
        setShowLoadingOverlay(false);
      }
    }
  };

  const handleCheckboxChange = (studentId) => {
    const newState = {
      ...checkedState,
      [studentId]: !checkedState[studentId],
    };
    setCheckedState(newState);
    const allCheckedNow = Object.values(newState).every((val) => val);
    setAllChecked(allCheckedNow);
  };

  const handleToggleAll = () => {
    const newChecked = !allChecked;
    const newState = {};

    refinedStudents.forEach((student) => {
      newState[student.value] = newChecked;
    });

    setCheckedState(newState);
    setAllChecked(newChecked);
  };

  const handleReset = () => {
    setCheckedState({ ...initialCheckedState });
    setAllChecked(Object.values(initialCheckedState).every((val) => val));
  };

  const handleUpdate = async () => {

    if (!selectedForm || !selectedYear || !selectedSubject) {
      showToast("Please select form, year and subject first", "error", {
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    setLoading(true);

    try {
      const updates = refinedStudents.map((student) => ({
        id: parseInt(student.value),
        [selectedSubject]: checkedState[student.value] ? 1 : 0,
      }));

      await api.post("/subject/updateselectivesubjects", {
        form: selectedForm,
        year: selectedYear,
        updates,
      });

      // Update initial state to current state
      setInitialCheckedState({ ...checkedState });

      showToast("Students updated successfully", "success", {
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update students",
        "error",
        { duration: 3000, position: "top-right" }
      );
      // Revert to last known good state
      setCheckedState({ ...initialCheckedState });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
  };

  const filteredStudents = refinedStudents.filter((student) =>
    student.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-0 md:p-0">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-500">
          Selective Subjects' Students
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {(showLoadingOverlay || loading) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg text-center max-w-xs md:max-w-sm">
              <FaSpinner className="animate-spin text-2xl md:text-3xl text-blue-500 mx-auto mb-3 md:mb-4" />
              <p className="text-base md:text-lg font-medium text-gray-700 dark:text-gray-300">
                {loading ? "Updating..." : "Loading..."}
              </p>
            </div>
          </div>
        )}

        <div className="w-full md:w-1/4">
          <ReusableDiv
            className="ml-0 mr-0 ring-1 h-fit bg-blue-100 dark:bg-gray-800 mb-2"
            tag="Selection Criteria"
            icon={FaUsersGear}
          >
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Year
              </label>
              <ReusableSelect
                placeholder="Select Year"
                options={yearOptions}
                value={selectedYear}
                onChange={handleYearChange}
                className="w-full"
              />
            </div>
            <div className="w-full mt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Form
              </label>
              <ReusableSelect
                placeholder="Select Form"
                options={formOptions}
                value={selectedForm}
                onChange={handleFormChange}
                className="w-full"
                disabled={!selectedYear}
              />
            </div>
            <div className="w-full mt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <ReusableSelect
                placeholder="Select Subject"
                options={subjectOptions}
                value={selectedSubject}
                onChange={handleSubjectChange}
                className="w-full"
                disabled={!selectedForm}
              />
            </div>
            <div className="w-full mt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stream
              </label>
              <ReusableSelect
                placeholder="Select Stream"
                options={streamOptions}
                value={selectedStream}
                onChange={handleStreamChange}
                className="w-full"
                disabled={!selectedForm || entireForm}
              />
            </div>
            <div className="mt-3">
              <Checkbox
                label="Entire Form"
                checked={entireForm}
                onChange={handleEntireFormChange}
                disabled={!selectedForm || streamOptions.length === 0}
              />
            </div>
          </ReusableDiv>
        </div>

        {selectedForm && selectedSubject && (
          <div className="w-full md:w-3/4">
            <ReusableDiv
              className="ml-0 mr-0 ring-1 h-fit bg-blue-100 dark:bg-gray-800"
              tag={`${subjectOptions.find((subject) => String(subject.value) === selectedSubject)?.label} - Form ${selectedForm}`}
              collapsible={true}
            >
              <div className="space-y-4">
                <div className="relative w-full pl-0 pr-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search students by name or ID..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white sm:text-sm transition duration-150 ease-in-out"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>

                <div className="flex flex-col pl-0 pr-2 border-b border-gray-200 dark:border-gray-700 pb-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {Object.values(checkedState).filter(Boolean).length} of{" "}
                    {refinedStudents.length} selected
                  </div>

                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      onClick={handleToggleAll}
                      className="flex items-center space-x-2 text-sm px-0"
                    >
                      {allChecked ? (
                        <FaCheckSquare className="text-blue-500 h-5 w-5" />
                      ) : (
                        <FaSquare className="text-gray-400 h-5 w-5" />
                      )}
                      <span className="dark:text-gray-300 text-sm">
                        Toggle All Students
                      </span>
                    </Button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <div
                        key={student.value}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <Checkbox
                          id={`student-${student.value}`}
                          label={student.label}
                          checked={checkedState[student.value] || false}
                          onChange={() => handleCheckboxChange(student.value)}
                          labelClassName="dark:text-gray-300"
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      {searchTerm
                        ? "No matching students found"
                        : "No students found for this selection"}
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="secondary"
                    icon={FaUndo}
                    onClick={handleReset}
                    disabled={refinedStudents.length === 0}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="primary"
                    icon={FaSave}
                    onClick={handleUpdate}
                    disabled={refinedStudents.length === 0}
                    loading={loading}
                  >
                    Update
                  </Button>
                </div>
              </div>
            </ReusableDiv>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectiveStudents;
