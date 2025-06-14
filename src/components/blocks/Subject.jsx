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
  FaSearch,
} from "react-icons/fa";
import { FaUsersGear, FaSpinner } from "react-icons/fa6";
import ReusableSelect from "../ReusableSelect";

const Subject = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedForm, setSelectedForm] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [initialCheckedState, setInitialCheckedState] = useState({});
  const [initialSelectiveState, setInitialSelectiveState] = useState({});
  const [checkedState, setCheckedState] = useState({});
  const [selectiveState, setSelectiveState] = useState({});
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [allChecked, setAllChecked] = useState(false);
  const [allSelectiveChecked, setAllSelectiveChecked] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleFormChange = async (e) => {
    const form = e.target.value;
    setSelectedForm(form);
    setShowLoadingOverlay(true);
    setSearchTerm("");

    try {
      const response = await api.post("/subject/getallsubjects", { form });
      const subjectsData = response.data;

      setSubjects(subjectsData);
      setFilteredSubjects(subjectsData);

      const initialChecks = {};
      const initialSelectiveChecks = {};
      const currentChecks = {};
      const currentSelectiveChecks = {};
      let allSelected = true;
      let allSelectiveSelected = true;

      subjectsData.forEach((subject) => {
        initialChecks[subject.id] = subject.status === 1;
        initialSelectiveChecks[subject.id] = subject.isselective === 1;
        currentChecks[subject.id] = subject.status === 1;
        currentSelectiveChecks[subject.id] = subject.isselective === 1;
        if (subject.status !== 1) allSelected = false;
        if (subject.isselective !== 1) allSelectiveSelected = false;
      });

      setInitialCheckedState(initialChecks);
      setInitialSelectiveState(initialSelectiveChecks);
      setCheckedState(currentChecks);
      setSelectiveState(currentSelectiveChecks);
      setAllChecked(allSelected);
      setAllSelectiveChecked(allSelectiveSelected);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to fetch subjects",
        "error",
        { duration: 3000, position: "top-right" }
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
    const allCheckedNow = Object.values(newState).every((val) => val);
    setAllChecked(allCheckedNow);
  };

  const handleSelectiveCheckboxChange = (subjectId) => {
    const newState = {
      ...selectiveState,
      [subjectId]: !selectiveState[subjectId],
    };
    setSelectiveState(newState);
    const allSelectiveCheckedNow = Object.values(newState).every((val) => val);
    setAllSelectiveChecked(allSelectiveCheckedNow);
  };

  const handleToggleAll = () => {
    const newChecked = !allChecked;
    const newState = {};

    filteredSubjects.forEach((subject) => {
      newState[subject.id] = newChecked;
    });

    setCheckedState(newState);
    setAllChecked(newChecked);
  };

  const handleToggleAllSelective = () => {
    const newChecked = !allSelectiveChecked;
    const newState = {};

    filteredSubjects.forEach((subject) => {
      newState[subject.id] = newChecked;
    });

    setSelectiveState(newState);
    setAllSelectiveChecked(newChecked);
  };

  const handleReset = () => {
    setCheckedState({ ...initialCheckedState });
    setSelectiveState({ ...initialSelectiveState });
    setAllChecked(Object.values(initialCheckedState).every((val) => val));
    setAllSelectiveChecked(
      Object.values(initialSelectiveState).every((val) => val)
    );
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
      const updates = filteredSubjects.map((subject) => ({
        id: parseInt(subject.id),
        status: checkedState[subject.id] ? 1 : 0,
        isSelective: selectiveState[subject.id] ? 1 : 0,
      }));

      await api.post("/subject/updatesubjects", {
        form: selectedForm,
        updates,
      });

      // Update initial states with current states
      const newInitialCheckedState = { ...checkedState };
      const newInitialSelectiveState = { ...selectiveState };

      setInitialCheckedState(newInitialCheckedState);
      setInitialSelectiveState(newInitialSelectiveState);

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
      setSelectiveState({ ...initialSelectiveState });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === "") {
      setFilteredSubjects(subjects);
    } else {
      const filtered = subjects.filter(
        (subject) =>
          subject.name.toLowerCase().includes(term) ||
          subject.id.toString().includes(term)
      );
      setFilteredSubjects(filtered);
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
                <div className="relative w-full pl-0 pr-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search subjects by name or ID..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white sm:text-sm transition duration-150 ease-in-out"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>

                <div className="flex flex-col pl-0 pr-2 border-b border-gray-200 dark:border-gray-700 pb-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {Object.values(checkedState).filter(Boolean).length} of{" "}
                    {filteredSubjects.length} selected
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-8 flex items-center">
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
                          Toggle All Subjects
                        </span>
                      </Button>
                    </div>
                    <div className="col-span-4 flex justify-end items-center">
                      <Button
                        variant="ghost"
                        onClick={handleToggleAllSelective}
                        className="flex items-center space-x-2 text-sm px-0"
                      >
                        {allSelectiveChecked ? (
                          <FaCheckSquare className="text-blue-500 h-5 w-5" />
                        ) : (
                          <FaSquare className="text-gray-400 h-5 w-5" />
                        )}
                        <span className="dark:text-gray-300 text-sm">
                          Selective
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                  {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((subject) => (
                      <div
                        key={subject.id}
                        className="grid grid-cols-12 gap-2 items-center p-2 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <div className="col-span-8">
                          <Checkbox
                            id={`subject-${subject.id}`}
                            label={`${subject.id} - ${subject.name}`}
                            checked={checkedState[subject.id] || false}
                            onChange={() => handleCheckboxChange(subject.id)}
                            labelClassName="dark:text-gray-300"
                          />
                        </div>
                        <div className="col-span-4 flex justify-end">
                          <Checkbox
                            id={`selective-${subject.id}`}
                            label="Selective"
                            checked={selectiveState[subject.id] || false}
                            onChange={() =>
                              handleSelectiveCheckboxChange(subject.id)
                            }
                            labelClassName="dark:text-gray-300 text-sm"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      {searchTerm
                        ? "No matching subjects found"
                        : "No subjects found for this form"}
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="secondary"
                    icon={FaUndo}
                    onClick={handleReset}
                    disabled={!selectedForm || filteredSubjects.length === 0}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="primary"
                    icon={FaSave}
                    onClick={handleUpdate}
                    disabled={!selectedForm || filteredSubjects.length === 0}
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
