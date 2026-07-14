# Personal Website

[![CI](https://github.com/OliverFlecke/OliverFlecke.github.io/actions/workflows/main.yml/badge.svg)](https://github.com/OliverFlecke/OliverFlecke.github.io/actions/workflows/main.yml)

This repository contains my personal website, built with [Hugo](https://gohugo.io) and [Tailwind CSS](https://tailwindcss.com), deployed on [Cloudflare Workers](https://workers.cloudflare.com/).

Content includes education, work experience, blog posts, and selected projects.

## Prerequisites

- [Hugo](https://gohugo.io/installation/) v0.163.0+
- [Node.js](https://nodejs.org/) 26+
- [pnpm](https://pnpm.io/installation) 11.13+

## Install

```sh
pnpm install
```

## Development

Run the development server with live reload and Tailwind CSS watch:

```sh
pnpm dev
```

Or start them individually:

```sh
hugo server           # Hugo dev server at http://localhost:1313
pnpm css              # Tailwind CSS build + watch
```

## Build

Build the Tailwind CSS stylesheet and Hugo site:

```sh
pnpm build
hugo --minify
```

The output is written to the `public/` directory, ready to be served by any static host.

## CI

Formatting and linting are enforced via [Biome](https://biomejs.dev/):

```sh
pnpm fmt     # Format code
pnpm lint    # Lint code
```

All checks run automatically on every push and pull request via GitHub Actions (`.github/workflows/main.yml`).

## Deploy

The site is automatically built and deployed to Cloudflare Workers when pushed to `main`.

To deploy manually from your local machine:

```sh
pnpm wrangler deploy
```
