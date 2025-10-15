# Turbopack Error: Module in async chunking edge is not chunkable

## Bug Description

When using dynamic imports with template literals in an async Server Component (layout), Turbopack fails to compile with the error: **"Module in async chunking edge is not chunkable"**

This is a critical blocker for multi-tenant applications that need to dynamically load themes or configurations based on runtime data (e.g., from database lookups).

## Error Details

### Error Message
```
TurbopackInternalError: Failed to write app endpoint /[domain]/(site)/page

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

### Environment
- **Next.js**: 16.0.0-canary.6
- **Turbopack**: v16.0.0-canary.5-8-gd0ffcfcb3
- **React**: 19.2.0
- **Node.js**: v22.16.0
- **Package Manager**: pnpm 10.18.1
- **OS**: macOS (Darwin 24.6.0)

## Minimal Reproduction

### Repository Structure
```
app/
├── layout.tsx          # Root layout (simplified, no dynamic imports)
├── [domain]/
│   └── (site)/
│       ├── layout.tsx  # Contains dynamic import - CAUSES ERROR
│       └── page.tsx
styles/
├── themes/
│   ├── theme-one/
│   │   ├── index.tsx       # Exports theme config + imports CSS
│   │   └── theme-one.css
│   └── theme-two/
│       ├── index.tsx       # Exports theme config + imports CSS
│       ├── theme-two.css   # Contains @font-face
│       └── fonts/
│           └── FlatspotNuovo-Book.woff2
types/
└── theme.ts            # Theme interface
```

### Code Causing the Issue

**app/[domain]/(site)/layout.tsx** (line 38):
```typescript
// Simulate database fetch
async function getSiteData(): Promise<{ themeName: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        themeName: Math.random() > 0.5 ? "one" : "two",
      });
    }, 100);
  });
}

function toKebabCase(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-");
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const site = await getSiteData();
  const themeName = site?.themeName ? toKebabCase(site?.themeName) : "one";

  // THIS DYNAMIC IMPORT CAUSES THE ERROR
  const selectedTheme = await import(`@/styles/themes/theme-${themeName}`);

  const theme = (selectedTheme.default as Theme) ?? null;

  return (
    <div
      className="min-h-screen bg-gray-50"
      data-color-theme={`theme-${themeName}-palette`}
      data-font-theme={`theme-${themeName}-font`}
    >
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">Site: {domain}</h1>
          <span className="text-sm text-gray-500">Theme: {theme?.name}</span>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
```

### Theme Module Structure

**styles/themes/theme-two/index.tsx**:
```typescript
import type { Theme } from "@/types/theme";
import "./theme-two.css";  // Side-effect import for styles

const themeTwo: Theme = {
  name: "two",
  global: {
    text: "text-primary font-text font-light",
    radius: "rounded-xl",
    imageRadius: "",
    bgColor: "bg-background",
    carouselButtons: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    forms: {
      heading: "",
      description: "",
    },
  },
  markerStyle: "#ff0000",
  nav: {
    container: "flex w-full flex-col text-lg leading-5",
    displayName: "font-display",
    designation: "w-full text-primary/70",
    menuItem: "",
    menu: "no-scrollbar xs:justify-center mb-3 flex items-center",
    buttonVariant: "default",
    buttonStyle: "w-full justify-between gap-2 border-none bg-muted",
    contactButtonVariant: "outline",
    contactButtonStyle: "w-fit justify-between gap-2 pb-1.5",
    signInButtonStyle: "pb-1.5 font-display-secondary text-base",
  },
};

export default themeTwo;
```

**styles/themes/theme-two/theme-two.css**:
```css
/* CSS variables and @font-face declarations */
[data-color-theme="theme-two-palette"] {
  --color-background: hsl(150 25% 98%);
  --color-foreground: hsl(150 25% 5%);
  /* ... more CSS variables ... */
}

[data-font-theme="theme-two-font"] {
  --font-display: "FlatSpot";
}

@font-face {
  font-family: "FlatSpot";
  src: url("./fonts/FlatspotNuovo-Book.woff2") format("woff2");
  display: swap;
}
```

### Steps to Reproduce

1. Clone the reproduction repository
2. Install dependencies: `pnpm install`
3. Start dev server: `pnpm dev`
4. Navigate to `http://site-one.localhost:3000` or `http://site-two.localhost:3000`
5. Error occurs immediately - Turbopack fails to compile

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

Turbopack fails to compile any page under the `[domain]/(site)` route with a fatal error about modules in async chunking edges not being chunkable.

## Additional Context

### Why This Pattern is Critical

This is a fundamental pattern for multi-tenant applications where:
- **Themes are determined at runtime** from database lookups based on domain/subdomain
- **Configuration cannot be known at build time** because it depends on which tenant is accessing the site
- **Each tenant needs different styling, fonts, and behavior** loaded dynamically

### What We've Tried

1. **Simplifying the import path**: Changed from `theme-${name}/theme-${name}` to just `theme-${name}` (using `index.tsx`)
2. **Simplifying font loading**: Reduced to a single `.woff2` font file instead of multiple `.otf` files
3. **Removing Turbopack config**: Tried with and without custom Turbopack rules
4. **Webpack loaders**: Attempted `file-loader` for fonts, but Turbopack's webpack loader compatibility is limited (doesn't support `this.emitFile`)

### The Core Issue

The error message "Module in async chunking edge is not chunkable" suggests that Turbopack cannot handle modules that are:
1. Dynamically imported with template literals
2. Contain runtime-only resolvable paths
3. Located in async Server Components

This prevents any dynamic module loading pattern where the module path depends on runtime data.

## Impact

**CRITICAL** - This completely blocks:
- Multi-tenant applications with dynamic theming
- Dynamic configuration loading based on runtime data
- Conditional module loading in Server Components where the module path cannot be known at build time
- Any SaaS application pattern where tenant-specific resources need to be loaded dynamically
