import { useState, useEffect } from 'react';
import { 
  FiCheckCircle, 
  FiAlertCircle, 
  FiInfo, 
  FiX, 
  FiAlertTriangle 
} from 'react-icons/fi';

const Alert = ({
  variant = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  autoDismiss = false,
  dismissAfter = 5000,
  className = '',
  showIcon = true,
  action,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto dismiss after timeout if enabled
  useEffect(() => {
    if (autoDismiss && isVisible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, dismissAfter);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, dismissAfter, isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible) return null;

  // Variant configurations
  const variants = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-100',
      text: 'text-green-800',
      icon: <FiCheckCircle className="h-5 w-5 text-green-400" />,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-100',
      text: 'text-red-800',
      icon: <FiAlertCircle className="h-5 w-5 text-red-400" />,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-100',
      text: 'text-yellow-800',
      icon: <FiAlertTriangle className="h-5 w-5 text-yellow-400" />,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-800',
      icon: <FiInfo className="h-5 w-5 text-blue-400" />,
    },
  };

  const currentVariant = variants[variant] || variants.info;

  return (
    <div 
      className={`rounded-md p-4 ${currentVariant.bg} ${currentVariant.border} ${className}`}
      role="alert"
    >
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0 mr-3">
            {currentVariant.icon}
          </div>
        )}
        
        <div className="flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${currentVariant.text}`}>
              {title}
            </h3>
          )}
          {message && (
            <div className={`mt-2 text-sm ${currentVariant.text}`}>
              <p>{message}</p>
            </div>
          )}
          {action && (
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                <button
                  type="button"
                  onClick={action.onClick}
                  className={`px-2 py-1.5 rounded-md text-sm font-medium ${currentVariant.text} hover:${currentVariant.bg.replace('50', '100')} focus:outline-none focus:ring-2 focus:ring-offset-2 ${variant === 'warning' ? 'focus:ring-yellow-500' : variant === 'error' ? 'focus:ring-red-500' : variant === 'success' ? 'focus:ring-green-500' : 'focus:ring-blue-500'}`}
                >
                  {action.label}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={handleDismiss}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 ${currentVariant.bg} ${currentVariant.text.replace('800', '400')} hover:${currentVariant.bg.replace('50', '100')} ${variant === 'warning' ? 'focus:ring-yellow-500' : variant === 'error' ? 'focus:ring-red-500' : variant === 'success' ? 'focus:ring-green-500' : 'focus:ring-blue-500'}`}
              >
                <span className="sr-only">Dismiss</span>
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;