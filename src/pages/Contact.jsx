import React, { useState, useEffect } from 'react';
// Removed react-helmet-async due to dependency conflicts
import MapEmbed from '../components/MapEmbed';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Paper,
  IconButton,
  Divider,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Phone,
  Email,
  LocationOn,
  Schedule,
  Chat,

  Search,
  Send,
  AttachFile,
  Business,
  Event,
  Work,
  Article,
  ShoppingCart,
  ExpandMore,
  Close,
  WhatsApp,
  Facebook,
  Telegram,
  AccessTime,
  Wifi,
  LocalParking,
  Pets,
  Accessible,
  PowerSettingsNew,
  Instagram,
  Twitter,
  LinkedIn,
  HelpOutline,
  Star,
  QuestionAnswer,
  Support,
  LocalCafe,
  Group,
  Favorite
} from '@mui/icons-material';

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    topic: '',
    message: '',
    consent: false,
    // Topic-specific fields
    orderId: '',
    orderDate: '',
    orderChannel: '',
    eventDate: '',
    eventTime: '',
    partySize: '',
    budget: '',
    eventType: '',
    companyName: '',
    monthlyVolume: '',
    province: '',
    taxId: '',
    organization: '',
    deadline: '',
    interviewTopic: '',
    roleInterest: '',
    linkedIn: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [trackOrderDialog, setTrackOrderDialog] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState('');

  const topics = [
    { value: 'general', label: 'General Inquiry', icon: <Email /> },
    { value: 'order', label: 'Order Issue', icon: <ShoppingCart /> },
    { value: 'reservation', label: 'Reservation/Event', icon: <Event /> },
    { value: 'wholesale', label: 'Wholesale/B2B', icon: <Business /> },
    { value: 'press', label: 'Press/Partnership', icon: <Article /> },
    { value: 'careers', label: 'Careers', icon: <Work /> }
  ];

  const locations = [
    {
      id: 1,
      name: 'Main Store',
      address: '97 Man Thiện, Hiệp Phú, Thủ Đức, Hồ Chí Minh',
      phone: '+84 28 1234 5678',
      hours: {
        'Monday': '6:00 AM - 8:00 PM',
        'Tuesday': '6:00 AM - 8:00 PM',
        'Wednesday': '6:00 AM - 8:00 PM',
        'Thursday': '6:00 AM - 8:00 PM',
        'Friday': '6:00 AM - 9:00 PM',
        'Saturday': '7:00 AM - 9:00 PM',
        'Sunday': '7:00 AM - 7:00 PM'
      },
      amenities: ['parking', 'wifi', 'outlets', 'pet-friendly', 'accessible'],
    }
  ];

  const amenityIcons = {
    parking: <LocalParking />,
    wifi: <Wifi />,
    outlets: <PowerSettingsNew />,
    'pet-friendly': <Pets />,
    accessible: <Accessible />
  };

  const slaInfo = {
    general: { time: '24-48 hours', priority: 'Standard' },
    order: { time: '< 12 hours', priority: 'High' },
    reservation: { time: '24-48 hours', priority: 'Standard' },
    wholesale: { time: '2-3 business days', priority: 'Standard' },
    press: { time: '4 hours', priority: 'Urgent' },
    careers: { time: '1-2 weeks', priority: 'Standard' }
  };

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!/^[+]?[0-9\s-()]{10,}$/.test(value)) return 'Please enter a valid phone number';
        return '';
      case 'topic':
        if (!value) return 'Please select a topic';
        return '';
      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 20) return 'Message must be at least 20 characters';
        return '';
      case 'consent':
        if (!value) return 'You must agree to data processing';
        return '';
      case 'orderId':
        if (formData.topic === 'order' && !value.trim()) return 'Order ID is required for order issues';
        return '';
      case 'orderDate':
        if (formData.topic === 'order' && !value) return 'Order date is required';
        return '';
      case 'eventDate':
        if (formData.topic === 'reservation' && !value) return 'Event date is required';
        return '';
      case 'partySize':
        if (formData.topic === 'reservation' && (!value || value < 1)) return 'Party size is required';
        return '';
      case 'companyName':
        if (formData.topic === 'wholesale' && !value.trim()) return 'Company name is required';
        return '';
      case 'monthlyVolume':
        if (formData.topic === 'wholesale' && !value.trim()) return 'Monthly volume is required';
        return '';
      case 'organization':
        if (formData.topic === 'press' && !value.trim()) return 'Organization is required';
        return '';
      case 'roleInterest':
        if (formData.topic === 'careers' && !value.trim()) return 'Role of interest is required';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: fieldValue }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, fieldValue);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['fullName', 'email', 'phone', 'topic', 'message', 'consent'];
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    // Topic-specific validation
    if (formData.topic === 'order') {
      ['orderId', 'orderDate'].forEach(field => {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      });
    }

    if (formData.topic === 'reservation') {
      ['eventDate', 'partySize'].forEach(field => {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      });
    }

    if (formData.topic === 'wholesale') {
      ['companyName', 'monthlyVolume'].forEach(field => {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      });
    }

    if (formData.topic === 'press') {
      const error = validateField('organization', formData.organization);
      if (error) newErrors.organization = error;
    }

    if (formData.topic === 'careers') {
      const error = validateField('roleInterest', formData.roleInterest);
      if (error) newErrors.roleInterest = error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate ticket ID
      const newTicketId = `WC-${Date.now().toString().slice(-6)}`;
      setTicketId(newTicketId);
      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        topic: '',
        message: '',
        consent: false,
        orderId: '',
        orderDate: '',
        orderChannel: '',
        eventDate: '',
        eventTime: '',
        partySize: '',
        budget: '',
        eventType: '',
        companyName: '',
        monthlyVolume: '',
        province: '',
        taxId: '',
        organization: '',
        deadline: '',
        interviewTopic: '',
        roleInterest: '',
        linkedIn: ''
      });
      setAttachments([]);
      setTouched({});
      setErrors({});
      
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = () => {
    if (trackOrderId.trim()) {
      // In a real app, this would navigate to order tracking page
      window.open(`/orders?track=${trackOrderId}`, '_blank');
      setTrackOrderDialog(false);
      setTrackOrderId('');
    }
  };

  const renderTopicSpecificFields = () => {
    switch (formData.topic) {
      case 'order':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Order ID *"
                name="orderId"
                value={formData.orderId}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.orderId && !!errors.orderId}
                helperText={touched.orderId && errors.orderId}
                placeholder="e.g., WC-123456"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Order Date *"
                name="orderDate"
                type="date"
                value={formData.orderDate}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.orderDate && !!errors.orderDate}
                helperText={touched.orderDate && errors.orderDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Order Channel</InputLabel>
                <Select
                  name="orderChannel"
                  value={formData.orderChannel}
                  onChange={handleChange}
                  label="Order Channel"
                >
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="in-store">In-store</MenuItem>
                  <MenuItem value="phone">Phone</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        );
      
      case 'reservation':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Event Date *"
                name="eventDate"
                type="date"
                value={formData.eventDate}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.eventDate && !!errors.eventDate}
                helperText={touched.eventDate && errors.eventDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preferred Time"
                name="eventTime"
                value={formData.eventTime}
                onChange={handleChange}
                placeholder="e.g., 2:00 PM - 4:00 PM"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Party Size *"
                name="partySize"
                type="number"
                value={formData.partySize}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.partySize && !!errors.partySize}
                helperText={touched.partySize && errors.partySize}
                inputProps={{ min: 1, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Budget Range"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g., 500 VNĐ - 1000 VNĐ"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  label="Event Type"
                >
                  <MenuItem value="birthday">Birthday Party</MenuItem>
                  <MenuItem value="business">Business Meeting</MenuItem>
                  <MenuItem value="wedding">Wedding Reception</MenuItem>
                  <MenuItem value="corporate">Corporate Event</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        );
      
      case 'wholesale':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name *"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.companyName && !!errors.companyName}
                helperText={touched.companyName && errors.companyName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monthly Volume *"
                name="monthlyVolume"
                value={formData.monthlyVolume}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.monthlyVolume && !!errors.monthlyVolume}
                helperText={touched.monthlyVolume && errors.monthlyVolume}
                placeholder="e.g., 100 kg/month"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Province/City"
                name="province"
                value={formData.province}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tax ID (Optional)"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
              />
            </Grid>
          </>
        );
      
      case 'press':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Organization *"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.organization && !!errors.organization}
                helperText={touched.organization && errors.organization}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Interview/Collaboration Topic"
                name="interviewTopic"
                value={formData.interviewTopic}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
          </>
        );
      
      case 'careers':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Role of Interest *"
                name="roleInterest"
                value={formData.roleInterest}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.roleInterest && !!errors.roleInterest}
                helperText={touched.roleInterest && errors.roleInterest}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="LinkedIn Profile (Optional)"
                name="linkedIn"
                value={formData.linkedIn}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </Grid>
          </>
        );
      
      default:
        return null;
    }
  };

  if (submitSuccess) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="primary" gutterBottom>
            Thank You!
          </Typography>
          <Typography variant="h6" gutterBottom>
            Your message has been received
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Ticket ID: <strong>{ticketId}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Expected response time: {slaInfo[formData.topic]?.time || '24-48 hours'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            We've sent a confirmation email with a copy of your request.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setSubmitSuccess(false)}
            sx={{ mr: 2 }}
          >
            Send Another Message
          </Button>
          <Button
            variant="outlined"
            href="/"
          >
            Back to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box>
      {/* Removed Helmet component due to react-helmet-async dependency conflicts */}
      {/* Quick Action Bar */}
      <Paper 
        sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 1000, 
          backgroundColor: '#8B4513',
          color: 'white',
          py: 1
        }}
      >
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              startIcon={<Phone />}
              href="tel:+842812345678"
              sx={{ color: 'white', textTransform: 'none' }}
              size="small"
            >
              Call Now
            </Button>
            <Button
              startIcon={<WhatsApp />}
              href="https://wa.me/842812345678"
              target="_blank"
              sx={{ color: 'white', textTransform: 'none' }}
              size="small"
            >
              WhatsApp
            </Button>

            <Button
              startIcon={<Search />}
              onClick={() => setTrackOrderDialog(true)}
              sx={{ color: 'white', textTransform: 'none' }}
              size="small"
            >
              Track Order
            </Button>
          </Box>
        </Container>
      </Paper>

      {/* Urgent Banner */}
      <Alert 
        severity="warning" 
        sx={{ mb: 0, borderRadius: 0 }}
        action={
          <Button 
            color="inherit" 
            size="small" 
            href="tel:+842812345678"
            startIcon={<Phone />}
          >
            Call Now
          </Button>
        }
      >
        <strong>Urgent order issue?</strong> Call our hotline for immediate help.
      </Alert>

      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #2C1810 0%, #8B4513 30%, #A0522D 70%, #CD853F 100%)',
          color: 'white',
          py: { xs: 10, md: 16 },
          mb: 6,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            animation: 'float 20s ease-in-out infinite'
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-10px)' }
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontWeight: 800,
                fontSize: { xs: '3rem', md: '4.5rem', lg: '5.5rem' },
                background: 'linear-gradient(45deg, #ffffff 30%, #f5f5dc 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                mb: 3,
                letterSpacing: '-0.02em'
              }}
            >
              Contact Us
            </Typography>
            <Box
              sx={{
                width: '80px',
                height: '4px',
                background: 'linear-gradient(90deg, #CD853F, #F4A460)',
                mx: 'auto',
                mb: 4,
                borderRadius: '2px'
              }}
            />
            <Typography 
              variant="h4" 
              sx={{ 
                opacity: 0.95,
                fontWeight: 300,
                maxWidth: 700,
                mx: 'auto',
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                lineHeight: 1.6,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              We're here to help with your coffee needs, orders, and inquiries
            </Typography>
          </Box>
          
          {/* Floating Contact Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 3,
                  p: 3,
                  textAlign: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    background: 'rgba(255,255,255,0.15)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }
                }}
                onClick={() => window.location.href = 'tel:+842812345678'}
              >
                <Phone sx={{ fontSize: '3rem', mb: 2, color: '#F4A460' }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                  Call Us
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  +84 28 1234 5678
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 3,
                  p: 3,
                  textAlign: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    background: 'rgba(255,255,255,0.15)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }
                }}
                onClick={() => window.location.href = 'mailto:hello@webcaffe.com'}
              >
                <Email sx={{ fontSize: '3rem', mb: 2, color: '#F4A460' }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                  Email Us
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  hello@webcaffe.com
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 3,
                  p: 3,
                  textAlign: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    background: 'rgba(255,255,255,0.15)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }
                }}
                onClick={() => window.open('https://www.google.com/maps/dir/?api=1&destination=10.847987,106.7860196', '_blank')}
              >
                <LocationOn sx={{ fontSize: '3rem', mb: 2, color: '#F4A460' }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                  Visit Us
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  123 Coffee Street, District 1
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 4 }}>

        <Grid container spacing={4}>
          {/* Core Contact Info */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary">
                  Get in Touch
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    <Phone sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Hotline
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <a href="tel:+842812345678" style={{ textDecoration: 'none', color: 'inherit' }}>
                      +84 28 1234 5678
                    </a>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mon-Fri: 6:00 AM - 8:00 PM (GMT+7)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sat-Sun: 7:00 AM - 7:00 PM (GMT+7)
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Email Contacts
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>General:</strong> <a href="mailto:hello@webcaffe.com">hello@webcaffe.com</a>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Orders:</strong> <a href="mailto:orders@webcaffe.com">orders@webcaffe.com</a>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Wholesale:</strong> <a href="mailto:wholesale@webcaffe.com">wholesale@webcaffe.com</a>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Press:</strong> <a href="mailto:press@webcaffe.com">press@webcaffe.com</a>
                  </Typography>
                  <Typography variant="body2">
                    <strong>Careers:</strong> <a href="mailto:careers@webcaffe.com">careers@webcaffe.com</a>
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box>
                  <Typography variant="h6" gutterBottom>
                    <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Response Times
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Orders:</strong> &lt; 12 hours
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Events:</strong> 24-48 hours
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Press:</strong> 4 hours (business days)
                  </Typography>
                  <Typography variant="body2">
                    <strong>General:</strong> 24-48 hours
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Location & Map */}
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={3} 
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
              }}
            >
              <Box sx={{ 
                background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                color: 'white',
                p: 3,
                textAlign: 'center'
              }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                  📍 Visit Our Coffee Haven
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Experience premium coffee in the heart of Ho Chi Minh City
                </Typography>
              </Box>
              
              <Grid container>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 4 }}>
                    {locations.map((location) => (
                      <Box key={location.id}>
                        <Card 
                          elevation={2}
                          sx={{ 
                            p: 3, 
                            mb: 3,
                            borderRadius: 2,
                            border: '1px solid #e0e0e0'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <LocationOn sx={{ color: '#8B4513', mr: 1, fontSize: 28 }} />
                            <Typography variant="h6" sx={{ color: '#8B4513', fontWeight: 'bold' }}>
                              {location.name}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                            <strong>{location.address.split(',')[0]}</strong><br/>
                            {location.address.split(',').slice(1).join(',')}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                            <Button 
                              variant="contained" 
                              startIcon={<Phone />} 
                              sx={{ 
                                bgcolor: '#8B4513',
                                '&:hover': { bgcolor: '#A0522D' },
                                borderRadius: 2
                              }}
                              href={`tel:${location.phone}`}
                            >
                              Call Now
                            </Button>

                            <Button 
                              variant="text" 
                              sx={{ 
                                color: '#8B4513',
                                borderRadius: 2,
                                '&:hover': { bgcolor: '#f5f5f5' }
                              }}
                              onClick={() => {
                                navigator.clipboard.writeText(location.address);
                                alert('Address copied to clipboard!');
                              }}
                            >
                              Copy Address
                            </Button>
                          </Box>
                        </Card>

                        <Accordion 
                          elevation={2}
                          sx={{ 
                            borderRadius: 2,
                            '&:before': { display: 'none' },
                            border: '1px solid #e0e0e0',
                            mb: 3
                          }}
                        >
                          <AccordionSummary 
                            expandIcon={<ExpandMore sx={{ color: '#8B4513' }} />}
                            sx={{ 
                              bgcolor: '#f8f9fa',
                              '&:hover': { bgcolor: '#f0f0f0' }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Schedule sx={{ color: '#8B4513', mr: 1 }} />
                              <Typography variant="h6" sx={{ color: '#8B4513', fontWeight: 'bold' }}>
                                Opening Hours
                              </Typography>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails sx={{ p: 3 }}>
                            <Grid container spacing={2}>
                              {Object.entries(location.hours).map(([day, hours]) => (
                                <Grid item xs={6} key={day}>
                                  <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>{day}:</strong><br/>
                                    {hours}
                                  </Typography>
                                </Grid>
                              ))}
                            </Grid>
                            <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic', mt: 2, display: 'block' }}>
                              * All times in GMT+7 (ICT) • Closed on major holidays
                            </Typography>
                          </AccordionDetails>
                        </Accordion>

                        <Box>
                          <Typography variant="h6" sx={{ mb: 2, color: '#8B4513', fontWeight: 'bold' }}>
                            ✨ Amenities & Features
                          </Typography>
                          <Grid container spacing={1}>
                            {location.amenities.map((amenity) => (
                              <Grid item xs={6} key={amenity}>
                                <Chip 
                                  icon={amenityIcons[amenity]} 
                                  label={amenity.replace('-', ' ')} 
                                  variant="outlined"
                                  sx={{ 
                                    width: '100%',
                                    borderColor: '#8B4513',
                                    color: '#8B4513',
                                    '&:hover': { bgcolor: '#f5f5f5' }
                                  }} 
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 4 }}>
                    <Card 
                      elevation={3}
                      sx={{ 
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: '1px solid #e0e0e0'
                      }}
                    >
                      <Box sx={{ 
                        bgcolor: '#8B4513',
                        color: 'white',
                        p: 2,
                        textAlign: 'center'
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          🗺️ Find Us on the Map
                        </Typography>
                      </Box>
                      
                      <Box sx={{ position: 'relative' }}>
                        <MapEmbed />
                      </Box>
                    </Card>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Contact Form */}
        <Paper 
          elevation={8} 
          sx={{ 
            mt: 6,
            borderRadius: 4,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid rgba(139, 69, 19, 0.1)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #8B4513, #CD853F, #F4A460)',
              zIndex: 1
            }
          }}
        >
          <Box sx={{ 
            background: 'linear-gradient(135deg, #2C1810 0%, #8B4513 50%, #A0522D 100%)',
            color: 'white',
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
              animation: 'rotate 60s linear infinite',
              zIndex: 0
            },
            '@keyframes rotate': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography 
                variant="h3" 
                gutterBottom 
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  background: 'linear-gradient(45deg, #ffffff 30%, #f5f5dc 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  mb: 2
                }}
              >
                💬 Get in Touch
              </Typography>
              <Box
                sx={{
                  width: '60px',
                  height: '3px',
                  background: 'linear-gradient(90deg, #CD853F, #F4A460)',
                  mx: 'auto',
                  mb: 3,
                  borderRadius: '2px'
                }}
              />
              <Typography 
                variant="h6" 
                sx={{ 
                  opacity: 0.95,
                  fontWeight: 300,
                  maxWidth: '600px',
                  mx: 'auto',
                  lineHeight: 1.6,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}
              >
                We'd love to hear from you. Choose your topic and we'll respond promptly.
              </Typography>
            </Box>
          </Box>
          
          <CardContent sx={{ 
            p: { xs: 4, md: 6 },
            background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #8B4513, transparent)',
              opacity: 0.3
            }
          }}>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Common Fields */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name *"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.fullName && !!errors.fullName}
                    helperText={touched.fullName && errors.fullName}
                    inputProps={{ 'aria-label': 'Full Name' }}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '& fieldset': {
                          borderColor: 'rgba(139, 69, 19, 0.2)',
                          borderWidth: '2px'
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(139, 69, 19, 0.15)',
                          '& fieldset': {
                            borderColor: '#8B4513',
                            borderWidth: '2px'
                          }
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 35px rgba(139, 69, 19, 0.2)',
                          '& fieldset': {
                            borderColor: '#8B4513',
                            borderWidth: '2px',
                            boxShadow: '0 0 0 3px rgba(139, 69, 19, 0.1)'
                          }
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(139, 69, 19, 0.7)',
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: '#8B4513',
                          fontWeight: 600
                        }
                      },
                      '& .MuiInputBase-input': {
                        fontWeight: 500,
                        color: '#2C1810'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                    inputProps={{ 'aria-label': 'Email Address' }}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '& fieldset': {
                          borderColor: 'rgba(139, 69, 19, 0.2)',
                          borderWidth: '2px'
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(139, 69, 19, 0.15)',
                          '& fieldset': {
                            borderColor: '#8B4513',
                            borderWidth: '2px'
                          }
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 35px rgba(139, 69, 19, 0.2)',
                          '& fieldset': {
                            borderColor: '#8B4513',
                            borderWidth: '2px',
                            boxShadow: '0 0 0 3px rgba(139, 69, 19, 0.1)'
                          }
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(139, 69, 19, 0.7)',
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: '#8B4513',
                          fontWeight: 600
                        }
                      },
                      '& .MuiInputBase-input': {
                        fontWeight: 500,
                        color: '#2C1810'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number *"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.phone && !!errors.phone}
                    helperText={touched.phone && errors.phone}
                    inputProps={{ 'aria-label': 'Phone Number' }}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#8B4513',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#8B4513',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#8B4513',
                      },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl 
                    fullWidth 
                    error={touched.topic && !!errors.topic}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#8B4513',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#8B4513',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#8B4513',
                      },
                    }}
                  >
                    <InputLabel>Topic *</InputLabel>
                    <Select
                      name="topic"
                      value={formData.topic}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label="Topic *"
                      aria-label="Select Topic"
                    >
                      {topics.map((topic) => (
                        <MenuItem key={topic.value} value={topic.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {topic.icon}
                            {topic.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.topic && errors.topic && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                        {errors.topic}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {/* Topic-specific fields */}
                {renderTopicSpecificFields()}
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message *"
                    name="message"
                    multiline
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.message && !!errors.message}
                    helperText={touched.message && errors.message || 'Minimum 20 characters'}
                    inputProps={{ 'aria-label': 'Message', minLength: 20 }}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#8B4513',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#8B4513',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#8B4513',
                      },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <input
                      accept="image/jpeg,image/png,application/pdf"
                      style={{ display: 'none' }}
                      id="file-upload"
                      multiple
                      type="file"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="file-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<AttachFile />}
                        sx={{
                          borderRadius: 2,
                          borderColor: '#8B4513',
                          color: '#8B4513',
                          '&:hover': {
                            borderColor: '#A0522D',
                            bgcolor: 'rgba(139, 69, 19, 0.04)',
                          },
                        }}
                      >
                        Attach Files
                      </Button>
                    </label>
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                      JPG, PNG, PDF files up to 5MB each
                    </Typography>
                  </Box>
                  
                  {attachments.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {attachments.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() => removeAttachment(index)}
                          deleteIcon={<Close />}
                          variant="outlined"
                          sx={{
                            borderRadius: 2,
                            borderColor: '#8B4513',
                            color: '#8B4513',
                            '& .MuiChip-deleteIcon': {
                              color: '#8B4513',
                              '&:hover': {
                                color: '#A0522D',
                              },
                            },
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="consent"
                        checked={formData.consent}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        sx={{
                          color: '#8B4513',
                          '&.Mui-checked': {
                            color: '#8B4513',
                          },
                          '&:hover': {
                            bgcolor: 'rgba(139, 69, 19, 0.04)',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        I agree to the processing of my personal data for the purpose of responding to my inquiry. *
                      </Typography>
                    }
                    sx={{ mt: 1 }}
                  />
                  {touched.consent && errors.consent && (
                    <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
                      {errors.consent}
                    </Typography>
                  )}
                </Grid>
                
                {formData.topic && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      <Typography variant="body2">
                        <strong>Expected response time:</strong> {slaInfo[formData.topic]?.time}
                      </Typography>
                    </Alert>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                      sx={{ 
                        minWidth: 280,
                        py: 2,
                        px: 6,
                        borderRadius: 4,
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #CD853F 100%)',
                        boxShadow: '0 8px 32px rgba(139, 69, 19, 0.3)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          transition: 'left 0.5s ease'
                        },
                        '&:hover': {
                          background: 'linear-gradient(135deg, #A0522D 0%, #CD853F 50%, #DEB887 100%)',
                          transform: 'translateY(-3px) scale(1.02)',
                          boxShadow: '0 15px 40px rgba(139, 69, 19, 0.4)',
                          '&::before': {
                            left: '100%'
                          }
                        },
                        '&:active': {
                          transform: 'translateY(-1px) scale(1.01)',
                          boxShadow: '0 8px 25px rgba(139, 69, 19, 0.3)'
                        },
                        '&:disabled': {
                          background: 'linear-gradient(135deg, #ccc 0%, #999 100%)',
                          transform: 'none',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                        },
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {loading ? 'Sending Message...' : 'Send Message'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Paper>
      </Container>

      {/* FAQ Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f0f0f0 100%)',
        py: 8,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(139, 69, 19, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(205, 133, 63, 0.03) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 800,
                fontSize: { xs: '2rem', md: '2.5rem' },
                background: 'linear-gradient(135deg, #8B4513 0%, #CD853F 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              Frequently Asked Questions
            </Typography>
            <Box
              sx={{
                width: '80px',
                height: '4px',
                background: 'linear-gradient(90deg, #8B4513, #CD853F)',
                mx: 'auto',
                mb: 3,
                borderRadius: '2px'
              }}
            />
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(44, 24, 16, 0.7)',
                fontWeight: 400,
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              Find quick answers to common questions about our services
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Accordion sx={{ 
                mb: 3, 
                borderRadius: 3, 
                '&:before': { display: 'none' },
                boxShadow: '0 4px 20px rgba(139, 69, 19, 0.1)',
                border: '1px solid rgba(139, 69, 19, 0.1)',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 30px rgba(139, 69, 19, 0.15)'
                }
              }}>
                <AccordionSummary 
                  expandIcon={<ExpandMore sx={{ color: '#8B4513' }} />} 
                  sx={{ 
                    background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.08) 0%, rgba(205, 133, 63, 0.05) 100%)',
                    borderBottom: '1px solid rgba(139, 69, 19, 0.1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.12) 0%, rgba(205, 133, 63, 0.08) 100%)'
                    },
                    '&.Mui-expanded': {
                      background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.15) 0%, rgba(205, 133, 63, 0.1) 100%)'
                    }
                  }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HelpOutline color="primary" />
                    What are your opening hours?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    We're open Monday-Friday 6:00 AM - 8:00 PM, and weekends 7:00 AM - 7:00 PM. Our kitchen closes 30 minutes before closing time.
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              <Accordion sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'rgba(139, 69, 19, 0.05)' }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingCart color="primary" />
                    How can I track my order?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    You can track your order using the "Track Order" button above, or call us directly. You'll receive SMS updates for online orders.
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              <Accordion sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'rgba(139, 69, 19, 0.05)' }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalParking color="primary" />
                    Is parking available?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Yes! We offer free parking for customers. We have 20 spots available, including 2 accessible parking spaces.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Accordion sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'rgba(139, 69, 19, 0.05)' }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Event color="primary" />
                    Can I book events here?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Absolutely! We host private events, meetings, and celebrations. Contact us at least 48 hours in advance for bookings.
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              <Accordion sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'rgba(139, 69, 19, 0.05)' }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Wifi color="primary" />
                    Do you have WiFi?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Yes! We provide free high-speed WiFi for all customers. Perfect for remote work, studying, or casual browsing.
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              <Accordion sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'rgba(139, 69, 19, 0.05)' }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Business color="primary" />
                    Do you offer wholesale services?
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Yes! We supply coffee beans and catering services to businesses. Contact our wholesale team for pricing and minimum orders.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Customer Testimonials */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold', color: '#8B4513' }}>
          What Our Customers Say
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} sx={{ color: '#FFD700', fontSize: '1.5rem' }} />
                  ))}
                </Box>
                <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                  "Best coffee in the city! The atmosphere is perfect for work meetings and the staff is incredibly friendly."
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                  Sarah Chen
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Regular Customer
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} sx={{ color: '#FFD700', fontSize: '1.5rem' }} />
                  ))}
                </Box>
                <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                  "Amazing pastries and excellent service! I've hosted three business meetings here and clients always love it."
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                  Michael Rodriguez
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Business Owner
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} sx={{ color: '#FFD700', fontSize: '1.5rem' }} />
                  ))}
                </Box>
                <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                  "The perfect study spot! Great WiFi, comfortable seating, and the best latte art I've ever seen."
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                  Emma Thompson
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  University Student
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Social Media & Connect Section */}
      <Box sx={{ bgcolor: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
            Stay Connected
          </Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Group />
                Follow Us on Social Media
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                Stay updated with our latest coffee blends, events, and special offers. Join our community of coffee lovers!
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<Facebook />}
                  href="https://facebook.com/webcaffe"
                  target="_blank"
                  sx={{ color: 'white', borderColor: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  Facebook
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Instagram />}
                  href="https://instagram.com/webcaffe"
                  target="_blank"
                  sx={{ color: 'white', borderColor: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  Instagram
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Twitter />}
                  href="https://twitter.com/webcaffe"
                  target="_blank"
                  sx={{ color: 'white', borderColor: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  Twitter
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Support />
                Need Immediate Help?
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                Our customer support team is here to help you with any questions or concerns.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Phone />}
                  href="tel:+842812345678"
                  sx={{ bgcolor: 'white', color: '#8B4513', '&:hover': { bgcolor: '#f5f5f5' } }}
                >
                  Call Now
                </Button>
                <Button
                  variant="contained"
                  startIcon={<WhatsApp />}
                  href="https://wa.me/842812345678"
                  target="_blank"
                  sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}
                >
                  WhatsApp
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Chat />}
                  sx={{ bgcolor: 'white', color: '#8B4513', '&:hover': { bgcolor: '#f5f5f5' } }}
                >
                  Live Chat
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Additional Info Cards */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', p: 3, borderRadius: 3, boxShadow: 2, height: '100%' }}>
              <LocalCafe sx={{ fontSize: '3rem', color: '#8B4513', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#8B4513' }}>
                Premium Coffee
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We source our beans directly from farmers and roast them fresh daily to ensure the perfect cup every time.
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', p: 3, borderRadius: 3, boxShadow: 2, height: '100%' }}>
              <Favorite sx={{ fontSize: '3rem', color: '#8B4513', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#8B4513' }}>
                Community Focused
              </Typography>
              <Typography variant="body2" color="text.secondary">
                More than just a coffee shop - we're a community hub where people connect, work, and create memories.
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', p: 3, borderRadius: 3, boxShadow: 2, height: '100%' }}>
              <Support sx={{ fontSize: '3rem', color: '#8B4513', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#8B4513' }}>
                Exceptional Service
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Our trained baristas and friendly staff are committed to providing you with an outstanding experience every visit.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Track Order Dialog */}
      <Dialog open={trackOrderDialog} onClose={() => setTrackOrderDialog(false)}>
        <DialogTitle>Track Your Order</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Order ID"
            fullWidth
            variant="outlined"
            value={trackOrderId}
            onChange={(e) => setTrackOrderId(e.target.value)}
            placeholder="e.g., WC-123456"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrackOrderDialog(false)}>Cancel</Button>
          <Button onClick={handleTrackOrder} variant="contained">Track</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Contact;