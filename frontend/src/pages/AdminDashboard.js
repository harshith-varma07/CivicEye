import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/dateFormatter';
import {
  Container,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { Logout, Refresh } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [profileUpdateRequests, setProfileUpdateRequests] = useState([]);
  const [stats, setStats] = useState({ pendingUsers: 0, approvedUsers: 0, totalOfficers: 0, totalIssues: 0 });
  const [loading, setLoading] = useState(true);
  const [openOfficerDialog, setOpenOfficerDialog] = useState(false);
  const [openAdminDialog, setOpenAdminDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [officerForm, setOfficerForm] = useState({
    name: '',
    officerId: '',
    password: '',
    phone: '',
    department: 'roads',
    pincode: '',
  });
  const [adminForm, setAdminForm] = useState({
    name: '',
    officerId: '',
    password: '',
    phone: '',
  });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    // Wait for user to load from AuthContext
    if (loading && !user) {
      return;
    }
    
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      navigate('/dashboard');
      return;
    }
    
    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, usersRes, statsRes, profileReqRes] = await Promise.all([
        api.get('/admin/pending-users'),
        api.get('/admin/users'),
        api.get('/admin/stats'),
        api.get('/admin/profile-update-requests'),
      ]);
      setPendingUsers(pendingRes.data);
      setAllUsers(usersRes.data);
      setStats(statsRes.data);
      setProfileUpdateRequests(profileReqRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await api.put(`/admin/approve-user/${userId}`);
      toast.success('User approved successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve user');
    }
  };

  const handleRejectUser = async () => {
    try {
      await api.put(`/admin/reject-user/${selectedUser}`, { reason: rejectReason });
      toast.success('User rejected');
      setOpenRejectDialog(false);
      setRejectReason('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject user');
    }
  };

  const handleCreateOfficer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/create-officer', officerForm);
      toast.success('Officer created successfully');
      setOpenOfficerDialog(false);
      setOfficerForm({
        name: '',
        officerId: '',
        password: '',
        phone: '',
        department: 'roads',
        pincode: '',
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create officer');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/create-admin', adminForm);
      toast.success('Admin created successfully');
      setOpenAdminDialog(false);
      setAdminForm({
        name: '',
        officerId: '',
        password: '',
        phone: '',
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create admin');
    }
  };

  const departments = [
    { value: 'roads', label: 'Roads & Infrastructure' },
    { value: 'electricity', label: 'Electricity' },
    { value: 'water', label: 'Water Supply' },
    { value: 'sanitation', label: 'Sanitation' },
    { value: 'parks', label: 'Parks & Recreation' },
    { value: 'building', label: 'Building & Construction' },
    { value: 'traffic', label: 'Traffic Management' },
    { value: 'general', label: 'General' },
  ];

  const handleApproveProfileUpdate = async (requestId) => {
    try {
      await api.put(`/admin/approve-profile-update/${requestId}`);
      toast.success('Profile update approved successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve profile update');
    }
  };

  const handleRejectProfileUpdate = async (requestId) => {
    const reason = prompt('Enter rejection reason (optional):');
    try {
      await api.put(`/admin/reject-profile-update/${requestId}`, { reason });
      toast.success('Profile update rejected');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject profile update');
    }
  };

  // Show loading state while user is being loaded
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <IconButton color="inherit" onClick={fetchData}>
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
                  Pending Users
                </Typography>
                <Typography variant="h4">{stats.pendingUsers || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Approved Users
                </Typography>
                <Typography variant="h4">{stats.approvedUsers || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Officers
                </Typography>
                <Typography variant="h4">{stats.totalOfficers || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Admins
                </Typography>
                <Typography variant="h4">{stats.totalAdmins || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenOfficerDialog(true)}
            sx={{ mr: 2 }}
          >
            Create Officer
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setOpenAdminDialog(true)}
          >
            Create Admin
          </Button>
        </Box>

        {/* Tabs */}
        <Paper>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Pending Users" />
            <Tab label="All Users" />
            <Tab label="Officers" />
            <Tab label="Profile Update Requests" />
          </Tabs>

          {/* Pending Users Tab */}
          {tabValue === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Aadhar Number</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Pincode</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.aadharNumber}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.address}</TableCell>
                      <TableCell>{user.pincode}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color="success"
                          onClick={() => handleApproveUser(user._id)}
                          sx={{ mr: 1 }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedUser(user._id);
                            setOpenRejectDialog(true);
                          }}
                        >
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No pending users
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* All Users Tab */}
          {tabValue === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Aadhar/ID</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Pincode</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.aadharNumber || user.officerId}</TableCell>
                      <TableCell>
                        <Chip label={user.role} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.accountStatus}
                          size="small"
                          color={
                            user.accountStatus === 'approved'
                              ? 'success'
                              : user.accountStatus === 'pending'
                              ? 'warning'
                              : 'error'
                          }
                        />
                      </TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>{user.pincode || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Officers Tab */}
          {tabValue === 2 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Officer ID</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Pincode</TableCell>
                    <TableCell>Phone</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allUsers
                    .filter((user) => user.role === 'officer')
                    .map((officer) => (
                      <TableRow key={officer._id}>
                        <TableCell>{officer.name}</TableCell>
                        <TableCell>{officer.officerId}</TableCell>
                        <TableCell>{officer.department}</TableCell>
                        <TableCell>{officer.pincode}</TableCell>
                        <TableCell>{officer.phone}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Profile Update Requests Tab */}
          {tabValue === 3 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User Name</TableCell>
                    <TableCell>Aadhar Number</TableCell>
                    <TableCell>Requested Changes</TableCell>
                    <TableCell>Requested On</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {profileUpdateRequests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>{request.user?.name}</TableCell>
                      <TableCell>{request.user?.aadharNumber}</TableCell>
                      <TableCell>
                        <Box>
                          {request.requestedChanges.phone && request.requestedChanges.phone !== request.user?.phone && (
                            <Typography variant="caption" display="block">
                              Phone: {request.user?.phone || 'N/A'} → <strong>{request.requestedChanges.phone}</strong>
                            </Typography>
                          )}
                          {request.requestedChanges.address && request.requestedChanges.address !== request.user?.address && (
                            <Typography variant="caption" display="block">
                              Address: {request.user?.address || 'N/A'} → <strong>{request.requestedChanges.address}</strong>
                            </Typography>
                          )}
                          {request.requestedChanges.pincode && request.requestedChanges.pincode !== request.user?.pincode && (
                            <Typography variant="caption" display="block">
                              Pincode: {request.user?.pincode || 'N/A'} → <strong>{request.requestedChanges.pincode}</strong>
                            </Typography>
                          )}
                          {!request.requestedChanges.phone && !request.requestedChanges.address && !request.requestedChanges.pincode && (
                            <Typography variant="caption" color="text.secondary">
                              No changes
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{formatDate(request.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleApproveProfileUpdate(request._id)}
                          sx={{ mr: 1 }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleRejectProfileUpdate(request._id)}
                        >
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {profileUpdateRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No pending profile update requests
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      {/* Create Officer Dialog */}
      <Dialog open={openOfficerDialog} onClose={() => setOpenOfficerDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateOfficer}>
          <DialogTitle>Create Officer Account</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              value={officerForm.name}
              onChange={(e) => setOfficerForm({ ...officerForm, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Officer ID"
              value={officerForm.officerId}
              onChange={(e) => setOfficerForm({ ...officerForm, officerId: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={officerForm.password}
              onChange={(e) => setOfficerForm({ ...officerForm, password: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Phone"
              value={officerForm.phone}
              onChange={(e) => setOfficerForm({ ...officerForm, phone: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              select
              label="Department"
              value={officerForm.department}
              onChange={(e) => setOfficerForm({ ...officerForm, department: e.target.value })}
              margin="normal"
              required
            >
              {departments.map((dept) => (
                <MenuItem key={dept.value} value={dept.value}>
                  {dept.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Pincode"
              value={officerForm.pincode}
              onChange={(e) => setOfficerForm({ ...officerForm, pincode: e.target.value })}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenOfficerDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Create Admin Dialog */}
      <Dialog open={openAdminDialog} onClose={() => setOpenAdminDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateAdmin}>
          <DialogTitle>Create Admin Account</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              value={adminForm.name}
              onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Admin ID"
              value={adminForm.officerId}
              onChange={(e) => setAdminForm({ ...adminForm, officerId: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={adminForm.password}
              onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Phone"
              value={adminForm.phone}
              onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAdminDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Reject User Dialog */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Rejection Reason"
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
          <Button onClick={handleRejectUser} variant="contained" color="error">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminDashboard;
