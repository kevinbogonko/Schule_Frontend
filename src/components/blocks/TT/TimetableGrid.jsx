import React, { useState, useRef, useEffect } from "react";
import ReusableDiv from "../../ui/ReusableDiv";
import ReusableInput from "../../ui/ReusableInput";
import Dropdown from "../../ui/Dropdown";
import Button from "../../ui/Button";
import api from "../../../hooks/api";
import {
  formOptions,
  termOptions,
  yearOptions,
  timeSlotClusterOptions,
  subjectColors,
  days,
} from "../../../utils/CommonData";

const RadioButton = ({ label, name, value, checked, onChange }) => (
  <label className="inline-flex items-center mt-3">
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
    />
    <span className="ml-2 text-gray-700">{label}</span>
  </label>
);

const TimetableGrid = ({ syst_level }) => {
  let isCBC;
  syst_level === "Secondary (8-4-4)" ? (isCBC = false) : (isCBC = true);

  const [timetableData, setTimetableData] = useState({
    name: "",
    year: "",
    term: "",
    dayCluster: "",
    timeslotCluster: "",
  });

  const [dayClusterOptions, setDayClusterOptions] = useState([]);
  const [timeClusterOptions, setTimeClusterOptions] = useState([]);
  const [dayClustersData, setDayClustersData] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [optimizationMode, setOptimizationMode] = useState("auto");
  const [optimizationOptions, setOptimizationOptions] = useState({
    doublesFirst: false,
    group1First: false,
    group1And2First: false,
    customsLater: false,
  });

  const [selectedStream, setSelectedStream] = useState(1);
  const [gridContent, setGridContent] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [dragOverKey, setDragOverKey] = useState(null);
  const [animationKeys, setAnimationKeys] = useState([]);
  const draggingUID = useRef(null);
  const draggingFromCell = useRef(null);
  const [teacherConflicts, setTeacherConflicts] = useState({});
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeForms, setActiveForms] = useState([]);
  const [streams, setStreams] = useState([]);
  const [subjectsPerStream, setSubjectsPerStream] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const setFormOptions =
    formOptions.find((option) => option.label === syst_level)?.options || [];

  // Helper Functions
  const hasConsecutiveLessons = (subjectId, streamId, dayIndex, timeIndex) => {
    if (timeIndex > 0) {
      const prevKey = `${dayIndex}-${streamId}-${timeIndex - 1}`;
      if (gridContent[prevKey]?.id === subjectId) return true;
    }
    if (timeIndex < timeSlots.length - 1) {
      const nextKey = `${dayIndex}-${streamId}-${timeIndex + 1}`;
      if (gridContent[nextKey]?.id === subjectId) return true;
    }
    return false;
  };

  const checkTeacherConflicts = (
    dayIndex,
    timeIndex,
    teacherId,
    isPaired = false
  ) => {
    if (isPaired) return null;

    const conflicts = {};
    let hasConflict = false;

    streams.forEach((stream) => {
      const key = `${dayIndex}-${stream.id}-${timeIndex}`;
      const lesson = gridContent[key];
      if (lesson && lesson.teacherId) {
        const teachers = Array.isArray(lesson.teacherId)
          ? lesson.teacherId
          : [lesson.teacherId];

        if (teachers.includes(teacherId)) {
          conflicts[stream.id] = true;
          hasConflict = true;
        }
      }
    });

    return hasConflict ? conflicts : null;
  };

  const distributeSubjectsEvenly = (subject, count) => {
    const availableDays = [...Array(days.length).keys()].sort(
      () => Math.random() - 0.5
    );
    const lessonsPerDay = Math.floor(count / availableDays.length);
    let remainingLessons = count % availableDays.length;

    return availableDays
      .map((dayIndex) => {
        const lessonsForDay = lessonsPerDay + (remainingLessons-- > 0 ? 1 : 0);
        return lessonsForDay > 0 ? { dayIndex, count: lessonsForDay } : null;
      })
      .filter(Boolean);
  };

  // NEW: Check for double lessons
  const isDoubleLesson = (dayIndex, streamId, timeIndex) => {
    const currentKey = `${dayIndex}-${streamId}-${timeIndex}`;
    const nextKey = `${dayIndex}-${streamId}-${timeIndex + 1}`;

    const currentLesson = gridContent[currentKey];
    const nextLesson = gridContent[nextKey];

    return (
      currentLesson &&
      nextLesson &&
      currentLesson.id === nextLesson.id &&
      !currentLesson.isDouble && // Not already marked as double
      !nextLesson.isDouble
    );
  };

  // NEW: Check if slot is before second break/lunch for CBC
  const isBeforeSecondBreak = (timeIndex, timeSlots) => {
    if (!isCBC) return true; // For non-CBC, always return true

    let breakCount = 0;
    for (let i = 0; i <= timeIndex; i++) {
      if (timeSlots[i]?.type === "break" || timeSlots[i]?.type === "lunch") {
        breakCount++;
        if (breakCount >= 2) {
          return false;
        }
      }
    }
    return true;
  };

  // NEW: Check if slot is after first break for CBC subjects [20108, 30109, 41108]
  const isAfterFirstBreak = (timeIndex, timeSlots) => {
    if (!isCBC) return true;

    let foundFirstBreak = false;
    for (let i = 0; i <= timeIndex; i++) {
      if (timeSlots[i]?.type === "break") {
        foundFirstBreak = true;
        break;
      }
    }
    return foundFirstBreak;
  };

  // Fetch time slots when time cluster is selected
  const fetchTimeSlots = async () => {
    const { year, term, timeslotCluster } = timetableData;
    if (!year || !term || !timeslotCluster) return;

    try {
      const response = await api.post("/timetable/gettimeslots", {
        year: parseInt(year),
        term: parseInt(term),
        utility: timeslotCluster.toLowerCase(),
      });

      const formattedTimeSlots = response.data
        .map((slot) => ({
          id: slot.id,
          label: `${slot.starts.slice(0, 5)} - ${slot.ends.slice(0, 5)}`,
          type: slot.category.toLowerCase(),
        }))
        .sort((a, b) => {
          const aStart = a.label.split(" - ")[0];
          const bStart = b.label.split(" - ")[0];
          return aStart.localeCompare(bStart);
        });

      console.log(formattedTimeSlots);
      setTimeSlots(formattedTimeSlots);
    } catch (error) {
      console.error("Error fetching time slots:", error);
    }
  };

  // Fetch teachers when year is selected
  const fetchTeachers = async () => {
    const { year } = timetableData;
    if (!year) return;

    try {
      const response = await api.post("/teacher/getteachers", {
        year: parseInt(year),
      });
      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  useEffect(() => {
    fetchTimeSlots();
    fetchTeachers();
  }, [timetableData.timeslotCluster, timetableData.year]);

  // Fetch data when time cluster is selected
  useEffect(() => {
    const fetchData = async () => {
      const { year, term, timeslotCluster } = timetableData;
      if (!year || !term || !timeslotCluster) return;

      try {
        const subjConfigResponse = await api.post(
          "/timetable/getallsubjconfig",
          {
            year: parseInt(year),
            form: activeForms,
            term: parseInt(term),
            utility: timeslotCluster,
          }
        );

        console.log(subjConfigResponse.data);

        const formattedSubjects = subjConfigResponse.data.map((subject) => ({
          id: subject.id,
          isCustom: subject.iscustom === 1,
          singles: subject.singles,
          doubles: subject.doubles,
          isMerged: subject.ismerged === 1,
          mergedWith: subject.merged_with
            ? [parseInt(subject.merged_with)]
            : [],
          isPaired: subject.ispaird === 1,
          pair: subject.pair ? [parseInt(subject.pair)] : [],
          mergeAlias: subject.merge_alias,
          mergeSingles: subject.merge_singles,
          mergeDoubles: subject.merge_doubles,
          code: subject.code,
          name: subject.alias,
          form: subject.form,
          utility: subject.utility,
        }));

        const streamsResponse = await api.post("/stream/getformstreams", {
          year: parseInt(year),
          forms: activeForms,
        });

        const formattedStreams = streamsResponse.data.map((stream) => ({
          id: stream.id,
          name: `${stream.form}${stream.stream_name.charAt(0)}`,
          form: stream.form,
          streamName: stream.stream_name,
        }));

        const teachersResponse = await api.post(
          "/teacher/getallsubjectteachers",
          {
            year: parseInt(year),
            forms: activeForms,
          }
        );

        const combinedSubjects = formattedSubjects
          .map((subject) => {
            const teachersForSubject = teachersResponse.data.filter(
              (teacher) =>
                teacher.code === subject.code && teacher.form === subject.form
            );

            const streamTeachers = {};
            teachersForSubject.forEach((teacher) => {
              streamTeachers[teacher.stream_id] = teacher.teacher_id;
            });

            const relevantStreams = formattedStreams.filter(
              (stream) => stream.form === subject.form
            );

            return {
              ...subject,
              streamId: relevantStreams.map((stream) => stream.id),
              teacherId: relevantStreams.map(
                (stream) => streamTeachers[stream.id] ?? null
              ),
            };
          })
          .filter((subject) => subject.streamId.length > 0);

        setSubjectsPerStream(combinedSubjects);
        setStreams(formattedStreams);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [timetableData.timeslotCluster]);

  useEffect(() => {
    const fetchDayClusters = async () => {
      if (timetableData.year && timetableData.term) {
        try {
          const response = await api.post("/timetable/getdayclusters", {
            year: Number(timetableData.year),
            term: Number(timetableData.term),
          });
          const data = response.data;
          setDayClustersData(data);
          const options = data.map((cluster) => ({
            value: cluster.id.toString(),
            label: cluster.cluster_name,
          }));
          setDayClusterOptions(options);
        } catch (error) {
          console.error("Error fetching day clusters:", error);
        }
      }
    };

    const fetchActiveForms = async (setFormOptions) => {
      try {
        const response = setFormOptions.map((formOption) => {
          return formOption?.value;
        });
        setActiveForms(response);
      } catch (err) {
        console.error("Failed to fetch active forms", err);
        setActiveForms([]);
      }
    };

    fetchDayClusters();
    fetchActiveForms(setFormOptions);
  }, [timetableData.year, timetableData.term]);

  useEffect(() => {
    if (timetableData.dayCluster) {
      const selectedCluster = dayClustersData.find(
        (cluster) => cluster.id.toString() === timetableData.dayCluster
      );
      if (selectedCluster) {
        const availableUtilities = Object.entries(selectedCluster.utilities)
          .filter(([_, value]) => value === 1)
          .map(([key]) => key);

        const options = timeSlotClusterOptions.filter((option) =>
          availableUtilities.includes(option.value)
        );
        setTimeClusterOptions(options);
      }
    }
  }, [timetableData.dayCluster, dayClustersData]);

  const handleInputChange = (e) => {
    if (e.target) {
      const { name, value } = e.target;
      setTimetableData((prev) => ({
        ...prev,
        [name]: value,
        ...(name === "year" || name === "term"
          ? { dayCluster: "", timeslotCluster: "" }
          : {}),
        ...(name === "dayCluster" ? { timeslotCluster: "" } : {}),
      }));
    } else {
      const { name, value } = e;
      setTimetableData((prev) => ({
        ...prev,
        [name]: value,
        ...(name === "year" || name === "term"
          ? { dayCluster: "", timeslotCluster: "" }
          : {}),
        ...(name === "dayCluster" ? { timeslotCluster: "" } : {}),
      }));
    }
  };

  const isCreateDisabled = () => {
    return (
      !timetableData.name ||
      !timetableData.year ||
      !timetableData.term ||
      !timetableData.dayCluster ||
      !timetableData.timeslotCluster
    );
  };

  const handleOptimizationOptionChange = (e) => {
    const { name, checked } = e.target;
    setOptimizationOptions((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleResetOptimization = () => {
    setOptimizationOptions({
      doublesFirst: false,
      group1First: false,
      group1And2First: false,
      customsLater: false,
    });
  };

  const handleClear = () => {
    setTimetableData({
      name: "",
      year: "",
      term: "",
      dayCluster: "",
      timeslotCluster: "",
    });
    setGridContent({});
    setTeacherConflicts({});
  };

  const calculatePeriodsPerWeek = (subject) => {
    if (subject.isMerged) {
      return subject.mergeSingles + subject.mergeDoubles * 2;
    }
    return subject.singles + subject.doubles * 2;
  };

  const handleSaveChanges = async () => {
    if (
      !timetableData.year ||
      !timetableData.term ||
      !timetableData.dayCluster ||
      !timetableData.timeslotCluster
    ) {
      alert("Please fill all required timetable fields");
      return;
    }

    try {
      const lessons = [];
      Object.entries(gridContent).forEach(([key, lesson]) => {
        const [dayIndex, class_id, timeIndex] = key.split("-").map(Number);
        const day = days[dayIndex].name;
        const teacher = teachers.find((t) => t.id === lesson.teacherId);
        const teacherName = teacher
          ? `${teacher.title} ${teacher.lname}`
          : "Unknown";
        const teacherTag = teacher?.teacher_tag;

        lessons.push({
          id: lesson.id,
          code: lesson.code,
          alias: lesson.name,
          subject: lesson.name,
          teacher_tag: teacherTag,
          teacher: teacherName,
          day: day,
          timeSlot_id: timeSlots[timeIndex].id,
          class_id: class_id,
        });
      });

      const payload = {
        year: parseInt(timetableData.year),
        term: parseInt(timetableData.term),
        timetable_name: timetableData.name,
        day_cluster_id: parseInt(timetableData.dayCluster),
        utility: timetableData.timeslotCluster.toLowerCase(),
        lessons: lessons,
      };

      const response = await api.post("/timetable/committimetable", payload);
      console.log("Save changes response:", response.data);
      alert("Timetable saved successfully!");
    } catch (error) {
      console.error("Error saving timetable:", error);
      alert("Failed to save timetable");
    }
  };

const handleCreate = async () => {
  setIsOptimizing(true);
  try {
    setGridContent({});
    setTeacherConflicts({});
    const newGridContent = {};
    const subjectAssignments = {};
    const teacherAssignments = {};
    const teacherDayAssignments = {};
    const conflictLogs = [];

    const logConflict = (type, message, data = {}) => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        type,
        message,
        data,
      };
      conflictLogs.push(logEntry);
      console.warn(`[Conflict] ${type}: ${message}`, data);
    };

    // Helper functions for CBC constraints
    const isAfterFirstBreak = (timeIndex, timeSlots) => {
      let breakFound = false;
      for (let i = 0; i < timeIndex; i++) {
        if (timeSlots[i]?.type === "break") {
          breakFound = true;
          break;
        }
      }
      return breakFound;
    };

    const isBeforeSecondBreak = (timeIndex, timeSlots) => {
      let breakCount = 0;
      for (let i = 0; i < timeIndex; i++) {
        if (timeSlots[i]?.type === "break") {
          breakCount++;
          if (breakCount >= 2) {
            return false;
          }
        }
      }
      return breakCount < 2;
    };

    const isBeforeLunch = (timeIndex, timeSlots) => {
      for (let i = timeIndex; i < timeSlots.length; i++) {
        if (timeSlots[i]?.type === "lunch") {
          return true;
        }
      }
      return false;
    };

    // Calculate 80% of timeslots before lunch
    const calculate80PercentBeforeLunchSlots = (timeSlots) => {
      const totalLessonSlotsBeforeLunch = timeSlots.reduce(
        (count, slot, index) => {
          const isBeforeLunchSlot = isBeforeLunch(index, timeSlots);
          return count + (slot.type === "lesson" && isBeforeLunchSlot ? 1 : 0);
        },
        0
      );

      return Math.floor(totalLessonSlotsBeforeLunch * 0.8);
    };

    const resolveConflicts = () => {
      console.log("Resolving conflicts...");

      Object.keys(teacherDayAssignments).forEach((teacherId) => {
        days.forEach((_, dayIndex) => {
          const teacherSlots = teacherDayAssignments[teacherId]?.[dayIndex];
          if (!teacherSlots) return;

          const slotCounts = {};
          const conflictingSlots = [];

          teacherSlots.forEach((slot) => {
            slotCounts[slot] = (slotCounts[slot] || 0) + 1;
          });

          Object.keys(slotCounts).forEach((slot) => {
            if (slotCounts[slot] > 1) {
              conflictingSlots.push(parseInt(slot));
            }
          });

          if (conflictingSlots.length > 0) {
            logConflict(
              "TEACHER_DOUBLE_BOOKING",
              `Teacher ${teacherId} has conflicts on day ${dayIndex} at slots: ${conflictingSlots.join(
                ", "
              )}`,
              { teacherId, dayIndex, conflictingSlots }
            );

            conflictingSlots.forEach((slot) => {
              const slotString = `${dayIndex}-${slot}`;
              let firstFound = false;

              Object.keys(newGridContent).forEach((key) => {
                const [dIndex, streamId, tIndex] = key.split("-").map(Number);
                if (
                  dIndex === dayIndex &&
                  tIndex === slot &&
                  newGridContent[key]?.teacherId === teacherId
                ) {
                  if (!firstFound) {
                    firstFound = true;
                    logConflict(
                      "CONFLICT_RESOLVED",
                      `Keeping assignment at ${key} for teacher ${teacherId}`,
                      { key, subject: newGridContent[key]?.name }
                    );
                  } else {
                    logConflict(
                      "CONFLICT_RESOLVED",
                      `Removing conflicting assignment at ${key} for teacher ${teacherId}`,
                      { key, subject: newGridContent[key]?.name }
                    );

                    const subject = newGridContent[key];
                    if (subject) {
                      subjectAssignments[subject.id].assigned--;
                      if (subject.isDouble) {
                        subjectAssignments[subject.id].doublesAssigned--;
                        const doubleKey = `${dayIndex}-${streamId}-${slot + 1}`;
                        if (newGridContent[doubleKey]) {
                          delete newGridContent[doubleKey];
                          teacherDayAssignments[teacherId][dayIndex].delete(
                            slot + 1
                          );
                          subjectAssignments[subject.id].assigned--;
                          subjectAssignments[subject.id].doublesAssigned--;
                        }
                      } else {
                        subjectAssignments[subject.id].singlesAssigned--;
                      }
                    }

                    delete newGridContent[key];
                    teacherDayAssignments[teacherId][dayIndex].delete(slot);

                    if (teacherAssignments[teacherId]?.[dayIndex]) {
                      teacherAssignments[teacherId][dayIndex].delete(slot);
                    }
                  }
                }
              });
            });
          }
        });
      });

      days.forEach((_, dayIndex) => {
        const streams = [
          ...new Set(subjectsPerStream.flatMap((s) => s.streamId)),
        ];

        streams.forEach((streamId) => {
          let consecutiveCount = 0;
          let consecutiveStart = 0;

          for (let timeIndex = 0; timeIndex < timeSlots.length; timeIndex++) {
            const key = `${dayIndex}-${streamId}-${timeIndex}`;

            if (
              newGridContent[key] &&
              timeSlots[timeIndex]?.type === "lesson"
            ) {
              if (consecutiveCount === 0) {
                consecutiveStart = timeIndex;
              }
              consecutiveCount++;

              if (consecutiveCount >= 3) {
                logConflict(
                  "THREE_CONSECUTIVE_LESSONS",
                  `Stream ${streamId} has ${consecutiveCount} consecutive lessons on day ${dayIndex} starting at slot ${consecutiveStart}`,
                  {
                    streamId,
                    dayIndex,
                    consecutiveCount,
                    startSlot: consecutiveStart,
                  }
                );

                const middleSlot = consecutiveStart + 1;
                const middleKey = `${dayIndex}-${streamId}-${middleSlot}`;

                if (newGridContent[middleKey]) {
                  const subject = newGridContent[middleKey];

                  const alternativeSlot = findAlternativeSlot(
                    streamId,
                    dayIndex,
                    subject,
                    newGridContent
                  );

                  if (alternativeSlot !== -1) {
                    logConflict(
                      "CONFLICT_RESOLVED",
                      `Moving lesson from ${middleKey} to alternative slot ${alternativeSlot}`,
                      {
                        originalSlot: middleSlot,
                        newSlot: alternativeSlot,
                        subject: subject.name,
                      }
                    );

                    const newKey = `${dayIndex}-${streamId}-${alternativeSlot}`;
                    newGridContent[newKey] = {
                      ...subject,
                      uid: `${subject.id}-${Date.now()}-moved`,
                    };

                    if (subject.teacherId) {
                      teacherDayAssignments[subject.teacherId]?.[
                        dayIndex
                      ]?.delete(middleSlot);
                      teacherDayAssignments[subject.teacherId] =
                        teacherDayAssignments[subject.teacherId] || {};
                      teacherDayAssignments[subject.teacherId][dayIndex] =
                        teacherDayAssignments[subject.teacherId][dayIndex] ||
                        new Set();
                      teacherDayAssignments[subject.teacherId][dayIndex].add(
                        alternativeSlot
                      );

                      if (teacherAssignments[subject.teacherId]) {
                        teacherAssignments[subject.teacherId][dayIndex]?.delete(
                          middleSlot
                        );
                        teacherAssignments[subject.teacherId][dayIndex] =
                          teacherAssignments[subject.teacherId][dayIndex] ||
                          new Set();
                        teacherAssignments[subject.teacherId][dayIndex].add(
                          alternativeSlot
                        );
                      }
                    }

                    delete newGridContent[middleKey];
                  } else {
                    logConflict(
                      "CONFLICT_UNRESOLVED",
                      `Could not find alternative slot for ${middleKey}`,
                      { key: middleKey, subject: subject.name }
                    );
                  }
                }
                consecutiveCount = 0;
              }
            } else {
              consecutiveCount = 0;
            }
          }
        });
      });

      console.log(
        `Resolved ${
          conflictLogs.filter((l) => l.type === "CONFLICT_RESOLVED").length
        } conflicts`
      );
    };

    const findAlternativeSlot = (streamId, dayIndex, subject, currentGrid) => {
      for (let timeIndex = 0; timeIndex < timeSlots.length; timeIndex++) {
        if (timeSlots[timeIndex].type !== "lesson") continue;

        const key = `${dayIndex}-${streamId}-${timeIndex}`;

        if (currentGrid[key]) continue;

        const fridayIndex = days.findIndex((day) => day.name === "Friday");
        const firstLessonSlot = timeSlots.findIndex(
          (slot) => slot.type === "lesson"
        );

        // FIX 1: PPI should ALWAYS be in first timeslot on Friday
        if (
          dayIndex === fridayIndex &&
          timeIndex === firstLessonSlot &&
          isCBC &&
          subject.code !== 900
        ) {
          // First slot on Friday is reserved ONLY for PPI (id: 900)
          continue;
        }

        // Check CBC specific constraints
        if (isCBC) {
          // Special subjects must be after first break
          const specialSubjects = [20108, 30109, 41108];
          if (specialSubjects.includes(subject.code)) {
            if (!isAfterFirstBreak(timeIndex, timeSlots)) continue;
          }

          // beforeSecondBreakSubjects should be 80% before lunch
          const beforeSecondBreakSubjects = [
            10101, 10102, 10103, 20103, 20102, 20105, 20106, 30101, 30102,
            30103, 40101, 40102, 40103, 40104,
          ];

          if (beforeSecondBreakSubjects.includes(subject.code)) {
            // Calculate how many of these subjects have been placed before lunch
            const subjectsBeforeLunchCount = Object.keys(currentGrid).filter(
              (key) => {
                const [dIdx, sId, tIdx] = key.split("-").map(Number);
                const cellSubject = currentGrid[key];
                return (
                  dIdx === dayIndex &&
                  sId === streamId &&
                  beforeSecondBreakSubjects.includes(cellSubject?.id) &&
                  isBeforeLunch(tIdx, timeSlots)
                );
              }
            ).length;

            const maxBeforeLunch =
              calculate80PercentBeforeLunchSlots(timeSlots);

            if (
              subjectsBeforeLunchCount >= maxBeforeLunch &&
              isBeforeLunch(timeIndex, timeSlots)
            ) {
              // Already reached 80% limit for before lunch
              continue;
            }

            // Must be before second break
            if (!isBeforeSecondBreak(timeIndex, timeSlots)) continue;
          }
        }

        if (
          subject.teacherId &&
          !checkTeacherAvailability(subject.teacherId, dayIndex, timeIndex)
        ) {
          continue;
        }

        if (
          hasThreeConsecutiveLessons(streamId, dayIndex, timeIndex, currentGrid)
        ) {
          continue;
        }

        return timeIndex;
      }

      for (let dIndex = 0; dIndex < days.length; dIndex++) {
        if (dIndex === dayIndex) continue;

        for (let timeIndex = 0; timeIndex < timeSlots.length; timeIndex++) {
          if (timeSlots[timeIndex].type !== "lesson") continue;

          const key = `${dIndex}-${streamId}-${timeIndex}`;

          if (currentGrid[key]) continue;

          const fridayIndex = days.findIndex((day) => day.name === "Friday");
          const firstLessonSlot = timeSlots.findIndex(
            (slot) => slot.type === "lesson"
          );

          // FIX 1: PPI should ALWAYS be in first timeslot on Friday
          if (
            dIndex === fridayIndex &&
            timeIndex === firstLessonSlot &&
            isCBC &&
            subject.code !== 900
          ) {
            continue;
          }

          // Check CBC specific constraints
          if (isCBC) {
            // Special subjects must be after first break
            const specialSubjects = [20108, 30109, 41108];
            if (specialSubjects.includes(subject.code)) {
              if (!isAfterFirstBreak(timeIndex, timeSlots)) continue;
            }

            // beforeSecondBreakSubjects should be 80% before lunch
            const beforeSecondBreakSubjects = [
              10101, 10102, 10103, 20103, 20102, 20105, 20106, 30101, 30102,
              30103, 40101, 40102, 40103, 40104,
            ];

            if (beforeSecondBreakSubjects.includes(subject.code)) {
              // Calculate how many of these subjects have been placed before lunch
              const subjectsBeforeLunchCount = Object.keys(currentGrid).filter(
                (key) => {
                  const [dIdx, sId, tIdx] = key.split("-").map(Number);
                  const cellSubject = currentGrid[key];
                  return (
                    dIdx === dIndex &&
                    sId === streamId &&
                    beforeSecondBreakSubjects.includes(cellSubject?.id) &&
                    isBeforeLunch(tIdx, timeSlots)
                  );
                }
              ).length;

              const maxBeforeLunch =
                calculate80PercentBeforeLunchSlots(timeSlots);

              if (
                subjectsBeforeLunchCount >= maxBeforeLunch &&
                isBeforeLunch(timeIndex, timeSlots)
              ) {
                continue;
              }

              if (!isBeforeSecondBreak(timeIndex, timeSlots)) continue;
            }
          }

          if (
            subject.teacherId &&
            !checkTeacherAvailability(subject.teacherId, dIndex, timeIndex)
          ) {
            continue;
          }

          if (
            hasThreeConsecutiveLessons(streamId, dIndex, timeIndex, currentGrid)
          ) {
            continue;
          }

          return timeIndex + dIndex * 100;
        }
      }

      return -1;
    };

    // Initialize subject assignments with proper counts
    subjectsPerStream.forEach((subject) => {
      const periodsPerWeek = calculatePeriodsPerWeek(subject);
      subjectAssignments[subject.id] = {
        assigned: 0,
        max: periodsPerWeek,
        singlesAssigned: 0,
        doublesAssigned: 0,
        singlesNeeded: subject.singles || 0,
        doublesNeeded: subject.doubles || 0,
      };
    });

    const initializeTeacherAssignments = () => {
      subjectsPerStream.forEach((subject) => {
        const teacherIds = Array.isArray(subject.teacherId)
          ? subject.teacherId
          : [subject.teacherId];

        teacherIds.forEach((teacherId) => {
          if (!teacherDayAssignments[teacherId]) {
            teacherDayAssignments[teacherId] = {};
            days.forEach((_, dayIndex) => {
              teacherDayAssignments[teacherId][dayIndex] = new Set();
            });
          }
        });
      });
    };

    initializeTeacherAssignments();

    const checkTeacherAvailability = (
      teacherId,
      dayIndex,
      timeIndex,
      isDouble = false
    ) => {
      if (!teacherDayAssignments[teacherId]) return true;

      const assignments = teacherDayAssignments[teacherId][dayIndex];

      if (!assignments) return true;

      if (isDouble) {
        return !assignments.has(timeIndex) && !assignments.has(timeIndex + 1);
      }

      return !assignments.has(timeIndex);
    };

    const reserveTeacherTimeslot = (
      teacherId,
      dayIndex,
      timeIndex,
      isDouble = false
    ) => {
      if (!teacherDayAssignments[teacherId]) {
        teacherDayAssignments[teacherId] = {};
        days.forEach((_, idx) => {
          teacherDayAssignments[teacherId][idx] = new Set();
        });
      }

      if (!teacherDayAssignments[teacherId][dayIndex]) {
        teacherDayAssignments[teacherId][dayIndex] = new Set();
      }

      teacherDayAssignments[teacherId][dayIndex].add(timeIndex);
      if (isDouble) {
        teacherDayAssignments[teacherId][dayIndex].add(timeIndex + 1);
      }
    };

    const hasThreeConsecutiveLessons = (
      streamId,
      dayIndex,
      timeIndex,
      grid = newGridContent
    ) => {
      let consecutiveCount = 0;

      for (let i = 1; i <= 2; i++) {
        const checkIndex = timeIndex - i;
        if (checkIndex >= 0) {
          const key = `${dayIndex}-${streamId}-${checkIndex}`;
          if (grid[key] && timeSlots[checkIndex]?.type === "lesson") {
            consecutiveCount++;
          } else {
            break;
          }
        }
      }

      const currentKey = `${dayIndex}-${streamId}-${timeIndex}`;
      if (!grid[currentKey] && timeSlots[timeIndex]?.type === "lesson") {
        consecutiveCount++;
      }

      if (consecutiveCount >= 3) {
        logConflict(
          "THREE_CONSECUTIVE_PREVENTION",
          `Placing lesson at ${currentKey} would create ${consecutiveCount} consecutive lessons`,
          { streamId, dayIndex, timeIndex, consecutiveCount }
        );
        return true;
      }

      consecutiveCount = 0;
      for (let i = 0; i < 3; i++) {
        const checkIndex = timeIndex + i;
        if (checkIndex < timeSlots.length) {
          const key = `${dayIndex}-${streamId}-${checkIndex}`;
          if (
            (grid[key] || (i === 0 && !grid[currentKey])) &&
            timeSlots[checkIndex]?.type === "lesson"
          ) {
            consecutiveCount++;
          } else {
            break;
          }
        }
      }

      if (consecutiveCount >= 3) {
        return true;
      }

      return false;
    };

    const findValidSlot = (
      streamId,
      dayIndex,
      isDouble = false,
      excludeFirstFridaySlot = true
    ) => {
      const validSlots = [];
      const fridayIndex = days.findIndex((day) => day.name === "Friday");
      const firstLessonSlot = timeSlots.findIndex(
        (slot) => slot.type === "lesson"
      );
      const hasPPI = subjectsPerStream.some((s) => s.id === 900);

      for (let timeIndex = 0; timeIndex < timeSlots.length; timeIndex++) {
        if (timeSlots[timeIndex].type !== "lesson") continue;

        // FIX 1: Friday first slot is reserved ONLY for PPI
        if (
          excludeFirstFridaySlot &&
          dayIndex === fridayIndex &&
          timeIndex === firstLessonSlot &&
          hasPPI &&
          isCBC
        ) {
          continue;
        }

        // Check CBC constraints
        if (isCBC) {
          // Special subjects must be after first break
          const specialSubjects = [20108, 30109, 41108];
          const currentSubject = subjectsPerStream.find((s) =>
            s.streamId.includes(streamId)
          );

          if (currentSubject && specialSubjects.includes(currentSubject.code)) {
            if (!isAfterFirstBreak(timeIndex, timeSlots)) continue;
          }

          // beforeSecondBreakSubjects 80% before lunch constraint
          const beforeSecondBreakSubjects = [
            10101, 10102, 10103, 20103, 20102, 20105, 20106, 30101, 30102,
            30103, 40101, 40102, 40103, 40104,
          ];

          if (
            currentSubject &&
            beforeSecondBreakSubjects.includes(currentSubject.code)
          ) {
            // Count how many of these subjects are already placed before lunch
            const subjectsBeforeLunchCount = Object.keys(newGridContent).filter(
              (key) => {
                const [dIdx, sId, tIdx] = key.split("-").map(Number);
                const cellSubject = newGridContent[key];
                return (
                  dIdx === dayIndex &&
                  sId === streamId &&
                  beforeSecondBreakSubjects.includes(cellSubject?.id) &&
                  isBeforeLunch(tIdx, timeSlots)
                );
              }
            ).length;

            const maxBeforeLunch =
              calculate80PercentBeforeLunchSlots(timeSlots);

            if (
              subjectsBeforeLunchCount >= maxBeforeLunch &&
              isBeforeLunch(timeIndex, timeSlots)
            ) {
              continue;
            }

            if (!isBeforeSecondBreak(timeIndex, timeSlots)) continue;
          }
        }

        if (isDouble) {
          if (timeIndex >= timeSlots.length - 1) continue;
          if (timeSlots[timeIndex + 1].type !== "lesson") continue;

          if (
            excludeFirstFridaySlot &&
            dayIndex === fridayIndex &&
            (timeIndex === firstLessonSlot ||
              timeIndex + 1 === firstLessonSlot) &&
            hasPPI &&
            isCBC
          ) {
            continue;
          }

          const key1 = `${dayIndex}-${streamId}-${timeIndex}`;
          const key2 = `${dayIndex}-${streamId}-${timeIndex + 1}`;

          if (newGridContent[key1] || newGridContent[key2]) continue;

          if (
            hasThreeConsecutiveLessons(streamId, dayIndex, timeIndex) ||
            hasThreeConsecutiveLessons(streamId, dayIndex, timeIndex + 1)
          ) {
            continue;
          }

          validSlots.push(timeIndex);
        } else {
          const key = `${dayIndex}-${streamId}-${timeIndex}`;

          if (newGridContent[key]) continue;

          if (hasThreeConsecutiveLessons(streamId, dayIndex, timeIndex)) {
            continue;
          }

          validSlots.push(timeIndex);
        }
      }

      return validSlots;
    };

    // FIX 1: Reserve Friday first slot for PPI for ALL streams
    const fridayIndex = days.findIndex((day) => day.name === "Friday");
    const firstLessonSlot = timeSlots.findIndex(
      (slot) => slot.type === "lesson"
    );

    if (fridayIndex !== -1 && firstLessonSlot !== -1 && isCBC) {
      const ppiSubject = subjectsPerStream.find((s) => s.code === 900);
      if (ppiSubject) {
        logConflict(
          "PPI_ASSIGNMENT",
          `Reserving Friday (day ${fridayIndex}) first slot (${firstLessonSlot}) for PPI for all streams`,
          {
            dayIndex: fridayIndex,
            timeIndex: firstLessonSlot,
            subject: "PPI",
          }
        );

        // Get all unique streams from subjectsPerStream
        const allStreams = [
          ...new Set(subjectsPerStream.flatMap((s) => s.streamId)),
        ];

        // Assign PPI to ALL streams on Friday first slot
        allStreams.forEach((streamId) => {
          const key = `${fridayIndex}-${streamId}-${firstLessonSlot}`;

          // Find teacher for this specific stream
          let teacherId;
          if (Array.isArray(ppiSubject.teacherId)) {
            const streamIndex = ppiSubject.streamId.indexOf(streamId);
            teacherId =
              streamIndex >= 0
                ? ppiSubject.teacherId[streamIndex]
                : ppiSubject.teacherId[0];
          } else {
            teacherId = ppiSubject.teacherId;
          }

          // Check if teacherId exists and is available, but still assign the lesson if not
          let canAssign = true;
          let teacherConflict = false;

          if (teacherId) {
            if (
              !checkTeacherAvailability(teacherId, fridayIndex, firstLessonSlot)
            ) {
              teacherConflict = true;
              logConflict(
                "PPI_TEACHER_CONFLICT",
                `Teacher ${teacherId} not available for PPI on Friday first slot for stream ${streamId}, but will assign anyway`,
                {
                  teacherId,
                  streamId,
                  dayIndex: fridayIndex,
                  timeIndex: firstLessonSlot,
                }
              );
              // Still allow assignment despite teacher conflict for PPI
            }
          } else {
            // No teacher assigned at all - use a placeholder
            teacherId = "NO_TEACHER_ASSIGNED";
            logConflict(
              "PPI_NO_TEACHER",
              `No teacher assigned for PPI in stream ${streamId}, using placeholder`,
              { streamId }
            );
          }

          // Always assign PPI regardless of teacher availability
          const subjectIndex = subjectsPerStream.findIndex(
            (s) => s.code === ppiSubject.code
          );

          newGridContent[key] = {
            ...ppiSubject,
            uid: `${ppiSubject.id}-${Date.now()}-${streamId}`,
            color: subjectColors[subjectIndex % subjectColors.length],
            teacherId: teacherId,
          };

          // Only reserve teacher timeslot if teacher exists and is available
          if (
            teacherId &&
            teacherId !== "NO_TEACHER_ASSIGNED" &&
            !teacherConflict
          ) {
            reserveTeacherTimeslot(teacherId, fridayIndex, firstLessonSlot);

            if (!teacherAssignments[teacherId]) {
              teacherAssignments[teacherId] = {};
            }
            if (!teacherAssignments[teacherId][fridayIndex]) {
              teacherAssignments[teacherId][fridayIndex] = new Set();
            }
            teacherAssignments[teacherId][fridayIndex].add(firstLessonSlot);
          }

          // Initialize subject assignments if not exists
          if (!subjectAssignments[ppiSubject.id]) {
            subjectAssignments[ppiSubject.id] = {
              assigned: 0,
              max: calculatePeriodsPerWeek(ppiSubject),
              singlesAssigned: 0,
              doublesAssigned: 0,
            };
          }

          subjectAssignments[ppiSubject.id].assigned++;
          subjectAssignments[ppiSubject.id].singlesAssigned++;

          logConflict(
            teacherConflict ? "PPI_ASSIGNED_WITH_CONFLICT" : "PPI_ASSIGNED",
            `Assigned PPI to stream ${streamId} on Friday first slot ${
              teacherConflict ? "(with teacher conflict)" : ""
            }`,
            {
              streamId,
              teacherId,
              key,
              hasTeacherConflict: teacherConflict,
            }
          );
        });
      } else {
        logConflict(
          "PPI_INFO",
          "PPI subject (id=900) not found. Friday first slot will be available for other lessons.",
          { dayIndex: fridayIndex, timeIndex: firstLessonSlot }
        );
      }
    }

    // Process merged subjects first
    const processedMergedSubjects = new Set();
    subjectsPerStream.forEach((subject) => {
      if (subject.isMerged && !processedMergedSubjects.has(subject.code)) {
        const mergedSubjects = [
          subject,
          ...subjectsPerStream.filter((s) =>
            subject.mergedWith.includes(s.code)
          ),
        ];

        const mergeGroupLeader = mergedSubjects[0];
        const totalPeriods =
          mergeGroupLeader.mergeSingles + mergeGroupLeader.mergeDoubles * 2;

        let doublesAssigned = 0;
        const maxAttempts = 50;
        let attempts = 0;

        while (
          doublesAssigned < mergeGroupLeader.mergeDoubles &&
          attempts < maxAttempts
        ) {
          attempts++;
          const randomDay = Math.floor(Math.random() * days.length);

          let availableSlots;
          const specialSubjects = [20108, 30109, 41108];
          if (isCBC && specialSubjects.includes(subject.code)) {
            const allSlots = findValidSlot(
              subject.streamId[0],
              randomDay,
              true,
              true
            );
            availableSlots = allSlots.filter((slot) =>
              isAfterFirstBreak(slot, timeSlots)
            );
          } else {
            availableSlots = findValidSlot(
              subject.streamId[0],
              randomDay,
              true,
              true
            );
          }

          if (availableSlots.length > 0) {
            const timeIndex =
              availableSlots[Math.floor(Math.random() * availableSlots.length)];

            let hasTeacherConflict = false;
            const teacherConflicts = {};

            mergedSubjects.forEach((mergedSubject) => {
              mergedSubject.streamId.forEach((streamId, idx) => {
                const teacherId = Array.isArray(mergedSubject.teacherId)
                  ? mergedSubject.teacherId[idx]
                  : mergedSubject.teacherId;

                if (
                  !checkTeacherAvailability(
                    teacherId,
                    randomDay,
                    timeIndex,
                    true
                  )
                ) {
                  hasTeacherConflict = true;
                  teacherConflicts[teacherId] = {
                    dayIndex: randomDay,
                    timeIndex,
                  };
                }
              });
            });

            if (!hasTeacherConflict) {
              mergedSubjects.forEach((mergedSubject) => {
                mergedSubject.streamId.forEach((streamId, idx) => {
                  const key1 = `${randomDay}-${streamId}-${timeIndex}`;
                  const key2 = `${randomDay}-${streamId}-${timeIndex + 1}`;

                  const teacherId = Array.isArray(mergedSubject.teacherId)
                    ? mergedSubject.teacherId[idx]
                    : mergedSubject.teacherId;

                  newGridContent[key1] = {
                    ...mergedSubject,
                    name: mergeGroupLeader.mergeAlias || mergedSubject.name,
                    uid: `${mergedSubject.id}-${Date.now()}-1`,
                    color:
                      subjectColors[
                        mergedSubjects.findIndex(
                          (s) => s.id === mergedSubject.id
                        ) % subjectColors.length
                      ],
                    isDouble: true,
                    teacherId: teacherId,
                  };

                  newGridContent[key2] = {
                    ...mergedSubject,
                    name: mergeGroupLeader.mergeAlias || mergedSubject.name,
                    uid: `${mergedSubject.id}-${Date.now()}-2`,
                    color:
                      subjectColors[
                        mergedSubjects.findIndex(
                          (s) => s.id === mergedSubject.id
                        ) % subjectColors.length
                      ],
                    isDouble: true,
                    teacherId: teacherId,
                  };

                  subjectAssignments[mergedSubject.id].assigned += 2;
                  subjectAssignments[mergedSubject.id].doublesAssigned += 1;

                  reserveTeacherTimeslot(teacherId, randomDay, timeIndex, true);

                  if (!teacherAssignments[teacherId]) {
                    teacherAssignments[teacherId] = {};
                  }
                  if (!teacherAssignments[teacherId][randomDay]) {
                    teacherAssignments[teacherId][randomDay] = new Set();
                  }
                  teacherAssignments[teacherId][randomDay].add(timeIndex);
                  teacherAssignments[teacherId][randomDay].add(timeIndex + 1);
                });
              });
              doublesAssigned++;
              attempts = 0; // Reset attempts counter on success
            }
          }
        }

        if (doublesAssigned < mergeGroupLeader.mergeDoubles) {
          logConflict(
            "ASSIGNMENT_WARNING",
            `Could only assign ${doublesAssigned} of ${mergeGroupLeader.mergeDoubles} doubles for merged subject ${subject.name}`,
            {
              subject: subject.name,
              doublesAssigned,
              required: mergeGroupLeader.mergeDoubles,
            }
          );
        }

        const singlesToAssign = mergeGroupLeader.mergeSingles;
        let singlesAssigned = 0;
        attempts = 0;

        while (singlesAssigned < singlesToAssign && attempts < maxAttempts) {
          attempts++;
          const randomDay = Math.floor(Math.random() * days.length);

          let availableSlots;
          const specialSubjects = [20108, 30109, 41108];
          const beforeSecondBreakSubjects = [
            10101, 10102, 10103, 20103, 20102, 20105, 20106, 30101, 30102,
            30103, 40101, 40102, 40103, 40104,
          ];

          if (isCBC) {
            const allSlots = findValidSlot(
              subject.streamId[0],
              randomDay,
              false,
              true
            );

            if (specialSubjects.includes(subject.code)) {
              availableSlots = allSlots.filter((slot) =>
                isAfterFirstBreak(slot, timeSlots)
              );
            } else if (beforeSecondBreakSubjects.includes(subject.code)) {
              const allSlotsBeforeBreak = allSlots.filter((slot) =>
                isBeforeSecondBreak(slot, timeSlots)
              );

              const subjectsBeforeLunchCount = Object.keys(
                newGridContent
              ).filter((key) => {
                const [dIdx, sId, tIdx] = key.split("-").map(Number);
                const cellSubject = newGridContent[key];
                return (
                  dIdx === randomDay &&
                  beforeSecondBreakSubjects.includes(cellSubject?.id) &&
                  isBeforeLunch(tIdx, timeSlots)
                );
              }).length;

              const maxBeforeLunch =
                calculate80PercentBeforeLunchSlots(timeSlots);

              if (subjectsBeforeLunchCount < maxBeforeLunch) {
                const slotsBeforeLunch = allSlotsBeforeBreak.filter((slot) =>
                  isBeforeLunch(slot, timeSlots)
                );
                availableSlots =
                  slotsBeforeLunch.length > 0
                    ? slotsBeforeLunch
                    : allSlotsBeforeBreak;
              } else {
                availableSlots = allSlotsBeforeBreak.filter(
                  (slot) => !isBeforeLunch(slot, timeSlots)
                );
              }
            } else {
              availableSlots = allSlots;
            }
          } else {
            availableSlots = findValidSlot(
              subject.streamId[0],
              randomDay,
              false,
              true
            );
          }

          if (availableSlots.length > 0) {
            const timeIndex =
              availableSlots[Math.floor(Math.random() * availableSlots.length)];

            let hasTeacherConflict = false;
            const teacherConflicts = {};

            mergedSubjects.forEach((mergedSubject) => {
              mergedSubject.streamId.forEach((streamId, idx) => {
                const teacherId = Array.isArray(mergedSubject.teacherId)
                  ? mergedSubject.teacherId[idx]
                  : mergedSubject.teacherId;

                if (
                  !checkTeacherAvailability(teacherId, randomDay, timeIndex)
                ) {
                  hasTeacherConflict = true;
                  teacherConflicts[teacherId] = {
                    dayIndex: randomDay,
                    timeIndex,
                  };
                }
              });
            });

            if (!hasTeacherConflict) {
              mergedSubjects.forEach((mergedSubject) => {
                mergedSubject.streamId.forEach((streamId, idx) => {
                  const key = `${randomDay}-${streamId}-${timeIndex}`;
                  const teacherId = Array.isArray(mergedSubject.teacherId)
                    ? mergedSubject.teacherId[idx]
                    : mergedSubject.teacherId;

                  newGridContent[key] = {
                    ...mergedSubject,
                    name: mergeGroupLeader.mergeAlias || mergedSubject.name,
                    uid: `${mergedSubject.id}-${Date.now()}`,
                    color:
                      subjectColors[
                        mergedSubjects.findIndex(
                          (s) => s.id === mergedSubject.id
                        ) % subjectColors.length
                      ],
                    teacherId: teacherId,
                  };
                  subjectAssignments[mergedSubject.id].assigned++;
                  subjectAssignments[mergedSubject.id].singlesAssigned++;

                  reserveTeacherTimeslot(teacherId, randomDay, timeIndex);

                  if (!teacherAssignments[teacherId]) {
                    teacherAssignments[teacherId] = {};
                  }
                  if (!teacherAssignments[teacherId][randomDay]) {
                    teacherAssignments[teacherId][randomDay] = new Set();
                  }
                  teacherAssignments[teacherId][randomDay].add(timeIndex);
                });
              });
              singlesAssigned++;
              attempts = 0; // Reset attempts counter on success
            }
          }
        }

        if (singlesAssigned < singlesToAssign) {
          logConflict(
            "ASSIGNMENT_WARNING",
            `Could only assign ${singlesAssigned} of ${singlesToAssign} singles for merged subject ${subject.name}`,
            {
              subject: subject.name,
              singlesAssigned,
              required: singlesToAssign,
            }
          );
        }

        mergedSubjects.forEach((s) => processedMergedSubjects.add(s.id));
      }
    });

    // Process non-merged subjects with doubles
    const subjectsWithDoubles = subjectsPerStream
      .filter(
        (subject) =>
          !subject.isMerged && subject.doubles > 0 && subject.id !== 900
      )
      .sort(() => Math.random() - 0.5);

    subjectsWithDoubles.forEach((subject) => {
      const targetStreams = subject.streamId;
      let doublesAssigned = 0;
      const maxAttempts = 30;
      let attempts = 0;

      const daysToAssign = [...Array(days.length).keys()]
        .sort(() => Math.random() - 0.5)
        .slice(0, subject.doubles * 2); // Give more days to try

      while (
        doublesAssigned < subject.doubles &&
        attempts < maxAttempts &&
        daysToAssign.length > 0
      ) {
        attempts++;
        const dayIndex = daysToAssign.shift();

        let availableDoubleSlots;
        if (isCBC && subject.code === 41108) {
          const allSlots = findValidSlot(
            targetStreams[0],
            dayIndex,
            true,
            true
          );
          availableDoubleSlots = allSlots.filter((slot) =>
            isAfterFirstBreak(slot, timeSlots)
          );
        } else if (isCBC && [20108, 30109].includes(subject.code)) {
          continue;
        } else {
          availableDoubleSlots = findValidSlot(
            targetStreams[0],
            dayIndex,
            true,
            true
          );
        }

        const filteredSlots = availableDoubleSlots.filter((timeIndex) => {
          let allStreamsAvailable = true;

          for (const streamId of targetStreams) {
            const key1 = `${dayIndex}-${streamId}-${timeIndex}`;
            const key2 = `${dayIndex}-${streamId}-${timeIndex + 1}`;

            if (newGridContent[key1] || newGridContent[key2]) {
              allStreamsAvailable = false;
              break;
            }

            const teacherId = Array.isArray(subject.teacherId)
              ? subject.teacherId[targetStreams.indexOf(streamId)]
              : subject.teacherId;

            if (
              !checkTeacherAvailability(teacherId, dayIndex, timeIndex, true)
            ) {
              allStreamsAvailable = false;
              break;
            }
          }

          return allStreamsAvailable;
        });

        if (filteredSlots.length > 0) {
          const randomSlotIndex = Math.floor(
            Math.random() * filteredSlots.length
          );
          const timeIndex = filteredSlots[randomSlotIndex];

          targetStreams.forEach((streamId, idx) => {
            const key1 = `${dayIndex}-${streamId}-${timeIndex}`;
            const key2 = `${dayIndex}-${streamId}-${timeIndex + 1}`;

            const subjectIndex = subjectsPerStream.findIndex(
              (s) => s.id === subject.id
            );

            const teacherId = Array.isArray(subject.teacherId)
              ? subject.teacherId[idx]
              : subject.teacherId;

            newGridContent[key1] = {
              ...subject,
              uid: `${subject.id}-${Date.now()}-1`,
              color: subjectColors[subjectIndex % subjectColors.length],
              isDouble: true,
              teacherId: teacherId,
            };

            newGridContent[key2] = {
              ...subject,
              uid: `${subject.id}-${Date.now()}-2`,
              color: subjectColors[subjectIndex % subjectColors.length],
              isDouble: true,
              teacherId: teacherId,
            };

            subjectAssignments[subject.id].assigned += 2;
            subjectAssignments[subject.id].doublesAssigned += 1;

            reserveTeacherTimeslot(teacherId, dayIndex, timeIndex, true);

            if (!teacherAssignments[teacherId]) {
              teacherAssignments[teacherId] = {};
            }
            if (!teacherAssignments[teacherId][dayIndex]) {
              teacherAssignments[teacherId][dayIndex] = new Set();
            }
            teacherAssignments[teacherId][dayIndex].add(timeIndex);
            teacherAssignments[teacherId][dayIndex].add(timeIndex + 1);
          });

          doublesAssigned++;
          attempts = 0; // Reset attempts counter on success
        }
      }

      if (doublesAssigned < subject.doubles) {
        logConflict(
          "ASSIGNMENT_WARNING",
          `Could only assign ${doublesAssigned} of ${subject.doubles} doubles for subject ${subject.name}`,
          { subject: subject.name, doublesAssigned, required: subject.doubles }
        );
      }
    });

    // Process singles for all subjects (excluding PPI which was already assigned)
    const subjectsWithSingles = subjectsPerStream
      .filter((subject) => !subject.isMerged && subject.code !== 900)
      .sort(() => Math.random() - 0.5);

    // First pass: Try to allocate all required singles
    subjectsWithSingles.forEach((subject) => {
      const remainingSingles = Math.max(
        0,
        (subject.singles || 0) - subjectAssignments[subject.id].singlesAssigned
      );

      if (remainingSingles > 0) {
        const targetStreams = subject.streamId;
        const maxAttemptsPerStream = 20;

        targetStreams.forEach((streamId, streamIdx) => {
          let singlesAssignedForStream = 0;
          let attempts = 0;

          while (
            singlesAssignedForStream < remainingSingles &&
            attempts < maxAttemptsPerStream
          ) {
            attempts++;

            // Try different days
            const shuffledDays = [...Array(days.length).keys()].sort(
              () => Math.random() - 0.5
            );

            for (const dayIndex of shuffledDays) {
              if (singlesAssignedForStream >= remainingSingles) break;

              // Apply CBC constraints
              let availableSlots;
              const specialSubjects = [20108, 30109, 41108];
              const beforeSecondBreakSubjects = [
                10101, 10102, 10103, 20103, 20102, 20105, 20106, 30101, 30102,
                30103, 40101, 40102, 40103, 40104,
              ];

              if (isCBC) {
                const allSlots = findValidSlot(
                  streamId,
                  dayIndex,
                  false,
                  true
                ).sort(() => Math.random() - 0.5);

                if (specialSubjects.includes(subject.code)) {
                  availableSlots = allSlots.filter((slot) =>
                    isAfterFirstBreak(slot, timeSlots)
                  );
                } else if (beforeSecondBreakSubjects.includes(subject.code)) {
                  const allSlotsBeforeBreak = allSlots.filter((slot) =>
                    isBeforeSecondBreak(slot, timeSlots)
                  );

                  const subjectsBeforeLunchCount = Object.keys(
                    newGridContent
                  ).filter((key) => {
                    const [dIdx, sId, tIdx] = key.split("-").map(Number);
                    const cellSubject = newGridContent[key];
                    return (
                      dIdx === dayIndex &&
                      sId === streamId &&
                      beforeSecondBreakSubjects.includes(cellSubject?.id) &&
                      isBeforeLunch(tIdx, timeSlots)
                    );
                  }).length;

                  const maxBeforeLunch =
                    calculate80PercentBeforeLunchSlots(timeSlots);

                  if (subjectsBeforeLunchCount < maxBeforeLunch) {
                    const slotsBeforeLunch = allSlotsBeforeBreak.filter(
                      (slot) => isBeforeLunch(slot, timeSlots)
                    );
                    availableSlots =
                      slotsBeforeLunch.length > 0
                        ? slotsBeforeLunch
                        : allSlotsBeforeBreak;
                  } else {
                    availableSlots = allSlotsBeforeBreak.filter(
                      (slot) => !isBeforeLunch(slot, timeSlots)
                    );
                  }
                } else {
                  availableSlots = allSlots;
                }
              } else {
                availableSlots = findValidSlot(
                  streamId,
                  dayIndex,
                  false,
                  true
                ).sort(() => Math.random() - 0.5);
              }

              if (availableSlots.length > 0) {
                const timeIndex = availableSlots[0];
                const key = `${dayIndex}-${streamId}-${timeIndex}`;

                const teacherId = Array.isArray(subject.teacherId)
                  ? subject.teacherId[streamIdx]
                  : subject.teacherId;

                if (!checkTeacherAvailability(teacherId, dayIndex, timeIndex)) {
                  continue;
                }

                const subjectIndex = subjectsPerStream.findIndex(
                  (s) => s.id === subject.id
                );

                newGridContent[key] = {
                  ...subject,
                  uid: `${subject.id}-${Date.now()}-${key}`,
                  color: subjectColors[subjectIndex % subjectColors.length],
                  teacherId: teacherId,
                };

                subjectAssignments[subject.id].assigned++;
                subjectAssignments[subject.id].singlesAssigned++;
                singlesAssignedForStream++;

                reserveTeacherTimeslot(teacherId, dayIndex, timeIndex);

                if (!teacherAssignments[teacherId]) {
                  teacherAssignments[teacherId] = {};
                }
                if (!teacherAssignments[teacherId][dayIndex]) {
                  teacherAssignments[teacherId][dayIndex] = new Set();
                }
                teacherAssignments[teacherId][dayIndex].add(timeIndex);

                attempts = 0; // Reset attempts counter on success
                break; // Move to next iteration
              }
            }
          }

          if (singlesAssignedForStream < remainingSingles) {
            logConflict(
              "ASSIGNMENT_WARNING",
              `Could only assign ${singlesAssignedForStream} of ${remainingSingles} singles for subject ${subject.name} in stream ${streamId}`,
              {
                subject: subject.name,
                streamId,
                singlesAssigned: singlesAssignedForStream,
                required: remainingSingles,
              }
            );
          }
        });
      }
    });

    // Second pass: Try to fill remaining periods with any available slots
    subjectsWithSingles.forEach((subject) => {
      const periodsPerWeek = calculatePeriodsPerWeek(subject);
      const alreadyAssigned = subjectAssignments[subject.id].assigned;
      const remainingPeriods = Math.max(0, periodsPerWeek - alreadyAssigned);

      if (remainingPeriods > 0) {
        logConflict(
          "ASSIGNMENT_INFO",
          `Subject ${subject.name} has ${remainingPeriods} remaining periods to assign`,
          { subject: subject.name, alreadyAssigned, periodsPerWeek }
        );

        const targetStreams = subject.streamId;

        targetStreams.forEach((streamId, streamIdx) => {
          let periodsAssigned = 0;

          // Try to assign remaining periods more aggressively
          for (
            let dayIndex = 0;
            dayIndex < days.length && periodsAssigned < remainingPeriods;
            dayIndex++
          ) {
            for (
              let timeIndex = 0;
              timeIndex < timeSlots.length &&
              periodsAssigned < remainingPeriods;
              timeIndex++
            ) {
              if (timeSlots[timeIndex].type !== "lesson") continue;

              const key = `${dayIndex}-${streamId}-${timeIndex}`;

              // Skip if slot is already taken
              if (newGridContent[key]) continue;

              // Skip Friday first slot if it's reserved for PPI
              if (
                dayIndex === fridayIndex &&
                timeIndex === firstLessonSlot &&
                isCBC
              ) {
                continue;
              }

              const teacherId = Array.isArray(subject.teacherId)
                ? subject.teacherId[streamIdx]
                : subject.teacherId;

              if (!checkTeacherAvailability(teacherId, dayIndex, timeIndex)) {
                continue;
              }

              // Check for consecutive lessons
              if (hasThreeConsecutiveLessons(streamId, dayIndex, timeIndex)) {
                continue;
              }

              const subjectIndex = subjectsPerStream.findIndex(
                (s) => s.id === subject.id
              );

              newGridContent[key] = {
                ...subject,
                uid: `${subject.id}-${Date.now()}-${key}`,
                color: subjectColors[subjectIndex % subjectColors.length],
                teacherId: teacherId,
              };

              subjectAssignments[subject.id].assigned++;
              subjectAssignments[subject.id].singlesAssigned++;
              periodsAssigned++;

              reserveTeacherTimeslot(teacherId, dayIndex, timeIndex);

              if (!teacherAssignments[teacherId]) {
                teacherAssignments[teacherId] = {};
              }
              if (!teacherAssignments[teacherId][dayIndex]) {
                teacherAssignments[teacherId][dayIndex] = new Set();
              }
              teacherAssignments[teacherId][dayIndex].add(timeIndex);
            }
          }

          if (periodsAssigned > 0) {
            logConflict(
              "ASSIGNMENT_SUCCESS",
              `Assigned ${periodsAssigned} additional periods for subject ${subject.name} in stream ${streamId}`,
              { subject: subject.name, streamId, periodsAssigned }
            );
          }
        });
      }
    });

    resolveConflicts();

    const finalValidation = () => {
      console.log("Running final validation...");

      let remainingTeacherConflicts = 0;
      Object.keys(teacherDayAssignments).forEach((teacherId) => {
        days.forEach((_, dayIndex) => {
          const slotCounts = {};
          teacherDayAssignments[teacherId]?.[dayIndex]?.forEach((slot) => {
            slotCounts[slot] = (slotCounts[slot] || 0) + 1;
          });

          Object.keys(slotCounts).forEach((slot) => {
            if (slotCounts[slot] > 1) {
              remainingTeacherConflicts++;
              logConflict(
                "REMAINING_TEACHER_CONFLICT",
                `Teacher ${teacherId} still has ${slotCounts[slot]} assignments at day ${dayIndex}, slot ${slot}`,
                {
                  teacherId,
                  dayIndex,
                  slot: parseInt(slot),
                  count: slotCounts[slot],
                }
              );
            }
          });
        });
      });

      let remainingConsecutiveConflicts = 0;
      days.forEach((_, dayIndex) => {
        const streams = [
          ...new Set(subjectsPerStream.flatMap((s) => s.streamId)),
        ];

        streams.forEach((streamId) => {
          let consecutiveCount = 0;
          for (let timeIndex = 0; timeIndex < timeSlots.length; timeIndex++) {
            const key = `${dayIndex}-${streamId}-${timeIndex}`;
            if (
              newGridContent[key] &&
              timeSlots[timeIndex]?.type === "lesson"
            ) {
              consecutiveCount++;
              if (consecutiveCount >= 3) {
                remainingConsecutiveConflicts++;
                logConflict(
                  "REMAINING_CONSECUTIVE_CONFLICT",
                  `Stream ${streamId} still has ${consecutiveCount} consecutive lessons on day ${dayIndex} at slot ${timeIndex}`,
                  { streamId, dayIndex, timeIndex, consecutiveCount }
                );
              }
            } else {
              consecutiveCount = 0;
            }
          }
        });
      });

      // Check CBC constraint compliance
      let cbcConstraintViolations = 0;
      if (isCBC) {
        // Check PPI is in first Friday slot for all streams
        const ppiSubject = subjectsPerStream.find((s) => s.code === 900);
        if (ppiSubject) {
          // Get all streams that should have PPI (ALL streams)
          const allStreams = [
            ...new Set(subjectsPerStream.flatMap((s) => s.streamId)),
          ];

          allStreams.forEach((streamId) => {
            const key = `${fridayIndex}-${streamId}-${firstLessonSlot}`;
            if (!newGridContent[key] || newGridContent[key].id !== 900) {
              cbcConstraintViolations++;
              logConflict(
                "CBC_PPI_VIOLATION",
                `PPI not in first Friday slot for stream ${streamId}`,
                { streamId, expectedSlot: `${fridayIndex}-${firstLessonSlot}` }
              );
            }
          });
        }

        // Check special subjects are after first break
        const specialSubjects = [20108, 30109, 41108];
        Object.keys(newGridContent).forEach((key) => {
          const [dayIndex, streamId, timeIndex] = key.split("-").map(Number);
          const subject = newGridContent[key];

          if (specialSubjects.includes(subject.code)) {
            if (!isAfterFirstBreak(timeIndex, timeSlots)) {
              cbcConstraintViolations++;
              logConflict(
                "CBC_SPECIAL_SUBJECT_VIOLATION",
                `Special subject ${subject.name} (${subject.id}) not after first break`,
                { subject: subject.name, id: subject.id, timeIndex, key }
              );
            }
          }
        });

        // Check beforeSecondBreakSubjects 80% before lunch constraint
        const beforeSecondBreakSubjects = [
          10101, 10102, 10103, 20103, 20102, 20105, 20106, 30101, 30102, 30103,
          40101, 40102, 40103, 40104,
        ];

        const totalSubjectsBeforeLunch = Object.keys(newGridContent).filter(
          (key) => {
            const [dayIndex, streamId, timeIndex] = key.split("-").map(Number);
            const subject = newGridContent[key];
            return (
              beforeSecondBreakSubjects.includes(subject?.code) &&
              isBeforeLunch(timeIndex, timeSlots)
            );
          }
        ).length;

        const totalBeforeBreakSubjects = Object.keys(newGridContent).filter(
          (key) => {
            const subject = newGridContent[key];
            return beforeSecondBreakSubjects.includes(subject?.code);
          }
        ).length;

        if (totalBeforeBreakSubjects > 0) {
          const percentageBeforeLunch =
            (totalSubjectsBeforeLunch / totalBeforeBreakSubjects) * 100;
          if (percentageBeforeLunch < 80) {
            cbcConstraintViolations++;
            logConflict(
              "CBC_80_PERCENT_VIOLATION",
              `Only ${percentageBeforeLunch.toFixed(
                1
              )}% of beforeSecondBreakSubjects are before lunch (minimum 80%)`,
              {
                percentageBeforeLunch,
                totalSubjectsBeforeLunch,
                totalBeforeBreakSubjects,
              }
            );
          }
        }
      }

      // Check if all subjects have their required periods
      let missingPeriods = 0;
      subjectsPerStream.forEach((subject) => {
        const periodsPerWeek = calculatePeriodsPerWeek(subject);
        const assigned = subjectAssignments[subject.id]?.assigned || 0;

        if (assigned < periodsPerWeek) {
          missingPeriods += periodsPerWeek - assigned;
          logConflict(
            "MISSING_PERIODS",
            `Subject ${subject.name} has only ${assigned} of ${periodsPerWeek} periods assigned`,
            { subject: subject.name, assigned, required: periodsPerWeek }
          );
        }
      });

      console.log(
        `Final validation: ${remainingTeacherConflicts} teacher conflicts, ${remainingConsecutiveConflicts} consecutive lesson conflicts, ${cbcConstraintViolations} CBC constraint violations, ${missingPeriods} missing periods`
      );

      return {
        teacherConflicts: remainingTeacherConflicts,
        consecutiveConflicts: remainingConsecutiveConflicts,
        cbcConstraintViolations: cbcConstraintViolations,
        missingPeriods: missingPeriods,
        totalConflicts:
          remainingTeacherConflicts +
          remainingConsecutiveConflicts +
          cbcConstraintViolations +
          missingPeriods,
      };
    };

    const validationResults = finalValidation();
    console.log("Conflict Logs:", conflictLogs);
    console.log("Validation Results:", validationResults);
    console.log(
      "Subject Assignments Summary:",
      Object.keys(subjectAssignments).map((id) => {
        const subject = subjectsPerStream.find((s) => s.id == id);
        return {
          name: subject?.name,
          id: id,
          assigned: subjectAssignments[id].assigned,
          max: subjectAssignments[id].max,
          singlesAssigned: subjectAssignments[id].singlesAssigned,
          doublesAssigned: subjectAssignments[id].doublesAssigned,
        };
      })
    );

    setGridContent(newGridContent);

    const payload = {
      name: timetableData.name,
      year: Number(timetableData.year),
      term: Number(timetableData.term),
      day_cluster_id: Number(timetableData.dayCluster),
      time_slot_cluster: timetableData.timeslotCluster,
      timetable_data: newGridContent,
      optimization_options: optimizationOptions,
      conflict_logs: conflictLogs,
      validation_results: validationResults,
    };

    console.log("Final timetable payload:", payload);
  } catch (error) {
    console.error("Error in timetable generation:", error);
    logConflict("GENERATION_ERROR", error.message, { error });
  } finally {
    setIsOptimizing(false);
  }
};

  const handleOptimize = async () => {
    if (isOptimizing) return;
    setIsOptimizing(true);

    try {
      await handleCreate();
    } finally {
      setIsOptimizing(false);
    }
  };

  useEffect(() => {
    const filteredSubjects = subjectsPerStream
      .filter((subject) => subject.streamId.includes(selectedStream))
      .map((subject, index) => {
        const periodsPerWeek = subject.singles + subject.doubles * 2;
        return {
          ...subject,
          label: subject.isMerged
            ? subject.mergeAlias || subject.name
            : subject.name,
          color:
            subject.isMerged && subject.mergeAlias
              ? subjectColors[
                  subjectsPerStream.findIndex(
                    (s) => s.mergeAlias === subject.mergeAlias
                  ) % subjectColors.length
                ]
              : subjectColors[index % subjectColors.length],
          count: periodsPerWeek,
        };
      });

    setSubjects(filteredSubjects);
  }, [selectedStream, subjectsPerStream]);

  const logGridArray = () => {
    const gridArray = days.map((day, dayIndex) => {
      return streams.map((stream) => {
        return timeSlots.map((timeSlot, timeIndex) => {
          const key = `${dayIndex}-${stream.id}-${timeIndex}`;
          const item = gridContent[key];

          if (item && timeSlots[timeIndex].type === "lesson") {
            return {
              name: item.name,
              streamId: item.streamId,
              teacherId: item.teacherId,
              time: timeSlots[timeIndex].label,
              day: days[dayIndex].name,
            };
          }
          return null;
        });
      });
    });
    console.log("Current Grid Array:", gridArray);
  };

  useEffect(() => {
    logGridArray();
  }, [gridContent]);

  const allowDrop = (dayIndex, timeIndex, streamId, e) => {
    if (timeSlots[timeIndex].type === "lesson" && streamId === selectedStream) {
      e.preventDefault();
      setDragOverKey(`${dayIndex}-${streamId}-${timeIndex}`);
    }
  };

  const handleDragLeave = () => {
    setDragOverKey(null);
  };

  const handleDragStart = (subject, cellKey = null) => {
    if (cellKey && !cellKey.includes(`-${selectedStream}-`)) return;

    const uid = `${subject.label}-${Date.now()}`;
    draggingUID.current = { ...subject, uid };
    draggingFromCell.current = cellKey;
  };

  const handleDrop = (dayIndex, timeIndex, streamId, e) => {
    e.preventDefault();
    if (streamId !== selectedStream) return;

    const key = `${dayIndex}-${streamId}-${timeIndex}`;
    const dragged = draggingUID.current;
    const fromKey = draggingFromCell.current;

    // NEW: Check for conflicts before allowing drop
    if (dragged && timeSlots[timeIndex].type === "lesson") {
      // Check 1: Teacher conflicts
      if (dragged.teacherId) {
        const conflicts = checkTeacherConflicts(
          dayIndex,
          timeIndex,
          dragged.teacherId,
          dragged.isPaired
        );

        if (conflicts) {
          console.error("Teacher conflict detected:", conflicts);
          alert(`Cannot drop: Teacher conflict at this timeslot!`);
          setDragOverKey(null);
          draggingUID.current = null;
          draggingFromCell.current = null;
          return;
        }
      }

      // Check 2: Friday first slot reservation for PPI (id 900) if CBC
      const fridayIndex = days.findIndex((day) => day.name === "Friday");
      const firstLessonSlot = timeSlots.findIndex(
        (slot) => slot.type === "lesson"
      );

      if (isCBC && dayIndex === fridayIndex && timeIndex === firstLessonSlot) {
        // Check if this is PPI
        if (dragged.id !== 900) {
          // Check if PPI already exists in this slot
          const existingPPI = Object.values(gridContent).find(
            (lesson) => lesson.id === 900 && lesson.streamId?.includes(streamId)
          );

          if (existingPPI) {
            console.error(
              "Cannot place non-PPI subject in Friday first slot when PPI exists"
            );
            alert("Friday first slot is reserved for PPI (CBC mode)!");
            setDragOverKey(null);
            draggingUID.current = null;
            draggingFromCell.current = null;
            return;
          }
        }
      }

      // Check 3: CBC constraints for special subjects
      if (isCBC) {
        // Check for subjects [20108, 30109, 41108] - must be after first break
        if ([20108, 30109, 41108].includes(dragged.id)) {
          if (!isAfterFirstBreak(timeIndex, timeSlots)) {
            console.error(
              "CBC constraint violation: Subject must be after first break"
            );
            alert(
              "This subject must be scheduled after the first break (CBC mode)!"
            );
            setDragOverKey(null);
            draggingUID.current = null;
            draggingFromCell.current = null;
            return;
          }
        }

        // Check for subjects that should be before second break/lunch
        const beforeSecondBreakSubjects = [
          10101, 10102, 10103, 20103, 20102, 20105, 20106, 30101, 30102, 30103,
          40101, 40102, 40103, 40104,
        ];

        if (beforeSecondBreakSubjects.includes(dragged.id)) {
          if (!isBeforeSecondBreak(timeIndex, timeSlots)) {
            console.error(
              "CBC constraint violation: Subject should be before second break"
            );
            alert(
              "This subject should be scheduled before the second break/lunch (CBC mode)!"
            );
            setDragOverKey(null);
            draggingUID.current = null;
            draggingFromCell.current = null;
            return;
          }
        }
      }

      // Check 4: Check for 3 consecutive lessons
      let consecutiveCount = 1; // Count current slot

      // Check previous slots
      for (let i = 1; i <= 2; i++) {
        const prevIndex = timeIndex - i;
        if (prevIndex >= 0) {
          const prevKey = `${dayIndex}-${streamId}-${prevIndex}`;
          if (gridContent[prevKey] && timeSlots[prevIndex]?.type === "lesson") {
            consecutiveCount++;
          } else {
            break;
          }
        }
      }

      // Check next slots
      for (let i = 1; i <= 2; i++) {
        const nextIndex = timeIndex + i;
        if (nextIndex < timeSlots.length) {
          const nextKey = `${dayIndex}-${streamId}-${nextIndex}`;
          if (gridContent[nextKey] && timeSlots[nextIndex]?.type === "lesson") {
            consecutiveCount++;
          } else {
            break;
          }
        }
      }

      if (consecutiveCount >= 3) {
        console.error("Cannot drop: Would create 3 consecutive lessons");
        alert("Cannot schedule: This would create 3 consecutive lessons!");
        setDragOverKey(null);
        draggingUID.current = null;
        draggingFromCell.current = null;
        return;
      }

      // Check 5: Check for double lessons
      if (fromKey) {
        // If moving from a cell, check if it was part of a double lesson
        const [fromDay, fromStream, fromTime] = fromKey.split("-").map(Number);
        if (isDoubleLesson(fromDay, fromStream, fromTime)) {
          console.error("Cannot move: Part of a double lesson");
          alert("Cannot move: This lesson is part of a double lesson!");
          setDragOverKey(null);
          draggingUID.current = null;
          draggingFromCell.current = null;
          return;
        }
      }

      // Check 6: Check if creating a double lesson
      if (gridContent[key]?.id === dragged.id) {
        // Check if adjacent to same subject
        const prevKey = `${dayIndex}-${streamId}-${timeIndex - 1}`;
        const nextKey = `${dayIndex}-${streamId}-${timeIndex + 1}`;

        if (
          (gridContent[prevKey]?.id === dragged.id &&
            timeSlots[timeIndex - 1]?.type === "lesson") ||
          (gridContent[nextKey]?.id === dragged.id &&
            timeSlots[timeIndex + 1]?.type === "lesson")
        ) {
          console.error("Cannot create double lesson");
          alert(
            "Cannot create double lessons! Subjects must be separated by breaks."
          );
          setDragOverKey(null);
          draggingUID.current = null;
          draggingFromCell.current = null;
          return;
        }
      }

      setAnimationKeys([key, fromKey]);

      if (fromKey && fromKey !== key && gridContent[fromKey]) {
        setGridContent((prev) => {
          const updated = { ...prev };
          const temp = updated[key];
          updated[key] = updated[fromKey];
          updated[fromKey] = temp;
          return updated;
        });
      } else if (!gridContent[key]) {
        setGridContent((prev) => ({
          ...prev,
          [key]: {
            ...dragged,
            uid: dragged.uid,
          },
        }));

        setSubjects((prev) =>
          prev
            .map((s) =>
              s.id === dragged.id ? { ...s, count: s.count - 1 } : s
            )
            .filter((s) => s.count > 0)
        );
      }
    }

    draggingUID.current = null;
    draggingFromCell.current = null;
    setDragOverKey(null);
  };

  const handleRemove = (dayIndex, timeIndex, streamId) => {
    if (streamId !== selectedStream) return;

    const key = `${dayIndex}-${streamId}-${timeIndex}`;
    const removedItem = gridContent[key];
    if (!removedItem) return;

    // NEW: Check if part of a double lesson
    if (isDoubleLesson(dayIndex, streamId, timeIndex)) {
      console.error("Cannot remove: Part of a double lesson");
      alert("Cannot remove: This lesson is part of a double lesson!");
      return;
    }

    setGridContent((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });

    setSubjects((prev) => {
      const existing = prev.find((s) => s.id === removedItem.id);
      if (existing) {
        return prev.map((s) =>
          s.id === removedItem.id ? { ...s, count: s.count + 1 } : s
        );
      } else {
        return [
          ...prev,
          {
            ...removedItem,
            count: 1,
          },
        ];
      }
    });
  };

  const handleStreamChange = (e) => {
    setSelectedStream(Number(e.target.value));
  };

  return (
    <div className="w-full space-y-4 p-4">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">
        Generate Timetable
      </h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <ReusableDiv tag="Create TimeTable">
            <ReusableInput
              label="Name"
              type="text"
              placeholder="Timetable Name"
              value={timetableData.name}
              onChange={(e) => handleInputChange(e)}
              name="name"
              className="my-2"
            />

            <Dropdown
              label="Year"
              placeholder="Select Year"
              options={yearOptions}
              value={timetableData.year}
              onChange={(value) => handleInputChange({ name: "year", value })}
              name="year"
              className="my-2"
            />

            <Dropdown
              label="Term"
              placeholder="Select Term"
              options={termOptions}
              value={timetableData.term}
              onChange={(value) => handleInputChange({ name: "term", value })}
              name="term"
              className="my-2"
            />

            <Dropdown
              label="Day Cluster"
              placeholder="Select Day Cluster"
              options={dayClusterOptions}
              value={timetableData.dayCluster}
              onChange={(value) =>
                handleInputChange({ name: "dayCluster", value })
              }
              name="dayCluster"
              className="my-2"
              disabled={!timetableData.year || !timetableData.term}
            />

            <Dropdown
              label="Timeslot Cluster"
              placeholder="Select Time Cluster"
              options={timeClusterOptions}
              value={timetableData.timeslotCluster}
              onChange={(value) =>
                handleInputChange({ name: "timeslotCluster", value })
              }
              name="timeslotCluster"
              className="my-2"
              disabled={!timetableData.dayCluster}
            />

            <div className="flex space-x-4 mt-4">
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
              <Button
                variant="primary"
                onClick={handleCreate}
                disabled={isCreateDisabled() || isOptimizing}
              >
                {isOptimizing ? "Generating..." : "Create"}
              </Button>
            </div>
          </ReusableDiv>
        </div>

        <div className="flex-1">
          <ReusableDiv tag="Optimization">
            <div className="space-y-4">
              <div className="space-x-4">
                <RadioButton
                  label="Auto Generate"
                  name="optimizationMode"
                  value="auto"
                  checked={optimizationMode === "auto"}
                  onChange={() => setOptimizationMode("auto")}
                />
                <RadioButton
                  label="Manual Configuration"
                  name="optimizationMode"
                  value="manual"
                  checked={optimizationMode === "manual"}
                  onChange={() => setOptimizationMode("manual")}
                />
              </div>
              {optimizationMode === "auto" && (
                <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div className="font-medium mb-2">Optimization Options</div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="doublesFirst"
                        checked={optimizationOptions.doublesFirst}
                        onChange={handleOptimizationOptionChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-gray-700">Doubles first</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="group1First"
                        checked={optimizationOptions.group1First}
                        onChange={handleOptimizationOptionChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-gray-700">Group 1 first</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="group1And2First"
                        checked={optimizationOptions.group1And2First}
                        onChange={handleOptimizationOptionChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-gray-700">
                        Group 1 and 2 first
                      </span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="customsLater"
                        checked={optimizationOptions.customsLater}
                        onChange={handleOptimizationOptionChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-gray-700">Customs later</span>
                    </label>
                  </div>
                  <div className="flex space-x-4 mt-4">
                    <Button variant="outline" onClick={handleResetOptimization}>
                      Reset
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleOptimize}
                      disabled={isOptimizing}
                    >
                      {isOptimizing ? "Optimizing..." : "Optimize"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ReusableDiv>
        </div>
      </div>

      <ReusableDiv tag="TimeTable Grid">
        <div className="flex items-center justify-between gap-4 mb-4">
          {optimizationMode === "manual" && (
            <>
              <div className="gap-4">
                <label htmlFor="stream-select" className="font-medium">
                  Select Stream:
                </label>
                <select
                  id="stream-select"
                  value={selectedStream}
                  onChange={handleStreamChange}
                  className="ml-4 border border-gray-300 rounded px-3 py-2"
                >
                  {streams.map((stream) => (
                    <option key={stream.id} value={stream.id}>
                      {stream.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </div>

        <div className="overflow-x-auto">
          <div
            className="grid border border-gray-300 bg-white"
            style={{
              gridTemplateColumns: `100px ${
                streams.length > 1 ? "100px " : ""
              }repeat(${timeSlots.length}, 100px)`,
              width: "max-content",
            }}
          >
            <div className="p-2 font-bold text-center text-sm bg-gray-200 border border-gray-300">
              Day / Time
            </div>

            {streams.length > 1 && (
              <div className="p-2 font-bold text-center text-sm bg-gray-200 border border-gray-300">
                Streams
              </div>
            )}

            {timeSlots.map((slot, i) => (
              <div
                key={`time-${i}`}
                className="p-2 font-bold text-center text-sm bg-gray-200 border border-gray-300"
              >
                {slot.label}
              </div>
            ))}

            {days.map((day, dayIndex) => (
              <React.Fragment key={`day-${dayIndex}`}>
                <div
                  className="p-2 font-medium text-center text-sm bg-gray-100 border border-gray-300"
                  style={{ gridRow: `span ${streams.length}` }}
                >
                  {day.name}
                </div>

                {streams.map((stream) => (
                  <React.Fragment key={`stream-${stream.id}-${dayIndex}`}>
                    {streams.length > 1 && (
                      <div className="p-2 font-medium text-center text-sm bg-gray-50 border border-gray-300">
                        {stream.name}
                      </div>
                    )}

                    {timeSlots.map((slot, timeIndex) => {
                      const key = `${dayIndex}-${stream.id}-${timeIndex}`;
                      const item = gridContent[key];
                      const isRestricted = slot.type !== "lesson";
                      const isDragOver = dragOverKey === key;
                      const isSelectedStream = stream.id === selectedStream;

                      return (
                        <div
                          key={`cell-${dayIndex}-${stream.id}-${timeIndex}`}
                          className={`relative p-2 min-h-[50px] text-center text-sm border border-gray-300 transition-all duration-150 ease-in-out ${
                            isRestricted
                              ? slot.type === "break"
                                ? "bg-gray-100"
                                : slot.type === "games" && day.hasGames
                                ? "bg-green-100"
                                : "bg-gray-100"
                              : isDragOver && isSelectedStream
                              ? "ring-2 ring-blue-400 bg-blue-50"
                              : !isSelectedStream
                              ? "bg-gray-50"
                              : ""
                          }`}
                          onDrop={(e) =>
                            isSelectedStream &&
                            handleDrop(dayIndex, timeIndex, stream.id, e)
                          }
                          onDragOver={(e) =>
                            allowDrop(dayIndex, timeIndex, stream.id, e)
                          }
                          onDragLeave={handleDragLeave}
                        >
                          {isRestricted ? (
                            <span className="text-xs font-semibold text-gray-500">
                              {slot.type.charAt(0).toUpperCase() +
                                slot.type.slice(1)}
                            </span>
                          ) : item ? (
                            <div
                              className={`px-3 py-1 rounded text-black ${
                                isSelectedStream
                                  ? "cursor-move"
                                  : "cursor-default"
                              } relative ${item.color} ${
                                animationKeys.includes(key)
                                  ? "animate-fade-in"
                                  : ""
                              }`}
                              draggable={isSelectedStream}
                              onDragStart={(e) =>
                                isSelectedStream && handleDragStart(item, key)
                              }
                              onAnimationEnd={() =>
                                setAnimationKeys((prev) =>
                                  prev.filter((k) => k !== key)
                                )
                              }
                            >
                              {item.name}
                              {isSelectedStream && (
                                <button
                                  className="absolute top-0 right-0 text-xs px-1 text-red-600 hover:text-red-900"
                                  onClick={() =>
                                    handleRemove(dayIndex, timeIndex, stream.id)
                                  }
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </ReusableDiv>

      <style>
        {`
        @keyframes fade-in {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        `}
      </style>
    </div>
  );
};

export default TimetableGrid;
