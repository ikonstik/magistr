import React from 'react'
import {
	Paper,
	Typography,
	FormControl,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Radio,
	Select,
	MenuItem,
	InputLabel,
	Box,
	Alert,
	Divider,
	Grid,
} from '@mui/material'
import { LocalShipping, Payment } from '@mui/icons-material'

const deliveryCompanies = [
	'СДЭК',
	'Почта России',
	'Курьерская доставка',
	'Самовывоз',
]
const cities = [
	'Москва',
	'Санкт-Петербург',
	'Новосибирск',
	'Екатеринбург',
	'Казань',
	'Нижний Новгород',
]
const pickupPoints = {
	СДЭК: [
		'ПВЗ №1 (ул. Ленина, 10)',
		'ПВЗ №2 (пр. Мира, 25)',
		'ПВЗ №3 (ул. Советская, 5)',
	],
	'Почта России': ['Отделение №101', 'Отделение №202', 'Отделение №303'],
	'Курьерская доставка': ['Курьером по адресу'],
	Самовывоз: ['Магазин на ул. Пушкина, 1', 'Склад на ул. Лермонтова, 15'],
}

const DeliveryPaymentForm = ({ formData, onChange }) => {
	const handleDeliveryMethodChange = event => {
		onChange('deliveryMethod', event.target.value)
		onChange('pickupPoint', '')
	}

	const handlePickupPointChange = event => {
		onChange('pickupPoint', event.target.value)
	}

	const handleCityChange = event => {
		onChange('city', event.target.value)
	}

	const handlePaymentMethodChange = event => {
		onChange('paymentMethod', event.target.value)
	}

	const availablePickupPoints = pickupPoints[formData.deliveryMethod] || []

	return (
		<Paper sx={{ p: 3 }}>
			<Typography variant='h6' gutterBottom>
				<LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
				Доставка
			</Typography>

			<Grid container spacing={2}>
				<Grid item sx={{ width: 250 }}>
					<FormControl fullWidth>
						<InputLabel>Транспортная компания</InputLabel>
						<Select
							value={formData.deliveryMethod}
							onChange={handleDeliveryMethodChange}
							label='Транспортная компания'
						>
							{deliveryCompanies.map(company => (
								<MenuItem key={company} value={company}>
									{company}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>

				<Grid item sx={{ width: 250 }}>
					<FormControl fullWidth>
						<InputLabel>Город</InputLabel>
						<Select
							value={formData.city}
							onChange={handleCityChange}
							label='Город'
						>
							{cities.map(city => (
								<MenuItem key={city} value={city}>
									{city}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>

				{formData.deliveryMethod &&
					formData.deliveryMethod !== 'Курьерская доставка' && (
						<Grid item sx={{ width: 515 }}>
							<FormControl fullWidth>
								<InputLabel>Пункт выдачи</InputLabel>
								<Select
									value={formData.pickupPoint}
									onChange={handlePickupPointChange}
									label='Пункт выдачи'
								>
									{availablePickupPoints.map(point => (
										<MenuItem key={point} value={point}>
											{point}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
					)}

				{formData.deliveryMethod === 'Курьерская доставка' && (
					<Grid item xs={12}>
						<Alert severity='info' sx={{ mt: 1 }}>
							Курьер доставит заказ по указанному адресу в течение 1-3 дней
						</Alert>
					</Grid>
				)}
			</Grid>

			<Divider sx={{ my: 3 }} />

			<Typography variant='h6' gutterBottom>
				<Payment sx={{ mr: 1, verticalAlign: 'middle' }} />
				Способ оплаты
			</Typography>

			<RadioGroup
				value={formData.paymentMethod}
				onChange={handlePaymentMethodChange}
			>
				<FormControlLabel
					value='card_online'
					control={<Radio />}
					label='Онлайн картой (на сайте)'
				/>
				<FormControlLabel
					value='card_delivery'
					control={<Radio />}
					label='Картой при получении'
				/>
				<FormControlLabel
					value='cash'
					control={<Radio />}
					label='Наличными при получении'
				/>
				<FormControlLabel
					value='sbp'
					control={<Radio />}
					label='СБП (Система быстрых платежей)'
				/>
			</RadioGroup>
		</Paper>
	)
}

export default DeliveryPaymentForm
