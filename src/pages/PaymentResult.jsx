import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle,
  Error,
  ArrowBack,
  Receipt
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatPrice } from '../utils/formatPrice';

export default function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState("pending");
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    
    // Check if this is from VNPay return URL (has vnp_ parameters)
    const responseCode = queryParams.get("vnp_ResponseCode");
    const orderId = queryParams.get("vnp_TxnRef");
    const transactionNo = queryParams.get("vnp_TransactionNo");
    const amount = queryParams.get("vnp_Amount");
    const bankCode = queryParams.get("vnp_BankCode");
    const payDate = queryParams.get("vnp_PayDate");
    
    // Check if this is from backend redirect (has status parameter)
    const backendStatus = queryParams.get('status');
    const backendOrderId = queryParams.get('orderId');
    const backendMessage = queryParams.get('message');

    // Store payment info for display
    if (responseCode || backendStatus) {
      setPaymentInfo({
        orderId: orderId || backendOrderId,
        transactionNo,
        amount: amount ? parseInt(amount) / 100 : null, // Convert from VND cents
        bankCode,
        payDate,
        responseCode: responseCode || (backendStatus === 'paid' ? '00' : '99'),
        message: backendMessage
      });
    }

    // Determine status from backend redirect first, then VNPay params
    if (backendStatus) {
      setStatus(backendStatus === 'paid' ? 'success' : 'fail');
    } else if (responseCode === "00") {
      setStatus("success");
    } else {
      setStatus("fail");
    }

    // Try to fetch order details if user is authenticated and we have orderId
    const finalOrderId = orderId || backendOrderId;
    if (finalOrderId && isAuthenticated) {
      // Fetch order details to verify payment status from backend
      fetchOrderStatus(finalOrderId);
    }
  }, [location, isAuthenticated]);

  const fetchOrderStatus = async (orderId) => {
    try {
      // Wait a moment for IPN to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/vnpay/status/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrderDetails(data.data);
          // Set status based on backend verification, not frontend params
          if (data.data.paymentStatus === 'paid') {
            setStatus('success');
          } else {
            setStatus('fail');
          }
        } else {
          setStatus('fail');
        }
      } else {
        setStatus('fail');
      }
    } catch (error) {
      console.error('Failed to fetch order status:', error);
      setStatus('fail');
    }
  };

  const handleGoToOrders = () => {
    navigate('/orders');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const getStatusMessage = (responseCode) => {
    const statusMap = {
      '00': 'Payment completed successfully',
      '07': 'Transaction successful. Transaction is being deducted successfully. (Applicable to card/account payment)',
      '09': 'Transaction failed: Your card/account has not registered for InternetBanking service at the bank.',
      '10': 'Transaction failed: You have entered incorrect card/account information more than 3 times',
      '11': 'Transaction failed: Payment deadline has expired. Please retry the transaction.',
      '12': 'Transaction failed: Your card/account has been locked.',
      '13': 'Transaction failed: You have entered incorrect transaction password. Please retry the transaction.',
      '24': 'Transaction failed: Customer canceled the transaction',
      '51': 'Transaction failed: Your account has insufficient balance to make the payment.',
      '65': 'Transaction failed: Your account has exceeded the daily transaction limit.',
      '75': 'Payment bank is under maintenance.',
      '79': 'Transaction failed: You have entered incorrect payment password too many times. Please retry the transaction',
      '99': 'Other errors'
    };
    return statusMap[responseCode] || 'Unknown error occurred';
  };

  return (
    <Container sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 6, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
        {status === "pending" && (
          <>
            <CircularProgress size={60} sx={{ color: '#8B4513', mb: 3 }} />
            <Typography variant="h4" gutterBottom>
              Processing your payment...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we verify your payment with the bank.
            </Typography>
          </>
        )}
        
        {status === "success" && (
          <>
            <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 3 }} />
            <Typography variant="h4" gutterBottom sx={{ color: '#4caf50' }}>
              ✅ Payment Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Your payment has been verified and processed successfully.
            </Typography>
          </>
        )}
        
        {status === "fail" && (
          <>
            <Error sx={{ fontSize: 80, color: '#f44336', mb: 3 }} />
            <Typography variant="h4" gutterBottom sx={{ color: '#f44336' }}>
              ❌ Payment Failed!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {paymentInfo?.responseCode ? getStatusMessage(paymentInfo.responseCode) : 'There was an issue processing your payment. Please try again.'}
            </Typography>
          </>
        )}

        {/* Payment Details */}
        {paymentInfo && (
          <Card sx={{ mb: 4, textAlign: 'left' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#8B4513' }}>
                Payment Details
              </Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                {paymentInfo.orderId && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Order ID:</Typography>
                    <Typography variant="body2" fontWeight="bold">{paymentInfo.orderId}</Typography>
                  </Box>
                )}
                {paymentInfo.transactionNo && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Transaction No:</Typography>
                    <Typography variant="body2" fontWeight="bold">{paymentInfo.transactionNo}</Typography>
                  </Box>
                )}
                {paymentInfo.amount && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Amount:</Typography>
                    <Typography variant="body2" fontWeight="bold">{formatPrice(paymentInfo.amount)}</Typography>
                  </Box>
                )}
                {paymentInfo.bankCode && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Bank Code:</Typography>
                    <Typography variant="body2" fontWeight="bold">{paymentInfo.bankCode}</Typography>
                  </Box>
                )}
                {paymentInfo.payDate && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Payment Date:</Typography>
                    <Typography variant="body2" fontWeight="bold">{paymentInfo.payDate}</Typography>
                  </Box>
                )}
                {orderDetails && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Payment Status:</Typography>
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        sx={{ color: orderDetails.paymentStatus === 'paid' ? '#4caf50' : '#f44336' }}
                      >
                        {orderDetails.paymentStatus === 'paid' ? 'Paid' : 'Failed'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Payment Method:</Typography>
                      <Typography variant="body2" fontWeight="bold">{orderDetails.paymentMethod || 'VNPay'}</Typography>
                    </Box>
                    {orderDetails.paymentDetails?.paidAt && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Paid At:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {new Date(orderDetails.paymentDetails.paidAt).toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={handleGoHome}
            startIcon={<ArrowBack />}
          >
            Continue Shopping
          </Button>
          {isAuthenticated ? (
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
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Want to track your order? Please log in to view order details.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#1565c0' }
                }}
              >
                Login to View Orders
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}