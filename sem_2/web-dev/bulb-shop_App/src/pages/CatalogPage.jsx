import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	Container,
	Typography,
	Box,
	Pagination,
	Paper,
	useMediaQuery,
	IconButton,
	Drawer,
} from '@mui/material'
import { FilterList } from '@mui/icons-material'
import FilterSidebar from '../components/Catalog/FilterSidebar'
import ProductCard from '../components/Catalog/ProductCard'
import PromoBanner from '../components/PromoBanner'
import { fetchAllProducts } from '../store/slices/productsSlice'

const CatalogPage = () => {
	const dispatch = useDispatch()
	const { productsList, loading } = useSelector(state => state.products)

	const [filters, setFilters] = useState({
		priceRange: [0, 5000],
		sockets: [],
		types: [],
	})
	const [page, setPage] = useState(1)
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
	const isMobile = useMediaQuery('(max-width:900px)')
	const itemsPerPage = 9

	// Загружаем товары при монтировании компонента
	useEffect(() => {
		if (productsList.length === 0) {
			dispatch(fetchAllProducts())
		}
	}, [dispatch, productsList.length])

	// Фильтрация товаров
	const filteredProducts = productsList.filter(product => {
		if (filters.types.length > 0 && !filters.types.includes(product.type))
			return false
		if (filters.sockets.length > 0 && !filters.sockets.includes(product.socket))
			return false
		if (
			product.price < filters.priceRange[0] ||
			product.price > filters.priceRange[1]
		)
			return false
		return true
	})

	const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
	const paginatedProducts = filteredProducts.slice(
		(page - 1) * itemsPerPage,
		page * itemsPerPage,
	)

	const handlePageChange = (event, value) => {
		setPage(value)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	const handleFilterChange = newFilters => {
		setFilters(newFilters)
		setPage(1)
	}

	const FilterContent = () => (
		<FilterSidebar
			filters={filters}
			onFilterChange={handleFilterChange}
			onClearFilters={() =>
				handleFilterChange({
					priceRange: [0, 5000],
					sockets: [],
					types: [],
				})
			}
		/>
	)

	// Состояние загрузки
	if (loading && productsList.length === 0) {
		return (
			<Container maxWidth='lg' sx={{ py: 8, textAlign: 'center' }}>
				<Typography>Загрузка товаров...</Typography>
			</Container>
		)
	}

	return (
		<Container maxWidth='lg' sx={{ py: 4 }}>
			<PromoBanner />

			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mb: 3,
				}}
			>
				<Typography variant='h4' component='h1'>
					Каталог товаров
				</Typography>
				{isMobile && (
					<IconButton onClick={() => setMobileFiltersOpen(true)}>
						<FilterList />
					</IconButton>
				)}
			</Box>

			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', md: 'row' },
					gap: 3,
				}}
			>
				{/* Фильтры */}
				{!isMobile && (
					<Box
						sx={{
							width: { md: '280px' },
							flexShrink: 0,
							position: 'sticky',
							top: 20,
							alignSelf: 'flex-start',
							height: 'fit-content',
						}}
					>
						<FilterContent />
					</Box>
				)}

				{/* Товары */}
				<Box
					sx={{
						flexGrow: 1,
						minWidth: 0,
					}}
				>
					<Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
						Найдено товаров: {filteredProducts.length}
					</Typography>

					{filteredProducts.length === 0 ? (
						<Paper sx={{ p: 4, textAlign: 'center' }}>
							<Typography>Товары не найдены</Typography>
							<Typography variant='body2' color='text.secondary'>
								Попробуйте изменить параметры фильтрации
							</Typography>
						</Paper>
					) : (
						<>
							{/* Сетка товаров: 3 карточки в ряд на десктопе */}
							<Box
								sx={{
									display: 'grid',
									gridTemplateColumns: {
										xs: '1fr', // 1 колонка на телефоне
										sm: 'repeat(2, 1fr)', // 2 колонки на планшете
										md: 'repeat(3, 1fr)', // 3 колонки на десктопе
									},
									gap: 3,
								}}
							>
								{paginatedProducts.map(product => (
									<ProductCard key={product.id} product={product} />
								))}
							</Box>

							{totalPages > 1 && (
								<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
									<Pagination
										count={totalPages}
										page={page}
										onChange={handlePageChange}
										color='primary'
										size='large'
									/>
								</Box>
							)}
						</>
					)}
				</Box>
			</Box>

			{/* Мобильный Drawer */}
			<Drawer
				anchor='left'
				open={mobileFiltersOpen}
				onClose={() => setMobileFiltersOpen(false)}
			>
				<Box sx={{ width: 280, p: 2 }}>
					<Typography variant='h6' sx={{ mb: 2 }}>
						Фильтры
					</Typography>
					<FilterContent />
				</Box>
			</Drawer>
		</Container>
	)
}

export default CatalogPage
