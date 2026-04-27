import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './slices/cartSlice'
import productsReducer from './slices/productsSlice'
import orderReducer from './slices/orderSlice'
import uiReducer from './slices/uiSlice'
import trackingReducer from './slices/trackingSlice'

export const store = configureStore({
	reducer: {
		cart: cartReducer,
		products: productsReducer,
		order: orderReducer,
		ui: uiReducer,
		tracking: trackingReducer,
	},
})

export default store
