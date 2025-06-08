import { forwardRef, useMemo } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const sizeClasses = {
  sm: "py-1 text-xs",
  md: "py-1.5 text-sm",
  lg: "py-2 text-base",
};

const ReusableInput = forwardRef(
  (
    {
      value = "",
      onChange = () => {},
      placeholder = "",
      disabled = false,
      type = "text",
      className = "",
      id,
      name,
      autoFocus = false,
      min,
      max,
      step,
      size = "md",
      ...props
    },
    ref
  ) => {
    // Common input classes for both regular and phone inputs
    const inputClasses = useMemo(
      () => `
      block w-full rounded-md border-0 px-3
      ring-1 focus:ring-2 
      ring-gray-300 dark:ring-gray-600 
      focus:ring-indigo-500 dark:focus:ring-indigo-400
      ${
        disabled
          ? "cursor-not-allowed opacity-50 bg-gray-100 dark:bg-gray-700"
          : "bg-white dark:bg-gray-800"
      }
      text-gray-900 dark:text-gray-200
      placeholder-gray-400 dark:placeholder-gray-500
      ${sizeClasses[size] || sizeClasses.md}
      ${className}
    `,
      [disabled, size, className]
    );

    // Memoize the input component to prevent unnecessary re-renders
    const CustomInput = useMemo(
      () =>
        forwardRef((props, ref) => (
          <input
            ref={ref}
            {...props}
            className={`${props.className} ${
              disabled ? "" : "dark:!bg-gray-800 dark:!text-gray-200"
            }`}
          />
        )),
      [disabled]
    );

    // Phone number input logic
    if (type === "tel") {
      return (
        <div className={disabled ? "opacity-50" : ""}>
          <PhoneInput
            key={`phone-input-${name}`} // Add key to prevent re-renders
            ref={ref}
            international
            defaultCountry="KE"
            value={value}
            onChange={(value) => {
              onChange({ target: { name, value } });
            }}
            placeholder={placeholder}
            disabled={disabled}
            className={`${inputClasses}`}
            inputComponent={CustomInput}
            {...props}
          />
        </div>
      );
    }

    // Regular text input (default behavior)
    return (
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        id={id}
        name={name}
        autoFocus={autoFocus}
        min={min}
        max={max}
        step={step}
        className={inputClasses}
        {...props}
      />
    );
  }
);

ReusableInput.displayName = "ReusableInput";

export default ReusableInput;
