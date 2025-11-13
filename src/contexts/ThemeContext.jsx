import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") return true;
      if (saved === "light") return false;

      // Handle old boolean format or invalid data
      if (saved) {
        const parsed = JSON.parse(saved);
        return Boolean(parsed);
      }

      // Default to light theme
      return false;
    } catch (error) {
      // console.error("Error reading theme from localStorage:", error);
      // Clear invalid data and default to light theme
      localStorage.removeItem("theme");
      return false;
    }
  });

  useEffect(() => {
    try {
      // Store as simple string instead of JSON for better compatibility
      localStorage.setItem("theme", isDark ? "dark" : "light");

      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (error) {
      // console.error("Error saving theme to localStorage:", error);
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const value = {
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
