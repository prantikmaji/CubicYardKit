import { calculateRectangularVolume, calculateCircularVolume } from './geometry';
import type { VolumeResult } from './geometry';
import { LBS_PER_US_TON } from './units';
import type { LengthUnit } from './units';
import { MATERIALS } from '../../data/materials';

export interface DirtCalculationInput {
  shape: 'rectangle' | 'circle';
  length?: number;
  lengthUnit?: LengthUnit;
  width?: number;
  widthUnit?: LengthUnit;
  diameter?: number;
  diameterUnit?: LengthUnit;
  depth: number;
  depthUnit: LengthUnit;
  settlementPercent: number; // typically 15-20% settlement/compaction factor
  customDensityLbsPerCuYd?: number;
  unitPrice?: number;
  pricePerUnit?: 'cubic_yard' | 'ton';
  deliveryFee?: number;
}

export interface DirtCalculationResult extends VolumeResult {
  settlementPercent: number;
  compactedAdjustedCubicYards: number;
  compactedAdjustedCubicFeet: number;
  densityLbsPerCuYd: number;
  densityTonsPerCuYd: number;
  totalPounds: number;
  totalTons: number;
  estimatedDumpTruckloads: number; // 10 cubic yards per standard single-axle or tandem
  estimatedPickupTruckloads: number; // ~1 cubic yard max payload
  materialCost: number;
  deliveryFee: number;
  totalCost: number;
  densitySource: string;
}

export function calculateDirt(input: DirtCalculationInput): DirtCalculationResult {
  const volResult =
    input.shape === 'circle'
      ? calculateCircularVolume({
          diameter: input.diameter ?? 0,
          diameterUnit: input.diameterUnit ?? 'feet',
          depth: input.depth,
          depthUnit: input.depthUnit,
          wastePercent: input.settlementPercent,
        })
      : calculateRectangularVolume({
          length: input.length ?? 0,
          lengthUnit: input.lengthUnit ?? 'feet',
          width: input.width ?? 0,
          widthUnit: input.widthUnit ?? 'feet',
          depth: input.depth,
          depthUnit: input.depthUnit,
          wastePercent: input.settlementPercent,
        });

  const material = MATERIALS['fill-dirt'];
  const densityLbsPerCuYd =
    input.customDensityLbsPerCuYd && input.customDensityLbsPerCuYd > 0
      ? input.customDensityLbsPerCuYd
      : material.densityLbsPerCuYd ?? 2400;

  const densityTonsPerCuYd = densityLbsPerCuYd / LBS_PER_US_TON;
  const compactedAdjustedCubicYards = volResult.wasteAdjustedCubicYards;
  const compactedAdjustedCubicFeet = volResult.wasteAdjustedCubicFeet;

  const totalPounds = compactedAdjustedCubicYards * densityLbsPerCuYd;
  const totalTons = totalPounds / LBS_PER_US_TON;

  const estimatedDumpTruckloads = Math.ceil(compactedAdjustedCubicYards / 10);
  const estimatedPickupTruckloads = Math.ceil(compactedAdjustedCubicYards);

  let materialCost = 0;
  if (input.unitPrice && input.unitPrice > 0) {
    if (input.pricePerUnit === 'cubic_yard') {
      materialCost = compactedAdjustedCubicYards * input.unitPrice;
    } else if (input.pricePerUnit === 'ton') {
      materialCost = totalTons * input.unitPrice;
    }
  }

  const deliveryFee = input.deliveryFee ?? 0;
  const totalCost = materialCost > 0 ? materialCost + deliveryFee : 0;

  return {
    ...volResult,
    settlementPercent: input.settlementPercent,
    compactedAdjustedCubicYards,
    compactedAdjustedCubicFeet,
    densityLbsPerCuYd,
    densityTonsPerCuYd,
    totalPounds,
    totalTons,
    estimatedDumpTruckloads,
    estimatedPickupTruckloads,
    materialCost,
    deliveryFee,
    totalCost,
    densitySource:
      input.customDensityLbsPerCuYd && input.customDensityLbsPerCuYd > 0
        ? 'User-specified custom density'
        : material.densitySource ?? 'Standard loose subsoil density',
  };
}
