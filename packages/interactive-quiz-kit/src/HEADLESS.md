# Headless Mode: Using Interactive Quiz Kit Logic Without the UI

**`interactive-quiz-kit`** is designed with a modular architecture, allowing you to use its entire core logic independently of the React UI components. This "headless" mode is ideal for use cases such as:

- Building a backend for quiz management and intelligent content generation.
- Integrating learning logic into a mobile application (React Native, Flutter, etc.).
- Running automated scripts for content creation or data analysis.
- Integrating with other JavaScript frameworks besides React.

This document guides you on how to import and use the library's primary headless features from the core **`@thanh01pmt/interactive-quiz-kit`** entry point.

## I. Overview of Headless Components

The library's non-UI components are organized into the following key areas:

| Directory/File | Primary Function                                                                                                 |
| :------------- | :--------------------------------------------------------------------------------------------------------------- |
| `types.ts`     | **(Core)** Defines all TypeScript interfaces for the entire ecosystem (`QuizConfig`, `QuizResult`, `PracticeStats`, etc.). |
| `services/`    | **(Core)** Contains headless classes (services) for running, authoring, analyzing, and packaging quizzes.          |
| `ai/`          | Contains headless `async` functions (flows) for generating content and performing analysis using AI.             |
| `utils/`       | General-purpose utility functions, such as unique ID generators and robust JSON parsers.                         |

---

## II. Detailed Analysis of Headless Components

Here is a breakdown of each component, its role, and its importance in headless mode.

### **A. `types.ts` - The Foundation**

- **Role:** This is the most critical file. It contains TypeScript interfaces that act as the "data contracts" for the entire library. Understanding types like `QuizConfig`, `QuizQuestion`, and `PracticeSession` is fundamental to using any part of the kit.
- **Importance:** **Fundamental**.

---

### **B. Core Authoring & Runtime Services**

These services form the backbone of creating and running quizzes.

1. **`services/QuizEditorService.ts` - The Builder**
    - **Role:** A tool for **creating, modifying, deleting, and arranging** questions within a `QuizConfig` object. This service is for the _authoring_ phase.
    - **Key Methods:** `createNewQuestionTemplate()`, `addQuestion()`, `updateQuestion()`, `deleteQuestionByIndex()`.
    - **Importance:** **Core** for any task related to managing quiz content.

2. **`services/QuizEngine.ts` - The Conductor**
    - **Role:** Manages the entire lifecycle of an **actual quiz-taking session**. This service is for the _runtime_ phase.
    - **Key Methods:** `nextQuestion()`, `submitAnswer()`, `calculateResults()`.
    - **Importance:** **Core** for any application that allows users to _take_ a quiz.

3. **`services/QuestionImportService.ts` - The Interpreter**
    - **Role:** Processes and transforms question data from external formats (JSON, TSV) into the library's standard `QuizQuestion` structure.
    - **Key Methods:** `processJSON()`, `processTSV()`.
    - **Importance:** A **Bridge** for integrating data from other sources.

---

### **C. Personalized Learning Services**

These headless services power the analytics and personalization features. They are designed to work with client-side storage (`localStorage`) but can be adapted for backend use.

1. **`services/PracticeHistoryService.ts` - The Structured Learning Analyst**
    - **Role:** Stores and analyzes a user's practice history for **curriculum-aligned quizzes**.
    - **Key Methods:** `saveCompletedPracticeSession()`, `getPracticeHistory()`, `getPracticeStats()`. The `getPracticeStats()` method is particularly powerful, as it computes streaks, activity calendars, and performance breakdowns by topic.
    - **Importance:** **Core** for building analytics, dashboards, and feeding data to the AI suggestion engine for structured learning.

2. **`services/FreestyleQuizService.ts` - The Ad-hoc Learning Analyst**
    - **Role:** Manages quizzes and results generated from user-uploaded documents that **do not map** to the main curriculum.
    - **Key Methods:** `saveCompletedFreestyleSession()`, `getFreestyleHistory()`.
    - **Importance:** **Architectural Keystone**. It isolates "freestyle" learning data, preventing it from contaminating the structured learning analytics and ensuring the integrity of AI-powered suggestions.

3. **`services/KnowledgeCardService.ts` - The Librarian**
    - **Role:** Manages the creation, storage, and retrieval of AI-generated "Knowledge Cards" (flashcards). It supports a resumable, two-stage generation process.
    - **Key Methods:** `saveCardPlan()`, `getPendingConcepts()`, `saveGeneratedCard()`, `getCards()`.
    - **Importance:** An **Advanced Feature** for building knowledge reinforcement tools.

4. **`services/UserConfigService.ts` & `services/AchievementService.ts` & `services/RoadmapService.ts`**
    - **Role:** These services manage user settings (name, goals), gamification logic (unlocking badges), and the AI-generated weekly roadmap, respectively.
    - **Importance:** **Supporting** services for creating a personalized and engaging user experience.

---

### **D. AI Content & Analysis Flows (`ai/`)**

- **Role:** Provides `async` functions to communicate with AI. All flows are headless and can be called from any environment.
- **Key Flow Groups:**
  - **Single Question Generators:** `generateMCQQuestion`, `generateTFQuestion`, etc. for creating individual questions.
  - **Full Quiz Generators:** `generateQuizPlan` + `generateQuestionsFromQuizPlan` for structured, curriculum-based quizzes, and `generateQuizFromText` for freestyle quizzes from documents.
  - **Intelligent Analysis & Tutoring:**
    - `assessAndMapDocument`: The "triage" flow. Analyzes a document's relevance to the curriculum and maps it to specific Learning Objectives.
    - `generatePracticeSuggestion`: Acts as an AI tutor, analyzing a user's history to suggest a personalized practice plan.
    - `generateLearningAnalysis`: Creates a detailed performance report and a weekly roadmap.
    - `generateQuizReview`: Analyzes a `QuizResult` to provide personalized feedback and remediation.
- **Importance:** **Advanced Features** for systems that require content automation and intelligent tutoring.

---

## III. Headless Usage Examples

All examples assume you are importing from the core entry point: `@thanh01pmt/interactive-quiz-kit`.

### 1. Creating a Quiz Programmatically

Use `QuizEditorService` to build a `QuizConfig` object from scratch.

```typescript
import { QuizEditorService, emptyQuiz } from "@thanh01pmt/interactive-quiz-kit";
import type { MultipleChoiceQuestion } from "@thanh01pmt/interactive-quiz-kit";

// Start with an empty quiz config
const editor = new QuizEditorService(emptyQuiz);

// Create a question template
const mcqTemplate = QuizEditorService.createNewQuestionTemplate(
  "MULTIPLE_CHOICE"
) as MultipleChoiceQuestion;

// Populate the question details
mcqTemplate.prompt = "What is the capital of France?";
mcqTemplate.options = [
  { id: "opt1", text: "Berlin" },
  { id: "opt2", text: "Paris" },
  { id: "opt3", text: "Madrid" },
];
mcqTemplate.correctAnswerId = "opt2";

// Add the question to the quiz
editor.addQuestion(mcqTemplate);

const finalQuizConfig = editor.getQuiz();
// Now you can save `finalQuizConfig` to your database or a file.
console.log(JSON.stringify(finalQuizConfig, null, 2));
```

### 2. Implementing the "Intelligent Ingestion" Pipeline

This example showcases the powerful combination of headless services and AI flows to analyze a user-uploaded document.

```typescript
import { TopicDataService } from "@thanh01pmt/interactive-quiz-kit";
import { assessAndMapDocument, generateQuizFromText } from "@thanh01pmt/interactive-quiz-kit/ai";
import type { LearningObjective } from "@thanh01pmt/interactive-quiz-kit";

async function processUploadedDocument(documentText: string, apiKey: string) {
  try {
    // 1. Gather curriculum data using a headless service
    const allLearningObjectives: LearningObjective[] = TopicDataService.getData();

    // 2. Call the AI triage flow to assess and map the document
    const analysis = await assessAndMapDocument({
      language: "Vietnamese",
      documentContent: documentText,
      learningObjectives: allLearningObjectives,
    }, apiKey);

    // 3. Decide the next step based on the AI's analysis
    console.log(`Document Relevance Score: ${analysis.relevanceScore}`);
    if (analysis.isFreestyleRecommended) {
      console.log("Recommendation: Proceeding with Freestyle Mode.");
      // Generate a quiz that will be saved to the freestyle history
      const freestyleQuiz = await generateQuizFromText({ documentContent: documentText }, apiKey);
      console.log(`Generated ${freestyleQuiz.generatedQuestions.length} freestyle questions.`);
      // ... logic to save/run this quiz using FreestyleQuizService ...
    } else {
      console.log("Recommendation: Integrating into curriculum.");
      console.log("Mapped Learning Objectives:", analysis.mappedLOs);
      // ... logic to generate a structured quiz using the mapped LOs ...
    }

  } catch (error) {
    console.error("Error processing document:", error);
  }
}
```

### 3. Packaging for SCORM (Backend Task)

These functions generate the text content for SCORM package files, perfect for a backend build process.

```typescript
import { generateSCORMManifest, generateLauncherHTML } from '@thanh01pmt/interactive-quiz-kit';
import type { QuizConfig } from '@thanh01pmt/interactive-quiz-kit';
// import * as fs from 'fs'; // For use in a Node.js environment

const myQuizConfig: QuizConfig = /* ... your quiz config ... */;

// Generate manifest content
const manifestXML = generateSCORMManifest(myQuizConfig, "1.2");
console.log('--- imsmanifest.xml ---');
console.log(manifestXML);
// fs.writeFileSync('dist/imsmanifest.xml', manifestXML);

// Generate launcher HTML content
const launcherHTML = generateLauncherHTML(
  myQuizConfig, 
  'player.js', 
  'quiz_data.json',
  'blockly-styles.css',
  'styles.css'
);
console.log('\n--- index.html ---');
console.log(launcherHTML);
// fs.writeFileSync('dist/index.html', launcherHTML);
```

**Note:** The `exportQuizAsSCORMZip` function is a browser-only utility. To create a ZIP package on a backend, you would use a library like `jszip` and replicate the steps found in `services/scormPackaging.ts`.
