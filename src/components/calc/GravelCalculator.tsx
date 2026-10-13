import React, { useState, useId } from 'react';
import { formatNumber } from '../../lib/calc/units';
import type { LengthUnit } from '../../lib/calc/units';
import { calculateGravel } from '../../lib/calc/gravel';
import { MATERIALS } from '../../data/materials';
import { saveProject } from '../../lib/storage/projects';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Bookmark, Truck, Check, Package, RotateCcw } from 'lucide-react';

export default function GravelCalculator() {
  const [shape, setShape] = useState<'rectangle' | 'circle'>('rectangle');
  const [materialId, setMaterialId] = useState<string>('crushed-stone-base');
  const [customDensity, setCustomDensity] = useState<number | ''>('');
  const [length, setLength] = useState<number>(30);
  const [lengthUnit, setLengthUnit] = useState<LengthUnit>('feet');
  const [width, setWidth] = useState<number>(10);
  const [widthUnit, setWidthUnit] = useState<LengthUnit>('feet');
  const [diameter, setDiameter] = useState<number>(14);
  const [diameterUnit, setDiameterUnit] = useState<LengthUnit>('feet');
  const [depth, setDepth] = useState<number>(3);
  const [depthUnit, setDepthUnit] = useState<LengthUnit>('inches');
  const [wastePercent, setWastePercent] = useState<number>(10);
  const [bagSizeCuFt, setBagSizeCuFt] = useState<number>(0.5);

  // Pricing
  const [pricePerUnit, setPricePerUnit] = useState<'ton' | 'cubic_yard' | 'bag'>('ton');
  const [unitPrice, setUnitPrice] = useState<number | ''>(40);
  const [deliveryFee, setDeliveryFee] = useState<number | ''>(65);
  const [saveStatus, setSaveStatus] = useState<string>('');

  const lengthId = useId();
  const widthId = useId();
  const depthId = useId();
  const diameterId = useId();

  const result = calculateGravel({
    shape,
    length: Number(length) || 0,
    lengthUnit,
    width: Number(width) || 0,
    widthUnit,
    diameter: Number(diameter) || 0,
    diameterUnit,
    depth: Number(depth) || 0,
    depthUnit,
    wastePercent,
    materialId,
    customDensityLbsPerCuYd: typeof customDensity === 'number' ? customDensity : undefined,
    bagSizeCuFt,
    unitPrice: typeof unitPrice === 'number' ? unitPrice : undefined,
    pricePerUnit,
    deliveryFee: typeof deliveryFee === 'number' ? deliveryFee : undefined,
  });

  const selectedMatObj = MATERIALS[materialId];

  const handleReset = () => {
    setLength(30);
    setWidth(10);
    setDepth(3);
    setWastePercent(10);
    setUnitPrice(40);
    setDeliveryFee(65);
  };

  const handleSave = () => {
    saveProject({
      id: `gravel-${Date.now()}`,
      name: `Gravel Project (${result.totalTons.toFixed(2)} Tons)`,
      projectType: 'gravel',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inputs: { shape, length, width, depth, depthUnit, wastePercent, materialId },
      summary: {
        totalCubicYards: result.wasteAdjustedCubicYards,
        totalTons: result.totalTons,
        totalCost: result.totalCost > 0 ? result.totalCost : undefined,
        primaryDescription: `${result.wasteAdjustedCubicYards.toFixed(2)} cu yds (${result.totalTons.toFixed(2)} tons) of ${selectedMatObj?.name || 'Gravel'}`,
      },
      billOfMaterials: [
        {
          item: `${selectedMatObj?.name || 'Gravel'} (Tons)`,
          quantity: result.totalTons.toFixed(2),
          unit: 'tons',
          estimatedCost: pricePerUnit === 'ton' && typeof unitPrice === 'number' ? result.totalTons * unitPrice : undefined,
        },
        {
          item: 'Volume in Cubic Yards',
          quantity: result.wasteAdjustedCubicYards.toFixed(2),
          unit: 'cu yd',
        },
        {
          item: 'Equivalent 50-lb (0.5 cu ft) Bags',
          quantity: result.bagsNeeded,
          unit: 'bags',
        },
      ],
    });
    setSaveStatus('Gravel project saved locally!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const DEPTH_PRESETS = [
    { label: '2"', value: 2 },
    { label: '3"', value: 3 },
    { label: '4"', value: 4 },
    { label: '6"', value: 6 },
  ];

  return (
    <Card className="overflow-hidden border-slate-200/90 shadow-sm">
      {/* Header */}
      <div className="bg-slate-900 text-white px-5 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Gravel & Stone Calculator</h2>
              <Badge variant="success" className="text-[10px] py-0 px-2">Yards, Tons & Bags</Badge>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">Driveway, walkway, and drainage aggregate estimation with certified scale weights</p>
          </div>
        </div>

        <Tabs value={shape} onValueChange={(val) => setShape(val as 'rectangle' | 'circle')}>
          <TabsList className="bg-slate-800 border-slate-700 text-slate-300">
            <TabsTrigger value="rectangle" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white">
              Driveway / Rectangle
            </TabsTrigger>
            <TabsTrigger value="circle" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white">
              Circular / Fire Pit
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Split Panel Body — Input LEFT (5 cols) | Results RIGHT (7 cols) */}
      <div className="p-4 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Material Type Selector */}
          <div>
            <Label className="text-xs uppercase tracking-wider text-slate-700 font-bold block mb-2">
              Select Gravel Aggregate Type
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMaterialId('crushed-stone-base');
                  setCustomDensity('');
                }}
                className={`p-3 text-left rounded-xl border text-xs transition-all ${
                  materialId === 'crushed-stone-base' && !customDensity
                    ? 'border-emerald-700 bg-emerald-50/60 ring-2 ring-emerald-600/20 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <span className="font-bold text-slate-900 block text-xs">Crushed Stone (3/4" / #57)</span>
                <span className="text-[11px] text-slate-500 font-mono-numbers">2,700 lb/yd³ (1.35 t/yd³)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMaterialId('pea-gravel');
                  setCustomDensity('');
                }}
                className={`p-3 text-left rounded-xl border text-xs transition-all ${
                  materialId === 'pea-gravel' && !customDensity
                    ? 'border-emerald-700 bg-emerald-50/60 ring-2 ring-emerald-600/20 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <span className="font-bold text-slate-900 block text-xs">Pea Gravel (3/8" Smooth)</span>
                <span className="text-[11px] text-slate-500 font-mono-numbers">2,800 lb/yd³ (1.40 t/yd³)</span>
              </button>
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {shape === 'rectangle' ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor={lengthId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                    Length
                  </Label>
                  <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600">
                    <input
                      id={lengthId}
                      type="number"
                      min="0"
                      step="any"
                      value={length}
                      onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none"
                    />
                    <select
                      value={lengthUnit}
                      onChange={(e) => setLengthUnit(e.target.value as LengthUnit)}
                      className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 border-l border-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="feet">ft</option>
                      <option value="inches">in</option>
                      <option value="yards">yd</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={widthId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                    Width
                  </Label>
                  <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600">
                    <input
                      id={widthId}
                      type="number"
                      min="0"
                      step="any"
                      value={width}
                      onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none"
                    />
                    <select
                      value={widthUnit}
                      onChange={(e) => setWidthUnit(e.target.value as LengthUnit)}
                      className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 border-l border-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="feet">ft</option>
                      <option value="inches">in</option>
                      <option value="yards">yd</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor={diameterId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                  Diameter
                </Label>
                <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600">
                  <input
                    id={diameterId}
                    type="number"
                    min="0"
                    step="any"
                    value={diameter}
                    onChange={(e) => setDiameter(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none"
                  />
                  <select
                    value={diameterUnit}
                    onChange={(e) => setDiameterUnit(e.target.value as LengthUnit)}
                    className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 border-l border-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="feet">ft</option>
                    <option value="inches">in</option>
                    <option value="yards">yd</option>
                  </select>
                </div>
              </div>
            )}

            {/* Depth with preset pills */}
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={depthId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                  Gravel Depth (Thickness)
                </Label>
                <span className="text-[11px] font-medium text-slate-500">
                  {depthUnit === 'inches' ? `${(depth / 12).toFixed(2)} ft` : `${(depth * 12).toFixed(1)} in`}
                </span>
              </div>

              {/* Depth preset pills */}
              <div className="flex gap-1.5 flex-wrap">
                {DEPTH_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => { setDepth(p.value); setDepthUnit('inches'); }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
                      depth === p.value && depthUnit === 'inches'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400 hover:text-emerald-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
                <span className="text-[10px] text-slate-400 self-center ml-1">or enter custom →</span>
              </div>

              <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600">
                <input
                  id={depthId}
                  type="number"
                  min="0"
                  step="any"
                  value={depth}
                  onChange={(e) => setDepth(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none"
                />
                <select
                  value={depthUnit}
                  onChange={(e) => setDepthUnit(e.target.value as LengthUnit)}
                  className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 border-l border-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="inches">inches (in)</option>
                  <option value="feet">feet (ft)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Waste & Compaction Allowance */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Compaction & Grade Waste Allowance
              </span>
              <Badge variant="success" className="font-mono-numbers">+{wastePercent}%</Badge>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[0, 5, 10, 15, 20].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setWastePercent(pct)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    wastePercent === pct
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pct === 0 ? '0% Exact' : `+${pct}%`}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Recommended: 10% for base rock & driveway gravel compaction.
            </p>
          </div>

          {/* Cost Estimates */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Optional Pricing Estimate
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-[11px] text-slate-600 block mb-1">Pricing By</Label>
                <select
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value as 'ton' | 'cubic_yard' | 'bag')}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs"
                >
                  <option value="ton">Per Ton ($/ton)</option>
                  <option value="cubic_yard">Per Cu Yd ($/yd³)</option>
                  <option value="bag">Per Bag ($/bag)</option>
                </select>
              </div>
              <div>
                <Label className="text-[11px] text-slate-600 block mb-1">Unit Price ($)</Label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs"
                />
              </div>
              <div>
                <Label className="text-[11px] text-slate-600 block mb-1">Delivery Fee ($)</Label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              title="Reset defaults"
              className="flex items-center gap-1.5 text-slate-600"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-1.5"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Save Gravel Takeoff
            </Button>
          </div>
          {saveStatus && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{saveStatus}</span>
            </div>
          )}
        </div>

        {/* Right Output - Live Results Dashboard (7 cols sticky) */}
        <div className="lg:col-span-7 flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          {/* Hero Result Card with emerald glow */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-5 sm:p-6 result-hero-card">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/15 rounded-full -translate-y-12 translate-x-12 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-emerald-300/10 rounded-full translate-y-8 -translate-x-8 blur-2xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                  Total Certified Weight to Order
                </span>
                <Badge variant="outline" className="border-emerald-300 bg-white/80 text-emerald-800 text-[10px]">
                  +{wastePercent}% waste included
                </Badge>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-['JetBrains_Mono',monospace] text-4xl sm:text-5xl font-bold text-slate-900 tabular-nums tracking-tight leading-none">
                  {formatNumber(result.totalTons, 2)}
                </span>
                <span className="text-lg sm:text-xl font-semibold text-slate-400">US Tons</span>
              </div>

              <p className="text-xs text-slate-500 mt-2 font-['JetBrains_Mono',monospace]">
                Bulk Volume: <strong className="text-slate-800">{formatNumber(result.wasteAdjustedCubicYards, 2)} yd³</strong> ({formatNumber(result.totalPounds, 0)} lbs @ {selectedMatObj?.name || 'Gravel'})
              </p>
            </div>
          </div>

          {/* Logistics Bento Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-slate-100 rounded-xl p-2.5 sm:p-3 text-center">
              <div className="font-['JetBrains_Mono',monospace] text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                {formatNumber(result.bagsNeeded, 0)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">bags</div>
              <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">50-lb Bags</div>
            </div>
            <div className="bg-slate-100 rounded-xl p-3 text-center">
              <div className="font-['JetBrains_Mono',monospace] text-lg font-bold text-slate-900 tabular-nums">
                {result.estimatedTriAxleTruckloads}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">hauls</div>
              <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">Tri-Axle (14T)</div>
            </div>
            <div className="bg-emerald-600 rounded-xl p-3 text-center">
              <div className="font-['JetBrains_Mono',monospace] text-lg font-bold text-white tabular-nums">
                {formatNumber(result.areaSqFt, 0)}
              </div>
              <div className="text-[10px] text-emerald-100 mt-0.5 font-medium">sq ft</div>
              <div className="text-[9px] text-emerald-200 mt-0.5 uppercase tracking-wider">Surface Area</div>
            </div>
          </div>

          {/* Total Cost Display (if calculated) */}
          {result.totalCost > 0 && (
            <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-2xs space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Estimated Material & Freight Cost
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-400">$</span>
                <span className="font-['JetBrains_Mono',monospace] text-2xl font-bold text-emerald-700">
                  {formatNumber(result.totalCost, 2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 border-t border-slate-100 pt-1.5 mt-1 font-['JetBrains_Mono',monospace]">
                <span>Material: ${formatNumber(result.materialCost, 2)}</span>
                {result.deliveryFee > 0 && <span>Delivery: ${formatNumber(result.deliveryFee, 2)}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
