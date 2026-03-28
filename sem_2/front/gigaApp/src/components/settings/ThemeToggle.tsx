import React from "react";
import type { Theme } from "../../types";
import styles from "./ThemeToggle.module.css";

interface ThemeToggleProps {
  theme: Theme;
  onChange: (theme: Theme) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onChange }) => {
  const isDark = theme === "dark";

  return (
    <div className={styles.row}>
      <span className={styles.label} id="theme-toggle-label">
        Тема интерфейса
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-labelledby="theme-toggle-label"
        className={`${styles.track} ${isDark ? styles.trackOn : ""}`}
        onClick={() => onChange(isDark ? "light" : "dark")}
      >
        <span className={`${styles.thumb} ${isDark ? styles.thumbOn : ""}`} />
      </button>
      <span className={styles.hint}>{isDark ? "Тёмная" : "Светлая"}</span>
    </div>
  );
};
