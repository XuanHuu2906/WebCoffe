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
  CardActions,
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
  Person,
  CheckCircle,
  Receipt
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
    district: '',
    instructions: ''
  });
  
  // Promotional code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [analytics, setAnalytics] = useState({
    cartViews: 0,
    itemsAdded: 0,
    itemsRemoved: 0,
    checkoutAttempts: 0,
    promoCodesUsed: 0,
    sessionStartTime: Date.now()
  });
  
  const steps = ['Thông tin đơn hàng', 'Thông tin giao hàng', 'Thanh toán & Xem lại'];

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

  // Load recommendations when cart changes
  useEffect(() => {
    const loadRecommendations = async () => {
      if (items.length > 0) {
        setLoadingRecommendations(true);
        try {
          const recs = await getRecommendations();
          setRecommendations(recs);
        } catch (error) {
          console.error('Failed to load recommendations:', error);
          setRecommendations([]);
        } finally {
          setLoadingRecommendations(false);
        }
      } else {
        setRecommendations([]);
      }
    };

    loadRecommendations();
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
          Tóm tắt đơn hàng
        </Typography>
        
        <Paper elevation={3} sx={{ p: 6, maxWidth: 500, mx: 'auto' }}>
          <Typography variant="h5" gutterBottom>
            Vui lòng đăng nhập để xem giỏ hàng
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Bạn cần đăng nhập để truy cập giỏ hàng và đặt hàng.
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
            Đăng nhập
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
            Xem menu
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
      return { isValid: false, errors: ['Số lượng phải lớn hơn 0'] };
    }
    
    if (newQuantity > 99) {
      errors.push('Số lượng tối đa mỗi món là 99');
    }
    
    // Stock availability validation
    if (!item.product.inStock) {
      errors.push(`${item.product.name} hiện không có sẵn`);
    }
    
    // Size-specific availability validation
    if (item.size && item.product.sizes) {
      const sizeInfo = item.product.sizes.find(s => s.name === item.size);
      if (sizeInfo && !sizeInfo.available) {
        errors.push(`${item.size} size không có sẵn`);
      }
    }
    
    // Reasonable quantity limits for cafe items
    if (newQuantity > 20) {
      errors.push('Số lượng tối đa mỗi món là 20');
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
      return { status: 'out-of-stock', message: 'Hết hàng' };
    }
    
    if (item.size && item.product.sizes) {
      const sizeInfo = item.product.sizes.find(s => s.name === item.size);
      if (sizeInfo && !sizeInfo.available) {
        return { status: 'size-unavailable', message: 'Size không có sẵn' };
      }
    }
    
    if (item.quantity >= 20) {
      return { status: 'high-quantity', message: 'Số lượng quá cao' };
    }
    
    return { status: 'available', message: 'Còn hàng' };
  };
  
  // Promotional code validation and management
  const validatePromoCode = async (code) => {
    // Simulate API call for promo code validation
    const validPromoCodes = {
      'WELCOME10': { type: 'percentage', value: 10, minOrder: 0, description: '10% giảm giá trên đơn hàng' },
      'SAVE5': { type: 'fixed', value: 5, minOrder: 25, description: '5 VNĐ giảm giá trên đơn hàng trên 25 VNĐ' },
      'NEWCUSTOMER': { type: 'percentage', value: 15, minOrder: 30, description: '15% giảm giá trên đơn hàng trên 30 VNĐ' },
      'COFFEE20': { type: 'percentage', value: 20, minOrder: 50, description: '20% giảm giá trên đơn hàng trên 50 VNĐ' },
      'FREESHIP': { type: 'shipping', value: 0, minOrder: 20, description: 'Giao hàng miễn phí trên đơn hàng trên 20 VNĐ' }
    };
    
    const lowerCode = code.toLowerCase();
    const promo = validPromoCodes[lowerCode];
    
    if (!promo) {
      throw new Error('Mã giảm giá không hợp lệ');
    }
    
    if (cartSummary.subtotal < promo.minOrder) {
      throw new Error(`Mua hàng ít nhất ${promo.minOrder} VNĐ mới có thể sử dụng mã này`);
    }
    
    return {
      code: lowerCode,
      ...promo
    };
  };
  
  // Apply promotional code
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Vui lòng nhập mã giảm giá');
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
  const getRecommendations = async () => {
    try {
      // Fetch best sellers from the database
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/bestsellers`);
      
      if (!response.ok) {
        throw new Error('Lỗi khi lấy danh sách sản phẩm bán chạy');
      }
      
      const data = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error('Dữ liệu không hợp lệ');
      }
      
      let bestSellers = data.data;
      
      // If cart is empty, return empty array (no recommendations when cart is empty)
      if (items.length === 0) {
        return [];
      }
      
      // Get categories from current cart items
      const cartCategories = [...new Set(items.map(item => item.product.category))];
      const cartItemIds = items.map(item => item.product._id);
      
      // Filter out items already in cart
      let filtered = bestSellers.filter(rec => !cartItemIds.includes(rec._id));
      
      // Smart recommendations based on cart contents
      if (cartCategories.includes('Cà phê')) {
        // If cart has coffee, recommend pastries and desserts
        filtered = filtered.filter(rec => ['Bánh ngọt'].includes(rec.category));
      } else if (cartCategories.includes('Bánh ngọt')) {
        // If cart has pastries, recommend coffee and drinks
        filtered = filtered.filter(rec => ['Cà phê', 'Thức uống đậm vị', 'Đồ uống tươi mát'].includes(rec.category));
      } else {
        // Default: show featured best sellers
        filtered = filtered.filter(rec => rec.featured);
      }
      
      // If we don't have enough recommendations, add more from other categories
      if (filtered.length < 3) {
        const additional = bestSellers
          .filter(rec => !cartItemIds.includes(rec._id) && !filtered.find(f => f._id === rec._id))
          .slice(0, 3 - filtered.length);
        filtered = [...filtered, ...additional];
      }
      
      return filtered.slice(0, 3); // Show max 3 recommendations
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      
      // Fallback: return empty array if API fails
      return [];
    }
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
      errors.fullName = 'Họ tên là bắt buộc';
    }
    if (!deliveryInfo.phone.trim()) {
      errors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(deliveryInfo.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }
    if (!deliveryInfo.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryInfo.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    // Additional validation for delivery orders
    if (orderType === 'delivery') {
      if (!deliveryInfo.address.trim()) {
        errors.address = 'Địa chỉ là bắt buộc';
      }
      if (!deliveryInfo.city.trim()) {
        errors.city = 'Thành phố là bắt buộc';
      }
      if (!deliveryInfo.district.trim()) {
        errors.district = 'Quận/huyện là bắt buộc';
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
      setError('Vui lòng điền đầy đủ thông tin liên hệ và địa chỉ giao hàng.');
      trackEvent('checkout_failed', { reason: 'delivery_info_validation_failed' });
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập lại.');
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
            throw new Error('Hết phiên đăng nhập. Vui lòng đăng nhập lại.');
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Lỗi khi tạo đơn hàng. Vui lòng thử lại.');
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
              orderInfo: `Thanh toán đơn hàng ${orderResult.data.orderNumber}`
            })
          });

          if (!momoResponse.ok) {
            throw new Error('Tạo thanh toán MoMo thất bại. Vui lòng thử lại.');
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
            throw new Error(momoData.message || 'Lỗi khi khởi tạo thanh toán MoMo. Vui lòng thử lại.');
          }
        } else {
          throw new Error(orderResult.message || (!orderResult.data ? 'Tạo đơn hàng thất bại - không có dữ liệu đơn hàng trả về' : 'Tạo đơn hàng thất bại'));
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
            throw new Error('Hết phiên đăng nhập. Vui lòng đăng nhập lại.');
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Lỗi khi tạo đơn hàng. Vui lòng thử lại.');
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
            throw new Error('Lỗi khi tạo thanh toán VNPay. Vui lòng thử lại.');
          }

          const vnpayData = await vnpayResponse.json();
          console.log('VNPay Response:', vnpayData);
          
          if (vnpayData.success && vnpayData.data && vnpayData.data.paymentUrl) {
            console.log('Chuyển hướng đến VNPay URL:', vnpayData.data.paymentUrl);
            
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
            throw new Error(vnpayData.message || 'Lỗi khi khởi tạo thanh toán VNPay. Vui lòng thử lại.');
          }
        } else {
          throw new Error(orderResult.message || (!orderResult.data ? 'Tạo đơn hàng thất bại - không có dữ liệu đơn hàng trả về' : 'Tạo đơn hàng thất bại'));
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
            throw new Error('Phiên hết hạn. Vui lòng đăng nhập lại.');
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Lỗi khi tạo đơn hàng. Vui lòng thử lại.');
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
          throw new Error(orderResult.message || (!orderResult.data ? 'Tạo đơn hàng thất bại - không có dữ liệu đơn hàng trả về' : 'Tạo đơn hàng thất bại'));
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
            throw new Error('Phiên hết hạn. Vui lòng đăng nhập lại.');
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Lỗi khi tạo đơn hàng. Vui lòng thử lại.');
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
          throw new Error(orderResult.message || (!orderResult.data ? 'Lỗi khi tạo đơn hàng. Vui lòng thử lại.' : 'Failed to create order'));
        }
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      setError(error.message || 'Lỗi khi thanh toán. Vui lòng thử lại.');
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
          Giỏ hàng
        </Typography>
        
        <Paper elevation={3} sx={{ p: 6, maxWidth: 500, mx: 'auto' }}>
          <Typography variant="h5" gutterBottom>
            Giỏ hàng của bạn đang trống
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Thêm một số món ăn để bắt đầu!
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
            Xem menu
          </Button>
        </Paper>
      </Container>
    );
  }

  // Order success message
  if (orderSuccess) {
    const cartSummary = getCartSummary();
    const finalTotals = getFinalTotals();
    const currentDateTime = new Date().toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const getPaymentMethodDisplay = (method) => {
      switch (method) {
        case 'card': return 'Thẻ tín dụng/Ghi nợ';
        case 'momo': return 'Ví MoMo';
        case 'cash': return 'Tiền mặt';
        case 'wallet': return 'Ví điện tử';
        default: return 'Không xác định';
      }
    };

    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 6, maxWidth: 700, mx: 'auto' }}>
          {/* Success Icon and Message */}
          <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 3 }} />
          <Typography variant="h4" gutterBottom sx={{ color: '#4caf50' }}>
            Thanh toán thành công!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xác nhận và đang được xử lý.
          </Typography>

          {/* Payment Details Card */}
          <Card sx={{ mb: 4, textAlign: 'left' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#8B4513', mb: 3 }}>
                Chi tiết thanh toán
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Phương thức thanh toán:</Typography>
                  <Typography variant="body2" fontWeight="bold">{getPaymentMethodDisplay(paymentMethod)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Tổng tiền:</Typography>
                  <Typography variant="body2" fontWeight="bold" sx={{ color: '#8B4513' }}>
                    {formatPrice(finalTotals.total)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Thời gian đặt hàng:</Typography>
                  <Typography variant="body2" fontWeight="bold">{currentDateTime}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Hình thức nhận hàng:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {orderType === 'delivery' ? 'Giao hàng tận nơi' : 'Nhận tại cửa hàng'}
                  </Typography>
                </Box>
                {appliedPromo && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Mã giảm giá:</Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#4caf50' }}>
                      {appliedPromo.code} (-{formatPrice(finalTotals.discount)})
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Số lượng món:</Typography>
                  <Typography variant="body2" fontWeight="bold">{itemCount} món</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Trạng thái thanh toán:</Typography>
                  <Typography variant="body2" fontWeight="bold" sx={{ color: '#4caf50' }}>Đã thanh toán</Typography>
                </Box>
              </Box>

              {/* Order Items Summary */}
              <Typography variant="h6" gutterBottom sx={{ color: '#8B4513', mt: 3, mb: 2 }}>
                Món đã đặt
              </Typography>
              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                {items.map((item, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    py: 1,
                    borderBottom: index < items.length - 1 ? '1px solid #eee' : 'none'
                  }}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {item.product.name} ({item.size || 'Regular'})
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.quantity} x {formatPrice(item.price)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {formatPrice(item.price * item.quantity)}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Delivery Information */}
              {orderType === 'delivery' && deliveryInfo.address && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ color: '#8B4513', mt: 3, mb: 2 }}>
                    Thông tin giao hàng
                  </Typography>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Người nhận:</Typography>
                      <Typography variant="body2" fontWeight="bold">{deliveryInfo.fullName}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Số điện thoại:</Typography>
                      <Typography variant="body2" fontWeight="bold">{deliveryInfo.phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Địa chỉ:</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ textAlign: 'right', maxWidth: '60%' }}>
                        {deliveryInfo.address}, {deliveryInfo.city} {deliveryInfo.zipCode}
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              startIcon={<ArrowBack />}
            >
              Tiếp tục mua sắm
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/orders')}
              startIcon={<Receipt />}
              sx={{
                backgroundColor: '#8B4513',
                '&:hover': { backgroundColor: '#A0522D' }
              }}
            >
              Xem đơn hàng
            </Button>
          </Box>
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
        Tóm tắt đơn hàng
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
                Sản phẩm ({itemCount})
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
                Xóa tất cả
              </Button>
            </Box>

            {items.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Giỏ hàng của bạn đang trống
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Thêm một số món ăn để bắt đầu!
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
                  Xem menu
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
                      image={item.product.imageUrl || (item.product.image ? (item.product.image.startsWith('http') ? item.product.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5004'}${item.product.image}`) : `https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop&auto=format`)}
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
                              Số lượng:
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
                            Số lượng:
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
              Tóm tắt đơn hàng
            </Typography>
            
            {/* Promotional Code Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Mã giảm giá
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
                      placeholder="Nhập mã giảm giá"
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
                      {isApplyingPromo ? 'Duyệt...' : 'Duyệt'}
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
                      XÓA
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tổng cộng:</Typography>
                <Typography>{formatPrice(getFinalTotals().subtotal)}</Typography>
              </Box>
              {appliedPromo && getFinalTotals().discount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: '#4caf50' }}>Discount ({appliedPromo.code}):</Typography>
                  <Typography sx={{ color: '#4caf50' }}>-{formatPrice(getFinalTotals().discount)}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Thuế (8.5%):</Typography>
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
              label="Ghi chú đơn hàng (Tùy chọn)"
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
              Tiến hành thanh toán
            </Button>

            <Button
              fullWidth
              component={Link}
              to="/menu"
              sx={{ mt: 2 }}
            >
              Tiếp tục mua sắm
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#8B4513' }}>
                Có thể bạn sẽ thích
              </Typography>
              
              {loadingRecommendations ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <Typography>Đang tải gợi ý...</Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {recommendations.map((product) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                      <Card sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4
                        }
                      }}>
                        <CardMedia
                          component="img"
                          height="330"
                          image={product.imageUrl || (product.image ? (product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5004'}${product.image}`) : `https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop&auto=format`)}
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
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 'bold', color: '#8B4513' }}
                          >
                            {formatPrice(product.price)}
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ p: 2 }}>
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => handleAddRecommendation(product)}
                            sx={{
                              backgroundColor: '#8B4513',
                              '&:hover': {
                                backgroundColor: '#A0522D'
                              }
                            }}
                          >
                            Thêm vào giỏ hàng
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
        </Grid>
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
            Thanh toán
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
                  Chọn hình thức nhận hàng
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
                          Lấy hàng tại cửa hàng
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="delivery"
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocalShipping />
                          Giao hàng
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
                
                {orderType === 'pickup' && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Địa chỉ lấy hàng:</strong> DREAM COFFEE<br />
                      97 Man Thiện, Hiệp Phú, Thủ Đức, Hồ Chí Minh<br />
                      <strong>Thời gian lấy hàng:</strong> Mon-Sun 7:00 AM - 9:00 PM
                    </Typography>
                  </Alert>
                )}
                
                {orderType === 'delivery' && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Phí vận chuyển:</strong> 15.000 VNĐ<br />
                      <strong>Thời gian giao hàng:</strong> 30-45 phút<br />
                      <strong>Phạm vi giao hàng:</strong> Trong phạm vi 5km của DREAM COFFEE<br />
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
                      label="Họ Tên *"
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
                      label="Số Điện Thoại *"
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
                      label="Email *"
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
                          label="Địa Chỉ *"
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
                          label="Thành Phố *"
                          value={deliveryInfo.city}
                          onChange={(e) => handleDeliveryInfoChange('city', e.target.value)}
                          error={!!validationErrors.city}
                          helperText={validationErrors.city}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Quận Huyện *"
                          value={deliveryInfo.district}
                          onChange={(e) => handleDeliveryInfoChange('district', e.target.value)}
                          error={!!validationErrors.district}
                          helperText={validationErrors.district}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Ghi Chú (Tùy Chọn)"
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
                  Phương Thức Thanh Toán
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
                          Thẻ Tín Dụng
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
                          MoMo
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
                  Tóm Tắt Đơn Hàng
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
                  <Typography variant="body1">Tổng tiền:</Typography>
                  <Typography variant="body1">{formatPrice(cartSummary.subtotal)}</Typography>
                </Box>
                {orderType === 'delivery' && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Phí vận chuyển:</Typography>
                    <Typography variant="body1">{formatPrice(15000)}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Thuế:</Typography>
                  <Typography variant="body1">{formatPrice(cartSummary.tax)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">Tổng cộng:</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatPrice(cartSummary.total + (orderType === 'delivery' ? 15000 : 0))}
                  </Typography>
                </Box>
                
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Ghi Chú (Tùy Chọn)"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Ghi chú cho đơn hàng..."
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
              {isProcessing ? 'Đang thanh toán...' : 'Thanh Toán'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Cart;