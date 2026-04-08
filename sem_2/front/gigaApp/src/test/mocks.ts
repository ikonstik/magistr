
import { vi } from 'vitest'

export const mockFetch = vi.fn()

export const mockChatStore = {
	state: {
		isAuthenticated: true,
		accessToken: 'mock-token',
		scope: 'GIGACHAT_API_PERS',
		credentials: 'mock-credentials',
		conversations: {},
		currentChatId: null,
		isStreaming: false,
		error: null,
		chats: [],
		activeChatId: null,
		messagesByChat: {},
		isLoading: false,
		settings: {
			model: 'GigaChat',
			temperature: 0.7,
			topP: 0.9,
			maxTokens: 1000,
			systemPrompt: 'You are helpful',
			theme: 'light',
		},
	},
	messages: [],
	activeChat: null,
	login: vi.fn().mockResolvedValue(undefined),
	createChat: vi.fn(),
	selectChat: vi.fn(),
	renameChat: vi.fn(),
	deleteChat: vi.fn(),
	sendMessage: vi.fn().mockResolvedValue(undefined),
	stopGeneration: vi.fn(),
	updateSettings: vi.fn(),
}
