
import React, { useState, useRef, useEffect } from "react";
import ReusableDiv from "../ReusableDiv";
import ReusableInput from "../ui/ReusableInput";
import Dropdown from "../Dropdown";
import Button from "../ui/raw/Button";
import api from "../../hooks/api";

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
  const [activeForms, setActiveForms] = useState([2, 3, 4]);
  const [streams, setStreams] = useState([]);
  const [subjectsPerStream, setSubjectsPerStream] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const termOptions = [
    { value: "1", label: "Term 1" },
    { value: "2", label: "Term 2" },
    { value: "3", label: "Term 3" },
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString(),
  }));

  const timeSlotClusterOptions = [
    { value: "MR", label: "Morning Remedial (MR)" },
    { value: "D", label: "Standard Day (D)" },
    { value: "ER", label: "Evening Remedial (ER)" },
  ];

  const subjectColors = [
    "bg-blue-400",
    "bg-red-400",
    "bg-green-400",
    "bg-yellow-400",
    "bg-purple-400",
    "bg-pink-400",
    "bg-indigo-400",
    "bg-teal-400",
    "bg-orange-400",
    "bg-cyan-400",
    "bg-lime-400",
    "bg-amber-400",
  ];

  const days = [
    { name: "Monday", hasGames: false },
    { name: "Tuesday", hasGames: false },
    { name: "Wednesday", hasGames: true },
    { name: "Thursday", hasGames: false },
    { name: "Friday", hasGames: true },
  ];

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
          // Sort by start time
          const aStart = a.label.split(" - ")[0];
          const bStart = b.label.split(" - ")[0];
          return aStart.localeCompare(bStart);
        });

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
        // Fetch subject configuration
        const subjConfigResponse = await api.post(
          "/timetable/getallsubjconfig",
          {
            year: parseInt(year),
            form: activeForms,
            term: parseInt(term),
            utility: timeslotCluster,
          }
        );

        // Format subjects data
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

        // Fetch form streams
        const streamsResponse = await api.post("/stream/getformstreams", {
          year: parseInt(year),
          forms: activeForms,
        });

        // Format streams data
        const formattedStreams = streamsResponse.data.map((stream) => ({
          id: stream.id, // Using class_id as id per requirement
          name: `${stream.form}${stream.stream_name.charAt(0)}`,
          form: stream.form,
          streamName: stream.stream_name,
        }));

        console.log(formattedStreams);

        // Fetch subject teachers
        const teachersResponse = await api.post(
          "/teacher/getallsubjectteachers",
          {
            year: parseInt(year),
            forms: activeForms,
          }
        );

        // Combine all data to create subjectsPerStream
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
                (stream) => streamTeachers[stream.id] || null
              ),
            };
          })
          .filter(
            (subject) =>
              subject.streamId.length > 0 &&
              subject.teacherId.some((t) => t !== null)
          );

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

    fetchDayClusters();
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
      // Prepare lessons data
      const lessons = [];
      Object.entries(gridContent).forEach(([key, lesson]) => {
        const [dayIndex, class_id, timeIndex] = key.split("-").map(Number);
        const day = days[dayIndex].name;
        const teacher = teachers.find((t) => t.id === lesson.teacherId);
        const teacherName = teacher
          ? `${teacher.title} ${teacher.lname}`
          : "Unknown";
        const teacherTag = teacher.teacher_tag

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

      // Prepare payload
      const payload = {
        year: parseInt(timetableData.year),
        term: parseInt(timetableData.term),
        timetable_name: timetableData.name,
        day_cluster_id: parseInt(timetableData.dayCluster),
        utility: timetableData.timeslotCluster.toLowerCase(),
        lessons: lessons,
      };

      // Send request
      console.log(payload)
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
      // Generate timetable grid content
      setGridContent({});
      setTeacherConflicts({});
      const newGridContent = {};
      const subjectAssignments = {};
      const teacherAssignments = {};

      // Initialize subject assignments
      subjectsPerStream.forEach((subject) => {
        const periodsPerWeek = calculatePeriodsPerWeek(subject);
        subjectAssignments[subject.id] = {
          assigned: 0,
          max: periodsPerWeek,
          singlesAssigned: 0,
          doublesAssigned: 0,
        };
      });

      // Process merged subjects first
      const processedMergedSubjects = new Set();
      subjectsPerStream.forEach((subject) => {
        if (subject.isMerged && !processedMergedSubjects.has(subject.id)) {
          const mergedSubjects = [
            subject,
            ...subjectsPerStream.filter((s) =>
              subject.mergedWith.includes(s.id)
            ),
          ];

          const mergeGroupLeader = mergedSubjects[0];
          const totalPeriods =
            mergeGroupLeader.mergeSingles + mergeGroupLeader.mergeDoubles * 2;

          // Assign doubles for merged subjects
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
                    checkTeacherConflicts(
                      randomDay,
                      timeIndex,
                      teacherId,
                      mergedSubject.isPaired
                    ) ||
                    checkTeacherConflicts(
                      randomDay,
                      timeIndex + 1,
                      teacherId,
                      mergedSubject.isPaired
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

          // Assign singles for merged subjects
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
                    teacherId,
                    mergedSubject.isPaired
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

      // Process non-merged subjects with doubles
      const subjectsWithDoubles = subjectsPerStream
        .filter((subject) => !subject.isMerged && subject.doubles > 0)
        .sort(() => Math.random() - 0.5);

      subjectsWithDoubles.forEach((subject) => {
        const targetStreams = subject.streamId;
        let doublesAssigned = 0;

        // Create a shuffled list of days to assign doubles
        const daysToAssign = [...Array(days.length).keys()].sort(
          () => Math.random() - 0.5
        );

        while (doublesAssigned < subject.doubles && daysToAssign.length > 0) {
          const dayIndex = daysToAssign.pop();

          // Find all available double slots for this day
          const availableDoubleSlots = [];
          for (
            let timeIndex = 0;
            timeIndex < timeSlots.length - 1;
            timeIndex++
          ) {
            if (
              timeSlots[timeIndex].type === "lesson" &&
              timeSlots[timeIndex + 1].type === "lesson"
            ) {
              let allStreamsAvailable = true;
              let hasTeacherConflict = false;

              // Check all streams for this subject
              for (const streamId of targetStreams) {
                const key1 = `${dayIndex}-${streamId}-${timeIndex}`;
                const key2 = `${dayIndex}-${streamId}-${timeIndex + 1}`;

                if (newGridContent[key1] || newGridContent[key2]) {
                  allStreamsAvailable = false;
                  break;
                }

                // Check teacher conflicts
                const teacherId = Array.isArray(subject.teacherId)
                  ? subject.teacherId[targetStreams.indexOf(streamId)]
                  : subject.teacherId;

                const conflicts =
                  checkTeacherConflicts(dayIndex, timeIndex, teacherId) ||
                  checkTeacherConflicts(dayIndex, timeIndex + 1, teacherId);

                if (conflicts) {
                  hasTeacherConflict = true;
                  break;
                }
              }

              if (allStreamsAvailable && !hasTeacherConflict) {
                availableDoubleSlots.push(timeIndex);
              }
            }
          }

          // If we found available slots, assign the double
          if (availableDoubleSlots.length > 0) {
            const randomSlotIndex = Math.floor(
              Math.random() * availableDoubleSlots.length
            );
            const timeIndex = availableDoubleSlots[randomSlotIndex];

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
      });

      // Process singles for all subjects
      const subjectsWithSingles = subjectsPerStream
        .filter((subject) => !subject.isMerged)
        .sort(() => Math.random() - 0.5);

      subjectsWithSingles.forEach((subject) => {
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
      });

      setGridContent(newGridContent);

      // Prepare and send the final payload
      const payload = {
        name: timetableData.name,
        year: Number(timetableData.year),
        term: Number(timetableData.term),
        day_cluster_id: Number(timetableData.dayCluster),
        time_slot_cluster: timetableData.timeslotCluster,
        timetable_data: newGridContent,
        optimization_options: optimizationOptions,
      };

      console.log("Final timetable payload:", payload);
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
