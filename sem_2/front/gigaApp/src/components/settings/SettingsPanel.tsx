import React from "react";
import type { ModelSettings } from "../../types";
import shared from "../../styles/shared.module.css";
import styles from "./SettingsPanel.module.css";
import { ThemeToggle } from "./ThemeToggle";

interface SettingsPanelProps {
  isOpen: boolean;
  settings: ModelSettings;
  onClose: () => void;
  onChange: (settings: ModelSettings) => void;
  onReset: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  settings,
  onClose,
  onChange,
  onReset
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.panel}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <header className={styles.header}>
          <h2>Настройки</h2>
          <button className={shared.iconButton} type="button" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className={styles.body}>
          <label className={shared.field}>
            <span className={shared.fieldLabel}>Модель</span>
            <select
              className={`${shared.input} ${styles.controlInput}`}
              value={settings.model}
              onChange={(e) =>
                onChange({
                  ...settings,
                  model: e.target.value as ModelSettings["model"]
                })
              }
            >
              <option value="GigaChat">GigaChat</option>
              <option value="GigaChat-Plus">GigaChat-Plus</option>
              <option value="GigaChat-Pro">GigaChat-Pro</option>
              <option value="GigaChat-Max">GigaChat-Max</option>
            </select>
          </label>

          <label className={shared.field}>
            <span className={shared.fieldLabel}>
              Temperature: {settings.temperature.toFixed(2)}
            </span>
            <input
              type="range"
              min={0}
              max={2}
              step={0.01}
              value={settings.temperature}
              onChange={(e) =>
                onChange({ ...settings, temperature: Number(e.target.value) })
              }
            />
          </label>

          <label className={shared.field}>
            <span className={shared.fieldLabel}>
              Top-P: {settings.topP.toFixed(2)}
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={settings.topP}
              onChange={(e) =>
                onChange({ ...settings, topP: Number(e.target.value) })
              }
            />
          </label>

          <label className={shared.field}>
            <span className={shared.fieldLabel}>Max Tokens</span>
            <input
              type="number"
              className={`${shared.input} ${styles.controlInput}`}
              value={settings.maxTokens}
              onChange={(e) =>
                onChange({
                  ...settings,
                  maxTokens: Number(e.target.value) || 0
                })
              }
            />
          </label>

          <label className={shared.field}>
            <span className={shared.fieldLabel}>System Prompt</span>
            <textarea
              className={`${shared.input} ${styles.controlInput} ${styles.systemPrompt}`}
              value={settings.systemPrompt}
              onChange={(e) =>
                onChange({
                  ...settings,
                  systemPrompt: e.target.value
                })
              }
            />
          </label>

          <div className={`${shared.field} ${styles.themeField}`}>
            <ThemeToggle
              theme={settings.theme}
              onChange={(theme) => onChange({ ...settings, theme })}
            />
          </div>
        </div>

        <footer className={styles.footer}>
          <button type="button" className={shared.btn} onClick={onReset}>
            Сбросить
          </button>
          <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={onClose}>
            Сохранить
          </button>
        </footer>
      </div>
    </div>
  );
};
