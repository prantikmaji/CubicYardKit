import { toFeet, CUBIC_FEET_PER_CUBIC_YARD, LBS_PER_US_TON } from './units';
import type { LengthUnit } from './units';
import { MATERIALS } from '../../data/materials';

export interface TopsoilCalculationInput {
  inputMode: 'dimensions' | 'area';
  length?: number;
  lengthUnit?: LengthUnit;
  width?: number;
  widthUnit?: LengthUnit;
  areaSqFt?: number;
  depthInches: number;
  wastePercent: number; // settling / compaction allowance, typically 10%
  customDensityLbsPerCuYd?: number;
  unitPrice?: number;
  pricePerUnit?: 'cubic_yard' | 'bag';
  selectedBagSizeCuFt?: number;
  deliveryFee?: number;
}

export interface TopsoilCalculationResult {
  areaSqFt: number;
  depthInches: number;
  cubicFeet: number;
  cubicYards: number;
  wastePercent: number;
  wasteAdjustedCubicFeet: number;
  wasteAdjustedCubicYards: number;
  densityLbsPerCuYd: number;
  totalPounds: number;
  totalTons: number;
  bags075CuFt: number; // 0.75 cu ft bags
  bags100CuFt: number; // 1.0 cu ft bags
  bags150CuFt: number; // 1.5 cu ft bags
  selectedBagCount: number;
  materialCost: number;
  deliveryFee: number;
  totalCost: number;
  coverageRules: {
    sqFtAt1Inch: number;
    sqFtAt2Inches: number;
    sqFtAt3Inches: number;
    sqFtAt4Inches: number;
  };
}

export function calculateTopsoil(input: TopsoilCalculationInput): TopsoilCalculationResult {
  let areaSqFt = 0;
  if (input.inputMode === 'area') {
    areaSqFt = Math.max(0, input.areaSqFt ?? 0);
  } else {
    const l = Math.max(0, toFeet(input.length ?? 0, input.lengthUnit ?? 'feet'));
    const w = Math.max(0, toFeet(input.width ?? 0, input.widthUnit ?? 'feet'));
    areaSqFt = l * w;
  }

  const depthFeet = Math.max(0, input.depthInches / 12);
  const cubicFeet = areaSqFt * depthFeet;
  const cubicYards = cubicFeet / CUBIC_FEET_PER_CUBIC_YARD;

  const waste = Math.max(0, input.wastePercent);
  const multiplier = 1 + waste / 100;
  const wasteAdjustedCubicFeet = cubicFeet * multiplier;
  const wasteAdjustedCubicYards = cubicYards * multiplier;

  const density =
    input.customDensityLbsPerCuYd && input.customDensityLbsPerCuYd > 0
      ? input.customDensityLbsPerCuYd
      : MATERIALS['screened-topsoil'].densityLbsPerCuYd ?? 2100;

  const totalPounds = wasteAdjustedCubicYards * density;
  const totalTons = totalPounds / LBS_PER_US_TON;

  const bags075CuFt = Math.ceil(wasteAdjustedCubicFeet / 0.75);
  const bags100CuFt = Math.ceil(wasteAdjustedCubicFeet / 1.0);
  const bags150CuFt = Math.ceil(wasteAdjustedCubicFeet / 1.5);

  const selectedSize = input.selectedBagSizeCuFt ?? 1.0;
  const selectedBagCount = Math.ceil(wasteAdjustedCubicFeet / selectedSize);

  let materialCost = 0;
  if (input.unitPrice && input.unitPrice > 0) {
    if (input.pricePerUnit === 'cubic_yard') {
      materialCost = wasteAdjustedCubicYards * input.unitPrice;
    } else if (input.pricePerUnit === 'bag') {
      materialCost = selectedBagCount * input.unitPrice;
    }
  }

  const deliveryFee = input.deliveryFee ?? 0;
  const totalCost = materialCost > 0 ? materialCost + deliveryFee : 0;

  // 1 cu yd = 27 cu ft. At 1 inch depth (1/12 ft), 1 cu yd covers 27 * 12 = 324 sq ft.
  const coverageRules = {
    sqFtAt1Inch: wasteAdjustedCubicYards * 324,
    sqFtAt2Inches: (wasteAdjustedCubicYards * 324) / 2,
    sqFtAt3Inches: (wasteAdjustedCubicYards * 324) / 3,
    sqFtAt4Inches: (wasteAdjustedCubicYards * 324) / 4,
  };

  return {
    areaSqFt,
    depthInches: input.depthInches,
    cubicFeet,
    cubicYards,
    wastePercent: waste,
    wasteAdjustedCubicFeet,
    wasteAdjustedCubicYards,
    densityLbsPerCuYd: density,
    totalPounds,
    totalTons,
    bags075CuFt,
    bags100CuFt,
    bags150CuFt,
    selectedBagCount,
    materialCost,
    deliveryFee,
    totalCost,
    coverageRules,
  };
}
