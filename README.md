# JunYoungJo — Portfolio

Personal portfolio with Korean and English pages, light and dark themes, project details, and an overview of my work and interests.

Live site: https://junyoungjo.github.io

## Build

Requires Node.js 24. No package installation is needed.

```sh
node scripts/build.mjs
node scripts/check.mjs
```

The generated website is in `dist/`. GitHub Actions builds and checks the site, then deploys `dist/` to GitHub Pages on pushes to `main`.

## Content

- `src/content.mjs`: project registry, public code links, Korean and English content
- `src/styles.css`: themes, layout, responsive rules and motion
- `src/app.js`: theme and language preferences, navigation, search, image viewer
- `scripts/build.mjs`: static page generator
- `scripts/check.mjs`: local references, locale routes, anchors and content validation
- `dist/assets/`: project logos and screenshots; screenshots include sample data

Add a project in `src/content.mjs` to generate its detail pages and include it in the project directory. Featured projects appear on the home page. A project without a public repository or download uses its own status and overview instead of linking to a private repository.

The original Jekyll configuration and posts are retained in the repository history and source. The current deployment uses the Node-generated portfolio; the Jekyll workflow has been replaced.

Google Fonts are optional; system font fallbacks are provided. The site respects reduced-motion preferences, and its main content and links are available without JavaScript.
