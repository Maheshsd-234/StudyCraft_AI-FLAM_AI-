import React, { useState } from 'react';
import { Sparkles, Layers, HelpCircle, ArrowRight, BookOpen, Lightbulb } from 'lucide-react';

const SAMPLE_PROMPTS = [
  {
    label: 'React Hooks & Lifecycle',
    text: 'Key React Hooks: useState, useEffect, useMemo, useCallback, and useRef. Explain lifecycle equivalents, memoization rules, and common stale closure traps.',
  },
  {
    label: 'HTTP & REST APIs',
    text: 'Core concepts of HTTP protocols, status codes (2xx, 3xx, 4xx, 5xx), RESTful architecture principles, idempotency, and CORS handling.',
  },
  {
    label: 'Data Structures & Algorithms',
    text: 'Big-O complexity notation, differences between Array and LinkedList, Hash Table collision resolution, and Binary Search Tree invariants.',
  },
];

/**
 * Free-form text input and mode selection component
 * @param {{
 *   onSubmit: (prompt: string, mode: 'flashcards' | 'quiz') => void,
 *   isLoading: boolean,
 *   currentMode: 'flashcards' | 'quiz',
 *   onModeChange: (mode: 'flashcards' | 'quiz') => void
 * }} props
 */
export default function PromptInput({ onSubmit, isLoading, currentMode, onModeChange }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSubmit(input.trim(), currentMode);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSampleClick = (sampleText) => {
    setInput(sampleText);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-glass-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        padding: '1.75rem',
        backdropFilter: 'blur(16px)',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '2rem',
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* Mode Selector */}
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
            <BookOpen size={18} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              Choose Output Mode:
            </span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '4px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={() => onModeChange('flashcards')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: currentMode === 'flashcards' ? '600' : '500',
                backgroundColor: currentMode === 'flashcards' ? 'var(--accent-primary)' : 'transparent',
                color: currentMode === 'flashcards' ? '#fff' : 'var(--text-secondary)',
                transition: 'var(--transition-fast)',
              }}
            >
              <Layers size={15} />
              Flashcards Set
            </button>
            <button
              type="button"
              onClick={() => onModeChange('quiz')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: currentMode === 'quiz' ? '600' : '500',
                backgroundColor: currentMode === 'quiz' ? 'var(--accent-primary)' : 'transparent',
                color: currentMode === 'quiz' ? '#fff' : 'var(--text-secondary)',
                transition: 'var(--transition-fast)',
              }}
            >
              <HelpCircle size={15} />
              Interactive Quiz
            </button>
          </div>
        </div>

        {/* Free-form Textarea */}
        <div style={{ position: 'relative' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={
              currentMode === 'flashcards'
                ? 'Paste your lecture notes, article excerpts, syllabus, or any technical topic here to turn into flashcards...'
                : 'Paste your topic, revision notes, or chapter text to generate an assessment quiz with instant scoring...'
            }
            rows={5}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              padding: '1rem',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              resize: 'vertical',
              transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-focus)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--border-glow)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Action Controls & Quick Samples */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Samples */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lightbulb size={13} /> Try:
            </span>
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSampleClick(sample.text)}
                style={{
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.75rem 1.6rem',
              backgroundColor: 'var(--accent-primary)',
              color: '#fff',
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              fontSize: '0.95rem',
              opacity: !input.trim() || isLoading ? 0.5 : 1,
              cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
              transition: 'var(--transition-fast)',
              boxShadow: input.trim() && !isLoading ? '0 4px 20px rgba(99, 102, 241, 0.4)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (input.trim() && !isLoading) e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
            }}
          >
            <Sparkles size={16} />
            {isLoading ? 'Generating...' : `Generate ${currentMode === 'flashcards' ? 'Flashcards' : 'Quiz'}`}
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
