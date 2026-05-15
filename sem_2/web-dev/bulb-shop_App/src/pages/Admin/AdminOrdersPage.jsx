import React, { useState, useEffect } from 'react'
import {
	Typography,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	MenuItem,
	Select,
	FormControl,
	InputLabel,
	Box,
} from '@mui/material'
import { Visibility } from '@mui/icons-material'
import { orderApi } from '../../services/api'
import { useDispatch } from 'react-redux'
import { showSnackbar } from '../../store/slices/uiSlice'

const statusColors = {
	создан: 'default',
	'на сборке': 'warning',
	доставляется: 'info',
	доставлен: 'success',
	отменен: 'error',
}

const statuses = ['создан', 'на сборке', 'доставляется', 'доставлен', 'отменен']

const AdminOrdersPage = () => {
	const dispatch = useDispatch()
	const [orders, setOrders] = useState([])
	const [loading, setLoading] = useState(true)
	const [selectedOrder, setSelectedOrder] = useState(null)
	const [openDialog, setOpenDialog] = useState(false)

	useEffect(() => {
		loadOrders()
	}, [])

	const loadOrders = async () => {
		try {
			const data = await orderApi.getAllOrders(100, 0)
			setOrders(data.items || data)
		} catch (error) {
			dispatch(showSnackbar({ message: error.message, severity: 'error' }))
		} finally {
			setLoading(false)
		}
	}

	const handleViewOrder = order => {
		setSelectedOrder(order)
		setOpenDialog(true)
	}

	const handleStatusChange = async (orderId, newStatus) => {
		try {
			await orderApi.updateOrderStatus(orderId, newStatus, null)
			dispatch(
				showSnackbar({ message: 'Статус обновлён', severity: 'success' }),
			)
			loadOrders()
		} catch (error) {
			dispatch(showSnackbar({ message: error.message, severity: 'error' }))
		}
	}

	const formatDate = dateString => {
		return new Date(dateString).toLocaleString('ru-RU')
	}

	return (
		<Box>
			<Typography variant='h4' gutterBottom>
				Управление заказами
			</Typography>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Код отслеживания</TableCell>
							<TableCell>Клиент</TableCell>
							<TableCell>Сумма</TableCell>
							<TableCell>Дата</TableCell>
							<TableCell>Статус</TableCell>
							<TableCell align='center'>Действия</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={6} align='center'>
									Загрузка...
								</TableCell>
							</TableRow>
						) : (
							orders.map(order => (
								<TableRow key={order.id}>
									<TableCell>{order.tracking_code}</TableCell>
									<TableCell>
										{order.customer_first_name} {order.customer_last_name}
										<br />
										<Typography variant='caption' color='text.secondary'>
											{order.customer_phone}
										</Typography>
									</TableCell>
									<TableCell>{order.total} ₽</TableCell>
									<TableCell>{formatDate(order.created_at)}</TableCell>
									<TableCell>
										<FormControl size='small' sx={{ minWidth: 120 }}>
											<Select
												value={order.status}
												onChange={e =>
													handleStatusChange(order.id, e.target.value)
												}
											>
												{statuses.map(s => (
													<MenuItem key={s} value={s}>
														<Chip
															label={s}
															size='small'
															color={statusColors[s]}
														/>
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</TableCell>
									<TableCell align='center'>
										<IconButton onClick={() => handleViewOrder(order)}>
											<Visibility />
										</IconButton>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<Dialog
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				maxWidth='md'
				fullWidth
			>
				<DialogTitle>Детали заказа #{selectedOrder?.tracking_code}</DialogTitle>
				<DialogContent>
					{selectedOrder && (
						<Box sx={{ pt: 2 }}>
							<Typography variant='subtitle1' gutterBottom>
								Информация о клиенте
							</Typography>
							<Typography variant='body2'>
								{selectedOrder.customer_first_name}{' '}
								{selectedOrder.customer_last_name}
							</Typography>
							<Typography variant='body2'>
								{selectedOrder.customer_phone}
							</Typography>
							<Typography variant='body2'>
								{selectedOrder.customer_email}
							</Typography>
							<Typography variant='body2'>
								{selectedOrder.delivery_address}
							</Typography>

							<Typography variant='subtitle1' gutterBottom sx={{ mt: 2 }}>
								Состав заказа
							</Typography>
							{selectedOrder.items?.map((item, idx) => (
								<Box
									key={idx}
									sx={{
										display: 'flex',
										justifyContent: 'space-between',
										py: 1,
									}}
								>
									<Typography variant='body2'>
										{item.product_name} x{item.quantity}
									</Typography>
									<Typography variant='body2'>
										{item.price * item.quantity} ₽
									</Typography>
								</Box>
							))}
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'space-between',
									mt: 2,
									pt: 2,
									borderTop: '1px solid #eee',
								}}
							>
								<Typography variant='h6'>Итого:</Typography>
								<Typography variant='h6'>{selectedOrder.total} ₽</Typography>
							</Box>
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenDialog(false)}>Закрыть</Button>
				</DialogActions>
			</Dialog>
		</Box>
	)
}

export default AdminOrdersPage
