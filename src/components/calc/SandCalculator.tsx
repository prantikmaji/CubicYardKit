import React, { useState, useId } from 'react';
import { formatNumber } from '../../lib/calc/units';
import type { LengthUnit } from '../../lib/calc/units';
import type {
  SandMaterialId,
  SandProjectPresetId,
  SandSectionInput,
  SandCalculationInput,
} from '../../lib/calc/sand';
import {
  calculateSand,
  convertSandVolumeWeight,
  SAND_PROFILES,
  SAND_PRESETS,
} from '../../lib/calc/sand';
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
  Ruler,
  Package,
  Scale,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';

type TabMode = 'quick' | 'procurement' | 'budget' | 'converter';

interface SectionState {
  id: string;
  name: string;
  shape: 'rectangle' | 'circle';
  length: number;
  lengthUnit: LengthUnit;
  width: number;
  widthUnit: LengthUnit;
  diameter: number;
  diameterUnit: LengthUnit;
  depth: number;
  depthUnit: LengthUnit;
}

const LENGTH_UNITS: { value: LengthUnit; label: string }[] = [
  { value: 'feet', label: 'ft' },
  { value: 'inches', label: 'in' },
  { value: 'yards', label: 'yd' },
  { value: 'meters', label: 'm' },
  { value: 'centimeters', label: 'cm' },
];

const DEPTH_UNITS: { value: LengthUnit; label: string }[] = [
  { value: 'inches', label: 'in' },
  { value: 'feet', label: 'ft' },
  { value: 'centimeters', label: 'cm' },
];

function makeDefaultSection(id: string, name: string = 'Area 1'): SectionState {
  return {
    id,
    name,
    shape: 'rectangle',
    length: 20,
    lengthUnit: 'feet',
    width: 10,
    widthUnit: 'feet',
    diameter: 12,
    diameterUnit: 'feet',
    depth: 2,
    depthUnit: 'inches',
  };
}

export default function SandCalculator() {
  const [tab, setTab] = useState<TabMode>('quick');
  const [presetId, setPresetId] = useState<SandProjectPresetId>('general');
  const [inputMode, setInputMode] = useState<'dimensions' | 'area' | 'direct-volume'>('dimensions');

  // Multi-section dimensions
  const [sections, setSections] = useState<SectionState[]>([makeDefaultSection('sec-1', 'Main Area')]);

  // Known area mode
  const [knownArea, setKnownArea] = useState<number>(200);
  const [knownAreaUnit, setKnownAreaUnit] = useState<'sqFt' | 'sqMeters' | 'sqYards'>('sqFt');
  const [knownAreaDepth, setKnownAreaDepth] = useState<number>(2);
  const [knownAreaDepthUnit, setKnownAreaDepthUnit] = useState<LengthUnit>('inches');

  // Direct volume mode
  const [directVolume, setDirectVolume] = useState<number>(3);
  const [directVolumeUnit, setDirectVolumeUnit] = useState<'cubicYards' | 'cubicFeet' | 'cubicMeters' | 'tons'>('cubicYards');

  // Material & Densities
  const [materialId, setMaterialId] = useState<SandMaterialId>('concrete-sand');
  const [customDensity, setCustomDensity] = useState<number>(2700);

  // Compaction & Waste
  const [compactionPercent, setCompactionPercent] = useState<number>(5);
  const [wastePercent, setWastePercent] = useState<number>(10);

  // Bag Customization
  const [bagWeightLbs, setBagWeightLbs] = useState<number>(50);
  const [bagYieldCuFt, setBagYieldCuFt] = useState<number>(0.50);

  // Budget & Procurement
  const [pricingUnit, setPricingUnit] = useState<'cubic_yard' | 'ton' | 'tonne' | 'bag'>('cubic_yard');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [bagPrice, setBagPrice] = useState<number | ''>('');
  const [deliveryFee, setDeliveryFee] = useState<number | ''>('');
  const [laborCostPerSqFt, setLaborCostPerSqFt] = useState<number | ''>('');
  const [taxRatePercent, setTaxRatePercent] = useState<number | ''>('');

  // Reverse Converter Tab State
  const [convMode, setConvMode] = useState<'volToWeight' | 'weightToVol'>('volToWeight');
  const [convVolumeYds, setConvVolumeYds] = useState<number>(2.5);
  const [convWeightTons, setConvWeightTons] = useState<number>(3.5);

  // UI state
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const calcId = useId();

  // Apply a preset
  const handleApplyPreset = (pid: SandProjectPresetId) => {
    setPresetId(pid);
    const p = SAND_PRESETS[pid];
    if (!p) return;

    setMaterialId(p.recommendedMaterialId);
    setCompactionPercent(p.defaultCompactionPercent);
    setWastePercent(p.defaultWastePercent);

    if (p.recommendedMaterialId === 'polymeric-sand') {
      setBagYieldCuFt(0.45);
    } else {
      setBagYieldCuFt(0.50);
    }

    if (inputMode === 'dimensions') {
      setSections((prev) =>
        prev.map((s) => ({
          ...s,
          depth: p.defaultDepthInches,
          depthUnit: 'inches',
        }))
      );
    } else if (inputMode === 'area') {
      setKnownAreaDepth(p.defaultDepthInches);
      setKnownAreaDepthUnit('inches');
    }
  };

  // Build calculation input
  const calcInput: SandCalculationInput = {
    inputMode,
    sections: sections.map((s) => ({
      id: s.id,
      name: s.name,
      shape: s.shape,
      length: s.length,
      lengthUnit: s.lengthUnit,
      width: s.width,
      widthUnit: s.widthUnit,
      diameter: s.diameter,
      diameterUnit: s.diameterUnit,
      depth: s.depth,
      depthUnit: s.depthUnit,
    })),
    knownArea,
    knownAreaUnit,
    knownAreaDepth,
    knownAreaDepthUnit,
    directVolume,
    directVolumeUnit,
    materialId,
    customDensityLbsPerCuYd: materialId === 'custom' ? customDensity : undefined,
    compactionPercent,
    wastePercent,
    bagWeightLbs,
    bagYieldCuFt,
    pricingUnit,
    unitPrice: typeof unitPrice === 'number' ? unitPrice : undefined,
    bagPrice: typeof bagPrice === 'number' ? bagPrice : undefined,
    deliveryFee: typeof deliveryFee === 'number' ? deliveryFee : undefined,
    laborCostPerSqFt: typeof laborCostPerSqFt === 'number' ? laborCostPerSqFt : undefined,
    taxRatePercent: typeof taxRatePercent === 'number' ? taxRatePercent : undefined,
  };

  const result = calculateSand(calcInput);

  // Reverse converter result
  const activeDensity = materialId === 'custom' ? customDensity : SAND_PROFILES[materialId]?.densityLbsPerCuYd ?? 2700;
  const convResult =
    convMode === 'volToWeight'
      ? convertSandVolumeWeight({ volumeCuYds: convVolumeYds, densityLbsPerCuYd: activeDensity })
      : convertSandVolumeWeight({ weightTons: convWeightTons, densityLbsPerCuYd: activeDensity });

  // Add/remove sections
  const handleAddSection = () => {
    const newId = `sec-${sections.length + 1}`;
    setSections([...sections, makeDefaultSection(newId, `Area ${sections.length + 1}`)]);
  };

  const handleRemoveSection = (id: string) => {
    if (sections.length <= 1) return;
    setSections(sections.filter((s) => s.id !== id));
  };

  const handleUpdateSection = (id: string, updates: Partial<SectionState>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  // Save to localStorage
  const handleSaveProject = () => {
    const bom: Array<{ item: string; quantity: number | string; unit: string; estimatedCost?: number }> = [
      {
        item: `Bulk Sand (${result.activeMaterial.name})`,
        quantity: formatNumber(result.orderVolumeCubicYards, 2),
        unit: 'cubic yards',
        estimatedCost: result.materialCost > 0 ? result.materialCost : undefined,
      },
      {
        item: 'Total Estimated Weight',
        quantity: formatNumber(result.totalTons, 2),
        unit: 'US short tons',
      },
      {
        item: 'Standard 50-lb Bags Equivalent',
        quantity: result.bags50lbNeeded,
        unit: 'bags (50 lb)',
      },
    ];

    if (result.deliveryFee > 0) {
      bom.push({ item: 'Bulk Delivery Fee', quantity: 1, unit: 'trip', estimatedCost: result.deliveryFee });
    }
    if (result.laborCost > 0) {
      bom.push({ item: 'Spreading & Leveling Labor', quantity: formatNumber(result.totalAreaSqFt, 0), unit: 'sq ft', estimatedCost: result.laborCost });
    }

    saveProject({
      id: `sand-${Date.now()}`,
      name: `${result.activeMaterial.name} Take-Off (${formatNumber(result.orderVolumeCubicYards, 1)} cu yd)`,
      projectType: 'sand',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inputs: calcInput,
      summary: {
        totalCubicYards: result.orderVolumeCubicYards,
        totalTons: result.totalTons,
        totalCost: result.grandTotal > 0 ? result.grandTotal : undefined,
        itemCount: result.bags50lbNeeded,
        primaryDescription: `${formatNumber(result.orderVolumeCubicYards, 2)} cu yds (${formatNumber(result.totalTons, 2)} tons) of ${result.activeMaterial.name}`,
      },
      billOfMaterials: bom,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Copy summary to clipboard
  const handleCopySummary = () => {
    const text = [
      `CubicYardKit Sand Take-Off Summary:`,
      `Material: ${result.activeMaterial.name} (${result.densityLbsPerCuYd.toLocaleString()} lbs/cu yd)`,
      `Total Area: ${formatNumber(result.totalAreaSqFt, 1)} sq ft`,
      `Net Volume: ${formatNumber(result.netCubicYards, 2)} cu yd (${formatNumber(result.netCubicFeet, 1)} cu ft)`,
      `Placed Volume (+${result.compactionPercent}% compaction): ${formatNumber(result.compactedPlacedCubicYards, 2)} cu yd`,
      `Order Volume (+${result.wastePercent}% waste): ${formatNumber(result.orderVolumeCubicYards, 2)} cu yd (${formatNumber(result.orderVolumeCubicFeet, 1)} cu ft)`,
      `Weight: ${formatNumber(result.totalTons, 2)} US tons (${Math.round(result.totalPounds).toLocaleString()} lbs / ${formatNumber(result.totalMetricTonnes, 2)} tonnes)`,
      `50-lb Bags: ${result.bags50lbNeeded.toLocaleString()} bags`,
      `Truckloads: ~${result.triAxleDumpTrucks} Tri-Axle dump truck(s)`,
      result.hasCostData ? `Estimated Total: $${formatNumber(result.grandTotal, 2)}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  // Reset to defaults
  const handleReset = () => {
    setPresetId('general');
    setInputMode('dimensions');
    setSections([makeDefaultSection('sec-1', 'Main Area')]);
    setKnownArea(200);
    setDirectVolume(3);
    setMaterialId('concrete-sand');
    setCustomDensity(2700);
    setCompactionPercent(5);
    setWastePercent(10);
    setBagWeightLbs(50);
    setBagYieldCuFt(0.50);
    setUnitPrice('');
    setBagPrice('');
    setDeliveryFee('');
    setLaborCostPerSqFt('');
    setTaxRatePercent('');
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8" id={calcId}>
      {/* Top Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabMode)} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="quick" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 py-2">
              <Ruler className="w-4 h-4 text-emerald-600" />
              <span>Take-Off</span>
            </TabsTrigger>
            <TabsTrigger value="procurement" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 py-2">
              <Package className="w-4 h-4 text-amber-600" />
              <span>Bags vs Bulk</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 py-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span>Quote & Cost</span>
            </TabsTrigger>
            <TabsTrigger value="converter" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 py-2">
              <ArrowRightLeft className="w-4 h-4 text-purple-600" />
              <span>Converter</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs text-slate-600 hover:text-slate-900 border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopySummary}
            className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {copiedSuccess ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : null}
            {copiedSuccess ? 'Copied' : 'Copy Take-Off'}
          </Button>
          <Button
            size="sm"
            onClick={handleSaveProject}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5 mr-1 text-white" /> : <Bookmark className="w-3.5 h-3.5 mr-1" />}
            {savedSuccess ? 'Saved!' : 'Save Project'}
          </Button>
        </div>
      </div>

      {/* Project Presets Pill Bar */}
      <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3.5 sm:p-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Standard Project Presets
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">Sets verified depth, sand profile & compaction</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.values(SAND_PRESETS).map((p) => {
            const isSelected = presetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p.id)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                {p.name}
                <span className={`ml-1.5 text-[11px] opacity-75 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                  ({p.defaultDepthInches}")
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: QUICK TAKE-OFF */}
          {tab === 'quick' && (
            <>
              {/* Input Mode Selector */}
              <Card className="p-4 sm:p-5 border-slate-200 bg-white shadow-xs rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Ruler className="w-4 h-4 text-emerald-600" />
                    Measurement Mode
                  </Label>
                  <span className="text-xs text-slate-500">Choose how to enter dimensions</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setInputMode('dimensions')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                      inputMode === 'dimensions'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Dimensions (L × W)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('area')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                      inputMode === 'area'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Known Surface Area
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('direct-volume')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                      inputMode === 'direct-volume'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Direct Volume / Tons
                  </button>
                </div>

                {/* MODE A: Multi-section Dimensions */}
                {inputMode === 'dimensions' && (
                  <div className="space-y-4 pt-2">
                    {sections.map((sec, idx) => (
                      <div
                        key={sec.id}
                        className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3.5 relative"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={sec.name}
                              onChange={(e) => handleUpdateSection(sec.id, { name: e.target.value })}
                              className="text-xs font-semibold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-hidden px-1 py-0.5 text-slate-800"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Shape toggle */}
                            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateSection(sec.id, { shape: 'rectangle' })}
                                className={`px-2 py-0.5 text-[11px] font-medium rounded-md ${
                                  sec.shape === 'rectangle' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                                }`}
                              >
                                Rectangular
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateSection(sec.id, { shape: 'circle' })}
                                className={`px-2 py-0.5 text-[11px] font-medium rounded-md ${
                                  sec.shape === 'circle' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                                }`}
                              >
                                Circular
                              </button>
                            </div>

                            {sections.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSection(sec.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                                title="Remove section"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Dimensions inputs */}
                        {sec.shape === 'rectangle' ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-[11px] text-slate-600">Length</Label>
                              <div className="flex mt-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={sec.length || ''}
                                  onChange={(e) =>
                                    handleUpdateSection(sec.id, { length: parseFloat(e.target.value) || 0 })
                                  }
                                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-r-0 border-slate-200 rounded-l-lg focus:outline-hidden focus:border-emerald-500"
                                  placeholder="20"
                                />
                                <select
                                  value={sec.lengthUnit}
                                  onChange={(e) =>
                                    handleUpdateSection(sec.id, { lengthUnit: e.target.value as LengthUnit })
                                  }
                                  className="px-2 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-r-lg font-medium text-slate-700"
                                >
                                  {LENGTH_UNITS.map((u) => (
                                    <option key={u.value} value={u.value}>
                                      {u.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div>
                              <Label className="text-[11px] text-slate-600">Width</Label>
                              <div className="flex mt-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={sec.width || ''}
                                  onChange={(e) =>
                                    handleUpdateSection(sec.id, { width: parseFloat(e.target.value) || 0 })
                                  }
                                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-r-0 border-slate-200 rounded-l-lg focus:outline-hidden focus:border-emerald-500"
                                  placeholder="10"
                                />
                                <select
                                  value={sec.widthUnit}
                                  onChange={(e) =>
                                    handleUpdateSection(sec.id, { widthUnit: e.target.value as LengthUnit })
                                  }
                                  className="px-2 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-r-lg font-medium text-slate-700"
                                >
                                  {LENGTH_UNITS.map((u) => (
                                    <option key={u.value} value={u.value}>
                                      {u.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div>
                              <Label className="text-[11px] text-slate-600">Depth / Thickness</Label>
                              <div className="flex mt-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={sec.depth || ''}
                                  onChange={(e) =>
                                    handleUpdateSection(sec.id, { depth: parseFloat(e.target.value) || 0 })
                                  }
                                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-r-0 border-slate-200 rounded-l-lg focus:outline-hidden focus:border-emerald-500"
                                  placeholder="2"
                                />
                                <select
                                  value={sec.depthUnit}
                                  onChange={(e) =>
                                    handleUpdateSection(sec.id, { depthUnit: e.target.value as LengthUnit })
                                  }
                                  className="px-2 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-r-lg font-medium text-slate-700"
                                >
                                  {DEPTH_UNITS.map((u) => (
                                    <option key={u.value} value={u.value}>
                                      {u.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-[11px] text-slate-600">Diameter</Label>
                              <div className="flex mt-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={sec.diameter || ''}
                                  onChange={(e) =>
                                    handleUpdateSection(sec.id, { diameter: parseFloat(e.target.value) || 0 })
                                  }
                                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-r-0 border-slate-200 rounded-l-lg focus:outline-hidden focus:border-emerald-500"
                                  placeholder="12"
                                />
                                <select
                                  value={sec.diameterUnit}
                                  onChange={(e) =>
                                    handleUpdateSection(sec.id, { diameterUnit: e.target.value as LengthUnit })
                                  }
                                  className="px-2 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-r-lg font-medium text-slate-700"
                                >
                                  {LENGTH_UNITS.map((u) => (
                                    <option key={u.value} value={u.value}>
                                      {u.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div>
                              <Label className="text-[11px] text-slate-600">Depth / Thickness</Label>
                              <div className="flex mt-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={sec.depth || ''}
                                  onChange={(e) =>
                                    handleUpdateSection(sec.id, { depth: parseFloat(e.target.value) || 0 })
                                  }
                                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-r-0 border-slate-200 rounded-l-lg focus:outline-hidden focus:border-emerald-500"
                                  placeholder="2"
                                />
                                <select
                                  value={sec.depthUnit}
                                  onChange={(e) =>
                                    handleUpdateSection(sec.id, { depthUnit: e.target.value as LengthUnit })
                                  }
                                  className="px-2 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-r-lg font-medium text-slate-700"
                                >
                                  {DEPTH_UNITS.map((u) => (
                                    <option key={u.value} value={u.value}>
                                      {u.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddSection}
                      className="w-full text-xs text-emerald-700 border-dashed border-emerald-300 hover:bg-emerald-50 py-2.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                      Add Another Section or Layer
                    </Button>
                  </div>
                )}

                {/* MODE B: Known Surface Area */}
                {inputMode === 'area' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <Label className="text-xs text-slate-700 font-semibold">Total Surface Area</Label>
                      <div className="flex mt-1.5">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={knownArea || ''}
                          onChange={(e) => setKnownArea(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm bg-white border border-r-0 border-slate-200 rounded-l-lg focus:outline-hidden focus:border-emerald-500"
                          placeholder="200"
                        />
                        <select
                          value={knownAreaUnit}
                          onChange={(e) => setKnownAreaUnit(e.target.value as any)}
                          className="px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-r-lg font-semibold text-slate-700"
                        >
                          <option value="sqFt">sq ft</option>
                          <option value="sqMeters">sq meters</option>
                          <option value="sqYards">sq yards</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-slate-700 font-semibold">Sand Layer Depth</Label>
                      <div className="flex mt-1.5">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={knownAreaDepth || ''}
                          onChange={(e) => setKnownAreaDepth(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm bg-white border border-r-0 border-slate-200 rounded-l-lg focus:outline-hidden focus:border-emerald-500"
                          placeholder="2"
                        />
                        <select
                          value={knownAreaDepthUnit}
                          onChange={(e) => setKnownAreaDepthUnit(e.target.value as LengthUnit)}
                          className="px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-r-lg font-semibold text-slate-700"
                        >
                          {DEPTH_UNITS.map((u) => (
                            <option key={u.value} value={u.value}>
                              {u.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODE C: Direct Volume / Tons */}
                {inputMode === 'direct-volume' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <Label className="text-xs text-slate-700 font-semibold">Volume or Weight</Label>
                      <div className="flex mt-1.5">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={directVolume || ''}
                          onChange={(e) => setDirectVolume(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm bg-white border border-r-0 border-slate-200 rounded-l-lg focus:outline-hidden focus:border-emerald-500"
                          placeholder="3"
                        />
                        <select
                          value={directVolumeUnit}
                          onChange={(e) => setDirectVolumeUnit(e.target.value as any)}
                          className="px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-r-lg font-semibold text-slate-700"
                        >
                          <option value="cubicYards">Cubic Yards (yd³)</option>
                          <option value="cubicFeet">Cubic Feet (ft³)</option>
                          <option value="cubicMeters">Cubic Meters (m³)</option>
                          <option value="tons">US Tons (2,000 lbs)</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-slate-500 pt-6">
                      Instantly calculates corresponding weight, bag counts, and truckloads using the material density below.
                    </div>
                  </div>
                )}
              </Card>

              {/* Sand Material Profile & Density */}
              <Card className="p-4 sm:p-5 border-slate-200 bg-white shadow-xs rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    Sand Type & Bulk Density
                  </Label>
                  <span className="text-xs text-slate-500">ASTM & ICPI standards</span>
                </div>

                <div className="space-y-3">
                  <select
                    value={materialId}
                    onChange={(e) => setMaterialId(e.target.value as SandMaterialId)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:border-emerald-500 shadow-xs"
                  >
                    {Object.values(SAND_PROFILES).map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.name} — {prof.densityLbsPerCuYd.toLocaleString()} lb/yd³ ({prof.densityTonsPerCuYd.toFixed(2)} tons/yd³)
                      </option>
                    ))}
                  </select>

                  {/* Material Details Banner */}
                  {materialId !== 'custom' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1">
                      <div className="font-semibold text-slate-800 flex items-center justify-between">
                        <span>{result.activeMaterial.categoryDescription}</span>
                        <Badge variant="outline" className="text-[10px] bg-white border-slate-200 text-slate-700">
                          {result.activeMaterial.densitySource}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {result.activeMaterial.notes[0]}
                      </div>
                    </div>
                  )}

                  {/* Custom Density Input */}
                  {materialId === 'custom' && (
                    <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                      <Label className="text-xs font-semibold text-amber-900">Custom Density (lbs per cubic yard)</Label>
                      <input
                        type="number"
                        min="1000"
                        max="5000"
                        step="10"
                        value={customDensity}
                        onChange={(e) => setCustomDensity(parseFloat(e.target.value) || 2700)}
                        className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-lg text-slate-800 focus:outline-hidden focus:border-amber-500"
                        placeholder="2700"
                      />
                      <p className="text-[11px] text-amber-700">
                        Equates to {(customDensity / 27).toFixed(1)} lbs/cu ft or {(customDensity / 2000).toFixed(2)} US tons per cubic yard.
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Compaction & Wastage Factors */}
              <Card className="p-4 sm:p-5 border-slate-200 bg-white shadow-xs rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    Compaction vs. Order Wastage
                  </Label>
                  <span className="text-xs text-slate-500">Separated engineering factors</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Compaction */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">Compaction / Settlement</span>
                      <span className="font-bold text-emerald-700">{compactionPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      step="1"
                      value={compactionPercent}
                      onChange={(e) => setCompactionPercent(parseInt(e.target.value) || 0)}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Volume loss when tamped or plate-compacted (e.g. 8–10% for paver sand).
                    </p>
                  </div>

                  {/* Wastage */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">Order Waste & Overfill</span>
                      <span className="font-bold text-emerald-700">{wastePercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={wastePercent}
                      onChange={(e) => setWastePercent(parseInt(e.target.value) || 0)}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Allowance for subgrade dips, edge slope, and shovel loss (typically 5–10%).
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* TAB 2: BAGS VS BULK PROCUREMENT */}
          {tab === 'procurement' && (
            <Card className="p-5 border-slate-200 bg-white shadow-xs rounded-2xl space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-600" />
                  Bags vs. Bulk Purchasing Comparison
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluate whether buying bagged sand at the home store or ordering bulk dump-truck delivery makes more financial sense for your project scale.
                </p>
              </div>

              {/* Price Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <Label className="text-[11px] font-semibold text-slate-700">50-lb Bag Price ($)</Label>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={bagPrice}
                    onChange={(e) => setBagPrice(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 5.50"
                    className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <Label className="text-[11px] font-semibold text-slate-700">Bulk Price per Yard ($)</Label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={unitPrice}
                    onChange={(e) => {
                      setUnitPrice(e.target.value === '' ? '' : parseFloat(e.target.value) || 0);
                      setPricingUnit('cubic_yard');
                    }}
                    placeholder="e.g. 55.00"
                    className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <Label className="text-[11px] font-semibold text-slate-700">Bulk Delivery Fee ($)</Label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 75.00"
                    className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              {/* Break-even banner */}
              {result.bagVsBulkComparison.canCompare ? (
                <div
                  className={`p-4 rounded-xl border ${
                    result.bagVsBulkComparison.cheaperOption === 'bulk'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : result.bagVsBulkComparison.cheaperOption === 'bags'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-sm">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Cost Recommendation: Order {result.bagVsBulkComparison.cheaperOption.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/80 border border-current">
                      Save ${formatNumber(result.bagVsBulkComparison.difference, 2)} ({formatNumber(result.bagVsBulkComparison.savingsPercent, 0)}%)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-current/20 text-xs">
                    <div>
                      <div className="text-[11px] opacity-80">Total Bagged Cost ({result.bags50lbNeeded} bags):</div>
                      <div className="text-base font-bold">${formatNumber(result.bagVsBulkComparison.bagTotalCost, 2)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] opacity-80">Total Bulk Delivered ({formatNumber(result.orderVolumeCubicYards, 2)} yds):</div>
                      <div className="text-base font-bold">${formatNumber(result.bagVsBulkComparison.bulkTotalCost, 2)}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                  Enter both a bag price and bulk yard price above to see an instant break-even recommendation.
                </div>
              )}

              {/* Packaging Options Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <div className="text-xs font-bold text-slate-800">50-lb Bags</div>
                  <div className="text-xl font-black text-slate-900 mt-1">{result.bags50lbNeeded}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    ~{result.bagYieldCuFt} ft³ yield per bag
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Leftover: {formatNumber(result.leftoverBagCuFt, 2)} ft³ ({formatNumber(result.leftoverBagPercent, 0)}%)
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <div className="text-xs font-bold text-slate-800">60-lb Bags</div>
                  <div className="text-xl font-black text-slate-900 mt-1">{result.bags60lbNeeded}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    ~0.60 ft³ yield per bag
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Commercial packaging
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <div className="text-xs font-bold text-slate-800">1-Ton Bulk SuperSacks</div>
                  <div className="text-xl font-black text-slate-900 mt-1">{result.bulkBags1TonNeeded}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    2,000 lbs tote crane drops
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Ideal for tight access
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 3: PROJECT BUDGET & QUOTE */}
          {tab === 'budget' && (
            <Card className="p-5 border-slate-200 bg-white shadow-xs rounded-2xl space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Project Material & Labor Budget
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Itemize bulk materials, delivery fees, spreading labor, and sales tax.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Material Pricing Basis</Label>
                  <select
                    value={pricingUnit}
                    onChange={(e) => setPricingUnit(e.target.value as any)}
                    className="w-full mt-1.5 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="cubic_yard">Per Cubic Yard ($/yd³)</option>
                    <option value="ton">Per US Ton ($/ton)</option>
                    <option value="tonne">Per Metric Tonne ($/tonne)</option>
                    <option value="bag">Per 50-lb Bag ($/bag)</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Unit Price ($)</Label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 50.00"
                    className="w-full mt-1.5 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Delivery / Trucking Fee ($)</Label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 75.00"
                    className="w-full mt-1.5 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Spreading & Leveling Labor ($/sq ft)</Label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={laborCostPerSqFt}
                    onChange={(e) => setLaborCostPerSqFt(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 1.25"
                    className="w-full mt-1.5 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Sales Tax Rate (%)</Label>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={taxRatePercent}
                    onChange={(e) => setTaxRatePercent(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 7.0"
                    className="w-full mt-1.5 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              {/* Quote Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-50 px-3 py-2 font-bold text-slate-700 border-b border-slate-200">
                  Itemized Cost Breakdown
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="flex justify-between px-3 py-2 text-slate-700">
                    <span>Sand Material Cost ({pricingUnit})</span>
                    <span className="font-semibold">${formatNumber(result.materialCost, 2)}</span>
                  </div>
                  {result.deliveryFee > 0 && (
                    <div className="flex justify-between px-3 py-2 text-slate-700">
                      <span>Delivery Fee</span>
                      <span className="font-semibold">${formatNumber(result.deliveryFee, 2)}</span>
                    </div>
                  )}
                  {result.laborCost > 0 && (
                    <div className="flex justify-between px-3 py-2 text-slate-700">
                      <span>Spreading & Leveling Labor</span>
                      <span className="font-semibold">${formatNumber(result.laborCost, 2)}</span>
                    </div>
                  )}
                  {result.taxAmount > 0 && (
                    <div className="flex justify-between px-3 py-2 text-slate-700">
                      <span>Sales Tax ({taxRatePercent}%)</span>
                      <span className="font-semibold">${formatNumber(result.taxAmount, 2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between px-3 py-2.5 bg-slate-50 font-bold text-slate-900 text-sm">
                    <span>Grand Total</span>
                    <span className="text-emerald-700">${formatNumber(result.grandTotal, 2)}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 4: REVERSE DENSITY & CONVERTER */}
          {tab === 'converter' && (
            <Card className="p-5 border-slate-200 bg-white shadow-xs rounded-2xl space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                  Reverse Volume & Weight Converter
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Instantly convert known yards of sand into tons, or known tons of sand into cubic yards using verified bulk density ({activeDensity.toLocaleString()} lbs/cu yd).
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConvMode('volToWeight')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    convMode === 'volToWeight'
                      ? 'bg-purple-50 border-purple-500 text-purple-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Volume to Weight (Yards → Tons)
                </button>
                <button
                  type="button"
                  onClick={() => setConvMode('weightToVol')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    convMode === 'weightToVol'
                      ? 'bg-purple-50 border-purple-500 text-purple-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Weight to Volume (Tons → Yards)
                </button>
              </div>

              {convMode === 'volToWeight' ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Sand Volume (Cubic Yards)</Label>
                    <input
                      type="number"
                      min="0"
                      step="0.25"
                      value={convVolumeYds}
                      onChange={(e) => setConvVolumeYds(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1.5 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                      <div className="text-[11px] font-medium text-purple-800">US Short Tons</div>
                      <div className="text-lg font-black text-purple-950 mt-0.5">{formatNumber(convResult.weightTons, 2)}</div>
                    </div>
                    <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                      <div className="text-[11px] font-medium text-purple-800">Total Pounds</div>
                      <div className="text-lg font-black text-purple-950 mt-0.5">{Math.round(convResult.weightLbs).toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                      <div className="text-[11px] font-medium text-purple-800">Cubic Feet</div>
                      <div className="text-lg font-black text-purple-950 mt-0.5">{formatNumber(convResult.volumeCuFt, 1)}</div>
                    </div>
                    <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                      <div className="text-[11px] font-medium text-purple-800">Metric Tonnes</div>
                      <div className="text-lg font-black text-purple-950 mt-0.5">{formatNumber(convResult.weightMetricTonnes, 2)}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Sand Weight (US Short Tons)</Label>
                    <input
                      type="number"
                      min="0"
                      step="0.25"
                      value={convWeightTons}
                      onChange={(e) => setConvWeightTons(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1.5 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                      <div className="text-[11px] font-medium text-purple-800">Cubic Yards</div>
                      <div className="text-lg font-black text-purple-950 mt-0.5">{formatNumber(convResult.volumeCuYds, 2)}</div>
                    </div>
                    <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                      <div className="text-[11px] font-medium text-purple-800">Cubic Feet</div>
                      <div className="text-lg font-black text-purple-950 mt-0.5">{formatNumber(convResult.volumeCuFt, 1)}</div>
                    </div>
                    <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                      <div className="text-[11px] font-medium text-purple-800">Cubic Meters</div>
                      <div className="text-lg font-black text-purple-950 mt-0.5">{formatNumber(convResult.volumeCuMeters, 2)}</div>
                    </div>
                    <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                      <div className="text-[11px] font-medium text-purple-800">50-lb Bags</div>
                      <div className="text-lg font-black text-purple-950 mt-0.5">{Math.ceil(convResult.volumeCuFt / 0.50)}</div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right Column: Live Results Bento Dashboard (5 cols) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
          {/* Main Hero Card — Total Volume */}
          <Card className="p-5 sm:p-6 border-emerald-200 bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/30 shadow-md rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-emerald-600" />
                  Order Volume Required
                </span>
                <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                  +{compactionPercent}% comp / +{wastePercent}% waste
                </Badge>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  {formatNumber(result.orderVolumeCubicYards, 2)}
                </span>
                <span className="text-base sm:text-lg font-bold text-emerald-800">cubic yards</span>
              </div>

              <div className="mt-2 text-xs text-slate-600 flex flex-wrap gap-x-3 gap-y-1">
                <span>
                  <strong>{formatNumber(result.orderVolumeCubicFeet, 1)}</strong> ft³
                </span>
                <span>•</span>
                <span>
                  <strong>{formatNumber(result.orderVolumeCubicMeters, 2)}</strong> m³
                </span>
                <span>•</span>
                <span>
                  Net: <strong>{formatNumber(result.netCubicYards, 2)}</strong> yd³
                </span>
              </div>
            </div>
          </Card>

          {/* Secondary Bento Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Card 1: Total Weight */}
            <Card className="p-4 border-slate-200 bg-white shadow-xs rounded-xl">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-amber-600" />
                  Weight
                </span>
                <span className="text-[10px] text-slate-400">US Tons</span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                {formatNumber(result.totalTons, 2)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {Math.round(result.totalPounds).toLocaleString()} lbs ({formatNumber(result.totalMetricTonnes, 2)} t)
              </div>
            </Card>

            {/* Card 2: 50-lb Bags */}
            <Card className="p-4 border-slate-200 bg-white shadow-xs rounded-xl">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-blue-600" />
                  50-lb Bags
                </span>
                <span className="text-[10px] text-slate-400">0.50 ft³</span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                {result.bags50lbNeeded.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                or {result.bags60lbNeeded} 60-lb bags
              </div>
            </Card>

            {/* Card 3: Truckloads */}
            <Card className="p-4 border-slate-200 bg-white shadow-xs rounded-xl">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  Tri-Axle Truck
                </span>
                <span className="text-[10px] text-slate-400">~16 tons</span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                {result.triAxleDumpTrucks}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                or {result.tandemDumpTrucks} tandem truck(s)
              </div>
            </Card>

            {/* Card 4: Total Cost (if entered) */}
            <Card className="p-4 border-slate-200 bg-white shadow-xs rounded-xl">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Estimated Cost
                </span>
                <span className="text-[10px] text-slate-400">{result.hasCostData ? 'Itemized' : 'Optional'}</span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                {result.hasCostData ? `$${formatNumber(result.grandTotal, 0)}` : '—'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {result.costPerSqFt > 0 ? `$${formatNumber(result.costPerSqFt, 2)}/sq ft` : 'Add prices to quote'}
              </div>
            </Card>
          </div>

          {/* Volume Progression Visual Bar */}
          <Card className="p-4 border-slate-200 bg-white shadow-xs rounded-xl space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>Volume Progression Breakdown</span>
              <span className="text-slate-500 text-[11px]">Cubic Yards</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>1. Net Measured Void:</span>
                <span className="font-semibold">{formatNumber(result.netCubicYards, 2)} yd³</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>2. Placed (+{compactionPercent}% compaction):</span>
                <span className="font-semibold">{formatNumber(result.compactedPlacedCubicYards, 2)} yd³</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-bold border-t border-slate-100 pt-1">
                <span>3. Final Order (+{wastePercent}% waste):</span>
                <span>{formatNumber(result.orderVolumeCubicYards, 2)} yd³</span>
              </div>
            </div>
          </Card>

          {/* Transparent Engineering Notes */}
          <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3.5 text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Engineering Notes & Verification
            </div>
            {result.assumptions.map((note, i) => (
              <p key={i} className="text-slate-500 leading-relaxed">
                • {note}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
