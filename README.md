# StudyCraft AI — AI-Powered Interactive Study Assistant
> **Flam Frontend Internship Assignment**

An interactive AI-powered learning tool that transforms unstructured study notes, technical concepts, and lecture text into structured flashcards and interactive assessment quizzes with zero raw chat boxes.

---

## 🚀 Features

- **Free-Form Text Input**: Paste raw lecture notes, technical articles, or revision topics.
- **Dual Mode Generation**:
  - 🗂️ **Interactive Flashcard Deck**: 3D animated card flips, self-assessment ratings ("Mastered" vs "Need Review"), review filtering, deck shuffle, and full keyboard navigation (Space / Arrow keys).
  - 📝 **Assessment Quiz**: Multiple-choice questions, instant scoring breakdown, explanation insights, and **Re-test wrong answers** mode.
- **Defensive Parsing & Schema Validation**: Raw model outputs are strictly validated (`lib/validateResult.js`) before reaching the UI.
- **Stale Response Guard**: Uses request sequence tokens (`useRef`) to prevent slow network responses from overwriting newer user requests.
- **Secure Backend Proxy**: Model calls are routed via an Express backend (`server/generate.js`) to ensure API keys are never exposed in the browser client.

---

## 🛠️ Project Structure

```
flam-frontend-assignment/
├── src/
│   ├── components/
│   │   ├── PromptInput.jsx       # Free-form text input + mode toggle
│   │   ├── ResultView.jsx        # Routes parsed data to the right view
│   │   ├── FlashcardDeck.jsx     # Interactive flashcard view with 3D flip & review filters
│   │   ├── QuizView.jsx          # Interactive quiz with scoring and wrong answer re-test
│   │   ├── ErrorState.jsx        # Shared error & retry UI with diagnostics
│   │   └── LoadingState.jsx      # Animated loading and schema validation feedback
│   ├── lib/
│   │   ├── api.js                # Frontend API client communicating with backend proxy
│   │   └── validateResult.js     # Defensive schema validator
│   ├── types/
│   │   └── result.js             # JSDoc type definitions documenting JSON shapes
│   ├── App.jsx                   # Main orchestration component with state management
│   ├── main.jsx                  # React DOM root entry
│   └── index.css                 # Premium dark-theme design tokens and animations
├── server/
│   └── generate.js               # Express proxy calling Groq with JSON mode
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js**: v18+ or v20+ / v22+
- **Groq API Key**: Free API key from [Groq Cloud Console](https://console.groq.com/keys)

### 2. Setup Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Add your Groq API key in `.env`:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
PORT=3001
```

### 3. Install Dependencies & Run
```bash
npm install
npm run dev
```

Both the backend proxy (`http://localhost:3001`) and Vite dev server (`http://localhost:5173`) will start concurrently.

---

## 🛡️ Failure & Edge Case Handling

1. **Malformed JSON / Non-JSON Output**: Caught defensively by `validateResult.js`. Renders friendly `ErrorState` with retry options without crashing React.
2. **Missing or Incomplete Schema Fields**: Validated structurally; required fields (e.g. `cards`, `questions`, options) are sanitized with defaults or surfaced as structured validation errors.
3. **Empty LLM Responses**: Handled as explicit errors rather than empty blank screens.
4. **Race Conditions & Stale Responses**: Managed via monotonic `requestId.current` counter to prevent slow earlier requests from overwriting newer user requests.
5. **Private API Keys**: All LLM requests originate from Node.js backend proxy.

---

## 🤖 AI Usage Note
- AI assistants were used for architectural planning, scaffolding initial component structure, and generating comprehensive mock schemas.
- All code, state management, validation logic, and styling have been reviewed and structured according to the assignment requirements.

---

## ⏱️ Time Spent
- **Total Time**: ~2.5 - 3 hours
