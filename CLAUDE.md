# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

**This is a bug reproduction repository** for testing and demonstrating a Turbopack error with dynamic imports in Next.js. The codebase is designed to isolate and reproduce specific behavior when using dynamic imports with template literals in Server Components.

## ⚠️ CRITICAL: Turbopack Only

**DO NOT use webpack under ANY circumstances.** This repository exists specifically to test and reproduce Turbopack behavior. Any solutions or configurations must work with Turbopack, not webpack. Do not add webpack configs, do not suggest webpack workarounds, do not use webpack loaders.

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

**Location**: `app/[domain]/(site)/layout.tsx:38`

```typescript
const selectedTheme = await import(`@/styles/themes/theme-${themeName}`);
```

The `themeName` variable is determined at runtime from simulated database data, making the import path dynamic. This pattern is critical for multi-tenant applications where themes are determined by database lookups.

### Key Configuration

**Next.js Version**: 16.0.0-canary.6 (canary builds for latest Turbopack)

**styled-jsx Configuration** (`next.config.ts`):
- `optimizePackageImports: ['styled-jsx']`
- `transpilePackages: ['styled-jsx']`

These settings are part of the reproduction conditions.

### Repository Structure

- **Root Layout**: `app/layout.tsx` - Simplified, no dynamic imports (works fine)

- **Dynamic Route Layout**: `app/[domain]/(site)/layout.tsx` - Contains the dynamic import that triggers the bug

- **Theme Modules**: Located in `styles/themes/theme-{name}/`
  - `theme-one/index.tsx` - Exports theme config, imports CSS
  - `theme-one/theme-one.css` - CSS variables
  - `theme-two/index.tsx` - Exports theme config, imports CSS
  - `theme-two/theme-two.css` - CSS variables with @font-face
  - `theme-two/fonts/` - Font files (.woff2)

- **Type Definitions**: `types/theme.ts` defines the `Theme` interface

### Technical Details

- **TypeScript**: Strict mode enabled
- **Path Alias**: `@/*` maps to project root
- **React**: Version 19.2.0
- **Module Resolution**: Uses `bundler` mode

## Modifying the Reproduction

When adjusting this reproduction:
- The dynamic import pattern in `app/[domain]/(site)/layout.tsx` is the core of the reproduction
- Theme modules use `index.tsx` files to simplify the import path
- Each theme's `index.tsx` imports its corresponding CSS file as a side effect
- The `themeName` variable determines which theme module is loaded at runtime
- This simulates real multi-tenant apps where theme selection comes from database queries

## Current Workarounds Attempted

1. **Simplified import path**: Using `theme-${name}` instead of `theme-${name}/theme-${name}` - Still fails
2. **Simplified fonts**: Single `.woff2` file instead of multiple `.otf` files - Still fails
3. **Turbopack loaders**: Attempted `file-loader` but Turbopack's webpack API is incomplete (`this.emitFile` not available)
4. **No workarounds work** - This is a fundamental limitation in Turbopack's chunking system
