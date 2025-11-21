import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/dateFormatter';
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
  LinearProgress,
  Divider,
} from '@mui/material';
import { Logout, Add, LocationCity, AccountCircle, CardGiftcard, TrendingUp } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { issueService } from '../services/issueService';
import { gamificationService } from '../services/gamificationService';
import 'leaflet/dist/leaflet.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [personalContributions, setPersonalContributions] = useState(null);
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
    if (user?.role === 'user') {
      loadPersonalContributions();
    }
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

  const loadPersonalContributions = async () => {
    try {
      const data = await gamificationService.getPersonalContributions();
      setPersonalContributions(data);
    } catch (error) {
      console.error('Failed to load personal contributions:', error);
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
    navigate('/profile');
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
                icon={<TrendingUp />}
                label={`${user?.civicCredits || 0} Points`}
                color="warning"
                variant="outlined"
                sx={{ fontWeight: 'bold', color: 'white', borderColor: 'white' }}
              />
            </Box>
          )}
          <IconButton color="inherit" onClick={() => navigate('/community-dashboard')}>
            <LocationCity />
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
          {user?.role === 'user' && personalContributions && (
            <>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Your Civic Contributions
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">
                            {personalContributions.personalStats.civicAppreciationPoints}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Appreciation Points
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="info.main">
                            {personalContributions.personalStats.totalIssuesReported}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Issues Reported
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="success.main">
                            {personalContributions.personalStats.issuesResolved}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Issues Resolved
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="secondary.main">
                            {personalContributions.personalStats.communityImpactScore}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Community Impact
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Member since: {formatDate(personalContributions.memberSince)}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((personalContributions.personalStats.issuesResolved / personalContributions.personalStats.totalIssuesReported) * 100, 100) || 0}
                        sx={{ mt: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        {personalContributions.personalStats.issuesPending} issues pending resolution
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate('/community-dashboard')}
                        startIcon={<LocationCity />}
                      >
                        View Community Progress
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate('/claim-rewards')}
                        startIcon={<CardGiftcard />}
                      >
                        Claim Rewards
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {user?.role !== 'user' && (
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
          )}
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
