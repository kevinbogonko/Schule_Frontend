// Modify te code below and make the following updates and debugs
// 1. The doubles for isMerged = false subject should not be stacked together on the same day across all streams at the same timeslots they should be randomly allocated to various days and timeslots
// 2. There should not be multiple teacher i.e teacherId allocation to the same timeslot across all streams in a given day unless the subject is paired
// 3. There should be even allocation and distribution of lessons across all days and streams set
// 4. Remove create timetable and save timetable buttons and their functionalities. It is the optimize button that should autogenerate the timetable randomly following the set instructions
// 5. Give me final debugged code line by line

import React, { useState, useRef, useEffect } from "react";
import ReusableDiv from "../ReusableDiv";
import ReusableInput from "../ui/ReusableInput";
import Dropdown from "../Dropdown";
import Button from "../ui/raw/Button";
import Checkbox from "../Checkbox";
import {
  days,
  streams,
  yearOptions,
  termOptions,
  subjectsPerStream,
  timeSlots,
  subjectColors,
  clusterOptions
} from "../../utils/CommonData";

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

const TimetableGrid = () => {
  const [timetableData, setTimetableData] = useState({
    name: "",
    year: "",
    term: "",
    dayCluster: "",
    timeslotCluster: "",
  });

  const [optimizationMode, setOptimizationMode] = useState("auto");
  const [optimizationOptions, setOptimizationOptions] = useState({
    doublesFirst: false,
    group1First: false,
    group1And2First: false,
    customsLater: false,
  });


  const [selectedStream, setSelectedStream] = useState(streams[0].id);
  const [gridContent, setGridContent] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [dragOverKey, setDragOverKey] = useState(null);
  const [animationKeys, setAnimationKeys] = useState([]);
  const draggingUID = useRef(null);
  const draggingFromCell = useRef(null);
  const [teacherConflicts, setTeacherConflicts] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTimetableData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const getAvailableSlots = (streamId) => {
    const slots = [];
    days.forEach((day, dayIndex) => {
      timeSlots.forEach((timeSlot, timeIndex) => {
        if (timeSlot.type === "lesson") {
          const key = `${dayIndex}-${streamId}-${timeIndex}`;
          if (!gridContent[key]) {
            slots.push({ dayIndex, timeIndex, key });
          }
        }
      });
    });
    return slots;
  };

  const hasConsecutiveLessons = (subjectId, streamId, dayIndex, timeIndex) => {
    if (timeIndex > 0) {
      const prevKey = `${dayIndex}-${streamId}-${timeIndex - 1}`;
      if (gridContent[prevKey]?.id === subjectId) {
        return true;
      }
    }
    if (timeIndex < timeSlots.length - 1) {
      const nextKey = `${dayIndex}-${streamId}-${timeIndex + 1}`;
      if (gridContent[nextKey]?.id === subjectId) {
        return true;
      }
    }
    return false;
  };

  const calculatePeriodsPerWeek = (subject) => {
    if (subject.isMerged) {
      return subject.mergeSingles + subject.mergeDoubles * 2;
    }
    return subject.singles + subject.doubles * 2;
  };

  const distributeSubjectsEvenly = (subject, count) => {
    const availableDays = days.map((_, i) => i);
    const lessonsPerDay = Math.floor(count / availableDays.length);
    let remainingLessons = count % availableDays.length;

    const distribution = [];
    availableDays.forEach((dayIndex) => {
      const lessonsForDay = lessonsPerDay + (remainingLessons-- > 0 ? 1 : 0);
      if (lessonsForDay > 0) {
        distribution.push({ dayIndex, count: lessonsForDay });
      }
    });

    return distribution;
  };

  const shouldPrioritizeSubject = (subject) => {
    const { doublesFirst, group1First, group1And2First, customsLater } =
      optimizationOptions;

    if (doublesFirst && subject.doubles > 0) {
      return true;
    }

    if (group1First && [101, 121, 102, 122].includes(subject.code)) {
      return true;
    }

    if (
      group1And2First &&
      [101, 102, 121, 122, 231, 232, 233, 236, 237].includes(subject.code)
    ) {
      return true;
    }

    if (customsLater && subject.isCustom) {
      return false;
    }

    return false;
  };

  const checkTeacherConflicts = (dayIndex, timeIndex, teacherId) => {
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

  const handleCreateTimetable = async () => {
    try {
      const response = await fetch("/timetable/tt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timetableData,
          gridContent,
          optimizationOptions,
          selectedStream,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create timetable");
      }

      const data = await response.json();
      console.log("Timetable created successfully:", data);
    } catch (error) {
      console.error("Error creating timetable:", error);
    }
  };

  const handleSaveTimetable = async () => {
    try {
      const response = await fetch("/timetable/savett", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timetableData,
          gridContent,
          optimizationOptions,
          selectedStream,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save timetable");
      }

      const data = await response.json();
      console.log("Timetable saved successfully:", data);
    } catch (error) {
      console.error("Error saving timetable:", error);
    }
  };

  const handleCreate = async () => {
    setGridContent({});
    setTeacherConflicts({});
    const newGridContent = {};
    const subjectAssignments = {};
    const teacherAssignments = {};

    subjectsPerStream.forEach((subject) => {
      const periodsPerWeek = calculatePeriodsPerWeek(subject);
      subjectAssignments[subject.id] = {
        assigned: 0,
        max: periodsPerWeek,
        singlesAssigned: 0,
        doublesAssigned: 0,
      };
    });

    const mergedSubjectColors = {};
    subjectsPerStream.forEach((subject) => {
      if (subject.isMerged && subject.mergeAlias) {
        if (!mergedSubjectColors[subject.mergeAlias]) {
          const subjectIndex = subjectsPerStream.findIndex(
            (s) => s.id === subject.id
          );
          mergedSubjectColors[subject.mergeAlias] =
            subjectColors[subjectIndex % subjectColors.length];
        }
      }
    });

    subjectsPerStream.forEach((subject) => {
      if (!subject.isMerged && subject.doubles > 0) {
        const targetStreams = subject.streamId;
        const daysToAssign = [...Array(days.length).keys()].sort(
          () => Math.random() - 0.5
        );

        let doublesAssigned = 0;

        while (doublesAssigned < subject.doubles && daysToAssign.length > 0) {
          const dayIndex = daysToAssign.pop();
          const availableSlots = timeSlots
            .map((_, timeIndex) => ({ timeIndex }))
            .filter(({ timeIndex }) => {
              const key1 = `${dayIndex}-${targetStreams[0]}-${timeIndex}`;
              const key2 = `${dayIndex}-${targetStreams[0]}-${timeIndex + 1}`;
              return (
                timeIndex < timeSlots.length - 1 &&
                timeSlots[timeIndex].type === "lesson" &&
                timeSlots[timeIndex + 1].type === "lesson" &&
                !newGridContent[key1] &&
                !newGridContent[key2]
              );
            });

          if (availableSlots.length > 0) {
            const { timeIndex } = availableSlots[0];

            let hasTeacherConflict = false;
            const teacherConflicts = {};

            targetStreams.forEach((streamId, idx) => {
              const teacherId = Array.isArray(subject.teacherId)
                ? subject.teacherId[idx]
                : subject.teacherId;

              const conflicts =
                checkTeacherConflicts(dayIndex, timeIndex, teacherId) ||
                checkTeacherConflicts(dayIndex, timeIndex + 1, teacherId);

              if (conflicts) {
                hasTeacherConflict = true;
                Object.assign(teacherConflicts, conflicts);
              }
            });

            if (!hasTeacherConflict) {
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
            }
          }
        }
      }
    });

    const processedMergedSubjects = new Set();
    subjectsPerStream.forEach((subject) => {
      if (subject.isMerged && !processedMergedSubjects.has(subject.id)) {
        const mergedSubjects = [
          subject,
          ...subjectsPerStream.filter((s) => subject.mergedWith.includes(s.id)),
        ];

        const mergeGroupLeader = mergedSubjects[0];
        const totalPeriods =
          mergeGroupLeader.mergeSingles + mergeGroupLeader.mergeDoubles * 2;

        let doublesAssigned = 0;
        while (doublesAssigned < mergeGroupLeader.mergeDoubles) {
          const randomDay = Math.floor(Math.random() * days.length);
          const availableSlots = timeSlots
            .map((_, timeIndex) => ({ timeIndex }))
            .filter(({ timeIndex }) => {
              const key1 = `${randomDay}-${subject.streamId[0]}-${timeIndex}`;
              const key2 = `${randomDay}-${subject.streamId[0]}-${
                timeIndex + 1
              }`;
              return (
                timeIndex < timeSlots.length - 1 &&
                timeSlots[timeIndex].type === "lesson" &&
                timeSlots[timeIndex + 1].type === "lesson" &&
                !newGridContent[key1] &&
                !newGridContent[key2]
              );
            });

          if (availableSlots.length > 0) {
            const { timeIndex } = availableSlots[0];

            let hasTeacherConflict = false;
            const teacherConflicts = {};

            mergedSubjects.forEach((mergedSubject) => {
              mergedSubject.streamId.forEach((streamId, idx) => {
                const teacherId = Array.isArray(mergedSubject.teacherId)
                  ? mergedSubject.teacherId[idx]
                  : mergedSubject.teacherId;

                const conflicts =
                  checkTeacherConflicts(randomDay, timeIndex, teacherId) ||
                  checkTeacherConflicts(randomDay, timeIndex + 1, teacherId);

                if (conflicts) {
                  hasTeacherConflict = true;
                  Object.assign(teacherConflicts, conflicts);
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
                    color: mergedSubjectColors[mergeGroupLeader.mergeAlias],
                    isDouble: true,
                    teacherId: teacherId,
                  };

                  newGridContent[key2] = {
                    ...mergedSubject,
                    name: mergeGroupLeader.mergeAlias || mergedSubject.name,
                    uid: `${mergedSubject.id}-${Date.now()}-2`,
                    color: mergedSubjectColors[mergeGroupLeader.mergeAlias],
                    isDouble: true,
                    teacherId: teacherId,
                  };

                  subjectAssignments[mergedSubject.id].assigned += 2;
                  subjectAssignments[mergedSubject.id].doublesAssigned += 1;

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
            }
          }
        }

        const singlesToAssign = mergeGroupLeader.mergeSingles;
        let singlesAssigned = 0;
        while (singlesAssigned < singlesToAssign) {
          const randomDay = Math.floor(Math.random() * days.length);
          const availableSlots = timeSlots
            .map((_, timeIndex) => ({ timeIndex }))
            .filter(({ timeIndex }) => {
              const key = `${randomDay}-${subject.streamId[0]}-${timeIndex}`;
              return (
                timeSlots[timeIndex].type === "lesson" &&
                !newGridContent[key] &&
                !hasConsecutiveLessons(
                  subject.id,
                  subject.streamId[0],
                  randomDay,
                  timeIndex
                )
              );
            });

          if (availableSlots.length > 0) {
            const { timeIndex } = availableSlots[0];

            let hasTeacherConflict = false;
            const teacherConflicts = {};

            mergedSubjects.forEach((mergedSubject) => {
              mergedSubject.streamId.forEach((streamId, idx) => {
                const teacherId = Array.isArray(mergedSubject.teacherId)
                  ? mergedSubject.teacherId[idx]
                  : mergedSubject.teacherId;

                const conflicts = checkTeacherConflicts(
                  randomDay,
                  timeIndex,
                  teacherId
                );

                if (conflicts) {
                  hasTeacherConflict = true;
                  Object.assign(teacherConflicts, conflicts);
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
                    color: mergedSubjectColors[mergeGroupLeader.mergeAlias],
                    teacherId: teacherId,
                  };
                  subjectAssignments[mergedSubject.id].assigned++;
                  subjectAssignments[mergedSubject.id].singlesAssigned++;

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
            }
          }
        }

        mergedSubjects.forEach((s) => processedMergedSubjects.add(s.id));
      }
    });

    subjectsPerStream.forEach((subject) => {
      if (!subject.isMerged) {
        const periodsPerWeek = calculatePeriodsPerWeek(subject);
        const alreadyAssigned = subjectAssignments[subject.id].assigned;
        const remainingPeriods = periodsPerWeek - alreadyAssigned;

        const remainingSingles =
          subject.singles - subjectAssignments[subject.id].singlesAssigned;

        if (remainingSingles > 0) {
          const distribution = distributeSubjectsEvenly(
            subject,
            remainingSingles
          );

          distribution.forEach(({ dayIndex, count }) => {
            const targetStreams = subject.streamId;

            targetStreams.forEach((streamId, idx) => {
              const availableSlots = timeSlots
                .map((_, timeIndex) => ({ timeIndex }))
                .filter(({ timeIndex }) => {
                  const key = `${dayIndex}-${streamId}-${timeIndex}`;
                  return (
                    timeSlots[timeIndex].type === "lesson" &&
                    !newGridContent[key] &&
                    !hasConsecutiveLessons(
                      subject.id,
                      streamId,
                      dayIndex,
                      timeIndex
                    )
                  );
                })
                .sort(() => Math.random() - 0.5);

              for (let i = 0; i < Math.min(count, availableSlots.length); i++) {
                const { timeIndex } = availableSlots[i];
                const key = `${dayIndex}-${streamId}-${timeIndex}`;
                const subjectIndex = subjectsPerStream.findIndex(
                  (s) => s.id === subject.id
                );

                const teacherId = Array.isArray(subject.teacherId)
                  ? subject.teacherId[idx]
                  : subject.teacherId;

                const conflicts = checkTeacherConflicts(
                  dayIndex,
                  timeIndex,
                  teacherId
                );
                if (conflicts) {
                  setTeacherConflicts((prev) => ({
                    ...prev,
                    [key]: conflicts,
                  }));
                  continue;
                }

                newGridContent[key] = {
                  ...subject,
                  uid: `${subject.id}-${Date.now()}`,
                  color: subjectColors[subjectIndex % subjectColors.length],
                  teacherId: teacherId,
                };
                subjectAssignments[subject.id].assigned++;
                subjectAssignments[subject.id].singlesAssigned++;

                if (!teacherAssignments[teacherId]) {
                  teacherAssignments[teacherId] = {};
                }
                if (!teacherAssignments[teacherId][dayIndex]) {
                  teacherAssignments[teacherId][dayIndex] = new Set();
                }
                teacherAssignments[teacherId][dayIndex].add(timeIndex);
              }
            });
          });
        }
      }
    });

    setGridContent(newGridContent);
    console.log("Auto-generated timetable:", newGridContent);
  };

  const handleOptimize = async () => {
    setGridContent({});
    setTeacherConflicts({});
    const newGridContent = {};
    const subjectAssignments = {};
    const teacherAssignments = {};

    subjectsPerStream.forEach((subject) => {
      const periodsPerWeek = calculatePeriodsPerWeek(subject);
      subjectAssignments[subject.id] = {
        assigned: 0,
        max: periodsPerWeek,
        singlesAssigned: 0,
        doublesAssigned: 0,
      };
    });

    const mergedSubjectColors = {};
    subjectsPerStream.forEach((subject) => {
      if (subject.isMerged && subject.mergeAlias) {
        if (!mergedSubjectColors[subject.mergeAlias]) {
          const subjectIndex = subjectsPerStream.findIndex(
            (s) => s.id === subject.id
          );
          mergedSubjectColors[subject.mergeAlias] =
            subjectColors[subjectIndex % subjectColors.length];
        }
      }
    });

    const sortedSubjects = [...subjectsPerStream].sort((a, b) => {
      const aPriority = shouldPrioritizeSubject(a);
      const bPriority = shouldPrioritizeSubject(b);

      if (aPriority && !bPriority) return -1;
      if (!aPriority && bPriority) return 1;
      return 0;
    });

    sortedSubjects.forEach((subject) => {
      if (!subject.isMerged && subject.doubles > 0) {
        const targetStreams = subject.streamId;
        const daysToAssign = [...Array(days.length).keys()].sort(
          () => Math.random() - 0.5
        );

        let doublesAssigned = 0;

        while (doublesAssigned < subject.doubles && daysToAssign.length > 0) {
          const dayIndex = daysToAssign.pop();
          const availableSlots = timeSlots
            .map((_, timeIndex) => ({ timeIndex }))
            .filter(({ timeIndex }) => {
              const key1 = `${dayIndex}-${targetStreams[0]}-${timeIndex}`;
              const key2 = `${dayIndex}-${targetStreams[0]}-${timeIndex + 1}`;
              return (
                timeIndex < timeSlots.length - 1 &&
                timeSlots[timeIndex].type === "lesson" &&
                timeSlots[timeIndex + 1].type === "lesson" &&
                !newGridContent[key1] &&
                !newGridContent[key2]
              );
            });

          if (availableSlots.length > 0) {
            const { timeIndex } = availableSlots[0];

            let hasTeacherConflict = false;
            const teacherConflicts = {};

            targetStreams.forEach((streamId, idx) => {
              const teacherId = Array.isArray(subject.teacherId)
                ? subject.teacherId[idx]
                : subject.teacherId;

              const conflicts =
                checkTeacherConflicts(dayIndex, timeIndex, teacherId) ||
                checkTeacherConflicts(dayIndex, timeIndex + 1, teacherId);

              if (conflicts) {
                hasTeacherConflict = true;
                Object.assign(teacherConflicts, conflicts);
              }
            });

            if (!hasTeacherConflict) {
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
            }
          }
        }
      }
    });

    const processedMergedSubjects = new Set();
    sortedSubjects.forEach((subject) => {
      if (subject.isMerged && !processedMergedSubjects.has(subject.id)) {
        const mergedSubjects = [
          subject,
          ...subjectsPerStream.filter((s) => subject.mergedWith.includes(s.id)),
        ];

        const mergeGroupLeader = mergedSubjects[0];
        const totalPeriods =
          mergeGroupLeader.mergeSingles + mergeGroupLeader.mergeDoubles * 2;

        let doublesAssigned = 0;
        while (doublesAssigned < mergeGroupLeader.mergeDoubles) {
          const randomDay = Math.floor(Math.random() * days.length);
          const availableSlots = timeSlots
            .map((_, timeIndex) => ({ timeIndex }))
            .filter(({ timeIndex }) => {
              const key1 = `${randomDay}-${subject.streamId[0]}-${timeIndex}`;
              const key2 = `${randomDay}-${subject.streamId[0]}-${
                timeIndex + 1
              }`;
              return (
                timeIndex < timeSlots.length - 1 &&
                timeSlots[timeIndex].type === "lesson" &&
                timeSlots[timeIndex + 1].type === "lesson" &&
                !newGridContent[key1] &&
                !newGridContent[key2]
              );
            });

          if (availableSlots.length > 0) {
            const { timeIndex } = availableSlots[0];

            let hasTeacherConflict = false;
            const teacherConflicts = {};

            mergedSubjects.forEach((mergedSubject) => {
              mergedSubject.streamId.forEach((streamId, idx) => {
                const teacherId = Array.isArray(mergedSubject.teacherId)
                  ? mergedSubject.teacherId[idx]
                  : mergedSubject.teacherId;

                const conflicts =
                  checkTeacherConflicts(randomDay, timeIndex, teacherId) ||
                  checkTeacherConflicts(randomDay, timeIndex + 1, teacherId);

                if (conflicts) {
                  hasTeacherConflict = true;
                  Object.assign(teacherConflicts, conflicts);
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
                    color: mergedSubjectColors[mergeGroupLeader.mergeAlias],
                    isDouble: true,
                    teacherId: teacherId,
                  };

                  newGridContent[key2] = {
                    ...mergedSubject,
                    name: mergeGroupLeader.mergeAlias || mergedSubject.name,
                    uid: `${mergedSubject.id}-${Date.now()}-2`,
                    color: mergedSubjectColors[mergeGroupLeader.mergeAlias],
                    isDouble: true,
                    teacherId: teacherId,
                  };

                  subjectAssignments[mergedSubject.id].assigned += 2;
                  subjectAssignments[mergedSubject.id].doublesAssigned += 1;

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
            }
          }
        }

        const singlesToAssign = mergeGroupLeader.mergeSingles;
        let singlesAssigned = 0;
        while (singlesAssigned < singlesToAssign) {
          const randomDay = Math.floor(Math.random() * days.length);
          const availableSlots = timeSlots
            .map((_, timeIndex) => ({ timeIndex }))
            .filter(({ timeIndex }) => {
              const key = `${randomDay}-${subject.streamId[0]}-${timeIndex}`;
              return (
                timeSlots[timeIndex].type === "lesson" &&
                !newGridContent[key] &&
                !hasConsecutiveLessons(
                  subject.id,
                  subject.streamId[0],
                  randomDay,
                  timeIndex
                )
              );
            });

          if (availableSlots.length > 0) {
            const { timeIndex } = availableSlots[0];

            let hasTeacherConflict = false;
            const teacherConflicts = {};

            mergedSubjects.forEach((mergedSubject) => {
              mergedSubject.streamId.forEach((streamId, idx) => {
                const teacherId = Array.isArray(mergedSubject.teacherId)
                  ? mergedSubject.teacherId[idx]
                  : mergedSubject.teacherId;

                const conflicts = checkTeacherConflicts(
                  randomDay,
                  timeIndex,
                  teacherId
                );

                if (conflicts) {
                  hasTeacherConflict = true;
                  Object.assign(teacherConflicts, conflicts);
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
                    color: mergedSubjectColors[mergeGroupLeader.mergeAlias],
                    teacherId: teacherId,
                  };
                  subjectAssignments[mergedSubject.id].assigned++;
                  subjectAssignments[mergedSubject.id].singlesAssigned++;

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
            }
          }
        }

        mergedSubjects.forEach((s) => processedMergedSubjects.add(s.id));
      }
    });

    sortedSubjects.forEach((subject) => {
      if (!subject.isMerged) {
        const periodsPerWeek = calculatePeriodsPerWeek(subject);
        const alreadyAssigned = subjectAssignments[subject.id].assigned;
        const remainingPeriods = periodsPerWeek - alreadyAssigned;

        const remainingSingles =
          subject.singles - subjectAssignments[subject.id].singlesAssigned;

        if (remainingSingles > 0) {
          const distribution = distributeSubjectsEvenly(
            subject,
            remainingSingles
          );

          distribution.forEach(({ dayIndex, count }) => {
            const targetStreams = subject.streamId;

            targetStreams.forEach((streamId, idx) => {
              const availableSlots = timeSlots
                .map((_, timeIndex) => ({ timeIndex }))
                .filter(({ timeIndex }) => {
                  const key = `${dayIndex}-${streamId}-${timeIndex}`;
                  return (
                    timeSlots[timeIndex].type === "lesson" &&
                    !newGridContent[key] &&
                    !hasConsecutiveLessons(
                      subject.id,
                      streamId,
                      dayIndex,
                      timeIndex
                    )
                  );
                })
                .sort(() => Math.random() - 0.5);

              for (let i = 0; i < Math.min(count, availableSlots.length); i++) {
                const { timeIndex } = availableSlots[i];
                const key = `${dayIndex}-${streamId}-${timeIndex}`;
                const subjectIndex = subjectsPerStream.findIndex(
                  (s) => s.id === subject.id
                );

                const teacherId = Array.isArray(subject.teacherId)
                  ? subject.teacherId[idx]
                  : subject.teacherId;

                const conflicts = checkTeacherConflicts(
                  dayIndex,
                  timeIndex,
                  teacherId
                );
                if (conflicts) {
                  setTeacherConflicts((prev) => ({
                    ...prev,
                    [key]: conflicts,
                  }));
                  continue;
                }

                newGridContent[key] = {
                  ...subject,
                  uid: `${subject.id}-${Date.now()}`,
                  color: subjectColors[subjectIndex % subjectColors.length],
                  teacherId: teacherId,
                };
                subjectAssignments[subject.id].assigned++;
                subjectAssignments[subject.id].singlesAssigned++;

                if (!teacherAssignments[teacherId]) {
                  teacherAssignments[teacherId] = {};
                }
                if (!teacherAssignments[teacherId][dayIndex]) {
                  teacherAssignments[teacherId][dayIndex] = new Set();
                }
                teacherAssignments[teacherId][dayIndex].add(timeIndex);
              }
            });
          });
        }
      }
    });

    if (optimizationOptions.customsLater) {
      const customSubjects = sortedSubjects.filter(
        (subject) => subject.isCustom
      );
      const nonCustomSubjects = sortedSubjects.filter(
        (subject) => !subject.isCustom
      );

      customSubjects.forEach((subject) => {
        const targetStreams = subject.streamId;

        const assignedSlots = [];
        for (const key in newGridContent) {
          if (newGridContent[key].id === subject.id) {
            assignedSlots.push(key);
          }
        }

        assignedSlots.forEach((key) => {
          delete newGridContent[key];
          subjectAssignments[subject.id].assigned--;
          if (newGridContent[key]?.isDouble) {
            subjectAssignments[subject.id].doublesAssigned--;
          } else {
            subjectAssignments[subject.id].singlesAssigned--;
          }
        });

        const availableLaterSlots = [];
        days.forEach((day, dayIndex) => {
          timeSlots.forEach((timeSlot, timeIndex) => {
            if (timeSlot.type === "lesson" && timeIndex > 6) {
              const key = `${dayIndex}-${targetStreams[0]}-${timeIndex}`;
              if (!newGridContent[key]) {
                availableLaterSlots.push({ dayIndex, timeIndex, key });
              }
            }
          });
        });

        let periodsToAssign =
          calculatePeriodsPerWeek(subject) -
          subjectAssignments[subject.id].assigned;
        for (
          let i = 0;
          i < Math.min(periodsToAssign, availableLaterSlots.length);
          i++
        ) {
          const { dayIndex, timeIndex, key } = availableLaterSlots[i];
          const subjectIndex = subjectsPerStream.findIndex(
            (s) => s.id === subject.id
          );

          newGridContent[key] = {
            ...subject,
            uid: `${subject.id}-${Date.now()}`,
            color: subjectColors[subjectIndex % subjectColors.length],
          };
          subjectAssignments[subject.id].assigned++;
          subjectAssignments[subject.id].singlesAssigned++;
        }
      });
    }

    setGridContent(newGridContent);
    console.log("Optimized timetable:", newGridContent);
  };

  useEffect(() => {
    const filteredSubjects = subjectsPerStream
      .filter((subject) => subject.streamId.includes(selectedStream))
      .map((subject, index) => {
        const periodsPerWeek = calculatePeriodsPerWeek(subject);
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
  }, [selectedStream]);

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

    if (dragged && timeSlots[timeIndex].type === "lesson") {
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
              onChange={(e) => handleInputChange(e)}
              name="year"
              className="my-2"
            />

            <Dropdown
              label="Term"
              placeholder="Select Term"
              options={termOptions}
              value={timetableData.term}
              onChange={(e) => handleInputChange(e)}
              name="term"
              className="my-2"
            />

            <Dropdown
              label="Day Cluster"
              placeholder="Select Day Cluster"
              options={clusterOptions}
              value={timetableData.dayCluster}
              onChange={(e) => handleInputChange(e)}
              name="dayCluster"
              className="my-2"
            />

            <Dropdown
              label="Timeslot Cluster"
              placeholder="Select Time Cluster"
              options={clusterOptions}
              value={timetableData.timeslotCluster}
              onChange={(e) => handleInputChange(e)}
              name="timeslotCluster"
              className="my-2"
            />

            <div className="flex space-x-4 mt-4">
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
              <Button variant="primary" onClick={handleCreate}>
                Create
              </Button>
              <Button variant="primary" onClick={handleCreateTimetable}>
                Create Timetable
              </Button>
              <Button variant="primary" onClick={handleSaveTimetable}>
                Save Timetable
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
                    <Checkbox
                      label="Doubles first"
                      name="doublesFirst"
                      checked={optimizationOptions.doublesFirst}
                      onChange={handleOptimizationOptionChange}
                    />
                    <Checkbox
                      label="Group 1 first"
                      name="group1First"
                      checked={optimizationOptions.group1First}
                      onChange={handleOptimizationOptionChange}
                    />
                    <Checkbox
                      label="Group 1 and 2 first"
                      name="group1And2First"
                      checked={optimizationOptions.group1And2First}
                      onChange={handleOptimizationOptionChange}
                    />
                    <Checkbox
                      label="Customs later"
                      name="customsLater"
                      checked={optimizationOptions.customsLater}
                      onChange={handleOptimizationOptionChange}
                    />
                  </div>
                  <div className="flex space-x-4 mt-4">
                    <Button variant="outline" onClick={handleResetOptimization}>
                      Reset
                    </Button>
                    <Button variant="primary" onClick={handleOptimize}>
                      Optimize
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ReusableDiv>
        </div>
      </div>

      <ReusableDiv tag="TimeTable Grid">
        <div className="flex items-center gap-4 mb-4">
          <label htmlFor="stream-select" className="font-medium">
            Select Stream:
          </label>
          <select
            id="stream-select"
            value={selectedStream}
            onChange={handleStreamChange}
            className="border border-gray-300 rounded px-3 py-2"
          >
            {streams.map((stream) => (
              <option key={stream.id} value={stream.id}>
                {stream.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 mb-4 flex-wrap p-2 border border-gray-300 rounded bg-gray-50">
          {subjects.map((subject) => (
            <div
              key={`${subject.id}-${subject.streamId}`}
              className={`cursor-move px-3 py-2 text-sm rounded text-white font-semibold flex items-center justify-between ${subject.color}`}
              draggable
              onDragStart={() => handleDragStart(subject)}
            >
              {subject.label} ({subject.count})
            </div>
          ))}
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
