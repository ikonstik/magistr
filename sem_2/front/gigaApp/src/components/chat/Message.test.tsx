// src/components/chat/Message.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Message } from './Message'
import type { Message as MessageType } from '../../types'

describe('Message', () => {
	const userMessage: MessageType = {
		id: '1',
		role: 'user',
		content: 'Hello world',
		timestamp: new Date().toISOString(),
	}

	const assistantMessage: MessageType = {
		id: '2',
		role: 'assistant',
		content: 'Hi there!',
		timestamp: new Date().toISOString(),
	}

	it('должен рендерить сообщение пользователя', () => {
		render(<Message message={userMessage} />)
		expect(screen.getByText('Hello world')).toBeInTheDocument()
		expect(screen.getByText('Вы')).toBeInTheDocument()
	})

	it('должен рендерить сообщение ассистента', () => {
		render(<Message message={assistantMessage} />)
		expect(screen.getByText('Hi there!')).toBeInTheDocument()
		expect(screen.getByText('GigaChat')).toBeInTheDocument()
	})

	it('должен копировать текст сообщения', async () => {
		const writeTextMock = vi.fn(() => Promise.resolve())
		Object.assign(navigator, {
			clipboard: { writeText: writeTextMock },
		})

		render(<Message message={assistantMessage} />)

		const copyButton = screen.getByLabelText(/Копировать/i)
		fireEvent.click(copyButton)

		expect(writeTextMock).toHaveBeenCalledWith('Hi there!')
	})
})
