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
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              DREAM COFFEE
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
             Quán cà phê yêu thích của bạn phục vụ cà phê và bánh ngọt ngon nhất trong không gian ấm cúng. Hãy đến và thưởng thức đồ uống làm thủ công của chúng tôi.
            </Typography>
            <Box>
              <IconButton 
                color="inherit" 
                aria-label="Facebook" 
                component="a" 
                href="https://www.facebook.com/profile.php?id=61563937649575" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Facebook />
              </IconButton>
              <IconButton 
                color="inherit" 
                aria-label="Instagram" 
                component="a" 
                href="https://www.instagram.com/dream_coffee97/?hl=en" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Instagram />
              </IconButton>
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
                  97 Man Thiện, Hiệp Phú, Thủ Đức, Hồ Chí Minh
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" />
                <Typography variant="body2">
                  0837055076
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" />
                <Typography variant="body2">
                  dreamcoffee@gmail.com
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
            © 2025 Dream Coffee. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;