import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Alert,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import { Logout, Add, EmojiEvents, AccountCircle, CardGiftcard } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { issueService } from '../services/issueService';
import 'leaflet/dist/leaflet.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'admin') {
      navigate('/admin');
      return;
    }
    if (user?.role === 'officer') {
      navigate('/authority');
      return;
    }
    loadIssues();
  }, [user, navigate]);

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

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    // Navigate to profile page if needed
  };

  const handleClaimRewards = () => {
    handleMenuClose();
    navigate('/claim-rewards');
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

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CivicEye Dashboard
          </Typography>
          {user?.role === 'user' && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Chip
                icon={<EmojiEvents />}
                label={`${user?.civicCredits || 0} Credits`}
                color="warning"
                variant="outlined"
                sx={{ fontWeight: 'bold', color: 'white', borderColor: 'white' }}
              />
            </Box>
          )}
          <IconButton color="inherit" onClick={() => navigate('/leaderboard')}>
            <EmojiEvents />
          </IconButton>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleProfile}>
              <AccountCircle sx={{ mr: 1 }} /> Profile
            </MenuItem>
            {user?.role === 'user' && (
              <MenuItem onClick={handleClaimRewards}>
                <CardGiftcard sx={{ mr: 1 }} /> Claim Rewards
              </MenuItem>
            )}
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {user?.accountStatus === 'pending' && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Your account is pending admin verification. You can browse and upvote issues, but some features may be limited until your account is approved.
          </Alert>
        )}
        
        {user?.accountStatus === 'approved' && user?.role === 'user' && (
          <Alert severity="success" sx={{ mb: 3 }}>
            ✓ Your account has been verified by admin. You have full access to all features.
          </Alert>
        )}

        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">
            Welcome, {user?.name}
          </Typography>
          {user?.role === 'user' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/report')}
            >
              Report Issue
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Stats
                </Typography>
                <Typography variant="body2">
                  CivicCredits: {user?.civicCredits || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Recent Issues
          </Typography>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <Grid container spacing={3}>
              {issues.map((issue) => (
                <Grid item xs={12} md={6} key={issue._id}>
                  <Card sx={{ cursor: 'pointer' }} onClick={() => navigate(`/issues/${issue._id}`)}>
                    {issue.media?.[0] && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={issue.media[0].url}
                        alt={issue.title}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {issue.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {issue.description.substring(0, 100)}...
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label={issue.category}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={issue.status}
                          size="small"
                          color={getStatusColor(issue.status)}
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={`${issue.upvoteCount} upvotes`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </>
  );
};

export default DashboardPage;
