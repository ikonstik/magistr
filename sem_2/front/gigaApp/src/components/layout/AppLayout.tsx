import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../sidebar/Sidebar";
import { ChatWindow } from "../chat/ChatWindow";
import { SettingsPanel } from "../settings/SettingsPanel";
import { useChatStore } from "../../store/chatStore";
import styles from "./AppLayout.module.css";

export const AppLayout: React.FC = () => {
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, selectChat, updateSettings } = useChatStore();

  React.useEffect(() => {
    if (!id) {
      return;
    }
    if (state.chats.some((chat) => chat.id === id)) {
      selectChat(id);
      return;
    }
    navigate("/", { replace: true });
  }, [id, state.chats, selectChat, navigate]);

  React.useEffect(() => {
    if (!state.activeChatId && state.chats.length > 0) {
      selectChat(state.chats[0].id);
    }
  }, [state.activeChatId, state.chats, selectChat]);

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
    navigate(`/chat/${chatId}`);
    setIsSidebarOpenMobile(false);
  };

  return (
    <>
      <div className={styles.layout}>
        <aside
          className={`${styles.sidebarContainer} ${
            isSidebarOpenMobile ? styles.sidebarContainerOpen : ""
          }`}
        >
          <Sidebar onSelectChat={handleSelectChat} />
        </aside>

        {isSidebarOpenMobile && (
          <div
            className={styles.sidebarBackdrop}
            onClick={() => setIsSidebarOpenMobile(false)}
          />
        )}

        <main className={styles.chatContainer}>
          <ChatWindow
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenSidebarMobile={() => setIsSidebarOpenMobile(true)}
          />
        </main>
      </div>

      <SettingsPanel
        isOpen={isSettingsOpen}
        settings={state.settings}
        onClose={() => setIsSettingsOpen(false)}
        onChange={updateSettings}
        onReset={() =>
          updateSettings({
            model: "GigaChat",
            temperature: 0.7,
            topP: 0.9,
            maxTokens: 2048,
            systemPrompt: "You are a helpful GigaChat assistant.",
            theme: "light"
          })
        }
      />
    </>
  );
};
