import { toFeet, CUBIC_FEET_PER_CUBIC_YARD, CUBIC_METERS_PER_CUBIC_YARD, LBS_PER_US_TON, KG_PER_LB } from './units';
import type { LengthUnit } from './units';

export type SandMaterialId =
  | 'dry-sand'
  | 'concrete-sand'
  | 'paver-bedding-sand'
  | 'masonry-sand'
  | 'play-sand'
  | 'fill-sand'
  | 'damp-sand'
  | 'wet-sand'
  | 'polymeric-sand'
  | 'custom';

export type SandProjectPresetId =
  | 'general'
  | 'paver-bedding'
  | 'sandbox'
  | 'pool-base'
  | 'lawn-leveling'
  | 'trench-fill';

export interface SandMaterialProfile {
  id: SandMaterialId;
  name: string;
  categoryDescription: string;
  state: 'loose-dry' | 'loose-damp' | 'wet-saturated' | 'graded-coarse' | 'manufactured-polymer';
  densityLbsPerCuYd: number;
  densityLbsPerCuFt: number;
  densityTonsPerCuYd: number;
  densityKgPerCuMeter: number;
  densitySource: string;
  standardReference: string;
  typicalBagWeightLbs: number;
  typicalBagYieldCuFt: number;
  recommendedCompactionPercent: number;
  notes: string[];
}

export const SAND_PROFILES: Record<SandMaterialId, SandMaterialProfile> = {
  'concrete-sand': {
    id: 'concrete-sand',
    name: 'Concrete Sand (ASTM C33 / Torpedo / Sharp)',
    categoryDescription: 'Coarse, washed angular sand for concrete mixes, paver bedding, and subbase leveling.',
    state: 'graded-coarse',
    densityLbsPerCuYd: 2700,
    densityLbsPerCuFt: 100.0,
    densityTonsPerCuYd: 1.35,
    densityKgPerCuMeter: 1602,
    densitySource: 'ASTM C33 / ASTM C29 standard specification for concrete aggregates',
    standardReference: 'ASTM C33 / C33M-18',
    typicalBagWeightLbs: 50,
    typicalBagYieldCuFt: 0.50,
    recommendedCompactionPercent: 8,
    notes: [
      'Sharp, angular particle shape locks together when compacted.',
      'Preferred standard aggregate for 1-inch paver bedding layers according to ICPI guidelines.',
    ],
  },
  'paver-bedding-sand': {
    id: 'paver-bedding-sand',
    name: 'Paver Bedding Sand (Coarse Concrete Sand)',
    categoryDescription: 'Screened coarse sand specified by ICPI for uncompacted 1-inch (25 mm) paver setting bed.',
    state: 'graded-coarse',
    densityLbsPerCuYd: 2700,
    densityLbsPerCuFt: 100.0,
    densityTonsPerCuYd: 1.35,
    densityKgPerCuMeter: 1602,
    densitySource: 'Interlocking Concrete Pavement Institute (ICPI) Tech Spec 2',
    standardReference: 'ASTM C33 / CSA A23.1',
    typicalBagWeightLbs: 50,
    typicalBagYieldCuFt: 0.50,
    recommendedCompactionPercent: 10,
    notes: [
      'Spread evenly at 1 inch uniform depth; screed without pre-compacting.',
      'Compacts ~1/8" to 3/16" upward into paver joints during final vibratory plate compaction.',
    ],
  },
  'dry-sand': {
    id: 'dry-sand',
    name: 'Dry Loose Sand (General / Fine / Silica)',
    categoryDescription: 'Standard dry loose bulk sand for general construction, fill, and landscaping.',
    state: 'loose-dry',
    densityLbsPerCuYd: 2600,
    densityLbsPerCuFt: 96.3,
    densityTonsPerCuYd: 1.30,
    densityKgPerCuMeter: 1542,
    densitySource: 'National Stone, Sand & Gravel Association (NSSGA) Aggregate Handbook',
    standardReference: 'NSSGA Reference Standards',
    typicalBagWeightLbs: 50,
    typicalBagYieldCuFt: 0.50,
    recommendedCompactionPercent: 5,
    notes: [
      'Dry bulk density varies between 2,500 and 2,700 lbs/cu yd depending on quartz vs feldspar mineralogy.',
      'Very clean and free-flowing with negligible moisture content (< 1%).',
    ],
  },
  'masonry-sand': {
    id: 'masonry-sand',
    name: 'Masonry / Mortar Sand (ASTM C144)',
    categoryDescription: 'Fine-screened, washed sand for bricklaying mortar, pool liners, and fine leveling.',
    state: 'loose-dry',
    densityLbsPerCuYd: 2600,
    densityLbsPerCuFt: 96.3,
    densityTonsPerCuYd: 1.30,
    densityKgPerCuMeter: 1542,
    densitySource: 'ASTM C144 Standard Specification for Aggregate for Masonry Mortar',
    standardReference: 'ASTM C144-18',
    typicalBagWeightLbs: 50,
    typicalBagYieldCuFt: 0.50,
    recommendedCompactionPercent: 7,
    notes: [
      'Finer gradation than concrete sand; free of pebbles that would puncture pool liners.',
      'Ideal cushion layer for above-ground swimming pool installations.',
    ],
  },
  'play-sand': {
    id: 'play-sand',
    name: 'Play Sand / Sandbox Sand (Washed & Screened)',
    categoryDescription: 'Clean, dust-controlled, non-toxic washed silica sand for kids sandboxes and playgrounds.',
    state: 'loose-dry',
    densityLbsPerCuYd: 2600,
    densityLbsPerCuFt: 96.3,
    densityTonsPerCuYd: 1.30,
    densityKgPerCuMeter: 1542,
    densitySource: 'CPSC Public Playground Safety Handbook / Consumer Product Safety Standards',
    standardReference: 'ASTM F1292 / CPSC 325',
    typicalBagWeightLbs: 50,
    typicalBagYieldCuFt: 0.50,
    recommendedCompactionPercent: 5,
    notes: [
      'Washed and sterilized to remove fine respirable silica dust and caustic residues.',
      'Soft texture that holds shape easily when damp for sandbox building.',
    ],
  },
  'fill-sand': {
    id: 'fill-sand',
    name: 'Fill Sand / Utility Sand / Pipe Bedding',
    categoryDescription: 'Unscreened or sub-grade bank sand for trench backfill, foundation grading, and pipe cushion.',
    state: 'loose-dry',
    densityLbsPerCuYd: 2500,
    densityLbsPerCuFt: 92.6,
    densityTonsPerCuYd: 1.25,
    densityKgPerCuMeter: 1483,
    densitySource: 'Caterpillar Performance Handbook / Typical bank sand loose density',
    standardReference: 'AASHTO M-145 A-1-b',
    typicalBagWeightLbs: 50,
    typicalBagYieldCuFt: 0.52,
    recommendedCompactionPercent: 12,
    notes: [
      'Economy sand containing small pebbles, clay trace, or varying silt fines.',
      'Settles 10% to 15% when backfilled and flooded or plate-compacted.',
    ],
  },
  'damp-sand': {
    id: 'damp-sand',
    name: 'Damp Sand (4%–8% Surface Moisture / Bulked)',
    categoryDescription: 'Quarry-fresh or uncovered yard stockpile sand with natural surface moisture.',
    state: 'loose-damp',
    densityLbsPerCuYd: 2800,
    densityLbsPerCuFt: 103.7,
    densityTonsPerCuYd: 1.40,
    densityKgPerCuMeter: 1661,
    densitySource: 'ACI 211.1 Standard Practice for Selecting Proportions for Normal Concrete',
    standardReference: 'ACI 211.1 / ASTM C128',
    typicalBagWeightLbs: 50,
    typicalBagYieldCuFt: 0.48,
    recommendedCompactionPercent: 8,
    notes: [
      'Subject to the "bulking" physical phenomenon: surface tension of moisture pushes grains apart.',
      'Slightly heavier per unit volume than dry sand due to water weight.',
    ],
  },
  'wet-sand': {
    id: 'wet-sand',
    name: 'Wet / Saturated Sand (Rain-Soaked)',
    categoryDescription: 'Densely saturated sand with void spaces filled with water, commonly delivered after rainfall.',
    state: 'wet-saturated',
    densityLbsPerCuYd: 3200,
    densityLbsPerCuFt: 118.5,
    densityTonsPerCuYd: 1.60,
    densityKgPerCuMeter: 1898,
    densitySource: 'US Army Corps of Engineers (USACE) Soil Mechanics Design Manual',
    standardReference: 'EM 1110-2-1906',
    typicalBagWeightLbs: 50,
    typicalBagYieldCuFt: 0.42,
    recommendedCompactionPercent: 5,
    notes: [
      'High weight penalty when purchasing by the ton: moisture adds substantial tonnage.',
      'Bulking collapses under full saturation, increasing bulk density significantly.',
    ],
  },
  'polymeric-sand': {
    id: 'polymeric-sand',
    name: 'Polymeric Jointing Sand (Paver Joints)',
    categoryDescription: 'High-performance joint sand containing polymer binding additives that activate with water.',
    state: 'manufactured-polymer',
    densityLbsPerCuYd: 2970,
    densityLbsPerCuFt: 110.0,
    densityTonsPerCuYd: 1.485,
    densityKgPerCuMeter: 1762,
    densitySource: 'Manufacturer specifications (Alliance Gator, Techniseal, Sakrete)',
    standardReference: 'ASTM C144 base with proprietary polymers',
    typicalBagWeightLbs: 50,
    typicalBagYieldCuFt: 0.45,
    recommendedCompactionPercent: 0,
    notes: [
      'Sold in 50 lb weatherproof plastic bags.',
      'Covers 50 to 85 sq ft of standard 2-3/8" thick pavers with 1/8" joints per 50-lb bag.',
      'Hardens upon misting with water to lock pavers and resist weeds/ants.',
    ],
  },
  'custom': {
    id: 'custom',
    name: 'Custom Supplier Density',
    categoryDescription: 'User-specified density matching scale ticket or quarry test report.',
    state: 'loose-dry',
    densityLbsPerCuYd: 2700,
    densityLbsPerCuFt: 100.0,
    densityTonsPerCuYd: 1.35,
    densityKgPerCuMeter: 1602,
    densitySource: 'User-supplied specification',
    standardReference: 'Custom',
    typicalBagWeightLbs: 50,
    typicalBagYieldCuFt: 0.50,
    recommendedCompactionPercent: 8,
    notes: ['Calculations derived directly from custom density inputs.'],
  },
};

export interface SandProjectPreset {
  id: SandProjectPresetId;
  name: string;
  recommendedMaterialId: SandMaterialId;
  defaultDepthInches: number;
  depthDescription: string;
  defaultCompactionPercent: number;
  defaultWastePercent: number;
  typicalUse: string;
}

export const SAND_PRESETS: Record<SandProjectPresetId, SandProjectPreset> = {
  'general': {
    id: 'general',
    name: 'General Sand Take-Off',
    recommendedMaterialId: 'concrete-sand',
    defaultDepthInches: 2,
    depthDescription: 'Custom thickness',
    defaultCompactionPercent: 5,
    defaultWastePercent: 10,
    typicalUse: 'General leveling, landscaping, and construction projects.',
  },
  'paver-bedding': {
    id: 'paver-bedding',
    name: 'Paver Bedding Layer',
    recommendedMaterialId: 'paver-bedding-sand',
    defaultDepthInches: 1,
    depthDescription: '1 inch (25 mm) uniform uncompacted layer',
    defaultCompactionPercent: 10,
    defaultWastePercent: 10,
    typicalUse: 'Screeded setting bed directly beneath concrete or clay brick pavers (ICPI spec).',
  },
  'sandbox': {
    id: 'sandbox',
    name: "Children's Sandbox / Play Area",
    recommendedMaterialId: 'play-sand',
    defaultDepthInches: 6,
    depthDescription: '6 inches (15 cm) depth for digging & safety',
    defaultCompactionPercent: 5,
    defaultWastePercent: 5,
    typicalUse: 'Clean, safe, dust-free play sand for backyard boxes and school sensory pits.',
  },
  'pool-base': {
    id: 'pool-base',
    name: 'Above-Ground Pool Base Cushion',
    recommendedMaterialId: 'masonry-sand',
    defaultDepthInches: 2,
    depthDescription: '2 inches (5 cm) smooth protective bed',
    defaultCompactionPercent: 8,
    defaultWastePercent: 10,
    typicalUse: 'Fine masonry sand base to protect vinyl swimming pool liners from rocks and punctures.',
  },
  'lawn-leveling': {
    id: 'lawn-leveling',
    name: 'Lawn Topdressing / Leveling',
    recommendedMaterialId: 'masonry-sand',
    defaultDepthInches: 0.375, // 3/8 inch
    depthDescription: '3/8 inch (9.5 mm) light spreading',
    defaultCompactionPercent: 5,
    defaultWastePercent: 10,
    typicalUse: 'Thin topdressing across turfgrass to eliminate low spots without smothering blades.',
  },
  'trench-fill': {
    id: 'trench-fill',
    name: 'Pipe Bedding & Trench Backfill',
    recommendedMaterialId: 'fill-sand',
    defaultDepthInches: 4,
    depthDescription: '4 inches (10 cm) bedding & haunch cushion',
    defaultCompactionPercent: 15,
    defaultWastePercent: 12,
    typicalUse: 'Utility trench pipe surround to prevent point-loading from jagged rock backfill.',
  },
};

export interface SandSectionInput {
  id: string;
  name: string;
  shape: 'rectangle' | 'circle';
  length?: number;
  lengthUnit?: LengthUnit;
  width?: number;
  widthUnit?: LengthUnit;
  diameter?: number;
  diameterUnit?: LengthUnit;
  depth: number;
  depthUnit: LengthUnit;
}

export interface SandCalculationInput {
  inputMode: 'dimensions' | 'area' | 'direct-volume';
  sections: SandSectionInput[];
  // Area mode
  knownArea?: number;
  knownAreaUnit?: 'sqFt' | 'sqMeters' | 'sqYards';
  knownAreaDepth?: number;
  knownAreaDepthUnit?: LengthUnit;
  // Direct volume mode
  directVolume?: number;
  directVolumeUnit?: 'cubicYards' | 'cubicFeet' | 'cubicMeters' | 'tons';
  // Material & Densities
  materialId: SandMaterialId;
  customDensityLbsPerCuYd?: number;
  // Compaction & Wastage
  compactionPercent: number; // e.g. 5-15% volume loss due to tamping/plate compaction
  wastePercent: number; // e.g. 5-10% order contingency for spillage/edge slope
  // Bag specifics
  bagWeightLbs?: number; // default 50
  bagYieldCuFt?: number; // default 0.50
  // Pricing & procurement (optional)
  pricingUnit?: 'cubic_yard' | 'ton' | 'tonne' | 'bag';
  unitPrice?: number;
  bagPrice?: number;
  deliveryFee?: number;
  laborCostPerSqFt?: number;
  taxRatePercent?: number;
}

export interface SectionBreakdown {
  id: string;
  name: string;
  areaSqFt: number;
  netCubicFeet: number;
  netCubicYards: number;
}

export interface SandCalculationResult {
  // Area & Net Dimensions
  totalAreaSqFt: number;
  totalAreaSqMeters: number;
  sectionBreakdown: SectionBreakdown[];

  // Volume Breakdown (Separating Net, Compacted, and Ordered)
  netCubicFeet: number;
  netCubicYards: number;
  netCubicMeters: number;

  compactionPercent: number;
  compactedPlacedCubicFeet: number;
  compactedPlacedCubicYards: number;
  compactedPlacedCubicMeters: number;

  wastePercent: number;
  orderVolumeCubicFeet: number;
  orderVolumeCubicYards: number;
  orderVolumeCubicMeters: number;

  // Mass & Weight
  activeMaterial: SandMaterialProfile;
  densityLbsPerCuYd: number;
  densityLbsPerCuFt: number;
  densityTonsPerCuYd: number;
  densityKgPerCuMeter: number;
  totalPounds: number;
  totalTons: number; // US Short Tons (2,000 lbs)
  totalMetricTonnes: number; // 1,000 kg
  totalKilograms: number;

  // Bag Take-Off
  bagWeightLbs: number;
  bagYieldCuFt: number;
  bags50lbNeeded: number;
  bags60lbNeeded: number;
  bulkBags1TonNeeded: number; // 2000 lb supersack
  leftoverBagCuFt: number;
  leftoverBagPercent: number;

  // Truckload Estimates
  pickupTruckloads: number; // ~1 cubic yard payload
  singleAxleDumpTrucks: number; // ~6 tons
  tandemDumpTrucks: number; // ~12 tons
  triAxleDumpTrucks: number; // ~16 tons

  // Cost and Budget
  hasCostData: boolean;
  materialCost: number;
  deliveryFee: number;
  laborCost: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  costPerSqFt: number;

  // Bulk vs Bag Procurement Comparison
  bagVsBulkComparison: {
    canCompare: boolean;
    bagTotalCost: number;
    bulkTotalCost: number;
    difference: number;
    cheaperOption: 'bags' | 'bulk' | 'tie';
    savingsPercent: number;
  };

  assumptions: string[];
}

/**
 * Pure deterministic calculation engine for Sand Quantity, Weight, Bags & Cost.
 */
export function calculateSand(input: SandCalculationInput): SandCalculationResult {
  let totalAreaSqFt = 0;
  let netCubicFeet = 0;
  const sectionBreakdown: SectionBreakdown[] = [];

  // 1. Resolve geometry based on input mode
  if (input.inputMode === 'dimensions') {
    for (const sec of input.sections) {
      const depthFt = Math.max(0, toFeet(sec.depth, sec.depthUnit));
      let areaSqFt = 0;

      if (sec.shape === 'circle') {
        const diaFt = Math.max(0, toFeet(sec.diameter ?? 0, sec.diameterUnit ?? 'feet'));
        const radiusFt = diaFt / 2;
        areaSqFt = Math.PI * radiusFt * radiusFt;
      } else {
        const lengthFt = Math.max(0, toFeet(sec.length ?? 0, sec.lengthUnit ?? 'feet'));
        const widthFt = Math.max(0, toFeet(sec.width ?? 0, sec.widthUnit ?? 'feet'));
        areaSqFt = lengthFt * widthFt;
      }

      const secCuFt = areaSqFt * depthFt;
      const secCuYd = secCuFt / CUBIC_FEET_PER_CUBIC_YARD;

      totalAreaSqFt += areaSqFt;
      netCubicFeet += secCuFt;

      sectionBreakdown.push({
        id: sec.id,
        name: sec.name || 'Section',
        areaSqFt,
        netCubicFeet: secCuFt,
        netCubicYards: secCuYd,
      });
    }
  } else if (input.inputMode === 'area') {
    const rawArea = Math.max(0, input.knownArea ?? 0);
    const unit = input.knownAreaUnit ?? 'sqFt';
    if (unit === 'sqFt') {
      totalAreaSqFt = rawArea;
    } else if (unit === 'sqMeters') {
      totalAreaSqFt = rawArea * 10.76391041671; // 1 m² = 10.7639 sq ft
    } else if (unit === 'sqYards') {
      totalAreaSqFt = rawArea * 9;
    }

    const depthFt = Math.max(0, toFeet(input.knownAreaDepth ?? 0, input.knownAreaDepthUnit ?? 'inches'));
    netCubicFeet = totalAreaSqFt * depthFt;

    sectionBreakdown.push({
      id: 'known-area',
      name: 'Specified Surface Area',
      areaSqFt: totalAreaSqFt,
      netCubicFeet,
      netCubicYards: netCubicFeet / CUBIC_FEET_PER_CUBIC_YARD,
    });
  } else if (input.inputMode === 'direct-volume') {
    const rawVol = Math.max(0, input.directVolume ?? 0);
    const volUnit = input.directVolumeUnit ?? 'cubicYards';

    const baseProfile = SAND_PROFILES[input.materialId] ?? SAND_PROFILES['concrete-sand'];
    const activeDensityLbsPerCuYd =
      input.materialId === 'custom' && input.customDensityLbsPerCuYd && input.customDensityLbsPerCuYd > 0
        ? input.customDensityLbsPerCuYd
        : baseProfile.densityLbsPerCuYd;

    if (volUnit === 'cubicYards') {
      netCubicFeet = rawVol * CUBIC_FEET_PER_CUBIC_YARD;
    } else if (volUnit === 'cubicFeet') {
      netCubicFeet = rawVol;
    } else if (volUnit === 'cubicMeters') {
      netCubicFeet = (rawVol / CUBIC_METERS_PER_CUBIC_YARD) * CUBIC_FEET_PER_CUBIC_YARD;
    } else if (volUnit === 'tons') {
      // 1 ton = 2000 lbs. Cu yds = (tons * 2000) / densityLbsPerCuYd
      const cuYds = (rawVol * LBS_PER_US_TON) / activeDensityLbsPerCuYd;
      netCubicFeet = cuYds * CUBIC_FEET_PER_CUBIC_YARD;
    }

    sectionBreakdown.push({
      id: 'direct-volume',
      name: 'Direct Volume Take-Off',
      areaSqFt: 0,
      netCubicFeet,
      netCubicYards: netCubicFeet / CUBIC_FEET_PER_CUBIC_YARD,
    });
  }

  // 2. Volume Calculations (Strict distinction between Net, Compacted, and Ordered)
  const netCubicYards = netCubicFeet / CUBIC_FEET_PER_CUBIC_YARD;
  const netCubicMeters = netCubicYards * CUBIC_METERS_PER_CUBIC_YARD;

  const compactionPercent = Math.max(0, input.compactionPercent ?? 0);
  const compactionMultiplier = 1 + compactionPercent / 100;
  const compactedPlacedCubicFeet = netCubicFeet * compactionMultiplier;
  const compactedPlacedCubicYards = netCubicYards * compactionMultiplier;
  const compactedPlacedCubicMeters = netCubicMeters * compactionMultiplier;

  const wastePercent = Math.max(0, input.wastePercent ?? 0);
  const wasteMultiplier = 1 + wastePercent / 100;
  const orderVolumeCubicFeet = compactedPlacedCubicFeet * wasteMultiplier;
  const orderVolumeCubicYards = compactedPlacedCubicYards * wasteMultiplier;
  const orderVolumeCubicMeters = compactedPlacedCubicMeters * wasteMultiplier;

  // 3. Resolve Material & Densities
  const activeProfile = SAND_PROFILES[input.materialId] ?? SAND_PROFILES['concrete-sand'];
  const densityLbsPerCuYd =
    input.materialId === 'custom' && input.customDensityLbsPerCuYd && input.customDensityLbsPerCuYd > 0
      ? input.customDensityLbsPerCuYd
      : activeProfile.densityLbsPerCuYd;

  const densityLbsPerCuFt = densityLbsPerCuYd / CUBIC_FEET_PER_CUBIC_YARD;
  const densityTonsPerCuYd = densityLbsPerCuYd / LBS_PER_US_TON;
  // 1 lb = 0.45359237 kg; 1 cu yd = 0.764554857984 m³
  const densityKgPerCuMeter = (densityLbsPerCuYd * KG_PER_LB) / CUBIC_METERS_PER_CUBIC_YARD;

  // Weight is computed from the total order volume
  const totalPounds = orderVolumeCubicYards * densityLbsPerCuYd;
  const totalTons = totalPounds / LBS_PER_US_TON;
  const totalKilograms = totalPounds * KG_PER_LB;
  const totalMetricTonnes = totalKilograms / 1000;

  // 4. Bag Calculations
  const bagWeightLbs = input.bagWeightLbs && input.bagWeightLbs > 0 ? input.bagWeightLbs : activeProfile.typicalBagWeightLbs;
  const bagYieldCuFt = input.bagYieldCuFt && input.bagYieldCuFt > 0 ? input.bagYieldCuFt : activeProfile.typicalBagYieldCuFt;

  // Standard 50 lb bags
  const bags50lbNeeded = orderVolumeCubicFeet > 0 ? Math.ceil(orderVolumeCubicFeet / bagYieldCuFt) : 0;
  // Standard 60 lb bags (~0.60 cu ft yield)
  const bags60lbNeeded = orderVolumeCubicFeet > 0 ? Math.ceil(orderVolumeCubicFeet / 0.60) : 0;
  // 1 Ton Bulk Bags (2,000 lbs)
  const bulkBags1TonNeeded = totalTons > 0 ? Math.ceil(totalTons) : 0;

  // Leftover calculation for selected bag
  const totalProvidedCuFt = bags50lbNeeded * bagYieldCuFt;
  const leftoverBagCuFt = Math.max(0, totalProvidedCuFt - orderVolumeCubicFeet);
  const leftoverBagPercent = totalProvidedCuFt > 0 ? (leftoverBagCuFt / totalProvidedCuFt) * 100 : 0;

  // 5. Truckloads
  const pickupTruckloads = orderVolumeCubicYards > 0 ? Math.ceil(orderVolumeCubicYards / 1.0) : 0;
  const singleAxleDumpTrucks = totalTons > 0 ? Math.ceil(totalTons / 6.0) : 0;
  const tandemDumpTrucks = totalTons > 0 ? Math.ceil(totalTons / 12.0) : 0;
  const triAxleDumpTrucks = totalTons > 0 ? Math.ceil(totalTons / 16.0) : 0;

  // 6. Cost & Quote Analysis
  let materialCost = 0;
  const unitPrice = input.unitPrice && input.unitPrice > 0 ? input.unitPrice : 0;
  const pricingUnit = input.pricingUnit ?? 'cubic_yard';

  if (unitPrice > 0) {
    if (pricingUnit === 'cubic_yard') {
      materialCost = orderVolumeCubicYards * unitPrice;
    } else if (pricingUnit === 'ton') {
      materialCost = totalTons * unitPrice;
    } else if (pricingUnit === 'tonne') {
      materialCost = totalMetricTonnes * unitPrice;
    } else if (pricingUnit === 'bag') {
      materialCost = bags50lbNeeded * unitPrice;
    }
  }

  const deliveryFee = input.deliveryFee && input.deliveryFee > 0 ? input.deliveryFee : 0;
  const laborCostPerSqFt = input.laborCostPerSqFt && input.laborCostPerSqFt > 0 ? input.laborCostPerSqFt : 0;
  const laborCost = laborCostPerSqFt > 0 && totalAreaSqFt > 0 ? totalAreaSqFt * laborCostPerSqFt : 0;

  const subtotal = materialCost + deliveryFee + laborCost;
  const taxRate = input.taxRatePercent && input.taxRatePercent > 0 ? input.taxRatePercent : 0;
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount;
  const costPerSqFt = totalAreaSqFt > 0 && grandTotal > 0 ? grandTotal / totalAreaSqFt : 0;
  const hasCostData = grandTotal > 0;

  // 7. Bulk vs Bag Procurement Comparison
  let bagVsBulkComparison = {
    canCompare: false,
    bagTotalCost: 0,
    bulkTotalCost: 0,
    difference: 0,
    cheaperOption: 'tie' as 'bags' | 'bulk' | 'tie',
    savingsPercent: 0,
  };

  const bagPriceInput = input.bagPrice && input.bagPrice > 0 ? input.bagPrice : (pricingUnit === 'bag' ? unitPrice : 0);
  const bulkPriceInput = (pricingUnit === 'cubic_yard' || pricingUnit === 'ton') ? unitPrice : 0;

  if (bagPriceInput > 0 && (bulkPriceInput > 0 || deliveryFee > 0) && orderVolumeCubicFeet > 0) {
    const bagCost = bags50lbNeeded * bagPriceInput;
    const bulkCost = (pricingUnit === 'ton' ? totalTons * bulkPriceInput : orderVolumeCubicYards * bulkPriceInput) + deliveryFee;

    const diff = Math.abs(bagCost - bulkCost);
    const cheaper = bagCost < bulkCost ? 'bags' : bulkCost < bagCost ? 'bulk' : 'tie';
    const higherCost = Math.max(bagCost, bulkCost);
    const savingsPct = higherCost > 0 ? (diff / higherCost) * 100 : 0;

    bagVsBulkComparison = {
      canCompare: true,
      bagTotalCost: bagCost,
      bulkTotalCost: bulkCost,
      difference: diff,
      cheaperOption: cheaper,
      savingsPercent: savingsPct,
    };
  }

  // 8. Transparent Assumptions & Documentation Notes
  const assumptions: string[] = [
    `1 cubic yard = 27 cubic feet = ${CUBIC_METERS_PER_CUBIC_YARD.toFixed(4)} cubic meters.`,
    `Density: ${densityLbsPerCuYd.toLocaleString()} lbs/cu yd (${densityTonsPerCuYd.toFixed(2)} US short tons/cu yd; ${densityLbsPerCuFt.toFixed(1)} lbs/cu ft). Reference: ${activeProfile.densitySource}.`,
    `Placed volume includes ${compactionPercent}% compaction allowance (${compactedPlacedCubicYards.toFixed(2)} cu yd).`,
    `Order volume includes ${wastePercent}% order contingency (${orderVolumeCubicYards.toFixed(2)} cu yd total).`,
    `Bag counts calculated using ${bagWeightLbs}-lb bags at ${bagYieldCuFt.toFixed(2)} cu ft verified yield (${Math.round(27 / bagYieldCuFt)} bags per cubic yard).`,
  ];

  return {
    totalAreaSqFt,
    totalAreaSqMeters: totalAreaSqFt * 0.092903,
    sectionBreakdown,
    netCubicFeet,
    netCubicYards,
    netCubicMeters,
    compactionPercent,
    compactedPlacedCubicFeet,
    compactedPlacedCubicYards,
    compactedPlacedCubicMeters,
    wastePercent,
    orderVolumeCubicFeet,
    orderVolumeCubicYards,
    orderVolumeCubicMeters,
    activeMaterial: activeProfile,
    densityLbsPerCuYd,
    densityLbsPerCuFt,
    densityTonsPerCuYd,
    densityKgPerCuMeter,
    totalPounds,
    totalTons,
    totalMetricTonnes,
    totalKilograms,
    bagWeightLbs,
    bagYieldCuFt,
    bags50lbNeeded,
    bags60lbNeeded,
    bulkBags1TonNeeded,
    leftoverBagCuFt,
    leftoverBagPercent,
    pickupTruckloads,
    singleAxleDumpTrucks,
    tandemDumpTrucks,
    triAxleDumpTrucks,
    hasCostData,
    materialCost,
    deliveryFee,
    laborCost,
    subtotal,
    taxAmount,
    grandTotal,
    costPerSqFt,
    bagVsBulkComparison,
    assumptions,
  };
}

/**
 * Reverse conversion helper: volume to weight OR weight to volume for sand.
 */
export function convertSandVolumeWeight(params: {
  volumeCuYds?: number;
  weightTons?: number;
  densityLbsPerCuYd?: number;
}): { volumeCuYds: number; volumeCuFt: number; volumeCuMeters: number; weightTons: number; weightLbs: number; weightMetricTonnes: number } {
  const density = params.densityLbsPerCuYd && params.densityLbsPerCuYd > 0 ? params.densityLbsPerCuYd : 2700;

  if (params.volumeCuYds !== undefined && params.volumeCuYds >= 0) {
    const yds = params.volumeCuYds;
    const ft = yds * CUBIC_FEET_PER_CUBIC_YARD;
    const meters = yds * CUBIC_METERS_PER_CUBIC_YARD;
    const lbs = yds * density;
    const tons = lbs / LBS_PER_US_TON;
    const tonnes = (lbs * KG_PER_LB) / 1000;
    return { volumeCuYds: yds, volumeCuFt: ft, volumeCuMeters: meters, weightTons: tons, weightLbs: lbs, weightMetricTonnes: tonnes };
  }

  if (params.weightTons !== undefined && params.weightTons >= 0) {
    const tons = params.weightTons;
    const lbs = tons * LBS_PER_US_TON;
    const yds = lbs / density;
    const ft = yds * CUBIC_FEET_PER_CUBIC_YARD;
    const meters = yds * CUBIC_METERS_PER_CUBIC_YARD;
    const tonnes = (lbs * KG_PER_LB) / 1000;
    return { volumeCuYds: yds, volumeCuFt: ft, volumeCuMeters: meters, weightTons: tons, weightLbs: lbs, weightMetricTonnes: tonnes };
  }

  return { volumeCuYds: 0, volumeCuFt: 0, volumeCuMeters: 0, weightTons: 0, weightLbs: 0, weightMetricTonnes: 0 };
}

