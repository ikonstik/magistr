import React from 'react'
import type {
	Chat,
	ChatAction,
	ChatScope,
	ChatState,
	Message,
	ModelSettings,
} from '../types'
import { fetchAccessToken, sendChatCompletion } from '../services/gigachatApi'

const STORAGE_KEY = 'gigachat-chat-state-v1'

const nowString = () => new Date().toLocaleString('ru-RU')
const todayString = () => new Date().toLocaleDateString('ru-RU')

const defaultSettings: ModelSettings = {
	model: 'GigaChat-Pro',
	temperature: 0.7,
	topP: 0.9,
	maxTokens: 2048,
	systemPrompt: `Ты — полезный ассистент GigaChat. Отвечай на русском языке.

**ВАЖНО: Для форматирования кода ОБЯЗАТЕЛЬНО используй тройные обратные кавычки с указанием языка:**

\`\`\`javascript
function example() {
  console.log("Hello");
}
\`\`\`

**Для формул используй LaTeX:**
$$x^2 = 8$$

**Для списков используй:**
- пункт 1
- пункт 2

**Для заголовков используй:**
## Заголовок

**Для жирного текста используй:**
**жирный текст**

Всегда указывай язык программирования после трёх обратных кавычек: javascript, python, typescript, html, css и т.д.`,
	theme: 'light',
}

const initialChats: Chat[] = [
	{
		id: '1',
		title: 'Общий чат с ассистентом',
		createdAt: nowString(),
		updatedAt: nowString(),
	},
]

const initialMessagesByChat: Record<string, Message[]> = {
	'1': [
		{
			id: 'm1',
			role: 'assistant',
			content: 'Привет! Чем могу помочь?',
			timestamp: nowString(),
		},
	],
}

const buildInitialState = (): ChatState => ({
	chats: initialChats,
	activeChatId: initialChats[0]?.id ?? null,
	messagesByChat: initialMessagesByChat,
	isLoading: false,
	error: null,
	isAuthenticated: false,
	accessToken: null, // Добавляем accessToken в состояние
	credentials: '',
	scope: 'GIGACHAT_API_PERS',
	settings: defaultSettings,
})

const generateChatTitle = (content: string, chatCount: number): string => {
	const trimmed = content.trim().replace(/\s+/g, ' ')
	if (trimmed.length >= 4) {
		return trimmed.length > 38 ? `${trimmed.slice(0, 38)}...` : trimmed
	}
	return chatCount === 0 ? 'Новый чат' : `Диалог ${chatCount + 1}`
}



const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
	switch (action.type) {
		case 'REPLACE_STATE':
			return action.payload
		case 'SET_ACTIVE_CHAT':
			return { ...state, activeChatId: action.payload }
		case 'CREATE_CHAT':
			return {
				...state,
				chats: [action.payload, ...state.chats],
				activeChatId: action.payload.id,
				messagesByChat: {
					...state.messagesByChat,
					[action.payload.id]: state.messagesByChat[action.payload.id] ?? [],
				},
			}
		case 'UPDATE_CHAT_TITLE':
			return {
				...state,
				chats: state.chats.map(chat =>
					chat.id === action.payload.chatId
						? { ...chat, title: action.payload.title, updatedAt: nowString() }
						: chat
				),
			}
		case 'DELETE_CHAT':
			return {
				...state,
				chats: state.chats.filter(chat => chat.id !== action.payload.chatId),
				activeChatId: action.payload.nextActiveChatId,
			}
		case 'SET_MESSAGES':
			return {
				...state,
				messagesByChat: {
					...state.messagesByChat,
					[action.payload.chatId]: action.payload.messages,
				},
			}
		case 'APPEND_MESSAGE':
			return {
				...state,
				messagesByChat: {
					...state.messagesByChat,
					[action.payload.chatId]: [
						...(state.messagesByChat[action.payload.chatId] ?? []),
						action.payload.message,
					],
				},
			}
		case 'UPDATE_LAST_ASSISTANT_MESSAGE': {
			const list = [...(state.messagesByChat[action.payload.chatId] ?? [])]
			const last = list[list.length - 1]
			if (!last || last.role !== 'assistant') return state
			list[list.length - 1] = { ...last, content: action.payload.content }
			return {
				...state,
				messagesByChat: {
					...state.messagesByChat,
					[action.payload.chatId]: list,
				},
			}
		}
		case 'SET_LOADING':
			return { ...state, isLoading: action.payload }
		case 'SET_ERROR':
			return { ...state, error: action.payload }
		case 'SET_AUTH':
			return {
				...state,
				isAuthenticated: true,
				accessToken: action.payload.accessToken, // Сохраняем токен
				credentials: action.payload.credentials,
				scope: action.payload.scope,
			}
		case 'SET_ACCESS_TOKEN':
			return {
				...state,
				accessToken: action.payload,
			}
		case 'LOGOUT':
			return buildInitialState()
		case 'UPDATE_SETTINGS':
			return { ...state, settings: action.payload }
		default:
			return state
	}
}

interface ChatStoreValue {
	state: ChatState
	messages: Message[]
	activeChat: Chat | null
	login: (credentials: string, scope: ChatScope) => Promise<void> // Делаем асинхронным
	createChat: () => string
	selectChat: (chatId: string | null) => void
	renameChat: (chatId: string, title: string) => void
	deleteChat: (chatId: string) => void
	sendMessage: (content: string) => Promise<void>
	stopGeneration: () => void
	updateSettings: (settings: ModelSettings) => void
}

const ChatStoreContext = React.createContext<ChatStoreValue | null>(null)

const loadState = (): ChatState => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return buildInitialState()
		const parsed = JSON.parse(raw) as ChatState
		if (!parsed || !Array.isArray(parsed.chats) || !parsed.messagesByChat) {
			return buildInitialState()
		}
		return { ...buildInitialState(), ...parsed, isLoading: false, error: null }
	} catch {
		return buildInitialState()
	}
}

export const ChatStoreProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [state, dispatch] = React.useReducer(chatReducer, undefined, loadState)
	const abortControllerRef = React.useRef<AbortController | null>(null)
	const tokenExpiryRef = React.useRef<number | null>(null)

	React.useEffect(() => {
		const theme = state.settings.theme
		document.documentElement.setAttribute('data-theme', theme)
	}, [state.settings.theme])

	React.useEffect(() => {
		const persistent: ChatState = { ...state, isLoading: false, error: null }
		localStorage.setItem(STORAGE_KEY, JSON.stringify(persistent))
	}, [state])

	const activeChat = React.useMemo(
		() => state.chats.find(chat => chat.id === state.activeChatId) ?? null,
		[state.chats, state.activeChatId]
	)

	const messages = React.useMemo(
		() =>
			state.activeChatId ? state.messagesByChat[state.activeChatId] ?? [] : [],
		[state.messagesByChat, state.activeChatId]
	)

	// Функция для проверки и обновления токена
	const getValidToken = async (): Promise<string> => {
		// Если токен есть и не истек (30 минут), возвращаем его
		if (
			state.accessToken &&
			tokenExpiryRef.current &&
			Date.now() < tokenExpiryRef.current
		) {
			return state.accessToken
		}

		// Иначе получаем новый токен
		if (!state.credentials || !state.scope) {
			throw new Error('Не выполнена авторизация')
		}

		try {
			const newToken = await fetchAccessToken(state.credentials, state.scope)
			// Сохраняем токен и устанавливаем время истечения (30 минут)
			dispatch({ type: 'SET_ACCESS_TOKEN', payload: newToken })
			tokenExpiryRef.current = Date.now() + 25 * 60 * 1000 // 25 минут (запас)
			return newToken
		} catch (error) {
			// Если токен не удалось обновить, разлогиниваем
			dispatch({ type: 'LOGOUT' })
			throw new Error('Сессия истекла. Выполните вход заново.')
		}
	}

	const login = async (credentials: string, scope: ChatScope) => {
		try {
			dispatch({ type: 'SET_ERROR', payload: null })
			dispatch({ type: 'SET_LOADING', payload: true })

			// Получаем токен
			const token = await fetchAccessToken(credentials, scope)

			// Сохраняем в состоянии
			dispatch({
				type: 'SET_AUTH',
				payload: { credentials: credentials.trim(), scope, accessToken: token },
			})

			tokenExpiryRef.current = Date.now() + 25 * 60 * 1000 // 25 минут
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Ошибка авторизации'
			dispatch({ type: 'SET_ERROR', payload: message })
			throw error
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false })
		}
	}

	const createChat = (): string => {
		const id = `${Date.now()}`
		const newChat: Chat = {
			id,
			title:
				state.chats.length === 0
					? 'Новый чат'
					: `Диалог ${state.chats.length + 1}`,
			createdAt: nowString(),
			updatedAt: todayString(),
		}
		dispatch({ type: 'CREATE_CHAT', payload: newChat })
		return id
	}

	const selectChat = (chatId: string | null) => {
		dispatch({ type: 'SET_ACTIVE_CHAT', payload: chatId })
	}

	const renameChat = (chatId: string, title: string) => {
		const next = title.trim()
		if (!next) return
		dispatch({ type: 'UPDATE_CHAT_TITLE', payload: { chatId, title: next } })
	}

	const deleteChat = (chatId: string) => {
		const nextChats = state.chats.filter(chat => chat.id !== chatId)
		const nextActive =
			state.activeChatId === chatId
				? nextChats[0]?.id ?? null
				: state.activeChatId
		dispatch({
			type: 'DELETE_CHAT',
			payload: { chatId, nextActiveChatId: nextActive },
		})
	}

	const sendMessage = async (content: string) => {
		const chatId = state.activeChatId
		if (!chatId || state.isLoading) return

		const trimmed = content.trim()
		if (!trimmed) return

		dispatch({ type: 'SET_ERROR', payload: null })

		const existing = state.messagesByChat[chatId] ?? []
		const firstUserMessage = !existing.some(msg => msg.role === 'user')
		if (firstUserMessage) {
			const autoTitle = generateChatTitle(trimmed, state.chats.length)
			dispatch({
				type: 'UPDATE_CHAT_TITLE',
				payload: { chatId, title: autoTitle },
			})
		}

		const userMessage: Message = {
			id: `u-${Date.now()}`,
			role: 'user',
			content: trimmed,
			timestamp: nowString(),
		}
		dispatch({
			type: 'APPEND_MESSAGE',
			payload: { chatId, message: userMessage },
		})

		const assistantPlaceholder: Message = {
			id: `a-${Date.now() + 1}`,
			role: 'assistant',
			content: '',
			timestamp: nowString(),
		}
		dispatch({
			type: 'APPEND_MESSAGE',
			payload: { chatId, message: assistantPlaceholder },
		})
		dispatch({ type: 'SET_LOADING', payload: true })

		const controller = new AbortController()
		abortControllerRef.current = controller

		try {
			// Получаем валидный токен
			const token = await getValidToken()

			// Формируем историю сообщений
			const historyMessages = state.messagesByChat[chatId] ?? []

			const conversation: Message[] = [
				{
					id: 'system',
					role: 'system',
					content: state.settings.systemPrompt,
					timestamp: nowString(),
				},
				...historyMessages,
				userMessage,
			]

			const finalContent = await sendChatCompletion({
				accessToken: token,
				conversation,
				settings: state.settings,
				signal: controller.signal,
				onStreamDelta: partialText => {
					dispatch({
						type: 'UPDATE_LAST_ASSISTANT_MESSAGE',
						payload: { chatId, content: partialText },
					})
				},
			})

			if (finalContent) {
				dispatch({
					type: 'UPDATE_LAST_ASSISTANT_MESSAGE',
					payload: { chatId, content: finalContent },
				})
			}
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') {
				dispatch({
					type: 'UPDATE_LAST_ASSISTANT_MESSAGE',
					payload: { chatId, content: 'Генерация остановлена пользователем.' },
				})
				return
			}

			const message =
				error instanceof Error ? error.message : 'Неизвестная ошибка запроса'
			dispatch({ type: 'SET_ERROR', payload: message })

			// Проверяем, не истекла ли сессия
			if (
				message.includes('сессия истекла') ||
				message.includes('401') ||
				message.includes('403')
			) {
				dispatch({ type: 'LOGOUT' })
				dispatch({
					type: 'SET_ERROR',
					payload: 'Сессия истекла. Пожалуйста, войдите заново.',
				})
			} else {
				dispatch({
					type: 'UPDATE_LAST_ASSISTANT_MESSAGE',
					payload: { chatId, content: `Ошибка: ${message}` },
				})
			}
		} finally {
			abortControllerRef.current = null
			dispatch({ type: 'SET_LOADING', payload: false })
		}
	}

	const stopGeneration = () => {
		abortControllerRef.current?.abort()
		abortControllerRef.current = null
		dispatch({ type: 'SET_LOADING', payload: false })
	}

	const updateSettings = (settings: ModelSettings) => {
		dispatch({ type: 'UPDATE_SETTINGS', payload: settings })
	}

	const value: ChatStoreValue = {
		state,
		messages,
		activeChat,
		login,
		createChat,
		selectChat,
		renameChat,
		deleteChat,
		sendMessage,
		stopGeneration,
		updateSettings,
	}

	return (
		<ChatStoreContext.Provider value={value}>
			{children}
		</ChatStoreContext.Provider>
	)
}

export const useChatStore = (): ChatStoreValue => {
	const ctx = React.useContext(ChatStoreContext)
	if (!ctx) {
		throw new Error('useChatStore must be used within ChatStoreProvider')
	}
	return ctx
}
