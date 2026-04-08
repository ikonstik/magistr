// src/test/example.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Тестовое окружение', () => {
	it('должно работать с React компонентами', () => {
		render(<div>Hello World</div>)
		expect(screen.getByText('Hello World')).toBeInTheDocument()
	})

	it('должно поддерживать user-event', async () => {
		const handleClick = vi.fn()
		render(<button onClick={handleClick}>Click me</button>)

		const button = screen.getByText('Click me')
		await userEvent.click(button)

		expect(handleClick).toHaveBeenCalledTimes(1)
	})
})
