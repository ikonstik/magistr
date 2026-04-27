import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
	Card,
	CardMedia,
	CardContent,
	CardActions,
	Typography,
	Button,
	Box,
	Chip,
} from '@mui/material'
import { AddShoppingCart } from '@mui/icons-material'
import { addToCart } from '../../store/slices/cartSlice'
import { showSnackbar } from '../../store/slices/uiSlice'

const ProductCard = ({ product }) => {
	const navigate = useNavigate()
	const dispatch = useDispatch()

	const handleCardClick = () => {
		navigate(`/product/${product.id}`)
	}

	const handleAddToCart = e => {
		e.stopPropagation()
		dispatch(addToCart({ product, quantity: 1 }))
		dispatch(
			showSnackbar({
				message: `${product.name} добавлен в корзину`,
				severity: 'success',
			}),
		)
	}

	return (
		<Card
			onClick={handleCardClick}
			sx={{
				cursor: 'pointer',
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				transition: 'transform 0.2s, box-shadow 0.2s',
				'&:hover': {
					transform: 'translateY(-4px)',
					boxShadow: 4,
				},
			}}
		>
			{/* Фиксированная высота изображения */}
			<CardMedia
				component='img'
				sx={{
					height: 180,
					objectFit: 'contain',
					bgcolor: '#f5f5f5',
					p: 2,
				}}
				image={
					product.imageUrl ||
					'https://via.placeholder.com/300x180?text=Лампочка'
				}
				alt={product.name}
			/>

			<CardContent sx={{ flexGrow: 1, p: 2 }}>
				<Box
					sx={{
						display: 'flex',
						gap: 0.5,
						mb: 1,
						flexWrap: 'wrap',
						minHeight: 48,
					}}
				>
					<Chip label={product.type} size='small' sx={{ fontSize: '0.7rem' }} />
					<Chip
						label={`${product.wattage} Вт`}
						size='small'
						sx={{ fontSize: '0.7rem' }}
					/>
					<Chip
						label={product.socket}
						size='small'
						variant='outlined'
						sx={{ fontSize: '0.7rem' }}
					/>
				</Box>

				<Typography
					variant='subtitle1'
					gutterBottom
					sx={{
						fontWeight: 'bold',
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
						minHeight: '3.2em',
						fontSize: '1rem',
					}}
				>
					{product.name}
				</Typography>

				<Typography
					variant='h6'
					color='primary'
					fontWeight='bold'
					sx={{ mt: 1 }}
				>
					{product.price.toLocaleString()} ₽
				</Typography>
			</CardContent>

			<CardActions sx={{ p: 2, pt: 0 }}>
				<Button
					fullWidth
					variant='contained'
					size='small'
					startIcon={<AddShoppingCart />}
					onClick={handleAddToCart}
				>
					В корзину
				</Button>
			</CardActions>
		</Card>
	)
}

export default ProductCard
