// components/chat/ChatWindow.tsx
import React from 'react'
import shared from '../../styles/shared.module.css'
import styles from './ChatWindow.module.css'
import { MessageList } from './MessageList'
import { InputArea } from './InputArea'
import { EmptyState } from '../common/EmptyState'
import { ErrorMessage } from '../common/ErrorMessage'
import { useChatStore } from '../../store/chatStore'

interface ChatWindowProps {
	onOpenSettings: () => void
	onOpenSidebarMobile: () => void
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
	onOpenSettings,
	onOpenSidebarMobile,
}) => {
	const { state, activeChat, messages, sendMessage, stopGeneration } =
		useChatStore()

	// Мемоизируем обработчики, чтобы они не создавались заново
	const handleSendMessage = React.useCallback(
		(value: string) => {
			sendMessage(value)
		},
		[sendMessage]
	)

	const handleStopGeneration = React.useCallback(() => {
		stopGeneration()
	}, [stopGeneration])

	return (
		<div className={styles.window}>
			<header className={styles.header}>
				<button
					className={`${shared.iconButton} ${styles.burger}`}
					type='button'
					aria-label='Открыть список чатов'
					onClick={onOpenSidebarMobile}
				>
					☰
				</button>
				<div className={styles.titleBlock}>
					<h1 className={styles.title}>
						{activeChat ? activeChat.title : 'Выберите чат'}
					</h1>
					<span className={styles.model}>{state.settings.model}</span>
				</div>
				<button
					className={shared.iconButton}
					type='button'
					aria-label='Открыть настройки'
					onClick={onOpenSettings}
				>
					⚙
				</button>
			</header>

			<section className={styles.messages}>
				{state.error && <ErrorMessage message={state.error} />}
				{activeChat ? (
					<MessageList messages={messages} isLoading={state.isLoading} />
				) : (
					<EmptyState />
				)}
			</section>

			<footer className={styles.inputFooter}>
				<InputArea
					disabled={!activeChat}
					isLoading={state.isLoading}
					onSend={handleSendMessage}
					onStop={handleStopGeneration}
				/>
			</footer>
		</div>
	)
}
