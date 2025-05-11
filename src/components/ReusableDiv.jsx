import React, { useState, useRef, useEffect } from "react";
import { FaAngleDown } from "react-icons/fa";

const ReusableDiv = ({
  children,
  className = "",
  disabled = false,
  icon: Icon,
  iconPosition = "left",
  tag = "",
  collapsible = false,
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [maxHeight, setMaxHeight] = useState("0px");
  const contentRef = useRef(null);

  const baseClasses =
    "mx-2 px-4 py-2 ring-1 rounded-md font-small transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed " +
    "bg-white dark:bg-gray-800 ring-gray-200 dark:ring-gray-700 text-gray-800 dark:text-gray-200 relative"; // Added 'relative' here
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  const toggleExpand = () => {
    if (!disabled && collapsible) {
      setIsExpanded((prev) => !prev);
    }
  };

  useEffect(() => {
    if (collapsible && contentRef.current) {
      if (isExpanded) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`);
      } else {
        setMaxHeight("0px");
      }
    }
  }, [isExpanded, collapsible, children]);

  return (
    <div
      className={`${baseClasses} ${disabledClasses} ${className}`}
      {...props}
      style={{ overflow: "visible" }} // Added to prevent clipping
    >
      <div className="flex justify-between items-center mb-2 p-1 rounded-sm font-medium">
        <div className="flex items-center gap-4">
          {Icon && iconPosition === "left" && (
            <Icon className="text-gray-600 dark:text-gray-400" />
          )}
          {tag && (
            <span className="text-gray-700 dark:text-gray-300">{tag}</span>
          )}
        </div>
        {collapsible && (
          <button
            onClick={toggleExpand}
            className="p-1 transition-transform duration-300 ease-in-out focus:outline-none text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <FaAngleDown
              size={18}
              className={`transform transition-transform duration-300 ${
                isExpanded ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
        )}
      </div>
      <div
        ref={contentRef}
        className="transition-all duration-300 ease-in-out text-gray-700 dark:text-gray-300"
        style={{
          maxHeight: !collapsible ? "none" : maxHeight,
          opacity: !collapsible || isExpanded ? 1 : 0,
          pointerEvents: !collapsible || isExpanded ? "auto" : "none",
          overflow: "visible", // Changed from "hidden" to "visible"
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ReusableDiv;
