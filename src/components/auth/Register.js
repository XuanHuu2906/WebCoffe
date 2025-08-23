import React, { useState, useEffect, useCallback } from 'react';
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
  IconButton,
  Grid
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Validation rules
  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'firstName':
        if (!value) return 'First name is required';
        if (value.length < 2) return 'First name must be at least 2 characters';
        return '';
      case 'lastName':
        if (!value) return 'Last name is required';
        if (value.length < 2) return 'Last name must be at least 2 characters';
        return '';
      case 'email':
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email address';
        return '';
      case 'phone':
        if (value && !/^[+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-()]/g, ''))) {
          return 'Please enter a valid phone number';
        }
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  }, [formData.password]);

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
    Object.keys(touched).forEach(key => {
      if (touched[key]) {
        const fieldError = validateField(key, formData[key]);
        setErrors(prev => ({ ...prev, [key]: fieldError }));
      }
    });
  }, [formData, touched, validateField]);

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
    const allFields = Object.keys(formData);
    const touchedFields = {};
    allFields.forEach(field => {
      touchedFields[field] = true;
    });
    setTouched(touchedFields);
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    
    if (result.success) {
      navigate('/');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
          maxWidth: 500,
          borderRadius: 2
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Join WebCaffe
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your account to start ordering
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                autoComplete="given-name"
                autoFocus
                error={touched.firstName && !!errors.firstName}
                helperText={touched.firstName && errors.firstName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                autoComplete="family-name"
                error={touched.lastName && !!errors.lastName}
                helperText={touched.lastName && errors.lastName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            margin="normal"
            required
            autoComplete="email"
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
            label="Phone Number (Optional)"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            margin="normal"
            autoComplete="tel"
            error={touched.phone && !!errors.phone}
            helperText={touched.phone && errors.phone}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            margin="normal"
            required
            autoComplete="new-password"
            error={touched.password && !!errors.password}
            helperText={(touched.password && errors.password) || (!touched.password && "Must contain uppercase, lowercase, and number")}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={togglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            margin="normal"
            required
            autoComplete="new-password"
            error={touched.confirmPassword && !!errors.confirmPassword}
            helperText={touched.confirmPassword && errors.confirmPassword}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={toggleConfirmPasswordVisibility}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
              'Create Account'
            )}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to="/login"
                color="primary"
                sx={{ textDecoration: 'none', fontWeight: 'medium' }}
              >
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;