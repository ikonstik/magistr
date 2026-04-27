import React from 'react';
import {
  Paper,
  Typography,
  TextField,
  Grid,
  Box,
} from '@mui/material';

const AddressForm = ({ formData, onChange }) => {
  const handleChange = (field) => (event) => {
    onChange(field, event.target.value);
  };

  return (
		<Paper sx={{ p: 3 }}>
			<Typography variant='h6' gutterBottom>
				Контактная информация
			</Typography>
			<Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
				Введите данные для оформления заказа
			</Typography>

			<Grid container spacing={2}>
				<Box item sx={{ width: 250 }}>
					<TextField
						fullWidth
						label='Имя'
						value={formData.firstName}
						onChange={handleChange('firstName')}
						required
					/>
				</Box>
				<Box item sx={{ width: 250 }}>
					<TextField
						fullWidth
						label='Фамилия'
						value={formData.lastName}
						onChange={handleChange('lastName')}
						required
					/>
				</Box>
				<Box item sx={{ width: 250 }}>
					<TextField
						fullWidth
						label='Email'
						type='email'
						value={formData.email}
						onChange={handleChange('email')}
						required
						placeholder='example@mail.ru'
					/>
				</Box>
				<Box item sx={{ width: 250 }}>
					<TextField
						fullWidth
						label='Телефон'
						value={formData.phone}
						onChange={handleChange('phone')}
						required
						placeholder='+7 (XXX) XXX-XX-XX'
					/>
				</Box>
				<Box item sx={{ width: 515 }}>
					<TextField
						fullWidth
						label='Адрес доставки'
						value={formData.address}
						onChange={handleChange('address')}
						required
						placeholder='Город, улица, дом, квартира'
						multiline
						rows={2}
					/>
				</Box>
				<Box item sx={{ width: 250 }}>
					<TextField
						fullWidth
						label='Индекс'
						value={formData.postalCode}
						onChange={handleChange('postalCode')}
						placeholder='123456'
					/>
				</Box>
				<Box item sx={{ width: 250 }}>
					<TextField
						fullWidth
						label='Страна'
						value={formData.country}
						onChange={handleChange('country')}
						defaultValue='Россия'
					/>
				</Box>
			</Grid>
		</Paper>
	)
};

export default AddressForm;