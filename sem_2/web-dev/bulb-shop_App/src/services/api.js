// Базовый URL для API Gateway (единая точка входа)
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8003'

// Вспомогательная функция для обработки ответов
const handleResponse = async response => {
	if (!response.ok) {
		const error = await response.json().catch(() => ({}))
		throw new Error(error.detail || error.message || `HTTP ${response.status}`)
	}
	return response.json()
}

// Сохранение и получение токена из localStorage
const getToken = () => localStorage.getItem('admin_token')
const setToken = token => localStorage.setItem('admin_token', token)
const removeToken = () => localStorage.removeItem('admin_token')

// ==================== Аутентификация (через Gateway) ====================
export const adminApi = {
	login: async (login, password) => {
		const response = await fetch(`${GATEWAY_URL}/api/admin/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ login, password }),
		})
		const data = await handleResponse(response)
		if (data.token) {
			setToken(data.token)
		}
		return data
	},

	logout: () => {
		removeToken()
	},

	getCurrentAdmin: async () => {
		const token = getToken()
		if (!token) throw new Error('No token')

		const response = await fetch(`${GATEWAY_URL}/api/admin/me`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		return handleResponse(response)
	},

	isAuthenticated: () => {
		return !!getToken()
	},
}

// ==================== Product Service (через Gateway) ====================
export const productApi = {
	// Публичные эндпоинты (без токена)
	getProducts: async (params = {}) => {
		const queryParams = new URLSearchParams()
		if (params.type) queryParams.append('type', params.type)
		if (params.min_price) queryParams.append('min_price', params.min_price)
		if (params.max_price) queryParams.append('max_price', params.max_price)
		if (params.limit) queryParams.append('limit', params.limit)
		if (params.offset) queryParams.append('offset', params.offset)

		const url = `${GATEWAY_URL}/api/v1/products${queryParams.toString() ? `?${queryParams}` : ''}`
		const response = await fetch(url)
		return handleResponse(response)
	},

	getProductById: async id => {
		const response = await fetch(`${GATEWAY_URL}/api/v1/products/${id}`)
		return handleResponse(response)
	},

	// Админские эндпоинты (требуют токен)
	createProduct: async productData => {
		const token = getToken()
		if (!token) throw new Error('Unauthorized')

		const response = await fetch(`${GATEWAY_URL}/api/v1/products`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(productData),
		})
		return handleResponse(response)
	},

	updateProduct: async (id, productData) => {
		const token = getToken()
		if (!token) throw new Error('Unauthorized')

		const response = await fetch(`${GATEWAY_URL}/api/v1/products/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(productData),
		})
		return handleResponse(response)
	},

	updateStock: async (id, stock) => {
		const token = getToken()
		if (!token) throw new Error('Unauthorized')

		const response = await fetch(`${GATEWAY_URL}/api/v1/products/${id}/stock`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ stock }),
		})
		return handleResponse(response)
	},

	deleteProduct: async id => {
		const token = getToken()
		if (!token) throw new Error('Unauthorized')

		const response = await fetch(`${GATEWAY_URL}/api/v1/products/${id}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		if (response.status !== 204) {
			return handleResponse(response)
		}
		return { success: true }
	},
}

// ==================== Order Service (через Gateway) ====================
export const orderApi = {
	// Публичные эндпоинты
	createOrder: async orderData => {
		const response = await fetch(`${GATEWAY_URL}/api/v1/orders`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(orderData),
		})
		return handleResponse(response)
	},

	getOrderById: async id => {
		const response = await fetch(`${GATEWAY_URL}/api/v1/orders/${id}`)
		return handleResponse(response)
	},

	getOrdersByPhone: async phone => {
		const response = await fetch(
			`${GATEWAY_URL}/api/v1/orders/phone/${encodeURIComponent(phone)}`,
		)
		return handleResponse(response)
	},

	trackOrder: async trackingCode => {
		const response = await fetch(
			`${GATEWAY_URL}/api/v1/orders/track/${trackingCode}`,
		)
		return handleResponse(response)
	},

	// Админские эндпоинты (требуют токен)
	getAllOrders: async (limit = 50, offset = 0) => {
		const token = getToken()
		if (!token) throw new Error('Unauthorized')

		const response = await fetch(
			`${GATEWAY_URL}/api/v1/orders?limit=${limit}&offset=${offset}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		)
		return handleResponse(response)
	},

	updateOrderStatus: async (id, status, location) => {
		const token = getToken()
		if (!token) throw new Error('Unauthorized')

		const response = await fetch(`${GATEWAY_URL}/api/v1/orders/${id}/status`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ status, location }),
		})
		return handleResponse(response)
	},
}
