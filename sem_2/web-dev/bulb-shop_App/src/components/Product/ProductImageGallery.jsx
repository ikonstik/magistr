import React, { useState } from 'react'
import { Box, Paper, Grid, CardMedia } from '@mui/material'

const ProductImageGallery = ({ images, mainImage }) => {
	const [selectedImage, setSelectedImage] = useState(mainImage)

	const allImages =
		images && images.length > 0 ? [mainImage, ...images] : [mainImage]

	return (
		<Box>
			{/* Главное изображение */}
			<Paper
				sx={{
					p: 2,
					mb: 2,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					bgcolor: '#f5f5f5',
					minHeight: 400,
					borderRadius: 2,
				}}
			>
				<CardMedia
					component='img'
					image={selectedImage}
					alt='Product'
					sx={{
						maxWidth: '100%',
						maxHeight: 400,
						width: 'auto',
						objectFit: 'contain',
					}}
				/>
			</Paper>

			{/* Миниатюры */}
			{allImages.length > 1 && (
				<Grid container spacing={1}>
					{allImages.map((img, index) => (
						<Grid item xs={3} key={index}>
							<Paper
								sx={{
									p: 1,
									cursor: 'pointer',
									border:
										selectedImage === img
											? '2px solid #ff6b35'
											: '1px solid #e0e0e0',
									borderRadius: 1,
									'&:hover': { borderColor: '#ff6b35' },
								}}
								onClick={() => setSelectedImage(img)}
							>
								<CardMedia
									component='img'
									image={img}
									alt={`Thumbnail ${index + 1}`}
									sx={{
										height: 80,
										objectFit: 'contain',
									}}
								/>
							</Paper>
						</Grid>
					))}
				</Grid>
			)}
		</Box>
	)
}

export default ProductImageGallery
