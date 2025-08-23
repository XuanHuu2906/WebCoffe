import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  Lock
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile, changePassword, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [profileTouched, setProfileTouched] = useState({});
  const [passwordTouched, setPasswordTouched] = useState({});
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Validation functions
  const validateProfileField = (name, value) => {
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
        if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
          return 'Please enter a valid phone number';
        }
        return '';
      default:
        return '';
    }
  };

  const validatePasswordField = (name, value) => {
    switch (name) {
      case 'currentPassword':
        if (!value) return 'Current password is required';
        return '';
      case 'newPassword':
        if (!value) return 'New password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your new password';
        if (value !== passwordData.newPassword) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};
    Object.keys(profileData).forEach(key => {
      const error = validateProfileField(key, profileData[key]);
      if (error) newErrors[key] = error;
    });
    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    Object.keys(passwordData).forEach(key => {
      const error = validatePasswordField(key, passwordData[key]);
      if (error) newErrors[key] = error;
    });
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Real-time validation for profile
  useEffect(() => {
    Object.keys(profileTouched).forEach(key => {
      if (profileTouched[key]) {
        const error = validateProfileField(key, profileData[key]);
        setProfileErrors(prev => ({ ...prev, [key]: error }));
      }
    });
  }, [profileData, profileTouched]);

  // Real-time validation for password
  useEffect(() => {
    Object.keys(passwordTouched).forEach(key => {
      if (passwordTouched[key]) {
        const error = validatePasswordField(key, passwordData[key]);
        setPasswordErrors(prev => ({ ...prev, [key]: error }));
      }
    });
  }, [passwordData, passwordTouched]);

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  // Handle profile form changes
  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    setProfileTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleProfileBlur = (event) => {
    const { name } = event.target;
    setProfileTouched(prev => ({ ...prev, [name]: true }));
  };

  // Handle password form changes
  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordTouched(prev => ({ ...prev, [name]: true }));
  };

  const handlePasswordBlur = (event) => {
    const { name } = event.target;
    setPasswordTouched(prev => ({ ...prev, [name]: true }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    // Mark all fields as touched
    const allFields = Object.keys(profileData);
    const touchedFields = {};
    allFields.forEach(field => {
      touchedFields[field] = true;
    });
    setProfileTouched(touchedFields);

    if (!validateProfileForm()) {
      setMessage({ type: 'error', text: 'Please fix the validation errors before saving' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return;
    }

    try {
      await updateProfile(profileData);
      setIsEditing(false);
      setProfileTouched({});
      setProfileErrors({});
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  // Cancel profile editing
  const handleCancelEdit = () => {
    setProfileData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || ''
    });
    setProfileTouched({});
    setProfileErrors({});
    setIsEditing(false);
  };

  // Change password
  const handleChangePassword = async () => {
    // Mark all password fields as touched
    const allFields = Object.keys(passwordData);
    const touchedFields = {};
    allFields.forEach(field => {
      touchedFields[field] = true;
    });
    setPasswordTouched(touchedFields);

    if (!validatePasswordForm()) {
      setMessage({ type: 'error', text: 'Please fix the validation errors before changing password' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setShowPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordTouched({});
      setPasswordErrors({});
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  // Close password dialog
  const handleClosePasswordDialog = () => {
    setShowPasswordDialog(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordTouched({});
    setPasswordErrors({});
    setShowPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  if (!user) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#8B4513' }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        textAlign="center"
        gutterBottom
        sx={{ fontWeight: 'bold', color: '#8B4513', mb: 4 }}
      >
        My Profile
      </Typography>

      {/* Message Display */}
      {message.text && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {/* Profile Avatar and Basic Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2, 
                  bgcolor: '#8B4513',
                  fontSize: '3rem'
                }}
              >
                {user.firstName?.charAt(0) || 'U'}
              </Avatar>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>

          {/* Profile Form */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Profile Information
              </Typography>
              {!isEditing ? (
                <Button
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                  sx={{ color: '#8B4513' }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    startIcon={<Save />}
                    variant="contained"
                    onClick={handleSaveProfile}
                    disabled={loading || Object.keys(profileErrors).some(key => profileErrors[key])}
                    sx={{
                      backgroundColor: '#8B4513',
                      '&:hover': { backgroundColor: '#A0522D' }
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    startIcon={<Cancel />}
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  onBlur={handleProfileBlur}
                  disabled={!isEditing || loading}
                  variant="outlined"
                  error={isEditing && profileTouched.firstName && !!profileErrors.firstName}
                  helperText={isEditing && profileTouched.firstName && profileErrors.firstName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  onBlur={handleProfileBlur}
                  disabled={!isEditing || loading}
                  variant="outlined"
                  error={isEditing && profileTouched.lastName && !!profileErrors.lastName}
                  helperText={isEditing && profileTouched.lastName && profileErrors.lastName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  onBlur={handleProfileBlur}
                  disabled={!isEditing || loading}
                  variant="outlined"
                  error={isEditing && profileTouched.email && !!profileErrors.email}
                  helperText={isEditing && profileTouched.email && profileErrors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  onBlur={handleProfileBlur}
                  disabled={!isEditing || loading}
                  variant="outlined"
                  error={isEditing && profileTouched.phone && !!profileErrors.phone}
                  helperText={isEditing && profileTouched.phone && profileErrors.phone}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Password Section */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Security
              </Typography>
              <Button
                startIcon={<Lock />}
                onClick={() => setShowPasswordDialog(true)}
                sx={{ color: '#8B4513' }}
              >
                Change Password
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Last password change: {user.passwordChangedAt ? new Date(user.passwordChangedAt).toLocaleDateString() : 'Never'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Change Password Dialog */}
      <Dialog 
        open={showPasswordDialog} 
        onClose={handleClosePasswordDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Change Password
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              name="currentPassword"
              type={showPassword ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              sx={{ mb: 3 }}
              error={passwordTouched.currentPassword && !!passwordErrors.currentPassword}
              helperText={passwordTouched.currentPassword && passwordErrors.currentPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              sx={{ mb: 3 }}
              error={passwordTouched.newPassword && !!passwordErrors.newPassword}
              helperText={(passwordTouched.newPassword && passwordErrors.newPassword) || (!passwordTouched.newPassword && "Must contain uppercase, lowercase, and number")}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              error={passwordTouched.confirmPassword && !!passwordErrors.confirmPassword}
              helperText={passwordTouched.confirmPassword && passwordErrors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleChangePassword}
            variant="contained"
            disabled={loading || Object.keys(passwordErrors).some(key => passwordErrors[key]) || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            sx={{
              backgroundColor: '#8B4513',
              '&:hover': { backgroundColor: '#A0522D' }
            }}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;