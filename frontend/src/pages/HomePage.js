import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
} from '@mui/material';
import { Report, ThumbUp, EmojiEvents, Security } from '@mui/icons-material';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Report fontSize="large" />,
      title: 'Report Issues',
      description: 'Easily report civic issues with photos and location tagging',
    },
    {
      icon: <ThumbUp fontSize="large" />,
      title: 'Community Verification',
      description: 'Upvote and verify issues to prioritize community concerns',
    },
    {
      icon: <EmojiEvents fontSize="large" />,
      title: 'Earn Rewards',
      description: 'Gain CivicCredits and badges for active participation',
    },
    {
      icon: <Security fontSize="large" />,
      title: 'Blockchain Verified',
      description: 'Transparent and immutable record of all civic issues',
    },
  ];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CivicEye
          </Typography>
          <Button color="inherit" onClick={() => navigate('/login')}>
            Login
          </Button>
          <Button color="inherit" onClick={() => navigate('/register')}>
            Register
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ my: 8, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to CivicEye
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Empowering citizens to report and resolve civic issues together
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ mr: 2 }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/dashboard')}
            >
              View Issues
            </Button>
          </Box>
        </Box>

        <Grid container spacing={4} sx={{ my: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ my: 8, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            How It Works
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                1. Report
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Spot a civic issue? Report it with photos and location
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                2. Verify
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Community members upvote and verify the issue
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                3. Resolve
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Authorities take action and resolve the issue
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default HomePage;
