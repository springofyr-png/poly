import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ThemePreset, UserSettings } from '../types';

const DEFAULT_SETTINGS: UserSettings = {
  milkyH: 30,
  milkyS: 30,
  accentH: 25,
  accentS: 60,
  aiIcon: 'Brain',
  fontSize: 'medium',
  languages: ['en', 'fr'],
};

export const THEME_PRESETS: ThemePreset[] = [
  { name: 'Warm Cream', nameKo: '웜 크림', milkyH: 30, milkyS: 30, accentH: 25, accentS: 60 },
  { name: 'Cool Cream', nameKo: '쿨 크림', milkyH: 210, milkyS: 20, accentH: 200, accentS: 45 },
  { name: 'Rose Cream', nameKo: '로즈 크림', milkyH: 350, milkyS: 25, accentH: 340, accentS: 50 },
  { name: 'Sage Cream', nameKo: '세이지 크림', milkyH: 140, milkyS: 18, accentH: 150, accentS: 40 },
  { name: 'Sand Cream', nameKo: '샌드 크림', milkyH: 38, milkyS: 35, accentH: 30, accentS: 55 },
  { name: 'Lavender Cream', nameKo: '라벤더 크림', milkyH: 270, milkyS: 20, accentH: 260, accentS: 45 },
];

export const AI_ICONS = ['Brain', 'BookOpen', 'GraduationCap', 'Sparkles', 'Bot', 'MessageCircle', 'Languages', 'Mic'];

interface ThemeContextType {
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  applyPreset: (preset: ThemePreset) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('poly-settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch { /* ignore */ }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--milky-h', String(settings.milkyH));
    root.style.setProperty('--milky-s', `${settings.milkyS}%`);
    root.style.setProperty('--accent-h', String(settings.accentH));
    root.style.setProperty('--accent-s', `${settings.accentS}%`);

    const bg = getComputedStyle(root).getPropertyValue('background-color');
    root.style.setProperty('--app-bg', bg || `hsl(${settings.milkyH}, ${settings.milkyS}%, 97%)`);

    try {
      localStorage.setItem('poly-settings', JSON.stringify(settings));
    } catch { /* ignore */ }
  }, [settings]);

  const updateSettings = (partial: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const applyPreset = (preset: ThemePreset) => {
    setSettings(prev => ({
      ...prev,
      milkyH: preset.milkyH,
      milkyS: preset.milkyS,
      accentH: preset.accentH,
      accentS: preset.accentS,
    }));
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, applyPreset }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
