import { toFeet, CUBIC_FEET_PER_CUBIC_YARD, LBS_PER_US_TON } from './units';
import type { LengthUnit } from './units';

export interface PatioPlannerInput {
  patioLengthFeet: number;
  patioWidthFeet: number;
  // Paver specs
  paverLengthInches: number; // e.g. 8"
  paverWidthInches: number; // e.g. 4"
  paverWastePercent: number; // typically 10%
  // Base aggregate
  baseDepthInches: number; // typically 4" to 6" of crushed stone (#21A / #57 / road base)
  baseWastePercent: number; // typically 10%
  // Bedding sand
  beddingDepthInches: number; // typically 1" coarse washed bedding sand (ASTM C33)
  beddingWastePercent: number; // typically 5%
  // Edge restraint and geotextile
  includeEdgeRestraints: boolean;
  includeGeotextileFabric: boolean;
  // Pricing inputs
  pricePerPaver?: number;
  pricePerBaseTon?: number;
  pricePerSandTon?: number;
  pricePerPolymericSandBag?: number;
  pricePerEdgingLinearFt?: number;
}

export interface PatioPlannerResult {
  patioAreaSqFt: number;
  patioPerimeterLinearFt: number;
  // Paver totals
  paverAreaSqFt: number;
  paversPerSqFt: number;
  basePaverCount: number;
  totalPaverCountWithWaste: number;
  // Base aggregate
  baseCubicFeet: number;
  baseCubicYards: number;
  baseTons: number; // ~1.35 tons per cu yd
  // Bedding sand
  beddingCubicFeet: number;
  beddingCubicYards: number;
  beddingTons: number; // ~1.35 tons per cu yd
  // Joint sand
  polymericSandBags50lb: number; // typically 1 bag per 60-80 sq ft
  // Geotextile fabric
  geotextileSqFt: number; // patio area + 10% overlap
  // Edge restraint
  edgeRestraintLinearFt: number;
  // Bill of materials
  costs: {
    pavers: number;
    base: number;
    bedding: number;
    jointSand: number;
    edging: number;
    total: number;
  };
}

export function calculatePatioPlan(input: PatioPlannerInput): PatioPlannerResult {
  const l = Math.max(0, input.patioLengthFeet);
  const w = Math.max(0, input.patioWidthFeet);
  const patioAreaSqFt = l * w;
  const patioPerimeterLinearFt = 2 * (l + w);

  // Pavers
  const paverLengthFt = Math.max(0.1, input.paverLengthInches / 12);
  const paverWidthFt = Math.max(0.1, input.paverWidthInches / 12);
  const paverAreaSqFt = paverLengthFt * paverWidthFt;
  const paversPerSqFt = 1 / paverAreaSqFt;

  const basePaverCount = Math.ceil(patioAreaSqFt * paversPerSqFt);
  const paverWaste = Math.max(0, input.paverWastePercent);
  const totalPaverCountWithWaste = Math.ceil(basePaverCount * (1 + paverWaste / 100));

  // Base aggregate (crushed stone 4"-6", compacted)
  // ICPI standard: extend base 6 inches past patio perimeter for edge stability
  const baseExtendedLength = l + 1; // 6 in on each side = +1 ft
  const baseExtendedWidth = w + 1;
  const baseExtendedArea = baseExtendedLength * baseExtendedWidth;

  const baseDepthFt = Math.max(0, input.baseDepthInches / 12);
  const baseWaste = Math.max(0, input.baseWastePercent);
  const baseCubicFeet = baseExtendedArea * baseDepthFt * (1 + baseWaste / 100);
  const baseCubicYards = baseCubicFeet / CUBIC_FEET_PER_CUBIC_YARD;
  const baseTons = (baseCubicYards * 2700) / LBS_PER_US_TON;

  // Bedding sand (typically 1 inch coarse concrete sand)
  const beddingDepthFt = Math.max(0, input.beddingDepthInches / 12);
  const beddingWaste = Math.max(0, input.beddingWastePercent);
  const beddingCubicFeet = patioAreaSqFt * beddingDepthFt * (1 + beddingWaste / 100);
  const beddingCubicYards = beddingCubicFeet / CUBIC_FEET_PER_CUBIC_YARD;
  const beddingTons = (beddingCubicYards * 2700) / LBS_PER_US_TON;

  // Polymeric joint sand: ~1 bag per 70 sq ft for standard 2-3/8" pavers with 1/8" joints
  const polymericSandBags50lb = Math.ceil(patioAreaSqFt / 70);

  // Geotextile fabric: base footprint + 10% overlap
  const geotextileSqFt = input.includeGeotextileFabric ? Math.ceil(baseExtendedArea * 1.1) : 0;

  // Edge restraint: perimeter
  const edgeRestraintLinearFt = input.includeEdgeRestraints ? patioPerimeterLinearFt : 0;

  // Costs
  const paversCost = (input.pricePerPaver ?? 0) * totalPaverCountWithWaste;
  const baseCost = (input.pricePerBaseTon ?? 0) * baseTons;
  const beddingCost = (input.pricePerSandTon ?? 0) * beddingTons;
  const jointSandCost = (input.pricePerPolymericSandBag ?? 0) * polymericSandBags50lb;
  const edgingCost = (input.pricePerEdgingLinearFt ?? 0) * edgeRestraintLinearFt;

  return {
    patioAreaSqFt,
    patioPerimeterLinearFt,
    paverAreaSqFt,
    paversPerSqFt,
    basePaverCount,
    totalPaverCountWithWaste,
    baseCubicFeet,
    baseCubicYards,
    baseTons,
    beddingCubicFeet,
    beddingCubicYards,
    beddingTons,
    polymericSandBags50lb,
    geotextileSqFt,
    edgeRestraintLinearFt,
    costs: {
      pavers: paversCost,
      base: baseCost,
      bedding: beddingCost,
      jointSand: jointSandCost,
      edging: edgingCost,
      total: paversCost + baseCost + beddingCost + jointSandCost + edgingCost,
    },
  };
}
