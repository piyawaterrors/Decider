import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";

/**
 * ProtectedRoute Component
 * Protects routes that require authentication
 */
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    // Timeout after 10 seconds
    const timer = setTimeout(() => {
      if (loading) {
        console.error("⚠️ Auth loading timeout - check Supabase connection");
        setShowTimeout(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [loading]);

  if (loading && !showTimeout) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 to-pink-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white font-bold text-xl">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  if (showTimeout) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-400 to-pink-400 p-4">
        <div className="bg-white border-4 border-black rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-black mb-4">⚠️ เกิดข้อผิดพลาด</h2>
          <p className="mb-4">ไม่สามารถตรวจสอบสิทธิ์ได้</p>
          <p className="text-sm mb-4">กรุณาตรวจสอบ:</p>
          <ul className="text-sm list-disc list-inside mb-4">
            <li>Supabase URL และ Anon Key ใน .env</li>
            <li>เชื่อมต่อ Internet</li>
            <li>Restart dev server</li>
          </ul>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded border-4 border-black"
          >
            🔄 ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/**
 * AdminRoute Component
 * Protects routes that require admin privileges
 */
export const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    console.log("🔐 AdminRoute:", { user: !!user, isAdmin, loading });

    // Timeout after 10 seconds
    const timer = setTimeout(() => {
      if (loading) {
        console.error("⚠️ Admin auth loading timeout");
        setShowTimeout(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [user, isAdmin, loading]);

  if (loading && !showTimeout) {
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

  if (showTimeout) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-400 to-pink-400 p-4">
        <div className="bg-white border-4 border-black rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-black mb-4">⚠️ เกิดข้อผิดพลาด</h2>
          <p className="mb-4">ไม่สามารถตรวจสอบสิทธิ์ Admin ได้</p>
          <p className="text-sm mb-4">กรุณาตรวจสอบ:</p>
          <ul className="text-sm list-disc list-inside mb-4">
            <li>มีตาราง profiles ใน Supabase</li>
            <li>User มี role = 'admin' ใน profiles</li>
            <li>RLS Policies อนุญาตให้อ่าน profiles</li>
          </ul>
          <div className="flex gap-2">
            <button
              onClick={() => (window.location.href = "/")}
              className="flex-1 bg-gray-500 text-white font-bold py-2 px-4 rounded border-4 border-black"
            >
              🏠 หน้าหลัก
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-blue-500 text-white font-bold py-2 px-4 rounded border-4 border-black"
            >
              🔄 ลองใหม่
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("❌ No user, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    console.log("❌ User is not admin, redirecting to home");
    return <Navigate to="/" replace />;
  }

  console.log("✅ Admin access granted");
  return children;
};

/**
 * PublicRoute Component
 * Redirects authenticated users away from public-only pages (like login)
 */
export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-400 to-purple-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white font-bold text-xl">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};
