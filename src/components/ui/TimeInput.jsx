import { useState, useEffect, useRef } from "react";

const TimeInput = ({ value, onChange, disabled = false, is12Hour = false }) => {
  const [displayValue, setDisplayValue] = useState("");
  const [selectionStart, setSelectionStart] = useState(null);
  const inputRef = useRef(null);

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
    setSelectionStart(e.target.selectionStart);

    if (is12Hour) {
      const match = newValue.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)?$/i);
      if (match || newValue === "") {
        const [_, hours, minutes, period] = match || [];
        let new24HourValue = "";
        if (hours && minutes) {
          let parsedHours = parseInt(hours, 10);
          const parsedMinutes = parseInt(minutes, 10);
          const isPM = period?.toUpperCase() === "PM";

          if (isPM && parsedHours < 12) parsedHours += 12;
          if (!isPM && parsedHours === 12) parsedHours = 0;

          new24HourValue = `${String(parsedHours).padStart(2, "0")}:${String(
            parsedMinutes
          ).padStart(2, "0")}`;
        }
        onChange(new24HourValue || "");
      }
    } else {
      if (
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newValue) ||
        newValue === ""
      ) {
        onChange(newValue);
      }
    }
  };

  const handleSelect = (e) => {
    setSelectionStart(e.target.selectionStart);
  };

  const updateTime = (increment = true, isHour = false) => {
    if (!value) {
      onChange("00:00");
      return;
    }

    const [hours, minutes] = value.split(":").map(Number);
    let newHours = hours;
    let newMinutes = minutes;

    if (isHour) {
      newHours = increment ? (hours + 1) % 24 : (hours - 1 + 24) % 24;
    } else {
      newMinutes = increment ? (minutes + 1) % 60 : (minutes - 1 + 60) % 60;
    }

    onChange(
      `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(
        2,
        "0"
      )}`
    );
  };

  const handleIncrement = () => {
    // Determine if user is editing hours or minutes based on cursor position
    const cursorPos = selectionStart !== null ? selectionStart : 0;
    const displayStr = displayValue;

    if (is12Hour) {
      // For 12-hour format: "12:30 PM" - check if cursor is before or after colon
      const colonIndex = displayStr.indexOf(":");
      if (colonIndex === -1) return;

      // Check if cursor is in hour section (before colon) or minute section
      const isHour = cursorPos <= colonIndex;
      updateTime(true, isHour);
    } else {
      // For 24-hour format: "14:30" - check if cursor is before or after colon
      const colonIndex = displayStr.indexOf(":");
      if (colonIndex === -1) return;

      const isHour = cursorPos <= colonIndex;
      updateTime(true, isHour);
    }
  };

  const handleDecrement = () => {
    // Determine if user is editing hours or minutes based on cursor position
    const cursorPos = selectionStart !== null ? selectionStart : 0;
    const displayStr = displayValue;

    if (is12Hour) {
      const colonIndex = displayStr.indexOf(":");
      if (colonIndex === -1) return;

      const isHour = cursorPos <= colonIndex;
      updateTime(false, isHour);
    } else {
      const colonIndex = displayStr.indexOf(":");
      if (colonIndex === -1) return;

      const isHour = cursorPos <= colonIndex;
      updateTime(false, isHour);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onSelect={handleSelect}
        disabled={disabled}
        placeholder={is12Hour ? "HH:MM AM/PM" : "HH:MM"}
        className={`px-3 py-2 text-sm border rounded-md ring-0 focus:outline-none
          border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-200
          placeholder-gray-400 dark:placeholder-gray-500
          focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          pr-10`}
      />
      <div className="absolute right-1 flex flex-col h-full justify-center gap-0.5">
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled}
          className="flex items-center justify-center w-6 h-6 text-gray-500 
            hover:text-gray-700 dark:hover:text-gray-300 
            hover:bg-gray-100 dark:hover:bg-gray-700 
            focus:outline-none focus:ring-1 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            rounded-t-md border border-gray-300 dark:border-gray-600
            border-b-0"
          title="Increase time (hours if cursor is on hours, minutes if on minutes)"
        >
          <svg
            className="w-3 h-3"
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
          onClick={handleDecrement}
          disabled={disabled}
          className="flex items-center justify-center w-6 h-6 text-gray-500 
            hover:text-gray-700 dark:hover:text-gray-300 
            hover:bg-gray-100 dark:hover:bg-gray-700 
            focus:outline-none focus:ring-1 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            rounded-b-md border border-gray-300 dark:border-gray-600"
          title="Decrease time (hours if cursor is on hours, minutes if on minutes)"
        >
          <svg
            className="w-3 h-3"
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
