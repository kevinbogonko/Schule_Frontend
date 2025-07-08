import React, { useState, useEffect } from "react";
import ModalForm from "../../ui/raw/ModalForm";
import Dropdown from "../../Dropdown";
import ReusableInput from "../../ui/ReusableInput";
import Button from "../../ui/raw/Button";
import { FiTrash2 } from "react-icons/fi";
import { FaCodeMerge } from "react-icons/fa6";
import { FaSpinner } from "react-icons/fa";
import Checkbox from "../../Checkbox";

const MergeTTSubjects = ({
  modalState,
  setModalState,
  setActiveSubjects,
  subjects,
  currentForm,
  streams = [],
  editMode = false,
  subjectToEdit = null,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectsToMerge, setSubjectsToMerge] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [mergedDoubles, setMergedDoubles] = useState("");
  const [mergedSingles, setMergedSingles] = useState("");
  const [mergedAlias, setMergedAlias] = useState("");
  const [pairStreams, setPairStreams] = useState(false);
  const [selectedStreams, setSelectedStreams] = useState([]);
  const [streamPairs, setStreamPairs] = useState([]);

  const formatSubjectOptions = (subjects) => {
    return (
      subjects?.map((subject) => ({
        value: subject.id || subject.value,
        label: subject.label || subject.name,
        ...subject,
      })) || []
    );
  };

  useEffect(() => {
    if (subjects && subjects.length > 0) {
      const formatted = formatSubjectOptions(subjects);
      setAvailableSubjects(formatted);

      if (editMode && subjectToEdit) {
        // Pre-populate with existing merged subject data
        const mergedSubjects = subjectToEdit.merge_with
          ? [
              subjectToEdit,
              ...subjects.filter((sub) =>
                subjectToEdit.merge_with.includes(sub.id)
              ),
            ]
          : [subjectToEdit];

        setSubjectsToMerge(
          mergedSubjects.map((sub) => ({
            id: sub.id,
            value: sub.id,
            label: sub.label || sub.name,
            name: sub.name,
            init: sub.alias,
            alias: sub.alias,
            singles: sub.singles || 0,
            doubles: sub.doubles || 0,
            originalSingles: sub.singles || 0, // Preserve original values
            originalDoubles: sub.doubles || 0, // Preserve original values
            isCustom: true,
            isMerged: true,
          }))
        );
        setMergedAlias(subjectToEdit.merge_alias || "");
        setMergedSingles(subjectToEdit.merge_singles || "");
        setMergedDoubles(subjectToEdit.merge_doubles || "");
        setStreamPairs(subjectToEdit.pair || []);
        setPairStreams(subjectToEdit.isPaired || false);
      }
    }
  }, [subjects, editMode, subjectToEdit]);

  useEffect(() => {
    if (subjects && subjects.length > 0) {
      const filtered = subjects.filter(
        (sub) => !subjectsToMerge.some((s) => s.value === (sub.id || sub.value))
      );
      setAvailableSubjects(formatSubjectOptions(filtered));
    }
  }, [subjectsToMerge, subjects]);

  const handleSubjectSelect = (selectedOption) => {
    if (!selectedOption) return;

    const subject = availableSubjects.find(
      (sub) => sub.value === selectedOption
    );

    if (subject && !subjectsToMerge.some((s) => s.value === subject.value)) {
      setSubjectsToMerge([
        ...subjectsToMerge,
        {
          ...subject,
          doubles: subject.doubles || 0,
          singles: subject.singles || 0,
          originalDoubles: subject.doubles || 0, // Store original values
          originalSingles: subject.singles || 0, // Store original values
        },
      ]);
      setSelectedSubject(null);
    }
  };

  const handleMergeLessons = () => {
    if (subjectsToMerge.length < 2) return;

    setIsSubmitting(true);

    try {
      // Create merged subjects while preserving original values for non-merged scenarios
      const mergedSubjects = subjectsToMerge.map((subject) => ({
        ...subject,
        isMerged: true,
        merge_alias: mergedAlias,
        merge_with: subjectsToMerge
          .filter((s) => s.id !== subject.id)
          .map((s) => s.id),
        merge_singles: mergedSingles === "" ? 0 : parseInt(mergedSingles),
        merge_doubles: mergedDoubles === "" ? 0 : parseInt(mergedDoubles),
        isPaired: pairStreams,
        pair: streamPairs,
        // Keep original values in case the subject is later unmerged
        singles: subject.originalSingles || 0,
        doubles: subject.originalDoubles || 0,
      }));

      let updatedSubjects;
      if (editMode && subjectToEdit) {
        // In edit mode, update the existing subjects
        updatedSubjects = subjects.map((sub) => {
          const mergedSubject = mergedSubjects.find((s) => s.id === sub.id);
          return mergedSubject || sub;
        });
      } else {
        // In create mode, add the merged subjects while preserving originals
        updatedSubjects = subjects.map((sub) => {
          const mergedSubject = mergedSubjects.find((s) => s.id === sub.id);
          return mergedSubject || sub;
        });

        // Add any new subjects that weren't in the original list
        const newSubjects = mergedSubjects.filter(
          (ms) => !subjects.some((s) => s.id === ms.id)
        );
        if (newSubjects.length > 0) {
          updatedSubjects = [...updatedSubjects, ...newSubjects];
        }
      }

      setActiveSubjects(updatedSubjects);
      setSubjectsToMerge([]);
      setMergedDoubles("");
      setMergedSingles("");
      setMergedAlias("");
      setStreamPairs([]);
      setPairStreams(false);
      setModalState(false);
    } catch (error) {
      console.error("Error merging subjects:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setSubjectsToMerge([]);
    setSelectedSubject(null);
    setMergedDoubles("");
    setMergedSingles("");
    setMergedAlias("");
    setStreamPairs([]);
    setPairStreams(false);
  };

  const calculateTotal = () => {
    const singles = mergedSingles === "" ? 0 : parseInt(mergedSingles);
    const doubles = mergedDoubles === "" ? 0 : parseInt(mergedDoubles);
    return singles + 2 * doubles;
  };

  const handleAddPair = () => {
    if (selectedStreams.length < 2) return;
    setStreamPairs([...streamPairs, selectedStreams.map((s) => s.value)]);
    setSelectedStreams([]);
  };

  const handleRemovePair = (index) => {
    if (streamPairs.length === 0) return;
    const updatedPairs = [...streamPairs];
    updatedPairs.splice(index, 1);
    setStreamPairs(updatedPairs);
  };

  const isMergeDisabled = () => {
    const singles = mergedSingles === "" ? 0 : parseInt(mergedSingles);
    const doubles = mergedDoubles === "" ? 0 : parseInt(mergedDoubles);
    const totalLessons = singles + doubles;
    return (
      isSubmitting ||
      subjectsToMerge.length < 2 ||
      totalLessons === 0 ||
      !mergedAlias ||
      (pairStreams && streamPairs.length === 0)
    );
  };

  const showStreamPairing =
    streams &&
    streams.length >= 2 &&
    subjectsToMerge.length >= 2 &&
    calculateTotal() > 0 &&
    mergedAlias;

  const customButtons = [
    {
      key: "clear-button",
      label: "Clear",
      onClick: handleClear,
      className:
        "bg-gray-200 text-gray-800 hover:bg-gray-300 my-4 px-4 py-2 text-sm rounded-md font-medium transition-all duration-200 focus:outline-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
    },
    {
      key: "merge-button",
      label: isSubmitting ? (
        <FaSpinner className="animate-spin" />
      ) : editMode ? (
        "Update Merge"
      ) : (
        "Merge Subjects"
      ),
      type: "submit",
      disabled: isMergeDisabled(),
      className: `bg-blue-600 text-white hover:bg-blue-700 my-4 px-4 py-2 text-sm rounded-md font-medium transition-all duration-200 focus:outline-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        isMergeDisabled() ? "opacity-50 cursor-not-allowed" : ""
      }`,
    },
  ];

  return (
    <ModalForm
      isOpen={modalState}
      onClose={() => {
        setSubjectsToMerge([]);
        setSelectedSubject(null);
        setMergedDoubles("");
        setMergedSingles("");
        setMergedAlias("");
        setStreamPairs([]);
        setPairStreams(false);
        setModalState(false);
      }}
      title={`${editMode ? "Edit" : "Merge"} Subjects - Form ${currentForm}`}
      icon={FaCodeMerge}
      onSubmit={handleMergeLessons}
      closeOnOutsideClick={false}
      size="4xl"
      customButtons={customButtons}
      className="dark:bg-gray-800"
    >
      <div className="dark:text-white mb-4">
        <label
          htmlFor="subject"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Select Subject to Merge
        </label>
        <Dropdown
          name="subject"
          id="subject"
          options={availableSubjects}
          placeholder="Select Subject"
          className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
          value={selectedSubject}
          onChange={(selected) => {
            setSelectedSubject(selected);
            handleSubjectSelect(selected);
          }}
          isClearable
          isDisabled={editMode}
        />
      </div>

      {subjectsToMerge.length > 0 && (
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                  S/N
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                  Subject
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                  Alias
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                  Singles
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                  Doubles
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                  Total
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800">
              {subjectsToMerge.map((subject, index) => {
                const singles =
                  subject.singles === "" ? 0 : parseInt(subject.singles);
                const doubles =
                  subject.doubles === "" ? 0 : parseInt(subject.doubles);
                const total = singles + 2 * doubles;
                return (
                  <tr key={`${subject.value}-${index}`}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {subject.label}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {subject.init || subject.value}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <ReusableInput
                        type="number"
                        value={subject.singles}
                        onChange={(e) =>
                          handleInputChange(index, "singles", e.target.value)
                        }
                        min={0}
                        max={10}
                        className="w-20"
                        disabled={editMode}
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <ReusableInput
                        type="number"
                        value={subject.doubles}
                        onChange={(e) =>
                          handleInputChange(index, "doubles", e.target.value)
                        }
                        min={0}
                        max={10}
                        className="w-20"
                        disabled={editMode}
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {total}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <button
                        onClick={() => handleRemoveSubject(index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded focus:outline-none"
                        disabled={editMode}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50 dark:bg-gray-700 font-medium">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                  Merged Properties
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                  {subjectsToMerge.length} Subjects
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <ReusableInput
                    type="text"
                    value={mergedAlias}
                    onChange={(e) => setMergedAlias(e.target.value)}
                    placeholder="Alias"
                    className="w-24"
                    required
                  />
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <ReusableInput
                    type="number"
                    value={mergedSingles}
                    onChange={(e) => setMergedSingles(e.target.value)}
                    min={0}
                    max={10}
                    className="w-20"
                  />
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <ReusableInput
                    type="number"
                    value={mergedDoubles}
                    onChange={(e) => setMergedDoubles(e.target.value)}
                    min={0}
                    max={10}
                    className="w-20"
                  />
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                  {calculateTotal()}
                </td>
                <td className="px-4 py-2 whitespace-nowrap"></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {showStreamPairing && (
        <div className="mb-4">
          <Checkbox
            label="Pair Streams"
            checked={pairStreams}
            onChange={() => setPairStreams(!pairStreams)}
            className="dark:text-white"
          />
        </div>
      )}

      {showStreamPairing && pairStreams && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Streams to Pair
            </label>
            <Dropdown
              options={getAvailableStreams().map((stream) => ({
                value: stream.value,
                label: stream.label,
              }))}
              value={selectedStreams}
              onChange={(selected) => setSelectedStreams(selected || [])}
              placeholder="Select streams..."
              className="dark:bg-gray-600 dark:text-white dark:border-gray-500"
              multiple={true}
              clearable={true}
            />
          </div>

          {streamPairs.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Pairs:
              </h4>
              <ul className="list-disc pl-5 dark:text-gray-300">
                {streamPairs.map((pair, index) => (
                  <li key={index} className="mb-1">
                    Pair {index + 1}:{"  "}
                    {pair
                      .map((s) => {
                        const stream = streams.find((st) => st.value === s);
                        return stream?.label || s;
                      })
                      .join(", ")}
                    <button
                      onClick={() => handleRemovePair(index)}
                      className="ml-2 text-red-500 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex space-x-2">
            {selectedStreams.length >= 2 && (
              <Button
                onClick={handleAddPair}
                variant="primary"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Pair
              </Button>
            )}
          </div>
        </div>
      )}
    </ModalForm>
  );
};

export default MergeTTSubjects;
