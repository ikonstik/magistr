import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { orderApi } from '../../services/api'

// Асинхронный thunk для отправки заказа
export const submitOrder = createAsyncThunk(
	'order/submit',
	async (orderData, { rejectWithValue }) => {
		try {
			const response = await orderApi.createOrder(orderData)
			return {
				success: true,
				orderId: response.id,
				trackingCode: response.tracking_code,
				order: response,
			}
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
