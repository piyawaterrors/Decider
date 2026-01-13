import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

/**
 * DecisionResult Component
 * Displays the decision result with animation and insult message
 */
export const DecisionResult = ({
  decision,
  contextMessage,
  onReroll,
  isLocked,
  onDonate,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!decision) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="w-full max-w-2xl mx-auto"
        >
          {/* Result Card */}
          <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-lg p-8 mb-6">
            {/* Main Result */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-center mb-6"
            >
              <h2 className="text-6xl font-black mb-4 text-gray-900">
                {decision.content}
              </h2>
            </motion.div>

            {/* Insult Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-yellow-300 border-4 border-black p-4 rounded-lg mb-4"
            >
              <p className="text-lg font-bold text-gray-900 text-center">
                {decision.insult_text}
              </p>
            </motion.div>

            {/* Context Message */}
            {contextMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-blue-200 border-4 border-black p-4 rounded-lg"
              >
                <p className="text-sm font-semibold text-gray-800 text-center">
                  ⚠️ {contextMessage}
                </p>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            {!isLocked ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onReroll}
                className="
                  bg-purple-500 text-white font-bold py-3 px-8 rounded-lg
                  border-4 border-black
                  shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                  hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                  transition-all duration-200
                "
              >
                🎲 สุ่มใหม่
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDonate}
                className="
                  bg-red-500 text-white font-bold py-3 px-8 rounded-lg
                  border-4 border-black
                  shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                  hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                  transition-all duration-200
                  animate-pulse
                "
              >
                ☕ เลี้ยงกาแฟเพื่อปลดล็อก
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
