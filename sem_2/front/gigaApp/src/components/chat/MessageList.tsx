// components/chat/MessageList.tsx
import React from 'react'
import type { Message } from '../../types'
import { Message } from './Message'
import { TypingIndicator } from './TypingIndicator'
import styles from './MessageList.module.css'

interface MessageListProps {
	messages: Message[]
	isLoading: boolean
}

export const MessageList: React.FC<MessageListProps> = ({
	messages,
	isLoading,
}) => {
	const endRef = React.useRef<HTMLDivElement | null>(null)

	// Проверяем, есть ли сообщение ассистента в процессе генерации
	const lastMessage = messages[messages.length - 1]
	const isStreaming =
		isLoading && lastMessage?.role === 'assistant' && lastMessage.content === ''
	const hasContent =
		lastMessage?.role === 'assistant' && lastMessage.content.length > 0

	React.useLayoutEffect(() => {
		endRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages, isLoading])

	return (
		<div className={styles.list}>
			{messages.map(message => (
				<Message key={message.id} message={message} />
			))}

			{/* Показываем индикатор только если нет контента и идёт загрузка */}
			{isLoading && !hasContent && (
				<div className={styles.typingWrap}>
					<TypingIndicator />
				</div>
			)}

			{/* Показываем индикатор "печатает" во время стриминга */}
			{isLoading && hasContent && isStreaming && (
				<div className={styles.streamingIndicator}>
					<span className={styles.cursor}>▊</span>
				</div>
			)}

			<div ref={endRef} className={styles.endAnchor} aria-hidden='true' />
		</div>
	)
}
