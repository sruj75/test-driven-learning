# Landing Page AI Strategy: Roadmap Generation

## Overview
This document defines the AI-driven workflow for the landing page, which helps users define their learning goals and generates a personalized roadmap. This roadmap is then used by the Test ↔ Resource cycle in the screens folder.

---

## 1. User Goal Assessment Workflow

We use a conversational UI to understand the user's learning objectives and create a structured roadmap:

1. **Initial Greeting & Goal Inquiry**
   - **Goal**: Start conversation and obtain high-level learning objective.
   - **Prompt Template**:
     ```text
     You are an AI education consultant helping users create personalized learning paths.
     Greet the user and ask what they want to learn. Be friendly and concise.
     ```
   - **Expected User Response**: A general area of interest (e.g., "I want to learn full-stack web development")

2. **Clarification Questions**
   - **Goal**: Refine understanding of specific technologies, frameworks, and constraints.
   - **Prompt Template**:
     ```text
     Based on the user's goal of learning "{initial_goal}", ask 3-5 specific clarifying questions about:
     1. Preferred frameworks/technologies (if applicable)
     2. Prior experience level
     3. Time constraints or urgency
     4. Specific projects they want to build
     5. Learning style preferences
     
     Format as conversational questions, one at a time.
     ```
   - **Process**: Ask one question, wait for response, then ask next question.

3. **Timeframe Optimization**
   - **Goal**: Understand time constraints to properly scope the roadmap.
   - **Prompt Template**:
     ```text
     Ask the user how quickly they need to learn these skills and why.
     Explain that this will help optimize their roadmap.
     ```
   - **Expected User Response**: Timeframe information (e.g., "I need to learn this in 2 months for a new job")

4. **Roadmap Generation**
   - **Goal**: Create a structured, step-by-step learning plan.
   - **Prompt Template**:
     ```text
     Based on all information gathered, create a personalized learning roadmap for {initial_goal} with:
     
     1. Clear sequential steps (5-10 steps maximum)
     2. Time estimation for each step
     3. Core concepts to master in each step
     4. Recommended progression based on dependencies between concepts
     
     Optimize for the user's {timeframe} constraint.
     Return as a JSON structure with stepNumber, title, concepts, and estimatedDays fields.
     ```
   - **Output Example**:
     ```json
     {
       "roadmap": [
         {
           "stepNumber": 1,
           "title": "HTML & CSS Fundamentals",
           "concepts": ["HTML structure", "CSS selectors", "Responsive design"],
           "estimatedDays": 5
         },
         {
           "stepNumber": 2,
           "title": "JavaScript Basics",
           "concepts": ["Variables", "Functions", "DOM manipulation"],
           "estimatedDays": 7
         },
         ...
       ],
       "totalEstimatedDays": 60
     }
     ```

5. **Roadmap Review & Refinement**
   - **Goal**: Allow user to provide feedback on the roadmap.
   - **Prompt Template**:
     ```text
     Present the roadmap to the user and ask if they'd like to make any adjustments.
     Suggest they might want to:
     1. Add/remove specific topics
     2. Adjust time allocations
     3. Reorder steps (if logically possible)
     ```
   - **Process**: Update roadmap based on feedback and re-present until user is satisfied.

6. **Roadmap Finalization & Handoff**
   - **Goal**: Save the roadmap and transition to the Test ↔ Resource cycle.
   - **Prompt Template**:
     ```text
     Thank the user for defining their learning path.
     Explain that:
     1. Their roadmap has been saved
     2. They'll now begin with step 1 testing to identify knowledge gaps
     3. The system will adapt resources to help them master each step
     ```
   - **Action**: Save roadmap to user profile and transition to TestScreen component.

---

## 2. Integration with Test ↔ Resource Cycle

The landing page AI strategy connects with the screens AI strategy through the roadmap structure:

1. **Data Handoff**
   - Roadmap JSON stored in user's profile in database
   - Current step index tracked to maintain progress
   - TestScreen receives the current step's concepts as testing topics

2. **Progress Tracking**
   - As user completes steps in the Test ↔ Resource cycle, roadmap progress is updated
   - Landing page can show overview of completed and remaining steps

3. **Roadmap Adjustments**
   - If mastery check repeatedly fails, landing page AI may be re-engaged to adjust roadmap difficulty
   - User can return to roadmap view to see progress and adjust goals

---

## 3. Next Development Steps

1. **Landing Page UI Components**
   - Conversational interface with chat bubbles
   - Roadmap visualization (timeline or step cards)
   - Progress indicators for each roadmap step

2. **API Implementation**
   - LLM service connection for conversational UI
   - Database schema for storing roadmaps
   - Session management to maintain conversation context

3. **Connection Points**
   - API endpoints for test/resource screens to retrieve current roadmap step
   - Progress update endpoints to mark steps as complete
   - User preference storage for ongoing optimization
