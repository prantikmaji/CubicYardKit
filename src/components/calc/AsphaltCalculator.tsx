import React, { useState, useId } from 'react';
import { formatNumber } from '../../lib/calc/units';
import type { LengthUnit } from '../../lib/calc/units';
import type {
  AsphaltMaterialId,
  AsphaltProjectPresetId,
  AsphaltSectionInput,
  AsphaltCalculationInput,
} from '../../lib/calc/asphalt';
import {
  calculateAsphalt,
  convertAsphaltTonnageCoverage,
  ASPHALT_PROFILES,
  ASPHALT_PRESETS,
} from '../../lib/calc/asphalt';
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
  Layers,
  Ruler,
  Scale,
  Sparkles,
  ArrowRightLeft,
  Flame,
} from 'lucide-react';

type TabMode = 'takeoff' | 'truckloads' | 'budget' | 'coverage';

interface SectionState {
  id: string;
  name: string;
  shape: 'rectangle' | 'circle' | 'trapezoid' | 'triangle';
  length: number;
  lengthUnit: LengthUnit;
  width: number;
  width2: number; // for trapezoid flared apron
  widthUnit: LengthUnit;
  diameter: number;
  diameterUnit: LengthUnit;
  compactedThicknessInches: number;
}

const LENGTH_UNITS: { value: LengthUnit; label: string }[] = [
  { value: 'feet', label: 'ft' },
  { value: 'inches', label: 'in' },
  { value: 'yards', label: 'yd' },
  { value: 'meters', label: 'm' },
];

function makeDefaultSection(id: string, name: string = 'Main Driveway'): SectionState {
  return {
    id,
    name,
    shape: 'rectangle',
    length: 40,
    lengthUnit: 'feet',
    width: 12,
    width2: 18,
    widthUnit: 'feet',
    diameter: 20,
    diameterUnit: 'feet',
    compactedThicknessInches: 2.5,
  };
}

export default function AsphaltCalculator() {
  const [tab, setTab] = useState<TabMode>('takeoff');
  const [presetId, setPresetId] = useState<AsphaltProjectPresetId>('residential-driveway');
  const [inputMode, setInputMode] = useState<'dimensions' | 'area' | 'tonnage'>('dimensions');

  // Multi-section dimensions
  const [sections, setSections] = useState<SectionState[]>([makeDefaultSection('sec-1', 'Main Driveway')]);

  // Known area mode
  const [knownArea, setKnownArea] = useState<number>(480);
  const [knownAreaUnit, setKnownAreaUnit] = useState<'sqFt' | 'sqYards' | 'sqMeters'>('sqFt');
  const [knownThicknessInches, setKnownThicknessInches] = useState<number>(2.5);

  // Direct tonnage mode
  const [directTonnage, setDirectTonnage] = useState<number>(10);

  // Material & Densities
  const [materialId, setMaterialId] = useState<AsphaltMaterialId>('hma-dense');
  const [customDensity, setCustomDensity] = useState<number>(145);

  // Waste & Ordering
  const [wastePercent, setWastePercent] = useState<number>(8);
  const [supplierIncrementTons, setSupplierIncrementTons] = useState<number>(0);

  // Truckloads
  const [truckCapacityTons, setTruckCapacityTons] = useState<number>(14);

  // Two-lift option
  const [hasTwoLifts, setHasTwoLifts] = useState<boolean>(false);
  const [binderThicknessInches, setBinderThicknessInches] = useState<number>(2.0);
  const [surfaceThicknessInches, setSurfaceThicknessInches] = useState<number>(1.5);

  // Optional Gravel Base
  const [includeGravelBase, setIncludeGravelBase] = useState<boolean>(false);
  const [gravelBaseDepthInches, setGravelBaseDepthInches] = useState<number>(4.0);

  // Cost inputs
  const [pricePerTon, setPricePerTon] = useState<number | ''>('');
  const [deliveryFeePerTruckload, setDeliveryFeePerTruckload] = useState<number | ''>('');
  const [flatDeliveryFee, setFlatDeliveryFee] = useState<number | ''>('');
  const [baseCostPerSqFt, setBaseCostPerSqFt] = useState<number | ''>('');
  const [pavingLaborCostPerSqFt, setPavingLaborCostPerSqFt] = useState<number | ''>('');
  const [tackCoatCostPerSqFt, setTackCoatCostPerSqFt] = useState<number | ''>('');
  const [excavationRemovalCostPerSqFt, setExcavationRemovalCostPerSqFt] = useState<number | ''>('');
  const [taxRatePercent, setTaxRatePercent] = useState<number | ''>('');

  // Coverage Tab Converter State
  const [convMode, setConvMode] = useState<'tonsToArea' | 'areaToTons'>('tonsToArea');
  const [convTons, setConvTons] = useState<number>(10);
  const [convSqFt, setConvSqFt] = useState<number>(800);
  const [convThickness, setConvThickness] = useState<number>(2.5);

  // UI state
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const calcId = useId();

  // Apply a preset
  const handleApplyPreset = (pid: AsphaltProjectPresetId) => {
    setPresetId(pid);
    const p = ASPHALT_PRESETS[pid];
    if (!p) return;

    setMaterialId(p.recommendedMaterialId);
    setWastePercent(p.defaultWastePercent);

    if (pid === 'heavy-driveway') {
      setHasTwoLifts(true);
      setBinderThicknessInches(2.0);
      setSurfaceThicknessInches(1.5);
    } else if (pid === 'parking-lot') {
      setHasTwoLifts(true);
      setBinderThicknessInches(2.5);
      setSurfaceThicknessInches(1.5);
    } else {
      setHasTwoLifts(false);
    }

    if (p.recommendedBaseInches > 0) {
      setIncludeGravelBase(true);
      setGravelBaseDepthInches(p.recommendedBaseInches);
    } else {
      setIncludeGravelBase(false);
    }

    if (inputMode === 'dimensions') {
      setSections((prev) =>
        prev.map((s) => ({
          ...s,
          compactedThicknessInches: p.compactedThicknessInches,
        }))
      );
    } else if (inputMode === 'area') {
      setKnownThicknessInches(p.compactedThicknessInches);
    }
  };

  // Build calculation input
  const calcInput: AsphaltCalculationInput = {
    inputMode,
    sections: sections.map((s) => ({
      id: s.id,
      name: s.name,
      shape: s.shape,
      length: s.length,
      lengthUnit: s.lengthUnit,
      width: s.width,
      width2: s.width2,
      widthUnit: s.widthUnit,
      diameter: s.diameter,
      diameterUnit: s.diameterUnit,
      compactedThicknessInches: s.compactedThicknessInches,
    })),
    knownArea,
    knownAreaUnit,
    knownThicknessInches,
    directTonnage,
    materialId,
    customDensityLbPerCuFt: materialId === 'custom' ? customDensity : undefined,
    wastePercent,
    supplierIncrementTons,
    truckCapacityTons,
    hasTwoLifts,
    binderThicknessInches,
    surfaceThicknessInches,
    includeGravelBase,
    gravelBaseDepthInches,
    pricePerTon: typeof pricePerTon === 'number' ? pricePerTon : undefined,
    deliveryFeePerTruckload: typeof deliveryFeePerTruckload === 'number' ? deliveryFeePerTruckload : undefined,
    flatDeliveryFee: typeof flatDeliveryFee === 'number' ? flatDeliveryFee : undefined,
    baseCostPerSqFt: typeof baseCostPerSqFt === 'number' ? baseCostPerSqFt : undefined,
    pavingLaborCostPerSqFt: typeof pavingLaborCostPerSqFt === 'number' ? pavingLaborCostPerSqFt : undefined,
    tackCoatCostPerSqFt: typeof tackCoatCostPerSqFt === 'number' ? tackCoatCostPerSqFt : undefined,
    excavationRemovalCostPerSqFt: typeof excavationRemovalCostPerSqFt === 'number' ? excavationRemovalCostPerSqFt : undefined,
    taxRatePercent: typeof taxRatePercent === 'number' ? taxRatePercent : undefined,
  };

  const result = calculateAsphalt(calcInput);

  // Reverse converter
  const activeDensity = materialId === 'custom' ? customDensity : ASPHALT_PROFILES[materialId]?.densityLbPerCuFt ?? 145.0;
  const convResult =
    convMode === 'tonsToArea'
      ? convertAsphaltTonnageCoverage({ tons: convTons, thicknessInches: convThickness, densityLbPerCuFt: activeDensity })
      : convertAsphaltTonnageCoverage({ sqFt: convSqFt, thicknessInches: convThickness, densityLbPerCuFt: activeDensity });

  // Section handling
  const handleAddSection = () => {
    const newId = `sec-${sections.length + 1}`;
    setSections([...sections, makeDefaultSection(newId, `Paving Area ${sections.length + 1}`)]);
  };

  const handleRemoveSection = (id: string) => {
    if (sections.length <= 1) return;
    setSections(sections.filter((s) => s.id !== id));
  };

  const handleUpdateSection = (id: string, updates: Partial<SectionState>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  // Save to My Projects
  const handleSaveProject = () => {
    const bom: Array<{ item: string; quantity: number | string; unit: string; estimatedCost?: number }> = [
      {
        item: `Asphalt (${result.activeMaterial.name})`,
        quantity: formatNumber(result.billedTons, 2),
        unit: 'US short tons',
        estimatedCost: result.asphaltMaterialCost > 0 ? result.asphaltMaterialCost : undefined,
      },
      {
        item: 'Compacted Asphalt Volume',
        quantity: formatNumber(result.compactedVolumeCuYds, 2),
        unit: 'cubic yards',
      },
    ];

    if (result.truckloadsNeeded > 0) {
      bom.push({
        item: `Dump Truck Hauling (${result.truckCapacityTons}-ton payload)`,
        quantity: result.truckloadsNeeded,
        unit: 'loads',
        estimatedCost: result.truckingDeliveryCost > 0 ? result.truckingDeliveryCost : undefined,
      });
    }

    if (result.gravelBaseTons > 0) {
      bom.push({
        item: `Crushed Stone Aggregate Base (${gravelBaseDepthInches}" depth)`,
        quantity: formatNumber(result.gravelBaseTons, 2),
        unit: 'tons',
        estimatedCost: result.baseMaterialCost > 0 ? result.baseMaterialCost : undefined,
      });
    }

    if (result.pavingLaborCost > 0) {
      bom.push({
        item: 'Paving Machine Laydown & Roller Compaction',
        quantity: formatNumber(result.totalAreaSqFt, 0),
        unit: 'sq ft',
        estimatedCost: result.pavingLaborCost,
      });
    }

    saveProject({
      id: `asphalt-${Date.now()}`,
      name: `${result.activeMaterial.name} Takeoff (${formatNumber(result.billedTons, 1)} tons)`,
      projectType: 'asphalt',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inputs: calcInput,
      summary: {
        totalTons: result.billedTons,
        totalCubicYards: result.compactedVolumeCuYds,
        totalCost: result.grandTotal > 0 ? result.grandTotal : undefined,
        itemCount: result.truckloadsNeeded,
        primaryDescription: `${formatNumber(result.billedTons, 2)} tons (${formatNumber(result.totalAreaSqFt, 0)} sq ft at ${formatNumber(result.averageCompactedThicknessInches, 1)}" depth) of ${result.activeMaterial.name}`,
      },
      billOfMaterials: bom,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Copy summary
  const handleCopySummary = () => {
    const text = [
      `CubicYardKit Asphalt Take-Off Summary:`,
      `Material: ${result.activeMaterial.name} (${result.densityLbPerCuFt} lb/ft³ / ${formatNumber(result.densityTonsPerCuYd, 2)} tons/yd³)`,
      `Total Area: ${formatNumber(result.totalAreaSqFt, 1)} sq ft (${formatNumber(result.totalAreaSqYards, 1)} sq yds)`,
      `Compacted Thickness: ${formatNumber(result.averageCompactedThicknessInches, 2)} in (approx ${formatNumber(result.estimatedLooseThicknessInches, 2)} in loose laydown)`,
      `Net Tonnage: ${formatNumber(result.netTons, 2)} tons`,
      `Order Tonnage (+${result.wastePercent}% waste): ${formatNumber(result.billedTons, 2)} tons (${Math.round(result.totalPounds).toLocaleString()} lbs / ${formatNumber(result.totalMetricTonnes, 2)} tonnes)`,
      `Compacted Volume: ${formatNumber(result.compactedVolumeCuYds, 2)} cu yds (${formatNumber(result.compactedVolumeCuFt, 1)} cu ft)`,
      `Coverage: ${formatNumber(result.coverageSqFtPerTon, 1)} sq ft per ton (${formatNumber(result.coverageSqYardsPerTon, 1)} sq yds/ton)`,
      `Truckloads: ${result.truckloadsNeeded} load(s) at ${result.truckCapacityTons} tons/load`,
      result.hasCostData ? `Estimated Total Budget: $${formatNumber(result.grandTotal, 2)} ($${formatNumber(result.costPerSqFt, 2)}/sq ft)` : '',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  // Reset
  const handleReset = () => {
    setPresetId('residential-driveway');
    setInputMode('dimensions');
    setSections([makeDefaultSection('sec-1', 'Main Driveway')]);
    setKnownArea(480);
    setKnownThicknessInches(2.5);
    setDirectTonnage(10);
    setMaterialId('hma-dense');
    setCustomDensity(145);
    setWastePercent(8);
    setSupplierIncrementTons(0);
    setTruckCapacityTons(14);
    setHasTwoLifts(false);
    setIncludeGravelBase(false);
    setPricePerTon('');
    setDeliveryFeePerTruckload('');
    setFlatDeliveryFee('');
    setBaseCostPerSqFt('');
    setPavingLaborCostPerSqFt('');
    setTackCoatCostPerSqFt('');
    setExcavationRemovalCostPerSqFt('');
    setTaxRatePercent('');
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8" id={calcId}>
      {/* Top Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabMode)} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="takeoff" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 py-2">
              <Ruler className="w-4 h-4 text-emerald-600" />
              <span>Tonnage Take-Off</span>
            </TabsTrigger>
            <TabsTrigger value="truckloads" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 py-2">
              <Truck className="w-4 h-4 text-amber-600" />
              <span>Truckload Hauling</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 py-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span>Project Quote</span>
            </TabsTrigger>
            <TabsTrigger value="coverage" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 py-2">
              <ArrowRightLeft className="w-4 h-4 text-purple-600" />
              <span>Coverage & Converter</span>
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
            Standard Asphalt Paving Presets
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">Pre-configures thickness, base aggregate & density</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.values(ASPHALT_PRESETS).map((p) => {
            const isSelected = presetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p.id)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                {p.name}
                <span className={`ml-1.5 text-[11px] opacity-75 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  ({p.compactedThicknessInches}")
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
          {/* TAB 1: TONNAGE TAKE-OFF */}
          {tab === 'takeoff' && (
            <>
              {/* Measurement Mode Card */}
              <Card className="p-4 sm:p-5 border-slate-200 bg-white shadow-xs rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Ruler className="w-4 h-4 text-emerald-600" />
                    Measurement Mode
                  </Label>
                  <span className="text-xs text-slate-500">Dimensions or known area</span>
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
                    onClick={() => setInputMode('tonnage')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                      inputMode === 'tonnage'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Direct Tonnage
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
                            <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
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
                            {/* Shape Selector */}
                            <select
                              value={sec.shape}
                              onChange={(e) => handleUpdateSection(sec.id, { shape: e.target.value as any })}
                              className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium"
                            >
                              <option value="rectangle">Rectangle</option>
                              <option value="trapezoid">Trapezoid (Flared Apron)</option>
                              <option value="circle">Circle / Turnaround</option>
                              <option value="triangle">Triangle</option>
                            </select>

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

                        {/* Shape Dimensions Inputs */}
                        {sec.shape === 'rectangle' && (
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
                                  placeholder="40"
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
                                  placeholder="12"
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
                              <Label className="text-[11px] text-slate-600">Compacted Thickness</Label>
                              <div className="flex mt-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.25"
                                  value={sec.compactedThicknessInches || ''}
                                  onChange={(e) =>
                                    handleUpdateSection(sec.id, {
                                      compactedThicknessInches: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-r-0 border-slate-200 rounded-l-lg focus:outline-hidden focus:border-emerald-500"
                                  placeholder="2.5"
                                />
                                <span className="px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-r-lg font-medium text-slate-700 flex items-center">
                                  in
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {sec.shape === 'trapezoid' && (
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div>
                              <Label className="text-[11px] text-slate-600">Length (Throat)</Label>
                              <div className="flex mt-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={sec.length || ''}
                                  onChange={(e) =>
                                    handleUpdateSection(sec.id, { length: parseFloat(e.target.value) || 0 })
                                  }
                                  className="w-full px-2 py-1.5 text-xs bg-white border border-r-0 border-slate-200 rounded-l-lg"
                                  placeholder="10"
                                />
                                <span className="px-2 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-r-lg text-slate-700">
                                  ft
                                </span>
                              </div>
                            </div>
                            <div>
                              <Label className="text-[11px] text-slate-600">Driveway Width</Label>
                              <div className="flex mt-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={sec.width || ''}
                                  onChange={(e) =>
                                    handleUpdateSection(sec.id, { width: parseFloat(e.target.value) || 0 })
                                  }
                                  className="w-full px-2 py-1.5 text-xs bg-white border border-r-0 border-slate-200 rounded-l-lg"
                                  placeholder="12"
                                />
                                <span className="px-2 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-r-lg text-slate-700">
                                  ft
                                </span>
                              </div>
                            </div>
                            <div>
                              <Label className="text-[11px] text-slate-600">Road Flare Width</Label>
                              <div className="flex mt-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={sec.width2 || ''}
                                  onChange={(e) =>
                                    handleUpdateSection(sec.id, { width2: parseFloat(e.target.value) || 0 })
                                  }
                                  className="w-full px-2 py-1.5 text-xs bg-white border border-r-0 border-slate-200 rounded-l-lg"
                                  placeholder="18"
                                />
                                <span className="px-2 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-r-lg text-slate-700">
                                  ft
                                </span>
                              </div>
                            </div>
                            <div>
                              <Label className="text-[11px] text-slate-600">Thickness</Label>
                              <div className="flex mt-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.25"
                                  value={sec.compactedThicknessInches || ''}
                                  onChange={(e) =>
                                    handleUpdateSection(sec.id, {
                                      compactedThicknessInches: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="w-full px-2 py-1.5 text-xs bg-white border border-r-0 border-slate-200 rounded-l-lg"
                                  placeholder="2.5"
                                />
                                <span className="px-2 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-r-lg text-slate-700">
                                  in
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {sec.shape === 'circle' && (
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
                                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-r-0 border-slate-200 rounded-l-lg"
                                  placeholder="20"
                                />
                                <span className="px-2 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-r-lg text-slate-700">
                                  ft
                                </span>
                              </div>
                            </div>
                            <div>
                              <Label className="text-[11px] text-slate-600">Thickness</Label>
                              <div className="flex mt-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.25"
                                  value={sec.compactedThicknessInches || ''}
                                  onChange={(e) =>
                                    handleUpdateSection(sec.id, {
                                      compactedThicknessInches: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-r-0 border-slate-200 rounded-l-lg"
                                  placeholder="2.5"
                                />
                                <span className="px-2 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-r-lg text-slate-700">
                                  in
                                </span>
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
                      Add Another Paving Area (Apron, Turnaround, Flare)
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
                          placeholder="480"
                        />
                        <select
                          value={knownAreaUnit}
                          onChange={(e) => setKnownAreaUnit(e.target.value as any)}
                          className="px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-r-lg font-semibold text-slate-700"
                        >
                          <option value="sqFt">sq ft</option>
                          <option value="sqYards">sq yards</option>
                          <option value="sqMeters">sq meters</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-slate-700 font-semibold">Compacted Thickness (inches)</Label>
                      <div className="flex mt-1.5">
                        <input
                          type="number"
                          min="0"
                          step="0.25"
                          value={knownThicknessInches || ''}
                          onChange={(e) => setKnownThicknessInches(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm bg-white border border-r-0 border-slate-200 rounded-l-lg focus:outline-hidden focus:border-emerald-500"
                          placeholder="2.5"
                        />
                        <span className="px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-r-lg font-semibold text-slate-700 flex items-center">
                          inches
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODE C: Direct Tonnage */}
                {inputMode === 'tonnage' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <Label className="text-xs text-slate-700 font-semibold">Specified Asphalt Tonnage</Label>
                      <div className="flex mt-1.5">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={directTonnage || ''}
                          onChange={(e) => setDirectTonnage(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm bg-white border border-r-0 border-slate-200 rounded-l-lg focus:outline-hidden focus:border-emerald-500"
                          placeholder="10"
                        />
                        <span className="px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-r-lg font-semibold text-slate-700 flex items-center">
                          US Tons
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-slate-500 pt-6">
                      Instantly calculates corresponding square foot coverage at various depths, truckload dispatch, and project costs.
                    </div>
                  </div>
                )}
              </Card>

              {/* Material Mix & Density Card */}
              <Card className="p-4 sm:p-5 border-slate-200 bg-white shadow-xs rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-600" />
                    Asphalt Mix Type & Density
                  </Label>
                  <span className="text-xs text-slate-500">FHWA & Asphalt Institute</span>
                </div>

                <div className="space-y-3">
                  <select
                    value={materialId}
                    onChange={(e) => setMaterialId(e.target.value as AsphaltMaterialId)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:border-emerald-500 shadow-xs"
                  >
                    {Object.values(ASPHALT_PROFILES).map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.name} — {prof.densityLbPerCuFt} lb/ft³ ({prof.densityTonsPerCuYd.toFixed(2)} tons/yd³)
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
                      <Label className="text-xs font-semibold text-amber-900">Custom Density (lbs per cubic foot)</Label>
                      <input
                        type="number"
                        min="90"
                        max="165"
                        step="0.5"
                        value={customDensity}
                        onChange={(e) => setCustomDensity(parseFloat(e.target.value) || 145)}
                        className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-lg text-slate-800"
                        placeholder="145"
                      />
                      <p className="text-[11px] text-amber-700">
                        Equates to {(customDensity * 27).toLocaleString()} lbs/cu yd or {((customDensity * 27) / 2000).toFixed(2)} tons per cubic yard.
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Compaction Screed Helper Callout */}
              <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 text-xs text-emerald-950 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <Lightbulb className="w-4 h-4 text-emerald-600" />
                  Roller Compaction Factor (Loose Screed vs. Compacted)
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Hot mix asphalt compacts by approx. <strong>20% to 25%</strong> under heavy steel-drum roller passes. To achieve your desired <strong>{formatNumber(result.averageCompactedThicknessInches, 2)}″ finished compacted thickness</strong>, your paving crew will lay approx. <strong>{formatNumber(result.estimatedLooseThicknessInches, 2)}″ of loose mix</strong> at the paver screed.
                </p>
              </div>

              {/* Waste Allowance & Order Increments */}
              <Card className="p-4 sm:p-5 border-slate-200 bg-white shadow-xs rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    Order Allowance & Supplier Rounding
                  </Label>
                  <span className="text-xs text-slate-500">Scale ticket precision</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">Jobsite Order Allowance</span>
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
                      For subgrade dips, edge roll-down, and compaction tolerance (standard: 8–10%).
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">Supplier Order Increment</span>
                      <span className="font-bold text-slate-700">
                        {supplierIncrementTons > 0 ? `${supplierIncrementTons} Ton` : 'Exact Scale'}
                      </span>
                    </div>
                    <select
                      value={supplierIncrementTons}
                      onChange={(e) => setSupplierIncrementTons(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                    >
                      <option value="0">Exact (Scale House Ticket)</option>
                      <option value="0.25">Round to 1/4 Ton (0.25 t)</option>
                      <option value="0.5">Round to 1/2 Ton (0.50 t)</option>
                      <option value="1.0">Round to Full Ton (1.00 t)</option>
                    </select>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Rounds order tonnage up to match your local asphalt plant minimum increment.
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* TAB 2: TRUCKLOAD LOGISTICS */}
          {tab === 'truckloads' && (
            <Card className="p-5 border-slate-200 bg-white shadow-xs rounded-2xl space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-600" />
                  Hauling & Dump Truck Dispatch Planning
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Hot mix asphalt must be hauled hot in insulated, tarped dump trucks directly from the plant batch tower to your site paver before it cools below 275°F.
                </p>
              </div>

              {/* Truck Type Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">Dump Truck Type & Usable Payload</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Single-Axle', tons: 7, desc: 'Tight driveways' },
                    { label: 'Tandem (10-Whl)', tons: 14, desc: 'Most common' },
                    { label: 'Tri-Axle', tons: 18, desc: 'Commercial' },
                    { label: 'End-Dump Semi', tons: 24, desc: 'Highways / Lots' },
                  ].map((tr) => (
                    <button
                      key={tr.label}
                      type="button"
                      onClick={() => setTruckCapacityTons(tr.tons)}
                      className={`p-2.5 text-left rounded-xl border transition-all ${
                        truckCapacityTons === tr.tons
                          ? 'bg-amber-50 border-amber-500 text-amber-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-bold">{tr.label}</div>
                      <div className="text-base font-black text-slate-900 mt-0.5">{tr.tons} Tons</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{tr.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Truckload Results Bento Card */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                    Dispatch Summary ({truckCapacityTons}-Ton Trucks)
                  </span>
                  <Badge className="bg-amber-500 text-slate-950 font-bold text-xs">
                    {result.truckloadsNeeded} Total Load{result.truckloadsNeeded === 1 ? '' : 's'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 text-center border-t border-slate-800">
                  <div>
                    <div className="text-[11px] text-slate-400">Total Billed Tonnage</div>
                    <div className="text-lg font-black text-white mt-0.5">
                      {formatNumber(result.billedTons, 2)} t
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Last Load Weight</div>
                    <div className="text-lg font-black text-amber-300 mt-0.5">
                      {formatNumber(result.lastTruckloadTons, 2)} t
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Unused Capacity</div>
                    <div className="text-lg font-black text-slate-300 mt-0.5">
                      {formatNumber(result.unusedTruckCapacityTons, 2)} t
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="font-semibold text-slate-700">Contractor Hauling Insight:</p>
                <p>
                  • Ensure your jobsite turnaround has adequate vertical clearance (at least 14 feet clear of tree limbs and power lines) to raise a 20-foot dump bed.
                </p>
                <p>
                  • In rural areas, weight-restricted bridges and spring thaw posted road bans may legally limit tandem trucks to 10 tons.
                </p>
              </div>
            </Card>
          )}

          {/* TAB 3: PROJECT BUDGET */}
          {tab === 'budget' && (
            <Card className="p-5 border-slate-200 bg-white shadow-xs rounded-2xl space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Itemized Asphalt Project Quote & Budget
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Combine hot mix material costs with trucking, base aggregate, paving labor, and demolition.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Asphalt Price per Ton ($/ton)</Label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={pricePerTon}
                    onChange={(e) => setPricePerTon(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 110.00"
                    className="w-full mt-1.5 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Plant pickup typically $80–$130/ton</span>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Delivery Fee per Truckload ($)</Label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={deliveryFeePerTruckload}
                    onChange={(e) =>
                      setDeliveryFeePerTruckload(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)
                    }
                    placeholder="e.g. 95.00"
                    className="w-full mt-1.5 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Paving Labor & Equipment ($/sq ft)</Label>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={pavingLaborCostPerSqFt}
                    onChange={(e) =>
                      setPavingLaborCostPerSqFt(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)
                    }
                    placeholder="e.g. 2.50"
                    className="w-full mt-1.5 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Screed laydown & roller passes</span>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Crushed Stone Base ($/sq ft)</Label>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={baseCostPerSqFt}
                    onChange={(e) => setBaseCostPerSqFt(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 1.75"
                    className="w-full mt-1.5 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Tack Coat / Prime ($/sq ft)</Label>
                  <input
                    type="number"
                    min="0"
                    step="0.05"
                    value={tackCoatCostPerSqFt}
                    onChange={(e) =>
                      setTackCoatCostPerSqFt(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)
                    }
                    placeholder="e.g. 0.35"
                    className="w-full mt-1.5 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Existing Removal / Prep ($/sq ft)</Label>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={excavationRemovalCostPerSqFt}
                    onChange={(e) =>
                      setExcavationRemovalCostPerSqFt(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)
                    }
                    placeholder="e.g. 1.50"
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
                    <span>Asphalt Material ({formatNumber(result.billedTons, 2)} tons)</span>
                    <span className="font-semibold">${formatNumber(result.asphaltMaterialCost, 2)}</span>
                  </div>
                  {result.truckingDeliveryCost > 0 && (
                    <div className="flex justify-between px-3 py-2 text-slate-700">
                      <span>Hauling ({result.truckloadsNeeded} truckloads)</span>
                      <span className="font-semibold">${formatNumber(result.truckingDeliveryCost, 2)}</span>
                    </div>
                  )}
                  {result.pavingLaborCost > 0 && (
                    <div className="flex justify-between px-3 py-2 text-slate-700">
                      <span>Paving Labor & Equipment</span>
                      <span className="font-semibold">${formatNumber(result.pavingLaborCost, 2)}</span>
                    </div>
                  )}
                  {result.baseMaterialCost > 0 && (
                    <div className="flex justify-between px-3 py-2 text-slate-700">
                      <span>Crushed Stone Base Course</span>
                      <span className="font-semibold">${formatNumber(result.baseMaterialCost, 2)}</span>
                    </div>
                  )}
                  {result.tackCoatCost > 0 && (
                    <div className="flex justify-between px-3 py-2 text-slate-700">
                      <span>Tack Coat Emulsion</span>
                      <span className="font-semibold">${formatNumber(result.tackCoatCost, 2)}</span>
                    </div>
                  )}
                  {result.excavationRemovalCost > 0 && (
                    <div className="flex justify-between px-3 py-2 text-slate-700">
                      <span>Demolition / Removal</span>
                      <span className="font-semibold">${formatNumber(result.excavationRemovalCost, 2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between px-3 py-2.5 bg-slate-50 font-bold text-slate-900 text-sm">
                    <span>Total Project Budget</span>
                    <span className="text-emerald-700">${formatNumber(result.grandTotal, 2)}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 4: COVERAGE & CONVERTER */}
          {tab === 'coverage' && (
            <Card className="p-5 border-slate-200 bg-white shadow-xs rounded-2xl space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                  Asphalt Coverage & Reverse Conversion
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Convert tons into square foot coverage, or calculate how many tons of asphalt are needed to cover a specific area.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConvMode('tonsToArea')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    convMode === 'tonsToArea'
                      ? 'bg-purple-50 border-purple-500 text-purple-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Tons → Square Foot Coverage
                </button>
                <button
                  type="button"
                  onClick={() => setConvMode('areaToTons')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    convMode === 'areaToTons'
                      ? 'bg-purple-50 border-purple-500 text-purple-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Area (Sq Ft) → Tons Needed
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {convMode === 'tonsToArea' ? (
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Asphalt Quantity (Tons)</Label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={convTons}
                      onChange={(e) => setConvTons(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1.5 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                ) : (
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Surface Area (Sq Ft)</Label>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={convSqFt}
                      onChange={(e) => setConvSqFt(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1.5 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                )}

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Compacted Thickness (Inches)</Label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.25"
                    value={convThickness}
                    onChange={(e) => setConvThickness(parseFloat(e.target.value) || 2.5)}
                    className="w-full mt-1.5 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              {/* Converted Results Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                  <div className="text-[11px] font-medium text-purple-800">
                    {convMode === 'tonsToArea' ? 'Square Feet' : 'US Short Tons'}
                  </div>
                  <div className="text-lg font-black text-purple-950 mt-0.5">
                    {convMode === 'tonsToArea' ? formatNumber(convResult.sqFt, 1) : formatNumber(convResult.tons, 2)}
                  </div>
                </div>

                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                  <div className="text-[11px] font-medium text-purple-800">Square Yards</div>
                  <div className="text-lg font-black text-purple-950 mt-0.5">
                    {formatNumber(convResult.sqYards, 1)}
                  </div>
                </div>

                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                  <div className="text-[11px] font-medium text-purple-800">Cubic Yards</div>
                  <div className="text-lg font-black text-purple-950 mt-0.5">
                    {formatNumber(convResult.cuYds, 2)}
                  </div>
                </div>

                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                  <div className="text-[11px] font-medium text-purple-800">Metric Tonnes</div>
                  <div className="text-lg font-black text-purple-950 mt-0.5">
                    {formatNumber(convResult.metricTonnes, 2)}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Live Results Bento Dashboard (5 cols) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
          {/* Main Hero Card — Total Tonnage */}
          <Card className="p-5 sm:p-6 border-slate-800 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 shadow-md rounded-2xl relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Order Asphalt Tonnage
                </span>
                <Badge className="bg-amber-500 text-slate-950 font-bold text-[10px]">
                  +{wastePercent}% order contingency
                </Badge>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {formatNumber(result.billedTons, 2)}
                </span>
                <span className="text-base sm:text-lg font-bold text-amber-400">US tons</span>
              </div>

              <div className="mt-2 text-xs text-slate-300 flex flex-wrap gap-x-3 gap-y-1">
                <span>
                  <strong>{Math.round(result.totalPounds).toLocaleString()}</strong> lbs
                </span>
                <span>•</span>
                <span>
                  <strong>{formatNumber(result.totalMetricTonnes, 2)}</strong> tonnes
                </span>
                <span>•</span>
                <span>
                  Net: <strong>{formatNumber(result.netTons, 2)}</strong> tons
                </span>
              </div>
            </div>
          </Card>

          {/* Secondary Bento Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Card 1: Compacted Volume */}
            <Card className="p-4 border-slate-200 bg-white shadow-xs rounded-xl">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  Volume
                </span>
                <span className="text-[10px] text-slate-400">Compacted</span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                {formatNumber(result.compactedVolumeCuYds, 2)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                cu yds ({formatNumber(result.compactedVolumeCuFt, 1)} ft³)
              </div>
            </Card>

            {/* Card 2: Dump Truckloads */}
            <Card className="p-4 border-slate-200 bg-white shadow-xs rounded-xl">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-amber-600" />
                  Hauling
                </span>
                <span className="text-[10px] text-slate-400">{result.truckCapacityTons}t Truck</span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                {result.truckloadsNeeded}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Last load: {formatNumber(result.lastTruckloadTons, 1)} tons
              </div>
            </Card>

            {/* Card 3: Coverage Rate */}
            <Card className="p-4 border-slate-200 bg-white shadow-xs rounded-xl">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5 text-blue-600" />
                  Coverage
                </span>
                <span className="text-[10px] text-slate-400">@ {result.averageCompactedThicknessInches.toFixed(1)}"</span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                {formatNumber(result.coverageSqFtPerTon, 1)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                sq ft / ton ({formatNumber(result.coverageSqYardsPerTon, 1)} sq yd/t)
              </div>
            </Card>

            {/* Card 4: Estimated Budget */}
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
                {result.costPerSqFt > 0 ? `$${formatNumber(result.costPerSqFt, 2)}/sq ft` : 'Add rates in Quote tab'}
              </div>
            </Card>
          </div>

          {/* Density Sensitivity Range Callout */}
          <Card className="p-4 border-slate-200 bg-white shadow-xs rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>Tonnage Sensitivity Range</span>
              <span className="text-slate-500 text-[11px]">ASTM/FHWA Mix Bounds</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <span>Min ({result.activeMaterial.densityRangeLbPerCuFt[0]} lb/ft³):</span>
              <span className="font-bold">{formatNumber(result.densityRangeMinTons, 2)} tons</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Max ({result.activeMaterial.densityRangeLbPerCuFt[1]} lb/ft³):</span>
              <span className="font-bold">{formatNumber(result.densityRangeMaxTons, 2)} tons</span>
            </div>
            <p className="text-[10px] text-slate-400 pt-0.5">
              Reflects aggregate mineral differences (limestone vs granite vs basalt) across local quarry suppliers.
            </p>
          </Card>

          {/* Transparent Engineering Notes */}
          <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3.5 text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Paving Engineering Verification
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
