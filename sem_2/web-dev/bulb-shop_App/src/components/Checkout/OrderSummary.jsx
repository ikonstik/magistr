import React from 'react'
import {
	Paper,
	Typography,
	Box,
	Divider,
	Button,
	CircularProgress,
} from '@mui/material'

const OrderSummary = ({
	cartItems,
	totalAmount,
	deliveryCost,
	finalAmount,
	onSubmit,
	loading,
	step
}) => {
	const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

	const getButtonText = () => {
		if (step === 2) return 'Оплатить'
		return 'Далее'
	}

	return (
		<Paper sx={{ p: 3, position: 'sticky', top: 16 }}>
			<Typography variant='h6' gutterBottom>
				Ваш заказ
			</Typography>

			<Box sx={{ maxHeight: 300, overflow: 'auto', mb: 2 }}>
				{cartItems.map(item => (
					<Box
						key={item.id}
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							mb: 1,
							pb: 1,
							borderBottom: '1px solid',
							borderColor: 'divider',
							gap: 1,
						}}
					>
						<Typography
							variant='body2'
							noWrap
							sx={{
								flex: 2,
								minWidth: 0,
							}}
						>
							{item.name}
						</Typography>

						<Typography
							variant='body2'
							sx={{
								flex: 0.5,
								textAlign: 'center',
								paddingLeft: 5,
							}}
						>
							{item.quantity} шт.
						</Typography>

						<Typography
							variant='body2'
							color='primary'
							sx={{
								flex: 1,
								textAlign: 'right',
								fontWeight: 500,
							}}
						>
							{(item.price * item.quantity).toLocaleString()} ₽
						</Typography>
					</Box>
				))}
			</Box>

			<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
				<Typography variant='body2' color='text.secondary'>
					Товары ({totalItems} шт):
				</Typography>
				<Typography variant='body2'>
					{totalAmount.toLocaleString()} ₽
				</Typography>
			</Box>

			<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
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

			<Divider sx={{ my: 2 }} />

			<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
				<Typography variant='h6'>Итого:</Typography>
				<Typography variant='h5' color='primary' fontWeight='bold'>
					{finalAmount.toLocaleString()} ₽
				</Typography>
			</Box>

			{deliveryCost > 0 && (
				<Typography
					variant='caption'
					color='text.secondary'
					display='block'
					sx={{ mb: 2 }}
				>
					Стоимость доставки составляет {deliveryCost.toLocaleString()} ₽
				</Typography>
			)}

			<Divider sx={{ my: 2 }} />

			<Button
				fullWidth
				variant='contained'
				size='large'
				onClick={onSubmit}
				disabled={loading}
				sx={{ mb: 2 }}
			>
				{loading ? <CircularProgress size={24} /> : getButtonText()}
			</Button>

			<Typography
				variant='caption'
				color='text.secondary'
				textAlign='center'
				display='block'
			>
				Нажимая кнопку {getButtonText()}, вы соглашаетесь с условиями оферты
			</Typography>
		</Paper>
	)
}

export default OrderSummary
