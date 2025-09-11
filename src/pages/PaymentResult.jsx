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
      '00': 'Thanh toán thành công',
      '07': 'Giao dịch thành công. Giao dịch đang được trừ tiền thành công. (Áp dụng cho thanh toán bằng thẻ/tài khoản)',
      '09': 'Giao dịch thất bại: Thẻ/tài khoản của bạn chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch thất bại: Bạn đã nhập sai thông tin thẻ/tài khoản quá 3 lần.',
      '11': 'Giao dịch thất bại: Hạn thanh toán đã hết. Vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch thất bại: Thẻ/tài khoản của bạn đã bị khóa.',
      '13': 'Giao dịch thất bại: Bạn đã nhập sai mật khẩu giao dịch. Vui lòng thử lại.',
      '24': 'Giao dịch thất bại: Khách hàng đã hủy giao dịch.',
      '51': 'Giao dịch thất bại: Tài khoản của bạn không đủ số dư để thanh toán.',
      '65': 'Giao dịch thất bại: Tài khoản của bạn đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch thất bại: Bạn đã nhập sai mật khẩu thanh toán quá nhiều lần. Vui lòng thử lại.',
      '99': 'Lỗi khác'

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
              Đang xử lý thanh toán của bạn...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Vui lòng chờ trong khi chúng tôi xác minh thanh toán của bạn với ngân hàng.
            </Typography>
          </>
        )}
        
        {status === "success" && (
          <>
            <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 3 }} />
            <Typography variant="h4" gutterBottom sx={{ color: '#4caf50' }}>
              ✅ Thanh toán thành công!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Thanh toán của bạn đã được xác minh và xử lý thành công.
            </Typography>
          </>
        )}
        
        {status === "fail" && (
          <>
            <Error sx={{ fontSize: 80, color: '#f44336', mb: 3 }} />
            <Typography variant="h4" gutterBottom sx={{ color: '#f44336' }}>
              ❌ Thanh toán thất bại!
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
                Chi tiết thanh toán
              </Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                {paymentInfo.orderId && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Mã đơn hàng:</Typography>
                    <Typography variant="body2" fontWeight="bold">{paymentInfo.orderId}</Typography>
                  </Box>
                )}
                {paymentInfo.transactionNo && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Số giao dịch:</Typography>
                    <Typography variant="body2" fontWeight="bold">{paymentInfo.transactionNo}</Typography>
                  </Box>
                )}
                {paymentInfo.amount && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Số tiền:</Typography>
                    <Typography variant="body2" fontWeight="bold">{formatPrice(paymentInfo.amount)}</Typography>
                  </Box>
                )}
                {paymentInfo.bankCode && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Mã ngân hàng:</Typography>
                    <Typography variant="body2" fontWeight="bold">{paymentInfo.bankCode}</Typography>
                  </Box>
                )}
                {paymentInfo.payDate && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Ngày thanh toán:</Typography>
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
                      <Typography variant="body2" color="text.secondary">Trạng thái thanh toán:</Typography>
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        sx={{ color: orderDetails.paymentStatus === 'paid' ? '#4caf50' : '#f44336' }}
                      >
                        {orderDetails.paymentStatus === 'paid' ? 'Thành Công' : 'Thất Bại'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Phương thức thanh toán:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {orderDetails.paymentDetails?.method || orderDetails.paymentMethod || 'VNPay'}
                      </Typography>
                    </Box>
                    {orderDetails.paymentDetails?.paidAt && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Thanh toán lúc:</Typography>
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
                    Các sản phẩm trong đơn hàng
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
                    Thông tin khách hàng
                  </Typography>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    {orderDetails.orderType && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Loại đơn hàng:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {orderDetails.orderType === 'delivery' ? 'Vận Chuyển' : 'Lấy tại quán'}
                        </Typography>
                      </Box>
                    )}
                    {orderDetails.deliveryAddress && (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Địa chỉ giao hàng:</Typography>
                          <Typography variant="body2" fontWeight="bold" sx={{ textAlign: 'right', maxWidth: '60%' }}>
                            {orderDetails.deliveryAddress.street}, {orderDetails.deliveryAddress.city} {orderDetails.deliveryAddress.zipCode}
                          </Typography>
                        </Box>
                        {orderDetails.deliveryAddress.instructions && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Hướng dẫn:</Typography>
                            <Typography variant="body2" fontWeight="bold" sx={{ textAlign: 'right', maxWidth: '60%' }}>
                              {orderDetails.deliveryAddress.instructions}
                            </Typography>
                          </Box>
                        )}
                      </>
                    )}
                    {orderDetails.notes && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Ghi chú đơn hàng:</Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ textAlign: 'right', maxWidth: '60%' }}>
                          {orderDetails.notes}
                        </Typography>
                      </Box>
                    )}
                    {orderDetails.createdAt && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Đơn hàng đã được tạo:</Typography>
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
            Tiếp tục mua sắm
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
              Xem đơn hàng
            </Button>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Bạn muốn theo dõi đơn hàng của mình? Vui lòng đăng nhập để xem chi tiết đơn hàng.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#1565c0' }
                }}
              >
                Đăng nhập để xem đơn hàng
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}