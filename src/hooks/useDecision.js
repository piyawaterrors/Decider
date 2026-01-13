import { useState, useCallback } from "react";

/**
 * Custom hook for decision logic with context awareness
 * Handles time, weather, and click counting logic
 */
export const useDecision = () => {
  const [clickCount, setClickCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [currentDecision, setCurrentDecision] = useState(null);
  const [contextMessage, setContextMessage] = useState("");

  /**
   * Get current time context
   */
  const getTimeContext = () => {
    const hour = new Date().getHours();
    const day = new Date().getDay();

    // Check if it's after midnight (00:00 - 05:00)
    if (hour >= 0 && hour < 5) {
      return {
        isLateNight: true,
        message: "ดึกแล้วนะ! ไปนอนดีกว่าไหม? 😴",
      };
    }

    // Check if it's weekend
    if (day === 0 || day === 6) {
      return {
        isWeekend: true,
        message: "วันหยุดแล้ว อย่าคิดเรื่องงานเลย! 🎉",
      };
    }

    return {
      isNormal: true,
      message: "",
    };
  };

  /**
   * Get weather context (placeholder - integrate with OpenWeatherMap API)
   */
  const getWeatherContext = async () => {
    try {
      // Get user's location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

      if (!apiKey) {
        return { isRaining: false, message: "" };
      }

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
      console.error("Weather check error:", error);
      return { isRaining: false, message: "" };
    }
  };

  /**
   * Make a decision with context awareness
   */
  const makeDecision = useCallback(
    async (decisions, category) => {
      // Increment click count
      const newClickCount = clickCount + 1;
      setClickCount(newClickCount);

      // Lock after 5 clicks
      if (newClickCount > 5) {
        setIsLocked(true);
        setContextMessage(
          "🔒 กดมากไปแล้ว! ไม่มีความมั่นใจในตัวเองเลยเหรอ? เลี้ยงกาแฟแอดมินก่อนค่อยปลดล็อก 😏"
        );
        return null;
      }

      // Get time context
      const timeContext = getTimeContext();

      // Get weather context
      const weatherContext = await getWeatherContext();

      // Randomly select a decision
      const randomDecision =
        decisions[Math.floor(Math.random() * decisions.length)];

      // Build context message
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
    [clickCount]
  );

  /**
   * Reset decision state
   */
  const reset = useCallback(() => {
    setClickCount(0);
    setIsLocked(false);
    setCurrentDecision(null);
    setContextMessage("");
  }, []);

  /**
   * Unlock after donation (or just reset)
   */
  const unlock = useCallback(() => {
    setIsLocked(false);
    setClickCount(0);
    setContextMessage("ขอบคุณสำหรับกาแฟ! ปลดล็อกให้แล้ว ☕✨");
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
