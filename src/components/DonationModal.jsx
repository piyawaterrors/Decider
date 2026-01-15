import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { donationService } from "../services/donationService";

/**
 * DonationModal Component
 * Redesigned for Automated Verification and Dynamic QR via Edge Function
 * Now with a two-column desktop layout for better aesthetics.
 */
export const DonationModal = ({
  onClose,
  onDonated,
  settings = {},
  showToast,
}) => {
  const [amount, setAmount] = useState(settings.min_donation || 20);
  const [displayName, setDisplayName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [message, setMessage] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (settings.promtpay) {
      const cleanId = settings.promtpay.replace(/-/g, "");
      setQrUrl(`https://promptpay.io/${cleanId}/${amount}.png`);
    }
  }, [amount, settings.promtpay]);

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validation: If not anonymous, must have a name
    if (!isAnonymous && !displayName.trim()) {
      showToast("เขียนชื่อด้วยนะจ๊ะ ฃ", "error");
      return;
    }

    setIsVerifying(true);
    try {
      // 1. Verify Slip with Supabase Edge Function
      const result = await donationService.verifySlip(file, amount, {
        display_name: isAnonymous ? "ผู้สนับสนุนนิรนาม" : displayName,
        message: message,
      });

      if (!result.isValid) {
        showToast("สลิปอะไรเนี่ย? ไปสแกนมาใหม่ไป๊! 🙄", "error");
        return;
      }

      // 2. Success! Unlock Premium (Backend already handled DB insert)
      localStorage.setItem("decider_click_count", "0");
      localStorage.setItem("decider_is_locked", "false");

      showToast(
        "ขอบคุณที่สนับสนุน! ปลดล็อกฟีเจอร์ Premium ให้แล้วครับ 🎉✨",
        "success"
      );
      if (onDonated) onDonated();
      onClose();
    } catch (err) {
      showToast(err.message || "เกิดข้อผิดพลาดในการตรวจสอบสลิป", "error");
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative bg-[#0a0a15] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.9)] rounded-[3rem] p-6 sm:p-10 max-w-[400px] sm:max-w-[720px] w-full overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#CCFF00]/5 rounded-full blur-[90px] pointer-events-none"></div>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300 z-10 border border-white/5"
        >
          <span>✕</span>
        </button>

        <div className="text-center sm:text-left mb-8 relative">
          <div className="inline-flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-2xl">☕</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white tracking-tight">
                ปลดล็อกฟีเจอร์ Premium
              </h2>
              <p className="text-white/40 text-sm">
                ขอบคุณที่สนับสนุนแอดมินนะครับ 🙏
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Settings & Info */}
          <div className="space-y-6">
            {/* Amount Selection */}
            <div>
              <label className="block text-white/30 text-[10px] font-medium uppercase tracking-[0.2em] mb-3 ml-1">
                ระบุจำนวนเงินสนับสนุน
              </label>
              <div className="flex items-center gap-2 mb-3">
                {[
                  settings.min_donation || 20,
                  (settings.min_donation || 20) * 2.5,
                  (settings.min_donation || 20) * 5,
                ].map((val) => {
                  const roundedVal = Math.round(val);
                  return (
                    <button
                      key={roundedVal}
                      onClick={() => setAmount(roundedVal)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        amount === roundedVal
                          ? "bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/20"
                          : "bg-white/5 text-white/40 hover:bg-white/10"
                      }`}
                    >
                      {roundedVal}
                    </button>
                  );
                })}
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={settings.min_donation || 20}
                  value={amount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    const min = settings.min_donation || 1;
                    setAmount(value < min ? min : value);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-[#CCFF00] outline-none text-center font-semibold text-[#CCFF00]"
                  placeholder={`ระบุจำนวนเงิน...`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-xs">
                  THB
                </span>
              </div>
              <p className="text-white/20 text-[9px] text-center mt-2">
                ยอดขั้นต่ำ {settings.min_donation || 1} บาท
              </p>
            </div>

            {/* User Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-white/30 text-[10px] font-medium uppercase tracking-[0.2em] mb-3 ml-1">
                  การแสดงชื่อผู้สนับสนุน
                </label>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 mb-3">
                  <button
                    onClick={() => setIsAnonymous(true)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      isAnonymous
                        ? "bg-white/10 text-white shadow-xl"
                        : "text-white/30 hover:text-white/50"
                    }`}
                  >
                    ไม่บอกชื่อ
                  </button>
                  <button
                    onClick={() => setIsAnonymous(false)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      !isAnonymous
                        ? "bg-white/10 text-white shadow-xl"
                        : "text-white/30 hover:text-white/50"
                    }`}
                  >
                    ระบุชื่อ
                  </button>
                </div>

                <div
                  className={`transition-all duration-300 ${
                    isAnonymous
                      ? "opacity-30 pointer-events-none"
                      : "opacity-100"
                  }`}
                >
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-[#CCFF00] outline-none text-sm font-medium"
                    placeholder={
                      isAnonymous
                        ? "ผู้สนับสนุนนิรนาม"
                        : "กรุณาระบุชื่อของคุณ..."
                    }
                    disabled={isAnonymous}
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/30 text-[10px] font-medium uppercase tracking-[0.2em] mb-2 ml-1">
                  ข้อความฝากถึงแอดมิน (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-[#CCFF00] outline-none text-sm font-medium resize-none h-24"
                  placeholder="ฝากกำลังใจ..."
                />
              </div>
            </div>
          </div>

          {/* Right Column: QR & Upload */}
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 text-center">
              <div className="bg-white rounded-2xl p-4 inline-block mb-3 shadow-2xl relative">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt="PromptPay QR"
                    className="w-[160px] h-[160px] object-contain"
                  />
                ) : (
                  <div className="w-[160px] h-[160px] flex items-center justify-center text-black/20 font-medium">
                    No QR
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center gap-2 text-[#CCFF00] text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">
                <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-pulse"></span>
                Promptpay QR
              </div>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !isVerifying && fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-[2.5rem] p-8 text-center transition-all cursor-pointer h-[160px] flex flex-col items-center justify-center
                ${
                  dragActive
                    ? "border-[#CCFF00] bg-[#CCFF00]/5"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"
                }
                ${
                  isVerifying
                    ? "opacity-50 pointer-events-none cursor-wait"
                    : ""
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
              />
              {isVerifying ? (
                <>
                  <div className="w-8 h-8 border-3 border-[#CCFF00]/20 border-t-[#CCFF00] rounded-full animate-spin mb-3"></div>
                  <p className="text-[#CCFF00] font-medium text-xs animate-pulse">
                    กำลังตรวจสอบสลิป...
                  </p>
                </>
              ) : (
                <>
                  <div className="text-3xl mb-2 opacity-30">📤</div>
                  <p className="text-white font-medium text-sm mb-1">
                    อัปโหลดสลิปยืนยัน
                  </p>
                  <p className="text-white/20 text-[9px] uppercase tracking-widest">
                    Place receipt here
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-white/10 text-[9px] font-medium uppercase tracking-[0.4em]">
            Verified by Slip2Go Secure Node
          </p>
        </div>
      </motion.div>
    </div>
  );
};
