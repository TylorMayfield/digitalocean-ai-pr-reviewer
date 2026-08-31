# Advisory AI pull request reviewer

An intentionally small, template-ready GitHub Actions reviewer. It sends a redacted, capped pull request diff to [DigitalOcean Serverless Inference](https://docs.digitalocean.com/products/inference/reference/api/serverless-inference/) and posts or updates one advisory pull request comment.

It does not approve, request changes, merge code, or execute pull-request code.

## Read the guide

[Build an AI Pull Request Reviewer with GitHub Actions and DigitalOcean](https://www.tylor.nz/content/build-ai-pull-request-reviewer)

## Disclosure

This README includes a DigitalOcean affiliate link. If you use it, I may earn a commission at no additional cost to you.

[Explore DigitalOcean Serverless Inference](https://www.awin1.com/cread.php?s=4757508&v=123996&q=601070&r=3054551)

## Before you start

You need a GitHub repository where you can create a branch and pull request, a DigitalOcean account with Serverless Inference access, and Node.js 22.6 or newer for the local checks. The workflow needs one GitHub repository secret named `DIGITALOCEAN_TOKEN`. `DIGITALOCEAN_MODEL` is optional; the default model is `openai-gpt-oss-20b`.

## First run

1. On GitHub, select **Use this template** to create a new repository, or fork this repository for a personal test.
2. Create a narrowly scoped DigitalOcean model access key: **INFERENCE → Manage → Create model access key**. Choose only the model you intend to use, then copy the one-time secret.
3. In your new GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret**. Name it `DIGITALOCEAN_TOKEN`, paste the key, and save it. Optionally create a repository variable named `DIGITALOCEAN_MODEL` with a model ID from the Model Catalog.
4. From the repository’s default branch, create a branch such as `test-ai-review`. Edit a small non-lockfile source or documentation file, commit, push, and open a **non-draft** pull request back to that same repository.
5. Open the pull request’s **Actions** tab. A successful run posts one comment titled “Advisory AI pull request review.” Pushing another commit updates that same comment instead of adding another one.

Run the included checks before enabling the workflow in a repository with real work:

```sh
npm ci
npm test
npm run review
```

`npm run review` is the workflow entry point. It requires GitHub Actions environment variables and a real `DIGITALOCEAN_TOKEN`, so run it locally only when you deliberately provide a disposable test environment.

## What the workflow does

- Runs on `pull_request`, never `pull_request_target`.
- Skips draft pull requests and pull requests from forks before secrets can be used.
- Checks out only `github.event.pull_request.base.sha`: the trusted reviewer from the base branch, not pull-request code.
- Pins `actions/checkout` and `actions/setup-node` to reviewed commit SHAs.
- Uses least-privilege `contents: read` and `pull-requests: write` permissions.
- Skips lock, generated, dependency, source-map, and common binary files.
- Caps the request at 20 files and 45,000 characters, redacts common token/private-key patterns, and requires structured JSON with at most three findings.
- Updates a marker-based sticky comment and remains non-blocking even when inference fails.

## Safety boundary

Diffs can contain malicious instructions in comments, documentation, or strings. The prompt treats the complete diff as untrusted data and never follows instructions inside it. File exclusions, size limits, response validation, and redaction reduce exposure, but cannot make committed secrets safe. Keep human review, branch protection, tests, and static analysis as independent controls.

Forked pull requests are intentionally skipped because GitHub does not provide normal repository secrets to workflows triggered by forks. Do not replace `pull_request` with `pull_request_target` to bypass that restriction. Do not use this starter for production credentials, regulated data, or a deterministic security control.

## License

[MIT](LICENSE)
