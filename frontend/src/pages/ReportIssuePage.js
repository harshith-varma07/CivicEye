import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  AppBar,
  Toolbar,
  Grid,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { toast } from 'react-toastify';
import { issueService } from '../services/issueService';
import { uploadService } from '../services/uploadService';
import 'leaflet/dist/leaflet.css';

const LocationPicker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const ReportIssuePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'pothole',
    location: {
      coordinates: [0, 0],
      address: '',
    },
    media: [],
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: [position.coords.longitude, position.coords.latitude],
          },
        }));
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationSelect = (latlng) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: [latlng.lng, latlng.lat],
      },
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      const uploadPromises = files.map(file => uploadService.uploadToCloudinary(file));
      const uploadedMedia = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        media: [...prev.media, ...uploadedMedia],
      }));
      toast.success('Media uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.location.address) {
      toast.error('Please provide an address');
      return;
    }

    setLoading(true);

    try {
      await issueService.createIssue(formData);
      toast.success('Issue reported successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to report issue');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'pothole',
    'streetlight',
    'garbage',
    'water',
    'sewage',
    'traffic',
    'park',
    'building',
    'other',
  ];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            <ArrowBack /> Back
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
            Report Issue
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Issue Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.location.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, address: e.target.value },
                  }))}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Click on map to select location
                </Typography>
                <Box sx={{ height: 400, width: '100%' }}>
                  <MapContainer
                    center={[formData.location.coordinates[1] || 0, formData.location.coordinates[0] || 0]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <LocationPicker onLocationSelect={handleLocationSelect} />
                  </MapContainer>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Button variant="outlined" component="label" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Photos/Videos'}
                  <input type="file" hidden multiple accept="image/*,video/*" onChange={handleFileUpload} />
                </Button>
                {formData.media.length > 0 && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {formData.media.length} file(s) uploaded
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? 'Reporting...' : 'Report Issue'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </>
  );
};

export default ReportIssuePage;
