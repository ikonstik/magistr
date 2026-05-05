import React from 'react'
import { Box, IconButton, TextField, Typography } from '@mui/material'
import { Add, Remove } from '@mui/icons-material'

const QuantitySelector = ({
	quantity,
	onQuantityChange,
	min = 1,
	max = 999,
}) => {
	const handleDecrease = () => {
		if (quantity > min) {
			onQuantityChange(quantity - 1)
		}
	}

	const handleIncrease = () => {
		if (quantity < max) {
			onQuantityChange(quantity + 1)
		}
	}

	const handleChange = e => {
		const value = parseInt(e.target.value)
		if (!isNaN(value) && value >= min && value <= max) {
			onQuantityChange(value)
		}
	}

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
			<Typography variant='body2' sx={{ mr: 1 }}>
				Количество:
			</Typography>
			<IconButton
				onClick={handleDecrease}
				size='small'
				disabled={quantity <= min}
			>
				<Remove fontSize='small' />
			</IconButton>
			<TextField
				size='small'
				value={quantity}
				onChange={handleChange}
				sx={{width: 80}}
				slotProps={{
					style: { textAlign: 'center', width: 150 },
					min: min,
					max: max,
				}}
			/>
			<IconButton
				onClick={handleIncrease}
				size='small'
				disabled={quantity >= max}
			>
				<Add fontSize='small' />
			</IconButton>
		</Box>
	)
}

export default QuantitySelector
