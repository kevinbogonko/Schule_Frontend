import React, { useState, useEffect, useCallback } from "react";
import ReusableDiv from "../ReusableDiv";
import ReusableSelect from "../ReusableSelect";
import { FaUsersGear } from "react-icons/fa6";
import { MdDone } from "react-icons/md";
import { AiOutlineClear } from "react-icons/ai";
import {
  yearOptions,
  formOptions,
  weekDaysOptions,
} from "../../utils/CommonData";
import api from "../../hooks/api";
import CheckboxGroup from "../CheckboxGroup";
import Dropdown from "../Dropdown";
import Checkbox from "../Checkbox";
import Button from "../ui/raw/Button";
import ReusableInput from "../ui/ReusableInput";
import { useToast } from "../Toast";
import TimeInput from "../TimeInput";
import { FaMinus, FaPlus } from "react-icons/fa";
import TimetableGrid from "./TimetableGrid";

const GenerateTT = () => {
  const { showToast } = useToast();
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [learningDays, setLearningDays] = useState([]);
  const [streamData, setStreamData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [showSubjectsDiv, setShowSubjectsDiv] = useState(false);
  const [applyForAllStreams, setApplyForAllStreams] = useState(false);
  const [teachers, setTeachers] = useState([]);

  // Schedule Settings State
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [duration, setDuration] = useState("");
  const [includeBreaks, setIncludeBreaks] = useState(false);
  const [breaks, setBreaks] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [availableLessons, setAvailableLessons] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  const breakTypeOptions = [
    { value: "break", label: "Break" },
    { value: "lunch", label: "Lunch break" },
    { value: "games", label: "Games & Soc" },
  ];

  // Handle learning days checkbox changes
  const handleLearningDaysChange = (values) => {
    const updatedDays = weekDaysOptions
      .map((day) => ({
        ...day,
        hasGames: values.includes(day.value),
      }))
      .filter((day) => values.includes(day.value));

    setLearningDays(updatedDays);
  };

  // Fetch teachers when streamData is not empty
  useEffect(() => {
    if (streamData.length > 0 && selectedYear && selectedForm) {
      const fetchTeachers = async () => {
        try {
          const response = await api.post("/teacher/getanysubjectteachers", {
            form: selectedForm,
            year: selectedYear,
          });

          // Format teachers data
          const formattedTeachers = response.data.reduce((acc, teacher) => {
            const existingTeacher = acc.find(
              (t) => t.id === teacher.teacher_id
            );
            if (existingTeacher) {
              existingTeacher.subjects.push(teacher.init);
            } else {
              acc.push({
                id: teacher.teacher_id,
                name: teacher.instructor,
                subjects: [teacher.init],
              });
            }
            return acc;
          }, []);

          setTeachers(formattedTeachers);
        } catch (error) {
          showToast("Failed to fetch teachers", "error", {
            duration: 3000,
            position: "top-right",
          });
        }
      };

      fetchTeachers();
    }
  }, [streamData, selectedYear, selectedForm]);

  useEffect(() => {
    setSelectedForm("");
    setStreamData([]);
    setSelectedStream(null);
    setSubjectOptions([]);
    setSelectedSubjects([]);
    setShowSubjectsDiv(false);
    setApplyForAllStreams(false);
  }, [selectedYear]);

  useEffect(() => {
    // Reset dependent states when form changes
    setStreamData([]);
    setSelectedStream(null);
    setSubjectOptions([]);
    setSelectedSubjects([]);
    setShowSubjectsDiv(false);
    setApplyForAllStreams(false);

    if (selectedForm && selectedYear) {
      const payload = {
        year: selectedYear,
        form: selectedForm,
      };

      setLoading(true);
      const fetchData = async () => {
        try {
          const response = await api.post("/stream/getstreams", payload);
          const transformedData = response.data.map((stream) => ({
            value: stream.id,
            label: stream.stream_name,
          }));
          setStreamData(transformedData);
          setLoading(false);
        } catch (error) {
          setError(error.message);
          setLoading(false);
          showToast("Failed to fetch streams", "error", {
            duration: 3000,
            position: "top-right",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [selectedForm]);

  useEffect(() => {
    if (selectedStream) {
      const fetchSubjects = async () => {
        try {
          const response = await api.post("/subject/getsubjects", {
            form: selectedForm,
          });
          setSubjectOptions(response.data);
          setShowSubjectsDiv(true);
        } catch (error) {
          showToast("Failed to fetch subjects", "error", {
            duration: 3000,
            position: "top-right",
          });
        }
      };
      fetchSubjects();
    } else {
      setSubjectOptions([]);
      setSelectedSubjects([]);
      setShowSubjectsDiv(false);
    }
  }, [selectedStream]);

  const handleSubjectChange = (subjectId, isChecked) => {
    if (isChecked) {
      setSelectedSubjects((prev) => [...prev, { id: subjectId, periods: "" }]);
    } else {
      setSelectedSubjects((prev) => prev.filter((sub) => sub.id !== subjectId));
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allSubjects = subjectOptions.map((subject) => ({
        id: subject.id,
        periods: "",
      }));
      setSelectedSubjects(allSubjects);
    } else {
      setSelectedSubjects([]);
    }
  };

  const handlePeriodsChange = (subjectId, value) => {
    const numValue = parseInt(value);

    if (value && isNaN(numValue)) {
      showToast("Please enter a valid number", "error", {
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    if (value && numValue > 50) {
      showToast("Maximum value is 50", "error", {
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    if (value && value.length > 2) {
      showToast("Maximum 2 digits allowed", "error", {
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    setSelectedSubjects((prev) =>
      prev.map((sub) =>
        sub.id === subjectId ? { ...sub, periods: value } : sub
      )
    );
  };

  const handleApply = () => {
    const invalidSubjects = selectedSubjects.filter(
      (sub) => !sub.periods || isNaN(parseInt(sub.periods))
    );

    if (invalidSubjects.length > 0) {
      showToast(
        "Please enter valid period values for all selected subjects",
        "error",
        {
          duration: 3000,
          position: "top-right",
        }
      );
      return;
    }

    let result = [];
    let subjectCounter = 1;

    if (applyForAllStreams) {
      // Apply to all streams using the actual stream IDs from streamData
      streamData.forEach((stream) => {
        const streamSubjects = selectedSubjects.map((subject) => ({
          id: subjectCounter++,
          name: subjectOptions.find((s) => s.id === subject.id).init,
          periodsPerWeek: parseInt(subject.periods),
          streamId: stream.value,
        }));
        result = [...result, ...streamSubjects];
      });
      setSubjects(result);
    } else {
      // Apply to the selected stream only
      const streamId = selectedStream;

      result = selectedSubjects.map((subject) => ({
        id: subjectCounter++,
        name: subjectOptions.find((s) => s.id === subject.id).init,
        periodsPerWeek: parseInt(subject.periods),
        streamId: streamId,
      }));
      setSubjects(result);
    }

    showToast("Subjects applied successfully", "success", {
      duration: 3000,
      position: "top-right",
    });
  };

  const handleClear = () => {
    setSelectedSubjects([]);
    setApplyForAllStreams(false);
  };

  // Calculate available lessons for break placement
  const calculateAvailableLessons = () => {
    if (!duration || !startTime || !endTime) return [];

    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const lessonDuration = parseInt(duration);
    const totalMinutes = (end - start) / (1000 * 60);

    const totalBreakMinutes = breaks.reduce(
      (sum, brk) => sum + (parseInt(brk.duration) || 0),
      0
    );

    const availableMinutes = totalMinutes - totalBreakMinutes;

    const maxLessons = Math.floor(availableMinutes / lessonDuration);
    return Array.from({ length: maxLessons }, (_, i) => ({
      value: i + 1,
      label: `After lesson ${i + 1}`,
    }));
  };

  // Update available lessons whenever relevant inputs change
  useEffect(() => {
    setAvailableLessons(calculateAvailableLessons());
  }, [duration, startTime, endTime, breaks]);

  const addBreak = () => {
    if (breaks.length >= 4) return;
    setBreaks([...breaks, { afterEvent: "", duration: "", type: "" }]);
  };

  const updateBreak = (index, key, value) => {
    if (index >= 0 && index < breaks.length) {
      const updated = [...breaks];
      updated[index][key] = value;
      setBreaks(updated);
    }
  };

  const removeBreak = (index) => {
    if (index >= 0 && index < breaks.length) {
      setBreaks(breaks.filter((_, i) => i !== index));
    }
  };

  // Wrap generateSchedule in useCallback with proper dependencies
  const generateSchedule = useCallback(() => {
    const minLessonDuration = 20; // Minimum acceptable lesson duration
    const maxLessonDuration = 60; // Maximum lesson duration

    // Validate inputs
    const parsedDuration = parseInt(duration);
    if (!parsedDuration || isNaN(parsedDuration)) {
      showToast("Please enter a valid lesson duration", "error", {
        duration: 300,
        position: "top-right",
      });
      return [];
    }

    if (
      parsedDuration < minLessonDuration ||
      parsedDuration > maxLessonDuration
    ) {
      showToast(
        `Lesson duration must be between ${minLessonDuration} and ${maxLessonDuration} minutes`,
        "error",
        { duration: 300, position: "top-right" }
      );
      return [];
    }

    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    if (start >= end) {
      showToast("End time must be after start time", "error", {
        duration: 3000,
        position: "top-right",
      });
      return [];
    }

    // Calculate total available time
    const totalAvailableMinutes = (end - start) / 60000;

    // Process breaks if enabled
    const breaksMap = new Map();
    let totalBreakMinutes = 0;
    let hasInvalidBreaks = false;

    if (includeBreaks && breaks.length > 0) {
      breaks.forEach((b, index) => {
        // Validate break fields
        if (!b.afterEvent || !b.duration || !b.type) {
          showToast(
            `Please complete all fields for break ${index + 1}`,
            "error",
            { duration: 3000, position: "top-right" }
          );
          hasInvalidBreaks = true;
          return;
        }

        const breakDuration = Number(b.duration);
        if (isNaN(breakDuration) || breakDuration <= 0) {
          showToast(`Invalid duration for break ${index + 1}`, "error", {
            duration: 3000,
            position: "top-right",
          });
          hasInvalidBreaks = true;
          return;
        }

        const afterLesson = Number(b.afterEvent);
        if (isNaN(afterLesson) || afterLesson <= 0) {
          showToast(`Invalid lesson number for break ${index + 1}`, "error", {
            duration: 3000,
            position: "top-right",
          });
          hasInvalidBreaks = true;
          return;
        }

        breaksMap.set(afterLesson, {
          duration: breakDuration,
          type: b.type,
        });
        totalBreakMinutes += breakDuration;
      });

      if (hasInvalidBreaks) return [];
    }

    // Calculate time available for lessons
    const availableForLessons = totalAvailableMinutes - totalBreakMinutes;
    if (availableForLessons <= 0) {
      showToast("Total break time exceeds available time", "error", {
        duration: 3000,
        position: "top-right",
      });
      return [];
    }

    // Calculate initial lesson count based on user-specified duration
    let lessonCount = Math.floor(availableForLessons / parsedDuration);

    // Ensure we have enough lessons for all breaks
    const maxBreakPosition =
      breaksMap.size > 0 ? Math.max(...breaksMap.keys()) : 0;
    const requiredLessons = Math.max(lessonCount, maxBreakPosition);

    // Calculate adjusted lesson duration
    let adjustedLessonDuration = Math.floor(
      availableForLessons / requiredLessons
    );

    // Validate lesson duration
    if (adjustedLessonDuration < minLessonDuration) {
      showToast(
        `Cannot fit schedule (lessons would be ${adjustedLessonDuration} mins). ` +
          `Try: ${suggestions(totalAvailableMinutes, totalBreakMinutes)}`,
        "error",
        { duration: 3000, position: "top-right" }
      );
      return [];
    }

    // Generate the schedule
    const schedule = [];
    let current = new Date(start);
    let lessonNumber = 1;

    while (current < end && lessonNumber <= requiredLessons) {
      // Add lesson
      const lessonStart = new Date(current);
      current.setMinutes(current.getMinutes() + adjustedLessonDuration);
      const lessonEnd = new Date(current);

      if (lessonEnd > end) break;

      schedule.push({
        id: lessonNumber,
        label: `${lessonStart.toTimeString().slice(0, 5)} - ${lessonEnd
          .toTimeString()
          .slice(0, 5)}`,
        type: "lesson",
      });

      // Add break if scheduled after this lesson
      if (breaksMap.has(lessonNumber)) {
        const br = breaksMap.get(lessonNumber);
        const breakStart = new Date(current);
        current.setMinutes(current.getMinutes() + br.duration);
        const breakEnd = new Date(current);

        if (breakEnd <= end) {
          schedule.push({
            id: br.type,
            label: `${breakStart.toTimeString().slice(0, 5)} - ${breakEnd
              .toTimeString()
              .slice(0, 5)}`,
            type: br.type,
          });
        }
      }

      lessonNumber++;
    }

    if (schedule.length === 0) {
      showToast(
        "No schedule could be generated with current settings",
        "error",
        {
          duration: 3000,
          position: "top-right",
        }
      );
      return [];
    }

    showToast(`Schedule generated with ${schedule.length} items`, "success", {
      duration: 3000,
      position: "top-right",
    });

    setTimeSlots(schedule);
    return schedule;
  }, [duration, startTime, endTime, includeBreaks, breaks, showToast]);

  // Helper function to suggest solutions
  const suggestions = (totalTime, breakTime) => {
    const available = totalTime - breakTime;
    const suggestions = [];

    if (breakTime > 0) {
      suggestions.push(
        `Reduce break time by ${Math.ceil(breakTime - available)} minutes`
      );
    }

    suggestions.push(
      `Increase total time by ${Math.ceil(
        20 * Math.ceil(available / 20) - available
      )} minutes`
    );
    suggestions.push(
      `Reduce number of lessons to ${Math.floor(available / 20)}`
    );

    return suggestions.join(" or ");
  };

  // Check if save button should be disabled
  const isSaveDisabled =
    !duration ||
    (includeBreaks &&
      breaks.some((brk) => !brk.afterEvent || !brk.duration || !brk.type));

  const handleSave = () => {
    const commonObject = {
      learningDays,
      streams: applyForAllStreams
        ? streamData.map((stream) => ({
            id: stream.value,
            name: selectedForm + stream.label.charAt(0).toUpperCase(),
            form: selectedForm,
          }))
        : [
            {
              id: selectedStream,
              name:
                selectedForm +
                  streamData
                    .find((stream) => stream.value === selectedStream)
                    ?.label?.charAt(0)
                    ?.toUpperCase() || "",
              form: selectedForm,
            },
          ],
      subjects: selectedSubjects.map((subject) => ({
        id: subject.id,
        periods: subject.periods,
      })),
      teachers,
      scheduleSettings: {
        startTime,
        endTime,
        duration,
        includeBreaks,
        breaks,
      },
    };

    console.log("Final object to save:", commonObject);
    showToast("Data saved successfully", "success", {
      duration: 3000,
      position: "top-right",
    });
  };

  const isAllSelected =
    selectedSubjects.length === subjectOptions.length &&
    subjectOptions.length > 0;

  // Check if all selected subjects have period values
  const allPeriodsFilled = selectedSubjects.every(
    (sub) => sub.periods && !isNaN(parseInt(sub.periods))
  );

  // Disable buttons unless requirements are met
  const isClearDisabled = selectedSubjects.length === 0;
  const isApplyDisabled =
    selectedSubjects.length === 0 ||
    !allPeriodsFilled ||
    (!applyForAllStreams && !selectedStream);

  // Disable "Apply for all Streams" checkbox if no subjects are selected
  const isApplyForAllDisabled =
    selectedSubjects.length === 0 || !streamData.length;

  // Handle duration change with validation
  const handleDurationChange = (e) => {
    const value = e.target.value;
    if (value && value.length > 2) {
      showToast("Maximum 2 digits allowed", "error", {
        duration: 3000,
        position: "top-right",
      });
      return;
    }
    if (value && parseInt(value) > 60) {
      showToast("Lesson Duration should be below 60 mins", "error", {
        duration: 3000,
        position: "top-right",
      });
      return;
    }
    setDuration(value);
  };

  const handleDataBundling = async () => {
    const newSchedule = generateSchedule();
    if (newSchedule && newSchedule.length > 0) {
      setSchedule(newSchedule);
      const dataBundle = {
        learningDays,
        timeSlots: newSchedule,
        teachers,
        streams: applyForAllStreams
          ? streamData.map((stream) => ({
              id: stream.value,
              name: selectedForm + stream.label.charAt(0).toUpperCase(),
              form: selectedForm,
            }))
          : [
              {
                id: selectedStream,
                name:
                  selectedForm +
                    streamData
                      .find((stream) => stream.value === selectedStream)
                      ?.label?.charAt(0)
                      ?.toUpperCase() || "",
                form: selectedForm,
              },
            ],
        subjects: subjects,
      };
      console.log(dataBundle);
    }
  };

  return (
    <div>
      <div className="flex my-2">
        <div className="">
          <ReusableDiv
            className="ring-1 w-fit h-fit bg-blue-100"
            tag="Manage"
            icon={FaUsersGear}
            collapsible={true}
          >
            <div className="flex flex-wrap pb-4">
              <div className="w-full flex flex-col mb-2">
                <label htmlFor="year">Year</label>
                <ReusableSelect
                  id="year"
                  placeholder="Select Year"
                  options={yearOptions}
                  value={
                    yearOptions.find(
                      (option) => option.value === selectedYear
                    ) || undefined
                  }
                  onChange={(e) => setSelectedYear(e.target.value)}
                />
              </div>
              <div className="w-full flex flex-col mb-2">
                <label htmlFor="form">Form</label>
                <ReusableSelect
                  id="form"
                  placeholder={
                    selectedYear ? "Select Form" : "Please select year first"
                  }
                  options={formOptions}
                  value={
                    formOptions.find(
                      (option) => option.value === selectedForm
                    ) || undefined
                  }
                  onChange={(e) => setSelectedForm(e.target.value)}
                  disabled={!selectedYear}
                />
              </div>
            </div>
          </ReusableDiv>
          <ReusableDiv
            className="mt-2 p-0 bg-blue-100 ring-1"
            tag="Learning days"
            collapsible={true}
          >
            <CheckboxGroup
              options={weekDaysOptions}
              selectedValues={learningDays.map((day) => day.value)}
              onChange={handleLearningDaysChange}
              name="learning_days"
            />
          </ReusableDiv>
        </div>
        <ReusableDiv
          className="flex-1 bg-blue-100"
          tag="Subject Lessons per Week"
          collapsible={true}
        >
          <div className="flex flex-wrap gap-4 items-center justify-start">
            <Dropdown
              placeholder="Select Stream"
              className="w-fit"
              options={streamData}
              value={selectedStream}
              onChange={(value) => {
                setSelectedStream(value);
              }}
              clearable
              disabled={!streamData.length || applyForAllStreams}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="apply-all-streams"
                checked={applyForAllStreams}
                onChange={(e) => setApplyForAllStreams(e.target.checked)}
                disabled={isApplyForAllDisabled}
              />
              <label htmlFor="apply-all-streams">Apply for all Streams</label>
            </div>
          </div>

          {showSubjectsDiv && subjectOptions.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-2 p-2">
                <Checkbox
                  id="select-all-subjects"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
                <label htmlFor="select-all-subjects">
                  {isAllSelected ? "Unselect All" : "Select All"}
                </label>
              </div>
              <div className="max-h-40 overflow-y-auto p-2 border rounded ring-1">
                {subjectOptions.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center gap-2 mb-2 text-sm"
                  >
                    <Checkbox
                      id={`subject-${subject.id}`}
                      checked={selectedSubjects.some(
                        (sub) => sub.id === subject.id
                      )}
                      onChange={(e) =>
                        handleSubjectChange(subject.id, e.target.checked)
                      }
                    />
                    <label htmlFor={`subject-${subject.id}`}>
                      {subject.name}
                    </label>
                    <ReusableInput
                      type="number"
                      min="1"
                      max="50"
                      value={
                        selectedSubjects.find((sub) => sub.id === subject.id)
                          ?.periods || ""
                      }
                      onChange={(e) =>
                        handlePeriodsChange(subject.id, e.target.value)
                      }
                      disabled={
                        !selectedSubjects.some((sub) => sub.id === subject.id)
                      }
                      className="w-20 ml-auto"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Button
            variant="secondary"
            className="ring-1"
            >
              Configure
            </Button>
          </div>


          <div className="flex gap-4 mt-2">
            <Button
              variant="secondary"
              className="ring-1"
              icon={AiOutlineClear}
              onClick={handleClear}
              disabled={isClearDisabled}
            >
              Clear
            </Button>
            <Button
              variant="primary"
              icon={MdDone}
              onClick={handleApply}
              disabled={isApplyDisabled}
            >
              Apply
            </Button>
          </div>
        </ReusableDiv>
        <ReusableDiv
          className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-md"
          tag="Schedule Settings"
          collapsible={true}
        >
          <div className="space-y-1">
            <div className="flex flex-1 flex-wrap gap-4">
              <div className="w-1/2">
                <div className="w-1/2 flex flex-1 flex-col mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <div className="relative w-full">
                    <TimeInput
                      value={startTime}
                      onChange={setStartTime}
                      is12Hour={false}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="w-1/2 flex flex-1 flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <div className="relative w-full">
                    <TimeInput
                      value={endTime}
                      onChange={setEndTime}
                      is12Hour={false}
                      className="w-fit"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-1">
                <div className="flex flex-1 flex-col mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Lesson (mins)
                  </label>
                  <div className="relative w-full">
                    <ReusableInput
                      type="number"
                      value={duration}
                      onChange={handleDurationChange}
                      min={1}
                      max={60}
                      placeholder="e.g. 40"
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="include_breaks"
                checked={includeBreaks}
                onChange={(e) => setIncludeBreaks(e.target.checked)}
              />
              <label htmlFor="include_breaks">Include Breaks</label>
            </div>
            {includeBreaks && (
              <div className="space-y-1 transition-all duration-300 ease-in-out">
                <h3 className="text-lg font-semibold text-gray-800">
                  Breaks Configuration
                </h3>
                <div className="max-h-48 overflow-y-auto">
                  {breaks.map((brk, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-2"
                    >
                      <div className="h-fit grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            After Lesson
                          </label>
                          <ReusableSelect
                            value={brk.afterEvent}
                            onChange={(e) =>
                              updateBreak(index, "afterEvent", e.target.value)
                            }
                            options={availableLessons}
                            placeholder="Select lesson"
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            Duration (mins)
                          </label>
                          <ReusableInput
                            type="number"
                            value={brk.duration}
                            onChange={(e) =>
                              updateBreak(index, "duration", e.target.value)
                            }
                            className="w-full"
                            min={5}
                            max={60}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            Type
                          </label>
                          <ReusableSelect
                            value={brk.type}
                            onChange={(e) =>
                              updateBreak(index, "type", e.target.value)
                            }
                            options={breakTypeOptions}
                            placeholder="Select break type"
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  {breaks.length < 4 && (
                    <Button
                      onClick={addBreak}
                      variant="success"
                      className="my-0.5 flex-1 sm:flex-none"
                      icon={FaPlus}
                      disabled={breaks.some(
                        (b) => !b.afterEvent || !b.duration || !b.type
                      )}
                    >
                      Add Break
                    </Button>
                  )}
                  {breaks.length > 0 && (
                    <Button
                      onClick={() => removeBreak(breaks.length - 1)}
                      variant="danger"
                      className="my-0.5 flex-1 sm:flex-none"
                      icon={FaMinus}
                    >
                      Remove Break
                    </Button>
                  )}
                </div>
              </div>
            )}
            <Button
              variant="primary"
              icon={MdDone}
              onClick={handleDataBundling}
              disabled={
                isSaveDisabled || !learningDays.length || !teachers.length
              }
            >
              Generate Schedule
            </Button>
          </div>
        </ReusableDiv>
      </div>
      <TimetableGrid
        learningDays={learningDays}
        timeSlots={timeSlots}
        subjects={subjects}
      />
    </div>
  );
};

export default GenerateTT;
