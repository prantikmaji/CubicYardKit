import { CUBIC_FEET_PER_CUBIC_YARD } from './units';

export type CoreFillOption = 'none' | 'all' | 'every_other' | 'custom_percent';

export interface ConcreteBlockInput {
  wallLengthFeet: number;
  wallHeightFeet: number;
  openings?: Array<{ widthFeet: number; heightFeet: number }>;
  blocksPerSqFt?: number; // default 1.125 for standard 8x8x16
  wastePercent: number; // default 5%
  coreFillOption: CoreFillOption;
  customCoreFillPercent?: number; // e.g. 25% for 48" rebar spacing
  coreVolumePerBlockCuFt?: number; // default 0.44 cu ft for standard 8x8x16 2-cell CMU
  pricePerBlock?: number;
  pricePerMortarBag?: number;
  pricePerGroutCuYd?: number;
}

export interface ConcreteBlockResult {
  grossWallAreaSqFt: number;
  openingsAreaSqFt: number;
  netWallAreaSqFt: number;
  baseBlockCount: number;
  wastePercent: number;
  totalBlocksNeeded: number;
  mortarBagsNeeded: number; // 70 lb bags, approx 3.5 bags per 100 blocks
  coreFillGroutCuFt: number;
  coreFillGroutCuYd: number;
  materialCost: {
    blocks: number;
    mortar: number;
    grout: number;
    total: number;
  };
}

export function calculateConcreteBlock(input: ConcreteBlockInput): ConcreteBlockResult {
  const grossWallAreaSqFt = Math.max(0, input.wallLengthFeet) * Math.max(0, input.wallHeightFeet);

  const openingsAreaSqFt = (input.openings ?? []).reduce((sum, op) => {
    return sum + Math.max(0, op.widthFeet) * Math.max(0, op.heightFeet);
  }, 0);

  const netWallAreaSqFt = Math.max(0, grossWallAreaSqFt - openingsAreaSqFt);
  const blocksPerSqFt = input.blocksPerSqFt && input.blocksPerSqFt > 0 ? input.blocksPerSqFt : 1.125;

  const baseBlockCount = Math.ceil(netWallAreaSqFt * blocksPerSqFt);
  const waste = Math.max(0, input.wastePercent);
  const totalBlocksNeeded = Math.ceil(baseBlockCount * (1 + waste / 100));

  // NCMA guideline: ~3.5 bags (70 lb) of Type S/N mortar mix per 100 CMU blocks
  const mortarBagsNeeded = Math.ceil((totalBlocksNeeded / 100) * 3.5);

  // Core fill calculation
  const coreVolumePerBlock = input.coreVolumePerBlockCuFt ?? 0.44;
  let fillFraction = 0;
  switch (input.coreFillOption) {
    case 'none':
      fillFraction = 0;
      break;
    case 'all':
      fillFraction = 1.0;
      break;
    case 'every_other':
      fillFraction = 0.5;
      break;
    case 'custom_percent':
      fillFraction = Math.min(1, Math.max(0, (input.customCoreFillPercent ?? 0) / 100));
      break;
  }

  const coreFillGroutCuFt = totalBlocksNeeded * coreVolumePerBlock * fillFraction;
  const coreFillGroutCuYd = coreFillGroutCuFt / CUBIC_FEET_PER_CUBIC_YARD;

  const blocksCost = (input.pricePerBlock ?? 0) * totalBlocksNeeded;
  const mortarCost = (input.pricePerMortarBag ?? 0) * mortarBagsNeeded;
  const groutCost = (input.pricePerGroutCuYd ?? 0) * coreFillGroutCuYd;

  return {
    grossWallAreaSqFt,
    openingsAreaSqFt,
    netWallAreaSqFt,
    baseBlockCount,
    wastePercent: waste,
    totalBlocksNeeded,
    mortarBagsNeeded,
    coreFillGroutCuFt,
    coreFillGroutCuYd,
    materialCost: {
      blocks: blocksCost,
      mortar: mortarCost,
      grout: groutCost,
      total: blocksCost + mortarCost + groutCost,
    },
  };
}
