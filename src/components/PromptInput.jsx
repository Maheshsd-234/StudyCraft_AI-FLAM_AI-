import React, { useState } from 'react';
import { Sparkles, Layers, HelpCircle, ArrowRight, Lightbulb, AlertCircle } from 'lucide-react';

const SAMPLE_PROMPTS = [
  {
    label: 'React Lifecycle & Hooks',
    text: 'Core React concepts: useState, useEffect, useMemo, useCallback, useRef, stale closures, dependency array rules, and component mounting vs unmounting lifecycles.',
  },
  {
    label: 'Web Security & Auth',
    text: 'Web application security fundamentals: JWT vs Session cookies, CSRF protection with SameSite tokens, XSS mitigation with CSP, and HTTPS TLS handshakes.',
  },
  {
    label: 'Database Indexing & ACID',
    text: 'Relational database indexing principles: B-Trees, Clustered vs Non-Clustered indices, ACID transaction guarantees, and isolation levels (Read Committed vs Serializable).',
  },
];

/**
 * PromptInput: Free-form text input + mode toggle + submit
 * Responsive down to 375px with >= 44px touch targets.
 */
export default function PromptInput({
  onSubmit,
  isLoading,
  currentMode,
  onModeChange,
  initialNotes = '',
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [hasInteracted, setHasInteracted] = useState(false);

  const trimmed = notes.trim();
  const isWhitespaceOnly = notes.length > 0 && trimmed.length === 0;
  const isInputValid = trimmed.length > 0;

  const handleSubmit = (e) => {
    e?.preventDefault();
    setHasInteracted(true);
    if (!isInputValid || isLoading) return;
    onSubmit(trimmed, currentMode);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleSampleClick = (sampleText) => {
    setNotes(sampleText);
    setHasInteracted(false);
  };

  return (
    <div
      className="prompt-card"
      style={{
        backgroundColor: 'var(--bg-glass-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        padding: '1.75rem',
        backdropFilter: 'blur(16px)',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '2rem',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* Header: Label & Mode Toggle (Stacks on Mobile) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Target Format:
            </span>
          </div>

          <div
            className="mode-toggle-group"
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '4px',
              border: '1px solid var(--border-subtle)',
              boxSizing: 'border-box',
            }}
          >
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onModeChange('flashcards')}
              className="mode-toggle-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 1.1rem',
                minHeight: '44px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: currentMode === 'flashcards' ? '700' : '500',
                backgroundColor: currentMode === 'flashcards' ? 'var(--accent-primary)' : 'transparent',
                color: currentMode === 'flashcards' ? '#fff' : 'var(--text-secondary)',
                transition: 'var(--transition-fast)',
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              <Layers size={15} />
              Flashcard Deck
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onModeChange('quiz')}
              className="mode-toggle-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 1.1rem',
                minHeight: '44px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: currentMode === 'quiz' ? '700' : '500',
                backgroundColor: currentMode === 'quiz' ? 'var(--accent-primary)' : 'transparent',
                color: currentMode === 'quiz' ? '#fff' : 'var(--text-secondary)',
                transition: 'var(--transition-fast)',
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              <HelpCircle size={15} />
              Interactive Quiz
            </button>
          </div>
        </div>

        {/* Free-form Textarea */}
        <div style={{ position: 'relative', width: '100%' }}>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setHasInteracted(true);
            }}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={
              currentMode === 'flashcards'
                ? 'Paste free-form notes, lecture text, or topics here to synthesize into 3D flashcards...'
                : 'Paste notes or a topic here to generate a scored interactive assessment quiz...'
            }
            rows={5}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-secondary)',
              border: `1px solid ${isWhitespaceOnly ? 'var(--accent-danger)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              padding: '1rem',
              fontSize: '1rem', // Prevents iOS auto-zoom
              lineHeight: '1.6',
              resize: 'vertical',
              opacity: isLoading ? 0.6 : 1,
              transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              if (!isWhitespaceOnly) {
                e.currentTarget.style.borderColor = 'var(--border-focus)';
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--border-glow)';
              }
            }}
            onBlur={(e) => {
              if (!isWhitespaceOnly) {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          />

          {/* Inline whitespace warning */}
          {isWhitespaceOnly && hasInteracted && (
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--accent-danger)',
                fontSize: '0.78rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <AlertCircle size={13} />
              Input cannot be whitespace only
            </div>
          )}
        </div>

        {/* Action Controls & Sample Chips */}
        <div
          className="prompt-actions-footer"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Quick Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Lightbulb size={13} /> Try:
            </span>
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => handleSampleClick(sample.text)}
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  minHeight: '34px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'var(--transition-fast)',
                  opacity: isLoading ? 0.5 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {sample.label}
              </button>
            ))}
          </div>

          {/* Submit Button (>= 44px height) */}
          <button
            type="submit"
            className="prompt-submit-btn"
            disabled={!isInputValid || isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.75rem 1.6rem',
              minHeight: '44px',
              backgroundColor: isInputValid && !isLoading ? 'var(--accent-primary)' : 'var(--bg-surface)',
              color: isInputValid && !isLoading ? '#fff' : 'var(--text-muted)',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.95rem',
              opacity: !isInputValid || isLoading ? 0.5 : 1,
              cursor: !isInputValid || isLoading ? 'not-allowed' : 'pointer',
              transition: 'var(--transition-fast)',
              boxShadow: isInputValid && !isLoading ? '0 4px 20px rgba(99, 102, 241, 0.4)' : 'none',
              border: '1px solid var(--border-subtle)',
            }}
            onMouseEnter={(e) => {
              if (isInputValid && !isLoading) e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
            }}
          >
            <Sparkles size={16} />
            {isLoading ? 'Generating Structure...' : `Generate ${currentMode === 'flashcards' ? 'Flashcards' : 'Quiz'}`}
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
