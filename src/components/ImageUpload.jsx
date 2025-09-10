import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Card,
  CardMedia,
  CardActions
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Image as ImageIcon
} from '@mui/icons-material';
import axios from 'axios';

const ImageUpload = ({ 
  value, 
  onChange, 
  error, 
  helperText, 
  disabled = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
}) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5004';
  
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [preview, setPreview] = useState(() => {
    if (!value) return '';
    if (typeof value === 'object' && value.imageUrl) {
      return value.imageUrl;
    }
    if (typeof value === 'string' && value.startsWith('http')) {
      return value;
    }
    if (typeof value === 'string' && value.startsWith('/uploads/')) {
      return `${API_BASE_URL}${value}`;
    }
    return value;
  });
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setUploadError(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
      return;
    }

    setUploadError('');
    uploadFile(file);
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setUploadError('');

    try {
      console.log('Starting upload for file:', file.name, 'Size:', file.size, 'Type:', file.type);
      console.log('API_BASE_URL:', API_BASE_URL);
      
      const formData = new FormData();
      formData.append('image', file);

      console.log('FormData created, making request to:', `${API_BASE_URL}/api/upload/image`);
      
      const response = await axios.post(`${API_BASE_URL}/api/upload/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', response.data);
      
      if (response.data.success) {
        const { imageUrl, imagePublicId } = response.data.data;
        console.log('Upload successful, setting preview to:', imageUrl);
        setPreview(imageUrl);
        onChange({ imageUrl, imagePublicId }); // Store Cloudinary data
      } else {
        console.error('Upload failed - server returned success: false');
        setUploadError('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      setUploadError(
        error.response?.data?.message || 
        'Failed to upload image. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    // Handle Cloudinary images
    if (value && typeof value === 'object' && value.imagePublicId) {
      try {
        await axios.delete(`${API_BASE_URL}/api/upload/image/${value.imagePublicId}`);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    // Handle legacy local images
    else if (value && typeof value === 'string' && value.startsWith('/uploads/')) {
      try {
        const filename = value.split('/').pop();
        await axios.delete(`${API_BASE_URL}/api/upload/image/${filename}`);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={acceptedTypes.join(',')}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />
      
      {preview ? (
        <Card sx={{ maxWidth: 300, mb: 2 }}>
          <CardMedia
            component="img"
            height="200"
            image={getImageUrl(preview)}
            alt="Product preview"
            sx={{ objectFit: 'cover' }}
          />
          <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Current Image
            </Typography>
            <IconButton
              onClick={handleRemoveImage}
              disabled={disabled || uploading}
              color="error"
              size="small"
            >
              <Delete />
            </IconButton>
          </CardActions>
        </Card>
      ) : (
        <Box
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            backgroundColor: '#fafafa',
            cursor: disabled || uploading ? 'not-allowed' : 'pointer',
            '&:hover': {
              borderColor: disabled || uploading ? '#ccc' : '#8B4513',
              backgroundColor: disabled || uploading ? '#fafafa' : '#f5f5f5'
            }
          }}
          onClick={!disabled && !uploading ? handleButtonClick : undefined}
        >
          <ImageIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Click to upload product image
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supports: JPEG, PNG, GIF, WebP (Max {Math.round(maxSize / (1024 * 1024))}MB)
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={uploading ? <CircularProgress size={16} /> : <CloudUpload />}
          onClick={handleButtonClick}
          disabled={disabled || uploading}
          sx={{
            color: '#8B4513',
            borderColor: '#8B4513',
            '&:hover': {
              borderColor: '#8B4513',
              backgroundColor: 'rgba(139, 69, 19, 0.04)'
            }
          }}
        >
          {uploading ? 'Uploading...' : preview ? 'Change Image' : 'Upload Image'}
        </Button>
        
        {preview && (
          <Button
            variant="text"
            startIcon={<Delete />}
            onClick={handleRemoveImage}
            disabled={disabled || uploading}
            color="error"
            size="small"
          >
            Remove
          </Button>
        )}
      </Box>

      {(uploadError || error) && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {uploadError || error}
        </Alert>
      )}
      
      {helperText && !uploadError && !error && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default ImageUpload;