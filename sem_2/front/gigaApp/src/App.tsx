import React from "react";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthForm } from "./components/auth/AuthForm";
import { SettingsPanel } from "./components/settings/SettingsPanel";
import type { ChatSummary, ModelSettings, Theme } from "./types";

const createMockChats = (): ChatSummary[] => [
  { id: "1", title: "Общий чат с ассистентом", lastMessageAt: "10.03.2026" },
  { id: "2", title: "Домашнее задание по фронтенду", lastMessageAt: "09.03.2026" },
  { id: "3", title: "Идеи для pet-проекта", lastMessageAt: "08.03.2026" },
  { id: "4", title: "Вопросы по TypeScript", lastMessageAt: "07.03.2026" },
  { id: "5", title: "Подборка ресурсов по React", lastMessageAt: "06.03.2026" }
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
  const [activeChatId, setActiveChatId] = React.useState<string | null>("1");
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

  const handleChatLastMessage = (chatId: string, dateLabel: string) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, lastMessageAt: dateLabel } : c
      )
    );
  };

  if (!isAuthenticated) {
    return <AuthForm onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      <AppLayout
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        settings={settings}
        onChatLastMessage={handleChatLastMessage}
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
