import { toFeet, CUBIC_FEET_PER_CUBIC_YARD } from './units';

export type SlabUnit = 'feet' | 'inches' | 'yards' | 'meters';

export interface SlabArea {
  length: number;
  lengthUnit: SlabUnit;
  width: number;
  widthUnit: SlabUnit;
}

export interface CostLine {
  key: string;
  label: string;
  enabled: boolean;
  quantity: number;
  unit: string;
  rate: number; // user-entered, 0 = not provided
  subtotal: number; // quantity * rate if enabled and rate > 0
}

export interface ConcreteSlabCostInput {
  // Geometry
  areas: SlabArea[]; // 1 or more slab areas
  thicknessInches: number;
  wastePercent: number; // default 10
  // Ready-mix ordering
  minOrderYards: number; // minimum supplier order, default 1
  orderIncrementYards: number; // e.g. 0.25
  // Bagged comparison
  bagSizeLabel: '80lb' | '60lb' | '50lb';
  pricePerBag: number | null; // user-entered, null = not provided
  // Cost lines (all user-entered rates, null = not provided)
  pricePerCubicYard: number | null;
  deliveryFee: number | null;
  shortLoadFee: number | null; // applied if billedYards < 4
  shortLoadThresholdYards: number; // default 4
  excavationCostPerSqFt: number | null;
  gravelBaseCostPerSqFt: number | null;
  formworkCostPerLinFt: number | null;
  rebarCostPerSqFt: number | null;
  vaporBarrierCostPerSqFt: number | null;
  laborCostPerSqFt: number | null;
  finishCostPerSqFt: number | null;
  pumpFee: number | null;
  taxPercent: number | null;
  contingencyPercent: number | null;
  otherCost: number | null;
}

export interface ConcreteSlabCostResult {
  // Geometry
  totalAreaSqFt: number;
  perimeterFt: number; // sum of 2*(l+w) for rectangular perimeter (formwork estimate)
  // Volume
  netCubicFeet: number;
  netCubicYards: number;
  wasteAdjustedCubicYards: number;
  // Supplier ordering
  billedCubicYards: number; // max(minOrder, ceil(wasteAdjusted / increment) * increment)
  shortLoadApplied: boolean;
  // Bags
  bags80lb: number;
  bags60lb: number;
  bags50lb: number;
  // Cost breakdown
  concreteSubtotal: number; // billedYards * pricePerCubicYard (or 0 if not provided)
  deliverySubtotal: number;
  shortLoadSubtotal: number;
  excavationSubtotal: number;
  gravelBaseSubtotal: number;
  formworkSubtotal: number;
  rebarSubtotal: number;
  vaporBarrierSubtotal: number;
  laborSubtotal: number;
  finishSubtotal: number;
  pumpSubtotal: number;
  otherSubtotal: number;
  subtotalBeforeTax: number;
  taxSubtotal: number;
  contingencySubtotal: number;
  grandTotal: number;
  hasCostData: boolean; // true if any rate was provided
  missingPriceKeys: string[]; // cost line keys where rate is null/0
  // Delivery recommendation
  recommendedMethod: 'bags' | 'ready-mix';
}

export function calculateConcreteSlabCost(
  input: ConcreteSlabCostInput
): ConcreteSlabCostResult {
  // Geometry
  let totalAreaSqFt = 0;
  let perimeterFt = 0;

  for (const area of input.areas) {
    const lengthFt = toFeet(area.length, area.lengthUnit);
    const widthFt = toFeet(area.width, area.widthUnit);
    totalAreaSqFt += lengthFt * widthFt;
    perimeterFt += 2 * (lengthFt + widthFt);
  }

  // Volume
  const netCubicFeet = totalAreaSqFt * (input.thicknessInches / 12);
  const netCubicYards = netCubicFeet / CUBIC_FEET_PER_CUBIC_YARD;
  const wasteAdjustedCubicYards = netCubicYards * (1 + input.wastePercent / 100);

  // Supplier ordering
  const increment = input.orderIncrementYards > 0 ? input.orderIncrementYards : 0.25;
  const roundedUp = Math.ceil(wasteAdjustedCubicYards / increment) * increment;
  const billedCubicYards = Math.max(input.minOrderYards, roundedUp);

  const shortLoadApplied =
    billedCubicYards < input.shortLoadThresholdYards &&
    input.shortLoadFee !== null &&
    input.shortLoadFee > 0;

  // Bags
  const bags80lb = Math.ceil((wasteAdjustedCubicYards * CUBIC_FEET_PER_CUBIC_YARD) / 0.60);
  const bags60lb = Math.ceil((wasteAdjustedCubicYards * CUBIC_FEET_PER_CUBIC_YARD) / 0.45);
  const bags50lb = Math.ceil((wasteAdjustedCubicYards * CUBIC_FEET_PER_CUBIC_YARD) / 0.375);

  // Cost breakdown
  const concreteSubtotal =
    input.pricePerCubicYard !== null && input.pricePerCubicYard > 0
      ? billedCubicYards * input.pricePerCubicYard
      : 0;

  const deliverySubtotal = input.deliveryFee !== null && input.deliveryFee > 0 ? input.deliveryFee : 0;

  const shortLoadSubtotal = shortLoadApplied ? (input.shortLoadFee ?? 0) : 0;

  const excavationSubtotal =
    input.excavationCostPerSqFt !== null && input.excavationCostPerSqFt > 0
      ? totalAreaSqFt * input.excavationCostPerSqFt
      : 0;

  const gravelBaseSubtotal =
    input.gravelBaseCostPerSqFt !== null && input.gravelBaseCostPerSqFt > 0
      ? totalAreaSqFt * input.gravelBaseCostPerSqFt
      : 0;

  const formworkSubtotal =
    input.formworkCostPerLinFt !== null && input.formworkCostPerLinFt > 0
      ? perimeterFt * input.formworkCostPerLinFt
      : 0;

  const rebarSubtotal =
    input.rebarCostPerSqFt !== null && input.rebarCostPerSqFt > 0
      ? totalAreaSqFt * input.rebarCostPerSqFt
      : 0;

  const vaporBarrierSubtotal =
    input.vaporBarrierCostPerSqFt !== null && input.vaporBarrierCostPerSqFt > 0
      ? totalAreaSqFt * input.vaporBarrierCostPerSqFt
      : 0;

  const laborSubtotal =
    input.laborCostPerSqFt !== null && input.laborCostPerSqFt > 0
      ? totalAreaSqFt * input.laborCostPerSqFt
      : 0;

  const finishSubtotal =
    input.finishCostPerSqFt !== null && input.finishCostPerSqFt > 0
      ? totalAreaSqFt * input.finishCostPerSqFt
      : 0;

  const pumpSubtotal = input.pumpFee !== null && input.pumpFee > 0 ? input.pumpFee : 0;

  const otherSubtotal = input.otherCost !== null && input.otherCost > 0 ? input.otherCost : 0;

  const subtotalBeforeTax =
    concreteSubtotal +
    deliverySubtotal +
    shortLoadSubtotal +
    excavationSubtotal +
    gravelBaseSubtotal +
    formworkSubtotal +
    rebarSubtotal +
    vaporBarrierSubtotal +
    laborSubtotal +
    finishSubtotal +
    pumpSubtotal +
    otherSubtotal;

  const taxSubtotal =
    input.taxPercent !== null && input.taxPercent > 0
      ? subtotalBeforeTax * (input.taxPercent / 100)
      : 0;

  const contingencySubtotal =
    input.contingencyPercent !== null && input.contingencyPercent > 0
      ? subtotalBeforeTax * (input.contingencyPercent / 100)
      : 0;

  const grandTotal = subtotalBeforeTax + taxSubtotal + contingencySubtotal;

  const hasCostData = grandTotal > 0;

  // Missing price keys
  const missingPriceKeys: string[] = [];
  if (!input.pricePerCubicYard) missingPriceKeys.push('concrete');
  if (!input.deliveryFee) missingPriceKeys.push('delivery');
  if (!input.excavationCostPerSqFt) missingPriceKeys.push('excavation');
  if (!input.gravelBaseCostPerSqFt) missingPriceKeys.push('gravelBase');
  if (!input.formworkCostPerLinFt) missingPriceKeys.push('formwork');
  if (!input.rebarCostPerSqFt) missingPriceKeys.push('rebar');
  if (!input.vaporBarrierCostPerSqFt) missingPriceKeys.push('vaporBarrier');
  if (!input.laborCostPerSqFt) missingPriceKeys.push('labor');
  if (!input.finishCostPerSqFt) missingPriceKeys.push('finish');
  if (!input.pumpFee) missingPriceKeys.push('pump');

  const recommendedMethod: 'bags' | 'ready-mix' =
    wasteAdjustedCubicYards >= 1.5 ? 'ready-mix' : 'bags';

  return {
    totalAreaSqFt,
    perimeterFt,
    netCubicFeet,
    netCubicYards,
    wasteAdjustedCubicYards,
    billedCubicYards,
    shortLoadApplied,
    bags80lb,
    bags60lb,
    bags50lb,
    concreteSubtotal,
    deliverySubtotal,
    shortLoadSubtotal,
    excavationSubtotal,
    gravelBaseSubtotal,
    formworkSubtotal,
    rebarSubtotal,
    vaporBarrierSubtotal,
    laborSubtotal,
    finishSubtotal,
    pumpSubtotal,
    otherSubtotal,
    subtotalBeforeTax,
    taxSubtotal,
    contingencySubtotal,
    grandTotal,
    hasCostData,
    missingPriceKeys,
    recommendedMethod,
  };
}
