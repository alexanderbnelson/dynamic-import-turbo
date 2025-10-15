## Link to the code that reproduces this issue

https://github.com/[your-username]/dynamic-import-turbo

## To Reproduce

1. Clone the repository
2. Run `pnpm install`
3. Run `pnpm dev`
4. Navigate to `http://site-one.localhost:3000` or `http://site-two.localhost:3000`
5. Observe the Turbopack fatal error

## Current vs. Expected behavior

**Current Behavior:**
Turbopack throws a fatal panic error when attempting to compile:
```
TurbopackInternalError: Failed to write app endpoint /[domain]/(site)/page

Caused by:
- Module in async chunking edge is not chunkable
```

**Expected Behavior:**
The dynamic import should resolve at runtime, loading the appropriate theme module based on the `themeName` variable without compilation errors.

## Provide environment information

```bash
Operating System:
  Platform: darwin
  Arch: arm64
  Version: Darwin 24.6.0
Binaries:
  Node: 22.16.0
  pnpm: 10.18.1
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

### The Problem

This reproduction demonstrates a **critical blocker for multi-tenant applications**. When using dynamic imports with template literals in async Server Components, Turbopack crashes with "Module in async chunking edge is not chunkable".

### The Reproduction Pattern

**Location**: `app/[domain]/(site)/layout.tsx:38`

```typescript
async function getSiteData(): Promise<{ themeName: string }> {
  // Simulates database fetch to determine tenant's theme
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        themeName: Math.random() > 0.5 ? "one" : "two",
      });
    }, 100);
  });
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const site = await getSiteData();  // Fetch tenant data
  const themeName = site?.themeName ? toKebabCase(site?.themeName) : "one";

  // THIS LINE CAUSES THE TURBOPACK CRASH
  const selectedTheme = await import(`@/styles/themes/theme-${themeName}`);

  const theme = (selectedTheme.default as Theme) ?? null;

  return (
    <div
      data-color-theme={`theme-${themeName}-palette`}
      data-font-theme={`theme-${themeName}-font`}
    >
      <header>
        <h1>Site: {domain}</h1>
        <span>Theme: {theme?.name}</span>
      </header>
      <main>{children}</main>
    </div>
  );
}
```

### The Theme Modules

The modules being dynamically imported are straightforward TypeScript files with CSS imports:

**styles/themes/theme-two/index.tsx**:
```typescript
import type { Theme } from "@/types/theme";
import "./theme-two.css";  // Imports CSS with @font-face

const themeTwo: Theme = {
  name: "two",
  global: {
    text: "text-primary font-text font-light",
    radius: "rounded-xl",
    // ... theme configuration
  },
  nav: {
    // ... navigation styles
  },
};

export default themeTwo;
```

**styles/themes/theme-two/theme-two.css**:
```css
[data-color-theme="theme-two-palette"] {
  --color-background: hsl(150 25% 98%);
  --color-foreground: hsl(150 25% 5%);
  /* ... CSS variables */
}

[data-font-theme="theme-two-font"] {
  --font-display: "JetBrainsMono";
}

@font-face {
  font-family: "JetBrainsMono";
  src: url("./fonts/JetBrainsMono-Bold.woff2") format("woff2");
  display: swap;
}
```

### Why This Pattern Matters

This is a **fundamental pattern for SaaS and multi-tenant applications**:

1. **Runtime-determined theming**: Each tenant/domain gets different themes loaded from a database
2. **Cannot be known at build time**: The theme depends on which subdomain/domain the user visits
3. **Dynamic resource loading**: Fonts, colors, and configurations vary per tenant

**Real-world use cases:**
- Multi-tenant SaaS platforms (e.g., `customer1.myapp.com` vs `customer2.myapp.com`)
- White-label applications where each client has custom branding
- Dynamic configuration systems based on user/organization settings

### What We've Tried

1. ✅ **Simplified import path**: Changed from `theme-${name}/theme-${name}.tsx` to `theme-${name}` (using `index.tsx`)
2. ✅ **Minimized fonts**: Reduced to single `.woff2` file instead of multiple `.otf` files
3. ✅ **Removed Turbopack config**: Tested with minimal `next.config.ts`
4. ❌ **Webpack loaders**: Attempted `file-loader`, but Turbopack's webpack API doesn't support `this.emitFile`

### The Core Issue

The error "Module in async chunking edge is not chunkable" indicates Turbopack cannot handle:

- ✗ Dynamic imports with template literals containing runtime variables
- ✗ Module paths that cannot be statically analyzed at build time
- ✗ Dynamic imports in async Server Components with side-effect imports (CSS)

This is **fundamentally incompatible** with modern multi-tenant architecture patterns.

### Full Error from Panic Log

```
Failed to write app endpoint /[domain]/(site)/page

Caused by:
- Module in async chunking edge is not chunkable

Debug info:
- Execution of get_written_endpoint_with_issues_operation failed
- Execution of endpoint_write_to_disk failed
- Execution of <AppEndpoint as Endpoint>::output failed
- Failed to write app endpoint /[domain]/(site)/page
- Execution of AppEndpoint::output failed
- Execution of AppEndpoint::app_entry_chunks failed
- Execution of <NodeJsChunkingContext as ChunkingContext>::chunk_group failed
- Module in async chunking edge is not chunkable
```

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

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    },
    "moduleResolution": "bundler",
    "strict": true
  }
}
```

### Impact

This is a **CRITICAL blocker** for:
- ❌ Multi-tenant SaaS applications with dynamic theming
- ❌ White-label platforms with customer-specific branding
- ❌ Any pattern requiring runtime-determined module imports in Server Components
- ❌ Dynamic configuration systems based on database/API data

**Workaround status**: None available that maintains the dynamic nature required for multi-tenancy.

---

**Note:** This works perfectly fine with webpack (`next dev --turbo=false`), but fails immediately with Turbopack.
