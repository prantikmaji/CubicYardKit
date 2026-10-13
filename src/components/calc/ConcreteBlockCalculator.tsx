import React, { useState, useId } from 'react';
import { formatNumber } from '../../lib/calc/units';
import { calculateConcreteBlock } from '../../lib/calc/concrete-block';
import type { CoreFillOption } from '../../lib/calc/concrete-block';
import { saveProject } from '../../lib/storage/projects';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Bookmark, Check, RotateCcw, Plus, Trash2, Layers, ShieldCheck } from 'lucide-react';

export default function ConcreteBlockCalculator() {
  const [wallLength, setWallLength] = useState<number>(30);
  const [wallHeight, setWallHeight] = useState<number>(8);
  const [wastePercent, setWastePercent] = useState<number>(5);
  const [coreFillOption, setCoreFillOption] = useState<CoreFillOption>('every_other');
  const [customCoreFillPercent, setCustomCoreFillPercent] = useState<number>(25);

  // Dynamic openings (doors / windows)
  const [openings, setOpenings] = useState<Array<{ id: string; width: number; height: number }>>([
    { id: '1', width: 3, height: 7 }, // standard 3x7 door
  ]);

  // Pricing
  const [pricePerBlock, setPricePerBlock] = useState<number | ''>(2.4);
  const [pricePerMortarBag, setPricePerMortarBag] = useState<number | ''>(12.5);
  const [pricePerGroutCuYd, setPricePerGroutCuYd] = useState<number | ''>(160);
  const [saveStatus, setSaveStatus] = useState<string>('');

  const lenId = useId();
  const heightId = useId();

  const addOpening = () => {
    setOpenings((prev) => [...prev, { id: String(Date.now()), width: 4, height: 3 }]);
  };

  const removeOpening = (id: string) => {
    setOpenings((prev) => prev.filter((o) => o.id !== id));
  };

  const updateOpening = (id: string, field: 'width' | 'height', val: number) => {
    setOpenings((prev) =>
      prev.map((o) => (o.id === id ? { ...o, [field]: Math.max(0, val) } : o))
    );
  };

  const handleReset = () => {
    setWallLength(30);
    setWallHeight(8);
    setWastePercent(5);
    setCoreFillOption('every_other');
    setCustomCoreFillPercent(25);
    setOpenings([{ id: '1', width: 3, height: 7 }]);
    setPricePerBlock(2.4);
    setPricePerMortarBag(12.5);
    setPricePerGroutCuYd(160);
  };

  const result = calculateConcreteBlock({
    wallLengthFeet: Number(wallLength) || 0,
    wallHeightFeet: Number(wallHeight) || 0,
    openings: openings.map((o) => ({ widthFeet: o.width, heightFeet: o.height })),
    wastePercent,
    coreFillOption,
    customCoreFillPercent,
    pricePerBlock: typeof pricePerBlock === 'number' ? pricePerBlock : undefined,
    pricePerMortarBag: typeof pricePerMortarBag === 'number' ? pricePerMortarBag : undefined,
    pricePerGroutCuYd: typeof pricePerGroutCuYd === 'number' ? pricePerGroutCuYd : undefined,
  });

  const handleSave = () => {
    saveProject({
      id: `block-${Date.now()}`,
      name: `Block Wall (${result.totalBlocksNeeded} CMU Blocks)`,
      projectType: 'concrete-block',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inputs: { wallLength, wallHeight, wastePercent, coreFillOption, openings },
      summary: {
        totalCost: result.materialCost.total > 0 ? result.materialCost.total : undefined,
        itemCount: result.totalBlocksNeeded,
        primaryDescription: `${result.totalBlocksNeeded} CMU Blocks for ${result.netWallAreaSqFt.toFixed(0)} sq ft wall`,
      },
      billOfMaterials: [
        {
          item: 'Standard 8x8x16 CMU Blocks',
          quantity: result.totalBlocksNeeded,
          unit: 'blocks',
          estimatedCost: result.materialCost.blocks,
        },
        {
          item: 'Type S Masonry Mortar (70 lb bags)',
          quantity: result.mortarBagsNeeded,
          unit: 'bags',
          estimatedCost: result.materialCost.mortar,
        },
        ...(result.coreFillGroutCuYd > 0
          ? [
              {
                item: `Core Fill Grout (${coreFillOption.replace('_', ' ')})`,
                quantity: result.coreFillGroutCuYd.toFixed(2),
                unit: 'cu yd',
                estimatedCost: result.materialCost.grout,
              },
            ]
          : []),
      ],
    });
    setSaveStatus('Block project saved locally!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <Card className="overflow-hidden border-slate-200/90 shadow-sm">
      {/* Header */}
      <div className="bg-slate-900 text-white px-5 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Concrete Block (CMU) Wall Calculator</h2>
              <Badge variant="success" className="text-[10px] py-0 px-2 bg-slate-700 hover:bg-slate-700 text-white border-none">
                8" × 8" × 16" Standard
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              Estimates CMU block counts, Type S mortar bags, and core fill grout cubic yards
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold text-emerald-400 block font-mono-numbers">
            1.125 blocks / sq ft
          </span>
          <span className="text-[10px] text-slate-400">Standard ⅜" mortar joint</span>
        </div>
      </div>

      {/* Split Panel Body — Input LEFT (5 cols) | Results RIGHT (7 cols) */}
      <div className="p-4 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Wall Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor={lenId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                Wall Length (Feet)
              </Label>
              <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-slate-600 focus-within:border-slate-600">
                <input
                  id={lenId}
                  type="number"
                  min="1"
                  step="any"
                  value={wallLength}
                  onChange={(e) => setWallLength(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none font-mono-numbers"
                />
                <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 flex items-center border-l border-slate-300">
                  ft
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={heightId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                Wall Height (Feet)
              </Label>
              <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-slate-600 focus-within:border-slate-600">
                <input
                  id={heightId}
                  type="number"
                  min="1"
                  step="any"
                  value={wallHeight}
                  onChange={(e) => setWallHeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none font-mono-numbers"
                />
                <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 flex items-center border-l border-slate-300">
                  ft
                </span>
              </div>
            </div>
          </div>

          {/* Openings (Doors & Windows) */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Deduct Openings (Doors & Windows)
                </span>
                <p className="text-[11px] text-slate-500">Subtracted from gross wall area</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOpening}
                className="text-xs h-7 gap-1 border-slate-300 hover:bg-slate-100"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Opening
              </Button>
            </div>

            {openings.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                No openings deducted (100% solid wall).
              </p>
            ) : (
              <div className="space-y-2">
                {openings.map((op, idx) => (
                  <div key={op.id} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-semibold text-slate-500 w-16">Door/Win #{idx + 1}</span>
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="W (ft)"
                        value={op.width}
                        onChange={(e) => updateOpening(op.id, 'width', parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none font-mono-numbers"
                      />
                      <span className="text-xs text-slate-400">×</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="H (ft)"
                        value={op.height}
                        onChange={(e) => updateOpening(op.id, 'height', parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none font-mono-numbers"
                      />
                      <span className="text-[11px] text-slate-600 font-bold ml-auto font-mono-numbers">
                        {(op.width * op.height).toFixed(0)} ft²
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOpening(op.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      title="Remove opening"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Core Grout Fill Specification */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                  Core Grout Fill
                </span>
                <p className="text-[11px] text-slate-500">Rebar encasement & retaining reinforcement</p>
              </div>
              <Badge variant="outline" className="text-[10px] text-slate-600 bg-white">
                NCMA Standard
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'none', label: 'Hollow (No Grout)' },
                { id: 'every_other', label: 'Every 2nd Core (50%)' },
                { id: 'all', label: '100% Solid Grout' },
                { id: 'custom_percent', label: 'Custom %' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCoreFillOption(opt.id as CoreFillOption)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                    coreFillOption === opt.id
                      ? 'bg-slate-800 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {coreFillOption === 'custom_percent' && (
              <div className="pt-2 flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                <Label className="text-xs text-slate-700 font-medium">Percent grouted:</Label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={customCoreFillPercent}
                  onChange={(e) => setCustomCoreFillPercent(parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-xs border border-slate-300 rounded font-mono-numbers"
                />
                <span className="text-xs text-slate-500 font-bold">%</span>
              </div>
            )}
          </div>

          {/* Block Cutting Waste Allowance */}
          <div className="flex items-center justify-between bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Cutting & Breakage Margin
              </span>
              <p className="text-[11px] text-slate-500">Corner cuts & transport chipping</p>
            </div>
            <div className="flex gap-1.5">
              {[0, 5, 10].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setWastePercent(pct)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    wastePercent === pct
                      ? 'bg-slate-800 text-white border-slate-900 shadow-xs'
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
                Masonry Material Costs (Optional)
              </span>
              <span className="text-[11px] text-slate-500">Retail averages</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-[11px] text-slate-600 mb-1 block">Block ($ / ea)</Label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={pricePerBlock}
                  onChange={(e) => setPricePerBlock(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs font-mono-numbers"
                />
              </div>
              <div>
                <Label className="text-[11px] text-slate-600 mb-1 block">Mortar ($ / bag)</Label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={pricePerMortarBag}
                  onChange={(e) => setPricePerMortarBag(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs font-mono-numbers"
                />
              </div>
              <div>
                <Label className="text-[11px] text-slate-600 mb-1 block">Grout ($ / yd³)</Label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={pricePerGroutCuYd}
                  onChange={(e) => setPricePerGroutCuYd(e.target.value === '' ? '' : parseFloat(e.target.value))}
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
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Save Block Project
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
          {/* Hero Result Card with architectural slate glow */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-300 bg-gradient-to-br from-slate-100 via-white to-slate-50 p-5 sm:p-6 result-hero-card">
            <div className="absolute top-0 right-0 w-40 h-40 bg-slate-400/15 rounded-full -translate-y-12 translate-x-12 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-emerald-400/10 rounded-full translate-y-8 -translate-x-8 blur-2xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-700">
                  Total 8×8×16 CMU Blocks Needed
                </span>
                <Badge variant="outline" className="border-slate-300 bg-white/80 text-slate-800 text-[10px]">
                  +{wastePercent}% waste included
                </Badge>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-['JetBrains_Mono',monospace] text-4xl sm:text-5xl font-bold text-slate-900 tabular-nums tracking-tight leading-none">
                  {result.totalBlocksNeeded}
                </span>
                <span className="text-xl font-semibold text-slate-400">blocks</span>
              </div>

              <p className="text-xs text-slate-500 mt-2 font-['JetBrains_Mono',monospace]">
                Exact count: <strong className="text-slate-800">{result.baseBlockCount} blocks</strong> ({result.netWallAreaSqFt.toFixed(0)} ft² net wall)
              </p>
            </div>
          </div>

          {/* Masonry Materials Bento Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-slate-100 rounded-xl p-2.5 sm:p-3 text-center">
              <div className="font-['JetBrains_Mono',monospace] text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                {result.mortarBagsNeeded}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">bags</div>
              <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">Type S Mortar (70 lb)</div>
            </div>
            <div className="bg-slate-100 rounded-xl p-2.5 sm:p-3 text-center">
              <div className="font-['JetBrains_Mono',monospace] text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                {formatNumber(result.coreFillGroutCuYd, 2)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">yd³</div>
              <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">Core Fill Grout</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-2.5 sm:p-3 text-center">
              <div className="font-['JetBrains_Mono',monospace] text-base sm:text-lg font-bold text-white tabular-nums">
                {result.netWallAreaSqFt.toFixed(0)}
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5 font-medium">sq ft</div>
              <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">Net Wall Area</div>
            </div>
          </div>

          {/* Wall Specs Summary Card */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Gross Wall Area ({wallLength}ft × {wallHeight}ft):</span>
              <span className="font-bold text-slate-900 font-['JetBrains_Mono',monospace]">{result.grossWallAreaSqFt} ft²</span>
            </div>
            {result.openingsAreaSqFt > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Deducted Openings ({openings.length} total):</span>
                <span className="font-bold text-amber-700 font-['JetBrains_Mono',monospace]">−{result.openingsAreaSqFt} ft²</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Core Grout Cubic Feet:</span>
              <span className="font-bold text-slate-900 font-['JetBrains_Mono',monospace]">{formatNumber(result.coreFillGroutCuFt, 1)} ft³</span>
            </div>
          </div>

          {/* Optional Cost Summary */}
          {result.materialCost.total > 0 && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2 text-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Estimated Material Costs
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CMU Blocks ({result.totalBlocksNeeded} @ ${typeof pricePerBlock === 'number' ? pricePerBlock.toFixed(2) : '0.00'}):</span>
                <span className="font-semibold text-slate-900 font-['JetBrains_Mono',monospace]">${formatNumber(result.materialCost.blocks, 2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Mortar Bags ({result.mortarBagsNeeded} @ ${typeof pricePerMortarBag === 'number' ? pricePerMortarBag.toFixed(2) : '0.00'}):</span>
                <span className="font-semibold text-slate-900 font-['JetBrains_Mono',monospace]">${formatNumber(result.materialCost.mortar, 2)}</span>
              </div>
              {result.materialCost.grout > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Grout Fill ({formatNumber(result.coreFillGroutCuYd, 2)} yd³):</span>
                  <span className="font-semibold text-slate-900 font-['JetBrains_Mono',monospace]">${formatNumber(result.materialCost.grout, 2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Estimated Material:</span>
                <span className="text-xl font-black text-slate-900 font-['JetBrains_Mono',monospace]">
                  ${formatNumber(result.materialCost.total, 2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
