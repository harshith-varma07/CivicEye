import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/dateFormatter';
import {
  Container,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { Logout, Refresh } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { issueService } from '../services/issueService';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: '',
    resolutionNotes: '',
  });

  useEffect(() => {
    if (user?.role !== 'officer') {
      toast.error('Access denied. Officers only.');
      navigate('/dashboard');
      return;
    }
    fetchIssues();
  }, [user, navigate]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      // Issues are automatically filtered by officer's department and pincode in backend
      const response = await issueService.getIssues();
      setIssues(response.issues);
    } catch (error) {
      toast.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await issueService.updateIssueStatus(selectedIssue._id, statusForm);
      toast.success('Issue status updated successfully');
      setOpenStatusDialog(false);
      setStatusForm({ status: '', resolutionNotes: '' });
      fetchIssues();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'verified':
        return 'info';
      case 'assigned':
        return 'primary';
      case 'in-progress':
        return 'secondary';
      case 'resolved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const stats = {
    total: issues.length,
    pending: issues.filter((i) => i.status === 'pending').length,
    inProgress: issues.filter((i) => i.status === 'in-progress').length,
    resolved: issues.filter((i) => i.status === 'resolved').length,
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Officer Dashboard - {user?.department?.toUpperCase()}
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Pincode: {user?.pincode || 'All'}
          </Typography>
          <IconButton color="inherit" onClick={fetchIssues}>
            <Refresh />
          </IconButton>
          <IconButton color="inherit" onClick={logout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Issues
                </Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending
                </Typography>
                <Typography variant="h4">{stats.pending}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  In Progress
                </Typography>
                <Typography variant="h4">{stats.inProgress}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Resolved
                </Typography>
                <Typography variant="h4">{stats.resolved}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Issues Grid */}
        <Typography variant="h5" gutterBottom>
          Issues in Your Department
        </Typography>
        <Grid container spacing={3}>
          {issues.map((issue) => (
            <Grid item xs={12} md={6} lg={4} key={issue._id}>
              <Card>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={issue.status}
                      color={getStatusColor(issue.status)}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={issue.priority}
                      color={getPriorityColor(issue.priority)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {issue.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {issue.description?.substring(0, 100)}...
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Category: {issue.category}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Location: {issue.location?.address}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Pincode: {issue.location?.pincode}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Reported: {formatDate(issue.createdAt)}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Upvotes: {issue.upvoteCount || 0}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/issues/${issue._id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => {
                      setSelectedIssue(issue);
                      setStatusForm({
                        status: issue.status,
                        resolutionNotes: issue.resolutionNotes || '',
                      });
                      setOpenStatusDialog(true);
                    }}
                  >
                    Update Status
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
          {issues.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="textSecondary">
                  No issues found in your department and pincode
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Update Status Dialog */}
      <Dialog
        open={openStatusDialog}
        onClose={() => setOpenStatusDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Update Issue Status</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom>
            {selectedIssue?.title}
          </Typography>
          
          {/* Map showing issue location */}
          {selectedIssue && selectedIssue.location && (
            <Box sx={{ height: 300, width: '100%', mb: 2, mt: 2 }}>
              <MapContainer
                center={[selectedIssue.location.coordinates[1], selectedIssue.location.coordinates[0]]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={[selectedIssue.location.coordinates[1], selectedIssue.location.coordinates[0]]} />
              </MapContainer>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Location: {selectedIssue.location.address}
              </Typography>
            </Box>
          )}
          
          <TextField
            fullWidth
            select
            label="Status"
            value={statusForm.status}
            onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
            margin="normal"
            required
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="verified">Verified</MenuItem>
            <MenuItem value="assigned">Assigned</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
          {statusForm.status === 'resolved' && (
            <TextField
              fullWidth
              label="Resolution Notes"
              multiline
              rows={3}
              value={statusForm.resolutionNotes}
              onChange={(e) =>
                setStatusForm({ ...statusForm, resolutionNotes: e.target.value })
              }
              margin="normal"
              required
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatusDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AuthorityDashboard;
