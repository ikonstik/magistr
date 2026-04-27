import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Мок-данные для товаров
const mockProducts = [
	{
		id: '1',
		sku: 'LED-7W-E27-001',
		name: 'Лампочка № 1 самая лучшая',
		description:
			'Светит даже в выключенном состоянии. Энергосберегающая LED лампа мощностью 7W, цоколь E27, тёплый свет 2700K. Идеально для дома и офиса.',
		fullDescription:
			'Эта удивительная LED лампа обладает уникальной технологией "Вечный свет", которая позволяет ей светить даже когда она выключена. Экономия электроэнергии до 90% по сравнению с обычными лампами накаливания. Срок службы: 50 000 часов. Гарантия: 3 года.',
		price: 210,
		stock: 100,
		type: 'LED',
		wattage: 7,
		socket: 'E27',
		colorTemp: '2700K (тёплый)',
		brightness: '806 лм',
		lifeTime: '50000 ч',
		energyClass: 'A++',
		imageUrl: 'https://via.placeholder.com/400x400?text=Лампочка+№1',
		images: [
			'https://via.placeholder.com/400x400?text=Фото+1',
			'https://via.placeholder.com/400x400?text=Фото+2',
			'https://via.placeholder.com/400x400?text=Фото+3',
		],
		rating: 4.8,
		reviewsCount: 128,
	},
	{
		id: '2',
		sku: 'LED-12W-E14-002',
		name: 'LED лампа 12W E14 холодный свет',
		description: 'LED лампа мощностью 12W, цоколь E14, холодный свет 6500K.',
		fullDescription:
			'Яркая LED лампа для создания рабочего освещения. Холодный свет способствует концентрации внимания. Подходит для офисов и рабочих зон.',
		price: 220,
		stock: 150,
		type: 'LED',
		wattage: 12,
		socket: 'E14',
		colorTemp: '6500K (холодный)',
		brightness: '1200 лм',
		lifeTime: '40000 ч',
		energyClass: 'A+',
		imageUrl: 'https://via.placeholder.com/400x400?text=LED+12W+E14',
		images: [],
		rating: 4.5,
		reviewsCount: 89,
	},
	{
		id: '3',
		sku: 'INC-60W-E27-003',
		name: 'Лампа накаливания 60W E27 классическая',
		description: 'Классическая лампа накаливания 60W, цоколь E27.',
		fullDescription:
			'Традиционная лампа накаливания с тёплым мягким светом. Создаёт уютную атмосферу. Идеально для спален и гостиных.',
		price: 45,
		stock: 200,
		type: 'накаливания',
		wattage: 60,
		socket: 'E27',
		colorTemp: '2700K (тёплый)',
		brightness: '700 лм',
		lifeTime: '1000 ч',
		energyClass: 'E',
		imageUrl: 'https://via.placeholder.com/400x400?text=60W+E27',
		images: [],
		rating: 4.2,
		reviewsCount: 45,
	},
	{
		id: '4',
		sku: 'LED-20W-GU10-005',
		name: 'LED лампа 20W GU10 направленный свет',
		description: 'LED лампа 20W, цоколь GU10, направленный свет.',
		fullDescription:
			'Направленная LED лампа для точечных светильников. Создаёт акцентное освещение. Подходит для магазинов, галерей и выставочных залов.',
		price: 310,
		stock: 95,
		type: 'LED',
		wattage: 20,
		socket: 'GU10',
		colorTemp: '4000K (нейтральный)',
		brightness: '1600 лм',
		lifeTime: '30000 ч',
		energyClass: 'A+',
		imageUrl: 'https://via.placeholder.com/400x400?text=LED+20W+GU10',
		images: [],
		rating: 4.6,
		reviewsCount: 67,
	},
	{
		id: '5',
		sku: 'HAL-35W-G9-006',
		name: 'Галогеновая лампа 35W G9',
		description: 'Галогеновая лампа 35W, цоколь G9.',
		fullDescription:
			'Компактная галогеновая лампа для декоративного освещения. Даёт яркий чистый свет. Идеально для люстр и бра.',
		price: 95,
		stock: 120,
		type: 'галогеновая',
		wattage: 35,
		socket: 'G9',
		colorTemp: '3000K (тёплый)',
		brightness: '500 лм',
		lifeTime: '2000 ч',
		energyClass: 'D',
		imageUrl: 'https://via.placeholder.com/400x400?text=Halogen+35W',
		images: [],
		rating: 4.4,
		reviewsCount: 56,
	},
]

export const fetchAllProducts = createAsyncThunk(
	'products/fetchAll',
	async () => {
		// TODO: заменить на реальный API запрос
		return new Promise(resolve => {
			setTimeout(() => {
				resolve(mockProducts)
			}, 300)
		})
	},
)

// Асинхронный thunk для получения товара по ID
export const fetchProductById = createAsyncThunk(
	'products/fetchById',
	async productId => {
		return new Promise(resolve => {
			setTimeout(() => {
				const product = mockProducts.find(p => p.id === productId)
				resolve(product)
			}, 300)
		})
	},
)

// Асинхронный thunk для получения похожих товаров
export const fetchRelatedProducts = createAsyncThunk(
	'products/fetchRelated',
	async ({ productId, type, limit = 3 }) => {
		return new Promise(resolve => {
			setTimeout(() => {
				// Сначала пытаемся найти товары того же типа
				let related = mockProducts.filter(
					p => p.id !== productId && p.type === type,
				)

				if (related.length < limit) {
					const otherProducts = mockProducts.filter(
						p => p.id !== productId && p.type !== type,
					)
					related = [...related, ...otherProducts].slice(0, limit)
				}

				resolve(related)
			}, 200)
		})
	},
)

// Асинхронный thunk для получения случайных товаров
export const fetchRandomProducts = createAsyncThunk(
	'products/fetchRandom',
	async (limit = 3) => {
		// TODO: заменить на реальный API запрос
		// const response = await fetch(`http://localhost:8001/api/v1/products/random?limit=${limit}`);
		// return response.json();
		
		// Пока используем мок-данные
		return new Promise(resolve => {
			setTimeout(() => {
				const shuffled = [...mockProducts].sort(() => 0.5 - Math.random())
				const random = shuffled.slice(0, limit)
				resolve(random)
			}, 300)
		})
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
			// ✅ fetchAllProducts
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
			// ✅ fetchRandomProducts
			.addCase(fetchRandomProducts.pending, state => {
				state.loading = true
				state.error = null
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

export const { clearCurrentProduct, clearRandomProducts } = productsSlice.actions
export default productsSlice.reducer
