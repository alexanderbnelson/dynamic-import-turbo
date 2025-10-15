## Link to the code that reproduces this issue

https://github.com/[your-username]/dynamic-import-turbo

## To Reproduce

1. Clone the repository
2. Run `pnpm install`
3. Run `pnpm dev`
4. Navigate to `http://localhost:3000`
5. Observe the Turbopack error

## Current vs. Expected behavior

**Current Behavior:**
Turbopack throws a fatal error when compiling pages:
```
TurbopackInternalError: Failed to write app endpoint /home/page

Caused by:
- Module in async chunking edge is not chunkable
```

**Expected Behavior:**
The dynamic import should resolve at runtime based on the variable, loading the appropriate theme module without errors.

## Provide environment information

```bash
Operating System:
  Platform: darwin
  Arch: arm64
  Version: Darwin 24.6.0
Binaries:
  Node: 22.16.0
  pnpm: 10.18.1
  npm: N/A
  Yarn: N/A
Relevant Packages:
  next: 16.0.0-canary.6
  react: 19.2.0
  react-dom: 19.2.0
  typescript: 5.x
Turbopack: v16.0.0-canary.5-8-gd0ffcfcb3
```

## Which area(s) are affected? (Select all that apply)

- Turbopack
- App Router

## Which stage(s) are affected? (Select all that apply)

- next dev (local)

## Additional context

### Root Cause

The issue occurs in `app/layout.tsx` where a dynamic import uses a template literal with a runtime variable:

```typescript
export default async function RootLayout() {
  const site = await getSiteData(); // Simulates database fetch
  const themeName = site?.themeName ? toKebabCase(site?.themeName) : "one";

  // This line causes the Turbopack error
  const selectedTheme = await import(
    `@/styles/themes/theme-${themeName}/theme-${themeName}`
  );

  const theme = (selectedTheme.default as Theme) ?? null;

  return (
    <html lang="en">
      <body>
        <h1>{theme.name}</h1>
      </body>
    </html>
  );
}
```

### Why This Pattern Matters

This is a critical pattern for:
- **Multi-tenant applications** where themes/configurations are loaded dynamically based on database data
- **Dynamic configuration loading** based on runtime data (user preferences, tenant settings, etc.)
- **Conditional module loading** in Server Components where the module path cannot be known at build time

### The Theme Files

The modules being imported are simple TypeScript files:

**styles/themes/theme-one/theme-one.tsx**:
```typescript
import type { Theme } from "@/types/theme";

const themeOne: Theme = {
  name: "one",
  global: { /* ... config ... */ },
  nav: { /* ... config ... */ },
};

export default themeOne;
```

**styles/themes/theme-two/theme-two.tsx**:
```typescript
import type { Theme } from "@/types/theme";

const themeTwo: Theme = {
  name: "two",
  global: { /* ... config ... */ },
  nav: { /* ... config ... */ },
};

export default themeTwo;
```

### Configuration Details

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

### Panic Log Output

The full error from the panic log shows:
```
Failed to write app endpoint /home/page

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

---

**Note:** While the error mentions `/home/page`, the root cause is in the root layout (`app/layout.tsx`) which affects all pages in the application.
