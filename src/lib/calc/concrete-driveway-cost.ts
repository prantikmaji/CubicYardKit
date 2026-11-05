import { toFeet, CUBIC_FEET_PER_CUBIC_YARD } from './units';

export type DrivewayUnit = 'feet' | 'inches' | 'yards' | 'meters';
export type ProjectScope = 'new' | 'replacement' | 'extension';

export interface DrivewaySectionInput {
  id: string;
  label: string;
  length: number;
  lengthUnit: DrivewayUnit;
  width: number;
  widthUnit: DrivewayUnit;
}

export interface DrivewaySectionResult {
  id: string;
  label: string;
  areaSquareFeet: number;
  perimeterFt: number;
  netCubicFeet: number;
  netCubicYards: number;
}

export interface ConcreteDrivewayCostInput {
  scope: ProjectScope;
  sections: DrivewaySectionInput[];
  thicknessInches: number; // default 5" for standard driveways
  wastePercent: number; // default 10%
  minOrderYards: number; // default 1
  orderIncrementYards: number; // default 0.25
  shortLoadThresholdYards: number; // default 4
  gravelBaseDepthInches: number | null; // e.g. 4" gravel sub-base

  // Cost lines (all user-entered rates, null = not provided)
  pricePerCubicYard: number | null;
  deliveryFee: number | null;
  shortLoadFee: number | null;
  excavationCostPerSqFt: number | null;
  demolitionCostPerSqFt: number | null; // replacement only: breaking existing slab
  disposalCostPerSqFt: number | null; // replacement only: hauling off concrete debris
  gravelBaseCostPerSqFt: number | null;
  formworkCostPerLinFt: number | null;
  rebarCostPerSqFt: number | null;
  vaporBarrierCostPerSqFt: number | null;
  laborCostPerSqFt: number | null; // pour, level, edge
  finishCostPerSqFt: number | null; // broom, exposed aggregate, stamped
  controlJointCostPerLinFt: number | null; // saw-cut or tooled joints
  sealingCostPerSqFt: number | null;
  pumpFee: number | null; // concrete pump truck if truck can't chute direct
  taxPercent: number | null;
  contingencyPercent: number | null;
  otherCost: number | null;
}

export interface ConcreteDrivewayCostResult {
  sections: DrivewaySectionResult[];
  totalAreaSqFt: number;
  totalPerimeterFt: number;
  netCubicFeet: number;
  netCubicYards: number;
  wasteAdjustedCubicYards: number;
  billedCubicYards: number;
  shortLoadApplied: boolean;
  truckloadsNeeded: number;
  bags80lb: number;
  bags60lb: number;
  recommendedMethod: 'bags' | 'ready-mix';
  gravelBaseCubicYards: number | null;

  // Subtotals
  concreteSubtotal: number;
  deliverySubtotal: number;
  shortLoadSubtotal: number;
  excavationSubtotal: number;
  demolitionSubtotal: number;
  disposalSubtotal: number;
  gravelBaseSubtotal: number;
  formworkSubtotal: number;
  rebarSubtotal: number;
  vaporBarrierSubtotal: number;
  laborSubtotal: number;
  finishSubtotal: number;
  controlJointSubtotal: number;
  sealingSubtotal: number;
  pumpSubtotal: number;
  otherSubtotal: number;

  subtotalBeforeTax: number;
  taxSubtotal: number;
  contingencySubtotal: number;
  grandTotal: number;
  costPerSqFt: number | null;
  hasCostData: boolean;
  missingPriceKeys: string[];
  scopeIncludesDemo: boolean;
}

export function calculateConcreteDriveway(
  input: ConcreteDrivewayCostInput
): ConcreteDrivewayCostResult {
  const sections: DrivewaySectionResult[] = [];
  let totalAreaSqFt = 0;
  let totalPerimeterFt = 0;
  let netCubicFeet = 0;

  for (const s of input.sections) {
    const lFt = toFeet(s.length, s.lengthUnit);
    const wFt = toFeet(s.width, s.widthUnit);
    const area = lFt * wFt;
    const perimeter = 2 * (lFt + wFt);
    const cuFt = area * (input.thicknessInches / 12);
    const cuYards = cuFt / CUBIC_FEET_PER_CUBIC_YARD;

    sections.push({
      id: s.id,
      label: s.label,
      areaSquareFeet: area,
      perimeterFt: perimeter,
      netCubicFeet: cuFt,
      netCubicYards: cuYards,
    });

    totalAreaSqFt += area;
    totalPerimeterFt += perimeter;
    netCubicFeet += cuFt;
  }

  const netCubicYards = netCubicFeet / CUBIC_FEET_PER_CUBIC_YARD;
  const wasteAdjustedCubicYards = netCubicYards * (1 + input.wastePercent / 100);

  // Supplier ordering rules
  const increment = input.orderIncrementYards > 0 ? input.orderIncrementYards : 0.25;
  const roundedUp = Math.ceil(wasteAdjustedCubicYards / increment) * increment;
  const billedCubicYards = totalAreaSqFt > 0 ? Math.max(input.minOrderYards, roundedUp) : 0;

  const shortLoadApplied =
    billedCubicYards > 0 &&
    billedCubicYards < input.shortLoadThresholdYards &&
    input.shortLoadFee !== null &&
    input.shortLoadFee > 0;

  const truckloadsNeeded = billedCubicYards > 0 ? Math.max(1, Math.ceil(billedCubicYards / 10)) : 0;

  // Pre-mixed bags comparison
  const bags80lb = Math.ceil((wasteAdjustedCubicYards * CUBIC_FEET_PER_CUBIC_YARD) / 0.60);
  const bags60lb = Math.ceil((wasteAdjustedCubicYards * CUBIC_FEET_PER_CUBIC_YARD) / 0.45);

  // Gravel sub-base
  const gravelBaseCubicYards =
    input.gravelBaseDepthInches !== null && input.gravelBaseDepthInches > 0 && totalAreaSqFt > 0
      ? (totalAreaSqFt * (input.gravelBaseDepthInches / 12)) / CUBIC_FEET_PER_CUBIC_YARD
      : null;

  // Cost lines
  const concreteSubtotal =
    input.pricePerCubicYard !== null && input.pricePerCubicYard > 0
      ? billedCubicYards * input.pricePerCubicYard
      : 0;

  const deliverySubtotal =
    input.deliveryFee !== null && input.deliveryFee > 0 ? input.deliveryFee : 0;

  const shortLoadSubtotal = shortLoadApplied ? (input.shortLoadFee ?? 0) : 0;

  const excavationSubtotal =
    input.excavationCostPerSqFt !== null && input.excavationCostPerSqFt > 0
      ? totalAreaSqFt * input.excavationCostPerSqFt
      : 0;

  // Demolition & Disposal: ONLY applicable in replacement scope
  const isReplacement = input.scope === 'replacement';

  const demolitionSubtotal =
    isReplacement && input.demolitionCostPerSqFt !== null && input.demolitionCostPerSqFt > 0
      ? totalAreaSqFt * input.demolitionCostPerSqFt
      : 0;

  const disposalSubtotal =
    isReplacement && input.disposalCostPerSqFt !== null && input.disposalCostPerSqFt > 0
      ? totalAreaSqFt * input.disposalCostPerSqFt
      : 0;

  const gravelBaseSubtotal =
    input.gravelBaseCostPerSqFt !== null && input.gravelBaseCostPerSqFt > 0
      ? totalAreaSqFt * input.gravelBaseCostPerSqFt
      : 0;

  const formworkSubtotal =
    input.formworkCostPerLinFt !== null && input.formworkCostPerLinFt > 0
      ? totalPerimeterFt * input.formworkCostPerLinFt
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

  // Control joint rule: roughly 1 lin ft per 10 sq ft of driveway area
  const estimatedJointLinFt = Math.round(totalAreaSqFt / 10);
  const controlJointSubtotal =
    input.controlJointCostPerLinFt !== null && input.controlJointCostPerLinFt > 0
      ? estimatedJointLinFt * input.controlJointCostPerLinFt
      : 0;

  const sealingSubtotal =
    input.sealingCostPerSqFt !== null && input.sealingCostPerSqFt > 0
      ? totalAreaSqFt * input.sealingCostPerSqFt
      : 0;

  const pumpSubtotal = input.pumpFee !== null && input.pumpFee > 0 ? input.pumpFee : 0;

  const otherSubtotal = input.otherCost !== null && input.otherCost > 0 ? input.otherCost : 0;

  const subtotalBeforeTax =
    concreteSubtotal +
    deliverySubtotal +
    shortLoadSubtotal +
    excavationSubtotal +
    demolitionSubtotal +
    disposalSubtotal +
    gravelBaseSubtotal +
    formworkSubtotal +
    rebarSubtotal +
    vaporBarrierSubtotal +
    laborSubtotal +
    finishSubtotal +
    controlJointSubtotal +
    sealingSubtotal +
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

  const costPerSqFt =
    grandTotal > 0 && totalAreaSqFt > 0 ? grandTotal / totalAreaSqFt : null;

  const hasCostData = grandTotal > 0;

  // Track missing price keys for transparency
  const missingPriceKeys: string[] = [];
  if (!input.pricePerCubicYard) missingPriceKeys.push('concrete');
  if (!input.deliveryFee) missingPriceKeys.push('delivery');
  if (!input.laborCostPerSqFt) missingPriceKeys.push('labor');
  if (!input.excavationCostPerSqFt) missingPriceKeys.push('excavation');
  if (isReplacement && !input.demolitionCostPerSqFt) missingPriceKeys.push('demolition');
  if (isReplacement && !input.disposalCostPerSqFt) missingPriceKeys.push('disposal');
  if (!input.gravelBaseCostPerSqFt) missingPriceKeys.push('gravelBase');
  if (!input.formworkCostPerLinFt) missingPriceKeys.push('formwork');
  if (!input.rebarCostPerSqFt) missingPriceKeys.push('rebar');
  if (!input.finishCostPerSqFt) missingPriceKeys.push('finish');

  const recommendedMethod: 'bags' | 'ready-mix' =
    wasteAdjustedCubicYards >= 1.5 ? 'ready-mix' : 'bags';

  return {
    sections,
    totalAreaSqFt,
    totalPerimeterFt,
    netCubicFeet,
    netCubicYards,
    wasteAdjustedCubicYards,
    billedCubicYards,
    shortLoadApplied,
    truckloadsNeeded,
    bags80lb,
    bags60lb,
    recommendedMethod,
    gravelBaseCubicYards,
    concreteSubtotal,
    deliverySubtotal,
    shortLoadSubtotal,
    excavationSubtotal,
    demolitionSubtotal,
    disposalSubtotal,
    gravelBaseSubtotal,
    formworkSubtotal,
    rebarSubtotal,
    vaporBarrierSubtotal,
    laborSubtotal,
    finishSubtotal,
    controlJointSubtotal,
    sealingSubtotal,
    pumpSubtotal,
    otherSubtotal,
    subtotalBeforeTax,
    taxSubtotal,
    contingencySubtotal,
    grandTotal,
    costPerSqFt,
    hasCostData,
    missingPriceKeys,
    scopeIncludesDemo: isReplacement,
  };
}

