import React from 'react'
import { Box, Typography, IconButton, TextField, Paper } from '@mui/material'
import { Delete, Add, Remove } from '@mui/icons-material'
import { useDispatch } from 'react-redux'
import { updateQuantity, removeFromCart } from '../../store/slices/cartSlice'
import { showSnackbar } from '../../store/slices/uiSlice'

const CartItemRow = ({ item }) => {
	const dispatch = useDispatch()

	const handleQuantityChange = newQuantity => {
		if (newQuantity >= 1 && newQuantity <= item.stock) {
			dispatch(updateQuantity({ productId: item.id, quantity: newQuantity }))
		} else if (newQuantity > item.stock) {
			dispatch(
				showSnackbar({
					message: `На складе только ${item.stock} шт`,
					severity: 'warning',
				}),
			)
		}
	}

	const handleRemove = () => {
		dispatch(removeFromCart(item.id))
		dispatch(
			showSnackbar({
				message: 'Товар удалён из корзины',
				severity: 'info',
			}),
		)
	}

	return (
		<Box
			sx={{
				display: 'flex',
				p: 2,
				borderBottom: '1px solid',
				borderColor: 'divider',
				transition: 'background-color 0.2s',
				'&:hover': { bgcolor: 'action.hover' },
				flexDirection: { xs: 'column', sm: 'row' },
				gap: { xs: 2, sm: 0 },
			}}
		>
			{/* Изображение */}
			<Box
				sx={{
					width: { xs: '100%', sm: 100 },
					height: { xs: 120, sm: 100 },
					flexShrink: 0,
					bgcolor: 'grey.100',
					borderRadius: 1,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					overflow: 'hidden',
				}}
			>
				<img
					src={
						item.imageUrl || 'https://via.placeholder.com/100x100?text=Лампочка'
					}
					alt={item.name}
					style={{ width: '100%', height: '100%', objectFit: 'contain' }}
				/>
			</Box>

			{/* Информация о товаре */}
			<Box sx={{ flex: 1, ml: { xs: 0, sm: 2 } }}>
				<Typography variant='subtitle1' fontWeight='bold' gutterBottom>
					{item.name}
				</Typography>
				<Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
					{item.socket} • {item.wattage} Вт • {item.type}
				</Typography>
				<Typography variant='body2' color='text.secondary'>
					Артикул: {item.sku}
				</Typography>
			</Box>

			{/* Действия с товаром */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: 3,
					flexWrap: 'wrap',
					justifyContent: { xs: 'space-between', sm: 'flex-end' },
					mt: { xs: 2, sm: 0 },
				}}
			>
				{/* Контроль количества */}
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 1,
						bgcolor: 'grey.50',
						borderRadius: 1,
						p: 0.5,
						width: 140,
						textAlign: 'center',
					}}
				>
					<IconButton
						size='small'
						onClick={() => handleQuantityChange(item.quantity - 1)}
						disabled={item.quantity <= 1}
					>
						<Remove fontSize='small' />
					</IconButton>
					<TextField
						size='small'
						value={item.quantity}
						onChange={e => handleQuantityChange(parseInt(e.target.value) || 1)}
						inputProps={{
							style: { textAlign: 'center', width: 50 },
							min: 1,
							max: item.stock,
						}}
					/>
					<IconButton
						size='small'
						onClick={() => handleQuantityChange(item.quantity + 1)}
						disabled={item.quantity >= item.stock}
					>
						<Add fontSize='small' />
					</IconButton>
				</Box>

				{/* Сумма */}
				<Typography
					variant='h6'
					color='primary'
					sx={{ minWidth: 100, textAlign: 'right' }}
				>
					{(item.price * item.quantity).toLocaleString()} ₽
				</Typography>

				{/* Кнопка удаления */}
				<IconButton color='error' onClick={handleRemove}>
					<Delete />
				</IconButton>
			</Box>
		</Box>
	)
}

export default CartItemRow
