import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CategoryCard } from "../components/CategoryCard";
import { DecisionResult } from "../components/DecisionResult";
import { DonationModal } from "../components/DonationModal";
import { useCategories, useSettings } from "../hooks/useSupabaseData";
import { useDecision } from "../hooks/useDecision";
import { useAuth } from "../hooks/useAuth";
import { dbService } from "../services/dbService";
import { getEmojiFromIcon, getColorFromIcon } from "../data/categories";

/**
 * HomePage Component
 * Main page for category selection and decision making
 * Uses ONLY Supabase data (no fallback)
 */
export const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { data: categories, loading, error } = useCategories();
  const { data: allSettings } = useSettings();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [decisionsLoading, setDecisionsLoading] = useState(false);
  const [decisionsError, setDecisionsError] = useState(null);
  const [showDonationModal, setShowDonationModal] = useState(false);

  // Determine if donation is enabled from settings
  const donationEnabledSetting = allSettings?.find(
    (s) => s.key === "donation_enabled"
  );
  const isDonationEnabled = donationEnabledSetting
    ? donationEnabledSetting.value === true ||
      donationEnabledSetting.value === "true"
    : true; // Default to true if not found

  const {
    clickCount,
    isLocked,
    currentDecision,
    contextMessage,
    makeDecision,
    reset,
    unlock,
  } = useDecision({ isDonationEnabled });

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
          className="text-center mb-12 relative"
        >
          {/* Admin Button - Fixed at top-right for best accessibility and ensured to stay in front */}
          {user && isAdmin && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/admin")}
              className="
                fixed top-4 right-4 md:top-8 md:right-8 z-50
                bg-purple-600 text-white font-bold py-2 px-4 md:py-3 md:px-6 rounded-lg
                border-4 border-black
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                transition-all duration-200
                flex items-center gap-2
              "
            >
              <span className="text-xl">⚙️</span>
              <span className="hidden sm:inline">จัดการระบบ</span>
              <span className="sm:hidden text-xs">Admin</span>
            </motion.button>
          )}

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
              <div className="text-center text-white text-xl font-bold flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
                <p>⏳ กำลังโหลดข้อมูล...</p>
                {!import.meta.env.VITE_SUPABASE_URL && (
                  <div className="mt-8 bg-black/80 p-6 rounded-lg border-4 border-red-500 max-w-lg text-left">
                    <p className="text-red-400 font-bold text-xl mb-4">
                      🚨 ตรวจพบการตั้งค่าไม่สมบูรณ์
                    </p>
                    <p className="text-white mb-2">
                      คุณกำลัง Deploy บน Vercel ใช่ไหม? กรุณา:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                      <li>ไปที่ Vercel Dashboard &gt; Settings</li>
                      <li>
                        เพิ่ม{" "}
                        <code className="text-yellow-400">
                          VITE_SUPABASE_URL
                        </code>
                      </li>
                      <li>
                        เพิ่ม{" "}
                        <code className="text-yellow-400">
                          VITE_SUPABASE_ANON_KEY
                        </code>
                      </li>
                      <li>
                        จากนั้นกด <b>Redeploy</b> อีกครั้ง
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-500 border-4 border-black rounded-lg p-6 mb-6 text-white text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-2xl font-black mb-2">⚠️ เกิดข้อผิดพลาด</p>
                <p className="font-bold mb-4">
                  {error.message || "ไม่สามารถเชื่อมต่อ Supabase ได้"}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-white text-black font-bold py-2 px-6 rounded-lg border-2 border-black hover:bg-gray-100 transition-colors"
                >
                  🔄 ลองใหม่อีกครั้ง
                </button>
              </div>
            )}

            {!loading && !error && (!categories || categories.length === 0) && (
              <div className="bg-yellow-200 border-4 border-black rounded-lg p-6 text-center">
                <p className="text-2xl font-black mb-2">📭 ไม่มีข้อมูล</p>
                <p className="font-bold">ยังไม่มีหมวดหมู่ในระบบ</p>
                <p className="text-sm mt-2">กรุณา Insert ข้อมูล</p>
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
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6 mb-8 text-center relative overflow-hidden">
              {/* Spin Counter Tag */}
              <div className="absolute top-4 right-4 bg-yellow-400 border-2 border-black font-black py-1 px-3 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm">
                ครั้งที่ {clickCount}
              </div>

              <div className="text-6xl mb-2">
                {getEmojiFromIcon(selectedCategory.icon_name)}
              </div>
              <h2 className="text-3xl font-black">{selectedCategory.title}</h2>
              <p className="text-gray-600 font-semibold mb-2">
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
                </div>
              )}

            {/* Decision Result */}
            {currentDecision && (
              <DecisionResult
                decision={currentDecision}
                contextMessage={contextMessage}
                onReroll={handleMakeDecision}
                isLocked={isLocked}
                onDonate={isDonationEnabled ? handleDonateClick : null}
              />
            )}
          </motion.div>
        )}

        {/* Donation Button (Floating) */}
        {isDonationEnabled && (
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
        )}

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
