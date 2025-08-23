import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton
} from '@mui/material';
import {
  Facebook,
  Instagram,
  Twitter,
  LocationOn,
  Phone,
  Email
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#2E1A0F',
        color: 'white',
        py: 4,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              WebCaffe
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Your favorite coffee shop serving the finest coffee and pastries
              in a cozy atmosphere. Come and enjoy our handcrafted beverages.
            </Typography>
            <Box>
              <IconButton color="inherit" aria-label="Facebook">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter">
                <Twitter />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" underline="hover">
                Home
              </Link>
              <Link href="/menu" color="inherit" underline="hover">
                Menu
              </Link>
              <Link href="/about" color="inherit" underline="hover">
                About Us
              </Link>
              <Link href="/contact" color="inherit" underline="hover">
                Contact
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" />
                <Typography variant="body2">
                  123 Coffee Street, City, State 12345
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" />
                <Typography variant="body2">
                  (555) 123-4567
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" />
                <Typography variant="body2">
                  info@webcaffe.com
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Box
          sx={{
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            mt: 4,
            pt: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="body2">
            © 2024 WebCaffe. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;