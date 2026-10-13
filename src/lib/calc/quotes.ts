import { LBS_PER_US_TON } from './units';

export interface SupplierQuote {
  id: string;
  supplierName: string;
  pricingType: 'per_cubic_yard' | 'per_ton' | 'per_bag';
  unitPrice: number;
  deliveryFee: number;
  minOrderQuantity?: number; // minimum quantity to order
  bagYieldCuFt?: number; // if per_bag, volume per bag
  notes?: string;
}

export interface QuoteComparisonTarget {
  requiredCubicYards: number;
  densityLbsPerCuYd: number;
}

export interface QuoteEvaluation {
  quoteId: string;
  supplierName: string;
  pricingType: 'per_cubic_yard' | 'per_ton' | 'per_bag';
  unitPrice: number;
  purchasedQuantity: number;
  purchasedUnit: string;
  materialSubtotal: number;
  deliveryFee: number;
  totalCost: number;
  effectiveCostPerCubicYard: number;
  isLowestCost: boolean;
  notes?: string;
}

export function evaluateSupplierQuotes(
  target: QuoteComparisonTarget,
  quotes: SupplierQuote[]
): QuoteEvaluation[] {
  if (quotes.length === 0 || target.requiredCubicYards <= 0) return [];

  const requiredCuYds = target.requiredCubicYards;
  const requiredCuFt = requiredCuYds * 27;
  const totalLbs = requiredCuYds * target.densityLbsPerCuYd;
  const totalTons = totalLbs / LBS_PER_US_TON;

  const evaluations: QuoteEvaluation[] = quotes.map((q) => {
    let purchasedQuantity = 0;
    let purchasedUnit = '';
    let materialSubtotal = 0;

    if (q.pricingType === 'per_cubic_yard') {
      purchasedQuantity = Math.max(q.minOrderQuantity ?? 0, Math.ceil(requiredCuYds * 4) / 4); // round to nearest 0.25 yd
      purchasedUnit = 'Cubic Yards';
      materialSubtotal = purchasedQuantity * q.unitPrice;
    } else if (q.pricingType === 'per_ton') {
      purchasedQuantity = Math.max(q.minOrderQuantity ?? 0, Math.ceil(totalTons * 2) / 2); // round to nearest 0.5 ton
      purchasedUnit = 'Tons';
      materialSubtotal = purchasedQuantity * q.unitPrice;
    } else if (q.pricingType === 'per_bag') {
      const bagCuFt = q.bagYieldCuFt && q.bagYieldCuFt > 0 ? q.bagYieldCuFt : 0.5;
      const rawBags = Math.ceil(requiredCuFt / bagCuFt);
      purchasedQuantity = Math.max(q.minOrderQuantity ?? 0, rawBags);
      purchasedUnit = 'Bags';
      materialSubtotal = purchasedQuantity * q.unitPrice;
    }

    const deliveryFee = q.deliveryFee ?? 0;
    const totalCost = materialSubtotal + deliveryFee;
    const effectiveCostPerCubicYard = totalCost / requiredCuYds;

    return {
      quoteId: q.id,
      supplierName: q.supplierName || 'Unnamed Supplier',
      pricingType: q.pricingType,
      unitPrice: q.unitPrice,
      purchasedQuantity,
      purchasedUnit,
      materialSubtotal,
      deliveryFee,
      totalCost,
      effectiveCostPerCubicYard,
      isLowestCost: false,
      notes: q.notes,
    };
  });

  // Determine lowest cost
  if (evaluations.length > 0) {
    const minCost = Math.min(...evaluations.map((e) => e.totalCost));
    evaluations.forEach((e) => {
      e.isLowestCost = e.totalCost === minCost;
    });
  }

  return evaluations;
}
