import React from 'react';
import { Loader2, Sparkles, Layers, HelpCircle } from 'lucide-react';

/**
 * Shared Loading State component with mode-aware status messages and animated feedback
 *
 * @param {{
 *   mode?: 'flashcards' | 'quiz',
 *   message?: string
 * }} props
 */
export default function LoadingState({ mode = 'flashcards', message }) {
  const isQuiz = mode === 'quiz';
  const Icon = isQuiz ? HelpCircle : Layers;

  const defaultMessage = isQuiz
    ? 'Formulating scenario-based questions and validating distractors...'
    : 'Extracting key definitions & organizing into structured 3D flashcards...';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 2rem',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-glass-card)',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(16px)',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center',
        margin: '1.5rem 0',
        minHeight: '260px',
      }}
      className="animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(6, 182, 212, 0.25))',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-glow)',
          boxShadow: 'var(--shadow-glow)',
        }}
      >
        <Loader2
          size={38}
          color="var(--accent-primary)"
          className="animate-spin"
        />
        <Icon
          size={18}
          color="var(--accent-secondary)"
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
          }}
        />
      </div>

      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: '800',
          color: 'var(--text-primary)',
          marginBottom: '0.4rem',
          letterSpacing: '-0.02em',
        }}
      >
        Generating {isQuiz ? 'Assessment Quiz' : 'Flashcard Deck'}
      </h3>

      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          maxWidth: '440px',
          lineHeight: '1.55',
        }}
      >
        {message || defaultMessage}
      </p>

      <div
        style={{
          marginTop: '1.5rem',
          display: 'inline-flex',
          gap: '8px',
          alignItems: 'center',
          backgroundColor: 'var(--bg-primary)',
          padding: '4px 12px',
          borderRadius: '999px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-primary)',
            animation: 'pulseGlow 1.4s infinite ease-in-out',
          }}
        />
        <span
          style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Enforcing schema constraints & defensive checks
        </span>
      </div>
    </div>
  );
}
