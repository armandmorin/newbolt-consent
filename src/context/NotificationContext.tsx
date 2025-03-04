import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification, { NotificationType } from '../components/ui/Notification';

interface NotificationContextType {
  showNotification: (type: NotificationType, title: string, message: string, duration?: number) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

interface NotificationState {
  type: NotificationType;
  title: string;
  message: string;
  duration: number;
  isVisible: boolean;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showNotification = useCallback(
    (type: NotificationType, title: string, message: string, duration = 5000) => {
      setNotification({
        type,
        title,
        message,
        duration,
        isVisible: true,
      });
    },
    []
  );

  const hideNotification = useCallback(() => {
    setNotification((prev) => (prev ? { ...prev, isVisible: false } : null));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          duration={notification.duration}
          isVisible={notification.isVisible}
          onClose={hideNotification}
        />
      )}
    </NotificationContext.Provider>
  );
};
