# Welcome to the Hodinkee Blog Challenge

A modern blog application built with Rails API backend and React frontend, featuring user authentication, post management, and rich text support.

## Features

### Core Requirements
- ✅ Homepage with infinite scroll pagination and posts in descending chronological order
- ✅ Post previews showing title, description, and author
- ✅ User authentication system for creating posts
- ✅ Post creation form with validation
- ✅ Post editing and deletion for authors
- ✅ Automatic author assignment based on signed-in user

### Extra Credit Features
- ✅ Rich text support via Markdown
- ✅ Hero images for posts
- ✅ Pretty URLs using slugs
- ✅ React frontend with API integration
- ✅ Comprehensive test coverage
- ✅ Modern UI with Material-UI

## Implementation Details

### Homepage and Post List
- Implemented infinite scroll pagination (5 posts per load)
- Smooth loading of additional posts as user scrolls
- Posts are ordered by creation date (newest first)
- Each post shows:
  - Title
  - Description
  - Author email
  - Hero image (if provided)
  - Creation date

### Post Creation
- Dedicated post creation page with form validation
- Required fields:
  - Title (3-100 characters)
  - Description (10-500 characters)
  - Content (minimum 20 characters)
- Optional hero image field with URL validation
- Live preview tab showing rendered HTML/Markdown
- Automatic author assignment

### Authentication
- JWT-based authentication system
- User registration with email and password
- Protected routes for post creation/editing
- Author-only access to edit/delete actions

### Rich Text Support
- Full Markdown support in post content
- Live preview tab in post editor showing rendered HTML/Markdown
- Support for:
  - Headers
  - Bold/Italic text
  - Lists
  - Links
  - Images
  - Code blocks

### Hero Images
- Optional hero image URL for posts
- URL validation
- Fallback display when no image is provided
- Responsive image handling

### Pretty URLs
- Slug generation from post titles
- Unique slug handling for duplicate titles
- SEO-friendly URLs

### React Frontend
- Modern React application
- Component-based architecture
- State management with hooks
- API integration with Axios
- Protected routes with React Router

### Testing
- Backend:
  - Model tests for Post and User
  - Controller tests for authentication and posts
  - Validation tests
- Frontend:
  - Cypress end-to-end tests
  - Form validation tests
  - Authentication flow tests
  - Post creation/editing tests

## Tech Stack

### Backend (Rails API)
- Ruby on Rails 8.0
- PostgreSQL
- JWT for authentication
- FriendlyId for URL slugs

### Frontend (React)
- React 18
- Material-UI
- Axios for API calls
- React Router for navigation

## Deployment

### Prerequisites
- Heroku CLI installed
- Git installed
- Node.js and npm installed
- Ruby and Rails installed

### Deploying to Heroku

#### API Deployment

1. **Create a new Heroku app for the API**
   ```bash
   heroku create hod-api
   ```

2. **Add PostgreSQL add-on**
   ```bash
   heroku addons:create heroku-postgresql:essential-0 --app hod-api
   ```

3. **Configure environment variables**
   ```bash
   heroku config:set RAILS_MASTER_KEY=$(cat api/config/credentials/production.key) --app hod-api
   heroku config:set RAILS_ENV=production --app hod-api
   ```

4. **Deploy the API as a subtree**
   ```bash
   # Add the Heroku remote if not already added
   git remote add heroku-api https://git.heroku.com/hod-api.git

   # Deploy the API directory as a subtree
   git subtree push --prefix api heroku-api main
   ```

5. **Run database migrations**
   ```bash
   heroku run rails db:migrate --remote heroku-api
   ```

6. **Seed the database (optional)**
   ```bash
   heroku run rails db:seed --remote heroku-api
   ```

#### Client Deployment

1. **Create a new Heroku app for the client**
   ```bash
   heroku create hod-client
   ```

2. **Configure environment variables**
   ```bash
   heroku config:set REACT_APP_API_URL=https://hod-api-17f07695d196.herokuapp.com --app hod-client
   ```

3. **Add the Node.js buildpack**
   ```bash
   heroku buildpacks:set heroku/nodejs --app hod-client
   ```

4. **Deploy the client as a subtree**
   ```bash
   # Add the Heroku remote if not already added
   git remote add heroku-client https://git.heroku.com/hod-client.git

   # Deploy the client directory as a subtree
   git subtree push --prefix client heroku-client main
   ```

5. **Verify the deployment**
   ```bash
   heroku open --app hod-client
   ```

### Troubleshooting

If you encounter any issues during deployment:

1. **Check the logs**
   ```bash
   # For API
   heroku logs --tail --remote heroku-api

   # For client
   heroku logs --tail --remote heroku-client
   ```

2. **Verify database configuration (API only)**
   ```bash
   heroku config | grep DATABASE_URL --remote heroku-api
   ```

3. **Restart the application**
   ```bash
   # For API
   heroku restart --remote heroku-api

   # For client
   heroku restart --remote heroku-client
   ```

4. **Check database status (API only)**
   ```bash
   heroku pg:info --remote heroku-api
   ```

### Maintenance

- To update the API:
  ```bash
  git subtree push --prefix api heroku-api main
  heroku run rails db:migrate --app hod-api
  ```

- To update the client:
  ```bash
  git subtree push --prefix client heroku-client main
  ```

- To view the applications:
  ```bash
  # For API
  heroku open --remote heroku-api

  # For client
  heroku open --remote heroku-client
  ```

- To check application status:
  ```bash
  # For API
  heroku ps --remote heroku-api

  # For client
  heroku ps --remote heroku-client
  ```

## Getting Started

### Prerequisites
- Ruby 3.2.2
- Node.js 18+
- PostgreSQL 14+
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/eriktrom/hodinkee_coding_challenge.git
   cd hodinkee_coding_challenge
   ```

### Backend Setup
1. Navigate to the API directory:
   ```bash
   cd api
   ```

2. Install dependencies:
   ```bash
   bundle install
   ```

3. Setup database:
   ```bash
   rails db:create db:migrate db:seed
   ```

4. Start the Rails server:
   ```bash
   rails s
   ```
   The API will be available at http://localhost:3000

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   The app will be available at http://localhost:3001

## Testing

### Backend Tests
Run Rails tests:
```bash
cd api
rails test
```

### Frontend Tests
Run Cypress tests:
```bash
cd client
npm run cypress run
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Create new user account
- `POST /api/v1/auth/login` - Login user

### Posts
- `GET /api/v1/posts` - List all posts (paginated)
- `GET /api/v1/posts/:slug` - Get single post
- `POST /api/v1/posts` - Create new post (authenticated)
- `PUT /api/v1/posts/:slug` - Update post (authenticated, author only)
- `DELETE /api/v1/posts/:slug` - Delete post (authenticated, author only)

## Future Improvements
- Add image upload support instead of URLs
- Add categories and tags
- Add comments system
- Add user profiles
- Add search functionality
- Add social sharing
- Add RSS feed

## License

This project is licensed under the MIT License - see the LICENSE file for details.
