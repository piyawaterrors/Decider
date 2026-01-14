import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

/**
 * DecisionResult Component
 * Modern Glassmorphism style for decision results
 */
export const DecisionResult = ({
  decision,
  contextMessage,
  onReroll,
  isLocked,
  onDonate,
  isDonationEnabled,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!decision) return null;

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -30 }}
          className="w-full max-w-4xl mx-auto"
        >
          {/* Result Card */}
          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-[3rem] p-8 sm:p-12 mb-8 relative overflow-hidden group">
            {/* Background Glows */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#CCFF00]/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#CCFF00]/15 transition-colors duration-500"></div>
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Main Result */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="text-center mb-8 relative z-10"
            >
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-medium mb-2 text-[#CCFF00] tracking-tighter drop-shadow-[0_0_30px_rgba(204,255,0,0.3)]">
                {decision.content}
              </h2>
            </motion.div>

            {/* Insult Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center relative z-10 px-4 mb-8"
            >
              <p className="text-xl sm:text-2xl font-medium text-white/90 leading-relaxed italic">
                "{decision.insult_text}"
              </p>
            </motion.div>

            {/* Context Message Badge */}
            {contextMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center relative z-10"
              >
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-2xl">
                  <span className="text-red-400 text-xs text-center">
                    ⚠️ {contextMessage}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Action Area */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            {!isLocked ? (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onReroll}
                className="
                  w-full sm:w-auto
                  bg-[#CCFF00] text-black font-medium 
                  py-4 px-12
                  rounded-2xl
                  shadow-[0_15px_30px_rgba(204,255,0,0.2)]
                  transition-all duration-300
                  text-lg
                "
              >
                🎲 สุ่มใหม่
              </motion.button>
            ) : (
              isDonationEnabled && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onDonate}
                  className="
                    w-full sm:w-auto
                    bg-gradient-to-r from-orange-400 to-red-500
                    text-white font-medium 
                    py-4 px-10
                    rounded-2xl
                    shadow-[0_15px_30px_rgba(239,68,68,0.2)]
                    transition-all duration-300
                    text-lg
                  "
                >
                  ☕ เลี้ยงกาแฟเพื่อปลดล็อก
                </motion.button>
              )
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
