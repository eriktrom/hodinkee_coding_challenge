import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors([]);

    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.SIGNUP, {
        user: {
          email,
          password,
          password_confirmation: passwordConfirmation,
        }
      });

      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      navigate('/');
    } catch (err) {
      if (err.response && err.response.status === 422) {
        // Handle validation errors
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          setValidationErrors(err.response.data.errors);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Validation failed. Please check your input.');
        }
      } else {
        setError(err.response?.data?.message || 'An error occurred');
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Sign Up
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {validationErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" component="div" gutterBottom>
                Please fix the following errors:
              </Typography>
              <List dense sx={{ py: 0 }}>
                {validationErrors.map((err, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText primary={err} />
                  </ListItem>
                ))}
              </List>
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={validationErrors.some(err => err.toLowerCase().includes('email'))}
              helperText={validationErrors.find(err => err.toLowerCase().includes('email'))}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={validationErrors.some(err => err.toLowerCase().includes('password'))}
              helperText={validationErrors.find(err => err.toLowerCase().includes('password'))}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="passwordConfirmation"
              label="Confirm Password"
              type="password"
              id="passwordConfirmation"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              error={validationErrors.some(err => err.toLowerCase().includes('password confirmation'))}
              helperText={validationErrors.find(err => err.toLowerCase().includes('password confirmation'))}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Signup;
