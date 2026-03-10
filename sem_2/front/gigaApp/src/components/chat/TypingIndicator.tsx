import React from "react";

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
    <div className="typing-indicator">
      <div className="typing-indicator__dot" />
      <div className="typing-indicator__dot" />
      <div className="typing-indicator__dot" />
    </div>
  );
};

