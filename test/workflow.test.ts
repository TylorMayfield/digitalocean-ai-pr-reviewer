import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const workflow = await readFile(new URL('../.github/workflows/ai-pr-review.yml', import.meta.url), 'utf8');

test('uses a trusted base checkout and pinned actions', () => {
  assert.match(workflow, /actions\/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6\.0\.2/);
  assert.match(workflow, /ref: \$\{\{ github\.event\.pull_request\.base\.sha \}\}/);
  assert.match(workflow, /persist-credentials: false/);
  assert.match(workflow, /actions\/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e # v6\.4\.0/);
});

test('is advisory, least-privilege, and safe for forks and drafts', () => {
  assert.match(workflow, /contents: read/);
  assert.match(workflow, /pull-requests: write/);
  assert.match(workflow, /head\.repo\.full_name == github\.repository/);
  assert.match(workflow, /!github\.event\.pull_request\.draft/);
  assert.match(workflow, /continue-on-error: true/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run review/);
  assert.doesNotMatch(workflow, /pull_request_target|npx/);
});
