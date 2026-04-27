import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Мок-функция получения данных о заказе
export const fetchOrderByTrackingCode = createAsyncThunk(
	'tracking/fetchOrder',
	async (trackingCode, { rejectWithValue }) => {
		try {
			// TODO: заменить на реальный API запрос
			// const response = await fetch(`http://localhost:8002/api/v1/orders/track/${trackingCode}`);
			// return response.json();

			// Мок-данные для демонстрации
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					// Имитируем поиск заказа
					if (trackingCode === 'ORD-12345' || trackingCode === '12345') {
						resolve({
							success: true,
							tracking_code: 'ORD-12345',
							status: 'доставляется',
							estimated_delivery: '2026-05-18',
							current_location: 'Московская область, сортировочный центр',
							history: [
								{
									status: 'создан',
									location: 'Система',
									timestamp: '2026-04-20T10:00:00Z',
									description: 'Заказ создан и ожидает оплаты',
								},
								{
									status: 'оплачен',
									location: 'Онлайн',
									timestamp: '2026-04-20T10:05:00Z',
									description: 'Заказ успешно оплачен',
								},
								{
									status: 'на сборке',
									location: 'Склад завода',
									timestamp: '2026-04-20T14:30:00Z',
									description: 'Заказ передан на сборку',
								},
								{
									status: 'собран',
									location: 'Склад завода',
									timestamp: '2026-04-21T09:00:00Z',
									description: 'Заказ собран и упакован',
								},
								{
									status: 'передан в доставку',
									location: 'СДЭК',
									timestamp: '2026-04-21T15:00:00Z',
									description: 'Заказ передан службе доставки',
								},
								{
									status: 'доставляется',
									location: 'Московская область, сортировочный центр',
									timestamp: '2026-04-22T08:30:00Z',
									description: 'Заказ прибыл в сортировочный центр',
								},
							],
							customer_info: {
								name: 'Иван Петров',
								phone: '+7 (900) 123-45-67',
							},
							items: [
								{
									name: 'LED лампа 7W E27 тёплый свет',
									quantity: 2,
									price: 150,
								},
								{
									name: 'Лампа накаливания 60W E27',
									quantity: 1,
									price: 45,
								},
							],
							total: 345,
						})
					} else {
						reject({ message: 'Заказ с таким номером не найден' })
					}
				}, 800)
			})
		} catch (error) {
			return rejectWithValue(error.message)
		}
	},
)

const trackingSlice = createSlice({
	name: 'tracking',
	initialState: {
		trackingCode: '',
		order: null,
		loading: false,
		error: null,
		searched: false,
	},
	reducers: {
		setTrackingCode: (state, action) => {
			state.trackingCode = action.payload
		},
		clearTracking: state => {
			state.trackingCode = ''
			state.order = null
			state.error = null
			state.searched = false
		},
		clearError: state => {
			state.error = null
		},
	},
	extraReducers: builder => {
		builder
			.addCase(fetchOrderByTrackingCode.pending, state => {
				state.loading = true
				state.error = null
				state.searched = true
			})
			.addCase(fetchOrderByTrackingCode.fulfilled, (state, action) => {
				state.loading = false
				state.order = action.payload
				state.error = null
			})
			.addCase(fetchOrderByTrackingCode.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload?.message || 'Заказ не найден'
				state.order = null
			})
	},
})

export const { setTrackingCode, clearTracking, clearError } =
	trackingSlice.actions
export default trackingSlice.reducer
