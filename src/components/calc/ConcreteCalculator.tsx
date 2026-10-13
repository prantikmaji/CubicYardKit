import React, { useState, useId } from 'react';
import { formatNumber } from '../../lib/calc/units';
import type { LengthUnit } from '../../lib/calc/units';
import { calculateConcrete } from '../../lib/calc/concrete';
import type { ConcreteStructureType } from '../../lib/calc/concrete';
import { saveProject } from '../../lib/storage/projects';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Bookmark, Check, RotateCcw, Truck, Package, Layers, Lightbulb } from 'lucide-react';

export default function ConcreteCalculator() {
  const [structureType, setStructureType] = useState<ConcreteStructureType>('slab');

  // Slab / Footing
  const [length, setLength] = useState<number>(20);
  const [lengthUnit, setLengthUnit] = useState<LengthUnit>('feet');
  const [width, setWidth] = useState<number>(10);
  const [widthUnit, setWidthUnit] = useState<LengthUnit>('feet');
  const [thicknessInches, setThicknessInches] = useState<number>(4);

  // Column / Post Hole
  const [columnDiameterInches, setColumnDiameterInches] = useState<number>(12);
  const [columnDepthFeet, setColumnDepthFeet] = useState<number>(3);
  const [columnQuantity, setColumnQuantity] = useState<number>(4);

  // Common
  const [wastePercent, setWastePercent] = useState<number>(10);
  const [pricePerCubicYard, setPricePerCubicYard] = useState<number | ''>(150);
  const [pricePerBag, setPricePerBag] = useState<number | ''>(5.5);
  const [deliveryFee, setDeliveryFee] = useState<number | ''>(75);
  const [saveStatus, setSaveStatus] = useState<string>('');

  const lengthId = useId();
  const widthId = useId();
  const thicknessId = useId();
  const diamId = useId();
  const depthFtId = useId();
  const countId = useId();

  const result = calculateConcrete({
    structureType,
    length: Number(length) || 0,
    lengthUnit,
    width: Number(width) || 0,
    widthUnit,
    thicknessInches: Number(thicknessInches) || 0,
    columnDiameterInches: Number(columnDiameterInches) || 0,
    columnDepthFeet: Number(columnDepthFeet) || 0,
    columnQuantity: Number(columnQuantity) || 1,
    wastePercent,
    pricePerCubicYard: typeof pricePerCubicYard === 'number' ? pricePerCubicYard : undefined,
    pricePerBag: typeof pricePerBag === 'number' ? pricePerBag : undefined,
    deliveryFee: typeof deliveryFee === 'number' ? deliveryFee : undefined,
  });

  const handleReset = () => {
    setLength(20);
    setWidth(10);
    setThicknessInches(4);
    setColumnDiameterInches(12);
    setColumnDepthFeet(3);
    setColumnQuantity(4);
    setWastePercent(10);
    setPricePerCubicYard(150);
    setPricePerBag(5.5);
    setDeliveryFee(75);
  };

  const handleSave = () => {
    saveProject({
      id: `concrete-${Date.now()}`,
      name: `Concrete Project (${result.wasteAdjustedCubicYards.toFixed(2)} yds)`,
      projectType: 'concrete',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inputs: {
        structureType,
        length,
        width,
        thicknessInches,
        columnDiameterInches,
        columnDepthFeet,
        columnQuantity,
        wastePercent,
      },
      summary: {
        totalCubicYards: result.wasteAdjustedCubicYards,
        totalCost: result.totalCost > 0 ? result.totalCost : undefined,
        primaryDescription: `${result.wasteAdjustedCubicYards.toFixed(2)} cubic yards (${result.bags80lb} x 80-lb bags)`,
      },
      billOfMaterials: [
        {
          item: 'Ready-Mix Concrete Volume',
          quantity: result.wasteAdjustedCubicYards.toFixed(2),
          unit: 'cu yd',
        },
        {
          item: 'Alternative: 80-lb Bags (0.60 cu ft yield)',
          quantity: result.bags80lb,
          unit: 'bags',
        },
        {
          item: 'Alternative: 60-lb Bags (0.45 cu ft yield)',
          quantity: result.bags60lb,
          unit: 'bags',
        },
        {
          item: 'Alternative: 50-lb Fast-Setting Bags',
          quantity: result.bags50lb,
          unit: 'bags',
        },
      ],
    });
    setSaveStatus('Concrete project saved locally!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const THICKNESS_PRESETS = [3.5, 4, 5, 6, 8];
  const DIAMETER_PRESETS = [8, 10, 12, 16];

  return (
    <Card className="overflow-hidden border-slate-200/90 shadow-sm">
      {/* Header */}
      <div className="bg-slate-900 text-white px-5 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Concrete Slab, Footing & Column Calculator</h2>
              <Badge variant="success" className="text-[10px] py-0 px-2 bg-blue-600 hover:bg-blue-600 text-white border-none">
                Ready-Mix & Bagged
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              Calculate yards for ready-mix dispatch or bag counts for 80-lb, 60-lb, and 50-lb mixes
            </p>
          </div>
        </div>

        <Tabs value={structureType} onValueChange={(val) => setStructureType(val as ConcreteStructureType)}>
          <TabsList className="bg-slate-800 border-slate-700 text-slate-300">
            <TabsTrigger value="slab" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Slab / Patio Pad
            </TabsTrigger>
            <TabsTrigger value="footing" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Footing / Trench
            </TabsTrigger>
            <TabsTrigger value="column" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Post Hole / Sonotube
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Split Panel Body — Input LEFT (5 cols) | Results RIGHT (7 cols) */}
      <div className="p-4 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {structureType === 'column' ? (
            <div className="space-y-4">
              {/* Column Diameter + Presets */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor={diamId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                    Tube Diameter (Inches)
                  </Label>
                  <span className="text-[11px] text-slate-500">e.g., 10" or 12" Sonotube</span>
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  {DIAMETER_PRESETS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setColumnDiameterInches(d)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
                        columnDiameterInches === d
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-700'
                      }`}
                    >
                      {d}"
                    </button>
                  ))}
                </div>

                <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600">
                  <input
                    id={diamId}
                    type="number"
                    min="4"
                    step="any"
                    value={columnDiameterInches}
                    onChange={(e) => setColumnDiameterInches(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none font-mono-numbers"
                  />
                  <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 flex items-center border-l border-slate-300">
                    in
                  </span>
                </div>
              </div>

              {/* Depth Below Grade */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor={depthFtId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                    Depth Below Grade
                  </Label>
                  <span className="text-[11px] text-slate-500">Local frost depth</span>
                </div>
                <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600">
                  <input
                    id={depthFtId}
                    type="number"
                    min="0.5"
                    step="any"
                    value={columnDepthFeet}
                    onChange={(e) => setColumnDepthFeet(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none font-mono-numbers"
                  />
                  <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 flex items-center border-l border-slate-300">
                    feet
                  </span>
                </div>
              </div>

              {/* Number of Holes */}
              <div className="space-y-1.5">
                <Label htmlFor={countId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                  Number of Holes / Posts
                </Label>
                <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600">
                  <input
                    id={countId}
                    type="number"
                    min="1"
                    step="1"
                    value={columnQuantity}
                    onChange={(e) => setColumnQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none font-mono-numbers"
                  />
                  <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 flex items-center border-l border-slate-300">
                    qty
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor={lengthId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                  Length
                </Label>
                <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600">
                  <input
                    id={lengthId}
                    type="number"
                    min="0"
                    step="any"
                    value={length}
                    onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none font-mono-numbers"
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
                <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600">
                  <input
                    id={widthId}
                    type="number"
                    min="0"
                    step="any"
                    value={width}
                    onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none font-mono-numbers"
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

              {/* Thickness / Depth with preset pills */}
              <div className="sm:col-span-2 space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor={thicknessId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                    {structureType === 'slab' ? 'Slab Thickness' : 'Footing Depth'}
                  </Label>
                  <span className="text-[11px] font-medium text-slate-500 font-mono-numbers">
                    {thicknessInches}" ({formatNumber(thicknessInches / 12, 2)} ft)
                  </span>
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  {THICKNESS_PRESETS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setThicknessInches(t)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
                        thicknessInches === t
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-700'
                      }`}
                    >
                      {t}"
                    </button>
                  ))}
                  <span className="text-[10px] text-slate-400 self-center ml-1">or custom →</span>
                </div>

                <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600">
                  <input
                    id={thicknessId}
                    type="number"
                    min="1"
                    max="36"
                    step="0.5"
                    value={thicknessInches}
                    onChange={(e) => setThicknessInches(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none font-mono-numbers"
                  />
                  <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 flex items-center border-l border-slate-300">
                    inches
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Waste / Over-Excavation Allowance */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Form Deflection & Over-Pour Margin
                </span>
                <p className="text-[11px] text-slate-500">ACI recommendation: +10% over-pour margin for slabs</p>
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
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pct === 0 ? 'Exact' : `+${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Estimation */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Cost Planning (Optional)
              </span>
              <span className="text-[11px] text-slate-500">Ready-mix avg $130–$175/yd</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] text-slate-600 mb-1 block">Ready-Mix ($ / cu yd)</Label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={pricePerCubicYard}
                  onChange={(e) => setPricePerCubicYard(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs font-mono-numbers"
                />
              </div>
              <div>
                <Label className="text-[11px] text-slate-600 mb-1 block">Bagged Price ($ / 80-lb bag)</Label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={pricePerBag}
                  onChange={(e) => setPricePerBag(e.target.value === '' ? '' : parseFloat(e.target.value))}
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
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Save Concrete Project
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
          {/* Hero Result Card with blue/slate industrial glow */}
          <div className="relative overflow-hidden rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/60 via-white to-blue-50/30 p-5 sm:p-6 result-hero-card">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400/15 rounded-full -translate-y-12 translate-x-12 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-emerald-300/10 rounded-full translate-y-8 -translate-x-8 blur-2xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-800">
                  Total Ready-Mix Concrete
                </span>
                <Badge variant="outline" className="border-blue-300 bg-white/80 text-blue-900 text-[10px]">
                  +{wastePercent}% margin included
                </Badge>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-['JetBrains_Mono',monospace] text-4xl sm:text-5xl font-bold text-slate-900 tabular-nums tracking-tight leading-none">
                  {formatNumber(result.wasteAdjustedCubicYards, 2)}
                </span>
                <span className="text-xl font-semibold text-slate-400">yd³</span>
              </div>

              <p className="text-xs text-slate-500 mt-2 font-['JetBrains_Mono',monospace]">
                Net pour: <strong className="text-slate-800">{formatNumber(result.cubicYards, 2)} yd³</strong> ({formatNumber(result.wasteAdjustedCubicFeet, 1)} ft³)
              </p>
            </div>
          </div>

          {/* Bag Counts Bento Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-slate-100 rounded-xl p-2.5 sm:p-3 text-center">
              <div className="font-['JetBrains_Mono',monospace] text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                {result.bags80lb}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">bags</div>
              <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">80-lb Mix</div>
            </div>
            <div className="bg-slate-100 rounded-xl p-2.5 sm:p-3 text-center">
              <div className="font-['JetBrains_Mono',monospace] text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                {result.bags60lb}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">bags</div>
              <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">60-lb Mix</div>
            </div>
            <div className="bg-blue-600 rounded-xl p-2.5 sm:p-3 text-center">
              <div className="font-['JetBrains_Mono',monospace] text-base sm:text-lg font-bold text-white tabular-nums">
                {result.bags50lb}
              </div>
              <div className="text-[10px] text-blue-100 mt-0.5 font-medium">bags</div>
              <div className="text-[9px] text-blue-200 mt-0.5 uppercase tracking-wider">50-lb Fast-Set</div>
            </div>
          </div>

          {/* Smart Delivery Recommendation Card */}
          <div className={`p-3.5 sm:p-4 rounded-xl text-xs flex gap-3 items-start border shadow-2xs ${
            result.recommendedDeliveryMethod === 'ready-mix'
              ? 'bg-blue-50/70 text-blue-950 border-blue-200'
              : 'bg-emerald-50/70 text-emerald-950 border-emerald-200'
          }`}>
            <Lightbulb className={`w-4 h-4 shrink-0 mt-0.5 ${
              result.recommendedDeliveryMethod === 'ready-mix' ? 'text-blue-700' : 'text-emerald-700'
            }`} />
            <div>
              <strong className="block text-slate-900 mb-0.5">Recommendation:</strong>
              <span className="leading-relaxed text-slate-700">
                {result.recommendedDeliveryMethod === 'ready-mix'
                  ? `At ${result.wasteAdjustedCubicYards.toFixed(2)} cubic yards (${result.bags80lb} bags), ordering a ready-mix truck is significantly faster, stronger, and avoids hand-mixing ${result.bags80lb * 80} lbs of cement.`
                  : `At ${result.wasteAdjustedCubicYards.toFixed(2)} cubic yards (${result.bags80lb} bags), bagged premix from a local building supplier is economical and avoids short-load transit mix charges.`}
              </span>
            </div>
          </div>

          {/* Cost Summary (if applicable) */}
          {result.totalCost > 0 && (
            <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-blue-200 shadow-2xs space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Estimated Ready-Mix Cost
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-400">$</span>
                <span className="font-['JetBrains_Mono',monospace] text-2xl font-bold text-blue-800">
                  {formatNumber(result.totalCost, 2)}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-1.5 mt-1 font-['JetBrains_Mono',monospace]">
                {formatNumber(result.wasteAdjustedCubicYards, 2)} yd³ @ ${typeof pricePerCubicYard === 'number' ? pricePerCubicYard.toFixed(2) : '0.00'}/yd³
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
