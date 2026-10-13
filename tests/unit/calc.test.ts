import { describe, it, expect } from 'vitest';
import { toFeet, fromCubicFeet, CUBIC_FEET_PER_CUBIC_YARD } from '../../src/lib/calc/units';
import { calculateRectangularVolume, calculateCircularVolume } from '../../src/lib/calc/geometry';
import { calculateGravel } from '../../src/lib/calc/gravel';
import { calculateDirt } from '../../src/lib/calc/dirt';
import { calculateTopsoil } from '../../src/lib/calc/topsoil';
import { calculateConcrete } from '../../src/lib/calc/concrete';
import { calculateConcreteBlock } from '../../src/lib/calc/concrete-block';
import { calculatePatioPlan } from '../../src/lib/calc/patio-planner';
import { evaluateSupplierQuotes } from '../../src/lib/calc/quotes';
import type { SupplierQuote } from '../../src/lib/calc/quotes';

describe('Unit Conversions', () => {
  it('converts inches, yards, meters, and centimeters to feet accurately', () => {
    expect(toFeet(12, 'inches')).toBeCloseTo(1.0, 5);
    expect(toFeet(4, 'inches')).toBeCloseTo(4 / 12, 5);
    expect(toFeet(1, 'yards')).toBeCloseTo(3.0, 5);
    expect(toFeet(1, 'meters')).toBeCloseTo(3.28084, 4);
    expect(toFeet(100, 'centimeters')).toBeCloseTo(3.28084, 4);
  });

  it('handles negative or zero dimension inputs safely', () => {
    expect(toFeet(-10, 'feet')).toBe(0);
    expect(toFeet(0, 'feet')).toBe(0);
  });

  it('converts cubic feet to cubic yards and cubic meters', () => {
    expect(fromCubicFeet(27, 'cubic_yards')).toBe(1.0);
    expect(fromCubicFeet(54, 'cubic_yards')).toBe(2.0);
    expect(fromCubicFeet(27, 'cubic_meters')).toBeCloseTo(0.764555, 5);
  });
});

describe('Geometry Calculations', () => {
  it('matches prompt benchmark: 20 ft x 10 ft x 4 in rectangular volume', () => {
    // Benchmark from Section 13: 20 ft × 10 ft × 4 in
    // Depth in feet = 4 / 12
    // Volume = approx 66.6667 cu ft = approx 2.4691 cu yd
    const result = calculateRectangularVolume({
      length: 20,
      lengthUnit: 'feet',
      width: 10,
      widthUnit: 'feet',
      depth: 4,
      depthUnit: 'inches',
      wastePercent: 0,
    });

    expect(result.cubicFeet).toBeCloseTo(66.6667, 3);
    expect(result.cubicYards).toBeCloseTo(2.4691, 3);
    expect(result.areaSqFt).toBe(200);
  });

  it('applies waste percentage correctly to rectangular volume', () => {
    const result = calculateRectangularVolume({
      length: 20,
      lengthUnit: 'feet',
      width: 10,
      widthUnit: 'feet',
      depth: 4,
      depthUnit: 'inches',
      wastePercent: 10,
    });

    expect(result.wasteAdjustedCubicFeet).toBeCloseTo(66.6667 * 1.1, 3);
    expect(result.wasteAdjustedCubicYards).toBeCloseTo(2.4691 * 1.1, 3);
  });

  it('calculates circular cylinder volume correctly', () => {
    // 10 ft diameter circle, 6 in depth
    // radius = 5 ft, area = π * 25 = 78.5398 sq ft
    // depth = 0.5 ft, cu ft = 39.2699 cu ft, cu yds = 39.2699 / 27 = 1.4544
    const result = calculateCircularVolume({
      diameter: 10,
      diameterUnit: 'feet',
      depth: 6,
      depthUnit: 'inches',
      wastePercent: 0,
    });

    expect(result.areaSqFt).toBeCloseTo(78.5398, 3);
    expect(result.cubicFeet).toBeCloseTo(39.2699, 3);
    expect(result.cubicYards).toBeCloseTo(1.4544, 3);
  });
});

describe('Gravel Calculations', () => {
  it('calculates gravel volume, tonnage, and bags with density', () => {
    // 20 ft x 10 ft x 3 in = 50 cu ft = 1.8519 cu yd
    // With 10% waste = 2.037 cu yd
    // At 2700 lb/cu yd = 5,500 lbs = 2.75 tons
    const result = calculateGravel({
      shape: 'rectangle',
      length: 20,
      lengthUnit: 'feet',
      width: 10,
      widthUnit: 'feet',
      depth: 3,
      depthUnit: 'inches',
      wastePercent: 10,
      materialId: 'crushed-stone-base',
      bagSizeCuFt: 0.5,
    });

    expect(result.cubicFeet).toBeCloseTo(50, 2);
    expect(result.wasteAdjustedCubicYards).toBeCloseTo(2.037, 2);
    expect(result.totalTons).toBeCloseTo(2.75, 2);
    expect(result.bagsNeeded).toBe(Math.ceil(result.wasteAdjustedCubicFeet / 0.5));
  });

  it('supports custom density overrides', () => {
    const result = calculateGravel({
      shape: 'rectangle',
      length: 10,
      lengthUnit: 'feet',
      width: 10,
      widthUnit: 'feet',
      depth: 12,
      depthUnit: 'inches',
      wastePercent: 0,
      customDensityLbsPerCuYd: 3000,
    });

    // 100 cu ft = 3.7037 cu yd * 3000 = 11,111.11 lbs = 5.555 tons
    expect(result.totalTons).toBeCloseTo(5.556, 2);
  });
});

describe('Dirt & Settlement Calculations', () => {
  it('calculates fill dirt settlement and truckload estimates', () => {
    // 30 ft x 20 ft x 6 in = 300 cu ft = 11.111 cu yds
    // 15% settlement allowance = 12.778 cu yds
    const result = calculateDirt({
      shape: 'rectangle',
      length: 30,
      lengthUnit: 'feet',
      width: 20,
      widthUnit: 'feet',
      depth: 6,
      depthUnit: 'inches',
      settlementPercent: 15,
    });

    expect(result.cubicYards).toBeCloseTo(11.111, 2);
    expect(result.compactedAdjustedCubicYards).toBeCloseTo(12.778, 2);
    expect(result.estimatedDumpTruckloads).toBe(2); // 12.78 / 10 = 2 trucks
  });
});

describe('Topsoil & Coverage Calculations', () => {
  it('calculates square feet coverage for lawn applications', () => {
    // 1,000 sq ft lawn at 2 inches topdressing
    // 1,000 * (2/12) = 166.67 cu ft = 6.1728 cu yds
    // with 10% waste/settling = 6.79 cu yds
    const result = calculateTopsoil({
      inputMode: 'area',
      areaSqFt: 1000,
      depthInches: 2,
      wastePercent: 10,
    });

    expect(result.areaSqFt).toBe(1000);
    expect(result.cubicFeet).toBeCloseTo(166.67, 1);
    expect(result.wasteAdjustedCubicYards).toBeCloseTo(6.79, 1);
    expect(result.bags075CuFt).toBe(Math.ceil(result.wasteAdjustedCubicFeet / 0.75));
    expect(result.bags100CuFt).toBe(Math.ceil(result.wasteAdjustedCubicFeet / 1.0));
  });
});

describe('Concrete Slabs, Columns & Bag Yields', () => {
  it('calculates 10x10 slab at 4 inches with 80lb and 60lb bag yields', () => {
    // 10 x 10 x (4/12) = 33.333 cu ft = 1.2346 cu yd
    // With 10% waste = 36.667 cu ft = 1.358 cu yd
    // 80lb bag yield = 0.60 cu ft -> 36.667 / 0.60 = 61.11 -> 62 bags
    // 60lb bag yield = 0.45 cu ft -> 36.667 / 0.45 = 81.48 -> 82 bags
    const result = calculateConcrete({
      structureType: 'slab',
      length: 10,
      lengthUnit: 'feet',
      width: 10,
      widthUnit: 'feet',
      thicknessInches: 4,
      wastePercent: 10,
    });

    expect(result.cubicFeet).toBeCloseTo(33.333, 2);
    expect(result.wasteAdjustedCubicYards).toBeCloseTo(1.358, 2);
    expect(result.bags80lb).toBe(62);
    expect(result.bags60lb).toBe(82);
  });

  it('calculates cylindrical concrete post holes correctly', () => {
    // 12 in diameter = 1 ft diam, r = 0.5 ft
    // area = π * 0.25 = 0.7854 sq ft
    // depth = 3 ft, single hole = 2.3562 cu ft
    // 4 holes = 9.4248 cu ft
    const result = calculateConcrete({
      structureType: 'column',
      columnDiameterInches: 12,
      columnDepthFeet: 3,
      columnQuantity: 4,
      wastePercent: 10,
    });

    expect(result.cubicFeet).toBeCloseTo(9.4248, 2);
    expect(result.bags80lb).toBe(Math.ceil((9.4248 * 1.1) / 0.6));
  });
});

describe('Concrete Masonry Block (CMU)', () => {
  it('calculates block count, openings deduction, mortar, and core fill', () => {
    // Wall 20 ft long x 8 ft high = 160 sq ft
    // 1 door opening 3 ft x 7 ft = 21 sq ft
    // Net area = 139 sq ft
    // At 1.125 blocks/sq ft = 156.375 -> 157 base blocks
    // With 5% waste = 165 blocks
    const result = calculateConcreteBlock({
      wallLengthFeet: 20,
      wallHeightFeet: 8,
      openings: [{ widthFeet: 3, heightFeet: 7 }],
      wastePercent: 5,
      coreFillOption: 'all',
    });

    expect(result.grossWallAreaSqFt).toBe(160);
    expect(result.netWallAreaSqFt).toBe(139);
    expect(result.baseBlockCount).toBe(157);
    expect(result.totalBlocksNeeded).toBe(165);
    expect(result.mortarBagsNeeded).toBe(Math.ceil((165 / 100) * 3.5));
    // 165 blocks * 0.44 cu ft core fill = 72.6 cu ft = 2.689 cu yds
    expect(result.coreFillGroutCuFt).toBeCloseTo(72.6, 1);
    expect(result.coreFillGroutCuYd).toBeCloseTo(2.689, 2);
  });
});

describe('Patio Material Planner', () => {
  it('calculates multi-material bill of materials for 12x16 patio', () => {
    const plan = calculatePatioPlan({
      patioLengthFeet: 12,
      patioWidthFeet: 16,
      paverLengthInches: 8,
      paverWidthInches: 4,
      paverWastePercent: 10,
      baseDepthInches: 4,
      baseWastePercent: 10,
      beddingDepthInches: 1,
      beddingWastePercent: 5,
      includeEdgeRestraints: true,
      includeGeotextileFabric: true,
    });

    expect(plan.patioAreaSqFt).toBe(192);
    expect(plan.patioPerimeterLinearFt).toBe(56);
    expect(plan.edgeRestraintLinearFt).toBe(56);
    expect(plan.baseCubicYards).toBeGreaterThan(0);
    expect(plan.beddingCubicYards).toBeGreaterThan(0);
    expect(plan.totalPaverCountWithWaste).toBeGreaterThan(plan.basePaverCount);
    expect(plan.polymericSandBags50lb).toBe(Math.ceil(192 / 70));
  });
});

describe('Supplier Quote Evaluation', () => {
  it('normalizes bulk yards, tons, and bags to find true lowest cost', () => {
    const quotes: SupplierQuote[] = [
      {
        id: '1',
        supplierName: 'Bulk Yard Delivery',
        pricingType: 'per_cubic_yard',
        unitPrice: 45,
        deliveryFee: 75,
      },
      {
        id: '2',
        supplierName: 'Quarry By The Ton',
        pricingType: 'per_ton',
        unitPrice: 30,
        deliveryFee: 100,
      },
      {
        id: '3',
        supplierName: 'Big Box Bagged',
        pricingType: 'per_bag',
        unitPrice: 4.5,
        deliveryFee: 0,
        bagYieldCuFt: 0.5,
      },
    ];

    const evaluations = evaluateSupplierQuotes(
      { requiredCubicYards: 5, densityLbsPerCuYd: 2700 },
      quotes
    );

    expect(evaluations).toHaveLength(3);
    const lowest = evaluations.find((e) => e.isLowestCost);
    expect(lowest).toBeDefined();
    // Quote 1: 5 yd * $45 + $75 = $300
    // Quote 2: 5 yd * 1.35 = 6.75 tons -> rounded to 7 tons * $30 + $100 = $310
    // Quote 3: 5 yd = 135 cu ft / 0.5 = 270 bags * $4.5 = $1215
    expect(lowest?.supplierName).toBe('Bulk Yard Delivery');
  });
});
