import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark"); // "light" | "dark"

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Save theme changes
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.setAttribute("data-theme", theme);
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
