import React, { useState, useEffect } from 'react';
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
  Search
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
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/dashboard/stats`, {
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

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/dashboard/recent-orders?limit=5`, {
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

  useEffect(() => {
    fetchProducts();
    if (user && user.role === 'admin') {
      fetchDashboardStats();
      fetchRecentOrders();
    }
  }, [user]);

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
          image: productForm.image,
          featured: productForm.featured,
          inStock: productForm.available,
          sizes: productForm.sizes
        };

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
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      category: product.category,
      image: product.image || '',
      featured: product.featured || false,
      available: product.available !== false,
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
                <Typography variant="body2">Total Products</Typography>
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
                <Typography variant="body2">Total Orders</Typography>
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
                <Typography variant="body2">Total Customers</Typography>
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
                <Typography variant="body2">Total Revenue</Typography>
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
            Recent Orders
          </Typography>
          {dashboardLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#8B4513' }} />
            </Box>
          ) : dashboardStats.recentOrders.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No recent orders found
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order Number</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardStats.recentOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{order.orderNumber}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
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
                        <IconButton size="small">
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
    </Grid>
  );

  // Products Tab Content
  const ProductsTab = () => (
    <Box>
      {/* Search and Add Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          placeholder="Search products..."
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
          onClick={() => setShowProductDialog(true)}
          sx={{
            backgroundColor: '#8B4513',
            '&:hover': { backgroundColor: '#A0522D' }
          }}
        >
          Add Product
        </Button>
      </Box>

      {/* Products Table */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: { xs: 600, md: 750 } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Featured</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Available</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product._id}>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <img
                    src={product.image ? (product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${product.image}`) : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyNUgxNVYzNUgyMFYyNVoiIGZpbGw9IiM4QjQ1MTMiLz4KPHA+dGggZD0iTTQ1IDI1SDQwVjM1SDQ1VjI1WiIgZmlsbD0iIzhCNDUxMyIvPgo8cGF0aCBkPSJNMzAgMTVIMjVWNDVIMzBWMTVaIiBmaWxsPSIjOEI0NTEzIi8+CjwvcGF0aD4KPC9zdmc+'}
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
                    label={product.featured ? 'Yes' : 'No'}
                    color={product.featured ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <Chip
                    label={product.available !== false ? 'Yes' : 'No'}
                    color={product.available !== false ? 'success' : 'error'}
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

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="error">
          Access denied. Admin privileges required.
        </Alert>
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>Debug Info:</Typography>
          <Typography variant="body2">User exists: {user ? 'Yes' : 'No'}</Typography>
          <Typography variant="body2">User role: {user?.role || 'None'}</Typography>
          <Typography variant="body2">Token exists: {localStorage.getItem('token') ? 'Yes' : 'No'}</Typography>

          <Typography variant="body2">Please log in as admin using:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Email: admin@webcaffe.com</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Password: password</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={() => window.location.href = '/login'}
          >
            Go to Login
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
        Admin Dashboard
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
          <Tab label="Dashboard" icon={<Dashboard />} />
          <Tab label="Products" icon={<Inventory />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {currentTab === 0 && <DashboardTab />}
      {currentTab === 1 && <ProductsTab />}

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
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={productForm.name}
                onChange={(e) => handleProductFormChange('name', e.target.value)}
                onBlur={() => handleProductFormBlur('name')}
                error={productTouched.name && !!productErrors.name}
                helperText={productTouched.name && productErrors.name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={productTouched.category && !!productErrors.category}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={productForm.category}
                  label="Category"
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
                label="Description"
                value={productForm.description}
                onChange={(e) => handleProductFormChange('description', e.target.value)}
                onBlur={() => handleProductFormBlur('description')}
                error={productTouched.description && !!productErrors.description}
                helperText={productTouched.description && productErrors.description}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ color: '#8B4513', fontWeight: 'bold' }}>
                Product Image
              </Typography>
              <ImageUpload
                value={productForm.image}
                onChange={(imagePath) => handleProductFormChange('image', imagePath)}
                error={productTouched.image && productErrors.image}
                helperText="Upload a high-quality image for your product"
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
                label="Featured Product"
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
                label="Available"
              />
            </Grid>
            
            {/* Sizes Section */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Product Sizes</Typography>
                <Button
                  size="small"
                  onClick={() => setShowSizeDialog(true)}
                  sx={{ color: '#8B4513' }}
                >
                  Add Size
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
            Cancel
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
            {saveLoading ? 'Saving...' : (editingProduct ? 'Update' : 'Add') + ' Product'}
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
        <DialogTitle>Add Product Size</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={sizeTouched.name && !!sizeErrors.name}>
                <InputLabel>Size Name</InputLabel>
                <Select
                  value={sizeForm.name}
                  label="Size Name"
                  onChange={(e) => handleSizeFormChange('name', e.target.value)}
                  onBlur={() => handleSizeFormBlur('name')}
                >
                  <MenuItem value="Small">Small</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Large">Large</MenuItem>
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
                label="Price"
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
            Cancel
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
            Add Size
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Admin;