# AI Strategy: Test & Resource Prompt Chaining

## Overview
This document defines the AI-driven prompt chaining workflow for the Test ↔ Playground (Resources) cycle. It covers:
- Required API keys
- Prompt chain definitions
- Sequence of calls
- Pseudocode examples
- Integration with the landing page roadmap

The Test ↔ Playground cycle consumes the roadmap created in the landing page, working on one step at a time until mastery is achieved.

---

## 1. Environment & API Keys
To enable the AI and YouTube integrations, set the following environment variables in your `.env.local` file:
```
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here
GROQ_CLOUD_API_KEY=your_groq_cloud_api_key_here
```

- **YouTube API Key**: Allows fetching video recommendations based on topics.
- **Groq Cloud API Key**: Authenticates your requests to the LLM service.

---

## 2. Prompt Chaining Workflow
We use a sequence of LLM calls to generate tests, analyze results, and produce resources. Each step passes context to the next:

1. **Roadmap Step Retrieval**
   - **Goal**: Get the current step from the user's roadmap.
   - **Input**: Current user ID and progress state.
   - **Process**: Query database for current step in roadmap.
   - **Output**: 
     ```json
     {
       "stepNumber": 1,
       "title": "HTML & CSS Fundamentals",
       "concepts": ["HTML structure", "CSS selectors", "Responsive design"],
       "estimatedDays": 5
     }
     ```

2. **Test Generation Prompt**
   - **Goal**: Generate questions for the current roadmap step.
   - **Input**:
     - `topic`: The current learning objective (string).
     - `difficulty`: Level based on user performance (e.g., "easy", "medium", "hard").
   - **Prompt Template**:
     ```text
     You are an educational AI specializing in assessment.
     Generate 1 to 3 questions to test the learner's understanding of "{topic}" at "{difficulty}" difficulty.
     Return output as a JSON array of objects with `id`, `question`, and `type`.
     ```
   - **Output**: `[ { id, question, type }, ... ]`

3. **Test Result Analysis Prompt**
   - **Goal**: Identify knowledge gaps from user answers.
   - **Input**:
     - `questions`: The JSON array from the previous step.
     - `answers`: The learner's responses.
   - **Prompt Template**:
     ```text
     Analyze the learner's answers and identify which concepts they struggled with.
     Return a JSON array of `gapTopics` (strings).
     ```
   - **Output**: `[ "topicA", "topicB", ... ]`

4. **Resource Generation Prompt**
   - **Goal**: For each gap, fetch or create learning materials.
   - **Sub-Steps**:
     a. **YouTube Video Fetch**
        - Call YouTube Data API with `gapTopic` to retrieve top N video results.
     b. **LLM Explanation/Reading**
        - **Prompt Template**:
          ```text
          Generate a concise explanation for the concept "{gapTopic}" in 2-3 paragraphs.
          ```
        - **Output**: A text block.
   - **Result Structure**:
     ```json
     [
       {
         "topic": "gapTopic",
         "videos": [ { id, title, url }, ... ],
         "explanation": "..."
       },
       ...
     ]
     ```

5. **Playground To-Do List Assembly**
   - Combine the video links and explanations into a task list:
     - Task Type: `video`, `read`, or `chat`.
     - Status: `pending` or `not helpful` or `completed`.

6. **Loop Back**
   - Once all tasks are marked `completed`, call the LLM to verify mastery of the current topic:
     - If no gaps remain, advance to the next roadmap step.
     - If gaps remain, generate follow-up test questions and resource tasks, and repeat the Test → Resource cycle.

## 3. Integration with Landing Page Roadmap

The Test ↔ Resource cycle is driven by the roadmap created in the landing page:

1. **Roadmap Consumption**
   - Each roadmap step's concepts are used as input to test generation
   - Progress through roadmap is sequential, with mastery required before advancement

2. **Progress Reporting**
   - Updates user's profile with completion status of each roadmap step
   - Tracks time spent vs. estimated time for analytics

3. **Roadmap Feedback Loop**
   - If a user consistently struggles with a step (fails mastery check multiple times)
   - System can suggest roadmap adjustment or prerequisite mini-steps

## 4. Pseudocode Example (TypeScript)
async function runTestCycle(userId: string): Promise<Task[]> {
  // Get current roadmap step
  const currentStep = await getCurrentRoadmapStep(userId);
  const topic = currentStep.title;
  const concepts = currentStep.concepts;
  
  // 1. Generate Test based on roadmap concepts
  const questions = await callLLM(
    generateTestPrompt(topic, concepts, "medium")
  );

  // ... rest of pseudocode as is ...
}

## 5. Next Steps in Screens
- **TestScreen.tsx**: Call `runTestCycle` and render `questions` as form inputs.
- **ResourceScreen.tsx**: Render the returned `tasks` as a checklist, allowing the user to toggle `completed`.
- Track completion state and navigate back to TestScreen when all tasks are done.
