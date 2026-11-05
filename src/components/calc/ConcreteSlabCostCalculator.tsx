import React, { useState, useId } from 'react';
import { formatNumber } from '../../lib/calc/units';
import type { SlabUnit } from '../../lib/calc/concrete-slab-cost';
import { calculateConcreteSlabCost } from '../../lib/calc/concrete-slab-cost';
import { saveProject } from '../../lib/storage/projects';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Bookmark,
  Check,
  RotateCcw,
  Truck,
  Package,
  Lightbulb,
  PlusCircle,
  Trash2,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

interface SlabState {
  id: string;
  length: number;
  lengthUnit: SlabUnit;
  width: number;
  widthUnit: SlabUnit;
}

type TabMode = 'quick' | 'detailed';

const UNIT_OPTIONS: { value: SlabUnit; label: string }[] = [
  { value: 'feet', label: 'ft' },
  { value: 'inches', label: 'in' },
  { value: 'yards', label: 'yd' },
  { value: 'meters', label: 'm' },
];

const THICKNESS_PRESETS = [3.5, 4, 5, 6];
const WASTE_PRESETS = [0, 5, 10, 15];

function makeDefaultSlab(id: string): SlabState {
  return { id, length: 12, lengthUnit: 'feet', width: 20, widthUnit: 'feet' };
}

export default function ConcreteSlabCostCalculator() {
  const [tab, setTab] = useState<TabMode>('quick');
  const [slabs, setSlabs] = useState<SlabState[]>([makeDefaultSlab('s1')]);
  const [thicknessInches, setThicknessInches] = useState<number>(4);
  const [wastePercent, setWastePercent] = useState<number>(10);

  // Quick estimate prices
  const [pricePerCubicYard, setPricePerCubicYard] = useState<number | ''>('');
  const [deliveryFee, setDeliveryFee] = useState<number | ''>('');

  // Detailed budget
  const [excavation, setExcavation] = useState<number | ''>('');
  const [gravelBase, setGravelBase] = useState<number | ''>('');
  const [formwork, setFormwork] = useState<number | ''>('');
  const [rebar, setRebar] = useState<number | ''>('');
  const [vaporBarrier, setVaporBarrier] = useState<number | ''>('');
  const [labor, setLabor] = useState<number | ''>('');
  const [finish, setFinish] = useState<number | ''>('');
  const [pumpFee, setPumpFee] = useState<number | ''>('');
  const [shortLoadFee, setShortLoadFee] = useState<number | ''>('');
  const [taxPercent, setTaxPercent] = useState<number | ''>('');
  const [contingencyPercent, setContingencyPercent] = useState<number | ''>('');
  const [otherCost, setOtherCost] = useState<number | ''>('');

  const [saveStatus, setSaveStatus] = useState<string>('');

  const thicknessId = useId();

  const toNum = (v: number | ''): number | null =>
    typeof v === 'number' && v > 0 ? v : null;

  const result = calculateConcreteSlabCost({
    areas: slabs.map((s) => ({
      length: s.length,
      lengthUnit: s.lengthUnit,
      width: s.width,
      widthUnit: s.widthUnit,
    })),
    thicknessInches: thicknessInches || 0,
    wastePercent,
    minOrderYards: 1,
    orderIncrementYards: 0.25,
    bagSizeLabel: '80lb',
    pricePerBag: null,
    pricePerCubicYard: toNum(pricePerCubicYard),
    deliveryFee: toNum(deliveryFee),
    shortLoadFee: toNum(shortLoadFee),
    shortLoadThresholdYards: 4,
    excavationCostPerSqFt: toNum(excavation),
    gravelBaseCostPerSqFt: toNum(gravelBase),
    formworkCostPerLinFt: toNum(formwork),
    rebarCostPerSqFt: toNum(rebar),
    vaporBarrierCostPerSqFt: toNum(vaporBarrier),
    laborCostPerSqFt: toNum(labor),
    finishCostPerSqFt: toNum(finish),
    pumpFee: toNum(pumpFee),
    taxPercent: toNum(taxPercent),
    contingencyPercent: toNum(contingencyPercent),
    otherCost: toNum(otherCost),
  });

  const handleReset = () => {
    setSlabs([makeDefaultSlab('s1')]);
    setThicknessInches(4);
    setWastePercent(10);
    setPricePerCubicYard('');
    setDeliveryFee('');
    setExcavation('');
    setGravelBase('');
    setFormwork('');
    setRebar('');
    setVaporBarrier('');
    setLabor('');
    setFinish('');
    setPumpFee('');
    setShortLoadFee('');
    setTaxPercent('');
    setContingencyPercent('');
    setOtherCost('');
    setSaveStatus('');
  };

  const handleSave = () => {
    saveProject({
      id: `concrete-slab-cost-${Date.now()}`,
      name: `Slab Cost (${result.wasteAdjustedCubicYards.toFixed(2)} yd³${result.hasCostData ? ` · $${formatNumber(result.grandTotal, 0)}` : ''})`,
      projectType: 'concrete',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inputs: {
        slabs,
        thicknessInches,
        wastePercent,
        pricePerCubicYard,
        deliveryFee,
      },
      summary: {
        totalCubicYards: result.wasteAdjustedCubicYards,
        totalCost: result.hasCostData ? result.grandTotal : undefined,
        primaryDescription: `${result.wasteAdjustedCubicYards.toFixed(2)} yd³ · ${result.totalAreaSqFt.toFixed(0)} sq ft slab`,
      },
      billOfMaterials: [
        { item: 'Ready-Mix Concrete (Billed)', quantity: result.billedCubicYards.toFixed(2), unit: 'cu yd' },
        { item: 'Net Volume', quantity: result.netCubicYards.toFixed(3), unit: 'cu yd' },
        { item: '80-lb Bags (alt)', quantity: result.bags80lb, unit: 'bags' },
        { item: '60-lb Bags (alt)', quantity: result.bags60lb, unit: 'bags' },
      ],
    });
    setSaveStatus('Project saved locally!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const addSlab = () => {
    if (slabs.length >= 5) return;
    setSlabs((prev) => [...prev, makeDefaultSlab(`s${Date.now()}`)]);
  };

  const removeSlab = (id: string) => {
    setSlabs((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSlab = (id: string, patch: Partial<SlabState>) => {
    setSlabs((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const detailedCostLines: Array<{
    label: string;
    qty: string;
    unit: string;
    value: number | '';
    setter: (v: number | '') => void;
    subtotal: number;
    placeholder: string;
  }> = [
    {
      label: 'Excavation',
      qty: formatNumber(result.totalAreaSqFt, 0),
      unit: 'sq ft',
      value: excavation,
      setter: setExcavation,
      subtotal: result.excavationSubtotal,
      placeholder: '$/sq ft',
    },
    {
      label: 'Gravel Base',
      qty: formatNumber(result.totalAreaSqFt, 0),
      unit: 'sq ft',
      value: gravelBase,
      setter: setGravelBase,
      subtotal: result.gravelBaseSubtotal,
      placeholder: '$/sq ft',
    },
    {
      label: 'Formwork',
      qty: formatNumber(result.perimeterFt, 1),
      unit: 'lin ft',
      value: formwork,
      setter: setFormwork,
      subtotal: result.formworkSubtotal,
      placeholder: '$/lin ft',
    },
    {
      label: 'Rebar / Wire Mesh',
      qty: formatNumber(result.totalAreaSqFt, 0),
      unit: 'sq ft',
      value: rebar,
      setter: setRebar,
      subtotal: result.rebarSubtotal,
      placeholder: '$/sq ft',
    },
    {
      label: 'Vapor Barrier',
      qty: formatNumber(result.totalAreaSqFt, 0),
      unit: 'sq ft',
      value: vaporBarrier,
      setter: setVaporBarrier,
      subtotal: result.vaporBarrierSubtotal,
      placeholder: '$/sq ft',
    },
    {
      label: 'Labor — Pour & Level',
      qty: formatNumber(result.totalAreaSqFt, 0),
      unit: 'sq ft',
      value: labor,
      setter: setLabor,
      subtotal: result.laborSubtotal,
      placeholder: '$/sq ft',
    },
    {
      label: 'Finish (Trowel/Broom)',
      qty: formatNumber(result.totalAreaSqFt, 0),
      unit: 'sq ft',
      value: finish,
      setter: setFinish,
      subtotal: result.finishSubtotal,
      placeholder: '$/sq ft',
    },
    {
      label: 'Pump Fee',
      qty: '1',
      unit: 'flat',
      value: pumpFee,
      setter: setPumpFee,
      subtotal: result.pumpSubtotal,
      placeholder: '$',
    },
    {
      label: 'Short-Load Fee (< 4 yd)',
      qty: '1',
      unit: 'flat',
      value: shortLoadFee,
      setter: setShortLoadFee,
      subtotal: result.shortLoadSubtotal,
      placeholder: '$',
    },
    {
      label: 'Tax',
      qty: '%',
      unit: 'of subtotal',
      value: taxPercent,
      setter: setTaxPercent,
      subtotal: result.taxSubtotal,
      placeholder: '%',
    },
    {
      label: 'Contingency',
      qty: '%',
      unit: 'of subtotal',
      value: contingencyPercent,
      setter: setContingencyPercent,
      subtotal: result.contingencySubtotal,
      placeholder: '%',
    },
    {
      label: 'Other Costs',
      qty: '1',
      unit: 'flat',
      value: otherCost,
      setter: setOtherCost,
      subtotal: result.otherSubtotal,
      placeholder: '$',
    },
  ];

  return (
    <Card className="overflow-hidden border-slate-200/90 shadow-sm">
      {/* Header */}
      <div className="bg-slate-900 text-white px-5 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-green-600 text-white flex items-center justify-center shadow-xs">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Concrete Slab Cost Calculator
              </h2>
              <Badge
                variant="success"
                className="text-[10px] py-0 px-2 bg-green-600 hover:bg-green-600 text-white border-none"
              >
                Full Budget
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              Volume, bags, supplier ordering, and complete project cost breakdown
            </p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(val) => setTab(val as TabMode)}>
          <TabsList className="bg-slate-800 border-slate-700 text-slate-300">
            <TabsTrigger
              value="quick"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              Quick Estimate
            </TabsTrigger>
            <TabsTrigger
              value="detailed"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              Detailed Budget
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Split Panel Body */}
      <div className="p-4 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Slab Areas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Slab Dimensions
              </span>
              {slabs.length < 5 && (
                <button
                  type="button"
                  onClick={addSlab}
                  className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add Slab
                </button>
              )}
            </div>

            {slabs.map((slab, idx) => (
              <div
                key={slab.id}
                className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Slab {idx + 1}
                  </span>
                  {slabs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlab(slab.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove slab"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Length */}
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600">Length</Label>
                    <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-green-600 focus-within:border-green-600">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={slab.length}
                        onChange={(e) =>
                          updateSlab(slab.id, { length: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-2.5 py-2 text-sm text-slate-900 focus:outline-none font-mono-numbers"
                      />
                      <select
                        value={slab.lengthUnit}
                        onChange={(e) =>
                          updateSlab(slab.id, { lengthUnit: e.target.value as SlabUnit })
                        }
                        className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 border-l border-slate-300 focus:outline-none cursor-pointer"
                      >
                        {UNIT_OPTIONS.map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Width */}
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600">Width</Label>
                    <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-green-600 focus-within:border-green-600">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={slab.width}
                        onChange={(e) =>
                          updateSlab(slab.id, { width: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-2.5 py-2 text-sm text-slate-900 focus:outline-none font-mono-numbers"
                      />
                      <select
                        value={slab.widthUnit}
                        onChange={(e) =>
                          updateSlab(slab.id, { widthUnit: e.target.value as SlabUnit })
                        }
                        className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 border-l border-slate-300 focus:outline-none cursor-pointer"
                      >
                        {UNIT_OPTIONS.map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Thickness */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor={thicknessId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                Slab Thickness
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
                      ? 'bg-green-600 text-white border-green-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-green-500 hover:text-green-700'
                  }`}
                >
                  {t}"
                </button>
              ))}
              <span className="text-[10px] text-slate-400 self-center ml-1">or custom →</span>
            </div>

            <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-green-600 focus-within:border-green-600">
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

          {/* Waste */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Waste / Over-Pour Margin
                </span>
                <p className="text-[11px] text-slate-500">ACI recommendation: +10% for slabs</p>
              </div>
              <Badge variant="success" className="font-mono-numbers">
                +{wastePercent}%
              </Badge>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {WASTE_PRESETS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setWastePercent(pct)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    wastePercent === pct
                      ? 'bg-green-600 text-white border-green-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pct === 0 ? 'Exact' : `+${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Quick estimate prices */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Ready-Mix Pricing (Optional)
              </span>
              <span className="text-[11px] text-slate-500">avg $130–$175/yd³</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] text-slate-600 mb-1 block">
                  Concrete ($ / cu yd)
                </Label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 150"
                  value={pricePerCubicYard}
                  onChange={(e) =>
                    setPricePerCubicYard(e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs font-mono-numbers"
                />
              </div>
              <div>
                <Label className="text-[11px] text-slate-600 mb-1 block">
                  Delivery Fee ($)
                </Label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 75"
                  value={deliveryFee}
                  onChange={(e) =>
                    setDeliveryFee(e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white shadow-2xs font-mono-numbers"
                />
              </div>
            </div>
          </div>

          {/* Detailed budget cost lines */}
          {tab === 'detailed' && (
            <div className="p-4 bg-slate-50/80 rounded-xl border border-green-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Detailed Cost Lines
                </span>
                <Badge variant="outline" className="border-green-500 text-green-700 text-[10px]">
                  All Optional
                </Badge>
              </div>

              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-1.5 text-slate-500 font-semibold pr-2">Cost Line</th>
                      <th className="pb-1.5 text-slate-500 font-semibold pr-2 text-right">Qty</th>
                      <th className="pb-1.5 text-slate-500 font-semibold pr-2">Unit</th>
                      <th className="pb-1.5 text-slate-500 font-semibold pr-2">Rate</th>
                      <th className="pb-1.5 text-slate-500 font-semibold text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detailedCostLines.map((line) => (
                      <tr key={line.label}>
                        <td className="py-1.5 pr-2 font-medium text-slate-700 whitespace-nowrap">
                          {line.label}
                        </td>
                        <td className="py-1.5 pr-2 text-right font-mono text-slate-500">
                          {line.qty}
                        </td>
                        <td className="py-1.5 pr-2 text-slate-400">{line.unit}</td>
                        <td className="py-1.5 pr-2">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            placeholder={line.placeholder}
                            value={line.value}
                            onChange={(e) =>
                              line.setter(
                                e.target.value === '' ? '' : parseFloat(e.target.value)
                              )
                            }
                            className="w-20 px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono-numbers focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        </td>
                        <td className="py-1.5 text-right font-mono font-semibold text-slate-700">
                          {line.subtotal > 0 ? `$${formatNumber(line.subtotal, 2)}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1 print:hidden">
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
              className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Save Project
            </Button>
          </div>
          {saveStatus && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{saveStatus}</span>
            </div>
          )}
        </div>

        {/* Right Output (7 cols sticky) */}
        <div className="lg:col-span-7 flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          {/* Hero Volume Card */}
          <div className="relative overflow-hidden rounded-2xl border border-green-200/80 bg-gradient-to-br from-green-50/60 via-white to-green-50/30 p-5 sm:p-6 result-hero-card">
            <div className="absolute top-0 right-0 w-40 h-40 bg-green-400/15 rounded-full -translate-y-12 translate-x-12 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-emerald-300/10 rounded-full translate-y-8 -translate-x-8 blur-2xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-green-800">
                  Waste-Adjusted Volume
                </span>
                <Badge variant="outline" className="border-green-300 bg-white/80 text-green-900 text-[10px]">
                  +{wastePercent}% margin
                </Badge>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-['JetBrains_Mono',monospace] text-4xl sm:text-5xl font-bold text-slate-900 tabular-nums tracking-tight leading-none">
                  {formatNumber(result.wasteAdjustedCubicYards, 2)}
                </span>
                <span className="text-xl font-semibold text-slate-400">yd³</span>
              </div>

              <p className="text-xs text-slate-500 mt-2 font-['JetBrains_Mono',monospace]">
                Net pour:{' '}
                <strong className="text-slate-800">
                  {formatNumber(result.netCubicYards, 2)} yd³
                </strong>{' '}
                · {formatNumber(result.totalAreaSqFt, 0)} sq ft · {thicknessInches}" thick
              </p>
            </div>
          </div>

          {/* Supplier Order Card */}
          <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                Supplier Order (Billed)
              </span>
              {result.shortLoadApplied && (
                <Badge className="text-[10px] bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100">
                  Short-Load Fee Applied
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-['JetBrains_Mono',monospace] text-2xl font-bold text-slate-900 tabular-nums">
                {formatNumber(result.billedCubicYards, 2)}
              </span>
              <span className="text-base font-semibold text-slate-400">yd³</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Rounded to 0.25 yd increment · min 1 yd order
            </p>
          </div>

          {/* Bag Comparison Grid */}
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
            <div className="bg-green-600 rounded-xl p-2.5 sm:p-3 text-center">
              <div className="font-['JetBrains_Mono',monospace] text-base sm:text-lg font-bold text-white tabular-nums">
                {result.bags50lb}
              </div>
              <div className="text-[10px] text-green-100 mt-0.5 font-medium">bags</div>
              <div className="text-[9px] text-green-200 mt-0.5 uppercase tracking-wider">50-lb Fast-Set</div>
            </div>
          </div>

          {/* Recommendation Card */}
          <div
            className={`p-3.5 sm:p-4 rounded-xl text-xs flex gap-3 items-start border shadow-2xs ${
              result.recommendedMethod === 'ready-mix'
                ? 'bg-green-50/70 text-green-950 border-green-200'
                : 'bg-slate-50/70 text-slate-950 border-slate-200'
            }`}
          >
            <Lightbulb
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                result.recommendedMethod === 'ready-mix' ? 'text-green-700' : 'text-slate-600'
              }`}
            />
            <div>
              <strong className="block text-slate-900 mb-0.5">Recommendation:</strong>
              <span className="leading-relaxed text-slate-700">
                {result.recommendedMethod === 'ready-mix'
                  ? `At ${result.wasteAdjustedCubicYards.toFixed(2)} yd³ (${result.bags80lb} bags), ordering a ready-mix truck is faster, stronger, and avoids hand-mixing ${(result.bags80lb * 80).toLocaleString()} lbs of cement.`
                  : `At ${result.wasteAdjustedCubicYards.toFixed(2)} yd³ (${result.bags80lb} bags), bagged premix from a local building supplier is economical and avoids short-load fees.`}
              </span>
            </div>
          </div>

          {/* Grand Total Cost Card */}
          {result.hasCostData && (
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-green-200 shadow-2xs space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Full Project Cost Estimate
              </div>

              {/* Breakdown rows */}
              <div className="space-y-1.5 text-xs">
                {result.concreteSubtotal > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Concrete ({formatNumber(result.billedCubicYards, 2)} yd³)</span>
                    <span className="font-mono">${formatNumber(result.concreteSubtotal, 2)}</span>
                  </div>
                )}
                {result.deliverySubtotal > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Delivery</span>
                    <span className="font-mono">${formatNumber(result.deliverySubtotal, 2)}</span>
                  </div>
                )}
                {result.shortLoadSubtotal > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Short-Load Fee</span>
                    <span className="font-mono">${formatNumber(result.shortLoadSubtotal, 2)}</span>
                  </div>
                )}
                {result.excavationSubtotal > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Excavation</span>
                    <span className="font-mono">${formatNumber(result.excavationSubtotal, 2)}</span>
                  </div>
                )}
                {result.gravelBaseSubtotal > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Gravel Base</span>
                    <span className="font-mono">${formatNumber(result.gravelBaseSubtotal, 2)}</span>
                  </div>
                )}
                {result.formworkSubtotal > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Formwork</span>
                    <span className="font-mono">${formatNumber(result.formworkSubtotal, 2)}</span>
                  </div>
                )}
                {result.rebarSubtotal > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Rebar / Wire Mesh</span>
                    <span className="font-mono">${formatNumber(result.rebarSubtotal, 2)}</span>
                  </div>
                )}
                {result.vaporBarrierSubtotal > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Vapor Barrier</span>
                    <span className="font-mono">${formatNumber(result.vaporBarrierSubtotal, 2)}</span>
                  </div>
                )}
                {result.laborSubtotal > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Labor — Pour &amp; Level</span>
                    <span className="font-mono">${formatNumber(result.laborSubtotal, 2)}</span>
                  </div>
                )}
                {result.finishSubtotal > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Finish</span>
                    <span className="font-mono">${formatNumber(result.finishSubtotal, 2)}</span>
                  </div>
                )}
                {result.pumpSubtotal > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Pump Fee</span>
                    <span className="font-mono">${formatNumber(result.pumpSubtotal, 2)}</span>
                  </div>
                )}
                {result.otherSubtotal > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Other Costs</span>
                    <span className="font-mono">${formatNumber(result.otherSubtotal, 2)}</span>
                  </div>
                )}

                {(result.taxSubtotal > 0 || result.contingencySubtotal > 0) && (
                  <div className="border-t border-slate-100 pt-1.5 mt-1 space-y-1">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span className="font-mono">${formatNumber(result.subtotalBeforeTax, 2)}</span>
                    </div>
                    {result.taxSubtotal > 0 && (
                      <div className="flex justify-between text-slate-500">
                        <span>Tax ({taxPercent}%)</span>
                        <span className="font-mono">${formatNumber(result.taxSubtotal, 2)}</span>
                      </div>
                    )}
                    {result.contingencySubtotal > 0 && (
                      <div className="flex justify-between text-slate-500">
                        <span>Contingency ({contingencyPercent}%)</span>
                        <span className="font-mono">${formatNumber(result.contingencySubtotal, 2)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="border-t border-green-100 pt-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-slate-400">$</span>
                  <span className="font-['JetBrains_Mono',monospace] text-3xl font-bold text-green-700 tabular-nums">
                    {formatNumber(result.grandTotal, 2)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  ≈ ${formatNumber(result.grandTotal / Math.max(result.totalAreaSqFt, 1), 2)} / sq ft
                </p>
              </div>
            </div>
          )}

          {/* Missing Prices Disclosure */}
          {result.missingPriceKeys.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>{result.missingPriceKeys.length} cost line{result.missingPriceKeys.length !== 1 ? 's' : ''} not entered</strong>{' '}
                — total reflects only the prices you've provided.
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
