import React, { useState } from 'react';
import { formatNumber } from '../../lib/calc/units';
import { evaluateSupplierQuotes } from '../../lib/calc/quotes';
import type { SupplierQuote } from '../../lib/calc/quotes';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Plus, Trash2, Award, Calculator, Layers, TrendingDown, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function QuoteComparisonIsland() {
  const [requiredCubicYards, setRequiredCubicYards] = useState<number>(6);
  const [densityLbsPerCuYd, setDensityLbsPerCuYd] = useState<number>(2700);

  const [quotes, setQuotes] = useState<SupplierQuote[]>([
    {
      id: '1',
      supplierName: 'ABC Landscape Supply (Bulk Yard)',
      pricingType: 'per_cubic_yard',
      unitPrice: 48,
      deliveryFee: 75,
      minOrderQuantity: 3,
      notes: 'Delivered in single-axle dump truck',
    },
    {
      id: '2',
      supplierName: 'Valley Quarry Direct (Scale Tons)',
      pricingType: 'per_ton',
      unitPrice: 32,
      deliveryFee: 110,
      minOrderQuantity: 5,
      notes: 'Billed on certified scale ticket',
    },
    {
      id: '3',
      supplierName: 'Big Box Retail (50-lb Bags)',
      pricingType: 'per_bag',
      unitPrice: 4.85,
      deliveryFee: 0,
      bagYieldCuFt: 0.5,
      notes: 'Self-pickup with personal truck',
    },
  ]);

  const addQuote = () => {
    setQuotes((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        supplierName: `Supplier #${prev.length + 1}`,
        pricingType: 'per_cubic_yard',
        unitPrice: 45,
        deliveryFee: 50,
        notes: '',
      },
    ]);
  };

  const removeQuote = (id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuote = (id: string, field: keyof SupplierQuote, val: any) => {
    setQuotes((prev) =>
      prev.map((q) => (o => o.id === id ? { ...o, [field]: val } : o)(q))
    );
  };

  const evaluations = evaluateSupplierQuotes(
    {
      requiredCubicYards: Number(requiredCubicYards) || 0,
      densityLbsPerCuYd: Number(densityLbsPerCuYd) || 2700,
    },
    quotes
  );

  const winningEval = evaluations.find((e) => e.isLowestCost) || evaluations[0];
  const totalTonsTarget = ((Number(requiredCubicYards) || 0) * (Number(densityLbsPerCuYd) || 2700)) / 2000;

  // Calculate savings vs most expensive
  const highestCost = evaluations.reduce((max, e) => Math.max(max, e.totalCost), 0);
  const lowestCost = winningEval?.totalCost || 0;
  const savingsAmount = highestCost - lowestCost;
  const savingsPct = highestCost > 0 ? (savingsAmount / highestCost) * 100 : 0;

  const VOLUME_PRESETS = [
    { label: '3 yd³', value: 3 },
    { label: '6 yd³', value: 6 },
    { label: '10 yd³', value: 10 },
    { label: '15 yd³', value: 15 },
  ];

  return (
    <Card className="overflow-hidden border-slate-200/90 shadow-sm">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white px-5 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Supplier Quote Comparison Tool</h2>
              <Badge variant="success" className="text-[10px] py-0 px-2 bg-emerald-600 hover:bg-emerald-600 text-white">
                Decision Matrix
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              Normalizes diverse supplier bids across bulk yards, scale weight tons, and packaged retail bags
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={addQuote}
          size="sm"
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Supplier Quote
        </Button>
      </div>

      <div className="p-4 sm:p-6 lg:p-7 space-y-5 sm:space-y-6">
        {/* Baseline Target Quantities */}
        <div className="bg-slate-50/90 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-emerald-700" />
              Target Project Requirement
            </Label>
            <span className="text-[11px] text-slate-500">Applies to all evaluated bids</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-600 font-medium">Required Volume (Cubic Yards)</Label>
                {/* Volume preset buttons */}
                <div className="flex gap-1">
                  {VOLUME_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setRequiredCubicYards(p.value)}
                      className={`px-2 py-0.5 text-xs font-semibold rounded border transition-all ${
                        requiredCubicYards === p.value
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400 hover:text-emerald-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600">
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={requiredCubicYards}
                  onChange={(e) => setRequiredCubicYards(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none font-mono-numbers"
                />
                <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 flex items-center border-l border-slate-300">
                  cu yd
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-slate-600 font-medium">Material Density & Classification</Label>
              <select
                value={densityLbsPerCuYd}
                onChange={(e) => setDensityLbsPerCuYd(parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-600 h-[38px]"
              >
                <option value={2700}>Crushed Stone / Gravel (2,700 lb/yd³ = 1.35 tons)</option>
                <option value={2800}>Pea Gravel (2,800 lb/yd³ = 1.40 tons)</option>
                <option value={2400}>Fill Dirt (2,400 lb/yd³ = 1.20 tons)</option>
                <option value={2100}>Topsoil (2,100 lb/yd³ = 1.05 tons)</option>
                <option value={4050}>Concrete (4,050 lb/yd³ = 2.025 tons)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hero Winner Banner & Bento Trio */}
        {winningEval && (
          <div className="space-y-4">
            {/* Winner Hero Card */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-5 sm:p-6 result-hero-card">
              <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-400/15 rounded-full -translate-y-12 translate-x-12 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-28 h-28 bg-emerald-300/10 rounded-full translate-y-8 -translate-x-8 blur-2xl pointer-events-none" />

              <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="success" className="bg-emerald-700 hover:bg-emerald-700 text-white gap-1 text-xs py-0.5">
                      <Award className="w-3.5 h-3.5" />
                      Lowest Landed Cost Winner
                    </Badge>
                    <span className="text-xs text-slate-500">Based on normalized {requiredCubicYards} cu yd equivalent</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    {winningEval.supplierName}
                  </h3>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-['JetBrains_Mono',monospace] text-4xl sm:text-5xl font-bold text-slate-900 tabular-nums tracking-tight leading-none">
                      ${formatNumber(winningEval.totalCost, 2)}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">
                      All-In Total (${formatNumber(winningEval.effectiveCostPerCubicYard, 2)}/yd³)
                    </span>
                  </div>
                </div>

                {savingsAmount > 0 && evaluations.length > 1 && (
                  <div className="bg-white/90 backdrop-blur-xs rounded-xl p-3.5 border border-emerald-200 shadow-2xs text-right">
                    <div className="flex items-center gap-1.5 justify-end text-xs font-bold text-emerald-800">
                      <TrendingDown className="w-4 h-4 text-emerald-600" />
                      Saves ${formatNumber(savingsAmount, 2)} ({savingsPct.toFixed(0)}%)
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      compared to highest quote (${formatNumber(highestCost, 2)})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bento Metric Trio */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Target Project Size
                </span>
                <div className="font-['JetBrains_Mono',monospace] text-2xl font-bold text-slate-900 tabular-nums mt-1">
                  {requiredCubicYards} yd³
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Equivalent to {formatNumber(totalTonsTarget, 2)} US Tons
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Best Rate / Cu Yard
                </span>
                <div className="font-['JetBrains_Mono',monospace] text-2xl font-bold text-emerald-800 tabular-nums mt-1">
                  ${formatNumber(winningEval.effectiveCostPerCubicYard, 2)}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Includes delivery amortized
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Bid Spread Variance
                </span>
                <div className="font-['JetBrains_Mono',monospace] text-2xl font-bold text-slate-900 tabular-nums mt-1">
                  ${formatNumber(highestCost - lowestCost, 2)}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Max difference across suppliers
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Editable Quote Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              Supplier Quotes ({quotes.length})
            </Label>
            <span className="text-[11px] text-slate-500">Edit unit pricing, delivery fees, and order minimums</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
            {quotes.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-2xs space-y-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <Badge variant="outline" className="text-[10px] font-semibold text-slate-600 bg-slate-50">
                    Quote #{idx + 1}
                  </Badge>
                  {quotes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuote(q.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                      title="Delete quote"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-600 font-medium">Supplier Name</Label>
                  <input
                    type="text"
                    value={q.supplierName}
                    onChange={(e) => updateQuote(q.id, 'supplierName', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600 font-medium">Pricing Unit</Label>
                    <select
                      value={q.pricingType}
                      onChange={(e) => updateQuote(q.id, 'pricingType', e.target.value as any)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="per_cubic_yard">Per Cu Yd</option>
                      <option value="per_ton">Per Ton</option>
                      <option value="per_bag">Per Bag</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600 font-medium">Unit Price ($)</Label>
                    <input
                      type="number"
                      step="any"
                      value={q.unitPrice}
                      onChange={(e) => updateQuote(q.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs font-mono-numbers focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600 font-medium">Delivery Fee ($)</Label>
                    <input
                      type="number"
                      step="any"
                      value={q.deliveryFee}
                      onChange={(e) => updateQuote(q.id, 'deliveryFee', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs font-mono-numbers focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600 font-medium">Min Order</Label>
                    <input
                      type="number"
                      step="any"
                      placeholder="None"
                      value={q.minOrderQuantity || ''}
                      onChange={(e) => updateQuote(q.id, 'minOrderQuantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs font-mono-numbers focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-500 font-medium">Notes / Terms</Label>
                  <input
                    type="text"
                    placeholder="e.g., Tri-axle dump, 48hr lead time"
                    value={q.notes || ''}
                    onChange={(e) => updateQuote(q.id, 'notes', e.target.value)}
                    className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Normalized Comparison Matrix Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Normalized Cost Comparison (Equivalent {requiredCubicYards} Cubic Yards)
            </span>
            <span className="text-[11px] text-slate-500">Ranked by lowest total landed cost</span>
          </div>

          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200">
                  <TableHead className="font-bold text-slate-700">Rank & Supplier</TableHead>
                  <TableHead className="font-bold text-slate-700">Purchased Units</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Material Subtotal</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Delivery Drop</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Total All-In Cost</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Effective $/yd³</TableHead>
                  <TableHead className="text-center font-bold text-slate-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluations.map((ev, rankIdx) => (
                  <TableRow
                    key={ev.quoteId}
                    className={ev.isLowestCost ? 'bg-emerald-50/60 font-semibold hover:bg-emerald-50/80' : ''}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          ev.isLowestCost ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {rankIdx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{ev.supplierName}</div>
                          {ev.notes && <div className="text-[10px] text-slate-500">{ev.notes}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 font-mono-numbers">
                      {formatNumber(ev.purchasedQuantity, 1)} {ev.purchasedUnit}
                    </TableCell>
                    <TableCell className="text-right font-mono-numbers">
                      ${formatNumber(ev.materialSubtotal, 2)}
                    </TableCell>
                    <TableCell className="text-right font-mono-numbers">
                      {ev.deliveryFee > 0 ? `$${formatNumber(ev.deliveryFee, 2)}` : 'Free / Included'}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`text-sm font-mono-numbers ${
                          ev.isLowestCost ? 'text-emerald-800 font-black' : 'text-slate-900 font-bold'
                        }`}
                      >
                        ${formatNumber(ev.totalCost, 2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-slate-600 font-mono-numbers">
                      ${formatNumber(ev.effectiveCostPerCubicYard, 2)} / yd³
                    </TableCell>
                    <TableCell className="text-center">
                      {ev.isLowestCost ? (
                        <Badge variant="success" className="bg-emerald-700 hover:bg-emerald-700 text-white gap-1 text-[10px] py-0.5">
                          <Award className="w-3 h-3" />
                          Lowest Cost
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-slate-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Card>
  );
}
