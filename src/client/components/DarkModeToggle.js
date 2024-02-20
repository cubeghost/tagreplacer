import React, { useEffect, useState, useCallback } from 'react';
import sun from 'pixelarticons/svg/sun.svg';

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
        src={sun}
        height="12"
        alt=""
      />
      toggle dark mode
    </button>
  );
};

export default DarkModeToggle;
