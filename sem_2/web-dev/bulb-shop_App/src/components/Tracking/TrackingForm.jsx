import React, { useState } from 'react'
import {
	Paper,
	Typography,
	TextField,
	Button,
	Box,
	InputAdornment,
} from '@mui/material'
import { Search, LocalShipping } from '@mui/icons-material'

const TrackingForm = ({ initialCode, onSubmit, loading }) => {
	const [trackingCode, setTrackingCode] = useState(initialCode || '')

	const handleSubmit = e => {
		e.preventDefault()
		if (trackingCode.trim()) {
			onSubmit(trackingCode.trim())
		}
	}

	return (
		<Paper sx={{ p: 4, textAlign: 'center' }}>
			<LocalShipping sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />

			<Typography variant='h5' gutterBottom>
				Отслеживание заказа
			</Typography>

			<Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
				Введите номер заказа для отслеживания доставки
			</Typography>

			<Box
				component='form'
				onSubmit={handleSubmit}
				sx={{ maxWidth: 500, mx: 'auto' }}
			>
				<TextField
					fullWidth
					placeholder='Введите номер для отслеживания заказа'
					value={trackingCode}
					onChange={e => setTrackingCode(e.target.value)}
					disabled={loading}
					slotProps={{
						startAdornment: (
							<InputAdornment position='start'>
								<Search color='action' />
							</InputAdornment>
						),
					}}
					sx={{ mb: 2 }}
				/>
				<Button
					type='submit'
					variant='contained'
					size='large'
					disabled={!trackingCode.trim() || loading}
					loading={loading}
					sx={{ minWidth: 200 }}
				>
					Отследить заказ
				</Button>
			</Box>
		</Paper>
	)
}

export default TrackingForm
