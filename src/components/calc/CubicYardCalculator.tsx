import React, { useState, useId } from 'react';
import { formatNumber } from '../../lib/calc/units';
import type { LengthUnit } from '../../lib/calc/units';
import { calculateRectangularVolume, calculateCircularVolume } from '../../lib/calc/geometry';
import { saveProject } from '../../lib/storage/projects';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Bookmark, Calculator, Check, RotateCcw } from 'lucide-react';

export default function CubicYardCalculator() {
  const [shape, setShape] = useState<'rectangle' | 'circle'>('rectangle');
  const [length, setLength] = useState<number>(20);
  const [lengthUnit, setLengthUnit] = useState<LengthUnit>('feet');
  const [width, setWidth] = useState<number>(10);
  const [widthUnit, setWidthUnit] = useState<LengthUnit>('feet');
  const [diameter, setDiameter] = useState<number>(12);
  const [diameterUnit, setDiameterUnit] = useState<LengthUnit>('feet');
  const [depth, setDepth] = useState<number>(4);
  const [depthUnit, setDepthUnit] = useState<LengthUnit>('inches');
  const [wastePercent, setWastePercent] = useState<number>(10);

  // Optional density estimator
  const [selectedMaterial, setSelectedMaterial] = useState<string>('none');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [saveStatus, setSaveStatus] = useState<string>('');

  const lengthId = useId();
  const widthId = useId();
  const depthId = useId();
  const diameterId = useId();

  const result =
    shape === 'circle'
      ? calculateCircularVolume({
          diameter: Number(diameter) || 0,
          diameterUnit,
          depth: Number(depth) || 0,
          depthUnit,
          wastePercent,
        })
      : calculateRectangularVolume({
          length: Number(length) || 0,
          lengthUnit,
          width: Number(width) || 0,
          widthUnit,
          depth: Number(depth) || 0,
          depthUnit,
          wastePercent,
        });

  // Material densities in lbs/cu yd
  const materialDensities: Record<string, { name: string; lbs: number; tons: number }> = {
    gravel: { name: 'Crushed Gravel / Stone', lbs: 2700, tons: 1.35 },
    peaGravel: { name: 'Pea Gravel', lbs: 2800, tons: 1.4 },
    dirt: { name: 'Fill Dirt', lbs: 2400, tons: 1.2 },
    topsoil: { name: 'Topsoil (Dry Screened)', lbs: 2100, tons: 1.05 },
    concrete: { name: 'Normal Ready-Mix Concrete', lbs: 4050, tons: 2.025 },
  };

  const activeMaterial = materialDensities[selectedMaterial];
  const estimatedTons = activeMaterial
    ? (result.wasteAdjustedCubicYards * activeMaterial.lbs) / 2000
    : null;

  const cost =
    typeof unitPrice === 'number' && unitPrice > 0
      ? result.wasteAdjustedCubicYards * unitPrice
      : null;

  const handleReset = () => {
    setLength(20);
    setWidth(10);
    setDiameter(12);
    setDepth(4);
    setWastePercent(10);
    setSelectedMaterial('none');
    setUnitPrice('');
  };

  const handleSave = () => {
    saveProject({
      id: `cy-${Date.now()}`,
      name: `Cubic Yard Takeoff (${result.wasteAdjustedCubicYards.toFixed(2)} yds)`,
      projectType: 'cubic-yard',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inputs: { shape, length, width, diameter, depth, depthUnit, wastePercent },
      summary: {
        totalCubicYards: result.wasteAdjustedCubicYards,
        totalTons: estimatedTons ?? undefined,
        totalCost: cost ?? undefined,
        primaryDescription: `${result.wasteAdjustedCubicYards.toFixed(2)} cubic yards with ${wastePercent}% waste`,
      },
      billOfMaterials: [
        {
          item: 'Volume Required (Net)',
          quantity: result.cubicYards.toFixed(2),
          unit: 'cu yd',
        },
        {
          item: `Total With ${wastePercent}% Waste Allowance`,
          quantity: result.wasteAdjustedCubicYards.toFixed(2),
          unit: 'cu yd',
        },
        ...(activeMaterial
          ? [
              {
                item: `Estimated Weight (${activeMaterial.name})`,
                quantity: estimatedTons?.toFixed(2) ?? '0',
                unit: 'tons',
              },
            ]
          : []),
      ],
    });
    setSaveStatus('Project saved locally!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // Depth preset pills (common construction/landscaping standards)
  const DEPTH_PRESETS = [
    { label: '1"', value: 1 },
    { label: '2"', value: 2 },
    { label: '3"', value: 3 },
    { label: '4"', value: 4 },
    { label: '6"', value: 6 },
  ];

  return (
    <Card className="overflow-hidden border-slate-200/90 shadow-sm">
      {/* Top Header Bar */}
      <div className="bg-slate-900 text-white px-5 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Cubic Yard Calculator</h2>
              <Badge variant="success" className="text-[10px] py-0 px-2">Production Grade</Badge>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">Volumetric calculations with ASTM industry compaction standards</p>
          </div>
        </div>

        {/* Shape Switcher */}
        <Tabs value={shape} onValueChange={(val) => setShape(val as 'rectangle' | 'circle')}>
          <TabsList className="bg-slate-800 border-slate-700 text-slate-300">
            <TabsTrigger value="rectangle" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white">
              Rectangular
            </TabsTrigger>
            <TabsTrigger value="circle" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white">
              Circular
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Split Panel Body — Input LEFT (5 cols) | Results RIGHT (7 cols) */}
      <div className="p-4 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* ── LEFT: Input Panel ── */}
        <div className="lg:col-span-5 space-y-5">

          {/* Dimension Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {shape === 'rectangle' ? (
              <>
                {/* Length */}
                <div className="space-y-1.5">
                  <Label htmlFor={lengthId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                    Length
                  </Label>
                  <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600 transition-shadow">
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
                      <option value="meters">m</option>
                    </select>
                  </div>
                </div>

                {/* Width */}
                <div className="space-y-1.5">
                  <Label htmlFor={widthId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                    Width
                  </Label>
                  <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600 transition-shadow">
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
                      <option value="meters">m</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              /* Diameter */
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor={diameterId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                  Diameter
                </Label>
                <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600 transition-shadow">
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
                    <option value="meters">m</option>
                  </select>
                </div>
              </div>
            )}

            {/* Depth / Thickness + Preset Pills */}
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={depthId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                  Depth / Layer Thickness
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

              <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600 transition-shadow">
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
                  <option value="centimeters">centimeters (cm)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Waste Allowance Buttons */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Waste & Compaction Allowance
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
                  {pct === 0 ? 'Exact' : `+${pct}%`}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Recommended: 10% for gravel & concrete; 15% for subsoil/fill dirt settlement.
            </p>
          </div>

          {/* Optional Material & Price Estimators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600 font-medium">
                Weight Estimator (Optional)
              </Label>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs"
              >
                <option value="none">-- Select Material --</option>
                <option value="gravel">Crushed Gravel (~2,700 lb/yd³)</option>
                <option value="peaGravel">Pea Gravel (~2,800 lb/yd³)</option>
                <option value="dirt">Fill Dirt (~2,400 lb/yd³)</option>
                <option value="topsoil">Screened Topsoil (~2,100 lb/yd³)</option>
                <option value="concrete">Ready-Mix Concrete (~4,050 lb/yd³)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600 font-medium">
                Price per Cubic Yard (Optional)
              </Label>
              <div className="relative rounded-lg shadow-2xs border border-slate-300 focus-within:ring-1 focus-within:ring-emerald-600">
                <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 45.00"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-xs text-slate-900 focus:outline-none rounded-lg"
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
              title="Reset to defaults"
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
              Save to My Projects
            </Button>
          </div>
          {saveStatus && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{saveStatus}</span>
            </div>
          )}
        </div>

        {/* ── RIGHT: Live Results Dashboard (sticky) ── */}
        <div className="lg:col-span-7 flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">

          {/* Hero Result Card — emerald glow */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-5 sm:p-6 result-hero-card">
            {/* Decorative blur orb */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/15 rounded-full -translate-y-12 translate-x-12 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-emerald-300/10 rounded-full translate-y-8 -translate-x-8 blur-2xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                  Material to Order
                </span>
                <Badge variant="outline" className="border-emerald-300 bg-white/80 text-emerald-800 text-[10px]">
                  +{wastePercent}% waste included
                </Badge>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-['JetBrains_Mono',monospace] text-4xl sm:text-5xl font-bold text-slate-900 tabular-nums tracking-tight leading-none">
                  {formatNumber(result.wasteAdjustedCubicYards, 2)}
                </span>
                <span className="text-lg sm:text-xl font-semibold text-slate-400">yd³</span>
              </div>

              {wastePercent > 0 && (
                <p className="text-xs text-slate-500 mt-2 font-['JetBrains_Mono',monospace]">
                  Net {formatNumber(result.cubicYards, 2)} yd³ + {formatNumber(result.wasteAdjustedCubicYards - result.cubicYards, 2)} yd³ allowance
                </p>
              )}
            </div>
          </div>

          {/* Metric Bento Grid — 3 stat cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-slate-100 rounded-xl p-2.5 sm:p-3 text-center">
              <div className="font-['JetBrains_Mono',monospace] text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                {formatNumber(result.wasteAdjustedCubicFeet, 1)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">cu ft</div>
              <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">Cubic Feet</div>
            </div>
            <div className="bg-slate-100 rounded-xl p-3 text-center">
              <div className="font-['JetBrains_Mono',monospace] text-lg font-bold text-slate-900 tabular-nums">
                {formatNumber(result.wasteAdjustedCubicMeters, 2)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">m³</div>
              <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">Cubic Meters</div>
            </div>
            <div className="bg-emerald-600 rounded-xl p-3 text-center">
              <div className="font-['JetBrains_Mono',monospace] text-lg font-bold text-white tabular-nums">
                {formatNumber(result.areaSqFt, 0)}
              </div>
              <div className="text-[10px] text-emerald-100 mt-0.5 font-medium">sq ft</div>
              <div className="text-[9px] text-emerald-200 mt-0.5 uppercase tracking-wider">Area</div>
            </div>
          </div>

          {/* Material Weight Card (conditional) */}
          {activeMaterial && estimatedTons !== null && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Estimated Weight: {activeMaterial.name}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-['JetBrains_Mono',monospace] text-2xl font-bold text-slate-900">
                  {formatNumber(estimatedTons, 2)}
                </span>
                <span className="text-sm font-semibold text-slate-500">tons</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-['JetBrains_Mono',monospace]">
                ≈ {formatNumber(estimatedTons * 2000, 0)} lbs @ {activeMaterial.lbs} lbs/yd³
              </div>
            </div>
          )}

          {/* Cost Card (conditional) */}
          {cost !== null && (
            <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-2xs">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Estimated Material Cost
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-400">$</span>
                <span className="font-['JetBrains_Mono',monospace] text-2xl font-bold text-emerald-700">
                  {formatNumber(cost, 2)}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {formatNumber(result.wasteAdjustedCubicYards, 2)} yd³ × ${typeof unitPrice === 'number' ? unitPrice.toFixed(2) : '0.00'}/yd³
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
