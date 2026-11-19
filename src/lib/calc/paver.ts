import { toFeet, CUBIC_FEET_PER_CUBIC_YARD, LBS_PER_US_TON } from './units';
import type { LengthUnit } from './units';

export type PaverProjectType = 'patio' | 'walkway' | 'driveway' | 'pool-deck' | 'other';

export type PaverPresetId =
  | '4x8-holland'
  | '6x6-classic'
  | '6x9-rector'
  | '12x12-slab'
  | '16x16-patio'
  | 'brick-paver'
  | 'custom';

export type LayingPatternId =
  | 'running-bond'
  | 'stack-bond'
  | 'herringbone-45'
  | 'herringbone-90'
  | 'basketweave'
  | 'ashlar-modular';

export interface PaverPreset {
  id: PaverPresetId;
  name: string;
  category: string;
  lengthInches: number;
  widthInches: number;
  thicknessInches: number;
  defaultJointInches: number;
  piecesPerPack?: number;
  piecesPerPallet?: number;
  sqFtPerPallet?: number;
  weightLbsPerPiece?: number;
}

export const PAVER_PRESETS: Record<PaverPresetId, PaverPreset> = {
  '4x8-holland': {
    id: '4x8-holland',
    name: 'Holland Stone (4" × 8")',
    category: 'Standard Interlocking',
    lengthInches: 7.87,
    widthInches: 3.94,
    thicknessInches: 2.375, // 60 mm
    defaultJointInches: 0.125, // 1/8"
    piecesPerPack: 108,
    piecesPerPallet: 432,
    sqFtPerPallet: 96,
    weightLbsPerPiece: 6.0,
  },
  '6x6-classic': {
    id: '6x6-classic',
    name: 'Classic Square (6" × 6")',
    category: 'Standard Square',
    lengthInches: 5.91,
    widthInches: 5.91,
    thicknessInches: 2.375, // 60 mm
    defaultJointInches: 0.125,
    piecesPerPack: 96,
    piecesPerPallet: 384,
    sqFtPerPallet: 96,
    weightLbsPerPiece: 6.8,
  },
  '6x9-rector': {
    id: '6x9-rector',
    name: 'Cobblestone / Rector (6" × 9")',
    category: 'Standard Large',
    lengthInches: 8.86,
    widthInches: 5.91,
    thicknessInches: 2.375, // 60 mm
    defaultJointInches: 0.125,
    piecesPerPack: 64,
    piecesPerPallet: 288,
    sqFtPerPallet: 105,
    weightLbsPerPiece: 10.2,
  },
  '12x12-slab': {
    id: '12x12-slab',
    name: 'Stepping Stone Slab (12" × 12")',
    category: 'Architectural Slab',
    lengthInches: 11.81,
    widthInches: 11.81,
    thicknessInches: 1.97, // 50 mm
    defaultJointInches: 0.1875, // 3/16"
    piecesPerPack: 40,
    piecesPerPallet: 120,
    sqFtPerPallet: 120,
    weightLbsPerPiece: 23.5,
  },
  '16x16-patio': {
    id: '16x16-patio',
    name: 'Large Patio Tile (16" × 16")',
    category: 'Architectural Slab',
    lengthInches: 15.75,
    widthInches: 15.75,
    thicknessInches: 1.97, // 50 mm
    defaultJointInches: 0.1875,
    piecesPerPack: 30,
    piecesPerPallet: 60,
    sqFtPerPallet: 106.7,
    weightLbsPerPiece: 41.0,
  },
  'brick-paver': {
    id: 'brick-paver',
    name: 'Standard Clay Brick Paver (4" × 8")',
    category: 'Clay Paver (ASTM C902)',
    lengthInches: 7.625,
    widthInches: 3.625,
    thicknessInches: 2.25,
    defaultJointInches: 0.125,
    piecesPerPack: 100,
    piecesPerPallet: 500,
    sqFtPerPallet: 100,
    weightLbsPerPiece: 5.2,
  },
  custom: {
    id: 'custom',
    name: 'Custom Dimensions',
    category: 'User Defined',
    lengthInches: 8.0,
    widthInches: 4.0,
    thicknessInches: 2.375,
    defaultJointInches: 0.125,
    piecesPerPack: 100,
    piecesPerPallet: 400,
    sqFtPerPallet: 100,
    weightLbsPerPiece: 6.0,
  },
};

export interface LayingPatternInfo {
  id: LayingPatternId;
  name: string;
  recommendedWastePercent: number;
  interlockStrength: 'High (Vehicular/Heavy)' | 'Medium (Pedestrian/Patio)' | 'Low (Decorative)';
  description: string;
}

export const LAYING_PATTERNS: Record<LayingPatternId, LayingPatternInfo> = {
  'running-bond': {
    id: 'running-bond',
    name: 'Running Bond (Offset)',
    recommendedWastePercent: 8,
    interlockStrength: 'Medium (Pedestrian/Patio)',
    description: 'Traditional offset pattern with easy straight cuts along perimeter edges.',
  },
  'herringbone-45': {
    id: 'herringbone-45',
    name: '45° Herringbone',
    recommendedWastePercent: 12,
    interlockStrength: 'High (Vehicular/Heavy)',
    description: 'Maximum interlock resistance to vehicle braking and tire turning. Higher diagonal perimeter cuts.',
  },
  'herringbone-90': {
    id: 'herringbone-90',
    name: '90° Herringbone',
    recommendedWastePercent: 10,
    interlockStrength: 'High (Vehicular/Heavy)',
    description: 'Exceptional structural interlock aligned perpendicular to border pavers.',
  },
  'basketweave': {
    id: 'basketweave',
    name: 'Basketweave',
    recommendedWastePercent: 8,
    interlockStrength: 'Medium (Pedestrian/Patio)',
    description: 'Alternating vertical and horizontal paver pairs; ideal for classic brick garden patios.',
  },
  'stack-bond': {
    id: 'stack-bond',
    name: 'Stack Bond (Grid)',
    recommendedWastePercent: 6,
    interlockStrength: 'Low (Decorative)',
    description: 'Clean modern grid lines; best suited for pedestrian walkways without wheeled traffic.',
  },
  'ashlar-modular': {
    id: 'ashlar-modular',
    name: 'Modular / Ashlar Multi-Size',
    recommendedWastePercent: 12,
    interlockStrength: 'Medium (Pedestrian/Patio)',
    description: 'Randomized 3-piece modular layout (requires bundled multi-size pallet sets).',
  },
};

export interface PaverSectionInput {
  id: string;
  name: string;
  shape: 'rectangle' | 'circle' | 'triangle';
  length?: number;
  lengthUnit?: LengthUnit;
  width?: number;
  widthUnit?: LengthUnit;
  diameter?: number;
  diameterUnit?: LengthUnit;
  sharedEdgeFeet?: number; // length of perimeter abutting house/existing structure where edging is omitted
}

export interface PaverOpeningInput {
  id: string;
  name: string;
  length: number;
  lengthUnit: LengthUnit;
  width: number;
  widthUnit: LengthUnit;
  count?: number;
}

export interface PaverCalculationInput {
  // Scope & geometry mode
  projectType: PaverProjectType;
  inputMode: 'dimensions' | 'area';
  // Simple dimensions
  length?: number;
  lengthUnit?: LengthUnit;
  width?: number;
  widthUnit?: LengthUnit;
  // Known area
  knownArea?: number;
  knownAreaUnit?: 'sqFt' | 'sqMeters' | 'sqYards';
  // Advanced multi-sections
  sections?: PaverSectionInput[];
  openings?: PaverOpeningInput[];
  unrestrainedSides?: 4 | 3 | 2 | 1 | 0; // default 3 for patio against house, 4 for freestanding
  customRestraintLinearFt?: number; // manual override if desired
  // Paver geometry
  presetId: PaverPresetId;
  customDimensions?: {
    lengthInches: number;
    widthInches: number;
    thicknessInches: number;
  };
  jointWidthInches: number; // default 0.125 (1/8")
  patternId: LayingPatternId;
  wastePercent: number; // default 10%
  // Pack & pallet specs
  piecesPerPack?: number;
  piecesPerPallet?: number;
  sqFtPerPallet?: number;
  // Sub-base aggregate
  includeBase: boolean;
  baseDepthInches?: number; // default 4" (patio) or 6" (heavy/freeze-thaw) or 8" (driveway)
  baseCompactionPercent?: number; // loose-to-compacted factor (typically 15% to 20%)
  includeBaseShoulder?: boolean; // ICPI 6" extension past paver edge
  // Bedding sand
  includeBedding: boolean;
  beddingDepthInches?: number; // standard 1.0 inch (ASTM C33)
  beddingWastePercent?: number; // default 5%
  // Joint sand
  includeJointSand: boolean;
  jointSandCoverageSqFtPerBag?: number; // default 75 sq ft / 50-lb bag
  // Edge restraint
  includeEdgeRestraints: boolean;
  edgeSectionLengthFt?: number; // default 7.5 ft or 8.0 ft
  spikeSpacingInches?: number; // default 18 inches
  // Geotextile
  includeGeotextile: boolean;
  geotextileOverlapPercent?: number; // default 10%
  // Pricing inputs (optional user rates)
  pricePerPaverPiece?: number | null;
  pricePerPaverSqFt?: number | null;
  pricePerPaverPallet?: number | null;
  pricePerBaseTon?: number | null;
  pricePerSandTon?: number | null;
  pricePerJointSandBag?: number | null;
  pricePerEdgingPiece?: number | null;
  pricePerGeotextileSqFt?: number | null;
  deliveryFee?: number | null;
  laborCostPerSqFt?: number | null;
  equipmentRentalFee?: number | null;
  salesTaxPercent?: number | null;
}

export interface SectionBreakdown {
  id: string;
  name: string;
  areaSqFt: number;
  perimeterLinearFt: number;
  theoreticalPavers: number;
  orderPavers: number;
}

export interface PaverCalculationResult {
  // Area & Dimensions
  totalGrossAreaSqFt: number;
  totalOpeningsAreaSqFt: number;
  netPavedAreaSqFt: number;
  netPavedAreaSqMeters: number;
  totalPerimeterLinearFt: number;
  exposedRestraintLinearFt: number;
  sections: SectionBreakdown[];

  // Paver Specifications & Quantities
  paverLengthInches: number;
  paverWidthInches: number;
  paverThicknessInches: number;
  jointWidthInches: number;
  moduleAreaSqFt: number;
  paversPerSqFt: number;
  theoreticalPaverCount: number;
  wastePercent: number;
  orderPaverCount: number;
  totalPaverCoverageSqFt: number;
  totalPaverWeightTons: number;

  // Packaging & Pallets
  piecesPerPack: number;
  packsNeeded: number;
  piecesPerPallet: number;
  palletsNeeded: number;

  // Compacted Base Aggregate Layer
  baseIncluded: boolean;
  baseDepthInches: number;
  baseFootprintSqFt: number;
  baseCompactedVolumeCuFt: number;
  baseCompactedVolumeCuYds: number;
  baseLooseOrderVolumeCuYds: number;
  baseWeightTons: number;

  // Bedding Sand Layer (ASTM C33)
  beddingIncluded: boolean;
  beddingDepthInches: number;
  beddingVolumeCuFt: number;
  beddingVolumeCuYds: number;
  beddingWeightTons: number;
  beddingBags50lb: number;

  // Jointing / Polymeric Sand
  jointSandIncluded: boolean;
  jointSandBags50lb: number;
  jointSandEstCoveragePerBagSqFt: number;

  // Edge Restraints & Spikes
  edgeRestraintIncluded: boolean;
  edgeRestraintLinearFt: number;
  edgeRestraintSectionsNeeded: number; // 7.5' or 8' commercial sticks
  edgeSpikesNeeded: number; // 10" or 12" spiral steel spikes

  // Geotextile Fabric
  geotextileIncluded: boolean;
  geotextileTotalSqFt: number;

  // Bill of Materials & Procurement
  billOfMaterials: Array<{
    category: string;
    item: string;
    quantity: number | string;
    unit: string;
    unitCost?: number;
    subtotalCost?: number;
    notes?: string;
  }>;

  // Cost Estimator
  materialSubtotal: number;
  deliverySubtotal: number;
  laborSubtotal: number;
  equipmentSubtotal: number;
  subtotalBeforeTax: number;
  taxSubtotal: number;
  grandTotal: number;
  costPerSqFt: number | null;
  hasCostData: boolean;
  missingPriceKeys: string[];
}

export function calculatePavers(input: PaverCalculationInput): PaverCalculationResult {
  // 1. Resolve Paver Preset & Dimensions
  let pPreset: PaverPreset;
  if (input.presetId !== 'custom' && PAVER_PRESETS[input.presetId]) {
    pPreset = PAVER_PRESETS[input.presetId];
  } else {
    pPreset = {
      id: 'custom',
      name: 'Custom Dimensions',
      category: 'User Defined',
      lengthInches: input.customDimensions?.lengthInches ?? 8.0,
      widthInches: input.customDimensions?.widthInches ?? 4.0,
      thicknessInches: input.customDimensions?.thicknessInches ?? 2.375,
      defaultJointInches: input.jointWidthInches ?? 0.125,
      piecesPerPack: input.piecesPerPack ?? 100,
      piecesPerPallet: input.piecesPerPallet ?? 400,
      sqFtPerPallet: input.sqFtPerPallet ?? 100,
      weightLbsPerPiece: 6.0,
    };
  }

  const paverLengthInches =
    input.presetId === 'custom' && input.customDimensions?.lengthInches
      ? Math.max(0.5, input.customDimensions.lengthInches)
      : pPreset.lengthInches;
  const paverWidthInches =
    input.presetId === 'custom' && input.customDimensions?.widthInches
      ? Math.max(0.5, input.customDimensions.widthInches)
      : pPreset.widthInches;
  const paverThicknessInches =
    input.presetId === 'custom' && input.customDimensions?.thicknessInches
      ? Math.max(0.5, input.customDimensions.thicknessInches)
      : pPreset.thicknessInches;

  const jointWidthInches = Math.max(0, input.jointWidthInches ?? pPreset.defaultJointInches);
  const wastePercent = Math.max(0, input.wastePercent ?? 10);
  const wasteMultiplier = 1 + wastePercent / 100;

  // 2. Installed Face Module Geometry
  // module = (paver length + joint) * (paver width + joint) in inches
  const moduleLengthInches = paverLengthInches + jointWidthInches;
  const moduleWidthInches = paverWidthInches + jointWidthInches;
  const moduleAreaSqInches = moduleLengthInches * moduleWidthInches;
  const moduleAreaSqFt = moduleAreaSqInches > 0 ? moduleAreaSqInches / 144 : 0;
  const paversPerSqFt = moduleAreaSqFt > 0 ? 1 / moduleAreaSqFt : 0;

  // 3. Geometry & Surface Area Breakdown
  let totalGrossAreaSqFt = 0;
  let totalPerimeterLinearFt = 0;
  let totalExposedLinearFt = 0;
  const sectionBreakdowns: SectionBreakdown[] = [];

  if (input.inputMode === 'dimensions') {
    if (input.sections && input.sections.length > 0) {
      for (const sec of input.sections) {
        let secArea = 0;
        let secPerimeter = 0;

        if (sec.shape === 'circle') {
          const diaFt = Math.max(0, toFeet(sec.diameter ?? 0, sec.diameterUnit ?? 'feet'));
          const r = diaFt / 2;
          secArea = Math.PI * r * r;
          secPerimeter = Math.PI * diaFt;
        } else if (sec.shape === 'triangle') {
          const baseFt = Math.max(0, toFeet(sec.width ?? 0, sec.widthUnit ?? 'feet'));
          const heightFt = Math.max(0, toFeet(sec.length ?? 0, sec.lengthUnit ?? 'feet'));
          secArea = (baseFt * heightFt) / 2;
          // Approximate hypotenuse for right triangle perimeter
          const hyp = Math.sqrt(baseFt * baseFt + heightFt * heightFt);
          secPerimeter = baseFt + heightFt + hyp;
        } else {
          // Default rectangle
          const lengthFt = Math.max(0, toFeet(sec.length ?? 0, sec.lengthUnit ?? 'feet'));
          const widthFt = Math.max(0, toFeet(sec.width ?? 0, sec.widthUnit ?? 'feet'));
          secArea = lengthFt * widthFt;
          secPerimeter = 2 * (lengthFt + widthFt);
        }

        const sharedEdge = Math.max(0, sec.sharedEdgeFeet ?? 0);
        const exposedPerimeter = Math.max(0, secPerimeter - sharedEdge);

        const secTheoretical = secArea * paversPerSqFt;
        const secOrder = Math.ceil(secTheoretical * wasteMultiplier);

        totalGrossAreaSqFt += secArea;
        totalPerimeterLinearFt += secPerimeter;
        totalExposedLinearFt += exposedPerimeter;

        sectionBreakdowns.push({
          id: sec.id,
          name: sec.name || 'Section',
          areaSqFt: secArea,
          perimeterLinearFt: secPerimeter,
          theoreticalPavers: Math.round(secTheoretical),
          orderPavers: secOrder,
        });
      }
    } else {
      // Single rectangle fallback
      const lengthFt = Math.max(0, toFeet(input.length ?? 0, input.lengthUnit ?? 'feet'));
      const widthFt = Math.max(0, toFeet(input.width ?? 0, input.widthUnit ?? 'feet'));
      totalGrossAreaSqFt = lengthFt * widthFt;
      totalPerimeterLinearFt = 2 * (lengthFt + widthFt);

      // Default unrestrained sides: 3 sides exposed (1 side against house/wall)
      const sides = input.unrestrainedSides !== undefined ? input.unrestrainedSides : 3;
      if (sides === 4) {
        totalExposedLinearFt = totalPerimeterLinearFt;
      } else if (sides === 3) {
        // Assume longer side is against house
        const longerSide = Math.max(lengthFt, widthFt);
        totalExposedLinearFt = Math.max(0, totalPerimeterLinearFt - longerSide);
      } else if (sides === 2) {
        totalExposedLinearFt = lengthFt + widthFt;
      } else if (sides === 1) {
        totalExposedLinearFt = Math.min(lengthFt, widthFt);
      } else {
        totalExposedLinearFt = 0;
      }

      const secTheoretical = totalGrossAreaSqFt * paversPerSqFt;
      sectionBreakdowns.push({
        id: 'main-area',
        name: 'Main Area',
        areaSqFt: totalGrossAreaSqFt,
        perimeterLinearFt: totalPerimeterLinearFt,
        theoreticalPavers: Math.round(secTheoretical),
        orderPavers: Math.ceil(secTheoretical * wasteMultiplier),
      });
    }
  } else {
    // Known surface area mode
    const rawArea = Math.max(0, input.knownArea ?? 0);
    const unit = input.knownAreaUnit ?? 'sqFt';
    if (unit === 'sqFt') {
      totalGrossAreaSqFt = rawArea;
    } else if (unit === 'sqMeters') {
      totalGrossAreaSqFt = rawArea * 10.76391041671;
    } else if (unit === 'sqYards') {
      totalGrossAreaSqFt = rawArea * 9;
    }

    // Infer square perimeter: 4 * sqrt(area)
    totalPerimeterLinearFt = totalGrossAreaSqFt > 0 ? 4 * Math.sqrt(totalGrossAreaSqFt) : 0;
    const sides = input.unrestrainedSides !== undefined ? input.unrestrainedSides : 3;
    totalExposedLinearFt = totalPerimeterLinearFt * (sides / 4);

    const secTheoretical = totalGrossAreaSqFt * paversPerSqFt;
    sectionBreakdowns.push({
      id: 'known-area',
      name: 'Specified Paved Area',
      areaSqFt: totalGrossAreaSqFt,
      perimeterLinearFt: totalPerimeterLinearFt,
      theoreticalPavers: Math.round(secTheoretical),
      orderPavers: Math.ceil(secTheoretical * wasteMultiplier),
    });
  }

  // Subtract Openings / Cutouts (e.g. fire pit, tree well, pillar)
  let totalOpeningsAreaSqFt = 0;
  if (input.openings && input.openings.length > 0) {
    for (const op of input.openings) {
      const opW = toFeet(op.width, op.lengthUnit);
      const opL = toFeet(op.length, op.lengthUnit);
      const count = Math.max(1, op.count ?? 1);
      totalOpeningsAreaSqFt += opW * opL * count;
    }
  }

  const netPavedAreaSqFt = Math.max(0, totalGrossAreaSqFt - totalOpeningsAreaSqFt);
  const netPavedAreaSqMeters = netPavedAreaSqFt * 0.092903;

  // Custom restraint override if provided
  const exposedRestraintLinearFt =
    input.customRestraintLinearFt !== undefined && input.customRestraintLinearFt > 0
      ? input.customRestraintLinearFt
      : totalExposedLinearFt;

  // 4. Paver Quantity Calculations
  const theoreticalPaverCount = netPavedAreaSqFt * paversPerSqFt;
  const orderPaverCount = Math.ceil(theoreticalPaverCount * wasteMultiplier);
  const singlePaverFaceSqFt = (paverLengthInches * paverWidthInches) / 144;
  const totalPaverCoverageSqFt = orderPaverCount * singlePaverFaceSqFt;

  const weightPerPiece = pPreset.weightLbsPerPiece ?? 6.0;
  const totalPaverWeightTons = (orderPaverCount * weightPerPiece) / 2000;

  // Packs & Pallet Rounding
  const piecesPerPack = input.piecesPerPack ?? pPreset.piecesPerPack ?? 100;
  const piecesPerPallet = input.piecesPerPallet ?? pPreset.piecesPerPallet ?? 400;
  const sqFtPerPallet = input.sqFtPerPallet ?? pPreset.sqFtPerPallet ?? 100;

  const packsNeeded = piecesPerPack > 0 && orderPaverCount > 0 ? Math.ceil(orderPaverCount / piecesPerPack) : 0;
  const palletsNeeded =
    piecesPerPallet > 0 && orderPaverCount > 0
      ? Math.ceil(orderPaverCount / piecesPerPallet)
      : sqFtPerPallet > 0 && netPavedAreaSqFt > 0
      ? Math.ceil((netPavedAreaSqFt * wasteMultiplier) / sqFtPerPallet)
      : 0;

  // 5. Compacted Base Aggregate Layer (ICPI Standard)
  const baseIncluded = input.includeBase;
  // Default base depths: patio=4", driveway=8", walkway=4", pool=4"
  const defaultBaseDepth = input.projectType === 'driveway' ? 8 : 4;
  const baseDepthInches = Math.max(0, input.baseDepthInches ?? defaultBaseDepth);

  // ICPI 6" shoulder extension on unrestrained perimeter: baseArea ≈ netArea + (perimeter * 0.5)
  const baseShoulderFt = input.includeBaseShoulder ? 0.5 : 0;
  const baseFootprintSqFt =
    netPavedAreaSqFt > 0
      ? netPavedAreaSqFt + (input.includeBaseShoulder ? exposedRestraintLinearFt * baseShoulderFt : 0)
      : 0;

  const baseCompactedVolumeCuFt = baseFootprintSqFt * (baseDepthInches / 12);
  const baseCompactedVolumeCuYds = baseCompactedVolumeCuFt / CUBIC_FEET_PER_CUBIC_YARD;

  // Loose compaction factor (typically 15% to 20% loose-to-compacted bulk adjustment)
  const baseCompactionFactor = 1 + Math.max(0, input.baseCompactionPercent ?? 15) / 100;
  const baseLooseOrderVolumeCuYds = baseIncluded ? baseCompactedVolumeCuYds * baseCompactionFactor : 0;
  // Standard dense-graded crushed stone (#21A / CR6 / road base): ~2,700 lbs/cu yd (1.35 tons/cu yd)
  const baseWeightTons = baseIncluded ? (baseLooseOrderVolumeCuYds * 2700) / LBS_PER_US_TON : 0;

  // 6. Bedding Sand Layer (ASTM C33)
  const beddingIncluded = input.includeBedding;
  const beddingDepthInches = Math.max(0, input.beddingDepthInches ?? 1.0); // standard 1 inch
  const beddingWastePercent = Math.max(0, input.beddingWastePercent ?? 5);

  const rawBeddingVolumeCuFt = netPavedAreaSqFt * (beddingDepthInches / 12);
  const beddingVolumeCuFt = beddingIncluded ? rawBeddingVolumeCuFt * (1 + beddingWastePercent / 100) : 0;
  const beddingVolumeCuYds = beddingVolumeCuFt / CUBIC_FEET_PER_CUBIC_YARD;
  const beddingWeightTons = beddingIncluded ? (beddingVolumeCuYds * 2700) / LBS_PER_US_TON : 0;
  // Standard 50-lb sand bag yields ~0.50 cu ft
  const beddingBags50lb = beddingIncluded && beddingVolumeCuFt > 0 ? Math.ceil(beddingVolumeCuFt / 0.50) : 0;

  // 7. Jointing / Polymeric Sand
  const jointSandIncluded = input.includeJointSand;
  // Empirical coverage: standard 4x8 with 1/8" joints yields ~75 sq ft / 50lb bag
  // Wide joints (1/4") yield ~40 sq ft / bag; large slabs (12x12) yield ~100 sq ft / bag
  let defaultBagCoverage = 75;
  if (moduleLengthInches >= 12 && moduleWidthInches >= 12) {
    defaultBagCoverage = 110;
  } else if (jointWidthInches >= 0.25) {
    defaultBagCoverage = 40;
  }
  const jointSandEstCoveragePerBagSqFt = input.jointSandCoverageSqFtPerBag ?? defaultBagCoverage;
  const jointSandBags50lb =
    jointSandIncluded && netPavedAreaSqFt > 0 && jointSandEstCoveragePerBagSqFt > 0
      ? Math.ceil(netPavedAreaSqFt / jointSandEstCoveragePerBagSqFt)
      : 0;

  // 8. Edge Restraint & Spikes
  const edgeRestraintIncluded = input.includeEdgeRestraints;
  const edgeSectionLengthFt = input.edgeSectionLengthFt ?? 7.5; // commercial sticks are typically 7.5' or 8'
  const spikeSpacingFt = (input.spikeSpacingInches ?? 18) / 12; // 18 inches standard, 12 inches heavy

  const edgeRestraintLinearFt = edgeRestraintIncluded ? exposedRestraintLinearFt : 0;
  const edgeRestraintSectionsNeeded =
    edgeRestraintIncluded && edgeRestraintLinearFt > 0 && edgeSectionLengthFt > 0
      ? Math.ceil(edgeRestraintLinearFt / edgeSectionLengthFt)
      : 0;
  const edgeSpikesNeeded =
    edgeRestraintIncluded && edgeRestraintLinearFt > 0 && spikeSpacingFt > 0
      ? Math.ceil(edgeRestraintLinearFt / spikeSpacingFt)
      : 0;

  // 9. Geotextile Fabric
  const geotextileIncluded = input.includeGeotextile;
  const geoOverlap = 1 + Math.max(0, input.geotextileOverlapPercent ?? 10) / 100;
  const geotextileTotalSqFt =
    geotextileIncluded && baseFootprintSqFt > 0 ? Math.ceil(baseFootprintSqFt * geoOverlap) : 0;

  // 10. Bill of Materials Compilation
  const billOfMaterials: PaverCalculationResult['billOfMaterials'] = [
    {
      category: 'Pavers',
      item: `${pPreset.name} (${paverLengthInches}" × ${paverWidthInches}" × ${paverThicknessInches}")`,
      quantity: orderPaverCount,
      unit: 'pieces',
      notes: `${Math.round(theoreticalPaverCount)} net theoretical + ${wastePercent}% cutting allowance (${LAYING_PATTERNS[input.patternId]?.name || 'Pattern'})`,
    },
    {
      category: 'Pavers',
      item: 'Paver Pallets (Procurement Unit)',
      quantity: palletsNeeded,
      unit: 'pallets',
      notes: `~${piecesPerPallet} pcs/pallet (or ~${sqFtPerPallet} sq ft/pallet)`,
    },
  ];

  if (baseIncluded && baseWeightTons > 0) {
    billOfMaterials.push({
      category: 'Sub-Base',
      item: `Dense-Graded Base Stone (#21A / CR6 / Road Base) — ${baseDepthInches}" compacted`,
      quantity: Number(baseWeightTons.toFixed(2)),
      unit: 'tons',
      notes: `${baseLooseOrderVolumeCuYds.toFixed(2)} loose bulk cu yds (${baseCompactedVolumeCuYds.toFixed(2)} yd³ compacted + ${input.baseCompactionPercent ?? 15}% compaction factor)`,
    });
  }

  if (beddingIncluded && beddingWeightTons > 0) {
    billOfMaterials.push({
      category: 'Bedding',
      item: `Coarse Concrete Bedding Sand (ASTM C33) — ${beddingDepthInches}" uncompacted`,
      quantity: Number(beddingWeightTons.toFixed(2)),
      unit: 'tons',
      notes: `${beddingVolumeCuYds.toFixed(2)} cu yds (or ${beddingBags50lb} × 50-lb bags); never pre-compact bedding sand`,
    });
  }

  if (jointSandIncluded && jointSandBags50lb > 0) {
    billOfMaterials.push({
      category: 'Joint Sand',
      item: 'Polymeric Joint Sand (Moisture-Activated)',
      quantity: jointSandBags50lb,
      unit: '50-lb bags',
      notes: `Based on ~${jointSandEstCoveragePerBagSqFt} sq ft per bag for ${jointWidthInches}" joints`,
    });
  }

  if (edgeRestraintIncluded && edgeRestraintSectionsNeeded > 0) {
    billOfMaterials.push({
      category: 'Edging',
      item: `Heavy-Duty Paver Edge Restraints (${edgeSectionLengthFt}' sections)`,
      quantity: edgeRestraintSectionsNeeded,
      unit: 'sections',
      notes: `${Math.round(edgeRestraintLinearFt)} linear ft exposed perimeter`,
    });
    billOfMaterials.push({
      category: 'Edging',
      item: 'Spiral Steel Anchoring Spikes (10" or 12")',
      quantity: edgeSpikesNeeded,
      unit: 'spikes',
      notes: `Spaced every ${input.spikeSpacingInches ?? 18}" into compacted aggregate shoulder`,
    });
  }

  if (geotextileIncluded && geotextileTotalSqFt > 0) {
    billOfMaterials.push({
      category: 'Subgrade Prep',
      item: 'Non-Woven Geotextile Separation Fabric',
      quantity: geotextileTotalSqFt,
      unit: 'sq ft',
      notes: 'Subgrade stabilization fabric with 10% overlap allowance',
    });
  }

  // 11. Cost Estimator
  let paverCost = 0;
  if (input.pricePerPaverPiece && input.pricePerPaverPiece > 0) {
    paverCost = orderPaverCount * input.pricePerPaverPiece;
  } else if (input.pricePerPaverSqFt && input.pricePerPaverSqFt > 0) {
    paverCost = totalPaverCoverageSqFt * input.pricePerPaverSqFt;
  } else if (input.pricePerPaverPallet && input.pricePerPaverPallet > 0) {
    paverCost = palletsNeeded * input.pricePerPaverPallet;
  }

  const baseCost =
    baseIncluded && input.pricePerBaseTon && input.pricePerBaseTon > 0 ? baseWeightTons * input.pricePerBaseTon : 0;
  const beddingCost =
    beddingIncluded && input.pricePerSandTon && input.pricePerSandTon > 0
      ? beddingWeightTons * input.pricePerSandTon
      : 0;
  const jointSandCost =
    jointSandIncluded && input.pricePerJointSandBag && input.pricePerJointSandBag > 0
      ? jointSandBags50lb * input.pricePerJointSandBag
      : 0;
  const edgingCost =
    edgeRestraintIncluded && input.pricePerEdgingPiece && input.pricePerEdgingPiece > 0
      ? edgeRestraintSectionsNeeded * input.pricePerEdgingPiece
      : 0;
  const geotextileCost =
    geotextileIncluded && input.pricePerGeotextileSqFt && input.pricePerGeotextileSqFt > 0
      ? geotextileTotalSqFt * input.pricePerGeotextileSqFt
      : 0;

  const materialSubtotal = paverCost + baseCost + beddingCost + jointSandCost + edgingCost + geotextileCost;
  const deliverySubtotal = input.deliveryFee && input.deliveryFee > 0 ? input.deliveryFee : 0;
  const laborSubtotal =
    input.laborCostPerSqFt && input.laborCostPerSqFt > 0 ? netPavedAreaSqFt * input.laborCostPerSqFt : 0;
  const equipmentSubtotal = input.equipmentRentalFee && input.equipmentRentalFee > 0 ? input.equipmentRentalFee : 0;

  const subtotalBeforeTax = materialSubtotal + deliverySubtotal + laborSubtotal + equipmentSubtotal;
  const taxRate = input.salesTaxPercent && input.salesTaxPercent > 0 ? input.salesTaxPercent / 100 : 0;
  const taxSubtotal = subtotalBeforeTax * taxRate;
  const grandTotal = subtotalBeforeTax + taxSubtotal;

  const hasCostData = grandTotal > 0;
  const costPerSqFt = hasCostData && netPavedAreaSqFt > 0 ? grandTotal / netPavedAreaSqFt : null;

  const missingPriceKeys: string[] = [];
  if (!input.pricePerPaverPiece && !input.pricePerPaverSqFt && !input.pricePerPaverPallet)
    missingPriceKeys.push('pavers');
  if (baseIncluded && !input.pricePerBaseTon) missingPriceKeys.push('base');
  if (beddingIncluded && !input.pricePerSandTon) missingPriceKeys.push('bedding');
  if (jointSandIncluded && !input.pricePerJointSandBag) missingPriceKeys.push('jointSand');
  if (!input.laborCostPerSqFt) missingPriceKeys.push('labor');

  return {
    totalGrossAreaSqFt,
    totalOpeningsAreaSqFt,
    netPavedAreaSqFt,
    netPavedAreaSqMeters,
    totalPerimeterLinearFt,
    exposedRestraintLinearFt,
    sections: sectionBreakdowns,
    paverLengthInches,
    paverWidthInches,
    paverThicknessInches,
    jointWidthInches,
    moduleAreaSqFt,
    paversPerSqFt,
    theoreticalPaverCount,
    wastePercent,
    orderPaverCount,
    totalPaverCoverageSqFt,
    totalPaverWeightTons,
    piecesPerPack,
    packsNeeded,
    piecesPerPallet,
    palletsNeeded,
    baseIncluded,
    baseDepthInches,
    baseFootprintSqFt,
    baseCompactedVolumeCuFt,
    baseCompactedVolumeCuYds,
    baseLooseOrderVolumeCuYds,
    baseWeightTons,
    beddingIncluded,
    beddingDepthInches,
    beddingVolumeCuFt,
    beddingVolumeCuYds,
    beddingWeightTons,
    beddingBags50lb,
    jointSandIncluded,
    jointSandBags50lb,
    jointSandEstCoveragePerBagSqFt,
    edgeRestraintIncluded,
    edgeRestraintLinearFt,
    edgeRestraintSectionsNeeded,
    edgeSpikesNeeded,
    geotextileIncluded,
    geotextileTotalSqFt,
    billOfMaterials,
    materialSubtotal,
    deliverySubtotal,
    laborSubtotal,
    equipmentSubtotal,
    subtotalBeforeTax,
    taxSubtotal,
    grandTotal,
    costPerSqFt,
    hasCostData,
    missingPriceKeys,
  };
}
