import { useState, useCallback, useEffect } from "react";

/**
 * Custom hook for decision logic with context awareness
 * Handles time, weather, and click counting logic with persistence
 * @param {Object} config - Configuration options
 * @param {boolean} config.isDonationEnabled - Whether the donation lock logic should be active
 */
export const useDecision = (
  config = { isDonationEnabled: true, randomLimit: 5 }
) => {
  // Initialize state from localStorage if available
  const [clickCount, setClickCount] = useState(() => {
    const saved = localStorage.getItem("decider_click_count");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [isLocked, setIsLocked] = useState(() => {
    const saved = localStorage.getItem("decider_is_locked");
    return saved === "true";
  });

  const [currentDecision, setCurrentDecision] = useState(null);
  const [contextMessage, setContextMessage] = useState("");
  const [lastClickTime, setLastClickTime] = useState(0);

  const limit = parseInt(config.randomLimit, 10) || 5;
  const COOLDOWN_MS = 1500; // 1.5 seconds cooldown

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("decider_click_count", clickCount.toString());
  }, [clickCount]);

  useEffect(() => {
    localStorage.setItem("decider_is_locked", isLocked.toString());
  }, [isLocked]);

  /**
   * Get current time context
   */
  const getTimeContext = () => {
    const hour = new Date().getHours();
    const day = new Date().getDay();

    if (hour >= 0 && hour < 5) {
      return { isLateNight: true, message: "ดึกแล้วนะ! ไปนอนดีกว่าไหม? 😴" };
    }

    if (day === 0 || day === 6) {
      return {
        isWeekend: true,
        message: "วันหยุดแล้ว อย่าคิดเรื่องงานเลย! 🎉",
      };
    }

    return { isNormal: true, message: "" };
  };

  /**
   * Get weather context (DISABLED for performance)
   */
  const getWeatherContext = async () => {
    // Weather API disabled - return immediately
    return { isRaining: false, message: "" };
  };

  /**
   * Make a decision with context awareness
   */
  const makeDecision = useCallback(
    async (decisions, category) => {
      // Validate decisions array
      if (!decisions || !Array.isArray(decisions) || decisions.length === 0) {
        setContextMessage("ไม่มีตัวเลือกในหมวดหมู่นี้");
        return null;
      }

      // Step 0: Rate Limiting
      const now = Date.now();
      if (now - lastClickTime < COOLDOWN_MS) {
        return {
          error: "too_fast",
          message: "ใจเย็นๆ... สุ่มเร็วไปแล้วลูกพี่! ✋🛑",
        };
      }
      setLastClickTime(now);

      // Step 1: Increment Count (Always count, regardless of donation setting)
      const newClickCount = clickCount + 1;
      setClickCount(newClickCount);

      // Step 2: Check Lock (Only lock if donation is enabled)
      if (config.isDonationEnabled && newClickCount > limit) {
        setIsLocked(true);
        setContextMessage(
          `🔒 กดมากไปแล้ว! (ครบ ${limit} ครั้ง) เลี้ยงกาแฟแอดมินก่อนค่อยปลดล็อก 😏`
        );
        return null;
      }

      // Step 3: Normal Flow
      const timeContext = getTimeContext();
      const weatherContext = await getWeatherContext();
      const randomIndex = Math.floor(Math.random() * decisions.length);
      const randomDecision = decisions[randomIndex];

      // Validate randomDecision
      if (!randomDecision) {
        setContextMessage("เกิดข้อผิดพลาดในการสุ่ม กรุณาลองใหม่อีกครั้ง");
        return null;
      }

      // Validate required fields
      if (!randomDecision.content) {
        setContextMessage("ข้อมูลไม่สมบูรณ์ กรุณาตรวจสอบข้อมูลในระบบ");
        return null;
      }

      let contextMsg = "";
      if (timeContext.message) contextMsg += timeContext.message + " ";
      if (weatherContext.message) contextMsg += weatherContext.message + " ";

      setContextMessage(contextMsg);
      setCurrentDecision(randomDecision);

      return {
        decision: randomDecision,
        context: {
          time: timeContext,
          weather: weatherContext,
          clickCount: newClickCount,
        },
      };
    },
    [clickCount, config.isDonationEnabled, limit, lastClickTime]
  );

  /**
   * Reset decision state
   */
  const reset = useCallback(() => {
    setClickCount(0);
    setIsLocked(false);
    setCurrentDecision(null);
    setContextMessage("");
    localStorage.removeItem("decider_click_count");
    localStorage.removeItem("decider_is_locked");
  }, []);

  /**
   * Unlock after donation
   */
  const unlock = useCallback(() => {
    setIsLocked(false);
    setClickCount(0);
    setContextMessage("ขอบคุณสำหรับกาแฟ! ปลดล็อกให้แล้ว ☕✨");
    localStorage.setItem("decider_click_count", "0");
    localStorage.setItem("decider_is_locked", "false");
  }, []);

  return {
    clickCount,
    isLocked,
    currentDecision,
    contextMessage,
    makeDecision,
    reset,
    unlock,
  };
};
