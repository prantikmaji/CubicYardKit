export interface MaterialPackageYield {
  packageName: string;
  weightLbs: number;
  volumeCuFt: number;
  coverageSqFtAtDepth?: { depthInches: number; sqFt: number };
}

export interface MaterialRecord {
  id: string;
  name: string;
  category: 'gravel' | 'dirt' | 'soil' | 'concrete' | 'masonry' | 'pavers';
  description: string;
  supportedCalculations: Array<'volume' | 'weight' | 'bags' | 'area' | 'blocks'>;
  densityLbsPerCuYd?: number;
  densityTonsPerCuYd?: number;
  densitySource?: string;
  sourceUrl?: string;
  sourceVerificationDate?: string;
  assumptions: string[];
  yields?: MaterialPackageYield[];
  defaultWastePercent: number;
  recommendedPriceUnits: Array<'cubic_yard' | 'ton' | 'bag'>;
  relatedCalculatorPath: string;
}

export const MATERIALS: Record<string, MaterialRecord> = {
  'crushed-stone-base': {
    id: 'crushed-stone-base',
    name: 'Crushed Stone (3/4" / #57 Clean)',
    category: 'gravel',
    description: 'Angular crushed aggregate used for driveways, drainage, slab sub-bases, and French drains.',
    supportedCalculations: ['volume', 'weight', 'bags'],
    densityLbsPerCuYd: 2700,
    densityTonsPerCuYd: 1.35,
    densitySource: 'ASTM C29 / NRMCA typical loose bulk density (100 lb/cu ft = 2,700 lb/cu yd)',
    sourceUrl: 'https://www.astm.org/c0029_c0029m-17a.html',
    sourceVerificationDate: '2025-01-15',
    assumptions: [
      'Loose bulk density varies between 2,500 and 2,900 lbs/cu yd depending on quarry rock type (limestone, granite, basalt) and moisture.',
      'Allow 10% to 15% extra for compaction and subgrade undulations on driveways.',
    ],
    yields: [
      { packageName: '0.5 cu ft Bag', weightLbs: 50, volumeCuFt: 0.5 },
    ],
    defaultWastePercent: 10,
    recommendedPriceUnits: ['ton', 'cubic_yard'],
    relatedCalculatorPath: '/gravel-calculator/',
  },
  'pea-gravel': {
    id: 'pea-gravel',
    name: 'Pea Gravel (3/8" Smooth)',
    category: 'gravel',
    description: 'Naturally smoothed small pebbles used for walkways, dog runs, decorative ground cover, and pipe bedding.',
    supportedCalculations: ['volume', 'weight', 'bags'],
    densityLbsPerCuYd: 2800,
    densityTonsPerCuYd: 1.4,
    densitySource: 'National Stone, Sand & Gravel Association (NSSGA) technical aggregate reference',
    sourceUrl: 'https://www.nssga.org',
    sourceVerificationDate: '2025-01-15',
    assumptions: [
      'Rounded shape settles closely, yielding ~2,700 to 2,900 lbs/cu yd.',
      'Does not interlock; recommended for walking surfaces with border edging at 2 to 3 inch depth.',
    ],
    yields: [
      { packageName: '0.5 cu ft Bag', weightLbs: 50, volumeCuFt: 0.5 },
    ],
    defaultWastePercent: 10,
    recommendedPriceUnits: ['ton', 'cubic_yard', 'bag'],
    relatedCalculatorPath: '/gravel-calculator/',
  },
  'fill-dirt': {
    id: 'fill-dirt',
    name: 'Fill Dirt (Subsoil)',
    category: 'dirt',
    description: 'Subsurface soil free of organic matter, ideal for structural backfilling, grading, leveling, and deep foundations.',
    supportedCalculations: ['volume', 'weight'],
    densityLbsPerCuYd: 2400,
    densityTonsPerCuYd: 1.2,
    densitySource: 'USDA NRCS / Caterpillar Performance Handbook loose soil factor (~90 lb/cu ft)',
    sourceUrl: 'https://www.nrcs.usda.gov',
    sourceVerificationDate: '2025-01-15',
    assumptions: [
      'Contains little to no organic loam; compacts significantly (15% to 20% settlement allowance recommended).',
      'Wet fill dirt weighs up to 2,800 lbs/cu yd; dry loose fill is approx 2,200 to 2,400 lbs/cu yd.',
    ],
    defaultWastePercent: 15,
    recommendedPriceUnits: ['cubic_yard', 'ton'],
    relatedCalculatorPath: '/dirt-calculator/',
  },
  'screened-topsoil': {
    id: 'screened-topsoil',
    name: 'Screened Topsoil (Loam Blend)',
    category: 'soil',
    description: 'Nutrient-rich surface layer screened through 1/2" mesh for lawn establishment, seeding, sod underlayment, and grade prep.',
    supportedCalculations: ['volume', 'weight', 'bags'],
    densityLbsPerCuYd: 2100,
    densityTonsPerCuYd: 1.05,
    densitySource: 'The Soil Science Society of America (SSSA) bulk density standard (approx 78 lb/cu ft dry)',
    sourceUrl: 'https://www.soils.org',
    sourceVerificationDate: '2025-01-15',
    assumptions: [
      'Screened soil fluff factor causes initial 10% to 12% settlement after rainfall or rolling.',
      'Moisture dramatically increases weight: damp topsoil can weigh 2,400 lbs/cu yd.',
    ],
    yields: [
      { packageName: '0.75 cu ft Bag', weightLbs: 40, volumeCuFt: 0.75 },
      { packageName: '1.0 cu ft Bag', weightLbs: 50, volumeCuFt: 1.0 },
    ],
    defaultWastePercent: 10,
    recommendedPriceUnits: ['cubic_yard', 'bag'],
    relatedCalculatorPath: '/topsoil-calculator/',
  },
  'garden-soil-blend': {
    id: 'garden-soil-blend',
    name: 'Garden Bed Soil (Compost/Loam Mix)',
    category: 'soil',
    description: 'Rich blend of topsoil, organic compost, and peat or perlite designed for vegetable garden beds and raised planters.',
    supportedCalculations: ['volume', 'weight', 'bags'],
    densityLbsPerCuYd: 1800,
    densityTonsPerCuYd: 0.9,
    densitySource: 'U.S. Composting Council (USCC) bulk density reference for enriched potting/planter mixes',
    sourceUrl: 'https://www.compostingcouncil.org',
    sourceVerificationDate: '2025-01-15',
    assumptions: [
      'Lighter than mineral soil due to high organic matter (approx 65-70 lb/cu ft).',
      'Settles 15% to 20% over the first growing season.',
    ],
    yields: [
      { packageName: '1.5 cu ft Bag', weightLbs: 50, volumeCuFt: 1.5 },
      { packageName: '2.0 cu ft Bag', weightLbs: 60, volumeCuFt: 2.0 },
    ],
    defaultWastePercent: 12,
    recommendedPriceUnits: ['cubic_yard', 'bag'],
    relatedCalculatorPath: '/topsoil-calculator/',
  },
  'ready-mix-concrete': {
    id: 'ready-mix-concrete',
    name: 'Ready-Mix Concrete (Standard 3000-4000 PSI)',
    category: 'concrete',
    description: 'Commercial volumetric concrete for slabs, patios, footings, and structural pours delivered by transit mixer.',
    supportedCalculations: ['volume', 'weight', 'bags'],
    densityLbsPerCuYd: 4050,
    densityTonsPerCuYd: 2.025,
    densitySource: 'American Concrete Institute (ACI 211.1) Normal Weight Concrete (145-150 lb/cu ft)',
    sourceUrl: 'https://www.concrete.org',
    sourceVerificationDate: '2025-01-15',
    assumptions: [
      'Standard ready-mix ordered in whole or quarter cubic yard increments.',
      'Short-load fees commonly apply on orders under 4 to 6 cubic yards.',
      'Allow 5% to 10% extra for form deflection, grade irregularities, and spill loss.',
    ],
    yields: [
      { packageName: '80 lb Concrete Bag', weightLbs: 80, volumeCuFt: 0.60 },
      { packageName: '60 lb Concrete Bag', weightLbs: 60, volumeCuFt: 0.45 },
      { packageName: '50 lb Concrete Bag', weightLbs: 50, volumeCuFt: 0.375 },
    ],
    defaultWastePercent: 10,
    recommendedPriceUnits: ['cubic_yard', 'bag'],
    relatedCalculatorPath: '/concrete-calculator/',
  },
  'standard-cmu-block': {
    id: 'standard-cmu-block',
    name: 'Standard 8x8x16 CMU Block (Hollow)',
    category: 'masonry',
    description: 'Concrete masonry unit for foundation walls, retaining walls, and commercial buildings.',
    supportedCalculations: ['blocks', 'area'],
    densitySource: 'National Concrete Masonry Association (NCMA) TEK 18-02B standards',
    sourceUrl: 'https://ncma.org',
    sourceVerificationDate: '2025-01-15',
    assumptions: [
      'Nominal size is 8" x 8" x 16"; actual manufactured dimensions are 7-5/8" x 7-5/8" x 15-5/8" to allow 3/8" mortar joints.',
      'Formula yields 1.125 blocks per square foot of vertical wall face (100 sq ft = 112.5 blocks).',
      'Mortar requirement: approx 3.0 to 3.5 bags (70 lb masonry cement) per 100 blocks.',
      'Core fill: approx 0.44 cubic feet of grout per standard hollow 2-cell block if fully grouted.',
    ],
    defaultWastePercent: 5,
    recommendedPriceUnits: ['bag'],
    relatedCalculatorPath: '/concrete-block-calculator/',
  },
};
