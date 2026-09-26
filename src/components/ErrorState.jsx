import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Terminal } from 'lucide-react';

/**
 * Shared Error State component for failure modes:
 * - Malformed JSON
 * - Schema mismatch
 * - Empty response
 * - Network / LLM Provider error
 *
 * @param {{
 *   error: string,
 *   details?: string,
 *   onRetry?: () => void,
 *   isRetrying?: boolean
 * }} props
 */
export default function ErrorState({ error, details, onRetry, isRetrying }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '3rem 2rem',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'rgba(239, 68, 68, 0.06)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        backdropFilter: 'blur(12px)',
        textAlign: 'center',
        margin: '2rem 0',
      }}
      className="animate-fade-in"
      role="alert"
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <AlertTriangle size={28} color="var(--accent-danger)" />
      </div>

      <h3
        style={{
          fontSize: '1.2rem',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: '0.5rem',
        }}
      >
        Generation Could Not Be Completed
      </h3>

      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          maxWidth: '460px',
          marginBottom: '1.5rem',
          lineHeight: '1.5',
        }}
      >
        {error || 'An unexpected error occurred while parsing the AI response.'}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.65rem 1.4rem',
            backgroundColor: 'var(--accent-primary)',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            fontWeight: '600',
            fontSize: '0.9rem',
            transition: 'var(--transition-fast)',
            opacity: isRetrying ? 0.7 : 1,
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-primary)')}
        >
          <RefreshCw size={16} className={isRetrying ? 'animate-spin' : ''} />
          {isRetrying ? 'Retrying Generation...' : 'Retry Generation'}
        </button>
      )}

      {details && (
        <div style={{ marginTop: '1.5rem', width: '100%', maxWidth: '520px' }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <Terminal size={14} />
            {showDetails ? 'Hide Diagnostic Details' : 'View Diagnostic Details'}
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showDetails && (
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'left',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: 'var(--accent-danger)',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                maxHeight: '180px',
              }}
            >
              {details}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
