# StudyCraft AI (Flam Frontend Internship Assignment)

A high-performance, non-chatbot interactive study assistant built with **React** (hooks only, zero external CSS libraries), **Vite**, and **Groq AI**. StudyCraft AI transforms free-form study notes into structured 3D flashcards and interactive assessment quizzes with defensive schema validation, zero client-exposed API keys, and comprehensive edge-case handling.

---

## 🌟 Live Demo & Repository
- **Live URL**: Deployed on Vercel
- **GitHub Repository**: [StudyCraft_AI-FLAM_AI-](https://github.com/Maheshsd-234/StudyCraft_AI-FLAM_AI-.git)

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js** >= 18.0.0
- **Groq API Key** (Free tier available at [console.groq.com](https://console.groq.com/keys))

### 2. Configure Environment
Create a .env file in the project root:
`env
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
PORT=3001
`

### 3. Install & Run
`ash
# Install dependencies
npm install

# Start both backend proxy (port 3001) and Vite frontend (port 5173) concurrently:
npm run dev
`

Open **http://localhost:5173** in your browser.

---

## 🏗️ Architecture & Project Structure

`
flam-frontend-assignment/
├── api/
│   ├── generate.js          # Vercel Serverless proxy with Groq model fallback
│   └── health.js            # Serverless health-check diagnostic endpoint
├── src/
│   ├── components/
│   │   ├── PromptInput.jsx   # Textarea, mode toggle & sample presets
│   │   ├── ResultView.jsx    # Single routing view for validated structured data
│   │   ├── FlashcardDeck.jsx # Controlled 3D flip deck with mobile tap/keyboard & review filter
│   │   ├── QuizView.jsx      # Interactive quiz with answer locking & wrong-answer retest
│   │   ├── ErrorState.jsx    # Categorized error UI with diagnostics & 1-click Retry
│   │   └── LoadingState.jsx  # Mode-aware loading animation and schema feedback
│   ├── lib/
│   │   ├── api.js            # Frontend API client with AbortController & typed ApiError
│   │   └── validateResult.js # Defensive parser (strips fences, validates JSON schema)
│   ├── types/
│   │   └── result.js         # JSDoc type definitions for flashcards and quiz shapes
│   ├── App.jsx               # Orchestrator with status state machine & stale-response guard
│   ├── main.jsx              # React DOM entry
│   └── index.css             # Zero-dependency CSS variables for Dark/Light modes & mobile
├── server/
│   └── generate.js           # Express backend proxy for local development
├── vercel.json               # Vercel routing configuration
├── FAILURE_MODES.md          # Comprehensive edge-case handling specification
├── package.json
└── README.md
`

---

## 🛡️ Reliability & Defensive Handling

The application is engineered to ensure **zero crashes, zero silent hangs, and zero raw chat text output**:
1. **Defensive Schema Validation (src/lib/validateResult.js)**:
   - Strips markdown code fences ( `json ).
   - Safely parses JSON; catches syntax errors and invalid root structures.
   - Deeply inspects cards and quiz questions (types, minimum counts, option IDs).
   - Never throws; returns specific, human-readable rejection reasons.
2. **Stale Response Guard (src/App.jsx)**:
   - Uses a monotonic sequence token (equestId = useRef(0)) combined with an AbortController.
   - Rapid subsequent requests cancel in-flight network requests and immediately discard late-arriving responses.
3. **15-Second Server Timeout**:
   - The backend proxy enforces a strict 15-second AbortController timeout, returning HTTP 504 on hanging requests.
4. **Offline / Network Drops**:
   - Classified as typed 
etwork errors with 1-click **Retry** functionality.
5. **Whitespace Input Prevention**:
   - Client-side validation blocks empty or whitespace-only submissions inline.

---

## ✨ Features & Stretch Goals

- 🃏 **Interactive 3D Flashcard Deck**:
  - CSS 3D card flipping (otateY(180deg)).
  - Deck navigation with "3 / 10" counter and progress bar.
  - Shuffle cards ordering.
  - **Adaptive Input Support**: Keyboard shortcuts (<kbd>Space</kbd>/<kbd>Enter</kbd> to flip, <kbd>←</kbd>/<kbd>→</kbd> to navigate) on desktop, and responsive touch hints on mobile.
  - Self-assessment ratings ("Mastered" vs "Need Review") with review filtering.
- 📝 **Step-by-Step Assessment Quiz**:
  - One-at-a-time question progression with 4 distinct choices.
  - "Submit Answer" locks choices and reveals instant correct/incorrect visual feedback and educational explanations.
  - Comprehensive scoring summary with performance badges.
  - **"Retest Wrong Answers"**: Restarts the quiz using **only missed questions** in client-side state without making an extra API call.
- 💾 **Session & Progress Persistence**:
  - Last generated study set is saved to localStorage (studycraft_last_session) and re-validated defensively on page load.
  - In-progress quiz answers, current question, and submission history persist in localStorage across page reloads.
  - Header provides a **"Clear Session"** button to start fresh.
- 🌓 **Zero-Library Dark / Light Mode**:
  - Pure CSS variable theme toggle (data-theme="dark" / data-theme="light").
  - Persisted in localStorage with smooth color transitions.
- 📱 **Mobile Responsive ($\ge 375\text{px}$)**:
  - Accessible touch targets $\ge 44\text{px}$.
  - Fluid stacking on small viewports with no horizontal overflow.

---

## 🤖 AI Usage Note

In accordance with the assignment guidelines, here is the honest breakdown of how AI tools were utilized:
- **AI Collaboration (Antigravity IDE / Claude & Gemini)**:
  - **Architecture & Scaffolding**: Formulating the phase breakdown, designing structured JSON schemas in src/types/result.js, and configuring the initial Vite + Express proxy setup.
  - **System Prompt Design**: Drafting the strict JSON prompts for Groq models (openai/gpt-oss-120b, llama-3.3-70b-versatile).
  - **Diagnostic Test Suites**: Generating automated simulation scripts (	est-validation.js) to verify edge cases.
- **Developer Review & Logic Implementation**:
  - Authored the defensive schema validator in src/lib/validateResult.js.
  - Implemented the monotonic sequence guard (equestId.current) and AbortController cancellation in src/App.jsx.
  - Engineered the 3D card flip CSS animations and client-side wrong-answer retest state in QuizView.jsx.
  - Tuned the responsive CSS token system and touch targets for mobile devices.

---

## ⏱️ Time Spent Breakdown

| Phase | Description | Time Spent |
| :--- | :--- | :--- |
| **Phase 0** | Assignment analysis, schema design (src/types/result.js), project scaffolding | ~30 mins |
| **Phase 1** | Express backend proxy & Vercel serverless function with Groq API fallback & 15s timeout | ~35 mins |
| **Phase 2** | Strict prompt engineering & defensive validator (src/lib/validateResult.js) | ~40 mins |
| **Phase 3** | Frontend API client with typed errors, equestId stale guard & AbortController | ~30 mins |
| **Phase 4** | Controlled 3D FlashcardDeck with keyboard navigation, shuffle & review filter | ~45 mins |
| **Phase 5** | Interactive QuizView with answer locking, explanations & wrong-answer retest | ~45 mins |
| **Phase 6** | Failure mode simulations & documentation (FAILURE_MODES.md) | ~30 mins |
| **Phase 7** | 375px mobile viewport responsiveness & $\ge 44\text{px}$ touch target optimization | ~35 mins |
| **Phase 8** | LocalStorage session/quiz progress persistence & CSS-variable Dark/Light theme | ~30 mins |
| **Total** | | **~5.3 Hours** |
