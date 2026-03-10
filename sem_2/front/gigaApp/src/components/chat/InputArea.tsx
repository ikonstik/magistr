import React from "react";

interface InputAreaProps {
  disabled?: boolean;
  isGenerating: boolean;
  onSend: (value: string) => void;
}

export const InputArea: React.FC<InputAreaProps> = ({
  disabled,
  isGenerating,
  onSend
}) => {
  const [value, setValue] = React.useState("");

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        handleSend();
      }
    }
  };

  const rows = Math.min(5, Math.max(1, value.split("\n").length));

  return (
    <div className="input-area">
      <button
        type="button"
        className="icon-button input-area__attach"
        aria-label="Прикрепить изображение"
        disabled={disabled}
      >
        📎
      </button>
      <textarea
        className="input-area__textarea"
        placeholder="Введите сообщение..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={rows}
        disabled={disabled}
      />
      <div className="input-area__actions">
        <button
          type="button"
          className="btn"
          disabled={disabled || !isGenerating}
        >
          Стоп
        </button>
        <button
          type="button"
          className="btn btn--primary"
          disabled={disabled || !value.trim()}
          onClick={handleSend}
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

