import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { AdminPage } from "./pages/AdminPage";
import {
  ProtectedRoute,
  AdminRoute,
  PublicRoute,
} from "./components/RouteGuard";

/**
 * Main App Component
 * Handles routing and authentication
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />

        {/* Login Route (handles auth check internally) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Routes (protected) */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-gradient-to-br from-red-400 to-pink-400 flex items-center justify-center p-4">
              <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-lg p-8 text-center">
                <h1 className="text-6xl font-black mb-4">404</h1>
                <p className="text-2xl font-bold mb-6">หน้านี้หาไม่เจอ!</p>
                <a
                  href="/"
                  className="
                    inline-block bg-purple-500 text-white font-bold py-3 px-6 rounded-lg
                    border-4 border-black
                    shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                    hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                    transition-all duration-200
                  "
                >
                  กลับหน้าหลัก
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
