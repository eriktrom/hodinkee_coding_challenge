const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `${API_URL}/api/v1/auth/signup`,
    LOGIN: `${API_URL}/api/v1/auth/login`,
  },
  POSTS: {
    LIST: `${API_URL}/api/v1/posts`,
    DETAIL: (slug) => `${API_URL}/api/v1/posts/${slug}`,
  },
};

export default API_ENDPOINTS;
