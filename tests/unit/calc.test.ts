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


import { calculateConcreteSlabCost } from '../../src/lib/calc/concrete-slab-cost';

describe('Concrete Slab Cost Calculator', () => {
  const baseInput = {
    areas: [{ length: 12, lengthUnit: 'feet' as const, width: 20, widthUnit: 'feet' as const }],
    thicknessInches: 4,
    wastePercent: 10,
    minOrderYards: 1,
    orderIncrementYards: 0.25,
    bagSizeLabel: '80lb' as const,
    pricePerBag: null,
    pricePerCubicYard: null,
    deliveryFee: null,
    shortLoadFee: null,
    shortLoadThresholdYards: 4,
    excavationCostPerSqFt: null,
    gravelBaseCostPerSqFt: null,
    formworkCostPerLinFt: null,
    rebarCostPerSqFt: null,
    vaporBarrierCostPerSqFt: null,
    laborCostPerSqFt: null,
    finishCostPerSqFt: null,
    pumpFee: null,
    taxPercent: null,
    contingencyPercent: null,
    otherCost: null,
  };

  it('1. 12×20 slab, 4" thick, 10% waste, no cost data — geometry & volumes', () => {
    const r = calculateConcreteSlabCost(baseInput);
    expect(r.totalAreaSqFt).toBe(240);
    expect(r.netCubicFeet).toBeCloseTo(80, 5);
    expect(r.netCubicYards).toBeCloseTo(80 / 27, 5);
    expect(r.wasteAdjustedCubicYards).toBeCloseTo((80 / 27) * 1.10, 5);
    expect(r.hasCostData).toBe(false);
  });

  it('2. billedCubicYards with 0.25 increment rounds up correctly', () => {
    const r = calculateConcreteSlabCost(baseInput);
    // wasteAdjusted ≈ 3.2593: ceil(3.2593/0.25)*0.25 = ceil(13.037)*0.25 = 14*0.25 = 3.5
    expect(r.billedCubicYards).toBeCloseTo(3.5, 5);
  });

  it('3. short-load: small slab triggers shortLoadApplied when fee is set', () => {
    const r = calculateConcreteSlabCost({
      ...baseInput,
      areas: [{ length: 0.5, lengthUnit: 'feet', width: 0.5, widthUnit: 'feet' }],
      shortLoadFee: 200,
    });
    // billedCubicYards will be < 4, so short-load applies
    expect(r.shortLoadApplied).toBe(true);
    expect(r.shortLoadSubtotal).toBe(200);
  });

  it('4. cost: 12×20, $150/yd³, $75 delivery — grandTotal correct', () => {
    const r = calculateConcreteSlabCost({
      ...baseInput,
      pricePerCubicYard: 150,
      deliveryFee: 75,
    });
    // billedCubicYards = 3.5, concrete = 3.5 * 150 = 525, delivery = 75
    expect(r.concreteSubtotal).toBeCloseTo(3.5 * 150, 2);
    expect(r.deliverySubtotal).toBe(75);
    expect(r.grandTotal).toBeCloseTo(3.5 * 150 + 75, 2);
  });

  it('5. tax and contingency applied to subtotal correctly', () => {
    const r = calculateConcreteSlabCost({
      ...baseInput,
      pricePerCubicYard: 150,
      taxPercent: 10,
      contingencyPercent: 5,
    });
    const expectedSubtotal = r.concreteSubtotal;
    expect(r.subtotalBeforeTax).toBeCloseTo(expectedSubtotal, 2);
    expect(r.taxSubtotal).toBeCloseTo(expectedSubtotal * 0.10, 2);
    expect(r.contingencySubtotal).toBeCloseTo(expectedSubtotal * 0.05, 2);
    expect(r.grandTotal).toBeCloseTo(expectedSubtotal * 1.15, 2);
  });

  it('6. multiple slabs: two 10×10 = one 20×10 in total area', () => {
    const twoSlabs = calculateConcreteSlabCost({
      ...baseInput,
      areas: [
        { length: 10, lengthUnit: 'feet', width: 10, widthUnit: 'feet' },
        { length: 10, lengthUnit: 'feet', width: 10, widthUnit: 'feet' },
      ],
    });
    const oneRect = calculateConcreteSlabCost({
      ...baseInput,
      areas: [{ length: 20, lengthUnit: 'feet', width: 10, widthUnit: 'feet' }],
    });
    expect(twoSlabs.totalAreaSqFt).toBe(200);
    expect(twoSlabs.totalAreaSqFt).toBe(oneRect.totalAreaSqFt);
    expect(twoSlabs.netCubicYards).toBeCloseTo(oneRect.netCubicYards, 8);
  });

  it('7. wastePercent = 0 → wasteAdjustedCubicYards === netCubicYards', () => {
    const r = calculateConcreteSlabCost({ ...baseInput, wastePercent: 0 });
    expect(r.wasteAdjustedCubicYards).toBeCloseTo(r.netCubicYards, 10);
  });

  it('8. bags80lb = ceil(wasteAdjusted × 27 / 0.60)', () => {
    const r = calculateConcreteSlabCost(baseInput);
    // wasteAdjusted ≈ 3.2593
    const expectedBags = Math.ceil((r.wasteAdjustedCubicYards * 27) / 0.60);
    expect(r.bags80lb).toBe(expectedBags);
    // Per spec: ceil(3.259 × 27 / 0.60) = ceil(146.65) = 147
    expect(r.bags80lb).toBe(147);
  });

  it('9. missingPriceKeys includes "labor" when laborCostPerSqFt is null', () => {
    const r = calculateConcreteSlabCost({ ...baseInput, laborCostPerSqFt: null });
    expect(r.missingPriceKeys).toContain('labor');
  });

  it('10. hasCostData = true when any single price is provided', () => {
    const r = calculateConcreteSlabCost({ ...baseInput, pricePerCubicYard: 150 });
    expect(r.hasCostData).toBe(true);
    expect(r.grandTotal).toBeGreaterThan(0);
  });
});

import { calculateConcreteDriveway } from '../../src/lib/calc/concrete-driveway-cost';

describe('Concrete Driveway Cost Calculator', () => {
  const baseDrivewayInput = {
    scope: 'new' as const,
    sections: [
      {
        id: 'sec-1',
        label: 'Main Driveway',
        length: 20,
        lengthUnit: 'feet' as const,
        width: 10,
        widthUnit: 'feet' as const,
      },
    ],
    thicknessInches: 5,
    wastePercent: 10,
    minOrderYards: 1,
    orderIncrementYards: 0.25,
    shortLoadThresholdYards: 4,
    gravelBaseDepthInches: null,
    pricePerCubicYard: null,
    deliveryFee: null,
    shortLoadFee: null,
    excavationCostPerSqFt: null,
    demolitionCostPerSqFt: null,
    disposalCostPerSqFt: null,
    gravelBaseCostPerSqFt: null,
    formworkCostPerLinFt: null,
    rebarCostPerSqFt: null,
    vaporBarrierCostPerSqFt: null,
    laborCostPerSqFt: null,
    finishCostPerSqFt: null,
    controlJointCostPerLinFt: null,
    sealingCostPerSqFt: null,
    pumpFee: null,
    taxPercent: null,
    contingencyPercent: null,
    otherCost: null,
  };

  it('1. Single-car: 10×20, 5" thick, 10% waste, no cost — geometry & volumes', () => {
    const r = calculateConcreteDriveway(baseDrivewayInput);
    expect(r.totalAreaSqFt).toBe(200);
    expect(r.netCubicFeet).toBeCloseTo((200 * 5) / 12, 5);
    expect(r.netCubicYards).toBeCloseTo((200 * 5) / 324, 5);
    expect(r.wasteAdjustedCubicYards).toBeCloseTo(((200 * 5) / 324) * 1.10, 5);
    expect(r.billedCubicYards).toBeCloseTo(3.50, 5);
    expect(r.hasCostData).toBe(false);
    expect(r.costPerSqFt).toBeNull();
  });

  it('2. Two-car: 20×20, 5" thick, 10% waste — billed 7.00 yd³', () => {
    const r = calculateConcreteDriveway({
      ...baseDrivewayInput,
      sections: [
        {
          id: 'sec-1',
          label: 'Double Driveway',
          length: 20,
          lengthUnit: 'feet',
          width: 20,
          widthUnit: 'feet',
        },
      ],
    });
    expect(r.totalAreaSqFt).toBe(400);
    expect(r.netCubicYards).toBeCloseTo((400 * 5) / 324, 5);
    expect(r.wasteAdjustedCubicYards).toBeCloseTo(((400 * 5) / 324) * 1.10, 5);
    expect(r.billedCubicYards).toBeCloseTo(7.00, 5);
  });

  it('3. Multi-section: 10×20 + 10×10 parking apron sums areas & returns per-section breakdown', () => {
    const r = calculateConcreteDriveway({
      ...baseDrivewayInput,
      sections: [
        {
          id: 'sec-1',
          label: 'Main Driveway',
          length: 20,
          lengthUnit: 'feet',
          width: 10,
          widthUnit: 'feet',
        },
        {
          id: 'sec-2',
          label: 'Parking Apron',
          length: 10,
          lengthUnit: 'feet',
          width: 10,
          widthUnit: 'feet',
        },
      ],
    });
    expect(r.totalAreaSqFt).toBe(300);
    expect(r.sections.length).toBe(2);
    expect(r.sections[0].areaSquareFeet).toBe(200);
    expect(r.sections[1].areaSquareFeet).toBe(100);
  });

  it('4. Short-load surcharge applies when billedYards < 4 and shortLoadFee is provided', () => {
    const r = calculateConcreteDriveway({
      ...baseDrivewayInput,
      shortLoadFee: 175,
    });
    // billedCubicYards = 3.50 < 4
    expect(r.shortLoadApplied).toBe(true);
    expect(r.shortLoadSubtotal).toBe(175);
  });

  it('5. Replacement scope: demolitionSubtotal and disposalSubtotal are included in budget', () => {
    const r = calculateConcreteDriveway({
      ...baseDrivewayInput,
      scope: 'replacement',
      demolitionCostPerSqFt: 2.0,
      disposalCostPerSqFt: 1.5,
    });
    expect(r.scopeIncludesDemo).toBe(true);
    expect(r.demolitionSubtotal).toBe(200 * 2.0); // 400
    expect(r.disposalSubtotal).toBe(200 * 1.5);   // 300
    expect(r.subtotalBeforeTax).toBe(700);
  });

  it('6. New scope: demolitionSubtotal and disposalSubtotal are 0 even if rates are passed', () => {
    const r = calculateConcreteDriveway({
      ...baseDrivewayInput,
      scope: 'new',
      demolitionCostPerSqFt: 2.0,
      disposalCostPerSqFt: 1.5,
    });
    expect(r.scopeIncludesDemo).toBe(false);
    expect(r.demolitionSubtotal).toBe(0);
    expect(r.disposalSubtotal).toBe(0);
    expect(r.subtotalBeforeTax).toBe(0);
  });

  it('7. Cost calculation: $150/yd³, $75 delivery — correctly computes grandTotal', () => {
    const r = calculateConcreteDriveway({
      ...baseDrivewayInput,
      pricePerCubicYard: 150,
      deliveryFee: 75,
    });
    // 3.50 billed yards * 150 = 525 + 75 = 600
    expect(r.concreteSubtotal).toBeCloseTo(3.50 * 150, 2);
    expect(r.deliverySubtotal).toBe(75);
    expect(r.grandTotal).toBeCloseTo(600, 2);
  });

  it('8. Tax and contingency applied to subtotalBeforeTax correctly', () => {
    const r = calculateConcreteDriveway({
      ...baseDrivewayInput,
      pricePerCubicYard: 150,
      taxPercent: 8,
      contingencyPercent: 10,
    });
    const subtotal = 3.50 * 150;
    expect(r.subtotalBeforeTax).toBeCloseTo(subtotal, 2);
    expect(r.taxSubtotal).toBeCloseTo(subtotal * 0.08, 2);
    expect(r.contingencySubtotal).toBeCloseTo(subtotal * 0.10, 2);
    expect(r.grandTotal).toBeCloseTo(subtotal * (1 + 0.08 + 0.10), 2);
  });

  it('9. costPerSqFt = grandTotal / totalAreaSqFt when hasCostData', () => {
    const r = calculateConcreteDriveway({
      ...baseDrivewayInput,
      pricePerCubicYard: 150,
      deliveryFee: 75,
    });
    expect(r.costPerSqFt).toBeCloseTo(600 / 200, 2); // 3.00/sq ft
  });

  it('10. wastePercent = 0 -> wasteAdjustedCubicYards equals netCubicYards exactly', () => {
    const r = calculateConcreteDriveway({
      ...baseDrivewayInput,
      wastePercent: 0,
    });
    expect(r.wasteAdjustedCubicYards).toBeCloseTo(r.netCubicYards, 8);
  });

  it('11. gravelBaseCubicYards computed when depth provided', () => {
    const r = calculateConcreteDriveway({
      ...baseDrivewayInput,
      gravelBaseDepthInches: 4,
    });
    // 200 sq ft * (4/12) ft = 66.6667 cu ft / 27 = 2.4691 cu yd
    expect(r.gravelBaseCubicYards).toBeCloseTo((200 * (4 / 12)) / 27, 4);
  });

  it('12. truckloadsNeeded = ceil(billedCubicYards / 10)', () => {
    const r1 = calculateConcreteDriveway(baseDrivewayInput); // 3.5 yd -> 1 truck
    expect(r1.truckloadsNeeded).toBe(1);

    const r2 = calculateConcreteDriveway({
      ...baseDrivewayInput,
      sections: [{ id: 's1', label: 'Huge', length: 100, lengthUnit: 'feet', width: 20, widthUnit: 'feet' }],
    }); // 2000 sq ft * 5/12 / 27 = 30.86 yd -> ~34 yd -> 4 trucks
    expect(r2.truckloadsNeeded).toBe(4);
  });
});

import { calculateBricks, BRICK_PRESETS } from '../../src/lib/calc/brick';

describe('Brick Calculator', () => {
  const baseBrickInput = {
    walls: [
      {
        id: 'w1',
        name: 'Main Wall',
        length: 20,
        lengthUnit: 'feet' as const,
        height: 10,
        heightUnit: 'feet' as const,
        wythes: 1 as const,
        openings: [],
      },
    ],
    presetId: 'us-modular',
    jointThicknessInches: 0.375, // 3/8"
    wastePercent: 10,
    mortarLossPercent: 10,
    mortarMixRatio: '1:4' as const,
    packSize: 500,
  };

  it('1. US Modular standard yield: ~6.86 bricks per sq ft', () => {
    const r = calculateBricks(baseBrickInput);
    // Face module: (7.625 + 0.375) * (2.25 + 0.375) = 8.0 * 2.625 = 21 sq in
    // 144 / 21 = 6.85714...
    expect(r.bricksPerSqFtSingleWythe).toBeCloseTo(144 / 21, 4);
    // 200 sq ft wall * (144 / 21) = 1371.43
    expect(r.theoreticalBricks).toBe(1371);
    // with 10% waste: ceil(1371.43 * 1.10) = 1509
    expect(r.orderBricks).toBe(1509);
    // packs (500/pack): ceil(1509 / 500) = 4 packs
    expect(r.packsNeeded).toBe(4);
  });

  it('2. Double wythe wall doubles the theoretical bricks', () => {
    const rSingle = calculateBricks(baseBrickInput);
    const rDouble = calculateBricks({
      ...baseBrickInput,
      walls: [{ ...baseBrickInput.walls[0], wythes: 2 }],
    });
    // 200 sq ft * (144 / 21) * 2 = 2742.86 -> 2743 bricks
    expect(rDouble.theoreticalBricks).toBe(2743);
    expect(rDouble.theoreticalBricks).toBe(Math.round(rSingle.theoreticalBricks * 2 + 1));
    expect(rDouble.totalMasonryVolumeCuFt).toBeGreaterThan(rSingle.totalMasonryVolumeCuFt);
  });

  it('3. Opening deductions subtract opening square footage accurately', () => {
    const r = calculateBricks({
      ...baseBrickInput,
      walls: [
        {
          ...baseBrickInput.walls[0],
          openings: [
            {
              id: 'op-1',
              label: 'Window',
              width: 3,
              widthUnit: 'feet',
              height: 4,
              heightUnit: 'feet',
              count: 2, // 2 windows of 12 sq ft = 24 sq ft total
            },
          ],
        },
      ],
    });
    // 200 gross - 24 openings = 176 net sq ft
    expect(r.totalGrossAreaSqFt).toBe(200);
    expect(r.totalOpeningsAreaSqFt).toBe(24);
    expect(r.totalNetAreaSqFt).toBe(176);
    expect(r.theoreticalBricks).toBe(Math.round(176 * (144 / 21)));
  });

  it('4. UK Standard preset resolves correct dimensions and coverage (~59.3 bricks/m²)', () => {
    const r = calculateBricks({
      ...baseBrickInput,
      presetId: 'uk-standard',
      jointThicknessInches: 0.3937, // 10 mm
    });
    expect(r.preset.name).toContain('UK Standard');
    // UK nominal: 225 x 75 mm face = 0.016875 m2 -> 59.26 bricks/m2 = 5.505 bricks/sq ft
    expect(r.bricksPerSqFtSingleWythe).toBeCloseTo(5.505, 2);
  });

  it('5. Indian Modular preset has exactly 500 bricks per cubic meter of masonry', () => {
    // 190 x 90 x 90 mm with 10 mm joint gives 200 x 100 x 100 mm module = 0.002 m3
    // 1 m3 / 0.002 m3 = 500 bricks/m3
    const p = BRICK_PRESETS['in-modular'];
    const moduleVolM3 = (0.19 + 0.01) * (0.09 + 0.01) * (0.09 + 0.01);
    expect(Math.round(1 / moduleVolM3)).toBe(500);
    expect(p.lengthInches).toBeCloseTo(190 / 25.4, 2);
  });

  it('6. Mortar calculations: wet void, dry factor (1.33), cement & sand split for 1:4 mix', () => {
    const r = calculateBricks({
      ...baseBrickInput,
      mortarMixRatio: '1:4',
      dryVolumeFactor: 1.33,
    });
    expect(r.wetMortarVolumeCuFt).toBeGreaterThan(0);
    // dryMortar = wetMortar * 1.33
    expect(r.dryMortarVolumeCuFt).toBeCloseTo(r.wetMortarVolumeCuFt * 1.33, 4);
    // 1:4 mix: cement is 1/5 of dry volume, sand is 4/5
    expect(r.cementVolumeCuFt).toBeCloseTo(r.dryMortarVolumeCuFt / 5, 4);
    expect(r.sandVolumeCuFt).toBeCloseTo((r.dryMortarVolumeCuFt * 4) / 5, 4);
    // Bags: ceil(cementWeight / 94)
    expect(r.cementBags94lb).toBe(Math.ceil((r.cementVolumeCuFt * 94) / 94));
    // Premixed 80lb bags: ceil(wetMortar / 0.67)
    expect(r.premixMortarBags80lb).toBe(Math.ceil(r.wetMortarVolumeCuFt / 0.67));
  });

  it('7. Multi-wall aggregation: two 10×10 walls equal one 20×10 wall', () => {
    const twoWalls = calculateBricks({
      ...baseBrickInput,
      walls: [
        { id: 'w1', name: 'Wall A', length: 10, lengthUnit: 'feet', height: 10, heightUnit: 'feet', wythes: 1, openings: [] },
        { id: 'w2', name: 'Wall B', length: 10, lengthUnit: 'feet', height: 10, heightUnit: 'feet', wythes: 1, openings: [] },
      ],
    });
    const oneWall = calculateBricks(baseBrickInput);
    expect(twoWalls.totalNetAreaSqFt).toBe(200);
    expect(twoWalls.totalNetAreaSqFt).toBe(oneWall.totalNetAreaSqFt);
    expect(twoWalls.theoreticalBricks).toBe(oneWall.theoreticalBricks);
    expect(twoWalls.orderBricks).toBe(oneWall.orderBricks);
    expect(twoWalls.walls.length).toBe(2);
  });

  it('8. Cost calculation correctly computes grand total from prices', () => {
    const r = calculateBricks({
      ...baseBrickInput,
      pricePerBrick: 0.60,
      pricePerPremixMortarBag: 8.0,
      laborCostPerSqFt: 5.0,
      deliveryFee: 100,
    });
    expect(r.hasCostData).toBe(true);
    expect(r.brickSubtotal).toBeCloseTo(r.orderBricks * 0.60, 2);
    expect(r.mortarSubtotal).toBeCloseTo(r.premixMortarBags80lb * 8.0, 2);
    expect(r.laborSubtotal).toBeCloseTo(200 * 5.0, 2);
    expect(r.deliverySubtotal).toBe(100);
    const expectedTotal = r.brickSubtotal + r.mortarSubtotal + r.laborSubtotal + 100;
    expect(r.grandTotal).toBeCloseTo(expectedTotal, 2);
    expect(r.costPerSqFt).toBeCloseTo(expectedTotal / 200, 2);
  });

  it('9. Zero waste test: orderBricks equals ceiling of theoretical count', () => {
    const r = calculateBricks({
      ...baseBrickInput,
      wastePercent: 0,
    });
    // 1371.43 unrounded theoretical bricks rounds up to 1372 whole units
    expect(r.orderBricks).toBe(1372);
  });

  it('10. Custom brick dimensions are honored', () => {
    const r = calculateBricks({
      ...baseBrickInput,
      presetId: 'custom',
      customDimensions: {
        lengthInches: 10,
        widthInches: 4,
        heightInches: 3,
      },
      jointThicknessInches: 0.5,
    });
    expect(r.preset.id).toBe('custom');
    // Module: (10 + 0.5) * (3 + 0.5) = 10.5 * 3.5 = 36.75 sq in
    // 144 / 36.75 = 3.918 bricks / sq ft
    expect(r.bricksPerSqFtSingleWythe).toBeCloseTo(144 / 36.75, 4);
  });
});
