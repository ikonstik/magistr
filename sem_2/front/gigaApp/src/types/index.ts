export interface Message {
	id: string
	text: string
	sender: 'user' | 'assistant'
	timestamp: Date
	role?: string
}

export interface Chat {
	id: string
	name: string
	lastMessageDate: Date
	messages: Message[]
}

export interface ChatItemProps {
	chat: Chat
	isActive: boolean
	onSelect: () => void
	onEdit: () => void
	onDelete: () => void
}

export interface AuthFormData {
	credentials: string
	scope: 'GIGACHAT_API_PERS' | 'GIGACHAT_API_B2B' | 'GIGACHAT_API_CORP'
}

export interface Settings {
	model: 'GigaChat' | 'GigaChat-Plus' | 'GigaChat-Pro' | 'GigaChat-Max'
	temperature: number
	topP: number
	maxTokens: number
	systemPrompt: string
	theme: 'light' | 'dark'
}
