import React from "react";
import type { ChatSummary } from "../../types";
import shared from "../../styles/shared.module.css";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  chats: ChatSummary[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat
}) => {
  const [query, setQuery] = React.useState("");

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <button
          type="button"
          className={`${shared.btn} ${shared.btnPrimary} ${styles.newChat}`}
          onClick={onNewChat}
        >
          <span className={styles.newChatIcon}>+</span>
          <span>Новый чат</span>
        </button>
      </div>

      <div className={styles.search}>
        <input
          type="search"
          className={`${shared.input} ${styles.searchField}`}
          placeholder="Поиск по чатам"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <ul className={styles.chatList}>
        {filteredChats.map((chat) => (
          <li
            key={chat.id}
            className={`${styles.chatItem} ${
              chat.id === activeChatId ? styles.chatItemActive : ""
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className={styles.chatItemMain}>
              <div className={styles.chatItemTitle} title={chat.title}>
                {chat.title}
              </div>
              <div className={styles.chatItemDate}>{chat.lastMessageAt}</div>
            </div>
            <div className={styles.chatItemActions}>
              <button
                className={shared.iconButton}
                type="button"
                aria-label="Редактировать чат"
                onClick={(e) => e.stopPropagation()}
              >
                ✏️
              </button>
              <button
                className={`${shared.iconButton} ${shared.iconButtonDanger}`}
                type="button"
                aria-label="Удалить чат"
                onClick={(e) => e.stopPropagation()}
              >
                🗑
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
