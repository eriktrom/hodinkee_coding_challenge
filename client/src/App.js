import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Navigation from './components/Navigation';
import PostList from './components/posts/PostList';
import PostDetail from './components/posts/PostDetail';
import PostForm from './components/posts/PostForm';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#000000', // Black for primary elements
      light: '#333333',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#9e9e9e', // Gray for secondary elements
      light: '#bdbdbd',
      dark: '#757575',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#f9f9f9',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 300,
      fontSize: '2.5rem',
      letterSpacing: '0.02em',
    },
    h2: {
      fontWeight: 300,
      fontSize: '2rem',
      letterSpacing: '0.01em',
    },
    h3: {
      fontWeight: 400,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 400,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 400,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navigation />
          <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<PostList />} />
              <Route
                path="/posts/new"
                element={
                  <ProtectedRoute>
                    <PostForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/posts/:id/edit"
                element={
                  <ProtectedRoute>
                    <PostForm />
                  </ProtectedRoute>
                }
              />
              <Route path="/posts/:id" element={<PostDetail />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
