import { motion } from "framer-motion";

/**
 * LoadingView Component
 * High-Contrast Dark Mode loading screen/spinner
 */
export const LoadingView = ({
  message = "กำลังโหลด...",
  fullScreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        {/* Glowing Background Ring */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-[#CCFF00] rounded-full blur-2xl"
        />

        {/* Outer Rotating Ring */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 border-[3px] border-white/10 rounded-full relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -inset-[3px] border-[3px] border-transparent border-t-[#CCFF00] rounded-full"
          />
        </div>

        {/* Central Icon */}
        <div className="absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl">
          <motion.span
            animate={{
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🧠
          </motion.span>
        </div>
      </div>

      {/* Message */}
      <div className="mt-10 text-center">
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white text-lg sm:text-xl font-medium tracking-widest uppercase opacity-80"
        >
          {message}
        </motion.p>
        <div className="mt-2 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                backgroundColor: ["#ffffff44", "#CCFF00", "#ffffff44"],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-1.5 h-1.5 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#050510] flex items-center justify-center">
        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg aspect-square bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        {content}
      </div>
    );
  }

  return content;
};
