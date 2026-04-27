import React from 'react'
import {
	Paper,
	Typography,
	Box,
	Chip,
	Grid,
	Divider,
	Alert,
} from '@mui/material'
import {
	LocationOn,
	CalendarToday,
	Person,
	Phone,
	ShoppingBag,
} from '@mui/icons-material'
import OrderStatusTimeline from './OrderStatusTimeline'

const getStatusChipColor = status => {
	const colors = {
		создан: 'default',
		оплачен: 'info',
		'на сборке': 'warning',
		собран: 'warning',
		'передан в доставку': 'info',
		доставляется: 'primary',
		доставлен: 'success',
		отменен: 'error',
	}
	return colors[status] || 'default'
}

const getStatusText = status => {
	const texts = {
		создан: 'Заказ создан',
		оплачен: 'Оплачен',
		'на сборке': 'На сборке',
		собран: 'Собран',
		'передан в доставку': 'Передан в доставку',
		доставляется: 'В пути',
		доставлен: 'Доставлен',
		отменен: 'Отменён',
	}
	return texts[status] || status
}

const OrderTrackingInfo = ({ order }) => {
	if (!order) return null

	return (
		<Box>
			{/* Основная информация */}
			<Paper sx={{ p: 3, mb: 3 }}>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						flexWrap: 'wrap',
						mb: 2,
					}}
				>
					<Typography variant='h6'>Заказ №{order.tracking_code}</Typography>
					<Chip
						label={getStatusText(order.status)}
						color={getStatusChipColor(order.status)}
						sx={{ fontWeight: 'bold' }}
					/>
				</Box>

				<Divider sx={{ my: 2 }} />

				{/* Статус и местоположение */}
				<Alert
					severity={order.status === 'доставляется' ? 'info' : 'success'}
					icon={<LocationOn />}
					sx={{ mb: 3 }}
				>
					<Typography variant='subtitle2'>
						Ваш заказ{' '}
						{order.status === 'доставляется'
							? 'в пути'
							: order.status === 'доставлен'
								? 'доставлен'
								: 'обрабатывается'}
					</Typography>
					{order.current_location && (
						<Typography variant='body2'>
							Текущее местоположение: {order.current_location}
						</Typography>
					)}
				</Alert>

				{/* Ориентировочная дата доставки */}
				{order.estimated_delivery && order.status !== 'доставлен' && (
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
						<CalendarToday color='action' fontSize='small' />
						<Typography variant='body2'>
							Ориентировочное время доставки:{' '}
							{new Date(order.estimated_delivery).toLocaleDateString('ru-RU')}{' '}
							г.
						</Typography>
					</Box>
				)}

				{/* Информация о получателе */}
				{order.customer_info && (
					<Box sx={{ mt: 2 }}>
						<Typography variant='subtitle2' gutterBottom>
							Информация о получателе
						</Typography>
						<Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
								<Person fontSize='small' color='action' />
								<Typography variant='body2'>
									{order.customer_info.name}
								</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
								<Phone fontSize='small' color='action' />
								<Typography variant='body2'>
									{order.customer_info.phone}
								</Typography>
							</Box>
						</Box>
					</Box>
				)}
			</Paper>

			{/* Состав заказа */}
			{order.items && order.items.length > 0 && (
				<Paper sx={{ p: 3, mb: 3 }}>
					<Typography variant='h6' gutterBottom>
						<ShoppingBag sx={{ mr: 1, verticalAlign: 'middle' }} />
						Состав заказа
					</Typography>
					<Divider sx={{ mb: 2 }} />
					<Grid container spacing={2}>
						{order.items.map((item, index) => (
							<Grid item xs={12} key={index}>
								<Box
									sx={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
										flexWrap: 'wrap',
									}}
								>
									<Typography variant='body1'>
										{item.name}
										<Typography
											component='span'
											variant='body2'
											color='text.secondary'
											sx={{ ml: 1 }}
										>
											x{item.quantity}
										</Typography>
									</Typography>
									<Typography variant='body2' color='primary'>
										{(item.price * item.quantity).toLocaleString()} ₽
									</Typography>
								</Box>
							</Grid>
						))}
					</Grid>
					<Divider sx={{ my: 2 }} />
					<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
						<Typography variant='h6'>
							Итого: {order.total.toLocaleString()} ₽
						</Typography>
					</Box>
				</Paper>
			)}

			{/* История перемещений */}
			<OrderStatusTimeline history={order.history} />
		</Box>
	)
}

export default OrderTrackingInfo
