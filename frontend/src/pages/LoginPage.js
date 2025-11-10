import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
} from '@mui/material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState('user');
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setRole(newRole);
      setFormData({ loginId: '', password: '' });
    }
  };

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
      await login({
        loginId: formData.loginId,
        password: formData.password,
        role: role,
      });
      toast.success('Login successful!');
      
      // Navigate based on role
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const getLoginIdLabel = () => {
    switch (role) {
      case 'user':
        return 'Aadhar Number';
      case 'officer':
        return 'Officer ID';
      case 'admin':
        return 'Admin ID';
      default:
        return 'Login ID';
    }
  };

  const getLoginIdHelperText = () => {
    switch (role) {
      case 'user':
        return 'Enter your 12-digit Aadhar number';
      case 'officer':
        return 'Enter your Officer ID';
      case 'admin':
        return 'Enter your Admin ID';
      default:
        return '';
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Login to CivicEye
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={role}
            exclusive
            onChange={handleRoleChange}
            aria-label="user role"
            fullWidth
          >
            <ToggleButton value="user" aria-label="citizen">
              Citizen
            </ToggleButton>
            <ToggleButton value="officer" aria-label="officer">
              Officer
            </ToggleButton>
            <ToggleButton value="admin" aria-label="admin">
              Admin
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label={getLoginIdLabel()}
            name="loginId"
            value={formData.loginId}
            onChange={handleChange}
            margin="normal"
            required
            helperText={getLoginIdHelperText()}
            inputProps={role === 'user' ? { maxLength: 12 } : {}}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        {role === 'user' && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/register')}
              >
                Register here
              </Link>
            </Typography>
          </Box>
        )}

        {(role === 'officer' || role === 'admin') && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {role === 'officer' ? 'Officer' : 'Admin'} accounts are created by administrators only
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default LoginPage;
