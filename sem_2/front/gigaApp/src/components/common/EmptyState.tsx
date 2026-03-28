import React from "react";
import styles from "./EmptyState.module.css";

export const EmptyState: React.FC = () => {
  return (
    <div className={styles.root}>
      <div className={styles.icon}>💬</div>
      <div className={styles.text}>Начните новый диалог.</div>
    </div>
  );
};
