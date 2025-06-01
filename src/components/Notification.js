import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const Notification = ({ message, type, onDismiss }) => {
  if (!message) return null;

  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  const bgColor = typeClasses[type] || typeClasses.info;

  return (
    <div className={`fixed top-5 right-5 ${bgColor} text-white p-4 rounded-lg shadow-md z-50 flex items-center transition-all duration-300 ease-in-out animate-fadeInRight`}>
      <AlertCircle size={20} className="mr-2" />
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="ml-4 text-white hover:text-gray-200">
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default Notification;