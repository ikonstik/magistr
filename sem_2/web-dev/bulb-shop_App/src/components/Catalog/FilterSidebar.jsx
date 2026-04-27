import React from 'react'
import {
	Paper,
	Typography,
	FormGroup,
	FormControlLabel,
	Checkbox,
	Slider,
	Box,
	Button,
	Divider,
} from '@mui/material'

const FilterSidebar = ({ filters, onFilterChange, onClearFilters }) => {
	const socketTypes = ['E27', 'E14', 'GU10', 'G9', 'G13']
	const lampTypes = ['LED', 'накаливания', 'люминесцентная', 'галогеновая']

	const handleTypeChange = type => {
		const newTypes = filters.types.includes(type)
			? filters.types.filter(t => t !== type)
			: [...filters.types, type]
		onFilterChange({ ...filters, types: newTypes })
	}

	const handleSocketChange = socket => {
		const newSockets = filters.sockets.includes(socket)
			? filters.sockets.filter(s => s !== socket)
			: [...filters.sockets, socket]
		onFilterChange({ ...filters, sockets: newSockets })
	}

	const handlePriceChange = (event, newValue) => {
		onFilterChange({ ...filters, priceRange: newValue })
	}

	return (
		<Paper sx={{ p: 2, width: '100%' }}>
			{' '}
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mb: 2,
				}}
			>
				<Typography variant='h6'>Фильтры</Typography>
				<Button size='small' onClick={onClearFilters}>
					Сбросить
				</Button>
			</Box>
			<Divider sx={{ mb: 2 }} />
			{/* Цена */}
			<Typography gutterBottom sx={{ mt: 2 }}>
				Цена, ₽
			</Typography>
			<Slider
				value={filters.priceRange}
				onChange={handlePriceChange}
				valueLabelDisplay='auto'
				min={0}
				max={5000}
			/>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
				<Typography variant='caption'>{filters.priceRange[0]} ₽</Typography>
				<Typography variant='caption'>{filters.priceRange[1]} ₽</Typography>
			</Box>
			{/* Тип лампы */}
			<Typography gutterBottom sx={{ mt: 2 }}>
				Тип лампы
			</Typography>
			<FormGroup>
				{lampTypes.map(type => (
					<FormControlLabel
						key={type}
						control={
							<Checkbox
								checked={filters.types.includes(type)}
								onChange={() => handleTypeChange(type)}
								size='small'
							/>
						}
						label={type}
					/>
				))}
			</FormGroup>
			{/* Цоколь */}
			<Typography gutterBottom sx={{ mt: 2 }}>
				Цоколь
			</Typography>
			<FormGroup>
				{socketTypes.map(socket => (
					<FormControlLabel
						key={socket}
						control={
							<Checkbox
								checked={filters.sockets.includes(socket)}
								onChange={() => handleSocketChange(socket)}
								size='small'
							/>
						}
						label={socket}
					/>
				))}
			</FormGroup>
		</Paper>
	)
}

export default FilterSidebar
