import assert from 'node:assert/strict';
import test from 'node:test';
import { buildReviewPacket, findStickyComment, parseReviewResult, redactSecrets, renderComment } from '../src/review.ts';

const FIXTURE_DIFF = `diff --git a/src/handler.ts b/src/handler.ts
index 123..456 100644
--- a/src/handler.ts
+++ b/src/handler.ts
@@ -1,3 +1,4 @@
+const token = "ghp_123456789012345678901234567890";
 export function handler(input: string) {
+  return eval(input);
 }
diff --git a/pnpm-lock.yaml b/pnpm-lock.yaml
index 123..456 100644
--- a/pnpm-lock.yaml
+++ b/pnpm-lock.yaml
@@ -1 +1 @@
+lockfileVersion: '9.0'
`;

test('redacts common token values', () => {
  assert.equal(redactSecrets('token ghp_123456789012345678901234567890'), 'token [REDACTED]');
});

test('filters lock files and redacts the review packet', () => {
  const result = buildReviewPacket(FIXTURE_DIFF);
  assert.equal(result.includedFiles, 1);
  assert.match(result.packet, /\[REDACTED\]/);
  assert.deepEqual(result.skippedFiles, ['pnpm-lock.yaml']);
});

test('returns only valid structured findings', () => {
  const result = parseReviewResult('{"findings":[{"severity":"high","file":"src/handler.ts","startLine":3,"endLine":3,"evidence":"eval(input)","explanation":"Untrusted input can execute code."},{"severity":"critical"}]}');
  assert.equal(result.findings.length, 1);
  assert.equal(result.findings[0].severity, 'high');
});

test('treats malformed model output as no findings', () => {
  assert.deepEqual(parseReviewResult('I found a critical issue.'), { findings: [] });
});

test('uses a clear no-findings comment', () => {
  const comment = renderComment({ findings: [] }, []);
  assert.match(comment, /No actionable/);
  assert.match(comment, /non-blocking/);
});

test('finds the existing marked comment so it can be replaced', () => {
  const existing = findStickyComment([{ id: 1, body: 'A different comment' }, { id: 2, body: '<!-- do-ai-pr-review -->\nOld review' }]);
  assert.equal(existing?.id, 2);
});
