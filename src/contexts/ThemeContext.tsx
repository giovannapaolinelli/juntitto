import React, { createContext, useContext, useState } from 'react';

interface Theme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  isPremium: boolean;
}

interface ThemeContextType {
  themes: Theme[];
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
}

const defaultThemes: Theme[] = [
  {
    id: 'romantic',
    name: 'Romântico',
    primaryColor: '#ec4899',
    secondaryColor: '#8b5cf6',
    backgroundColor: '#fdf2f8',
    textColor: '#1f2937',
    isPremium: false
  },
  {
    id: 'elegant',
    name: 'Elegante',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    backgroundColor: '#f8fafc',
    textColor: '#1e293b',
    isPremium: false
  },
  {
    id: 'vintage',
    name: 'Vintage',
    primaryColor: '#d97706',
    secondaryColor: '#92400e',
    backgroundColor: '#fefbf3',
    textColor: '#78350f',
    isPremium: false
  },
  {
    id: 'modern',
    name: 'Moderno',
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    backgroundColor: '#f0fdfa',
    textColor: '#064e3b',
    isPremium: true
  },
  {
    id: 'luxury',
    name: 'Luxo',
    primaryColor: '#7c3aed',
    secondaryColor: '#1e1b4b',
    backgroundColor: '#faf5ff',
    textColor: '#581c87',
    isPremium: true
  }
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultThemes[0]);

  const setTheme = (theme: Theme) => {
    setCurrentTheme(theme);
  };

  const value = {
    themes: defaultThemes,
    currentTheme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};