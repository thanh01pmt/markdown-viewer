# Headless Mode: Using `interactive-quiz-kit` Logic Without the UI

**`interactive-quiz-kit`** is designed with a modular architecture, allowing you to use its entire core logic independently of the React UI components. This "headless" mode is ideal for use cases such as:

* Building a backend to manage and generate quizzes.
* Integrating quiz logic into a mobile application (React Native, Flutter, etc.).
* Running automated scripts for content creation or data processing.
* Integrating with JavaScript frameworks other than React.

This document will guide you on how to import and use the library's main headless features.

## I. Overview of Headless Components & Entry Points

The non-UI components of the library are accessible through specific entry points for optimized, modular usage.

| Entry Point / File                               | Main Function                                                                   |
| :----------------------------------------------- | :------------------------------------------------------------------------------ |
| `@thanh01.pmt/interactive-quiz-kit`              | **(Core)** Contains all types, core services, and utilities.                    |
| `@thanh01.pmt/interactive-quiz-kit/ai`           | **(AI)** Contains flows for generating quiz content using Artificial Intelligence. |
| `src/services/TopicDataService.ts`               | **(Service)** Manages curriculum data imported from TSV files.                  |
| `src/services/SCORMService.ts` & related files | **(Service)** Provides tools for SCORM packaging and communication.             |

### 1. What is Headless Mode and Why is it Important?

Imagine the library is a complete car. The UI (`react-ui/`) is the body, interior, steering wheel, and dashboard—everything you see and interact with. "Headless mode" means you can take the entire **engine, chassis, drivetrain, and control unit (ECU)** and fit it into a different body—like a truck, a boat, or even an industrial machine.

In other words, **headless mode allows you to use all the logic, business processes, and data handling capabilities of the library without the bundled React UI.**

**Why is this important?**

* **Maximum Flexibility:** You are not tied to React. You can build your UI with Vue, Svelte, Angular, or even native mobile apps (iOS, Android) and simply call the library's core logic.
* **Automation & Backend Integration:** You can run processes on a server, for example:
  * A nightly cron job that uses the AI module to automatically generate hundreds of new questions and save them to a database.
  * An API endpoint to manage, edit, and publish quizzes.
* **Logic Reusability:** Ensures that business logic (e.g., how a question is graded) is consistent everywhere, from the web and mobile to internal scripts.

---

## II. Core Headless Services

### 1. Types - The Foundation

Before you start, familiarize yourself with the main data types. All interactions with the library revolve around them.

```typescript
import { QuizConfig, TrueFalseQuestion } from '@thanh01.pmt/interactive-quiz-kit';

// Create a question
const myQuestion: TrueFalseQuestion = {
  id: 'tf-001',
  questionType: 'true_false',
  prompt: 'The sun rises in the west.',
  correctAnswer: false,
  points: 10
};

// Create a complete quiz configuration
const myQuizConfig: QuizConfig = {
  id: 'my-first-headless-quiz',
  title: 'Fun Science Quiz',
  questions: [myQuestion],
  settings: {
    shuffleQuestions: true,
    timeLimitMinutes: 10
  }
};
```

**Most important types:** `QuizConfig`, `QuizQuestion`, `QuizResultType`, and specific question types like `MultipleChoiceQuestion`.

### 2. `QuizEditorService`: The Quiz Builder

This service allows you to perform CRUD (Create, Read, Update, Delete) operations on a `QuizConfig` object.

```typescript
import { QuizEditorService, emptyQuiz } from '@thanh01.pmt/interactive-quiz-kit';
import type { TrueFalseQuestion } from '@thanh01.pmt/interactive-quiz-kit';

// Start with an empty quiz
const editor = new QuizEditorService(emptyQuiz);

// Create a new True/False question template
const tfQuestion = QuizEditorService.createNewQuestionTemplate('true_false') as TrueFalseQuestion;

// Update the question's details
tfQuestion.prompt = "Is the Earth a perfect sphere?";
tfQuestion.correctAnswer = false;

// Add the question to the quiz
editor.addQuestion(tfQuestion);

// Get the final QuizConfig object
const finalQuizConfig = editor.getQuiz();

console.log(JSON.stringify(finalQuizConfig, null, 2));
```

### 3. `QuizEngine`: The Runtime Conductor

This service is the brain that processes the logic when a user is taking a quiz.

```typescript
import { QuizEngine } from '@thanh01.pmt/interactive-quiz-kit';
import type { QuizConfig, QuizResultType } from '@thanh01.pmt/interactive-quiz-kit';

// Assume you have a myQuizConfig object
const myQuizConfig: QuizConfig = /* ... */;

console.log("Starting quiz...");

const engine = new QuizEngine({
  config: myQuizConfig,
  callbacks: {
    onQuestionChange: (question, qNum, total) => {
      console.log(`\n--- Question ${qNum}/${total} ---`);
      console.log(question?.prompt);
    },
    onQuizFinish: (result: QuizResultType) => {
      console.log("\n--- RESULTS ---");
      console.log(`Score: ${result.score}/${result.maxScore}`);
      console.log(`Percentage: ${result.percentage.toFixed(2)}%`);
      console.log(`Status: ${result.passed ? 'Passed' : 'Failed'}`);
    }
  }
});

// Simulate the quiz-taking process
const question1 = engine.getCurrentQuestion();
if (question1) {
  // Assuming question 1 is True/False
  engine.submitAnswer(question1.id, false); 
}

engine.nextQuestion();

const question2 = engine.getCurrentQuestion();
if (question2) {
    // Assuming question 2 is Multiple Choice
  engine.submitAnswer(question2.id, 'id_of_the_correct_answer');
}

// Finish the quiz
engine.calculateResults();
```

### 4. `TopicDataService`: The Curriculum Manager

This service manages learning objective data imported from TSV files, powering the "Practice with AI" feature.

```typescript
import { TopicDataService } from '@thanh01.pmt/interactive-quiz-kit';
import type { LearningObjective } from '@thanh01.pmt/interactive-quiz-kit';
// In a browser environment:
// import tsvContent from './my_curriculum.tsv?raw';

// const { data, errors } = TopicDataService.parseTSV(tsvContent);
// if (errors.length === 0) {
//   TopicDataService.saveData(data);
// }

// const subjects = TopicDataService.getSubjects();
// console.log('Available Subjects:', subjects);
```

---

## III. AI-Powered Content Generation

You can use the AI flows to automatically generate quiz content. These functions are `async`.

*Note: To use these, you need a configured Google Genkit environment and the necessary environment variables (e.g., `GOOGLE_API_KEY`).*

```typescript
import { generateMCQQuestion, generatePracticeQuiz } from '@thanh01.pmt/interactive-quiz-kit/ai';
import type { LearningObjective } from '@thanh01.pmt/interactive-quiz-kit';

async function createAIQuestion() {
  try {
    console.log('Generating a Multiple Choice question about the Solar System...');
    const result = await generateMCQQuestion({
      topic: 'The Solar System',
      difficulty: 'Easy',
      language: 'English'
    }, 'YOUR_API_KEY');

    if (result.question) {
      console.log('Generated Question:', JSON.stringify(result.question, null, 2));
    }
  } catch (error) {
    console.error('Error generating AI question:', error);
  }
}

async function createAIPracticeQuiz() {
    try {
        // Assume 'selectedLOs' is an array of LearningObjective objects
        const selectedLOs: LearningObjective[] = /* ... from TopicDataService ... */;
        const result = await generatePracticeQuiz({
            learningObjectives: selectedLOs,
            quizDifficulty: 'Medium',
            language: 'English'
        }, 'YOUR_API_KEY');

        console.log(`Generated ${result.generatedQuestions?.length || 0} practice questions.`);
    } catch (error) {
        console.error('Error generating practice quiz:', error);
    }
}

// createAIQuestion();
```

---

## IV. Packaging and Publishing

These functions help create the components of a SCORM package. They return string content that you can write to files.

```typescript
import { generateSCORMManifest, generateLauncherHTML } from '@thanh01.pmt/interactive-quiz-kit';
import type { QuizConfig } from '@thanh01.pmt/interactive-quiz-kit';
// import * as fs from 'fs'; // For use in a Node.js environment

// Assume you have a myQuizConfig object
const myQuizConfig: QuizConfig = /* ... */;

// Generate manifest content
const manifestXML = generateSCORMManifest(myQuizConfig, "1.2");
console.log('--- imsmanifest.xml ---');
console.log(manifestXML);
// fs.writeFileSync('dist/imsmanifest.xml', manifestXML);

// Generate HTML launcher content
const launcherHTML = generateLauncherHTML(
    myQuizConfig,
    'player.js', // Path to the JS bundle inside the ZIP
    'quiz_data.json', // Path to the quiz data inside the ZIP
    'blockly-styles.css', // Path to blockly css
    'styles.css' // Path to main css
);
console.log('\n--- index.html ---');
console.log(launcherHTML);
// fs.writeFileSync('dist/index.html', launcherHTML);
```

**Note:** The `exportQuizAsSCORMZip` function is designed to run in the browser as it interacts with the DOM to trigger a file download. To package a ZIP on the backend, you would use a library like `jszip` and follow the steps outlined in `services/scormPackaging.ts`.
