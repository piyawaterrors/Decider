import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { donationService } from "../services/donationService";

/**
 * DonationModal Component
 * Redesigned for Automated Verification and Dynamic QR via Edge Function
 */
export const DonationModal = ({
  onClose,
  onDonated,
  settings = {},
  showToast,
}) => {
  const [amount, setAmount] = useState(settings.min_donation_amount || 20);
  const [qrUrl, setQrUrl] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (settings.promptpay_id) {
      const cleanId = settings.promptpay_id.replace(/-/g, "");
      setQrUrl(`https://promptpay2.me/${cleanId}/${amount}.png`);
    }
  }, [amount, settings.promptpay_id]);

  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsVerifying(true);
    try {
      // 1. Verify Slip with Supabase Edge Function
      // (This handles: Slip2Go check, Receiver check, Amount check, and DB logging)
      const result = await donationService.verifySlip(file);

      if (!result.isValid) {
        showToast("สลิปอะไรเนี่ย? ไปสแกนมาใหม่ไป๊! 🙄", "error");
        return;
      }

      // 2. Success! Unlock Premium (Backend already handled DB insert)
      // Clear localStorage persistence for lock
      localStorage.setItem("decider_click_count", "0");
      localStorage.setItem("decider_is_locked", "false");

      showToast(
        "ขอบคุณที่สนับสนุน! ปลดล็อกฟีเจอร์ Premium ให้แล้วครับ 🎉✨",
        "success"
      );
      if (onDonated) onDonated();
      onClose();
    } catch (err) {
      // Use the custom roast messages from the Edge Function if available
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
        className="relative bg-[#0a0a15] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.9)] rounded-[3rem] p-8 sm:p-10 max-w-[400px] w-full overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 bg-[#CCFF00]/10 rounded-full blur-[70px] pointer-events-none"></div>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300 z-10 border border-white/5"
        >
          <span>✕</span>
        </button>

        <div className="text-center mb-8 relative">
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <span className="text-4xl">☕</span>
          </div>
          <h2 className="text-2xl font-medium mb-1 text-white tracking-tight">
            ปลดล็อกฟีเจอร์ Premium
          </h2>
          <p className="text-white/40 text-sm">
            {settings.donation_message ||
              "สนับสนุนแอดมินเพื่อการใช้งานที่ไม่สะดุด"}
          </p>
        </div>

        {/* Amount Selection */}
        <div className="mb-8">
          <label className="block text-white/30 text-[10px] font-medium uppercase tracking-[0.2em] mb-3 ml-1">
            กรุณาระบุจำนวนเงิน
          </label>
          <div className="flex items-center gap-3">
            {[
              settings.min_donation_amount || 20,
              (settings.min_donation_amount || 20) * 2.5,
              (settings.min_donation_amount || 20) * 5,
            ].map((val) => {
              const roundedVal = Math.round(val);
              return (
                <button
                  key={roundedVal}
                  onClick={() => setAmount(roundedVal)}
                  className={`flex-1 py-3 rounded-2xl font-medium transition-all ${
                    amount === roundedVal
                      ? "bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/20"
                      : "bg-white/5 text-white/40 hover:bg-white/10"
                  }`}
                >
                  {roundedVal}.-
                </button>
              );
            })}
            <div className="flex-[1.5] relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-[#CCFF00] outline-none text-center font-medium"
                placeholder="ระบุเอง"
              />
            </div>
          </div>
        </div>

        {/* QR Code and Upload Section */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 text-center group">
            <div className="bg-white rounded-[2rem] p-5 inline-block mb-4 shadow-2xl relative">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="PromptPay QR"
                  className="w-[180px] h-[180px] object-contain"
                />
              ) : (
                <div className="w-[180px] h-[180px] flex items-center justify-center text-black/20 font-medium">
                  No ID
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 text-[#CCFF00] text-xs font-medium uppercase tracking-widest opacity-60">
              <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-pulse"></span>
              PromptPay QR
            </div>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isVerifying && fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-[2.5rem] p-8 text-center transition-all cursor-pointer
              ${
                dragActive
                  ? "border-[#CCFF00] bg-[#CCFF00]/5"
                  : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"
              }
              ${isVerifying ? "opacity-50 pointer-events-none cursor-wait" : ""}
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
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="w-10 h-10 border-4 border-[#CCFF00]/20 border-t-[#CCFF00] rounded-full animate-spin"></div>
                <p className="text-[#CCFF00] font-medium text-sm animate-pulse">
                  กำลังตรวจสอบสลิป...
                </p>
              </div>
            ) : (
              <>
                <div className="text-3xl mb-3 opacity-30">📤</div>
                <p className="text-white font-medium text-sm mb-1">
                  อัปโหลดสลิปเพื่อยืนยัน
                </p>
                <p className="text-white/20 text-[10px] uppercase tracking-widest">
                  Click or Drag & Drop
                </p>
              </>
            )}
          </div>
        </div>

        <p className="text-center mt-8 text-white/10 text-[9px] font-medium uppercase tracking-[0.3em]">
          Powered by Slip2Go Secure Verification
        </p>
      </motion.div>
    </div>
  );
};
