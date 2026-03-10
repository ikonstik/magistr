import React from "react";
import type { ModelSettings, Theme } from "../../types";

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
  const handleThemeToggle = (theme: Theme) => {
    onChange({ ...settings, theme });
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div
        className="settings-panel"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <header className="settings-panel__header">
          <h2>Настройки</h2>
          <button className="icon-button" type="button" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="settings-panel__body">
          <label className="field">
            <span className="field__label">Модель</span>
            <select
              className="input"
              value={settings.model}
              onChange={(e) =>
                onChange({ ...settings, model: e.target.value as ModelSettings["model"] })
              }
            >
              <option value="GigaChat">GigaChat</option>
              <option value="GigaChat-Plus">GigaChat-Plus</option>
              <option value="GigaChat-Pro">GigaChat-Pro</option>
              <option value="GigaChat-Max">GigaChat-Max</option>
            </select>
          </label>

          <label className="field">
            <span className="field__label">
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

          <label className="field">
            <span className="field__label">Top-P: {settings.topP.toFixed(2)}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={settings.topP}
              onChange={(e) => onChange({ ...settings, topP: Number(e.target.value) })}
            />
          </label>

          <label className="field">
            <span className="field__label">Max Tokens</span>
            <input
              type="number"
              className="input"
              value={settings.maxTokens}
              onChange={(e) =>
                onChange({
                  ...settings,
                  maxTokens: Number(e.target.value) || 0
                })
              }
            />
          </label>

          <label className="field">
            <span className="field__label">System Prompt</span>
            <textarea
              className="input settings-panel__system-prompt"
              value={settings.systemPrompt}
              onChange={(e) =>
                onChange({
                  ...settings,
                  systemPrompt: e.target.value
                })
              }
            />
          </label>

          <div className="field">
            <span className="field__label">Тема</span>
            <div className="theme-toggle">
              <button
                type="button"
                className={`btn theme-toggle__btn ${
                  settings.theme === "light" ? "theme-toggle__btn--active" : ""
                }`}
                onClick={() => handleThemeToggle("light")}
              >
                Светлая
              </button>
              <button
                type="button"
                className={`btn theme-toggle__btn ${
                  settings.theme === "dark" ? "theme-toggle__btn--active" : ""
                }`}
                onClick={() => handleThemeToggle("dark")}
              >
                Тёмная
              </button>
            </div>
          </div>
        </div>

        <footer className="settings-panel__footer">
          <button type="button" className="btn" onClick={onReset}>
            Сбросить
          </button>
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Сохранить
          </button>
        </footer>
      </div>
    </div>
  );
};

