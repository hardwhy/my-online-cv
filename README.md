# Senior Engineer Portfolio

A modern, responsive personal CV and portfolio application built with React, TypeScript, Vite, Tailwind CSS, Framer Motion, and React Router.

## Features

- Responsive mobile-first portfolio layout
- Light and dark mode with persisted preference
- Smooth page transitions, scroll reveal animations, hover states, animated skill bars, and timeline animations
- Home, About, Experience, Projects, Project Detail, Skills, Certifications, Contact, and Blog pages
- Searchable and filterable project gallery
- Expandable experience timeline
- Contact form validation
- Command palette with `Cmd K` / `Ctrl K`
- Local analytics scaffold for visits, PDF downloads, and contact submissions
- SEO basics: meta tags, Open Graph, Twitter cards, JSON-LD structured data, robots.txt, and sitemap.xml
- Lazy-loaded routes and lightweight SVG assets

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router

## Getting Started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

Run linting:

```bash
npm run lint
```

## Deploy To GitHub Pages

This project is ready for GitHub Pages hosting.

1. Push the repository to GitHub.
2. In GitHub, open `Settings` -> `Pages`.
3. Set `Build and deployment` source to `GitHub Actions`.
4. Push to the `main` branch, or run the `Deploy to GitHub Pages` workflow manually from the `Actions` tab.

The app uses `HashRouter`, so routes are GitHub Pages-safe and will look like:

```text
https://<username>.github.io/<repository-name>/#/projects
```

The Vite build uses relative asset paths, so it works whether the repository is deployed as a user site or a project site.

## Project Structure

```text
src/
  components/       Reusable layout, cards, animation, SEO, and UI elements
  data/             Editable typed portfolio content
  hooks/            Theme and interaction hooks
  pages/            Routed page views
  types/            Shared TypeScript interfaces
public/
  assets/           Optimized SVG profile, previews, favicon, and OG image
  cv/               Downloadable CV and certificate placeholders
```

## Customization

Update the sample portfolio content in:

- `src/data/profile.ts`
- `src/data/experiences.ts`
- `src/data/projects.ts`
- `src/data/certifications.ts`
- `src/data/skills.ts`
- `src/data/blog.ts`

Replace placeholder PDFs in `public/cv/` with real CV and certificate files. Replace `https://example.com` in `index.html`, `public/robots.txt`, and `public/sitemap.xml` with your deployed domain.

## Analytics

The current analytics layer stores basic counters in `localStorage` under `portfolio-analytics`:

- Portfolio visits
- CV and certificate PDF downloads
- Contact form submissions
- Per-route visit counts

Swap `src/components/Analytics.tsx` with your preferred provider such as Plausible, PostHog, Google Analytics, or a custom endpoint when deploying.
