import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { productApi } from '../../services/api'

// Асинхронный thunk для получения всех товаров
export const fetchAllProducts = createAsyncThunk(
	'products/fetchAll',
	async (params = {}) => {
		const response = await productApi.getProducts(params)
		return response.items || response
	},
)

// Асинхронный thunk для получения товара по ID
export const fetchProductById = createAsyncThunk(
	'products/fetchById',
	async productId => {
		return await productApi.getProductById(productId)
	},
)

export const fetchRelatedProducts = createAsyncThunk(
	'products/fetchRelated',
	async ({ productId, type, limit = 3 }) => {
		// Получаем все товары
		const response = await productApi.getProducts({ limit: 100 })
		// ✅ response может быть объектом { items: [], total: ... } или массивом
		const allProducts = Array.isArray(response)
			? response
			: response.items || []

		let related = allProducts.filter(p => p.id !== productId && p.type === type)

		if (related.length < limit) {
			const otherProducts = allProducts.filter(
				p => p.id !== productId && p.type !== type,
			)
			related = [...related, ...otherProducts].slice(0, limit)
		}

		return related
	},
)

// Асинхронный thunk для получения случайных товаров
export const fetchRandomProducts = createAsyncThunk(
	'products/fetchRandom',
	async (limit = 3) => {
		const response = await productApi.getProducts({ limit: 100 })
		// ✅ response может быть объектом { items: [], total: ... } или массивом
		const allProducts = Array.isArray(response)
			? response
			: response.items || []
		const shuffled = [...allProducts].sort(() => 0.5 - Math.random())
		return shuffled.slice(0, limit)
	},
)

const productsSlice = createSlice({
	name: 'products',
	initialState: {
		productsList: [],
		currentProduct: null,
		relatedProducts: [],
		randomProducts: [],
		loading: false,
		error: null,
	},
	reducers: {
		clearCurrentProduct: state => {
			state.currentProduct = null
			state.relatedProducts = []
		},
	},
	extraReducers: builder => {
		builder
			// fetchAllProducts
			.addCase(fetchAllProducts.pending, state => {
				state.loading = true
				state.error = null
			})
			.addCase(fetchAllProducts.fulfilled, (state, action) => {
				state.loading = false
				state.productsList = action.payload
			})
			.addCase(fetchAllProducts.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message
			})
			// fetchProductById
			.addCase(fetchProductById.pending, state => {
				state.loading = true
				state.error = null
			})
			.addCase(fetchProductById.fulfilled, (state, action) => {
				state.loading = false
				state.currentProduct = action.payload
			})
			.addCase(fetchProductById.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message
			})
			// fetchRelatedProducts
			.addCase(fetchRelatedProducts.pending, state => {
				state.error = null
			})
			.addCase(fetchRelatedProducts.fulfilled, (state, action) => {
				state.relatedProducts = action.payload
			})
			.addCase(fetchRelatedProducts.rejected, (state, action) => {
				state.error = action.error.message
			})
			// fetchRandomProducts
			.addCase(fetchRandomProducts.pending, state => {
				state.loading = true
			})
			.addCase(fetchRandomProducts.fulfilled, (state, action) => {
				state.loading = false
				state.randomProducts = action.payload
			})
			.addCase(fetchRandomProducts.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message
			})
	},
})

export const { clearCurrentProduct } = productsSlice.actions
export default productsSlice.reducer
