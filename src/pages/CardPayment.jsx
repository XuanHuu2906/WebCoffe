import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  CreditCard,
  Lock,
  ArrowBack,
  CheckCircle
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatPrice } from '../utils/formatPrice';

const CardPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const orderId = searchParams.get('orderId');
  const amount = parseInt(searchParams.get('amount')) / 100; // Convert from cents
  
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  useEffect(() => {
    if (!orderId || !amount) {
      setError('Invalid payment parameters');
      return;
    }
    if (!user || !token) {
      navigate('/login');
      return;
    }
  }, [orderId, amount, user, token, navigate]);

  const handleInputChange = (field) => (event) => {
    let value = event.target.value;
    
    // Format card number with spaces
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
      if (value.length > 19) return; // Max 16 digits + 3 spaces
    }
    
    // Format expiry date
    if (field === 'expiryDate') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1/');
      if (value.length > 5) return; // MM/YY format
    }
    
    // Limit CVV to 4 digits
    if (field === 'cvv') {
      value = value.replace(/\D/g, '');
      if (value.length > 4) return;
    }
    
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const validateCard = () => {
    const { cardNumber, expiryDate, cvv, cardholderName } = cardData;
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
      return 'Please enter a valid card number';
    }
    
    if (!expiryDate || expiryDate.length !== 5) {
      return 'Please enter a valid expiry date (MM/YY)';
    }
    
    if (!cvv || cvv.length < 3) {
      return 'Please enter a valid CVV';
    }
    
    if (!cardholderName.trim()) {
      return 'Please enter the cardholder name';
    }
    
    return null;
  };

  const handlePayment = async () => {
    const validationError = validateCard();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would send card data to a secure payment processor
      // For demo purposes, we'll just update the order status
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/card/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          amount: amount * 100, // Convert back to cents
          cardData: {
            // In production, never send full card details to your backend
            // Use a payment processor like Stripe, Square, etc.
            lastFour: cardData.cardNumber.slice(-4),
            cardholderName: cardData.cardholderName
          }
        })
      });

      if (!response.ok) {
        throw new Error('Payment processing failed');
      }

      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      } else {
        throw new Error(result.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/cart');
  };

  if (success) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 6, maxWidth: 500, mx: 'auto' }}>
          <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 3 }} />
          <Typography variant="h4" gutterBottom sx={{ color: '#4caf50' }}>
            Payment Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your payment has been processed successfully. You will be redirected to your orders shortly.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4, maxWidth: 'md' }}>
      <Typography
        variant="h4"
        component="h1"
        textAlign="center"
        gutterBottom
        sx={{ fontWeight: 'bold', color: '#8B4513', mb: 4 }}
      >
        Card Payment
      </Typography>

      <Grid container spacing={4}>
        {/* Payment Form */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <CreditCard sx={{ color: '#8B4513' }} />
              <Typography variant="h6">Enter Card Details</Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Number"
                  value={cardData.cardNumber}
                  onChange={handleInputChange('cardNumber')}
                  placeholder="1234 5678 9012 3456"
                  InputProps={{
                    startAdornment: <CreditCard sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cardholder Name"
                  value={cardData.cardholderName}
                  onChange={handleInputChange('cardholderName')}
                  placeholder="John Doe"
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  value={cardData.expiryDate}
                  onChange={handleInputChange('expiryDate')}
                  placeholder="MM/YY"
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="CVV"
                  value={cardData.cvv}
                  onChange={handleInputChange('cvv')}
                  placeholder="123"
                  InputProps={{
                    startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleGoBack}
                startIcon={<ArrowBack />}
                disabled={loading}
              >
                Back to Cart
              </Button>
              
              <Button
                variant="contained"
                onClick={handlePayment}
                disabled={loading}
                sx={{
                  backgroundColor: '#8B4513',
                  '&:hover': { backgroundColor: '#A0522D' },
                  flex: 1
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  `Pay ${formatPrice(amount)}`
                )}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Order ID:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {orderId}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Total Amount:
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="#8B4513">
                  {formatPrice(amount)}
                </Typography>
              </Box>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  Your payment is secured with SSL encryption
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CardPayment;