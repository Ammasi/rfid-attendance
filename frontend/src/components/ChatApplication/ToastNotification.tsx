// src/components/ToastNotification.tsx
import React, { useEffect } from "react";

interface ToastProps {
  title: string;
  body: string;
  visible: boolean;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastProps> = ({
  title,
  body,
  visible,
  onClose,
}) => {
  // Auto‐dismiss after 4 seconds
  useEffect(() => {
    if (!visible) return;
    const timeout = setTimeout(onClose, 8000);
    return () => clearTimeout(timeout);
  }, [visible, onClose]);

  return (
    <div
      className={`fixed z-50 bottom-4 right-4 w-80 max-w-xs transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      } bg-white border border-gray-300 shadow-lg rounded-lg`}
    >
      <div className="p-3 flex flex-col space-y-1">
        <div className="font-poppins text-sm font-bold  text-black">{title}</div>
        <div className="text-xs font-poppins text-gray-600 line-clamp-1">{body}</div>
      </div>
      <button
        onClick={onClose}
        className="absolute top-1 right-2 text-black hover:text-red-500 text-xs"
      >
        ✕
      </button>
    </div>
  );
};
