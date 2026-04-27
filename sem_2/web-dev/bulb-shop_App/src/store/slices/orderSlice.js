import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Мок-функция отправки заказа (позже заменить на реальный API)
export const submitOrder = createAsyncThunk(
	'order/submit',
	async (orderData, { rejectWithValue }) => {
		try {
			// TODO: заменить на реальный запрос к бэкенду
			// const response = await fetch('http://localhost:8002/api/v1/orders', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify(orderData),
			// });

			// Мок-ответ
			return new Promise(resolve => {
				setTimeout(() => {
					resolve({
						success: true,
						orderId: `ORD-${Math.floor(Math.random() * 90000) + 10000}`,
						trackingCode: `TRK-${Math.floor(Math.random() * 90000) + 10000}`,
					})
				}, 1500)
			})
		} catch (error) {
			return rejectWithValue(error.message)
		}
	},
)

const orderSlice = createSlice({
	name: 'order',
	initialState: {
		currentOrder: null,
		loading: false,
		error: null,
		orderSubmitted: false,
	},
	reducers: {
		resetOrderState: state => {
			state.currentOrder = null
			state.loading = false
			state.error = null
			state.orderSubmitted = false
		},
		clearError: state => {
			state.error = null
		},
	},
	extraReducers: builder => {
		builder
			.addCase(submitOrder.pending, state => {
				state.loading = true
				state.error = null
			})
			.addCase(submitOrder.fulfilled, (state, action) => {
				state.loading = false
				state.orderSubmitted = true
				state.currentOrder = action.payload
			})
			.addCase(submitOrder.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload
			})
	},
})

export const { resetOrderState, clearError } = orderSlice.actions
export default orderSlice.reducer
