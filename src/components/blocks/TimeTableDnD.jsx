import React, { useState, useEffect } from "react";

const timeSlots = [
  { id: 1, label: "8:00 - 9:00", type: "lesson" },
  { id: 2, label: "9:00 - 10:00", type: "lesson" },
  { id: 3, label: "10:00 - 10:30", type: "break" },
  { id: 4, label: "10:30 - 11:30", type: "lesson" },
  { id: 5, label: "11:30 - 12:30", type: "lesson" },
  { id: 6, label: "1:00 - 2:00", type: "lesson" },
  { id: 7, label: "2:00 - 3:00", type: "lesson" },
  { id: 8, label: "3:30 - 4:30", type: "games" },
];

const days = [
  { name: "Monday", hasGames: true },
  { name: "Tuesday", hasGames: false },
  { name: "Wednesday", hasGames: true },
  { name: "Thursday", hasGames: false },
  { name: "Friday", hasGames: true },
];

const COLORS = [
  "bg-red-200",
  "bg-yellow-200",
  "bg-green-200",
  "bg-blue-200",
  "bg-indigo-200",
  "bg-purple-200",
  "bg-pink-200",
  "bg-orange-200",
  "bg-teal-200",
  "bg-lime-200",
  "bg-amber-200",
  "bg-rose-200",
];

const subjects = [
  "Math",
  "English",
  "Science",
  "History",
  "Geography",
  "Kiswahili",
];
const activities = ["PE", "Music", "Library", "Art", "ICT", "Debate"];

const generateItemsWithColor = (labels) => {
  const shuffledColors = COLORS.sort(() => 0.5 - Math.random());
  return labels.map((label, index) => ({
    label,
    color: shuffledColors[index % COLORS.length],
  }));
};

const DraggableItem = ({ item }) => (
  <div
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData("text/plain", JSON.stringify(item));
      e.dataTransfer.effectAllowed = "move";
    }}
    className={`px-4 py-2 rounded cursor-move shadow mb-2 text-sm text-black ${item.color}`}
  >
    {item.label}
  </div>
);

const TimetableGrid = () => {
  const [gridContent, setGridContent] = useState({});
  const [subjectItems, setSubjectItems] = useState([]);
  const [activityItems, setActivityItems] = useState([]);

  useEffect(() => {
    setSubjectItems(generateItemsWithColor(subjects));
    setActivityItems(generateItemsWithColor(activities));
  }, []);

  const handleDrop = (dayIndex, timeIndex, e) => {
    e.preventDefault();
    const item = JSON.parse(e.dataTransfer.getData("text/plain"));
    const slot = timeSlots[timeIndex];
    if (slot.type === "break" || slot.type === "games") return;
    const key = `${dayIndex}-${timeIndex}`;
    setGridContent((prev) => ({ ...prev, [key]: item }));
  };

  const allowDrop = (dayIndex, timeIndex, e) => {
    const slot = timeSlots[timeIndex];
    const key = `${dayIndex}-${timeIndex}`;
    if (slot.type === "break" || slot.type === "games") {
      // Prevent drop in break or games cells
      e.preventDefault();
    } else {
      // Allow drop in other cells
      e.preventDefault();
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      {/* Draggable Collections */}
      <div className="flex gap-10 mb-4">
        <div>
          <h2 className="font-bold text-sm mb-2">Subjects</h2>
          {subjectItems.map((item, i) => (
            <DraggableItem key={`subject-${i}`} item={item} />
          ))}
        </div>
        <div>
          <h2 className="font-bold text-sm mb-2">Activities</h2>
          {activityItems.map((item, i) => (
            <DraggableItem key={`activity-${i}`} item={item} />
          ))}
        </div>
      </div>

      {/* Timetable Grid */}
      <div
        className="grid border border-gray-300 bg-white"
        style={{
          gridTemplateColumns: `100px repeat(${timeSlots.length}, 100px)`,
          width: "max-content",
        }}
      >
        {/* Header row with time slots */}
        <div className="p-2 font-bold text-center text-sm bg-gray-200 border border-gray-300">
          Day / Time
        </div>
        {timeSlots.map((slot, i) => (
          <div
            key={`time-${i}`}
            className="p-2 font-bold text-center text-sm bg-gray-200 border border-gray-300"
          >
            {slot.label}
          </div>
        ))}

        {/* Rows for each day */}
        {days.map((day, dayIndex) => (
          <React.Fragment key={`day-${dayIndex}`}>
            <div className="p-2 font-medium text-center text-sm bg-gray-100 border border-gray-300">
              {day.name}
            </div>
            {timeSlots.map((slot, timeIndex) => {
              const key = `${dayIndex}-${timeIndex}`;
              const item = gridContent[key];
              const isRestricted =
                slot.type === "break" ||
                (slot.type === "games" && day.hasGames) ||
                (slot.type === "games" && !day.hasGames);

              return (
                <div
                  key={key}
                  onDrop={(e) => handleDrop(dayIndex, timeIndex, e)}
                  onDragOver={(e) => allowDrop(dayIndex, timeIndex, e)}
                  className={`p-2 min-h-[50px] text-center text-sm border ${["break", "lunch", "games"]} border-gray-300 ${
                    slot.type === "break"
                      ? "bg-gray-100"
                      : slot.type === "games" && day.hasGames
                      ? "bg-green-100"
                      : ""
                  }`}
                >
                  {isRestricted ? (
                    <span className="text-xs font-semibold text-gray-500">
                      {slot.type === "break" ? "Break" : "Games"}
                    </span>
                  ) : item ? (
                    <DraggableItem item={item} />
                  ) : null}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TimetableGrid;
