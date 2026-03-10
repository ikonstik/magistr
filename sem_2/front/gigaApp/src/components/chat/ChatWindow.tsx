import React from "react";
import type { ChatMessage, ChatSummary, ModelSettings } from "../../types";
import { MessageList } from "./MessageList";
import { InputArea } from "./InputArea";
import { TypingIndicator } from "./TypingIndicator";
import { EmptyState } from "../common/EmptyState";

interface ChatWindowProps {
  chat: ChatSummary | null;
  messages: ChatMessage[];
  onOpenSettings: () => void;
  isTyping: boolean;
  onOpenSidebarMobile: () => void;
  settings: ModelSettings;
  onSendMessage: (text: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  messages,
  onOpenSettings,
  isTyping,
  onOpenSidebarMobile,
  settings,
  onSendMessage
}) => {
  return (
    <div className="chat-window">
      <header className="chat-window__header">
        <button
          className="icon-button chat-window__burger"
          type="button"
          aria-label="Открыть список чатов"
          onClick={onOpenSidebarMobile}
        >
          ☰
        </button>
        <div className="chat-window__title-block">
          <h1 className="chat-window__title">
            {chat ? chat.title : "Выберите чат"}
          </h1>
          <span className="chat-window__model">{settings.model}</span>
        </div>
        <button
          className="icon-button"
          type="button"
          aria-label="Открыть настройки"
          onClick={onOpenSettings}
        >
          ⚙
        </button>
      </header>

      <section className="chat-window__messages">
        {chat ? (
          <>
            <MessageList messages={messages} />
            <TypingIndicator isVisible={isTyping} />
          </>
        ) : (
          <EmptyState />
        )}
      </section>

      <footer className="chat-window__input">
        <InputArea
          disabled={!chat}
          isGenerating={isTyping}
          onSend={onSendMessage}
        />
      </footer>
    </div>
  );
};

