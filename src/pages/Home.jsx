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
      price: '$3.50',
      image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=300&h=200&fit=crop'
    },
    {
      id: 2,
      name: 'Cappuccino',
      description: 'Creamy cappuccino with perfect foam',
      price: '$4.25',
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&h=200&fit=crop'
    },
    {
      id: 3,
      name: 'Croissant',
      description: 'Fresh buttery croissant',
      price: '$2.75',
      image: 'https://images.unsplash.com/photo-1555507036-ab794f4afe5a?w=300&h=200&fit=crop'
    }
  ];

  return (
    <Box>
      {/* Hero Banner */}
      <Box
        sx={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&h=600&fit=crop)',
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
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            Welcome to WebCaffe
          </Typography>
          <Typography
            variant="h5"
            component="p"
            gutterBottom
            sx={{ mb: 4, opacity: 0.9 }}
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
              component="img"
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&h=400&fit=crop"
              alt="Coffee shop interior"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 2,
                boxShadow: 3
              }}
            />
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
            sx={{ fontWeight: 'bold', color: '#8B4513', mb: 6 }}
          >
            Featured Items
          </Typography>
          <Grid container spacing={4}>
            {featuredItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
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