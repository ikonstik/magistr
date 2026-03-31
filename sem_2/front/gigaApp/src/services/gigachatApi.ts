// services/gigachatApi.ts
import type { ChatScope, Message, ModelSettings } from '../types'

// В разработке используем прокси, в продакшене - прямые URL
const OAUTH_URL = import.meta.env.DEV
	? '/api/oauth/api/v2/oauth'
	: 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth'

const CHAT_URL = import.meta.env.DEV
	? '/api/gigachat/api/v1/chat/completions'
	: 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions'

console.log('Mode:', import.meta.env.MODE)
console.log('OAUTH_URL:', OAUTH_URL)
console.log('CHAT_URL:', CHAT_URL)

const createRqUid = (): string => {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
		return crypto.randomUUID()
	}
	return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const toApiRole = (role: Message['role']): 'system' | 'user' | 'assistant' => {
	return role
}

interface StreamCallbacks {
	onDelta: (partialContent: string) => void
}

const readStreamingResponse = async (
	response: Response,
	callbacks: StreamCallbacks
): Promise<string> => {
	if (!response.body) {
		throw new Error('Поток ответа недоступен.')
	}

	const reader = response.body.getReader()
	const decoder = new TextDecoder('utf-8')
	let buffer = ''
	let full = ''

	while (true) {
		const { done, value } = await reader.read()
		if (done) break

		buffer += decoder.decode(value, { stream: true })
		const lines = buffer.split('\n')
		buffer = lines.pop() ?? ''

		for (const rawLine of lines) {
			const line = rawLine.trim()
			if (!line.startsWith('data:')) continue

			const payload = line.slice(5).trim()
			if (!payload || payload === '[DONE]') continue

			try {
				const json = JSON.parse(payload)

				if (json.choices && json.choices[0]) {
					const delta =
						json.choices[0].delta?.content ||
						json.choices[0].message?.content ||
						''

					if (delta) {
						full += delta
						callbacks.onDelta(full)
					}
				}
			} catch (e) {
				console.warn('Ошибка парсинга streaming данных:', e)
			}
		}
	}

	return full
}

export const fetchAccessToken = async (
	credentials: string,
	scope: ChatScope,
	signal?: AbortSignal
): Promise<string> => {
	const validScope =
		scope === 'GIGACHAT_API_PERS' ? 'GIGACHAT_API_PERS' : 'GIGACHAT_API_CORP'

	const body = new URLSearchParams()
	body.append('scope', validScope)

	console.log('Fetching token from:', OAUTH_URL)
	console.log('Using scope:', validScope)

	try {
		const response = await fetch(OAUTH_URL, {
			method: 'POST',
			signal,
			headers: {
				Authorization: `Basic ${credentials}`,
				RqUID: createRqUid(),
				'Content-Type': 'application/x-www-form-urlencoded',
				Accept: 'application/json',
			},
			body: body.toString(),
		})

		console.log('Response status:', response.status)

		if (!response.ok) {
			const text = await response.text()
			console.error('Error response:', text)
			throw new Error(
				`OAuth ошибка (${response.status}): ${
					text || 'не удалось получить токен'
				}`
			)
		}

		const json = await response.json()
		console.log('Token received successfully')

		if (!json.access_token) {
			throw new Error('Ответ OAuth не содержит access_token.')
		}
		return json.access_token
	} catch (error) {
		console.error('Fetch error:', error)
		throw error
	}
}

interface SendMessageParams {
	accessToken: string
	conversation: Message[]
	settings: ModelSettings
	onStreamDelta: (partialText: string) => void
	signal?: AbortSignal
}

export const sendChatCompletion = async ({
	accessToken,
	conversation,
	settings,
	onStreamDelta,
	signal,
}: SendMessageParams): Promise<string> => {
	const apiMessages = conversation.map(m => ({
		role: toApiRole(m.role),
		content: m.content,
	}))

	const requestPayload = {
		model: settings.model,
		stream: true,
		temperature: settings.temperature,
		top_p: settings.topP,
		max_tokens: settings.maxTokens,
		messages: apiMessages,
	}

	console.log('Sending to:', CHAT_URL)
	console.log('Using model:', settings.model)

	try {
		const streamResponse = await fetch(CHAT_URL, {
			method: 'POST',
			signal,
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
				Accept: 'text/event-stream',
			},
			body: JSON.stringify(requestPayload),
		})

		console.log('Chat response status:', streamResponse.status)

		if (!streamResponse.ok) {
			const text = await streamResponse.text()
			console.error('Error response:', text)
			throw new Error(`Streaming request failed (${streamResponse.status})`)
		}

		const streamed = await readStreamingResponse(streamResponse, {
			onDelta: onStreamDelta,
		})

		if (streamed.trim()) {
			return streamed
		}
	} catch (error) {
		console.warn('Streaming не удался, пробуем обычный запрос:', error)

		const response = await fetch(CHAT_URL, {
			method: 'POST',
			signal,
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({ ...requestPayload, stream: false }),
		})

		if (!response.ok) {
			const text = await response.text()
			throw new Error(
				`Chat completion ошибка (${response.status}): ${text || 'пустой ответ'}`
			)
		}

		const json = await response.json()
		const text = json.choices?.[0]?.message?.content ?? ''
		onStreamDelta(text)
		return text
	}

	return ''
}
