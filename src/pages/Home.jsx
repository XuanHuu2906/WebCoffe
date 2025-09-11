import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import ImageCarousel from '../components/ImageCarousel';
import { useProducts } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../utils/formatPrice';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchFeaturedProducts } = useProducts();
  const { addToCart, getItemQuantity, updateQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState(null);
  const [selectedSize, setSelectedSize] = useState({});
  const [successMessage, setSuccessMessage] = useState('');


  const heroImages = [
    '/images/z6963357928838_e8b0a328ad2578452e17e1391b53136d.jpg',
    '/images/z6963358140668_494344e82b188f66d5bbe377d74c51d4.jpg',
    '/images/z6963358395455_d42047d065013cc1676c097d22048bc0.jpg'
  ];

  const interiorImages = [
    '/images/coffeeshop.jpg'
  ];

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
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Store pending cart item in localStorage
      const pendingItem = {
        product,
        quantity: 1,
        size: size || 'Regular',
        timestamp: Date.now()
      };
      
      // Get existing pending items
      const existingPending = JSON.parse(localStorage.getItem('pendingCartItems') || '[]');
      
      // Check if item already exists in pending cart
      const existingIndex = existingPending.findIndex(
        item => item.product._id === product._id && item.size === (size || 'Regular')
      );
      
      if (existingIndex >= 0) {
        // Update quantity if item exists
        existingPending[existingIndex].quantity += 1;
        existingPending[existingIndex].timestamp = Date.now();
      } else {
        // Add new item to pending cart
        existingPending.push(pendingItem);
      }
      
      // Save updated pending cart
      localStorage.setItem('pendingCartItems', JSON.stringify(existingPending));
      
      // Redirect to login page with message
      navigate('/login', { 
        state: { 
          from: '/',
          message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng. Sản phẩm sẽ được tự động thêm vào giỏ hàng sau khi đăng nhập.'
        }
      });
      return;
    }
    
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

  // Fetch featured products on component mount
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setFeaturedLoading(true);
        setFeaturedError(null);
        const products = await fetchFeaturedProducts();
        setFeaturedItems(products || []);
      } catch (error) {
        console.error('Error loading featured products:', error);
        setFeaturedError('Không thể tải sản phẩm nổi bật. Vui lòng thử lại sau.');
      } finally {
        setFeaturedLoading(false);
      }
    };

    loadFeaturedProducts();
  }, [fetchFeaturedProducts]);

  // Handle success message from navigation state
  useEffect(() => {
    if (location.state?.message && location.state?.type === 'success') {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <Box>
      {/* Hero Banner with Image Carousel */}
      <ImageCarousel 
        images={heroImages} 
        interval={4000} 
        fit={{ xs: 'contain', md: 'cover' }}
        position="center 40%"
        height={{ xs: 'calc(100vh - 56px)', md: 'calc(100vh - 64px)' }}>
        <Container sx={{ textAlign: 'center', color: 'white' }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }
            }}
          >
            Welcome to DREAM COFFEE
          </Typography>
          <Typography
            variant="h5"
            component="p"
            gutterBottom
            sx={{ 
              mb: 4, 
              opacity: 0.9,
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
            }}
          >
            Trải nghiệm cà phê và bánh ngọt ngon nhất trong một không gian ấm cúng.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/menu')}
            sx={{
              backgroundColor: '#8B4513',
              '&:hover': {
                backgroundColor: '#A0522D'
              },
              px: 4,
              py: 1.5,
              fontSize: '1.1rem'
            }}
          >
            Xem Menu
          </Button>
        </Container>
      </ImageCarousel>

      {/* About Section */}
      <Container sx={{ py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 'bold', color: '#8B4513' }}
            >
              About DREAM COFFEE
            </Typography>
            <Typography
              variant="body1"
              paragraph
              sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}
            >
              🌿 Dream Coffee là nơi khởi nguồn của những hương vị nguyên bản, sáng tạo và hiện đại. Mỗi ly cà phê, mỗi thức uống đều được chăm chút tỉ mỉ, mang lại trải nghiệm vừa tinh tế vừa gần gũi. Chúng tôi tin rằng, một tách cà phê ngon không chỉ đánh thức vị giác, mà còn truyền cảm hứng, khơi dậy năng lượng tích cực và tiếp thêm động lực để bạn chạm tới ước mơ.
            </Typography>
            <Typography
              variant="body1"
              paragraph
              sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}
            >
              ✨ Dream Coffee – Hương vị ngất ngây, ước mơ đong đầy.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={interiorImages[0]}
              alt="Dream Coffee Interior"
              sx={{
                width: '100%',
                height: '400px',
                borderRadius: 2,
                boxShadow: 3,
                objectFit: 'cover'
              }}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Featured Items */}
      <Box sx={{ backgroundColor: '#F5F5F5', py: 8 }}>
        <Container>
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{ 
              fontWeight: 'bold', 
              color: '#8B4513', 
              mb: 6,
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' }
            }}
          >
            Best Seller
          </Typography>
          
          {/* Success Message */}
          {successMessage && (
            <Alert 
              severity="success" 
              sx={{ mb: 3 }}
              onClose={() => setSuccessMessage('')}
            >
              {successMessage}
            </Alert>
          )}
          
          {featuredLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={60} sx={{ color: '#8B4513' }} />
            </Box>
          ) : featuredError ? (
            <Alert severity="error" sx={{ mb: 4 }}>
              {featuredError}
            </Alert>
          ) : featuredItems.length === 0 ? (
            <Typography
              variant="h6"
              textAlign="center"
              color="text.secondary"
              sx={{ py: 4 }}
            >
              No best seller items available at the moment.
            </Typography>
          ) : (
            <Grid container spacing={4}>
              {featuredItems.map((item) => {
                const currentQuantity = getCurrentQuantity(item);
                const currentPrice = getCurrentPrice(item);
                
                return (
                  <Grid item xs={12} sm={6} lg={4} key={item._id}>
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
                        image={item.imageUrl || (item.image ? (item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5004'}${item.image}`) : 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop')}
                        alt={item.name}
                        sx={{ objectFit: 'cover', backgroundColor: '#f5f5f5' }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography
                          gutterBottom
                          variant="h5"
                          component="h3"
                          sx={{ fontWeight: 'bold' }}
                        >
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {item.description}
                        </Typography>
                        
                        {/* Size Selection */}
                        {item.sizes && item.sizes.length > 0 && (
                          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                            <InputLabel>Size</InputLabel>
                            <Select
                              value={selectedSize[item._id] || ''}
                              label="Size"
                              onChange={(e) => handleSizeChange(item._id, e.target.value)}
                            >
                              {item.sizes.map((size) => (
                                <MenuItem key={size.name} value={size.name}>
                                  {size.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                        
                        {/* Only show price after size selection for products with sizes */}
                        {((item.sizes && item.sizes.length > 0 && selectedSize[item._id]) || 
                          (!item.sizes || item.sizes.length === 0)) && (
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 'bold', color: '#8B4513' }}
                          >
                            {formatPrice(currentPrice)}
                          </Typography>
                        )}
                        
                        {item.featured && (
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
                              onClick={() => handleUpdateQuantity(item, currentQuantity - 1)}
                              sx={{ minWidth: 40 }}
                            >
                              <Remove />
                            </Button>
                            <Typography variant="h6" sx={{ mx: 2 }}>
                              {currentQuantity}
                            </Typography>
                            <Button
                              size="small"
                              onClick={() => handleUpdateQuantity(item, currentQuantity + 1)}
                              sx={{ minWidth: 40 }}
                            >
                              <Add />
                            </Button>
                          </Box>
                        ) : (
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => handleAddToCart(item)}
                            disabled={item.sizes && item.sizes.length > 0 && !selectedSize[item._id]}
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
          )}
        </Container>
      </Box>


    </Box>
  );
};

export default Home;