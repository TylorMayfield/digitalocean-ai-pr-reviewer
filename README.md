# Advisory AI pull request reviewer

This starter is published with the site source at `examples/digitalocean-ai-pr-reviewer`.

An intentionally small GitHub Actions reviewer that sends a redacted, capped pull request diff to [DigitalOcean Serverless Inference](https://docs.digitalocean.com/products/inference/reference/api/serverless-inference/) and updates one advisory PR comment.

It is not a merge gate, does not approve or reject pull requests, and never checks out or executes pull-request code.

## What it does

- Runs on `pull_request`, never `pull_request_target`.
- Runs only for same-repository pull requests; forks are skipped before a secret can be used.
- Uses least-privilege `contents: read` and `pull-requests: write` permissions.
- Fetches the diff through GitHub's API; no `checkout` step is present.
- Skips lock, generated, dependency, source-map, and common binary files.
- Caps the review at 20 files and 45,000 characters, then redacts common token and private-key patterns.
- Requires structured JSON, limits output to three findings, and updates a marked sticky comment.

## Setup

1. Copy `.github/workflows/ai-pr-review.yml`, `src/review.ts`, and `package.json` into the repository you want to review.
2. In **Settings → Secrets and variables → Actions**, add a `DIGITALOCEAN_TOKEN` repository secret. Use a model access key with access only to the Serverless Inference model you intend to use.
3. Optionally add a `DIGITALOCEAN_MODEL` repository variable. The default is `openai-gpt-oss-20b`; select a current model ID from the DigitalOcean Model Catalog.
4. Open a non-draft pull request from a branch in the same repository. The job posts or updates one advisory comment.

The workflow is deliberately non-blocking (`continue-on-error: true`). Keep branch protection, tests, static analysis, and human review as separate controls.

## Test it before enabling it

Requires Node.js 22.6 or newer.

```sh
npm test
```

The fixture verifies token redaction, skipped lock files, structured-result validation, and the no-findings comment. Before using a real repository, open a disposable same-repository pull request and verify that one comment is updated on each push.

## Security boundary

Diffs can contain malicious instructions in comments, documentation, or strings. The prompt labels the complete diff as untrusted data and never follows instructions contained in it. Size limits, file exclusions, and token-pattern redaction reduce exposure, but they cannot make committed secrets safe. Do not use this starter for production credentials, regulated data, or a workflow that requires a deterministic security control.

Forked pull requests are skipped. GitHub withholds normal repository secrets from fork-triggered workflows and provides a read-only token. Do not replace `pull_request` with `pull_request_target` to bypass this restriction.

## License

[MIT](LICENSE)
