import { useState, useEffect } from "react";

const TimeInput = ({
  value,
  onChange,
  disabled = false,
  is12Hour = false, // Toggle between 12hr and 24hr
}) => {
  const [displayValue, setDisplayValue] = useState("");

  // Convert between 24hr and 12hr formats for display
  useEffect(() => {
    if (!value) {
      setDisplayValue("");
      return;
    }

    if (is12Hour) {
      const [hours, minutes] = value.split(":").map(Number);
      const ampm = hours >= 12 ? "PM" : "AM";
      const twelveHour = hours % 12 || 12; // Convert 0 to 12 for 12AM
      setDisplayValue(
        `${twelveHour}:${String(minutes).padStart(2, "0")} ${ampm}`
      );
    } else {
      setDisplayValue(value);
    }
  }, [value, is12Hour]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (is12Hour) {
      // Validate 12hr format (e.g., "9:30 AM" or "12:45 PM")
      const match = newValue.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)?$/i);
      if (match || newValue === "") {
        const [_, hours, minutes, period] = match || [];
        let new24HourValue = "";
        if (hours && minutes) {
          let parsedHours = parseInt(hours, 10);
          const parsedMinutes = parseInt(minutes, 10);
          const isPM = period?.toUpperCase() === "PM";

          if (isPM && parsedHours < 12) parsedHours += 12;
          if (!isPM && parsedHours === 12) parsedHours = 0; // 12AM -> 0

          new24HourValue = `${String(parsedHours).padStart(2, "0")}:${String(
            parsedMinutes
          ).padStart(2, "0")}`;
        }
        onChange(new24HourValue || "");
      }
    } else {
      // Validate 24hr format (HH:MM)
      if (
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newValue) ||
        newValue === ""
      ) {
        onChange(newValue);
      }
    }
  };

  const incrementHour = () => {
    if (!value) {
      onChange("00:00");
      return;
    }
    const [hours, minutes] = value.split(":").map(Number);
    const newHours = (hours + 1) % 24;
    onChange(
      `${String(newHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
    );
  };

  const decrementHour = () => {
    if (!value) {
      onChange("00:00");
      return;
    }
    const [hours, minutes] = value.split(":").map(Number);
    const newHours = (hours - 1 + 24) % 24;
    onChange(
      `${String(newHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
    );
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder={is12Hour ? "HH:MM AM/PM" : "HH:MM"}
        className={`px-2 py-1.5 text-sm border rounded-md ring-0 focus:outline-none
          border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-200
          placeholder-gray-400 dark:placeholder-gray-500
          focus:ring-blue-500 dark:focus:ring-blue-400
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      />
      <div className="absolute right-2 flex flex-col">
        <button
          type="button"
          onClick={incrementHour}
          disabled={disabled}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none disabled:opacity-50"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={decrementHour}
          disabled={disabled}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none disabled:opacity-50"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TimeInput;
