import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * AdminRoute Component
 * Reliable version for protecting admin routes
 */
export const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  console.log("🛠️ AdminRoute State:", { loading, user: !!user, isAdmin });

  // 1. ถ้ากำลังโหลดข้อมูล (Refresh ใหม่ๆ)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 to-pink-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white font-bold text-xl">
            กำลังตรวจสอบสิทธิ์ Admin...
          </p>
        </div>
      </div>
    );
  }

  // 2. ถ้าโหลดเสร็จแล้วแต่ไม่มี User
  if (!user) {
    console.warn("🚫 No user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. ถ้ามี User แต่ไม่ใช่ Admin
  if (!isAdmin) {
    console.error("🚫 Access denied: Not an admin");
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 p-4">
        <div className="bg-white border-4 border-black p-8 rounded-lg max-w-md text-center">
          <h2 className="text-2xl font-black mb-4">🚫 ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="mb-6">บัญชีของคุณไม่มีสิทธิ์ระดับ Admin</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-black text-white px-6 py-2 rounded-lg font-bold"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  // 4. ผ่านฉลุย
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
