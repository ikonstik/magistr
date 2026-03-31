export type ChatScope = "GIGACHAT_API_PERS" | "GIGACHAT_API_B2B" | "GIGACHAT_API_CORP";

export type Theme = "light" | "dark";

export type MessageRole = "system" | "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModelSettings {
  model: "GigaChat" | "GigaChat-Plus" | "GigaChat-Pro" | "GigaChat-Max";
  temperature: number;
  topP: number;
  maxTokens: number;
  systemPrompt: string;
  theme: Theme;
}

// types.ts
export interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  messagesByChat: Record<string, Message[]>;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  accessToken: string | null; // Добавляем
  credentials: string;
  scope: ChatScope;
  settings: ModelSettings;
}

// Добавляем новый тип действия
export type ChatAction =
  | { type: "REPLACE_STATE"; payload: ChatState }
  | { type: "SET_ACTIVE_CHAT"; payload: string | null }
  | { type: "CREATE_CHAT"; payload: Chat }
  | { type: "UPDATE_CHAT_TITLE"; payload: { chatId: string; title: string } }
  | { type: "DELETE_CHAT"; payload: { chatId: string; nextActiveChatId: string | null } }
  | { type: "SET_MESSAGES"; payload: { chatId: string; messages: Message[] } }
  | { type: "APPEND_MESSAGE"; payload: { chatId: string; message: Message } }
  | { type: "UPDATE_LAST_ASSISTANT_MESSAGE"; payload: { chatId: string; content: string } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_AUTH"; payload: { credentials: string; scope: ChatScope; accessToken: string } }
  | { type: "SET_ACCESS_TOKEN"; payload: string } // Новый тип
  | { type: "LOGOUT" }
  | { type: "UPDATE_SETTINGS"; payload: ModelSettings };
