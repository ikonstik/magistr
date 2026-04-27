import React from 'react';
import { Typography, Box } from '@mui/material';
import ProductCard from './Catalog/ProductCard';

const RelatedProducts = ({ products, title = "Похожие товары", onAddToCart }) => {
  if (!products || products.length ===  ​0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        {title}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={onAddToCart}
          />
        ))}
      </Box>
    </Box>
  );
};

export default RelatedProducts;