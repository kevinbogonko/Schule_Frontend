import React from 'react'
import { FaSpinner } from "react-icons/fa"

const Button = ({
    children,
    onClick,
    type = "button", // default to 'button'
    className = "", // allow custom classes
    variant = "primary", // default variant
    size = "sm",
    disabled = false,
    loading = false,
    icon : Icon,
    iconPosition = "left",
    ...props
}) => {
    // Base Tailwind classes
    const baseClasses = "my-4 px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"

    // Variant styles
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        success: "bg-green-500 text-white hover:bg-green-600",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        danger: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-200",
    }

    // Disabled state
    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : ""

    // Size
    const sizes = {
        sm : "px-4 py-1 text-sm",
        md : "px-4 py-2 text-base",
        lg : "px-5 py-2 text-lg"
    }

    return (
        <button
          type={type}
          onClick={onClick}
          disabled={disabled || loading}
          className={`${baseClasses} ${variants[variant]} ${disabledClasses} ${className} ${sizes[size]}`}
          {...props}
        >
            {/* Show Spinner if loading */}
            {loading && <FaSpinner className="animate-spin"/>}

            {/* Show icon on the left if provided and not loading */}
            {Icon && !loading && iconPosition === "left" && <Icon />}

            {/* Button Text */}
          {children}

          {/* Show buuton on right if provided and not loading */}
          {Icon && !loading && iconPosition === "right" && <Icon />}
        </button>
      );
}

export default Button
