import { toFeet, CUBIC_FEET_PER_CUBIC_YARD } from './units';
import type { LengthUnit } from './units';

export interface RectangularVolumeInput {
  length: number;
  lengthUnit: LengthUnit;
  width: number;
  widthUnit: LengthUnit;
  depth: number;
  depthUnit: LengthUnit;
  wastePercent?: number;
}

export interface CircularVolumeInput {
  diameter: number;
  diameterUnit: LengthUnit;
  depth: number;
  depthUnit: LengthUnit;
  wastePercent?: number;
}

export interface VolumeResult {
  cubicFeet: number;
  cubicYards: number;
  cubicMeters: number;
  areaSqFt: number;
  wastePercent: number;
  wasteAdjustedCubicFeet: number;
  wasteAdjustedCubicYards: number;
  wasteAdjustedCubicMeters: number;
}

/**
 * Calculates volume of a rectangular prism with waste allowance.
 */
export function calculateRectangularVolume(input: RectangularVolumeInput): VolumeResult {
  const l = Math.max(0, toFeet(input.length, input.lengthUnit));
  const w = Math.max(0, toFeet(input.width, input.widthUnit));
  const d = Math.max(0, toFeet(input.depth, input.depthUnit));
  const waste = Math.max(0, input.wastePercent ?? 0);

  const areaSqFt = l * w;
  const cubicFeet = areaSqFt * d;
  const cubicYards = cubicFeet / CUBIC_FEET_PER_CUBIC_YARD;
  const cubicMeters = cubicYards * 0.764554857984;

  const multiplier = 1 + waste / 100;
  const wasteAdjustedCubicFeet = cubicFeet * multiplier;
  const wasteAdjustedCubicYards = cubicYards * multiplier;
  const wasteAdjustedCubicMeters = cubicMeters * multiplier;

  return {
    cubicFeet,
    cubicYards,
    cubicMeters,
    areaSqFt,
    wastePercent: waste,
    wasteAdjustedCubicFeet,
    wasteAdjustedCubicYards,
    wasteAdjustedCubicMeters,
  };
}

/**
 * Calculates volume of a cylinder (circular surface area * depth).
 */
export function calculateCircularVolume(input: CircularVolumeInput): VolumeResult {
  const diameterFt = Math.max(0, toFeet(input.diameter, input.diameterUnit));
  const radiusFt = diameterFt / 2;
  const depthFt = Math.max(0, toFeet(input.depth, input.depthUnit));
  const waste = Math.max(0, input.wastePercent ?? 0);

  const areaSqFt = Math.PI * Math.pow(radiusFt, 2);
  const cubicFeet = areaSqFt * depthFt;
  const cubicYards = cubicFeet / CUBIC_FEET_PER_CUBIC_YARD;
  const cubicMeters = cubicYards * 0.764554857984;

  const multiplier = 1 + waste / 100;
  const wasteAdjustedCubicFeet = cubicFeet * multiplier;
  const wasteAdjustedCubicYards = cubicYards * multiplier;
  const wasteAdjustedCubicMeters = cubicMeters * multiplier;

  return {
    cubicFeet,
    cubicYards,
    cubicMeters,
    areaSqFt,
    wastePercent: waste,
    wasteAdjustedCubicFeet,
    wasteAdjustedCubicYards,
    wasteAdjustedCubicMeters,
  };
}
