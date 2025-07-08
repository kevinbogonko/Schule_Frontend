import React, { useState } from "react";
import ReusableDiv from "../../ReusableDiv";
import { FaSpinner, FaSave, FaTrash, FaEdit } from "react-icons/fa";
import { yearOptions } from "../../../utils/CommonData";
import { useToast } from "../../Toast";
import api from "../../../hooks/api";
import { FaCodeMerge } from "react-icons/fa6";
import { GrDocumentConfig } from "react-icons/gr";
import Button from "../../ui/raw/Button";
import Dropdown from "../../Dropdown";
import ReusableInput from "../../ui/ReusableInput";
import MergeTTSubjects from "./MergeTTSubjects";

const TimeTableSubjects = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState({
    form1: false,
    form2: false,
    form3: false,
    form4: false,
  });
  const [selectedYear, setSelectedYear] = useState({
    form1: null,
    form2: null,
    form3: null,
    form4: null,
  });
  const [selectedTerm, setSelectedTerm] = useState({
    form1: null,
    form2: null,
    form3: null,
    form4: null,
  });
  const [selectedUtility, setSelectedUtility] = useState({
    form1: null,
    form2: null,
    form3: null,
    form4: null,
  });
  const [activeSubjects, setActiveSubjects] = useState({
    form1: [],
    form2: [],
    form3: [],
    form4: [],
  });
  const [currentPage, setCurrentPage] = useState({
    form1: 1,
    form2: 1,
    form3: 1,
    form4: 1,
  });
  const [lastSaved, setLastSaved] = useState({
    form1: null,
    form2: null,
    form3: null,
    form4: null,
  });

  const [modalState, setModalState] = useState({
    mergeSubject: false,
    currentForm: null,
    editMode: false,
    subjectToEdit: null,
  });

  const [preconfiguredSubjects, setPreconfiguredSubjects] = useState([]);
  const [availableLessonOptions, setAvailableLessonOptions] = useState({
    form1: [
      { value: 700, label: "LIFE SKILLS", init: "LSK" },
      { value: 800, label: "LIBRARY", init: "LIB" },
      { value: 900, label: "PASTORAL PI", init: "PPI" },
      { value: 600, label: "PHYSICAL ED.", init: "P.E" },
    ],
    form2: [
      { value: 700, label: "LIFE SKILLS", init: "LSK" },
      { value: 800, label: "LIBRARY", init: "LIB" },
      { value: 900, label: "PASTORAL PI", init: "PPI" },
      { value: 600, label: "PHYSICAL ED.", init: "P.E" },
    ],
    form3: [
      { value: 700, label: "LIFE SKILLS", init: "LSK" },
      { value: 800, label: "LIBRARY", init: "LIB" },
      { value: 900, label: "PASTORAL PI", init: "PPI" },
      { value: 600, label: "PHYSICAL ED.", init: "P.E" },
    ],
    form4: [
      { value: 700, label: "LIFE SKILLS", init: "LSK" },
      { value: 800, label: "LIBRARY", init: "LIB" },
      { value: 900, label: "PASTORAL PI", init: "PPI" },
      { value: 600, label: "PHYSICAL ED.", init: "P.E" },
    ],
  });

  const termOptions = [
    { value: 1, label: "Term 1" },
    { value: 2, label: "Term 2" },
    { value: 3, label: "Term 3" },
  ];

  const utilityOptions = [
    { value: "d", label: "Day Schedule" },
    { value: "er", label: "Evening Remedial" },
    { value: "mr", label: "Morning Remedial" },
  ];

  const itemsPerPage = 10;

  const fetchSubjects = async (form) => {
    const year = selectedYear[`form${form}`];
    const term = selectedTerm[`form${form}`];
    const utility = selectedUtility[`form${form}`];

    if (!year || !term || !utility) return;

    try {
      setLoading((prev) => ({ ...prev, [`form${form}`]: true }));

      const response = await api.post("/timetable/getsubjconfig", {
        year: year,
        form: form,
        term: term,
        utility: utility,
      });

      const responseData = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      // Create a map to track merged subjects
      const mergedSubjectsMap = new Map();
      const individualSubjects = [];

      // First pass: identify all merged subjects and their components
      responseData.forEach((subject) => {
        if (subject.ismerged) {
          const mergeKey = subject.merged_with
            ? [subject.code, ...subject.merged_with.split(",")].sort().join(",")
            : subject.code.toString();

          if (!mergedSubjectsMap.has(mergeKey)) {
            mergedSubjectsMap.set(mergeKey, {
              id: `merged_${mergeKey}`,
              value: `merged_${mergeKey}`,
              label: subject.merge_alias || `Merged ${mergeKey}`,
              name: subject.merge_alias || `Merged ${mergeKey}`,
              init: subject.merge_alias || `M${mergeKey}`,
              alias: subject.merge_alias || `M${mergeKey}`,
              singles: subject.merge_singles || 0,
              doubles: subject.merge_doubles || 0,
              isCustom: subject.iscustom || false,
              isMerged: true,
              merged_with: subject.merged_with,
              merge_alias: subject.merge_alias,
              merge_singles: subject.merge_singles,
              merge_doubles: subject.merge_doubles,
              mergedSubjects: [],
              utility: subject.utility,
            });
          }

          // Add this subject to the merged group's components
          mergedSubjectsMap.get(mergeKey).mergedSubjects.push({
            id: subject.code || subject.id,
            value: subject.code || subject.id,
            label: subject.name,
            name: subject.name,
            init: subject.alias,
            alias: subject.alias,
            singles: subject.singles || 0,
            doubles: subject.doubles || 0,
            isCustom: subject.iscustom || false,
            isMerged: false,
            utility: subject.utility,
          });
        } else {
          // Add to individual subjects if not part of any merged group
          individualSubjects.push({
            id: subject.code || subject.id,
            value: subject.code || subject.id,
            label: subject.name,
            name: subject.name,
            init: subject.alias,
            alias: subject.alias,
            singles: subject.singles || 0,
            doubles: subject.doubles || 0,
            isCustom: subject.iscustom || false,
            isMerged: false,
            utility: subject.utility,
          });
        }
      });

      // Second pass: combine merged groups and individual subjects
      const formattedData = [
        ...Array.from(mergedSubjectsMap.values()),
        ...individualSubjects,
      ];

      setActiveSubjects((prev) => ({
        ...prev,
        [`form${form}`]: formattedData,
      }));
      setCurrentPage((prev) => ({ ...prev, [`form${form}`]: 1 }));
    } catch (err) {
      console.error(err);
      showToast(`Failed to fetch subjects for Form ${form}`, "error");
      setActiveSubjects((prev) => ({
        ...prev,
        [`form${form}`]: [],
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [`form${form}`]: false }));
    }
  };

  const handleFormYearChange = (selectedOption, form) => {
    setSelectedYear((prev) => ({
      ...prev,
      [`form${form}`]: selectedOption,
    }));
    setSelectedTerm((prev) => ({
      ...prev,
      [`form${form}`]: null,
    }));
    setSelectedUtility((prev) => ({
      ...prev,
      [`form${form}`]: null,
    }));
    setActiveSubjects((prev) => ({
      ...prev,
      [`form${form}`]: [],
    }));
  };

  const handleTermChange = (selectedOption, form) => {
    setSelectedTerm((prev) => ({
      ...prev,
      [`form${form}`]: selectedOption,
    }));
    setSelectedUtility((prev) => ({
      ...prev,
      [`form${form}`]: null,
    }));
    setActiveSubjects((prev) => ({
      ...prev,
      [`form${form}`]: [],
    }));
  };

  const handleUtilityChange = (selectedOption, form) => {
    setSelectedUtility((prev) => ({
      ...prev,
      [`form${form}`]: selectedOption,
    }));
    fetchSubjects(form);
  };

  const handleAddLesson = (form, selectedOption) => {
    if (!selectedOption) return;

    const formKey = `form${form}`;
    const selectedLesson = availableLessonOptions[formKey].find(
      (opt) => opt.value === selectedOption
    );
    if (!selectedLesson) return;

    const singles = [1, 2].includes(form) ? 1 : 2;
    const doubles = 0;

    const newLesson = {
      id: Date.now(),
      value: selectedLesson.value,
      label: selectedLesson.label,
      init: selectedLesson.init,
      singles: singles,
      doubles: doubles,
      isCustom: true,
      isMerged: false,
      utility: selectedUtility[formKey]?.value || "d",
    };

    setActiveSubjects((prev) => {
      const updatedSubjects = [...prev[formKey], newLesson];
      const totalPages = Math.ceil(updatedSubjects.length / itemsPerPage);
      setCurrentPage((p) => ({ ...p, [formKey]: totalPages }));
      return {
        ...prev,
        [formKey]: updatedSubjects,
      };
    });

    setAvailableLessonOptions((prev) => ({
      ...prev,
      [formKey]: prev[formKey].filter((opt) => opt.value !== selectedOption),
    }));
  };

  const handleInputChange = (form, index, field, value) => {
    setActiveSubjects((prev) => {
      const updatedSubjects = [...prev[`form${form}`]];
      updatedSubjects[index] = {
        ...updatedSubjects[index],
        [field]: value,
      };
      return {
        ...prev,
        [`form${form}`]: updatedSubjects,
      };
    });
  };

  const handleRemoveSubject = (form, index) => {
    const formKey = `form${form}`;
    const subjectToRemove = activeSubjects[formKey][index];

    setActiveSubjects((prev) => {
      const updatedSubjects = [...prev[formKey]];

      if (subjectToRemove.isMerged) {
        // Handle merged subject deletion - split into individual subjects
        const individualSubjects = (subjectToRemove.mergedSubjects || []).map(
          (sub) => ({
            ...sub,
            id: sub.id,
            value: sub.id,
            label: sub.label || sub.name,
            name: sub.name || sub.label,
            init: sub.init || sub.alias,
            alias: sub.alias,
            singles: sub.singles,
            doubles: sub.doubles,
            isCustom: true,
            isMerged: false,
            utility: sub.utility,
            canBeMerged: true, // Add flag to indicate these can be merged again
          })
        );

        updatedSubjects.splice(index, 1, ...individualSubjects);
      } else {
        // Handle regular subject deletion
        updatedSubjects.splice(index, 1);
      }

      const totalPages = Math.ceil(updatedSubjects.length / itemsPerPage);
      const currentPg = currentPage[formKey];
      if (currentPg > totalPages && totalPages > 0) {
        setCurrentPage((prev) => ({
          ...prev,
          [formKey]: totalPages,
        }));
      }

      return {
        ...prev,
        [formKey]: updatedSubjects,
      };
    });

    if (subjectToRemove?.isCustom && !subjectToRemove?.isMerged) {
      setAvailableLessonOptions((prev) => ({
        ...prev,
        [formKey]: [
          ...prev[formKey],
          {
            value: subjectToRemove.value,
            label: subjectToRemove.label,
            init: subjectToRemove.init,
          },
        ],
      }));
    }
  };

  const handleClearForm = (form) => {
    setActiveSubjects((prev) => ({
      ...prev,
      [`form${form}`]: prev[`form${form}`].map((subject) => ({
        ...subject,
        doubles: 0,
        singles: 0,
      })),
    }));
  };

  const handleSaveForm = async (form) => {
    try {
      setLoading((prev) => ({ ...prev, [`form${form}`]: true }));

      // Format the subjects data for API
      const formattedSubjects = activeSubjects[`form${form}`].map((subject) => {
        if (subject.isMerged) {
          return {
            code: subject.id.replace("merged_", ""),
            name: subject.label,
            alias: subject.alias,
            singles: subject.singles,
            doubles: subject.doubles,
            iscustom: subject.isCustom,
            ismerged: true,
            merged_with: subject.merged_with,
            merge_alias: subject.merge_alias,
            merge_singles: subject.merge_singles,
            merge_doubles: subject.merge_doubles,
            utility: subject.utility,
          };
        } else {
          return {
            code: subject.id,
            name: subject.label,
            alias: subject.alias,
            singles: subject.singles,
            doubles: subject.doubles,
            iscustom: subject.isCustom,
            ismerged: false,
            merged_with: null,
            merge_alias: null,
            merge_singles: null,
            merge_doubles: null,
            utility: subject.utility,
          };
        }
      });

      const payload = {
        year: selectedYear[`form${form}`],
        form: form,
        term: selectedTerm[`form${form}`],
        utility: selectedUtility[`form${form}`],
        subjects: formattedSubjects,
      };

      await api.post("/timetable/savesubjconfig", payload);

      setLastSaved((prev) => ({
        ...prev,
        [`form${form}`]: new Date().toLocaleString(),
      }));

      showToast(`Form ${form} subjects saved successfully`, "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to save subjects", "error");
    } finally {
      setLoading((prev) => ({ ...prev, [`form${form}`]: false }));
    }
  };

  const getPaginatedSubjects = (form) => {
    const startIndex = (currentPage[`form${form}`] - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return activeSubjects[`form${form}`]?.slice(startIndex, endIndex) || [];
  };

  const calculateTotals = (form) => {
    const subjects = activeSubjects[`form${form}`] || [];
    return {
      doubles: subjects.reduce((sum, sub) => sum + (sub.doubles || 0), 0),
      singles: subjects.reduce((sum, sub) => sum + (sub.singles || 0), 0),
      total: subjects.reduce(
        (sum, sub) => sum + (sub.singles || 0) + 2 * (sub.doubles || 0),
        0
      ),
    };
  };

  const isSaveDisabled = (form) => {
    const formKey = `form${form}`;
    const subjects = activeSubjects[formKey] || [];
    const totals = calculateTotals(form);

    const hasEmptyAlias = subjects.some(
      (subject) => !subject.init || subject.init.trim() === ""
    );

    const hasZeroTotal = totals.total <= 0;

    return (
      !selectedYear[formKey] ||
      !selectedTerm[formKey] ||
      !selectedUtility[formKey] ||
      hasEmptyAlias ||
      hasZeroTotal
    );
  };

  const handleMergeClick = (form, subjectToEdit = null) => {
    const currentSubjects = activeSubjects[`form${form}`] || [];

    let formattedSubjects = currentSubjects
      .filter((subject) => !subject.isMerged && subject.canBeMerged !== false) // Exclude already merged subjects and those marked as unmergeable
      .map((subject) => ({
        id: subject.id || subject.value,
        value: subject.id || subject.value,
        label: subject.label || subject.name,
        name: subject.name || subject.label,
        init: subject.init,
        alias: subject.alias,
        singles: subject.singles || 0,
        doubles: subject.doubles || 0,
        isCustom: subject.isCustom || false,
        isMerged: subject.isMerged || false,
        utility: subject.utility,
      }));

    if (subjectToEdit) {
      // If editing a merged subject, pre-populate with its components
      formattedSubjects = (subjectToEdit.mergedSubjects || []).map((sub) => ({
        id: sub.id,
        value: sub.id,
        label: sub.label || sub.name,
        name: sub.name || sub.label,
        init: sub.init || sub.alias,
        alias: sub.alias,
        singles: sub.singles,
        doubles: sub.doubles,
        isCustom: true,
        isMerged: false,
        utility: sub.utility,
      }));
    }

    setPreconfiguredSubjects(formattedSubjects);
    setModalState({
      mergeSubject: true,
      currentForm: form,
      editMode: !!subjectToEdit,
      subjectToEdit: subjectToEdit,
    });
  };

  const renderFormDiv = (form) => {
    const formKey = `form${form}`;
    const subjects = getPaginatedSubjects(form);
    const totalPages =
      Math.ceil(activeSubjects[formKey]?.length / itemsPerPage) || 1;
    const lastSavedTime = lastSaved[formKey]
      ? `Last saved: ${lastSaved[formKey]}`
      : "";
    const formLoading = loading[formKey];
    const totals = calculateTotals(form);
    const hasSubjects = activeSubjects[formKey]?.length > 0;
    const currentYear = selectedYear[formKey];
    const currentTerm = selectedTerm[formKey];
    const currentUtility = selectedUtility[formKey];

    return (
      <ReusableDiv
        key={`form-${form}-div`} // Changed key to avoid spread warning
        className="mb-4"
        tag={`Form ${form} Subjects: Configured ${
          activeSubjects[formKey]?.length || 0
        } ${lastSavedTime}`}
        icon={GrDocumentConfig}
        collapsible={true}
        defaultCollapsed={true}
      >
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-48">
              <Dropdown
                placeholder="Select Year"
                options={yearOptions}
                value={currentYear}
                onChange={(selected) => handleFormYearChange(selected, form)}
                className="w-full"
                clearable
              />
            </div>
            <div className="w-32">
              <Dropdown
                placeholder="Select Term"
                options={termOptions}
                value={currentTerm}
                onChange={(selected) => handleTermChange(selected, form)}
                className="w-full"
                clearable
                disabled={!currentYear}
              />
            </div>
            <div className="w-48">
              <Dropdown
                placeholder="Select Utility"
                options={utilityOptions}
                value={currentUtility}
                onChange={(selected) => handleUtilityChange(selected, form)}
                className="w-full"
                clearable
                disabled={!currentTerm}
              />
            </div>
          </div>
          {hasSubjects && (
            <div className="flex items-center gap-2">
              <Button
                key={`merge-btn-${form}`} // Added key prop directly
                onClick={() => handleMergeClick(form)}
                variant="primary"
                size="sm"
                className="whitespace-nowrap"
                icon={FaCodeMerge}
              >
                Merge
              </Button>
              {availableLessonOptions[formKey]?.length > 0 && (
                <Dropdown
                  key={`add-lesson-${form}`} // Added key prop directly
                  placeholder="Add Lesson"
                  options={availableLessonOptions[formKey]}
                  value={null}
                  onChange={(item) => {
                    handleAddLesson(form, item);
                  }}
                  className="w-48"
                  clearable
                />
              )}
            </div>
          )}
        </div>

        {hasSubjects ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      S/N
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Subject
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Singles
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Doubles
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Alias
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subjects.map((subject, index) => {
                    const globalIndex =
                      (currentPage[formKey] - 1) * itemsPerPage + index;
                    const subjectTotal =
                      (subject.singles || 0) + 2 * (subject.doubles || 0);
                    return (
                      <tr
                        key={`${form}-${subject.id || subject.value}-${index}`}
                      >
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {globalIndex + 1}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {subject.label || subject.name}
                          {subject.isMerged && (
                            <span className="ml-2 text-xs text-gray-500">
                              (Merged:{" "}
                              {subject.mergedSubjects
                                ?.map((s) => s.label || s.name)
                                .join(", ")}
                              )
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <ReusableInput
                            type="number"
                            value={subject.singles}
                            onChange={(e) =>
                              handleInputChange(
                                form,
                                globalIndex,
                                "singles",
                                parseInt(e.target.value) || 0
                              )
                            }
                            min={0}
                            max={10}
                            className="w-20"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <ReusableInput
                            type="number"
                            value={subject.doubles}
                            onChange={(e) =>
                              handleInputChange(
                                form,
                                globalIndex,
                                "doubles",
                                parseInt(e.target.value) || 0
                              )
                            }
                            min={0}
                            max={10}
                            className="w-20"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {subjectTotal}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <ReusableInput
                            type="text"
                            value={subject.init}
                            onChange={(e) =>
                              handleInputChange(
                                form,
                                globalIndex,
                                "init",
                                e.target.value
                              )
                            }
                            disabled={!subject.isCustom}
                            className="w-20"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                          {subject.isMerged ? (
                            <>
                              <Button
                                key={`edit-${subject.id}`} // Added key prop directly
                                onClick={() => handleMergeClick(form, subject)}
                                variant="icon"
                                size="sm"
                                className="text-blue-500 hover:text-blue-700"
                                title="Edit merged subject"
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                key={`delete-${subject.id}`} // Added key prop directly
                                onClick={() =>
                                  handleRemoveSubject(form, globalIndex)
                                }
                                variant="icon"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                title="Remove subject"
                              >
                                <FaTrash />
                              </Button>
                            </>
                          ) : subject.isCustom ? (
                            <Button
                              key={`delete-${subject.id}`} // Added key prop directly
                              onClick={() =>
                                handleRemoveSubject(form, globalIndex)
                              }
                              variant="icon"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              title="Remove subject"
                            >
                              <FaTrash />
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50 font-medium">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      Totals
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {activeSubjects[formKey]?.length} subjects
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {totals.singles}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {totals.doubles}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {totals.total}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap"></td>
                    <td className="px-4 py-2 whitespace-nowrap"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-4 gap-1">
                <Button
                  key={`prev-btn-${form}`} // Added key prop directly
                  onClick={() =>
                    setCurrentPage((prev) => ({
                      ...prev,
                      [formKey]: Math.max(prev[formKey] - 1, 1),
                    }))
                  }
                  disabled={currentPage[formKey] === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm text-gray-700">
                  Page {currentPage[formKey]} of {totalPages}
                </span>
                <Button
                  key={`next-btn-${form}`} // Added key prop directly
                  onClick={() =>
                    setCurrentPage((prev) => ({
                      ...prev,
                      [formKey]: Math.min(prev[formKey] + 1, totalPages),
                    }))
                  }
                  disabled={currentPage[formKey] === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}

            <div className="flex justify-end mt-4 gap-2">
              <Button
                key={`clear-btn-${form}`} // Added key prop directly
                onClick={() => handleClearForm(form)}
                variant="secondary"
                size="sm"
              >
                Clear
              </Button>
              <Button
                key={`save-btn-${form}`} // Added key prop directly
                onClick={() => handleSaveForm(form)}
                disabled={isSaveDisabled(form) || formLoading}
                variant="primary"
                size="sm"
                className="flex items-center gap-2"
              >
                {formLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSave />
                )}
                Save
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            {currentYear && currentTerm && currentUtility
              ? "No subjects found"
              : "Please select year, term and utility to load subjects"}
          </div>
        )}
      </ReusableDiv>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
        Timetable Subjects Configuration
      </h1>

      {[1, 2, 3, 4].map((form) => renderFormDiv(form))}
      {modalState.mergeSubject && (
        <MergeTTSubjects
          key="merge-subjects-modal" // Added key prop directly
          modalState={modalState.mergeSubject}
          setModalState={(state) =>
            setModalState((prev) => ({
              ...prev,
              mergeSubject: state,
            }))
          }
          setActiveSubjects={(subjects) => {
            if (modalState.currentForm) {
              setActiveSubjects((prev) => ({
                ...prev,
                [`form${modalState.currentForm}`]: subjects,
              }));
            }
          }}
          subjects={preconfiguredSubjects}
          currentForm={modalState.currentForm}
          streams={[
            { value: 1, label: "WEST" },
            { value: 2, label: "NORTH" },
            { value: 3, label: "EAST" },
            { value: 4, label: "SOUTH" },
          ]}
          editMode={modalState.editMode}
          subjectToEdit={modalState.subjectToEdit}
        />
      )}
    </div>
  );
};

export default TimeTableSubjects;
