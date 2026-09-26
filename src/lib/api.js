/**
 * API client to interact with backend proxy
 * Keeps API keys completely private on the server.
 */

const API_BASE_URL = '/api';

/**
 * Call the backend generate proxy
 * @param {Object} params
 * @param {string} params.prompt - Free-form text or topic entered by the user
 * @param {'flashcards' | 'quiz'} params.mode - Selected generation mode
 * @param {AbortSignal} [params.signal] - Optional abort signal for cancellation / race conditions
 * @param {Object} [params.options] - Optional configurations (e.g. card count, difficulty)
 * @returns {Promise<{ rawText: string, data?: object, success: boolean, error?: string }>}
 */
export async function generateStudyMaterial({ prompt, mode = 'flashcards', signal, options = {} }) {
  if (!prompt || !prompt.trim()) {
    throw new Error('Prompt cannot be empty.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt.trim(),
        mode,
        options,
      }),
      signal,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `Server responded with status ${response.status}`);
    }

    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    throw new Error(error.message || 'Failed to communicate with the study assistant backend.');
  }
}
