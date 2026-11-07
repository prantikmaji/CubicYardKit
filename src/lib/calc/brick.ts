import { toFeet, CUBIC_FEET_PER_CUBIC_YARD } from './units';

export type BrickUnit = 'feet' | 'inches' | 'meters' | 'centimeters';

export interface BrickPreset {
  id: string;
  name: string;
  region: string;
  standard: string;
  lengthInches: number;
  widthInches: number; // depth into wall
  heightInches: number;
  defaultJointInches: number;
  defaultPackSize: number;
}

export const BRICK_PRESETS: Record<string, BrickPreset> = {
  'us-modular': {
    id: 'us-modular',
    name: 'US Modular (Standard)',
    region: 'United States',
    standard: 'ASTM C216 / C652',
    lengthInches: 7.625, // 7 5/8"
    widthInches: 3.625,  // 3 5/8"
    heightInches: 2.25,  // 2 1/4"
    defaultJointInches: 0.375, // 3/8"
    defaultPackSize: 500, // standard US cube strap
  },
  'us-standard': {
    id: 'us-standard',
    name: 'US Standard / Common',
    region: 'United States',
    standard: 'ASTM C216',
    lengthInches: 8.0,
    widthInches: 3.75, // 3 3/4"
    heightInches: 2.25, // 2 1/4"
    defaultJointInches: 0.375,
    defaultPackSize: 500,
  },
  'us-king': {
    id: 'us-king',
    name: 'US King Size',
    region: 'United States',
    standard: 'ASTM C216 / C652',
    lengthInches: 9.625, // 9 5/8"
    widthInches: 2.625,  // 2 5/8"
    heightInches: 2.625,  // 2 5/8"
    defaultJointInches: 0.375,
    defaultPackSize: 400,
  },
  'us-queen': {
    id: 'us-queen',
    name: 'US Queen Size',
    region: 'United States',
    standard: 'ASTM C216 / C652',
    lengthInches: 7.625,
    widthInches: 2.75, // 2 3/4"
    heightInches: 2.75, // 2 3/4"
    defaultJointInches: 0.375,
    defaultPackSize: 500,
  },
  'uk-standard': {
    id: 'uk-standard',
    name: 'UK Standard (215×102.5×65 mm)',
    region: 'United Kingdom',
    standard: 'BS EN 771-1',
    lengthInches: 8.465, // 215 mm
    widthInches: 4.035,  // 102.5 mm
    heightInches: 2.559, // 65 mm
    defaultJointInches: 0.394, // 10 mm
    defaultPackSize: 400,
  },
  'au-standard': {
    id: 'au-standard',
    name: 'Australian Standard (230×110×76 mm)',
    region: 'Australia',
    standard: 'AS 4455',
    lengthInches: 9.055, // 230 mm
    widthInches: 4.331,  // 110 mm
    heightInches: 2.992, // 76 mm
    defaultJointInches: 0.394, // 10 mm
    defaultPackSize: 400,
  },
  'in-modular': {
    id: 'in-modular',
    name: 'Indian Modular (190×90×90 mm)',
    region: 'India',
    standard: 'IS 1077:1992',
    lengthInches: 7.480, // 190 mm
    widthInches: 3.543,  // 90 mm
    heightInches: 3.543, // 90 mm
    defaultJointInches: 0.394, // 10 mm
    defaultPackSize: 500,
  },
  'in-traditional': {
    id: 'in-traditional',
    name: 'Indian Traditional (9×4.5×3 in)',
    region: 'India',
    standard: 'IS 2212:1991',
    lengthInches: 9.0,
    widthInches: 4.5,
    heightInches: 3.0,
    defaultJointInches: 0.394, // 10 mm
    defaultPackSize: 500,
  },
};

export interface WallOpeningInput {
  id: string;
  label: string; // e.g. "Window 1", "Front Door"
  width: number;
  widthUnit: BrickUnit;
  height: number;
  heightUnit: BrickUnit;
  count: number;
}

export interface BrickWallInput {
  id: string;
  name: string;
  length: number;
  lengthUnit: BrickUnit;
  height: number;
  heightUnit: BrickUnit;
  wythes: 1 | 2; // 1 = Single wythe (half-brick / veneer); 2 = Double wythe (full-brick solid)
  openings: WallOpeningInput[];
}

export interface BrickWallResult {
  id: string;
  name: string;
  grossAreaSqFt: number;
  openingsAreaSqFt: number;
  netAreaSqFt: number;
  netMasonryVolumeCuFt: number;
  wythes: number;
  theoreticalBricks: number;
  orderBricks: number;
}

export interface BrickCalculationInput {
  walls: BrickWallInput[];
  presetId: string; // 'us-modular' | 'custom' | etc.
  customDimensions?: {
    lengthInches: number;
    widthInches: number;
    heightInches: number;
  };
  jointThicknessInches: number; // default 0.375 (3/8")
  wastePercent: number; // default 10%
  mortarLossPercent: number; // default 10%
  packSize?: number; // default 500

  // Mortar mix split
  mortarMixRatio: '1:3' | '1:4' | '1:5' | '1:6'; // Type M (1:3), Type S (1:4), Type N (1:5), Type O (1:6)
  dryVolumeFactor?: number; // default 1.33 (industry standard volume expansion)
  cementBagWeightLbs?: number; // default 94 lbs (1.0 cu ft loose Portland)
  sandDensityLbsPerCuFt?: number; // default 100 lbs/cu ft

  // Cost items (optional)
  pricePerBrick?: number | null;
  pricePerThousand?: number | null;
  pricePerPremixMortarBag?: number | null; // 80-lb bag
  pricePerCementBag?: number | null;
  pricePerTonSand?: number | null;
  laborCostPerSqFt?: number | null;
  wallTiesCost?: number | null;
  deliveryFee?: number | null;
  taxPercent?: number | null;
  contingencyPercent?: number | null;
}

export interface BrickCalculationResult {
  preset: BrickPreset;
  brickDimensions: {
    lengthInches: number;
    widthInches: number;
    heightInches: number;
    jointThicknessInches: number;
  };
  walls: BrickWallResult[];

  // Area & Volume Totals
  totalGrossAreaSqFt: number;
  totalOpeningsAreaSqFt: number;
  totalNetAreaSqFt: number;
  totalMasonryVolumeCuFt: number;
  totalMasonryVolumeCuYd: number;

  // Brick Quantities
  bricksPerSqFtSingleWythe: number;
  theoreticalBricks: number;
  orderBricks: number;
  packsNeeded: number;
  packSize: number;

  // Mortar Breakdown
  wetMortarVolumeCuFt: number;
  wetMortarVolumeCuYd: number;
  dryMortarVolumeCuFt: number;
  cementParts: number;
  sandParts: number;
  cementVolumeCuFt: number;
  cementWeightLbs: number;
  cementBags94lb: number;
  sandVolumeCuFt: number;
  sandVolumeCuYd: number;
  sandWeightTons: number;
  premixMortarBags80lb: number; // convenient ready-mix dry mortar alternative

  // Cost Breakdown
  brickSubtotal: number;
  mortarSubtotal: number;
  laborSubtotal: number;
  wallTiesSubtotal: number;
  deliverySubtotal: number;
  subtotalBeforeTax: number;
  taxSubtotal: number;
  contingencySubtotal: number;
  grandTotal: number;
  costPerSqFt: number | null;
  hasCostData: boolean;
  missingPriceKeys: string[];
}

export function calculateBricks(input: BrickCalculationInput): BrickCalculationResult {
  // Resolve brick dimensions
  let preset: BrickPreset;
  if (input.presetId !== 'custom' && BRICK_PRESETS[input.presetId]) {
    preset = BRICK_PRESETS[input.presetId];
  } else {
    preset = {
      id: 'custom',
      name: 'Custom Brick Size',
      region: 'Custom',
      standard: 'User Specified',
      lengthInches: input.customDimensions?.lengthInches ?? 8.0,
      widthInches: input.customDimensions?.widthInches ?? 3.75,
      heightInches: input.customDimensions?.heightInches ?? 2.25,
      defaultJointInches: input.jointThicknessInches ?? 0.375,
      defaultPackSize: input.packSize ?? 500,
    };
  }

  const lengthIn = preset.id === 'custom' ? (input.customDimensions?.lengthInches ?? 8.0) : preset.lengthInches;
  const widthIn = preset.id === 'custom' ? (input.customDimensions?.widthInches ?? 3.75) : preset.widthInches;
  const heightIn = preset.id === 'custom' ? (input.customDimensions?.heightInches ?? 2.25) : preset.heightInches;
  const jointIn = Math.max(0, input.jointThicknessInches ?? preset.defaultJointInches);
  const packSize = Math.max(1, input.packSize ?? preset.defaultPackSize);

  // Face module dimensions including mortar joint
  const moduleLengthIn = lengthIn + jointIn;
  const moduleHeightIn = heightIn + jointIn;
  const faceModuleSqIn = moduleLengthIn * moduleHeightIn;

  // Bricks per sq ft of wall surface area for single wythe
  // 144 sq in per sq ft
  const bricksPerSqFtSingleWythe = faceModuleSqIn > 0 ? 144 / faceModuleSqIn : 0;

  // Single brick actual solid volume in cubic feet
  const singleBrickVolumeCuFt = (lengthIn * widthIn * heightIn) / 1728;

  let totalGrossAreaSqFt = 0;
  let totalOpeningsAreaSqFt = 0;
  let totalNetAreaSqFt = 0;
  let totalMasonryVolumeCuFt = 0;
  let totalTheoreticalBricks = 0;

  const wallsResult: BrickWallResult[] = [];

  for (const w of input.walls) {
    const lengthFt = toFeet(w.length, w.lengthUnit);
    const heightFt = toFeet(w.height, w.heightUnit);
    const grossArea = lengthFt * heightFt;

    let openingsArea = 0;
    if (w.openings && w.openings.length > 0) {
      for (const op of w.openings) {
        const opW = toFeet(op.width, op.widthUnit);
        const opH = toFeet(op.height, op.heightUnit);
        const count = Math.max(1, op.count || 1);
        openingsArea += opW * opH * count;
      }
    }

    const netArea = Math.max(0, grossArea - openingsArea);
    const wytheMultiplier = w.wythes === 2 ? 2 : 1;

    // Wall thickness in feet
    // Single wythe = widthIn; Double wythe = 2 * widthIn + jointIn
    const wallThicknessIn = w.wythes === 2 ? widthIn * 2 + jointIn : widthIn;
    const wallVolumeCuFt = netArea * (wallThicknessIn / 12);

    const wallTheoreticalBricks = netArea * bricksPerSqFtSingleWythe * wytheMultiplier;
    const wasteFactor = 1 + Math.max(0, input.wastePercent) / 100;
    const wallOrderBricks = Math.ceil(wallTheoreticalBricks * wasteFactor);

    wallsResult.push({
      id: w.id,
      name: w.name,
      grossAreaSqFt: grossArea,
      openingsAreaSqFt: openingsArea,
      netAreaSqFt: netArea,
      netMasonryVolumeCuFt: wallVolumeCuFt,
      wythes: wytheMultiplier,
      theoreticalBricks: Math.round(wallTheoreticalBricks),
      orderBricks: wallOrderBricks,
    });

    totalGrossAreaSqFt += grossArea;
    totalOpeningsAreaSqFt += openingsArea;
    totalNetAreaSqFt += netArea;
    totalMasonryVolumeCuFt += wallVolumeCuFt;
    totalTheoreticalBricks += wallTheoreticalBricks;
  }

  const wastePercent = Math.max(0, input.wastePercent ?? 10);
  const orderBricks = Math.ceil(totalTheoreticalBricks * (1 + wastePercent / 100));
  const packsNeeded = Math.ceil(orderBricks / packSize);
  const totalMasonryVolumeCuYd = totalMasonryVolumeCuFt / CUBIC_FEET_PER_CUBIC_YARD;

  // Mortar calculations
  // Actual total brick solid volume in cubic feet
  const totalSolidBricksVolumeCuFt = totalTheoreticalBricks * singleBrickVolumeCuFt;

  // Wet mortar void is masonry volume minus actual brick volume
  const rawWetMortarCuFt = Math.max(0, totalMasonryVolumeCuFt - totalSolidBricksVolumeCuFt);

  // Apply mortar loss / waste allowance (default 10%)
  const mortarLossFactor = 1 + Math.max(0, input.mortarLossPercent ?? 10) / 100;
  const wetMortarVolumeCuFt = rawWetMortarCuFt * mortarLossFactor;
  const wetMortarVolumeCuYd = wetMortarVolumeCuFt / CUBIC_FEET_PER_CUBIC_YARD;

  // Dry mortar volume factor: dry sand + dry cement shrink by ~33% when mixed with water
  const dryFactor = input.dryVolumeFactor ?? 1.33;
  const dryMortarVolumeCuFt = wetMortarVolumeCuFt * dryFactor;

  // Mortar mix parts (Cement : Sand)
  let cementParts = 1;
  let sandParts = 4; // default Type S (1:4)
  if (input.mortarMixRatio === '1:3') {
    cementParts = 1;
    sandParts = 3;
  } else if (input.mortarMixRatio === '1:4') {
    cementParts = 1;
    sandParts = 4;
  } else if (input.mortarMixRatio === '1:5') {
    cementParts = 1;
    sandParts = 5;
  } else if (input.mortarMixRatio === '1:6') {
    cementParts = 1;
    sandParts = 6;
  }

  const totalParts = cementParts + sandParts;
  const cementVolumeCuFt = totalParts > 0 ? (dryMortarVolumeCuFt * cementParts) / totalParts : 0;
  const sandVolumeCuFt = totalParts > 0 ? (dryMortarVolumeCuFt * sandParts) / totalParts : 0;

  // Portland cement bags (Standard US Portland cement bag = 94 lbs, which is exactly 1.0 cu ft loose!)
  const cementBagLbs = Math.max(1, input.cementBagWeightLbs ?? 94);
  const cementDensityLbsPerCuFt = 94; // Portland cement standard density
  const cementWeightLbs = cementVolumeCuFt * cementDensityLbsPerCuFt;
  const cementBags94lb = Math.ceil(cementWeightLbs / cementBagLbs);

  // Sand weight & volume
  const sandDensityLbsPerCuFt = input.sandDensityLbsPerCuFt ?? 100;
  const sandWeightLbs = sandVolumeCuFt * sandDensityLbsPerCuFt;
  const sandWeightTons = sandWeightLbs / 2000;
  const sandVolumeCuYd = sandVolumeCuFt / CUBIC_FEET_PER_CUBIC_YARD;

  // Alternative pre-mixed dry mortar bags (e.g. Quikrete / Sakrete 80-lb bag yields ~0.67 cu ft of wet mortar)
  const CUBIC_FEET_PER_80LB_MORTAR_BAG = 0.67;
  const premixMortarBags80lb = Math.ceil(wetMortarVolumeCuFt / CUBIC_FEET_PER_80LB_MORTAR_BAG);

  // Cost lines
  let brickSubtotal = 0;
  if (input.pricePerBrick && input.pricePerBrick > 0) {
    brickSubtotal = orderBricks * input.pricePerBrick;
  } else if (input.pricePerThousand && input.pricePerThousand > 0) {
    brickSubtotal = (orderBricks / 1000) * input.pricePerThousand;
  }

  let mortarSubtotal = 0;
  if (input.pricePerPremixMortarBag && input.pricePerPremixMortarBag > 0) {
    mortarSubtotal = premixMortarBags80lb * input.pricePerPremixMortarBag;
  } else {
    const cementCost = input.pricePerCementBag && input.pricePerCementBag > 0 ? cementBags94lb * input.pricePerCementBag : 0;
    const sandCost = input.pricePerTonSand && input.pricePerTonSand > 0 ? sandWeightTons * input.pricePerTonSand : 0;
    mortarSubtotal = cementCost + sandCost;
  }

  const laborSubtotal = input.laborCostPerSqFt && input.laborCostPerSqFt > 0 ? totalNetAreaSqFt * input.laborCostPerSqFt : 0;
  const wallTiesSubtotal = input.wallTiesCost && input.wallTiesCost > 0 ? input.wallTiesCost : 0;
  const deliverySubtotal = input.deliveryFee && input.deliveryFee > 0 ? input.deliveryFee : 0;

  const subtotalBeforeTax = brickSubtotal + mortarSubtotal + laborSubtotal + wallTiesSubtotal + deliverySubtotal;

  const taxSubtotal = input.taxPercent && input.taxPercent > 0 ? subtotalBeforeTax * (input.taxPercent / 100) : 0;
  const contingencySubtotal = input.contingencyPercent && input.contingencyPercent > 0 ? subtotalBeforeTax * (input.contingencyPercent / 100) : 0;

  const grandTotal = subtotalBeforeTax + taxSubtotal + contingencySubtotal;
  const hasCostData = grandTotal > 0;
  const costPerSqFt = hasCostData && totalNetAreaSqFt > 0 ? grandTotal / totalNetAreaSqFt : null;

  const missingPriceKeys: string[] = [];
  if (!input.pricePerBrick && !input.pricePerThousand) missingPriceKeys.push('bricks');
  if (!input.pricePerPremixMortarBag && !input.pricePerCementBag) missingPriceKeys.push('mortar');
  if (!input.laborCostPerSqFt) missingPriceKeys.push('labor');
  if (!input.deliveryFee) missingPriceKeys.push('delivery');

  return {
    preset,
    brickDimensions: {
      lengthInches: lengthIn,
      widthInches: widthIn,
      heightInches: heightIn,
      jointThicknessInches: jointIn,
    },
    walls: wallsResult,
    totalGrossAreaSqFt,
    totalOpeningsAreaSqFt,
    totalNetAreaSqFt,
    totalMasonryVolumeCuFt,
    totalMasonryVolumeCuYd,
    bricksPerSqFtSingleWythe,
    theoreticalBricks: Math.round(totalTheoreticalBricks),
    orderBricks,
    packsNeeded,
    packSize,
    wetMortarVolumeCuFt,
    wetMortarVolumeCuYd,
    dryMortarVolumeCuFt,
    cementParts,
    sandParts,
    cementVolumeCuFt,
    cementWeightLbs,
    cementBags94lb,
    sandVolumeCuFt,
    sandVolumeCuYd,
    sandWeightTons,
    premixMortarBags80lb,
    brickSubtotal,
    mortarSubtotal,
    laborSubtotal,
    wallTiesSubtotal,
    deliverySubtotal,
    subtotalBeforeTax,
    taxSubtotal,
    contingencySubtotal,
    grandTotal,
    costPerSqFt,
    hasCostData,
    missingPriceKeys,
  };
}

