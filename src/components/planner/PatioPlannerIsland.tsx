import React, { useState } from 'react';
import { formatNumber } from '../../lib/calc/units';
import { calculatePatioPlan } from '../../lib/calc/patio-planner';
import { saveProject, exportProjectToCSV } from '../../lib/storage/projects';
import type { SavedProject } from '../../lib/storage/projects';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Printer,
  Download,
  Bookmark,
  Check,
  Layers,
  RotateCcw,
  Ruler,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function PatioPlannerIsland() {
  const [length, setLength] = useState<number>(16);
  const [width, setWidth] = useState<number>(12);
  const [paverSize, setPaverSize] = useState<'4x8' | '6x6' | '6x9' | '12x12'>('4x8');
  const [paverWaste, setPaverWaste] = useState<number>(10);
  const [baseDepth, setBaseDepth] = useState<number>(4);
  const [baseWaste, setBaseWaste] = useState<number>(10);
  const [beddingDepth, setBeddingDepth] = useState<number>(1);
  const [includeEdge, setIncludeEdge] = useState<boolean>(true);
  const [includeGeotextile, setIncludeGeotextile] = useState<boolean>(true);

  // Pricing
  const [pricePerPaver, setPricePerPaver] = useState<number | ''>(0.85);
  const [pricePerBaseTon, setPricePerBaseTon] = useState<number | ''>(42);
  const [pricePerSandTon, setPricePerSandTon] = useState<number | ''>(45);
  const [pricePerPolySand, setPricePerPolySand] = useState<number | ''>(28);
  const [pricePerEdgingFt, setPricePerEdgingFt] = useState<number | ''>(2.25);
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Paver dimensions mapping in inches
  const paverDimensions: Record<string, { l: number; w: number; label: string; desc: string }> = {
    '4x8': { l: 8, w: 4, label: '4" × 8" Holland Stone', desc: 'Standard herringbone & basketweave brick' },
    '6x6': { l: 6, w: 6, label: '6" × 6" Square Cobble', desc: 'Symmetric running bond or checkerboard' },
    '6x9': { l: 9, w: 6, label: '6" × 9" Large Format', desc: 'Modern running bond patio texture' },
    '12x12': { l: 12, w: 12, label: '12" × 12" Architectural Slab', desc: 'Large terrace & contemporary plaza slabs' },
  };

  const selectedPaver = paverDimensions[paverSize];

  const plan = calculatePatioPlan({
    patioLengthFeet: Number(length) || 0,
    patioWidthFeet: Number(width) || 0,
    paverLengthInches: selectedPaver.l,
    paverWidthInches: selectedPaver.w,
    paverWastePercent: paverWaste,
    baseDepthInches: baseDepth,
    baseWastePercent: baseWaste,
    beddingDepthInches: beddingDepth,
    beddingWastePercent: 5,
    includeEdgeRestraints: includeEdge,
    includeGeotextileFabric: includeGeotextile,
    pricePerPaver: typeof pricePerPaver === 'number' ? pricePerPaver : undefined,
    pricePerBaseTon: typeof pricePerBaseTon === 'number' ? pricePerBaseTon : undefined,
    pricePerSandTon: typeof pricePerSandTon === 'number' ? pricePerSandTon : undefined,
    pricePerPolymericSandBag: typeof pricePerPolySand === 'number' ? pricePerPolySand : undefined,
    pricePerEdgingLinearFt: typeof pricePerEdgingFt === 'number' ? pricePerEdgingFt : undefined,
  });

  const currentProjectObject: SavedProject = {
    id: `patio-${Date.now()}`,
    name: `Paver Patio (${length}ft × ${width}ft)`,
    projectType: 'patio-plan',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    inputs: { length, width, paverSize, baseDepth, beddingDepth, includeEdge, includeGeotextile },
    summary: {
      totalCost: plan.costs.total > 0 ? plan.costs.total : undefined,
      totalCubicYards: plan.baseCubicYards + plan.beddingCubicYards,
      primaryDescription: `${plan.patioAreaSqFt} sq ft Patio (${plan.totalPaverCountWithWaste} Pavers, ${plan.baseTons.toFixed(1)}t Base, ${plan.beddingTons.toFixed(1)}t Sand)`,
    },
    billOfMaterials: [
      { item: `${selectedPaver.label}`, quantity: plan.totalPaverCountWithWaste, unit: 'pavers', estimatedCost: plan.costs.pavers },
      { item: `Crushed Stone Sub-Base (${baseDepth}" depth)`, quantity: `${plan.baseCubicYards.toFixed(2)} yds / ${plan.baseTons.toFixed(2)} tons`, unit: 'bulk', estimatedCost: plan.costs.base },
      { item: `ASTM C33 Bedding Sand (${beddingDepth}" depth)`, quantity: `${plan.beddingCubicYards.toFixed(2)} yds / ${plan.beddingTons.toFixed(2)} tons`, unit: 'bulk', estimatedCost: plan.costs.bedding },
      { item: 'Polymeric Joint Sand (50-lb bags)', quantity: plan.polymericSandBags50lb, unit: 'bags', estimatedCost: plan.costs.jointSand },
      ...(includeGeotextile ? [{ item: 'Heavy-Duty Geotextile Fabric', quantity: plan.geotextileSqFt, unit: 'sq ft', estimatedCost: 0 }] : []),
      ...(includeEdge ? [{ item: 'Snap-Edge / Pave Edge Restraints & Spikes', quantity: plan.edgeRestraintLinearFt, unit: 'linear ft', estimatedCost: plan.costs.edging }] : []),
    ],
  };

  const handleReset = () => {
    setLength(16);
    setWidth(12);
    setPaverSize('4x8');
    setPaverWaste(10);
    setBaseDepth(4);
    setBaseWaste(10);
    setBeddingDepth(1);
    setIncludeEdge(true);
    setIncludeGeotextile(true);
    setPricePerPaver(0.85);
    setPricePerBaseTon(42);
    setPricePerSandTon(45);
    setPricePerPolySand(28);
    setPricePerEdgingFt(2.25);
  };

  const handleSave = () => {
    saveProject(currentProjectObject);
    setSaveStatus('Patio project saved locally!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleExportCSV = () => {
    exportProjectToCSV(currentProjectObject);
  };

  const handlePrint = () => {
    window.print();
  };

  const PATIO_SIZE_PRESETS = [
    { label: '10\' × 10\'', l: 10, w: 10, desc: 'Small bistro patio (100 sq ft)' },
    { label: '12\' × 12\'', l: 12, w: 12, desc: 'Dining area (144 sq ft)' },
    { label: '12\' × 16\'', l: 16, w: 12, desc: 'Popular standard (192 sq ft)' },
    { label: '16\' × 20\'', l: 20, w: 16, desc: 'Large entertaining space (320 sq ft)' },
  ];

  return (
    <Card className="overflow-hidden border-slate-200/90 shadow-sm">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white px-5 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Paver Patio Material Planner</h2>
              <Badge variant="success" className="text-[10px] py-0 px-2 bg-emerald-600 hover:bg-emerald-600 text-white">
                Multi-Layer BOM Engine
              </Badge>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Calculates full ICPI cross-section: pavers, bedding sand, crushed aggregate base & edge restraints
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 no-print">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs h-8 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Checklist
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs h-8 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Split Panel Body — Input LEFT (5 cols) | Results RIGHT (7 cols) */}
      <div className="p-4 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-5 no-print">
          {/* 1. Patio Dimensions */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-emerald-700" />
                1. Patio Dimensions
              </Label>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset defaults
              </button>
            </div>

            {/* Quick Size Presets */}
            <div className="flex gap-1.5 flex-wrap">
              {PATIO_SIZE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setLength(preset.l);
                    setWidth(preset.w);
                  }}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
                    length === preset.l && width === preset.w
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400 hover:text-emerald-700'
                  }`}
                  title={preset.desc}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600 font-medium">Length (Feet)</Label>
                <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={length}
                    onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none font-mono-numbers"
                  />
                  <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 flex items-center border-l border-slate-300">
                    ft
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600 font-medium">Width (Feet)</Label>
                <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={width}
                    onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none font-mono-numbers"
                  />
                  <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 flex items-center border-l border-slate-300">
                    ft
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono-numbers">
              <span className="text-slate-600">
                Area: <strong className="text-slate-900">{plan.patioAreaSqFt} sq ft</strong>
              </span>
              <span className="text-slate-600">
                Perimeter: <strong className="text-slate-900">{plan.patioPerimeterLinearFt} lin ft</strong>
              </span>
            </div>
          </div>

          {/* 2. Paver Selection */}
          <div className="space-y-2.5 pt-4 border-t border-slate-200/70">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                2. Paver Sizing & Pattern
              </Label>
              <Badge variant="outline" className="text-[11px] font-semibold text-slate-700 bg-slate-50 font-mono-numbers">
                +{paverWaste}% Cutting Waste
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(paverDimensions).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPaverSize(key as any)}
                  className={`p-3 text-left rounded-xl border text-xs transition-all relative ${
                    paverSize === key
                      ? 'border-emerald-700 bg-emerald-50/60 ring-2 ring-emerald-600/20 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-slate-900 block">{item.label}</span>
                    {paverSize === key && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1 line-clamp-2">{item.desc}</span>
                </button>
              ))}
            </div>

            {/* Waste percentage selector */}
            <div className="flex items-center justify-between bg-slate-50/80 px-3 py-2 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-600">Cutting allowance:</span>
              <div className="flex gap-1">
                {[5, 10, 15].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setPaverWaste(pct)}
                    className={`px-2 py-0.5 text-xs font-semibold rounded ${
                      paverWaste === pct
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    +{pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Sub-Base & Sand Specification */}
          <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              3. Structural Strata Specification (ICPI Standard)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-600 font-medium mb-1 block">Crushed Stone Base Depth</Label>
                <select
                  value={baseDepth}
                  onChange={(e) => setBaseDepth(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value={4}>4 Inches (Pedestrian Patio)</option>
                  <option value={6}>6 Inches (Heavy Clay / Freeze-Thaw)</option>
                  <option value={8}>8 Inches (Driveway / Heavy Traffic)</option>
                </select>
              </div>
              <div>
                <Label className="text-xs text-slate-600 font-medium mb-1 block">Bedding Sand Layer</Label>
                <select
                  value={beddingDepth}
                  onChange={(e) => setBeddingDepth(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value={1}>1 Inch (ICPI Standard ASTM C33 Sand)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-slate-200/80">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeGeotextile}
                  onChange={(e) => setIncludeGeotextile(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-600 h-4 w-4"
                />
                Geotextile Underlayment (+10% overlap)
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeEdge}
                  onChange={(e) => setIncludeEdge(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-600 h-4 w-4"
                />
                Snap-Edge Restraints & Spikes
              </label>
            </div>
          </div>

          {/* 4. Local Unit Pricing (Optional) */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                4. Local Material Unit Pricing (Optional)
              </span>
              <span className="text-[11px] text-slate-500">Estimator defaults</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <Label className="text-[11px] text-slate-600 mb-0.5 block">Price / Paver ($)</Label>
                <input
                  type="number"
                  step="0.05"
                  value={pricePerPaver}
                  onChange={(e) => setPricePerPaver(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs font-mono-numbers"
                />
              </div>
              <div>
                <Label className="text-[11px] text-slate-600 mb-0.5 block">Base Stone ($/ton)</Label>
                <input
                  type="number"
                  step="1"
                  value={pricePerBaseTon}
                  onChange={(e) => setPricePerBaseTon(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs font-mono-numbers"
                />
              </div>
              <div>
                <Label className="text-[11px] text-slate-600 mb-0.5 block">Bed Sand ($/ton)</Label>
                <input
                  type="number"
                  step="1"
                  value={pricePerSandTon}
                  onChange={(e) => setPricePerSandTon(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs font-mono-numbers"
                />
              </div>
              <div>
                <Label className="text-[11px] text-slate-600 mb-0.5 block">Joint Sand ($/bag)</Label>
                <input
                  type="number"
                  step="1"
                  value={pricePerPolySand}
                  onChange={(e) => setPricePerPolySand(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs font-mono-numbers"
                />
              </div>
              <div>
                <Label className="text-[11px] text-slate-600 mb-0.5 block">Edging ($/lin ft)</Label>
                <input
                  type="number"
                  step="0.25"
                  value={pricePerEdgingFt}
                  onChange={(e) => setPricePerEdgingFt(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs font-mono-numbers"
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
              className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Save Patio Plan to Projects
            </Button>
          </div>
          {saveStatus && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{saveStatus}</span>
            </div>
          )}
        </div>

        {/* Right Output - Live Results & BOM (7 cols sticky) */}
        <div className="lg:col-span-7 flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          {/* Hero Result Card */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-6 result-hero-card">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/15 rounded-full -translate-y-12 translate-x-12 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-emerald-300/10 rounded-full translate-y-8 -translate-x-8 blur-2xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  {plan.costs.total > 0 ? 'Total Estimated Materials Cost' : 'Total Pavers Required'}
                </span>
                <Badge variant="outline" className="border-emerald-300 bg-white/80 text-emerald-800 text-[10px]">
                  {plan.patioAreaSqFt} sq ft ({length}' × {width}')
                </Badge>
              </div>

              {plan.costs.total > 0 ? (
                <div className="flex items-baseline gap-2">
                  <span className="font-['JetBrains_Mono',monospace] text-5xl font-bold text-slate-900 tabular-nums tracking-tight leading-none">
                    ${formatNumber(plan.costs.total, 2)}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    (${formatNumber(plan.costs.total / (plan.patioAreaSqFt || 1), 2)}/sq ft)
                  </span>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="font-['JetBrains_Mono',monospace] text-5xl font-bold text-slate-900 tabular-nums tracking-tight leading-none">
                    {plan.totalPaverCountWithWaste}
                  </span>
                  <span className="text-xl font-semibold text-slate-400">Pavers</span>
                </div>
              )}

              <p className="text-xs text-slate-500 mt-2 font-['JetBrains_Mono',monospace]">
                Specification: <strong className="text-slate-800">{plan.totalPaverCountWithWaste} {selectedPaver.label}</strong> (+{paverWaste}% waste), {formatNumber(plan.baseTons, 1)}t Base, {formatNumber(plan.beddingTons, 1)}t Bedding Sand
              </p>
            </div>
          </div>

          {/* 3-Card Bento Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Pavers
                </span>
                <div className="font-['JetBrains_Mono',monospace] text-2xl font-bold text-slate-900 tabular-nums mt-1">
                  {plan.totalPaverCountWithWaste}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {plan.basePaverCount} exact + {plan.totalPaverCountWithWaste - plan.basePaverCount} waste
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Crushed Stone Base
                </span>
                <div className="font-['JetBrains_Mono',monospace] text-2xl font-bold text-slate-900 tabular-nums mt-1">
                  {formatNumber(plan.baseTons, 1)}t
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-mono">
                {formatNumber(plan.baseCubicYards, 2)} cu yds ({baseDepth}" depth)
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Washed Bedding Sand
                </span>
                <div className="font-['JetBrains_Mono',monospace] text-2xl font-bold text-slate-900 tabular-nums mt-1">
                  {formatNumber(plan.beddingTons, 1)}t
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-mono">
                {formatNumber(plan.beddingCubicYards, 2)} cu yds (1" ASTM C33)
              </p>
            </div>
          </div>

          {/* Strata Accessories Mini-Card */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span className="font-semibold text-slate-800">Joint Sand:</span>
              <span className="font-bold text-slate-900 font-mono-numbers">{plan.polymericSandBags50lb} Bags</span>
              <span className="text-slate-500">(50-lb polymeric)</span>
            </div>
            {includeGeotextile && (
              <div className="text-slate-600">
                Fabric: <strong className="text-slate-900 font-mono-numbers">{plan.geotextileSqFt} sq ft</strong>
              </div>
            )}
            {includeEdge && (
              <div className="text-slate-600">
                Edging: <strong className="text-slate-900 font-mono-numbers">{plan.edgeRestraintLinearFt} lin ft</strong>
              </div>
            )}
          </div>

          {/* Complete Bill of Materials (BOM) Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Bill of Materials (BOM) Breakdown
              </span>
              <span className="text-[11px] text-slate-500">All sectional layers</span>
            </div>
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200">
                  <TableHead className="font-bold text-slate-700">Material / Layer</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Quantity</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Unit</TableHead>
                  {plan.costs.total > 0 && <TableHead className="text-right font-bold text-slate-700">Subtotal</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold text-slate-900">{selectedPaver.label}</TableCell>
                  <TableCell className="text-right font-bold text-emerald-800 font-mono-numbers">
                    {plan.totalPaverCountWithWaste}
                  </TableCell>
                  <TableCell className="text-right text-slate-500">pavers</TableCell>
                  {plan.costs.total > 0 && (
                    <TableCell className="text-right font-mono-numbers font-medium text-slate-900">
                      ${formatNumber(plan.costs.pavers, 2)}
                    </TableCell>
                  )}
                </TableRow>
                <TableRow>
                  <TableCell className="text-slate-800">Crushed Stone Sub-Base ({baseDepth}")</TableCell>
                  <TableCell className="text-right font-bold text-slate-900 font-mono-numbers">
                    {formatNumber(plan.baseTons, 2)}
                  </TableCell>
                  <TableCell className="text-right text-slate-500">tons</TableCell>
                  {plan.costs.total > 0 && (
                    <TableCell className="text-right font-mono-numbers font-medium text-slate-900">
                      ${formatNumber(plan.costs.base, 2)}
                    </TableCell>
                  )}
                </TableRow>
                <TableRow>
                  <TableCell className="text-slate-800">Washed Bedding Sand ({beddingDepth}")</TableCell>
                  <TableCell className="text-right font-bold text-slate-900 font-mono-numbers">
                    {formatNumber(plan.beddingTons, 2)}
                  </TableCell>
                  <TableCell className="text-right text-slate-500">tons</TableCell>
                  {plan.costs.total > 0 && (
                    <TableCell className="text-right font-mono-numbers font-medium text-slate-900">
                      ${formatNumber(plan.costs.bedding, 2)}
                    </TableCell>
                  )}
                </TableRow>
                <TableRow>
                  <TableCell className="text-slate-800">Polymeric Joint Sand (50-lb bag)</TableCell>
                  <TableCell className="text-right font-bold text-slate-900 font-mono-numbers">
                    {plan.polymericSandBags50lb}
                  </TableCell>
                  <TableCell className="text-right text-slate-500">bags</TableCell>
                  {plan.costs.total > 0 && (
                    <TableCell className="text-right font-mono-numbers font-medium text-slate-900">
                      ${formatNumber(plan.costs.jointSand, 2)}
                    </TableCell>
                  )}
                </TableRow>
                {includeGeotextile && (
                  <TableRow>
                    <TableCell className="text-slate-800">Geotextile Fabric (+10% overlap)</TableCell>
                    <TableCell className="text-right font-bold text-slate-900 font-mono-numbers">
                      {plan.geotextileSqFt}
                    </TableCell>
                    <TableCell className="text-right text-slate-500">sq ft</TableCell>
                    {plan.costs.total > 0 && <TableCell className="text-right text-slate-400 font-mono-numbers">-</TableCell>}
                  </TableRow>
                )}
                {includeEdge && (
                  <TableRow>
                    <TableCell className="text-slate-800">Snap-Edge Restraints & Spikes</TableCell>
                    <TableCell className="text-right font-bold text-slate-900 font-mono-numbers">
                      {plan.edgeRestraintLinearFt}
                    </TableCell>
                    <TableCell className="text-right text-slate-500">lin ft</TableCell>
                    {plan.costs.total > 0 && (
                      <TableCell className="text-right font-mono-numbers font-medium text-slate-900">
                        ${formatNumber(plan.costs.edging, 2)}
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
              {plan.costs.total > 0 && (
                <TableFooter className="bg-slate-50 font-bold border-t border-slate-200">
                  <TableRow>
                    <TableCell colSpan={3} className="text-right text-slate-900 font-bold">Total Estimated Material:</TableCell>
                    <TableCell className="text-right text-emerald-800 text-sm font-mono-numbers font-black">
                      ${formatNumber(plan.costs.total, 2)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </div>
      </div>
    </Card>
  );
}
