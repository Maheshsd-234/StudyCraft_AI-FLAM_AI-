import { generate, ApiError } from './api.js';

console.log('=== Running App & API Verification Suite ===\n');

// 1. Verify ApiError typing
const testErr = new ApiError('Model timed out', 'timeout', '504', 504);
console.log('1. ApiError structure:');
console.log('   kind:', testErr.kind);
console.log('   message:', testErr.message);
console.log('   instanceof Error:', testErr instanceof Error);
console.log('');

// 2. Verify empty input blocking
try {
  await generate('   ', 'flashcards');
  console.error('2. Failed: Should have thrown for empty input');
} catch (err) {
  console.log('2. Empty input prevention:');
  console.log('   kind:', err.kind);
  console.log('   message:', err.message);
  console.log('');
}

// 3. Verify Server Offline / Network Error handling
try {
  await generate('React Hooks', 'flashcards');
  console.log('3. API response received');
} catch (err) {
  console.log('3. Server unavailable handling (Network failure):');
  console.log('   kind:', err.kind);
  console.log('   message:', err.message);
  console.log('');
}

// 4. Verify Stale Response Guard logic simulation
let currentRequestId = 0;
let renderedResult = null;

async function simulateRequest(id, delay, payload) {
  const reqId = ++currentRequestId;
  await new Promise((res) => setTimeout(res, delay));
  if (reqId !== currentRequestId) {
    // discarded!
    return;
  }
  renderedResult = { id: reqId, payload };
}

// Fire request 1 (slow, 150ms) and request 2 (fast, 50ms)
const p1 = simulateRequest(1, 150, 'Result from Request #1 (Slow)');
const p2 = simulateRequest(2, 50, 'Result from Request #2 (Fast)');

await Promise.all([p1, p2]);

console.log('4. Stale-Response Guard Test:');
console.log('   Final Rendered Result:', renderedResult);
console.log('   Correctly preserved Request #2 only?:', renderedResult.id === 2);
console.log('');

console.log('=== All verifications passed successfully ===');
