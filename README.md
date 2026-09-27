# StudyCraft AI — Interactive AI Study Assistant
> **Flam Frontend Internship Assignment**

StudyCraft AI is an interactive, non-chatbot web application that transforms free-form study notes, lecture excerpts, and technical topics into structured, reliable learning tools. Powered by Groq's `llama-3.3-70b-versatile` running in strict JSON mode, the app routes unpredictable AI outputs through a defensive validation layer before dynamically rendering them into 3D flip flashcard decks (with keyboard navigation, shuffling, and self-assessment ratings) or step-by-step assessment quizzes (with immediate answer locking, score breakdowns, and client-side wrong-answer retesting).

---

## ⚡ Quickstart & Setup

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v22)
- **Groq API Key**: Free API key from [Groq Cloud Console](https://console.groq.com/keys)

### 2. Environment Setup
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Add your Groq API key:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
PORT=3001
```

### 3. Install & Run
```bash
# Install all dependencies (express, cors, groq-sdk, react, vite, lucide-react)
npm install

# Start both backend proxy (port 3001) and Vite frontend (port 5173) concurrently:
npm run dev
```

Alternatively, you can run them in separate terminal windows:
```bash
# Terminal 1: Backend Express Proxy
npm run server

# Terminal 2: Frontend Vite Client
npm run client
```
Open **`http://localhost:5173`** in your browser.

---

## 🏗️ Architecture & Project Structure

```
flam-frontend-assignment/
├── src/
│   ├── components/
│   │   ├── PromptInput.jsx       # Free-form textarea, mode toggle & sample presets
│   │   ├── ResultView.jsx        # Single routing view for validated structured data
│   │   ├── FlashcardDeck.jsx     # Controlled 3D flip card deck with keyboard & review filter
│   │   ├── QuizView.jsx          # Interactive quiz with answer locking & wrong-answer retest
│   │   ├── ErrorState.jsx        # Shared error UI with typed badges, diagnostics & Retry
│   │   └── LoadingState.jsx      # Mode-aware loading animation and schema feedback
│   ├── lib/
│   │   ├── api.js                # Frontend API client with AbortController & typed ApiError
│   │   └── validateResult.js     # Defensive parser (strips fences, validates JSON schema)
│   ├── types/
│   │   └── result.js             # JSDoc type definitions for flashcards and quiz shapes
│   ├── App.jsx                   # Orchestrator with status state machine & stale-response guard
│   ├── main.jsx                  # React DOM entry
│   └── index.css                 # Zero-dependency CSS variables for Dark/Light modes & mobile
├── server/
│   └── generate.js               # Express backend proxy keeping API keys private
├── .env.example
├── .gitignore
├── FAILURE_MODES.md              # Comprehensive edge-case handling specification
├── package.json
├── vite.config.js
└── README.md
```

---

## 🛡️ Reliability & Defensive Handling

The application is engineered to ensure **zero crashes, zero silent hangs, and zero raw chat text output**:
1. **Defensive Schema Validation (`src/lib/validateResult.js`)**:
   - Strips markdown code fences (` ```json `).
   - Safely parses JSON; catches syntax errors and invalid root structures.
   - Deeply inspects cards and quiz questions (types, minimum counts, option IDs).
   - Never throws; returns specific, human-readable rejection reasons.
2. **Stale Response Guard (`src/App.jsx`)**:
   - Uses a monotonic sequence token (`requestId = useRef(0)`) combined with an `AbortController`.
   - Rapid subsequent requests cancel in-flight network requests and immediately discard late-arriving responses.
3. **15-Second Server Timeout**:
   - The backend proxy enforces a strict 15-second `AbortController` timeout, returning HTTP 504 on hanging requests.
4. **Offline / Network Drops**:
   - Classified as typed `network` errors with 1-click **Retry** functionality.
5. **Whitespace Input Prevention**:
   - Client-side validation blocks empty or whitespace-only submissions inline.

*For complete details, manual reproduction steps, and automated verification notes, see [FAILURE_MODES.md](file:///c:/Users/mahes/OneDrive/Desktop/Intership.Projects/StudyAssistant%28FLAW_AI%29/FAILURE_MODES.md).*

---

## ✨ Features & Stretch Goals

- 🗂️ **Interactive 3D Flashcard Deck**:
  - CSS 3D card flipping (`rotateY(180deg)`).
  - Deck navigation with `"3 / 10"` counter and progress bar.
  - Shuffle cards ordering.
  - **Full Keyboard Operability**: <kbd>Space</kbd>/<kbd>Enter</kbd> to flip, <kbd>←</kbd>/<kbd>→</kbd> to navigate.
  - Self-assessment ratings ("Mastered" vs "Need Review") with review filtering.
- 📝 **Step-by-Step Assessment Quiz**:
  - One-at-a-time question progression with 4 distinct choices.
  - "Submit Answer" locks choices and reveals instant correct/incorrect visual feedback and educational explanations.
  - Comprehensive scoring summary with performance badges.
  - **"Retest Wrong Answers"**: Restarts the quiz using **only missed questions** in client-side state without making an extra API call.
- 💾 **Session & Progress Persistence**:
  - Last generated study set is saved to `localStorage` (`studycraft_last_session`) and re-validated defensively on page load.
  - In-progress quiz answers, current question, and submission history persist in `localStorage` across page reloads.
  - Header provides a **"Clear Session"** button to start fresh.
- 🌓 **Zero-Library Dark / Light Mode**:
  - Pure CSS variable theme toggle (`data-theme="dark"` / `data-theme="light"`).
  - Persisted in `localStorage` with smooth color transitions.
- 📱 **Mobile Responsive ($\ge 375\text{px}$)**:
  - Accessible touch targets $\ge 44\text{px}$.
  - Fluid stacking on small viewports with no horizontal overflow.

---

## 🤖 AI Usage Note

In accordance with the assignment guidelines, here is the exact breakdown of how AI tools were utilized:
- **Claude 3.7 Sonnet & Gemini (Antigravity IDE)**:
  - **Architecture & Scaffolding**: Formulating the phase breakdown, designing structured JSON schemas in `src/types/result.js`, and configuring the initial Vite + Express proxy setup.
  - **System Prompt Design**: Drafting the strict JSON prompts for Groq's Llama-3 model.
  - **Diagnostic Test Suites**: Generating automated simulation scripts (`test-validation.js`, `test-failure-modes.mjs`) to verify edge cases.
- **Developer Review & Logic Implementation**:
  - Authored the defensive schema validator in `src/lib/validateResult.js`.
  - Implemented the monotonic sequence guard (`requestId.current`) and AbortController cancellation.
  - Engineered the 3D card flip CSS animations and client-side wrong-answer retest state in `QuizView.jsx`.
  - Tuned the responsive CSS token system and touch targets.

---

## ⚠️ Known Limitations

1. **Groq Rate Limits on Free Tier**: The free Groq tier has token-per-minute (TPM) limits; heavy repetitive testing within seconds may encounter brief rate limits (handled gracefully via the retry UI).
2. **Fixed Multiple-Choice Format**: The quiz generator currently creates 4-choice questions; true/false or open-response formats are not currently supported.
3. **Local Storage Scope**: Session and quiz progress are stored locally per device/browser and do not sync across different machines.
4. **Input Length**: Very large lecture notes (>8,000 words) may approach context limits and would benefit from an upstream document chunking pipeline in a production deployment.

---

## ⏱️ Time Spent Breakdown

| Phase | Description | Time Spent |
| :--- | :--- | :--- |
| **Phase 0** | Assignment analysis, schema design (`src/types/result.js`), project scaffolding | ~30 mins |
| **Phase 1** | Express backend proxy (`server/generate.js`) with Groq API, CORS & 15s timeout | ~35 mins |
| **Phase 2** | Strict prompt engineering & defensive validator (`src/lib/validateResult.js`) | ~40 mins |
| **Phase 3** | Frontend API client with typed errors, `requestId` stale guard & AbortController | ~30 mins |
| **Phase 4** | Controlled 3D `FlashcardDeck` with keyboard navigation, shuffle & review filter | ~45 mins |
| **Phase 5** | Interactive `QuizView` with answer locking, explanations & wrong-answer retest | ~45 mins |
| **Phase 6** | Failure mode simulations & documentation (`FAILURE_MODES.md`) | ~30 mins |
| **Phase 7** | 375px mobile viewport responsiveness & $\ge 44\text{px}$ touch target optimization | ~35 mins |
| **Phase 8** | LocalStorage session/quiz progress persistence & CSS-variable Dark/Light theme | ~30 mins |
| **Total** | | **~5.3 Hours** |
"# StudyCraft_AI-FLAM_AI-" 
