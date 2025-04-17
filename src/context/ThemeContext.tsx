import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Standardmäßig Light Mode, es sei denn, es wurde ein Dark Mode in localStorage gespeichert
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('darkMode');
    // Wenn kein Theme gespeichert ist, setze Light Mode
    if (savedTheme === null) {
      localStorage.setItem('darkMode', 'false');
      return false;
    }
    return savedTheme === 'true';
  });

  useEffect(() => {
    // Füge Transition-Klassen zum Body hinzu
    document.body.classList.add('transition-colors', 'duration-200');
    
    // Setze Hintergrundfarbe basierend auf dem Theme
    if (isDarkMode) {
      document.body.classList.add('bg-gray-900');
      document.body.classList.remove('bg-white');
    } else {
      document.body.classList.add('bg-white');
      document.body.classList.remove('bg-gray-900');
    }

    // Cleanup-Funktion
    return () => {
      document.body.classList.remove('transition-colors', 'duration-200');
    };
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', newValue.toString());
      return newValue;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 