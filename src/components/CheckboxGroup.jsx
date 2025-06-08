import React, { useState } from "react";

const CheckboxGroup = ({
  label,
  options,
  selectedValues = [],
  onChange,
  disabled = false,
  name = "checkbox-group",
  className = "",
  showDescriptions = false,
  height = "100px",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const allValues = options.map((option) => option.value);
  const allSelected =
    allValues.length > 0 &&
    allValues.every((val) => selectedValues.includes(val));
  const someSelected = !allSelected && selectedValues.length > 0;

  const handleChange = (value) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(newSelectedValues);
  };

  const toggleAll = () => {
    onChange(allSelected ? [] : allValues);
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`border border-gray-200 dark:border-gray-600 rounded-lg p-4 ${className} bg-white dark:bg-gray-800`}
    >
      <div className="flex items-center justify-between mb-2">
        {label && (
          <legend className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {label}
          </legend>
        )}
        <button
          type="button"
          onClick={toggleAll}
          disabled={disabled}
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 disabled:text-gray-400 dark:disabled:text-gray-500"
        >
          {someSelected
            ? "Toggle all"
            : allSelected
            ? "Uncheck all"
            : "Check all"}
        </button>
      </div>

      <div className="mb-2">
        <input
          type="text"
          placeholder="Search options..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 text-sm border border-gray-300 dark:border-gray-500 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-400"
          disabled={disabled}
        />
      </div>

      <div className={`overflow-y-auto`} style={{ height }}>
        <div className="space-y-2">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className="relative flex items-start py-1"
              >
                <div className="flex h-5 items-center">
                  <input
                    id={`${name}-${option.value}`}
                    name={name}
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => handleChange(option.value)}
                    disabled={disabled || option.disabled}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-500 text-blue-600 dark:text-blue-400 focus:ring-blue-600 dark:focus:ring-blue-400 bg-white dark:bg-gray-700"
                  />
                </div>
                <div className="ml-2 text-sm leading-5 min-w-0">
                  <label
                    htmlFor={`${name}-${option.value}`}
                    className={`font-medium ${
                      disabled || option.disabled
                        ? "text-gray-400 dark:text-gray-500"
                        : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {option.label}
                  </label>
                  {showDescriptions && option.description && (
                    <p className="text-gray-500 dark:text-gray-400 truncate">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-2 text-center">
              No options found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckboxGroup;
