// src/test/setup.ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Автоматическая очистка после каждого теста
afterEach(() => {
	cleanup()
})

// Мок для window.matchMedia (необходим для некоторых компонентов)
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation(query => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
})

// Мок для localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {}
	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value.toString()
		},
		removeItem: (key: string) => {
			delete store[key]
		},
		clear: () => {
			store = {}
		},
	}
})()

Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
})

// Мок для crypto.randomUUID
Object.defineProperty(window.crypto, 'randomUUID', {
	value: () => 'test-uuid-' + Math.random().toString(36).substring(2),
})

// Мок для fetch
global.fetch = vi.fn()

// Мок для TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any
