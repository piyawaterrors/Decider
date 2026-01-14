import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoadingView } from "./LoadingView";
import { motion } from "framer-motion";

/**
 * AdminRoute Component
 * Reliable version for protecting admin routes with proper F5 handling
 */
export const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  // 1. ถ้ากำลังโหลดข้อมูล (Refresh ใหม่ๆ) - รอให้โหลดเสร็จก่อน
  if (loading) {
    return <LoadingView message="กำลังตรวจสอบสิทธิ์..." fullScreen />;
  }

  // 2. ถ้าโหลดเสร็จแล้วแต่ไม่มี User
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. ถ้ามี User แต่ไม่ใช่ Admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050510] text-white p-4">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg aspect-square bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] max-w-md text-center shadow-2xl relative z-10"
        >
          <div className="text-6xl mb-6">🚫</div>
          <h2 className="text-2xl font-medium mb-3 tracking-tight">
            ไม่มีสิทธิ์เข้าถึง
          </h2>
          <p className="text-white/40 mb-8 leading-relaxed">
            บัญชีของคุณไม่มีสิทธิ์ระดับ Admin <br />
            เฉพาะ "สมองตัวจริง" เท่านั้นที่เข้าได้
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full bg-[#CCFF00] text-black py-4 rounded-2xl font-medium hover:scale-105 transition-all shadow-lg"
          >
            กลับหน้าหลัก
          </button>
        </motion.div>
      </div>
    );
  }

  // 4. ผ่านฉลุย - เป็น Admin
  return children;
};

// ProtectedRoute สำหรับ User ทั่วไป (ถ้ามี)
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// PublicRoute สำหรับหน้า Login
export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};
