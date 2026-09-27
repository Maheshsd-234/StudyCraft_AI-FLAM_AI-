import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle2,
  XCircle,
  Eye,
  Award,
  Layers,
  Sparkles,
  Keyboard,
} from 'lucide-react';

/**
 * FlashcardDeck: Controlled interactive flashcard component
 *
 * Props:
 * - cards: Array<{ id: string, question: string, answer: string, category?: string, difficulty?: string }>
 * - title?: string (optional topic title)
 * - summary?: string (optional topic summary)
 * - payload?: object (optional container object for backward compatibility)
 *
 * Features:
 * - One card visible at a time
 * - CSS-transform 3D flip between Question and Answer
 * - Prev / Next navigation
 * - Progress indicator formatted as "3 / 10"
 * - Shuffle deck ordering
 * - Full keyboard accessibility: Tab-focusable, Space/Enter to flip, ArrowLeft/ArrowRight to navigate
 */
export default function FlashcardDeck({ cards: propCards, title: propTitle, summary: propSummary, payload }) {
  const cardList = propCards || payload?.cards || [];
  const displayTitle = propTitle || payload?.title || 'Study Flashcards';
  const displaySummary = propSummary || payload?.summary || '';

  const [deck, setDeck] = useState(cardList);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState(new Set());
  const [reviewIds, setReviewIds] = useState(new Set());
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'review'

  const deckRef = useRef(null);

  // Sync state when cards prop updates
  useEffect(() => {
    setDeck(cardList);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredIds(new Set());
    setReviewIds(new Set());
    setFilterMode('all');
  }, [cardList]);

  const activeCards = filterMode === 'review'
    ? deck.filter((c) => reviewIds.has(c.id))
    : deck;

  const totalCards = activeCards.length;
  const safeIndex = Math.min(currentIndex, Math.max(0, totalCards - 1));
  const currentCard = activeCards[safeIndex];

  const handleNext = useCallback(() => {
    if (safeIndex < totalCards - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 80);
    }
  }, [safeIndex, totalCards]);

  const handlePrev = useCallback(() => {
    if (safeIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev - 1), 80);
    }
  }, [safeIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleMarkMastered = (cardId) => {
    if (!cardId) return;
    setMasteredIds((prev) => new Set(prev).add(cardId));
    setReviewIds((prev) => {
      const next = new Set(prev);
      next.delete(cardId);
      return next;
    });
    handleNext();
  };

  const handleMarkReview = (cardId) => {
    if (!cardId) return;
    setReviewIds((prev) => new Set(prev).add(cardId));
    setMasteredIds((prev) => {
      const next = new Set(prev);
      next.delete(cardId);
      return next;
    });
    handleNext();
  };

  // Keyboard Navigation: Space / Enter to flip, Arrow Left/Right to navigate
  const handleKeyDown = useCallback(
    (e) => {
      // Ignore if user is currently typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return;

      if (e.code === 'Space' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight' || e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    },
    [handleFlip, handleNext, handlePrev]
  );

  // Bind global keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!cardList || cardList.length === 0) {
    return (
      <div
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-glass-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-muted)',
        }}
      >
        <Layers size={40} style={{ marginBottom: '1rem', opacity: 0.6 }} />
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          No Flashcards to Display
        </h3>
        <p style={{ fontSize: '0.9rem' }}>Generate a new set of flashcards to start studying.</p>
      </div>
    );
  }

  if (totalCards === 0 && filterMode === 'review') {
    return (
      <div
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-glass-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <Award size={48} color="var(--accent-success)" style={{ marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: '700' }}>
          No Flagged Review Cards!
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
          You have cleared or marked all cards as mastered in this session.
        </p>
        <button
          onClick={() => setFilterMode('all')}
          style={{
            padding: '0.65rem 1.4rem',
            backgroundColor: 'var(--accent-primary)',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
            fontWeight: '700',
          }}
        >
          View Full Deck ({deck.length})
        </button>
      </div>
    );
  }

  const progressPercentage = Math.round(((safeIndex + 1) / totalCards) * 100);

  return (
    <div
      ref={deckRef}
      tabIndex={0}
      role="region"
      aria-label="Interactive Flashcard Deck"
      aria-roledescription="flashcard"
      onKeyDown={handleKeyDown}
      className="animate-fade-in"
      style={{
        width: '100%',
        outline: 'none',
      }}
    >
      {/* Header Info & Deck Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: '800',
                color: 'var(--accent-primary)',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              Flashcards Deck
            </span>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'var(--bg-surface)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {safeIndex + 1} / {totalCards}
            </span>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            {displayTitle}
          </h2>

          {displaySummary && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {displaySummary}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleShuffle}
            title="Shuffle Deck (Randomize card order)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.5rem 0.9rem',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              fontWeight: '600',
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
            <Shuffle size={14} />
            Shuffle
          </button>

          {reviewIds.size > 0 && (
            <button
              type="button"
              onClick={() => {
                setFilterMode(filterMode === 'all' ? 'review' : 'all');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 0.9rem',
                backgroundColor: filterMode === 'review' ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-surface)',
                color: filterMode === 'review' ? 'var(--accent-danger)' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${filterMode === 'review' ? 'var(--accent-danger)' : 'var(--border-subtle)'}`,
                fontSize: '0.82rem',
                fontWeight: '600',
                transition: 'var(--transition-fast)',
              }}
            >
              <RotateCcw size={14} />
              {filterMode === 'review' ? 'Show All' : `Review Flagged (${reviewIds.size})`}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginBottom: '0.4rem',
            fontWeight: '600',
          }}
        >
          <span>Progress</span>
          <span>{progressPercentage}%</span>
        </div>
        <div
          style={{
            height: '6px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercentage}%`,
              backgroundColor: 'var(--accent-primary)',
              borderRadius: '999px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* 3D Transform Flip Card */}
      <div
        onClick={handleFlip}
        style={{
          perspective: '1200px',
          minHeight: '290px',
          marginBottom: '1.5rem',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '290px',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Card Front (Question / Prompt) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              backgroundColor: 'var(--bg-glass-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-md)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: 'var(--accent-secondary)',
                  backgroundColor: 'rgba(6, 182, 212, 0.12)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                }}
              >
                {currentCard?.category || 'Concept Prompt'}
              </span>

              {currentCard?.difficulty && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    fontWeight: '700',
                    color:
                      currentCard.difficulty === 'easy'
                        ? 'var(--accent-success)'
                        : currentCard.difficulty === 'hard'
                        ? 'var(--accent-danger)'
                        : 'var(--accent-warning)',
                  }}
                >
                  {currentCard.difficulty}
                </span>
              )}
            </div>

            <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
              <h3
                style={{
                  fontSize: '1.35rem',
                  fontWeight: '700',
                  lineHeight: '1.55',
                  color: 'var(--text-primary)',
                }}
              >
                {currentCard?.question}
              </h3>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
              }}
            >
              <Eye size={14} /> Click card or press Space to reveal answer
            </div>
          </div>

          {/* Card Back (Answer / Detailed Explanation) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-glow)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-glow)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: 'var(--accent-success)',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                Explanation & Key Takeaway
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Click to flip back
              </span>
            </div>

            <div style={{ margin: '1.5rem 0', textAlign: 'left' }}>
              <p
                style={{
                  fontSize: '1.08rem',
                  lineHeight: '1.65',
                  color: 'var(--text-primary)',
                }}
              >
                {currentCard?.answer}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Mark self-assessment below:
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Self-Assessment Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <button
          type="button"
          onClick={handlePrev}
          disabled={safeIndex === 0}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.65rem 1.3rem',
            backgroundColor: 'var(--bg-surface)',
            color: safeIndex === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.9rem',
            fontWeight: '600',
            opacity: safeIndex === 0 ? 0.4 : 1,
            cursor: safeIndex === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        {/* Self-Assessment Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkReview(currentCard?.id);
            }}
            title="Flag card for further study"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.65rem 1.15rem',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: 'var(--accent-danger)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <XCircle size={16} />
            Need Review
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkMastered(currentCard?.id);
            }}
            title="Mark card as mastered"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.65rem 1.15rem',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--accent-success)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <CheckCircle2 size={16} />
            Mastered
          </button>
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={safeIndex === totalCards - 1}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.65rem 1.3rem',
            backgroundColor: 'var(--bg-surface)',
            color: safeIndex === totalCards - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.9rem',
            fontWeight: '600',
            opacity: safeIndex === totalCards - 1 ? 0.4 : 1,
            cursor: safeIndex === totalCards - 1 ? 'not-allowed' : 'pointer',
          }}
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Keyboard Short-cuts Indicator */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-muted)',
          fontSize: '0.78rem',
          padding: '8px',
        }}
      >
        <Keyboard size={14} />
        <span>
          Keyboard controls: <kbd style={{ padding: '1px 5px', borderRadius: '3px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>Space</kbd> / <kbd style={{ padding: '1px 5px', borderRadius: '3px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>Enter</kbd> Flip · <kbd style={{ padding: '1px 5px', borderRadius: '3px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>←</kbd> <kbd style={{ padding: '1px 5px', borderRadius: '3px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>→</kbd> Navigate
        </span>
      </div>
    </div>
  );
}
