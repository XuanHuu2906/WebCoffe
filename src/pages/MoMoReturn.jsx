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

const MoMoReturn = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const processPaymentReturn = async () => {
      try {
        // Get parameters from URL
        const orderId = searchParams.get('orderId');
        const resultCode = searchParams.get('resultCode');
        const message = searchParams.get('message');
        const transId = searchParams.get('transId');
        const amount = searchParams.get('amount');
        const signature = searchParams.get('signature');

        if (!orderId) {
          throw new Error('Missing order information');
        }

        // Send return data to backend for processing
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/momo/return`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orderId,
            resultCode,
            message,
            transId,
            amount,
            signature
          })
        });

        if (!response.ok) {
          throw new Error('Failed to process payment return');
        }

        const data = await response.json();
        setPaymentResult({
          success: data.success,
          orderId,
          resultCode,
          message: data.message || message,
          transId,
          amount: amount ? (parseInt(amount) / 100) : 0,
          order: data.order
        });
      } catch (err) {
        console.error('Payment return processing error:', err);
        setError(err.message || 'Failed to process payment return');
      } finally {
        setLoading(false);
      }
    };

    processPaymentReturn();
  }, [isAuthenticated, navigate, searchParams]);

  const handleGoToOrders = () => {
    navigate('/orders');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#8B4513' }} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Processing payment result...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4, maxWidth: 'md' }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Error sx={{ fontSize: 80, color: '#f44336', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ color: '#f44336' }}>
            Payment Processing Error
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleGoHome}
              sx={{
                borderColor: '#8B4513',
                color: '#8B4513',
                '&:hover': {
                  backgroundColor: '#8B4513',
                  color: 'white'
                }
              }}
            >
              Go Home
            </Button>
            <Button
              variant="contained"
              startIcon={<Receipt />}
              onClick={handleGoToOrders}
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

  const isSuccess = paymentResult?.resultCode === '0' || paymentResult?.resultCode === 0;

  return (
    <Container sx={{ py: 4, maxWidth: 'md' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {isSuccess ? (
            <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
          ) : (
            <Error sx={{ fontSize: 80, color: '#f44336', mb: 2 }} />
          )}
          
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ color: isSuccess ? '#4caf50' : '#f44336' }}
          >
            {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {paymentResult?.message || (isSuccess ? 'Your payment has been processed successfully.' : 'There was an issue processing your payment.')}
          </Typography>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#8B4513' }}>
              Payment Details
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Order ID
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {paymentResult?.orderId}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatPrice(paymentResult?.amount)}
                </Typography>
              </Box>
              
              {paymentResult?.transId && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Transaction ID
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {paymentResult.transId}
                  </Typography>
                </Box>
              )}
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Typography 
                  variant="body1" 
                  fontWeight="bold"
                  sx={{ color: isSuccess ? '#4caf50' : '#f44336' }}
                >
                  {isSuccess ? 'Completed' : 'Failed'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {isSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Your order has been confirmed and will be processed shortly. You can track your order status in the Orders section.
            </Typography>
          </Alert>
        )}

        {!isSuccess && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Your payment could not be processed. Please try again or contact support if the issue persists.
            </Typography>
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleGoHome}
            sx={{
              borderColor: '#8B4513',
              color: '#8B4513',
              '&:hover': {
                backgroundColor: '#8B4513',
                color: 'white'
              }
            }}
          >
            Continue Shopping
          </Button>
          <Button
            variant="contained"
            startIcon={<Receipt />}
            onClick={handleGoToOrders}
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

export default MoMoReturn;