import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
	Container,
	Paper,
	TextField,
	Button,
	Typography,
	Box,
	Alert,
	IconButton,
	InputAdornment,
} from '@mui/material'
import {
	Visibility,
	VisibilityOff,
	AdminPanelSettings,
} from '@mui/icons-material'
import { adminApi } from '../services/api'
import { showSnackbar } from '../store/slices/uiSlice'

const AdminLoginPage = () => {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const [login, setLogin] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [showPassword, setShowPassword] = useState(false)

	const handleSubmit = async e => {
		e.preventDefault()
		setLoading(true)
		setError('')

		try {
			const response = await adminApi.login(login, password)
			dispatch(
				showSnackbar({
					message: `Добро пожаловать, ${response.role}!`,
					severity: 'success',
				}),
			)
			navigate('/admin')
		} catch (err) {
			setError(err.message || 'Ошибка входа')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Container maxWidth='sm' sx={{ py: 8 }}>
			<Paper sx={{ p: 4 }}>
				<Box sx={{ textAlign: 'center', mb: 3 }}>
					<AdminPanelSettings sx={{ fontSize: 48, color: 'primary.main' }} />
					<Typography variant='h5' gutterBottom>
						Вход в панель управления
					</Typography>
					<Typography variant='body2' color='text.secondary'>
						Введите свои учётные данные для доступа к административной панели
					</Typography>
				</Box>

				{error && (
					<Alert severity='error' sx={{ mb: 3 }}>
						{error}
					</Alert>
				)}

				<form onSubmit={handleSubmit}>
					<TextField
						fullWidth
						label='Логин'
						value={login}
						onChange={e => setLogin(e.target.value)}
						margin='normal'
						required
						disabled={loading}
					/>
					<TextField
						fullWidth
						label='Пароль'
						type={showPassword ? 'text' : 'password'}
						value={password}
						onChange={e => setPassword(e.target.value)}
						margin='normal'
						required
						disabled={loading}
						slotProps={{
							// ✅ для MUI v6 используем slotProps
							input: {
								endAdornment: (
									<InputAdornment position='end'>
										<IconButton
											onClick={() => setShowPassword(!showPassword)}
											edge='end'
										>
											{showPassword ? <VisibilityOff /> : <Visibility />}
										</IconButton>
									</InputAdornment>
								),
							},
						}}
					/>
					<Button
						fullWidth
						type='submit'
						variant='contained'
						size='large'
						disabled={loading}
						sx={{ mt: 3 }}
					>
						{loading ? 'Вход...' : 'Войти'}
					</Button>
				</form>
			</Paper>
		</Container>
	)
}

export default AdminLoginPage
