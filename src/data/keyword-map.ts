export interface KeywordData {
  keyword: string;
  volume: number;
  kd: number;
  cpc: number;
}

export interface PageSEOConfig {
  path: string;
  canonicalUrl: string;
  title: string;
  metaDescription: string;
  h1: string;
  primaryKeyword: KeywordData;
  secondaryKeywords: KeywordData[];
  searchIntent: string;
  launchPriority: number;
  status: 'active' | 'planned';
}

export const SITE_ORIGIN = 'https://cubicyardkit.com';

export const KEYWORD_MAP: Record<string, PageSEOConfig> = {
  home: {
    path: '/',
    canonicalUrl: `${SITE_ORIGIN}/`,
    title: 'Cubic Yard Calculator | Calculate Cubic Yards | CubicYardKit',
    metaDescription:
      'Calculate cubic yards from length, width, and depth. Estimate material quantities for gravel, concrete, dirt, topsoil, and landscaping projects.',
    h1: 'Cubic Yard Calculator',
    primaryKeyword: {
      keyword: 'cubic yard calculator',
      volume: 27100,
      kd: 10,
      cpc: 0.18,
    },
    secondaryKeywords: [
      { keyword: 'calculate cubic yards', volume: 2900, kd: 24, cpc: 0.18 },
      { keyword: 'how to calculate cubic yards', volume: 2900, kd: 47, cpc: 0.52 },
      { keyword: 'cubic yards calculator', volume: 2400, kd: 26, cpc: 0.19 },
      { keyword: 'cubic yards to yards calculator', volume: 1900, kd: 29, cpc: 0.18 },
      { keyword: 'cubic yards to tons calculator', volume: 880, kd: 16, cpc: 0.0 },
      { keyword: 'how to calculate a cubic yard', volume: 720, kd: 26, cpc: 0.26 },
    ],
    searchIntent: 'Broad calculation of cubic yard volume from dimensions across all project types.',
    launchPriority: 1,
    status: 'active',
  },
  gravel: {
    path: '/gravel-calculator/',
    canonicalUrl: `${SITE_ORIGIN}/gravel-calculator/`,
    title: 'Gravel Calculator | Yards, Tons & Pea Gravel | CubicYardKit',
    metaDescription:
      'Calculate gravel in cubic yards and tons for driveways, patios, and walkways. Includes pea gravel, crushed stone, and bag estimates with waste allowance.',
    h1: 'Gravel Calculator',
    primaryKeyword: {
      keyword: 'gravel calculator',
      volume: 40500,
      kd: 22,
      cpc: 0.69,
    },
    secondaryKeywords: [
      { keyword: 'pea gravel calculator', volume: 4400, kd: 9, cpc: 0.38 },
      { keyword: 'gravel driveway calculator', volume: 1300, kd: 20, cpc: 0.44 },
      { keyword: 'gravel calculator yards', volume: 1000, kd: 13, cpc: 0.17 },
      { keyword: 'gravel calculator tons', volume: 880, kd: 25, cpc: 0.1 },
      { keyword: 'driveway gravel calculator', volume: 720, kd: 26, cpc: 0.55 },
    ],
    searchIntent: 'Material-specific volume, tonnage, and bag calculations for landscaping and driveway gravel.',
    launchPriority: 2,
    status: 'active',
  },
  dirt: {
    path: '/dirt-calculator/',
    canonicalUrl: `${SITE_ORIGIN}/dirt-calculator/`,
    title: 'Dirt Calculator | Fill Dirt & Yards of Dirt | CubicYardKit',
    metaDescription:
      'Calculate cubic yards and tons of fill dirt and garden soil. Estimate dirt volume for leveling lawns, garden beds, and site excavation.',
    h1: 'Dirt Calculator',
    primaryKeyword: {
      keyword: 'dirt calculator',
      volume: 9900,
      kd: 11,
      cpc: 0.04,
    },
    secondaryKeywords: [
      { keyword: 'fill dirt calculator', volume: 2900, kd: 13, cpc: 0.34 },
      { keyword: 'garden bed dirt calculator', volume: 2900, kd: 25, cpc: 0.08 },
      { keyword: 'calculate dirt fill', volume: 1300, kd: 15, cpc: 0.25 },
      { keyword: 'calculate yards of dirt', volume: 880, kd: 3, cpc: 0.04 },
      { keyword: 'calculate cubic yards of dirt', volume: 720, kd: 7, cpc: 0.1 },
      { keyword: 'dirt volume calculator', volume: 720, kd: 7, cpc: 0.05 },
      { keyword: 'dirt calculator yards', volume: 590, kd: 13, cpc: 0.04 },
    ],
    searchIntent: 'Volume, settlement adjustment, and ordering calculations for general fill and landscape dirt.',
    launchPriority: 3,
    status: 'active',
  },
  topsoil: {
    path: '/topsoil-calculator/',
    canonicalUrl: `${SITE_ORIGIN}/topsoil-calculator/`,
    title: 'Topsoil Calculator | Yards & Square Feet Coverage | CubicYardKit',
    metaDescription:
      'Calculate how much topsoil you need in cubic yards and square feet coverage. Perfect for lawns, new sod prep, garden beds, and raised planters.',
    h1: 'Topsoil Calculator',
    primaryKeyword: {
      keyword: 'topsoil calculator',
      volume: 8100,
      kd: 13,
      cpc: 0.75,
    },
    secondaryKeywords: [
      { keyword: 'topsoil calculator yards', volume: 210, kd: 4, cpc: 0.58 },
      { keyword: 'topsoil coverage calculator', volume: 170, kd: 23, cpc: 0.56 },
      { keyword: 'how to calculate how much topsoil I need', volume: 140, kd: 34, cpc: 0.58 },
      { keyword: 'topsoil calculator in cubic yards', volume: 110, kd: 13, cpc: 0.07 },
      { keyword: 'topsoil calculator square feet', volume: 90, kd: 6, cpc: 0.44 },
    ],
    searchIntent: 'Topsoil depth and coverage volume calculation for lawns, turf renovation, and planting beds.',
    launchPriority: 4,
    status: 'active',
  },
  concreteBlock: {
    path: '/concrete-block-calculator/',
    canonicalUrl: `${SITE_ORIGIN}/concrete-block-calculator/`,
    title: 'Concrete Block Calculator | Cinder Blocks & Core Fill | CubicYardKit',
    metaDescription:
      'Calculate concrete blocks (CMU) needed for walls, mortar bags, and core grout fill volume. Includes openings and waste factor.',
    h1: 'Concrete Block Calculator',
    primaryKeyword: {
      keyword: 'concrete block calculator',
      volume: 5400,
      kd: 11,
      cpc: 1.38,
    },
    secondaryKeywords: [
      { keyword: 'concrete block estimator calculator', volume: 880, kd: 11, cpc: 1.38 },
      { keyword: 'concrete block wall calculator', volume: 590, kd: 11, cpc: 1.5 },
      { keyword: 'concrete block fill calculator', volume: 320, kd: 8, cpc: 1.2 },
      { keyword: 'concrete block wall cost calculator', volume: 320, kd: 20, cpc: 2.04 },
      { keyword: 'cinder block concrete fill calculator', volume: 260, kd: 7, cpc: 1.2 },
      { keyword: 'how to calculate concrete blocks needed', volume: 170, kd: 29, cpc: 1.22 },
    ],
    searchIntent: 'CMU block count, wall area, mortar joints, core fill grout, and masonry wall material estimation.',
    launchPriority: 5,
    status: 'active',
  },
  concrete: {
    path: '/concrete-calculator/',
    canonicalUrl: `${SITE_ORIGIN}/concrete-calculator/`,
    title: 'Concrete Calculator | Yards & Bags for Slabs, Footings & Columns | CubicYardKit',
    metaDescription:
      'Calculate concrete in cubic yards and 80lb/60lb bags for slabs, footings, post holes, and pads. Accurate ready-mix yardage with waste allowance.',
    h1: 'Concrete Calculator',
    primaryKeyword: {
      keyword: 'concrete yard calculator',
      volume: 5400,
      kd: 36,
      cpc: 0.51,
    },
    secondaryKeywords: [
      { keyword: 'calculator concrete yards', volume: 5400, kd: 24, cpc: 0.51 },
      { keyword: 'concrete calculator yards', volume: 4400, kd: 26, cpc: 0.51 },
      { keyword: 'how to calculate concrete yards', volume: 1300, kd: 22, cpc: 0.16 },
      { keyword: 'how to calculate yards of concrete', volume: 1300, kd: 25, cpc: 0.4 },
      { keyword: 'yards of concrete calculator', volume: 880, kd: 24, cpc: 0.51 },
      { keyword: 'concrete cubic yard calculator', volume: 590, kd: 23, cpc: 0.5 },
    ],
    searchIntent: 'Ready-mix truck ordering and pre-mixed bag estimation for slabs, foundations, and round post holes.',
    launchPriority: 6,
    status: 'active',
  },
  planner: {
    path: '/planner/',
    canonicalUrl: `${SITE_ORIGIN}/planner/`,
    title: 'Project Material Planner | Multi-Material Estimator | CubicYardKit',
    metaDescription:
      'Plan multi-material construction and landscaping projects. Estimate pavers, crushed base, bedding sand, and print a complete bill of materials.',
    h1: 'Project Material Planner',
    primaryKeyword: {
      keyword: 'project material planner',
      volume: 0,
      kd: 0,
      cpc: 0,
    },
    secondaryKeywords: [
      { keyword: 'paver patio material calculator', volume: 0, kd: 0, cpc: 0 },
      { keyword: 'landscape project estimator', volume: 0, kd: 0, cpc: 0 },
    ],
    searchIntent: 'Interactive planning and bill-of-materials generation for multi-phase projects like paver patios.',
    launchPriority: 7,
    status: 'active',
  },
  quoteComparison: {
    path: '/quote-comparison/',
    canonicalUrl: `${SITE_ORIGIN}/quote-comparison/`,
    title: 'Supplier Quote Comparison Tool | CubicYardKit',
    metaDescription:
      'Compare local landscaping and building supplier quotes across bulk cubic yards, tons, and bags. Accounts for delivery fees and unit conversions.',
    h1: 'Supplier Quote Comparison',
    primaryKeyword: {
      keyword: 'material quote comparison',
      volume: 0,
      kd: 0,
      cpc: 0,
    },
    secondaryKeywords: [],
    searchIntent: 'Comparing prices from multiple local suppliers normalized to equivalent cubic yard and ton metrics.',
    launchPriority: 8,
    status: 'active',
  },
};
