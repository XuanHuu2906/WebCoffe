import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Avatar,
  Paper,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  IconButton
} from '@mui/material';
// Removed @mui/lab Timeline components due to dependency conflicts
import {
  Coffee,
  LocationOn,
  Star,
  ExpandMore,
  Phone,
  Email,
  Facebook,
  Instagram,
  Twitter,
  Nature,
  Group,
  EmojiEvents,
  LocalShipping,
  Schedule
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  // Sample data - in a real app, this would come from a CMS or API
  const milestones = [
    { year: '2018', title: 'WebCaffe Founded', description: 'Started as a small neighborhood café with big dreams' },
    { year: '2019', title: 'First Roastery', description: 'Opened our own roasting facility for fresh, local coffee' },
    { year: '2020', title: 'Online Expansion', description: 'Launched e-commerce platform during pandemic' },
    { year: '2021', title: 'Community Hub', description: 'Became a certified community gathering space' },
    { year: '2022', title: 'Sustainability Award', description: 'Recognized for environmental initiatives' },
    { year: '2023', title: 'Second Location', description: 'Opened our downtown flagship store' }
  ];

  const coreValues = [
    'Quality Excellence',
    'Fair Trade',
    'Sustainability',
    'Community Focus',
    'Transparency',
    'Innovation'
  ];

  const origins = [
    {
      country: 'Ethiopia',
      region: 'Yirgacheffe',
      variety: 'Heirloom Arabica',
      processing: 'Washed',
      notes: 'Floral, citrus, tea-like',
      image: '/images/ethiopia-beans.jpg'
    },
    {
      country: 'Colombia',
      region: 'Huila',
      variety: 'Caturra, Castillo',
      processing: 'Honey',
      notes: 'Chocolate, caramel, nuts',
      image: '/images/colombia-beans.jpg'
    },
    {
      country: 'Vietnam',
      region: 'Da Lat',
      variety: 'Arabica, Robusta',
      processing: 'Natural',
      notes: 'Bold, earthy, full-body',
      image: '/images/vietnam-beans.jpg'
    }
  ];

  const signatureDrinks = [
    {
      name: 'WebCaffe Signature Blend',
      description: 'Our house blend combining Ethiopian and Colombian beans',
      notes: 'Balanced, smooth, chocolate undertones'
    },
    {
      name: 'Vietnamese Iced Coffee',
      description: 'Traditional ca phe sua da with our premium Robusta',
      notes: 'Strong, sweet, refreshing'
    },
    {
      name: 'Single Origin Pour Over',
      description: 'Rotating selection of premium single-origin coffees',
      notes: 'Varies by origin, always exceptional'
    },
    {
      name: 'Cold Brew Concentrate',
      description: '24-hour cold extraction for smooth, low-acid coffee',
      notes: 'Smooth, concentrated, versatile'
    }
  ];

  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & Head Roaster',
      image: '/images/team-sarah.jpg',
      bio: 'Coffee enthusiast with 15+ years in specialty coffee'
    },
    {
      name: 'Mike Chen',
      role: 'Lead Barista',
      image: '/images/team-mike.jpg',
      bio: 'Latte art champion and coffee education specialist'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Sustainability Manager',
      image: '/images/team-emma.jpg',
      bio: 'Environmental scientist passionate about ethical sourcing'
    }
  ];

  const faqs = [
    {
      question: 'What makes WebCaffe different from other coffee shops?',
      answer: 'We focus on complete transparency in our sourcing, sustainable practices, and building genuine community connections. Every cup tells the story of the farmers who grew it.'
    },
    {
      question: 'Do you offer coffee subscriptions?',
      answer: 'Yes! We offer flexible subscription plans with freshly roasted beans delivered to your door. You can customize frequency, grind size, and bean selection.'
    },
    {
      question: 'Are your beans organic and fair trade?',
      answer: 'We work directly with farmers who use sustainable practices. While not all our beans are certified organic, we prioritize environmental responsibility and fair compensation for farmers.'
    },
    {
      question: 'Do you provide barista training?',
      answer: 'Absolutely! We offer public workshops and private training sessions for individuals and businesses. Our certified baristas teach everything from basic brewing to advanced latte art.'
    },
    {
      question: 'Can I host events at WebCaffe?',
      answer: 'Yes, we love hosting community events! We have space for book clubs, business meetings, and private parties. Contact us to discuss your event needs.'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("/images/coffee-hero-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              mb: 3,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }
            }}
          >
            Crafting Community Through Coffee
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 4, 
              maxWidth: '600px', 
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
            }}
          >
            Where exceptional beans meet passionate craftsmanship to create unforgettable coffee experiences
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/menu')}
              sx={{ minWidth: 150 }}
            >
              View Menu
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ minWidth: 150, color: 'white', borderColor: 'white' }}
              onClick={() => navigate('/contact')}
            >
              Get Directions
            </Button>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Rating value={4.8} precision={0.1} readOnly sx={{ color: '#ffd700' }} />
            <Typography variant="body1">
              4.8/5 from 1,200+ guests
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Brand Story Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Our Story
        </Typography>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom color="primary">
              The WebCaffe Journey
            </Typography>
            <Typography variant="body1" paragraph>
              WebCaffe was born from a simple belief: that great coffee has the power to bring people together. 
              Founded in 2018 by coffee enthusiast Sarah Johnson, our name reflects our commitment to connecting 
              the global coffee community through technology and tradition.
            </Typography>
            <Typography variant="body1" paragraph>
              What started as a small neighborhood café has grown into a beloved community hub, but our core 
              philosophy remains unchanged: bold flavors, clean processes, fair trade, and hand-crafted excellence 
              in every cup.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Avatar
                src="/images/founder-sarah.jpg"
                alt="Sarah Johnson, Founder"
                sx={{ width: 80, height: 80, mb: 2 }}
              />
              <Typography variant="h6">Sarah Johnson</Typography>
              <Typography variant="body2" color="text.secondary">
                "Every cup tells a story of the farmers who grew it, the hands that processed it, 
                and the community that enjoys it together."
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ pl: 2 }}>
              {milestones.map((milestone, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 3, alignItems: 'flex-start' }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: 'primary.main', 
                    mt: 0.5, 
                    mr: 2,
                    flexShrink: 0
                  }} />
                  <Box>
                    <Typography variant="h6" color="primary">
                      {milestone.year}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {milestone.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {milestone.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Mission, Vision & Values Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Our Purpose
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <Coffee sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Mission
                </Typography>
                <Typography variant="body1">
                  To create exceptional coffee experiences that connect our community while supporting 
                  sustainable farming practices and fair trade relationships worldwide.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <Star sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Vision
                </Typography>
                <Typography variant="body1">
                  To become the leading specialty coffee destination that sets the standard for 
                  quality, sustainability, and community engagement in the coffee industry.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <Group sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Values
                </Typography>
                <Box sx={{ textAlign: 'left' }}>
                  {coreValues.map((value, index) => (
                    <Chip key={index} label={value} sx={{ m: 0.5 }} color="primary" variant="outlined" />
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>

          {/* Quality Pledge */}
          <Paper sx={{ mt: 6, p: 4, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h5" gutterBottom>
              Our Quality Pledge
            </Typography>
            <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
              "We promise to source only the finest beans, roast them to perfection, and serve them 
              with the care and attention they deserve. Every cup represents our commitment to excellence."
            </Typography>
            <Typography variant="body2">
              — Sarah Johnson, Founder & Head Roaster
            </Typography>
          </Paper>
        </Container>
      </Box>

      {/* Bean Sourcing & Transparency Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Bean Sourcing & Transparency
        </Typography>
        <Typography variant="body1" textAlign="center" sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}>
          We believe in complete transparency about our coffee sources. Every bean is carefully selected 
          from trusted farms that share our commitment to quality and sustainability.
        </Typography>
        
        <Grid container spacing={4}>
          {origins.map((origin, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={origin.image}
                  alt={`${origin.country} coffee beans`}
                />
                <CardContent>
                  <Typography variant="h5" gutterBottom color="primary">
                    {origin.country}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {origin.region}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Variety:</strong> {origin.variety}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Processing:</strong> {origin.processing}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Tasting Notes:</strong> {origin.notes}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Roasting & Brewing Standards Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Roasting & Brewing Standards
          </Typography>
          <Typography variant="body1" textAlign="center" sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}>
            Our commitment to craft extends from bean selection to the final cup. We follow strict standards 
            and use professional-grade equipment to ensure consistency and excellence.
          </Typography>

          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 4, height: '100%' }}>
                <Typography variant="h5" gutterBottom color="primary">
                  Roasting Excellence
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Equipment:</strong> Probat UG-22 drum roaster for precise temperature control
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Profiles:</strong> Light to medium roasts to preserve origin characteristics
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Freshness:</strong> Roasted to order, shipped within 48 hours
                </Typography>
                <Typography variant="body1">
                  <strong>Quality Control:</strong> Cupping every batch for consistency
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 4, height: '100%' }}>
                <Typography variant="h5" gutterBottom color="primary">
                  Brewing Standards
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Ratios:</strong> 1:15 to 1:17 coffee-to-water ratio (SCA standards)
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Temperature:</strong> 195-205°F for optimal extraction
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Equipment:</strong> La Marzocco espresso machines, Mahlkönig grinders
                </Typography>
                <Typography variant="body1">
                  <strong>Water:</strong> Filtered and mineralized for perfect extraction
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Signature Drinks */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h4" textAlign="center" gutterBottom>
              Signature Drinks
            </Typography>
            <Grid container spacing={3}>
              {signatureDrinks.map((drink, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      {drink.name}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {drink.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {drink.notes}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* People & Culture Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          People & Culture
        </Typography>
        <Typography variant="body1" textAlign="center" sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}>
          Our team is the heart of WebCaffe. We're passionate coffee professionals dedicated to 
          creating exceptional experiences and building lasting relationships with our community.
        </Typography>

        <Grid container spacing={4}>
          {teamMembers.map((member, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ textAlign: 'center', p: 3 }}>
                <Avatar
                  src={member.image}
                  alt={member.name}
                  sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  {member.name}
                </Typography>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  {member.role}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {member.bio}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Service Principles */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Our Service Principles
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {['Friendly & Welcoming', 'Fast & Efficient', 'Detail-Oriented', 'Knowledgeable', 'Community-Focused'].map((principle, index) => (
              <Grid item key={index}>
                <Chip label={principle} color="primary" sx={{ m: 0.5 }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Sustainability & Community Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Sustainability & Community
          </Typography>
          <Typography variant="body1" textAlign="center" sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}>
            We're committed to making a positive impact on our environment and community. 
            Every decision we make considers our responsibility to future generations.
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 4, height: '100%' }}>
                <Nature sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Environmental Initiatives
                </Typography>
                <Typography variant="body1" paragraph>
                  • 100% compostable cups and packaging
                </Typography>
                <Typography variant="body1" paragraph>
                  • Coffee grounds recycling program
                </Typography>
                <Typography variant="body1" paragraph>
                  • Solar-powered roasting facility
                </Typography>
                <Typography variant="body1">
                  • Water conservation systems
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 4, height: '100%' }}>
                <Group sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Community Impact
                </Typography>
                <Typography variant="body1" paragraph>
                  • Free coffee education workshops
                </Typography>
                <Typography variant="body1" paragraph>
                  • Local artist showcase program
                </Typography>
                <Typography variant="body1" paragraph>
                  • Farmer support fund contributions
                </Typography>
                <Typography variant="body1">
                  • Community cleanup initiatives
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Impact Numbers */}
          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Our Impact by the Numbers
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={6} md={3}>
                <Typography variant="h3" color="primary">85%</Typography>
                <Typography variant="body1">Waste Reduction</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h3" color="primary">500+</Typography>
                <Typography variant="body1">Trees Planted</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h3" color="primary">50+</Typography>
                <Typography variant="body1">Farmers Supported</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h3" color="primary">1000+</Typography>
                <Typography variant="body1">Community Hours</Typography>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Location & Hours Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Visit Us
        </Typography>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: '100%' }}>
              <Typography variant="h5" gutterBottom color="primary">
                Location & Hours
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    123 Coffee Street, Downtown District, City 12345
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    (555) 123-CAFE
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Email sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    hello@webcaffe.com
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Operating Hours
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Monday - Friday: 6:00 AM - 8:00 PM
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Saturday: 7:00 AM - 9:00 PM
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Sunday: 7:00 AM - 7:00 PM
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom>
                Amenities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['Free WiFi', 'Parking Available', 'Pet Friendly', 'Wheelchair Accessible', 'Outdoor Seating'].map((amenity, index) => (
                  <Chip key={index} label={amenity} size="small" variant="outlined" />
                ))}
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: '100%' }}>
              <Typography variant="h5" gutterBottom color="primary">
                Find Us
              </Typography>
              <Box sx={{ 
                height: 300, 
                bgcolor: 'grey.200', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 2
              }}>
                <Typography variant="body1" color="text.secondary">
                  Interactive Map Coming Soon
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                fullWidth 
                startIcon={<LocationOn />}
                onClick={() => window.open('https://maps.google.com', '_blank')}
              >
                Get Directions
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Press & Awards Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Press & Recognition
          </Typography>
          <Typography variant="body1" textAlign="center" sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}>
            We're honored to be recognized by industry leaders and featured in local and national publications.
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 4, textAlign: 'center', height: '100%' }}>
                <EmojiEvents sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Awards
                </Typography>
                <Typography variant="body2" paragraph>
                  • Best Local Coffee Shop 2023
                </Typography>
                <Typography variant="body2" paragraph>
                  • Sustainability Excellence Award 2022
                </Typography>
                <Typography variant="body2">
                  • Community Impact Recognition 2021
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 4, textAlign: 'center', height: '100%' }}>
                <Typography variant="h5" gutterBottom>
                  Featured In
                </Typography>
                <Typography variant="body2" paragraph>
                  • Coffee Industry Magazine
                </Typography>
                <Typography variant="body2" paragraph>
                  • Local Business Journal
                </Typography>
                <Typography variant="body2" paragraph>
                  • Sustainability Today
                </Typography>
                <Typography variant="body2">
                  • Community Spotlight News
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 4, textAlign: 'center', height: '100%' }}>
                <Typography variant="h5" gutterBottom>
                  By the Numbers
                </Typography>
                <Typography variant="body2" paragraph>
                  • 6 years in business
                </Typography>
                <Typography variant="body2" paragraph>
                  • 500,000+ cups served
                </Typography>
                <Typography variant="body2" paragraph>
                  • 4.8/5 average rating
                </Typography>
                <Typography variant="body2">
                  • 1,200+ happy customers
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Frequently Asked Questions
        </Typography>
        <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
          {faqs.map((faq, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>

      {/* Contact & Social Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Stay Connected
          </Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h5" gutterBottom>
                Get in Touch
              </Typography>
              <Typography variant="body1" paragraph>
                Have questions? Want to learn more about our coffee or services? 
                We'd love to hear from you!
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Email:</strong> hello@webcaffe.com
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Phone:</strong> (555) 123-CAFE
              </Typography>
              <Typography variant="body1">
                <strong>Response Time:</strong> Within 24 hours
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" gutterBottom>
                Follow Our Journey
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <IconButton sx={{ color: 'white' }}>
                  <Instagram />
                </IconButton>
                <IconButton sx={{ color: 'white' }}>
                  <Facebook />
                </IconButton>
                <IconButton sx={{ color: 'white' }}>
                  <Twitter />
                </IconButton>
              </Box>
              <Typography variant="body1" paragraph>
                Join our newsletter for coffee tips, new arrivals, and exclusive offers!
              </Typography>
              <Button variant="outlined" sx={{ color: 'white', borderColor: 'white' }}>
                Subscribe Now
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Ready to Experience WebCaffe?
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
          Whether you're looking for your daily coffee fix, a place to work, or want to learn more about 
          specialty coffee, we're here to welcome you into our community.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/menu')}
          >
            View Menu
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/contact')}
          >
            Get Directions
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default About;