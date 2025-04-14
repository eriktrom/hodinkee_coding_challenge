import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  CircularProgress,
  useTheme,
  Alert,
  Paper
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { API_ENDPOINTS } from '../../config/api';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef();
  const lastPostElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadingMore]);

  const theme = useTheme();

  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  const fetchPosts = useCallback(async (pageNum) => {
    try {
      setLoadingMore(true);
      const response = await axios.get(`${API_ENDPOINTS.POSTS.LIST}?page=${pageNum}&per_page=5`);
      const newPosts = response.data.data;
      setPosts(prevPosts => pageNum === 1 ? newPosts : [...prevPosts, ...newPosts]);
      setHasMore(newPosts.length === 5);
      setError('');
    } catch (err) {
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

  if (loading && page === 1) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h1" component="h1" gutterBottom>
          Hodinkee Blog
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4, fontWeight: 300 }}>
          Discover stories and insights from our community
        </Typography>

        {isAuthenticated && (
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/posts/new"
            startIcon={<AddIcon />}
            sx={{
              mt: 2,
              px: 4,
              py: 1.5,
              fontWeight: 500,
              letterSpacing: '0.05em'
            }}
          >
            Create New Post
          </Button>
        )}
      </Box>

      <Box sx={{ mb: 4 }}>
        {posts.length > 0 && (
          <Grid
            container
            spacing={4}
            sx={{
              width: '100%',
              margin: 0,
              '& > .MuiGrid-item': {
                padding: 0,
                width: '100%'
              }
            }}
          >
            {posts.map((post, index) => (
              <Grid
                item
                xs={12}
                key={post.id}
                ref={index === posts.length - 1 ? lastPostElementRef : null}
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    borderRadius: 0,
                    transition: 'box-shadow 0.2s',
                    overflow: 'hidden',
                    width: '100%',
                    maxWidth: '100%',
                    '&:hover': {
                      boxShadow: 1
                    }
                  }}
                >
                  <Grid container direction="column">
                    <Grid item xs={12}>
                      {post.hero_image ? (
                        <Box
                          sx={{
                            width: '100%',
                            height: { xs: 400, sm: 500, md: 600 },
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Box
                            component="img"
                            src={post.hero_image}
                            alt={post.title}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                              transition: 'transform 0.3s ease-in-out',
                              '&:hover': {
                                transform: 'scale(1.05)'
                              }
                            }}
                          />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            width: '100%',
                            height: { xs: 400, sm: 500, md: 600 },
                            bgcolor: 'grey.100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography
                            variant="h1"
                            sx={{
                              fontSize: { xs: '8rem', sm: '10rem', md: '12rem' },
                              color: 'grey.400',
                              fontWeight: 300,
                              lineHeight: 1
                            }}
                          >
                            {post.title.charAt(0).toUpperCase()}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ p: { xs: 2, md: 3 } }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h2" component="h2" gutterBottom>
                            {post.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              By {post?.user_email || 'Unknown Author'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(post.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{
                            '& .markdown-body': {
                              fontFamily: theme.typography.body1.fontFamily,
                              fontSize: theme.typography.body1.fontSize,
                              lineHeight: 1.6,
                              '& p': {
                                marginBottom: '1em'
                              }
                            }
                          }}>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                              {post.description || 'No description available'}
                            </Typography>
                            <Box sx={{
                              color: 'text.secondary',
                              '& p': { margin: 0 },
                              '& p:last-child': { marginBottom: 0 }
                            }}>
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                  p: ({ children }) => (
                                    <Typography variant="body1" component="p">
                                      {children}
                                    </Typography>
                                  ),
                                  a: ({ href, children }) => (
                                    <Link to={href} style={{ color: theme.palette.primary.main }}>
                                      {children}
                                    </Link>
                                  ),
                                  strong: ({ children }) => (
                                    <Typography component="span" sx={{ fontWeight: 'bold' }}>
                                      {children}
                                    </Typography>
                                  ),
                                  em: ({ children }) => (
                                    <Typography component="span" sx={{ fontStyle: 'italic' }}>
                                      {children}
                                    </Typography>
                                  ),
                                  code: ({ children }) => (
                                    <Typography
                                      component="code"
                                      sx={{
                                        backgroundColor: 'grey.100',
                                        padding: '0.2em 0.4em',
                                        borderRadius: 1,
                                        fontFamily: 'monospace'
                                      }}
                                    >
                                      {children}
                                    </Typography>
                                  )
                                }}
                              >
                                {post.content.length > 150
                                  ? `${post.content.substring(0, 150)}...`
                                  : post.content}
                              </ReactMarkdown>
                            </Box>
                          </Box>
                        </Box>
                        <Box sx={{ mt: 2 }}>
                          <Button
                            component={Link}
                            to={`/posts/${post.slug}`}
                            variant="outlined"
                            color="primary"
                            sx={{
                              textTransform: 'none',
                              fontWeight: 500
                            }}
                          >
                            Read More
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {loadingMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!hasMore && posts.length > 0 && (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4, mb: 4 }}>
          No more posts to load
        </Typography>
      )}

      {!loading && posts.length === 0 && (
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          No posts found
        </Typography>
      )}
    </Container>
  );
};

export default PostList;
