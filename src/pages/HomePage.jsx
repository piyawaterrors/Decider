import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryCard } from "../components/CategoryCard";
import { DecisionResult } from "../components/DecisionResult";
import { DonationModal } from "../components/DonationModal";
import { FloatingDonationButton } from "../components/FloatingDonationButton";
import { LoadingView } from "../components/LoadingView";
import {
  useCategories,
  useSettings,
  useAllDecisions,
} from "../hooks/useSupabaseData";
import { useDecision } from "../hooks/useDecision";
import { useAuth } from "../hooks/useAuth";
import { dbService } from "../services/dbService";
import { getEmojiFromIcon, getColorFromIcon } from "../data/categories";
import { Notification } from "../components/Notification";

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
  const { data: allDecisions, loading: decisionsLoading } = useAllDecisions();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [decisionsError, setDecisionsError] = useState(null);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "warning",
  });

  // Donation settings
  const donationEnabledSetting = allSettings?.find(
    (s) => s.key === "donation_enabled"
  );
  const qrCodeSetting = allSettings?.find((s) => s.key === "donation_qr_code");
  const coffeeUrlSetting = allSettings?.find(
    (s) => s.key === "buy_me_coffee_url"
  );
  const donationMsgSetting = allSettings?.find(
    (s) => s.key === "donation_message"
  );
  const promptPaySetting = allSettings?.find((s) => s.key === "promptpay_id");
  const slip2goSetting = allSettings?.find((s) => s.key === "slip2go_api_key");
  const minAmountSetting = allSettings?.find(
    (s) => s.key === "min_donation_amount"
  );
  const randomLimitSetting = allSettings?.find((s) => s.key === "random_limit");

  const isDonationEnabled = donationEnabledSetting
    ? donationEnabledSetting.value === true ||
      donationEnabledSetting.value === "true" ||
      donationEnabledSetting.value === 1
    : false; // Default to false if not found

  const randomLimit = randomLimitSetting?.value || 10;

  const donationSettings = {
    isDonationEnabled,
    randomLimit,
    promptpay_id: promptPaySetting?.value,
    slip2go_api_key: slip2goSetting?.value,
    min_donation_amount: minAmountSetting?.value,
    donation_message: donationMsgSetting?.value,
  };

  const showToast = (message, type = "warning") => {
    setToast({ isVisible: true, message, type });
  };

  const donationData = {
    qrCode: qrCodeSetting?.value,
    coffeeUrl: coffeeUrlSetting?.value,
    message: donationMsgSetting?.value,
  };

  const {
    clickCount,
    isLocked,
    currentDecision,
    contextMessage,
    makeDecision,
    reset,
    unlock,
  } = useDecision({ isDonationEnabled, randomLimit });

  // Filter decisions by selected category
  const decisions = useMemo(() => {
    if (!selectedCategory || !allDecisions) return [];
    return allDecisions.filter((d) => d.category_id === selectedCategory.id);
  }, [selectedCategory, allDecisions]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setDecisionsError(null);
    reset();

    // Check if there are decisions for this category
    const categoryDecisions =
      allDecisions?.filter((d) => d.category_id === category.id) || [];

    if (categoryDecisions.length === 0) {
      setDecisionsError("ยังไม่มีตัวเลือกในหมวดหมู่นี้");
    }
  };

  const handleMakeDecision = async () => {
    if (decisions.length === 0) {
      return;
    }

    const result = await makeDecision(decisions, selectedCategory);

    if (result?.error === "too_fast") {
      setToast({ isVisible: true, message: result.message, type: "warning" });
      return;
    }

    if (result && !result.error) {
      // Log usage to database for analytics
      dbService.logUsage(selectedCategory.id, result.decision.content, {
        time: new Date().toLocaleTimeString(),
        clickCount: result.context.clickCount,
      });
    }
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setDecisionsError(null);
    reset();
  };

  return (
    <div className="min-h-screen bg-[#050510] relative overflow-hidden font-sans">
      <Notification
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
      {/* High-Contrast Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-indigo-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="relative z-10 min-h-screen p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header - Hidden when category is selected to save space */}
          <AnimatePresence>
            {!selectedCategory && (
              <motion.header
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0, height: 0, marginBottom: 0 }}
                className="text-center mb-8 sm:mb-12 md:mb-16 overflow-hidden"
              >
                {/* Admin Button */}
                {user && isAdmin && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/admin")}
                    className="
                      fixed top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 z-50
                      bg-white/10 backdrop-blur-md
                      text-white font-normal 
                      py-2 px-4 sm:py-3 sm:px-5 md:py-3 md:px-6
                      rounded-2xl
                      border-2 border-white/30
                      shadow-lg hover:shadow-2xl hover:bg-white/20
                      transition-all duration-300
                      flex items-center gap-2
                    "
                  >
                    <span className="text-lg sm:text-xl">⚙️</span>
                    <span className="hidden sm:inline text-sm md:text-base">
                      จัดการระบบ
                    </span>
                  </motion.button>
                )}

                {/* Logo & Title */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <div className="text-6xl sm:text-7xl md:text-8xl mb-4">
                    🧠
                  </div>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white mb-3 sm:mb-4 drop-shadow-2xl leading-tight px-4">
                    สมองสำรอง
                  </h1>
                  <p className="text-2xl sm:text-3xl md:text-4xl text-[#CCFF00] font-medium drop-shadow-[0_0_15px_rgba(204,255,0,0.5)] px-4 mb-2 tracking-tighter">
                    Spare Brain
                  </p>
                  <p className="text-lg sm:text-xl md:text-2xl text-white font-normal drop-shadow-lg px-4 opacity-80">
                    สำหรับคนที่ไม่ยอมใช้สมองตัวเองคิด 😏
                  </p>
                </motion.div>
              </motion.header>
            )}
          </AnimatePresence>

          {/* Category Selection */}
          {!selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              {/* Loading State */}
              {loading && <LoadingView message="กำลังโหลดหมวดหมู่..." />}

              {/* Error State */}
              {error && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-3xl p-6 sm:p-10 text-center shadow-2xl max-w-2xl mx-auto"
                >
                  <div className="text-6xl mb-6">⚠️</div>
                  <p className="text-2xl sm:text-3xl font-medium mb-3 text-white">
                    เกิดข้อผิดพลาด
                  </p>
                  <p className="font-normal mb-8 text-white/70 text-sm sm:text-base">
                    {error.message || "ไม่สามารถเชื่อมต่อ Supabase ได้"}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="
                      bg-white text-indigo-600 font-medium 
                      py-4 px-10 rounded-2xl
                      shadow-lg hover:shadow-xl
                      transition-all duration-300
                      hover:scale-105 active:scale-95
                    "
                  >
                    🔄 ลองใหม่อีกครั้ง
                  </button>
                </motion.div>
              )}

              {/* Empty State */}
              {!loading &&
                !error &&
                (!categories || categories.length === 0) && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-3xl p-8 sm:p-12 text-center shadow-2xl max-w-2xl mx-auto"
                  >
                    <div className="text-6xl mb-6 filter drop-shadow-2xl">
                      📭
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-medium mb-2 text-white tracking-tight">
                      ไม่มีข้อมูล
                    </h3>
                    <p className="text-white/60 font-normal">
                      ยังไม่มีหมวดหมู่ในระบบ กรุณาเพิ่มข้อมูลในหน้า Admin
                    </p>
                  </motion.div>
                )}

              {/* Categories Grid */}
              {!loading && !error && categories && categories.length > 0 && (
                <div>
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl sm:text-3xl font-medium text-white text-center mb-6 sm:mb-8 drop-shadow-lg"
                  >
                    เลือกหมวดหมู่ที่ต้องการ
                  </motion.h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {categories.map((category, index) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <CategoryCard
                          category={category}
                          onClick={() => handleCategorySelect(category)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Decision Making View */}
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto"
            >
              {/* Sleek Top Bar */}
              <div className="flex items-center justify-between mb-8 sm:mb-10">
                <motion.button
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBack}
                  className="
                    bg-white/5 backdrop-blur-md
                    text-white/60 hover:text-white
                    py-2 px-4
                    rounded-2xl
                    border border-white/10
                    hover:border-white/30
                    transition-all duration-300
                    flex items-center gap-2
                  "
                >
                  <span className="text-lg">←</span>
                  <span className="text-xs tracking-widest uppercase">
                    ย้อนกลับ
                  </span>
                </motion.button>
              </div>

              {/* Minimal Category Info */}
              <div className="text-center mb-8 sm:mb-10 relative">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mb-2 inline-block"
                >
                  <div className="text-5xl sm:text-6xl mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    {getEmojiFromIcon(selectedCategory.icon_name)}
                  </div>
                </motion.div>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl sm:text-4xl font-medium text-white mb-2 tracking-tight"
                >
                  {selectedCategory.title}
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-base text-white/40 max-w-xl mx-auto leading-relaxed"
                >
                  {selectedCategory.description}
                </motion.p>
              </div>

              {/* Interactive Area */}
              <div className="relative">
                {decisionsLoading ? (
                  <LoadingView message="สุ่มตัวเลือก..." />
                ) : decisionsError ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 text-center"
                  >
                    <p className="text-red-400 font-medium">{decisionsError}</p>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="wait">
                    {currentDecision ? (
                      <DecisionResult
                        key="result"
                        decision={currentDecision}
                        contextMessage={contextMessage}
                        onReroll={handleMakeDecision}
                        onDonate={() => setShowDonationModal(true)}
                        isLocked={isLocked}
                        isDonationEnabled={isDonationEnabled}
                      />
                    ) : (
                      <motion.div
                        key="cta"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex flex-col items-center"
                      >
                        {!isLocked ? (
                          <div className="group relative">
                            {/* Animated Background Rings */}
                            <div className="absolute inset-0 bg-[#CCFF00]/20 rounded-full blur-[40px] group-hover:bg-[#CCFF00]/40 transition-all duration-500 animate-pulse"></div>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleMakeDecision}
                              className="
                                relative z-10
                                w-40 h-40 sm:w-48 sm:h-48
                                rounded-full
                                bg-[#CCFF00] text-black
                                border-4 border-white/20
                                shadow-[0_0_50px_rgba(204,255,0,0.4)]
                                flex flex-col items-center justify-center
                                transition-all duration-500
                              "
                            >
                              <span className="text-4xl sm:text-5xl mb-2">
                                🎲
                              </span>
                              <span className="text-lg font-medium tracking-tight">
                                สุ่มเลย!
                              </span>
                            </motion.button>
                          </div>
                        ) : (
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-10 sm:p-14 text-center shadow-2xl relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-red-500/10 rounded-full blur-[80px]"></div>

                            <div className="text-7xl mb-6 relative z-10">
                              🔒
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-medium mb-4 text-white relative z-10">
                              ล็อกแล้ว!
                            </h3>
                            <p className="text-lg text-white/50 mb-10 max-w-md mx-auto relative z-10 leading-relaxed">
                              {contextMessage}
                            </p>

                            {isDonationEnabled && (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowDonationModal(true)}
                                className="
                                  relative z-10
                                  bg-gradient-to-r from-yellow-400 to-orange-500
                                  text-black font-medium 
                                  py-5 px-10 rounded-2xl
                                  shadow-[0_15px_30px_rgba(234,179,8,0.3)]
                                  transition-all duration-300
                                  text-xl
                                "
                              >
                                ☕ เลี้ยงกาแฟเพื่อปลดล็อก
                              </motion.button>
                            )}
                          </motion.div>
                        )}

                        {!isLocked && contextMessage && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-10 text-white/40 text-center italic"
                          >
                            {contextMessage}
                          </motion.p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating Donation Button */}
      <FloatingDonationButton
        onClick={() => setShowDonationModal(true)}
        isDonationEnabled={isDonationEnabled}
      />

      <AnimatePresence>
        {showDonationModal && (
          <DonationModal
            onClose={() => setShowDonationModal(false)}
            onDonated={unlock}
            settings={donationSettings}
            showToast={showToast}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
