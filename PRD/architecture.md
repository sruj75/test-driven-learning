# TestDrivenLearning Platform Architecture

## System Overview

TestDrivenLearning is a comprehensive learning platform that provides personalized educational experiences through interactive testing, targeted resources, progress tracking, and payment integration. The architecture is designed to support multiple users with personalized experiences while maintaining scalability and security.

## Tech Stack

- **Frontend**: Next.js (React framework) with TypeScript/TSX
- **Authentication**: Supabase Auth with Google OAuth
- **Database**: Supabase PostgreSQL
- **Payment Processing**: Stripe
- **AI Integration**: Groq Cloud API with OpenAI library compatibility
- **Video Content**: YouTube API
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Core Components

### 1. Frontend Architecture

#### Page Structure
- `app/`
  - `page.tsx` - Landing page with chat interface (similar to ChatGPT/Perplexity)
  - `auth/` - Authentication pages
    - `signin.tsx` - Google OAuth sign-in flow
  - `subscribe/` - Subscription pages
    - `page.tsx` - Subscription plan selection
    - `checkout.tsx` - Stripe checkout process
    - `success.tsx` - Payment confirmation
    - `cancel.tsx` - Payment cancellation
  - `dashboard/` - Main user dashboard
    - `page.tsx` - Gamified dashboard showing domains and progress
    - `domain/[id]/` - Domain-specific pages
      - `page.tsx` - Domain overview page
      - `test/[id].tsx` - Test interface pages
      - `resources/[id].tsx` - Learning resources page
  - `profile/` - User profile management
    - `page.tsx` - Profile information and settings
    - `subscription.tsx` - Subscription management
  - `test-playground/` - Folder for our Test ↔ Playground cycle
    - `test/` - Test screens and components
    - `playground/` - Resource/Playground screens and components

#### Layout Structure
- `components/`
  - `layout/`
    - `MainLayout.tsx` - Main application layout with navigation
    - `AuthLayout.tsx` - Simplified layout for auth pages
    - `DashboardLayout.tsx` - Layout for authenticated user dashboard
  - `ui/` - Reusable UI components
  - `auth/` - Authentication components including Google OAuth button
  - `tests/` - Test-related components
  - `resources/` - Learning resource components
  - `payment/` - Payment-related components
  - `chat/` - AI chat interface components
  - `dashboard/` - Dashboard and analytics components
  - `domain/` - Domain-related components
  - `profile/` - Profile-related components

### 2. User Flows

#### New User Flow (Onboarding)
```
Landing Page (Chat) → Authentication (Google OAuth) → Subscription (Stripe) → Dashboard
```

1. **Landing Page with Chat Interface**
   - User arrives at the landing page with chat interface
   - AI initiates conversation to understand user's learning goals
   - User discusses goals and interests with AI
   - AI creates a personalized learning plan
   - User prompted to sign in to save progress

2. **Authentication Flow**
   - User clicks "Sign in with Google" button
   - Google OAuth flow is initiated
   - User authenticates with Google
   - Profile created with Google account information
   - User redirected to subscription page

3. **Subscription Flow**
   - User presented with subscription options
   - User selects a plan
   - Stripe checkout process is initiated
   - User completes payment
   - Subscription status updated in database
   - User redirected to dashboard

#### Returning User Flow (Learning)
```
Authentication → Dashboard → Domain Selection → Test/Resource Cycle
```

1. **Dashboard**
   - User logs in and lands on gamified dashboard
   - Sees progress indicators and streaks (similar to GitHub)
   - Views available learning domains (subjects)
   - Can create new domains or continue existing ones
   - Profile icon in top-right corner for account management

2. **Domain Interaction**
   - User selects a domain to continue learning
   - System loads the appropriate test or resource page based on progress
   - User continues from where they left off

3. **Test-Resource Cycle**
   - User takes test to identify knowledge gaps
   - System analyzes test results
   - User presented with targeted learning resources (YouTube videos, text)
   - User marks resources as helpful/not helpful
   - System presents alternative resources if needed
   - User completes current resource set
   - System presents next test
   - Cycle continues until domain mastery

4. **Profile Management**
   - User can access profile via icon in top-right corner
   - View/edit profile information
   - Manage subscription
   - View domains and progress

### 3. Database Schema (Supabase)

- **users**
  - user_id (PK)
  - email
  - created_at
  - last_login
  - google_id

- **profiles**
  - profile_id (PK)
  - user_id (FK)
  - display_name
  - bio
  - avatar_url
  - preferences
  - last_active_domain_id (FK, nullable)

- **domains** (learning areas of interest)
  - domain_id (PK)
  - user_id (FK)
  - name
  - description
  - progress_percentage
  - created_at
  - last_accessed
  - completion_status

- **goals**
  - goal_id (PK)
  - user_id (FK)
  - domain_id (FK)
  - title
  - description
  - target_completion_date
  - status
  - created_at

- **subscriptions**
  - subscription_id (PK)
  - user_id (FK)
  - stripe_subscription_id
  - plan_id
  - status
  - created_at
  - current_period_end

- **tests**
  - test_id (PK)
  - domain_id (FK)
  - title
  - description
  - difficulty_level
  - test_data (JSON)
  - order_in_sequence
  - created_at

- **resources**
  - resource_id (PK)
  - domain_id (FK)
  - test_id (FK) // Resources are linked to the test that identified the need
  - title
  - description
  - type (YouTube, text, etc.)
  - content_url
  - youtube_video_id
  - metadata
  - created_at

- **user_progress**
  - progress_id (PK)
  - user_id (FK)
  - domain_id (FK)
  - test_id (FK, nullable)
  - resource_id (FK, nullable)
  - completion_status
  - score (for tests)
  - last_accessed
  - notes

- **resource_feedback**
  - feedback_id (PK)
  - user_id (FK)
  - resource_id (FK)
  - helpful (boolean)
  - feedback_type (too advanced, too basic, etc.)
  - comments
  - submitted_at

- **user_streaks**
  - streak_id (PK)
  - user_id (FK)
  - current_streak_days
  - longest_streak_days
  - last_activity_date
  - updated_at

### 4. API Integration

#### Supabase Integration
- **Auth API**: User management with Google OAuth integration
- **Database API**: CRUD operations for user data and content
- **Storage API**: User uploads and content assets

#### Google OAuth Implementation
- Using Supabase Auth social providers
- Configuration in Google Cloud Console for OAuth credentials
- Custom redirect URLs and consent screen setup
- Profile information retrieval from Google account

#### Stripe Integration
- **Payment Flow**:
  1. User selects a subscription plan
  2. System creates Stripe Checkout Session
  3. User redirected to Stripe hosted checkout
  4. Upon completion, webhook updates subscription status
  5. User redirected to dashboard

- **Webhook Handlers**:
  - Payment success
  - Payment failure
  - Subscription updates
  - Subscription cancellation

#### YouTube API Integration
- Search for relevant educational videos
- Fetch video metadata
- Embed videos in resource interface
- Track video engagement and completion
- Find alternative recommendations based on feedback

#### Groq Cloud API Integration (via OpenAI library)
- **Features**:
  - Landing page chat interface for goal setting
  - Personalized test generation
  - Knowledge gap identification
  - Learning resource recommendations
  - Concept explanation and clarification

- **Implementation**:
  - Using OpenAI library with Groq Cloud API endpoint configuration
  - Server-side API endpoints for LLM requests
  - Client-side UI for interaction
  - Response caching to minimize API costs

### 5. Component Details

#### Landing Page Chat Interface
- Conversational UI similar to ChatGPT/Perplexity
- AI-driven conversation to understand user goals
- Personalized learning plan generation
- Seamless transition to authentication

#### Dashboard
- Gamified elements (streaks, progress bars)
- Domain cards showing progress
- "Create Domain" option for adding new subjects
- Analytics visualizations
- Quick-access navigation

#### Domain Component
- Overview of domain progress
- Clear indication of current position in learning journey
- Sequential navigation through test-resource cycle

#### Test Interface
- Multiple question types (multiple choice, coding challenges, text input)
- Clear, distraction-free design
- Progress indicators
- Submit and review functionality

#### Resource Interface
- YouTube video embedding
- Supplementary text content
- Feedback mechanisms:
  - "Watched" button
  - "Helpful/Not Helpful" rating
  - Specific feedback options
  - "Next" button to continue journey

#### Profile Component
- User information display
- Subscription status and management
- Domain list and progress overview
- Account settings

### 6. Security Considerations

1. **Authentication Security**
   - Google OAuth for secure authentication
   - JWT token management
   - HTTPS-only cookies
   - Rate limiting for auth attempts

2. **Payment Security**
   - PCI compliance via Stripe
   - Secure webhook validation
   - Encrypted payment information

3. **Data Protection**
   - Input validation
   - SQL injection prevention
   - XSS protection
   - Data encryption for sensitive information

### 7. Performance Considerations

1. **Frontend Optimization**
   - Code splitting
   - Static generation where applicable
   - Image optimization
   - Client-side caching

2. **API Optimization**
   - Response caching
   - Pagination for large datasets
   - Batch operations

3. **LLM Usage Optimization**
   - Implement request throttling with Groq Cloud API
   - Cache common responses
   - Optimize prompt design

### 8. Deployment Architecture

- **CI/CD Pipeline**: GitHub Actions
- **Environments**:
  - Development
  - Staging
  - Production
- **Monitoring**: Vercel Analytics and custom logging

### 9. Future Expansion Considerations

- Mobile application integration
- Content creator portal
- Community features (forums, peer review)
- Advanced analytics dashboard
- Multi-domain learning paths and cross-domain recommendations
- Internationalization support

### 10. Technical Debt Management

- Regular code reviews
- Automated testing
- Documentation requirements
- Refactoring cycles
