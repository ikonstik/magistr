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
	Button,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	MenuItem,
	Box,
} from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import { productApi } from '../../services/api'
import { useDispatch } from 'react-redux'
import { showSnackbar } from '../../store/slices/uiSlice'

const lampTypes = ['LED', 'накаливания', 'люминесцентная', 'галогеновая']

const AdminProductsPage = () => {
	const dispatch = useDispatch()
	const [products, setProducts] = useState([])
	const [loading, setLoading] = useState(true)
	const [openDialog, setOpenDialog] = useState(false)
	const [editingProduct, setEditingProduct] = useState(null)
	const [formData, setFormData] = useState({
		sku: '',
		name: '',
		description: '',
		price: '',
		stock: '',
		type: 'LED',
		wattage: '',
		socket: '',
		image_url: '',
	})

	useEffect(() => {
		loadProducts()
	}, [])

	const loadProducts = async () => {
		try {
			const data = await productApi.getProducts({ limit: 100 })
			setProducts(data.items || data)
		} catch (error) {
			dispatch(showSnackbar({ message: error.message, severity: 'error' }))
		} finally {
			setLoading(false)
		}
	}

	const handleOpenDialog = (product = null) => {
		if (product) {
			setEditingProduct(product)
			setFormData({
				sku: product.sku,
				name: product.name,
				description: product.description || '',
				price: product.price,
				stock: product.stock,
				type: product.type,
				wattage: product.wattage,
				socket: product.socket,
				image_url: product.image_url || '',
			})
		} else {
			setEditingProduct(null)
			setFormData({
				sku: '',
				name: '',
				description: '',
				price: '',
				stock: '',
				type: 'LED',
				wattage: '',
				socket: '',
				image_url: '',
			})
		}
		setOpenDialog(true)
	}

	const handleCloseDialog = () => {
		setOpenDialog(false)
		setEditingProduct(null)
	}

	const handleSave = async () => {
		try {
			const productData = {
				...formData,
				price: parseFloat(formData.price),
				stock: parseInt(formData.stock),
				wattage: parseInt(formData.wattage),
			}

			if (editingProduct) {
				await productApi.updateProduct(editingProduct.id, productData)
				dispatch(
					showSnackbar({ message: 'Товар обновлён', severity: 'success' }),
				)
			} else {
				await productApi.createProduct(productData)
				dispatch(showSnackbar({ message: 'Товар создан', severity: 'success' }))
			}
			handleCloseDialog()
			loadProducts()
		} catch (error) {
			dispatch(showSnackbar({ message: error.message, severity: 'error' }))
		}
	}

	const handleDelete = async id => {
		if (window.confirm('Удалить товар?')) {
			try {
				await productApi.deleteProduct(id)
				dispatch(showSnackbar({ message: 'Товар удалён', severity: 'success' }))
				loadProducts()
			} catch (error) {
				dispatch(showSnackbar({ message: error.message, severity: 'error' }))
			}
		}
	}

	return (
		<Box>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
				<Typography variant='h4'>Управление товарами</Typography>
				<Button
					variant='contained'
					startIcon={<Add />}
					onClick={() => handleOpenDialog()}
				>
					Добавить товар
				</Button>
			</Box>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>SKU</TableCell>
							<TableCell>Название</TableCell>
							<TableCell>Тип</TableCell>
							<TableCell>Цоколь</TableCell>
							<TableCell align='right'>Цена</TableCell>
							<TableCell align='right'>Остаток</TableCell>
							<TableCell align='center'>Действия</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={7} align='center'>
									Загрузка...
								</TableCell>
							</TableRow>
						) : (
							products.map(product => (
								<TableRow key={product.id}>
									<TableCell>{product.sku}</TableCell>
									<TableCell>{product.name}</TableCell>
									<TableCell>{product.type}</TableCell>
									<TableCell>{product.socket}</TableCell>
									<TableCell align='right'>{product.price} ₽</TableCell>
									<TableCell align='right'>{product.stock}</TableCell>
									<TableCell align='center'>
										<IconButton onClick={() => handleOpenDialog(product)}>
											<Edit />
										</IconButton>
										<IconButton
											color='error'
											onClick={() => handleDelete(product.id)}
										>
											<Delete />
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
				onClose={handleCloseDialog}
				maxWidth='sm'
				fullWidth
			>
				<DialogTitle>
					{editingProduct ? 'Редактировать товар' : 'Новый товар'}
				</DialogTitle>
				<DialogContent>
					<TextField
						fullWidth
						label='SKU'
						value={formData.sku}
						onChange={e => setFormData({ ...formData, sku: e.target.value })}
						margin='normal'
						required
					/>
					<TextField
						fullWidth
						label='Название'
						value={formData.name}
						onChange={e => setFormData({ ...formData, name: e.target.value })}
						margin='normal'
						required
					/>
					<TextField
						fullWidth
						label='Описание'
						value={formData.description}
						onChange={e =>
							setFormData({ ...formData, description: e.target.value })
						}
						margin='normal'
						multiline
						rows={3}
					/>
					<TextField
						fullWidth
						select
						label='Тип'
						value={formData.type}
						onChange={e => setFormData({ ...formData, type: e.target.value })}
						margin='normal'
					>
						{lampTypes.map(type => (
							<MenuItem key={type} value={type}>
								{type}
							</MenuItem>
						))}
					</TextField>
					<TextField
						fullWidth
						label='Мощность (Вт)'
						type='number'
						value={formData.wattage}
						onChange={e =>
							setFormData({ ...formData, wattage: e.target.value })
						}
						margin='normal'
						required
					/>
					<TextField
						fullWidth
						label='Цоколь'
						value={formData.socket}
						onChange={e => setFormData({ ...formData, socket: e.target.value })}
						margin='normal'
						required
					/>
					<TextField
						fullWidth
						label='Цена (₽)'
						type='number'
						value={formData.price}
						onChange={e => setFormData({ ...formData, price: e.target.value })}
						margin='normal'
						required
					/>
					<TextField
						fullWidth
						label='Остаток'
						type='number'
						value={formData.stock}
						onChange={e => setFormData({ ...formData, stock: e.target.value })}
						margin='normal'
						required
					/>
					<TextField
						fullWidth
						label='URL изображения'
						value={formData.image_url}
						onChange={e =>
							setFormData({ ...formData, image_url: e.target.value })
						}
						margin='normal'
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog}>Отмена</Button>
					<Button onClick={handleSave} variant='contained'>
						Сохранить
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	)
}

export default AdminProductsPage
