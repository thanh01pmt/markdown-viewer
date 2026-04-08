# Hướng Dẫn Triển Khai Course Platform: Astro + Netlify + GitHub

> **Mục tiêu:** Thiết lập một lần, vận hành mãi mãi.  
> Code Astro và Content Markdown hoàn toàn độc lập nhau.

---

## 📐 Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GitHub                                       │
│                                                                      │
│   ┌─────────────────────┐       ┌──────────────────────────┐        │
│   │  astro-site (repo)  │       │  course-content (repo)   │        │
│   │  - Framework code   │       │  - lessons/*.mdx         │        │
│   │  - Components       │       │  - slides/*.mdx          │        │
│   │  - Layouts          │       │  - quizzes/*.mdx         │        │
│   │  - netlify.toml     │       │  - labs/*.mdx            │        │
│   └──────────┬──────────┘       └─────────────┬────────────┘        │
│              │                                │                      │
│              │                    push to main│                      │
│              │                                ▼                      │
│              │                   GitHub Action: trigger webhook      │
└──────────────┼───────────────────────────────────────────────────────┘
               │  Netlify pull astro-site + clone content repo
               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Netlify Build                                 │
│                                                                      │
│   git clone course-content → content/                               │
│   npm run build (Astro SSG)                                         │
│   → Static files deploy to CDN                                      │
└─────────────────────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────┐
│              https://your-course.netlify.app                        │
│                                                                      │
│   /lessons/recursion          → LessonPlan layout                   │
│   /slides/recursion-visual    → Slide layout (RevealJS)             │
│   /quizzes/recursion-check    → Quiz layout                         │
│   /labs/fibonacci-lab         → Lab layout (Code Runner)            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Cấu trúc thư mục

### Repo 1: `astro-site`

```
astro-site/
├── netlify.toml                    # Build config
├── astro.config.mjs                # Astro config
├── package.json
├── tsconfig.json
│
├── src/
│   ├── pages/
│   │   ├── index.astro             # Trang chủ / danh sách bài
│   │   └── [...slug].astro         # Dynamic routing cho mọi content
│   │
│   ├── layouts/
│   │   ├── LessonPlanLayout.astro
│   │   ├── SlideLayout.astro
│   │   ├── QuizLayout.astro
│   │   ├── LabLayout.astro
│   │   ├── ArticleLayout.astro
│   │   └── FlashcardLayout.astro
│   │
│   ├── components/
│   │   ├── code/
│   │   │   ├── CodeRunner.tsx      # Dispatcher: JS/Python/C++
│   │   │   ├── SandpackEditor.tsx  # JS runner
│   │   │   ├── PyodideRunner.tsx   # Python runner (WASM)
│   │   │   └── PistonRunner.tsx    # C++ runner (API)
│   │   │
│   │   ├── quiz/
│   │   │   ├── QuizEngine.tsx
│   │   │   ├── QuestionSingle.tsx
│   │   │   ├── QuestionMultiple.tsx
│   │   │   └── QuizResult.tsx
│   │   │
│   │   ├── ui/
│   │   │   ├── Callout.astro       # Note, Warning, Tip boxes
│   │   │   ├── Mermaid.astro       # Diagram renderer
│   │   │   ├── Flashcard.tsx
│   │   │   └── ProgressBar.tsx
│   │   │
│   │   └── nav/
│   │       ├── Sidebar.astro
│   │       ├── Breadcrumb.astro
│   │       └── TableOfContents.astro
│   │
│   ├── content/                    # Được clone từ course-content repo
│   │   ├── config.ts               # Zod schema cho từng content type
│   │   ├── lessons/
│   │   ├── slides/
│   │   ├── quizzes/
│   │   ├── labs/
│   │   └── articles/
│   │
│   └── styles/
│       ├── global.css
│       └── themes/
│           ├── default.css
│           └── dark.css
│
└── public/
    └── fonts/
```

### Repo 2: `course-content`

```
course-content/
├── README.md                       # Hướng dẫn cho contributors
├── .github/
│   └── workflows/
│       └── trigger-build.yml       # Auto-trigger Netlify khi push
│
├── lessons/
│   ├── 01-intro-to-programming.mdx
│   ├── 02-variables-and-types.mdx
│   └── 03-recursion.mdx
│
├── slides/
│   ├── recursion-visual.mdx
│   └── sorting-algorithms.mdx
│
├── quizzes/
│   ├── recursion-check.mdx
│   └── week-1-review.mdx
│
├── labs/
│   ├── fibonacci-lab.mdx
│   └── bubble-sort-lab.mdx
│
├── articles/
│   └── how-memory-works.mdx
│
└── flashcards/
    └── algorithms-glossary.mdx
```

---

## ⚙️ PHẦN 1 — Cài đặt Astro Site

### Bước 1.1 — Khởi tạo project

```bash
npm create astro@latest astro-site -- \
  --template minimal \
  --typescript strict \
  --no-git

cd astro-site

# Cài dependencies
npm install @astrojs/mdx @astrojs/react
npm install react react-dom
npm install @types/react @types/react-dom

# Code runners
npm install @codesandbox/sandpack-react   # JS runner
npm install @pyodide/pyodide              # Python WASM (optional, lazy load)

# UI & Slides
npm install reveal.js
npm install mermaid
```

### Bước 1.2 — `astro.config.mjs`

```javascript
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [
    mdx({
      // Cho phép dùng React components trong .mdx
      remarkPlugins: [],
      rehypePlugins: [],
    }),
    react(),
  ],

  // Content collections nằm trong src/content/
  // (được clone từ course-content repo lúc build)
  output: 'static',
});
```

### Bước 1.3 — Content Schema (`src/content/config.ts`)

```typescript
import { defineCollection, z } from 'astro:content';

// Schema dùng chung
const baseSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  publishedAt: z.date().optional(),
  draft: z.boolean().default(false),
});

// Lesson Plan
const lessons = defineCollection({
  type: 'content',
  schema: baseSchema.extend({
    type: z.literal('lesson-plan'),
    duration: z.number(),              // phút
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    objectives: z.array(z.string()),
    prerequisites: z.array(z.string()).default([]),
  }),
});

// Slide
const slides = defineCollection({
  type: 'content',
  schema: baseSchema.extend({
    type: z.literal('slide'),
    theme: z.enum(['default', 'dark', 'academic', 'minimal']).default('default'),
    transition: z.enum(['slide', 'fade', 'zoom']).default('slide'),
  }),
});

// Quiz
const quizzes = defineCollection({
  type: 'content',
  schema: baseSchema.extend({
    type: z.literal('quiz'),
    passingScore: z.number().min(0).max(100).default(70),
    shuffle: z.boolean().default(false),
    questions: z.array(z.object({
      q: z.string(),
      type: z.enum(['single', 'multiple', 'truefalse']),
      options: z.array(z.string()).optional(),
      answer: z.union([z.number(), z.array(z.number()), z.boolean()]),
      explain: z.string().optional(),
    })),
  }),
});

// Lab (Runnable Code)
const labs = defineCollection({
  type: 'content',
  schema: baseSchema.extend({
    type: z.literal('lab'),
    language: z.enum(['python', 'javascript', 'cpp']),
    starterCode: z.string().optional(),
    solution: z.string().optional(),
    checkpoints: z.array(z.string()).default([]),
  }),
});

// Article
const articles = defineCollection({
  type: 'content',
  schema: baseSchema.extend({
    type: z.literal('article'),
  }),
});

// Flashcard
const flashcards = defineCollection({
  type: 'content',
  schema: baseSchema.extend({
    type: z.literal('flashcard'),
    cards: z.array(z.object({
      front: z.string(),
      back: z.string(),
    })),
  }),
});

export const collections = {
  lessons,
  slides,
  quizzes,
  labs,
  articles,
  flashcards,
};
```

### Bước 1.4 — Dynamic Routing (`src/pages/[...slug].astro`)

```astro
---
import { getCollection } from 'astro:content';
import LessonPlanLayout from '../layouts/LessonPlanLayout.astro';
import SlideLayout from '../layouts/SlideLayout.astro';
import QuizLayout from '../layouts/QuizLayout.astro';
import LabLayout from '../layouts/LabLayout.astro';
import ArticleLayout from '../layouts/ArticleLayout.astro';
import FlashcardLayout from '../layouts/FlashcardLayout.astro';

export async function getStaticPaths() {
  const allContent = [
    ...(await getCollection('lessons')).map(e => ({ ...e, basePath: 'lessons' })),
    ...(await getCollection('slides')).map(e => ({ ...e, basePath: 'slides' })),
    ...(await getCollection('quizzes')).map(e => ({ ...e, basePath: 'quizzes' })),
    ...(await getCollection('labs')).map(e => ({ ...e, basePath: 'labs' })),
    ...(await getCollection('articles')).map(e => ({ ...e, basePath: 'articles' })),
    ...(await getCollection('flashcards')).map(e => ({ ...e, basePath: 'flashcards' })),
  ];

  return allContent.map(entry => ({
    params: { slug: `${entry.basePath}/${entry.slug}` },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();

const layouts = {
  'lesson-plan': LessonPlanLayout,
  'slide': SlideLayout,
  'quiz': QuizLayout,
  'lab': LabLayout,
  'article': ArticleLayout,
  'flashcard': FlashcardLayout,
};

const Layout = layouts[entry.data.type];
---

<Layout frontmatter={entry.data}>
  <Content />
</Layout>
```

---

## ⚙️ PHẦN 2 — Tách Content Repo & Auto Deploy

### Bước 2.1 — `netlify.toml` trong `astro-site`

```toml
[build]
  # Clone content repo rồi mới build
  command = """
    git clone --depth=1 \
      https://x-access-token:${CONTENT_REPO_TOKEN}@github.com/YOUR_ORG/course-content.git \
      src/content \
    && npm run build
  """
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

# Preview deploy cho mỗi PR
[context.deploy-preview]
  command = """
    git clone --depth=1 \
      https://x-access-token:${CONTENT_REPO_TOKEN}@github.com/YOUR_ORG/course-content.git \
      src/content \
    && npm run build
  """

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
```

### Bước 2.2 — GitHub Action trong `course-content`

```yaml
# course-content/.github/workflows/trigger-build.yml
name: Trigger Netlify Build

on:
  push:
    branches: [main]
  workflow_dispatch:    # Cho phép trigger thủ công

jobs:
  trigger-netlify:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Netlify Deploy
        run: |
          curl -s -X POST \
            -H "Content-Type: application/json" \
            "${{ secrets.NETLIFY_BUILD_HOOK }}"
          echo "✅ Netlify build triggered"
```

### Bước 2.3 — Cấu hình secrets

**Trong `course-content` GitHub repo → Settings → Secrets:**
```
NETLIFY_BUILD_HOOK = https://api.netlify.com/build_hooks/YOUR_HOOK_ID
```

**Trong Netlify → Site settings → Environment variables:**
```
CONTENT_REPO_TOKEN = ghp_xxxxxxxxxxxx   # GitHub Personal Access Token
                                         # (chỉ cần quyền read content repo)
```

**Lấy Netlify Build Hook:**  
Netlify Dashboard → Site → Site configuration → Build hooks → Add build hook

---

## ⚙️ PHẦN 3 — Demo Components

### Component 1: LessonPlan Layout

```astro
---
// src/layouts/LessonPlanLayout.astro
const { frontmatter } = Astro.props;

const difficultyColor = {
  beginner: '#22c55e',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
};
---

<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>{frontmatter.title}</title>
  <link rel="stylesheet" href="/styles/global.css" />
</head>
<body class="lesson-layout">
  <aside class="sidebar">
    <slot name="sidebar" />
  </aside>

  <main class="lesson-main">
    <!-- Header -->
    <header class="lesson-header">
      <div class="lesson-meta">
        <span class="badge" style={`background: ${difficultyColor[frontmatter.difficulty]}`}>
          {frontmatter.difficulty}
        </span>
        <span class="duration">⏱ {frontmatter.duration} phút</span>
      </div>
      <h1>{frontmatter.title}</h1>

      <!-- Objectives -->
      <div class="objectives-box">
        <h3>🎯 Mục tiêu bài học</h3>
        <ul>
          {frontmatter.objectives.map(obj => <li>{obj}</li>)}
        </ul>
      </div>

      <!-- Prerequisites -->
      {frontmatter.prerequisites.length > 0 && (
        <div class="prereq-box">
          <h3>📋 Kiến thức cần có</h3>
          <div class="prereq-tags">
            {frontmatter.prerequisites.map(pre => (
              <a href={`/lessons/${pre}`} class="prereq-tag">{pre}</a>
            ))}
          </div>
        </div>
      )}
    </header>

    <!-- Nội dung bài học (từ .mdx) -->
    <article class="lesson-content">
      <slot />
    </article>
  </main>
</body>
</html>
```

**File content tương ứng (`course-content/lessons/03-recursion.mdx`):**

```mdx
---
type: lesson-plan
title: "Đệ quy và Stack Memory"
duration: 90
difficulty: intermediate
objectives:
  - Hiểu call stack hoạt động thế nào
  - Phân biệt base case và recursive case
  - Viết được hàm đệ quy đơn giản
prerequisites:
  - 02-variables-and-types
tags: [python, algorithms]
---

import CodeRunner from '../components/code/CodeRunner';
import Callout from '../components/ui/Callout.astro';

## Đệ quy là gì?

Đệ quy là kỹ thuật lập trình mà **hàm tự gọi chính nó**.

<Callout type="warning">
  Mọi hàm đệ quy **bắt buộc** phải có base case, nếu không sẽ gây stack overflow.
</Callout>

## Ví dụ: Tính giai thừa

<CodeRunner
  client:load
  language="python"
  code={`def factorial(n):
    # Base case
    if n == 0:
        return 1
    # Recursive case
    return n * factorial(n - 1)

print(factorial(5))   # 120
print(factorial(0))   # 1`}
/>
```

---

### Component 2: Slide Layout (RevealJS)

```astro
---
// src/layouts/SlideLayout.astro
const { frontmatter } = Astro.props;
---

<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js/dist/reveal.css" />
  <link rel="stylesheet"
    href={`https://cdn.jsdelivr.net/npm/reveal.js/dist/theme/${frontmatter.theme}.css`}
  />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js/plugin/highlight/monokai.css" />
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <!--
        Mỗi <section> trong .mdx = 1 slide
        Dùng --- để phân cách slides trong mdx
      -->
      <slot />
    </div>
  </div>

  <script type="module">
    import Reveal from 'https://cdn.jsdelivr.net/npm/reveal.js/dist/reveal.esm.js';
    import Highlight from 'https://cdn.jsdelivr.net/npm/reveal.js/plugin/highlight/highlight.esm.js';

    Reveal.initialize({
      hash: true,
      transition: '{frontmatter.transition}',
      plugins: [Highlight],
    });
  </script>
</body>
</html>
```

**File content (`course-content/slides/recursion-visual.mdx`):**

```mdx
---
type: slide
title: "Đệ quy — Minh hoạ trực quan"
theme: black
transition: slide
---

<section>
  ## Đệ quy là gì?

  > Hàm **tự gọi chính nó**

  Giống như gương đặt trước gương...
</section>

<section>
  ## Call Stack

  ```python
  factorial(3)
    └── factorial(2)
          └── factorial(1)
                └── factorial(0) → 1
  ```
</section>

<section data-background="#1e3a5f">
  ## Base Case — Quan trọng nhất

  ❌ Không có base case → **Stack Overflow**

  ✅ Luôn kiểm tra: *Khi nào hàm dừng lại?*
</section>
```

---

### Component 3: Quiz Engine

```tsx
// src/components/quiz/QuizEngine.tsx
import { useState } from 'react';

interface Question {
  q: string;
  type: 'single' | 'multiple' | 'truefalse';
  options?: string[];
  answer: number | number[] | boolean;
  explain?: string;
}

interface QuizEngineProps {
  questions: Question[];
  passingScore: number;
  shuffle?: boolean;
}

export default function QuizEngine({ questions, passingScore, shuffle }: QuizEngineProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<(number | boolean | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [submitted, setSubmitted] = useState(false);

  const q = questions[current];

  const isCorrect = (idx: number) => {
    const ans = questions[idx].answer;
    const sel = selected[idx];
    if (typeof ans === 'boolean') return sel === ans;
    if (typeof ans === 'number') return sel === ans;
    return false; // multiple choice: extend later
  };

  const score = submitted
    ? Math.round((questions.filter((_, i) => isCorrect(i)).length / questions.length) * 100)
    : 0;

  const passed = score >= passingScore;

  if (submitted) {
    return (
      <div className={`quiz-result ${passed ? 'passed' : 'failed'}`}>
        <div className="score-circle">{score}%</div>
        <h2>{passed ? '🎉 Xuất sắc!' : '📚 Cần ôn thêm'}</h2>
        <p>{passed ? `Đạt yêu cầu (≥${passingScore}%)` : `Chưa đạt (cần ≥${passingScore}%)`}</p>

        <div className="review">
          {questions.map((q, i) => (
            <div key={i} className={`review-item ${isCorrect(i) ? 'correct' : 'wrong'}`}>
              <span>{isCorrect(i) ? '✅' : '❌'}</span>
              <span>{q.q}</span>
              {!isCorrect(i) && q.explain && (
                <p className="explain">💡 {q.explain}</p>
              )}
            </div>
          ))}
        </div>

        <button onClick={() => {
          setSelected(new Array(questions.length).fill(null));
          setSubmitted(false);
          setCurrent(0);
        }}>
          🔄 Làm lại
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-engine">
      <div className="quiz-progress">
        <div className="progress-bar">
          <div style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
        <span>Câu {current + 1} / {questions.length}</span>
      </div>

      <div className="question-card">
        <h3>{q.q}</h3>

        {q.type === 'truefalse' ? (
          <div className="options">
            {['Đúng', 'Sai'].map((label, i) => (
              <button
                key={i}
                className={`option ${selected[current] === (i === 0) ? 'selected' : ''}`}
                onClick={() => {
                  const next = [...selected];
                  next[current] = i === 0;
                  setSelected(next);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <div className="options">
            {q.options?.map((opt, i) => (
              <button
                key={i}
                className={`option ${selected[current] === i ? 'selected' : ''}`}
                onClick={() => {
                  const next = [...selected];
                  next[current] = i;
                  setSelected(next);
                }}
              >
                <span className="option-label">{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="quiz-nav">
        <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)}>
          ← Trước
        </button>

        {current < questions.length - 1 ? (
          <button
            disabled={selected[current] === null}
            onClick={() => setCurrent(c => c + 1)}
          >
            Tiếp →
          </button>
        ) : (
          <button
            disabled={selected.some(s => s === null)}
            onClick={() => setSubmitted(true)}
            className="submit-btn"
          >
            Nộp bài ✓
          </button>
        )}
      </div>
    </div>
  );
}
```

**File content (`course-content/quizzes/recursion-check.mdx`):**

```mdx
---
type: quiz
title: "Kiểm tra: Đệ quy"
passingScore: 70
shuffle: false
questions:
  - q: "Base case trong đệ quy có tác dụng gì?"
    type: single
    options:
      - "Làm cho hàm chạy nhanh hơn"
      - "Dừng vòng lặp đệ quy"
      - "Tăng hiệu suất bộ nhớ"
      - "Không có tác dụng gì"
    answer: 1
    explain: "Base case là điều kiện dừng, thiếu nó sẽ gây stack overflow"

  - q: "Hàm đệ quy không có base case sẽ gây ra lỗi gì?"
    type: single
    options:
      - "SyntaxError"
      - "TypeError"
      - "RecursionError / Stack Overflow"
      - "MemoryError"
    answer: 2

  - q: "Đệ quy luôn chậm hơn vòng lặp thông thường"
    type: truefalse
    answer: false
    explain: "Không đúng — với một số bài toán (tree traversal, divide & conquer), đệ quy có thể tương đương hoặc tự nhiên hơn"
---

import QuizEngine from '../components/quiz/QuizEngine';

<QuizEngine
  client:load
  questions={frontmatter.questions}
  passingScore={frontmatter.passingScore}
  shuffle={frontmatter.shuffle}
/>
```

---

### Component 4: Code Runner (Dispatcher)

```tsx
// src/components/code/CodeRunner.tsx
import { useState, lazy, Suspense } from 'react';

// Lazy load để không ảnh hưởng performance trang không cần code runner
const SandpackEditor = lazy(() => import('./SandpackEditor'));
const PyodideRunner = lazy(() => import('./PyodideRunner'));
const PistonRunner = lazy(() => import('./PistonRunner'));

interface CodeRunnerProps {
  language: 'python' | 'javascript' | 'cpp';
  code: string;
  readonly?: boolean;
}

export default function CodeRunner({ language, code, readonly = false }: CodeRunnerProps) {
  return (
    <div className="code-runner-wrapper">
      <div className="code-runner-header">
        <span className="lang-badge">{language.toUpperCase()}</span>
        {language === 'python' && <span className="engine-badge">Pyodide WASM</span>}
        {language === 'javascript' && <span className="engine-badge">Sandpack</span>}
        {language === 'cpp' && <span className="engine-badge">Piston API</span>}
      </div>

      <Suspense fallback={<div className="runner-loading">Đang tải môi trường...</div>}>
        {language === 'javascript' && (
          <SandpackEditor code={code} readonly={readonly} />
        )}
        {language === 'python' && (
          <PyodideRunner code={code} readonly={readonly} />
        )}
        {language === 'cpp' && (
          <PistonRunner code={code} language="cpp" readonly={readonly} />
        )}
      </Suspense>
    </div>
  );
}
```

```tsx
// src/components/code/PyodideRunner.tsx
import { useState, useEffect, useRef } from 'react';

export default function PyodideRunner({ code: initialCode, readonly }: { code: string; readonly?: boolean }) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const pyodideRef = useRef<any>(null);

  // Load Pyodide chỉ khi user click Run lần đầu
  const loadPyodide = async () => {
    if (pyodideRef.current) return;
    setOutput('⏳ Đang tải Python runtime...');
    const { loadPyodide } = await import('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.mjs' as any);
    pyodideRef.current = await loadPyodide();
    setPyodideReady(true);
    setOutput('✅ Python runtime sẵn sàng. Nhấn Run để chạy.');
  };

  const runCode = async () => {
    if (!pyodideRef.current) {
      await loadPyodide();
      return;
    }
    setLoading(true);
    setOutput('');
    try {
      // Capture stdout
      pyodideRef.current.runPython(`
        import sys
        import io
        sys.stdout = io.StringIO()
      `);
      pyodideRef.current.runPython(code);
      const stdout = pyodideRef.current.runPython('sys.stdout.getvalue()');
      setOutput(stdout || '(Không có output)');
    } catch (err: any) {
      setOutput(`❌ Error:\n${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="code-editor">
      <textarea
        className="code-textarea"
        value={code}
        onChange={e => !readonly && setCode(e.target.value)}
        readOnly={readonly}
        spellCheck={false}
      />
      <div className="code-toolbar">
        <button
          className="run-btn"
          onClick={runCode}
          disabled={loading}
        >
          {loading ? '⏳ Đang chạy...' : '▶ Run'}
        </button>
        <button onClick={() => setCode(initialCode)}>↺ Reset</button>
      </div>
      {output && (
        <pre className="code-output">{output}</pre>
      )}
    </div>
  );
}
```

```tsx
// src/components/code/PistonRunner.tsx — cho C++
import { useState } from 'react';

const PISTON_API = 'https://emkc.org/api/v2/piston/execute'; // public instance
// Hoặc self-host: 'https://your-piston.fly.dev/api/v2/piston/execute'

export default function PistonRunner({ code: initialCode, language }: { code: string; language: string }) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const runCode = async () => {
    setLoading(true);
    setOutput('');
    try {
      const res = await fetch(PISTON_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'c++',
          version: '*',
          files: [{ name: 'main.cpp', content: code }],
          stdin: '',
        }),
      });
      const data = await res.json();
      const result = data.run?.output || data.compile?.output || 'No output';
      setOutput(result);
    } catch (err: any) {
      setOutput(`❌ Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="code-editor">
      <textarea
        className="code-textarea"
        value={code}
        onChange={e => setCode(e.target.value)}
        spellCheck={false}
      />
      <div className="code-toolbar">
        <button className="run-btn" onClick={runCode} disabled={loading}>
          {loading ? '⏳ Compiling...' : '▶ Run'}
        </button>
        <button onClick={() => setCode(initialCode)}>↺ Reset</button>
      </div>
      {output && <pre className="code-output">{output}</pre>}
    </div>
  );
}
```

---

### Component 5: Callout (dùng trong bất kỳ layout nào)

```astro
---
// src/components/ui/Callout.astro
const { type = 'info' } = Astro.props;

const config = {
  info:    { icon: 'ℹ️', label: 'Ghi chú',  color: '#3b82f6' },
  warning: { icon: '⚠️', label: 'Lưu ý',    color: '#f59e0b' },
  tip:     { icon: '💡', label: 'Mẹo hay',  color: '#22c55e' },
  danger:  { icon: '🚨', label: 'Nguy hiểm',color: '#ef4444' },
};

const { icon, label, color } = config[type];
---

<div class="callout" style={`border-left-color: ${color}`}>
  <div class="callout-header" style={`color: ${color}`}>
    <span>{icon}</span>
    <strong>{label}</strong>
  </div>
  <div class="callout-body">
    <slot />
  </div>
</div>

<style>
  .callout {
    border-left: 4px solid;
    padding: 1rem 1.25rem;
    margin: 1.5rem 0;
    border-radius: 0 8px 8px 0;
    background: rgba(0,0,0,0.03);
  }
  .callout-header {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
```

---

## ⚙️ PHẦN 4 — Triển khai lên Netlify

### Bước 4.1 — Kết nối `astro-site` với Netlify

1. Vào [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. Chọn repo `astro-site`
3. Build settings:
   - Build command: *(để trống — `netlify.toml` đã xử lý)*
   - Publish directory: `dist`
4. **Deploy**

### Bước 4.2 — Tạo Build Hook

1. Netlify → Site → **Site configuration** → **Build hooks**
2. **Add build hook** → Đặt tên: `content-update`
3. Copy URL: `https://api.netlify.com/build_hooks/XXXXXXXX`
4. Thêm vào GitHub Secrets của `course-content` repo:
   - Key: `NETLIFY_BUILD_HOOK`
   - Value: URL vừa copy

### Bước 4.3 — Tạo GitHub Token cho Netlify đọc content

1. GitHub → Settings → **Developer settings** → **Personal access tokens** → Fine-grained
2. Permissions: `Contents: Read-only` cho repo `course-content`
3. Thêm vào Netlify → **Environment variables**:
   - Key: `CONTENT_REPO_TOKEN`
   - Value: token vừa tạo

### Bước 4.4 — Kiểm tra pipeline

```bash
# Test trong astro-site repo
git commit --allow-empty -m "test: trigger build"
git push

# Test trong course-content repo
echo "# Test" >> lessons/test.mdx
git add . && git commit -m "test: content update"
git push
# → Netlify sẽ rebuild trong 1-2 phút
```

---

## ⚙️ PHẦN 5 — Workflow cho Contributors

### Cho contributor kỹ thuật (biết Git)

```bash
# Clone content repo
git clone https://github.com/YOUR_ORG/course-content.git
cd course-content

# Tạo bài mới
cp lessons/_template.mdx lessons/04-sorting.mdx

# Chỉnh sửa, preview local (cần cài mdx-preview hoặc xem trên preview deploy)
# Push → GitHub Action tự trigger build
git add . && git commit -m "feat: add sorting lesson"
git push origin main
```

### Cho contributor không biết Git (TinaCMS)

1. Vào `https://your-course.netlify.app/admin` (TinaCMS visual editor)
2. Đăng nhập GitHub
3. Chỉnh sửa nội dung qua giao diện trực quan
4. Nhấn Save → TinaCMS tự tạo commit vào `course-content` repo
5. GitHub Action tự trigger Netlify build

**Cài TinaCMS:**

```bash
# Trong astro-site
npx @tinacms/cli@latest init

# Cấu hình tina/config.ts để trỏ vào content-repo
# (xem docs: tina.io/docs)
```

---

## ⚙️ PHẦN 6 — Content Template Files

Tạo file `_template.mdx` cho mỗi loại để contributor dùng làm mẫu:

```mdx
<!-- course-content/lessons/_template.mdx -->
---
type: lesson-plan
title: "Tên bài học"
duration: 60
difficulty: beginner    # beginner | intermediate | advanced
objectives:
  - Mục tiêu 1
  - Mục tiêu 2
prerequisites: []
tags: []
draft: true             # Đặt false khi ready để publish
---

import CodeRunner from '../components/code/CodeRunner';
import Callout from '../components/ui/Callout.astro';

## Giới thiệu

Nội dung giới thiệu...

<Callout type="info">
  Ghi chú quan trọng ở đây
</Callout>

## Nội dung chính

...

## Ví dụ code

<CodeRunner
  client:load
  language="python"
  code={`# Code mẫu ở đây
print("Hello, World!")`}
/>

## Tổng kết

- Điểm 1
- Điểm 2
```

---

## 📊 Tóm tắt toàn bộ stack

| Layer | Tool | Ghi chú |
|---|---|---|
| Framework | **Astro** | SSG + Island Architecture |
| Content Format | **MDX** | Markdown + React components |
| Content Routing | Astro Content Collections | Type-safe với Zod schema |
| JS Runner | **Sandpack** | Iframe sandbox, no server needed |
| Python Runner | **Pyodide** | WASM, chạy 100% trong browser |
| C++ Runner | **Piston API** | Docker sandbox, self-hostable |
| Slides | **RevealJS** | Embed trong SlideLayout |
| Diagrams | **Mermaid** | Render lúc build |
| CMS | **TinaCMS** | Git-backed, visual editor |
| Hosting | **Netlify** | Free tier: 100GB bandwidth/tháng |
| Auto Deploy | GitHub Actions + Netlify Build Hook | Push content → live trong 2 phút |
| Search | **Pagefind** | Static search, chạy client-side |

---

## 🚀 Thứ tự thực hiện

```
Tuần 1
  ✅ Tạo 2 GitHub repos (astro-site, course-content)
  ✅ Setup Astro + MDX + React
  ✅ Viết Content Schema (config.ts)
  ✅ Dynamic routing [...slug].astro
  ✅ Deploy lên Netlify

Tuần 2
  ✅ LessonPlan layout hoàn chỉnh
  ✅ Article layout
  ✅ Callout, Mermaid components
  ✅ Setup GitHub Action + Build Hook
  ✅ Kiểm tra pipeline tự động

Tuần 3
  ✅ Python runner (Pyodide)
  ✅ JS runner (Sandpack)
  ✅ C++ runner (Piston API)
  ✅ Lab layout

Tuần 4
  ✅ Quiz component hoàn chỉnh
  ✅ Slide layout (RevealJS)
  ✅ Flashcard component
  ✅ TinaCMS setup

Sau này (khi cần)
  ⬜ Supabase auth + progress tracking
  ⬜ PDF export (Puppeteer)
  ⬜ Pagefind search
  ⬜ Self-host Piston API (Fly.io hoặc Railway)
```

---

*Tài liệu này đủ để setup một lần và vận hành lâu dài. Mọi thay đổi về nội dung chỉ cần chạm vào `course-content` repo, không bao giờ cần đụng vào `astro-site`.*