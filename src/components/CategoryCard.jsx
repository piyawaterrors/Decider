import { motion } from "framer-motion";
import { getEmojiFromIcon, getColorFromIcon } from "../data/categories";

/**
 * CategoryCard Component
 * Displays a category card with neo-brutalism style
 * Schema: title, icon_name (แปลงเป็น emoji และ color)
 */
export const CategoryCard = ({ category, onClick }) => {
  const emoji = getEmojiFromIcon(category.icon_name);
  const color = getColorFromIcon(category.icon_name);

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative cursor-pointer
        ${color}
        border-4 border-black
        shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
        hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]
        transition-all duration-200
        p-6 rounded-lg
      `}
    >
      <div className="text-6xl mb-4 text-center">{emoji}</div>
      <h3 className="text-2xl font-bold text-white text-center mb-2">
        {category.title}
      </h3>
      <p className="text-white/90 text-center text-sm">
        {category.description}
      </p>
    </motion.div>
  );
};
