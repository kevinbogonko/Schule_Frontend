import React, { useState, useEffect, useRef } from "react";

const ModalForm = ({
  isOpen = false,
  onClose,
  title,
  icon: Icon,
  iconPosition = "left",
  description,
  initialValues = {},
  onSubmit,
  submitText = "Submit",
  cancelText = "Cancel",
  children,
  size = "md",
  formProps = {},
  formClassName = "",
  isForm = true,
  showCloseButton = true,
  closeOnOutsideClick = true,
  customButtons = null,
}) => {
  const [values, setValues] = useState(initialValues);
  const modalRef = useRef(null);

  // Reset form only when isOpen changes to true
  useEffect(() => {
    if (isOpen) {
      setValues(initialValues);
    }
  }, [isOpen]); // Removed initialValues from dependencies

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        closeOnOutsideClick &&
        isOpen &&
        modalRef.current &&
        !modalRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, closeOnOutsideClick]);

  // Trap focus inside modal
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length) {
        focusableElements[0].focus();
      }
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  const handleCustomButtonClick = (buttonProps, e) => {
    if (buttonProps.onClick) {
      buttonProps.onClick();
    } else if (buttonProps.type === "submit") {
      handleSubmit(e);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "w-full max-w-[95vw]",
  };

  const renderCustomButtons = () => {
    if (!customButtons) return null;

    if (Array.isArray(customButtons)) {
      return customButtons.map((button, index) => {
        const buttonProps = {
          key: index,
          className: `rounded-md px-4 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
            button.className ||
            "bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus-visible:outline-blue-500"
          }`,
          onClick: (e) => handleCustomButtonClick(button, e),
          ...button,
        };

        return <button {...buttonProps}>{button.label}</button>;
      });
    }

    return customButtons;
  };

  return (
    <div className="relative z-50">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 transition-opacity" />

      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div
            ref={modalRef}
            className={`relative transform rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 w-full ${sizeClasses[size]} sm:p-6 overflow-visible`}
          >
            {showCloseButton && (
              <button
                type="button"
                className="absolute right-0 top-0 mr-4 mt-4 rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}

            <div>
              <div className="my-3 text-center sm:mt-0 sm:text-left">
                <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white flex items-center gap-4">
                  {Icon && iconPosition === "left" && (
                    <Icon className="dark:text-gray-300" />
                  )}
                  {title}
                  {Icon && iconPosition === "right" && (
                    <Icon className="dark:text-gray-300" />
                  )}
                </h3>
                {description && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {description}
                    </p>
                  </div>
                )}
              </div>
              <hr className="dark:border-gray-700" />

              {isForm ? (
                <form
                  onSubmit={handleSubmit}
                  className={`mt-5 ${formClassName}`}
                  {...formProps}
                >
                  <div className="space-y-4">
                    {typeof children === "function"
                      ? children({ values, handleChange })
                      : React.Children.map(children, (child) => {
                          if (React.isValidElement(child)) {
                            return React.cloneElement(child, {
                              value: values[child.props.name] || "",
                              onChange: handleChange,
                            });
                          }
                          return child;
                        })}
                  </div>

                  <div className="mt-5 flex justify-end gap-3">
                    {customButtons ? (
                      renderCustomButtons()
                    ) : (
                      <>
                        <button
                          type="button"
                          className="rounded-md bg-white dark:bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                          onClick={onClose}
                        >
                          {cancelText}
                        </button>
                        <button
                          type="submit"
                          className="rounded-md bg-blue-600 dark:bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 dark:hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-500"
                        >
                          {submitText}
                        </button>
                      </>
                    )}
                  </div>
                </form>
              ) : (
                <>
                  <div className={`mt-5 ${formClassName}`}>{children}</div>
                  <div className="mt-5 flex justify-end">
                    {customButtons ? (
                      renderCustomButtons()
                    ) : (
                      <button
                        type="button"
                        className="rounded-md px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200"
                        onClick={onClose}
                      >
                        {submitText || "Close"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalForm;
