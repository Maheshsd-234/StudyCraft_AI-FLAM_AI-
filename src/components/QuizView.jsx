import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Award,
  ArrowRight,
  Sparkles,
  Info,
  Check,
  RefreshCw,
} from 'lucide-react';

/**
 * QuizView: Interactive Assessment Component
 *
 * Props:
 * - questions: Array<{ id: string, question: string, options: Array<{ id: string, text: string }>, correctOptionId: string, explanation: string }>
 * - title?: string
 * - topic?: string
 * - payload?: object (fallback wrapper)
 *
 * Behavior:
 * - One question at a time with 4 selectable choices.
 * - "Check Answer" locks choice and reveals correct/incorrect + explanation.
 * - "Next Question" advances to the next question.
 * - At end: Displays score and breakdown of missed questions.
 * - "Retest wrong answers" restarts quiz using ONLY missed questions (client-side state, no API call).
 */
export default function QuizView({
  questions: propQuestions,
  title: propTitle,
  topic: propTopic,
  payload,
}) {
  const initialQuestions = propQuestions || payload?.questions || [];
  const displayTitle = propTitle || payload?.title || 'Assessment Quiz';
  const displayTopic = propTopic || payload?.topic || 'Interactive Assessment';

  // Active quiz state
  const [activeQuestions, setActiveQuestions] = useState(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // Stored answers history for summary calculation: { [questionId]: { selectedId: string, isCorrect: boolean } }
  const [answersHistory, setAnswersHistory] = useState({});
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [isRetestMode, setIsRetestMode] = useState(false);

  // Sync state when props change
  useEffect(() => {
    setActiveQuestions(initialQuestions);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswerRevealed(false);
    setAnswersHistory({});
    setIsQuizComplete(false);
    setIsRetestMode(false);
  }, [initialQuestions]);

  const totalQuestions = activeQuestions.length;
  const currentQ = activeQuestions[currentIndex];

  if (!activeQuestions || totalQuestions === 0) {
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
        <HelpCircle size={40} style={{ marginBottom: '1rem', opacity: 0.6 }} />
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          No Quiz Questions Available
        </h3>
        <p style={{ fontSize: '0.9rem' }}>Generate a new quiz from your notes to start testing.</p>
      </div>
    );
  }

  // Handle selecting an option before submission
  const handleSelectOption = (optionId) => {
    if (isAnswerRevealed) return; // Locked after submission
    setSelectedOptionId(optionId);
  };

  // Submit and lock the current question
  const handleSubmitCurrentAnswer = () => {
    if (!selectedOptionId || isAnswerRevealed) return;

    const isCorrect = selectedOptionId === currentQ.correctOptionId;
    setAnswersHistory((prev) => ({
      ...prev,
      [currentQ.id]: {
        selectedId: selectedOptionId,
        isCorrect,
        questionObj: currentQ,
      },
    }));
    setIsAnswerRevealed(true);
  };

  // Move to next question or finalize quiz
  const handleNextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerRevealed(false);
    } else {
      setIsQuizComplete(true);
    }
  };

  // Extract list of missed questions
  const getMissedQuestions = () => {
    return activeQuestions.filter((q) => {
      const record = answersHistory[q.id];
      return record && !record.isCorrect;
    });
  };

  // Retest ONLY wrong answers (client-side state without API call)
  const handleRetestWrong = () => {
    const missed = getMissedQuestions();
    if (missed.length === 0) return;

    setActiveQuestions(missed);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswerRevealed(false);
    setAnswersHistory({});
    setIsQuizComplete(false);
    setIsRetestMode(true);
  };

  // Retake full original quiz
  const handleRetakeFull = () => {
    setActiveQuestions(initialQuestions);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswerRevealed(false);
    setAnswersHistory({});
    setIsQuizComplete(false);
    setIsRetestMode(false);
  };

  // ==========================================
  // VIEW 1: Quiz Summary Screen
  // ==========================================
  if (isQuizComplete) {
    const answeredEntries = Object.values(answersHistory);
    const correctCount = answeredEntries.filter((a) => a.isCorrect).length;
    const totalAnswered = activeQuestions.length;
    const scorePercentage = Math.round((correctCount / totalAnswered) * 100);
    const missedList = getMissedQuestions();

    return (
      <div
        className="animate-fade-in"
        style={{
          backgroundColor: 'var(--bg-glass-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '2.5rem 2rem',
          backdropFilter: 'blur(16px)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Score Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              backgroundColor:
                scorePercentage >= 80
                  ? 'rgba(16, 185, 129, 0.15)'
                  : scorePercentage >= 50
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(239, 68, 68, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              border: `1.5px solid ${
                scorePercentage >= 80
                  ? 'rgba(16, 185, 129, 0.3)'
                  : scorePercentage >= 50
                  ? 'rgba(245, 158, 11, 0.3)'
                  : 'rgba(239, 68, 68, 0.3)'
              }`,
            }}
          >
            <Award
              size={38}
              color={
                scorePercentage >= 80
                  ? 'var(--accent-success)'
                  : scorePercentage >= 50
                  ? 'var(--accent-warning)'
                  : 'var(--accent-danger)'
              }
            />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
            {scorePercentage === 100
              ? 'Perfect Score! 🎯'
              : scorePercentage >= 80
              ? 'Great Mastery!'
              : scorePercentage >= 50
              ? 'Good Effort!'
              : 'Needs Further Review'}
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            You scored <strong style={{ color: 'var(--text-primary)' }}>{correctCount}</strong> out of{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{totalAnswered}</strong> ({scorePercentage}%)
            {isRetestMode && ' in Wrong-Answer Retest Mode'}
          </p>
        </div>

        {/* Action Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
          }}
        >
          {missedList.length > 0 && (
            <button
              type="button"
              onClick={handleRetestWrong}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1.6rem',
                backgroundColor: 'var(--accent-warning)',
                color: '#000',
                borderRadius: 'var(--radius-md)',
                fontWeight: '700',
                fontSize: '0.92rem',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={16} />
              Retest {missedList.length} Wrong {missedList.length === 1 ? 'Answer' : 'Answers'}
            </button>
          )}

          <button
            type="button"
            onClick={handleRetakeFull}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.75rem 1.6rem',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontWeight: '600',
              fontSize: '0.92rem',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} />
            Retake Full Quiz ({initialQuestions.length})
          </button>
        </div>

        {/* Missed Questions Breakdown */}
        {missedList.length > 0 && (
          <div>
            <h3
              style={{
                fontSize: '1.15rem',
                fontWeight: '700',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <XCircle size={18} color="var(--accent-danger)" />
              Missed Questions for Review ({missedList.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {missedList.map((q, idx) => {
                const answerRecord = answersHistory[q.id];
                const selectedOpt = q.options.find((o) => o.id === answerRecord?.selectedId);
                const correctOpt = q.options.find((o) => o.id === q.correctOptionId);

                return (
                  <div
                    key={q.id || idx}
                    style={{
                      padding: '1.35rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <div style={{ marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--accent-danger)', fontWeight: '700' }}>
                        Missed #{idx + 1}
                      </span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                        {q.question}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem', marginBottom: '0.75rem' }}>
                      <div style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <XCircle size={14} />
                        <span><strong>Your Choice:</strong> {selectedOpt ? `${selectedOpt.id}. ${selectedOpt.text}` : 'None'}</span>
                      </div>
                      <div style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={14} />
                        <span><strong>Correct Answer:</strong> {correctOpt ? `${correctOpt.id}. ${correctOpt.text}` : q.correctOptionId}</span>
                      </div>
                    </div>

                    {q.explanation && (
                      <div
                        style={{
                          padding: '0.75rem 1rem',
                          backgroundColor: 'var(--bg-primary)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-secondary)',
                          fontSize: '0.83rem',
                          lineHeight: '1.5',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                        }}
                      >
                        <Info size={16} color="var(--accent-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{q.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 2: Active Single Question Flow
  // ==========================================
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isSelected = Boolean(selectedOptionId);

  return (
    <div
      className="animate-fade-in"
      style={{
        backgroundColor: 'var(--bg-glass-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        padding: '2rem',
        backdropFilter: 'blur(16px)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Quiz Header Info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: '800',
                color: isRetestMode ? 'var(--accent-warning)' : 'var(--accent-purple)',
                backgroundColor: isRetestMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${isRetestMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(168, 85, 247, 0.3)'}`,
              }}
            >
              {isRetestMode ? 'Retesting Wrong Answers' : 'Assessment Quiz'}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {displayTopic}
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '0.25rem', letterSpacing: '-0.02em' }}>
            {displayTitle}
          </h2>
        </div>

        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-surface)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {currentIndex + 1} / {totalQuestions}
        </span>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          height: '4px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '999px',
          overflow: 'hidden',
          marginBottom: '1.75rem',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
            backgroundColor: isRetestMode ? 'var(--accent-warning)' : 'var(--accent-purple)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Question Text */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            lineHeight: '1.55',
            color: 'var(--text-primary)',
          }}
        >
          {currentQ.question}
        </h3>
      </div>

      {/* 4 Selectable Choices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
        {currentQ.options.map((opt) => {
          const isChosen = selectedOptionId === opt.id;
          const isCorrect = opt.id === currentQ.correctOptionId;

          // Compute styles depending on revealed state
          let itemBg = 'var(--bg-secondary)';
          let itemBorder = 'var(--border-subtle)';
          let badgeBg = 'var(--bg-surface)';
          let badgeColor = 'var(--text-secondary)';

          if (isAnswerRevealed) {
            if (isCorrect) {
              itemBg = 'rgba(16, 185, 129, 0.15)';
              itemBorder = 'var(--accent-success)';
              badgeBg = 'var(--accent-success)';
              badgeColor = '#fff';
            } else if (isChosen && !isCorrect) {
              itemBg = 'rgba(239, 68, 68, 0.15)';
              itemBorder = 'var(--accent-danger)';
              badgeBg = 'var(--accent-danger)';
              badgeColor = '#fff';
            }
          } else if (isChosen) {
            itemBg = 'rgba(99, 102, 241, 0.15)';
            itemBorder = 'var(--accent-primary)';
            badgeBg = 'var(--accent-primary)';
            badgeColor = '#fff';
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={isAnswerRevealed}
              onClick={() => handleSelectOption(opt.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: itemBg,
                border: `1.5px solid ${itemBorder}`,
                textAlign: 'left',
                color: 'var(--text-primary)',
                transition: 'var(--transition-fast)',
                cursor: isAnswerRevealed ? 'default' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isAnswerRevealed && !isChosen) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isAnswerRevealed && !isChosen) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    backgroundColor: badgeBg,
                    color: badgeColor,
                    flexShrink: 0,
                    transition: 'var(--transition-fast)',
                  }}
                >
                  {opt.id}
                </span>
                <span style={{ fontSize: '0.95rem', lineHeight: '1.45' }}>{opt.text}</span>
              </div>

              {/* Status icon if revealed */}
              {isAnswerRevealed && isCorrect && (
                <CheckCircle2 size={20} color="var(--accent-success)" style={{ flexShrink: 0, marginLeft: '8px' }} />
              )}
              {isAnswerRevealed && isChosen && !isCorrect && (
                <XCircle size={20} color="var(--accent-danger)" style={{ flexShrink: 0, marginLeft: '8px' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Revealed Explanation Banner */}
      {isAnswerRevealed && (
        <div
          className="animate-fade-in"
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: selectedOptionId === currentQ.correctOptionId ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${selectedOptionId === currentQ.correctOptionId ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            marginBottom: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem' }}>
            <Info size={16} color={selectedOptionId === currentQ.correctOptionId ? 'var(--accent-success)' : 'var(--accent-danger)'} />
            <strong style={{ fontSize: '0.9rem', color: selectedOptionId === currentQ.correctOptionId ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
              {selectedOptionId === currentQ.correctOptionId ? 'Correct!' : 'Incorrect Choice'}
            </strong>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
            {currentQ.explanation}
          </p>
        </div>
      )}

      {/* Control Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        {!isAnswerRevealed ? (
          <button
            type="button"
            disabled={!isSelected}
            onClick={handleSubmitCurrentAnswer}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.75rem 1.6rem',
              backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-surface)',
              color: isSelected ? '#fff' : 'var(--text-muted)',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: isSelected ? 'pointer' : 'not-allowed',
              opacity: isSelected ? 1 : 0.5,
              transition: 'var(--transition-fast)',
              boxShadow: isSelected ? '0 4px 16px rgba(99, 102, 241, 0.35)' : 'none',
            }}
          >
            <Check size={16} />
            Submit Answer
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNextQuestion}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.75rem 1.6rem',
              backgroundColor: 'var(--accent-primary)',
              color: '#fff',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
            }}
          >
            {isLastQuestion ? 'View Final Results' : 'Next Question'}
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
