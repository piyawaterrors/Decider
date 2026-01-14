import { motion } from "framer-motion";
import { getEmojiFromIcon } from "../data/categories";

/**
 * CategoryCard Component
 * Modern Glassmorphism style for category selection
 */
export const CategoryCard = ({ category, onClick }) => {
  const emoji = getEmojiFromIcon(category.icon_name);

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="
        relative cursor-pointer
        bg-black/40 backdrop-blur-xl
        border-2 border-white/30
        hover:border-[#CCFF00]
        shadow-[0_10px_30px_rgba(0,0,0,0.5)]
        hover:shadow-[#CCFF00]/20
        transition-all duration-300
        p-8 rounded-[2rem]
        flex flex-col items-center justify-center
        group overflow-hidden
      "
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="text-7xl mb-6 relative z-10 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform duration-300">
        {emoji}
      </div>

      <h3 className="text-2xl sm:text-3xl font-medium text-white text-center mb-2 relative z-10 tracking-tight">
        {category.title}
      </h3>

      {category.description && (
        <p className="text-white/60 text-center text-sm font-normal relative z-10 px-2 line-clamp-2">
          {category.description}
        </p>
      )}

      {/* Decorative dot */}
      <div className="absolute bottom-4 right-4 w-2 h-2 bg-white/30 rounded-full" />
    </motion.div>
  );
};
