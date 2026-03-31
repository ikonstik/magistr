import React from "react";
import ReactMarkdown from "react-markdown";
import type { Message as ChatMessage } from "../../types";
import shared from "../../styles/shared.module.css";
import styles from "./Message.module.css";

interface MessageProps {
  message: ChatMessage;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const [copied, setCopied] = React.useState(false);
  const copyTimeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const isUser = message.role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopied(false);
        copyTimeoutRef.current = null;
      }, 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  if (isUser) {
    return (
      <div
        className={`${styles.message} ${styles.user} ${styles.alignRight}`}
      >
        <div className={styles.body}>
          <div className={styles.header}>
            <span className={styles.author}>Вы</span>
          </div>
          <div className={`${styles.content} ${styles.markdownBody}`}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.message} ${styles.assistant} ${styles.alignLeft}`}
    >
      <div className={styles.avatar} aria-hidden="true">
        G
      </div>
      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.author}>GigaChat</span>
          <button
            type="button"
            className={`${shared.iconButton} ${styles.copyBtn} ${
              copied ? styles.copyBtnVisible : ""
            }`}
            onClick={handleCopy}
            aria-label={copied ? "Скопировано" : "Копировать"}
          >
            <span className={styles.copyLabel}>
              {copied ? "Скопировано" : "Копировать"}
            </span>
          </button>
        </div>
        <div className={`${styles.content} ${styles.markdownBody}`}>
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
