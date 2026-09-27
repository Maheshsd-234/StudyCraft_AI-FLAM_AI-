# 🛡️ Failure Modes & Defensive Handling Specification

This document details how **StudyCraft AI** handles edge cases, unexpected LLM outputs, network disruptions, and user input validation. The core design philosophy is: **Never crash, never silently hang, and never render empty or malformed states to the user.**

---

## 1. Valid JSON, Wrong Shape (Schema Mismatch)

* **Description**: The AI model returns syntactically valid JSON, but the structure deviates from the expected schema (e.g., missing `cards` or `questions` array, missing `question`/`answer` keys, or insufficient options).
* **How It Is Handled**: 
  - [`src/lib/validateResult.js`](file:///c:/Users/mahes/OneDrive/Desktop/Intership.Projects/StudyAssistant%28FLAW_AI%29/src/lib/validateResult.js) inspects every level of the object hierarchy.
  - If a required key or array element is missing, it returns `{ valid: false, reason: "Missing required 'cards' property in response object" }`.
  - [`src/lib/api.js`](file:///c:/Users/mahes/OneDrive/Desktop/Intership.Projects/StudyAssistant%28FLAW_AI%29/src/lib/api.js) converts this into a typed `ApiError(reason, 'invalid_shape', rawDetails)`.
  - [`src/components/ErrorState.jsx`](file:///c:/Users/mahes/OneDrive/Desktop/Intership.Projects/StudyAssistant%28FLAW_AI%29/src/components/ErrorState.jsx) renders a **"Schema Violation"** badge, friendly message, diagnostic accordion, and a **Retry** button.
* **Manual Repro Note**: Temporarily modify `server/generate.js` system prompt to return `{"notes_summary": "...", "items": []}` instead of `{"cards": [...]}`.

---

## 2. JSON Wrapped in Markdown Fences (`` ```json ... ``` ``)

* **Description**: Some LLMs wrap their response in markdown code blocks (` ```json\n{...}\n``` `) despite instructions.
* **How It Is Handled**: 
  - [`stripCodeFences()`](file:///c:/Users/mahes/OneDrive/Desktop/Intership.Projects/StudyAssistant%28FLAW_AI%29/src/lib/validateResult.js) uses regex normalization to strip leading ```` ```json ```` or ```` ``` ```` and trailing ```` ``` ```` before executing `JSON.parse`.
  - The cleaned JSON parses transparently without triggering an error, allowing valid UI rendering.
* **Manual Repro Note**: Temporarily change the server prompt to instruct the model to "wrap the JSON output in triple backticks with a json identifier".

---

## 3. Empty Response String

* **Description**: The model returns an empty string `""`, whitespace only, or an empty collection array `[]`.
* **How It Is Handled**: 
  - Handled at three defensive layers:
    1. `server/generate.js` checks `if (!rawContent || !rawContent.trim())` and returns HTTP 502 with `{ error: "Model returned an empty response" }`.
    2. `src/lib/api.js` checks for empty strings before parsing.
    3. `src/lib/validateResult.js` returns `{ valid: false, reason: "The 'cards' array is empty; expected at least 1 flashcard" }`.
  - The UI renders an **"Empty Output"** error state with a Retry button rather than an empty blank canvas.
* **Manual Repro Note**: Temporarily simulate an empty response in `server/generate.js` by returning `res.json({ raw: "" })`.

---

## 4. Network Drop / Server Timeout Mid-Request

* **Description**: The connection is dropped mid-flight, the server crashes, or the model hangs for longer than 15 seconds.
* **How It Is Handled**: 
  - **15s Timeout**: `server/generate.js` runs an `AbortController` timeout at 15,000ms. If exceeded, it returns HTTP `504` with `{ error: "timeout" }`.
  - **Network Failure**: `fetch()` throws in `src/lib/api.js`, which catches it and throws a typed `ApiError(..., 'network')`.
  - **UI Recovery**: `App.jsx` catches the error, stops the loading spinner, and renders `ErrorState` with a **"Server Connection Error"** or **"Request Timed Out"** badge and an active **Retry** button.
  - **Stale Response Guard**: If a user cancels and submits a second request while the first is pending, `requestId.current` sequence matching ensures the late timeout/error is silently discarded.
* **Manual Repro Note**: Stop the backend proxy server (`Ctrl + C` on port 3001) while submitting a prompt in the frontend.

---

## 5. Empty or Whitespace-Only User Input

* **Description**: The user attempts to submit an empty prompt or a textarea containing only spaces/newlines.
* **How It Is Handled**: 
  - [`src/components/PromptInput.jsx`](file:///c:/Users/mahes/OneDrive/Desktop/Intership.Projects/StudyAssistant%28FLAW_AI%29/src/components/PromptInput.jsx) evaluates `notes.trim().length === 0`.
  - The **Generate** submit button is automatically disabled (`disabled={!isInputValid || isLoading}`).
  - An inline badge warning appears: *"Input cannot be whitespace only"*.
  - `handleSubmit` and `src/lib/api.js` both defensively reject empty submissions before any HTTP request is dispatched.
* **Manual Repro Note**: Paste multiple spaces or newlines into the textarea and attempt to press Enter or click the disabled Generate button.

---

## 📊 Summary Matrix

| Failure Mode | Trigger Point | Catch Mechanism | UI Presentation | User Recovery |
| :--- | :--- | :--- | :--- | :--- |
| **Wrong Shape** | Model Response | `validateResult.js` | Schema Violation Error | 1-Click Retry |
| **Fenced JSON** | Model Output | `stripCodeFences()` | Seamless Flashcard / Quiz UI | N/A (Auto-Recovered) |
| **Empty Response** | Server / Model | Backend + Validator | Empty Output Error | 1-Click Retry |
| **Network / 15s Timeout** | Network / Server | AbortController + Catch | Connection Error / Timeout | 1-Click Retry |
| **Whitespace Input** | Client Form | `PromptInput.jsx` | Disabled Button + Inline Alert | Enter Valid Notes |
