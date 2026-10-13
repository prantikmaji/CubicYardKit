# CubicYardKit — UI/UX Redesign Plan v2.0 (Completed)
## Based on Dribbble Inspiration Research

### Executive Summary
Elevated to Tier-1 SaaS calculator quality using 3 key patterns from top Dribbble designs:
1. **Split-Panel Calculator Layout:** Inputs LEFT (5 cols), Live Results RIGHT (7 cols sticky)
2. **Hero Result Cards:** Dominant JetBrains Mono metric with subtle glowing aura & waste tags
3. **Bento Metric Grids & Micro-motion:** 3-card bento grids, hover lift effects, depth preset pills

---

### Implementation Status

#### Phase 1: Global Design System (Completed)
- [x] **Fonts:** Google Fonts Inter + JetBrains Mono tabular numbers imported in BaseLayout.astro.
- [x] **CSS Tokens:** Configured `--shadow-card`, `--shadow-card-hover`, `--shadow-result`, and utility classes in `src/styles/global.css`.
- [x] **Micro-interactions:** Interactive card lift, depth pill selection, responsive unit dropdowns.

#### Phase 2: Core Calculators Upgraded (Completed)
- [x] `CubicYardCalculator.tsx`: Rectangular/circular split-panel, depth preset pills (1", 2", 3", 4", 6"), emerald hero card, 3-card bento grid (cu ft, m³, sq ft).
- [x] `GravelCalculator.tsx`: 5/7 split-panel, depth preset pills (2", 3", 4", 6"), certified US tons hero card, logistics bento (50-lb bags, tri-axle truckloads, surface area).
- [x] `DirtCalculator.tsx`: 5/7 split-panel, depth preset pills (2", 4", 6", 8", 12"), compacted cubic yards hero card with warm earth aura, haulage bento (10-yd dump trucks, weight tons, surface area) + pickup truck trips converter.
- [x] `TopsoilCalculator.tsx`: 5/7 split-panel, topsoil depth presets (¼", 1", 2", 4", 6", 10"), bulk cubic yards hero card, metric bento (cu ft, tons, 1.0 cu ft bags), retail bag breakdown card.
- [x] `ConcreteCalculator.tsx`: 5/7 split-panel, thickness presets (3.5", 4", 5", 6", 8") and Sonotube diameter presets (8", 10", 12", 16"), ready-mix cubic yards hero card, bag counts bento (80-lb, 60-lb, 50-lb mixes), smart delivery method recommendation.
- [x] `ConcreteBlockCalculator.tsx`: 5/7 split-panel, openings deduction list, core fill grout selector, total CMU blocks hero card, masonry bento (Type S mortar bags, core fill grout cu yd, net wall area sq ft).

#### Phase 3: Project Planner & Quote Comparison (Completed)
- [x] `PatioPlannerIsland.tsx`: Upgraded to 5/7 split-panel layout, dimension quick presets (10'×10', 12'×12', 12'×16', 16'×20'), hero bill of materials result card, 3-card bento metrics (pavers, base tons, bedding sand tons), strata accessories card, and enhanced BOM breakdown table with print and CSV export.
- [x] `QuoteComparisonIsland.tsx`: Winner hero card with lowest landed cost and savings percentage vs highest quote, 3-card bento metrics, editable supplier cards, and normalized comparison matrix table with ranking badges.

#### Phase 4: Subpage Hero Banners (Completed)
- [x] Consistent dark mesh gradient hero banners across all 7 subpages (`gravel-calculator.astro`, `dirt-calculator.astro`, `topsoil-calculator.astro`, `concrete-calculator.astro`, `concrete-block-calculator.astro`, `planner/index.astro`, `quote-comparison.astro`) with domain-specific trust badges and metrics.

---

### Verification
- **Unit Tests:** Vitest passed 15/15 tests (100% pass rate).
- **Production Build:** Astro SSG compiled all 9 static routes cleanly in ~1.8s with 0 warnings.
- **Constraints Preserved:**
  - `implmention-prompt.md` untouched and immutable.
  - `src/lib/calc/*` core mathematical logic 100% preserved.
  - Zero external database requirements, client-side LocalStorage maintained.