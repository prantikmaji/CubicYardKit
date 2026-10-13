import { calculateRectangularVolume, calculateCircularVolume } from './geometry';
import type { VolumeResult } from './geometry';
import { LBS_PER_US_TON } from './units';
import type { LengthUnit } from './units';
import { MATERIALS } from '../../data/materials';

export interface GravelCalculationInput {
  shape: 'rectangle' | 'circle';
  length?: number;
  lengthUnit?: LengthUnit;
  width?: number;
  widthUnit?: LengthUnit;
  diameter?: number;
  diameterUnit?: LengthUnit;
  depth: number;
  depthUnit: LengthUnit;
  wastePercent: number;
  materialId?: string;
  customDensityLbsPerCuYd?: number;
  bagSizeCuFt?: number;
  unitPrice?: number;
  pricePerUnit?: 'cubic_yard' | 'ton' | 'bag';
  deliveryFee?: number;
}

export interface GravelCalculationResult extends VolumeResult {
  densityLbsPerCuYd: number;
  densityTonsPerCuYd: number;
  totalPounds: number;
  totalTons: number;
  bagSizeCuFt: number;
  bagsNeeded: number;
  estimatedTriAxleTruckloads: number; // typical 12-14 ton dump truck
  materialCost: number;
  deliveryFee: number;
  totalCost: number;
  densitySource: string;
}

export function calculateGravel(input: GravelCalculationInput): GravelCalculationResult {
  const volResult =
    input.shape === 'circle'
      ? calculateCircularVolume({
          diameter: input.diameter ?? 0,
          diameterUnit: input.diameterUnit ?? 'feet',
          depth: input.depth,
          depthUnit: input.depthUnit,
          wastePercent: input.wastePercent,
        })
      : calculateRectangularVolume({
          length: input.length ?? 0,
          lengthUnit: input.lengthUnit ?? 'feet',
          width: input.width ?? 0,
          widthUnit: input.widthUnit ?? 'feet',
          depth: input.depth,
          depthUnit: input.depthUnit,
          wastePercent: input.wastePercent,
        });

  const material = input.materialId ? MATERIALS[input.materialId] : MATERIALS['crushed-stone-base'];
  const densityLbsPerCuYd =
    input.customDensityLbsPerCuYd && input.customDensityLbsPerCuYd > 0
      ? input.customDensityLbsPerCuYd
      : material?.densityLbsPerCuYd ?? 2700;

  const densityTonsPerCuYd = densityLbsPerCuYd / LBS_PER_US_TON;
  const totalPounds = volResult.wasteAdjustedCubicYards * densityLbsPerCuYd;
  const totalTons = totalPounds / LBS_PER_US_TON;

  const bagSize = input.bagSizeCuFt && input.bagSizeCuFt > 0 ? input.bagSizeCuFt : 0.5;
  const bagsNeeded = Math.ceil(volResult.wasteAdjustedCubicFeet / bagSize);

  // Typical tri-axle dump truck carries ~14 tons
  const estimatedTriAxleTruckloads = totalTons > 0 ? Math.ceil(totalTons / 14) : 0;

  let materialCost = 0;
  if (input.unitPrice && input.unitPrice > 0) {
    if (input.pricePerUnit === 'cubic_yard') {
      materialCost = volResult.wasteAdjustedCubicYards * input.unitPrice;
    } else if (input.pricePerUnit === 'ton') {
      materialCost = totalTons * input.unitPrice;
    } else if (input.pricePerUnit === 'bag') {
      materialCost = bagsNeeded * input.unitPrice;
    }
  }

  const deliveryFee = input.deliveryFee ?? 0;
  const totalCost = materialCost > 0 ? materialCost + deliveryFee : 0;

  return {
    ...volResult,
    densityLbsPerCuYd,
    densityTonsPerCuYd,
    totalPounds,
    totalTons,
    bagSizeCuFt: bagSize,
    bagsNeeded,
    estimatedTriAxleTruckloads,
    materialCost,
    deliveryFee,
    totalCost,
    densitySource:
      input.customDensityLbsPerCuYd && input.customDensityLbsPerCuYd > 0
        ? 'User-specified custom density'
        : material?.densitySource ?? 'Standard crushed aggregate density',
  };
}
