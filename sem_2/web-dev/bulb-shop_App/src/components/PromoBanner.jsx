import React from 'react'
import { Paper, Typography, Box, Button } from '@mui/material'
import { LocalOffer } from '@mui/icons-material'

const PromoBanner = () => {
	return (
		<Paper
			sx={{
				p: 3,
				mb: 4,
				background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				color: 'white',
				borderRadius: 2,
			}}
		>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					flexWrap: 'wrap',
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<LocalOffer fontSize='large' />
					<Box>
						<Typography variant='h6' fontWeight='bold'>
							{' '}
							{/* ✅ без paragraph */}
							Специальное предложение!
						</Typography>
						<Typography variant='body2'>
							{' '}
							{/* ✅ без paragraph */}
							При заказе от 2000 ₽ — бесплатная доставка. Акция действует до
							конца месяца (Полная ликвидация магазина как в Sunlight)
						</Typography>
					</Box>
				</Box>
			</Box>
		</Paper>
	)
}

export default PromoBanner
