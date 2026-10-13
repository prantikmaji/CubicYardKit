import React, { useState, useId } from 'react';
import { formatNumber } from '../../lib/calc/units';
import type { LengthUnit } from '../../lib/calc/units';
import { calculateDirt } from '../../lib/calc/dirt';
import { saveProject } from '../../lib/storage/projects';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Bookmark, Truck, Check, RotateCcw, Shovel, Layers } from 'lucide-react';

export default function DirtCalculator() {
  const [shape, setShape] = useState<'rectangle' | 'circle'>('rectangle');
  const [length, setLength] = useState<number>(40);
  const [lengthUnit, setLengthUnit] = useState<LengthUnit>('feet');
  const [width, setWidth] = useState<number>(20);
  const [widthUnit, setWidthUnit] = useState<LengthUnit>('feet');
  const [diameter, setDiameter] = useState<number>(20);
  const [diameterUnit, setDiameterUnit] = useState<LengthUnit>('feet');
  const [depth, setDepth] = useState<number>(6);
  const [depthUnit, setDepthUnit] = useState<LengthUnit>('inches');
  const [settlementPercent, setSettlementPercent] = useState<number>(15);
  const [customDensity, setCustomDensity] = useState<number | ''>('');

  // Cost
  const [unitPrice, setUnitPrice] = useState<number | ''>(25);
  const [pricePerUnit, setPricePerUnit] = useState<'cubic_yard' | 'ton'>('cubic_yard');
  const [deliveryFee, setDeliveryFee] = useState<number | ''>(75);
  const [saveStatus, setSaveStatus] = useState<string>('');

  const lengthId = useId();
  const widthId = useId();
  const depthId = useId();
  const diameterId = useId();

  const result = calculateDirt({
    shape,
    length: Number(length) || 0,
    lengthUnit,
    width: Number(width) || 0,
    widthUnit,
    diameter: Number(diameter) || 0,
    diameterUnit,
    depth: Number(depth) || 0,
    depthUnit,
    settlementPercent,
    customDensityLbsPerCuYd: typeof customDensity === 'number' ? customDensity : undefined,
    unitPrice: typeof unitPrice === 'number' ? unitPrice : undefined,
    pricePerUnit,
    deliveryFee: typeof deliveryFee === 'number' ? deliveryFee : undefined,
  });

  const handleReset = () => {
    setLength(40);
    setWidth(20);
    setDiameter(20);
    setDepth(6);
    setSettlementPercent(15);
    setCustomDensity('');
    setUnitPrice(25);
    setDeliveryFee(75);
  };

  const handleSave = () => {
    saveProject({
      id: `dirt-${Date.now()}`,
      name: `Fill Dirt Estimate (${result.compactedAdjustedCubicYards.toFixed(2)} yds)`,
      projectType: 'dirt',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inputs: { shape, length, width, depth, depthUnit, settlementPercent },
      summary: {
        totalCubicYards: result.compactedAdjustedCubicYards,
        totalTons: result.totalTons,
        totalCost: result.totalCost > 0 ? result.totalCost : undefined,
        primaryDescription: `${result.compactedAdjustedCubicYards.toFixed(2)} cu yds (${result.totalTons.toFixed(2)} tons) of Fill Dirt with ${settlementPercent}% compaction allowance`,
      },
      billOfMaterials: [
        {
          item: 'Compacted Fill Dirt Required',
          quantity: result.compactedAdjustedCubicYards.toFixed(2),
          unit: 'cu yd',
        },
        {
          item: 'Estimated Weight',
          quantity: result.totalTons.toFixed(2),
          unit: 'tons',
        },
        {
          item: '10-yd Dump Truck Loads',
          quantity: result.estimatedDumpTruckloads,
          unit: 'truckloads',
        },
        {
          item: 'Standard Pickup Truck Trips (~1 yd³)',
          quantity: result.estimatedPickupTruckloads,
          unit: 'trips',
        },
      ],
    });
    setSaveStatus('Dirt project saved locally!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const DEPTH_PRESETS = [
    { label: '2"', value: 2 },
    { label: '4"', value: 4 },
    { label: '6"', value: 6 },
    { label: '8"', value: 8 },
    { label: '12"', value: 12 },
  ];

  return (
    <Card className="overflow-hidden border-slate-200/90 shadow-sm">
      {/* Header */}
      <div className="bg-slate-900 text-white px-5 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
            <Shovel className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Fill Dirt & Soil Calculator</h2>
              <Badge variant="success" className="text-[10px] py-0 px-2 bg-amber-600 hover:bg-amber-600 text-white border-none">
                Excavation & Regrading
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              Calculates compacted volume, settling allowance, weight tonnage & dump truck loads
            </p>
          </div>
        </div>

        <Tabs value={shape} onValueChange={(val) => setShape(val as 'rectangle' | 'circle')}>
          <TabsList className="bg-slate-800 border-slate-700 text-slate-300">
            <TabsTrigger value="rectangle" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              Rectangular Lot / Trench
            </TabsTrigger>
            <TabsTrigger value="circle" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              Circular / Mound
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Split Panel Body — Input LEFT (5 cols) | Results RIGHT (7 cols) */}
      <div className="p-4 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {shape === 'rectangle' ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor={lengthId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                    Length
                  </Label>
                  <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-amber-600 focus-within:border-amber-600">
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
                      <option value="meters">m</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={widthId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                    Width
                  </Label>
                  <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-amber-600 focus-within:border-amber-600">
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
                      <option value="meters">m</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor={diameterId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                  Diameter
                </Label>
                <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-amber-600 focus-within:border-amber-600">
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
                    <option value="yards">yd</option>
                    <option value="meters">m</option>
                  </select>
                </div>
              </div>
            )}

            {/* Depth with preset pills */}
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={depthId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                  Fill Depth
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
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-amber-400 hover:text-amber-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
                <span className="text-[10px] text-slate-400 self-center ml-1">or enter custom →</span>
              </div>

              <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-amber-600 focus-within:border-amber-600">
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

          {/* Compaction & Settlement Allowance */}
          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Shovel className="w-3.5 h-3.5 text-amber-800" />
                  Compaction & Settlement Allowance
                </span>
                <p className="text-[11px] text-amber-800/90">
                  Uncompacted fill shrinks 15%–20% once tamped or settled
                </p>
              </div>
              <Badge variant="outline" className="font-mono-numbers font-bold text-amber-900 border-amber-300 bg-amber-100/60">
                +{settlementPercent}% Added
              </Badge>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {[0, 10, 15, 20, 25].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setSettlementPercent(pct)}
                  className={`py-1.5 text-xs font-semibold rounded-md border transition-all ${
                    settlementPercent === pct
                      ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-100/50'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Optional Soil Density Override */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label className="text-xs text-slate-700 font-medium">
                Soil Density (Default ~2,200 lbs/cu yd)
              </Label>
              <span className="text-[11px] text-slate-500">Optional custom weight</span>
            </div>
            <div className="flex rounded-md border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-amber-600 bg-white shadow-2xs">
              <input
                type="number"
                placeholder="2200 (fill dirt standard)"
                value={customDensity}
                onChange={(e) => setCustomDensity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
              />
              <span className="bg-slate-50 text-slate-600 text-xs font-medium px-3 flex items-center border-l border-slate-200">
                lbs / cu yd
              </span>
            </div>
          </div>

          {/* Cost Estimation */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Supplier Cost Estimate (Optional)
              </span>
              <span className="text-[11px] text-slate-500">Avg. $15–$35/yd bulk</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-[11px] text-slate-600 mb-1 block">Quote Unit</Label>
                <select
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value as 'cubic_yard' | 'ton')}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                >
                  <option value="cubic_yard">Per Cubic Yard ($/yd³)</option>
                  <option value="ton">Per Ton ($/ton)</option>
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
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-amber-600 font-mono-numbers"
                />
              </div>
              <div>
                <Label className="text-[11px] text-slate-600 mb-1 block">Delivery Drop Fee ($)</Label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-amber-600 font-mono-numbers"
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
              className="flex-1 flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Save Dirt Project
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
          {/* Hero Result Card with warm earth amber/emerald glow */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 p-5 sm:p-6 result-hero-card">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/15 rounded-full -translate-y-12 translate-x-12 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-emerald-400/10 rounded-full translate-y-8 -translate-x-8 blur-2xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                  Total Fill Dirt to Order
                </span>
                <Badge variant="outline" className="border-amber-300 bg-white/80 text-amber-900 text-[10px]">
                  +{settlementPercent}% compaction included
                </Badge>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-['JetBrains_Mono',monospace] text-4xl sm:text-5xl font-bold text-slate-900 tabular-nums tracking-tight leading-none">
                  {formatNumber(result.compactedAdjustedCubicYards, 2)}
                </span>
                <span className="text-xl font-semibold text-slate-400">yd³</span>
              </div>

              <p className="text-xs text-slate-500 mt-2 font-['JetBrains_Mono',monospace]">
                Net excavation: <strong className="text-slate-800">{formatNumber(result.cubicYards, 2)} yd³</strong> ({formatNumber(result.cubicFeet, 0)} ft³) + {formatNumber(result.compactedAdjustedCubicYards - result.cubicYards, 2)} yd³ compaction
              </p>
            </div>
          </div>

          {/* Haulage Bento Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-slate-100 rounded-xl p-2.5 sm:p-3 text-center">
              <div className="font-['JetBrains_Mono',monospace] text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                {result.estimatedDumpTruckloads}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">truckloads</div>
              <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">10-yd Dumps</div>
            </div>
            <div className="bg-slate-100 rounded-xl p-2.5 sm:p-3 text-center">
              <div className="font-['JetBrains_Mono',monospace] text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                {formatNumber(result.totalTons, 2)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">tons</div>
              <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">Weight ({formatNumber(result.totalPounds, 0)} lbs)</div>
            </div>
            <div className="bg-amber-600 rounded-xl p-2.5 sm:p-3 text-center">
              <div className="font-['JetBrains_Mono',monospace] text-base sm:text-lg font-bold text-white tabular-nums">
                {formatNumber(result.areaSqFt, 0)}
              </div>
              <div className="text-[10px] text-amber-100 mt-0.5 font-medium">sq ft</div>
              <div className="text-[9px] text-amber-200 mt-0.5 uppercase tracking-wider">Surface Area</div>
            </div>
          </div>

          {/* Pickup Truck Trip Converter Card */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-sm">
                🛻
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Pickup Truck Trips Alternative</span>
                <span className="text-[11px] text-slate-500">Standard 6-ft bed (~1.0 yd³ max payload limit)</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-slate-900 font-['JetBrains_Mono',monospace]">
                ~{result.estimatedPickupTruckloads}
              </span>
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">trips</span>
            </div>
          </div>

          {/* Cost Summary (if applicable) */}
          {result.totalCost > 0 && (
            <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-amber-200 shadow-2xs space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Estimated Material & Hauling Cost
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-400">$</span>
                <span className="font-['JetBrains_Mono',monospace] text-2xl font-bold text-amber-700">
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
