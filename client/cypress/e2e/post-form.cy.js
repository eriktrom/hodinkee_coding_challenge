describe('PostForm', () => {
  const testUser = {
    email: 'dev@example.com',
    password: 'abc123',
  }

  beforeEach(() => {
    cy.visit('/login').then(() => {
      cy.request('POST', 'http://localhost:3000/api/v1/auth/login', {
        email: testUser.email,
        password: testUser.password
      }).then((loginResponse) => {
        // console.log(loginResponse)
        window.localStorage.setItem('token', loginResponse.body.data.token)
      })
    })
    .then(() => {
      cy.visit('/posts/new')
    });
  })

  afterEach(() => {
    // Clean up: logout and clear localStorage
    window.localStorage.removeItem('token')
  })

  it('should successfully create a new post when authenticated', () => {
    cy.get('[data-testid="post-title-input"]').type('Test Post Title')
    cy.get('[data-testid="post-content-input"]').type('This is a test post content that is at least 20 characters long which is the minimum length for the content field')
    cy.get('[data-testid="post-description-input"]').type('This is a valid description that meets the minimum length requirement of 10 characters.')
    cy.get('[data-testid="post-hero-image-input"]').type('https://example.com/image.jpg')

    cy.get('[data-testid="post-form-submit-button"]').click()

    cy.contains('Test Post Title').should('be.visible')
  })

  it('should show validation errors for fields that are not long enough', () => {
    cy.get('[data-testid="post-title-input"]').type('ab')
    cy.get('[data-testid="post-content-input"]').type('Too short')
    cy.get('[data-testid="post-description-input"]').type('Too short')
    cy.get('[data-testid="post-form-submit-button"]').click()

    cy.contains('Title is too short').should('be.visible')
    cy.contains('Content is too short').should('be.visible')
    cy.contains('Description is too short').should('be.visible')
  })

  it('should validate description length requirements', () => {
    // Test description too short (less than 10 characters)
    cy.get('[data-testid="post-title-input"]').type('Test Post Title')
    cy.get('[data-testid="post-content-input"]').type('This is a test post content that is at least 20 characters long')
    cy.get('[data-testid="post-description-input"]').type('Too short')
    cy.get('[data-testid="post-form-submit-button"]').click()
    cy.contains('Description is too short').should('be.visible')

    // Test description too long (more than 500 characters)
    cy.get('[data-testid="post-description-input"]').clear().type('a'.repeat(501))
    cy.get('[data-testid="post-form-submit-button"]').click()
    cy.contains('Description is too long').should('be.visible')

    // Test valid description length
    cy.get('[data-testid="post-description-input"]').clear().type('This is a valid description that meets the minimum length requirement of 10 characters.')
    cy.get('[data-testid="post-form-submit-button"]').click()
    cy.contains('Description is too short').should('not.exist')
    cy.contains('Description is too long').should('not.exist')
  })

  it('should handle API errors gracefully', () => {
    cy.intercept('POST', '/api/v1/posts', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as('createPost')

    cy.get('[data-testid="post-title-input"]').type('Test Post Title')
    cy.get('[data-testid="post-content-input"]').type('This is a test post content')
    cy.get('[data-testid="post-description-input"]').type('This is a valid description for the test post.')
    cy.get('[data-testid="post-hero-image-input"]').type('https://example.com/image.jpg')

    cy.get('[data-testid="post-form-submit-button"]').click()

    // Wait for the API call and verify error handling
    cy.wait('@createPost')
    cy.contains('Failed to save post').should('be.visible')
  })

  it('should redirect to login when trying to create post without authentication', () => {
    window.localStorage.removeItem('token')

    cy.visit('/posts/new')

    cy.url().should('include', '/login')
  })

  it('should preview markdown content correctly', () => {
    cy.get('[data-testid="post-title-input"]').type('Test Post Title')
    cy.get('[data-testid="post-content-input"]').type('# Heading\n\nThis is **bold** and *italic* text.')
    cy.get('[data-testid="post-description-input"]').type('This is a valid description for the markdown preview test.')
    cy.get('[data-testid="post-hero-image-input"]').type('https://example.com/image.jpg')

    // Switch to preview tab
    cy.get('button[role="tab"]').contains('Preview').click()

    // Verify markdown is rendered correctly
    cy.contains('Heading').should('have.prop', 'tagName').should('eq', 'H1')
    cy.contains('bold').should('have.css', 'font-weight', '700')
    cy.contains('italic').should('have.css', 'font-style', 'italic')
  })

  it('should handle form cancellation', () => {
    // Fill in some form fields
    cy.get('[data-testid="post-title-input"]').type('Test Post Title')
    cy.get('[data-testid="post-content-input"]').type('This is a test post content')
    cy.get('[data-testid="post-description-input"]').type('This is a valid description for the test post.')

    // Click cancel button
    cy.get('[data-testid="post-form-cancel-button"]').click()

    // Should be redirected to home page
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
})
