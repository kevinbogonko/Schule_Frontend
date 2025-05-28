import React, { useState, useEffect } from "react";
import ReusableDiv from "../ReusableDiv";
import Checkbox from "../Checkbox";
import { formOptions } from "../../utils/CommonData";
import { useToast } from "../Toast";
import api from "../../hooks/api";
import Button from "../ui/raw/Button";
import {
  FaUndo,
  FaSave,
  FaCheckSquare,
  FaSquare,
} from "react-icons/fa";
import {
  FaUsersGear,
  FaSpinner
} from "react-icons/fa6";
import ReusableSelect from "../ReusableSelect";

const Subject = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedForm, setSelectedForm] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [initialCheckedState, setInitialCheckedState] = useState({});
  const [checkedState, setCheckedState] = useState({});
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [allChecked, setAllChecked] = useState(false);

  const handleFormChange = async (e) => {
    const form = e.target.value;
    setSelectedForm(form);
    setShowLoadingOverlay(true);

    try {
      const response = await api.post("/subject/getallsubjects", { form });
      const subjectsData = response.data;

      setSubjects(subjectsData);

      // Initialize checked state
      const initialChecks = {};
      const currentChecks = {};
      let allSelected = true;

      subjectsData.forEach((subject) => {
        initialChecks[subject.id] = subject.status === 1;
        currentChecks[subject.id] = subject.status === 1;
        if (subject.status !== 1) allSelected = false;
      });

      setInitialCheckedState(initialChecks);
      setCheckedState(currentChecks);
      setAllChecked(allSelected);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to fetch subjects",
        "error", {duration : 3000, position : 'top-right'}
      );
    } finally {
      setShowLoadingOverlay(false);
    }
  };

  const handleCheckboxChange = (subjectId) => {
    const newState = {
      ...checkedState,
      [subjectId]: !checkedState[subjectId],
    };
    setCheckedState(newState);

    // Update allChecked state
    const allCheckedNow = Object.values(newState).every((val) => val);
    setAllChecked(allCheckedNow);
  };

  const handleToggleAll = () => {
    const newChecked = !allChecked;
    const newState = {};

    subjects.forEach((subject) => {
      newState[subject.id] = newChecked;
    });

    setCheckedState(newState);
    setAllChecked(newChecked);
  };

  const handleReset = () => {
    setCheckedState({ ...initialCheckedState });
    setAllChecked(Object.values(initialCheckedState).every((val) => val));
  };

  const handleUpdate = async () => {
    if (!selectedForm) {
      showToast("Please select a form first", "error", {
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare update payload
      const updates = subjects.map((subject) => ({
        id: parseInt(subject.id),
        status: checkedState[subject.id] ? 1 : 0,
      }));

      // Send batch update to backend
      await api.post("/subject/updatesubjects", {
        form: selectedForm,
        updates,
      });

      // Update initial state to current state since update was successful
      setInitialCheckedState({ ...checkedState });

      showToast("Subjects updated successfully", "success", {
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update subjects",
        "error",
        { duration: 3000, position: "top-right" }
      );
      // Revert to last known good state
      setCheckedState({ ...initialCheckedState });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-0 md:p-0">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-500">
          Manage Subjects
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
            tag="Select Form"
            icon={FaUsersGear}
          >
            <div className="w-full">
              <label
                htmlFor="form"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Form
              </label>
              <ReusableSelect
                id="form"
                placeholder="Select Form"
                options={formOptions}
                value={selectedForm}
                onChange={handleFormChange}
                className="w-full"
              />
            </div>
          </ReusableDiv>
        </div>

        {selectedForm && (
          <div className="w-full md:w-3/4">
            <ReusableDiv
              className="ml-0 mr-0 ring-1 h-fit bg-blue-100 dark:bg-gray-800"
              tag={`Form ${selectedForm} Subjects`}
              collapsible={true}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center pl-0 pr-2 border-b border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    onClick={handleToggleAll}
                    className="flex items-center space-x-0 text-sm"
                  >
                    {allChecked ? (
                      <FaCheckSquare className="text-blue-500 h-5 w-5" />
                    ) : (
                      <FaSquare className="text-gray-400 h-5 w-5" />
                    )}
                    <span className="dark:text-gray-300">
                      {allChecked ? "Uncheck All" : "Check All"}
                    </span>
                  </Button>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {Object.values(checkedState).filter(Boolean).length} of{" "}
                    {subjects.length} selected
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                  {subjects.length > 0 ? (
                    subjects.map((subject) => (
                      <Checkbox
                        key={subject.id}
                        id={`subject-${subject.id}`}
                        label={`${subject.id} - ${subject.name}`}
                        checked={checkedState[subject.id] || false}
                        onChange={() => handleCheckboxChange(subject.id)}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition-colors"
                        labelClassName="dark:text-gray-300"
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No subjects found for this form
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="secondary"
                    icon={FaUndo}
                    onClick={handleReset}
                    disabled={!selectedForm || subjects.length === 0}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="primary"
                    icon={FaSave}
                    onClick={handleUpdate}
                    disabled={!selectedForm || subjects.length === 0}
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

export default Subject;
