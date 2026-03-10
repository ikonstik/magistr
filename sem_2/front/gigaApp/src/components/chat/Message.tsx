import React from "react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "../../types";

interface MessageProps {
  message: ChatMessage;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
    } catch {
      // ignore clipboard errors for now
    }
  };

  const isUser = message.variant === "user";

  return (
    <div
      className={`message message--${message.variant} ${
        isUser ? "message--align-right" : "message--align-left"
      }`}
    >
      {!isUser && (
        <div className="message__avatar" aria-hidden="true">
          G
        </div>
      )}
      <div className="message__body">
        <div className="message__header">
          <span className="message__author">
            {isUser ? "Вы" : message.author || "GigaChat"}
          </span>
          <button
            type="button"
            className="icon-button message__copy"
            onClick={handleCopy}
          >
            ⧉
          </button>
        </div>
        <div className="message__content markdown-body">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

