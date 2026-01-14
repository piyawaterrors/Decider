import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "../services/authService";
import { LoadingView } from "../components/LoadingView";
import { Notification } from "../components/Notification";

/**
 * LoginPage Component
 * Redesigned for High-Contrast Dark Mode Glassmorphism
 */
export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "error",
  });
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  const showToast = (message, type = "error") => {
    setToast({ isVisible: true, message, type });
  };

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { session } = await authService.getSession();
        if (session?.user) {
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await authService.signIn(email, password);

      if (error) {
        showToast(error.message || "เข้าสู่ระบบไม่สำเร็จ");
      } else {
        // Check if user is admin
        const isAdmin = await authService.isAdmin();

        if (isAdmin) {
          navigate(from, { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    } catch (err) {
      showToast("เกิดข้อผิดพลาด กรุณาลองใหมีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return <LoadingView message="กำลังตรวจสอบสิทธิ์..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-[#050510] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <Notification
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] bg-[#CCFF00]/5 rounded-full blur-[120px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl overflow-hidden relative">
          {/* Accent Glow Inside */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#CCFF00]/5 rounded-full blur-[50px]"></div>

          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl mb-4"
            >
              🔐
            </motion.div>
            <h1 className="text-3xl font-medium mb-2 tracking-tight">
              Admin Portal
            </h1>
            <p className="text-white/40 text-sm font-medium">
              กรุณาเข้าสู่ระบบเพื่อจัดการระบบ
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/40 text-[10px] font-medium uppercase tracking-[0.2em] mb-2 ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="
                  w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6
                  focus:border-[#CCFF00] focus:bg-white/[0.08] outline-none
                  transition-all duration-300 font-normal placeholder:text-white/10
                "
                placeholder="admin@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-white/40 text-[10px] font-medium uppercase tracking-[0.2em] mb-2 ml-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="
                  w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6
                  focus:border-[#CCFF00] focus:bg-white/[0.08] outline-none
                  transition-all duration-300 font-normal placeholder:text-white/10
                "
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading}
              className={`
                w-full py-4 px-6 rounded-2xl font-medium text-black
                transition-all duration-300 shadow-xl
                ${
                  loading
                    ? "bg-white/10 cursor-not-allowed text-white/20"
                    : "bg-[#CCFF00] hover:bg-[#d9ff33] shadow-[#CCFF00]/10"
                }
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </motion.button>
          </form>

          {/* Back to Home */}
          <div className="mt-10 text-center border-t border-white/5 pt-6">
            <button
              onClick={() => navigate("/")}
              className="text-white/40 hover:text-[#CCFF00] font-medium text-sm transition-colors duration-300 flex items-center justify-center gap-2 mx-auto"
              disabled={loading}
            >
              <span>←</span> กลับหน้าหลัก
            </button>
          </div>
        </div>

        {/* Footer Credit */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-white/10 text-[10px] font-medium uppercase tracking-[0.3em]"
        >
          Protected by Decider Decryptor v2.0
        </motion.p>
      </motion.div>
    </div>
  );
};
