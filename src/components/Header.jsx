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
  ListItemIcon,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  ShoppingCart,
  Coffee,
  Logout,
  Person,
  History,
  AdminPanelSettings,
  Menu as MenuIcon,
  Close
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const handleCartClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/cart');
    }
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: '#8B4513',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
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
          sx={{ 
            flexGrow: 1, 
            fontWeight: 'bold',
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}
        >
          WebCaffe
        </Typography>
        
        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
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
            onClick={handleCartClick}
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
                sx={{ display: { xs: 'none', md: 'flex' } }}
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
                sx={{ textTransform: 'none', display: { xs: 'none', md: 'inline-flex' } }}
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
                  display: { xs: 'none', md: 'inline-flex' },
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
        
        {/* Mobile Menu Button */}
        <IconButton
          color="inherit"
          onClick={() => setMobileMenuOpen(true)}
          sx={{ display: { xs: 'flex', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        {/* Mobile Drawer */}
        <Drawer
          anchor="right"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          <Box sx={{ width: 250, pt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#8B4513' }}>
                WebCaffe
              </Typography>
              <IconButton onClick={() => setMobileMenuOpen(false)}>
                <Close />
              </IconButton>
            </Box>
            <Divider />
            <List>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/" onClick={() => setMobileMenuOpen(false)}>
                  <ListItemText primary="Home" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/menu" onClick={() => setMobileMenuOpen(false)}>
                  <ListItemText primary="Menu" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/about" onClick={() => setMobileMenuOpen(false)}>
                  <ListItemText primary="About" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/contact" onClick={() => setMobileMenuOpen(false)}>
                  <ListItemText primary="Contact" />
                </ListItemButton>
              </ListItem>
              <Divider sx={{ my: 1 }} />
              {isAuthenticated ? (
                <>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => { handleMenuItemClick('/profile'); setMobileMenuOpen(false); }}>
                      <ListItemIcon><Person /></ListItemIcon>
                      <ListItemText primary="Profile" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => { handleMenuItemClick('/orders'); setMobileMenuOpen(false); }}>
                      <ListItemIcon><History /></ListItemIcon>
                      <ListItemText primary="Order History" />
                    </ListItemButton>
                  </ListItem>
                  {user?.role === 'admin' && (
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => { handleMenuItemClick('/admin'); setMobileMenuOpen(false); }}>
                        <ListItemIcon><AdminPanelSettings /></ListItemIcon>
                        <ListItemText primary="Admin Dashboard" />
                      </ListItemButton>
                    </ListItem>
                  )}
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                      <ListItemIcon><Logout /></ListItemIcon>
                      <ListItemText primary="Logout" />
                    </ListItemButton>
                  </ListItem>
                </>
              ) : (
                <>
                  <ListItem disablePadding>
                    <ListItemButton component={Link} to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <ListItemText primary="Login" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton component={Link} to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <ListItemText primary="Sign Up" />
                    </ListItemButton>
                  </ListItem>
                </>
              )}
            </List>
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

export default Header;