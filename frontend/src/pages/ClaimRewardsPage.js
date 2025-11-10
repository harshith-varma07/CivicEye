import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from '@mui/material';
import { ArrowBack, EmojiEvents, Redeem } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ClaimRewardsPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [selectedReward, setSelectedReward] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);

  // Define reward tiers
  const rewards = [
    {
      id: 'voucher-50',
      title: 'Coffee Voucher',
      description: 'Enjoy a free coffee at participating cafes',
      cost: 50,
      icon: '☕',
      color: '#8B4513',
    },
    {
      id: 'voucher-100',
      title: 'Food Voucher',
      description: 'Get ₹100 off at participating restaurants',
      cost: 100,
      icon: '🍽️',
      color: '#FF6347',
    },
    {
      id: 'voucher-200',
      title: 'Grocery Voucher',
      description: 'Save ₹200 on your next grocery shopping',
      cost: 200,
      icon: '🛒',
      color: '#32CD32',
    },
    {
      id: 'voucher-500',
      title: 'Shopping Voucher',
      description: 'Get ₹500 voucher for online shopping',
      cost: 500,
      icon: '🛍️',
      color: '#FF1493',
    },
    {
      id: 'voucher-1000',
      title: 'Premium Gift Card',
      description: '₹1000 gift card for premium stores',
      cost: 1000,
      icon: '🎁',
      color: '#FFD700',
    },
    {
      id: 'voucher-2000',
      title: 'Travel Voucher',
      description: 'Get ₹2000 off on flight or hotel bookings',
      cost: 2000,
      icon: '✈️',
      color: '#4169E1',
    },
  ];

  const handleClaimClick = (reward) => {
    setSelectedReward(reward);
    setConfirmDialogOpen(true);
  };

  const handleConfirmClaim = async () => {
    if (!selectedReward) return;

    setClaiming(true);
    try {
      const response = await api.post('/api/gamification/claim-reward', {
        rewardId: selectedReward.id,
        rewardCost: selectedReward.cost,
      });

      // Update user credits in context
      setUser({
        ...user,
        civicCredits: response.data.remainingCredits,
      });

      toast.success(`${selectedReward.title} claimed successfully! Remaining credits: ${response.data.remainingCredits}`);
      setConfirmDialogOpen(false);
      setSelectedReward(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to claim reward');
    } finally {
      setClaiming(false);
    }
  };

  const handleCancelClaim = () => {
    setConfirmDialogOpen(false);
    setSelectedReward(null);
  };

  const canAfford = (cost) => {
    return (user?.civicCredits || 0) >= cost;
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
            Claim Rewards
          </Typography>
          <Chip
            icon={<EmojiEvents />}
            label={`${user?.civicCredits || 0} Credits`}
            color="warning"
            sx={{ fontWeight: 'bold' }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            🎁 Redeem Your Civic Credits
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Earn credits by reporting and getting your civic issues verified and resolved.
            Use your credits to claim exciting rewards!
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            💡 <strong>How to earn credits:</strong> Report issues, get them verified by the community, 
            and receive <strong>50 credits</strong> when your issue is fully resolved!
          </Alert>
        </Box>

        <Grid container spacing={3}>
          {rewards.map((reward) => (
            <Grid item xs={12} sm={6} md={4} key={reward.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: canAfford(reward.cost) ? 1 : 0.6,
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                {!canAfford(reward.cost) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      bgcolor: 'error.main',
                      color: 'white',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      zIndex: 1,
                    }}
                  >
                    🔒
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      fontSize: '4rem',
                      textAlign: 'center',
                      mb: 2,
                    }}
                  >
                    {reward.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom align="center">
                    {reward.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph align="center">
                    {reward.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Chip
                      icon={<Redeem />}
                      label={`${reward.cost} Credits`}
                      sx={{
                        bgcolor: reward.color,
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={!canAfford(reward.cost)}
                    onClick={() => handleClaimClick(reward)}
                    sx={{
                      bgcolor: reward.color,
                      '&:hover': {
                        bgcolor: reward.color,
                        opacity: 0.9,
                      },
                      mx: 2,
                    }}
                  >
                    {canAfford(reward.cost) ? 'Claim Now' : `Need ${reward.cost - (user?.civicCredits || 0)} more`}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialogOpen}
          onClose={handleCancelClaim}
        >
          <DialogTitle>
            Confirm Reward Claim
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to claim <strong>{selectedReward?.title}</strong> for{' '}
              <strong>{selectedReward?.cost} credits</strong>?
            </DialogContentText>
            <DialogContentText sx={{ mt: 2 }}>
              Your remaining credits will be: <strong>{(user?.civicCredits || 0) - (selectedReward?.cost || 0)}</strong>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelClaim} disabled={claiming}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmClaim}
              variant="contained"
              disabled={claiming}
              autoFocus
            >
              {claiming ? 'Claiming...' : 'Confirm Claim'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default ClaimRewardsPage;
