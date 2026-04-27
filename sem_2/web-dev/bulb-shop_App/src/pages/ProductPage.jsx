import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
	Container,
	Typography,
	Box,
	Button,
	Divider,
	Rating,
	Chip,
	Breadcrumbs,
	Link,
	Skeleton,
	Paper,
	Grid,
} from '@mui/material'
import {
	ArrowBack,
	ShoppingCart,
	FavoriteBorder,
	Share,
} from '@mui/icons-material'
import {
	fetchProductById,
	fetchRelatedProducts,
	clearCurrentProduct,
} from '../store/slices/productsSlice'
import { addToCart } from '../store/slices/cartSlice'
import { showSnackbar } from '../store/slices/uiSlice'
import QuantitySelector from '../components/Product/QuantitySelector'
import ProductImageGallery from '../components/Product/ProductImageGallery'
import ProductSpecs from '../components/Product/ProductSpecs'
import RelatedProducts from '../components/RelatedProducts'
import PromoBanner from '../components/PromoBanner'

const ProductPage = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const dispatch = useDispatch()

	const {
		currentProduct: product,
		relatedProducts,
		loading,
		error,
	} = useSelector(state => state.products)

	const [quantity, setQuantity] = useState(1)

	useEffect(() => {
		if (id) {
			dispatch(fetchProductById(id))
		}
		return () => {
			dispatch(clearCurrentProduct())
		}
	}, [dispatch, id])

	useEffect(() => {
		if (product) {
			dispatch(
				fetchRelatedProducts({
					productId: product.id,
					type: product.type,
					limit: 3,
				}),
			)
		}
	}, [dispatch, product])

	const handleAddToCart = () => {
		if (product.stock > 0) {
			dispatch(addToCart({ product, quantity }))
			dispatch(
				showSnackbar({
					message: 'Товар добавлен в корзину',
					severity: 'success',
				}),
			)
		}
	}

	const handleBuyNow = () => {
		if (product.stock > 0) {
			dispatch(addToCart({ product, quantity }))
			navigate('/checkout')
		}
	}

	if (loading) {
		return (
			<Container maxWidth='lg' sx={{ py: 4 }}>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
					<Box sx={{ flex: '0 0 40%' }}>
						<Skeleton variant='rectangular' height={400} animation='wave' />
					</Box>
					<Box sx={{ flex: '1 1 50%' }}>
						<Skeleton variant='text' height={40} width='80%' />
						<Skeleton variant='text' height={30} width='60%' />
						<Skeleton variant='text' height={100} />
						<Skeleton variant='text' height={50} width='40%' />
					</Box>
				</Box>
			</Container>
		)
	}

	if (error || !product) {
		return (
			<Container maxWidth='lg' sx={{ py: 8, textAlign: 'center' }}>
				<PromoBanner />

				<Typography variant='h5' color='error' gutterBottom>
					{error || 'Товар не найден'}
				</Typography>
				<Button variant='contained' onClick={() => navigate('/')}>
					Вернуться в каталог
				</Button>
			</Container>
		)
	}

	return (
		<Container maxWidth='lg' sx={{ py: 4 }}>
			<PromoBanner />

			{/* Хлебные крошки */}
			<Breadcrumbs sx={{ mb: 3 }}>
				<Link
					color='inherit'
					onClick={() => navigate('/')}
					sx={{ cursor: 'pointer' }}
				>
					Главная
				</Link>
				<Link
					color='inherit'
					onClick={() => navigate('/')}
					sx={{ cursor: 'pointer' }}
				>
					Каталог
				</Link>
				<Typography color='text.primary'>{product.name}</Typography>
			</Breadcrumbs>

			<Box
				sx={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: 4,
					mb: 4,
				}}
			>
				{/* Левая колонка - изображения (40%) */}
				<Box
					sx={{
						flex: '0 0 calc(40% - 16px)',
						minWidth: { xs: '100%', md: '300px' },
					}}
				>
					<ProductImageGallery
						mainImage={product.imageUrl}
						images={product.images}
					/>
				</Box>

				{/* Правая колонка - информация о товаре (60%) */}
				<Box
					sx={{
						flex: '1 1 calc(60% - 16px)',
						minWidth: { xs: '100%', md: '350px' },
					}}
				>
					{/* Рейтинг */}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
						<Rating value={product.rating} precision={0.5} readOnly />
						<Typography variant='body2' color='text.secondary'>
							{product.reviewsCount} отзывов
						</Typography>
					</Box>

					{/* Название */}
					<Typography variant='h4' gutterBottom fontWeight='bold'>
						{product.name}
					</Typography>

					{/* Артикул */}
					<Typography variant='body2' color='text.secondary' gutterBottom>
						Артикул: {product.sku}
					</Typography>

					{/* Цена и наличие */}
					<Box sx={{ mt: 2, mb: 2 }}>
						<Typography variant='h3' color='primary' fontWeight='bold'>
							{product.price.toLocaleString()} ₽
						</Typography>
						{product.stock > 0 ? (
							<Chip
								label={`В наличии: ${product.stock} шт`}
								color='success'
								size='small'
								sx={{ mt: 1 }}
							/>
						) : (
							<Chip
								label='Нет в наличии'
								color='error'
								size='small'
								sx={{ mt: 1 }}
							/>
						)}
					</Box>

					{/* Краткое описание */}
					<Paper variant='outlined' sx={{ p: 2, bgcolor: '#f9f9f9', mb: 3 }}>
						<Typography variant='body1' color='text.secondary'>
							{product.description}
						</Typography>
					</Paper>

					{/* Основные характеристики (кратко) */}
					<Box sx={{ mb: 3 }}>
						<Typography variant='subtitle2' gutterBottom>
							Основные характеристики:
						</Typography>
						<Grid container spacing={1}>
							<Grid item xs={4}>
								<Typography variant='body2' color='text.secondary'>
									Тип:
								</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography variant='body2'>{product.type}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography variant='body2' color='text.secondary'>
									Мощность:
								</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography variant='body2'>{product.wattage} Вт</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography variant='body2' color='text.secondary'>
									Цоколь:
								</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography variant='body2'>{product.socket}</Typography>
							</Grid>
						</Grid>
					</Box>

					<Divider sx={{ my: 2 }} />

					{/* Выбор количества */}
					<Box sx={{ mb: 3 }}>
						<QuantitySelector
							quantity={quantity}
							onQuantityChange={setQuantity}
							min={1}
							max={product.stock}
						/>
					</Box>

					{/* Кнопки действий */}
					<Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
						<Button
							variant='contained'
							size='large'
							startIcon={<ShoppingCart />}
							onClick={handleAddToCart}
							disabled={product.stock === 0}
							sx={{ flex: 2, minWidth: 200 }}
						>
							В корзину
						</Button>
						<Button
							variant='outlined'
							size='large'
							onClick={handleBuyNow}
							disabled={product.stock === 0}
							sx={{ flex: 1, minWidth: 150 }}
						>
							Купить сейчас
						</Button>
					</Box>

					{/* Дополнительные кнопки */}
					<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
						<Button startIcon={<FavoriteBorder />} size='small' color='inherit'>
							В избранное
						</Button>
						<Button startIcon={<Share />} size='small' color='inherit'>
							Поделиться
						</Button>
						<Button
							startIcon={<ArrowBack />}
							size='small'
							color='inherit'
							onClick={() => navigate(-1)}
						>
							Назад
						</Button>
					</Box>
				</Box>
			</Box>

			{/* Полное описание */}
			<Paper sx={{ p: 3, mb: 4 }}>
				<Typography variant='h6' gutterBottom>
					Описание товара
				</Typography>
				<Typography variant='body1' paragraph>
					{product.fullDescription || product.description}
				</Typography>
			</Paper>

			{/* Характеристики (развёрнутые) */}
			<Box sx={{ mb: 4 }}>
				<ProductSpecs product={product} />
			</Box>

			{/* Похожие товары */}
			<Box sx={{ width: '100%' }}>
      	<RelatedProducts products={relatedProducts} />
    	</Box>
			
		</Container>
	)
}

export default ProductPage
