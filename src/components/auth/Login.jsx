import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get message from navigation state
  const redirectMessage = location.state?.message;

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email là bắt buộc';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Vui lòng nhập địa chỉ email hợp lệ';
        return '';
      case 'password':
        if (!value) return 'Mật khẩu là bắt buộc';
        if (value.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
        return '';
      default:
        return '';
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Real-time validation
  useEffect(() => {
    if (touched.email) {
      const emailError = validateField('email', formData.email);
      setErrors(prev => ({ ...prev, email: emailError }));
    }
    if (touched.password) {
      const passwordError = validateField('password', formData.password);
      setErrors(prev => ({ ...prev, password: passwordError }));
    }
  }, [formData, touched]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Clear global error when user starts typing
    if (error) clearError();
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ email: true, password: true });
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Check if there were pending cart items
      const hadPendingItems = localStorage.getItem('pendingCartItems');
      
      // Redirect to the page user came from, or home page
      const redirectTo = location.state?.from || '/';
      
      // Add a small delay to allow cart context to process pending items
      setTimeout(() => {
        if (hadPendingItems) {
          // Navigate with success message about auto-added items
          navigate(redirectTo, {
            state: {
              message: 'Đăng nhập thành công! Các sản phẩm đã được tự động thêm vào giỏ hàng.',
              type: 'success'
            }
          });
        } else {
          navigate(redirectTo);
        }
      }, 100);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        padding: 2
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 2
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Chào Mừng Trở Lại
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Đăng nhập vào tài khoản DREAM COFFEE của bạn
          </Typography>
        </Box>

        {redirectMessage && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {redirectMessage}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Địa Chỉ Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            margin="normal"
            required
            autoComplete="email"
            autoFocus
            error={touched.email && !!errors.email}
            helperText={touched.email && errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Mật Khẩu"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            margin="normal"
            required
            autoComplete="current-password"
            error={touched.password && !!errors.password}
            helperText={touched.password && errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="hiển thị/ẩn mật khẩu"
                    onClick={togglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || Object.keys(errors).some(key => errors[key])}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Đăng Nhập'
            )}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Chưa có tài khoản?{' '}
              <Link
                component={RouterLink}
                to="/register"
                color="primary"
                sx={{ textDecoration: 'none', fontWeight: 'medium' }}
              >
                Đăng ký tại đây
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;