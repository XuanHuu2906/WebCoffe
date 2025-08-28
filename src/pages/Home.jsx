import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const featuredItems = [
    {
      id: 1,
      name: 'Espresso',
      description: 'Rich and bold espresso shot',
      price: '3.50 VNĐ',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOEI0NTEzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Fc3ByZXNzbzwvdGV4dD48L3N2Zz4='
    },
    {
      id: 2,
      name: 'Cappuccino',
      description: 'Creamy cappuccino with perfect foam',
      price: '4.25 VNĐ',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjQTA1MjJEIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DYXBwdWNjaW5vPC90ZXh0Pjwvc3ZnPg=='
    },
    {
      id: 3,
      name: 'Croissant',
      description: 'Fresh buttery croissant',
      price: '2.75 VNĐ',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRDA5MzQyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Dcm9pc3NhbnQ8L3RleHQ+PC9zdmc+'
    }
  ];

  return (
    <Box>
      {/* Hero Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #D2691E 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '60vh',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }
            }}
          >
            Welcome to WebCaffe
          </Typography>
          <Typography
            variant="h5"
            component="p"
            gutterBottom
            sx={{ 
              mb: 4, 
              opacity: 0.9,
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
            }}
          >
            Experience the finest coffee and pastries in a cozy atmosphere
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/menu')}
            sx={{
              backgroundColor: '#8B4513',
              '&:hover': {
                backgroundColor: '#A0522D'
              },
              px: 4,
              py: 1.5,
              fontSize: '1.1rem'
            }}
          >
            View Our Menu
          </Button>
        </Container>
      </Box>

      {/* About Section */}
      <Container sx={{ py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 'bold', color: '#8B4513' }}
            >
              About WebCaffe
            </Typography>
            <Typography
              variant="body1"
              paragraph
              sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}
            >
              At WebCaffe, we're passionate about serving exceptional coffee and creating
              memorable experiences. Our skilled baristas craft each cup with care,
              using only the finest beans sourced from sustainable farms around the world.
            </Typography>
            <Typography
              variant="body1"
              paragraph
              sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}
            >
              Whether you're looking for your morning pick-me-up, a place to work,
              or a cozy spot to catch up with friends, WebCaffe is your perfect destination.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                width: '100%',
                height: '400px',
                borderRadius: 2,
                boxShadow: 3,
                background: 'linear-gradient(45deg, #8B4513 30%, #A0522D 90%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}
            >
              WebCaffe Interior
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Featured Items */}
      <Box sx={{ backgroundColor: '#F5F5F5', py: 8 }}>
        <Container>
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{ 
              fontWeight: 'bold', 
              color: '#8B4513', 
              mb: 6,
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' }
            }}
          >
            Featured Items
          </Typography>
          <Grid container spacing={4}>
          {featuredItems.map((item) => (
            <Grid item xs={12} sm={6} lg={4} key={item.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.image}
                    alt={item.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="h3"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ mt: 2, fontWeight: 'bold', color: '#8B4513' }}
                    >
                      {item.price}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      sx={{
                        backgroundColor: '#8B4513',
                        '&:hover': {
                          backgroundColor: '#A0522D'
                        }
                      }}
                    >
                      Order Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;