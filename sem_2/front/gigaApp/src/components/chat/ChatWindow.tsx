import React from "react";
import type { ChatMessage, ChatSummary, ModelSettings } from "../../types";
import shared from "../../styles/shared.module.css";
import styles from "./ChatWindow.module.css";
import { MessageList } from "./MessageList";
import { InputArea } from "./InputArea";
import { EmptyState } from "../common/EmptyState";

const createInitialMessagesByChat = (): Record<string, ChatMessage[]> => ({
  "1": [
    {
      id: "m1",
      role: "user",
      content: "Привет! Можешь помочь с **итоговым заданием**?",
      timestamp: "10.03.2026 10:00"
    },
    {
      id: "m2",
      role: "assistant",
      content:
        "Конечно! Вот, что нужно сделать:\n\n- сверстать layout\n- добавить компоненты чата\n- подключить `react-markdown`",
      timestamp: "10.03.2026 10:01"
    },
    {
      id: "m3",
      role: "user",
      content:
        "Как лучше организовать **темизацию**?\n\n```css\n:root {\n  --color-bg: #fff;\n}\n```",
      timestamp: "10.03.2026 10:02"
    },
    {
      id: "m4",
      role: "assistant",
      content:
        "Используй CSS-переменные и переключай `data-theme` на корневом элементе.\n\n1. Определи переменные для светлой темы.\n2. Добавь секцию для тёмной.\n3. Переключай атрибут из React.",
      timestamp: "10.03.2026 10:03"
    },
    {
      id: "m5",
      role: "user",
      content: "Ок, спасибо! Тогда сделаю **layout** и все основные компоненты.",
      timestamp: "10.03.2026 10:04"
    },
    {
      id: "m6",
      role: "assistant",
      content:
        "Отличный план! Не забудь про компонент ошибок и экран авторизации.",
      timestamp: "10.03.2026 10:05"
    }
  ],
  "2": [],
  "3": [],
  "4": [],
  "5": []
});

interface ChatWindowProps {
  chat: ChatSummary | null;
  onOpenSettings: () => void;
  onOpenSidebarMobile: () => void;
  settings: ModelSettings;
  onChatLastMessage?: (chatId: string, dateLabel: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  onOpenSettings,
  onOpenSidebarMobile,
  settings,
  onChatLastMessage
}) => {
  const [messagesByChat, setMessagesByChat] = React.useState<
    Record<string, ChatMessage[]>
  >(createInitialMessagesByChat);
  const [isLoading, setIsLoading] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);

  const chatId = chat?.id ?? null;
  const messages = chatId ? messagesByChat[chatId] ?? [] : [];

  React.useEffect(() => {
    if (!chatId) return;
    setMessagesByChat((prev) => {
      if (prev[chatId] !== undefined) return prev;
      return { ...prev, [chatId]: [] };
    });
  }, [chatId]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSend = (text: string) => {
    if (!chatId || isLoading) return;

    const now = new Date();
    const userMessage: ChatMessage = {
      id: `u-${now.getTime()}`,
      role: "user",
      content: text,
      timestamp: now.toLocaleString("ru-RU")
    };

    setMessagesByChat((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] ?? []), userMessage]
    }));
    onChatLastMessage?.(chatId, now.toLocaleDateString("ru-RU"));

    setIsLoading(true);

    const delayMs = 1000 + Math.floor(Math.random() * 1000);
    timeoutRef.current = window.setTimeout(() => {
      const replyTime = new Date();
      const assistantMessage: ChatMessage = {
        id: `a-${replyTime.getTime()}`,
        role: "assistant",
        content:
          "Это моковый ответ ассистента.\n\n" +
          "Вы написали:\n\n" +
          text,
        timestamp: replyTime.toLocaleString("ru-RU")
      };

      setMessagesByChat((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] ?? []), assistantMessage]
      }));
      onChatLastMessage?.(chatId, replyTime.toLocaleDateString("ru-RU"));
      setIsLoading(false);
      timeoutRef.current = null;
    }, delayMs);
  };

  const handleStopGeneration = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsLoading(false);
  };

  return (
    <div className={styles.window}>
      <header className={styles.header}>
        <button
          className={`${shared.iconButton} ${styles.burger}`}
          type="button"
          aria-label="Открыть список чатов"
          onClick={onOpenSidebarMobile}
        >
          ☰
        </button>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>
            {chat ? chat.title : "Выберите чат"}
          </h1>
          <span className={styles.model}>{settings.model}</span>
        </div>
        <button
          className={shared.iconButton}
          type="button"
          aria-label="Открыть настройки"
          onClick={onOpenSettings}
        >
          ⚙
        </button>
      </header>

      <section className={styles.messages}>
        {chat ? (
          <MessageList messages={messages} isLoading={isLoading} />
        ) : (
          <EmptyState />
        )}
      </section>

      <footer className={styles.inputFooter}>
        <InputArea
          disabled={!chat}
          isLoading={isLoading}
          onSend={handleSend}
          onStop={handleStopGeneration}
        />
      </footer>
    </div>
  );
};
