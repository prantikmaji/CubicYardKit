export type LengthUnit = 'feet' | 'inches' | 'yards' | 'meters' | 'centimeters';
export type VolumeUnit = 'cubic_yards' | 'cubic_feet' | 'cubic_meters' | 'cubic_inches';
export type WeightUnit = 'tons' | 'pounds' | 'kg' | 'metric_tonnes';

export const CUBIC_FEET_PER_CUBIC_YARD = 27;
export const CUBIC_INCHES_PER_CUBIC_FOOT = 1728;
export const CUBIC_METERS_PER_CUBIC_YARD = 0.764554857984;
export const LBS_PER_US_TON = 2000;
export const KG_PER_LB = 0.45359237;

/**
 * Converts length from given unit to canonical feet.
 */
export function toFeet(value: number, unit: LengthUnit): number {
  if (value < 0) return 0;
  switch (unit) {
    case 'feet':
      return value;
    case 'inches':
      return value / 12;
    case 'yards':
      return value * 3;
    case 'meters':
      return value * 3.280839895;
    case 'centimeters':
      return (value / 100) * 3.280839895;
    default:
      return value;
  }
}

/**
 * Converts cubic feet into other volume units.
 */
export function fromCubicFeet(cuFt: number, target: VolumeUnit): number {
  if (cuFt < 0) return 0;
  switch (target) {
    case 'cubic_feet':
      return cuFt;
    case 'cubic_yards':
      return cuFt / CUBIC_FEET_PER_CUBIC_YARD;
    case 'cubic_meters':
      return (cuFt / CUBIC_FEET_PER_CUBIC_YARD) * CUBIC_METERS_PER_CUBIC_YARD;
    case 'cubic_inches':
      return cuFt * CUBIC_INCHES_PER_CUBIC_FOOT;
  }
}

/**
 * Converts cubic yards into other volume units.
 */
export function fromCubicYards(cuYds: number, target: VolumeUnit): number {
  return fromCubicFeet(cuYds * CUBIC_FEET_PER_CUBIC_YARD, target);
}

/**
 * Formats numbers to clean decimal places with commas.
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
