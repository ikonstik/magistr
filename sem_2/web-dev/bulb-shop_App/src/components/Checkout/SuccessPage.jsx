import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Paper, Typography, Button, Box, Chip } from '@mui/material'
import { CheckCircle, Receipt, TrackChanges } from '@mui/icons-material'

const SuccessPage = ({ order }) => {
	const navigate = useNavigate()

	return (
		<Paper sx={{ p: 4, textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
			<CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />

			<Typography variant='h5' gutterBottom fontWeight='bold'>
				Ваш заказ оплачен успешно!
			</Typography>

			<Box sx={{ my: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
				<Typography variant='body2' color='text.secondary' gutterBottom>
					Номер для отслеживания заказа
				</Typography>
				<Chip
					label={order?.trackingCode || 'ORD-12345'}
					color='primary'
					sx={{ fontSize: 18, fontWeight: 'bold', p: 2 }}
				/>
			</Box>

			<Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
				<Button
					variant='outlined'
					startIcon={<Receipt />}
					onClick={() =>
						navigate('/tracking', {
							state: { trackingCode: order?.trackingCode },
						})
					}
				>
					Отследить заказ
				</Button>
				<Button variant='contained' onClick={() => navigate('/')}>
					На главную
				</Button>
			</Box>

			<Typography
				variant='caption'
				color='text.secondary'
				display='block'
				sx={{ mt: 3 }}
			>
				Подтверждение заказа отправлено на вашу электронную почту
			</Typography>
		</Paper>
	)
}

export default SuccessPage
