import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Button,
  Divider,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Collapse,
  InputAdornment
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCartCheckout,
  ArrowBack,
  LocalShipping,
  Store,
  CreditCard,
  AccountBalanceWallet,
  Money,
  LocationOn,
  Phone,
  Email,
  Person
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatPrice } from '../utils/formatPrice';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const {
    items,
    total,
    itemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartSummary,
    addToCart
  } = useCart();
  
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [orderNotes, setOrderNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Order type and delivery options
  const [orderType, setOrderType] = useState('pickup'); // 'pickup' or 'delivery'
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'cash', 'wallet'
  
  // Delivery form data
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: user?.firstName + ' ' + user?.lastName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    city: '',
    zipCode: '',
    instructions: ''
  });
  
  // Promotional code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [analytics, setAnalytics] = useState({
    cartViews: 0,
    itemsAdded: 0,
    itemsRemoved: 0,
    checkoutAttempts: 0,
    promoCodesUsed: 0,
    sessionStartTime: Date.now()
  });
  
  const steps = ['Order Details', 'Contact Information', 'Payment & Review'];

  // Analytics tracking functions
  const trackEvent = (eventType, eventData = {}) => {
    const timestamp = Date.now();
    const sessionDuration = timestamp - analytics.sessionStartTime;
    
    const analyticsEvent = {
      eventType,
      timestamp,
      sessionDuration,
      cartItemCount: items.length,
      cartValue: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      ...eventData
    };
    
    // In a real application, this would send data to an analytics service
    console.log('Analytics Event:', analyticsEvent);
    
    // Store analytics data locally for demo purposes
    const existingAnalytics = JSON.parse(localStorage.getItem('cartAnalytics') || '[]');
    existingAnalytics.push(analyticsEvent);
    localStorage.setItem('cartAnalytics', JSON.stringify(existingAnalytics));
    
    // Update local analytics state
    setAnalytics(prev => ({
      ...prev,
      [eventType === 'cart_view' ? 'cartViews' : 
       eventType === 'item_added' ? 'itemsAdded' :
       eventType === 'item_removed' ? 'itemsRemoved' :
       eventType === 'checkout_attempt' ? 'checkoutAttempts' :
       eventType === 'promo_code_used' ? 'promoCodesUsed' : eventType]: 
       prev[eventType === 'cart_view' ? 'cartViews' : 
            eventType === 'item_added' ? 'itemsAdded' :
            eventType === 'item_removed' ? 'itemsRemoved' :
            eventType === 'checkout_attempt' ? 'checkoutAttempts' :
            eventType === 'promo_code_used' ? 'promoCodesUsed' : eventType] + 1
    }));
  };

  const getAnalyticsSummary = () => {
    const sessionDuration = Date.now() - analytics.sessionStartTime;
    return {
      ...analytics,
      sessionDuration: Math.round(sessionDuration / 1000), // in seconds
      averageTimePerItem: items.length > 0 ? Math.round(sessionDuration / items.length / 1000) : 0,
      conversionRate: analytics.checkoutAttempts > 0 ? (analytics.checkoutAttempts / analytics.cartViews * 100).toFixed(1) : 0
    };
  };

  // Debug function to log analytics (for development)
  const logAnalytics = () => {
    const summary = getAnalyticsSummary();
    console.log('Cart Analytics Summary:', summary);
    // Get recent events from localStorage instead
    const recentEvents = JSON.parse(localStorage.getItem('cartAnalytics') || '[]').slice(-10);
    console.log('Recent Events:', recentEvents);
  };

  // Add analytics logging on component unmount (for debugging)
  useEffect(() => {
    return () => {
      if (process.env.NODE_ENV === 'development') {
        logAnalytics();
      }
    };
  }, []);

  // Track cart page view on component mount
  useEffect(() => {
    trackEvent('cart_view');
  }, []);

  // Track cart value changes
  useEffect(() => {
    if (items.length > 0) {
      const cartValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      trackEvent('cart_value_change', { cartValue, itemCount: items.length });
    }
  }, [items]);

  // Authentication check - redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold', color: '#8B4513', mb: 4 }}
        >
          Shopping Cart
        </Typography>
        
        <Paper elevation={3} sx={{ p: 6, maxWidth: 500, mx: 'auto' }}>
          <Typography variant="h5" gutterBottom>
            Please log in to view your cart
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You need to be logged in to access your shopping cart and place orders.
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/login"
            sx={{
              backgroundColor: '#8B4513',
              '&:hover': { backgroundColor: '#A0522D' },
              mr: 2
            }}
          >
            Log In
          </Button>
          <Button
            variant="outlined"
            component={Link}
            to="/menu"
            sx={{
              borderColor: '#8B4513',
              color: '#8B4513',
              '&:hover': { borderColor: '#A0522D', color: '#A0522D' }
            }}
          >
            Browse Menu
          </Button>
        </Paper>
      </Container>
    );
  }

  const cartSummary = getCartSummary();

  // Enhanced quantity validation
  const validateQuantity = (item, newQuantity) => {
    const errors = [];
    
    // Basic quantity validation
    if (newQuantity <= 0) {
      return { isValid: false, errors: ['Quantity must be greater than 0'] };
    }
    
    if (newQuantity > 99) {
      errors.push('Maximum quantity per item is 99');
    }
    
    // Stock availability validation
    if (!item.product.inStock) {
      errors.push(`${item.product.name} is currently out of stock`);
    }
    
    // Size-specific availability validation
    if (item.size && item.product.sizes) {
      const sizeInfo = item.product.sizes.find(s => s.name === item.size);
      if (sizeInfo && !sizeInfo.available) {
        errors.push(`${item.size} size is currently unavailable`);
      }
    }
    
    // Reasonable quantity limits for cafe items
    if (newQuantity > 20) {
      errors.push('For large orders (20+ items), please contact us directly');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Handle quantity update with enhanced validation
  const handleQuantityChange = (itemId, newQuantity) => {
    const item = items.find(item => item.id === itemId);
    if (!item) return;
    
    const oldQuantity = item.quantity;
    
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      trackEvent('item_removed', { 
        itemId, 
        productName: item?.product?.name,
        quantityRemoved: oldQuantity,
        reason: 'quantity_zero'
      });
      return;
    }
    
    const validation = validateQuantity(item, newQuantity);
    
    if (!validation.isValid) {
      setError(validation.errors.join('. '));
      setTimeout(() => setError(null), 5000);
      trackEvent('quantity_validation_failed', {
        itemId,
        productName: item?.product?.name,
        attemptedQuantity: newQuantity,
        errors: validation.errors
      });
      return;
    }
    
    updateQuantity(itemId, newQuantity);
    
    // Track quantity changes
    if (newQuantity > oldQuantity) {
      trackEvent('item_added', { 
        itemId, 
        productName: item?.product?.name,
        quantityAdded: newQuantity - oldQuantity,
        method: 'quantity_increase'
      });
    } else if (newQuantity < oldQuantity) {
      trackEvent('item_removed', { 
        itemId, 
        productName: item?.product?.name,
        quantityRemoved: oldQuantity - newQuantity,
        method: 'quantity_decrease'
      });
    }
  };
  
  // Handle direct quantity input
  const handleQuantityInput = (itemId, value) => {
    const numValue = parseInt(value) || 0;
    handleQuantityChange(itemId, numValue);
  };
  
  // Check if item can be added to cart
  const canAddToCart = (item) => {
    const validation = validateQuantity(item, item.quantity + 1);
    return validation.isValid;
  };
  
  // Get stock status message
  const getStockStatus = (item) => {
    if (!item.product.inStock) {
      return { status: 'out-of-stock', message: 'Out of Stock' };
    }
    
    if (item.size && item.product.sizes) {
      const sizeInfo = item.product.sizes.find(s => s.name === item.size);
      if (sizeInfo && !sizeInfo.available) {
        return { status: 'size-unavailable', message: 'Size Unavailable' };
      }
    }
    
    if (item.quantity >= 20) {
      return { status: 'high-quantity', message: 'High Quantity' };
    }
    
    return { status: 'available', message: 'Available' };
  };
  
  // Promotional code validation and management
  const validatePromoCode = async (code) => {
    // Simulate API call for promo code validation
    const validPromoCodes = {
      'WELCOME10': { type: 'percentage', value: 10, minOrder: 0, description: '10% off your order' },
      'SAVE5': { type: 'fixed', value: 5, minOrder: 25, description: '5 VNĐ off orders over 25 VNĐ' },
      'NEWCUSTOMER': { type: 'percentage', value: 15, minOrder: 30, description: '15% off orders over 30 VNĐ' },
      'COFFEE20': { type: 'percentage', value: 20, minOrder: 50, description: '20% off orders over 50 VNĐ' },
      'FREESHIP': { type: 'shipping', value: 0, minOrder: 20, description: 'Free delivery on orders over 20 VNĐ' }
    };
    
    const upperCode = code.toUpperCase();
    const promo = validPromoCodes[upperCode];
    
    if (!promo) {
      throw new Error('Invalid promotional code');
    }
    
    if (cartSummary.subtotal < promo.minOrder) {
      throw new Error(`Minimum order of ${promo.minOrder} VNĐ required for this promo code`);
    }
    
    return {
      code: upperCode,
      ...promo
    };
  };
  
  // Apply promotional code
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promotional code');
      trackEvent('promo_code_error', { error: 'empty_code' });
      return;
    }
    
    setIsApplyingPromo(true);
    setPromoError('');
    
    try {
      const validatedPromo = await validatePromoCode(promoCode);
      setAppliedPromo(validatedPromo);
      setPromoCode('');
      setPromoError('');
      trackEvent('promo_code_used', { 
        code: validatedPromo.code,
        type: validatedPromo.type,
        value: validatedPromo.value,
        cartValue: cartSummary.subtotal
      });
    } catch (error) {
      setPromoError(error.message);
      trackEvent('promo_code_error', { 
        code: promoCode,
        error: error.message 
      });
    } finally {
      setIsApplyingPromo(false);
    }
  };
  
  // Remove applied promotional code
  const handleRemovePromo = () => {
    const removedPromo = appliedPromo;
    setAppliedPromo(null);
    setPromoError('');
    trackEvent('promo_code_removed', { 
      code: removedPromo?.code,
      type: removedPromo?.type,
      value: removedPromo?.value
    });
  };
  
  // Calculate discount amount
  const calculateDiscount = () => {
    if (!appliedPromo) return 0;
    
    switch (appliedPromo.type) {
      case 'percentage':
        return (cartSummary.subtotal * appliedPromo.value) / 100;
      case 'fixed':
        return Math.min(appliedPromo.value, cartSummary.subtotal);
      case 'shipping':
        return 0; // Shipping discount handled separately
      default:
        return 0;
    }
  };
  
  // Calculate final totals with discount
  const getFinalTotals = () => {
    const subtotal = cartSummary.subtotal;
    const discount = calculateDiscount();
    const discountedSubtotal = subtotal - discount;
    const tax = discountedSubtotal * 0.085;
    const total = discountedSubtotal + tax;
    
    return {
      subtotal,
      discount,
      discountedSubtotal,
      tax,
      total,
      itemCount: cartSummary.itemCount
    };
  };

  // Get product recommendations based on cart contents
  const getRecommendations = () => {
    if (items.length === 0) return [];
    
    // Sample recommendations - in a real app, this would come from an API
    const sampleRecommendations = [
      {
        _id: 'rec1',
        name: 'Chocolate Croissant',
        description: 'Buttery croissant filled with rich chocolate',
        price: 3.95,
        category: 'Pastries',
        image: 'https://images.unsplash.com/photo-1555507036-ab794f4ade0a?w=300&h=180&fit=crop',
        featured: true
      },
      {
        _id: 'rec2',
        name: 'Vanilla Latte',
        description: 'Smooth espresso with steamed milk and vanilla syrup',
        price: 5.25,
        category: 'Coffee',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=180&fit=crop',
        featured: false
      },
      {
        _id: 'rec3',
        name: 'Blueberry Muffin',
        description: 'Fresh baked muffin bursting with blueberries',
        price: 2.75,
        category: 'Pastries',
        image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=300&h=180&fit=crop',
        featured: true
      },
      {
        _id: 'rec4',
        name: 'Iced Caramel Macchiato',
        description: 'Espresso with vanilla syrup, steamed milk, and caramel drizzle over ice',
        price: 5.75,
        category: 'Cold Drinks',
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=180&fit=crop',
        featured: false
      },
      {
        _id: 'rec5',
        name: 'Cinnamon Roll',
        description: 'Warm cinnamon roll with cream cheese frosting',
        price: 4.25,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=180&fit=crop',
        featured: true
      },
      {
        _id: 'rec6',
        name: 'Green Tea',
        description: 'Premium organic green tea with antioxidants',
        price: 3.25,
        category: 'Tea',
        image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=180&fit=crop',
        featured: false
      }
    ];
    
    // Get categories from current cart items
    const cartCategories = [...new Set(items.map(item => item.product.category))];
    const cartItemIds = items.map(item => item.product._id);
    
    // Filter out items already in cart and prioritize complementary categories
    let filtered = sampleRecommendations.filter(rec => !cartItemIds.includes(rec._id));
    
    // Smart recommendations based on cart contents
    if (cartCategories.includes('Coffee')) {
      // If cart has coffee, recommend pastries and desserts
      filtered = filtered.filter(rec => ['Pastries', 'Desserts'].includes(rec.category));
    } else if (cartCategories.includes('Pastries')) {
      // If cart has pastries, recommend coffee and tea
      filtered = filtered.filter(rec => ['Coffee', 'Tea', 'Cold Drinks'].includes(rec.category));
    } else {
      // Default: show popular items
      filtered = filtered.filter(rec => rec.featured);
    }
    
    // If we don't have enough recommendations, add more from other categories
    if (filtered.length < 3) {
      const additional = sampleRecommendations
        .filter(rec => !cartItemIds.includes(rec._id) && !filtered.find(f => f._id === rec._id))
        .slice(0, 3 - filtered.length);
      filtered = [...filtered, ...additional];
    }
    
    return filtered.slice(0, 3); // Show max 3 recommendations
  };

  // Handle adding recommended item to cart
  const handleAddRecommendation = (product) => {
    // Track recommendation interaction
    trackEvent('recommendation_clicked', {
      productId: product._id,
      productName: product.name,
      productCategory: product.category,
      productPrice: product.price,
      cartValue: cartSummary.total,
      cartItemCount: items.length
    });
    
    // Create a product object that matches the expected format
    const productToAdd = {
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      inStock: true,
      sizes: [{ name: 'Regular', price: product.price, available: true }]
    };
    
    // Add to cart with default size and quantity of 1
    addToCart(productToAdd, 1, 'Regular');
    
    // Track successful addition from recommendation
    trackEvent('item_added', {
      itemId: product._id,
      productName: product.name,
      quantityAdded: 1,
      method: 'recommendation',
      source: 'cart_recommendations'
    });
    
    // Show a brief success message
    setError(null);
  };

  // Validation functions
  const validateDeliveryInfo = () => {
    const errors = {};
    
    // Always validate contact information (required for both pickup and delivery)
    if (!deliveryInfo.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!deliveryInfo.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(deliveryInfo.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    if (!deliveryInfo.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryInfo.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Additional validation for delivery orders
    if (orderType === 'delivery') {
      if (!deliveryInfo.address.trim()) {
        errors.address = 'Address is required';
      }
      if (!deliveryInfo.city.trim()) {
        errors.city = 'City is required';
      }
      if (!deliveryInfo.zipCode.trim()) {
        errors.zipCode = 'ZIP code is required';
      } else if (!/^\d{5}(-\d{4})?$/.test(deliveryInfo.zipCode)) {
        errors.zipCode = 'Please enter a valid ZIP code';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle delivery info change
  const handleDeliveryInfoChange = (field, value) => {
    setDeliveryInfo(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle step navigation
  const handleNext = () => {
    if (activeStep === 1 && !validateDeliveryInfo()) {
      trackEvent('checkout_step_validation_failed', {
        step: activeStep,
        stepName: 'delivery_info'
      });
      return;
    }
    trackEvent('checkout_step_completed', {
      step: activeStep,
      nextStep: activeStep + 1
    });
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    trackEvent('checkout_step_back', {
      fromStep: activeStep,
      toStep: activeStep - 1
    });
    setActiveStep(prev => prev - 1);
  };

  // Handle checkout process
  const handleCheckout = async () => {
    // Track checkout attempt
    trackEvent('checkout_attempted', {
      cartValue: cartSummary.total,
      itemCount: items.length,
      orderType,
      paymentMethod,
      hasPromoCode: !!appliedPromo
    });

    if (!isAuthenticated) {
      trackEvent('checkout_failed', { reason: 'not_authenticated' });
      navigate('/login');
      return;
    }

    // Final validation
    if (!validateDeliveryInfo()) {
      setError('Please fill in all required fields correctly.');
      trackEvent('checkout_failed', { reason: 'validation_failed' });
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Prepare order data with promotional code information
      const finalTotals = getFinalTotals();
      const orderData = {
        items: items.map(item => ({
          product: item.product._id,
          name: item.product.name,
          size: item.size || 'Regular',
          quantity: item.quantity,
          price: item.price
        })),
        orderType,
        paymentMethod,
        notes: orderNotes,
        deliveryAddress: orderType === 'delivery' ? {
          street: deliveryInfo.address,
          city: deliveryInfo.city,
          zipCode: deliveryInfo.zipCode,
          instructions: deliveryInfo.instructions
        } : null,
        subtotal: finalTotals.subtotal,
        discount: finalTotals.discount,
        tax: finalTotals.tax,
        total: finalTotals.total,
        promoCode: appliedPromo ? {
          code: appliedPromo.code,
          type: appliedPromo.type,
          value: appliedPromo.value,
          description: appliedPromo.description
        } : null
      };

      console.log('DEBUG: Order data being sent:', orderData);
      console.log('DEBUG: API URL:', import.meta.env.VITE_API_URL);
      console.log('DEBUG: Token:', token ? 'Present' : 'Missing');

      // Handle MoMo payment differently
      if (paymentMethod === 'momo') {
        // First create the order
        console.log('DEBUG: Making MoMo order request to:', `${import.meta.env.VITE_API_URL}/api/orders`);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        });
        console.log('DEBUG: MoMo order response status:', response.status);
        console.log('DEBUG: MoMo order response ok:', response.ok);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Session expired. Please log in again.');
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create order. Please try again.');
        }

        const orderResult = await response.json();
        if (orderResult.success && orderResult.data && orderResult.data.orderNumber) {
          // Create MoMo payment request
          const momoResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/momo/create`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              orderId: orderResult.data.orderNumber,
              amount: Math.round(finalTotals.total * 100), // Convert to cents
              orderInfo: `Payment for order ${orderResult.data.orderNumber}`
            })
          });

          if (!momoResponse.ok) {
            throw new Error('Failed to create MoMo payment. Please try again.');
          }

          const momoData = await momoResponse.json();
          if (momoData.success && momoData.payUrl) {
            // Track MoMo payment initiation
            trackEvent('momo_payment_initiated', {
              orderId: orderResult.data._id,
              cartValue: cartSummary.total,
              itemCount: items.length
            });
            
            // Clear cart and redirect to MoMo payment
            clearCart();
            setShowCheckoutDialog(false);
            setActiveStep(0);
            
            // Redirect to MoMo payment page
            window.location.href = momoData.payUrl;
          } else {
            throw new Error(momoData.message || 'Failed to initialize MoMo payment');
          }
        } else {
          throw new Error(orderResult.message || (!orderResult.data ? 'Order creation failed - no order data returned' : 'Failed to create order'));
        }
      } else if (paymentMethod === 'vnpay') {
        // Handle VNPay payment
        console.log('DEBUG: Making VNPay order request to:', `${import.meta.env.VITE_API_URL}/api/orders`);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        });
        console.log('DEBUG: VNPay order response status:', response.status);
        console.log('DEBUG: VNPay order response ok:', response.ok);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Session expired. Please log in again.');
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create order. Please try again.');
        }

        const orderResult = await response.json();
        if (orderResult.success && orderResult.data && orderResult.data.orderNumber) {
          // Create VNPay payment request
          const vnpayResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/vnpay/create`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              orderId: orderResult.data.orderNumber,
              amount: Math.round(finalTotals.total), // Amount in VND (backend will convert to cents)
              orderInfo: `Payment for order ${orderResult.data.orderNumber}`,
              bankCode: '', // Optional: can be specified for direct bank selection
              locale: 'vn' // Vietnamese locale
            })
          });

          if (!vnpayResponse.ok) {
            throw new Error('Failed to create VNPay payment. Please try again.');
          }

          const vnpayData = await vnpayResponse.json();
          console.log('VNPay Response:', vnpayData);
          
          if (vnpayData.success && vnpayData.data && vnpayData.data.paymentUrl) {
            console.log('Redirecting to VNPay URL:', vnpayData.data.paymentUrl);
            
            // Track VNPay payment initiation
            trackEvent('vnpay_payment_initiated', {
              orderId: orderResult.data._id,
              cartValue: cartSummary.total,
              itemCount: items.length
            });
            
            // Clear cart and redirect to VNPay payment
            clearCart();
            setShowCheckoutDialog(false);
            setActiveStep(0);
            
            // Redirect to VNPay payment page
            window.location.href = vnpayData.data.paymentUrl;
          } else {
            throw new Error(vnpayData.message || 'Failed to initialize VNPay payment');
          }
        } else {
          throw new Error(orderResult.message || (!orderResult.data ? 'Order creation failed - no order data returned' : 'Failed to create order'));
        }
      } else if (paymentMethod === 'card') {
        // Handle card payment - redirect to external payment page
        console.log('DEBUG: Making card order request to:', `${import.meta.env.VITE_API_URL}/api/orders`);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        });
        console.log('DEBUG: Card order response status:', response.status);
        console.log('DEBUG: Card order response ok:', response.ok);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Session expired. Please log in again.');
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create order. Please try again.');
        }

        const orderResult = await response.json();
        if (orderResult.success && orderResult.data && orderResult.data.orderNumber) {
          // Track card payment initiation
          trackEvent('card_payment_initiated', {
            orderId: orderResult.data._id,
            cartValue: cartSummary.total,
            itemCount: items.length
          });
          
          // Clear cart and redirect to card payment page
          clearCart();
          setShowCheckoutDialog(false);
          setActiveStep(0);
          
          // Redirect to card payment page
          navigate(`/payment/card?orderId=${orderResult.data.orderNumber}&amount=${Math.round(finalTotals.total * 100)}`);
        } else {
          throw new Error(orderResult.message || (!orderResult.data ? 'Order creation failed - no order data returned' : 'Failed to create order'));
        }
      } else if (paymentMethod === 'cash') {
        // Handle cash payment - redirect to external payment page
        console.log('DEBUG: Making cash order request to:', `${import.meta.env.VITE_API_URL}/api/orders`);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        });
        console.log('DEBUG: Cash order response status:', response.status);
        console.log('DEBUG: Cash order response ok:', response.ok);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Session expired. Please log in again.');
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create order. Please try again.');
        }

        const orderResult = await response.json();
        if (orderResult.success && orderResult.data && orderResult.data.orderNumber) {
          // Track cash payment initiation
          trackEvent('cash_payment_initiated', {
            orderId: orderResult.data._id,
            cartValue: cartSummary.total,
            itemCount: items.length
          });
          
          // Clear cart and redirect to cash payment page
          clearCart();
          setShowCheckoutDialog(false);
          setActiveStep(0);
          
          // Redirect to cash payment page
          navigate(`/payment/cash?orderId=${orderResult.data.orderNumber}&amount=${Math.round(finalTotals.total * 100)}`);
        } else {
          throw new Error(orderResult.message || (!orderResult.data ? 'Order creation failed - no order data returned' : 'Failed to create order'));
        }
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      setError(error.message || 'Checkout failed. Please try again.');
      trackEvent('checkout_failed', {
        reason: 'api_error',
        error: error.message,
        cartValue: cartSummary.total
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // If cart is empty
  if (items.length === 0 && !orderSuccess) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold', color: '#8B4513', mb: 4 }}
        >
          Shopping Cart
        </Typography>
        
        <Paper elevation={3} sx={{ p: 6, maxWidth: 500, mx: 'auto' }}>
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Add some delicious items from our menu to get started!
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/menu"
            startIcon={<ArrowBack />}
            sx={{
              backgroundColor: '#8B4513',
              '&:hover': { backgroundColor: '#A0522D' }
            }}
          >
            Browse Menu
          </Button>
        </Paper>
      </Container>
    );
  }

  // Order success message
  if (orderSuccess) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 6, maxWidth: 500, mx: 'auto' }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#4caf50' }}>
            Order Placed Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Thank you for your order. You will be redirected to your order history shortly.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 3 } }}>
      <Typography
        variant="h3"
        component="h1"
        textAlign="center"
        gutterBottom
        sx={{ 
          fontWeight: 'bold', 
          color: '#8B4513', 
          mb: { xs: 2, sm: 4 },
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
        }}
      >
        Shopping Cart
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'stretch', sm: 'center' }, 
              mb: 3,
              gap: { xs: 2, sm: 0 }
            }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}>
                Cart Items ({itemCount})
              </Typography>
              <Button
                color="error"
                onClick={clearCart}
                startIcon={<Delete />}
                disabled={items.length === 0}
                sx={{ 
                  alignSelf: { xs: 'flex-start', sm: 'auto' },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  py: { xs: 0.5, sm: 1 }
                }}
              >
                Clear Cart
              </Button>
            </Box>

            {items.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Your cart is empty
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Add some delicious items to get started!
                </Typography>
                <Button
                  component={Link}
                  to="/menu"
                  variant="contained"
                  sx={{
                    backgroundColor: '#8B4513',
                    '&:hover': { backgroundColor: '#A0522D' }
                  }}
                >
                  Browse Menu
                </Button>
              </Box>
            ) : (
              items.map((item) => (
                <Card key={item.id} sx={{ mb: 3, overflow: 'visible', boxShadow: 2, '&:hover': { boxShadow: 4 } }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    p: { xs: 1.5, sm: 2 }
                  }}>
                    <CardMedia
                      component="img"
                      sx={{ 
                        width: { xs: '100%', sm: 140 }, 
                        height: { xs: 200, sm: 140 }, 
                        borderRadius: 2,
                        objectFit: 'contain',
                        backgroundColor: '#f5f5f5',
                        mr: { xs: 0, sm: 2 },
                        mb: { xs: 2, sm: 0 }
                      }}
                      image={item.product.image ? (item.product.image.startsWith('http') ? item.product.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${item.product.image}`) : `https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop&auto=format`}
                      alt={item.product.name}
                    />
                    <CardContent sx={{ flex: 1, p: 0, '&:last-child': { pb: 0 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c2c2c', mb: 0.5 }}>
                            {item.product.name}
                          </Typography>
                          {item.product.category && (
                            <Chip 
                              label={item.product.category} 
                              size="small" 
                              sx={{ 
                                backgroundColor: '#f5f5f5', 
                                color: '#8B4513',
                                fontSize: '0.75rem',
                                mb: 1
                              }} 
                            />
                          )}
                          {item.product.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.4 }}>
                              {item.product.description.length > 100 
                                ? `${item.product.description.substring(0, 100)}...` 
                                : item.product.description
                              }
                            </Typography>
                          )}
                          {item.size && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                Size:
                              </Typography>
                              <Chip 
                                label={item.size} 
                                size="small" 
                                variant="outlined"
                                sx={{ height: 24 }}
                              />
                            </Box>
                          )}
                          
                          {/* Stock Status Indicator */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              Status:
                            </Typography>
                            {(() => {
                              const stockStatus = getStockStatus(item);
                              const statusColors = {
                                'available': { bg: '#e8f5e8', color: '#2e7d32' },
                                'out-of-stock': { bg: '#ffebee', color: '#d32f2f' },
                                'size-unavailable': { bg: '#fff3e0', color: '#f57c00' },
                                'high-quantity': { bg: '#e3f2fd', color: '#1976d2' }
                              };
                              const colors = statusColors[stockStatus.status] || statusColors.available;
                              return (
                                <Chip 
                                  label={stockStatus.message}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: colors.bg,
                                    color: colors.color,
                                    fontSize: '0.75rem',
                                    height: 24
                                  }}
                                />
                              );
                            })()}
                          </Box>
                          
                          <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#8B4513' }}>
                            {formatPrice(item.price)} each
                          </Typography>
                        </Box>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => removeFromCart(item.id)}
                          sx={{ 
                            ml: { xs: 0, sm: 2 },
                            alignSelf: { xs: 'flex-start', sm: 'flex-start' },
                            '&:hover': { backgroundColor: '#ffebee' }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between', 
                        alignItems: { xs: 'stretch', sm: 'center' },
                        gap: { xs: 2, sm: 0 }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', mr: 1 }}>
                            Quantity:
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            sx={{ 
                              border: '1px solid #ddd',
                              borderRadius: 1,
                              width: 32,
                              height: 32,
                              '&:hover': { backgroundColor: '#f5f5f5' },
                              '&:disabled': { 
                                backgroundColor: '#f5f5f5',
                                color: '#ccc',
                                borderColor: '#eee'
                              }
                            }}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          <TextField
                            size="small"
                            value={item.quantity}
                            onChange={(e) => handleQuantityInput(item.id, e.target.value)}
                            onBlur={(e) => {
                              // Ensure minimum quantity of 1 on blur
                              if (!e.target.value || parseInt(e.target.value) < 1) {
                                handleQuantityChange(item.id, 1);
                              }
                            }}
                            inputProps={{
                              min: 1,
                              max: 99,
                              type: 'number',
                              style: { textAlign: 'center', width: '60px' }
                            }}
                            sx={{ 
                              mx: 1,
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: getStockStatus(item).status === 'available' ? '#ddd' : '#f57c00'
                                }
                              }
                            }}
                            error={getStockStatus(item).status !== 'available'}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={!canAddToCart(item) || getStockStatus(item).status !== 'available'}
                            sx={{ 
                              border: '1px solid #ddd',
                              borderRadius: 1,
                              width: 32,
                              height: 32,
                              '&:hover': { backgroundColor: '#f5f5f5' },
                              '&:disabled': { 
                                backgroundColor: '#f5f5f5',
                                color: '#ccc',
                                borderColor: '#eee'
                              }
                            }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <Box sx={{ 
                          textAlign: { xs: 'left', sm: 'right' },
                          mt: { xs: 1, sm: 0 }
                        }}>
                          <Typography variant="body2" color="text.secondary">
                            {item.quantity} × {formatPrice(item.price)}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#8B4513' }}>
                            {formatPrice(item.price * item.quantity)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Box>
                </Card>
              ))
            )}
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ 
            p: { xs: 2, sm: 3 }, 
            position: { xs: 'static', md: 'sticky' }, 
            top: { md: 20 },
            mt: { xs: 2, md: 0 }
          }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
              Order Summary
            </Typography>
            
            {/* Promotional Code Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Promotional Code
              </Typography>
              
              {!appliedPromo ? (
                <Box>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1, 
                    mb: 1 
                  }}>
                    <TextField
                      size="small"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                      disabled={isApplyingPromo}
                      sx={{ flexGrow: 1 }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleApplyPromo}
                      disabled={isApplyingPromo || !promoCode.trim()}
                      sx={{ 
                        minWidth: { xs: 'auto', sm: 'auto' },
                        px: 2,
                        borderColor: '#8B4513',
                        color: '#8B4513',
                        '&:hover': {
                          borderColor: '#6B3410',
                          backgroundColor: 'rgba(139, 69, 19, 0.04)'
                        }
                      }}
                    >
                      {isApplyingPromo ? 'Applying...' : 'Apply'}
                    </Button>
                  </Box>
                  {promoError && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {promoError}
                    </Alert>
                  )}
                </Box>
              ) : (
                <Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 2,
                    backgroundColor: '#e8f5e8',
                    borderRadius: 1,
                    border: '1px solid #4caf50'
                  }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                        {appliedPromo.code}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {appliedPromo.description}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={handleRemovePromo}
                      sx={{ color: '#d32f2f', minWidth: 'auto' }}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>{formatPrice(getFinalTotals().subtotal)}</Typography>
              </Box>
              {appliedPromo && getFinalTotals().discount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: '#4caf50' }}>Discount ({appliedPromo.code}):</Typography>
                  <Typography sx={{ color: '#4caf50' }}>-{formatPrice(getFinalTotals().discount)}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tax (8.5%):</Typography>
                <Typography>{formatPrice(getFinalTotals().tax)}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total:</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#8B4513' }}>
                  {formatPrice(getFinalTotals().total)}
                </Typography>
              </Box>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Order Notes (Optional)"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<ShoppingCartCheckout />}
              onClick={() => {
                  setShowCheckoutDialog(true);
                  trackEvent('checkout_dialog_opened', {
                    cartValue: cartSummary.total,
                    itemCount: items.length
                  });
                }}
              sx={{
                backgroundColor: '#8B4513',
                '&:hover': { backgroundColor: '#A0522D' },
                py: 1.5
              }}
            >
              Proceed to Checkout
            </Button>

            <Button
              fullWidth
              component={Link}
              to="/menu"
              sx={{ mt: 2 }}
            >
              Continue Shopping
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Recommendations Section */}
      {items.length > 0 && (
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography
            variant="h4"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{ 
              fontWeight: 'bold', 
              color: '#8B4513', 
              mb: 4,
              fontSize: { xs: '1.8rem', md: '2.125rem' }
            }}
          >
            You Might Also Like
          </Typography>
          
          <Grid container spacing={3}>
            {getRecommendations().map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={product.image ? (product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${product.image}`) : 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=180&fit=crop'}
                    alt={product.name}
                    sx={{ objectFit: 'contain', backgroundColor: '#f5f5f5' }}
                  />
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="h3"
                      sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}
                    >
                      {product.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {product.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 'bold', color: '#8B4513' }}
                      >
                        {formatPrice(product.price)}
                      </Typography>
                      {product.featured && (
                        <Chip
                          label="Popular"
                          size="small"
                          sx={{ 
                            backgroundColor: '#8B4513', 
                            color: 'white',
                            fontSize: '0.75rem'
                          }}
                        />
                      )}
                    </Box>
                    
                    <Chip
                      label={product.category}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        borderColor: '#8B4513', 
                        color: '#8B4513',
                        fontSize: '0.7rem'
                      }}
                    />
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => handleAddRecommendation(product)}
                      sx={{
                        borderColor: '#8B4513',
                        color: '#8B4513',
                        '&:hover': {
                          backgroundColor: '#8B4513',
                          color: 'white',
                          borderColor: '#8B4513'
                        },
                        textTransform: 'none',
                        fontWeight: 'medium'
                      }}
                    >
                      Add to Cart
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Checkout Dialog */}
      <Dialog 
        open={showCheckoutDialog} 
        onClose={() => setShowCheckoutDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <ShoppingCartCheckout />
            Checkout
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step 0: Order Details */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Choose Order Type
                </Typography>
                <FormControl component="fieldset" sx={{ mb: 3 }}>
                  <RadioGroup
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    row
                  >
                    <FormControlLabel
                      value="pickup"
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Store />
                          Pickup
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="delivery"
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocalShipping />
                          Delivery
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
                
                {orderType === 'pickup' && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Pickup Location:</strong> WebCaffe Main Store<br />
                      123 Coffee Street, Coffee City, CC 12345<br />
                      <strong>Pickup Hours:</strong> Mon-Sun 7:00 AM - 9:00 PM
                    </Typography>
                  </Alert>
                )}
                
                {orderType === 'delivery' && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Delivery Fee:</strong> 3.99 VNĐ<br />
                      <strong>Estimated Time:</strong> 30-45 minutes<br />
                      <strong>Delivery Area:</strong> Within 5 miles of our store
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}

            {/* Step 1: Delivery Information */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {orderType === 'delivery' ? 'Delivery Information' : 'Contact Information'}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name *"
                      value={deliveryInfo.fullName}
                      onChange={(e) => handleDeliveryInfoChange('fullName', e.target.value)}
                      error={!!validationErrors.fullName}
                      helperText={validationErrors.fullName}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number *"
                      value={deliveryInfo.phone}
                      onChange={(e) => handleDeliveryInfoChange('phone', e.target.value)}
                      error={!!validationErrors.phone}
                      helperText={validationErrors.phone}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address *"
                      type="email"
                      value={deliveryInfo.email}
                      onChange={(e) => handleDeliveryInfoChange('email', e.target.value)}
                      error={!!validationErrors.email}
                      helperText={validationErrors.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  {orderType === 'delivery' && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Street Address *"
                          value={deliveryInfo.address}
                          onChange={(e) => handleDeliveryInfoChange('address', e.target.value)}
                          error={!!validationErrors.address}
                          helperText={validationErrors.address}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOn />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="City *"
                          value={deliveryInfo.city}
                          onChange={(e) => handleDeliveryInfoChange('city', e.target.value)}
                          error={!!validationErrors.city}
                          helperText={validationErrors.city}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="ZIP Code *"
                          value={deliveryInfo.zipCode}
                          onChange={(e) => handleDeliveryInfoChange('zipCode', e.target.value)}
                          error={!!validationErrors.zipCode}
                          helperText={validationErrors.zipCode}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Delivery Instructions (Optional)"
                          value={deliveryInfo.instructions}
                          onChange={(e) => handleDeliveryInfoChange('instructions', e.target.value)}
                          placeholder="Apartment number, gate code, special instructions..."
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            )}

            {/* Step 2: Payment & Review */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Payment Method
                </Typography>
                
                <FormControl component="fieldset" sx={{ mb: 3 }}>
                  <RadioGroup
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <FormControlLabel
                      value="card"
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <CreditCard />
                          Credit/Debit Card
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="cash"
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Money />
                          Cash {orderType === 'delivery' ? '(Pay on Delivery)' : '(Pay at Pickup)'}
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="momo"
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <AccountBalanceWallet />
                          MoMo E-Wallet
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="vnpay"
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <CreditCard />
                          VNPay
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>

                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                {items.map((item) => (
                  <Box key={item.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="body1" fontWeight="bold">
                      {item.product.name} {item.size ? `(${item.size})` : ''}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quantity: {item.quantity} × {formatPrice(item.price)} = {formatPrice(item.quantity * item.price)}
                    </Typography>
                  </Box>
                ))}
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Subtotal:</Typography>
                  <Typography variant="body1">{formatPrice(cartSummary.subtotal)}</Typography>
                </Box>
                {orderType === 'delivery' && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Delivery Fee:</Typography>
                    <Typography variant="body1">3.99 VNĐ</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Tax:</Typography>
                  <Typography variant="body1">{formatPrice(cartSummary.tax)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">Total:</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatPrice(cartSummary.total + (orderType === 'delivery' ? 3.99 : 0))}
                  </Typography>
                </Box>
                
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Order Notes (Optional)"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Any special instructions for your order..."
                  sx={{ mb: 2 }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCheckoutDialog(false)}>
            Cancel
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep > 0 && (
            <Button onClick={handleBack}>
              Back
            </Button>
          )}
          {activeStep < 2 ? (
            <Button 
              onClick={handleNext} 
              variant="contained"
              sx={{
                backgroundColor: '#8B4513',
                '&:hover': { backgroundColor: '#A0522D' }
              }}
            >
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleCheckout} 
              variant="contained" 
              disabled={isProcessing}
              sx={{
                backgroundColor: '#8B4513',
                '&:hover': { backgroundColor: '#A0522D' }
              }}
            >
              {isProcessing ? 'Processing...' : 'Place Order'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Cart;