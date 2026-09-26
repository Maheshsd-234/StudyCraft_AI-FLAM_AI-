/**
 * Defensive schema validation for LLM responses
 * Ensures raw input/JSON matches the expected shapes before rendering.
 */

/**
 * Validates flashcards payload structure
 * @param {any} data
 * @returns {{ isValid: boolean, data?: object, error?: string }}
 */
export function validateFlashcards(data) {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Response is not a valid JSON object.' };
  }

  const cards = Array.isArray(data.cards) ? data.cards : null;
  if (!cards) {
    return { isValid: false, error: 'Missing "cards" array in response.' };
  }

  if (cards.length === 0) {
    return { isValid: false, error: 'The AI generated an empty list of flashcards.' };
  }

  const sanitizedCards = [];
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    if (!card || typeof card !== 'object') {
      return { isValid: false, error: `Card at index ${i} is invalid.` };
    }

    const question = typeof card.question === 'string' ? card.question.trim() : '';
    const answer = typeof card.answer === 'string' ? card.answer.trim() : '';

    if (!question || !answer) {
      return { isValid: false, error: `Card #${i + 1} is missing a question or answer.` };
    }

    sanitizedCards.push({
      id: card.id || `card-${i + 1}-${Date.now()}`,
      question,
      answer,
      category: typeof card.category === 'string' ? card.category.trim() : 'General',
      difficulty: ['easy', 'medium', 'hard'].includes(card.difficulty?.toLowerCase())
        ? card.difficulty.toLowerCase()
        : 'medium',
    });
  }

  return {
    isValid: true,
    data: {
      title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : 'Study Flashcards',
      summary: typeof data.summary === 'string' ? data.summary.trim() : '',
      cards: sanitizedCards,
    },
  };
}

/**
 * Validates quiz payload structure
 * @param {any} data
 * @returns {{ isValid: boolean, data?: object, error?: string }}
 */
export function validateQuiz(data) {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Response is not a valid JSON object.' };
  }

  const questions = Array.isArray(data.questions) ? data.questions : null;
  if (!questions) {
    return { isValid: false, error: 'Missing "questions" array in response.' };
  }

  if (questions.length === 0) {
    return { isValid: false, error: 'The AI generated an empty quiz question set.' };
  }

  const sanitizedQuestions = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q || typeof q !== 'object') {
      return { isValid: false, error: `Question at index ${i} is invalid.` };
    }

    const questionText = typeof q.question === 'string' ? q.question.trim() : '';
    if (!questionText) {
      return { isValid: false, error: `Question #${i + 1} is missing question text.` };
    }

    if (!Array.isArray(q.options) || q.options.length < 2) {
      return { isValid: false, error: `Question #${i + 1} must have at least 2 answer options.` };
    }

    // Sanitize options
    const sanitizedOptions = q.options.map((opt, optIdx) => {
      if (typeof opt === 'string') {
        const id = String.fromCharCode(65 + optIdx); // 'A', 'B', 'C', 'D'
        return { id, text: opt.trim() };
      }
      return {
        id: opt.id || String.fromCharCode(65 + optIdx),
        text: typeof opt.text === 'string' ? opt.text.trim() : String(opt),
      };
    });

    const validOptionIds = sanitizedOptions.map((o) => String(o.id));
    let correctId = String(q.correctOptionId || q.correctAnswer || sanitizedOptions[0].id);

    // If correctId does not match direct ID, check if it matches option text
    if (!validOptionIds.includes(correctId)) {
      const matchByText = sanitizedOptions.find(
        (o) => o.text.toLowerCase() === correctId.toLowerCase()
      );
      if (matchByText) {
        correctId = matchByText.id;
      } else {
        correctId = sanitizedOptions[0].id;
      }
    }

    sanitizedQuestions.push({
      id: q.id || `q-${i + 1}-${Date.now()}`,
      question: questionText,
      options: sanitizedOptions,
      correctOptionId: correctId,
      explanation: typeof q.explanation === 'string' ? q.explanation.trim() : 'Correct answer explanation.',
    });
  }

  return {
    isValid: true,
    data: {
      title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : 'Interactive Assessment Quiz',
      topic: typeof data.topic === 'string' ? data.topic.trim() : 'General Topic',
      questions: sanitizedQuestions,
    },
  };
}

/**
 * Universal validator that routes based on mode
 * @param {'flashcards' | 'quiz'} mode
 * @param {string | object} rawResponse
 * @returns {{ isValid: boolean, data?: object, error?: string }}
 */
export function validateResult(mode, rawResponse) {
  let parsedJson = rawResponse;

  if (typeof rawResponse === 'string') {
    try {
      // Clean up common LLM markdown formatting if present
      let cleaned = rawResponse.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      parsedJson = JSON.parse(cleaned);
    } catch (err) {
      return {
        isValid: false,
        error: `Malformed JSON: The AI output could not be parsed as valid JSON (${err.message}).`,
      };
    }
  }

  if (mode === 'flashcards') {
    return validateFlashcards(parsedJson);
  } else if (mode === 'quiz') {
    return validateQuiz(parsedJson);
  }

  return { isValid: false, error: `Unknown mode "${mode}".` };
}
