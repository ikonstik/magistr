import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import {
	Container,
	Box,
	Alert,
	CircularProgress,
	Typography,
} from '@mui/material'
import {
	fetchOrderByTrackingCode,
	setTrackingCode,
	clearTracking,
	clearError,
} from '../store/slices/trackingSlice'
import { fetchRandomProducts } from '../store/slices/productsSlice'
import TrackingForm from '../components/Tracking/TrackingForm'
import OrderTrackingInfo from '../components/Tracking/OrderTrackingInfo'
import PromoBanner from '../components/PromoBanner'
import RelatedProducts from '../components/RelatedProducts'
import { addToCart } from '../store/slices/cartSlice'
import { showSnackbar } from '../store/slices/uiSlice'

const OrderTrackingPage = () => {
	const dispatch = useDispatch()
	const location = useLocation()
	const { trackingCode, order, loading, error } = useSelector(
		state => state.tracking,
	)
	const { randomProducts, loading: productsLoading } = useSelector(
		state => state.products,
	)

	const [hasFetchedRandom, setHasFetchedRandom] = useState(false)

	// Получение trackingCode из state (при переходе со страницы успешного заказа)
	useEffect(() => {
		if (location.state?.trackingCode) {
			dispatch(setTrackingCode(location.state.trackingCode))
			dispatch(fetchOrderByTrackingCode(location.state.trackingCode))
		}
	}, [dispatch, location.state])

	// Загружаем 3 случайных товара при монтировании компонента
	useEffect(() => {
		if (!hasFetchedRandom) {
			dispatch(fetchRandomProducts(3))
			setHasFetchedRandom(true)
		}
	}, [dispatch, hasFetchedRandom])

	// Очистка при размонтировании
	useEffect(() => {
		return () => {
			dispatch(clearTracking())
		}
	}, [dispatch])

	const handleSearch = code => {
		dispatch(setTrackingCode(code))
		dispatch(fetchOrderByTrackingCode(code))
	}

	const handleAddToCart = product => {
		dispatch(addToCart({ product, quantity: 1 }))
		dispatch(
			showSnackbar({
				message: 'Товар добавлен в корзину',
				severity: 'success',
			}),
		)
	}

	const handleClearError = () => {
		dispatch(clearError())
	}

	return (
		<Container maxWidth='lg' sx={{ py: 4 }}>
			{/* Баннер с акциями */}
			<PromoBanner />

			{/* Заголовок */}
			<Typography variant='h4' gutterBottom>
				Отслеживание заказа
			</Typography>

			{/* Форма поиска */}
			<TrackingForm
				initialCode={trackingCode}
				onSubmit={handleSearch}
				loading={loading}
			/>

			{/* Состояние загрузки заказа */}
			{loading && (
				<Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
					<CircularProgress />
				</Box>
			)}

			{/* Ошибка */}
			{error && !loading && (
				<Alert severity='error' sx={{ mt: 3 }} onClose={handleClearError}>
					{error}
				</Alert>
			)}

			{/* Информация о заказе */}
			{order && !loading && !error && (
				<Box sx={{ mt: 4 }}>
					<OrderTrackingInfo order={order} />
				</Box>
			)}

			{/* Блок "Вам может понравиться" - 3 случайных товара */}
			<Box sx={{ width: '100%', mt: 4 }}>
				{productsLoading ? (
					<Typography py={4}>
						Загрузка рекомендаций...
					</Typography>
				) : (
					<RelatedProducts
						products={randomProducts}
						title='Вам может понравиться'
						onAddToCart={handleAddToCart}
					/>
				)}
			</Box>
		</Container>
	)
}

export default OrderTrackingPage
