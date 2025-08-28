import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  Chip,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Receipt,
  Visibility,
  LocalShipping,
  CheckCircle,
  Schedule,
  Cancel
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatPrice } from '../utils/formatPrice';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  // Orders will be fetched from API

  useEffect(() => {
    // Fetch orders from API
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required. Please log in.');
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Session expired. Please log in again.');
          }
          throw new Error('Failed to load orders. Please try again.');
        }

        const data = await response.json();
        if (data.success) {
          // Map API response to match frontend expectations
          const mappedOrders = data.data.map(order => ({
            id: order.orderNumber,
            date: new Date(order.createdAt).toISOString().split('T')[0],
            status: order.status === 'completed' ? 'delivered' : 
                   order.status === 'preparing' || order.status === 'confirmed' ? 'processing' : 
                   order.status,
            total: order.total,
            items: order.items.map(item => ({
              name: item.name,
              size: item.size !== 'Regular' ? item.size : undefined,
              quantity: item.quantity,
              price: item.price
            }))
          }));
          setOrders(mappedOrders);
        } else {
          throw new Error(data.message || 'Failed to load orders');
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setError(error.message || 'Failed to load orders. Please try again.');
        // If no orders available, show empty state instead of error for better UX
        if (error.message.includes('Authentication required')) {
          setOrders([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'processing':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle />;
      case 'processing':
        return <Schedule />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <LocalShipping />;
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDialog(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#8B4513' }} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your orders...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 6, maxWidth: 500, mx: 'auto' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={() => {
              setError(null);
              const fetchOrders = async () => {
                setLoading(true);
                setError(null);
                try {
                  const token = localStorage.getItem('token');
                  if (!token) {
                    throw new Error('Authentication required. Please log in.');
                  }

                  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });

                  if (!response.ok) {
                    if (response.status === 401) {
                      throw new Error('Session expired. Please log in again.');
                    }
                    throw new Error('Failed to load orders. Please try again.');
                  }

                  const data = await response.json();
                  if (data.success) {
                    const mappedOrders = data.data.map(order => ({
                      id: order.orderNumber,
                      date: new Date(order.createdAt).toISOString().split('T')[0],
                      status: order.status === 'completed' ? 'delivered' : 
                             order.status === 'preparing' || order.status === 'confirmed' ? 'processing' : 
                             order.status,
                      total: order.total,
                      items: order.items.map(item => ({
                        name: item.name,
                        size: item.size !== 'Regular' ? item.size : undefined,
                        quantity: item.quantity,
                        price: item.price
                      }))
                    }));
                    setOrders(mappedOrders);
                  } else {
                    throw new Error(data.message || 'Failed to load orders');
                  }
                } catch (error) {
                  console.error('Failed to fetch orders:', error);
                  setError(error.message || 'Failed to load orders. Please try again.');
                  if (error.message.includes('Authentication required')) {
                    setOrders([]);
                  }
                } finally {
                  setLoading(false);
                }
              };
              fetchOrders();
            }}
            sx={{
              backgroundColor: '#8B4513',
              '&:hover': { backgroundColor: '#A0522D' }
            }}
          >
            Try Again
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        textAlign="center"
        gutterBottom
        sx={{ fontWeight: 'bold', color: '#8B4513', mb: 4 }}
      >
        Order History
      </Typography>

      {orders.length === 0 ? (
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center', maxWidth: 500, mx: 'auto' }}>
          <Receipt sx={{ fontSize: 60, color: '#8B4513', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No orders yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            When you place your first order, it will appear here.
          </Typography>
          <Button
            variant="contained"
            href="/menu"
            sx={{
              backgroundColor: '#8B4513',
              '&:hover': { backgroundColor: '#A0522D' }
            }}
          >
            Browse Menu
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Card elevation={3} sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Order #{order.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Placed on {formatDate(order.date)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip
                        icon={getStatusIcon(order.status)}
                        label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        color={getStatusColor(order.status)}
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#8B4513' }}>
                        {formatPrice(order.total)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Items ({order.items.length}):
                    </Typography>
                    <Typography variant="body1">
                      {order.items.map((item, index) => (
                        <span key={index}>
                          {item.name}{item.size ? ` (${item.size})` : ''} × {item.quantity}
                          {index < order.items.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </Typography>
                  </Box>

                  {order.notes && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Notes: {order.notes}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => handleViewOrder(order)}
                      sx={{
                        borderColor: '#8B4513',
                        color: '#8B4513',
                        '&:hover': {
                          borderColor: '#A0522D',
                          backgroundColor: 'rgba(139, 69, 19, 0.04)'
                        }
                      }}
                    >
                      View Details
                    </Button>
                    
                    {order.status === 'delivered' && (
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          backgroundColor: '#8B4513',
                          '&:hover': { backgroundColor: '#A0522D' }
                        }}
                      >
                        Reorder
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Order Details Dialog */}
      <Dialog
        open={showOrderDialog}
        onClose={() => setShowOrderDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Order #{selectedOrder.id}
                </Typography>
                <Chip
                  icon={getStatusIcon(selectedOrder.status)}
                  label={selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  color={getStatusColor(selectedOrder.status)}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  Order Date: {formatDate(selectedOrder.date)}
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Order Items
              </Typography>
              
              <List>
                {selectedOrder.items.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={`${item.name}${item.size ? ` (${item.size})` : ''}`}
                      secondary={`Quantity: ${item.quantity}`}
                    />
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {formatPrice(item.price * item.quantity)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total Amount:</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#8B4513' }}>
                  {formatPrice(selectedOrder.total)}
                </Typography>
              </Box>
              
              {selectedOrder.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Notes:</strong> {selectedOrder.notes}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowOrderDialog(false)}>
                Close
              </Button>
              {selectedOrder.status === 'delivered' && (
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#8B4513',
                    '&:hover': { backgroundColor: '#A0522D' }
                  }}
                >
                  Reorder
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Orders;