import React, { useState, useRef, useEffect } from "react";

const timeSlots = [
  { id: 1, label: "8:00 - 9:00", type: "lesson" },
  { id: 2, label: "9:00 - 10:00", type: "lesson" },
  { id: 3, label: "10:00 - 10:30", type: "break" },
  { id: 4, label: "10:30 - 11:30", type: "lesson" },
  { id: 5, label: "11:30 - 12:30", type: "lesson" },
  { id: 6, label: "1:00 - 2:00", type: "lunch" },
  { id: 7, label: "2:00 - 3:00", type: "lesson" },
  { id: 8, label: "3:30 - 4:30", type: "games" },
  { id: 8, label: "4:30 - 5:00", type: "lesson" },
  { id: 8, label: "5:00 - 5:30", type: "lesson" },
];

const days = [
  { name: "Monday", hasGames: true },
  { name: "Tuesday", hasGames: false },
  { name: "Wednesday", hasGames: true },
  { name: "Thursday", hasGames: false },
  { name: "Friday", hasGames: true },
];

const streams = [
  { id: 1, name: "1W", form: 1 },
  { id: 2, name: "1E", form: 1 },
  { id: 3, name: "1N", form: 1 },
  { id: 4, name: "1Y", form: 1 },
];

const subjectsPerStream = [
  { id: 1, name: "MAT", periodsPerWeek: 4, streamId: 1, teacherId: 1 },
  { id: 2, name: "MAT", periodsPerWeek: 4, streamId: 2, teacherId: 5 },
  { id: 3, name: "ENG", periodsPerWeek: 3, streamId: 1, teacherId: 2 },
  { id: 4, name: "CHE", periodsPerWeek: 2, streamId: 2, teacherId: 5 },
  { id: 5, name: "GEO", periodsPerWeek: 3, streamId: 2, teacherId: 3 },
  { id: 6, name: "CST", periodsPerWeek: 3, streamId: 2, teacherId: 3 },
  { id: 7, name: "PHY", periodsPerWeek: 3, streamId: 1, teacherId: 2 },
  { id: 8, name: "HIS", periodsPerWeek: 2, streamId: 2, teacherId: 4 },
  { id: 9, name: "CRE", periodsPerWeek: 3, streamId: 2, teacherId: 3 },
  { id: 10, name: "HSC", periodsPerWeek: 3, streamId: 2, teacherId: 2 },
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

const TimetableGrid = () => {
  const [selectedStream, setSelectedStream] = useState(streams[0].id);
  const [gridContent, setGridContent] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [dragOverKey, setDragOverKey] = useState(null);
  const [animationKeys, setAnimationKeys] = useState([]);
  const draggingUID = useRef(null);
  const draggingFromCell = useRef(null);

  // Filter subjects based on selected stream
  useEffect(() => {
    const filteredSubjects = subjectsPerStream
      .filter((subject) => subject.streamId === selectedStream)
      .map((subject, index) => ({
        ...subject,
        label: subject.name,
        color: subjectColors[index % subjectColors.length],
        count: subject.periodsPerWeek,
      }));

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
    <div className="w-full overflow-x-auto space-y-4">
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

      <div className="flex gap-4 flex-wrap p-2 border border-gray-300 rounded bg-gray-50">
        {subjects.map((subject) => (
          <div
            key={`${subject.id}-${subject.streamId}`}
            className={`cursor-move px-3 py-2 text-sm rounded text-white font-semibold flex items-center justify-between ${subject.color}`}
            draggable
            onDragStart={() => handleDragStart(subject)}
          >
            {subject.name} ({subject.count})
          </div>
        ))}
      </div>

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
                          ? "bg-gray-50" // This can be set to 50
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
                            isSelectedStream ? "cursor-move" : "cursor-default"
                          } relative ${item.color} ${
                            animationKeys.includes(key) ? "animate-fade-in" : ""
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
