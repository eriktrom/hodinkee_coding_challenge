import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Divider,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { API_ENDPOINTS } from '../../config/api';

const PostDetail = () => {
  const { id: slug } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthor = post?.user_id === currentUser.id;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.POSTS.DETAIL(slug));
        setPost(response.data.data);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Post not found');
        } else {
          setError('Failed to load post. Please try again later.');
        }
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleDelete = async () => {
    try {
      await axios.delete(API_ENDPOINTS.POSTS.DETAIL(slug), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      navigate('/');
    } catch (err) {
      setError('Failed to delete post. Please try again later.');
    }
  };

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Posts
        </Button>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Post not found
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Posts
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{
            mb: 2,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Back to Posts
        </Button>

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
              fontWeight: 300,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              mb: 2
            }}
          >
            {post.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              By {post?.user_email || 'Unknown Author'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              {new Date(post.created_at).toLocaleDateString()}
            </Typography>
          </Box>

          {post.description && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: 4,
                fontStyle: 'italic',
                maxWidth: '800px'
              }}
            >
              {post.description}
            </Typography>
          )}
        </Box>

        {isAuthor && (
          <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              component={Link}
              to={`/posts/${post.slug}/edit`}
              sx={{
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleOpenDeleteDialog}
              sx={{
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Delete
            </Button>
          </Box>
        )}

        {post.hero_image ? (
          <Box
            sx={{
              width: '100%',
              height: { xs: 300, sm: 400, md: 500 },
              mb: 4,
              overflow: 'hidden',
              borderRadius: 1,
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
              height: { xs: 300, sm: 400, md: 500 },
              mb: 4,
              bgcolor: 'grey.100',
              borderRadius: 1,
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

        <Divider sx={{ mb: 4 }} />

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 4 },
            border: '1px solid rgba(0, 0, 0, 0.12)',
            borderRadius: 0
          }}
        >
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
                fontFamily: 'monospace'
              },
              '& pre': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                padding: '1em',
                borderRadius: '3px',
                overflow: 'auto',
                marginBottom: '1.5em'
              },
              '& img': {
                maxWidth: '100%',
                height: 'auto',
                marginBottom: '1.5em'
              },
              '& a': {
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              },
              '& table': {
                borderCollapse: 'collapse',
                width: '100%',
                marginBottom: '1.5em'
              },
              '& th, & td': {
                border: '1px solid',
                borderColor: 'divider',
                padding: '0.5em',
                textAlign: 'left'
              },
              '& th': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              },
              '& strong': {
                fontWeight: 600,
                color: 'text.primary'
              },
              '& em': {
                fontStyle: 'italic',
                color: 'text.secondary'
              },
              '& figure': {
                margin: '1.5em 0',
                textAlign: 'center'
              },
              '& figcaption': {
                fontSize: '0.9em',
                color: 'text.secondary',
                marginTop: '0.5em',
                fontStyle: 'italic'
              },
              '& iframe': {
                maxWidth: '100%',
                marginBottom: '1.5em'
              }
            }
          }}>
            {/*
            Must be a div to apply the markdown-body class
            https://github.com/remarkjs/react-markdown/blob/main/changelog.md#remove-classname
            */}
            <div className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" aria-label={props.href || 'External link'} />,
                  img: ({node, ...props}) => <img {...props} loading="lazy" alt={props.alt || 'Content image'} />,
                  iframe: ({node, ...props}) => <iframe {...props} allowFullScreen title={props.title || 'Embedded content'} />
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

          </Box>
        </Paper>
      </Box>

      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteDialog}
            sx={{
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            sx={{
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PostDetail;
