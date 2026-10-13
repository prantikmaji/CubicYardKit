# AGENTS.md — CubicYardKit Developer and Agent Guidelines

## 1. Project Mission & Core Rules
- **Domain:** CubicYardKit.com ("Calculate materials. Plan your project.")
- **Goal:** US-focused, SEO-first construction & landscaping material calculator platform with integrated project planning.
- **Strict Rule:** DO NOT modify `implmention-prompt.md`. All prompts, notes, and rules in `implmention-prompt.md` serve as immutable requirements.

## 2. Mandatory Tech Stack
- **Framework:** Astro (Static Site Generation / SSG, Cloudflare Pages target)
- **Language:** TypeScript (strict type checking enabled)
- **UI Islands:** React (used selectively for calculators, planner, quote comparison, interactive tools)
- **Styling:** Tailwind CSS v4
- **Testing:** Vitest (unit tests for calculation engine) & Playwright (E2E for critical paths)
- **Linting & Formatting:** ESLint & Prettier
- **Client State & Storage:** LocalStorage for saved projects (zero server database requirement for v1)

## 3. Architecture & Code Structure
```
/
├── public/                 # Favicons, robots.txt, static assets
├── src/
│   ├── components/         # Astro layout components & React islands
│   │   ├── calc/          # React calculator island components
│   │   ├── planner/       # Project Material Planner island (Patio workflow)
│   │   ├── quotes/        # Supplier quote comparison island
│   │   ├── ui/            # Shared UI components (Input, Select, Button, Card, etc.)
│   │   ├── seo/           # Breadcrumb, FAQ, Schema JSON-LD components
│   │   └── layout/        # Header, Footer, Nav
│   ├── data/
│   │   ├── materials.ts   # Central material database (densities, yields, units, sources)
│   │   └── keyword-map.ts # Centralized SEO keyword-to-URL mapping & intent documentation
│   ├── layouts/
│   │   ├── BaseLayout.astro      # Core HTML shell, SEO meta, OpenGraph, Canonical
│   │   └── CalculatorLayout.astro# Material calculator layout with formula, FAQs, worked example
│   ├── lib/
│   │   ├── calc/          # Reusable, framework-agnostic calculation engine
│   │   │   ├── geometry.ts       # Rectangular, cylindrical, circular volumes
│   │   │   ├── units.ts          # Length, area, volume, mass unit conversions
│   │   │   ├── gravel.ts         # Gravel volume, tons, bags
│   │   │   ├── dirt.ts           # Dirt & topsoil volume, compaction/settlement
│   │   │   ├── concrete.ts       # Slabs, footings, columns, ready-mix yards & bag counts
│   │   │   ├── concrete-block.ts # Block count, mortar, core fill volume
│   │   │   ├── patio-planner.ts  # Paver patio multi-material estimator
│   │   │   └── cost.ts           # Cost calculations, delivery fees, quote comparisons
│   │   └── storage/       # LocalStorage project management helper
│   ├── pages/
│   │   ├── index.astro                 # Priority 1: Homepage (Cubic Yard Calculator)
│   │   ├── gravel-calculator.astro     # Priority 2: Gravel Calculator
│   │   ├── dirt-calculator.astro       # Priority 3: Dirt Calculator
│   │   ├── topsoil-calculator.astro    # Priority 4: Topsoil Calculator
│   │   ├── concrete-block-calculator.astro # Priority 5: Concrete Block Calculator
│   │   ├── concrete-calculator.astro   # Priority 6: Concrete Calculator (Yards & Bags)
│   │   ├── planner/
│   │   │   └── index.astro             # Project Material Planner (Paver patio workflow)
│   │   ├── quote-comparison.astro      # Supplier Quote Comparison tool
│   │   ├── 404.astro                   # Custom 404 page
│   │   ├── sitemap.xml.ts              # XML sitemap generator
│   │   └── robots.txt.ts               # Dynamic robots.txt
│   └── styles/
│       └── global.css      # Tailwind v4 styles, custom tokens, print styles
└── tests/
    └── unit/              # Vitest test suite covering calculation engine
```

## 4. Key Calculation Rules
1. **Mathematical Accuracy:**
   - 1 cubic yard = 27 cubic feet = ~0.764554857984 m³
   - 1 cubic foot = 1,728 cubic inches
   - Depth in inches = depth / 12 feet
2. **Separation of Concerns:**
   - Always keep geometric volume distinct from weight and purchasing units.
   - Apply waste allowances transparently (`adjusted = base * (1 + waste/100)`).
   - Never fabricate densities; when variable, specify verified ranges or require user input with clear defaults and sources.
3. **No Hidden Assumptions:**
   - Concrete bag yields: 80 lb bag ≈ 0.60 cu ft (0.0222 cu yd); 60 lb bag ≈ 0.45 cu ft (0.0167 cu yd).
   - Gravel density: Standard crushed stone ~2,700 lb/cu yd (~1.35 tons/cu yd); pea gravel ~2,800 lb/cu yd. Document source and allow custom override.
   - Soil density: Topsoil dry ~2,000–2,200 lb/cu yd; fill dirt ~2,200–2,600 lb/cu yd.
   - Concrete blocks: Standard 8×8×16 in (nominal, actual 7.625×7.625×15.625 in with 3/8 in mortar joint). 1.125 blocks per sq ft. Core fill ~0.22 cu ft per core or ~0.44 cu ft per standard 2-core block.

## 5. SEO & Cannibalization Prevention
- **Homepage (`/`):** Owns `cubic yard calculator`, `calculate cubic yards`.
- **Gravel (`/gravel-calculator/`):** Owns `gravel calculator`, `pea gravel calculator`.
- **Dirt (`/dirt-calculator/`):** Owns `dirt calculator`, `fill dirt calculator`.
- **Topsoil (`/topsoil-calculator/`):** Owns `topsoil calculator`, `topsoil coverage calculator`.
- **Concrete Block (`/concrete-block-calculator/`):** Owns `concrete block calculator`, `cinder block calculator`.
- **Concrete (`/concrete-calculator/`):** Owns `concrete calculator`, `concrete yard calculator`.
- Canonical URLs must always match the exact production domain (`https://cubicyardkit.com`).

## 6. Design System Guidelines
- Light-first design, high contrast, clean architectural/construction feel.
- Neutral surfaces (`bg-slate-50`, `bg-white`, `border-slate-200`, `text-slate-900`).
- Accent color: Natural green (`#16a34a` / `emerald-600` / `green-700`).
- No fake social proof, no fake review stars.
- Instant responsive calculation updates with clear visual breakdown.
- Full print stylesheet support (`@media print` cleanly formats bill of materials and checklists).
