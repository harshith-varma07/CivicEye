import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ReportIssuePage from './pages/ReportIssuePage';
import IssueDetailsPage from './pages/IssueDetailsPage';
import CommunityDashboardPage from './pages/CommunityDashboardPage';
import AuthorityDashboard from './pages/AuthorityDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ClaimRewardsPage from './pages/ClaimRewardsPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Professional blue
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0288d1', // Light cyan-blue
      light: '#03a9f4',
      dark: '#01579b',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f7fa', // Very light gray-blue background
      paper: '#ffffff',
    },
    success: {
      main: '#43a047', // Professional green
      light: '#66bb6a',
      dark: '#2e7d32',
    },
    info: {
      main: '#29b6f6', // Light blue
      light: '#4fc3f7',
      dark: '#0288d1',
    },
    warning: {
      main: '#ffa726', // Warm orange
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: '#ef5350', // Soft red
      light: '#e57373',
      dark: '#c62828',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 4px 8px rgba(0,0,0,0.08)',
    '0px 8px 16px rgba(0,0,0,0.1)',
    '0px 12px 24px rgba(0,0,0,0.12)',
    '0px 16px 32px rgba(0,0,0,0.14)',
    '0px 20px 40px rgba(0,0,0,0.16)',
    ...Array(18).fill('0px 24px 48px rgba(0,0,0,0.18)'),
  ],
});

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
            <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/report" element={<PrivateRoute><ReportIssuePage /></PrivateRoute>} />
            <Route path="/issues/:id" element={<IssueDetailsPage />} />
            <Route path="/community-dashboard" element={<CommunityDashboardPage />} />
            <Route path="/claim-rewards" element={<PrivateRoute><ClaimRewardsPage /></PrivateRoute>} />
            <Route path="/authority" element={<PrivateRoute><AuthorityDashboard /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          </Routes>
        </Router>
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
