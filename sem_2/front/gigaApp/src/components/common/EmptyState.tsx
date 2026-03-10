import React from "react";

export const EmptyState: React.FC = () => {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">💬</div>
      <div className="empty-state__text">Начните новый диалог.</div>
    </div>
  );
};

