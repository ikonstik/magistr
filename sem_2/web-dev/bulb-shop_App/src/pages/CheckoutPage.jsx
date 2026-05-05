import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
	Container,
	Grid,
	Typography,
	Stepper,
	Step,
	StepLabel,
	Box,
	Alert,
	Button,
} from '@mui/material'
import AddressForm from '../components/Checkout/AddressForm'
import PromoBanner from '../components/PromoBanner'
import DeliveryPaymentForm from '../components/Checkout/DeliveryPaymentForm'
import OrderSummary from '../components/Checkout/OrderSummary'
import SuccessPage from '../components/Checkout/SuccessPage'
import {
	submitOrder,
	resetOrderState,
	clearError,
} from '../store/slices/orderSlice'
import { clearCart } from '../store/slices/cartSlice'

const steps = ['Данные получателя', 'Доставка и оплата', 'Подтверждение']

const CheckoutPage = () => {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const cartItems = useSelector(state => state.cart.items)
	const { loading, error, orderSubmitted, currentOrder } = useSelector(
		state => state.order,
	)

	const [activeStep, setActiveStep] = useState(0)
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		address: '',
		postalCode: '',
		country: 'Россия',
		deliveryMethod: 'СДЭК',
		city: 'Москва',
		pickupPoint: '',
		paymentMethod: 'card_online',
		comment: '',
		subscribeNewsletter: true,
	})

	// Пересчёт суммы
	const totalAmount = cartItems.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	)
	const deliveryCost = totalAmount > 2000 ? 0 : 300
	const finalAmount = totalAmount + deliveryCost

	// Проверка заполнения формы
	const isAddressValid = () => {
		return (
			formData.firstName &&
			formData.lastName &&
			formData.email &&
			formData.phone &&
			formData.address
		)
	}

	const isDeliveryValid = () => {
		if (formData.deliveryMethod === 'Самовывоз' && !formData.pickupPoint)
			return false
		if (
			formData.deliveryMethod !== 'Курьерская доставка' &&
			!formData.pickupPoint
		)
			return false
		return true
	}

	const handleFormChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }))
		if (error) dispatch(clearError())
	}

	const handleNext = () => {
		if (activeStep === 0 && !isAddressValid()) return
		if (activeStep === 1 && !isDeliveryValid()) return
		setActiveStep(prev => prev + 1)
	}

	const handleBack = () => {
		setActiveStep(prev => prev - 1)
	}

	const handleSubmitOrder = async () => {
		if (!isAddressValid() || !isDeliveryValid()) return

		// Формируем данные для отправки
		const orderData = {
			customer_first_name: formData.firstName,
			customer_last_name: formData.lastName,
			customer_phone: formData.phone,
			customer_email: formData.email,
			delivery_address: `${formData.address}, г. ${formData.city}, ${formData.postalCode}`,
			delivery_method: formData.deliveryMethod,
			payment_method: formData.paymentMethod,
			items: cartItems.map(item => ({
				product_id: item.id,
				quantity: item.quantity,
			})),
		}

		const result = await dispatch(submitOrder(orderData))

		if (result.payload?.success) {
			dispatch(clearCart())
		}
	}

	// Если корзина пуста, перенаправляем в каталог
	useEffect(() => {
		if (cartItems.length === 0 && !orderSubmitted) {
			navigate('/')
		}
	}, [cartItems, navigate, orderSubmitted])

	// Очищаем состояние заказа при размонтировании
	useEffect(() => {
		return () => {
			dispatch(resetOrderState())
		}
	}, [dispatch])

	// Страница успеха
	if (orderSubmitted) {
		return (
			<Container maxWidth='lg' sx={{ py: 4 }}>
				<SuccessPage order={currentOrder} />
			</Container>
		)
	}

	return (
		<Container maxWidth='lg' sx={{ py: 4 }}>
			<PromoBanner />

			<Typography variant='h4' gutterBottom>
				Оформление заказа
			</Typography>

			<Stepper activeStep={activeStep} sx={{ mb: 4 }}>
				{steps.map(label => (
					<Step key={label}>
						<StepLabel>{label}</StepLabel>
					</Step>
				))}
			</Stepper>

			{error && (
				<Alert
					severity='error'
					sx={{ mb: 3 }}
					onClose={() => dispatch(clearError())}
				>
					{error}
				</Alert>
			)}

			<Box
				sx={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: 4,
					mb: 4,
				}}
			>
				{/* Левая колонка - формы */}
				<Box
					sx={{
						flex: '0 0 calc(55% - 16px)',
						minWidth: { xs: '100%', md: '300px' },
					}}
				>
					<Grid xs={12} md={9}>
						{activeStep === 0 && (
							<AddressForm formData={formData} onChange={handleFormChange} />
						)}
						{activeStep === 1 && (
							<DeliveryPaymentForm
								formData={formData}
								onChange={handleFormChange}
							/>
						)}
						{activeStep === 2 && (
							<Box>
								<AddressForm
									formData={formData}
									onChange={handleFormChange}
									readOnly
								/>
								<Box sx={{ mt: 2 }}>
									<DeliveryPaymentForm
										formData={formData}
										onChange={handleFormChange}
										readOnly
									/>
								</Box>
							</Box>
						)}
					</Grid>
				</Box>

				{/* Правая колонка - итоги */}
				<Box
					sx={{
						flex: '0 0 calc(45% - 16px)',
						minWidth: { xs: '100%', md: '300px' },
					}}
				>
					<Grid xs={12} md={5}>
						<OrderSummary
							cartItems={cartItems}
							totalAmount={totalAmount}
							deliveryCost={deliveryCost}
							finalAmount={finalAmount}
							loading={loading}
							onSubmit={activeStep === 2 ? handleSubmitOrder : handleNext}
							step={activeStep}
						/>
					</Grid>

					{/* Кнопки навигации */}
			<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
				{activeStep > 0 && (
					<Button onClick={handleBack} disabled={loading}>
						Назад
					</Button>
				)}
			</Box>
				</Box>
			</Box>
		</Container>
	)
}

export default CheckoutPage
