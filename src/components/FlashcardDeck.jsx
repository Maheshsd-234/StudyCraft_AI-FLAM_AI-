import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';

/**
 * Interactive Flashcard Deck View
 * @param {{
 *   payload: {
 *     title: string,
 *     summary?: string,
 *     cards: Array<{
 *       id: string,
 *       question: string,
 *       answer: string,
 *       category?: string,
 *       difficulty?: string
 *     }>
 *   }
 * }} props
 */
export default function FlashcardDeck({ payload }) {
  const { title, summary, cards: initialCards } = payload;

  const [cards, setCards] = useState(initialCards || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState(new Set());
  const [reviewIds, setReviewIds] = useState(new Set());
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'review'

  // Reset when payload changes
  useEffect(() => {
    setCards(initialCards || []);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredIds(new Set());
    setReviewIds(new Set());
    setFilterMode('all');
  }, [payload]);

  const activeCards = filterMode === 'review'
    ? cards.filter((c) => reviewIds.has(c.id))
    : cards;

  const safeIndex = Math.min(currentIndex, Math.max(0, activeCards.length - 1));
  const currentCard = activeCards[safeIndex];

  const handleNext = useCallback(() => {
    if (safeIndex < activeCards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 100);
    }
  }, [safeIndex, activeCards.length]);

  const handlePrev = useCallback(() => {
    if (safeIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev - 1), 100);
    }
  }, [safeIndex]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleMarkMastered = (cardId) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
    setReviewIds((prev) => {
      const next = new Set(prev);
      next.delete(cardId);
      return next;
    });
    handleNext();
  };

  const handleMarkReview = (cardId) => {
    setReviewIds((prev) => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
    setMasteredIds((prev) => {
      const next = new Set(prev);
      next.delete(cardId);
      return next;
    });
    handleNext();
  };

  // Keyboard navigation support (ArrowLeft, ArrowRight, Space)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  if (!activeCards || activeCards.length === 0) {
    return (
      <div
        style={{
          padding: '3rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-glass-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <Award size={48} color="var(--accent-success)" style={{ marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
          {filterMode === 'review' ? 'No cards flagged for review!' : 'No cards available'}
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {filterMode === 'review'
            ? 'Great job! You have mastered all cards or none are marked for review.'
            : 'Try generating a new flashcard set.'}
        </p>
        {filterMode === 'review' && (
          <button
            onClick={() => setFilterMode('all')}
            style={{
              padding: '0.6rem 1.2rem',
              backgroundColor: 'var(--accent-primary)',
              color: '#fff',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: '600',
            }}
          >
            View All Cards
          </button>
        )}
      </div>
    );
  }

  const progressPercent = Math.round(((safeIndex + 1) / activeCards.length) * 100);

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      {/* Header Info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: '700',
                color: 'var(--accent-primary)',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              Flashcard Deck
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {activeCards.length} cards generated
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            {title || 'Study Flashcards'}
          </h2>
          {summary && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {summary}
            </p>
          )}
        </div>

        {/* Deck Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={handleShuffle}
            title="Shuffle Deck"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.45rem 0.85rem',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              transition: 'var(--transition-fast)',
            }}
          >
            <Shuffle size={14} />
            Shuffle
          </button>

          {reviewIds.size > 0 && (
            <button
              onClick={() => {
                setFilterMode(filterMode === 'all' ? 'review' : 'all');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.45rem 0.85rem',
                backgroundColor: filterMode === 'review' ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-surface)',
                color: filterMode === 'review' ? 'var(--accent-danger)' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${filterMode === 'review' ? 'var(--accent-danger)' : 'var(--border-subtle)'}`,
                fontSize: '0.8rem',
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
          <span>
            Card {safeIndex + 1} of {activeCards.length}
          </span>
          <span>{progressPercent}% completed</span>
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
              width: `${progressPercent}%`,
              backgroundColor: 'var(--accent-primary)',
              borderRadius: '999px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        style={{
          perspective: '1000px',
          minHeight: '280px',
          marginBottom: '1.5rem',
          cursor: 'pointer',
        }}
        onClick={handleFlip}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '280px',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Card Front (Question) */}
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
                  fontWeight: '600',
                  color: 'var(--accent-secondary)',
                  backgroundColor: 'rgba(6, 182, 212, 0.12)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {currentCard?.category || 'Concept Prompt'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Press Space or Click to reveal answer
              </span>
            </div>

            <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
              <h3
                style={{
                  fontSize: '1.35rem',
                  fontWeight: '700',
                  lineHeight: '1.5',
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
                fontSize: '0.8rem',
              }}
            >
              <Eye size={14} /> Click card to flip
            </div>
          </div>

          {/* Card Back (Answer) */}
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
                  fontWeight: '600',
                  color: 'var(--accent-success)',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                Explanation & Answer
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Click to flip back
              </span>
            </div>

            <div style={{ margin: '1.5rem 0', textAlign: 'left' }}>
              <p
                style={{
                  fontSize: '1.1rem',
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
                How well did you know this?
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
        }}
      >
        <button
          onClick={handlePrev}
          disabled={safeIndex === 0}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.6rem 1.2rem',
            backgroundColor: 'var(--bg-surface)',
            color: safeIndex === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.9rem',
            opacity: safeIndex === 0 ? 0.4 : 1,
            cursor: safeIndex === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        {/* Self Assessment Rating */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMarkReview(currentCard?.id);
            }}
            title="Flag for extra review"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.6rem 1.1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: 'var(--accent-danger)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              fontSize: '0.85rem',
            }}
          >
            <XCircle size={16} />
            Need Review
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMarkMastered(currentCard?.id);
            }}
            title="Mark as known / mastered"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.6rem 1.1rem',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--accent-success)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              fontSize: '0.85rem',
            }}
          >
            <CheckCircle2 size={16} />
            Mastered
          </button>
        </div>

        <button
          onClick={handleNext}
          disabled={safeIndex === activeCards.length - 1}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.6rem 1.2rem',
            backgroundColor: 'var(--bg-surface)',
            color: safeIndex === activeCards.length - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.9rem',
            opacity: safeIndex === activeCards.length - 1 ? 0.4 : 1,
            cursor: safeIndex === activeCards.length - 1 ? 'not-allowed' : 'pointer',
          }}
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
