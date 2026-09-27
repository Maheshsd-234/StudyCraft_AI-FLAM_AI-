import React, { useState, useRef } from 'react';
import { BrainCircuit, GraduationCap } from 'lucide-react';
import PromptInput from './components/PromptInput.jsx';
import ResultView from './components/ResultView.jsx';
import LoadingState from './components/LoadingState.jsx';
import ErrorState from './components/ErrorState.jsx';
import { generate } from './lib/api.js';

export default function App() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [data, setData] = useState(null);
  const [error, setError] = useState(null); // { kind, message, details }
  const [mode, setMode] = useState('flashcards'); // 'flashcards' | 'quiz'
  const [lastInput, setLastInput] = useState({ notes: '', mode: 'flashcards' });

  // Stale-response guard & request cancellation refs
  const requestId = useRef(0);
  const abortControllerRef = useRef(null);

  async function handleGenerate(inputNotes, selectedMode = mode) {
    // 1. Cancel in-flight request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 2. Increment request ID guard
    const id = ++requestId.current;

    setStatus('loading');
    setError(null);
    setLastInput({ notes: inputNotes, mode: selectedMode });

    try {
      const validatedData = await generate(inputNotes, selectedMode, controller.signal);

      // Stale response check: discard if a newer request was dispatched
      if (id !== requestId.current) return;

      setData(validatedData);
      setStatus('success');
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
    // If we have successful data of previous mode, we can clear or keep until new generation
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(10, 13, 20, 0.85)',
          backdropFilter: 'blur(14px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
              }}
            >
              <BrainCircuit size={22} color="#fff" />
            </div>
            <div>
              <h1
                style={{
                  fontSize: '1.15rem',
                  fontWeight: '800',
                  letterSpacing: '-0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                StudyCraft AI
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--accent-primary)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                  }}
                >
                  Structured UI
                </span>
              </h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Flam Frontend Assignment · AI Interactive Tool
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                color: 'var(--accent-success)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                padding: '4px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-success)',
                }}
              />
              Proxy Ready
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main
        className="app-container"
        style={{
          flex: 1,
          maxWidth: '1040px',
          width: '100%',
          margin: '0 auto',
          padding: '2rem 1.5rem',
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
            AI-Driven Educational Knowledge Structuring
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
          padding: '1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          marginTop: 'auto',
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
            gap: '1rem',
          }}
        >
          <span>AI-Powered Interactive Study Tool — Flam Frontend Assignment</span>
          <span>Groq Llama-3 Structured JSON · Defensive Schema Parser</span>
        </div>
      </footer>
    </div>
  );
}
