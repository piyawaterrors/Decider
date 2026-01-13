import { useState } from "react";
import { motion } from "framer-motion";
import { CategoryCard } from "../components/CategoryCard";
import { DecisionResult } from "../components/DecisionResult";
import { DonationModal } from "../components/DonationModal";
import { useCategories } from "../hooks/useSupabaseData";
import { useDecision } from "../hooks/useDecision";
import { dbService } from "../services/dbService";
import { getEmojiFromIcon, getColorFromIcon } from "../data/categories";

/**
 * HomePage Component
 * Main page for category selection and decision making
 * Uses ONLY Supabase data (no fallback)
 */
export const HomePage = () => {
  const { data: categories, loading, error } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [decisionsLoading, setDecisionsLoading] = useState(false);
  const [decisionsError, setDecisionsError] = useState(null);
  const [showDonationModal, setShowDonationModal] = useState(false);

  const {
    clickCount,
    isLocked,
    currentDecision,
    contextMessage,
    makeDecision,
    reset,
    unlock,
  } = useDecision();

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setDecisionsLoading(true);
    setDecisionsError(null);
    reset();

    // Fetch decisions from database
    const { data, error } = await dbService.getDecisionsByCategory(category.id);

    setDecisionsLoading(false);

    if (error) {
      console.error("Failed to load decisions:", error);
      setDecisionsError("ไม่สามารถโหลดตัวเลือกได้ กรุณาลองใหม่อีกครั้ง");
      setDecisions([]);
    } else if (!data || data.length === 0) {
      setDecisionsError("ยังไม่มีตัวเลือกในหมวดหมู่นี้");
      setDecisions([]);
    } else {
      setDecisions(data);
    }
  };

  const handleMakeDecision = async () => {
    if (decisions.length === 0) return;

    const result = await makeDecision(decisions, selectedCategory);

    if (result) {
      // Log usage to database (optional)
      await dbService.logUsage(
        selectedCategory.id,
        result.decision.content,
        result.context
      );
    }
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setDecisions([]);
    reset();
  };

  const handleDonateClick = () => {
    setShowDonationModal(true);
  };

  const handleDonated = () => {
    unlock();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-lg">
            🎲 The Divine Decider
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-bold">
            ระบบตัดสินใจแทนฉันที (ฉบับกวนประสาท)
          </p>
        </motion.header>

        {/* Category Selection */}
        {!selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {loading && (
              <div className="text-center text-white text-xl font-bold">
                ⏳ กำลังโหลดข้อมูลจาก Supabase...
              </div>
            )}

            {error && (
              <div className="bg-red-500 border-4 border-black rounded-lg p-6 mb-6 text-white text-center">
                <p className="text-2xl font-black mb-2">⚠️ เกิดข้อผิดพลาด</p>
                <p className="font-bold mb-4">
                  ไม่สามารถเชื่อมต่อ Supabase ได้
                </p>
                <p className="text-sm">กรุณาตรวจสอบ:</p>
                <ul className="text-sm text-left mt-2 space-y-1">
                  <li>
                    • ไฟล์ .env มี VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY
                  </li>
                  <li>• Restart dev server หลังแก้ .env</li>
                  <li>• RLS Policies อนุญาตให้อ่านข้อมูล</li>
                </ul>
              </div>
            )}

            {!loading && !error && (!categories || categories.length === 0) && (
              <div className="bg-yellow-200 border-4 border-black rounded-lg p-6 text-center">
                <p className="text-2xl font-black mb-2">📭 ไม่มีข้อมูล</p>
                <p className="font-bold">ยังไม่มีหมวดหมู่ในระบบ</p>
                <p className="text-sm mt-2">กรุณา Insert ข้อมูลใน Supabase</p>
              </div>
            )}

            {!loading && !error && categories && categories.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onClick={() => handleCategorySelect(category)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Decision Making */}
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="
                mb-6 bg-white text-black font-bold py-2 px-6 rounded-lg
                border-4 border-black
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                transition-all duration-200
              "
            >
              ← กลับ
            </button>

            {/* Category Header */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6 mb-8 text-center">
              <div className="text-6xl mb-2">
                {getEmojiFromIcon(selectedCategory.icon_name)}
              </div>
              <h2 className="text-3xl font-black">{selectedCategory.title}</h2>
              <p className="text-gray-600 font-semibold">
                {selectedCategory.description}
              </p>
            </div>

            {/* Loading State */}
            {decisionsLoading && (
              <div className="text-center">
                <div className="bg-white border-4 border-black rounded-lg p-8">
                  <p className="text-2xl font-bold">⏳ กำลังโหลดตัวเลือก...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {decisionsError && (
              <div className="text-center">
                <div className="bg-red-200 border-4 border-black rounded-lg p-8">
                  <p className="text-2xl font-bold mb-4">⚠️ {decisionsError}</p>
                  <button
                    onClick={() => handleCategorySelect(selectedCategory)}
                    className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg border-4 border-black"
                  >
                    🔄 ลองใหม่
                  </button>
                </div>
              </div>
            )}

            {/* Decision Button */}
            {!decisionsLoading &&
              !decisionsError &&
              !currentDecision &&
              decisions.length > 0 && (
                <div className="text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMakeDecision}
                    disabled={isLocked}
                    className={`
                    text-3xl font-black py-6 px-12 rounded-lg
                    border-4 border-black
                    shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                    hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]
                    transition-all duration-200
                    ${
                      isLocked
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-yellow-400 hover:bg-yellow-500"
                    }
                  `}
                  >
                    {isLocked ? "🔒 ล็อกแล้ว" : "🎲 สุ่มเลย!"}
                  </motion.button>
                  <p className="mt-4 text-white font-bold text-lg">
                    สุ่มไปแล้ว: {clickCount} ครั้ง
                  </p>
                </div>
              )}

            {/* Decision Result */}
            {currentDecision && (
              <DecisionResult
                decision={currentDecision}
                contextMessage={contextMessage}
                onReroll={handleMakeDecision}
                isLocked={isLocked}
                onDonate={handleDonateClick}
              />
            )}
          </motion.div>
        )}

        {/* Donation Button (Floating) */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleDonateClick}
          className="
            fixed bottom-8 right-8
            bg-yellow-400 text-black font-bold py-4 px-6 rounded-full
            border-4 border-black
            shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
            hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
            transition-all duration-200
            z-30
          "
        >
          ☕ เลี้ยงกาแฟ
        </motion.button>

        {/* Donation Modal */}
        <DonationModal
          isOpen={showDonationModal}
          onClose={() => setShowDonationModal(false)}
          onDonated={isLocked ? handleDonated : null}
        />
      </div>
    </div>
  );
};
