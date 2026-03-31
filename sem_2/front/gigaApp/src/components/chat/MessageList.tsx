import React from "react";
import type { Message } from "../../types";
import { Message } from "./Message";
import { TypingIndicator } from "./TypingIndicator";
import styles from "./MessageList.module.css";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading
}) => {
  const endRef = React.useRef<HTMLDivElement | null>(null);

  const lastIsUser =
    messages.length > 0 &&
    messages[messages.length - 1].role === "user";

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className={styles.list}>
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      {isLoading && (
        <div
          className={`${styles.typingWrap} ${
            lastIsUser ? styles.typingWrapAfterUser : ""
          }`}
        >
          <TypingIndicator />
        </div>
      )}
      <div ref={endRef} className={styles.endAnchor} aria-hidden="true" />
    </div>
  );
};
