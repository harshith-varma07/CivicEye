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
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'react-toastify';
import { issueService } from '../services/issueService';
import { uploadService } from '../services/uploadService';
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

// Component to update map center when coordinates change
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== 0 && center[1] !== 0) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const LocationPicker = ({ onLocationSelect, position }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });

  return position && position.lat !== 0 && position.lng !== 0 ? <Marker position={position} /> : null;
};

const ReportIssuePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'pothole',
    department: 'roads',
    location: {
      coordinates: [0, 0],
      address: '',
      pincode: '',
    },
    media: [],
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default India center
  const [mapZoom, setMapZoom] = useState(5);
  const [markerPosition, setMarkerPosition] = useState(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: [lng, lat],
          },
        }));
        setMapCenter([lat, lng]);
        setMapZoom(13);
        setMarkerPosition({ lat, lng });
      });
    }
  }, []);

  // Geocode pincode to get coordinates
  const geocodePincode = async (pincode) => {
    if (pincode.length === 6) {
      try {
        // Using Nominatim API for geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json&limit=1`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setMapCenter([lat, lon]);
          setMapZoom(13);
          // Update coordinates in form data
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: [lon, lat],
            },
          }));
          setMarkerPosition({ lat, lng: lon });
          toast.success('Map centered to pincode area');
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Auto-select department based on category
    if (name === 'category') {
      const categoryToDepartment = {
        'pothole': 'roads',
        'streetlight': 'electricity',
        'garbage': 'sanitation',
        'water': 'water',
        'sewage': 'sanitation',
        'traffic': 'traffic',
        'park': 'parks',
        'building': 'building',
        'other': 'general',
      };
      setFormData(prev => ({
        ...prev,
        department: categoryToDepartment[value] || 'general',
      }));
    }
  };

  const handleLocationSelect = (latlng) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: [latlng.lng, latlng.lat],
      },
    }));
    setMarkerPosition(latlng);
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
      toast.error('Please provide an address of where the issue is located');
      return;
    }

    if (!formData.location.pincode) {
      toast.error('Please provide a pincode');
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
                  select
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  helperText="Auto-selected based on category"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.value} value={dept.value}>
                      {dept.label}
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

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Pincode"
                  name="pincode"
                  value={formData.location.pincode}
                  onChange={(e) => {
                    const newPincode = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, pincode: newPincode },
                    }));
                    // Geocode when pincode is complete
                    if (newPincode.length === 6) {
                      geocodePincode(newPincode);
                    }
                  }}
                  required
                  inputProps={{ maxLength: 6 }}
                  helperText="Map will center to this pincode"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Click on map to select exact location
                </Typography>
                <Box sx={{ height: 400, width: '100%' }}>
                  <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <MapUpdater center={mapCenter} zoom={mapZoom} />
                    <LocationPicker onLocationSelect={handleLocationSelect} position={markerPosition} />
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
