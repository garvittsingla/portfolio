---
title: "GitHub Actions for dummies"
description: "Demystifying automated CI/CD pipelines: runners, workflows, jobs, triggers, and building your first automated test & deployment script from scratch."
date: "May 18, 2026"
tags: ["DevOps", "CI/CD", "Automation", "GitHub"]
readTime: "4 min read"
author: "Garvit Singla"
xUrl: "https://x.com/garvitsinglaa/status/2056971098999402611"
likes: 38
views: 740
---

Have you ever wondered how tech teams manage to push code into production ten times a day without setting everything on fire?

How do they ensure thousands of unit tests run, linters pass, Docker containers build, and staging deployments trigger automatically—the exact moment a pull request is merged?

The magic behind this is **Continuous Integration & Continuous Deployment (CI/CD)**, and **GitHub Actions** is the cleanest tool to master it.

---

## The Mental Model: What is GitHub Actions?

Think of GitHub Actions as a free, ephemeral cloud computer (a runner) that spins up in an isolated sandbox, executes whatever terminal commands you specify, and then disappears.

There are only **4 core concepts** you need to understand:

```text
[Event / Trigger]  ->  [Workflow file (.github/workflows/*.yml)]
                              |
                     +--------+--------+
                     |                 |
                  [Job 1]           [Job 2]
                     |                 |
                  [Steps]           [Steps]
                  - Checkout        - Run Build
                  - Run Tests       - Deploy
```

1. **Workflow**: The YAML configuration file residing in `.github/workflows/`.
2. **Event (Trigger)**: What kicks off the workflow (`push`, `pull_request`, `schedule`, or manual button `workflow_dispatch`).
3. **Job**: A set of steps executed on the same virtual machine (e.g. `ubuntu-latest`, `macos-latest`, `windows-latest`).
4. **Step**: An individual task—either running a shell command (`run: npm test`) or using a pre-packaged community action (`uses: actions/checkout@v4`).

---

## Writing Your First Workflow in 60 Seconds

Create a file in your repository: `.github/workflows/test.yml`:

```yaml
name: Test and Lint Suite

# 1. Trigger when code is pushed to main or opened in a PR
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  verify:
    name: Lint & Run Unit Tests
    runs-on: ubuntu-latest

    steps:
      # Step 1: Clone the repository onto the runner
      - name: Checkout Code
        uses: actions/checkout@v4

      # Step 2: Install Node runtime
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      # Step 3: Install dependencies
      - name: Install dependencies
        run: npm ci

      # Step 4: Run linter
      - name: Run ESLint
        run: npm run lint

      # Step 5: Execute test suite
      - name: Run Test Suite
        run: npm test
```

That's all it takes! Every time anyone submits a pull request, GitHub spins up an Ubuntu VM, pulls down your repository, installs packages, runs your checks, and reports a green checkmark or red cross directly next to their commit.

---

## 3 Pro-Tips for Production Pipelines

### 1. Matrix Builds
Test across multiple platforms or language versions simultaneously:

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest]
    node-version: [18, 20, 22]
```

### 2. Protect Secrets
Never commit `.env` files or API tokens! Store them under **Repository Settings > Secrets and variables > Actions**, and inject them cleanly:

```yaml
env:
  DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
```

### 3. Fail Fast & Cache
Always enable dependency caching (`cache: 'npm'` or `cache: 'cargo'`). It can turn a 5-minute build into a 25-second breeze.

Automate the boring stuff so you can focus on building what matters.
