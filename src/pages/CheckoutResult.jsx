import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent
} from '@mui/material';
import {
  CheckCircle,
  Error,
  ArrowBack,
  Receipt
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatPrice } from '../utils/formatPrice';

const CheckoutResult = () => {
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const processPaymentResult = async () => {
      try {
        // Get parameters from URL
        const status = searchParams.get('status');
        const orderId = searchParams.get('orderId');
        const message = searchParams.get('message');
        const transactionNo = searchParams.get('transactionNo');
        const amount = searchParams.get('amount');

        if (!status || !orderId) {
          throw new Error('Missing payment result information');
        }

        // Fetch order details to get the latest status
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const ordersData = await response.json();
        const order = ordersData.data?.find(o => o.orderNumber === orderId);

        setPaymentResult({
          success: status === 'paid',
          orderId,
          message: decodeURIComponent(message || ''),
          transactionNo,
          amount: amount ? parseFloat(amount) : null,
          order,
          paymentStatus: order?.paymentStatus,
          orderStatus: order?.status
        });
      } catch (err) {
        console.error('Payment result processing error:', err);
        setError(err.message || 'Failed to process payment result');
      } finally {
        setLoading(false);
      }
    };

    processPaymentResult();
  }, [isAuthenticated, navigate, searchParams]);

  const handleGoToOrders = () => {
    navigate('/orders');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 6, maxWidth: 500, mx: 'auto' }}>
          <CircularProgress size={60} sx={{ color: '#8B4513', mb: 3 }} />
          <Typography variant="h5" gutterBottom>
            Processing Payment Result...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please wait while we verify your payment.
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 6, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
          <Error sx={{ fontSize: 80, color: '#f44336', mb: 3 }} />
          <Typography variant="h4" gutterBottom sx={{ color: '#f44336' }}>
            Payment Error
          </Typography>
          <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
            {error}
          </Alert>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={handleGoHome}
              startIcon={<ArrowBack />}
            >
              Go Home
            </Button>
            <Button
              variant="contained"
              onClick={handleGoToOrders}
              startIcon={<Receipt />}
              sx={{
                backgroundColor: '#8B4513',
                '&:hover': { backgroundColor: '#A0522D' }
              }}
            >
              View Orders
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 6, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
        {paymentResult?.success ? (
          <>
            <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 3 }} />
            <Typography variant="h4" gutterBottom sx={{ color: '#4caf50' }}>
              Payment Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Your payment has been processed successfully and your order is confirmed.
            </Typography>
          </>
        ) : (
          <>
            <Error sx={{ fontSize: 80, color: '#f44336', mb: 3 }} />
            <Typography variant="h4" gutterBottom sx={{ color: '#f44336' }}>
              Payment Failed
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {paymentResult?.message || 'Your payment could not be processed.'}
            </Typography>
          </>
        )}

        {/* Payment Details */}
        <Card sx={{ mb: 4, textAlign: 'left' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#8B4513' }}>
              Order Details
            </Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Order ID:</Typography>
                <Typography variant="body2" fontWeight="bold">{paymentResult?.orderId}</Typography>
              </Box>
              {paymentResult?.transactionNo && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Transaction No:</Typography>
                  <Typography variant="body2" fontWeight="bold">{paymentResult.transactionNo}</Typography>
                </Box>
              )}
              {paymentResult?.amount && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Amount:</Typography>
                  <Typography variant="body2" fontWeight="bold">{formatPrice(paymentResult.amount)}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Payment Status:</Typography>
                <Typography 
                  variant="body2" 
                  fontWeight="bold"
                  sx={{ color: paymentResult?.paymentStatus === 'paid' ? '#4caf50' : '#f44336' }}
                >
                  {paymentResult?.paymentStatus === 'paid' ? 'Paid' : 'Failed'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Order Status:</Typography>
                <Typography 
                  variant="body2" 
                  fontWeight="bold"
                  sx={{ color: paymentResult?.orderStatus === 'confirmed' ? '#4caf50' : '#ff9800' }}
                >
                  {paymentResult?.orderStatus === 'confirmed' ? 'Confirmed' : paymentResult?.orderStatus || 'Pending'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={handleGoHome}
            startIcon={<ArrowBack />}
          >
            Continue Shopping
          </Button>
          <Button
            variant="contained"
            onClick={handleGoToOrders}
            startIcon={<Receipt />}
            sx={{
              backgroundColor: '#8B4513',
              '&:hover': { backgroundColor: '#A0522D' }
            }}
          >
            View Orders
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CheckoutResult;