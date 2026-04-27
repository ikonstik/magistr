import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Snackbar, Alert } from '@mui/material'

import { store } from './store/store'
import { useSelector, useDispatch } from 'react-redux'
import { hideSnackbar } from './store/slices/uiSlice'

import Header from './components/Header'
import CatalogPage from './pages/CatalogPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderTrackingPage from './pages/OrderTrackingPage'
// import AdminPage from './pages/AdminPage'

// Тема Material UI
const theme = createTheme({
	palette: {
		primary: {
			main: '#ff6b35',
		},
		secondary: {
			main: '#2b2d42',
		},
	},
	typography: {
		fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
	},
})

// Компонент для отображения уведомлений
const AppSnackbar = () => {
	const dispatch = useDispatch()
	const { snackbar } = useSelector(state => state.ui)

	const handleClose = () => {
		dispatch(hideSnackbar())
	}

	return (
		<Snackbar
			open={snackbar.open}
			autoHideDuration={3000}
			onClose={handleClose}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
		>
			<Alert
				onClose={handleClose}
				severity={snackbar.severity}
				sx={{ width: '100%' }}
			>
				{snackbar.message}
			</Alert>
		</Snackbar>
	)
}

// Основной компонент приложения
const AppContent = () => {
	const cartItemsCount = useSelector(state =>
		state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
	)

	return (
		<>
			<Header cartItemsCount={cartItemsCount} />
			<Routes>
				<Route path='/' element={<CatalogPage />} />
				<Route path='/product/:id' element={<ProductPage />} />
				<Route path='/cart' element={<CartPage />} />
				<Route path='/checkout' element={<CheckoutPage />} />
				<Route path='/tracking' element={<OrderTrackingPage />} />
			</Routes>
			<AppSnackbar />
		</>
	)
}

function App() {
	return (
		<Provider store={store}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Router>
					<AppContent />
				</Router>
			</ThemeProvider>
		</Provider>
	)
}

export default App
