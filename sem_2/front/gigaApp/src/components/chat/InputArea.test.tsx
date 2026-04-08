// src/components/chat/InputArea.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InputArea } from './InputArea'

describe('InputArea', () => {
	const mockOnSend = vi.fn()
	const mockOnStop = vi.fn()

	beforeEach(() => {
		vi.clearAllMocks()
	})

	const renderInputArea = (props = {}) => {
		return render(
			<InputArea
				onSend={mockOnSend}
				onStop={mockOnStop}
				isLoading={false}
				disabled={false}
				{...props}
			/>
		)
	}

	describe('Отправка сообщений', () => {
		it('при непустом значении и клике на кнопку "Отправить" вызывается onSend с текстом сообщения', async () => {
			renderInputArea()

			const textarea = screen.getByPlaceholderText('Введите сообщение...')
			const sendButton = screen.getByRole('button', { name: /отправить/i })

			await userEvent.type(textarea, 'Hello world')
			await userEvent.click(sendButton)

			expect(mockOnSend).toHaveBeenCalledWith('Hello world')
			expect(textarea).toHaveValue('') // поле очищается после отправки
		})

		it('при нажатии Enter с непустым вводом вызывается onSend', async () => {
			renderInputArea()

			const textarea = screen.getByPlaceholderText('Введите сообщение...')

			await userEvent.type(textarea, 'Test message{Enter}')

			expect(mockOnSend).toHaveBeenCalledWith('Test message')
		})

		it('при нажатии Shift+Enter не вызывается onSend и добавляется новая строка', async () => {
			renderInputArea()

			const textarea = screen.getByPlaceholderText('Введите сообщение...')

			await userEvent.type(textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2')

			expect(mockOnSend).not.toHaveBeenCalled()
			expect(textarea).toHaveValue('Line 1\nLine 2')
		})

		it('не отправляет пустое сообщение', async () => {
			renderInputArea()

			const sendButton = screen.getByRole('button', { name: /отправить/i })

			expect(sendButton).toBeDisabled()

			await userEvent.click(sendButton)
			expect(mockOnSend).not.toHaveBeenCalled()
		})
	})

	describe('Состояния кнопки', () => {
		it('кнопка "Отправить" заблокирована при пустом поле ввода', () => {
			renderInputArea()

			const textarea = screen.getByPlaceholderText('Введите сообщение...')
			const sendButton = screen.getByRole('button', { name: /отправить/i })

			expect(textarea).toHaveValue('')
			expect(sendButton).toBeDisabled()
		})

		it('кнопка "Отправить" активна при непустом поле ввода', async () => {
			renderInputArea()

			const textarea = screen.getByPlaceholderText('Введите сообщение...')
			const sendButton = screen.getByRole('button', { name: /отправить/i })

			await userEvent.type(textarea, 'Hello')

			expect(sendButton).not.toBeDisabled()
		})

		it('кнопка "Отправить" заблокирована при disabled={true}', () => {
			renderInputArea({ disabled: true })

			const textarea = screen.getByPlaceholderText('Введите сообщение...')
			const sendButton = screen.getByRole('button', { name: /отправить/i })

			expect(textarea).toBeDisabled()
			expect(sendButton).toBeDisabled()
		})
	})

	describe('Состояние загрузки', () => {
		it('при isLoading={true} отображается кнопка "Стоп" вместо "Отправить"', () => {
			renderInputArea({ isLoading: true })

			const stopButton = screen.getByRole('button', { name: /стоп/i })
			const sendButton = screen.queryByRole('button', { name: /отправить/i })

			expect(stopButton).toBeInTheDocument()
			expect(sendButton).not.toBeInTheDocument()
		})

		it('при нажатии на кнопку "Стоп" вызывается onStop', async () => {
			renderInputArea({ isLoading: true })

			const stopButton = screen.getByRole('button', { name: /стоп/i })
			await userEvent.click(stopButton)

			expect(mockOnStop).toHaveBeenCalled()
		})

		it('textarea заблокирована во время загрузки', () => {
			renderInputArea({ isLoading: true })

			const textarea = screen.getByPlaceholderText('Введите сообщение...')

			expect(textarea).toBeDisabled()
		})
	})

	describe('Автоматическое изменение высоты', () => {
		it('увеличивает количество строк при вводе многострочного текста', async () => {
			renderInputArea()

			const textarea = screen.getByPlaceholderText('Введите сообщение...')

			expect(textarea).toHaveAttribute('rows', '1')

			await userEvent.type(textarea, 'Line 1\nLine 2\nLine 3')

			expect(textarea).toHaveAttribute('rows', '3')
		})

		it('не превышает максимальное количество строк (5)', async () => {
			renderInputArea()

			const textarea = screen.getByPlaceholderText('Введите сообщение...')
			const longText = Array(10).fill('Line').join('\n')

			await userEvent.type(textarea, longText)

			expect(Number(textarea.getAttribute('rows'))).toBeLessThanOrEqual(5)
		})
	})
})
