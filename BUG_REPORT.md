# Turbopack Error: Module in async chunking edge is not chunkable

## Bug Description

When using dynamic imports with template literals in an async Server Component (root layout), Turbopack fails to compile pages with the error: **"Module in async chunking edge is not chunkable"**

## Error Details

### Error Message
```
TurbopackInternalError: Failed to write app endpoint /home/page

Caused by:
- Module in async chunking edge is not chunkable

Debug info:
- Execution of get_written_endpoint_with_issues_operation failed
- Execution of endpoint_write_to_disk failed
- Execution of <AppEndpoint as Endpoint>::output failed
- Failed to write app endpoint /home/page
- Execution of AppEndpoint::output failed
- Execution of AppEndpoint::app_entry_chunks failed
- Execution of <NodeJsChunkingContext as ChunkingContext>::chunk_group failed
- Module in async chunking edge is not chunkable
```

### Environment
- **Next.js**: 16.0.0-canary.6
- **Turbopack**: v16.0.0-canary.5-8-gd0ffcfcb3
- **React**: 19.2.0
- **Node.js**: v22.16.0
- **Package Manager**: pnpm 10.18.1
- **OS**: macOS (Darwin 24.6.0)

## Reproduction

### Repository Structure
```
app/
├── layout.tsx          # Root layout with dynamic import
├── home/
│   └── page.tsx        # Triggers the error
styles/
├── themes/
│   ├── theme-one/
│   │   └── theme-one.tsx
│   └── theme-two/
│       └── theme-two.tsx
types/
└── theme.ts            # Theme interface
```

### Code Causing the Issue

**app/layout.tsx** (lines 34-36):
```typescript
export default async function RootLayout() {
  const site = await getSiteData();
  const themeName = site?.themeName ? toKebabCase(site?.themeName) : "one";

  // This dynamic import causes the error
  const selectedTheme = await import(
    `@/styles/themes/theme-${themeName}/theme-${themeName}`
  );

  const theme = (selectedTheme.default as Theme) ?? null;

  return (
    <html lang="en">
      <body>
        <div className="flex items-center justify-center h-screen w-screen">
          <h1 className="text-9xl">{theme.name}</h1>
        </div>
      </body>
    </html>
  );
}
```

### Steps to Reproduce

1. Clone the reproduction repository
2. Install dependencies: `pnpm install`
3. Start dev server: `pnpm dev`
4. Navigate to `http://localhost:3000`
5. Error occurs immediately on page load

### Configuration

**next.config.ts**:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['styled-jsx'],
  },
  transpilePackages: ['styled-jsx'],
};

export default nextConfig;
```

**tsconfig.json** (relevant parts):
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    },
    "moduleResolution": "bundler"
  }
}
```

## Expected Behavior

The dynamic import should resolve at runtime based on the `themeName` variable, loading the appropriate theme module without compilation errors.

## Actual Behavior

Turbopack fails to compile any page in the application with a fatal error about modules in async chunking edges not being chunkable.

## Additional Context

- The error occurs during the compilation of `/home/page`, but the root cause is in the root layout (`app/layout.tsx`)
- The dynamic import uses a template literal with a runtime variable
- The imported modules (`theme-one.tsx`, `theme-two.tsx`) are simple TypeScript files exporting default objects
- This pattern is commonly used for multi-tenant applications where themes/configurations are loaded dynamically based on database data
- The middleware (`proxy.ts`) handles domain-based routing but shouldn't affect this issue

## Workarounds Attempted

None found yet that maintain the dynamic nature of the theme loading.

## Impact

This prevents using dynamic imports with template literals in Server Components, which is a critical pattern for:
- Multi-tenant applications with dynamic theming
- Dynamic configuration loading based on runtime data
- Any scenario requiring conditional module loading in the root layout
