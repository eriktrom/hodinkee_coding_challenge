import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  useTheme,
  Alert,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { API_ENDPOINTS } from '../../config/api';

const PostForm = () => {
  const { id: slug } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  const token = localStorage.getItem('token');
  const isEditMode = !!slug;

  useEffect(() => {
    if (isEditMode) {
      const fetchPost = async () => {
        setLoading(true);
        try {
          const response = await axios.get(API_ENDPOINTS.POSTS.DETAIL(slug));
          const post = response.data.data;
          setTitle(post.title);
          setContent(post.content);
          setHeroImage(post.hero_image || '');
          setDescription(post.description || '');
          setLoading(false);
        } catch (err) {
          setError('Failed to load post. Please try again later.');
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [slug, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      setValidationErrors([]);
      return;
    }

    setSubmitting(true);
    setError('');
    setValidationErrors([]);

    try {
      const url = isEditMode
        ? API_ENDPOINTS.POSTS.DETAIL(slug)
        : API_ENDPOINTS.POSTS.LIST;
      await axios.post(
        url,
        { post: { title, content, hero_image: heroImage, description } },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      navigate('/');
    } catch (err) {
      setSubmitting(false);

      if (err.response && err.response.status === 422) {
        // Handle validation errors
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          setValidationErrors(err.response.data.errors);
        } else {
          setError('Validation failed. Please check your input.');
        }
      } else {
        setError('Failed to save post. Please try again later.');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          to={isEditMode ? `/posts/${slug}` : '/'}
          startIcon={<ArrowBackIcon />}
          sx={{
            mb: 2,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Back
        </Button>

        <Typography variant="h1" component="h1" gutterBottom>
          {isEditMode ? 'Edit Post' : 'Create Post'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Use Markdown and HTML for Rich Text Support
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

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 4 },
            border: '1px solid rgba(0, 0, 0, 0.12)',
            borderRadius: 0
          }}
        >
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Title"
                data-testid="post-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                margin="normal"
                required
                error={validationErrors.some(err => err.toLowerCase().includes('title'))}
                helperText={validationErrors.find(err => err.toLowerCase().includes('title'))}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Description"
                inputProps={{ "data-testid": "post-description-input" }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                margin="normal"
                multiline
                rows={3}
                placeholder="A brief description of your post"
                helperText="This will be displayed in post previews and search results"
                error={validationErrors.some(err => err.toLowerCase().includes('description'))}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Hero Image URL"
                data-testid="post-hero-image-input"
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                margin="normal"
                placeholder="https://example.com/image.jpg"
                helperText="Enter a URL for the post's hero image"
                error={validationErrors.some(err => err.toLowerCase().includes('hero image'))}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ mb: 2 }}
              >
                <Tab
                  label="Write"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                />
                <Tab
                  label="Preview"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                />
              </Tabs>

              {activeTab === 0 ? (
                <Box>
                  <TextField
                    fullWidth
                    label="Content"
                    data-testid="post-content-input"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    multiline
                    rows={15}
                    required
                    placeholder="Write your post content here. Markdown and HTML are supported."
                    sx={{
                      '& .MuiInputBase-root': {
                        fontFamily: 'monospace',
                        fontSize: '0.875rem'
                      }
                    }}
                    error={validationErrors.some(err => err.toLowerCase().includes('content'))}
                    helperText={validationErrors.find(err => err.toLowerCase().includes('content'))}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      mt: 1,
                      fontStyle: 'italic',
                      textAlign: 'center'
                    }}
                  >
                    Use Markdown and HTML for Rich Text Support
                  </Typography>
                </Box>
              ) : (
                <Box sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  minHeight: '400px'
                }}>
                  <Box sx={{
                    '& .markdown-body': {
                      fontFamily: theme.typography.body1.fontFamily,
                      fontSize: theme.typography.body1.fontSize,
                      lineHeight: 1.6,
                      '& h1, & h2, & h3, & h4, & h5, & h6': {
                        marginTop: '2em',
                        marginBottom: '1em',
                        fontWeight: 500,
                        lineHeight: 1.2
                      },
                      '& p': {
                        marginBottom: '1.5em'
                      },
                      '& ul, & ol': {
                        paddingLeft: '2em',
                        marginBottom: '1.5em'
                      },
                      '& li': {
                        marginBottom: '0.5em'
                      },
                      '& blockquote': {
                        borderLeft: '4px solid',
                        borderColor: 'primary.main',
                        paddingLeft: '1em',
                        marginLeft: 0,
                        marginRight: 0,
                        fontStyle: 'italic',
                        color: 'text.secondary'
                      },
                      '& code': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        padding: '0.2em 0.4em',
                        borderRadius: '3px',
                        fontSize: '0.9em'
                      },
                      '& pre': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        padding: '1em',
                        borderRadius: '4px',
                        overflow: 'auto'
                      }
                    }
                  }}>
                    <div className="markdown-body">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" aria-label={props.href || 'External link'} />,
                          img: ({node, ...props}) => <img {...props} loading="lazy" alt={props.alt || 'Content image'} />
                        }}
                      >
                        {content}
                      </ReactMarkdown>
                    </div>
                  </Box>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="primary"
                component={Link}
                to={isEditMode ? `/posts/${slug}` : '/'}
                disabled={submitting}
                data-testid="post-form-cancel-button"
                sx={{
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitting}
                data-testid="post-form-submit-button"
                sx={{
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                {submitting ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Saving...
                  </Box>
                ) : (
                  isEditMode ? 'Update Post' : 'Create Post'
                )}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default PostForm;
