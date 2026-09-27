import { validateResult } from './validateResult.js';

/**
 * Custom Typed API Error with error kind classification
 * Kinds: 'network' | 'timeout' | 'malformed' | 'invalid_shape' | 'empty'
 */
export class ApiError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {'network' | 'timeout' | 'malformed' | 'invalid_shape' | 'empty'} kind - Categorized error type
   * @param {any} [details] - Raw diagnostic context or stack trace
   * @param {number} [status] - HTTP status code if available
   */
  constructor(message, kind = 'network', details = null, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.details = details;
    this.status = status;
  }
}

/**
 * Calls /api/generate with notes and mode, validates response via validateResult,
 * and throws typed ApiError with specific kind on failure.
 *
 * @param {string} notes - Free-form study notes or concept
 * @param {'flashcards' | 'quiz'} [mode='flashcards'] - Selected generation mode
 * @param {AbortSignal} [signal] - Optional AbortController signal
 * @returns {Promise<object>} Parsed and structurally validated payload
 * @throws {ApiError}
 */
export async function generate(notes, mode = 'flashcards', signal) {
  const trimmed = typeof notes === 'string' ? notes.trim() : '';
  if (!trimmed) {
    throw new ApiError('Please enter notes or a topic before generating.', 'empty');
  }

  let response;
  try {
    response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notes: trimmed,
        mode,
      }),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err;
    }
    throw new ApiError(
      'Unable to connect to the backend server. Please verify your connection.',
      'network',
      err.message
    );
  }

  // Handle HTTP status errors (Read stream once as text to prevent "stream already read" error)
  if (!response.ok) {
    if (response.status === 504) {
      throw new ApiError(
        'Request timed out after 15 seconds. The AI model was too slow to respond.',
        'timeout',
        'HTTP 504 Gateway Timeout',
        504
      );
    }

    let rawErrorText = '';
    try {
      rawErrorText = await response.text();
    } catch (readErr) {
      rawErrorText = `HTTP ${response.status}`;
    }

    let errorPayload = null;
    try {
      errorPayload = JSON.parse(rawErrorText);
    } catch {
      errorPayload = { error: rawErrorText || `HTTP ${response.status}` };
    }

    if (errorPayload?.error === 'timeout') {
      throw new ApiError(
        'The generation request timed out after 15 seconds.',
        'timeout',
        errorPayload.details,
        response.status
      );
    }

    throw new ApiError(
      errorPayload?.error || `Server responded with status ${response.status}`,
      'network',
      errorPayload?.details || rawErrorText,
      response.status
    );
  }

  // Read response stream safely
  let responseText = '';
  try {
    responseText = await response.text();
  } catch (readErr) {
    throw new ApiError(
      'Failed to read response from server.',
      'network',
      readErr.message
    );
  }

  let resultJson = null;
  try {
    resultJson = JSON.parse(responseText);
  } catch (err) {
    throw new ApiError(
      'Server returned an unparseable response.',
      'malformed',
      responseText
    );
  }

  const rawModelContent = resultJson?.raw ?? resultJson?.rawText ?? resultJson;

  if (!rawModelContent || (typeof rawModelContent === 'string' && !rawModelContent.trim())) {
    throw new ApiError(
      'The AI model returned an empty response.',
      'empty',
      resultJson
    );
  }

  // Validate structured shape defensively
  const validation = validateResult(rawModelContent, mode);

  if (!validation.valid) {
    const isMalformed =
      validation.reason?.includes('Failed to parse JSON') ||
      validation.reason?.includes('Unexpected token');

    const kind = isMalformed ? 'malformed' : 'invalid_shape';

    throw new ApiError(
      validation.reason || 'The generated output did not match the required schema.',
      kind,
      typeof rawModelContent === 'string' ? rawModelContent : JSON.stringify(rawModelContent, null, 2)
    );
  }

  return validation.data;
}

// Aliases for compatibility
export const generateStudyMaterial = generate;
export default generate;
