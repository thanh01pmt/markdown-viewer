# Interactive Quiz Kit

[![NPM version](https://img.shields.io/npm/v/@thanh01.pmt/interactive-quiz-kit.svg)](https://www.npmjs.com/package/@thanh01.pmt/interactive-quiz-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Interactive Quiz Kit** is a comprehensive TypeScript library built with React, designed to effortlessly create, manage, play, and distribute interactive quizzes. It provides a robust core logic (`QuizEngine`), reusable React UI components, and support for a wide variety of question types.

The library is architected for Easy extension and integration, featuring a powerful authoring tool, AI-powered content generation (using Google's Genkit and Gemini), and SCORM packaging for seamless LMS integration.

## ✨ Features

* **Robust Core Engine**: Handles state management, navigation, automatic grading, and time tracking.
* **Rich Question Support**: Includes 12+ question types, from Multiple Choice to complex ones like Blockly/Scratch Programming and Hotspot.
* **Modular React UI Kit**: A full suite of components to build quiz players and authoring tools, organized into logical entry points.
* **Headless Mode**: Use all core logic, services, and AI flows independently of the React UI. Ideal for backend integrations, custom frontends, or automation scripts.
* **Advanced AI Capabilities**:
  * **Single Question Generation**: Create individual questions based on topic, context, and difficulty.
  * **Full Quiz Generation**: Generate entire, well-structured quizzes using a two-stage planning process.
  * **AI-Powered Practice Mode**: Generate personalized 10-question quizzes on-the-fly from a user-provided curriculum.
* **Flexible Content Import**: Import curriculum data and learning objectives from TSV files to power the AI Practice Mode.
* **SCORM & Webhook Integration**:
  * Package quizzes as SCORM 1.2 compliant ZIP files.
  * Send detailed quiz results to a specified webhook URL.

## 🚀 Installation

```bash
npm install @thanh01.pmt/interactive-quiz-kit
# or
yarn add @thanh01.pmt/interactive-quiz-kit
```

**Peer Dependencies:** This library requires `react` and `react-dom` as peer dependencies. Ensure they are installed in your project.

## 📚 Usage

This library is modular, allowing you to import only the parts you need.

### Understanding the Entry Points

The package is split into several entry points for optimized usage:

* `@thanh01.pmt/interactive-quiz-kit`: The core "headless" library. Contains all types, services (`QuizEngine`, `QuizEditorService`), and utilities. Use this for backend logic or custom UIs.
* `@thanh01.pmt/interactive-quiz-kit/react-ui`: General-purpose UI components like `<QuizPlayer>` and `<QuizResult>`.
* `@thanh01.pmt/interactive-quiz-kit/authoring`: The complete UI suite for creating and editing quizzes, centered around the `<QuizAuthoringTool>` component.
* `@thanh01.pmt/interactive-quiz-kit/ai`: The headless functions for AI-powered content generation.
* `@thanh01.pmt/interactive-quiz-kit/player`: A dedicated entry point for the player bundle, useful for SCORM packaging.

### 1. Displaying a Quiz (Player Mode)

Use the `<QuizPlayer>` component for the test-taker's experience.

```tsx
import React from 'react';
import { QuizPlayer } from '@thanh01.pmt/interactive-quiz-kit/react-ui';
import type { QuizConfig, QuizResultType } from '@thanh01.pmt/interactive-quiz-kit';

// 1. Define or load your quiz configuration
const myQuiz: QuizConfig = {
  id: "my-first-quiz",
  title: "React Basics Quiz",
  questions: [ /* ... array of question objects ... */ ],
  settings: {
    shuffleQuestions: true,
    timeLimitMinutes: 15
  }
};

const MyQuizPage = () => {
  const handleQuizComplete = (result: QuizResultType) => {
    console.log("Quiz Complete!", result);
    // Send result to your backend, or display a summary
  };

  return (
    <div className="container">
      <QuizPlayer
        quizConfig={myQuiz}
        onQuizComplete={handleQuizComplete}
      />
    </div>
  );
};
```

### 2. Creating Quizzes (Authoring Mode)

Use the `<QuizAuthoringTool>` for a complete content creation interface.

```tsx
import React from 'react';
import { QuizAuthoringTool } from '@thanh01.pmt/interactive-quiz-kit/authoring';
import { emptyQuiz } from '@thanh01.pmt/interactive-quiz-kit';
import type { QuizConfig } from '@thanh01.pmt/interactive-quiz-kit';

const MyAuthoringPage = () => {
  const handleSave = (quiz: QuizConfig) => {
    console.log("Quiz saved:", quiz);
    // Persist the quiz config (e.g., to a database or localStorage)
  };

  // Start with an empty quiz template for creation
  return (
    <QuizAuthoringTool
      initialQuizConfig={emptyQuiz}
      onSaveQuiz={handleSave}
    />
  );
};
```

### 3. Using the "Practice with AI" Feature

The library includes a complete application flow for AI-powered practice sessions.

```tsx
import React from 'react';
// AppController is a conceptual component you would build
// using the blocks provided by the library.
import { AppController } from './components/AppController'; 

// This component would render the main menu, allowing users to switch
// between Authoring, Practice Mode, and Managing Topics.
const FullApplication = () => {
  return <AppController />;
};
```

### 4. Headless Mode (Core Logic Only)

Use the library's services in any JavaScript/TypeScript environment.

> For detailed examples and a full component list, see [**HEADLESS.md**](./HEADLESS.md).

#### Example: Creating a Quiz Programmatically

```typescript
import { QuizEditorService, emptyQuiz } from '@thanh01.pmt/interactive-quiz-kit';
import type { MultipleChoiceQuestion } from '@thanh01.pmt/interactive-quiz-kit';

// Start with an empty quiz config
const editor = new QuizEditorService(emptyQuiz);

// Create and populate a question
const mcqTemplate = QuizEditorService.createNewQuestionTemplate('multiple_choice') as MultipleChoiceQuestion;
mcqTemplate.prompt = "What is the capital of France?";
mcqTemplate.options = [
  { id: 'opt1', text: 'Berlin' },
  { id: 'opt2', text: 'Paris' },
];
mcqTemplate.correctAnswerId = 'opt2';

editor.addQuestion(mcqTemplate);
const finalQuizConfig = editor.getQuiz();

console.log(finalQuizConfig);
```

#### Example: Generating a Question with AI

*Requires Genkit environment setup.*

```typescript
import { generateTrueFalseQuestion } from '@thanh01.pmt/interactive-quiz-kit/ai';

async function createNewQuestion() {
  try {
    const { question } = await generateTrueFalseQuestion({
      topic: "The history of the internet",
      difficulty: "Medium"
    });

    if (question) {
      console.log("AI-generated question:", question);
    }
  } catch (error) {
    console.error("Failed to generate question:", error);
  }
}
```

## Supported Question Types

The library supports a wide array of 12+ question types, including:

* `multiple_choice`
* `multiple_response`
* `true_false`
* `short_answer`
* `numeric`
* `fill_in_the_blanks`
* `sequence`
* `matching`
* `drag_and_drop`
* `hotspot`
* `blockly_programming`
* `scratch_programming`

## Known Issues

* **Asset Integration for Programming Questions**: Using `Blockly` or `Scratch` questions requires manually copying assets (`js`, `css`, `media`) from their respective `node_modules` folders into your project's `public` directory for the UI components to render correctly.
* **SCORM Packaging**: The SCORM export function relies on fetching the player assets (`player.js`, `styles.css`) from your `public` folder at the time of packaging. Ensure these files are present and accessible.
* **AI Generation Limits**: AI generation is not yet supported for visually complex types like `Drag and Drop`, `Hotspot`, `Blockly`, or `Scratch`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue if you have ideas for improvements or find a bug.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
