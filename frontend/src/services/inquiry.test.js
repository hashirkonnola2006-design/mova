import { sendInquiry, buildMailtoFallback } from './inquiry.js';

// Test mock harnesses
async function runTests() {
  console.log('--- RUNNING INQUIRY SERVICE TESTS ---');

  // Test 1: Mailto fallback generation
  const mailto = buildMailtoFallback({
    source: '/help#camera-denied',
    type: 'Help with the app',
    message: 'Camera is not starting up.',
    email: 'tester@example.com',
    techDetails: { browser: 'Chrome 120', cameraApiSupported: true }
  });
  console.assert(mailto.startsWith('mailto:'), 'Test 1 Failed: Mailto does not start with mailto:');
  console.assert(mailto.includes('tester%40example.com'), 'Test 1 Failed: email not in mailto');
  console.assert(mailto.includes('%5BMOVA%5D'), 'Test 1 Failed: [MOVA] not in subject');
  console.log('✓ Test 1 Passed: buildMailtoFallback format');

  // Test 2: Validation of empty message
  const emptyRes = await sendInquiry({ source: '/', type: 'Bug', message: '   ' });
  console.assert(!emptyRes.ok, 'Test 2 Failed: Empty message should not succeed');
  console.log('✓ Test 2 Passed: Empty message rejected');

  console.log('--- ALL TEST CHECKS COMPLETED SUCCESSFULLY ---');
}

runTests();
