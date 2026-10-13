Yes. I’ve updated the master prompt with your actual US Semrush keyword data, the revised launch order, SEO page mapping, and rules to prevent keyword cannibalization. It keeps the single-domain strategy for CubicYardKit.com and your Astro + React + Tailwind CSS + Cloudflare stack.

Copy the entire prompt below into your coding agent.

# MASTER BUILD PROMPT: CUBICYARDKIT.COM

## SEO-First Material Calculator Platform

Act as a senior full-stack engineer, technical SEO architect, product designer, calculation-engine engineer and QA engineer. You are responsible for implementing a production-ready website, not merely producing a design or implementation proposal.

Build **CubicYardKit.com**, a US-focused construction and landscaping material calculator website designed around validated keyword research, useful interactive tools, technical SEO, accurate calculations and a differentiated project-planning experience.

Inspect the existing repository first. Preserve working code and project conventions wherever practical. Implement the site, run tests, fix errors and report verifiable results.

---

# 1. BUSINESS OBJECTIVE

Build one focused website covering related material quantity and project estimation tools.

Primary audience:

- US homeowners and DIY users
- Landscaping professionals
- Contractors
- Garden and lawn professionals
- Construction and renovation users

Primary business objective: acquire organic search traffic from calculator-related keywords.

Secondary objectives:

- Help users calculate material quantities accurately.
- Estimate purchase quantities and costs.
- Connect related material calculations through internal links.
- Help users plan projects requiring multiple materials.
- Encourage return visits through project saving, reuse and export.
- Create future opportunities for relevant supplier referrals, affiliates and advertising.

The core positioning:

**CubicYardKit — Calculate materials. Plan your project.**

Do not create separate websites for cubic yards, gravel, dirt, topsoil and concrete. They should be related tools on this single domain.

The main competitive differentiator should be an integrated material-planning workflow rather than a directory of isolated calculators.

---

# 2. MANDATORY TECHNOLOGY STACK

Use:

- Astro
- TypeScript with strict type checking
- React for interactive user interfaces
- Tailwind CSS v4
- Astro's official React integration
- Vite through Astro's supported configuration
- Vitest for unit tests
- Playwright for critical end-to-end tests where practical
- ESLint and Prettier or equivalent tooling
- Cloudflare for deployment

## Architecture

Use Astro for:

- SEO landing pages
- Page layouts
- Guides
- Metadata
- Navigation and footer
- Static content
- Sitemap and robots configuration

Use React islands for:

- Calculators
- Complex input forms
- Dynamic result summaries
- Project planning
- Saved project interfaces
- Material quantity lists
- Supplier quote comparison
- Interactive unit conversion

Do not turn the entire website into a client-rendered React application.

Prefer static generation and browser-side calculations. Do not add an API, database or server runtime when the feature can be implemented safely in the browser.

## Cloudflare deployment

Target Cloudflare Pages for a static Astro deployment when all required functionality can be statically generated and executed in the browser.

If a real server-side capability becomes necessary, use Cloudflare Workers and the deployment approach currently supported by the project's Astro version.

Do not introduce server-side functionality just for calculations.

Use currently supported, mutually compatible versions and official documentation. Do not copy obsolete configuration instructions.

---

# 3. SEMRUSH KEYWORD DATA — SOURCE OF TRUTH

Use the following numbers from the user's Semrush Keyword Magic Tool screenshots.

Dataset:

- Database: United States
- Match type: Broad Match
- Currency: USD
- Screenshot data was shown as updated approximately one month earlier.

These are keyword research estimates, not guarantees of traffic.

## Cluster A — Cubic yard calculator

Reported:

- 1,210 keyword ideas
- 73,290 total keyword volume
- 20% average KD

| Keyword                         | US monthly volume | KD | CPC   |
| ------------------------------- | ----------------- | -- | ----- |
| cubic yard calculator           | 27,100            | 10 | $0.18 |
| calculate cubic yards           | 2,900             | 24 | $0.18 |
| how to calculate cubic yards    | 2,900             | 47 | $0.52 |
| cubic yards calculator          | 2,400             | 26 | $0.19 |
| cubic yards to yards calculator | 1,900             | 29 | $0.18 |
| cubic yards to tons calculator  | 880               | 16 | $0.00 |
| calculate cubic yards of dirt   | 720               | 7  | $0.10 |
| cubic yard calculator concrete  | 720               | 28 | $0.50 |
| how to calculate a cubic yard   | 720               | 26 | $0.26 |
| soil calculator cubic yards     | 720               | 11 | $0.10 |

Decision: The homepage must primarily target **cubic yard calculator**.

Do not create a duplicate landing page at `/cubic-yard-calculator/` competing with the homepage for the same search intent.

## Cluster B — Gravel calculator

Reported:

- 1,349 keyword ideas
- 84,350 total keyword volume
- 19% average KD

| Keyword                     | US monthly volume | KD | CPC   |
| --------------------------- | ----------------- | -- | ----- |
| gravel calculator           | 40,500            | 22 | $0.69 |
| pea gravel calculator       | 4,400             | 9  | $0.38 |
| gravel driveway calculator  | 1,300             | 20 | $0.44 |
| gravel calculator fish tank | 1,000             | 11 | $0.00 |
| gravel calculator yards     | 1,000             | 13 | $0.17 |
| gravel calculator tons      | 880               | 25 | $0.10 |
| aquarium gravel calculator  | 720               | 13 | $0.00 |
| calculating gravel          | 720               | 34 | $0.69 |
| driveway gravel calculator  | 720               | 26 | $0.55 |
| fish tank gravel calculator | 720               | 9  | $0.00 |

Decision: Target landscaping and construction gravel, not aquarium gravel.

Exclude aquarium and fish-tank queries from the initial content plan. Do not treat irrelevant broad-match keywords as qualified demand for landscaping tools.

## Cluster C — Dirt calculator

Reported:

- 627 keyword ideas
- 37,020 total keyword volume
- 15% average KD

| Keyword                       | US monthly volume | KD | CPC   |
| ----------------------------- | ----------------- | -- | ----- |
| dirt calculator               | 9,900             | 11 | $0.04 |
| fill dirt calculator          | 2,900             | 13 | $0.34 |
| garden bed dirt calculator    | 2,900             | 25 | $0.08 |
| calculate dirt fill           | 1,300             | 15 | $0.25 |
| calculate yards of dirt       | 880               | 3  | $0.04 |
| calculate cubic yards of dirt | 720               | 7  | $0.10 |
| dirt volume calculator        | 720               | 7  | $0.05 |
| calculate a yard of dirt      | 590               | 9  | $0.03 |
| calculator for dirt fill      | 590               | 32 | $0.25 |
| dirt calculator yards         | 590               | 13 | $0.04 |

Decision: Prioritize this page early because the main term has 9,900 monthly searches and KD 11 in the supplied dataset.

The phrase “calculate cubic yards of dirt” overlaps with the main cubic-yard cluster. Keep cubic-yard calculation as the primary intent of the homepage and dirt-specific quantity estimation as the primary intent of the dirt page.

## Cluster D — Topsoil calculator

Reported:

- 229 keyword ideas
- 12,310 total keyword volume
- 12% average KD

| Keyword                                    | US monthly volume | KD | CPC   |
| ------------------------------------------ | ----------------- | -- | ----- |
| topsoil calculator                         | 8,100             | 13 | $0.75 |
| online topsoil calculator                  | 260               | 23 | $0.00 |
| topsoil calculator yards                   | 210               | 4  | $0.58 |
| topsoil calculator in yards                | 170               | 13 | $0.58 |
| topsoil coverage calculator                | 170               | 23 | $0.56 |
| how to calculate how much topsoil I need   | 140               | 34 | $0.58 |
| how do I calculate how much topsoil I need | 110               | 11 | $0.58 |
| topsoil calculator in cubic yards          | 110               | 13 | $0.07 |
| topsoil calculator square feet             | 90                | 6  | $0.44 |

Decision: Prioritize topsoil early. Make the calculator useful for lawn areas, garden beds, raised beds and coverage calculations.

## Cluster E — Concrete block calculator

Reported:

- 262 keyword ideas
- 10,650 total keyword volume
- 15% average KD

| Keyword                                 | US monthly volume | KD | CPC   |
| --------------------------------------- | ----------------- | -- | ----- |
| concrete block calculator               | 5,400             | 11 | $1.38 |
| concrete block estimator calculator     | 880               | 11 | $1.38 |
| concrete block wall calculator          | 590               | 11 | $1.50 |
| concrete block fill calculator          | 320               | 8  | $1.20 |
| concrete block wall cost calculator     | 320               | 20 | $2.04 |
| cinder block concrete fill calculator   | 260               | 7  | $1.20 |
| calculate concrete blocks               | 170               | 24 | $1.38 |
| concrete block weight calculator        | 170               | 41 | $0.00 |
| concrete calculator block fill          | 170               | 6  | $1.20 |
| how to calculate concrete blocks needed | 170               | 29 | $1.22 |

Decision: Make concrete block the fifth priority in the initial SEO rollout. Provide separate calculation modes for block count, wall area, cores requiring fill and cost estimation.

Do not assume concrete block dimensions or core fill volume without explicit block specifications.

## Cluster F — Concrete yards / concrete volume

Reported:

- 464 keyword ideas
- 36,910 total keyword volume
- 22% average KD

| Keyword                            | US monthly volume | KD | CPC   |
| ---------------------------------- | ----------------- | -- | ----- |
| calculator concrete yards          | 5,400             | 24 | $0.51 |
| concrete yard calculator           | 5,400             | 36 | $0.51 |
| concrete calculator yards          | 4,400             | 26 | $0.51 |
| how to calculate concrete yards    | 1,300             | 22 | $0.16 |
| how to calculate yards of concrete | 1,300             | 25 | $0.40 |
| yards of concrete calculator       | 880               | 24 | $0.51 |
| cubic yard calculator concrete     | 720               | 28 | $0.50 |
| concrete calculator by yard        | 590               | 28 | $0.51 |
| concrete calculator yard           | 590               | 22 | $0.64 |
| concrete cubic yard calculator     | 590               | 23 | $0.50 |

Decision: Create one dedicated concrete calculator page after the first four priorities. Target concrete-specific quantity intent, not generic cubic yards.

The generic concrete cubic-yard result must link to the concrete calculator, but the homepage remains canonical for the broad cubic-yard term.

## Data integrity rules

- Keep these Semrush screenshots as the evidence for the initial roadmap.
- Do not invent missing keyword metrics for mulch, paver, concrete pad, sod, fencing or other materials.
- Do not represent broad-match cluster totals as unique visitors.
- Do not add all cluster volumes together to make a traffic forecast.
- CPC is paid advertising bid data, not expected AdSense earnings or affiliate revenue.
- Recheck metrics in Semrush when finalizing a new page or buying a domain.
- Use a keyword research file or centralized content configuration so future updates are easy.

---

# 4. SEO PRIORITY AND PAGE OWNERSHIP

Build one domain with distinct pages for genuinely different search intents.

## Initial launch sequence

### Priority 1 — Homepage: cubic-yard calculator

Path: `/`

Primary keyword: `cubic yard calculator`

Primary metrics: 27,100 volume / KD 10 / CPC $0.18.

Secondary topics:

- calculate cubic yards
- cubic yards calculator
- cubic-yard formula
- cubic yards to cubic feet
- cubic yards to cubic metres
- cubic yards to tons
- how to calculate a cubic yard

Do not create a second generic page targeting exactly the same intent.

The homepage should provide the best basic cubic-yard calculator and link to specialized material calculators.

### Priority 2 — Gravel

Path: `/gravel-calculator/`

Primary keyword: `gravel calculator`

Primary metrics: 40,500 volume / KD 22 / CPC $0.69.

Secondary keywords:

- pea gravel calculator
- gravel driveway calculator
- driveway gravel calculator
- gravel calculator yards
- gravel calculator tons

Calculator capabilities:

- Area and depth calculation.
- Rectangular, circular and appropriate project shapes.
- Gravel type selection.
- Cubic feet and cubic yards.
- Tons when density is known.
- Bag calculations when bag volume is specified.
- Waste allowance.
- Optional price and delivery estimate.

Create additional indexable pages only when keyword research and search intent justify them. A pea-gravel mode can be available inside the main calculator initially; do not create thin duplicate pages simply because a keyword exists.

### Priority 3 — Dirt

Path: `/dirt-calculator/`

Primary keyword: `dirt calculator`

Primary metrics: 9,900 volume / KD 11 / CPC $0.04.

Secondary keywords:

- fill dirt calculator
- garden bed dirt calculator
- calculate dirt fill
- calculate yards of dirt
- calculate cubic yards of dirt
- dirt volume calculator
- dirt calculator yards

Calculator capabilities:

- Fill area.
- Area dimensions and depth.
- Cubic feet and cubic yards.
- Optional density and weight.
- Waste or settlement adjustment only when the relevant assumption is defined.
- Optional bags or delivery quantities.
- Optional user-entered prices.

Keep the fill-dirt use case visible.

Do not combine the dirt page and topsoil page into one generic page; their keyword clusters and user needs differ.

### Priority 4 — Topsoil

Path: `/topsoil-calculator/`

Primary keyword: `topsoil calculator`

Primary metrics: 8,100 volume / KD 13 / CPC $0.75.

Secondary keywords:

- topsoil calculator yards
- topsoil calculator in yards
- topsoil coverage calculator
- topsoil calculator square feet
- topsoil calculator in cubic yards
- how much topsoil do I need calculator

Calculator capabilities:

- Lawn area.
- Garden beds.
- Raised beds.
- Required soil depth.
- Cubic feet and cubic yards.
- Coverage calculations.
- Optional weight and purchasing units, using appropriate product or density information.

Add a worked example and explain how depth changes the required volume.

### Priority 5 — Concrete block

Path: `/concrete-block-calculator/`

Primary keyword: `concrete block calculator`

Primary metrics: 5,400 volume / KD 11 / CPC $1.38.

Secondary keywords:

- concrete block estimator calculator
- concrete block wall calculator
- concrete block fill calculator
- concrete block wall cost calculator
- cinder block concrete fill calculator
- how many concrete blocks are needed

Calculator capabilities:

- Wall length and height.
- Block dimensions and units.
- Mortar joints or explicit installation assumptions.
- Openings such as doors or windows.
- Block count.
- Waste allowance.
- Optional core fill estimation based on the actual block specifications.
- Optional cost based on user-entered block, mortar and fill prices.

Do not estimate core fill from external wall dimensions alone. Use actual block core specifications or ask the user to provide the necessary data.

### Priority 6 — Concrete volume

Path: `/concrete-calculator/`

Primary search intent: concrete quantity in cubic yards.

Use the supplied concrete-yards cluster:

- calculator concrete yards
- concrete yard calculator
- concrete calculator yards
- how to calculate concrete yards
- how to calculate yards of concrete
- yards of concrete calculator
- concrete cubic yard calculator

Calculator capabilities:

- Slabs and pads.
- Footings.
- Cylindrical columns and post holes.
- Dimensions and thickness.
- Cubic feet and cubic yards.
- Waste allowance.
- Bags from verified product yields.
- Ready-mix quantity estimates.
- User-entered price and delivery charges.

The concrete page must have unique content and functionality.

### Later material pages

Add these after validating their keyword data:

- `/mulch-calculator/`
- `/concrete-pad-calculator/`
- `/paver-calculator/`
- `/topsoil-calculator/` is an initial page, as listed above.
- Additional project-specific pages, only after confirming search demand and distinct intent.

Do not invent volume, KD or CPC values for these later keywords.

---

# 5. KEYWORD CANNIBALIZATION PREVENTION

Implement clear keyword ownership.

- Homepage owns the broad `cubic yard calculator` intent.
- Gravel owns `gravel calculator`.
- Dirt owns `dirt calculator`.
- Topsoil owns `topsoil calculator`.
- Concrete block owns `concrete block calculator`.
- Concrete owns concrete-specific volume and ordering intent.
- Conversion pages own genuinely distinct unit-conversion intent.

Rules:

1. Use one canonical URL per target search intent.
2. Do not publish near-duplicate pages with different keyword permutations.
3. Do not create an indexable page for every material × unit × shape combination by default.
4. Use internal links to connect related tools.
5. Keep the site taxonomy simple and understandable.
6. Maintain a keyword-to-URL mapping in the repository.
7. Before adding a page, check whether an existing page already serves its intent.
8. If new keyword research shows a distinct SERP, create a separate page only when the content and tool provide a meaningful difference.

Create a `keyword-map` or equivalent data file documenting each page's primary keyword, supporting keywords, intent, canonical URL and page status.

---

# 6. COMPETITIVE DIFFERENTIATION

Inspect current competitors when useful, but do not copy their branding, content or design.

Build a better workflow in four practical ways.

## A. Accurate, transparent quantity calculations

Every result should show:

- Original measured volume.
- Conversion to cubic yards.
- Waste-adjusted volume where requested.
- Density assumptions where weight is calculated.
- Bag yields where bag counts are calculated.
- Purchase quantity and rounding.
- Optional cost breakdown.

Keep mathematical volume separate from estimated weight or purchasing quantities.

## B. Project Material Planner

Let users calculate multiple materials for a single project rather than repeatedly entering dimensions into isolated calculators.

Start with one well-defined workflow: a paver patio.

Inputs may include:

- Length and width.
- Paver size and joint assumptions.
- Base depth.
- Bedding depth.
- Relevant waste allowances.
- Optional material prices.

Outputs:

- Estimated paver count.
- Base aggregate quantity.
- Bedding material quantity.
- Applicable unit conversions.
- Optional project cost.
- A printable materials checklist.

Implement only calculations supported by valid inputs and explicitly documented assumptions.

## C. Supplier quote comparison

Allow users to enter their own supplier quotations.

Support:

- Price per bag.
- Price per cubic yard.
- Price per ton.
- Delivery charges.
- Minimum order quantities.
- Relevant rounding or packaging increments.

Compare equivalent quantities, not merely the displayed unit prices.

This must be a user-input comparison tool, not a claim to display live supplier prices.

## D. Reusable projects

Allow users to:

- Save a project locally.
- Load and rename a project.
- Edit dimensions.
- Compare manually entered quotes.
- Export a material list.
- Print a summary.

Keep project persistence local in version one. Do not add accounts or a database without a demonstrated need.

---

# 7. CALCULATION ENGINE

Build a reusable TypeScript calculation layer independent of React components.

Suggested areas:

- Geometry.
- Unit conversion.
- Material densities.
- Package yields.
- Waste and order rounding.
- Cost calculation.
- Project aggregation.
- Input validation.
- Result formatting.

## Basic equations

For a rectangular volume with dimensions in feet:

Cubic feet = length × width × depth

Cubic yards = cubic feet ÷ 27

For a cylinder:

Cubic feet = π × radius² × height

Cubic yards = cubic feet ÷ 27

For dimensions measured in metres:

Cubic metres = length × width × depth

Use verified conversion constants and a consistent canonical representation.

One cubic yard equals 27 cubic feet and approximately 0.764554857984 cubic metres.

## Waste allowance

Adjusted volume = original volume × (1 + waste percentage / 100).

Apply waste once only. Clearly label it as an allowance rather than a measured quantity.

## Weight

Estimated weight = volume × selected material density.

Do not assume one universal density for gravel, soil or other materials.

Where density is uncertain:

- Ask the user to choose or enter it.
- Show the selected value and unit.
- Identify the source or user-entered status.
- Label the weight as an estimate.

## Bags

Bag count = adjusted volume ÷ verified volume per bag, rounded up.

Do not infer volume from bag weight alone unless the product yield has been established.

## Cost

Estimated total = material subtotal + delivery charge + other explicitly entered costs.

Convert the quantity and price to equivalent units before multiplying.

All core calculations must work offline in the browser, except for any explicitly optional future integration.

---

# 8. MATERIAL DATA QUALITY

Create a central material data model.

Each material record should support:

- ID.
- Name.
- Category.
- Supported calculation types.
- Density and density unit, where verified.
- Source URL.
- Source verification date.
- Applicable assumptions.
- Product yield information.
- Product package size where verified.
- User-configurable price units.
- Related calculator paths.

Do not fabricate densities, yields, prices or supplier information.

Use reputable sources where exact material data is needed. Explain that moisture, aggregate grading, composition and compaction can affect real quantities and weights.

Allow custom values when a universal default would be misleading.

---

# 9. HOMEPAGE EXPERIENCE

The homepage is a real calculator page, not merely a marketing landing page.

## SEO metadata

Suggested title:

Cubic Yard Calculator | Calculate Cubic Yards — CubicYardKit

Suggested H1:

Cubic Yard Calculator

Suggested meta description:

Calculate cubic yards from length, width and depth. Estimate material quantities for gravel, concrete, dirt, topsoil and other landscaping projects.

Refine title length and copy during implementation without changing keyword ownership.

## Page structure

1. Compact responsive header.
2. H1 and short explanatory copy.
3. Cubic-yard calculator immediately visible.
4. Result summary and assumptions.
5. Related material calculator links.
6. Project Material Planner introduction.
7. Unit conversion tools.
8. Explanation of cubic yards and the formula.
9. A worked example.
10. Relevant FAQs.
11. Trust, about and disclaimer information.
12. Footer.

The calculator must be easily reachable on mobile without scrolling through a large decorative hero.

Use a clean, professional visual identity with:

- Light-first design.
- White and neutral surfaces.
- Restrained green accent.
- High-contrast text.
- Subtle borders.
- Consistent spacing.
- Minimal, meaningful icons.
- No excessive decorative effects.
- No fake ratings or testimonials.

---

# 10. MATERIAL PAGE CONTENT REQUIREMENTS

Every high-priority calculator page must include:

1. A working calculator.
2. Material-specific inputs and outputs.
3. One primary H1.
4. An accurate SEO title and meta description.
5. The primary keyword in natural page copy.
6. Related supporting terms, used naturally.
7. A formula explanation.
8. A worked example with validated arithmetic.
9. An explanation of units.
10. Material-specific assumptions.
11. Relevant FAQs based on real user intent.
12. Links to closely related calculators.
13. Useful source references when claims require them.
14. A disclaimer where estimates can be misinterpreted.

Avoid generic paragraphs repeated across all material pages.

Do not generate hundreds of SEO landing pages using only swapped material names.

Use Astro content collections or a structured content model for useful guides.

Potential future guides:

- How to calculate cubic yards.
- How to estimate gravel for a driveway.
- How much fill dirt is needed.
- How much topsoil is needed for a lawn.
- How to calculate concrete in cubic yards.
- How many concrete blocks are required for a wall.
- Cubic yards versus cubic feet.
- Cubic yards to tons by material.
- How waste allowances affect material ordering.

Validate each guide's search intent and calculations before publishing it.

---

# 11. TECHNICAL SEO

Implement:

- Statically generated SEO landing pages.
- Unique title tags and meta descriptions.
- Canonical URLs based on the configured production domain.
- XML sitemap.
- Appropriate robots.txt.
- Clean and consistent URLs.
- Open Graph metadata.
- Breadcrumb navigation.
- Crawlable internal links.
- Appropriate structured data.
- A valid 404 page.
- Correct redirects when URLs change.
- No unintended `noindex`.
- No broken internal links.
- No conflicting canonicals.
- No indexing of empty or low-value pages.

Use Astro's suitable static rendering approach and follow the currently supported documentation.

Structured data must reflect visible, accurate content. Never fabricate ratings, reviews, prices, awards or authorship information.

Configure the production origin as an environment or build configuration value. Do not hard-code a preview origin into canonical URLs.

---

# 12. INTERACTION, ACCESSIBILITY AND PERFORMANCE

Target WCAG 2.2 AA where practical and aim for excellent real-world Core Web Vitals.

Requirements:

- Semantic HTML.
- Visible focus styles.
- Keyboard-accessible navigation.
- Labels for every field.
- Clear validation errors.
- Accessible dynamic results.
- Sufficient contrast.
- Reduced-motion support.
- No unwanted horizontal overflow.
- Responsive form controls.
- Efficient React hydration.
- Minimal client-side JavaScript on static pages.
- Optimized assets.
- No blocking decorative libraries.
- Consistent output formatting and precision.
- A smooth experience on slower connections.

All visible controls must perform their advertised actions.

---

# 13. TESTING

Write automated tests for the calculation engine and critical user workflows.

## Unit tests

Test:

- Rectangular volume.
- Cylindrical volume.
- Unit conversion.
- Mixed-unit inputs.
- Decimal inputs.
- Zero and negative dimensions.
- Missing or invalid fields.
- Waste calculations.
- Custom density.
- Weight conversions.
- Bag yield rounding.
- Cost unit conversions.
- Project totals.
- Saved-project validation.

Example test:

For a 20 ft × 10 ft × 4 in rectangular volume:

Depth in feet = 4 / 12.

Volume = approximately 66.6667 cubic feet.

Volume = approximately 2.4691 cubic yards.

Use numeric tolerances for floating-point calculations.

## UI tests

Verify:

- Homepage calculator works.
- Inputs can be edited.
- Results update correctly.
- Material-specific pages load.
- Reset works.
- Invalid values show useful messages.
- Unit switches work.
- Material assumptions are visible.
- Saved projects can be created, updated and deleted.
- CSV export works.
- Print view excludes irrelevant UI.
- Mobile navigation works.
- There are no serious console errors.

## SEO tests

Verify:

- All expected routes build.
- Titles and canonical URLs are unique and correct.
- Sitemap contains only canonical, intended indexable pages.
- Robots directives are appropriate.
- Internal links are valid.
- Each page has one primary H1.
- Structured data matches visible content.

Run type checking, linting, unit tests, the production build and relevant end-to-end tests. Fix errors instead of ignoring them.

---

# 14. IMPLEMENTATION PHASES

## Phase 1 — Repository inspection

Inspect the existing code, package manager, dependencies, architecture and deployment configuration.

Make a concise internal implementation checklist, then proceed with the work.

## Phase 2 — Technical foundation

Configure Astro, React, Tailwind CSS v4, TypeScript, common layouts, reusable components, SEO utilities and Cloudflare deployment settings.

Preserve existing useful code.

## Phase 3 — Calculation engine

Implement shared geometry, units, validation, material data and conversion functions. Test them before connecting them to page components.

## Phase 4 — Initial SEO launch

Implement in this order:

1. Homepage — cubic yard calculator.
2. Gravel calculator.
3. Dirt calculator.
4. Topsoil calculator.
5. Concrete block calculator.
6. Concrete calculator.

Build functional pages with genuine content, not static designs.

## Phase 5 — Additional material pages

Add mulch, paver and concrete-pad calculators after the main six pages are robust.

Validate additional target keywords in Semrush before assigning precise volume, KD and CPC values.

## Phase 6 — Project Material Planner

Build the multi-material patio workflow, cost inputs, project summaries, browser-based storage, printing and CSV export.

## Phase 7 — QA and deployment preparation

Run all quality checks. Review page source, canonical URLs, sitemap, mobile layout, calculator correctness and Cloudflare configuration.

Provide practical deployment instructions based on the actual repository.

Do not claim the site has been deployed unless deployment occurred and was verified.

---

# 15. DEFINITION OF DONE

The project is complete when:

- The website builds successfully.
- The homepage calculator is fully functional.
- Each priority material calculator works.
- All core formulas have automated tests.
- Unit conversion is correct.
- Material assumptions are documented.
- Unknown densities and prices are not fabricated.
- The first set of SEO pages is implemented with proper keyword ownership.
- The site does not generate avoidable keyword cannibalization.
- The Project Material Planner supports the defined workflow.
- Saved projects work locally.
- Print and CSV export work.
- Navigation and controls are functional.
- Responsive layouts and accessibility have been checked.
- The sitemap, robots configuration and canonical metadata are correct.
- No known critical build or calculation errors remain.
- Tests and builds have actually been run.
- Cloudflare deployment instructions match the implemented configuration.

---

# 16. FINAL REPORT

After implementation, report:

1. What was actually built.
2. Routes completed.
3. Calculation functionality completed.
4. Architecture and major decisions.
5. Test commands and actual outcomes.
6. Build status.
7. SEO implementation status.
8. Cloudflare deployment instructions.
9. Missing dependencies, environment variables or limitations.
10. Remaining work ranked by importance.

Do not report unverified success.

**Begin by inspecting the repository. Implement the application rather than stopping at the plan. Accuracy, useful SEO pages and maintainable architecture take priority over unnecessary complexity.**

## The final launch order

1

Homepage — Cubic Yard Calculator

27,100 volume · KD 10 · $0.18 CPC

2

Gravel Calculator

40,500 volume · KD 22 · $0.69 CPC

3

Dirt Calculator

9,900 volume · KD 11 · $0.04 CPC

4

Topsoil Calculator

8,100 volume · KD 13 · $0.75 CPC

5

Concrete Block Calculator

5,400 volume · KD 11 · $1.38 CPC

6

Concrete Calculator

5,400 volume for “concrete yard calculator” · KD 36

One important note for your agent: these are the Semrush estimates visible in your screenshots, not a promise of traffic or rankings. The prompt explicitly tells it to preserve these values as research evidence and not invent metrics for the remaining tools.