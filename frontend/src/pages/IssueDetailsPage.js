import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  Avatar,
  AppBar,
  Toolbar,
  TextField,
} from '@mui/material';
import { ArrowBack, ThumbUp } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'react-toastify';
import { issueService } from '../services/issueService';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/dateFormatter';
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

const IssueDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIssue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadIssue = async () => {
    try {
      const data = await issueService.getIssue(id);
      setIssue(data);
    } catch (error) {
      toast.error('Failed to load issue');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      toast.error('Please login to upvote');
      return;
    }

    try {
      await issueService.upvoteIssue(id);
      loadIssue();
      toast.success('Upvoted successfully');
    } catch (error) {
      toast.error('Failed to upvote');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    try {
      await issueService.addComment(id, { text: comment });
      setComment('');
      loadIssue();
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!issue) {
    return <Typography>Issue not found</Typography>;
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            <ArrowBack /> Back
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
            Issue Details
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>
                {issue.title}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip label={issue.category} sx={{ mr: 1 }} />
                <Chip label={issue.status} color="primary" sx={{ mr: 1 }} />
                <Chip 
                  label={issue.priority} 
                  color={
                    issue.priority === 'critical' ? 'error' : 
                    issue.priority === 'high' ? 'warning' : 
                    issue.priority === 'medium' ? 'info' : 'default'
                  } 
                />
              </Box>

              {/* AI Analysis Section */}
              {issue.aiPrediction && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    AI Analysis
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {issue.aiPrediction.priority && (
                      <Chip 
                        size="small" 
                        label={`AI Priority: ${issue.aiPrediction.priority}`}
                        color={
                          issue.aiPrediction.priority === 'critical' ? 'error' : 
                          issue.aiPrediction.priority === 'high' ? 'warning' : 'default'
                        }
                      />
                    )}
                    {issue.aiPrediction.priorityScore && (
                      <Chip 
                        size="small" 
                        label={`Score: ${(issue.aiPrediction.priorityScore * 100).toFixed(0)}%`}
                        variant="outlined"
                      />
                    )}
                    {issue.aiPrediction.isDuplicate && (
                      <Chip 
                        size="small" 
                        label={`Potential Duplicate (${(issue.aiPrediction.similarity * 100).toFixed(0)}% match)`}
                        color="warning"
                      />
                    )}
                  </Box>
                </Paper>
              )}

              {/* Tags Section */}
              {issue.tags && issue.tags.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Tags</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {issue.tags.map((tag, index) => (
                      <Chip key={index} size="small" label={tag} variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}

              <Typography variant="body1" paragraph>
                {issue.description}
              </Typography>

              {issue.media && issue.media.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    {issue.media.map((media, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <img
                          src={media.url}
                          alt={`Issue ${index + 1}`}
                          style={{ width: '100%', borderRadius: 8 }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<ThumbUp />}
                  onClick={handleUpvote}
                  sx={{ mr: 2 }}
                >
                  Upvote ({issue.upvoteCount})
                </Button>
              </Box>

              <Typography variant="h6" gutterBottom>
                Comments ({issue.comments?.length || 0})
              </Typography>
              
              {user && (
                <Box component="form" onSubmit={handleAddComment} sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Button type="submit" variant="contained" sx={{ mt: 1 }}>
                    Post Comment
                  </Button>
                </Box>
              )}

              {issue.comments && issue.comments.map((comment, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ mr: 1 }}>{comment.user?.name?.[0]}</Avatar>
                    <Typography variant="subtitle2">{comment.user?.name}</Typography>
                  </Box>
                  <Typography variant="body2">{comment.text}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(comment.createdAt)}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Reporter
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ mr: 2 }}>{issue.reportedBy?.name?.[0]}</Avatar>
                <Box>
                  <Typography variant="subtitle1">{issue.reportedBy?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {issue.reportedBy?.civicCredits} CivicCredits
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Location
              </Typography>
              <Typography variant="body2" paragraph>
                {issue.location.address}
              </Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <MapContainer
                  center={[issue.location.coordinates[1], issue.location.coordinates[0]]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[issue.location.coordinates[1], issue.location.coordinates[0]]} />
                </MapContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default IssueDetailsPage;
