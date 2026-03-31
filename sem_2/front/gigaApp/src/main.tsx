import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { ChatStoreProvider } from "./store/chatStore";
import "./styles/theme.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChatStoreProvider>
        <App />
      </ChatStoreProvider>
    </BrowserRouter>
  </React.StrictMode>
);
