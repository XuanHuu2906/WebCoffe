import React, { useState, useEffect } from 'react';
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
import { formatPrice } from '../utils/formatPrice';

const Menu = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSize, setSelectedSize] = useState({});
  
  const { 
    products, 
    categories, 
    loading, 
    error, 
    fetchProducts,
    searchProducts, 
    filterByCategory, 
    clearFilters 
  } = useProducts();
  
  const { addToCart, getItemQuantity, updateQuantity } = useCart();

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts({ limit: 100 }); // Fetch all products without pagination limit
  }, [fetchProducts]);

  // Handle search
  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      searchProducts(value);
    } else {
      // When search is cleared, explicitly fetch all products
      clearFilters().then(() => {
        fetchProducts({ limit: 100 });
      });
    }
  };

  // Handle category filter
  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
    if (category) {
      filterByCategory(category);
    } else {
      // When switching back to All Categories, explicitly fetch all products and featured products
      clearFilters().then(() => {
        // Fetch all products with a high limit to ensure we get everything
        return fetchProducts({ limit: 100 });
      }).then(() => {
        // Also explicitly fetch featured products to ensure Best Seller section is populated
        fetchFeaturedProducts();
      });
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

  // Group products by category
  const groupProductsByCategory = (products) => {
    const grouped = {};
    
    // If a specific category is selected, only show that category
    if (selectedCategory) {
      // For selected category, just group by that category
      products.forEach(product => {
        if (!grouped[product.category]) {
          grouped[product.category] = [];
        }
        grouped[product.category].push(product);
      });
    } else {
      // When no category filter is applied, show all with "Best seller" section
      // First, handle featured products as a special category
      const featuredProducts = products.filter(product => product.featured);
      
      // Sort featured products to ensure 'cà phê' appears at the bottom
      const sortedFeaturedProducts = [...featuredProducts].sort((a, b) => {
        // If product name is 'cà phê', move it to the end
        if (a.name.toLowerCase() === 'cà phê') return 1;
        if (b.name.toLowerCase() === 'cà phê') return -1;
        return 0; // Keep original order for other products
      });
      
      if (sortedFeaturedProducts.length > 0) {
        grouped['Best seller'] = sortedFeaturedProducts;
      }
      
      // Then group by actual categories
      products.forEach(product => {
        if (!grouped[product.category]) {
          grouped[product.category] = [];
        }
        grouped[product.category].push(product);
      });
    }
    
    return grouped;
  };

  // Get grouped products
  const groupedProducts = groupProductsByCategory(products);

  return (
    <Container sx={{ py: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        textAlign="center"
        gutterBottom
        sx={{ 
          fontWeight: 'bold', 
          color: '#8B4513', 
          mb: 4,
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
        }}
      >
        Menu
      </Typography>

      {/* Search and Filter Controls */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6}>
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

      {/* Menu Items by Category */}
      {!loading && (
        <Box>
          {products.length === 0 ? (
            <Typography
              variant="h6"
              textAlign="center"
              color="text.secondary"
              sx={{ py: 4 }}
            >
              No products found. Try adjusting your search or filters.
            </Typography>
          ) : (
            // Sort categories to ensure Cà phê appears right after Best seller
            Object.entries(groupedProducts)
              .sort(([categoryA], [categoryB]) => {
                // Best seller always first
                if (categoryA === 'Best seller') return -1;
                if (categoryB === 'Best seller') return 1;
                // Cà phê comes right after Best seller
                if (categoryA === 'Cà phê') return -1;
                if (categoryB === 'Cà phê') return 1;
                // Alphabetical order for other categories
                return categoryA.localeCompare(categoryB);
              })
              .map(([categoryName, categoryProducts]) => (
              <Box key={categoryName} sx={{ mb: 6 }}>
                {/* Category Header */}
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{
                    fontWeight: 'bold',
                    color: '#8B4513',
                    mb: 3,
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    borderBottom: '2px solid #8B4513',
                    paddingBottom: 1
                  }}
                >
                  {categoryName}
                </Typography>
                
                {/* Products Grid for this Category */}
                <Grid container spacing={3}>
                  {categoryProducts.map((product) => {
                    const currentQuantity = getCurrentQuantity(product);
                    const currentPrice = getCurrentPrice(product);
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
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
                            height="330"
                            image={product.image ? (product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${product.image}`) : 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop'}
                            alt={product.name}
                            sx={{ objectFit: 'cover', backgroundColor: '#f5f5f5' }}
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
                              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                                <InputLabel>Size</InputLabel>
                                <Select
                                  value={selectedSize[product._id] || ''}
                                  label="Size"
                                  onChange={(e) => handleSizeChange(product._id, e.target.value)}
                                >
                                  {product.sizes.map((size) => (
                                    <MenuItem key={size.name} value={size.name}>
                                      {size.name}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )}
                            
                            {/* Only show price after size selection for products with sizes */}
                            {((product.sizes && product.sizes.length > 0 && selectedSize[product._id]) || 
                              (!product.sizes || product.sizes.length === 0)) && (
                              <Typography
                                variant="h6"
                                sx={{ fontWeight: 'bold', color: '#8B4513' }}
                              >
                                {formatPrice(currentPrice)}
                              </Typography>
                            )}
                            
                            {product.featured && (
                              <Chip
                                label="Best Seller"
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
                  })}
                </Grid>
              </Box>
            ))
          )}
        </Box>
      )}
    </Container>
  );
};

export default Menu;