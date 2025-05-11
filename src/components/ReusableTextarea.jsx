import { useState, useRef, useEffect } from "react";

const ReusableTextarea = ({
  value = "",
  onChange,
  placeholder = "",
  disabled = false,
  rows = 2,
  className = "",
  autoResize = true,
  minHeight = "auto",
  maxHeight = "300px",
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(e);
  };

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = minHeight;
      const newHeight = Math.min(
        textarea.scrollHeight,
        parseInt(maxHeight) || Infinity
      );
      textarea.style.height = `${newHeight}px`;
    }
  }, [internalValue, autoResize, minHeight, maxHeight]);

  return (
    <div className={`relative w-full ${className}`}>
      <textarea
        ref={textareaRef}
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`
          w-full
          block rounded-lg border-0 p-3
          ring-1 ring-gray-300 dark:ring-gray-600
          focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-500
          shadow-sm
          transition-all duration-200 ease-in-out
          resize-none
          overflow-hidden
          ${
            disabled
              ? "cursor-not-allowed opacity-70 bg-gray-100 dark:bg-gray-700"
              : ""
          }
        `}
        style={{
          minHeight: minHeight === "auto" ? `${rows * 24}px` : minHeight,
          maxHeight,
        }}
        {...props}
      />
    </div>
  );
};

export default ReusableTextarea;
