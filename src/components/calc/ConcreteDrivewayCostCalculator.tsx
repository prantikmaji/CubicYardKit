import React, { useState, useId } from 'react';
import { formatNumber } from '../../lib/calc/units';
import type { DrivewayUnit, ProjectScope } from '../../lib/calc/concrete-driveway-cost';
import { calculateConcreteDriveway } from '../../lib/calc/concrete-driveway-cost';
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
  Lightbulb,
  PlusCircle,
  Trash2,
  DollarSign,
  AlertCircle,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DrivewaySectionState {
  id: string;
  label: string;
  length: number;
  lengthUnit: DrivewayUnit;
  width: number;
  widthUnit: DrivewayUnit;
}

type TabMode = 'quick' | 'detailed';

const UNIT_OPTIONS: { value: DrivewayUnit; label: string }[] = [
  { value: 'feet', label: 'ft' },
  { value: 'inches', label: 'in' },
  { value: 'yards', label: 'yd' },
  { value: 'meters', label: 'm' },
];

const THICKNESS_PRESETS = [4, 5, 6, 8];
const WASTE_PRESETS = [0, 5, 10, 15];

function makeDefaultSection(id: string, label: string = 'Main Driveway'): DrivewaySectionState {
  return { id, label, length: 20, lengthUnit: 'feet', width: 10, widthUnit: 'feet' };
}

export default function ConcreteDrivewayCostCalculator() {
  const [tab, setTab] = useState<TabMode>('quick');
  const [scope, setScope] = useState<ProjectScope>('new');
  const [sections, setSections] = useState<DrivewaySectionState[]>([
    makeDefaultSection('sec-1', 'Main Driveway'),
  ]);
  const [thicknessInches, setThicknessInches] = useState<number>(5);
  const [wastePercent, setWastePercent] = useState<number>(10);
  const [gravelBaseDepthInches, setGravelBaseDepthInches] = useState<number | ''>('');

  // Quick estimate prices
  const [pricePerCubicYard, setPricePerCubicYard] = useState<number | ''>('');
  const [deliveryFee, setDeliveryFee] = useState<number | ''>('');

  // Detailed budget inputs
  const [excavation, setExcavation] = useState<number | ''>('');
  const [demolition, setDemolition] = useState<number | ''>(''); // replacement only
  const [disposal, setDisposal] = useState<number | ''>(''); // replacement only
  const [gravelBase, setGravelBase] = useState<number | ''>('');
  const [formwork, setFormwork] = useState<number | ''>('');
  const [rebar, setRebar] = useState<number | ''>('');
  const [vaporBarrier, setVaporBarrier] = useState<number | ''>('');
  const [labor, setLabor] = useState<number | ''>('');
  const [finish, setFinish] = useState<number | ''>('');
  const [controlJoints, setControlJoints] = useState<number | ''>('');
  const [sealing, setSealing] = useState<number | ''>('');
  const [pumpFee, setPumpFee] = useState<number | ''>('');
  const [shortLoadFee, setShortLoadFee] = useState<number | ''>('');
  const [taxPercent, setTaxPercent] = useState<number | ''>('');
  const [contingencyPercent, setContingencyPercent] = useState<number | ''>('');
  const [otherCost, setOtherCost] = useState<number | ''>('');

  const [saveStatus, setSaveStatus] = useState<string>('');

  const thicknessId = useId();
  const baseDepthId = useId();

  const toNum = (v: number | ''): number | null =>
    typeof v === 'number' && v > 0 ? v : null;

  const result = calculateConcreteDriveway({
    scope,
    sections: sections.map((s) => ({
      id: s.id,
      label: s.label,
      length: s.length || 0,
      lengthUnit: s.lengthUnit,
      width: s.width || 0,
      widthUnit: s.widthUnit,
    })),
    thicknessInches: thicknessInches || 0,
    wastePercent,
    minOrderYards: 1,
    orderIncrementYards: 0.25,
    shortLoadThresholdYards: 4,
    gravelBaseDepthInches: toNum(gravelBaseDepthInches),
    pricePerCubicYard: toNum(pricePerCubicYard),
    deliveryFee: toNum(deliveryFee),
    shortLoadFee: toNum(shortLoadFee),
    excavationCostPerSqFt: toNum(excavation),
    demolitionCostPerSqFt: toNum(demolition),
    disposalCostPerSqFt: toNum(disposal),
    gravelBaseCostPerSqFt: toNum(gravelBase),
    formworkCostPerLinFt: toNum(formwork),
    rebarCostPerSqFt: toNum(rebar),
    vaporBarrierCostPerSqFt: toNum(vaporBarrier),
    laborCostPerSqFt: toNum(labor),
    finishCostPerSqFt: toNum(finish),
    controlJointCostPerLinFt: toNum(controlJoints),
    sealingCostPerSqFt: toNum(sealing),
    pumpFee: toNum(pumpFee),
    taxPercent: toNum(taxPercent),
    contingencyPercent: toNum(contingencyPercent),
    otherCost: toNum(otherCost),
  });

  const handleAddSection = () => {
    if (sections.length >= 4) return;
    const nextIdx = sections.length + 1;
    const label = nextIdx === 2 ? 'Parking Apron' : nextIdx === 3 ? 'Turnaround' : `Section ${nextIdx}`;
    setSections([...sections, makeDefaultSection(`sec-${Date.now()}`, label)]);
  };

  const handleRemoveSection = (id: string) => {
    if (sections.length <= 1) return;
    setSections(sections.filter((s) => s.id !== id));
  };

  const handleUpdateSection = (
    id: string,
    field: keyof DrivewaySectionState,
    value: string | number
  ) => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleReset = () => {
    setScope('new');
    setSections([makeDefaultSection('sec-1', 'Main Driveway')]);
    setThicknessInches(5);
    setWastePercent(10);
    setGravelBaseDepthInches('');
    setPricePerCubicYard('');
    setDeliveryFee('');
    setExcavation('');
    setDemolition('');
    setDisposal('');
    setGravelBase('');
    setFormwork('');
    setRebar('');
    setVaporBarrier('');
    setLabor('');
    setFinish('');
    setControlJoints('');
    setSealing('');
    setPumpFee('');
    setShortLoadFee('');
    setTaxPercent('');
    setContingencyPercent('');
    setOtherCost('');
    setSaveStatus('');
  };

  const handleSave = () => {
    saveProject({
      id: `concrete-driveway-cost-${Date.now()}`,
      name: `Driveway (${scope.toUpperCase()}) — ${result.wasteAdjustedCubicYards.toFixed(2)} yd³${
        result.hasCostData ? ` · $${formatNumber(result.grandTotal, 0)}` : ''
      }`,
      projectType: 'concrete',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inputs: {
        scope,
        sections,
        thicknessInches,
        wastePercent,
        gravelBaseDepthInches,
        pricePerCubicYard,
        deliveryFee,
      },
      summary: {
        totalCubicYards: result.wasteAdjustedCubicYards,
        totalCost: result.hasCostData ? result.grandTotal : undefined,
        primaryDescription: `${result.wasteAdjustedCubicYards.toFixed(2)} yd³ · ${result.totalAreaSqFt.toFixed(
          0
        )} sq ft ${scope} driveway${result.costPerSqFt ? ` ($${result.costPerSqFt.toFixed(2)}/sq ft)` : ''}`,
      },
      billOfMaterials: [
        {
          item: 'Ready-Mix Concrete (Supplier Billed)',
          quantity: result.billedCubicYards.toFixed(2),
          unit: 'cu yd',
        },
        {
          item: 'Net Concrete Volume',
          quantity: result.netCubicYards.toFixed(2),
          unit: 'cu yd',
        },
        ...(result.gravelBaseCubicYards
          ? [
              {
                item: 'Crushed Gravel Sub-Base',
                quantity: result.gravelBaseCubicYards.toFixed(2),
                unit: 'cu yd',
              },
            ]
          : []),
        {
          item: '80-lb Concrete Bags Equivalent',
          quantity: result.bags80lb,
          unit: 'bags',
        },
      ],
    });
    setSaveStatus('Driveway project saved locally!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <Card className="overflow-hidden border-slate-200/90 shadow-sm">
      {/* Header Banner — Rich slate with amber industrial badge */}
      <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Concrete Driveway Cost Calculator
              </h2>
              <Badge className="text-[10px] py-0 px-2 bg-amber-500 hover:bg-amber-500 text-slate-950 font-bold border-none">
                Installed & Material
              </Badge>
            </div>
            <p className="text-xs text-slate-300">
              Calculate ready-mix volume, bags, supplier billing rules, and full installation costs
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <Tabs value={tab} onValueChange={(val) => setTab(val as TabMode)}>
          <TabsList className="bg-slate-800 border-slate-700 text-slate-300">
            <TabsTrigger
              value="quick"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-semibold"
            >
              Quick Estimate
            </TabsTrigger>
            <TabsTrigger
              value="detailed"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-semibold"
            >
              Detailed Budget
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Scope Selector: New Driveway | Replacement | Extension */}
      <div className="bg-slate-100/90 px-5 sm:px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Project Scope:
          </span>
          <div className="inline-flex rounded-lg p-0.5 bg-slate-200 border border-slate-300">
            <button
              type="button"
              onClick={() => setScope('new')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                scope === 'new'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🆕 New Driveway
            </button>
            <button
              type="button"
              onClick={() => setScope('replacement')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                scope === 'replacement'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔄 Full Replacement
            </button>
            <button
              type="button"
              onClick={() => setScope('extension')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                scope === 'extension'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ➕ Extension / Apron
            </button>
          </div>
        </div>

        {scope === 'replacement' && (
          <span className="text-[11px] font-medium text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
            Demolition & Haul-Off lines enabled in Detailed Budget
          </span>
        )}
      </div>

      {/* Split Panel Layout */}
      <div className="p-4 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Form (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Driveway Sections */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Driveway Dimensions & Sections
                </Label>
                <p className="text-[11px] text-slate-500">
                  Add aprons, turnarounds, or parking pads
                </p>
              </div>
              {sections.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add Section
                </button>
              )}
            </div>

            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                className="bg-slate-50/90 border border-slate-200 rounded-xl p-3.5 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={sec.label}
                    onChange={(e) => handleUpdateSection(sec.id, 'label', e.target.value)}
                    className="text-xs font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white px-1 py-0.5 rounded focus:outline-none"
                    placeholder="Section Name"
                  />
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(sec.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] text-slate-600 font-semibold mb-1 block">
                      Length
                    </Label>
                    <div className="flex rounded-lg border border-slate-300 bg-white overflow-hidden shadow-2xs focus-within:ring-2 focus-within:ring-amber-500">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={sec.length}
                        onChange={(e) =>
                          handleUpdateSection(sec.id, 'length', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none font-mono"
                      />
                      <select
                        value={sec.lengthUnit}
                        onChange={(e) =>
                          handleUpdateSection(sec.id, 'lengthUnit', e.target.value as DrivewayUnit)
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

                  <div>
                    <Label className="text-[11px] text-slate-600 font-semibold mb-1 block">
                      Width
                    </Label>
                    <div className="flex rounded-lg border border-slate-300 bg-white overflow-hidden shadow-2xs focus-within:ring-2 focus-within:ring-amber-500">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={sec.width}
                        onChange={(e) =>
                          handleUpdateSection(sec.id, 'width', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none font-mono"
                      />
                      <select
                        value={sec.widthUnit}
                        onChange={(e) =>
                          handleUpdateSection(sec.id, 'widthUnit', e.target.value as DrivewayUnit)
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

          {/* Driveway Slab Thickness */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor={thicknessId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                Concrete Thickness
              </Label>
              <span className="text-[11px] text-slate-500">
                5" is standard residential recommendation
              </span>
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {THICKNESS_PRESETS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setThicknessInches(t)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                    thicknessInches === t
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-bold'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-amber-400'
                  }`}
                >
                  {t}" {t === 4 ? '(light cars)' : t === 5 ? '(standard)' : t === 6 ? '(trucks/SUVs)' : '(heavy duty)'}
                </button>
              ))}
            </div>

            <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-amber-500">
              <input
                id={thicknessId}
                type="number"
                min="3"
                max="14"
                step="0.5"
                value={thicknessInches}
                onChange={(e) => setThicknessInches(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none font-mono"
              />
              <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 flex items-center border-l border-slate-300">
                inches
              </span>
            </div>
          </div>

          {/* Gravel Base Depth (Optional) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor={baseDepthId} className="text-xs uppercase tracking-wider text-slate-700 font-bold">
                Crushed Gravel Base Depth (Optional)
              </Label>
              <span className="text-[11px] text-slate-500">Typical: 4" compacted base</span>
            </div>
            <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:ring-2 focus-within:ring-amber-500">
              <input
                id={baseDepthId}
                type="number"
                min="0"
                max="12"
                step="0.5"
                placeholder="4"
                value={gravelBaseDepthInches}
                onChange={(e) =>
                  setGravelBaseDepthInches(e.target.value === '' ? '' : parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none font-mono"
              />
              <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 flex items-center border-l border-slate-300">
                inches
              </span>
            </div>
          </div>

          {/* Waste Factor */}
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Waste & Form Deflection Allowance
                </span>
                <p className="text-[11px] text-slate-500">
                  Standard rule: +10% over-pour margin for uneven sub-base
                </p>
              </div>
              <Badge className="bg-amber-100 text-amber-900 border border-amber-300 font-mono">
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
                      ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pct === 0 ? 'Exact (0%)' : `+${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Tab Pricing */}
          {tab === 'quick' && (
            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Material Pricing (Optional)
                </span>
                <span className="text-[11px] text-amber-800">Ready-mix avg $130–$175/yd</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] text-slate-700 font-semibold mb-1 block">
                    Ready-Mix Concrete ($ / yd³)
                  </Label>
                  <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden">
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 flex items-center border-r border-slate-300">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="150"
                      value={pricePerCubicYard}
                      onChange={(e) =>
                        setPricePerCubicYard(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[11px] text-slate-700 font-semibold mb-1 block">
                    Ready-Mix Delivery Fee ($ flat)
                  </Label>
                  <div className="flex rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden">
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 flex items-center border-r border-slate-300">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="75"
                      value={deliveryFee}
                      onChange={(e) =>
                        setDeliveryFee(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-amber-900 pt-1">
                💡 Want labor, demolition, rebar, and finishing costs? Switch to the{' '}
                <button
                  type="button"
                  onClick={() => setTab('detailed')}
                  className="font-bold underline text-amber-950 hover:text-black"
                >
                  Detailed Budget tab
                </button>
                .
              </p>
            </div>
          )}

          {/* Detailed Budget Inputs */}
          {tab === 'detailed' && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Itemized Cost Line Items
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Enter local unit rates; unentered fields are omitted from totals
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 text-xs">
                {/* Ready-mix material */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label className="text-[11px] text-slate-700 block mb-1">
                      Ready-Mix Concrete ($/yd³)
                    </Label>
                    <input
                      type="number"
                      placeholder="150"
                      value={pricePerCubicYard}
                      onChange={(e) =>
                        setPricePerCubicYard(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-700 block mb-1">
                      Delivery Fee ($ flat)
                    </Label>
                    <input
                      type="number"
                      placeholder="75"
                      value={deliveryFee}
                      onChange={(e) =>
                        setDeliveryFee(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Replacement specific costs */}
                {scope === 'replacement' && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg space-y-2">
                    <span className="text-[11px] font-bold text-amber-950 block">
                      Tear-Out & Haul-Off (Replacement Only)
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <Label className="text-[11px] text-slate-700 block mb-1">
                          Demolition Labor ($/sq ft)
                        </Label>
                        <input
                          type="number"
                          placeholder="2.00"
                          value={demolition}
                          onChange={(e) =>
                            setDemolition(e.target.value === '' ? '' : parseFloat(e.target.value))
                          }
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-slate-700 block mb-1">
                          Concrete Disposal ($/sq ft)
                        </Label>
                        <input
                          type="number"
                          placeholder="1.50"
                          value={disposal}
                          onChange={(e) =>
                            setDisposal(e.target.value === '' ? '' : parseFloat(e.target.value))
                          }
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Site prep */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label className="text-[11px] text-slate-700 block mb-1">
                      Excavation / Grading ($/sq ft)
                    </Label>
                    <input
                      type="number"
                      placeholder="1.50"
                      value={excavation}
                      onChange={(e) =>
                        setExcavation(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-700 block mb-1">
                      Gravel Base ($/sq ft)
                    </Label>
                    <input
                      type="number"
                      placeholder="1.25"
                      value={gravelBase}
                      onChange={(e) =>
                        setGravelBase(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Formwork & Reinforcement */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label className="text-[11px] text-slate-700 block mb-1">
                      Formwork Lumber & Pins ($/lin ft)
                    </Label>
                    <input
                      type="number"
                      placeholder="2.00"
                      value={formwork}
                      onChange={(e) =>
                        setFormwork(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-700 block mb-1">
                      Rebar / Wire Mesh ($/sq ft)
                    </Label>
                    <input
                      type="number"
                      placeholder="0.75"
                      value={rebar}
                      onChange={(e) =>
                        setRebar(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Labor & Finish */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label className="text-[11px] text-slate-700 block mb-1">
                      Pour & Level Labor ($/sq ft)
                    </Label>
                    <input
                      type="number"
                      placeholder="3.50"
                      value={labor}
                      onChange={(e) =>
                        setLabor(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-700 block mb-1">
                      Finish (Broom/Stamped) ($/sq ft)
                    </Label>
                    <input
                      type="number"
                      placeholder="1.50"
                      value={finish}
                      onChange={(e) =>
                        setFinish(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Control Joints & Sealing */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label className="text-[11px] text-slate-700 block mb-1">
                      Control Joints ($/lin ft)
                    </Label>
                    <input
                      type="number"
                      placeholder="1.00"
                      value={controlJoints}
                      onChange={(e) =>
                        setControlJoints(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-700 block mb-1">
                      Curing / Sealing ($/sq ft)
                    </Label>
                    <input
                      type="number"
                      placeholder="0.60"
                      value={sealing}
                      onChange={(e) =>
                        setSealing(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Surcharges & Overhead */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[10px] text-slate-700 block mb-1">
                      Short-Load ($)
                    </Label>
                    <input
                      type="number"
                      placeholder="150"
                      value={shortLoadFee}
                      onChange={(e) =>
                        setShortLoadFee(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-slate-700 block mb-1">
                      Tax (%)
                    </Label>
                    <input
                      type="number"
                      placeholder="6"
                      value={taxPercent}
                      onChange={(e) =>
                        setTaxPercent(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-slate-700 block mb-1">
                      Contingency (%)
                    </Label>
                    <input
                      type="number"
                      placeholder="10"
                      value={contingencyPercent}
                      onChange={(e) =>
                        setContingencyPercent(
                          e.target.value === '' ? '' : parseFloat(e.target.value)
                        )
                      }
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 print:hidden">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-slate-600"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Save Driveway Estimate
            </Button>
          </div>

          {saveStatus && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{saveStatus}</span>
            </div>
          )}
        </div>

        {/* Right Output Dashboard (7 cols sticky) */}
        <div className="lg:col-span-7 flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          {/* Hero Ready-Mix Volume Card */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 p-5 sm:p-6 shadow-2xs">
            <div className="absolute top-0 right-0 w-44 h-44 bg-amber-400/15 rounded-full -translate-y-12 translate-x-12 blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-900">
                  Ready-Mix Concrete Volume
                </span>
                <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px]">
                  +{wastePercent}% waste allowance
                </Badge>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-mono text-4xl sm:text-5xl font-black text-slate-900 tabular-nums tracking-tight leading-none">
                  {formatNumber(result.wasteAdjustedCubicYards, 2)}
                </span>
                <span className="text-xl font-bold text-slate-400">yd³</span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-xs text-slate-600 font-mono">
                <span>
                  Net volume: <strong className="text-slate-800">{formatNumber(result.netCubicYards, 2)} yd³</strong> ({formatNumber(result.netCubicFeet, 1)} ft³)
                </span>
                <span>•</span>
                <span>
                  Total Area: <strong className="text-slate-800">{formatNumber(result.totalAreaSqFt, 0)} sq ft</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Supplier Dispatch & Truckload Card */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Ready-Mix Dispatch Order
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                0.25 yd³ batch rounding
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Billed Order Quantity
                </div>
                <div className="font-mono text-xl font-bold text-slate-900 mt-0.5">
                  {formatNumber(result.billedCubicYards, 2)} <span className="text-xs font-normal text-slate-500">yd³</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Mixer Truckloads
                </div>
                <div className="font-mono text-xl font-bold text-slate-900 mt-0.5">
                  {result.truckloadsNeeded} <span className="text-xs font-normal text-slate-500">truck{result.truckloadsNeeded > 1 ? 's' : ''} (~10 yd³)</span>
                </div>
              </div>
            </div>

            {result.shortLoadApplied && (
              <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Short-load surcharge applies (order under 4 yd³ threshold).
                </span>
              </div>
            )}
          </div>

          {/* Per-Section Breakdown Table (if multiple sections) */}
          {result.sections.length > 1 && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Section Breakdown
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-1.5 px-2">Section</th>
                      <th className="py-1.5 px-2 text-right">Area</th>
                      <th className="py-1.5 px-2 text-right">Perimeter</th>
                      <th className="py-1.5 px-2 text-right">Net Yards</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {result.sections.map((s) => (
                      <tr key={s.id}>
                        <td className="py-1.5 px-2 font-sans font-medium text-slate-800">{s.label}</td>
                        <td className="py-1.5 px-2 text-right">{formatNumber(s.areaSquareFeet, 0)} sq ft</td>
                        <td className="py-1.5 px-2 text-right">{formatNumber(s.perimeterFt, 0)} ft</td>
                        <td className="py-1.5 px-2 text-right">{formatNumber(s.netCubicYards, 2)} yd³</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Gravel Base Requirement (if enabled) */}
          {result.gravelBaseCubicYards !== null && (
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-600" />
                <div>
                  <span className="font-bold text-slate-900 block">Crushed Gravel Base Required</span>
                  <span className="text-slate-500">{gravelBaseDepthInches}" compacted sub-base depth</span>
                </div>
              </div>
              <div className="font-mono text-right">
                <span className="text-base font-bold text-slate-900">{formatNumber(result.gravelBaseCubicYards, 2)}</span>
                <span className="text-slate-500 ml-1">yd³</span>
              </div>
            </div>
          )}

          {/* Bag Counts Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-100 rounded-xl p-3 text-center">
              <div className="font-mono text-lg font-bold text-slate-900">
                {result.bags80lb}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">80-lb pre-mixed bags</div>
              <div className="text-[9px] text-slate-400 mt-0.5">0.60 cu ft yield</div>
            </div>
            <div className="bg-slate-100 rounded-xl p-3 text-center">
              <div className="font-mono text-lg font-bold text-slate-900">
                {result.bags60lb}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">60-lb pre-mixed bags</div>
              <div className="text-[9px] text-slate-400 mt-0.5">0.45 cu ft yield</div>
            </div>
          </div>

          {/* Delivery Recommendation */}
          <div className="p-3.5 rounded-xl text-xs flex gap-3 items-start border bg-amber-50/70 text-amber-950 border-amber-200 shadow-2xs">
            <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <strong className="block text-slate-900 mb-0.5">Pour Recommendation:</strong>
              <span className="leading-relaxed text-slate-700">
                At {result.wasteAdjustedCubicYards.toFixed(2)} cubic yards ({result.bags80lb} eighty-pound bags), ready-mix transit mixer dispatch is strongly recommended. Hand-mixing this quantity would require {result.bags80lb * 80} lbs of dry cement and introduces severe cold-joint failure risks on driveways.
              </span>
            </div>
          </div>

          {/* Grand Total Cost Dashboard */}
          {result.hasCostData ? (
            <div className="bg-white rounded-2xl p-5 border-2 border-amber-400 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Estimated Project Cost ({scope.toUpperCase()})
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-bold text-slate-400">$</span>
                    <span className="font-mono text-3xl sm:text-4xl font-black text-slate-900">
                      {formatNumber(result.grandTotal, 2)}
                    </span>
                  </div>
                </div>

                {result.costPerSqFt !== null && (
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Cost per Sq Ft
                    </span>
                    <div className="font-mono text-xl font-black text-amber-700">
                      ${formatNumber(result.costPerSqFt, 2)}
                    </div>
                  </div>
                )}
              </div>

              {/* Itemized breakdown table */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                  Cost Line Breakdown:
                </span>
                <div className="divide-y divide-slate-100 font-mono">
                  {result.concreteSubtotal > 0 && (
                    <div className="flex justify-between py-1 text-slate-700">
                      <span>Ready-Mix Concrete ({formatNumber(result.billedCubicYards, 2)} yd³)</span>
                      <span className="font-bold">${formatNumber(result.concreteSubtotal, 2)}</span>
                    </div>
                  )}
                  {result.deliverySubtotal > 0 && (
                    <div className="flex justify-between py-1 text-slate-700">
                      <span>Delivery Fee</span>
                      <span className="font-bold">${formatNumber(result.deliverySubtotal, 2)}</span>
                    </div>
                  )}
                  {result.shortLoadSubtotal > 0 && (
                    <div className="flex justify-between py-1 text-amber-700">
                      <span>Short-Load Surcharge</span>
                      <span className="font-bold">${formatNumber(result.shortLoadSubtotal, 2)}</span>
                    </div>
                  )}
                  {result.demolitionSubtotal > 0 && (
                    <div className="flex justify-between py-1 text-slate-700">
                      <span>Old Slab Demolition</span>
                      <span className="font-bold">${formatNumber(result.demolitionSubtotal, 2)}</span>
                    </div>
                  )}
                  {result.disposalSubtotal > 0 && (
                    <div className="flex justify-between py-1 text-slate-700">
                      <span>Concrete Disposal / Haul-Off</span>
                      <span className="font-bold">${formatNumber(result.disposalSubtotal, 2)}</span>
                    </div>
                  )}
                  {result.excavationSubtotal > 0 && (
                    <div className="flex justify-between py-1 text-slate-700">
                      <span>Excavation & Subgrade Prep</span>
                      <span className="font-bold">${formatNumber(result.excavationSubtotal, 2)}</span>
                    </div>
                  )}
                  {result.gravelBaseSubtotal > 0 && (
                    <div className="flex justify-between py-1 text-slate-700">
                      <span>Gravel Sub-Base</span>
                      <span className="font-bold">${formatNumber(result.gravelBaseSubtotal, 2)}</span>
                    </div>
                  )}
                  {result.formworkSubtotal > 0 && (
                    <div className="flex justify-between py-1 text-slate-700">
                      <span>Formwork Lumber ({formatNumber(result.totalPerimeterFt, 0)} lin ft)</span>
                      <span className="font-bold">${formatNumber(result.formworkSubtotal, 2)}</span>
                    </div>
                  )}
                  {result.rebarSubtotal > 0 && (
                    <div className="flex justify-between py-1 text-slate-700">
                      <span>Rebar / Wire Mesh</span>
                      <span className="font-bold">${formatNumber(result.rebarSubtotal, 2)}</span>
                    </div>
                  )}
                  {result.laborSubtotal > 0 && (
                    <div className="flex justify-between py-1 text-slate-700">
                      <span>Pour & Level Labor</span>
                      <span className="font-bold">${formatNumber(result.laborSubtotal, 2)}</span>
                    </div>
                  )}
                  {result.finishSubtotal > 0 && (
                    <div className="flex justify-between py-1 text-slate-700">
                      <span>Finish Labor</span>
                      <span className="font-bold">${formatNumber(result.finishSubtotal, 2)}</span>
                    </div>
                  )}
                  {result.controlJointSubtotal > 0 && (
                    <div className="flex justify-between py-1 text-slate-700">
                      <span>Control Joint Sawing</span>
                      <span className="font-bold">${formatNumber(result.controlJointSubtotal, 2)}</span>
                    </div>
                  )}
                  {result.sealingSubtotal > 0 && (
                    <div className="flex justify-between py-1 text-slate-700">
                      <span>Curing & Sealing</span>
                      <span className="font-bold">${formatNumber(result.sealingSubtotal, 2)}</span>
                    </div>
                  )}
                  {result.taxSubtotal > 0 && (
                    <div className="flex justify-between py-1 text-slate-500">
                      <span>Sales Tax</span>
                      <span>${formatNumber(result.taxSubtotal, 2)}</span>
                    </div>
                  )}
                  {result.contingencySubtotal > 0 && (
                    <div className="flex justify-between py-1 text-slate-500">
                      <span>Contingency Reserve</span>
                      <span>${formatNumber(result.contingencySubtotal, 2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {result.missingPriceKeys.length > 0 && (
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  ⚠️ Note: {result.missingPriceKeys.length} cost items (such as{' '}
                  {result.missingPriceKeys.slice(0, 3).join(', ')}) were not entered and are omitted from this budget.
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 space-y-1">
              <DollarSign className="w-5 h-5 mx-auto text-slate-400" />
              <span className="font-bold text-slate-700 block">Want a Cost Estimate?</span>
              <p>
                Enter ready-mix price in Quick Estimate or open Detailed Budget to calculate complete installed pricing.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

