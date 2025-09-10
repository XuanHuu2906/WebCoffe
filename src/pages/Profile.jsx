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
import { useAuth } from '../contexts/AuthContext.jsx';

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
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    preferences: {
      newsletter: false,
      notifications: true
    }
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
        if (!value) return 'Tên là bắt buộc';
      if (value.length < 2) return 'Tên phải có ít nhất 2 ký tự';
        return '';
      case 'lastName':
        if (!value) return 'Họ là bắt buộc';
      if (value.length < 2) return 'Họ phải có ít nhất 2 ký tự';
        return '';
      case 'email':
        if (!value) return 'Email là bắt buộc';
      if (!/\S+@\S+\.\S+/.test(value)) return 'Vui lòng nhập địa chỉ email hợp lệ';
        return '';
      case 'phone':
        if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
          return 'Vui lòng nhập số điện thoại hợp lệ';
        }
        return '';
      case 'street':
        return '';
      case 'city':
        return '';
      case 'state':
        return '';
      case 'zipCode':
        if (value && !/^\d{5}(-\d{4})?$/.test(value)) {
          return 'Vui lòng nhập mã bưu điện hợp lệ (ví dụ: 12345 hoặc 12345-6789)';
        }
        return '';
      default:
        return '';
    }
  };

  const validatePasswordField = (name, value) => {
    switch (name) {
      case 'currentPassword':
        if (!value) return 'Mật khẩu hiện tại là bắt buộc';
        return '';
      case 'newPassword':
        if (!value) return 'Mật khẩu mới là bắt buộc';
      if (value.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một số';
        }
        return '';
      case 'confirmPassword':
        if (!value) return 'Vui lòng xác nhận mật khẩu mới';
        if (value !== passwordData.newPassword) return 'Mật khẩu không khớp';
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
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || 'USA'
        },
        preferences: {
          newsletter: user.preferences?.newsletter || false,
          notifications: user.preferences?.notifications !== undefined ? user.preferences.notifications : true
        }
      });
    }
  }, [user]);

  // Handle profile form changes
  const handleProfileChange = (event) => {
    const { name, value, type, checked } = event.target;
    const actualValue = type === 'checkbox' ? checked : value;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: actualValue
        }
      }));
      setProfileTouched(prev => ({ ...prev, [addressField]: true }));
    } else if (name.startsWith('preferences.')) {
      const prefField = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefField]: actualValue
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: actualValue
      }));
      setProfileTouched(prev => ({ ...prev, [name]: true }));
    }
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
      setMessage({ type: 'error', text: 'Vui lòng sửa các lỗi xác thực trước khi lưu' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return;
    }

    try {
      await updateProfile(profileData);
      setIsEditing(false);
      setProfileTouched({});
      setProfileErrors({});
      setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Không thể cập nhật hồ sơ' });
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
      setMessage({ type: 'error', text: 'Vui lòng sửa các lỗi xác thực trước khi đổi mật khẩu' });
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
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Không thể đổi mật khẩu' });
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
        Hồ Sơ Của Tôi
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
                Thông Tin Cơ Bản
              </Typography>
              {!isEditing ? (
                <Button
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                  sx={{ color: '#8B4513' }}
                >
                  Chỉnh Sửa
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
                    Lưu
                  </Button>
                  <Button
                    startIcon={<Cancel />}
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    Hủy
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tên"
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
                  label="Họ"
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
                  label="Số Điện Thoại"
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

            <Divider sx={{ my: 3 }} />

            {/* Address Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Địa Chỉ
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Địa Chỉ Đường"
                    name="address.street"
                    value={profileData.address.street}
                    onChange={handleProfileChange}
                    onBlur={handleProfileBlur}
                    disabled={!isEditing || loading}
                    variant="outlined"
                    error={isEditing && profileTouched.street && !!profileErrors.street}
                    helperText={isEditing && profileTouched.street && profileErrors.street}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Thành Phố"
                    name="address.city"
                    value={profileData.address.city}
                    onChange={handleProfileChange}
                    onBlur={handleProfileBlur}
                    disabled={!isEditing || loading}
                    variant="outlined"
                    error={isEditing && profileTouched.city && !!profileErrors.city}
                    helperText={isEditing && profileTouched.city && profileErrors.city}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Tỉnh/Thành"
                    name="address.state"
                    value={profileData.address.state}
                    onChange={handleProfileChange}
                    onBlur={handleProfileBlur}
                    disabled={!isEditing || loading}
                    variant="outlined"
                    error={isEditing && profileTouched.state && !!profileErrors.state}
                    helperText={isEditing && profileTouched.state && profileErrors.state}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Mã Bưu Điện"
                    name="address.zipCode"
                    value={profileData.address.zipCode}
                    onChange={handleProfileChange}
                    onBlur={handleProfileBlur}
                    disabled={!isEditing || loading}
                    variant="outlined"
                    error={isEditing && profileTouched.zipCode && !!profileErrors.zipCode}
                    helperText={isEditing && profileTouched.zipCode && profileErrors.zipCode}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Loyalty Points Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Chương Trình Khách Hàng Thân Thiết
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#8B4513' }}>
                  {user.loyaltyPoints || 0} Points
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tích điểm với mỗi lần mua hàng và đổi quà tặng!
                </Typography>
              </Paper>
            </Box>

            {/* Preferences Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Tùy Chọn
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      id="newsletter"
                      name="preferences.newsletter"
                      checked={profileData.preferences.newsletter}
                      onChange={handleProfileChange}
                      disabled={!isEditing || loading}
                      style={{ marginRight: '8px' }}
                    />
                    <label htmlFor="newsletter">
                      <Typography variant="body1">
                        Đăng ký nhận bản tin để cập nhật và nhận ưu đãi đặc biệt
                      </Typography>
                    </label>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      id="notifications"
                      name="preferences.notifications"
                      checked={profileData.preferences.notifications}
                      onChange={handleProfileChange}
                      disabled={!isEditing || loading}
                      style={{ marginRight: '8px' }}
                    />
                    <label htmlFor="notifications">
                      <Typography variant="body1">
                        Nhận thông báo trạng thái đơn hàng
                      </Typography>
                    </label>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Password Section */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Bảo Mật
              </Typography>
              <Button
                startIcon={<Lock />}
                onClick={() => setShowPasswordDialog(true)}
                sx={{ color: '#8B4513' }}
              >
                Đổi Mật Khẩu
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Lần đổi mật khẩu cuối: {user.passwordChangedAt ? new Date(user.passwordChangedAt).toLocaleDateString() : 'Chưa bao giờ'}
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
          Đổi Mật Khẩu
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Mật Khẩu Hiện Tại"
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
              label="Mật Khẩu Mới"
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              sx={{ mb: 3 }}
              error={passwordTouched.newPassword && !!passwordErrors.newPassword}
              helperText={(passwordTouched.newPassword && passwordErrors.newPassword) || (!passwordTouched.newPassword && "Phải chứa chữ hoa, chữ thường và số")}
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
              label="Xác Nhận Mật Khẩu Mới"
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
            Hủy
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
            Đổi Mật Khẩu
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;