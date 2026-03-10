export type ChatScope = "GIGACHAT_API_PERS" | "GIGACHAT_API_B2B" | "GIGACHAT_API_CORP";

export type Theme = "light" | "dark";

export interface ChatSummary {
  id: string;
  title: string;
  lastMessageAt: string;
}

export type MessageVariant = "user" | "assistant";

export interface ChatMessage {
  id: string;
  chatId: string;
  author: string;
  variant: MessageVariant;
  content: string;
  createdAt: string;
}

export interface ModelSettings {
  model: "GigaChat" | "GigaChat-Plus" | "GigaChat-Pro" | "GigaChat-Max";
  temperature: number;
  topP: number;
  maxTokens: number;
  systemPrompt: string;
  theme: Theme;
}

