import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useCategories } from "../hooks/useSupabaseData";
import { dbService } from "../services/dbService";
import { getEmojiFromIcon } from "../data/categories";

/**
 * AdminPage Component
 * Admin dashboard for managing categories and decisions
 */
export const AdminPage = () => {
  const { user, signOut } = useAuth();
  const { data: categories, loading, refetch } = useCategories();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("categories");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6 mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black mb-2">🛠️ Admin Dashboard</h1>
              <p className="text-gray-600 font-semibold">
                ยินดีต้อนรับ, {user?.email}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/")}
                className="
                  bg-blue-500 text-white font-bold py-2 px-6 rounded-lg
                  border-4 border-black
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                  hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                  transition-all duration-200
                "
              >
                🏠 หน้าหลัก
              </button>
              <button
                onClick={handleSignOut}
                className="
                  bg-red-500 text-white font-bold py-2 px-6 rounded-lg
                  border-4 border-black
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                  hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                  transition-all duration-200
                "
              >
                🚪 ออกจากระบบ
              </button>
            </div>
          </div>
        </motion.header>

        {/* Tabs */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg mb-8">
          <div className="flex border-b-4 border-black">
            <button
              onClick={() => setActiveTab("categories")}
              className={`
                flex-1 py-4 px-6 font-bold text-lg
                transition-colors duration-200
                ${
                  activeTab === "categories"
                    ? "bg-purple-500 text-white"
                    : "bg-white text-black hover:bg-gray-100"
                }
              `}
            >
              📁 หมวดหมู่
            </button>
            <button
              onClick={() => setActiveTab("decisions")}
              className={`
                flex-1 py-4 px-6 font-bold text-lg border-l-4 border-black
                transition-colors duration-200
                ${
                  activeTab === "decisions"
                    ? "bg-purple-500 text-white"
                    : "bg-white text-black hover:bg-gray-100"
                }
              `}
            >
              🎲 ตัวเลือก
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`
                flex-1 py-4 px-6 font-bold text-lg border-l-4 border-black
                transition-colors duration-200
                ${
                  activeTab === "analytics"
                    ? "bg-purple-500 text-white"
                    : "bg-white text-black hover:bg-gray-100"
                }
              `}
            >
              📊 สถิติ
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "categories" && (
              <CategoriesTab
                categories={categories}
                loading={loading}
                refetch={refetch}
              />
            )}
            {activeTab === "decisions" && (
              <DecisionsTab categories={categories} />
            )}
            {activeTab === "analytics" && <AnalyticsTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * CategoriesTab Component
 */
const CategoriesTab = ({ categories, loading, refetch }) => {
  if (loading) {
    return <div className="text-center py-8 font-bold">กำลังโหลด...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black">จัดการหมวดหมู่</h2>
        <button
          className="
          bg-green-500 text-white font-bold py-2 px-6 rounded-lg
          border-4 border-black
          shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
          hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
          transition-all duration-200
        "
        >
          ➕ เพิ่มหมวดหมู่
        </button>
      </div>

      {categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-gray-100 border-4 border-black rounded-lg p-4"
            >
              <div className="text-4xl mb-2">
                {getEmojiFromIcon(category.icon_name)}
              </div>
              <h3 className="text-xl font-bold mb-1">{category.title}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {category.description}
              </p>
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-500 text-white font-bold py-2 px-4 rounded border-2 border-black">
                  ✏️ แก้ไข
                </button>
                <button className="flex-1 bg-red-500 text-white font-bold py-2 px-4 rounded border-2 border-black">
                  🗑️ ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 font-semibold">
          ยังไม่มีหมวดหมู่ กรุณาเพิ่มหมวดหมู่ใหม่
        </div>
      )}
    </div>
  );
};

/**
 * DecisionsTab Component
 */
const DecisionsTab = ({ categories }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black">จัดการตัวเลือก</h2>
        <button
          className="
          bg-green-500 text-white font-bold py-2 px-6 rounded-lg
          border-4 border-black
          shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
          hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
          transition-all duration-200
        "
        >
          ➕ เพิ่มตัวเลือก
        </button>
      </div>

      <div className="bg-yellow-200 border-4 border-black rounded-lg p-6 text-center">
        <p className="font-bold">🚧 กำลังพัฒนา...</p>
        <p className="text-sm mt-2">ฟีเจอร์นี้จะเปิดให้ใช้งานเร็วๆ นี้</p>
      </div>
    </div>
  );
};

/**
 * AnalyticsTab Component
 */
const AnalyticsTab = () => {
  return (
    <div>
      <h2 className="text-2xl font-black mb-6">สถิติการใช้งาน</h2>

      <div className="bg-yellow-200 border-4 border-black rounded-lg p-6 text-center">
        <p className="font-bold">📊 กำลังพัฒนา...</p>
        <p className="text-sm mt-2">ฟีเจอร์นี้จะเปิดให้ใช้งานเร็วๆ นี้</p>
      </div>
    </div>
  );
};
