import React from "react";
import { Sidebar } from "../sidebar/Sidebar";
import { ChatWindow } from "../chat/ChatWindow";
import type { ChatSummary, ModelSettings } from "../../types";
import styles from "./AppLayout.module.css";

interface AppLayoutProps {
  chats: ChatSummary[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  settings: ModelSettings;
  onChatLastMessage?: (chatId: string, dateLabel: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onOpenSettings,
  settings,
  onChatLastMessage
}) => {
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = React.useState(false);

  const handleSelectChat = (id: string) => {
    onSelectChat(id);
    setIsSidebarOpenMobile(false);
  };

  const activeChat = chats.find((c) => c.id === activeChatId) ?? chats[0] ?? null;

  return (
    <div className={styles.layout}>
      <aside
        className={`${styles.sidebarContainer} ${
          isSidebarOpenMobile ? styles.sidebarContainerOpen : ""
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
          className={styles.sidebarBackdrop}
          onClick={() => setIsSidebarOpenMobile(false)}
        />
      )}

      <main className={styles.chatContainer}>
        <ChatWindow
          chat={activeChat}
          onOpenSettings={onOpenSettings}
          onOpenSidebarMobile={() => setIsSidebarOpenMobile(true)}
          settings={settings}
          onChatLastMessage={onChatLastMessage}
        />
      </main>
    </div>
  );
};
