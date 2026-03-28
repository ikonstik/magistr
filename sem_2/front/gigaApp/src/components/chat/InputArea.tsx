import React from "react";
import shared from "../../styles/shared.module.css";
import styles from "./InputArea.module.css";

interface InputAreaProps {
  disabled?: boolean;
  isLoading: boolean;
  onSend: (value: string) => void;
  onStop: () => void;
}

export const InputArea: React.FC<InputAreaProps> = ({
  disabled,
  isLoading,
  onSend,
  onStop
}) => {
  const [value, setValue] = React.useState("");

  const trimmed = value.trim();
  const inputLocked = Boolean(disabled || isLoading);
  const canSend = Boolean(trimmed && !disabled && !isLoading);

  const handleSend = () => {
    if (!canSend) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        handleSend();
      }
    }
  };

  const rows = Math.min(5, Math.max(1, value.split("\n").length));

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={`${shared.iconButton} ${styles.attach}`}
        aria-label="Прикрепить изображение"
        disabled={disabled}
      >
        📎
      </button>
      <textarea
        className={styles.textarea}
        placeholder="Введите сообщение..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={rows}
        disabled={inputLocked}
        aria-busy={isLoading}
      />
      <div className={styles.actions}>
        {isLoading ? (
          <button
            type="button"
            className={`${shared.btn} ${styles.primaryAction}`}
            disabled={disabled}
            onClick={onStop}
          >
            Стоп
          </button>
        ) : (
          <button
            type="button"
            className={`${shared.btn} ${shared.btnPrimary} ${styles.primaryAction}`}
            disabled={disabled || !trimmed}
            onClick={handleSend}
          >
            Отправить
          </button>
        )}
      </div>
    </div>
  );
};
