// components/sidebar/Sidebar.tsx
import React from 'react'
import shared from '../../styles/shared.module.css'
import styles from './Sidebar.module.css'
import { useChatStore } from '../../store/chatStore'

interface SidebarProps {
	onSelectChat: (id: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ onSelectChat }) => {
	const { state, createChat, renameChat, deleteChat } = useChatStore()
	const [query, setQuery] = React.useState('')
	const [editingId, setEditingId] = React.useState<string | null>(null)
	const [draftTitle, setDraftTitle] = React.useState('')

	const filteredChats = state.chats.filter(chat => {
		const q = query.toLowerCase().trim()
		if (!q) return true
		const messages = state.messagesByChat[chat.id] ?? []
		const lastMessage = messages[messages.length - 1]?.content ?? ''
		return (
			chat.title.toLowerCase().includes(q) ||
			lastMessage.toLowerCase().includes(q)
		)
	})

	const handleCreate = () => {
		const id = createChat()
		onSelectChat(id)
	}

	const handleDelete = (chatId: string) => {
		const ok = window.confirm('Удалить чат без возможности восстановления?')
		if (!ok) return
		deleteChat(chatId)
	}

	const handleSelectChat = (chatId: string) => {
		console.log('Sidebar: выбран чат', chatId)
		onSelectChat(chatId)
	}

	return (
		<div className={styles.sidebar}>
			<div className={styles.header}>
				<button
					type='button'
					className={`${shared.btn} ${shared.btnPrimary} ${styles.newChat}`}
					onClick={handleCreate}
				>
					<span className={styles.newChatIcon}>+</span>
					<span>Новый чат</span>
				</button>
			</div>

			<div className={styles.search}>
				<input
					type='search'
					className={`${shared.input} ${styles.searchField}`}
					placeholder='Поиск по чатам'
					value={query}
					onChange={e => setQuery(e.target.value)}
				/>
			</div>

			<ul className={styles.chatList}>
				{filteredChats.map(chat => (
					<li
						key={chat.id}
						className={`${styles.chatItem} ${
							chat.id === state.activeChatId ? styles.chatItemActive : ''
						}`}
						onClick={() => handleSelectChat(chat.id)}
					>
						<div className={styles.chatItemMain}>
							{editingId === chat.id ? (
								<input
									autoFocus
									value={draftTitle}
									className={`${shared.input} ${styles.titleInput}`}
									onChange={e => setDraftTitle(e.target.value)}
									onBlur={() => {
										if (draftTitle.trim()) {
											renameChat(chat.id, draftTitle)
										}
										setEditingId(null)
									}}
									onKeyDown={e => {
										if (e.key === 'Enter') {
											if (draftTitle.trim()) {
												renameChat(chat.id, draftTitle)
											}
											setEditingId(null)
										}
										if (e.key === 'Escape') {
											setEditingId(null)
										}
									}}
								/>
							) : (
								<div className={styles.chatItemTitle} title={chat.title}>
									{chat.title}
								</div>
							)}
							<div className={styles.chatItemDate}>
								{(() => {
									const list = state.messagesByChat[chat.id] ?? []
									return list[list.length - 1]?.timestamp ?? chat.updatedAt
								})()}
							</div>
						</div>
						<div className={styles.chatItemActions}>
							<button
								className={shared.iconButton}
								type='button'
								aria-label='Редактировать чат'
								onClick={e => {
									e.stopPropagation()
									setEditingId(chat.id)
									setDraftTitle(chat.title)
								}}
							>
								✏️
							</button>
							<button
								className={`${shared.iconButton} ${shared.iconButtonDanger}`}
								type='button'
								aria-label='Удалить чат'
								onClick={e => {
									e.stopPropagation()
									handleDelete(chat.id)
								}}
							>
								🗑
							</button>
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}
