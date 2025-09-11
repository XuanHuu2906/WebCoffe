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
    } else if (!finalOrderId) {
      // If no order ID is provided, set status to fail
      setStatus('fail');
    }
  }, [location, isAuthenticated]);

  const fetchOrderStatus = async (orderId) => {
    try {
      // Wait a moment for payment processing to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const token = localStorage.getItem('token');
      // Use the general orders endpoint to get order details
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Find the specific order by orderNumber
          const order = data.data.find(o => o.orderNumber === orderId);
          if (order) {
            setOrderDetails(order);
            // Set status based on backend verification, not frontend params
            if (order.paymentStatus === 'paid') {
              setStatus('success');
            } else {
              setStatus('fail');
            }
          } else {
            console.warn('Order not found:', orderId);
            // Keep the status from URL params if order not found
          }
        } else {
          console.warn('Failed to fetch orders:', data.message);
          // Keep the status from URL params if API call fails
        }
      } else {
        console.warn('Orders API call failed:', response.status);
        // Keep the status from URL params if API call fails
      }
    } catch (error) {
      console.error('Failed to fetch order status:', error);
      // Keep the status from URL params if there's an error
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
                    <Typography variant="body2" fontWeight="bold">
                      {(() => {
                        // Format VNPay date (YYYYMMDDHHMMSS) to readable format
                        const dateStr = paymentInfo.payDate;
                        if (dateStr && dateStr.length === 14) {
                          const year = dateStr.substring(0, 4);
                          const month = dateStr.substring(4, 6);
                          const day = dateStr.substring(6, 8);
                          const hour = dateStr.substring(8, 10);
                          const minute = dateStr.substring(10, 12);
                          const second = dateStr.substring(12, 14);
                          return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
                        }
                        return dateStr;
                      })()} 
                    </Typography>
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
                      <Typography variant="body2" fontWeight="bold">
                        {orderDetails.paymentDetails?.method || orderDetails.paymentMethod || 'VNPay'}
                      </Typography>
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

              {/* Order Items */}
              {orderDetails && orderDetails.items && orderDetails.items.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ color: '#8B4513', mt: 3, mb: 2 }}>
                    Order Items
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                    {orderDetails.items.map((item, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 1,
                        borderBottom: index < orderDetails.items.length - 1 ? '1px solid #eee' : 'none'
                      }}>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {item.name} ({item.size || 'Regular'})
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
                </>
              )}

              {/* Customer Information */}
              {orderDetails && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ color: '#8B4513', mt: 3, mb: 2 }}>
                    Customer Information
                  </Typography>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    {orderDetails.orderType && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Order Type:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {orderDetails.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
                        </Typography>
                      </Box>
                    )}
                    {orderDetails.deliveryAddress && (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Delivery Address:</Typography>
                          <Typography variant="body2" fontWeight="bold" sx={{ textAlign: 'right', maxWidth: '60%' }}>
                            {orderDetails.deliveryAddress.street}, {orderDetails.deliveryAddress.city} {orderDetails.deliveryAddress.zipCode}
                          </Typography>
                        </Box>
                        {orderDetails.deliveryAddress.instructions && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Instructions:</Typography>
                            <Typography variant="body2" fontWeight="bold" sx={{ textAlign: 'right', maxWidth: '60%' }}>
                              {orderDetails.deliveryAddress.instructions}
                            </Typography>
                          </Box>
                        )}
                      </>
                    )}
                    {orderDetails.notes && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Order Notes:</Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ textAlign: 'right', maxWidth: '60%' }}>
                          {orderDetails.notes}
                        </Typography>
                      </Box>
                    )}
                    {orderDetails.createdAt && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Order Created:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {new Date(orderDetails.createdAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </>
              )}
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