import { forwardRef, useState, useEffect } from "react";

const ReusableSelect = forwardRef(
  (
    {
      options = [],
      value = "",
      defaultValue = "",
      onChange,
      placeholder = "Select an option",
      disabled = false,
      className = "",
      id,
      name,
      autoFocus = false,
      required = false,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(value || defaultValue);

    // Handle both controlled and uncontrolled usage
    const handleChange = (e) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      if (onChange) {
        onChange(e);
      }
    };

    // Sync with external value changes
    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    return (
      <select
        ref={ref}
        value={internalValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        id={id}
        name={name}
        autoFocus={autoFocus}
        required={required}
        className={`
        block rounded-md border-0 p-1.5 ring-1 focus:ring-1 sm:text-sm sm:leading-6
        bg-white dark:bg-gray-800
        text-gray-900 dark:text-gray-200
        ring-gray-300 dark:ring-gray-600
        focus:ring-blue-500 dark:focus:ring-blue-400
        ${disabled ? "cursor-not-allowed opacity-50" : ""}
        ${className}
      `}
        {...props}
      >
        {placeholder && (
          <option
            value=""
            disabled
            className="text-gray-400 dark:text-gray-500"
          >
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

ReusableSelect.displayName = "ReusableSelect";

export default ReusableSelect;
