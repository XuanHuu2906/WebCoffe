import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import { ProductProvider } from './contexts/ProductContext.jsx';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';
import Profile from './pages/Profile.jsx';
import Cart from './pages/Cart.jsx';
import Orders from './pages/Orders.jsx';
import Admin from './pages/Admin.jsx';
import MoMoReturn from './pages/MoMoReturn.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import './App.css';

// Create a custom theme for the coffee shop
const theme = createTheme({
  palette: {
    primary: {
      main: '#8B4513', // Coffee brown
    },
    secondary: {
      main: '#D2691E', // Chocolate
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                  <Route path="/momo/return" element={<MoMoReturn />} />
                </Routes>
              </Layout>
            </Router>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
