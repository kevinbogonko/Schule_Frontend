const Checkbox = ({
  id,
  label,
  checked = false,
  onChange,
  disabled = false,
  className = "",
  labelClassName = "",
  ...props
}) => {
  return (
    <div className={`flex items-center ${className}`} {...props}>
      <label htmlFor={id} className="flex items-center cursor-pointer">
        {/* Visual checkbox container - now clickable */}
        <div className="relative">
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="absolute opacity-0 h-0 w-0"
          />
          <div
            className={`flex items-center justify-center w-5 h-5 border rounded transition-all 
            ${
              checked
                ? "bg-blue-500 border-blue-500"
                : "bg-white border-gray-300"
            }
            ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:border-blue-400"
            }
          `}
          >
            {checked && (
              <svg
                className="w-3 h-3 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
        {/* Label - now part of the same clickable area */}
        {label && (
          <span
            className={`ml-2 text-sm font-medium ${
              disabled ? "text-gray-400" : "text-gray-700"
            } ${labelClassName}`}
          >
            {label}
          </span>
        )}
      </label>
    </div>
  );
};

export default Checkbox