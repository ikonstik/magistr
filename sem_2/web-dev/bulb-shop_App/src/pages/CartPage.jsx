import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
	Container,
	Grid,
	Typography,
	Button,
	Box,
	Divider,
	Paper,
} from '@mui/material'
import {
	ShoppingCart,
	ArrowBack,
	LocalShipping,
	Security,
	Payment,
} from '@mui/icons-material'
import CartItemRow from '../components/Cart/CartItemRow'
import RelatedProducts from '../components/RelatedProducts'
import { addToCart } from '../store/slices/cartSlice'
import { showSnackbar } from '../store/slices/uiSlice'
import { fetchRelatedProducts } from '../store/slices/productsSlice'
import PromoBanner from '../components/PromoBanner'

const CartPage = () => {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const cartItems = useSelector(state => state.cart.items)
	const { relatedProducts, loading } = useSelector(state => state.products)

	const [hasFetchedRelated, setHasFetchedRelated] = useState(false)

	const totalAmount = cartItems.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	)
	const deliveryCost = totalAmount > 2000 ? 0 : 300
	const finalAmount = totalAmount + deliveryCost
	const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

	// Загружаем похожие товары на основе первого товара в корзине
	useEffect(() => {
		if (cartItems.length > 0 && !hasFetchedRelated) {
			const firstProduct = cartItems[0]
			dispatch(
				fetchRelatedProducts({
					productId: firstProduct.id,
					type: firstProduct.type,
					limit: 3,
				}),
			)
			setHasFetchedRelated(true)
		}
	}, [cartItems, dispatch, hasFetchedRelated])

	const handleCheckout = () => {
		if (cartItems.length === 0) return
		navigate('/checkout')
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

	// Пустая корзина
	if (cartItems.length === 0) {
		return (
			<Container maxWidth='lg' sx={{ py: 8 }}>
				<Box sx={{ textAlign: 'center' }}>
					<ShoppingCart sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
					<Typography variant='h5' gutterBottom>
						Корзина пуста
					</Typography>
					<Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
						Добавьте товары в корзину, чтобы оформить заказ
					</Typography>
					<Button variant='contained' onClick={() => navigate('/')}>
						Перейти в каталог
					</Button>
				</Box>
			</Container>
		)
	}

	return (
		<Container maxWidth='lg' sx={{ py: 4 }}>
			<PromoBanner />

			<Typography variant='h4' gutterBottom>
				Корзина
			</Typography>

			<Box
				sx={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: 4,
					mb: 4,
				}}
			>
				{/* Левая колонка - товары */}
				<Box
					sx={{
						flex: '0 0 calc(65% - 16px)',
						minWidth: { xs: '100%', md: '300px' },
					}}
				>
					<Paper sx={{ overflow: 'hidden' }}>
						<Box
							sx={{
								p: 2,
								borderBottom: '1px solid',
								borderColor: 'divider',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								flexWrap: 'wrap',
								gap: 1,
							}}
						>
							<Typography variant='subtitle1' fontWeight='bold'>
								Товары в корзине ({totalItems} шт)
							</Typography>
							<Button size='small' onClick={() => navigate('/')}>
								+ Добавить товары
							</Button>
						</Box>

						{cartItems.map(item => (
							<CartItemRow key={item.id} item={item} />
						))}
					</Paper>
				</Box>
				
				{/* Правая колонка - итого */}
				<Box
					sx={{
						flex: '1 1 calc(35% - 16px)',
						minWidth: { xs: '100%', md: '350px' },
					}}
				>
					<Paper sx={{ p: 3, position: 'sticky', top: 16 }}>
						<Typography variant='h6' gutterBottom>
							Итого
						</Typography>

						<Box
							sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
						>
							<Typography variant='body2' color='text.secondary'>
								Товары ({totalItems} шт):
							</Typography>
							<Typography variant='body2'>
								{totalAmount.toLocaleString()} ₽
							</Typography>
						</Box>

						<Box
							sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
						>
							<Typography variant='body2' color='text.secondary'>
								Доставка:
							</Typography>
							<Typography
								variant='body2'
								color={deliveryCost === 0 ? 'success.main' : 'inherit'}
							>
								{deliveryCost === 0
									? 'Бесплатно'
									: `${deliveryCost.toLocaleString()} ₽`}
							</Typography>
						</Box>

						{totalAmount < 2000 && totalAmount > 0 && (
							<Typography
								variant='caption'
								color='text.secondary'
								sx={{ display: 'block', mb: 2 }}
							>
								Добавьте товаров на {(2000 - totalAmount).toLocaleString()} ₽
								для бесплатной доставки
							</Typography>
						)}

						<Divider sx={{ my: 2 }} />

						<Box
							sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}
						>
							<Typography variant='h6'>К оплате:</Typography>
							<Typography variant='h5' color='primary' fontWeight='bold'>
								{finalAmount.toLocaleString()} ₽
							</Typography>
						</Box>

						<Button
							fullWidth
							variant='contained'
							size='large'
							onClick={handleCheckout}
							sx={{ mb: 2 }}
						>
							Оформить заказ
						</Button>

						<Button
							fullWidth
							variant='outlined'
							startIcon={<ArrowBack />}
							onClick={() => navigate('/')}
						>
							Продолжить покупки
						</Button>

						{/* Блок преимуществ */}
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'space-around',
								flexWrap: 'wrap',
								gap: 2,
								mt: 3,
								pt: 2,
								borderTop: '1px solid',
								borderColor: 'divider',
							}}
						>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
								<LocalShipping fontSize='small' color='action' />
								<Typography variant='caption' color='text.secondary'>
									Доставка от 2000 ₽ бесплатно
								</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
								<Security fontSize='small' color='action' />
								<Typography variant='caption' color='text.secondary'>
									Гарантия 3 года
								</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
								<Payment fontSize='small' color='action' />
								<Typography variant='caption' color='text.secondary'>
									Оплата при получении
								</Typography>
							</Box>
						</Box>
					</Paper>
				</Box>

				{/* Блок "Вам может понравиться" с использованием RelatedProducts из Redux */}
				<Box sx={{ width: '100%', mt: 4 }}>
					{loading ? (
						<Typography textAlign='center' py={4}>
							Загрузка рекомендаций...
						</Typography>
					) : (
						<RelatedProducts
							products={relatedProducts}
							title='Вам может понравиться'
							onAddToCart={handleAddToCart}
						/>
					)}
				</Box>
			</Box>
		</Container>
	)
}

export default CartPage
