import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

/**
 * Shared Loading State component with smooth animations and status hints
 * @param {{ mode?: 'flashcards' | 'quiz', message?: string }} props
 */
export default function LoadingState({ mode = 'flashcards', message }) {
  const defaultMessage =
    mode === 'quiz'
      ? 'Synthesizing knowledge into challenging quiz questions...'
      : 'Extracting key concepts & generating interactive flashcards...';

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
        backdropFilter: 'blur(12px)',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center',
        margin: '2rem 0',
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
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.2))',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-glow)',
        }}
      >
        <Loader2
          size={36}
          color="var(--accent-primary)"
          className="animate-spin"
        />
        <Sparkles
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
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em',
        }}
      >
        Structuring AI Knowledge
      </h3>
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          maxWidth: '420px',
          lineHeight: '1.5',
        }}
      >
        {message || defaultMessage}
      </p>

      <div
        style={{
          marginTop: '1.5rem',
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
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
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Validating JSON shape & schema constraints
        </span>
      </div>
    </div>
  );
}
