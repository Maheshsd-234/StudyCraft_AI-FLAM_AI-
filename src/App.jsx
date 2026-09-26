import React, { useState, useRef } from 'react';
import { Sparkles, BrainCircuit, GraduationCap } from 'lucide-react';
import PromptInput from './components/PromptInput.jsx';
import ResultView from './components/ResultView.jsx';
import LoadingState from './components/LoadingState.jsx';
import ErrorState from './components/ErrorState.jsx';
import { generateStudyMaterial } from './lib/api.js';
import { validateResult } from './lib/validateResult.js';

export default function App() {
  const [mode, setMode] = useState('flashcards'); // 'flashcards' | 'quiz'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [parsedResult, setParsedResult] = useState(null);
  const [lastPrompt, setLastPrompt] = useState('');

  // Guard against stale asynchronous responses race condition
  const requestId = useRef(0);

  const handleGenerate = async (promptText, selectedMode = mode) => {
    const currentId = ++requestId.current;
    setIsLoading(true);
    setError(null);
    setErrorDetails(null);
    setLastPrompt(promptText);

    try {
      // 1. Call backend proxy (API key stays on server)
      const response = await generateStudyMaterial({
        prompt: promptText,
        mode: selectedMode,
      });

      // Stale response guard: Ignore if user triggered a newer request in the meantime
      if (currentId !== requestId.current) {
        return;
      }

      // 2. Validate structured output defensively before rendering
      const validation = validateResult(selectedMode, response.data || response.rawText);

      if (!validation.isValid) {
        setError(validation.error || 'The model returned data in an invalid format.');
        setErrorDetails(
          typeof response.rawText === 'string'
            ? response.rawText
            : JSON.stringify(response.data || response, null, 2)
        );
        setParsedResult(null);
      } else {
        setParsedResult({
          mode: selectedMode,
          data: validation.data,
        });
      }
    } catch (err) {
      if (currentId !== requestId.current) return;
      setError(err.message || 'Failed to generate study materials.');
      setErrorDetails(err.stack || String(err));
      setParsedResult(null);
    } finally {
      if (currentId === requestId.current) {
        setIsLoading(false);
      }
    }
  };

  const handleRetry = () => {
    if (lastPrompt) {
      handleGenerate(lastPrompt, mode);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(10, 13, 20, 0.8)',
          backdropFilter: 'blur(12px)',
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
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
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
                    padding: '2px 6px',
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
              Proxy Active
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1040px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>
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
            Turn Unstructured Notes into Interactive Flashcards & Quizzes
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            Learn Smarter with Structured AI
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0.5rem auto 0', fontSize: '0.95rem' }}>
            Input raw notes, concepts, or technical topics. The AI returns strictly validated JSON rendered into full interactive tools with zero raw chat boxes.
          </p>
        </div>

        {/* Free-form Input */}
        <PromptInput
          onSubmit={handleGenerate}
          isLoading={isLoading}
          currentMode={mode}
          onModeChange={(newMode) => {
            setMode(newMode);
            // If already have result of different mode, can switch or preserve
          }}
        />

        {/* Dynamic States */}
        {isLoading && <LoadingState mode={mode} />}

        {!isLoading && error && (
          <ErrorState
            error={error}
            details={errorDetails}
            onRetry={handleRetry}
            isRetrying={isLoading}
          />
        )}

        {!isLoading && !error && parsedResult && (
          <ResultView mode={parsedResult.mode} data={parsedResult.data} />
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
        <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span>AI-Powered Interactive Study Tool — Flam Frontend Assignment</span>
          <span>Groq Llama-3 Structured JSON · Defensive Schema Parser</span>
        </div>
      </footer>
    </div>
  );
}
