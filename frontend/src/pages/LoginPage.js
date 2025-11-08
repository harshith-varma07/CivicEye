import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      className="animated-bg" 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            >
              <LoginIcon 
                sx={{ 
                  fontSize: 60,
                  color: '#00d4ff',
                  filter: 'drop-shadow(0 0 20px rgba(0, 212, 255, 0.6))',
                  mb: 2,
                }} 
              />
            </motion.div>
            <Typography 
              variant="h3" 
              align="center" 
              gutterBottom
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Login to continue to CivicEye
            </Typography>
          </Box>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                p: 4,
                background: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: 3,
              }}
            >
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#00d4ff',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00d4ff',
                        boxShadow: '0 0 10px rgba(0, 212, 255, 0.3)',
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  margin="normal"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#00d4ff',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00d4ff',
                        boxShadow: '0 0 10px rgba(0, 212, 255, 0.3)',
                      },
                    },
                  }}
                />
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ 
                      mt: 3,
                      py: 1.5,
                      fontSize: '1.1rem',
                      background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4dffff 0%, #00d4ff 100%)',
                        boxShadow: '0 6px 20px rgba(0, 212, 255, 0.4)',
                      },
                    }}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </motion.div>
              </form>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate('/register')}
                    sx={{
                      color: '#00d4ff',
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Register here
                  </Link>
                </Typography>
              </Box>
            </Paper>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="text"
                onClick={() => navigate('/')}
                sx={{ 
                  color: '#00d4ff',
                  '&:hover': {
                    background: 'rgba(0, 212, 255, 0.1)',
                  },
                }}
              >
                ← Back to Home
              </Button>
            </Box>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LoginPage;
