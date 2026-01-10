import React, { useState, useEffect } from "react";
import { FaSpinner, FaPlus, FaMinus } from "react-icons/fa";
import { FiEdit2, FiEye } from "react-icons/fi";
import ModalForm from "../../ui/ModalForm";
import ReusableSelect from "../../ui/ReusableSelect";
import ReusableDiv from "../../ui/ReusableDiv";
import TimeInput from "../../ui/TimeInput";
import Checkbox from "../../ui/Checkbox";
import Button from "../../ui/Button";
import ReusableInput from "../../ui/ReusableInput";
import { MdDone } from "react-icons/md";
import TableComponent from "../../ui/TableComponent";
import Alert from "../../ui/Alert";
import api from "../../../hooks/api";
import { useToast } from "../../ui/Toast";

const TimeSlotRU = ({
  modalState,
  setModalState,
  rowData,
  showLoadingOverlay,
  setShowLoadingOverlay,
  selectedYear,
  selectedTerm,
  selectedUtility,
}) => {
    const { showToast } = useToast();
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [duration, setDuration] = useState(40);
  const [includeBreaks, setIncludeBreaks] = useState(false);
  const [breaks, setBreaks] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [learningDays, setLearningDays] = useState([]);

  const breakTypeOptions = [
    { value: "break", label: "SHORT BREAK" },
    { value: "lunch", label: "LUNCH BREAK" },
  ];

  const availableLessons = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: `After Lesson ${i + 1}`,
  }));

  const getUtilityDisplayName = (utility) => {
    switch (utility) {
      case "d":
        return "Day Schedule";
      case "mr":
        return "Morning Remedial";
      case "er":
        return "Evening Remedial";
      default:
        return utility;
    }
  };

  const formatTimeSlots = (slots) => {
    if (!slots || !Array.isArray(slots)) return [];

    return slots
      .map((slot, index) => {
        const startTime = slot.starts || slot.start || "00:00";
        const endTime = slot.ends || slot.end || "00:00";

        return {
          ...slot,
          id: slot.id || index,
          start: startTime.includes(":")
            ? startTime.substring(0, 5)
            : startTime,
          end: endTime.includes(":") ? endTime.substring(0, 5) : endTime,
          category: slot.category ? slot.category.toUpperCase() : "LESSON",
          lesson_id: slot.category
            ? slot.category.toUpperCase()
            : `Lesson ${index + 1}`,
        };
      })
      .sort((a, b) => {
        const [aH, aM] = (a.start || "00:00").split(":").map(Number);
        const [bH, bM] = (b.start || "00:00").split(":").map(Number);
        return aH - bH || aM - bM;
      });
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    const [startH, startM] = (start || "00:00").split(":").map(Number);
    const [endH, endM] = (end || "00:00").split(":").map(Number);
    return endH * 60 + endM - (startH * 60 + startM);
  };

  useEffect(() => {
    if (modalState.editTimeSlot || modalState.viewTimeSlot) {
      if (rowData?.timeSlots) {
        const formattedSlots = formatTimeSlots(rowData.timeSlots);
        setTimeSlots(formattedSlots);
        setScheduleData(formattedSlots);

        const lessons = formattedSlots.filter(
          (slot) => slot.category === "LESSON"
        );
        if (lessons.length > 0) {
          const firstLesson = lessons[0];
          const lastLesson = lessons[lessons.length - 1];
          setStartTime(firstLesson.start);
          setEndTime(lastLesson.end);
          setDuration(calculateDuration(firstLesson.start, firstLesson.end));
        }

        const existingBreaks = formattedSlots.filter(
          (slot) =>
            slot.category &&
            (slot.category.toLowerCase() === "break" ||
              slot.category.toLowerCase() === "lunch")
        );

        if (existingBreaks.length > 0) {
          setIncludeBreaks(true);

          const breakConfigs = existingBreaks.map((breakSlot) => {
            const lessonBefore = formattedSlots
              .slice(0, formattedSlots.indexOf(breakSlot))
              .filter((slot) => slot.category === "LESSON").length;

            return {
              afterEvent: lessonBefore.toString(),
              duration: calculateDuration(breakSlot.start, breakSlot.end),
              type: breakSlot.category.toLowerCase(),
            };
          });

          setBreaks(breakConfigs);
        }
      } else {
        fetchTimeSlots();
      }

      if (rowData?.daysArray) {
        setLearningDays(rowData.daysArray);
      }
    } else {
      setTimeSlots([]);
      setScheduleData([]);
      setBreaks([]);
      setIncludeBreaks(false);
      setStartTime("08:00");
      setEndTime("16:00");
      setDuration(40);
    }
  }, [
    modalState.editTimeSlot,
    modalState.viewTimeSlot,
    rowData,
    selectedUtility,
  ]);

  const fetchTimeSlots = async () => {
    setIsLoading(true);
    try {
      const response = await api.post("/timetable/gettimeslots", {
        year: selectedYear,
        term: selectedTerm,
        utility: selectedUtility,
      });
      const formattedSlots = formatTimeSlots(response.data);
      setTimeSlots(formattedSlots);
      setScheduleData(formattedSlots);

      const lessons = formattedSlots.filter(
        (slot) => slot.category === "LESSON"
      );
      if (lessons.length > 0) {
        const firstLesson = lessons[0];
        const lastLesson = lessons[lessons.length - 1];
        setStartTime(firstLesson.start);
        setEndTime(lastLesson.end);
        setDuration(calculateDuration(firstLesson.start, firstLesson.end));
      }

      const hasBreaks = formattedSlots.some(
        (slot) =>
          slot.category &&
          (slot.category.toLowerCase() === "break" ||
            slot.category.toLowerCase() === "lunch")
      );
      setIncludeBreaks(hasBreaks);
    } catch (err) {
      setError("Failed to fetch time slots");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDurationChange = (e) => {
    const value = Math.min(Math.max(parseInt(e.target.value) || 1, 1), 60);
    setDuration(value);
  };

  const addBreak = () => {
    setBreaks([...breaks, { afterEvent: "1", duration: 10, type: "break" }]);
  };

  const removeBreak = (index) => {
    const updatedBreaks = [...breaks];
    updatedBreaks.splice(index, 1);
    setBreaks(updatedBreaks);
  };

  const updateBreak = (index, field, value) => {
    const updatedBreaks = [...breaks];
    updatedBreaks[index][field] = value;
    setBreaks(updatedBreaks);
  };

  const compareTimes = (time1, time2) => {
    if (!time1 || !time2) return false;
    const [h1, m1] = (time1 || "00:00").split(":").map(Number);
    const [h2, m2] = (time2 || "00:00").split(":").map(Number);
    return h1 < h2 || (h1 === h2 && m1 <= m2);
  };

  const addMinutes = (time, minutes) => {
    if (!time) return "00:00";
    const [h, m] = (time || "00:00").split(":").map(Number);
    const totalMinutes = h * 60 + m + minutes;
    const newH = Math.floor(totalMinutes / 60);
    const newM = totalMinutes % 60;
    return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
  };

  const generateTimeSlots = () => {
    const slots = [];
    let currentTime = startTime;
    let lessonCount = 0;
    let breakIndex = 0;

    while (compareTimes(currentTime, endTime)) {
      const lessonEnd = addMinutes(currentTime, duration);
      if (!compareTimes(lessonEnd, endTime)) break;

      lessonCount++;
      slots.push({
        id: `lesson-${lessonCount}`,
        type: "lesson",
        category: "LESSON",
        start: currentTime,
        end: lessonEnd,
        lesson_id: `Lesson ${lessonCount}`,
      });
      currentTime = lessonEnd;

      if (includeBreaks) {
        const breakToAdd = breaks.find(
          (brk) => parseInt(brk.afterEvent) === lessonCount
        );
        if (breakToAdd) {
          const breakEnd = addMinutes(
            currentTime,
            parseInt(breakToAdd.duration)
          );
          if (!compareTimes(breakEnd, endTime)) break;

          slots.push({
            id: `break-${breakIndex++}`,
            type: breakToAdd.type,
            category: breakToAdd.type.toUpperCase(),
            start: currentTime,
            end: breakEnd,
            lesson_id: breakToAdd.type.toUpperCase(),
          });
          currentTime = breakEnd;
        }
      }
    }

    const formattedSlots = formatTimeSlots(slots);
    setScheduleData(formattedSlots);
    setTimeSlots(formattedSlots);
  };

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true);

      const payload = {
        year: Number(selectedYear),
        term: Number(selectedTerm),
        utility: selectedUtility,
        timeSlots: scheduleData.map((slot) => ({
          category: slot.category,
          day_cluster_id: rowData?.timeSlots[0].day_cluster_id,
          end: slot.end,
          ends: slot.end + ":00",
          id: slot.id,
          lesson_id: slot.category,
          start: slot.start,
          starts: slot.start + ":00",
          term: selectedTerm,
          utility: selectedUtility.toLowerCase(),
        })),
      };

      console.log(payload)
      await api.post("/timetable/updatetimeslots", payload);
      setModalState({ ...modalState, editTimeSlot: false });
      showToast("Timeslots Successfully added", 'success', {duration : 3000, position : 'top-right'})
    } catch (err) {
      console.log(err)
      setError("Failed to update time slots");
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleColumns = [
    { name: "Event", uid: "lesson_id", sortable: false },
    { name: "Starts", uid: "start", sortable: true },
    { name: "Ends", uid: "end", sortable: false },
    { name: "Type", uid: "category", sortable: false },
  ];

  const isSaveDisabled =
    !startTime ||
    !endTime ||
    !duration ||
    (includeBreaks &&
      breaks.some((b) => !b.afterEvent || !b.duration || !b.type));

  return (
    <div className="dark:text-gray-200">
      <ModalForm
        isOpen={modalState.editTimeSlot && !isLoading}
        onClose={() => {
          setError("");
          setModalState({ ...modalState, editTimeSlot: false });
        }}
        title={`Edit Time Slots for ${getUtilityDisplayName(selectedUtility)}`}
        icon={FiEdit2}
        initialValues={{ timeSlots }}
        onSubmit={handleSubmit}
        closeOnOutsideClick={false}
        size="2xl"
        submitText={
          isLoading ? <FaSpinner className="animate-spin" /> : "Save Changes"
        }
        submitDisabled={isLoading}
      >
        {({ values, handleChange, setFieldValue }) => (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md dark:bg-red-900 dark:text-red-100">
                {error}
              </div>
            )}
            {isLoading ? (
              <div className="text-center py-6">
                <FaSpinner className="animate-spin inline mr-2" />
                Loading time slots...
              </div>
            ) : (
              <div className="space-y-4">
                <Alert
                  message={`Learning Days: ${learningDays.join(", ")}`}
                  className="my-4"
                />

                <ReusableDiv
                  className="flex-1 ml-0 mr-0 p-6 rounded-md dark:bg-gray-800"
                  tag="Schedule Settings"
                  collapsible={true}
                >
                  <div className="space-y-1">
                    <div className="flex flex-1 flex-wrap gap-4">
                      <div className="w-1/2">
                        <div className="w-1/2 flex flex-1 flex-col mb-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Start Time
                          </label>
                          <div className="relative w-full">
                            <TimeInput
                              value={startTime}
                              onChange={setStartTime}
                              is12Hour={false}
                              className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                        </div>
                        <div className="w-1/2 flex flex-1 flex-col">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            End Time
                          </label>
                          <div className="relative w-full">
                            <TimeInput
                              value={endTime}
                              onChange={setEndTime}
                              is12Hour={false}
                              className="w-fit dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-1">
                        <div className="flex flex-1 flex-col mb-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Lesson (mins)
                          </label>
                          <div className="relative w-full">
                            <ReusableInput
                              type="number"
                              value={duration}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                if (value >= 1 && value <= 60) {
                                  setDuration(value);
                                }
                              }}
                              min={1}
                              max={60}
                              placeholder="e.g. 40"
                              className="w-20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                      <label
                        htmlFor="include_breaks"
                        className="dark:text-gray-300"
                      >
                        Include Breaks
                      </label>
                    </div>
                    {includeBreaks && (
                      <div className="space-y-1 transition-all duration-300 ease-in-out">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Breaks Configuration
                        </h3>
                        <div className="max-h-48 overflow-y-auto">
                          {breaks.map((brk, index) => (
                            <div
                              key={index}
                              className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 mb-2"
                            >
                              <div className="h-fit grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    After Lesson
                                  </label>
                                  <ReusableSelect
                                    value={brk.afterEvent}
                                    onChange={(e) =>
                                      updateBreak(
                                        index,
                                        "afterEvent",
                                        e.target.value
                                      )
                                    }
                                    options={availableLessons}
                                    placeholder="Select lesson"
                                    className="w-full dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Duration (mins)
                                  </label>
                                  <ReusableInput
                                    type="number"
                                    value={brk.duration}
                                    onChange={(e) =>
                                      updateBreak(
                                        index,
                                        "duration",
                                        e.target.value
                                      )
                                    }
                                    className="w-full dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                    min={5}
                                    max={60}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Type
                                  </label>
                                  <ReusableSelect
                                    value={brk.type}
                                    onChange={(e) =>
                                      updateBreak(index, "type", e.target.value)
                                    }
                                    options={breakTypeOptions}
                                    placeholder="Select break type"
                                    className="w-full dark:bg-gray-600 dark:border-gray-500 dark:text-white"
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
                      onClick={generateTimeSlots}
                      disabled={isSaveDisabled || !learningDays.length}
                    >
                      Generate Schedule
                    </Button>
                  </div>
                </ReusableDiv>

                <div className="mt-4">
                  {scheduleData.length > 0 && (
                    <TableComponent
                      columns={scheduleColumns}
                      data={scheduleData}
                      buttons={{
                        addButton: {
                          show: false,
                          label: "Add Cluster",
                        },
                        uploadButton: {
                          show: false,
                          label: "Upload Cluster",
                        },
                      }}
                      loading={false}
                      horizontalTableFlow={true}
                      showSelectAllCheckbox={false}
                      striped={true}
                      borderColor="blue-200 dark:border-gray-600"
                      rowColors={{
                        default: "hover:bg-blue-50 dark:hover:bg-gray-700",
                        selected: "bg-blue-100 dark:bg-gray-700",
                      }}
                      mobileBreakpoint="sm"
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </ModalForm>

      <ModalForm
        isOpen={modalState.viewTimeSlot && !isLoading}
        onClose={() => {
          setModalState({ ...modalState, viewTimeSlot: false });
        }}
        title={`View Time Slots for ${getUtilityDisplayName(selectedUtility)}`}
        icon={FiEye}
        closeOnOutsideClick={false}
        size="4xl"
        // isForm={false}
        submitText="Close"
      >
        {() => (
          <>
            {isLoading ? (
              <div className="text-center py-6">
                <FaSpinner className="animate-spin inline mr-2" />
                Loading time slots...
              </div>
            ) : (
              <div className="space-y-2 dark:text-gray-300">
                <h3 className="font-medium mb-4">Current Time Slots</h3>
                {timeSlots.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Time Slot
                          </th>
                          {timeSlots.map((slot) => (
                            <th
                              key={slot.id}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                              {slot.lesson_id}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-600">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">
                            Time
                          </td>
                          {timeSlots.map((slot) => (
                            <td
                              key={slot.id}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                            >
                              {`${slot.start} - ${slot.end}`}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">
                            Type
                          </td>
                          {timeSlots.map((slot) => (
                            <td
                              key={slot.id}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 uppercase font-bold"
                            >
                              {slot.category}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>No time slots configured</p>
                )}
              </div>
            )}
          </>
        )}
      </ModalForm>
    </div>
  );
};

export default TimeSlotRU;
