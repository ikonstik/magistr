import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	Container,
	Box,
	Drawer,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Divider,
} from '@mui/material'
import {
	Dashboard,
	ShoppingBag,
	LocalShipping,
	ExitToApp,
} from '@mui/icons-material'
import { adminApi } from '../../services/api'
import { showSnackbar } from '../../store/slices/uiSlice'

const drawerWidth = 240

const AdminLayout = () => {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const [admin, setAdmin] = useState(null)

	useEffect(() => {
		const checkAuth = async () => {
			if (!adminApi.isAuthenticated()) {
				navigate('/admin/login')
				return
			}
			try {
				const data = await adminApi.getCurrentAdmin()
				setAdmin(data)
			} catch {
				adminApi.logout()
				navigate('/admin/login')
			}
		}
		checkAuth()
	}, [navigate])

	const handleLogout = () => {
		adminApi.logout()
		dispatch(showSnackbar({ message: 'Вы вышли из системы', severity: 'info' }))
		navigate('/admin/login')
	}

	const menuItems = [
		{ text: 'Товары', icon: <ShoppingBag />, path: '/admin/products' },
		{ text: 'Заказы', icon: <LocalShipping />, path: '/admin/orders' },
	]

	return (
		<Box sx={{ display: 'flex' }}>
			<AppBar
				position='fixed'
				sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
			>
				<Toolbar>
					<Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
						Панель управления
					</Typography>
					<Typography variant='body2' sx={{ mr: 2 }}>
						{admin?.login} ({admin?.role})
					</Typography>
					<Button
						color='inherit'
						onClick={handleLogout}
						startIcon={<ExitToApp />}
					>
						Выход
					</Button>
				</Toolbar>
			</AppBar>

			<Drawer
				variant='permanent'
				sx={{
					width: drawerWidth,
					flexShrink: 0,
					[`& .MuiDrawer-paper`]: {
						width: drawerWidth,
						boxSizing: 'border-box',
					},
				}}
			>
				<Toolbar />
				<Box sx={{ overflow: 'auto' }}>
					<List>
						{menuItems.map(item => (
							<ListItem
								component='button'
								key={item.text}
								onClick={() => navigate(item.path)}
								sx={{ cursor: 'pointer' }}
							>
								<ListItemIcon>{item.icon}</ListItemIcon>
								<ListItemText primary={item.text} />
							</ListItem>
						))}
					</List>
					<Divider />
				</Box>
			</Drawer>

			<Box component='main' sx={{ flexGrow: 1, p: 3 }}>
				<Toolbar />
				<Container maxWidth='xl'>
					<Outlet />
				</Container>
			</Box>
		</Box>
	)
}

export default AdminLayout
