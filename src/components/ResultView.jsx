import React from 'react';
import FlashcardDeck from './FlashcardDeck.jsx';
import QuizView from './QuizView.jsx';

/**
 * Result router that renders the appropriate interactive UI view based on mode
 * @param {{
 *   mode: 'flashcards' | 'quiz',
 *   data: object
 * }} props
 */
export default function ResultView({ mode, data }) {
  if (!data) return null;

  if (mode === 'flashcards') {
    return <FlashcardDeck payload={data} />;
  }

  if (mode === 'quiz') {
    return <QuizView payload={data} />;
  }

  return null;
}
