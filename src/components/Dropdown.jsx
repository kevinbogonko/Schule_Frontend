import { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiCheck, FiX } from "react-icons/fi";

const Dropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  searchable = false,
  clearable = false,
  className = "",
  multiple = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          Math.min(prev + 1, filteredOptions.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && highlightedIndex >= 0) {
        e.preventDefault();
        const option = filteredOptions[highlightedIndex];
        if (multiple) {
          handleMultipleSelect(option.value);
        } else {
          handleSelect(option.value);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, highlightedIndex, filteredOptions, multiple]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleMultipleSelect = (optionValue) => {
    const currentValue = Array.isArray(value) ? value : [];
    if (currentValue.includes(optionValue)) {
      onChange(currentValue.filter((v) => v !== optionValue));
    } else {
      onChange([...currentValue, optionValue]);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(multiple ? [] : null);
  };

  const getDisplayValue = () => {
    if (multiple) {
      const selectedOptions = options.filter(
        (o) => Array.isArray(value) && value.includes(o.value)
      );
      if (selectedOptions.length === 0) return placeholder;
      return selectedOptions.map((o) => o.label).join(", ");
    } else {
      const selected = options.find((o) => o.value === value);
      return selected?.label || placeholder;
    }
  };

  const isSelected = (optionValue) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between w-full p-1.5 text-left bg-white dark:bg-gray-800 rounded-md border-0 ring-1 focus:ring-2 
          ring-gray-300 dark:ring-gray-600 focus:ring-black dark:focus:ring-white
          ${disabled ? "cursor-not-allowed opacity-50" : ""}
        `}
        style={{
          fontSize: "0.875rem",
          lineHeight: "1.25rem",
        }}
      >
        <span
          className={`truncate ${
            !value || (multiple && value.length === 0)
              ? "text-gray-400 dark:text-gray-500"
              : "dark:text-gray-200"
          }`}
        >
          {getDisplayValue()}
        </span>
        <div className="flex items-center ml-2">
          {clearable &&
            ((multiple && value?.length > 0) || (!multiple && value)) && (
              <FiX
                className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mr-1"
                onClick={handleClear}
              />
            )}
          <FiChevronDown
            className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 focus:outline-none text-sm">
          {searchable && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none text-sm dark:bg-gray-700 dark:text-white"
                autoFocus
              />
            </div>
          )}

          <ul className="py-1 max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  className={`
                    px-3 py-2 cursor-pointer flex items-center justify-between text-sm
                    ${
                      highlightedIndex === index
                        ? "bg-indigo-50 dark:bg-gray-700"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }
                    dark:text-gray-200
                  `}
                  onClick={() =>
                    multiple
                      ? handleMultipleSelect(option.value)
                      : handleSelect(option.value)
                  }
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span>{option.label}</span>
                  {isSelected(option.value) && (
                    <FiCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                No options found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
