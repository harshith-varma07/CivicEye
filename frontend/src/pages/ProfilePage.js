import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  Button,
  TextField,
  Grid,
  Avatar,
  IconButton,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { ArrowBack, Edit, Save, Cancel, AccountCircle } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    address: '',
    pincode: '',
  });
  const [pendingChanges, setPendingChanges] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setProfileData({
        name: response.data.name || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        pincode: response.data.pincode || '',
      });
      
      // Check for pending profile update requests
      if (user?.role === 'user') {
        try {
          const pendingResponse = await api.get('/api/auth/profile-update-status');
          if (pendingResponse.data.hasPendingRequest) {
            setPendingChanges(pendingResponse.data.pendingChanges);
          }
        } catch (error) {
          // No pending changes
        }
      }
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (user?.role === 'user') {
        // For citizens, submit for admin approval (excluding name and aadhar)
        const updateData = {
          phone: profileData.phone,
          address: profileData.address,
          pincode: profileData.pincode,
        };
        await api.post('/api/auth/request-profile-update', updateData);
        toast.success('Profile update request submitted. Waiting for admin approval.');
        setPendingChanges(updateData);
      } else if (user?.role === 'admin') {
        // Only admins can update directly
        const response = await api.put('/api/auth/profile', profileData);
        setUser({ ...user, ...response.data });
        toast.success('Profile updated successfully');
      }
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      pincode: user?.pincode || '',
    });
    setIsEditing(false);
  };

  const getAccountStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Profile
          </Typography>
          {(user?.role === 'user' || user?.role === 'admin') && !isEditing && !pendingChanges && (
            <Button
              color="inherit"
              startIcon={<Edit />}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mr: 3,
                bgcolor: 'primary.main',
                fontSize: '3rem',
              }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom>
                {user?.name}
              </Typography>
              <Chip
                label={user?.role?.toUpperCase()}
                color="primary"
                sx={{ mr: 1 }}
              />
              {user?.accountStatus && (
                <Chip
                  label={user.accountStatus.toUpperCase()}
                  color={getAccountStatusColor(user.accountStatus)}
                />
              )}
              {user?.role === 'user' && (
                <Chip
                  icon={<AccountCircle />}
                  label={`${user?.civicCredits || 0} CivicCredits`}
                  color="warning"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {pendingChanges && (
            <Alert severity="info" sx={{ mb: 3 }}>
              You have pending profile changes waiting for admin approval.
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Read-only fields */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={user?.role === 'user' ? 'Aadhar Number' : user?.role === 'officer' ? 'Officer ID' : 'Admin ID'}
                value={user?.aadharNumber || user?.officerId || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
                helperText={user?.role === 'user' ? 'Aadhar number cannot be changed' : ''}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Role"
                value={user?.role?.toUpperCase() || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>

            {user?.role === 'officer' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={user?.department?.toUpperCase() || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
            )}

            {/* Editable fields */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                InputProps={{ readOnly: user?.role === 'user' || !isEditing }}
                variant="outlined"
                required
                helperText={user?.role === 'user' ? 'Name cannot be changed' : ''}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                InputProps={{ readOnly: !isEditing }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pincode"
                name="pincode"
                value={profileData.pincode}
                onChange={handleChange}
                InputProps={{ readOnly: !isEditing }}
                variant="outlined"
                inputProps={{ maxLength: 6 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={profileData.address}
                onChange={handleChange}
                InputProps={{ readOnly: !isEditing }}
                variant="outlined"
                multiline
                rows={3}
              />
            </Grid>

            {isEditing && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : user?.role === 'user' ? 'Submit for Approval' : user?.role === 'admin' ? 'Save Changes' : 'Save'}
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>

          {pendingChanges && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Pending Changes (Awaiting Admin Approval)
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {pendingChanges.phone && pendingChanges.phone !== user?.phone && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Phone:</strong> {user?.phone || 'N/A'} → {pendingChanges.phone}
                    </Typography>
                  </Grid>
                )}
                {pendingChanges.address && pendingChanges.address !== user?.address && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Address:</strong> {user?.address || 'N/A'} → {pendingChanges.address}
                    </Typography>
                  </Grid>
                )}
                {pendingChanges.pincode && pendingChanges.pincode !== user?.pincode && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Pincode:</strong> {user?.pincode || 'N/A'} → {pendingChanges.pincode}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </>
          )}

          <Divider sx={{ my: 3 }} />
          
          <Typography variant="body2" color="text.secondary">
            <strong>Account Created:</strong> {new Date(user?.createdAt).toLocaleDateString()}
          </Typography>
        </Paper>
      </Container>
    </>
  );
};

export default ProfilePage;
