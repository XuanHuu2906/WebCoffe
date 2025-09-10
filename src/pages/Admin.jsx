import React, { useState, useEffect } from 'react';

// Function to translate order status to Vietnamese
const getVietnameseStatus = (status) => {
  const statusMap = {
    'pending': 'Chờ xác nhận',
    'confirmed': 'Xác nhận',
    'preparing': 'Chuẩn bị',
    'ready': 'Sẵn sàng',
    'delivered': 'Giao hàng',
    'cancelled': 'Hủy'
  };
  return statusMap[status] || status;
};
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  InputAdornment,
  Fab,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Dashboard,
  Inventory,
  People,
  Assessment,
  Save,
  Cancel,
  Search,
  ShoppingCart,
  Person,
  CheckCircle,
  Cancel as CancelIcon,
  Pending,
  LocalShipping,
  Done,
  ContactMail
} from '@mui/icons-material';
import { useProducts } from '../contexts/ProductContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import ImageUpload from '../components/ImageUpload.jsx';
import { formatPrice } from '../utils/formatPrice';

const Admin = () => {
  const { user } = useAuth();
  const { products, categories, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts();
  const [currentTab, setCurrentTab] = useState(0);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    image: '',
    featured: false,
    available: true,
    sizes: []
  });
  const [sizeForm, setSizeForm] = useState({ name: '', price: '' });
  const [showSizeDialog, setShowSizeDialog] = useState(false);
  
  // Validation states
  const [productErrors, setProductErrors] = useState({});
  const [productTouched, setProductTouched] = useState({});
  const [sizeErrors, setSizeErrors] = useState({});
  const [sizeTouched, setSizeTouched] = useState({});
  
  // Error and loading states
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    recentOrders: []
  });
  
  // Revenue data state
  const [revenueData, setRevenueData] = useState({
    summary: {
      totalRevenue: 0,
      totalSubtotal: 0,
      totalTax: 0,
      totalDiscount: 0,
      completedOrderCount: 0,
      averageOrderValue: 0
    },
    breakdown: {
      byPaymentMethod: [],
      byOrderType: []
    },
    completedOrders: []
  });
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);

  // Order management states
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  // Customer management states
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);

  // Contact messages states
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState(null);
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [contactStatusFilter, setContactStatusFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactDialog, setShowContactDialog] = useState(false);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004'}/api/admin/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      const data = await response.json();
      if (data.success) {
        setDashboardStats(prev => ({
          ...prev,
          totalProducts: data.data.totalProducts,
          totalOrders: data.data.totalOrders,
          totalCustomers: data.data.totalCustomers,
          totalRevenue: data.data.totalRevenue
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setDashboardError(error.message);
    } finally {
      setDashboardLoading(false);
    }
  };

  // Fetch recent orders
  const fetchRecentOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004'}/api/admin/dashboard/recent-orders?limit=5`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recent orders');
      }

      const data = await response.json();
      if (data.success) {
        setDashboardStats(prev => ({
          ...prev,
          recentOrders: data.data
        }));
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      setDashboardError(error.message);
    }
  };

  // Fetch detailed revenue data
  const fetchRevenueData = async () => {
    setRevenueLoading(true);
    setRevenueError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004'}/api/admin/revenue/total`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch revenue data');
      }

      const data = await response.json();
      if (data.success) {
        setRevenueData(data.data);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      setRevenueError(error.message);
    } finally {
      setRevenueLoading(false);
    }
  };

  // Fetch orders
  const fetchOrders = async (page = 1, limit = 10) => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (orderStatusFilter && orderStatusFilter !== 'all') {
        params.append('status', orderStatusFilter);
      }

      if (orderSearchTerm) {
        params.append('search', orderSearchTerm);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004'}/api/admin/orders?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      if (data.success) {
        setOrders(data.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrdersError(error.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch customers
  const fetchCustomers = async (page = 1, limit = 10) => {
    setCustomersLoading(true);
    setCustomersError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (customerSearchTerm) {
        params.append('search', customerSearchTerm);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004'}/api/admin/customers?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      if (data.success) {
        setCustomers(data.data.customers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomersError(error.message);
    } finally {
      setCustomersLoading(false);
    }
  };

  // Fetch contact messages
  const fetchContacts = async (page = 1, limit = 10) => {
    setContactsLoading(true);
    setContactsError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (contactStatusFilter && contactStatusFilter !== 'all') {
        params.append('status', contactStatusFilter);
      }

      if (contactSearchTerm) {
        params.append('search', contactSearchTerm);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004'}/api/admin/contacts?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contact messages');
      }

      const data = await response.json();
      if (data.success) {
        setContacts(data.data.contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContactsError(error.message);
    } finally {
      setContactsLoading(false);
    }
  };

  // Update contact status
  const updateContactStatus = async (contactId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004'}/api/admin/contacts/${contactId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update contact status');
      }

      // Refresh contacts list
      fetchContacts();
    } catch (error) {
      console.error('Error updating contact status:', error);
      setError(error.message);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5004'}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const data = await response.json();
      if (data.success) {
        // Refresh orders list
        fetchOrders();
        setError(null);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchProducts({ limit: 100, includeOutOfStock: true }); // Fetch all products including out of stock for admin
    if (user && user.role === 'admin') {
      fetchDashboardStats();
      fetchRecentOrders();
      fetchRevenueData();
    }
  }, [user]);

  // Fetch orders when tab changes to orders or filters change
  useEffect(() => {
    if (currentTab === 2 && user && user.role === 'admin') {
      fetchOrders();
    }
  }, [currentTab, orderStatusFilter, orderSearchTerm]);

  // Fetch customers when tab changes to customers or search changes
  useEffect(() => {
    if (currentTab === 3 && user && user.role === 'admin') {
      fetchCustomers();
    }
  }, [currentTab, customerSearchTerm]);

  // Fetch contacts when tab changes to contacts or filters change
  useEffect(() => {
    if (currentTab === 4 && user && user.role === 'admin') {
      fetchContacts();
    }
  }, [currentTab, contactStatusFilter]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Validation functions
  const validateProductField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Product name is required';
        if (value.trim().length < 2) return 'Product name must be at least 2 characters';
        return '';
      case 'description':
        if (!value.trim()) return 'Description is required';
        if (value.trim().length < 10) return 'Description must be at least 10 characters';
        return '';
      case 'category':
        if (!value) return 'Category is required';
        return '';
      case 'image':
        // Image validation is now handled by the ImageUpload component
        return '';
      default:
        return '';
    }
  };

  const validateSizeField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Size name is required';
        if (value.trim().length < 1) return 'Size name cannot be empty';
        return '';
      case 'price':
        if (!value) return 'Price is required';
        const price = parseFloat(value);
        if (isNaN(price) || price <= 0) return 'Price must be a positive number';
        return '';
      default:
        return '';
    }
  };

  const validateProductForm = () => {
    const errors = {};
    Object.keys(productForm).forEach(key => {
      if (key !== 'featured' && key !== 'available' && key !== 'sizes') {
        const error = validateProductField(key, productForm[key]);
        if (error) errors[key] = error;
      }
    });
    return errors;
  };

  const validateSizeForm = () => {
    const errors = {};
    Object.keys(sizeForm).forEach(key => {
      const error = validateSizeField(key, sizeForm[key]);
      if (error) errors[key] = error;
    });
    return errors;
  };

  // Handle product form changes
  const handleProductFormChange = (field, value) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Real-time validation
    const error = validateProductField(field, value);
    setProductErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // Handle product form blur
  const handleProductFormBlur = (field) => {
    setProductTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  // Handle size form changes
  const handleSizeFormChange = (field, value) => {
    setSizeForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Real-time validation
    const error = validateSizeField(field, value);
    setSizeErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // Handle size form blur
  const handleSizeFormBlur = (field) => {
    setSizeTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  // Handle add/edit product
  const handleSaveProduct = async () => {
    const errors = validateProductForm();
    setProductErrors(errors);
    setProductTouched({
      name: true,
      description: true,
      category: true,
      image: true
    });

    // Check if at least one size is added
    if (productForm.sizes.length === 0) {
      setError('Please add at least one size with pricing for this product.');
      return;
    }

    if (Object.keys(errors).length === 0) {
      setSaveLoading(true);
      setError(null);
      try {
        const productData = {
          name: productForm.name,
          description: productForm.description,
          price: productForm.sizes[0].price, // Use first size price as base price
          category: productForm.category,
          featured: productForm.featured,
          inStock: productForm.available,
          sizes: productForm.sizes
        };

        // Handle image data properly
        if (productForm.image) {
          if (typeof productForm.image === 'object' && productForm.image.imageUrl) {
            // New Cloudinary image upload
            productData.imageUrl = productForm.image.imageUrl;
            productData.imagePublicId = productForm.image.imagePublicId;
          } else if (typeof productForm.image === 'string') {
            // Existing image path or URL
            productData.image = productForm.image;
          }
        }

        if (editingProduct) {
          await updateProduct(editingProduct._id, productData);
        } else {
          await createProduct(productData);
        }
        
        setShowProductDialog(false);
        resetProductForm();
        setError(null);
      } catch (error) {
        console.error('Failed to save product:', error);
        setError(error.message || 'Failed to save product. Please try again.');
      } finally {
        setSaveLoading(false);
      }
    }
  };

  // Reset product form
  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      category: '',
      image: '',
      featured: false,
      available: true,
      sizes: []
    });
    setEditingProduct(null);
    setProductErrors({});
    setProductTouched({});
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    // Fetch all products first to ensure we have the complete list
    fetchProducts({ limit: 100, includeOutOfStock: true });
    
    setEditingProduct(product);
    
    // Handle image data properly for editing
    let imageValue = '';
    if (product.imageUrl && product.imagePublicId) {
      // Product has Cloudinary image
      imageValue = {
        imageUrl: product.imageUrl,
        imagePublicId: product.imagePublicId
      };
    } else if (product.image) {
      // Product has traditional image path
      imageValue = product.image;
    }
    
    setProductForm({
      name: product.name,
      description: product.description,
      category: product.category,
      image: imageValue,
      featured: product.featured || false,
      available: product.inStock !== false,
      sizes: product.sizes || []
    });
    setShowProductDialog(true);
  };

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setLoading(true);
      setError(null);
      try {
        await deleteProduct(productId);
        setError(null);
      } catch (error) {
        console.error('Failed to delete product:', error);
        setError(error.message || 'Failed to delete product. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle add size
  const handleAddSize = () => {
    const errors = validateSizeForm();
    setSizeErrors(errors);
    setSizeTouched({ name: true, price: true });

    if (Object.keys(errors).length === 0) {
      // Check for duplicate size names
      const existingSize = productForm.sizes.find(size => 
        size.name.toLowerCase() === sizeForm.name.toLowerCase()
      );
      
      if (existingSize) {
        setSizeErrors(prev => ({
          ...prev,
          name: 'Size name already exists'
        }));
        return;
      }

      setProductForm(prev => ({
        ...prev,
        sizes: [...prev.sizes, { ...sizeForm, price: parseFloat(sizeForm.price) }]
      }));
      setSizeForm({ name: '', price: '' });
      setSizeErrors({});
      setSizeTouched({});
      setShowSizeDialog(false);
    }
  };

  // Handle close size dialog
  const handleCloseSizeDialog = () => {
    setShowSizeDialog(false);
    setSizeForm({ name: '', price: '' });
    setSizeErrors({});
    setSizeTouched({});
  };

  // Real-time validation effects
  useEffect(() => {
    if (Object.keys(productTouched).length > 0) {
      const errors = validateProductForm();
      setProductErrors(errors);
    }
  }, [productForm, productTouched]);

  useEffect(() => {
    if (Object.keys(sizeTouched).length > 0) {
      const errors = validateSizeForm();
      setSizeErrors(errors);
    }
  }, [sizeForm, sizeTouched]);

  // Handle remove size
  const handleRemoveSize = (index) => {
    setProductForm(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dashboard Tab Content
  const DashboardTab = () => (
    <Grid container spacing={3}>
      {/* Dashboard Error */}
      {dashboardError && (
        <Grid item xs={12}>
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => {
                  fetchDashboardStats();
                  fetchRecentOrders();
                  fetchRevenueData();
                }}
              >
                Retry
              </Button>
            }
          >
            {dashboardError}
          </Alert>
        </Grid>
      )}
      
      {/* Stats Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ backgroundColor: '#8B4513', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {dashboardLoading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    dashboardStats.totalProducts
                  )}
                </Typography>
                <Typography variant="body2">Tổng sản phẩm</Typography>
              </Box>
              <Inventory sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ backgroundColor: '#2E7D32', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {dashboardLoading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    dashboardStats.totalOrders
                  )}
                </Typography>
                <Typography variant="body2">Tổng đơn hàng</Typography>
              </Box>
              <Assessment sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ backgroundColor: '#1976D2', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {dashboardLoading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    dashboardStats.totalCustomers
                  )}
                </Typography>
                <Typography variant="body2">Tổng khách hàng</Typography>
              </Box>
              <People sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ backgroundColor: '#7B1FA2', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {dashboardLoading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    `${dashboardStats.totalRevenue.toLocaleString()} VNĐ`
                  )}
                </Typography>
                <Typography variant="body2">Tổng doanh thu</Typography>
              </Box>
              <Dashboard sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Orders */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Đơn hàng gần đây
          </Typography>
          {dashboardLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#8B4513' }} />
            </Box>
          ) : dashboardStats.recentOrders.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Không tìm thấy đơn hàng gần đây
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Số đơn hàng</TableCell>
                    <TableCell>Khách hàng</TableCell>
                    <TableCell>Tổng tiền</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Ngày</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardStats.recentOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{order.orderNumber}</TableCell>
                      <TableCell>{order.customer?.name || `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Unknown'}</TableCell>
                      <TableCell>{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getVietnameseStatus(order.status)}
                          color={
                            order.status === 'completed' ? 'success' : 
                            order.status === 'processing' ? 'warning' : 
                            order.status === 'delivered' ? 'info' :
                            'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDialog(true);
                          }}
                          sx={{ color: '#8B4513' }}
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Grid>

      {/* Detailed Revenue Section */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Chi tiết doanh thu
          </Typography>
          {revenueError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {revenueError}
            </Alert>
          )}
          {revenueLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#8B4513' }} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Revenue Summary Cards */}
              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: '#f5f5f5' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#8B4513' }}>
                      Tổng quan doanh thu
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Tổng doanh thu:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                          {revenueData.summary.totalRevenue.toLocaleString()} VNĐ
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Tổng tiền hàng:</Typography>
                        <Typography variant="body2">
                          {revenueData.summary.totalSubtotal.toLocaleString()} VNĐ
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Tổng thuế:</Typography>
                        <Typography variant="body2">
                          {revenueData.summary.totalTax.toLocaleString()} VNĐ
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Tổng giảm giá:</Typography>
                        <Typography variant="body2" sx={{ color: '#d32f2f' }}>
                          -{revenueData.summary.totalDiscount.toLocaleString()} VNĐ
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Số đơn hoàn thành:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {revenueData.summary.completedOrderCount}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Giá trị đơn hàng TB:</Typography>
                        <Typography variant="body2">
                          {revenueData.summary.averageOrderValue.toLocaleString()} VNĐ
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Revenue by Payment Method */}
              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: '#f5f5f5' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#8B4513' }}>
                      Doanh thu theo phương thức thanh toán
                    </Typography>
                    {revenueData.breakdown.byPaymentMethod.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Chưa có dữ liệu
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {revenueData.breakdown.byPaymentMethod.map((method, index) => (
                          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">
                              {method._id === 'cash' ? 'Tiền mặt' : 
                               method._id === 'card' ? 'Thẻ' : 
                               method._id === 'vnpay' ? 'VNPay' : 
                               method._id === 'momo' ? 'MoMo' : method._id}:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {method.revenue.toLocaleString()} VNĐ ({method.orderCount} đơn)
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Revenue by Order Type */}
              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: '#f5f5f5' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#8B4513' }}>
                      Doanh thu theo loại đơn hàng
                    </Typography>
                    {revenueData.breakdown.byOrderType.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Chưa có dữ liệu
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {revenueData.breakdown.byOrderType.map((type, index) => (
                          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">
                              {type._id === 'dine-in' ? 'Tại chỗ' : 
                               type._id === 'takeaway' ? 'Mang đi' : 
                               type._id === 'delivery' ? 'Giao hàng' : type._id}:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {type.revenue.toLocaleString()} VNĐ ({type.orderCount} đơn)
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Completed Orders List */}
              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: '#f5f5f5' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#8B4513' }}>
                      Đơn hàng đã hoàn thành ({revenueData.completedOrders.length})
                    </Typography>
                    {revenueData.completedOrders.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Chưa có đơn hàng hoàn thành
                      </Typography>
                    ) : (
                      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        {revenueData.completedOrders.slice(0, 10).map((order, index) => (
                          <Box key={index} sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            py: 0.5,
                            borderBottom: index < Math.min(revenueData.completedOrders.length, 10) - 1 ? '1px solid #e0e0e0' : 'none'
                          }}>
                            <Typography variant="body2">
                              {order.orderNumber}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {order.total.toLocaleString()} VNĐ
                            </Typography>
                          </Box>
                        ))}
                        {revenueData.completedOrders.length > 10 && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Và {revenueData.completedOrders.length - 10} đơn hàng khác...
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Paper>
      </Grid>
    </Grid>
  );

  // Products Tab Content
  const ProductsTab = () => (
    <Box>
      {/* Search and Add Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            // Fetch all products first to ensure we have the complete list
            fetchProducts({ limit: 100, includeOutOfStock: true });
            setShowProductDialog(true);
          }}
          sx={{
            backgroundColor: '#8B4513',
            '&:hover': { backgroundColor: '#A0522D' }
          }}
        >
          Thêm sản phẩm
        </Button>
      </Box>

      {/* Products Table */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: { xs: 600, md: 750 } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Hình ảnh</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Danh mục</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Nổi bật</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Có sẵn</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product._id}>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <img
                    src={product.imageUrl || (product.image ? (product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5004'}${product.image}`) : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyNUgxNVYzNUgyMFYyNVoiIGZpbGw9IiM4QjQ1MTMiLz4KPHA+dGggZD0iTTQ1IDI1SDQwVjM1SDQ1VjI1WiIgZmlsbD0iIzhCNDUxMyIvPgo8cGF0aCBkPSJNMzAgMTVIMjVWNDVIMzBWMTVaIiBmaWxsPSIjOEI0NTEzIi8+CjwvcGF0aD4KPC9zdmc+')}
                    alt={product.name}
                    style={{ width: 60, height: 60, objectFit: 'contain', backgroundColor: '#f5f5f5', borderRadius: 4 }}
                    onError={(e) => {
                      console.error('Image failed to load:', product.image);
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyNUgxNVYzNUgyMFYyNVoiIGZpbGw9IiM4QjQ1MTMiLz4KPHA+dGggZD0iTTQ1IDI1SDQwVjM1SDQ1VjI1WiIgZmlsbD0iIzhCNDUxMyIvPgo8cGF0aCBkPSJNMzAgMTVIMjVWNDVIMzBWMTVaIiBmaWxsPSIjOEI0NTEzIi8+CjwvcGF0aD4KPC9zdmc+';
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                      {product.description?.substring(0, 50)}...
                    </Typography>
                    {/* Show category on mobile */}
                    <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 0.5 }}>
                      <Chip
                        label={product.category}
                        size="small"
                        sx={{ backgroundColor: '#8B4513', color: 'white', fontSize: '0.75rem' }}
                      />
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <Chip
                    label={product.category}
                    size="small"
                    sx={{ backgroundColor: '#8B4513', color: 'white' }}
                  />
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {formatPrice(product.price)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <Chip
                    label={product.featured ? 'Có' : 'Không'}
                    color={product.featured ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <Chip
                    label={product.inStock !== false ? 'Có' : 'Không'}
                    color={product.inStock !== false ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleEditProduct(product)}
                    sx={{ color: '#8B4513' }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteProduct(product._id)}
                    sx={{ color: '#d32f2f' }}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // Orders Tab Component
  const OrdersTab = () => (
    <Box>
      {/* Search and Filter */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <TextField
          placeholder="Tìm đơn hàng..."
          value={orderSearchTerm}
          onChange={(e) => setOrderSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: '100%', sm: 300 } }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={orderStatusFilter}
            label="Trạng thái"
            onChange={(e) => setOrderStatusFilter(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="pending">Chờ xác nhận</MenuItem>
            <MenuItem value="confirmed">Xác nhận</MenuItem>
            <MenuItem value="preparing">Chuẩn bị</MenuItem>
            <MenuItem value="ready">Sẵn sàng</MenuItem>
            <MenuItem value="delivered">Giao hàng</MenuItem>
            <MenuItem value="cancelled">Hủy</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Orders Table */}
      {ordersLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#8B4513' }} />
        </Box>
      ) : ordersError ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {ordersError}
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: { xs: 600, md: 800 } }}>
            <TableHead>
              <TableRow>
                <TableCell>Số đơn hàng</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Sản phẩm</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Ngày</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      #{order.orderNumber || order._id.slice(-6)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {order.customer?.name || `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Không rõ'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.customer?.email || 'Không có email'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="body2">
                      {order.items?.length || 0} sản phẩm
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {formatPrice(order.total)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getVietnameseStatus(order.status)}
                      size="small"
                      icon={
                        order.status === 'delivered' ? <CheckCircle /> :
                        order.status === 'cancelled' ? <Cancel /> :
                        order.status === 'ready' ? <Done /> :
                        order.status === 'preparing' ? <LocalShipping /> :
                        <Pending />
                      }
                      color={
                        order.status === 'delivered' ? 'success' :
                        order.status === 'cancelled' ? 'error' :
                        order.status === 'ready' ? 'info' :
                        order.status === 'preparing' ? 'warning' :
                        'default'
                      }
                    />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Typography variant="body2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderDialog(true);
                      }}
                      sx={{ color: '#8B4513' }}
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  // Customers Tab Component
  const CustomersTab = () => (
    <Box>
      {/* Search */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          placeholder="Tìm kiếm khách hàng..."
          value={customerSearchTerm}
          onChange={(e) => setCustomerSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: '100%', sm: 300 } }}
        />
      </Box>

      {/* Customers Table */}
      {customersLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#8B4513' }} />
        </Box>
      ) : customersError ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {customersError}
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: { xs: 600, md: 750 } }}>
            <TableHead>
              <TableRow>
                <TableCell>Tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Điện thoại</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Đơn hàng</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Tổng chi tiêu</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Tham gia</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {customer.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {customer.email}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="body2">
                      {customer.phone || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Typography variant="body2">
                      {customer.orderStats?.totalOrders || 0}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {formatPrice(customer.orderStats?.totalSpent || 0)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="body2">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowCustomerDialog(true);
                      }}
                      sx={{ color: '#8B4513' }}
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  // Contacts Tab Content
  const ContactsTab = () => (
    <Box>
      {/* Search and Filter */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <TextField
          placeholder="Tìm kiếm liên hệ..."
          value={contactSearchTerm}
          onChange={(e) => setContactSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: '100%', sm: 300 } }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={contactStatusFilter}
            onChange={(e) => setContactStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="new">Mới</MenuItem>
            <MenuItem value="read">Đã đọc</MenuItem>
            <MenuItem value="replied">Đã trả lời</MenuItem>
            <MenuItem value="closed">Đã đóng</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Contacts Table */}
      {contactsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#8B4513' }} />
        </Box>
      ) : contactsError ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {contactsError}
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: { xs: 600, md: 750 } }}>
            <TableHead>
              <TableRow>
                <TableCell>Mã ticket</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Chủ đề</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Ngày</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact._id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {contact.ticketId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {contact.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {contact.email}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {contact.subject}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={contact.status}
                      size="small"
                      color={
                        contact.status === 'new' ? 'error' :
                        contact.status === 'read' ? 'warning' :
                        contact.status === 'replied' ? 'info' :
                        contact.status === 'closed' ? 'success' :
                        'default'
                      }
                    />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="body2">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedContact(contact);
                        setShowContactDialog(true);
                      }}
                      sx={{ color: '#8B4513' }}
                    >
                      <Visibility />
                    </IconButton>
                    <FormControl sx={{ ml: 1, minWidth: 80 }}>
                      <Select
                        value={contact.status}
                        onChange={(e) => updateContactStatus(contact._id, e.target.value)}
                        size="small"
                        sx={{ fontSize: '0.75rem' }}
                      >
                        <MenuItem value="new">Mới</MenuItem>
                        <MenuItem value="read">Đã đọc</MenuItem>
                        <MenuItem value="replied">Đã trả lời</MenuItem>
                        <MenuItem value="closed">Đã đóng</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="error">
          Truy cập bị từ chối. Yêu cầu quyền quản trị viên.
        </Alert>
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>Thông tin debug:</Typography>
          <Typography variant="body2">Người dùng tồn tại: {user ? 'Có' : 'Không'}</Typography>
          <Typography variant="body2">Vai trò người dùng: {user?.role || 'Không có'}</Typography>
          <Typography variant="body2">Token tồn tại: {localStorage.getItem('token') ? 'Có' : 'Không'}</Typography>

          <Typography variant="body2">Vui lòng đăng nhập với tài khoản quản trị viên:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Email: admin@dreamcoffee.com</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Password: password</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={() => window.location.href = '/login'}
          >
            Đến trang đăng nhập
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{ 
          fontWeight: 'bold', 
          color: '#8B4513', 
          mb: 4,
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
        }}
      >
        Bảng điều khiển
      </Typography>

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              color: '#8B4513',
              '&.Mui-selected': {
                color: '#8B4513',
                fontWeight: 'bold'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#8B4513'
            }
          }}
        >
          <Tab label="Bảng điều khiển" icon={<Dashboard />} />
          <Tab label="Sản phẩm" icon={<Inventory />} />
          <Tab label="Đơn hàng" icon={<ShoppingCart />} />
          <Tab label="Khách hàng" icon={<People />} />
          <Tab label="Tin nhắn liên hệ" icon={<ContactMail />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {currentTab === 0 && <DashboardTab />}
      {currentTab === 1 && <ProductsTab />}
      {currentTab === 2 && <OrdersTab />}
      {currentTab === 3 && <CustomersTab />}
      {currentTab === 4 && <ContactsTab />}

      {/* Add/Edit Product Dialog */}
      <Dialog
        open={showProductDialog}
        onClose={() => {
          setShowProductDialog(false);
          resetProductForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên sản phẩm"
                value={productForm.name}
                onChange={(e) => handleProductFormChange('name', e.target.value)}
                onBlur={() => handleProductFormBlur('name')}
                error={productTouched.name && !!productErrors.name}
                helperText={productTouched.name && productErrors.name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={productTouched.category && !!productErrors.category}>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={productForm.category}
                  label="Danh mục"
                  onChange={(e) => handleProductFormChange('category', e.target.value)}
                  onBlur={() => handleProductFormBlur('category')}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                    </MenuItem>
                  ))}
                </Select>
                {productTouched.category && productErrors.category && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {productErrors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Mô tả"
                value={productForm.description}
                onChange={(e) => handleProductFormChange('description', e.target.value)}
                onBlur={() => handleProductFormBlur('description')}
                error={productTouched.description && !!productErrors.description}
                helperText={productTouched.description && productErrors.description}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ color: '#8B4513', fontWeight: 'bold' }}>
                Hình ảnh sản phẩm
              </Typography>
              <ImageUpload
                value={productForm.image}
                onChange={(imagePath) => handleProductFormChange('image', imagePath)}
                error={productTouched.image && productErrors.image}
                helperText="Tải lên hình ảnh chất lượng cao cho sản phẩm của bạn"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={productForm.featured}
                    onChange={(e) => handleProductFormChange('featured', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#8B4513',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#8B4513',
                      },
                    }}
                  />
                }
                label="Sản phẩm nổi bật"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={productForm.available}
                    onChange={(e) => handleProductFormChange('available', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#8B4513',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#8B4513',
                      },
                    }}
                  />
                }
                label="Có sẵn"
              />
            </Grid>
            
            {/* Sizes Section */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Kích cỡ sản phẩm</Typography>
                <Button
                  size="small"
                  onClick={() => setShowSizeDialog(true)}
                  sx={{ color: '#8B4513' }}
                >
                  Thêm kích cỡ
                </Button>
              </Box>
              {productForm.sizes.map((size, index) => (
                <Chip
                  key={index}
                  label={`${size.name} - ${formatPrice(size.price)}`}
                  onDelete={() => handleRemoveSize(index)}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowProductDialog(false);
              resetProductForm();
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSaveProduct}
            variant="contained"
            disabled={Object.keys(productErrors).some(key => productErrors[key]) || saveLoading}
            sx={{
              backgroundColor: '#8B4513',
              '&:hover': { backgroundColor: '#A0522D' }
            }}
            startIcon={saveLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {saveLoading ? 'Đang lưu...' : (editingProduct ? 'Cập nhật' : 'Thêm') + ' sản phẩm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Size Dialog */}
      <Dialog
        open={showSizeDialog}
        onClose={() => {
          setShowSizeDialog(false);
          setSizeForm({ name: '', price: '' });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thêm kích cỡ sản phẩm</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={sizeTouched.name && !!sizeErrors.name}>
                <InputLabel>Tên kích cỡ</InputLabel>
                <Select
                  value={sizeForm.name}
                  label="Tên kích cỡ"
                  onChange={(e) => handleSizeFormChange('name', e.target.value)}
                  onBlur={() => handleSizeFormBlur('name')}
                >
                  <MenuItem value="Small">Nhỏ</MenuItem>
                  <MenuItem value="Medium">Vừa</MenuItem>
                  <MenuItem value="Large">Lớn</MenuItem>
                </Select>
                {sizeTouched.name && sizeErrors.name && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {sizeErrors.name}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Giá"
                type="number"
                value={sizeForm.price}
                onChange={(e) => handleSizeFormChange('price', e.target.value)}
                onBlur={() => handleSizeFormBlur('price')}
                error={sizeTouched.price && !!sizeErrors.price}
                helperText={sizeTouched.price && sizeErrors.price}
                InputProps={{
                  endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseSizeDialog}
          >
            Hủy
          </Button>
          <Button
            onClick={handleAddSize}
            variant="contained"
            disabled={Object.keys(sizeErrors).some(key => sizeErrors[key]) || !sizeForm.name || !sizeForm.price}
            sx={{
              backgroundColor: '#8B4513',
              '&:hover': { backgroundColor: '#A0522D' }
            }}
          >
            Thêm kích cỡ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog
        open={showOrderDialog}
        onClose={() => {
          setShowOrderDialog(false);
          setSelectedOrder(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Chi tiết đơn hàng - #{selectedOrder?.orderNumber || selectedOrder?._id?.slice(-6)}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Thông tin khách hàng</Typography>
                <Typography><strong>Tên:</strong> {selectedOrder.customer?.name || `${selectedOrder.customer?.firstName || ''} ${selectedOrder.customer?.lastName || ''}`.trim() || 'Không rõ'}</Typography>
                <Typography><strong>Email:</strong> {selectedOrder.customer?.email || 'Không có email'}</Typography>
                <Typography><strong>Điện thoại:</strong> {selectedOrder.customer?.phone || 'N/A'}</Typography>
                <Typography><strong>Địa chỉ:</strong> {
                  (() => {
                    // Ưu tiên địa chỉ giao hàng cho đơn delivery
                    if (selectedOrder.orderType === 'delivery' && selectedOrder.deliveryAddress) {
                      const deliveryAddress = [
                        selectedOrder.deliveryAddress.street,
                        selectedOrder.deliveryAddress.city,
                        selectedOrder.deliveryAddress.state,
                        selectedOrder.deliveryAddress.zipCode
                      ].filter(Boolean).join(', ');
                      if (deliveryAddress) return deliveryAddress;
                    }
                    
                    // Sử dụng địa chỉ của khách hàng
                    if (selectedOrder.customer?.address) {
                      const customerAddress = [
                        selectedOrder.customer.address.street,
                        selectedOrder.customer.address.city,
                        selectedOrder.customer.address.state,
                        selectedOrder.customer.address.zipCode
                      ].filter(Boolean).join(', ');
                      if (customerAddress) return customerAddress;
                    }
                    
                    return 'Chưa có địa chỉ';
                  })()
                }</Typography>
                {selectedOrder.deliveryAddress?.instructions && (
                  <Typography><strong>Hướng dẫn giao hàng:</strong> {selectedOrder.deliveryAddress.instructions}</Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Thông tin đơn hàng</Typography>
                <Typography><strong>Trạng thái:</strong> 
                  <Chip
                    label={getVietnameseStatus(selectedOrder.status)}
                    size="small"
                    color={
                      selectedOrder.status === 'delivered' ? 'success' :
                      selectedOrder.status === 'cancelled' ? 'error' :
                      selectedOrder.status === 'ready' ? 'info' :
                      selectedOrder.status === 'preparing' ? 'warning' :
                      'default'
                    }
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography><strong>Tổng tiền:</strong> {formatPrice(selectedOrder.total)}</Typography>
                <Typography><strong>Phương thức thanh toán:</strong> {selectedOrder.paymentMethod || 'N/A'}</Typography>
                <Typography><strong>Ngày đặt hàng:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Sản phẩm trong đơn hàng</Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Sản phẩm</TableCell>
                        <TableCell>Kích cỡ</TableCell>
                        <TableCell>Số lượng</TableCell>
                        <TableCell>Giá</TableCell>
                        <TableCell>Tổng</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product?.name || item.name || 'Sản phẩm không rõ'}</TableCell>
                          <TableCell>{item.size || 'N/A'}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatPrice(item.price)}</TableCell>
                          <TableCell>{formatPrice(item.price * item.quantity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Cập nhật trạng thái đơn hàng</Typography>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={selectedOrder.status}
                    label="Trạng thái"
                    onChange={(e) => {
                      updateOrderStatus(selectedOrder._id, e.target.value);
                      setSelectedOrder({ ...selectedOrder, status: e.target.value });
                    }}
                  >
                    <MenuItem value="pending">Chờ xử lý</MenuItem>
                    <MenuItem value="confirmed">Đã xác nhận</MenuItem>
                    <MenuItem value="preparing">Đang chuẩn bị</MenuItem>
                    <MenuItem value="ready">Sẵn sàng</MenuItem>
                    <MenuItem value="delivered">Đã giao</MenuItem>
                    <MenuItem value="cancelled">Đã hủy</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowOrderDialog(false);
              setSelectedOrder(null);
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Customer Details Dialog */}
      <Dialog
        open={showCustomerDialog}
        onClose={() => {
          setShowCustomerDialog(false);
          setSelectedCustomer(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Chi tiết khách hàng - {selectedCustomer?.name}
        </DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Thông tin cá nhân</Typography>
                <Typography><strong>Tên:</strong> {selectedCustomer.name}</Typography>
                <Typography><strong>Email:</strong> {selectedCustomer.email}</Typography>
                <Typography><strong>Điện thoại:</strong> {selectedCustomer.phone || 'N/A'}</Typography>
                <Typography><strong>Địa chỉ:</strong> {
                  selectedCustomer.address ? [
                    selectedCustomer.address.street,
                    selectedCustomer.address.city,
                    selectedCustomer.address.state,
                    selectedCustomer.address.zipCode
                  ].filter(Boolean).join(', ') || 'Chưa có địa chỉ' : 'Chưa có địa chỉ'
                }</Typography>
                <Typography><strong>Thành viên từ:</strong> {new Date(selectedCustomer.createdAt).toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Thống kê đơn hàng</Typography>
                <Typography><strong>Tổng đơn hàng:</strong> {selectedCustomer.orderStats?.totalOrders || 0}</Typography>
                <Typography><strong>Tổng chi tiêu:</strong> {formatPrice(selectedCustomer.orderStats?.totalSpent || 0)}</Typography>
                <Typography><strong>Giá trị đơn hàng trung bình:</strong> {formatPrice((selectedCustomer.orderStats?.totalSpent || 0) / Math.max(selectedCustomer.orderStats?.totalOrders || 1, 1))}</Typography>
                <Typography><strong>Đơn hàng cuối:</strong> {selectedCustomer.orderStats?.lastOrderDate ? new Date(selectedCustomer.orderStats.lastOrderDate).toLocaleDateString() : 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Đơn hàng gần đây</Typography>
                {selectedCustomer.recentOrders && selectedCustomer.recentOrders.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Số đơn hàng</TableCell>
                          <TableCell>Ngày</TableCell>
                          <TableCell>Tổng tiền</TableCell>
                          <TableCell>Trạng thái</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedCustomer.recentOrders.map((order) => (
                          <TableRow key={order._id}>
                            <TableCell>#{order.orderNumber || order._id.slice(-6)}</TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{formatPrice(order.total)}</TableCell>
                            <TableCell>
                              <Chip
                                label={getVietnameseStatus(order.status)}
                                size="small"
                                color={
                                  order.status === 'delivered' ? 'success' :
                                  order.status === 'cancelled' ? 'error' :
                                  order.status === 'ready' ? 'info' :
                                  order.status === 'preparing' ? 'warning' :
                                  'default'
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary">Không tìm thấy đơn hàng gần đây.</Typography>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowCustomerDialog(false);
              setSelectedCustomer(null);
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Details Dialog */}
      <Dialog
        open={showContactDialog}
        onClose={() => {
          setShowContactDialog(false);
          setSelectedContact(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Tin nhắn liên hệ - {selectedContact?.ticketId}
        </DialogTitle>
        <DialogContent>
          {selectedContact && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Thông tin liên hệ</Typography>
                <Typography><strong>Tên:</strong> {selectedContact.name}</Typography>
                <Typography><strong>Email:</strong> {selectedContact.email}</Typography>
                <Typography><strong>Điện thoại:</strong> {selectedContact.phone || 'N/A'}</Typography>
                <Typography><strong>Mã ticket:</strong> {selectedContact.ticketId}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Chi tiết tin nhắn</Typography>
                <Typography><strong>Chủ đề:</strong> {selectedContact.subject}</Typography>
                <Typography><strong>Trạng thái:</strong> 
                  <Chip
                    label={selectedContact.status}
                    size="small"
                    color={
                      selectedContact.status === 'new' ? 'error' :
                      selectedContact.status === 'read' ? 'warning' :
                      selectedContact.status === 'replied' ? 'info' :
                      selectedContact.status === 'closed' ? 'success' :
                      'default'
                    }
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography><strong>Ngày:</strong> {new Date(selectedContact.createdAt).toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Tin nhắn</Typography>
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedContact.message}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Cập nhật trạng thái</Typography>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={selectedContact.status}
                    label="Trạng thái"
                    onChange={(e) => {
                      updateContactStatus(selectedContact._id, e.target.value);
                      setSelectedContact({ ...selectedContact, status: e.target.value });
                    }}
                  >
                    <MenuItem value="new">Mới</MenuItem>
                    <MenuItem value="read">Đã đọc</MenuItem>
                    <MenuItem value="replied">Đã trả lời</MenuItem>
                    <MenuItem value="closed">Đã đóng</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowContactDialog(false);
              setSelectedContact(null);
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Admin;