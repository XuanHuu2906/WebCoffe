import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Money,
  ArrowBack,
  CheckCircle,
  Info,
  Store,
  LocalShipping
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatPrice } from '../utils/formatPrice';

const CashPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  
  const orderId = searchParams.get('orderId');
  const amount = parseInt(searchParams.get('amount')) / 100; // Convert from cents

  useEffect(() => {
    if (!orderId || !amount) {
      setError('Invalid payment parameters');
      return;
    }
    if (!user || !token) {
      navigate('/login');
      return;
    }
    
    // Fetch order details
    fetchOrderDetails();
  }, [orderId, amount, user, token, navigate]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setOrderDetails(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleConfirmOrder = async () => {
    setLoading(true);
    setError('');

    try {
      // Process cash payment confirmation
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/cash/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          amount: amount * 100 // Convert back to cents
        })
      });

      if (!response.ok) {
        throw new Error('Failed to confirm cash payment');
      }

      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      } else {
        throw new Error(result.message || 'Payment confirmation failed');
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      setError(error.message || 'Failed to confirm payment. Please try again.');
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
            Order Confirmed!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your cash payment order has been confirmed. You will be redirected to your orders shortly.
          </Typography>
        </Paper>
      </Container>
    );
  }

  const isDelivery = orderDetails?.orderType === 'delivery';
  const isPickup = orderDetails?.orderType === 'pickup';

  return (
    <Container sx={{ py: 4, maxWidth: 'md' }}>
      <Typography
        variant="h4"
        component="h1"
        textAlign="center"
        gutterBottom
        sx={{ fontWeight: 'bold', color: '#8B4513', mb: 4 }}
      >
        Cash Payment
      </Typography>

      <Grid container spacing={4}>
        {/* Payment Instructions */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Money sx={{ color: '#8B4513' }} />
              <Typography variant="h6">
                {isDelivery ? 'Pay on Delivery' : isPickup ? 'Pay at Pickup' : 'Cash Payment'}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Please review your order details and confirm to proceed with cash payment.
              </Typography>
            </Alert>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Payment Instructions:
            </Typography>
            
            <List>
              {isDelivery && (
                <>
                  <ListItem>
                    <ListItemIcon>
                      <LocalShipping sx={{ color: '#8B4513' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Delivery Payment"
                      secondary="Pay the delivery person when your order arrives at your location"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Info sx={{ color: '#8B4513' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Exact Amount"
                      secondary="Please have the exact amount ready or small bills for change"
                    />
                  </ListItem>
                </>
              )}
              
              {isPickup && (
                <>
                  <ListItem>
                    <ListItemIcon>
                      <Store sx={{ color: '#8B4513' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Pickup Payment"
                      secondary="Pay at the counter when you arrive to collect your order"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Info sx={{ color: '#8B4513' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Order Ready Notification"
                      secondary="You'll receive a notification when your order is ready for pickup"
                    />
                  </ListItem>
                </>
              )}
              
              <ListItem>
                <ListItemIcon>
                  <CheckCircle sx={{ color: '#4caf50' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Order Confirmation"
                  secondary="Click 'Confirm Order' below to finalize your cash payment order"
                />
              </ListItem>
            </List>

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
                onClick={handleConfirmOrder}
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
                  'Confirm Order'
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
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Order Type:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {orderDetails?.orderType || 'Loading...'}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Payment Method:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  Cash
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Total Amount:
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="#8B4513">
                  {formatPrice(amount)}
                </Typography>
              </Box>
              
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  No online payment required - pay with cash {isDelivery ? 'on delivery' : 'at pickup'}
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CashPayment;