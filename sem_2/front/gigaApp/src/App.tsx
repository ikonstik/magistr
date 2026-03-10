import React from "react";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthForm } from "./components/auth/AuthForm";
import { SettingsPanel } from "./components/settings/SettingsPanel";
import type { ChatMessage, ChatSummary, ModelSettings, Theme } from "./types";

const createMockChats = (): ChatSummary[] => [
  { id: "1", title: "Общий чат с ассистентом", lastMessageAt: "10.03.2026" },
  { id: "2", title: "Домашнее задание по фронтенду", lastMessageAt: "09.03.2026" },
  { id: "3", title: "Идеи для pet-проекта", lastMessageAt: "08.03.2026" },
  { id: "4", title: "Вопросы по TypeScript", lastMessageAt: "07.03.2026" },
  { id: "5", title: "Подборка ресурсов по React", lastMessageAt: "06.03.2026" }
];

const createMockMessages = (): ChatMessage[] => [
  {
    id: "m1",
    chatId: "1",
    author: "User",
    variant: "user",
    content: "Привет! Можешь помочь с **итоговым заданием**?",
    createdAt: "10.03.2026 10:00"
  },
  {
    id: "m2",
    chatId: "1",
    author: "GigaChat",
    variant: "assistant",
    content:
      "Конечно! Вот, что нужно сделать:\n\n- сверстать layout\n- добавить компоненты чата\n- подключить `react-markdown`",
    createdAt: "10.03.2026 10:01"
  },
  {
    id: "m3",
    chatId: "1",
    author: "User",
    variant: "user",
    content: "Как лучше организовать **темизацию**?\n\n```css\n:root {\n  --color-bg: #fff;\n}\n```",
    createdAt: "10.03.2026 10:02"
  },
  {
    id: "m4",
    chatId: "1",
    author: "GigaChat",
    variant: "assistant",
    content:
      "Используй CSS-переменные и переключай `data-theme` на корневом элементе.\n\n1. Определи переменные для светлой темы.\n2. Добавь секцию для тёмной.\n3. Переключай атрибут из React.",
    createdAt: "10.03.2026 10:03"
  },
  {
    id: "m5",
    chatId: "1",
    author: "User",
    variant: "user",
    content: "Ок, спасибо! Тогда сделаю **layout** и все основные компоненты.",
    createdAt: "10.03.2026 10:04"
  },
  {
    id: "m6",
    chatId: "1",
    author: "GigaChat",
    variant: "assistant",
    content: "Отличный план! Не забудь про компонент ошибок и экран авторизации.",
    createdAt: "10.03.2026 10:05"
  }
];

const defaultSettings: ModelSettings = {
  model: "GigaChat",
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2048,
  systemPrompt: "You are a helpful GigaChat assistant.",
  theme: "light"
};

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [chats, setChats] = React.useState<ChatSummary[]>(createMockChats);
  const [messages, setMessages] = React.useState<ChatMessage[]>(createMockMessages);
  const [activeChatId, setActiveChatId] = React.useState<string | null>("1");
  const [isTyping, setIsTyping] = React.useState(false);
  const [settings, setSettings] = React.useState<ModelSettings>(defaultSettings);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const applyTheme = (theme: Theme) => {
    document.documentElement.setAttribute("data-theme", theme);
  };

  React.useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  const handleNewChat = () => {
    const id = String(chats.length + 1);
    const newChat: ChatSummary = {
      id,
      title: `Новый чат ${id}`,
      lastMessageAt: new Date().toLocaleDateString("ru-RU")
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(id);
  };

  const handleSendMessage = (text: string) => {
    if (!activeChatId) {
      return;
    }

    const now = new Date();
    const chatId = activeChatId;

    const userMessage: ChatMessage = {
      id: `u-${now.getTime()}`,
      chatId,
      author: "User",
      variant: "user",
      content: text,
      createdAt: now.toLocaleString("ru-RU")
    };

    setMessages((prev) => [...prev, userMessage]);
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, lastMessageAt: now.toLocaleDateString("ru-RU") }
          : chat
      )
    );

    setIsTyping(true);

    window.setTimeout(() => {
      const replyTime = new Date();
      const assistantMessage: ChatMessage = {
        id: `a-${replyTime.getTime()}`,
        chatId,
        author: "GigaChat",
        variant: "assistant",
        content:
          "Это моковый ответ ассистента.\n\n" +
          "Вы написали:\n\n" +
          text,
        createdAt: replyTime.toLocaleString("ru-RU")
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1200);
  };

  if (!isAuthenticated) {
    return <AuthForm onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      <AppLayout
        chats={chats}
        activeChatId={activeChatId}
        messages={messages}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        onSendMessage={handleSendMessage}
        onOpenSettings={() => setIsSettingsOpen(true)}
        settings={settings}
        isTyping={isTyping}
      />
      <SettingsPanel
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onChange={setSettings}
        onReset={() => setSettings(defaultSettings)}
      />
    </>
  );
};

