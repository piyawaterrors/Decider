import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useCategories } from "../hooks/useSupabaseData";
import { dbService } from "../services/dbService";
import { getEmojiFromIcon } from "../data/categories";
import { settingsService } from "../services/settingsService";
import { LoadingView } from "../components/LoadingView";
import { Notification } from "../components/Notification";

/**
 * AdminPage Component
 * Redesigned for High-Contrast Dark Mode Glassmorphism
 */
export const AdminPage = () => {
  const { user, signOut } = useAuth();
  const { data: categories, loading, refetch } = useCategories();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("categories");
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const tabs = [
    { id: "categories", label: "หมวดหมู่", icon: "📁" },
    { id: "decisions", label: "ตัวเลือก", icon: "🎲" },
    { id: "analytics", label: "สถิติ", icon: "📊" },
    { id: "settings", label: "ตั้งค่า", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-[#050510] text-white relative overflow-hidden font-sans">
      <Notification
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 sm:p-8 mb-8 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-2xl"
        >
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-medium mb-1 tracking-tight text-white flex items-center justify-center sm:justify-start gap-3">
              <span className="text-4xl">🛠️</span> จัดการระบบ
            </h1>
            <p className="text-white/40 text-sm font-medium">
              ADMIN ACC : <span className="text-[#CCFF00]">{user?.email}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/")}
              className="bg-white/5 hover:bg-white/10 text-white font-medium py-2.5 px-6 rounded-2xl border border-white/10 transition-all duration-300 flex items-center gap-2"
            >
              <span>🏠</span> หน้าหลัก
            </button>
            <button
              onClick={handleSignOut}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium py-2.5 px-6 rounded-2xl border border-red-500/20 transition-all duration-300 flex items-center gap-2"
            >
              <span>🚪</span> ออก
            </button>
          </div>
        </motion.header>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl transition-all duration-500 font-medium text-sm sm:text-base
                ${
                  activeTab === tab.id
                    ? "bg-[#CCFF00] text-black shadow-[0_0_20px_rgba(204,255,0,0.2)]"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="min-h-[400px]"
          >
            {activeTab === "categories" && (
              <CategoriesTab
                categories={categories}
                loading={loading}
                refetch={refetch}
                showToast={showToast}
              />
            )}
            {activeTab === "decisions" && (
              <DecisionsTab categories={categories} showToast={showToast} />
            )}
            {activeTab === "analytics" && <AnalyticsTab />}
            {activeTab === "settings" && <SettingsTab showToast={showToast} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

/**
 * CategoriesTab Component with CRUD Implementation
 */
const CategoriesTab = ({ categories, loading, refetch, showToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    icon_name: "🎲",
    description: "",
  });

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ title: "", icon_name: "🎲", description: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      title: category.title,
      icon_name: category.icon_name || "🎲",
      description: category.description || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "ต้องการลบหมวดหมู่พื้นฐานและตัวเลือกทั้งหมดภายในหมวดนี้ใช่หรือไม่?"
      )
    ) {
      const { error } = await dbService.deleteCategory(id);
      if (error) {
        showToast("ลบไม่สำเร็จ: " + error.message, "error");
      } else {
        showToast("ลบหมวดหมู่เรียบร้อยแล้ว", "success");
        refetch();
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingCategory) {
        // Update
        const { error } = await dbService.updateCategory(
          editingCategory.id,
          formData
        );
        if (error) throw error;
        showToast("อัปเดตหมวดหมู่สำเร็จ", "success");
      } else {
        // Create
        const { error } = await dbService.createCategory(formData);
        if (error) throw error;
        showToast("สร้างหมวดหมู่ใหม่สำเร็จ", "success");
      }

      setIsModalOpen(false);
      refetch();
    } catch (error) {
      showToast("เกิดข้อผิดพลาด: " + error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <LoadingView message="กำลังโหลดหมวดหมู่..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8 px-2">
        <h2 className="text-2xl font-medium tracking-tight">
          หมวดหมู่ทั้งหมด ({categories?.length || 0})
        </h2>
        <button
          onClick={openAddModal}
          className="bg-[#CCFF00] text-black font-medium py-2.5 px-6 rounded-2xl shadow-[0_10px_20px_rgba(204,255,0,0.2)] hover:scale-105 transition-all duration-300 flex items-center gap-2"
        >
          <span>➕</span> เพิ่มหมวดหมู่
        </button>
      </div>

      {categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <motion.div
              layout
              key={category.id}
              className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 group hover:border-[#CCFF00]/30 transition-all duration-500 shadow-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl bg-white/5 w-20 h-20 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  {getEmojiFromIcon(category.icon_name)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(category)}
                    className="w-10 h-10 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 flex items-center justify-center transition-all"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="w-10 h-10 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-xl border border-red-500/10 flex items-center justify-center transition-all"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-medium mb-2 text-white">
                {category.title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed line-clamp-2">
                {category.description || "ไม่มีคำอธิบายสำหรับหมวดหมู่นี้"}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[2rem] py-20 text-center">
          <p className="text-white/20 text-lg font-medium">
            ยังไม่มีหมวดหมู่ในระบบ
          </p>
        </div>
      )}

      {/* Category CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[#0F0F1A] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#CCFF00]/5 rounded-full blur-[80px]"></div>

              <h3 className="text-2xl font-medium mb-6 flex items-center gap-3">
                {editingCategory ? "✏️ แก้ไขหมวดหมู่" : "➕ เพิ่มหมวดหมู่ใหม่"}
              </h3>

              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-white/40 text-xs font-medium uppercase tracking-widest mb-2 ml-1">
                    ไอคอน (Emoji หรือ Icon Name)
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.icon_name}
                    onChange={(e) =>
                      setFormData({ ...formData, icon_name: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 focus:border-[#CCFF00] outline-none transition-all"
                    placeholder="เช่น 🍔 หรือ fast_food"
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-xs font-medium uppercase tracking-widest mb-2 ml-1">
                    ชื่อหมวดหมู่
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 focus:border-[#CCFF00] outline-none transition-all"
                    placeholder="เช่น เย็นนี้กินอะไรดี?"
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-xs font-medium uppercase tracking-widest mb-2 ml-1">
                    คำอธิบาย
                  </label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 focus:border-[#CCFF00] outline-none transition-all resize-none"
                    placeholder="สั้นๆ ว่าหมวดนี้เกี่ยวกับอะไร..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-2xl border border-white/10 transition-all font-medium"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-[2] bg-[#CCFF00] text-black hover:bg-[#d9ff33] py-4 rounded-2xl font-medium shadow-lg transition-all disabled:opacity-50"
                  >
                    {isSaving
                      ? "กำลังบันทึก..."
                      : editingCategory
                      ? "อัปเดตข้อมูล"
                      : "สร้างหมวดหมู่"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * DecisionsTab Component
 */
const DecisionsTab = ({ categories, showToast }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDecision, setEditingDecision] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    content: "",
    insult_text: "",
    is_active: true,
  });

  useEffect(() => {
    if (selectedCategoryId) {
      fetchDecisions();
    } else {
      setDecisions([]);
    }
  }, [selectedCategoryId]);

  const fetchDecisions = async () => {
    setLoading(true);
    const { data, error } = await dbService.getDecisionsByCategory(
      selectedCategoryId
    );
    if (!error && data) {
      setDecisions(data);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    if (!selectedCategoryId) {
      showToast("กรุณาเลือกหมวดหมู่ก่อนเพิ่มตัวเลือก", "warning");
      return;
    }
    setEditingDecision(null);
    setFormData({ content: "", insult_text: "", is_active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (decision) => {
    setEditingDecision(decision);
    setFormData({
      content: decision.content,
      insult_text: decision.insult_text || "",
      is_active: decision.is_active ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("ต้องการลบตัวเลือกนี้ใช่หรือไม่?")) {
      const { error } = await dbService.deleteDecision(id);
      if (error) {
        showToast("ลบไม่สำเร็จ: " + error.message, "error");
      } else {
        showToast("ลบตัวเลือกเรียบร้อยแล้ว", "success");
        fetchDecisions();
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        category_id: selectedCategoryId,
      };

      if (editingDecision) {
        const { error } = await dbService.updateDecision(
          editingDecision.id,
          payload
        );
        if (error) throw error;
        showToast("อัปเดตตัวเลือกสำเร็จ", "success");
      } else {
        const { error } = await dbService.createDecision(payload);
        if (error) throw error;
        showToast("เพิ่มตัวเลือกใหม่สำเร็จ", "success");
      }

      setIsModalOpen(false);
      fetchDecisions();
    } catch (error) {
      showToast("เกิดข้อผิดพลาด: " + error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-end justify-between gap-6 shadow-xl relative overflow-hidden">
        {/* Decorative inner glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#CCFF00]/5 rounded-full blur-[50px] pointer-events-none"></div>

        <div className="flex-1 w-full relative z-10">
          <label className="block text-white/40 text-[10px] font-medium uppercase tracking-[0.2em] mb-3 ml-2">
            เลือกหมวดหมู่เพื่อจัดการตัวเลือก
          </label>
          <div className="relative">
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-[#CCFF00] focus:bg-white/10 outline-none transition-all appearance-none cursor-pointer font-medium text-white/80"
            >
              <option value="" className="bg-[#0F0F1A]">
                --- กรุณาเลือกหมวดหมู่ ---
              </option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#0F0F1A]">
                  {getEmojiFromIcon(cat.icon_name)} {cat.title}
                </option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        <button
          onClick={openAddModal}
          disabled={!selectedCategoryId}
          className={`whitespace-nowrap h-[60px] px-10 rounded-2xl font-medium transition-all duration-300 flex items-center gap-3 shadow-lg relative z-10 ${
            !selectedCategoryId
              ? "bg-white/5 text-white/10 cursor-not-allowed border border-white/5"
              : "bg-[#CCFF00] text-black hover:scale-[1.02] shadow-[#CCFF00]/10 hover:shadow-[#CCFF00]/20 active:scale-95"
          }`}
        >
          <span className="text-xl">➕</span>
          <span>เพิ่มตัวเลือก</span>
        </button>
      </div>

      {/* Decisions List */}
      {selectedCategoryId ? (
        loading ? (
          <LoadingView message="กำลังเรียกข้อมูลตัวเลือก..." />
        ) : decisions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {decisions.map((decision) => (
              <motion.div
                layout
                key={decision.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-3xl p-6 group transition-all"
              >
                <div className="flex justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-white font-medium mb-1">
                      {decision.content}
                    </div>
                    <div className="text-white/30 text-xs italic">
                      "{decision.insult_text || "ไม่มีคำด่า"}"
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(decision)}
                      className="w-9 h-9 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 flex items-center justify-center transition-all"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(decision.id)}
                      className="w-9 h-9 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-xl border border-red-500/10 flex items-center justify-center transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[2rem] py-20 text-center">
            <p className="text-white/20 text-lg font-medium">
              ยังไม่มีตัวเลือกในหมวดหมู่นี้
            </p>
          </div>
        )
      ) : (
        <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[2rem] py-20 text-center">
          <p className="text-white/10 text-lg font-medium">
            กรุณาเลือกหมวดหมู่ด้านบน เพื่อเริ่มจัดการตัวเลือก
          </p>
        </div>
      )}

      {/* Decision CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[#0F0F1A] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/5 rounded-full blur-[80px]"></div>

              <h3 className="text-2xl font-medium mb-6 flex items-center gap-3">
                {editingDecision ? "✏️ แก้ไขตัวเลือก" : "➕ เพิ่มตัวเลือกใหม่"}
              </h3>

              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-white/40 text-xs font-medium uppercase tracking-widest mb-2 ml-1">
                    คำตอบ / ผลลัพธ์
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 focus:border-[#CCFF00] outline-none transition-all"
                    placeholder="เช่น กะเพราไก่ไข่ดาว"
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-xs font-medium uppercase tracking-widest mb-2 ml-1">
                    คำพูดประกอบ (คำด่า / คำแนะนำ)
                  </label>
                  <textarea
                    rows="2"
                    value={formData.insult_text}
                    onChange={(e) =>
                      setFormData({ ...formData, insult_text: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 focus:border-[#CCFF00] outline-none transition-all resize-none"
                    placeholder="เช่น กินไปเถอะอย่าเรื่องมาก!"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-2xl border border-white/10 transition-all font-medium"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-[2] bg-[#CCFF00] text-black hover:bg-[#d9ff33] py-4 rounded-2xl font-medium shadow-lg transition-all disabled:opacity-50"
                  >
                    {isSaving
                      ? "กำลังบันทึก..."
                      : editingDecision
                      ? "อัปเดตตัวเลือก"
                      : "เพิ่มตัวเลือก"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * AnalyticsTab Component
 * Custom Glassmorphism Analytics with Summary Cards and Animated Bar Chart
 */
const AnalyticsTab = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const { data, error } = await dbService.getUsageStats();
    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  const stats = useMemo(() => {
    if (!logs.length)
      return { total: 0, byCategory: [], byDate: [], topCategory: "N/A" };

    // Group by category
    const catMap = {};
    logs.forEach((log) => {
      const title = log.categories?.title || "Unknown";
      catMap[title] = (catMap[title] || 0) + 1;
    });

    const byCategory = Object.entries(catMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Group by date (last 7 days - Local Time)
    const dateMap = {};
    const today = new Date();

    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dateMap[formatDate(d)] = 0;
    }

    logs.forEach((log) => {
      const date = formatDate(new Date(log.created_at));
      if (dateMap[date] !== undefined) {
        dateMap[date]++;
      }
    });

    const byDate = Object.entries(dateMap).map(([date, count]) => ({
      date,
      count,
    }));

    return {
      total: logs.length,
      byCategory,
      byDate,
      topCategory: byCategory[0]?.name || "N/A",
    };
  }, [logs]);

  if (loading) return <LoadingView message="กำลังคำนวณสถิติ..." />;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="จำนวนการสุ่มทั้งหมด"
          value={stats.total}
          icon="🎲"
          color="text-[#CCFF00]"
          glow="bg-[#CCFF00]/10"
        />
        <StatCard
          title="หมวดหมู่ยอดฮิต"
          value={stats.topCategory}
          icon="🔥"
          color="text-purple-400"
          glow="bg-purple-500/10"
        />
        <StatCard
          title="เฉลี่ยต่อวัน"
          value={(stats.total / 7).toFixed(1)}
          icon="📈"
          color="text-blue-400"
          glow="bg-blue-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution Chart */}
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8">
          <h3 className="text-xl font-medium mb-8 flex items-center gap-3">
            <span className="w-2 h-8 bg-[#CCFF00] rounded-full"></span>
            สัดส่วนการสุ่มตามหมวดหมู่
          </h3>

          <div className="space-y-6">
            {stats.byCategory.length > 0 ? (
              stats.byCategory.slice(0, 5).map((cat, idx) => (
                <div key={cat.name} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-white/60">{cat.name}</span>
                    <span className="text-[#CCFF00]">{cat.count} ครั้ง</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          (cat.count / stats.byCategory[0].count) * 100
                        }%`,
                      }}
                      transition={{
                        duration: 1,
                        delay: idx * 0.1,
                        ease: "circOut",
                      }}
                      className="h-full bg-gradient-to-r from-purple-500 to-[#CCFF00] rounded-full"
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-white/20 py-10">
                ไม่มีข้อมูลการใช้งาน
              </p>
            )}
          </div>
        </div>

        {/* Activity Over Time */}
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8">
          <h3 className="text-xl font-medium mb-8 flex items-center gap-3">
            <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
            กิจกรรมในช่วง 7 วันที่ผ่านมา
          </h3>

          <div className="flex items-end justify-between h-[180px] gap-2 px-2">
            {stats.byDate.map((day, idx) => {
              const maxCount = Math.max(...stats.byDate.map((d) => d.count), 1);
              const height = (day.count / maxCount) * 100;

              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center justify-end h-full group"
                >
                  <div className="relative w-full flex-1 flex flex-col justify-end items-center">
                    {/* Tooltip */}
                    <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all duration-200 bg-white text-black text-[10px] font-bold px-2 py-1.5 rounded-lg shadow-xl z-20 whitespace-nowrap pointer-events-none">
                      {day.count.toLocaleString()} ครั้ง
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                    </div>

                    {/* Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{
                        height: `${Math.max(height, day.count > 0 ? 5 : 0)}%`,
                      }}
                      transition={{
                        duration: 1,
                        delay: idx * 0.1,
                        ease: [0.34, 1.56, 0.64, 1], // Custom spring-like easing
                      }}
                      className={`w-full max-w-[24px] rounded-t-xl transition-all duration-500 ${
                        day.count > 0
                          ? "bg-gradient-to-t from-blue-600 via-blue-400 to-[#CCFF00] shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                          : "bg-white/5"
                      }`}
                    />
                  </div>
                  <span className="mt-4 text-[10px] font-medium text-white/20 uppercase tracking-widest">
                    {new Date(day.date).toLocaleDateString("th-TH", {
                      weekday: "short",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, glow }) => (
  <motion.div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 relative overflow-hidden group">
    <div
      className={`absolute -right-4 -bottom-4 w-24 h-24 ${glow} rounded-full blur-[40px] group-hover:blur-[60px] transition-all duration-500`}
    ></div>
    <div className="flex items-center gap-4 mb-3">
      <span className="text-2xl">{icon}</span>
      <span className="text-white/40 text-sm font-medium uppercase tracking-wider">
        {title}
      </span>
    </div>
    <div className={`text-3xl font-medium truncate ${color}`}>{value}</div>
  </motion.div>
);

/**
 * SettingsTab Component
 */
const SettingsTab = ({ showToast }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({});
  const [originalSettings, setOriginalSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const changed =
      JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const loadSettings = async () => {
    setLoading(true);
    const { data, error } = await settingsService.getAllSettings();
    if (!error && data) {
      const settingsObj = {};
      data.forEach((setting) => {
        settingsObj[setting.key] = setting.value;
      });
      setSettings(settingsObj);
      setOriginalSettings(settingsObj);
    }
    setLoading(false);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const promises = [];
      const keys = [
        "donation_enabled",
        "buy_me_coffee_url",
        "donation_qr_code",
        "donation_message",
        "random_limit",
      ];
      keys.forEach((key) => {
        if (settings[key] !== originalSettings[key]) {
          promises.push(
            settingsService.updateSetting(key, settings[key], user?.id)
          );
        }
      });
      const results = await Promise.all(promises);
      if (results.some((r) => r.error)) {
        showToast("บันทึกการตั้งค่าไม่สำเร็จ", "error");
      } else {
        showToast("บันทึกการตั้งค่าทั้งหมดแล้ว", "success");
        setOriginalSettings({ ...settings });
        setHasChanges(false);
      }
    } catch (error) {
      showToast("เกิดข้อผิดพลาดในการบันทึก", "error");
    }
    setSaving(false);
  };

  if (loading) return <LoadingView message="กำลังโหลดความลับ..." />;

  const isDonationEnabled =
    settings.donation_enabled === true || settings.donation_enabled === "true";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white/[0.03] border border-white/10 p-6 rounded-[2rem] gap-4">
        <div>
          <h2 className="text-xl font-medium">⚙️ ตั้งค่าระบบ</h2>
          <p className="text-white/40 text-sm">
            จัดการข้อมูลการโดเนทและระบบเบื้องหลัง
          </p>
        </div>

        {hasChanges && (
          <div className="flex gap-2">
            <button
              onClick={() => setSettings({ ...originalSettings })}
              className="bg-white/5 hover:bg-white/10 py-2.5 px-6 rounded-2xl border border-white/10 transition-all font-medium text-sm"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="bg-[#CCFF00] text-black hover:bg-[#d9ff33] py-2.5 px-6 rounded-2xl shadow-lg transition-all font-medium text-sm disabled:opacity-50"
            >
              {saving ? "กำลังบันทึก..." : "💾 บันทึกทั้งหมด"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Main Toggle */}
        <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2rem] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white mb-1">
                การรับค่ากาแฟ
              </h3>
              <p className="text-white/40 text-sm">
                เปิดเพื่อให้ผู้ใช้เห็นปุ่มโดเนท
              </p>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  donation_enabled: !isDonationEnabled,
                })
              }
              className={`w-14 h-8 rounded-full transition-all duration-300 relative border border-white/10 ${
                isDonationEnabled ? "bg-[#CCFF00]" : "bg-white/10"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-all duration-300 ${
                  isDonationEnabled ? "left-7" : "left-1"
                }`}
              ></div>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white/60 text-xs font-medium uppercase tracking-wider mb-2 ml-1">
                PromptPay ID (เบอร์โทร/เลขบัตร)
              </label>
              <input
                type="text"
                value={settings.promptpay_id || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    promptpay_id: e.target.value,
                  })
                }
                className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3 px-5 focus:border-[#CCFF00] outline-none transition-all placeholder:text-white/10"
                placeholder="081-XXX-XXXX"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium uppercase tracking-wider mb-2 ml-1">
                Slip2Go API Key
              </label>
              <input
                type="password"
                value={settings.slip2go_api_key || ""}
                onChange={(e) =>
                  setSettings({ ...settings, slip2go_api_key: e.target.value })
                }
                className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3 px-5 focus:border-[#CCFF00] outline-none transition-all placeholder:text-white/10"
                placeholder="s2g_..."
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium uppercase tracking-wider mb-2 ml-1">
                ยอดโอนขั้นต่ำในการปลดล็อก (บาท)
              </label>
              <input
                type="number"
                value={settings.min_donation_amount || 20}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    min_donation_amount: parseInt(e.target.value, 10),
                  })
                }
                className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3 px-5 focus:border-[#CCFF00] outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Message and Random Limit */}
        <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2rem] flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <label className="block text-white/60 text-xs font-medium uppercase tracking-wider mb-2 ml-1">
                ข้อความขอบคุณ
              </label>
              <textarea
                rows="3"
                value={settings.donation_message || ""}
                onChange={(e) =>
                  setSettings({ ...settings, donation_message: e.target.value })
                }
                className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3 px-5 focus:border-[#CCFF00] outline-none transition-all resize-none placeholder:text-white/10"
                placeholder="ขอบคุณที่สนับสนุนแอดมินนะครับ..."
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs font-medium uppercase tracking-wider mb-2 ml-1">
                สุ่มได้กี่ครั้งก่อนล็อค (Random Limit)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={settings.random_limit || 10}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      random_limit: parseInt(e.target.value, 10),
                    })
                  }
                  className="flex-1 bg-white/[0.05] border border-white/10 rounded-2xl py-3 px-5 focus:border-[#CCFF00] outline-none transition-all"
                  placeholder="เช่น 10"
                />
                <span className="text-white/40 text-sm">ครั้ง</span>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mt-6">
            <p className="text-white/20 text-[10px] font-medium tracking-[0.2em] uppercase mb-2">
              Live Preview Details
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Status:</span>
                <span
                  className={
                    isDonationEnabled ? "text-[#CCFF00]" : "text-white/20"
                  }
                >
                  {isDonationEnabled ? "Active" : "Disabled"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">URL Configured:</span>
                <span className="text-white/80">
                  {settings.buy_me_coffee_url ? "✅ Yes" : "❌ No"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
