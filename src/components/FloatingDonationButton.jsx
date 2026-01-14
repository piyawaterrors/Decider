import { motion } from "framer-motion";

/**
 * FloatingDonationButton Component
 * Floating button for donation that appears in bottom-right (desktop) or top-left (mobile)
 */
export const FloatingDonationButton = ({ onClick, isDonationEnabled }) => {
  if (!isDonationEnabled) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="
        fixed 
        top-4 left-4 sm:top-auto sm:left-auto sm:bottom-8 sm:right-8
        z-40
        bg-white/10 backdrop-blur-lg
        text-white font-medium
        py-3 px-5 sm:py-4 sm:px-6
        rounded-2xl
        border-2 border-white/20
        shadow-2xl hover:shadow-orange-400/20
        hover:bg-white/20
        transition-all duration-300
        flex items-center gap-2
        group
      "
      aria-label="เลี้ยงกาแฟ"
    >
      <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">
        ☕
      </span>
      <span className="hidden sm:inline text-sm md:text-base tracking-wide uppercase">
        Support Us
      </span>
    </motion.button>
  );
};
