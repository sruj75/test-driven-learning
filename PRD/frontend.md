# Frontend Strategy: Test-Driven Learning Platform

## Core Approach

Our test-driven learning platform will be built as a **web-first application** designed primarily for desktop and laptop users. The frontend will focus on delivering an intuitive, engaging experience that guides users through our unique test-driven learning methodology.

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with TSX
- **Styling**: TailwindCSS
- **State Management**: React Context API and SWR
- **Authentication**: Supabase Auth with Google OAuth
- **Payment Processing**: Stripe
- **AI Integration**: Groq Cloud API (using OpenAI library)
- **Audio/Voice Content**: OpenAI Text-to-Speech & Speech-to-Text API
- **Deployment**: Vercel

## User Journey - Detailed Flow

### 1. Landing Page with Chat Interface
- **Single-page application** with a chat UI similar to ChatGPT/Perplexity
- Chat interface embedded directly on the landing page (no separate login required)
- User types their learning goal (e.g., "I want to learn web dev")
- AI responds and asks clarifying questions to understand user needs
- AI builds a personalized learning journey draft within the chat
- User can continue the conversation to refine their goals
- Prominent "Save Your Journey" button appears once enough information is gathered

**Technical Implementation:**
- React/Next.js SPA architecture with TypeScript
- Custom chat UI component or library like react-chat-ui or botui
- Backend API calls to Groq Cloud API service (via OpenAI library)
- Client-side state management to track conversation

### 2. Journey Ready → Registration/Login Page
- Transition screen: "We've crafted your personalized journey! Create an account to save it."
- Clear call-to-action buttons: "Continue with Google" as primary option
- Brief preview of the journey to reinforce value
- Option to return to conversation for adjustments

**Technical Implementation:**
- Supabase Auth integration with Google OAuth
- JWT token storage for session management
- Secure session handling
- Profile data retrieval from Google account

### 3. Authentication Flow
- **Primary Authentication**: Google OAuth sign-in
  - Simple, one-click authentication process
  - Retrieves basic profile information (name, email, profile picture)
  - No password management required for users
- **Alternative (Future)**: Email + password option as backup
- Upon successful authentication, journey data is saved to user's account in database

**Technical Implementation:**
- Supabase Auth with Google provider configuration
- Google Cloud Console OAuth credentials setup
- Secure OAuth flow implementation
- Database schema for user profiles and journey data
- API endpoints for saving journey data

### 4. Subscription Paywall
- Post-authentication screen showing subscription options
- Clear messaging: "To unlock your personalized learning journey, please subscribe"
- Pricing tier display with feature comparison
- Secure payment form via Stripe Checkout integration
- Success/failure states with appropriate messaging
- Preview option to see limited content before subscribing

**Technical Implementation:**
- Stripe Checkout integration
- Stripe webhook handlers for payment events
- Subscription status tracking in database
- Access control middleware for protected routes

### 5. Main Dashboard (Post-Subscription)
- Central hub showing domains and personalized learning journey
- Prominent "Continue Learning" button leading to current domain and test
- Progress tracker displaying completed and upcoming tests
- Visual representation of the learning path
- Profile and account management options
- Quick access to AI chat assistance

**Test-Resource Learning Cycle Components:**
- Knowledge assessment tests with conversational UI
- Knowledge gap visualization after test completion
- Voice-based prompts and interactive audio exercises based on identified gaps
- Resource interface with feedback controls:
  - "Listened" button to mark completed audio segments
  - "Helpful/Not Helpful" rating options
  - Detailed feedback categories for unhelpful content
  - Option to request alternative explanations

**Technical Implementation:**
- Dashboard components with data visualization
- OpenAI Text-to-Speech integration for audio content
- Feedback collection system with database storage
- Progress tracking and persistence
- Recommendation engine using collected feedback data
- Groq Cloud API integration for AI assistance

## Test-Resource Cycle System

The recurring test-resource cycle is a critical component of our platform:

1. **Test Generation and Analysis**
   - Generate knowledge assessment tests based on user's domain
   - Analyze test results to identify specific knowledge gaps
   - Track progress between tests to focus on weak areas
   - Adapt difficulty based on user performance

2. **Resource Recommendation**
   - Match interactive audio segments and voice-guided resources to specific knowledge gaps
   - Filter for quality based on metrics (views, ratings, educational markers)
   - Present in order of relevance to learning needs
   - Include diverse content types for different learning styles

3. **User Feedback Collection**
   - Simple but comprehensive feedback UI:
     - "Listened" button to track completion
     - "Helpful" thumbs up button
     - "Not Helpful" with dropdown for specific reasons:
       - Too advanced
       - Too basic
       - Unclear explanation
       - Not relevant
       - Poor quality
   - All feedback is stored and associated with user ID, resource ID, and knowledge topic

4. **Continuous Improvement Loop**
   - Initial recommendations from curated starter library
   - Algorithm adjusts based on user feedback across platform
   - Resources with positive feedback rise in recommendation priority
   - Consistently negative feedback removes resources from rotation
   - Follow-up tests to validate learning and identify remaining gaps

## Post-MVP Playground Enhancements
- Transform the Resource screen into an interactive Playground where users complete a personalized to-do list of tasks (videos, summaries, reading).
- Features:
  - Adaptive to-do list based on test-identified knowledge gaps
  - Audio task segments with "Listened" tracking and helpful/not helpful feedback
  - LLM-generated video summaries and AI-generated reading materials ("chapters")
  - In-app AI Tutor chat for real-time Q&A during Playground sessions
  - Task completion gating before proceeding to the next test
- UI & Technical Considerations:
  - New Playground API integrating OpenAI Speech APIs, LLM endpoints, and task management
  - State management for test-playground transitions and task progress
  - New UI components: task list, chat interface, summary modules

## Implementation Priorities

### Phase 1: Core User Flows (Weeks 1-2)
- Landing page with conversational goal-setting
- Google OAuth authentication integration
- Basic profile creation with Google account data
- Simple dashboard structure

### Phase 2: Test-Resource Cycle (Weeks 3-4)
- Test interface with conversational UI
- Knowledge gap visualization
- Voice resource recommendations
- Resource feedback collection mechanism

### Phase 3: Subscription & Enhancements (Weeks 5-6)
- Stripe integration for payments
- Subscription management
- Enhanced recommendation features with feedback mechanisms

## Multi-Domain Support (Post-MVP)

For future expansion beyond the MVP, we'll implement multi-domain learning support:

1. **Domain Selection Interface**
   - Allow users to manage multiple learning domains
   - Simple switching between active domains
   - Domain-specific dashboard views

2. **Cross-Domain Progress Tracking**
   - Unified profile with separate progress tracking per domain
   - Overall statistics across all learning domains
   - Recommendations that leverage cross-domain knowledge

3. **Domain Management**
   - Add/remove domains from profile
   - Set goals for each domain
   - Track completion and progress separately

**Technical Implementation:**
- Extended database schema supporting multiple domains per user
- UI components for domain management
- API endpoints for domain-specific operations
- Enhanced recommendation engine considering cross-domain knowledge

## Quality Standards

### Performance
- Page load under 2 seconds for critical pages
- Time to interactive under 3.5 seconds
- Optimize for browser rendering and JavaScript execution

### Accessibility
- WCAG 2.1 AA compliance for core functionality
- Keyboard navigation support
- Screen reader compatibility for essential features

### Code Quality
- TypeScript for type safety and better developer experience
- Component-based architecture
- Jest and React Testing Library for testing
- ESLint and Prettier for code style consistency

## AI Implementation with Groq Cloud

Our platform leverages Groq Cloud API with OpenAI library compatibility for several key features:

1. **Conversational Goal Setting**
   - Natural language processing to understand user learning objectives
   - Dialogue management to ask relevant follow-up questions
   - Structured output for generating learning plans

2. **Test Generation**
   - Dynamic question creation based on learning domains
   - Difficulty adjustment based on user performance
   - Varied question formats to test different aspects of knowledge

3. **Personalized Explanations**
   - Custom explanations for concepts users struggle with
   - Adaptation to user's demonstrated knowledge level
   - Multiple explanation approaches for difficult concepts

4. **Implementation Details**
   - Groq Cloud API endpoint configuration with OpenAI library
   - Optimized prompts for each use case
   - Response caching for common queries
   - Fallback mechanisms for API failures

## Conclusion

This frontend strategy provides a focused approach to building a web-first test-driven learning platform with Google OAuth authentication and Groq Cloud API integration. By implementing the five key screens (Chat Landing, Google Authentication, Profile Setup, Subscription, and Dashboard) in sequence, we'll create a seamless user journey that delivers our unique test-resource cycle methodology while collecting valuable feedback to continuously improve recommendations.
