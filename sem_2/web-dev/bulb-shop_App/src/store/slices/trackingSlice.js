import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { orderApi } from '../../services/api'

// Асинхронный thunk для получения заказа по трек-коду
export const fetchOrderByTrackingCode = createAsyncThunk(
	'tracking/fetchOrder',
	async (trackingCode, { rejectWithValue }) => {
		try {
			const order = await orderApi.trackOrder(trackingCode)
			return order
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
				state.error = action.payload || 'Заказ не найден'
				state.order = null
			})
	},
})

export const { setTrackingCode, clearTracking, clearError } =
	trackingSlice.actions
export default trackingSlice.reducer
