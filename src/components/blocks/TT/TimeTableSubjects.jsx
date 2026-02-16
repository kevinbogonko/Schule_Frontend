import React, { useState, useEffect } from "react";
import ReusableDiv from "../../ui/ReusableDiv";
import { FaSpinner, FaSave, FaTrash, FaEdit } from "react-icons/fa";
import { yearOptions, formOptions } from "../../../utils/CommonData";
import { useToast } from "../../ui/Toast";
import api from "../../../hooks/api";
import { FaCodeMerge } from "react-icons/fa6";
import { GrDocumentConfig } from "react-icons/gr";
import Button from "../../ui/Button";
import Dropdown from "../../ui/Dropdown";
import ReusableInput from "../../ui/ReusableInput";
import MergeTTSubjects from "./MergeTTSubjects";

const TimeTableSubjects = ({ syst_level }) => {
  const { showToast } = useToast();
  let isCBC;
  syst_level === "Secondary (8-4-4)" ? (isCBC = false) : (isCBC = true);

  const initialState = (setFormOptions) => {

    const stateStacks = {
      loadingStack: {},
      yearStack: {},
      termStack: {},
      utilityStack: {},
      activeSubjectStack: {},
      currentPageStack: {},
      lastSavedStack: {},
      streamStack: {},
      availableLessonStack: {},
    };

    setFormOptions.forEach(formOption => {
      const formKey = `form${formOption.value}`
      stateStacks.loadingStack[formKey] = false;
      stateStacks.yearStack[formKey] = null;
      stateStacks.termStack[formKey] = null;
      stateStacks.utilityStack[formKey] = null;
      stateStacks.activeSubjectStack[formKey] = [];
      stateStacks.currentPageStack[formKey] = 1;
      stateStacks.lastSavedStack[formKey] = null;
      stateStacks.streamStack[formKey] = [];
      stateStacks.availableLessonStack[formKey] = [
        { value: 700, label: "LIFE SKILLS", init: "LSK" },
        { value: 800, label: "LIBRARY", init: "LIB" },
        { value: 900, label: "PASTORAL PI", init: "PPI" },
        { value: 600, label: "PHYSICAL ED.", init: "P.E" },
      ];
    })

    return stateStacks

  }

  const setFormOptions = formOptions.find((option) => option.label === syst_level)?.options || [];

  const appInitState = initialState(setFormOptions)

  const [loading, setLoading] = useState(appInitState.loadingStack);
  const [selectedYear, setSelectedYear] = useState(appInitState.yearStack);
  const [selectedTerm, setSelectedTerm] = useState(appInitState.termStack);
  const [selectedUtility, setSelectedUtility] = useState(
    appInitState.utilityStack
  );
  const [activeSubjects, setActiveSubjects] = useState(
    appInitState.activeSubjectStack
  );
  const [currentPage, setCurrentPage] = useState(appInitState.currentPageStack);
  const [lastSaved, setLastSaved] = useState(appInitState.lastSavedStack);
  const [activeForms, setActiveForms] = useState([]);
  const [refSubjectConfig, setRefSubjectConfig] = useState([]);
  const [streamOptions, setStreamOptions] = useState(appInitState.streamStack);

  const [modalState, setModalState] = useState({
    mergeSubject: false,
    currentForm: null,
    editMode: false,
    subjectToEdit: null,
  });

  const [preconfiguredSubjects, setPreconfiguredSubjects] = useState([]);
  const [availableLessonOptions, setAvailableLessonOptions] = useState(
    appInitState.availableLessonStack
  );

  useEffect(() => {
    const fetchActiveForms = async (setFormOptions) => {
      try {
        const response = setFormOptions.map(formOption => {
          return formOption?.value
        })
        setActiveForms(response);
      } catch (err) {
        console.error("Failed to fetch active forms", err);
        setActiveForms([]);
      }
    };

    fetchActiveForms(setFormOptions);
  }, []);

  const fetchStreams = async (year, form) => {
    if (!year) return;

    try {
      const response = await api.post("/stream/getstreams", { year, form });
      const formattedStreams = response.data.map((stream) => ({
        value: stream.id,
        label: stream.stream_name,
      }));

      setStreamOptions((prev) => ({
        ...prev,
        [`form${form}`]: formattedStreams,
      }));
    } catch (err) {
      console.error("Failed to fetch streams", err);
      setStreamOptions((prev) => ({
        ...prev,
        [`form${form}`]: [
          { value: 1, label: "WEST" },
          { value: 2, label: "NORTH" },
          { value: 3, label: "EAST" },
          { value: 4, label: "SOUTH" },
        ],
      }));
    }
  };

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

      // console.log(response.data)

      const responseData = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      setRefSubjectConfig(responseData);

      const mergedSubjectsMap = new Map();
      const individualSubjects = [];
      const customSubjectCodes = [];

      responseData.forEach((subject) => {
        if (subject.isCustom) {
          customSubjectCodes.push(subject.code);
        }

        // Handle merged_with when it's a string (comma-separated)
        const mergedWith =
          typeof subject.merged_with === "string"
            ? subject.merged_with.split(",").map((item) => item.trim())
            : Array.isArray(subject.merged_with)
            ? subject.merged_with
            : [];

        // Handle pair when it's a string (comma-separated)
        const pair =
          typeof subject.pair === "string"
            ? subject.pair.split(",").map((item) => item.trim())
            : Array.isArray(subject.pair)
            ? subject.pair
            : [];

        if (subject.ismerged) {
          const mergeKey =
            mergedWith.length > 0
              ? [subject.code, ...mergedWith].sort().join(",")
              : subject.code.toString();

          if (!mergedSubjectsMap.has(mergeKey)) {
            // Get the aliases for each subject in the merge group
            const mergedSubjectAliases = mergedWith.map((code) => {
              const refSub = responseData.find((sub) => sub.code === code);
              return refSub ? refSub.alias || refSub.name : code;
            });

            // console.log(mergedSubjectAliases);

            mergedSubjectsMap.set(mergeKey, {
              id: `merged_${mergeKey}`,
              value: `merged_${mergeKey}`,
              label: subject.merge_alias
                ? `${subject.merge_alias} (${mergedSubjectAliases.join(" + ")})`
                : mergedSubjectAliases.join(" + "),
              name: subject.name,
              init: subject.merge_alias || "",
              alias: subject.merge_alias || "",
              singles: subject.merge_singles || 0,
              doubles: subject.merge_doubles || 0,
              isCustom: subject.iscustom || false,
              isMerged: true,
              merged_with: mergedWith,
              merge_alias: subject.merge_alias,
              merge_singles: subject.merge_singles,
              merge_doubles: subject.merge_doubles,
              mergedSubjects: [],
              utility: subject.utility,
              submittable: false,
              isPaired: subject.isPaired || false,
              pair: pair,
            });
          }

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
            submittable: true,
            isPaired: subject.isPaired || false,
            pair: pair,
          });
        } else {
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
            submittable: true,
            isPaired: subject.isPaired || false,
            pair: pair,
          });
        }
      });

      setAvailableLessonOptions((prev) => {
        const updatedOptions = { ...prev };
        updatedOptions[`form${form}`] = prev[`form${form}`].filter(
          (lesson) => !customSubjectCodes.includes(lesson.value)
        );
        return updatedOptions;
      });

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
      showToast(`Failed to fetch subjects for Form ${form}`, "error", {
        duration: 3000,
        position: "top-right",
      });
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

    fetchStreams(selectedOption, form);
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
      id: selectedLesson.value,
      value: selectedLesson.value,
      label: selectedLesson.label,
      init: selectedLesson.init,
      singles: singles,
      doubles: doubles,
      isCustom: true,
      isMerged: false,
      utility: selectedUtility[formKey]?.value || "d",
      submittable: true,
      isPaired: false,
      pair: [],
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
            isCustom: sub.isCustom,
            isMerged: false,
            utility: sub.utility,
            canBeMerged: true,
            submittable: true,
            isPaired: sub.isPaired || false,
            pair: sub.pair || [],
          })
        );

        updatedSubjects.splice(index, 1, ...individualSubjects);
      } else {
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

      const subjectsToSave = [];

      activeSubjects[`form${form}`]
        .filter((subject) => subject.submittable !== false)
        .forEach((subject) => {
          if (subject.isMerged) {
            const mergedNameParts = subject.name.match(/\((.*?)\)/);
            const subjectNames = mergedNameParts
              ? mergedNameParts[1].split(" + ").map((s) => s.trim())
              : subject.merged_with.map((code) => {
                  const refSub = refSubjectConfig.find((s) => s.code === code);
                  return refSub ? refSub.name : code;
                });

            subject.merged_with.forEach((code, index) => {
              const refSub = refSubjectConfig.find((s) => s.code === code);
              subjectsToSave.push({
                code: code,
                name: subjectNames[index] || refSub?.name || code,
                alias: refSub?.alias || "",
                singles: subject.merge_singles,
                doubles: subject.merge_doubles,
                iscustom: false,
                ismerged: true,
                merged_with: subject.merged_with.filter((c) => c !== code),
                merge_alias: subject.merge_alias,
                merge_singles: subject.merge_singles,
                merge_doubles: subject.merge_doubles,
                utility: subject.utility,
                ispaired: subject.isPaired || false,
                pair: subject.pair || [],
              });
            });
          } else {
            subjectsToSave.push({
              code: subject.id,
              name: subject.label,
              alias: subject.alias || subject.init,
              singles: subject.singles,
              doubles: subject.doubles,
              iscustom: subject.isCustom,
              ismerged: false,
              merged_with: null,
              merge_alias: null,
              merge_singles: null,
              merge_doubles: null,
              utility: subject.utility,
              ispaired: subject.isPaired || false,
              pair: subject.pair || [],
            });
          }
        });

      const payload = {
        year: selectedYear[`form${form}`],
        form: form,
        term: selectedTerm[`form${form}`],
        utility: selectedUtility[`form${form}`],
        subjects: subjectsToSave,
      };

      await api.post("/timetable/savesubjconfig", payload);

      setLastSaved((prev) => ({
        ...prev,
        [`form${form}`]: new Date().toLocaleString(),
      }));

      showToast(`Grade ${form} subjects saved successfully`, "success", {
        duration: 3000,
        position: "top-right",
      });
    } catch (err) {
      console.error(err);
      showToast("Failed to save subjects", "error", {
        duration: 3000,
        position: "top-right",
      });
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

    let formattedSubjects;

    if (subjectToEdit) {
      formattedSubjects = (subjectToEdit.mergedSubjects || []).map((sub) => ({
        id: sub.id,
        value: sub.id,
        label: sub.label || sub.name,
        name: sub.name || sub.label,
        init: sub.init || sub.alias,
        alias: sub.alias,
        singles: sub.singles,
        doubles: sub.doubles,
        isCustom: sub.isCustom,
        isMerged: false,
        utility: sub.utility,
        submittable: true,
        isPaired: sub.isPaired || false,
        pair: sub.pair || [],
      }));
    } else {
      formattedSubjects = currentSubjects
        .filter((subject) => !subject.isMerged && subject.canBeMerged !== false)
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
          submittable: true,
          isPaired: subject.isPaired || false,
          pair: subject.pair || [],
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

  const handleMergeComplete = (mergedSubjects, form) => {
    setActiveSubjects((prev) => ({
      ...prev,
      [`form${form}`]: mergedSubjects,
    }));
  };

  const renderFormDiv = (form) => {
    if (!activeForms.includes(form)) return null;

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
        key={`form-${form}-div`}
        className="mb-4"
        tag={`${isCBC ? "Grade" : "Form"} ${form} ${
          isCBC ? "Learning activities" : "Subjects"
        }: Configured ${activeSubjects[formKey]?.length || 0} ${lastSavedTime}`}
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
                key={`merge-btn-${form}`}
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
                  key={`add-lesson-${form}`}
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
                          {subject.isPaired && (
                            <span className="ml-2 text-xs text-blue-500">
                              (Paired)
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
                                key={`edit-${subject.id}`}
                                onClick={() => handleMergeClick(form, subject)}
                                variant="icon"
                                size="sm"
                                className="text-blue-500 hover:text-blue-700"
                                title="Edit merged subject"
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                key={`delete-${subject.id}`}
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
                              key={`delete-${subject.id}`}
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
                  key={`prev-btn-${form}`}
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
                  key={`next-btn-${form}`}
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
                key={`clear-btn-${form}`}
                onClick={() => handleClearForm(form)}
                variant="secondary"
                size="sm"
              >
                Clear
              </Button>
              <Button
                key={`save-btn-${form}`}
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
              ? `No ${
                  isCBC ? "learning activities" : "subjects"
                } found`
              : `Please select year, term and utility to load ${
                  isCBC ? "learning activities" : "subjects"
                }`}
          </div>
        )}
      </ReusableDiv>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
        Timetable {isCBC ? "Learning activities" : "Subjects"} Configuration
      </h1>

      {activeForms.map((form) => renderFormDiv(form))}
      {modalState.mergeSubject && (
        <MergeTTSubjects
          key="merge-subjects-modal"
          modalState={modalState.mergeSubject}
          setModalState={(state) =>
            setModalState((prev) => ({
              ...prev,
              mergeSubject: state,
            }))
          }
          setActiveSubjects={(subjects) => {
            handleMergeComplete(subjects, modalState.currentForm);
          }}
          subjects={preconfiguredSubjects}
          currentForm={modalState.currentForm}
          streams={streamOptions[`form${modalState.currentForm}`] || []}
          editMode={modalState.editMode}
          subjectToEdit={modalState.subjectToEdit}
        />
      )}
    </div>
  );
};

export default TimeTableSubjects;
