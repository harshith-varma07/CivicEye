import React from 'react';
import {
  Container,
  Typography,
  Paper,
  AppBar,
  Toolbar,
} from '@mui/material';

const AuthorityDashboard = () => {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Authority Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Authority Dashboard
          </Typography>
          <Typography variant="body1">
            This is the authority dashboard where authorities can manage assigned issues,
            track SLAs, and process contractor payments.
          </Typography>
        </Paper>
      </Container>
    </>
  );
};

export default AuthorityDashboard;
