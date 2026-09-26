/**
 * Defensive schema validation for LLM responses.
 *
 * Strips code fences, parses JSON safely, and structurally checks fields, types,
 * and array lengths per mode.
 *
 * Never throws — always returns:
 * - On success: { valid: true, data: <sanitized data> }
 * - On failure: { valid: false, reason: <specific explanation string> }
 */

/**
 * Strips markdown code fences (```json ... ``` or ``` ... ```) if present.
 * @param {string} text
 * @returns {string}
 */
export function stripCodeFences(text) {
  if (typeof text !== 'string') return '';
  let cleaned = text.trim();

  // Strip leading ```json or ``` and trailing ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }

  return cleaned.trim();
}

/**
 * Structurally validates flashcard payload
 * @param {any} data
 * @returns {{ valid: boolean, isValid?: boolean, data?: object, reason?: string, error?: string }}
 */
function validateFlashcardsStructure(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      valid: false,
      isValid: false,
      reason: 'Flashcards payload root must be a JSON object, received ' + (Array.isArray(data) ? 'array' : typeof data),
      error: 'Flashcards payload root must be a JSON object',
    };
  }

  if (!('cards' in data)) {
    return {
      valid: false,
      isValid: false,
      reason: 'Missing required "cards" property in response object',
      error: 'Missing required "cards" property in response object',
    };
  }

  if (!Array.isArray(data.cards)) {
    return {
      valid: false,
      isValid: false,
      reason: `Expected "cards" to be an array, but received ${typeof data.cards}`,
      error: `Expected "cards" to be an array, but received ${typeof data.cards}`,
    };
  }

  if (data.cards.length === 0) {
    return {
      valid: false,
      isValid: false,
      reason: 'The "cards" array is empty; expected at least 1 flashcard',
      error: 'The "cards" array is empty; expected at least 1 flashcard',
    };
  }

  const sanitizedCards = [];

  for (let i = 0; i < data.cards.length; i++) {
    const card = data.cards[i];

    if (!card || typeof card !== 'object' || Array.isArray(card)) {
      return {
        valid: false,
        isValid: false,
        reason: `Card at index ${i} is not a valid object`,
        error: `Card at index ${i} is not a valid object`,
      };
    }

    if (typeof card.question !== 'string' || !card.question.trim()) {
      return {
        valid: false,
        isValid: false,
        reason: `Card #${i + 1} is missing a non-empty "question" string`,
        error: `Card #${i + 1} is missing a non-empty "question" string`,
      };
    }

    if (typeof card.answer !== 'string' || !card.answer.trim()) {
      return {
        valid: false,
        isValid: false,
        reason: `Card #${i + 1} (Question: "${card.question.slice(0, 30)}...") is missing a non-empty "answer" string`,
        error: `Card #${i + 1} is missing a non-empty "answer" string`,
      };
    }

    const validDifficulties = ['easy', 'medium', 'hard'];
    const difficulty =
      typeof card.difficulty === 'string' && validDifficulties.includes(card.difficulty.toLowerCase())
        ? card.difficulty.toLowerCase()
        : 'medium';

    sanitizedCards.push({
      id: typeof card.id === 'string' && card.id.trim() ? card.id.trim() : `card-${i + 1}-${Date.now()}`,
      question: card.question.trim(),
      answer: card.answer.trim(),
      category: typeof card.category === 'string' && card.category.trim() ? card.category.trim() : 'General',
      difficulty,
    });
  }

  return {
    valid: true,
    isValid: true,
    reason: null,
    error: null,
    data: {
      title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : 'Study Flashcards',
      summary: typeof data.summary === 'string' ? data.summary.trim() : '',
      cards: sanitizedCards,
    },
  };
}

/**
 * Structurally validates quiz payload
 * @param {any} data
 * @returns {{ valid: boolean, isValid?: boolean, data?: object, reason?: string, error?: string }}
 */
function validateQuizStructure(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      valid: false,
      isValid: false,
      reason: 'Quiz payload root must be a JSON object, received ' + (Array.isArray(data) ? 'array' : typeof data),
      error: 'Quiz payload root must be a JSON object',
    };
  }

  if (!('questions' in data)) {
    return {
      valid: false,
      isValid: false,
      reason: 'Missing required "questions" property in quiz response',
      error: 'Missing required "questions" property in quiz response',
    };
  }

  if (!Array.isArray(data.questions)) {
    return {
      valid: false,
      isValid: false,
      reason: `Expected "questions" to be an array, but received ${typeof data.questions}`,
      error: `Expected "questions" to be an array, but received ${typeof data.questions}`,
    };
  }

  if (data.questions.length === 0) {
    return {
      valid: false,
      isValid: false,
      reason: 'The "questions" array is empty; expected at least 1 quiz question',
      error: 'The "questions" array is empty; expected at least 1 quiz question',
    };
  }

  const sanitizedQuestions = [];

  for (let i = 0; i < data.questions.length; i++) {
    const q = data.questions[i];

    if (!q || typeof q !== 'object' || Array.isArray(q)) {
      return {
        valid: false,
        isValid: false,
        reason: `Question at index ${i} is not a valid object`,
        error: `Question at index ${i} is not a valid object`,
      };
    }

    if (typeof q.question !== 'string' || !q.question.trim()) {
      return {
        valid: false,
        isValid: false,
        reason: `Question #${i + 1} is missing a non-empty "question" string`,
        error: `Question #${i + 1} is missing a non-empty "question" string`,
      };
    }

    if (!Array.isArray(q.options)) {
      return {
        valid: false,
        isValid: false,
        reason: `Question #${i + 1} is missing a valid "options" array`,
        error: `Question #${i + 1} is missing a valid "options" array`,
      };
    }

    if (q.options.length < 2) {
      return {
        valid: false,
        isValid: false,
        reason: `Question #${i + 1} must contain at least 2 options, found ${q.options.length}`,
        error: `Question #${i + 1} must contain at least 2 options`,
      };
    }

    // Sanitize options
    const sanitizedOptions = [];
    for (let optIdx = 0; optIdx < q.options.length; optIdx++) {
      const opt = q.options[optIdx];
      if (typeof opt === 'string') {
        const trimmed = opt.trim();
        if (!trimmed) {
          return {
            valid: false,
            isValid: false,
            reason: `Option at index ${optIdx} in Question #${i + 1} is empty`,
            error: `Option at index ${optIdx} in Question #${i + 1} is empty`,
          };
        }
        sanitizedOptions.push({
          id: String.fromCharCode(65 + optIdx),
          text: trimmed,
        });
      } else if (opt && typeof opt === 'object') {
        const text = typeof opt.text === 'string' ? opt.text.trim() : '';
        if (!text) {
          return {
            valid: false,
            isValid: false,
            reason: `Option at index ${optIdx} in Question #${i + 1} is missing a text description`,
            error: `Option at index ${optIdx} in Question #${i + 1} is missing a text description`,
          };
        }
        sanitizedOptions.push({
          id: opt.id ? String(opt.id).trim() : String.fromCharCode(65 + optIdx),
          text,
        });
      } else {
        return {
          valid: false,
          isValid: false,
          reason: `Option at index ${optIdx} in Question #${i + 1} is not a valid string or object`,
          error: `Option at index ${optIdx} in Question #${i + 1} is invalid`,
        };
      }
    }

    const availableIds = sanitizedOptions.map((o) => o.id);
    let correctId = q.correctOptionId ? String(q.correctOptionId).trim() : null;

    if (!correctId || !availableIds.includes(correctId)) {
      // Check if correctOptionId matched option text
      const matchByText = sanitizedOptions.find(
        (o) => o.text.toLowerCase() === String(correctId).toLowerCase()
      );
      if (matchByText) {
        correctId = matchByText.id;
      } else {
        return {
          valid: false,
          isValid: false,
          reason: `Question #${i + 1} "correctOptionId" (${correctId}) does not match any valid option ID [${availableIds.join(', ')}]`,
          error: `Question #${i + 1} "correctOptionId" does not match any valid option ID`,
        };
      }
    }

    sanitizedQuestions.push({
      id: typeof q.id === 'string' && q.id.trim() ? q.id.trim() : `q-${i + 1}-${Date.now()}`,
      question: q.question.trim(),
      options: sanitizedOptions,
      correctOptionId: correctId,
      explanation:
        typeof q.explanation === 'string' && q.explanation.trim()
          ? q.explanation.trim()
          : `Option ${correctId} is the correct answer.`,
    });
  }

  return {
    valid: true,
    isValid: true,
    reason: null,
    error: null,
    data: {
      title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : 'Assessment Quiz',
      topic: typeof data.topic === 'string' && data.topic.trim() ? data.topic.trim() : 'General Topic',
      questions: sanitizedQuestions,
    },
  };
}

/**
 * Main validator: validates raw model string or object against mode schema.
 *
 * @param {string | object} raw - Raw model text or pre-parsed object
 * @param {'flashcards' | 'quiz'} mode - Selected generation mode
 * @returns {{ valid: boolean, isValid: boolean, data?: object, reason?: string, error?: string }}
 */
export function validateResult(raw, mode = 'flashcards') {
  // Normalize if arguments were passed as (mode, raw)
  if (raw === 'flashcards' || raw === 'quiz') {
    const temp = raw;
    raw = mode;
    mode = temp;
  }

  if (raw === undefined || raw === null) {
    return {
      valid: false,
      isValid: false,
      reason: 'Input is null or undefined; expected raw model text or JSON object',
      error: 'Input is null or undefined',
    };
  }

  if (typeof raw === 'string' && raw.trim() === '') {
    return {
      valid: false,
      isValid: false,
      reason: 'Input is an empty string; model returned no content',
      error: 'Input is an empty string',
    };
  }

  let parsed = raw;

  if (typeof raw === 'string') {
    const cleaned = stripCodeFences(raw);
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      return {
        valid: false,
        isValid: false,
        reason: `Failed to parse JSON: ${err.message}`,
        error: `Malformed JSON: ${err.message}`,
      };
    }
  }

  if (mode === 'flashcards') {
    return validateFlashcardsStructure(parsed);
  }

  if (mode === 'quiz') {
    return validateQuizStructure(parsed);
  }

  return {
    valid: false,
    isValid: false,
    reason: `Unsupported mode "${mode}". Supported modes are "flashcards" and "quiz".`,
    error: `Unsupported mode "${mode}".`,
  };
}

export default validateResult;
