import React, { useState } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  WifiOff,
  Clock,
  FileCode2,
  Shapes,
  FileQuestion,
  Terminal,
} from 'lucide-react';

const ERROR_CONFIGS = {
  network: {
    icon: WifiOff,
    title: 'Server Connection Error',
    defaultMessage: 'Could not communicate with the backend proxy server. Please verify your connection or ensure the server is running.',
    badge: 'Network Failure',
    color: '#ef4444',
  },
  timeout: {
    icon: Clock,
    title: 'Request Timed Out',
    defaultMessage: 'The AI model took longer than 15 seconds to respond. The provider may be experiencing high load.',
    badge: 'Timeout (15s)',
    color: '#f59e0b',
  },
  malformed: {
    icon: FileCode2,
    title: 'Malformed JSON Output',
    defaultMessage: 'The AI response contained invalid syntax and could not be parsed into JSON.',
    badge: 'JSON Syntax Error',
    color: '#ec4899',
  },
  invalid_shape: {
    icon: Shapes,
    title: 'Schema Shape Mismatch',
    defaultMessage: 'The AI returned JSON, but it was missing required fields or contained invalid array elements.',
    badge: 'Schema Violation',
    color: '#a855f7',
  },
  empty: {
    icon: FileQuestion,
    title: 'Empty Response',
    defaultMessage: 'The AI model produced no content or an empty list of items.',
    badge: 'Empty Output',
    color: '#64748b',
  },
};

/**
 * Shared Error State component for all typed error modes
 *
 * @param {{
 *   error: {
 *     kind?: 'network' | 'timeout' | 'malformed' | 'invalid_shape' | 'empty',
 *     message?: string,
 *     details?: any
 *   } | string,
 *   onRetry?: () => void,
 *   isRetrying?: boolean
 * }} props
 */
export default function ErrorState({ error, onRetry, isRetrying }) {
  const [showDetails, setShowDetails] = useState(false);

  const errorObj = typeof error === 'string' ? { message: error, kind: 'network' } : (error || {});
  const kind = errorObj.kind || 'network';
  const config = ERROR_CONFIGS[kind] || ERROR_CONFIGS.network;
  const IconComponent = config.icon;

  const displayMessage = errorObj.message || config.defaultMessage;
  const rawDetails = errorObj.details;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2.5rem 2rem',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        backdropFilter: 'blur(12px)',
        textAlign: 'center',
        margin: '1.5rem 0',
      }}
      className="animate-fade-in"
      role="alert"
    >
      {/* Error Badge & Icon */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 10px',
          borderRadius: '999px',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          color: config.color,
          fontSize: '0.75rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '1rem',
          border: '1px solid rgba(239, 68, 68, 0.25)',
        }}
      >
        <IconComponent size={13} />
        {config.badge}
      </div>

      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: '800',
          color: 'var(--text-primary)',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em',
        }}
      >
        {config.title}
      </h3>

      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          maxWidth: '520px',
          marginBottom: '1.5rem',
          lineHeight: '1.55',
        }}
      >
        {displayMessage}
      </p>

      {/* Action Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.7rem 1.6rem',
            backgroundColor: 'var(--accent-primary)',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            fontWeight: '700',
            fontSize: '0.92rem',
            transition: 'var(--transition-fast)',
            opacity: isRetrying ? 0.7 : 1,
            cursor: isRetrying ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
          }}
          onMouseEnter={(e) => {
            if (!isRetrying) e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)';
          }}
          onMouseLeave={(e) => {
            if (!isRetrying) e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
          }}
        >
          <RefreshCw size={16} className={isRetrying ? 'animate-spin' : ''} />
          {isRetrying ? 'Retrying Generation...' : 'Retry Generation'}
        </button>
      )}

      {/* Collapsible Diagnostics */}
      {rawDetails && (
        <div style={{ marginTop: '1.5rem', width: '100%', maxWidth: '580px' }}>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
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
                padding: '1rem',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'left',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: '#fca5a5',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                maxHeight: '220px',
              }}
            >
              {typeof rawDetails === 'string' ? rawDetails : JSON.stringify(rawDetails, null, 2)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
