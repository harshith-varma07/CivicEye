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

  // Define government-based reward tiers (50 credits = ₹1)
  const rewards = [
    {
      id: 'govt-healthcare-1000',
      title: 'Healthcare Subsidy',
      description: 'Get ₹1000 subsidy on medical bills at government hospitals',
      cost: 50000,
      icon: '🏥',
      color: '#2E7D32',
    },
    {
      id: 'govt-education-1500',
      title: 'Education Grant',
      description: 'Receive ₹1500 education grant for school/college fees',
      cost: 75000,
      icon: '📚',
      color: '#1976D2',
    },
    {
      id: 'govt-transport-1200',
      title: 'Public Transport Pass',
      description: '₹1200 value monthly pass for buses and metro',
      cost: 60000,
      icon: '🚌',
      color: '#F57C00',
    },
    {
      id: 'govt-ration-2000',
      title: 'Ration Card Benefit',
      description: '₹2000 subsidy on essential commodities via PDS',
      cost: 100000,
      icon: '🌾',
      color: '#7B1FA2',
    },
    {
      id: 'govt-electricity-1800',
      title: 'Electricity Bill Waiver',
      description: 'Get ₹1800 discount on your electricity bill',
      cost: 90000,
      icon: '⚡',
      color: '#C62828',
    },
    {
      id: 'govt-water-1300',
      title: 'Water Bill Subsidy',
      description: '₹1300 subsidy on municipal water charges',
      cost: 65000,
      icon: '💧',
      color: '#0288D1',
    },
    {
      id: 'govt-housing-3000',
      title: 'Housing Scheme Benefit',
      description: '₹3000 assistance under government housing program',
      cost: 150000,
      icon: '🏠',
      color: '#5D4037',
    },
    {
      id: 'govt-skill-2500',
      title: 'Skill Development Voucher',
      description: '₹2500 voucher for government skill training programs',
      cost: 125000,
      icon: '👨‍💼',
      color: '#00796B',
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

      toast.success(`${selectedReward.title} claimed successfully! Remaining points: ${response.data.remainingCredits}`);
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
            Citizen Welfare Benefits
          </Typography>
          <Chip
            icon={<EmojiEvents />}
            label={`${user?.civicCredits || 0} Points`}
            color="warning"
            sx={{ fontWeight: 'bold' }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            🎁 Citizen Welfare Benefits Program
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Earn Civic Appreciation Points by reporting and getting your civic issues verified and resolved.
            Use your points to claim welfare benefits provided by your government!
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            💡 <strong>How to earn points:</strong> Report issues, get them verified by the community, 
            and receive <strong>100 Appreciation Points</strong> when your issue is fully resolved!
            and <strong>5 Points</strong> for every upvote your reported issues receive.
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
                      label={`${reward.cost} Points`}
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
              <strong>{selectedReward?.cost} points</strong>?
            </DialogContentText>
            <DialogContentText sx={{ mt: 2 }}>
              Your remaining points will be: <strong>{(user?.civicCredits || 0) - (selectedReward?.cost || 0)}</strong>
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
