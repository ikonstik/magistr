// src/components/auth/AuthForm.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthForm } from './AuthForm'
import { ChatStoreProvider } from '../../store/chatStore'
import { BrowserRouter } from 'react-router-dom'

// Мок для useChatStore
vi.mock('../../store/chatStore', () => ({
	useChatStore: () => ({
		login: vi.fn().mockResolvedValue(undefined),
		state: { error: null },
	}),
	ChatStoreProvider: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
}))

describe('AuthForm', () => {
	const renderAuthForm = () => {
		return render(
			<BrowserRouter>
				<ChatStoreProvider>
					<AuthForm />
				</ChatStoreProvider>
			</BrowserRouter>
		)
	}

	it('должен рендерить форму входа', () => {
		renderAuthForm()

		expect(screen.getByText('Вход в GigaChat')).toBeInTheDocument()
		expect(screen.getByPlaceholderText('Введите Client ID')).toBeInTheDocument()
		expect(
			screen.getByPlaceholderText('Введите Client Secret')
		).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /Войти/i })).toBeInTheDocument()
	})

	it('должен показывать options для выбора scope', () => {
		renderAuthForm()

		expect(screen.getByLabelText(/GIGACHAT_API_PERS/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/GIGACHAT_API_CORP/i)).toBeInTheDocument()
	})
})
