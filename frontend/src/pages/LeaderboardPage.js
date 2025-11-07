import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  AppBar,
  Toolbar,
  Button,
} from '@mui/material';
import { ArrowBack, EmojiEvents } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { gamificationService } from '../services/gamificationService';

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await gamificationService.getLeaderboard({ limit: 50 });
      setLeaderboard(data);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            <ArrowBack /> Back
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
            Leaderboard
          </Typography>
          <EmojiEvents />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <EmojiEvents sx={{ fontSize: 60, color: 'gold' }} />
          <Typography variant="h3" gutterBottom>
            Top Contributors
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Earn CivicCredits by reporting and resolving issues
          </Typography>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>User</TableCell>
                <TableCell align="right">CivicCredits</TableCell>
                <TableCell align="right">Issues Reported</TableCell>
                <TableCell align="right">Badges</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                leaderboard.map((user, index) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Typography variant="h6">
                        {getRankMedal(index + 1)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={user.avatar} sx={{ mr: 2 }}>
                          {user.name?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1">{user.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color="primary">
                        {user.civicCredits}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {user.issuesReported}
                    </TableCell>
                    <TableCell align="right">
                      {user.badges?.length || 0}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  );
};

export default LeaderboardPage;
