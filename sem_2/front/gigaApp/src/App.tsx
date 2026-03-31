import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthForm } from "./components/auth/AuthForm";
import { useChatStore } from "./store/chatStore";

export const App: React.FC = () => {
  const { state } = useChatStore();

  if (!state.isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <Routes>
      <Route path="/" element={<AppLayout />} />
      <Route path="/chat/:id" element={<AppLayout />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
