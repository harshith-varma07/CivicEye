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
} from '@mui/material';
import { Logout, Add, EmojiEvents } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CivicEye Dashboard
          </Typography>
          <IconButton color="inherit" onClick={() => navigate('/leaderboard')}>
            <EmojiEvents />
          </IconButton>
          <Button color="inherit" onClick={handleLogout}>
            <Logout /> Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">
            Welcome, {user?.name}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/report')}
          >
            Report Issue
          </Button>
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
