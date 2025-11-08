import React, { useState, useEffect } from 'react';
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
  CardMedia,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Logout, Add, EmojiEvents } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { issueService } from '../services/issueService';
import 'leaflet/dist/leaflet.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      const data = await issueService.getIssues({ limit: 20 });
      setIssues(data.issues);
    } catch (error) {
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      verified: 'info',
      assigned: 'primary',
      'in-progress': 'secondary',
      resolved: 'success',
      rejected: 'error',
    };
    return colors[status] || 'default';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <Box className="animated-bg" sx={{ minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ flexGrow: 1 }}
          >
            <Typography 
              variant="h6" 
              component="div"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #00d4ff 0%, #4dffff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              CivicEye Dashboard
            </Typography>
          </motion.div>
          <IconButton 
            color="inherit" 
            onClick={() => navigate('/leaderboard')}
            sx={{
              '&:hover': {
                background: 'rgba(0, 212, 255, 0.1)',
                transform: 'scale(1.1)',
              },
            }}
          >
            <EmojiEvents sx={{ color: '#ffd700' }} />
          </IconButton>
          <Button 
            color="inherit" 
            onClick={handleLogout}
            startIcon={<Logout />}
            sx={{
              '&:hover': {
                background: 'rgba(255, 23, 68, 0.1)',
              },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography 
              variant="h3"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome, {user?.name}! 👋
            </Typography>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/report')}
                sx={{
                  px: 3,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4dffff 0%, #00d4ff 100%)',
                    boxShadow: '0 6px 20px rgba(0, 212, 255, 0.4)',
                  },
                }}
              >
                Report Issue
              </Button>
            </motion.div>
          </Box>
        </motion.div>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.03 }}
            >
              <Card
                sx={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 212, 255, 0.2)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 8px 30px rgba(0, 212, 255, 0.3)',
                    border: '1px solid rgba(0, 212, 255, 0.5)',
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                    Your Stats ⭐
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 800,
                      color: '#ffd700',
                      textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
                    }}
                  >
                    {user?.civicCredits || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    CivicCredits Earned
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{
                fontWeight: 700,
                mb: 3,
              }}
            >
              Recent Issues 🚀
            </Typography>
          </motion.div>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress 
                sx={{ 
                  color: '#00d4ff',
                  filter: 'drop-shadow(0 0 10px rgba(0, 212, 255, 0.5))',
                }} 
              />
            </Box>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Grid container spacing={3}>
                {issues.map((issue, index) => (
                  <Grid item xs={12} md={6} key={issue._id}>
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ scale: 1.03, y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          background: 'rgba(15, 23, 42, 0.7)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(0, 212, 255, 0.2)',
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            boxShadow: '0 12px 40px rgba(0, 212, 255, 0.3)',
                            border: '1px solid rgba(0, 212, 255, 0.5)',
                          },
                        }} 
                        onClick={() => navigate(`/issues/${issue._id}`)}
                      >
                        {issue.media?.[0] && (
                          <CardMedia
                            component="img"
                            height="200"
                            image={issue.media[0].url}
                            alt={issue.title}
                            sx={{
                              transition: 'transform 0.3s ease-in-out',
                              '&:hover': {
                                transform: 'scale(1.05)',
                              },
                            }}
                          />
                        )}
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                            {issue.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {issue.description.substring(0, 100)}...
                          </Typography>
                          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Chip
                              label={issue.category}
                              size="small"
                              sx={{
                                background: 'rgba(0, 212, 255, 0.2)',
                                borderColor: '#00d4ff',
                                color: '#00d4ff',
                              }}
                            />
                            <Chip
                              label={issue.status}
                              size="small"
                              color={getStatusColor(issue.status)}
                            />
                            <Chip
                              label={`${issue.upvoteCount} upvotes`}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: '#4dffff',
                                color: '#4dffff',
                              }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardPage;
