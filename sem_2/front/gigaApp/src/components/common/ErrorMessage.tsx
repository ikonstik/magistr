import React from "react";

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="error-message" role="alert">
      <span className="error-message__icon">⚠</span>
      <span className="error-message__text">{message}</span>
    </div>
  );
};

