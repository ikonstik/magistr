import React from 'react'
import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	IconButton,
	Badge,
	Box,
	Container,
} from '@mui/material'
import { ShoppingCart, TrackChanges } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const Header = ({ cartItemsCount = 3 }) => {
	const navigate = useNavigate()

	return (
		<AppBar position='sticky' color='default' elevation={1}>
			<Container maxWidth='x1'>
				<Toolbar disableGutters>
					{/* Логотип */}
					<Typography
						variant='h6'
						component='div'
						sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 'bold' }}
						onClick={() => navigate('/')}
					>
						💡 Магазин лампочек
					</Typography>

					{/* Навигация */}
					<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
						<Button
							color='inherit'
							startIcon={<TrackChanges />}
							onClick={() => navigate('/tracking')}
						>
							Отследить заказ
						</Button>

						<IconButton color='inherit' onClick={() => navigate('/cart')}>
							<Badge badgeContent={cartItemsCount} color='error'>
								<ShoppingCart />
							</Badge>
						</IconButton>
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	)
}

export default Header
