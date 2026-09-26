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
} from 'lucide-react';

/**
 * Interactive Quiz View with instant scoring and "Re-test wrong answers" feature
 * @param {{
 *   payload: {
 *     title: string,
 *     topic?: string,
 *     questions: Array<{
 *       id: string,
 *       question: string,
 *       options: Array<{ id: string, text: string }>,
 *       correctOptionId: string,
 *       explanation: string
 *     }>
 *   }
 * }} props
 */
export default function QuizView({ payload }) {
  const { title, topic, questions: initialQuestions } = payload;

  const [questions, setQuestions] = useState(initialQuestions || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionId }
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRetestMode, setIsRetestMode] = useState(false);

  useEffect(() => {
    setQuestions(initialQuestions || []);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setIsRetestMode(false);
  }, [payload]);

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleSelectOption = (optionId) => {
    if (isSubmitted && !isRetestMode) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctOptionId) {
        score += 1;
      }
    });
    return score;
  };

  const getWrongQuestions = () => {
    return questions.filter((q) => selectedAnswers[q.id] !== q.correctOptionId);
  };

  const handleRetestWrong = () => {
    const wrong = getWrongQuestions();
    if (wrong.length === 0) return;
    setQuestions(wrong);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setIsRetestMode(true);
  };

  const handleRestartFull = () => {
    setQuestions(initialQuestions || []);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setIsRetestMode(false);
  };

  if (!questions || questions.length === 0) {
    return null;
  }

  // Quiz Summary View after completion
  if (isSubmitted) {
    const score = calculateScore();
    const percentage = Math.round((score / totalQuestions) * 100);
    const wrongQuestions = getWrongQuestions();

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
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              backgroundColor:
                percentage >= 80
                  ? 'rgba(16, 185, 129, 0.15)'
                  : percentage >= 50
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(239, 68, 68, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <Award
              size={36}
              color={
                percentage >= 80
                  ? 'var(--accent-success)'
                  : percentage >= 50
                  ? 'var(--accent-warning)'
                  : 'var(--accent-danger)'
              }
            />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            {percentage >= 80
              ? 'Outstanding Performance!'
              : percentage >= 50
              ? 'Good Effort!'
              : 'Keep Practicing!'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            You scored <strong style={{ color: 'var(--text-primary)' }}>{score}</strong> out of{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{totalQuestions}</strong> ({percentage}%)
          </p>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
          }}
        >
          {wrongQuestions.length > 0 && (
            <button
              onClick={handleRetestWrong}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1.4rem',
                backgroundColor: 'var(--accent-warning)',
                color: '#000',
                borderRadius: 'var(--radius-md)',
                fontWeight: '700',
                fontSize: '0.9rem',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
              }}
            >
              <RotateCcw size={16} />
              Re-test {wrongQuestions.length} Wrong {wrongQuestions.length === 1 ? 'Answer' : 'Answers'}
            </button>
          )}

          <button
            onClick={handleRestartFull}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.75rem 1.4rem',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontWeight: '600',
              fontSize: '0.9rem',
            }}
          >
            <RotateCcw size={16} />
            Retake Entire Quiz
          </button>
        </div>

        {/* Question Review Breakdown */}
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: '700',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          Answer Review & Explanations
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {questions.map((q, idx) => {
            const userSelected = selectedAnswers[q.id];
            const isCorrect = userSelected === q.correctOptionId;

            return (
              <div
                key={q.id || idx}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '0.75rem' }}>
                  {isCorrect ? (
                    <CheckCircle2 size={20} color="var(--accent-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  ) : (
                    <XCircle size={20} color="var(--accent-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  )}
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                      Question {idx + 1}
                    </span>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {q.question}
                    </h4>
                  </div>
                </div>

                {/* Selected vs Correct */}
                <div style={{ marginLeft: '30px', fontSize: '0.88rem' }}>
                  <p style={{ color: isCorrect ? 'var(--accent-success)' : 'var(--accent-danger)', marginBottom: '0.25rem' }}>
                    <strong>Your choice:</strong>{' '}
                    {q.options.find((o) => o.id === userSelected)?.text || 'Not answered'}
                  </p>
                  {!isCorrect && (
                    <p style={{ color: 'var(--accent-success)', marginBottom: '0.5rem' }}>
                      <strong>Correct answer:</strong>{' '}
                      {q.options.find((o) => o.id === q.correctOptionId)?.text}
                    </p>
                  )}

                  {q.explanation && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.6rem 0.8rem',
                        backgroundColor: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '6px',
                      }}
                    >
                      <Info size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Active Quiz Question Flow
  const hasSelectedCurrent = selectedAnswers[currentQ?.id] !== undefined;
  const isLastQuestion = currentIndex === totalQuestions - 1;

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
      {/* Quiz Header */}
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
                fontWeight: '700',
                color: isRetestMode ? 'var(--accent-warning)' : 'var(--accent-purple)',
                backgroundColor: isRetestMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {isRetestMode ? 'Wrong Answer Re-test' : 'Assessment Quiz'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {topic || 'Topic Assessment'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '0.25rem' }}>
            {title}
          </h2>
        </div>

        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-surface)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {currentIndex + 1} / {totalQuestions}
        </span>
      </div>

      {/* Progress bar */}
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
            lineHeight: '1.5',
            color: 'var(--text-primary)',
          }}
        >
          {currentQ.question}
        </h3>
      </div>

      {/* Answer Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        {currentQ.options.map((option) => {
          const isChosen = selectedAnswers[currentQ.id] === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isChosen ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
                border: `1.5px solid ${isChosen ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                textAlign: 'left',
                color: 'var(--text-primary)',
                transition: 'var(--transition-fast)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isChosen) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isChosen) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              }}
            >
              <span
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  backgroundColor: isChosen ? 'var(--accent-primary)' : 'var(--bg-surface)',
                  color: isChosen ? '#fff' : 'var(--text-secondary)',
                  border: isChosen ? 'none' : '1px solid var(--border-subtle)',
                  flexShrink: 0,
                }}
              >
                {option.id}
              </span>
              <span style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>{option.text}</span>
            </button>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          style={{
            padding: '0.6rem 1.2rem',
            backgroundColor: 'var(--bg-surface)',
            color: currentIndex === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.9rem',
            opacity: currentIndex === 0 ? 0.4 : 1,
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Previous
        </button>

        {isLastQuestion ? (
          <button
            onClick={() => setIsSubmitted(true)}
            disabled={!hasSelectedCurrent}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.7rem 1.6rem',
              backgroundColor: 'var(--accent-success)',
              color: '#fff',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.95rem',
              opacity: hasSelectedCurrent ? 1 : 0.5,
              cursor: hasSelectedCurrent ? 'pointer' : 'not-allowed',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Sparkles size={16} />
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.6rem 1.4rem',
              backgroundColor: 'var(--accent-primary)',
              color: '#fff',
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              fontSize: '0.9rem',
            }}
          >
            Next
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
