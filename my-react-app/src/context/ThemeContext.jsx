import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      return savedTheme || "dark";
    } catch {
      return "dark";
    }
  }); // "light" | "dark"
  const hasMountedRef = useRef(false);

  // Apply theme before paint (prevents visible "delay"/flash) + animate only on toggles
  useLayoutEffect(() => {
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // ignore
    }

    if (!hasMountedRef.current) {
      document.body.setAttribute("data-theme", theme);
      hasMountedRef.current = true;
      return;
    }

    document.body.classList.add("theme-transition");
    // Ensure transitions are applied before switching theme variables.
    // (Otherwise some components change instantly and others animate.)
    // eslint-disable-next-line no-unused-expressions
    document.body.offsetHeight;

    document.body.setAttribute("data-theme", theme);
    const timeoutId = setTimeout(() => {
      document.body.classList.remove("theme-transition");
    }, 650);

    return () => clearTimeout(timeoutId);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };
   const isDark = theme === "dark";
  const cardStyle = {
    background: isDark ? "#1f2940" : "#ffffff",
    color: isDark ? "#ffffff" : "#000000",
    title: isDark ? "#ffffff" : "#000000",
  };

   const tooltipStyle = {
      backgroundColor: isDark ? "#111827" : "#ffffff", // dark bg for dark mode
      border: "1px solid", // optional border
      borderColor: isDark ? "#374151" : "#e5e7eb", // subtle border color
      borderRadius: 6, // rounded corners
      padding: "8px 12px",
      color: isDark ? "#ffffff" : "#000000", // text color
      fontSize: 14,
      boxShadow: isDark
        ? "0 2px 10px rgba(0,0,0,0.5)"
        : "0 2px 10px rgba(0,0,0,0.1)", // subtle shadow
    };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, cardStyle, tooltipStyle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
