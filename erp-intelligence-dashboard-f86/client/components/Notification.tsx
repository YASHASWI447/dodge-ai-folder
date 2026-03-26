import React from "react";
import { useNotification } from "@/context/NotificationContext";
import { AlertCircle, CheckCircle, Info, Loader } from "lucide-react";

export const Notification: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "loading":
        return <Loader className="w-5 h-5 text-blue-600 animate-spin" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-900";
      case "error":
        return "bg-red-50 border-red-200 text-red-900";
      case "loading":
        return "bg-blue-50 border-blue-200 text-blue-900";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-900";
      default:
        return "bg-gray-50 border-gray-200 text-gray-900";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 space-y-3 z-50 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border dashboard-card ${getStyles(
            notification.type
          )} animate-in fade-in slide-in-from-right`}
        >
          {getIcon(notification.type)}
          <span className="flex-1 text-sm font-medium">
            {notification.message}
          </span>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-2 text-current/60 hover:text-current transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notification;
