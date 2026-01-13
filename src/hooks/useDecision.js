import { useState, useCallback, useEffect } from "react";

/**
 * Custom hook for decision logic with context awareness
 * Handles time, weather, and click counting logic with persistence
 * @param {Object} config - Configuration options
 * @param {boolean} config.isDonationEnabled - Whether the donation lock logic should be active
 */
export const useDecision = (config = { isDonationEnabled: true }) => {
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
   * Get weather context
   */
  const getWeatherContext = async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

      if (!apiKey) return { isRaining: false, message: "" };

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`
      );

      const data = await response.json();
      const weather = data.weather[0].main.toLowerCase();

      if (weather.includes("rain") || weather.includes("drizzle")) {
        return {
          isRaining: true,
          message: "ฝนตกนะ! คิดให้ดีก่อนออกไปข้างนอก ☔",
        };
      }

      return { isRaining: false, message: "" };
    } catch (error) {
      return { isRaining: false, message: "" };
    }
  };

  /**
   * Make a decision with context awareness
   */
  const makeDecision = useCallback(
    async (decisions, category) => {
      // Step 1: Increment Count (Always count, regardless of donation setting)
      const newClickCount = clickCount + 1;
      setClickCount(newClickCount);

      // Step 2: Check Lock (Only lock if donation is enabled)
      if (config.isDonationEnabled && newClickCount > 5) {
        setIsLocked(true);
        setContextMessage(
          "🔒 กดมากไปแล้ว! ไม่มีความมั่นใจในตัวเองเลยเหรอ? เลี้ยงกาแฟแอดมินก่อนค่อยปลดล็อก 😏"
        );
        return null;
      }

      // Step 3: Normal Flow
      const timeContext = getTimeContext();
      const weatherContext = await getWeatherContext();
      const randomDecision =
        decisions[Math.floor(Math.random() * decisions.length)];

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
    [clickCount, config.isDonationEnabled]
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
