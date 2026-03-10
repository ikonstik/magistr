import React from "react";
import type { ChatSummary } from "../../types";

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
    <div className="sidebar">
      <div className="sidebar__header">
        <button className="btn btn--primary sidebar__new-chat" onClick={onNewChat}>
          <span className="sidebar__new-chat-icon">+</span>
          <span>Новый чат</span>
        </button>
      </div>

      <div className="sidebar__search">
        <input
          type="search"
          className="input"
          placeholder="Поиск по чатам"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <ul className="sidebar__chat-list">
        {filteredChats.map((chat) => (
          <li
            key={chat.id}
            className={`chat-item ${
              chat.id === activeChatId ? "chat-item--active" : ""
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="chat-item__main">
              <div className="chat-item__title" title={chat.title}>
                {chat.title}
              </div>
              <div className="chat-item__date">{chat.lastMessageAt}</div>
            </div>
            <div className="chat-item__actions">
              <button
                className="icon-button"
                type="button"
                aria-label="Редактировать чат"
                onClick={(e) => e.stopPropagation()}
              >
                ✏️
              </button>
              <button
                className="icon-button icon-button--danger"
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

