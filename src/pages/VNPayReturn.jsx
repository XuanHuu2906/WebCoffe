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

const VNPayReturn = () => {
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
        // Get all VNPay parameters from URL
        const vnp_Amount = searchParams.get('vnp_Amount');
        const vnp_BankCode = searchParams.get('vnp_BankCode');
        const vnp_BankTranNo = searchParams.get('vnp_BankTranNo');
        const vnp_CardType = searchParams.get('vnp_CardType');
        const vnp_OrderInfo = searchParams.get('vnp_OrderInfo');
        const vnp_PayDate = searchParams.get('vnp_PayDate');
        const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
        const vnp_TmnCode = searchParams.get('vnp_TmnCode');
        const vnp_TransactionNo = searchParams.get('vnp_TransactionNo');
        const vnp_TransactionStatus = searchParams.get('vnp_TransactionStatus');
        const vnp_TxnRef = searchParams.get('vnp_TxnRef');
        const vnp_SecureHash = searchParams.get('vnp_SecureHash');

        if (!vnp_TxnRef) {
          throw new Error('Missing order information');
        }

        // Create query string for backend verification
        const queryParams = new URLSearchParams();
        searchParams.forEach((value, key) => {
          queryParams.append(key, value);
        });

        // Send return data to backend for processing
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/vnpay/return?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to process payment return');
        }

        const data = await response.json();
        setPaymentResult({
          success: data.success,
          orderId: vnp_TxnRef,
          responseCode: vnp_ResponseCode,
          transactionStatus: vnp_TransactionStatus,
          message: data.message,
          transactionNo: vnp_TransactionNo,
          bankTranNo: vnp_BankTranNo,
          amount: vnp_Amount ? (parseInt(vnp_Amount) / 100) : 0,
          bankCode: vnp_BankCode,
          cardType: vnp_CardType,
          payDate: vnp_PayDate,
          order: data.order
        });
      } catch (err) {
        console.error('VNPay return processing error:', err);
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
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 6, maxWidth: 500, mx: 'auto' }}>
          <CircularProgress size={60} sx={{ color: '#8B4513', mb: 3 }} />
          <Typography variant="h5" gutterBottom>
            Processing Payment...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please wait while we verify your VNPay payment.
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
              Your VNPay payment has been processed successfully.
            </Typography>
          </>
        ) : (
          <>
            <Error sx={{ fontSize: 80, color: '#f44336', mb: 3 }} />
            <Typography variant="h4" gutterBottom sx={{ color: '#f44336' }}>
              Payment Failed
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {paymentResult?.message || 'Your VNPay payment could not be processed.'}
            </Typography>
          </>
        )}

        {/* Payment Details */}
        <Card sx={{ mb: 4, textAlign: 'left' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#8B4513' }}>
              Payment Details
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
              {paymentResult?.bankTranNo && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Bank Transaction:</Typography>
                  <Typography variant="body2" fontWeight="bold">{paymentResult.bankTranNo}</Typography>
                </Box>
              )}
              {paymentResult?.amount && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Amount:</Typography>
                  <Typography variant="body2" fontWeight="bold">{formatPrice(paymentResult.amount)}</Typography>
                </Box>
              )}
              {paymentResult?.bankCode && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Bank:</Typography>
                  <Typography variant="body2" fontWeight="bold">{paymentResult.bankCode}</Typography>
                </Box>
              )}
              {paymentResult?.cardType && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Card Type:</Typography>
                  <Typography variant="body2" fontWeight="bold">{paymentResult.cardType}</Typography>
                </Box>
              )}
              {paymentResult?.payDate && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Payment Date:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {new Date(paymentResult.payDate.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6')).toLocaleString()}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Status:</Typography>
                <Typography 
                  variant="body2" 
                  fontWeight="bold"
                  sx={{ color: paymentResult?.success ? '#4caf50' : '#f44336' }}
                >
                  {paymentResult?.success ? 'Success' : 'Failed'}
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

export default VNPayReturn;