import React from 'react';
import FlashcardDeck from './FlashcardDeck.jsx';
import QuizView from './QuizView.jsx';

/**
 * ResultView is the SINGLE routing point for parsed and validated structured data.
 * Nothing else in the app should switch on mode.
 *
 * @param {{
 *   mode: 'flashcards' | 'quiz',
 *   data: object
 * }} props
 */
export default function ResultView({ mode, data }) {
  if (!data) return null;

  if (mode === 'flashcards') {
    return (
      <FlashcardDeck
        cards={data.cards}
        title={data.title}
        summary={data.summary}
        payload={data}
      />
    );
  }

  if (mode === 'quiz') {
    return (
      <QuizView
        questions={data.questions}
        title={data.title}
        topic={data.topic}
        payload={data}
      />
    );
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      Unknown view format: {mode}
    </div>
  );
}
