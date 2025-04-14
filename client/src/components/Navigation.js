import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  useMediaQuery,
  useTheme,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

const Navigation = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        <ListItem button component={Link} to="/" onClick={handleDrawerToggle}>
          <ListItemText primary="Home" />
        </ListItem>
        {isAuthenticated ? (
          <>
            <ListItem button component={Link} to="/posts/new" onClick={handleDrawerToggle}>
              <ListItemText primary="Create Post" />
            </ListItem>
            <Divider />
            <ListItem button onClick={() => { handleLogout(); handleDrawerToggle(); }}>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button component={Link} to="/login" onClick={handleDrawerToggle}>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button component={Link} to="/signup" onClick={handleDrawerToggle}>
              <ListItemText primary="Sign Up" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'text.primary',
              fontWeight: 500,
              letterSpacing: '0.05em',
              fontSize: '1.25rem',
            }}
          >
            HODINKEE BLOG
          </Typography>

          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                  keepMounted: true, // Better open performance on mobile.
                }}
              >
                {drawer}
              </Drawer>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {isAuthenticated ? (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/posts/new"
                    sx={{
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      }
                    }}
                  >
                    Create Post
                  </Button>
                  <Button
                    color="inherit"
                    onClick={handleLogout}
                    sx={{
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      }
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/login"
                    sx={{
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      }
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/signup"
                    sx={{
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      }
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;
