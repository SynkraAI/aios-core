'use client';

import { useState, useEffect, useCallback } from 'react';

const THEME_GROUPS = [
  {
    label: 'Dark & Techy',
    themes: ['cyberpunk', 'neon', 'phosphor'],
  },
  {
    label: 'Warm',
    themes: ['gold', 'ember', 'crimson'],
  },
  {
    label: 'Cool',
    themes: ['violet', 'mint', 'vapor'],
  },
  {
    label: 'Nature',
    themes: ['fantasy', 'sakura', 'sand'],
  },
  {
    label: 'Light',
    themes: ['paper', 'cozy'],
  },
];

const STORAGE_KEY = 'tdah-radar-theme';
const DEFAULT_THEME = 'cyberpunk';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState(DEFAULT_THEME);

  const applyTheme = useCallback((name: string) => {
    const linkId = 'theme-stylesheet';
    let link = document.getElementById(linkId) as HTMLLinkElement | null;

    if (name === DEFAULT_THEME) {
      // Default theme is already in globals.css — remove override
      link?.remove();
    } else {
      if (!link) {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      link.href = `/themes/${name}.css`;
    }

    document.documentElement.setAttribute('data-theme', name);
  }, []);

  // Restore theme on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
    setTheme(saved);
    applyTheme(saved);
  }, [applyTheme]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setTheme(name);
    localStorage.setItem(STORAGE_KEY, name);
    applyTheme(name);
  };

  return (
    <select
      value={theme}
      onChange={handleChange}
      aria-label="Selecionar tema"
      style={{
        appearance: 'none',
        background: `var(--bg-card) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2364748b'/%3E%3C/svg%3E") no-repeat right 8px center`,
        color: 'var(--text-accent)',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        padding: '4px 24px 4px 8px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        cursor: 'pointer',
        outline: 'none',
        transition: 'border-color 0.2s',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-primary)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      {THEME_GROUPS.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.themes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
