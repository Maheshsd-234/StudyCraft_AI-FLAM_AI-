/**
 * JSDoc Type Definitions for Study Assistant Structured Output
 */

/**
 * @typedef {'flashcards' | 'quiz'} GenerationMode
 */

/**
 * @typedef {Object} FlashcardItem
 * @property {string} id - Unique identifier or index for the card
 * @property {string} question - The prompt, concept, or question on front of card
 * @property {string} answer - Clear, comprehensive explanation on back of card
 * @property {string} [category] - Optional subtopic or category tag
 * @property {'easy' | 'medium' | 'hard'} [difficulty] - Difficulty level
 */

/**
 * @typedef {Object} FlashcardPayload
 * @property {string} title - Topic or title of the study set
 * @property {string} summary - Brief overview of what this set covers
 * @property {FlashcardItem[]} cards - Array of flashcard objects
 */

/**
 * @typedef {Object} QuizOption
 * @property {string} id - Option identifier (e.g. "A", "B", "C", "D")
 * @property {string} text - Option choice text
 */

/**
 * @typedef {Object} QuizQuestion
 * @property {string} id - Unique identifier for the question
 * @property {string} question - Question text
 * @property {QuizOption[]} options - 4 distinct answer choices
 * @property {string} correctOptionId - ID of the correct option (e.g. "A", "B", "C", "D")
 * @property {string} explanation - Educational explanation of why this answer is correct
 */

/**
 * @typedef {Object} QuizPayload
 * @property {string} title - Quiz title
 * @property {string} topic - Topic name
 * @property {QuizQuestion[]} questions - Array of quiz questions
 */

/**
 * Unified parsed result container
 * @typedef {Object} StudyResult
 * @property {GenerationMode} mode - 'flashcards' or 'quiz'
 * @property {FlashcardPayload|QuizPayload} data - Structured payload
 * @property {string} rawInput - Original prompt entered by the user
 * @property {number} timestamp - Generation epoch timestamp
 */

export {};
