const ADMIN_SERVICE_URL = import.meta.env.VITE_ADMIN_SERVICE_URL
const PRODUCT_SERVICE_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL
const ORDER_SERVICE_URL = import.meta.env.VITE_ORDER_SERVICE_URL

const handleResponse = async response => {
	if (!response.ok) {
		const error = await response.json().catch(() => ({}))
		throw new Error(error.detail || error.message || `HTTP ${response.status}`)
	}
	return response.json()
}

export const adminApi = {
	login: async (login, password) => {
		const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ login, password }),
		})
		return handleResponse(response)
	},
}

export const productApi = {
	// Получение всех товаров с фильтрацией
	getProducts: async (params = {}) => {
		const queryParams = new URLSearchParams()
		if (params.type) queryParams.append('type', params.type)
		if (params.min_price) queryParams.append('min_price', params.min_price)
		if (params.max_price) queryParams.append('max_price', params.max_price)
		if (params.limit) queryParams.append('limit', params.limit)
		if (params.offset) queryParams.append('offset', params.offset)

		const url = `${PRODUCT_SERVICE_URL}/api/v1/products${queryParams.toString() ? `?${queryParams}` : ''}`
		const response = await fetch(url)
		return handleResponse(response)
	},

	// Получение товара по ID
	getProductById: async id => {
		const response = await fetch(`${PRODUCT_SERVICE_URL}/api/v1/products/${id}`)
		return handleResponse(response)
	},

	// Создание товара (только для админа)
	createProduct: async (productData, token) => {
		const response = await fetch(`${PRODUCT_SERVICE_URL}/api/v1/products`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(productData),
		})
		return handleResponse(response)
	},

	// Обновление товара (только для админа)
	updateProduct: async (id, productData, token) => {
		const response = await fetch(
			`${PRODUCT_SERVICE_URL}/api/v1/products/${id}`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(productData),
			},
		)
		return handleResponse(response)
	},

	// Обновление остатков
	updateStock: async (id, stock, token) => {
		const response = await fetch(
			`${PRODUCT_SERVICE_URL}/api/v1/products/${id}/stock`,
			{
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ stock }),
			},
		)
		return handleResponse(response)
	},

	// Удаление товара (только для админа)
	deleteProduct: async (id, token) => {
		const response = await fetch(
			`${PRODUCT_SERVICE_URL}/api/v1/products/${id}`,
			{
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		)
		if (response.status !== 204) {
			return handleResponse(response)
		}
		return { success: true }
	},
}

export const orderApi = {
	// Создание заказа
	createOrder: async orderData => {
		const response = await fetch(`${ORDER_SERVICE_URL}/api/v1/orders`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(orderData),
		})
		return handleResponse(response)
	},

	// Получение заказа по ID
	getOrderById: async id => {
		const response = await fetch(`${ORDER_SERVICE_URL}/api/v1/orders/${id}`)
		return handleResponse(response)
	},

	// Получение заказов по номеру телефона
	getOrdersByPhone: async phone => {
		const response = await fetch(
			`${ORDER_SERVICE_URL}/api/v1/orders/phone/${encodeURIComponent(phone)}`,
		)
		return handleResponse(response)
	},

	// Отслеживание заказа по трек-коду
	trackOrder: async trackingCode => {
		const response = await fetch(
			`${ORDER_SERVICE_URL}/api/v1/orders/track/${trackingCode}`,
		)
		return handleResponse(response)
	},

	// Получение всех заказов (только для админа)
	getAllOrders: async (token, limit = 50, offset = 0) => {
		const response = await fetch(
			`${ORDER_SERVICE_URL}/api/v1/orders?limit=${limit}&offset=${offset}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		)
		return handleResponse(response)
	},

	// Обновление статуса заказа (только для админа)
	updateOrderStatus: async (id, status, location, token) => {
		const response = await fetch(
			`${ORDER_SERVICE_URL}/api/v1/orders/${id}/status`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ status, location }),
			},
		)
		return handleResponse(response)
	},
}