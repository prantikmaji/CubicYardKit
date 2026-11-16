import { toFeet, CUBIC_FEET_PER_CUBIC_YARD, CUBIC_METERS_PER_CUBIC_YARD, LBS_PER_US_TON, KG_PER_LB } from './units';
import type { LengthUnit } from './units';

export type AsphaltMaterialId =
  | 'hma-dense'
  | 'hma-fine'
  | 'hma-coarse'
  | 'millings'
  | 'cold-patch'
  | 'porous-asphalt'
  | 'custom';

export type AsphaltProjectPresetId =
  | 'residential-driveway'
  | 'heavy-driveway'
  | 'driveway-resurfacing'
  | 'parking-lot'
  | 'millings-driveway'
  | 'pothole-patch';

export interface AsphaltMaterialProfile {
  id: AsphaltMaterialId;
  name: string;
  categoryDescription: string;
  densityLbPerCuFt: number;
  densityLbsPerCuYd: number;
  densityTonsPerCuYd: number;
  densityKgPerCuMeter: number;
  densityRangeLbPerCuFt: [number, number];
  densitySource: string;
  standardReference: string;
  lbsPerSqYdPerInch: number;
  notes: string[];
}

export const ASPHALT_PROFILES: Record<AsphaltMaterialId, AsphaltMaterialProfile> = {
  'hma-dense': {
    id: 'hma-dense',
    name: 'Hot Mix Asphalt (Dense-Graded / Standard HMA)',
    categoryDescription: 'Standard dense-graded hot plant mix used for residential driveways, commercial paving, and highway wearing courses.',
    densityLbPerCuFt: 145.0,
    densityLbsPerCuYd: 3915.0,
    densityTonsPerCuYd: 1.9575,
    densityKgPerCuMeter: 2322.7,
    densityRangeLbPerCuFt: [140.0, 150.0],
    densitySource: 'FHWA Western Federal Lands Estimating Handbook / Asphalt Institute Technical FAQ',
    standardReference: 'AASHTO M 323 / ASTM D3515',
    lbsPerSqYdPerInch: 108.75, // (145 / 12) * 9
    notes: [
      'Industry standard reference benchmark for dense-graded hot plant mix.',
      'Corresponds to approx. 110 lbs per square yard per inch of compacted thickness.',
      'Compacts ~20% to 25% from loose screed depth under heavy steel-drum roller compaction.',
    ],
  },
  'hma-fine': {
    id: 'hma-fine',
    name: 'Fine Surface Mix / Wearing Course (3/8" / 9.5 mm)',
    categoryDescription: 'Fine-aggregate asphalt surface course offering a smooth, uniform, tight-textured residential finish.',
    densityLbPerCuFt: 143.0,
    densityLbsPerCuYd: 3861.0,
    densityTonsPerCuYd: 1.9305,
    densityKgPerCuMeter: 2290.6,
    densityRangeLbPerCuFt: [138.0, 146.0],
    densitySource: 'National Asphalt Pavement Association (NAPA) Mix Design Guide',
    standardReference: 'Superpave 9.5 mm Nominal Maximum Aggregate Size (NMAS)',
    lbsPerSqYdPerInch: 107.25,
    notes: [
      'Ideal for top lift / wearing course over existing binder or pavement.',
      'Tight aggregate matrix resists water infiltration and surface raveling.',
    ],
  },
  'hma-coarse': {
    id: 'hma-coarse',
    name: 'Coarse Base / Binder Course (3/4"–1" / 19–25 mm)',
    categoryDescription: 'Heavy-duty structural load-bearing asphalt base layer placed beneath the final surface course.',
    densityLbPerCuFt: 148.0,
    densityLbsPerCuYd: 3996.0,
    densityTonsPerCuYd: 1.998,
    densityKgPerCuMeter: 2370.7,
    densityRangeLbPerCuFt: [144.0, 152.0],
    densitySource: 'State DOT Standard Specifications for Highway Construction (Dense Base)',
    standardReference: 'Superpave 19.0 mm / 25.0 mm NMAS',
    lbsPerSqYdPerInch: 111.0,
    notes: [
      'Higher density due to interlocking coarse aggregate gradation.',
      'Designed to distribute heavy vehicle axle loads to the aggregate subgrade.',
    ],
  },
  'millings': {
    id: 'millings',
    name: 'Asphalt Millings / RAP (Recycled Asphalt Pavement)',
    categoryDescription: 'Crushed and screened recycled asphalt pavement, widely used for budget driveways, farm lanes, and parking lots.',
    densityLbPerCuFt: 105.0,
    densityLbsPerCuYd: 2835.0,
    densityTonsPerCuYd: 1.4175,
    densityKgPerCuMeter: 1681.9,
    densityRangeLbPerCuFt: [95.0, 115.0],
    densitySource: 'Federal Highway Administration (FHWA) Recycled Materials / RAP User Guide',
    standardReference: 'AASHTO MP 23',
    lbsPerSqYdPerInch: 78.75,
    notes: [
      'Significantly lighter than hot mix (105 vs 145 lb/cu ft); DO NOT reuse hot-mix density for millings.',
      'Binds and solidifies in summer heat as residual asphalt binder softens under compaction.',
      'Typical driveway thickness is 3 to 4 inches compacted.',
    ],
  },
  'cold-patch': {
    id: 'cold-patch',
    name: 'Cold Patch / All-Weather Pothole Mix',
    categoryDescription: 'Polymer-modified cold-applied asphalt for emergency pothole repair, utility cuts, and small DIY patches.',
    densityLbPerCuFt: 120.0,
    densityLbsPerCuYd: 3240.0,
    densityTonsPerCuYd: 1.62,
    densityKgPerCuMeter: 1922.2,
    densityRangeLbPerCuFt: [110.0, 130.0],
    densitySource: 'Commercial manufacturer specifications (Aquaphalt, Sakrete, Quikrete)',
    standardReference: 'ASTM D4215',
    lbsPerSqYdPerInch: 90.0,
    notes: [
      'Typically sold in 50 lb weatherproof plastic bags or 5-gallon pails.',
      'One 50 lb bag yields approx. 0.42 cubic feet (covers ~2.5 sq ft at 2" depth).',
      'Requires thorough hand tamping or vehicle wheel rolling to compact.',
    ],
  },
  'porous-asphalt': {
    id: 'porous-asphalt',
    name: 'Porous Asphalt / Permeable Friction Course',
    categoryDescription: 'Open-graded asphalt with interconnected void matrix allowing storm runoff to drain through into a stone reservoir.',
    densityLbPerCuFt: 132.0,
    densityLbsPerCuYd: 3564.0,
    densityTonsPerCuYd: 1.782,
    densityKgPerCuMeter: 2114.4,
    densityRangeLbPerCuFt: [125.0, 138.0],
    densitySource: 'EPA Best Management Practices for Porous Asphalt Pavements',
    standardReference: 'ASTM D7064 / Open-Graded Friction Course (OGFC)',
    lbsPerSqYdPerInch: 99.0,
    notes: [
      'Contains 16% to 22% air voids for stormwater infiltration.',
      'Lighter bulk density than standard dense-graded HMA due to open void structure.',
    ],
  },
  'custom': {
    id: 'custom',
    name: 'Custom Supplier Mix Density',
    categoryDescription: 'User-specified bulk density from asphalt plant mix ticket or job specifications.',
    densityLbPerCuFt: 145.0,
    densityLbsPerCuYd: 3915.0,
    densityTonsPerCuYd: 1.9575,
    densityKgPerCuMeter: 2322.7,
    densityRangeLbPerCuFt: [130.0, 160.0],
    densitySource: 'User specified',
    standardReference: 'Custom',
    lbsPerSqYdPerInch: 108.75,
    notes: ['Calculations derived directly from custom entered density.'],
  },
};

export interface AsphaltProjectPreset {
  id: AsphaltProjectPresetId;
  name: string;
  recommendedMaterialId: AsphaltMaterialId;
  compactedThicknessInches: number;
  looseThicknessInches: number;
  recommendedBaseInches: number;
  defaultWastePercent: number;
  typicalUse: string;
}

export const ASPHALT_PRESETS: Record<AsphaltProjectPresetId, AsphaltProjectPreset> = {
  'residential-driveway': {
    id: 'residential-driveway',
    name: 'Residential Driveway (Standard)',
    recommendedMaterialId: 'hma-dense',
    compactedThicknessInches: 2.5,
    looseThicknessInches: 3.125,
    recommendedBaseInches: 4.0,
    defaultWastePercent: 8,
    typicalUse: 'Standard residential driveway for passenger cars and light SUVs; 1 lift over 4" to 6" crushed stone base.',
  },
  'heavy-driveway': {
    id: 'heavy-driveway',
    name: 'Heavy-Duty Driveway (2 Lifts: Base + Surface)',
    recommendedMaterialId: 'hma-dense',
    compactedThicknessInches: 3.5,
    looseThicknessInches: 4.375,
    recommendedBaseInches: 6.0,
    defaultWastePercent: 10,
    typicalUse: 'Driveway for heavy trucks, delivery vans, motorhomes, and boat trailers; 2" binder course + 1.5" surface wearing course.',
  },
  'driveway-resurfacing': {
    id: 'driveway-resurfacing',
    name: 'Driveway Resurfacing / Overlay',
    recommendedMaterialId: 'hma-fine',
    compactedThicknessInches: 1.5,
    looseThicknessInches: 1.875,
    recommendedBaseInches: 0,
    defaultWastePercent: 8,
    typicalUse: 'Paving 1.5" to 2" new wearing course over existing solid asphalt or concrete with tack coat.',
  },
  'parking-lot': {
    id: 'parking-lot',
    name: 'Commercial Parking Lot',
    recommendedMaterialId: 'hma-dense',
    compactedThicknessInches: 4.0,
    looseThicknessInches: 5.0,
    recommendedBaseInches: 8.0,
    defaultWastePercent: 10,
    typicalUse: 'Commercial parking bays and access lanes; 2.5" base course + 1.5" surface course over 8" stone base.',
  },
  'millings-driveway': {
    id: 'millings-driveway',
    name: 'Recycled Millings Driveway (Budget/Rural)',
    recommendedMaterialId: 'millings',
    compactedThicknessInches: 4.0,
    looseThicknessInches: 5.0,
    recommendedBaseInches: 0,
    defaultWastePercent: 12,
    typicalUse: 'Farm lanes, rural driveways, and budget parking pads using crushed recycled asphalt pavement (RAP).',
  },
  'pothole-patch': {
    id: 'pothole-patch',
    name: 'Pothole Patch / Utility Cut',
    recommendedMaterialId: 'cold-patch',
    compactedThicknessInches: 2.0,
    looseThicknessInches: 2.5,
    recommendedBaseInches: 0,
    defaultWastePercent: 5,
    typicalUse: 'Localized emergency repair of potholes, trench settlements, and sunken joints using bagged cold patch.',
  },
};

export interface AsphaltSectionInput {
  id: string;
  name: string;
  shape: 'rectangle' | 'circle' | 'trapezoid' | 'triangle';
  length?: number;
  lengthUnit?: LengthUnit;
  width?: number; // For trapezoid: width 1 (e.g. road curb opening)
  width2?: number; // For trapezoid: width 2 (e.g. main driveway width for flared apron)
  widthUnit?: LengthUnit;
  diameter?: number;
  diameterUnit?: LengthUnit;
  compactedThicknessInches: number;
}

export interface AsphaltCalculationInput {
  inputMode: 'dimensions' | 'area' | 'tonnage';
  sections: AsphaltSectionInput[];
  // Area mode
  knownArea?: number;
  knownAreaUnit?: 'sqFt' | 'sqYards' | 'sqMeters';
  knownThicknessInches?: number;
  // Direct tonnage mode
  directTonnage?: number;
  // Material & Density
  materialId: AsphaltMaterialId;
  customDensityLbPerCuFt?: number;
  // Waste & Ordering
  wastePercent: number; // typically 5-10% order allowance
  supplierIncrementTons?: number; // e.g. round up to 0.25, 0.5, or 1.0 ton
  // Truckload planning
  truckCapacityTons?: number; // typical 14 tons tandem, 18-20 tons tri-axle
  // Optional 2nd lift (binder + surface)
  hasTwoLifts?: boolean;
  binderThicknessInches?: number;
  surfaceThicknessInches?: number;
  // Optional Gravel Base
  includeGravelBase?: boolean;
  gravelBaseDepthInches?: number;
  // Cost inputs (optional)
  pricePerTon?: number;
  deliveryFeePerTruckload?: number;
  flatDeliveryFee?: number;
  baseCostPerSqFt?: number;
  pavingLaborCostPerSqFt?: number;
  tackCoatCostPerSqFt?: number;
  excavationRemovalCostPerSqFt?: number;
  taxRatePercent?: number;
}

export interface AsphaltSectionBreakdown {
  id: string;
  name: string;
  areaSqFt: number;
  areaSqYards: number;
  netCuFt: number;
  netCuYds: number;
  netTons: number;
  orderTons: number;
}

export interface AsphaltCalculationResult {
  // Area
  totalAreaSqFt: number;
  totalAreaSqYards: number;
  totalAreaSqMeters: number;
  sectionBreakdown: AsphaltSectionBreakdown[];

  // Thickness
  averageCompactedThicknessInches: number;
  estimatedLooseThicknessInches: number; // 1.25x screed laydown thickness

  // Compacted Volume
  compactedVolumeCuFt: number;
  compactedVolumeCuYds: number;
  compactedVolumeCuMeters: number;

  // Density & Material
  activeMaterial: AsphaltMaterialProfile;
  densityLbPerCuFt: number;
  densityLbsPerCuYd: number;
  densityTonsPerCuYd: number;
  densityKgPerCuMeter: number;
  lbsPerSqYdPerInch: number;

  // Sensitivity Range (low to high based on ASTM/FHWA density bounds)
  densityRangeMinTons: number;
  densityRangeMaxTons: number;

  // Weight & Tonnage (Separating Net from Order)
  wastePercent: number;
  netTons: number; // US Short Tons (2,000 lbs)
  orderTons: number; // After waste allowance
  billedTons: number; // After supplier order increment rounding
  totalPounds: number;
  totalMetricTonnes: number; // 1,000 kg
  totalKilograms: number;

  // Coverage
  coverageSqFtPerTon: number;
  coverageSqYardsPerTon: number;

  // Truckloads
  truckCapacityTons: number;
  truckloadsNeeded: number;
  lastTruckloadTons: number;
  unusedTruckCapacityTons: number;

  // Cold patch alternative (if small patch)
  coldPatch50lbBagsNeeded: number;

  // Optional Gravel Base Layer
  gravelBaseVolumeCuYds: number;
  gravelBaseTons: number;

  // Optional Two-Lift Breakdown
  liftBreakdown?: {
    binderTons: number;
    surfaceTons: number;
    binderThickness: number;
    surfaceThickness: number;
  };

  // Cost Breakdown
  hasCostData: boolean;
  asphaltMaterialCost: number;
  truckingDeliveryCost: number;
  baseMaterialCost: number;
  pavingLaborCost: number;
  tackCoatCost: number;
  excavationRemovalCost: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  costPerSqFt: number;
  costPerSqYard: number;

  assumptions: string[];
}

/**
 * Pure deterministic calculation engine for Asphalt Tonnage, Volume, Millings & Cost.
 */
export function calculateAsphalt(input: AsphaltCalculationInput): AsphaltCalculationResult {
  let totalAreaSqFt = 0;
  let netCuFt = 0;
  const sectionBreakdown: AsphaltSectionBreakdown[] = [];

  // 1. Resolve Active Material & Density
  const baseProfile = ASPHALT_PROFILES[input.materialId] ?? ASPHALT_PROFILES['hma-dense'];
  const densityLbPerCuFt =
    input.materialId === 'custom' && input.customDensityLbPerCuFt && input.customDensityLbPerCuFt > 0
      ? input.customDensityLbPerCuFt
      : baseProfile.densityLbPerCuFt;

  const densityLbsPerCuYd = densityLbPerCuFt * CUBIC_FEET_PER_CUBIC_YARD; // 27
  const densityTonsPerCuYd = densityLbsPerCuYd / LBS_PER_US_TON;
  const densityKgPerCuMeter = (densityLbsPerCuYd * KG_PER_LB) / CUBIC_METERS_PER_CUBIC_YARD;
  const lbsPerSqYdPerInch = (densityLbPerCuFt / 12) * 9;

  const wastePercent = Math.max(0, input.wastePercent ?? 0);
  const wasteMultiplier = 1 + wastePercent / 100;

  // 2. Geometry & Section Calculations
  if (input.inputMode === 'dimensions') {
    for (const sec of input.sections) {
      let areaSqFt = 0;
      const thickInches = Math.max(0, sec.compactedThicknessInches ?? 2.5);

      if (sec.shape === 'circle') {
        const diaFt = Math.max(0, toFeet(sec.diameter ?? 0, sec.diameterUnit ?? 'feet'));
        const radiusFt = diaFt / 2;
        areaSqFt = Math.PI * radiusFt * radiusFt;
      } else if (sec.shape === 'trapezoid') {
        // Flared driveway apron: average of top width and bottom width * length
        const lengthFt = Math.max(0, toFeet(sec.length ?? 0, sec.lengthUnit ?? 'feet'));
        const w1Ft = Math.max(0, toFeet(sec.width ?? 0, sec.widthUnit ?? 'feet'));
        const w2Ft = Math.max(0, toFeet(sec.width2 ?? sec.width ?? 0, sec.widthUnit ?? 'feet'));
        areaSqFt = lengthFt * ((w1Ft + w2Ft) / 2);
      } else if (sec.shape === 'triangle') {
        const baseFt = Math.max(0, toFeet(sec.width ?? 0, sec.widthUnit ?? 'feet'));
        const heightFt = Math.max(0, toFeet(sec.length ?? 0, sec.lengthUnit ?? 'feet'));
        areaSqFt = (baseFt * heightFt) / 2;
      } else {
        // Default rectangle
        const lengthFt = Math.max(0, toFeet(sec.length ?? 0, sec.lengthUnit ?? 'feet'));
        const widthFt = Math.max(0, toFeet(sec.width ?? 0, sec.widthUnit ?? 'feet'));
        areaSqFt = lengthFt * widthFt;
      }

      const secCuFt = areaSqFt * (thickInches / 12);
      const secCuYd = secCuFt / CUBIC_FEET_PER_CUBIC_YARD;
      const secTons = (secCuFt * densityLbPerCuFt) / LBS_PER_US_TON;
      const secOrderTons = secTons * wasteMultiplier;

      totalAreaSqFt += areaSqFt;
      netCuFt += secCuFt;

      sectionBreakdown.push({
        id: sec.id,
        name: sec.name || 'Paving Section',
        areaSqFt,
        areaSqYards: areaSqFt / 9,
        netCuFt: secCuFt,
        netCuYds: secCuYd,
        netTons: secTons,
        orderTons: secOrderTons,
      });
    }
  } else if (input.inputMode === 'area') {
    const rawArea = Math.max(0, input.knownArea ?? 0);
    const unit = input.knownAreaUnit ?? 'sqFt';
    if (unit === 'sqFt') {
      totalAreaSqFt = rawArea;
    } else if (unit === 'sqYards') {
      totalAreaSqFt = rawArea * 9;
    } else if (unit === 'sqMeters') {
      totalAreaSqFt = rawArea * 10.76391041671;
    }

    const thickInches = Math.max(0, input.knownThicknessInches ?? 2.5);
    netCuFt = totalAreaSqFt * (thickInches / 12);

    const secTons = (netCuFt * densityLbPerCuFt) / LBS_PER_US_TON;
    sectionBreakdown.push({
      id: 'known-area',
      name: 'Specified Surface Area',
      areaSqFt: totalAreaSqFt,
      areaSqYards: totalAreaSqFt / 9,
      netCuFt,
      netCuYds: netCuFt / CUBIC_FEET_PER_CUBIC_YARD,
      netTons: secTons,
      orderTons: secTons * wasteMultiplier,
    });
  } else if (input.inputMode === 'tonnage') {
    const directTons = Math.max(0, input.directTonnage ?? 0);
    // Reverse calculate volume from tons: netCuFt = (tons * 2000) / densityLbPerCuFt
    netCuFt = (directTons * LBS_PER_US_TON) / densityLbPerCuFt;
    // Assume standard 2.5 inch thickness to infer area if needed
    const inferredThickness = 2.5;
    totalAreaSqFt = (netCuFt * 12) / inferredThickness;

    sectionBreakdown.push({
      id: 'direct-tonnage',
      name: 'Direct Specified Tonnage',
      areaSqFt: totalAreaSqFt,
      areaSqYards: totalAreaSqFt / 9,
      netCuFt,
      netCuYds: netCuFt / CUBIC_FEET_PER_CUBIC_YARD,
      netTons: directTons,
      orderTons: directTons * wasteMultiplier,
    });
  }

  const totalAreaSqYards = totalAreaSqFt / 9;
  const totalAreaSqMeters = totalAreaSqFt * 0.092903;

  const compactedVolumeCuFt = netCuFt;
  const compactedVolumeCuYds = compactedVolumeCuFt / CUBIC_FEET_PER_CUBIC_YARD;
  const compactedVolumeCuMeters = compactedVolumeCuYds * CUBIC_METERS_PER_CUBIC_YARD;

  // Average compacted thickness across the job
  const averageCompactedThicknessInches = totalAreaSqFt > 0 ? (compactedVolumeCuFt * 12) / totalAreaSqFt : 2.5;
  // Loose thickness is approx 1.25x compacted thickness
  const estimatedLooseThicknessInches = averageCompactedThicknessInches * 1.25;

  // 3. Weight & Tonnage
  const netTons =
    input.inputMode === 'tonnage' && input.directTonnage !== undefined
      ? input.directTonnage
      : (compactedVolumeCuFt * densityLbPerCuFt) / LBS_PER_US_TON;
  const orderTons = netTons * wasteMultiplier;

  // Supplier increment rounding (if specified, e.g. 0.25, 0.5, or 1.0 ton)
  const increment = input.supplierIncrementTons && input.supplierIncrementTons > 0 ? input.supplierIncrementTons : 0;
  const billedTons = increment > 0 && orderTons > 0 ? Math.ceil(orderTons / increment) * increment : orderTons;

  const totalPounds = billedTons * LBS_PER_US_TON;
  const totalKilograms = totalPounds * KG_PER_LB;
  const totalMetricTonnes = totalKilograms / 1000;

  // 4. Sensitivity Range (using min and max bounds for mix type)
  const [minDensity, maxDensity] = baseProfile.densityRangeLbPerCuFt;
  const densityRangeMinTons = ((compactedVolumeCuFt * minDensity) / LBS_PER_US_TON) * wasteMultiplier;
  const densityRangeMaxTons = ((compactedVolumeCuFt * maxDensity) / LBS_PER_US_TON) * wasteMultiplier;

  // 5. Coverage Rates
  // At average thickness, how many sq ft does 1 ton cover?
  // 1 ton = 2000 lbs. Cu ft = 2000 / density. Sq ft = cu ft * (12 / thickness)
  const coverageSqFtPerTon =
    averageCompactedThicknessInches > 0 && densityLbPerCuFt > 0
      ? (LBS_PER_US_TON / densityLbPerCuFt) * (12 / averageCompactedThicknessInches)
      : 0;
  const coverageSqYardsPerTon = coverageSqFtPerTon / 9;

  // 6. Truckload Planning
  const truckCapacityTons = input.truckCapacityTons && input.truckCapacityTons > 0 ? input.truckCapacityTons : 14.0;
  const truckloadsNeeded = billedTons > 0 ? Math.ceil(billedTons / truckCapacityTons) : 0;
  const rawRemainder = billedTons > 0 ? billedTons % truckCapacityTons : 0;
  const remainderTons = Math.abs(rawRemainder) < 0.001 || Math.abs(rawRemainder - truckCapacityTons) < 0.001 ? 0 : rawRemainder;
  const lastTruckloadTons = truckloadsNeeded > 0 ? (remainderTons === 0 ? truckCapacityTons : remainderTons) : 0;
  const unusedTruckCapacityTons = truckloadsNeeded > 0 ? truckCapacityTons - lastTruckloadTons : 0;

  // 7. Cold patch 50 lb bags equivalent
  // 1 bag = 50 lbs = ~0.42 cu ft
  const coldPatch50lbBagsNeeded = compactedVolumeCuFt > 0 ? Math.ceil(compactedVolumeCuFt / 0.42) : 0;

  // 8. Optional Gravel Base Layer
  let gravelBaseVolumeCuYds = 0;
  let gravelBaseTons = 0;
  if (input.includeGravelBase && input.gravelBaseDepthInches && input.gravelBaseDepthInches > 0 && totalAreaSqFt > 0) {
    const baseCuFt = totalAreaSqFt * (input.gravelBaseDepthInches / 12);
    // Crushed stone base typically 1.35 tons/cu yd (2,700 lb/yd³) with 10% compaction
    gravelBaseVolumeCuYds = (baseCuFt / CUBIC_FEET_PER_CUBIC_YARD) * 1.10;
    gravelBaseTons = gravelBaseVolumeCuYds * 1.35;
  }

  // 9. Optional Two-Lift Breakdown
  let liftBreakdown: AsphaltCalculationResult['liftBreakdown'] = undefined;
  if (input.hasTwoLifts && input.binderThicknessInches && input.surfaceThicknessInches && totalAreaSqFt > 0) {
    const binderT = input.binderThicknessInches;
    const surfaceT = input.surfaceThicknessInches;
    // Binder course: 147 lb/ft³
    const binderCuFt = totalAreaSqFt * (binderT / 12);
    const binderTons = ((binderCuFt * 147.0) / LBS_PER_US_TON) * wasteMultiplier;
    // Surface course: 143 lb/ft³
    const surfaceCuFt = totalAreaSqFt * (surfaceT / 12);
    const surfaceTons = ((surfaceCuFt * 143.0) / LBS_PER_US_TON) * wasteMultiplier;

    liftBreakdown = {
      binderTons,
      surfaceTons,
      binderThickness: binderT,
      surfaceThickness: surfaceT,
    };
  }

  // 10. Cost & Budget Estimation
  let asphaltMaterialCost = 0;
  if (input.pricePerTon && input.pricePerTon > 0 && billedTons > 0) {
    asphaltMaterialCost = billedTons * input.pricePerTon;
  }

  let truckingDeliveryCost = 0;
  if (input.deliveryFeePerTruckload && input.deliveryFeePerTruckload > 0) {
    truckingDeliveryCost += truckloadsNeeded * input.deliveryFeePerTruckload;
  }
  if (input.flatDeliveryFee && input.flatDeliveryFee > 0) {
    truckingDeliveryCost += input.flatDeliveryFee;
  }

  let baseMaterialCost = 0;
  if (input.baseCostPerSqFt && input.baseCostPerSqFt > 0 && totalAreaSqFt > 0) {
    baseMaterialCost = totalAreaSqFt * input.baseCostPerSqFt;
  }

  let pavingLaborCost = 0;
  if (input.pavingLaborCostPerSqFt && input.pavingLaborCostPerSqFt > 0 && totalAreaSqFt > 0) {
    pavingLaborCost = totalAreaSqFt * input.pavingLaborCostPerSqFt;
  }

  let tackCoatCost = 0;
  if (input.tackCoatCostPerSqFt && input.tackCoatCostPerSqFt > 0 && totalAreaSqFt > 0) {
    tackCoatCost = totalAreaSqFt * input.tackCoatCostPerSqFt;
  }

  let excavationRemovalCost = 0;
  if (input.excavationRemovalCostPerSqFt && input.excavationRemovalCostPerSqFt > 0 && totalAreaSqFt > 0) {
    excavationRemovalCost = totalAreaSqFt * input.excavationRemovalCostPerSqFt;
  }

  const subtotal =
    asphaltMaterialCost +
    truckingDeliveryCost +
    baseMaterialCost +
    pavingLaborCost +
    tackCoatCost +
    excavationRemovalCost;

  const taxRate = input.taxRatePercent && input.taxRatePercent > 0 ? input.taxRatePercent : 0;
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount;
  const costPerSqFt = totalAreaSqFt > 0 && grandTotal > 0 ? grandTotal / totalAreaSqFt : 0;
  const costPerSqYard = totalAreaSqYards > 0 && grandTotal > 0 ? grandTotal / totalAreaSqYards : 0;
  const hasCostData = grandTotal > 0;

  // 11. Engineering Notes & Assumptions
  const assumptions: string[] = [
    `Calculated using finished roller-compacted thickness (${averageCompactedThicknessInches.toFixed(2)}") at ${densityLbPerCuFt.toFixed(1)} lb/ft³ in-place bulk density (${densityTonsPerCuYd.toFixed(2)} tons/yd³).`,
    `Reference Standard: ${baseProfile.densitySource} (${baseProfile.standardReference}).`,
    `Loose screed laydown thickness is estimated at ~${estimatedLooseThicknessInches.toFixed(2)}" (~25% roller compaction reduction).`,
    `Order quantity includes ${wastePercent}% contingency for subgrade undulations and edge slope (${orderTons.toFixed(2)} tons).`,
    `Standard paving coverage factor: ~${lbsPerSqYdPerInch.toFixed(1)} lbs per square yard per inch of compacted thickness.`,
    `Truckload dispatch: ${truckloadsNeeded} load(s) based on ${truckCapacityTons}-ton legal payload capacity.`,
  ];

  return {
    totalAreaSqFt,
    totalAreaSqYards,
    totalAreaSqMeters,
    sectionBreakdown,
    averageCompactedThicknessInches,
    estimatedLooseThicknessInches,
    compactedVolumeCuFt,
    compactedVolumeCuYds,
    compactedVolumeCuMeters,
    activeMaterial: baseProfile,
    densityLbPerCuFt,
    densityLbsPerCuYd,
    densityTonsPerCuYd,
    densityKgPerCuMeter,
    lbsPerSqYdPerInch,
    densityRangeMinTons,
    densityRangeMaxTons,
    wastePercent,
    netTons,
    orderTons,
    billedTons,
    totalPounds,
    totalMetricTonnes,
    totalKilograms,
    coverageSqFtPerTon,
    coverageSqYardsPerTon,
    truckCapacityTons,
    truckloadsNeeded,
    lastTruckloadTons,
    unusedTruckCapacityTons,
    coldPatch50lbBagsNeeded,
    gravelBaseVolumeCuYds,
    gravelBaseTons,
    liftBreakdown,
    hasCostData,
    asphaltMaterialCost,
    truckingDeliveryCost,
    baseMaterialCost,
    pavingLaborCost,
    tackCoatCost,
    excavationRemovalCost,
    subtotal,
    taxAmount,
    grandTotal,
    costPerSqFt,
    costPerSqYard,
    assumptions,
  };
}

/**
 * Reversible conversion helper: tonnage to coverage OR coverage to tonnage.
 */
export function convertAsphaltTonnageCoverage(params: {
  tons?: number;
  sqFt?: number;
  thicknessInches?: number;
  densityLbPerCuFt?: number;
}): { tons: number; sqFt: number; sqYards: number; cuYds: number; metricTonnes: number } {
  const density = params.densityLbPerCuFt && params.densityLbPerCuFt > 0 ? params.densityLbPerCuFt : 145.0;
  const thick = params.thicknessInches && params.thicknessInches > 0 ? params.thicknessInches : 2.5;

  if (params.tons !== undefined && params.tons >= 0) {
    const tons = params.tons;
    const lbs = tons * LBS_PER_US_TON;
    const cuFt = lbs / density;
    const sqFt = (cuFt * 12) / thick;
    const cuYds = cuFt / CUBIC_FEET_PER_CUBIC_YARD;
    const metricTonnes = (lbs * KG_PER_LB) / 1000;
    return { tons, sqFt, sqYards: sqFt / 9, cuYds, metricTonnes };
  }

  if (params.sqFt !== undefined && params.sqFt >= 0) {
    const sqFt = params.sqFt;
    const cuFt = sqFt * (thick / 12);
    const lbs = cuFt * density;
    const tons = lbs / LBS_PER_US_TON;
    const cuYds = cuFt / CUBIC_FEET_PER_CUBIC_YARD;
    const metricTonnes = (lbs * KG_PER_LB) / 1000;
    return { tons, sqFt, sqYards: sqFt / 9, cuYds, metricTonnes };
  }

  return { tons: 0, sqFt: 0, sqYards: 0, cuYds: 0, metricTonnes: 0 };
}
