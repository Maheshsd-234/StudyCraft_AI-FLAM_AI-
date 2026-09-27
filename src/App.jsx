import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, GraduationCap, Sun, Moon, Trash2, RefreshCw } from 'lucide-react';
import PromptInput from './components/PromptInput.jsx';
import ResultView from './components/ResultView.jsx';
import LoadingState from './components/LoadingState.jsx';
import ErrorState from './components/ErrorState.jsx';
import { generate } from './lib/api.js';
import { validateResult } from './lib/validateResult.js';

const SESSION_STORAGE_KEY = 'studycraft_last_session';
const THEME_STORAGE_KEY = 'studycraft_theme';

export default function App() {
  // Theme state: 'dark' | 'light' (pure CSS variables)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Stored session restoration
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [data, setData] = useState(null);
  const [error, setError] = useState(null); // { kind, message, details }
  const [mode, setMode] = useState('flashcards'); // 'flashcards' | 'quiz'
  const [lastInput, setLastInput] = useState({ notes: '', mode: 'flashcards' });

  // Stale-response guard & request cancellation refs
  const requestId = useRef(0);
  const abortControllerRef = useRef(null);

  // Apply theme to root document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Restore previous session from localStorage on initial mount (with defensive validation)
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        const storedMode = parsed.mode || 'flashcards';

        // Defensively validate stored data before rendering
        const validation = validateResult(parsed.data, storedMode);
        if (validation.valid) {
          setData(validation.data);
          setMode(storedMode);
          if (parsed.lastInput) {
            setLastInput(parsed.lastInput);
          }
          setStatus('success');
        } else {
          // If stored data was somehow malformed, discard it
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch {
      // ignore storage parsing issues
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleClearSession = () => {
    setData(null);
    setStatus('idle');
    setError(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem('studycraft_quiz_progress');
    } catch {
      // ignore
    }
  };

  async function handleGenerate(inputNotes, selectedMode = mode) {
    // 1. Cancel in-flight request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 2. Increment monotonic request sequence guard
    const id = ++requestId.current;

    setStatus('loading');
    setError(null);
    const currentInput = { notes: inputNotes, mode: selectedMode };
    setLastInput(currentInput);

    try {
      const validatedData = await generate(inputNotes, selectedMode, controller.signal);

      // Stale response guard check
      if (id !== requestId.current) return;

      setData(validatedData);
      setStatus('success');

      // Persist successful session to localStorage
      try {
        localStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({
            data: validatedData,
            mode: selectedMode,
            lastInput: currentInput,
            savedAt: Date.now(),
          })
        );
      } catch {
        // ignore storage quota errors
      }
    } catch (err) {
      // If request was aborted by a newer request, silently ignore
      if (err.name === 'AbortError') return;

      // If a newer request was dispatched in the meantime, discard error
      if (id !== requestId.current) return;

      setError({
        kind: err.kind || 'network',
        message: err.message,
        details: err.details,
      });
      setStatus('error');
    }
  }

  function handleRetry() {
    if (lastInput.notes) {
      handleGenerate(lastInput.notes, lastInput.mode);
    }
  }

  function handleModeChange(newMode) {
    setMode(newMode);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-glass)',
          backdropFilter: 'blur(14px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          width: '100%',
        }}
      >
        <div
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-glow)',
                flexShrink: 0,
              }}
            >
              <BrainCircuit size={20} color="#fff" />
            </div>
            <div>
              <h1
                style={{
                  fontSize: '1.1rem',
                  fontWeight: '800',
                  letterSpacing: '-0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  margin: 0,
                }}
              >
                StudyCraft AI
              </h1>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                Structured AI Study Assistant
              </p>
            </div>
          </div>

          {/* Header Controls (Theme Toggle & Session Clear) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {data && (
              <button
                type="button"
                onClick={handleClearSession}
                title="Clear current study session"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0.4rem 0.8rem',
                  minHeight: '38px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                }}
              >
                <Trash2 size={13} />
                Clear
              </button>
            )}

            {/* Dark / Light Mode CSS Variable Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                minHeight: '38px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                transition: 'var(--transition-fast)',
              }}
            >
              {theme === 'dark' ? <Sun size={17} color="var(--accent-warning)" /> : <Moon size={17} color="var(--accent-primary)" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <main
        className="app-container"
        style={{
          flex: 1,
          maxWidth: '1040px',
          width: '100%',
          margin: '0 auto',
          padding: '2rem 1.25rem',
          boxSizing: 'border-box',
        }}
      >
        {/* Intro Hero Badge */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid var(--border-glow)',
              color: 'var(--accent-primary)',
              fontSize: '0.82rem',
              fontWeight: '600',
              marginBottom: '0.75rem',
            }}
          >
            <GraduationCap size={15} />
            AI-Powered Knowledge Synthesis
          </div>
          <h2
            className="hero-title"
            style={{
              fontSize: '2rem',
              fontWeight: '800',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
            }}
          >
            Turn Raw Notes into Interactive Study Tools
          </h2>
          <p
            className="hero-subtitle"
            style={{
              color: 'var(--text-secondary)',
              maxWidth: '580px',
              margin: '0.5rem auto 0',
              fontSize: '0.95rem',
            }}
          >
            Paste your notes or any complex topic. The AI returns strictly validated JSON rendered into interactive 3D flashcards or scored assessment quizzes.
          </p>
        </div>

        {/* Free-form Input Area */}
        <PromptInput
          onSubmit={handleGenerate}
          isLoading={status === 'loading'}
          currentMode={mode}
          onModeChange={handleModeChange}
          initialNotes={lastInput.notes}
        />

        {/* Dynamic State Views */}
        {status === 'loading' && <LoadingState mode={mode} />}

        {status === 'error' && error && (
          <ErrorState
            error={error}
            onRetry={handleRetry}
            isRetrying={status === 'loading'}
          />
        )}

        {status === 'success' && data && (
          <ResultView mode={mode} data={data} />
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '1.25rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          marginTop: 'auto',
          backgroundColor: 'var(--bg-glass)',
        }}
      >
        <div
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <span>StudyCraft AI — Flam Frontend Internship Project</span>
          <span>Groq Llama-3 · LocalStorage Persistence · Dark/Light Mode</span>
        </div>
      </footer>
    </div>
  );
}
