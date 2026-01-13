import { motion, AnimatePresence } from "framer-motion";

/**
 * DonationModal Component
 * Shows QR code for donations
 */
export const DonationModal = ({ isOpen, onClose, onDonated }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-lg p-8 max-w-md w-full">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-2xl font-bold hover:text-red-500 transition-colors"
              >
                ✕
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black mb-2">
                  ☕ เลี้ยงกาแฟแอดมิน
                </h2>
                <p className="text-gray-600 font-semibold">
                  ค่าที่ปรึกษาแพงนะ! เลี้ยงกาแฟหน่อย
                </p>
              </div>

              {/* QR Code Placeholder */}
              <div className="bg-gray-200 border-4 border-black rounded-lg p-8 mb-6">
                <div className="aspect-square bg-white border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-4xl mb-2">📱</p>
                    <p className="text-sm text-gray-500 font-semibold">
                      QR Code PromptPay
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      (ใส่ QR Code ของคุณที่นี่)
                    </p>
                  </div>
                </div>
              </div>

              {/* Donation Options */}
              <div className="space-y-3 mb-6">
                <a
                  href="https://www.buymeacoffee.com/yourusername"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    block w-full bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg
                    border-4 border-black
                    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                    hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                    transition-all duration-200
                    text-center
                  "
                >
                  ☕ Buy Me a Coffee
                </a>
              </div>

              {/* Thank You Message */}
              <div className="bg-pink-200 border-4 border-black rounded-lg p-4">
                <p className="text-sm font-bold text-center">
                  🙏 ขอบคุณที่ใช้บริการ! <br />
                  ถ้าชอบก็อย่าลืมบอกต่อเพื่อนด้วยนะ
                </p>
              </div>

              {/* Unlock Button (if locked) */}
              {onDonated && (
                <button
                  onClick={() => {
                    onDonated();
                    onClose();
                  }}
                  className="
                    w-full mt-4 bg-green-500 text-white font-bold py-3 px-6 rounded-lg
                    border-4 border-black
                    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                    hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                    transition-all duration-200
                  "
                >
                  ✅ โอนแล้ว ปลดล็อก!
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
