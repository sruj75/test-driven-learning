## 1. Answer: Breaking the Work into Incremental Steps

Below is a high-level roadmap for building the "Test ↔ Resource" cycle. We'll tackle one piece at a time, so it's easy to follow and learn.

**Step 1: Scaffold the Two Screens**
- Create `TestScreen.tsx` and `ResourceScreen.tsx` under your `app/screens/` folder.  
- Define the basic React component structure (empty view, placeholders for content).  

**Step 2: Set Up Navigation Between Screens**
- Install and configure React Navigation (or your chosen router).  
- Wire up a stack or tab navigator so you can switch programmatically between `TestScreen` and `ResourceScreen`.  

**Step 3: Build the LLM-Driven Test API**
- Create a service module (e.g. `services/llm.ts`) that calls your LLM endpoint.  
- Define a function like `fetchTestQuestion(topic): Promise<Question>` that returns one test item.  

**Step 4: Display Dynamic Test Content**
- In `TestScreen`, call `fetchTestQuestion` in a `useEffect` or button handler.  
- Render the question, input fields or options, and a "Submit" button.  

**Step 5: Build the YouTube + Text Resources API**
- Create another service module (e.g. `services/resources.ts`).  
- Define functions like `fetchVideoRecommendations(topic)` and `fetchTextResource(topic)`.  

**Step 6: Display Dynamic Resources**
- In `ResourceScreen`, call the resource functions based on the last test's topic.  
- Show a list of video thumbnails (with links) plus a block of generated text.  

**Step 7: Orchestrate the Test ↔ Resource Flow**
- Maintain a piece of state (e.g. `currentTopic` or `lastQuestion`) in a parent context or global store.  
- After submitting a test, navigate to `ResourceScreen` or Playground and pass the topic.  
- After "I'm ready for the next test," navigate back to `TestScreen` and trigger a new fetch.  
- **Maintain a personalized to-do list of resource tasks (videos, LLM summaries, readings) in the Playground and track completion of each task before allowing the next test.**

**Step 8: Error Handling & Loading States**
- Add loading spinners while fetching.  
- Gracefully handle API errors (show retry buttons, error messages).  

**Step 9: Styling & UX Polish**
- Use a consistent design (colors, fonts).  
- Add transitions or animations when screens swap.  

**Step 10: Testing & Validation**
- Write unit tests for your service functions (`fetchTestQuestion`, `fetchVideoRecommendations`).  
- Add a simple end-to-end test: simulate tapping through test → resource → test.  

We'll start with **Step 1** in our next iteration—scaffolding the two screens—then review before moving on.

---

## 2. Code Review and Feedback

There isn't any code yet, so nothing to review. As soon as you scaffold the screens in **Step 1**, paste the snippets here and I'll walk through them with you, pointing out best practices and potential pitfalls.

---

## 3. Suggestions for Further Learning or Practice

- React Navigation docs: https://reactnavigation.org/ — learn how stack/tab navigators work.  
- Fetch API & async/await in React: MDN's guide on working with promises.  
- Intro to state management: Context API or Zustand for holding `currentTopic`.  
- Basic unit testing in React Native or React: Jest + React Testing Library tutorials.  
- YouTube Data API overview: Google's documentation on how to retrieve video lists.  

Feel free to ask any questions about Step 1 or anything else—let's build this together!