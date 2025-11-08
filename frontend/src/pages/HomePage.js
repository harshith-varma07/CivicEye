import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Paper,
} from '@mui/material';
import { Report, ThumbUp, EmojiEvents, Security, ArrowForward } from '@mui/icons-material';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Report fontSize="large" />,
      title: 'Report Issues',
      description: 'Easily report civic issues with photos and location tagging',
      color: '#00d4ff',
    },
    {
      icon: <ThumbUp fontSize="large" />,
      title: 'Community Verification',
      description: 'Upvote and verify issues to prioritize community concerns',
      color: '#4dffff',
    },
    {
      icon: <EmojiEvents fontSize="large" />,
      title: 'Earn Rewards',
      description: 'Gain CivicCredits and badges for active participation',
      color: '#ffd700',
    },
    {
      icon: <Security fontSize="large" />,
      title: 'Blockchain Verified',
      description: 'Transparent and immutable record of all civic issues',
      color: '#ff1744',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ flexGrow: 1 }}
          >
            <Typography variant="h6" component="div" sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #00d4ff 0%, #4dffff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              CivicEye
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button 
              color="inherit" 
              onClick={() => navigate('/login')}
              sx={{ mr: 1 }}
            >
              Login
            </Button>
            <Button 
              variant="contained"
              onClick={() => navigate('/register')}
              sx={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
              }}
            >
              Register
            </Button>
          </motion.div>
        </Toolbar>
      </AppBar>

      <Box className="animated-bg" sx={{ minHeight: '100vh' }}>
        <Container maxWidth="lg">
          {/* Hero Section */}
          <Box sx={{ py: 12, textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                }}
              >
                Welcome to CivicEye
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Typography 
                variant="h5" 
                color="text.secondary" 
                paragraph
                sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}
              >
                Empowering citizens to report and resolve civic issues together with AI-powered insights and blockchain transparency
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  endIcon={<ArrowForward />}
                  sx={{
                    mr: 2,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4dffff 0%, #00d4ff 100%)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 30px rgba(0, 212, 255, 0.4)',
                    },
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderColor: '#00d4ff',
                    color: '#00d4ff',
                    '&:hover': {
                      borderColor: '#4dffff',
                      background: 'rgba(0, 212, 255, 0.1)',
                      transform: 'translateY(-3px)',
                    },
                  }}
                >
                  View Issues
                </Button>
              </Box>
            </motion.div>
          </Box>

          {/* Features Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={4} sx={{ mb: 8 }}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    variants={itemVariants}
                    whileHover="hover"
                  >
                    <Card 
                      sx={{ 
                        height: '100%', 
                        textAlign: 'center', 
                        p: 2,
                        background: 'rgba(15, 23, 42, 0.7)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0, 212, 255, 0.2)',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-10px)',
                          boxShadow: `0 12px 40px ${feature.color}40`,
                          borderColor: feature.color,
                        },
                      }}
                    >
                      <CardContent>
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.2 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Box sx={{ 
                            color: feature.color, 
                            mb: 2,
                            filter: `drop-shadow(0 0 10px ${feature.color}80)`,
                          }}>
                            {feature.icon}
                          </Box>
                        </motion.div>
                        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 700 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          {/* How It Works Section */}
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Typography 
                variant="h3" 
                gutterBottom
                sx={{
                  fontWeight: 700,
                  mb: 6,
                  background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                How It Works
              </Typography>
            </motion.div>

            <Grid container spacing={4}>
              {[
                { step: '1', title: 'Report', desc: 'Spot a civic issue? Report it with photos and location' },
                { step: '2', title: 'Verify', desc: 'Community members upvote and verify the issue' },
                { step: '3', title: 'Resolve', desc: 'Authorities take action and resolve the issue' },
              ].map((item, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        background: 'rgba(15, 23, 42, 0.7)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0, 212, 255, 0.2)',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-10px)',
                          boxShadow: '0 12px 40px rgba(0, 212, 255, 0.3)',
                          border: '1px solid rgba(0, 212, 255, 0.5)',
                        },
                      }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Typography 
                          variant="h2" 
                          sx={{
                            fontWeight: 900,
                            background: 'linear-gradient(135deg, #00d4ff 0%, #4dffff 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 2,
                            textShadow: '0 0 30px rgba(0, 212, 255, 0.5)',
                          }}
                        >
                          {item.step}
                        </Typography>
                      </motion.div>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {item.desc}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box 
              sx={{ 
                py: 8, 
                px: 4,
                mb: 8,
                textAlign: 'center',
                background: 'rgba(0, 212, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: 4,
              }}
            >
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                Ready to Make a Difference?
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                Join thousands of citizens making their communities better
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                endIcon={<ArrowForward />}
                sx={{
                  px: 5,
                  py: 2,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4dffff 0%, #00d4ff 100%)',
                    transform: 'scale(1.05)',
                    boxShadow: '0 8px 30px rgba(0, 212, 255, 0.5)',
                  },
                }}
              >
                Join CivicEye Now
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </>
  );
};

export default HomePage;
