import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  isVisible?: boolean;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  isVisible = true,
}) => {
  const [isShown, setIsShown] = useState(isVisible);

  useEffect(() => {
    setIsShown(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (isShown && duration > 0) {
      const timer = setTimeout(() => {
        setIsShown(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isShown, duration, onClose]);

  if (!isShown) return null;

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  };

  const styles = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-amber-50 border-amber-200',
  };

  const titleColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
    warning: 'text-amber-800',
  };

  const messageColors = {
    success: 'text-green-700',
    error: 'text-red-700',
    info: 'text-blue-700',
    warning: 'text-amber-700',
  };

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 w-full max-w-sm overflow-hidden rounded-lg border p-4 shadow-md',
        styles[type]
      )}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className={`text-sm font-medium ${titleColors[type]}`}>{title}</p>
          <p className={`mt-1 text-sm ${messageColors[type]}`}>{message}</p>
        </div>
        <div className="ml-4 flex flex-shrink-0">
          <button
            type="button"
            className={`inline-flex rounded-md bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2`}
            onClick={() => {
              setIsShown(false);
              if (onClose) onClose();
            }}
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
