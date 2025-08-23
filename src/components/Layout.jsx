import React from 'react';
import { Box } from '@mui/material';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

const Layout = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}
    >
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;