import React from "react";
import { Sidebar } from "../sidebar/Sidebar";
import { ChatWindow } from "../chat/ChatWindow";
import type { ChatMessage, ChatSummary, ModelSettings } from "../../types";

interface AppLayoutProps {
  chats: ChatSummary[];
  activeChatId: string | null;
  messages: ChatMessage[];
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onSendMessage: (text: string) => void;
  onOpenSettings: () => void;
  settings: ModelSettings;
  isTyping: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  chats,
  activeChatId,
  messages,
  onSelectChat,
  onNewChat,
  onSendMessage,
  onOpenSettings,
  settings,
  isTyping
}) => {
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = React.useState(false);

  const handleSelectChat = (id: string) => {
    onSelectChat(id);
    setIsSidebarOpenMobile(false);
  };

  const activeChat = chats.find((c) => c.id === activeChatId) ?? chats[0] ?? null;

  return (
    <div className="app-layout">
      <aside
        className={`sidebar-container ${
          isSidebarOpenMobile ? "sidebar-container--mobile-open" : ""
        }`}
      >
        <Sidebar
          chats={chats}
          activeChatId={activeChat?.id ?? null}
          onSelectChat={handleSelectChat}
          onNewChat={onNewChat}
        />
      </aside>

      {isSidebarOpenMobile && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsSidebarOpenMobile(false)}
        />
      )}

      <main className="chat-container">
        <ChatWindow
          chat={activeChat}
          messages={messages.filter((m) => m.chatId === activeChat?.id)}
          onOpenSettings={onOpenSettings}
          isTyping={isTyping}
          onOpenSidebarMobile={() => setIsSidebarOpenMobile(true)}
          settings={settings}
          onSendMessage={onSendMessage}
        />
      </main>
    </div>
  );
};

