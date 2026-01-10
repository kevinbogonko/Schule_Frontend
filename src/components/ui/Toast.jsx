import { useState, createContext, useContext } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX, FiAlertTriangle } from 'react-icons/fi';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', options = {}) => {
    const id = Math.random().toString(36).substring(2, 9);
    const position = options.position || 'top-right';
    
    setToasts(prev => [...prev, { 
      id, 
      message, 
      type, 
      position,
      title: options.title,
      duration: options.duration,
      dismissible: options.dismissible !== false
    }]);
    
    if (options.duration) {
      setTimeout(() => removeToast(id), options.duration);
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Group toasts by position
  const toastGroups = {};
  toasts.forEach(toast => {
    if (!toastGroups[toast.position]) {
      toastGroups[toast.position] = [];
    }
    toastGroups[toast.position].push(toast);
  });

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Render toast containers for each position */}
      {Object.entries(toastGroups).map(([position, positionToasts]) => (
        <ToastContainer key={position} position={position}>
          {positionToasts.map(toast => (
            <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
          ))}
        </ToastContainer>
      ))}
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ position, children }) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  return (
    <div className={`fixed space-y-2 z-50 ${positionClasses[position]}`}>
      {children}
    </div>
  );
};

const Toast = ({ message, type = 'info', onClose, title, dismissible = true }) => {
  const icons = {
    success: <FiCheckCircle className="text-green-500" />,
    error: <FiAlertCircle className="text-red-500" />,
    warning: <FiAlertTriangle className="text-yellow-500" />,
    info: <FiInfo className="text-blue-500" />
  };

  const colors = {
    success: 'bg-green-100 border-green-200 text-green-800',
    error: 'bg-red-100 border-red-200 text-red-800',
    warning: 'bg-yellow-100 border-yellow-200 text-yellow-800',
    info: 'bg-blue-100 border-blue-200 text-blue-800'
  };

  return (
    <div className={`p-4 rounded border ${colors[type]} max-w-xs shadow-lg`}>
      <div className="flex items-start">
        <div className="mr-3 text-lg">{icons[type]}</div>
        <div className="flex-1">
          {title && <h3 className="font-bold">{title}</h3>}
          <p className="text-sm">{message}</p>
        </div>
        {dismissible && (
          <button 
            onClick={onClose} 
            className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FiX />
          </button>
        )}
      </div>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};