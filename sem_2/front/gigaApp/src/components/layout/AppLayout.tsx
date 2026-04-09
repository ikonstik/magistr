// components/layout/AppLayout.tsx
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Sidebar } from '../sidebar/Sidebar'
import { ChatWindow } from '../chat/ChatWindow'
import { SettingsPanel } from '../settings/SettingsPanel'
import { useChatStore } from '../../store/chatStore'
import styles from './AppLayout.module.css'

export const AppLayout: React.FC = () => {
	const [isSidebarOpenMobile, setIsSidebarOpenMobile] = React.useState(false)
	const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
	const { id } = useParams()
	const navigate = useNavigate()
	const { state, selectChat, updateSettings } = useChatStore()

	// Только один эффект для синхронизации
	React.useEffect(() => {
		// Если нет чатов, ничего не делаем
		if (state.chats.length === 0) return

		// Если есть ID в URL и чат существует, но не активен - выбираем его
		if (
			id &&
			state.chats.some(chat => chat.id === id) &&
			state.activeChatId !== id
		) {
			selectChat(id)
			return
		}

		// Если нет ID в URL и есть активный чат - обновляем URL
		if (!id && state.activeChatId) {
			navigate(`/chat/${state.activeChatId}`, { replace: true })
			return
		}

		// Если нет активного чата, но есть чаты - выбираем первый
		if (!state.activeChatId && state.chats.length > 0) {
			const firstChatId = state.chats[0].id
			selectChat(firstChatId)
			navigate(`/chat/${firstChatId}`, { replace: true })
		}
	}, [id, state.chats, state.activeChatId, selectChat, navigate])

	const handleSelectChat = React.useCallback(
		(chatId: string) => {
			selectChat(chatId)
			navigate(`/chat/${chatId}`)
			setIsSidebarOpenMobile(false)
		},
		[selectChat, navigate]
	)

	const handleOpenSettings = React.useCallback(() => {
		setIsSettingsOpen(true)
	}, [])

	const handleCloseSettings = React.useCallback(() => {
		setIsSettingsOpen(false)
	}, [])

	const handleOpenSidebar = React.useCallback(() => {
		setIsSidebarOpenMobile(true)
	}, [])

	const handleCloseSidebar = React.useCallback(() => {
		setIsSidebarOpenMobile(false)
	}, [])

	return (
		<>
			<div className={styles.layout}>
				<aside
					className={`${styles.sidebarContainer} ${
						isSidebarOpenMobile ? styles.sidebarContainerOpen : ''
					}`}
				>
					<Sidebar onSelectChat={handleSelectChat} />
				</aside>

				{isSidebarOpenMobile && (
					<div
						className={styles.sidebarBackdrop}
						onClick={handleCloseSidebar}
					/>
				)}

				<main className={styles.chatContainer}>
					<ChatWindow
						onOpenSettings={handleOpenSettings}
						onOpenSidebarMobile={handleOpenSidebar}
					/>
				</main>
			</div>

			<SettingsPanel
				isOpen={isSettingsOpen}
				settings={state.settings}
				onClose={handleCloseSettings}
				onChange={updateSettings}
				onReset={() =>
					updateSettings({
						model: 'GigaChat',
						temperature: 0.7,
						topP: 0.9,
						maxTokens: 2048,
						systemPrompt: 'You are a helpful GigaChat assistant.',
						theme: 'light',
					})
				}
			/>
		</>
	)
}
