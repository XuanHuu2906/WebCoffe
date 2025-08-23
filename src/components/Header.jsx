import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon
} from '@mui/material';
import {
  ShoppingCart,
  Coffee,
  Logout,
  Person,
  History,
  AdminPanelSettings
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/');
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    handleUserMenuClose();
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#8B4513' }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="logo"
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          <Coffee fontSize="large" />
        </IconButton>
        
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 'bold' }}
        >
          WebCaffe
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            color="inherit"
            component={Link}
            to="/"
            sx={{ textTransform: 'none' }}
          >
            Home
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/menu"
            sx={{ textTransform: 'none' }}
          >
            Menu
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/about"
            sx={{ textTransform: 'none' }}
          >
            About
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/contact"
            sx={{ textTransform: 'none' }}
          >
            Contact
          </Button>
          
          <IconButton
            color="inherit"
            component={Link}
            to="/cart"
            aria-label="shopping cart"
          >
            <Badge badgeContent={itemCount} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>

          {isAuthenticated ? (
            <>
              <IconButton
                color="inherit"
                onClick={handleUserMenuOpen}
                aria-label="user menu"
              >
                <Avatar
                  sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
                >
                  {user?.firstName?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                onClick={handleUserMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => handleMenuItemClick('/profile')}>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={() => handleMenuItemClick('/orders')}>
                  <ListItemIcon>
                    <History fontSize="small" />
                  </ListItemIcon>
                  Order History
                </MenuItem>
                {user?.role === 'admin' && (
                  <MenuItem onClick={() => handleMenuItemClick('/admin')}>
                    <ListItemIcon>
                      <AdminPanelSettings fontSize="small" />
                    </ListItemIcon>
                    Admin Dashboard
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/login"
                sx={{ textTransform: 'none' }}
              >
                Login
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/register"
                variant="outlined"
                sx={{ 
                  textTransform: 'none',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;