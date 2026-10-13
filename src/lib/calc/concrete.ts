import { toFeet, CUBIC_FEET_PER_CUBIC_YARD } from './units';
import type { LengthUnit } from './units';

export type ConcreteStructureType = 'slab' | 'footing' | 'column';

export interface ConcreteCalculationInput {
  structureType: ConcreteStructureType;
  // Slabs & Footings
  length?: number;
  lengthUnit?: LengthUnit;
  width?: number;
  widthUnit?: LengthUnit;
  thicknessInches?: number;
  // Columns / Post Holes
  columnDiameterInches?: number;
  columnDepthFeet?: number;
  columnQuantity?: number;
  // Common
  wastePercent: number; // default 10%
  bagSelection?: '80lb' | '60lb' | '50lb';
  pricePerCubicYard?: number;
  pricePerBag?: number;
  deliveryFee?: number;
}

export interface ConcreteCalculationResult {
  structureType: ConcreteStructureType;
  cubicFeet: number;
  cubicYards: number;
  wastePercent: number;
  wasteAdjustedCubicFeet: number;
  wasteAdjustedCubicYards: number;
  // Bag yields
  bags80lb: number; // 0.60 cu ft yield
  bags60lb: number; // 0.45 cu ft yield
  bags50lb: number; // 0.375 cu ft yield
  recommendedDeliveryMethod: 'bags' | 'ready-mix';
  readyMixTrucksNeeded: number; // ~10 yd transit mixer
  materialCost: number;
  deliveryFee: number;
  totalCost: number;
}

export function calculateConcrete(input: ConcreteCalculationInput): ConcreteCalculationResult {
  let baseCubicFeet = 0;

  if (input.structureType === 'column') {
    const diameterInches = Math.max(0, input.columnDiameterInches ?? 0);
    const radiusFt = diameterInches / 24; // (diameter / 2) / 12
    const depthFt = Math.max(0, input.columnDepthFeet ?? 0);
    const count = Math.max(1, input.columnQuantity ?? 1);

    const singleHoleCuFt = Math.PI * Math.pow(radiusFt, 2) * depthFt;
    baseCubicFeet = singleHoleCuFt * count;
  } else {
    // slab or footing
    const l = Math.max(0, toFeet(input.length ?? 0, input.lengthUnit ?? 'feet'));
    const w = Math.max(0, toFeet(input.width ?? 0, input.widthUnit ?? 'feet'));
    const thicknessFt = Math.max(0, (input.thicknessInches ?? 4) / 12);
    baseCubicFeet = l * w * thicknessFt;
  }

  const baseCubicYards = baseCubicFeet / CUBIC_FEET_PER_CUBIC_YARD;
  const waste = Math.max(0, input.wastePercent);
  const multiplier = 1 + waste / 100;

  const wasteAdjustedCubicFeet = baseCubicFeet * multiplier;
  const wasteAdjustedCubicYards = baseCubicYards * multiplier;

  const bags80lb = Math.ceil(wasteAdjustedCubicFeet / 0.60);
  const bags60lb = Math.ceil(wasteAdjustedCubicFeet / 0.45);
  const bags50lb = Math.ceil(wasteAdjustedCubicFeet / 0.375);

  const recommendedDeliveryMethod = wasteAdjustedCubicYards >= 1.5 ? 'ready-mix' : 'bags';
  const readyMixTrucksNeeded = Math.ceil(wasteAdjustedCubicYards / 10);

  let materialCost = 0;
  if (recommendedDeliveryMethod === 'ready-mix' && input.pricePerCubicYard && input.pricePerCubicYard > 0) {
    materialCost = wasteAdjustedCubicYards * input.pricePerCubicYard;
  } else if (input.pricePerBag && input.pricePerBag > 0) {
    const selectedBags = input.bagSelection === '60lb' ? bags60lb : input.bagSelection === '50lb' ? bags50lb : bags80lb;
    materialCost = selectedBags * input.pricePerBag;
  } else if (input.pricePerCubicYard && input.pricePerCubicYard > 0) {
    materialCost = wasteAdjustedCubicYards * input.pricePerCubicYard;
  }

  const deliveryFee = input.deliveryFee ?? 0;
  const totalCost = materialCost > 0 ? materialCost + deliveryFee : 0;

  return {
    structureType: input.structureType,
    cubicFeet: baseCubicFeet,
    cubicYards: baseCubicYards,
    wastePercent: waste,
    wasteAdjustedCubicFeet,
    wasteAdjustedCubicYards,
    bags80lb,
    bags60lb,
    bags50lb,
    recommendedDeliveryMethod,
    readyMixTrucksNeeded,
    materialCost,
    deliveryFee,
    totalCost,
  };
}
