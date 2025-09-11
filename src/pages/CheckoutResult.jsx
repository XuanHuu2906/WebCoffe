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
            Đang xử lý kết quả thanh toán...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Vui lòng đợi trong khi chúng tôi xác nhận thanh toán của bạn.
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
            Lỗi Thanh Toán
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
              Về Trang Chủ
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
              Xem đơn hàng
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
              Thanh Toán Thành Công!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Thanh toán của bạn đã được xử lý thành công và đơn hàng của bạn đã được xác nhận.
            </Typography>
          </>
        ) : (
          <>
            <Error sx={{ fontSize: 80, color: '#f44336', mb: 3 }} />
            <Typography variant="h4" gutterBottom sx={{ color: '#f44336' }}>
              Lỗi Thanh Toán
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {paymentResult?.message || 'Thanh toán của bạn không thể được xử lý.'}
            </Typography>
          </>
        )}

        {/* Payment Details */}
        <Card sx={{ mb: 4, textAlign: 'left' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#8B4513' }}>
              Chi Tiết Đơn Hàng
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
                <Typography variant="body2" color="text.secondary">Trạng Thái Thanh Toán:</Typography>
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

              {/* Order Items */}
              {paymentResult?.order?.items && paymentResult.order.items.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ color: '#8B4513', mt: 3, mb: 2 }}>
                    Order Items
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                    {paymentResult.order.items.map((item, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 1,
                        borderBottom: index < paymentResult.order.items.length - 1 ? '1px solid #eee' : 'none'
                      }}>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {item.name} ({item.size || 'Regular'})
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.quantity} x {formatPrice(item.price || 0)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold">
                          {formatPrice((item.price || 0) * (item.quantity || 0))}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}

              {/* Customer Information */}
              {paymentResult?.order && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ color: '#8B4513', mt: 3, mb: 2 }}>
                    Thông Tin Khách Hàng
                  </Typography>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    {paymentResult.order.orderType && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Order Type:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {paymentResult.order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
                        </Typography>
                      </Box>
                    )}
                    {paymentResult.order.deliveryAddress && (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Delivery Address:</Typography>
                          <Typography variant="body2" fontWeight="bold" sx={{ textAlign: 'right', maxWidth: '60%' }}>
                            {paymentResult.order.deliveryAddress.street}, {paymentResult.order.deliveryAddress.city} {paymentResult.order.deliveryAddress.zipCode}
                          </Typography>
                        </Box>
                        {paymentResult.order.deliveryAddress.instructions && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Instructions:</Typography>
                            <Typography variant="body2" fontWeight="bold" sx={{ textAlign: 'right', maxWidth: '60%' }}>
                              {paymentResult.order.deliveryAddress.instructions}
                            </Typography>
                          </Box>
                        )}
                      </>
                    )}
                    {paymentResult.order.notes && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Order Notes:</Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ textAlign: 'right', maxWidth: '60%' }}>
                          {paymentResult.order.notes}
                        </Typography>
                      </Box>
                    )}
                    {paymentResult.order.createdAt && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Order Created:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {new Date(paymentResult.order.createdAt).toLocaleString('en-US', {
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
            Tiếp Tục Mua Sắm
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
            Xem Đơn Hàng
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CheckoutResult;