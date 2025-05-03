# AI Strategy: Test-Driven Learning Platform

## Overview
This document defines the AI-driven workflow for the Test-Driven Learning platform, including:
- Landing page chatbot for roadmap generation
- Test ↔ Resource cycle for knowledge acquisition
- Mastery validation through continuous testing

The platform follows a goal-driven approach to learning, where the roadmap keeps the user focused while the test-resource cycle addresses knowledge gaps systematically.

---

## 1. Roadmap Generation Workflow

We use a conversational UI to understand the user's learning objectives and create a structured roadmap:

1. **Initial Greeting & Goal Inquiry**
   - **Goal**: Start conversation and obtain high-level learning objective.
   - **Prompt Template**:
     ```text
     You are an AI education consultant helping users create personalized learning paths.
     Greet the user and ask what they want to learn. Be friendly and concise.
     ```

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

3. **Roadmap Generation**
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
         }
       ],
       "totalEstimatedDays": 12
     }
     ```

## 2. Test-Resource Cycle Workflow

After roadmap creation, we enter the test-resource loop that uses the following sequence:

1. **Test Generation**
   - **Goal**: Generate questions for the current roadmap step.
   - **Input**:
     - `topic`: The current learning objective (string).
     - `concepts`: List of concepts from the current roadmap step.
   - **Prompt Template**:
     ```text
     You are an educational AI specializing in assessment.
     Generate 2-3 questions to test the learner's understanding of "{topic}" focusing on these concepts: {concepts}.
     Make questions challenging but fair.
     Return output as a JSON array of objects with `id`, `question`, and `type`.
     ```
   - **Output Format**: `[ { id, question, type }, ... ]`

2. **Test Result Analysis**
   - **Goal**: Identify knowledge gaps from user answers.
   - **Input**:
     - `questions`: The JSON array from the previous step.
     - `answers`: The learner's responses.
   - **Prompt Template**:
     ```text
     Analyze the learner's answers to these questions about {topic}:
     
     Questions: {questions}
     Answers: {answers}
     
     Identify which concepts they struggled with and need more learning resources for.
     Return a JSON array of `gapTopics` (strings).
     ```
   - **Output Format**: `[ "topicA", "topicB", ... ]`

3. **Resource Generation**
   - **Goal**: For each gap, create learning materials.
   - **Prompt Template**:
     ```text
     Generate a comprehensive learning resource for the concept "{gapTopic}" within {topic}.
     Include:
     1. A clear explanation in 2-3 paragraphs
     2. 2-3 practical examples
     3. Common misconceptions
     4. A brief practice exercise
     
     Format your response to be easy to read and visually organized with markdown.
     ```
   - **Output**: A markdown-formatted text block.

4. **Mastery Check**
   - **Goal**: Verify if the user has mastered the current roadmap step.
   - **Input**:
     - `topic`: Current step title.
     - `task_completion`: Status of resource consumption.
   - **Prompt Template**:
     ```text
     The learner has studied resources on these concepts: {concepts}
     Based on their task completion, determine if they are ready for a follow-up test or should continue with additional resources.
     If ready, return "READY_FOR_TEST". If they need more practice, return "NEEDS_MORE_PRACTICE".
     ```
   - **Output**: "READY_FOR_TEST" or "NEEDS_MORE_PRACTICE"

5. **Loop Back or Advance**
   - If mastery check passes, move to the next roadmap step
   - If mastery check fails, generate a new targeted test focusing on remaining gaps

## 3. Implementation with Groq LLM API

The implementation will use the Groq API with OpenAI compatibility:

```typescript
// Setup Groq client with OpenAI compatibility
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY || "your_api_key_here"
});

// Example function to generate tests
async function generateTest(topic: string, concepts: string[]) {
  const response = await client.chat.completions.create({
    model: "llama3-8b-8192",  // or "mixtral-8x7b-32768" for more complex reasoning
    messages: [
      {
        role: "system",
        content: "You are an educational AI specializing in assessment."
      },
      {
        role: "user",
        content: `Generate 2-3 questions to test the learner's understanding of "${topic}" focusing on these concepts: ${concepts.join(", ")}.
        Make questions challenging but fair.
        Return output as a JSON array of objects with \`id\`, \`question\`, and \`type\`.`
      }
    ],
    response_format: { type: "json_object" }
  });
  
  return JSON.parse(response.choices[0].message.content || "[]");
}
```

## 4. Key Components Interaction

The system maintains several pieces of state throughout the learning journey:

1. **Roadmap State**
   - Complete roadmap structure 
   - Current step index
   - Overall progress

2. **Test State**
   - Currently active questions
   - User answers
   - Identified knowledge gaps

3. **Resource State**
   - Generated learning materials
   - Completion status of each resource
   - Mastery status

These states are maintained in a global context and drive the navigation between screens. 