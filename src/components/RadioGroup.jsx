import { useState, useEffect } from 'react';

const RadioGroup = ({
  name,
  options = [],
  value: propValue,
  onChange,
  label,
  required = false,
  error,
  touched,
  className = '',
  orientation = 'vertical', // 'vertical' or 'horizontal'
  size = 'md', // 'sm', 'md', or 'lg'
  disabled = false,
}) => {
  const [internalValue, setInternalValue] = useState(propValue || '');

  // Sync with external value changes
  useEffect(() => {
    setInternalValue(propValue || '');
  }, [propValue]);

  const handleChange = (value) => {
    setInternalValue(value);
    if (onChange) {
      onChange({
        target: {
          name,
          value,
        },
      });
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // Orientation classes
  const orientationClasses = {
    vertical: 'space-y-2',
    horizontal: 'flex space-x-4',
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <legend className={`block text-sm font-medium text-gray-700 mb-2 ${error && touched ? 'text-red-600' : ''}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </legend>
      )}

      <div className={`${orientationClasses[orientation]}`}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${name}-${option.value}`}
              name={name}
              type="radio"
              checked={internalValue === option.value}
              onChange={() => handleChange(option.value)}
              disabled={disabled || option.disabled}
              className={`h-4 w-4 border ${
                error && touched
                  ? 'border-red-300 text-red-600 focus:ring-red-500'
                  : 'border-gray-300 text-indigo-600 focus:ring-indigo-500'
              } ${disabled || option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            />
            <label
              htmlFor={`${name}-${option.value}`}
              className={`ml-2 ${sizeClasses[size]} ${
                error && touched ? 'text-red-600' : 'text-gray-700'
              } ${disabled || option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>

      {error && touched && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default RadioGroup;