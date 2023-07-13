import React, { useEffect, useState, useCallback } from 'react';

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode((s) => !s), [
    setDarkMode
  ]);

  return (
    <button onClick={toggleDarkMode}>
      <img
        src="https://unpkg.com/pixelarticons@latest/svg/sun.svg"
        height="12"
        alt=""
      />
      toggle dark mode
    </button>
  );
};

export default DarkModeToggle;
