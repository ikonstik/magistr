import React from "react";
import styles from "./TypingIndicator.module.css";

interface TypingIndicatorProps {
  isVisible?: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isVisible = true
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.root}>
      <div className={styles.dot} />
      <div className={styles.dot} />
      <div className={styles.dot} />
    </div>
  );
};
