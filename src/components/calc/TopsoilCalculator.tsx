import React, { useState, useId } from 'react';
import { formatNumber } from '../../lib/calc/units';
import type { LengthUnit } from '../../lib/calc/units';
import { calculateTopsoil } from '../../lib/calc/topsoil';
import { saveProject } from '../../lib/storage/projects';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Bookmark, Check, RotateCcw, Sprout, Package, Layers } from 'lucide-react';

export default function TopsoilCalculator() {
  const [inputMode, setInputMode] = useState<'dimensions' | 'area'>('dimensions');
  const [length, setLength] = useState<number>(25);
  const [lengthUnit, setLengthUnit] = useState<LengthUnit>('feet');
  const [width, setWidth] = useState<number>(10);
  const [widthUnit, setWidthUnit] = useState<LengthUnit>('feet');
  const [areaSqFt, setAreaSqFt] = useState<number>(500);
  const [depthInches, setDepthInches] = useState<number>(3);
  const [wastePercent, setWastePercent] = useState<number>(10);
  const [selectedBagSize, setSelectedBagSize] = useState<number>(1.0);

  // Pricing
  const [pricePerUnit, setPricePerUnit] = useState<'cubic_yard' | 'bag'>('cubic_yard');
  const [unitPrice, setUnitPrice] = useState<number | ''>(42);
  const [deliveryFee, setDeliveryFee] = useState<number | ''>(55);
  const [saveStatus, setSaveStatus] = useState<string>('');

  const lengthId = useId();
  const widthId = useId();
  const areaId = useId();
  const depthId = useId();

  const result = calculateTopsoil({
    inputMode,
    length: Number(length) || 0,
    lengthUnit,
    width: Number(width) || 0,
    widthUnit,
    areaSqFt: Number(areaSqFt) || 0,
    depthInches: Number(depthInches) || 0,
    wastePercent,
    selectedBagSizeCuFt: selectedBagSize,
    unitPrice: typeof unitPrice === 'number' ? unitPrice : undefined,
    pricePerUnit,
    deliveryFee: typeof deliveryFee === 'number' ? deliveryFee : undefined,
  });

  const depthPresets = [
    { label: '¼" Topdressing', val: 0.25 },
    { label: '1" Overseeding', val: 1 },
    { label: '2" Lawn Leveling', val: 2 },
    { label: '4" New Lawn / Sod', val: 4 },
    { label: '6" Garden Bed', val: 6 },
    { label: '10" Raised Planter', val: 10 },
  ];

  const handleReset = () => {
    setLength(25);
    setWidth(10);
    setAreaSqFt(500);
    setDepthInches(3);
    setWastePercent(10);
    setUnitPrice(42);
    setDeliveryFee(55);
  };

  const handleSave = () => {
    saveProject({
      id: `topsoil-${Date.now()}`,
      name: `Topsoil Plan (${result.wasteAdjustedCubicYards.toFixed(2)} yds)`,
      projectType: 'topsoil',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inputs: { inputMode, length, width, areaSqFt, depthInches, wastePercent },
      summary: {
        totalCubicYards: result.wasteAdjustedCubicYards,
        totalTons: result.totalTons,
        totalCost: result.totalCost > 0 ? result.totalCost : undefined,
        primaryDescription: `${result.wasteAdjustedCubicYards.toFixed(2)} cu yds for ${result.areaSqFt.toFixed(0)} sq ft at ${depthInches}" depth`,
      },
      billOfMaterials: [
        {
          item: 'Screened Topsoil (Bulk)',
          quantity: result.wasteAdjustedCubicYards.toFixed(2),
          unit: 'cu yd',
        },
        {
          item: 'Estimated Weight',
          quantity: result.totalTons.toFixed(2),
          unit: 'tons',
        },
        {
          item: 'Equivalent 1.0 cu ft Retail Bags',
          quantity: result.bags100CuFt,
          unit: 'bags',
        },
      ],
    });
    setSaveStatus('Topsoil project saved locally!');
    setTimeout(() => setSaveStatus(''), 3000);
  };
  return (
    <Card className="overflow-hidden border-slate-200/90 shadow-sm">
      {/* Header */}
      <div className="bg-slate-900 text-white px-5 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
            <Sprout className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Topsoil Coverage Calculator</h2>
              <Badge variant="success" className="text-[10px] py-0 px-2 bg-emerald-600 hover:bg-emerald-600 text-white">
                Lawns, Raised Beds & Gardens
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              Calculate cubic yards, tons, and bags for topdressing, seeding, or planter beds
            </p>
          </div>
        </div>

        <Tabs value={inputMode} onValueChange={(val) => setInputMode(val as 'dimensions' | 'area')}>
          <TabsList className="bg-slate-800 border-slate-700 text-slate-300">
            <TabsTrigger value="dimensions" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white">
              Dimensions (L × W)
            </TabsTrigger>
            <TabsTrigger value="area" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white">
              Total Lawn Area (Sq Ft)
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Split Panel Body — Input LEFT (5 cols) | Results RIGHT (7 cols) */}
      <div className="p-4 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div>
            {inputMode === 'dimensions' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <option value="yards">yd</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor={areaId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                    Total Coverage Area
                  </Label>
                  <span className="text-[11px] text-slate-500">e.g., 5,000 sq ft yard</span>
                </div>
                <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600">
                  <input
                    id={areaId}
                    type="number"
                    min="0"
                    step="any"
                    value={areaSqFt}
                    onChange={(e) => setAreaSqFt(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none font-mono-numbers"
                  />
                  <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 flex items-center border-l border-slate-300">
                    sq ft
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Depth in Inches & Quick Depth Presets */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor={depthId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                Desired Topsoil Depth
              </Label>
              <span className="text-[11px] font-medium text-slate-500 font-mono-numbers">
                {depthInches}" ({formatNumber(depthInches / 12, 2)} ft)
              </span>
            </div>

            {/* Depth presets pills */}
            <div className="flex gap-1.5 flex-wrap">
              {depthPresets.map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setDepthInches(preset.val)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
                    depthInches === preset.val
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400 hover:text-emerald-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600">
              <input
                id={depthId}
                type="number"
                min="0.1"
                max="24"
                step="0.25"
                value={depthInches}
                onChange={(e) => setDepthInches(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none font-mono-numbers"
              />
              <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 flex items-center border-l border-slate-300">
                inches
              </span>
            </div>
          </div>

          {/* Settlement / Fluff Allowance */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Compaction & Settlement Allowance
                </span>
                <p className="text-[11px] text-slate-500">Screened soil settles 5%–10% after initial watering</p>
              </div>
              <Badge variant="success" className="font-mono-numbers">
                +{wastePercent}%
              </Badge>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 5, 10, 15].map((pct) => (
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
                  {pct === 0 ? 'Exact' : `+${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Cost Estimation */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Supplier Cost Estimate (Optional)
              </span>
              <span className="text-[11px] text-slate-500">Avg. ~$35–$50/yd bulk</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-[11px] text-slate-600 mb-1 block">Pricing By</Label>
                <select
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value as 'cubic_yard' | 'bag')}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs"
                >
                  <option value="cubic_yard">Per Cu Yd ($/yd³)</option>
                  <option value="bag">Per Bag ($/bag)</option>
                </select>
              </div>
              <div>
                <Label className="text-[11px] text-slate-600 mb-1 block">Unit Price ($)</Label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs font-mono-numbers"
                />
              </div>
              <div>
                <Label className="text-[11px] text-slate-600 mb-1 block">Delivery Fee ($)</Label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs font-mono-numbers"
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
              Save Topsoil Plan
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
                  Bulk Topsoil to Order
                </span>
                <Badge variant="outline" className="border-emerald-300 bg-white/80 text-emerald-800 text-[10px]">
                  +{wastePercent}% settlement included
                </Badge>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-['JetBrains_Mono',monospace] text-4xl sm:text-5xl font-bold text-slate-900 tabular-nums tracking-tight leading-none">
                  {formatNumber(result.wasteAdjustedCubicYards, 2)}
                </span>
                <span className="text-xl font-semibold text-slate-400">yd³</span>
              </div>

              <p className="text-xs text-slate-500 mt-2 font-['JetBrains_Mono',monospace]">
                Coverage: <strong className="text-slate-800">{formatNumber(result.areaSqFt, 0)} sq ft</strong> @ {depthInches}" depth ({formatNumber(result.totalTons, 2)} tons weight)
              </p>
            </div>
          </div>

          {/* Metric Bento Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-slate-100 rounded-xl p-2.5 sm:p-3 text-center">
              <div className="font-['JetBrains_Mono',monospace] text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                {formatNumber(result.wasteAdjustedCubicFeet, 1)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">cu ft</div>
              <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">Cubic Feet</div>
            </div>
            <div className="bg-slate-100 rounded-xl p-2.5 sm:p-3 text-center">
              <div className="font-['JetBrains_Mono',monospace] text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                {formatNumber(result.totalTons, 2)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">tons</div>
              <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">Weight</div>
            </div>
            <div className="bg-emerald-600 rounded-xl p-2.5 sm:p-3 text-center">
              <div className="font-['JetBrains_Mono',monospace] text-base sm:text-lg font-bold text-white tabular-nums">
                {result.bags100CuFt}
              </div>
              <div className="text-[10px] text-emerald-100 mt-0.5 font-medium">bags</div>
              <div className="text-[9px] text-emerald-200 mt-0.5 uppercase tracking-wider">1.0 cu ft Bags</div>
            </div>
          </div>

          {/* Bagged Retail Options Card */}
          <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-emerald-700" />
                Retail Bag Equivalents
              </span>
              <span className="text-[11px] text-slate-400">27 cu ft = 1 cu yd</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 sm:p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="text-sm font-bold text-slate-900 font-['JetBrains_Mono',monospace]">{result.bags100CuFt}</div>
                <div className="text-[10px] text-slate-500 font-medium">1.0 cu ft bags</div>
              </div>
              <div className="p-2 sm:p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="text-sm font-bold text-slate-900 font-['JetBrains_Mono',monospace]">{result.bags075CuFt}</div>
                <div className="text-[10px] text-slate-500 font-medium">0.75 cu ft bags</div>
              </div>
              <div className="p-2 sm:p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="text-sm font-bold text-slate-900 font-['JetBrains_Mono',monospace]">{result.bags150CuFt}</div>
                <div className="text-[10px] text-slate-500 font-medium">1.5 cu ft bags</div>
              </div>
            </div>
          </div>

          {/* Cost Summary (if applicable) */}
          {result.totalCost > 0 && (
            <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-emerald-200 shadow-2xs space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Estimated Material & Delivery Cost
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
