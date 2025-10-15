# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

**This is a bug reproduction repository** for testing and demonstrating a Turbopack error with dynamic imports in Next.js. The codebase is designed to isolate and reproduce specific behavior when using dynamic imports with template literals in Server Components.

## Development Commands

```bash
# Start development server (uses Turbopack by default in Next.js 15+)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Reproduction Setup

### The Bug Pattern

This reproduction demonstrates dynamic imports with template literals in an async Server Component:

**Location**: `app/layout.tsx:34-36`

```typescript
const selectedTheme = await import(
  `@/styles/themes/theme-${themeName}/theme-${themeName}`
);
```

The `themeName` variable is determined at runtime from simulated database data, making the import path dynamic.

### Key Configuration

**Next.js Version**: 16.0.0-canary.6 (canary builds for latest Turbopack)

**styled-jsx Configuration** (`next.config.ts`):
- `optimizePackageImports: ['styled-jsx']`
- `transpilePackages: ['styled-jsx']`

These settings are part of the reproduction conditions.

### Repository Structure

- **Theme Modules**: Located in `styles/themes/theme-{name}/`
  - `theme-one/theme-one.tsx` - First theme configuration
  - `theme-two/theme-two.tsx` - Second theme configuration
  - Each exports a default object matching the `Theme` interface

- **Type Definitions**: `types/theme.ts` defines the `Theme` interface

- **Root Layout**: `app/layout.tsx` contains the reproduction pattern with async data fetching and dynamic theme imports

### Technical Details

- **TypeScript**: Strict mode enabled
- **Path Alias**: `@/*` maps to project root
- **React**: Version 19.2.0
- **Module Resolution**: Uses `bundler` mode

## Modifying the Reproduction

When adjusting this reproduction:
- The dynamic import pattern in `app/layout.tsx` is the core of the reproduction
- Theme file naming and structure must match the template literal pattern
- The `themeName` variable determines which theme module is loaded at runtime
