import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

/**
 * Toast Notification Component
 * High-Contrast Dark Mode Glassmorphism style
 */
export const Notification = ({
  message,
  type = "success",
  isVisible,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const icons = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
    warning: "⚠️",
  };

  const colors = {
    success: "border-[#CCFF00]/30 text-[#CCFF00]",
    error: "border-red-500/30 text-red-400",
    info: "border-blue-500/30 text-blue-400",
    warning: "border-yellow-500/30 text-yellow-400",
  };

  const glows = {
    success: "bg-[#CCFF00]/5",
    error: "bg-red-500/5",
    info: "bg-blue-500/5",
    warning: "bg-yellow-500/5",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          className="fixed top-6 right-6 z-[200] flex items-center gap-4"
        >
          <div
            className={`
            relative overflow-hidden
            bg-white/[0.03] backdrop-blur-2xl 
            border ${colors[type]} 
            px-6 py-4 rounded-2xl shadow-2xl
            min-w-[300px] flex items-center gap-4
          `}
          >
            {/* Background Glow */}
            <div
              className={`absolute -right-4 -top-4 w-16 h-16 ${glows[type]} rounded-full blur-xl`}
            />

            <span className="text-2xl">{icons[type]}</span>

            <div className="flex-1">
              <p className="text-sm font-medium tracking-wide">{message}</p>
            </div>

            <button
              onClick={onClose}
              className="ml-2 text-white/20 hover:text-white transition-colors"
            >
              <svg
                className="w-4 h-4"
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

            {/* Progress Bar */}
            {duration > 0 && (
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: duration / 1000, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-1 ${
                  type === "success" ? "bg-[#CCFF00]" : "bg-current"
                } opacity-30`}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
