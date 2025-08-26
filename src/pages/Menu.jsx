import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Search, Add, Remove } from '@mui/icons-material';
import { useProducts } from '../contexts/ProductContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';

const Menu = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSize, setSelectedSize] = useState({});
  
  const { 
    products, 
    categories, 
    loading, 
    error, 
    searchProducts, 
    filterByCategory, 
    clearFilters 
  } = useProducts();
  
  const { addToCart, getItemQuantity, updateQuantity } = useCart();

  // Handle search
  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      searchProducts(value);
    } else {
      clearFilters();
    }
  };

  // Handle category filter
  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
    if (category) {
      filterByCategory(category);
    } else {
      clearFilters();
    }
  };

  // Handle size selection
  const handleSizeChange = (productId, size) => {
    setSelectedSize(prev => ({
      ...prev,
      [productId]: size
    }));
  };

  // Add item to cart
  const handleAddToCart = (product) => {
    const size = selectedSize[product._id];
    addToCart(product, 1, size);
  };

  // Update cart quantity
  const handleUpdateQuantity = (product, newQuantity) => {
    const size = selectedSize[product._id];
    const itemId = `${product._id}_${size || 'default'}`;
    updateQuantity(itemId, newQuantity);
  };

  // Get current price based on selected size
  const getCurrentPrice = (product) => {
    const size = selectedSize[product._id];
    if (size && product.sizes) {
      const sizeOption = product.sizes.find(s => s.name === size);
      return sizeOption ? sizeOption.price : product.price;
    }
    return product.price;
  };

  // Get current quantity in cart
  const getCurrentQuantity = (product) => {
    const size = selectedSize[product._id];
    return getItemQuantity(product._id, size);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        textAlign="center"
        gutterBottom
        sx={{ fontWeight: 'bold', color: '#8B4513', mb: 4 }}
      >
        Our Menu
      </Typography>

      {/* Search and Filter Controls */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              placeholder="Search menu items..."
              variant="outlined"
              value={searchTerm}
              onChange={handleSearch}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={handleCategoryChange}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={60} sx={{ color: '#8B4513' }} />
        </Box>
      )}

      {/* Menu Items Grid */}
      {!loading && (
        <Grid container spacing={3}>
          {products.length === 0 ? (
            <Grid item xs={12}>
              <Typography
                variant="h6"
                textAlign="center"
                color="text.secondary"
                sx={{ py: 4 }}
              >
                No products found. Try adjusting your search or filters.
              </Typography>
            </Grid>
          ) : (
            products.map((product) => {
              const currentQuantity = getCurrentQuantity(product);
              const currentPrice = getCurrentPrice(product);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.image || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop'}
                      alt={product.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        gutterBottom
                        variant="h5"
                        component="h3"
                        sx={{ fontWeight: 'bold' }}
                      >
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {product.description}
                      </Typography>
                      
                      {/* Size Selection */}
                      {product.sizes && product.sizes.length > 0 && (
                        <FormControl size="small" sx={{ mb: 2, minWidth: 120 }}>
                          <InputLabel>Size</InputLabel>
                          <Select
                            value={selectedSize[product._id] || ''}
                            label="Size"
                            onChange={(e) => handleSizeChange(product._id, e.target.value)}
                          >
                            {product.sizes.map((size) => (
                              <MenuItem key={size.name} value={size.name}>
                                {size.name} - ${size.price.toFixed(2)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                      
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 'bold', color: '#8B4513' }}
                      >
                        ${currentPrice.toFixed(2)}
                      </Typography>
                      
                      {product.featured && (
                        <Chip
                          label="Featured"
                          color="primary"
                          size="small"
                          sx={{ mt: 1, backgroundColor: '#8B4513' }}
                        />
                      )}
                    </CardContent>
                    <CardActions sx={{ p: 2, flexDirection: 'column', gap: 1 }}>
                      {currentQuantity > 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                          <Button
                            size="small"
                            onClick={() => handleUpdateQuantity(product, currentQuantity - 1)}
                            sx={{ minWidth: 40 }}
                          >
                            <Remove />
                          </Button>
                          <Typography variant="h6" sx={{ mx: 2 }}>
                            {currentQuantity}
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => handleUpdateQuantity(product, currentQuantity + 1)}
                            sx={{ minWidth: 40 }}
                          >
                            <Add />
                          </Button>
                        </Box>
                      ) : (
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleAddToCart(product)}
                          disabled={product.sizes && product.sizes.length > 0 && !selectedSize[product._id]}
                          sx={{
                            backgroundColor: '#8B4513',
                            '&:hover': {
                              backgroundColor: '#A0522D'
                            }
                          }}
                        >
                          Add to Cart
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      )}
    </Container>
  );
};

export default Menu;