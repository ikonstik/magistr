import { createSlice } from '@reduxjs/toolkit'

const loadCartFromStorage = () => {
	try {
		const savedCart = localStorage.getItem('cart')
		return savedCart ? JSON.parse(savedCart) : []
	} catch {
		return []
	}
}

const saveCartToStorage = cart => {
	localStorage.setItem('cart', JSON.stringify(cart))
}

const cartSlice = createSlice({
	name: 'cart',
	initialState: {
		items: loadCartFromStorage(),
	},
	reducers: {
		addToCart: (state, action) => {
			const { product, quantity = 1 } = action.payload
			const existingItem = state.items.find(item => item.id === product.id)

			if (existingItem) {
				const newQuantity = existingItem.quantity + quantity
				existingItem.quantity =
					newQuantity <= product.stock ? newQuantity : product.stock
			} else {
				state.items.push({
					...product,
					quantity: Math.min(quantity, product.stock),
				})
			}
			saveCartToStorage(state.items)
		},
		removeFromCart: (state, action) => {
			state.items = state.items.filter(item => item.id !== action.payload)
			saveCartToStorage(state.items)
		},
		updateQuantity: (state, action) => {
			const { productId, quantity } = action.payload
			const item = state.items.find(item => item.id === productId)
			if (item && quantity >= 1 && quantity <= item.stock) {
				item.quantity = quantity
				saveCartToStorage(state.items)
			}
		},
		clearCart: state => {
			state.items = []
			saveCartToStorage(state.items)
		},
	},
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
	cartSlice.actions
export default cartSlice.reducer
