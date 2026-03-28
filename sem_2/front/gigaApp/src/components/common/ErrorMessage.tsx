import React from "react";
import styles from "./ErrorMessage.module.css";

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className={styles.root} role="alert">
      <span className={styles.icon}>⚠</span>
      <span>{message}</span>
    </div>
  );
};
