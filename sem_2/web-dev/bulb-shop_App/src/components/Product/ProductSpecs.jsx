import React from 'react'
import { Paper, Typography, Grid, Box, Divider } from '@mui/material'
import {
	WbIncandescent,
	Opacity,
	Bolt,
	Circle,
	Timeline,
	EnergySavingsLeaf,
	Article,
} from '@mui/icons-material'

const ProductSpecs = ({ product }) => {
	const specs = [
		{
			label: 'Артикул',
			value: product.sku,
			icon: <Article fontSize='small' />,
		},
		{
			label: 'Тип лампы',
			value: product.type,
			icon: <WbIncandescent fontSize='small' />,
		},
		{
			label: 'Мощность',
			value: `${product.wattage} Вт`,
			icon: <Bolt fontSize='small' />,
		},
		{
			label: 'Цоколь',
			value: product.socket,
			icon: <Circle fontSize='small' />,
		},
	]

	return (
		<Paper sx={{ p: 3 }}>
			<Typography variant='h6' gutterBottom>
				Характеристики
			</Typography>
			<Divider sx={{ mb: 2 }} />
			<Grid container spacing={4}>
				{specs.map((spec, index) => (
					<Grid xs={12} sm={6} key={index}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
							<Box sx={{ color: 'text.secondary' }}>{spec.icon}</Box>
							<Typography
								variant='body2'
								color='text.secondary'
								sx={{ minWidth: 140 }}
							>
								{spec.label}:
							</Typography>
							<Typography variant='body2'>{spec.value}</Typography>
						</Box>
					</Grid>
				))}
			</Grid>
		</Paper>
	)
}

export default ProductSpecs
