import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/dateFormatter';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Button,
  Tabs,
  Tab,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  LocationCity,
  LocationOn,
  TrendingUp,
  CheckCircle,
  Report,
  People,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { gamificationService } from '../services/gamificationService';
import { useAuth } from '../context/AuthContext';

const CommunityDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [cityData, setCityData] = useState(null);
  const [neighborhoodData, setNeighborhoodData] = useState(null);
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [timeframe, setTimeframe] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunityDashboard();
  }, [timeframe]);

  useEffect(() => {
    if (pincode && pincode.length === 6) {
      loadNeighborhoodStats();
    }
  }, [pincode, timeframe]);

  const loadCommunityDashboard = async () => {
    try {
      setLoading(true);
      const data = await gamificationService.getCommunityDashboard({ timeframe });
      setCityData(data);
    } catch (error) {
      toast.error('Failed to load community dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadNeighborhoodStats = async () => {
    try {
      const data = await gamificationService.getNeighborhoodStats({ pincode, timeframe });
      setNeighborhoodData(data);
    } catch (error) {
      toast.error('Failed to load neighborhood statistics');
      setNeighborhoodData(null);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      roads: '🛣️',
      electricity: '⚡',
      water: '💧',
      sanitation: '🚮',
      parks: '🌳',
      building: '🏗️',
      traffic: '🚦',
      general: '📋',
    };
    return icons[category] || '📋';
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            <ArrowBack /> Back
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
            Community Dashboard
          </Typography>
          <LocationCity />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <LocationCity sx={{ fontSize: 60, color: 'primary.main' }} />
          <Typography variant="h3" gutterBottom>
            Community Progress
          </Typography>
          <Typography variant="body1" color="text.secondary">
            See how our community is working together to improve our city
          </Typography>
        </Box>

        {/* Timeframe Selection */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant={timeframe === 'all' ? 'contained' : 'outlined'}
            onClick={() => setTimeframe('all')}
          >
            All Time
          </Button>
          <Button
            variant={timeframe === 'month' ? 'contained' : 'outlined'}
            onClick={() => setTimeframe('month')}
          >
            This Month
          </Button>
          <Button
            variant={timeframe === 'week' ? 'contained' : 'outlined'}
            onClick={() => setTimeframe('week')}
          >
            This Week
          </Button>
        </Box>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="City-Wide Progress" icon={<LocationCity />} />
            <Tab label="Neighborhood Statistics" icon={<LocationOn />} />
          </Tabs>
        </Paper>

        {loading ? (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        ) : (
          <>
            {/* City-Wide Progress Tab */}
            {tabValue === 0 && cityData && (
              <Box>
                {/* Key Metrics */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Report sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                          <Box>
                            <Typography variant="h4">
                              {cityData.cityWideProgress.totalIssuesReported}
                            </Typography>
                            <Typography color="text.secondary">Issues Reported</Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckCircle sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                          <Box>
                            <Typography variant="h4">
                              {cityData.cityWideProgress.totalIssuesResolved}
                            </Typography>
                            <Typography color="text.secondary">Issues Resolved</Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                          <Box>
                            <Typography variant="h4">
                              {cityData.cityWideProgress.resolutionRate}%
                            </Typography>
                            <Typography color="text.secondary">Resolution Rate</Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <People sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                          <Box>
                            <Typography variant="h4">
                              {cityData.cityWideProgress.totalActiveCitizens}
                            </Typography>
                            <Typography color="text.secondary">Active Citizens</Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Issues by Category */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Issues by Category
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Count</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cityData.issuesByCategory.map((cat) => (
                          <TableRow key={cat._id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>
                                  {getCategoryIcon(cat._id)}
                                </span>
                                <Typography sx={{ textTransform: 'capitalize' }}>
                                  {cat._id}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Chip label={cat.count} color="primary" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>

                {/* Recent Resolved Issues */}
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Recently Resolved Issues
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Issue Title</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Resolved Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cityData.recentResolvedIssues.map((issue) => (
                          <TableRow key={issue._id} hover>
                            <TableCell>{issue.title}</TableCell>
                            <TableCell>
                              <Chip
                                label={issue.category}
                                size="small"
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </TableCell>
                            <TableCell>
                              {formatDate(issue.resolvedAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>
            )}

            {/* Neighborhood Statistics Tab */}
            {tabValue === 1 && (
              <Box>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Enter Your Pincode
                  </Typography>
                  <TextField
                    fullWidth
                    label="Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter 6-digit pincode"
                    inputProps={{ maxLength: 6 }}
                    helperText="View statistics for your neighborhood"
                  />
                </Paper>

                {neighborhoodData && (
                  <>
                    <Typography variant="h5" gutterBottom>
                      Statistics for Pincode: {neighborhoodData.pincode}
                    </Typography>

                    {/* Neighborhood Metrics */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card>
                          <CardContent>
                            <Typography variant="h4" color="primary">
                              {neighborhoodData.stats.issuesReported}
                            </Typography>
                            <Typography color="text.secondary">Issues Reported</Typography>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Card>
                          <CardContent>
                            <Typography variant="h4" color="success.main">
                              {neighborhoodData.stats.issuesResolved}
                            </Typography>
                            <Typography color="text.secondary">Issues Resolved</Typography>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Card>
                          <CardContent>
                            <Typography variant="h4" color="warning.main">
                              {neighborhoodData.stats.resolutionRate}%
                            </Typography>
                            <Typography color="text.secondary">Resolution Rate</Typography>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Card>
                          <CardContent>
                            <Typography variant="h4" color="info.main">
                              {neighborhoodData.stats.activeResidents}
                            </Typography>
                            <Typography color="text.secondary">Active Residents</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    {/* Issues by Category in Neighborhood */}
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Issues by Category in Your Area
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Category</TableCell>
                              <TableCell align="right">Count</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {neighborhoodData.issuesByCategory.map((cat) => (
                              <TableRow key={cat._id}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>
                                      {getCategoryIcon(cat._id)}
                                    </span>
                                    <Typography sx={{ textTransform: 'capitalize' }}>
                                      {cat._id}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  <Chip label={cat.count} color="primary" />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </>
                )}
              </Box>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default CommunityDashboardPage;
