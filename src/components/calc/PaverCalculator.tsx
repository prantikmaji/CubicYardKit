import React, { useState, useId } from 'react';
import { formatNumber } from '../../lib/calc/units';
import type { LengthUnit } from '../../lib/calc/units';
import type {
  PaverProjectType,
  PaverPresetId,
  LayingPatternId,
  PaverSectionInput,
  PaverOpeningInput,
  PaverCalculationInput,
} from '../../lib/calc/paver';
import {
  calculatePavers,
  PAVER_PRESETS,
  LAYING_PATTERNS,
} from '../../lib/calc/paver';
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
  Sparkles,
  ShieldCheck,
  ClipboardList,
  Printer,
  Copy,
} from 'lucide-react';

type TabMode = 'takeoff' | 'layers' | 'procurement' | 'budget';

interface SectionState {
  id: string;
  name: string;
  shape: 'rectangle' | 'circle' | 'triangle';
  length: number;
  lengthUnit: LengthUnit;
  width: number;
  widthUnit: LengthUnit;
  diameter: number;
  diameterUnit: LengthUnit;
  sharedEdgeFeet: number;
}

interface OpeningState {
  id: string;
  name: string;
  length: number;
  width: number;
  count: number;
}

const LENGTH_UNITS: { value: LengthUnit; label: string }[] = [
  { value: 'feet', label: 'ft' },
  { value: 'inches', label: 'in' },
  { value: 'yards', label: 'yd' },
  { value: 'meters', label: 'm' },
];

export default function PaverCalculator() {
  const compId = useId();

  // Tab State
  const [activeTab, setActiveTab] = useState<TabMode>('takeoff');

  // Project Type
  const [projectType, setProjectType] = useState<PaverProjectType>('patio');

  // Input Mode: Dimensions or Known Area
  const [inputMode, setInputMode] = useState<'dimensions' | 'area'>('dimensions');

  // Simple Dimensions (Quick Path)
  const [simpleLength, setSimpleLength] = useState<number>(16);
  const [simpleLengthUnit, setSimpleLengthUnit] = useState<LengthUnit>('feet');
  const [simpleWidth, setSimpleWidth] = useState<number>(12);
  const [simpleWidthUnit, setSimpleWidthUnit] = useState<LengthUnit>('feet');

  // Known Area
  const [knownArea, setKnownArea] = useState<number>(192);
  const [knownAreaUnit, setKnownAreaUnit] = useState<'sqFt' | 'sqMeters' | 'sqYards'>('sqFt');

  // Multi-Section Advanced Mode
  const [useMultiSections, setUseMultiSections] = useState<boolean>(false);
  const [sections, setSections] = useState<SectionState[]>([
    {
      id: 'sec-1',
      name: 'Main Patio Area',
      shape: 'rectangle',
      length: 16,
      lengthUnit: 'feet',
      width: 12,
      widthUnit: 'feet',
      diameter: 10,
      diameterUnit: 'feet',
      sharedEdgeFeet: 16, // abutting house
    },
  ]);

  // Openings / Cutouts (e.g. fire pit, tree well)
  const [openings, setOpenings] = useState<OpeningState[]>([]);

  // Restraint Configuration
  const [unrestrainedSides, setUnrestrainedSides] = useState<4 | 3 | 2 | 1>(3);

  // Paver Specifications
  const [presetId, setPresetId] = useState<PaverPresetId>('4x8-holland');
  const [customLength, setCustomLength] = useState<number>(8.0);
  const [customWidth, setCustomWidth] = useState<number>(4.0);
  const [customThickness, setCustomThickness] = useState<number>(2.375);
  const [jointWidthInches, setJointWidthInches] = useState<number>(0.125); // 1/8"
  const [patternId, setPatternId] = useState<LayingPatternId>('running-bond');
  const [wastePercent, setWastePercent] = useState<number>(10);

  // Packaging specs
  const [piecesPerPack, setPiecesPerPack] = useState<number>(108);
  const [piecesPerPallet, setPiecesPerPallet] = useState<number>(432);

  // Sub-base Aggregate Layer
  const [includeBase, setIncludeBase] = useState<boolean>(true);
  const [baseDepthInches, setBaseDepthInches] = useState<number>(4);
  const [baseCompactionPercent, setBaseCompactionPercent] = useState<number>(15);
  const [includeBaseShoulder, setIncludeBaseShoulder] = useState<boolean>(true);

  // Bedding Sand Layer
  const [includeBedding, setIncludeBedding] = useState<boolean>(true);
  const [beddingDepthInches, setBeddingDepthInches] = useState<number>(1.0);
  const [beddingWastePercent, setBeddingWastePercent] = useState<number>(5);

  // Jointing Sand Layer
  const [includeJointSand, setIncludeJointSand] = useState<boolean>(true);
  const [jointSandCoverageSqFt, setJointSandCoverageSqFt] = useState<number>(75);

  // Edge Restraints
  const [includeEdgeRestraints, setIncludeEdgeRestraints] = useState<boolean>(true);
  const [edgeSectionLengthFt, setEdgeSectionLengthFt] = useState<number>(7.5);
  const [spikeSpacingInches, setSpikeSpacingInches] = useState<number>(18);

  // Geotextile Fabric
  const [includeGeotextile, setIncludeGeotextile] = useState<boolean>(true);

  // Pricing Inputs
  const [pricePerPaverPiece, setPricePerPaverPiece] = useState<number | null>(null);
  const [pricePerPaverSqFt, setPricePerPaverSqFt] = useState<number | null>(null);
  const [pricePerPaverPallet, setPricePerPaverPallet] = useState<number | null>(null);
  const [pricePerBaseTon, setPricePerBaseTon] = useState<number | null>(null);
  const [pricePerSandTon, setPricePerSandTon] = useState<number | null>(null);
  const [pricePerJointSandBag, setPricePerJointSandBag] = useState<number | null>(null);
  const [pricePerEdgingPiece, setPricePerEdgingPiece] = useState<number | null>(null);
  const [pricePerGeotextileSqFt, setPricePerGeotextileSqFt] = useState<number | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [laborCostPerSqFt, setLaborCostPerSqFt] = useState<number | null>(null);
  const [equipmentRentalFee, setEquipmentRentalFee] = useState<number | null>(null);
  const [salesTaxPercent, setSalesTaxPercent] = useState<number | null>(null);

  // UI feedback states
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Handle Preset Switching
  const handlePresetSelect = (id: PaverPresetId) => {
    setPresetId(id);
    const p = PAVER_PRESETS[id];
    if (p) {
      setJointWidthInches(p.defaultJointInches);
      if (p.piecesPerPack) setPiecesPerPack(p.piecesPerPack);
      if (p.piecesPerPallet) setPiecesPerPallet(p.piecesPerPallet);
      if (id === 'custom') {
        setCustomLength(p.lengthInches);
        setCustomWidth(p.widthInches);
        setCustomThickness(p.thicknessInches);
      }
    }
  };

  // Handle Quick Project Type Switching
  const handleProjectTypeSelect = (type: PaverProjectType) => {
    setProjectType(type);
    if (type === 'driveway') {
      setBaseDepthInches(8);
      setPatternId('herringbone-45');
      setWastePercent(12);
      setUnrestrainedSides(2); // typical driveway flanked by lawn on sides
    } else if (type === 'walkway') {
      setSimpleLength(30);
      setSimpleWidth(4);
      setBaseDepthInches(4);
      setUnrestrainedSides(2);
      setWastePercent(8);
    } else if (type === 'patio') {
      setBaseDepthInches(4);
      setPatternId('running-bond');
      setWastePercent(10);
      setUnrestrainedSides(3);
    } else if (type === 'pool-deck') {
      setBaseDepthInches(4);
      setPatternId('running-bond');
      setWastePercent(10);
      setUnrestrainedSides(4);
    }
  };

  // Handle Pattern Select
  const handlePatternSelect = (patId: LayingPatternId) => {
    setPatternId(patId);
    const pat = LAYING_PATTERNS[patId];
    if (pat) {
      setWastePercent(pat.recommendedWastePercent);
    }
  };

  // Sections management
  const addSection = () => {
    const id = `sec-${Date.now()}`;
    setSections((prev) => [
      ...prev,
      {
        id,
        name: `Area Section ${prev.length + 1}`,
        shape: 'rectangle',
        length: 10,
        lengthUnit: 'feet',
        width: 10,
        widthUnit: 'feet',
        diameter: 8,
        diameterUnit: 'feet',
        sharedEdgeFeet: 0,
      },
    ]);
  };

  const removeSection = (id: string) => {
    if (sections.length <= 1) return;
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSection = (id: string, updates: Partial<SectionState>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  // Openings management
  const addOpening = () => {
    const id = `op-${Date.now()}`;
    setOpenings((prev) => [
      ...prev,
      { id, name: `Opening ${prev.length + 1}`, length: 4, width: 4, count: 1 },
    ]);
  };

  const removeOpening = (id: string) => {
    setOpenings((prev) => prev.filter((o) => o.id !== id));
  };

  const updateOpening = (id: string, updates: Partial<OpeningState>) => {
    setOpenings((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  };

  // Calculation Execution
  const calculationInput: PaverCalculationInput = {
    projectType,
    inputMode,
    length: simpleLength,
    lengthUnit: simpleLengthUnit,
    width: simpleWidth,
    widthUnit: simpleWidthUnit,
    knownArea,
    knownAreaUnit,
    sections: useMultiSections
      ? sections.map((s) => ({
          id: s.id,
          name: s.name,
          shape: s.shape,
          length: s.length,
          lengthUnit: s.lengthUnit,
          width: s.width,
          widthUnit: s.widthUnit,
          diameter: s.diameter,
          diameterUnit: s.diameterUnit,
          sharedEdgeFeet: s.sharedEdgeFeet,
        }))
      : undefined,
    openings: openings.map((o) => ({
      id: o.id,
      name: o.name,
      length: o.length,
      lengthUnit: 'feet',
      width: o.width,
      widthUnit: 'feet',
      count: o.count,
    })),
    unrestrainedSides,
    presetId,
    customDimensions:
      presetId === 'custom'
        ? {
            lengthInches: customLength,
            widthInches: customWidth,
            thicknessInches: customThickness,
          }
        : undefined,
    jointWidthInches,
    patternId,
    wastePercent,
    piecesPerPack,
    piecesPerPallet,
    includeBase,
    baseDepthInches,
    baseCompactionPercent,
    includeBaseShoulder,
    includeBedding,
    beddingDepthInches,
    beddingWastePercent,
    includeJointSand,
    jointSandCoverageSqFtPerBag: jointSandCoverageSqFt,
    includeEdgeRestraints,
    edgeSectionLengthFt,
    spikeSpacingInches,
    includeGeotextile,
    pricePerPaverPiece,
    pricePerPaverSqFt,
    pricePerPaverPallet,
    pricePerBaseTon,
    pricePerSandTon,
    pricePerJointSandBag,
    pricePerEdgingPiece,
    pricePerGeotextileSqFt,
    deliveryFee,
    laborCostPerSqFt,
    equipmentRentalFee,
    salesTaxPercent,
  };

  const result = calculatePavers(calculationInput);

  // Reset to default
  const handleReset = () => {
    setProjectType('patio');
    setInputMode('dimensions');
    setSimpleLength(16);
    setSimpleWidth(12);
    setUseMultiSections(false);
    setPresetId('4x8-holland');
    setPatternId('running-bond');
    setWastePercent(10);
    setBaseDepthInches(4);
    setIncludeBase(true);
    setIncludeBedding(true);
    setIncludeJointSand(true);
    setIncludeEdgeRestraints(true);
    setIncludeGeotextile(true);
    setOpenings([]);
  };

  // Save to LocalStorage project
  const handleSaveProject = () => {
    saveProject({
      id: `paver-project-${Date.now()}`,
      name: `Paver Project (${Math.round(result.netPavedAreaSqFt)} sq ft · ${result.orderPaverCount} pcs)`,
      projectType: 'paver',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inputs: {
        projectType,
        netPavedAreaSqFt: result.netPavedAreaSqFt,
        presetId,
        patternId,
        orderPaverCount: result.orderPaverCount,
      },
      summary: {
        totalCost: result.hasCostData ? result.grandTotal : undefined,
        totalTons: result.baseWeightTons + result.beddingWeightTons,
        itemCount: result.billOfMaterials.length,
        primaryDescription: `${Math.round(result.netPavedAreaSqFt)} sq ft paver surface with ${result.orderPaverCount} pieces (${result.palletsNeeded} pallets), ${result.baseWeightTons.toFixed(1)} tons base, ${result.beddingWeightTons.toFixed(1)} tons sand.`,
      },
      billOfMaterials: result.billOfMaterials.map((item) => ({
        item: item.item,
        quantity: item.quantity,
        unit: item.unit,
        estimatedCost: item.subtotalCost,
      })),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    const text = `CubicYardKit Paver Estimate:
• Surface Area: ${Math.round(result.netPavedAreaSqFt)} sq ft (${result.netPavedAreaSqMeters.toFixed(1)} m²)
• Paver Units: ${formatNumber(result.orderPaverCount, 0)} pieces (${result.palletsNeeded} pallets)
• Laying Pattern: ${LAYING_PATTERNS[patternId]?.name || patternId} with ${wastePercent}% waste
• Base Stone (#21A / CR6): ${result.baseWeightTons.toFixed(2)} tons (${result.baseLooseOrderVolumeCuYds.toFixed(2)} yd³ @ ${baseDepthInches}" compacted)
• Bedding Sand (ASTM C33): ${result.beddingWeightTons.toFixed(2)} tons (${result.beddingBags50lb} bags @ 1")
• Joint Sand: ${result.jointSandBags50lb} × 50-lb polymeric sand bags
• Edge Restraints: ${result.edgeRestraintSectionsNeeded} sections (${Math.round(result.edgeRestraintLinearFt)} ft) + ${result.edgeSpikesNeeded} spikes
${result.hasCostData ? `• Total Budget: $${formatNumber(result.grandTotal, 2)} ($${result.costPerSqFt?.toFixed(2)}/sq ft)` : ''}
Estimated on CubicYardKit.com`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="space-y-6">
      {/* Quick Start Project Type Preset Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              Quick Application Presets
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-1">Select Project Application</h3>
          </div>
          <span className="text-xs text-slate-500">Applies typical base depths & pattern rules</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {(
            [
              { type: 'patio', label: 'Backyard Patio', base: '4" Base · Running Bond', icon: '🏡' },
              { type: 'walkway', label: 'Walkway / Path', base: '4" Base · Edged Sides', icon: '🚶' },
              { type: 'driveway', label: 'Vehicular Driveway', base: '8" Base · 45° Herringbone', icon: '🚗' },
              { type: 'pool-deck', label: 'Pool Deck Surround', base: '4" Base · 4-Side Restraint', icon: '🏊' },
            ] as const
          ).map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => handleProjectTypeSelect(item.type)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                projectType === item.type
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                  : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80 text-slate-700'
              }`}
            >
              <div className="text-lg mb-1">{item.icon}</div>
              <div className="text-xs font-bold leading-tight">{item.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">{item.base}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Calculator Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="border-b border-slate-200 bg-slate-50/70 px-4 sm:px-6 pt-3">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabMode)}>
            <TabsList className="grid grid-cols-4 max-w-2xl bg-slate-200/80 p-1">
              <TabsTrigger value="takeoff" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-xs">
                <Ruler className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">1. Paver </span>Count
              </TabsTrigger>
              <TabsTrigger value="layers" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-xs">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">2. </span>Layers
              </TabsTrigger>
              <TabsTrigger value="procurement" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-xs">
                <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">3. </span>Shopping List
              </TabsTrigger>
              <TabsTrigger value="budget" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-xs">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">4. </span>Cost Quote
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* TAB 1: PAVER TAKEOFF & GEOMETRY */}
          {activeTab === 'takeoff' && (
            <div className="space-y-6">
              {/* Input Mode Selector */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Geometry Input:</span>
                  <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-white">
                    <button
                      type="button"
                      onClick={() => {
                        setInputMode('dimensions');
                        setUseMultiSections(false);
                      }}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        inputMode === 'dimensions' && !useMultiSections
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Dimensions (L × W)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputMode('dimensions');
                        setUseMultiSections(true);
                      }}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        inputMode === 'dimensions' && useMultiSections
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Multi-Section
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('area')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        inputMode === 'area'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Total Square Feet
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Unrestrained Sides:</span>
                  <select
                    value={unrestrainedSides}
                    onChange={(e) => setUnrestrainedSides(Number(e.target.value) as 4 | 3 | 2 | 1)}
                    className="text-xs py-1 px-2.5 rounded-lg border border-slate-300 bg-white font-medium"
                    aria-label="Exposed unrestrained sides for edge restraints"
                  >
                    <option value={4}>4 Sides (Freestanding Island)</option>
                    <option value={3}>3 Sides (Against House / Foundation)</option>
                    <option value={2}>2 Sides (Between Two Walls / Driveway)</option>
                    <option value={1}>1 Side (Courtyard / Enclosed)</option>
                  </select>
                </div>
              </div>

              {/* Dimension Inputs */}
              {inputMode === 'dimensions' && !useMultiSections && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`${compId}-length`} className="text-xs font-semibold text-slate-700">
                      Patio / Surface Length
                    </Label>
                    <div className="flex mt-1.5">
                      <input
                        id={`${compId}-length`}
                        type="number"
                        min="0"
                        step="0.5"
                        value={simpleLength || ''}
                        onChange={(e) => setSimpleLength(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="flex-1 rounded-l-lg border border-r-0 border-slate-300 px-3 py-2 text-sm font-mono-numbers focus:border-emerald-500 focus:outline-hidden"
                      />
                      <select
                        value={simpleLengthUnit}
                        onChange={(e) => setSimpleLengthUnit(e.target.value as LengthUnit)}
                        className="rounded-r-lg border border-slate-300 bg-slate-50 px-2.5 text-xs font-medium text-slate-700"
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
                    <Label htmlFor={`${compId}-width`} className="text-xs font-semibold text-slate-700">
                      Patio / Surface Width
                    </Label>
                    <div className="flex mt-1.5">
                      <input
                        id={`${compId}-width`}
                        type="number"
                        min="0"
                        step="0.5"
                        value={simpleWidth || ''}
                        onChange={(e) => setSimpleWidth(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="flex-1 rounded-l-lg border border-r-0 border-slate-300 px-3 py-2 text-sm font-mono-numbers focus:border-emerald-500 focus:outline-hidden"
                      />
                      <select
                        value={simpleWidthUnit}
                        onChange={(e) => setSimpleWidthUnit(e.target.value as LengthUnit)}
                        className="rounded-r-lg border border-slate-300 bg-slate-50 px-2.5 text-xs font-medium text-slate-700"
                      >
                        {LENGTH_UNITS.map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Known Area Input */}
              {inputMode === 'area' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`${compId}-known-area`} className="text-xs font-semibold text-slate-700">
                      Total Paved Surface Area
                    </Label>
                    <div className="flex mt-1.5">
                      <input
                        id={`${compId}-known-area`}
                        type="number"
                        min="0"
                        step="1"
                        value={knownArea || ''}
                        onChange={(e) => setKnownArea(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="flex-1 rounded-l-lg border border-r-0 border-slate-300 px-3 py-2 text-sm font-mono-numbers focus:border-emerald-500 focus:outline-hidden"
                      />
                      <select
                        value={knownAreaUnit}
                        onChange={(e) => setKnownAreaUnit(e.target.value as any)}
                        className="rounded-r-lg border border-slate-300 bg-slate-50 px-2.5 text-xs font-medium text-slate-700"
                      >
                        <option value="sqFt">sq ft</option>
                        <option value="sqYards">sq yd</option>
                        <option value="sqMeters">sq m</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-slate-500 pt-6">
                    <span>Infers boundary perimeter for edge restraints assuming a near-square aspect.</span>
                  </div>
                </div>
              )}

              {/* Multi-Section Area List */}
              {inputMode === 'dimensions' && useMultiSections && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Project Area Sections</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSection}
                      className="text-xs gap-1 border-slate-300"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Add Section
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {sections.map((sec, idx) => (
                      <div
                        key={sec.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                      >
                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            value={sec.name}
                            onChange={(e) => updateSection(sec.id, { name: e.target.value })}
                            className="w-full text-xs font-semibold px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                            placeholder="Section Name"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <select
                            value={sec.shape}
                            onChange={(e) => updateSection(sec.id, { shape: e.target.value as any })}
                            className="w-full text-xs px-2 py-1.5 rounded border border-slate-300 bg-white"
                          >
                            <option value="rectangle">Rectangle</option>
                            <option value="circle">Circular</option>
                            <option value="triangle">Triangle</option>
                          </select>
                        </div>

                        {sec.shape !== 'circle' ? (
                          <>
                            <div className="sm:col-span-3 flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={sec.length || ''}
                                onChange={(e) =>
                                  updateSection(sec.id, { length: Math.max(0, parseFloat(e.target.value) || 0) })
                                }
                                className="w-20 text-xs px-2 py-1.5 rounded border border-slate-300 bg-white font-mono-numbers"
                                placeholder="Length"
                              />
                              <span className="text-xs text-slate-400">×</span>
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={sec.width || ''}
                                onChange={(e) =>
                                  updateSection(sec.id, { width: Math.max(0, parseFloat(e.target.value) || 0) })
                                }
                                className="w-20 text-xs px-2 py-1.5 rounded border border-slate-300 bg-white font-mono-numbers"
                                placeholder="Width"
                              />
                              <span className="text-xs text-slate-500">ft</span>
                            </div>

                            <div className="sm:col-span-3 flex items-center gap-1">
                              <span className="text-[11px] text-slate-500">Shared:</span>
                              <input
                                type="number"
                                min="0"
                                value={sec.sharedEdgeFeet || ''}
                                onChange={(e) =>
                                  updateSection(sec.id, {
                                    sharedEdgeFeet: Math.max(0, parseFloat(e.target.value) || 0),
                                  })
                                }
                                className="w-16 text-xs px-2 py-1.5 rounded border border-slate-300 bg-white font-mono-numbers"
                                placeholder="Wall ft"
                              />
                              <span className="text-[11px] text-slate-400">ft</span>
                            </div>
                          </>
                        ) : (
                          <div className="sm:col-span-6 flex items-center gap-2">
                            <span className="text-xs text-slate-500">Diameter:</span>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={sec.diameter || ''}
                              onChange={(e) =>
                                updateSection(sec.id, { diameter: Math.max(0, parseFloat(e.target.value) || 0) })
                              }
                              className="w-24 text-xs px-2 py-1.5 rounded border border-slate-300 bg-white font-mono-numbers"
                              placeholder="Diameter"
                            />
                            <span className="text-xs text-slate-500">ft</span>
                          </div>
                        )}

                        <div className="sm:col-span-1 flex justify-end">
                          <button
                            type="button"
                            disabled={sections.length <= 1}
                            onClick={() => removeSection(sec.id)}
                            className="text-slate-400 hover:text-red-600 disabled:opacity-30 p-1"
                            aria-label={`Remove section ${sec.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Paver Size & Unit Specs */}
              <div className="border-t border-slate-200/80 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Paver Product Specifications
                  </h4>
                  <span className="text-[11px] text-slate-500">Module accounts for joint spacer</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Preset Selector */}
                  <div>
                    <Label htmlFor={`${compId}-preset`} className="text-xs font-semibold text-slate-700">
                      Paver Size Preset
                    </Label>
                    <select
                      id={`${compId}-preset`}
                      value={presetId}
                      onChange={(e) => handlePresetSelect(e.target.value as PaverPresetId)}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium bg-white"
                    >
                      {Object.values(PAVER_PRESETS).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Laying Pattern */}
                  <div>
                    <Label htmlFor={`${compId}-pattern`} className="text-xs font-semibold text-slate-700">
                      Laying Pattern
                    </Label>
                    <select
                      id={`${compId}-pattern`}
                      value={patternId}
                      onChange={(e) => handlePatternSelect(e.target.value as LayingPatternId)}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium bg-white"
                    >
                      {Object.values(LAYING_PATTERNS).map((pat) => (
                        <option key={pat.id} value={pat.id}>
                          {pat.name} ({pat.interlockStrength.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cut & Waste Allowance */}
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${compId}-waste`} className="text-xs font-semibold text-slate-700">
                        Cutting & Breakage Waste
                      </Label>
                      <span className="text-xs font-bold text-emerald-700 font-mono-numbers">
                        {wastePercent}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        id={`${compId}-waste`}
                        type="range"
                        min="0"
                        max="25"
                        step="1"
                        value={wastePercent}
                        onChange={(e) => setWastePercent(parseInt(e.target.value, 10))}
                        className="w-full accent-emerald-600"
                      />
                      <span className="text-[11px] text-slate-400 w-10 text-right">
                        {LAYING_PATTERNS[patternId]?.recommendedWastePercent || 10}% rec
                      </span>
                    </div>
                  </div>
                </div>

                {/* Custom Dimensions if selected */}
                {presetId === 'custom' && (
                  <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-[11px] text-amber-900 font-semibold">Length (in)</Label>
                      <input
                        type="number"
                        min="1"
                        step="0.125"
                        value={customLength || ''}
                        onChange={(e) => setCustomLength(Math.max(0.5, parseFloat(e.target.value) || 0))}
                        className="mt-1 w-full text-xs p-1.5 rounded border border-amber-300 bg-white font-mono-numbers"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-amber-900 font-semibold">Width (in)</Label>
                      <input
                        type="number"
                        min="1"
                        step="0.125"
                        value={customWidth || ''}
                        onChange={(e) => setCustomWidth(Math.max(0.5, parseFloat(e.target.value) || 0))}
                        className="mt-1 w-full text-xs p-1.5 rounded border border-amber-300 bg-white font-mono-numbers"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-amber-900 font-semibold">Thickness (in)</Label>
                      <input
                        type="number"
                        min="1"
                        step="0.125"
                        value={customThickness || ''}
                        onChange={(e) => setCustomThickness(Math.max(0.5, parseFloat(e.target.value) || 0))}
                        className="mt-1 w-full text-xs p-1.5 rounded border border-amber-300 bg-white font-mono-numbers"
                      />
                    </div>
                  </div>
                )}

                {/* Joint Width & Packaging controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Joint Width</Label>
                    <select
                      value={jointWidthInches}
                      onChange={(e) => setJointWidthInches(parseFloat(e.target.value))}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium bg-white"
                    >
                      <option value={0.0625}>1/16" (Tight Joint)</option>
                      <option value={0.125}>1/8" (Standard Interlocking)</option>
                      <option value={0.1875}>3/16" (Chamfered Paver)</option>
                      <option value={0.25}>1/4" (Rustic / Cobblestone)</option>
                      <option value={0.375}>3/8" (Wide Permeable)</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Pieces per Pallet</Label>
                    <input
                      type="number"
                      min="1"
                      value={piecesPerPallet || ''}
                      onChange={(e) => setPiecesPerPallet(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-numbers bg-white"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Pieces per Pack/Bundle</Label>
                    <input
                      type="number"
                      min="1"
                      value={piecesPerPack || ''}
                      onChange={(e) => setPiecesPerPack(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-numbers bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STRUCTURAL LAYERS (BASE, BEDDING, JOINTS, EDGING) */}
          {activeTab === 'layers' && (
            <div className="space-y-6">
              {/* Layer 1: Compacted Base Aggregate */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      id={`${compId}-inc-base`}
                      type="checkbox"
                      checked={includeBase}
                      onChange={(e) => setIncludeBase(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <Label htmlFor={`${compId}-inc-base`} className="text-xs font-bold text-slate-900 cursor-pointer">
                      Sub-Base Aggregate Layer (#21A / CR6 / Road Base)
                    </Label>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-slate-600 bg-white">
                    ICPI Guideline
                  </Badge>
                </div>

                {includeBase && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200/60">
                    <div>
                      <Label className="text-xs text-slate-600">Compacted Base Depth</Label>
                      <select
                        value={baseDepthInches}
                        onChange={(e) => setBaseDepthInches(parseFloat(e.target.value))}
                        className="mt-1 w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value={4}>4" (Pedestrian Walkway / Patio)</option>
                        <option value={6}>6" (Heavy Pedestrian / Clay Subsoil)</option>
                        <option value={8}>8" (Standard Residential Driveway)</option>
                        <option value={10}>10" (Heavy Truck Driveway / Freeze)</option>
                        <option value={12}>12" (Commercial / Severe Frost)</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs text-slate-600">Compaction / Loose Factor</Label>
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          min="0"
                          max="40"
                          value={baseCompactionPercent}
                          onChange={(e) => setBaseCompactionPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono-numbers"
                        />
                        <span className="text-xs text-slate-500">%</span>
                      </div>
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeBaseShoulder}
                          onChange={(e) => setIncludeBaseShoulder(e.target.checked)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Extend base 6" for spike anchoring</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Layer 2: Bedding Sand Layer */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      id={`${compId}-inc-bedding`}
                      type="checkbox"
                      checked={includeBedding}
                      onChange={(e) => setIncludeBedding(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <Label htmlFor={`${compId}-inc-bedding`} className="text-xs font-bold text-slate-900 cursor-pointer">
                      Bedding Sand Layer (Coarse Washed Concrete Sand ASTM C33)
                    </Label>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">Never Pre-Compact</span>
                </div>

                {includeBedding && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
                    <div>
                      <Label className="text-xs text-slate-600">Screeded Bedding Thickness</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          min="0.5"
                          max="2"
                          step="0.25"
                          value={beddingDepthInches}
                          onChange={(e) => setBeddingDepthInches(Math.max(0.5, parseFloat(e.target.value) || 1))}
                          className="w-28 text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono-numbers"
                        />
                        <span className="text-xs text-slate-500">inches (Standard 1.0" uniform screed)</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-slate-600">Bedding Sand Waste / Overfill</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={beddingWastePercent}
                          onChange={(e) => setBeddingWastePercent(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-28 text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono-numbers"
                        />
                        <span className="text-xs text-slate-500">% allowance (5% standard)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Layer 3: Polymeric Joint Sand */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      id={`${compId}-inc-joint`}
                      type="checkbox"
                      checked={includeJointSand}
                      onChange={(e) => setIncludeJointSand(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <Label htmlFor={`${compId}-inc-joint`} className="text-xs font-bold text-slate-900 cursor-pointer">
                      Polymeric Joint Sand (Moisture-Activated Joint Lock)
                    </Label>
                  </div>
                  <span className="text-[11px] text-slate-500">Ant & Weed Deterrent</span>
                </div>

                {includeJointSand && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <Label className="text-xs text-slate-600">Estimated Bag Coverage (50-lb bag)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        min="20"
                        max="150"
                        value={jointSandCoverageSqFt}
                        onChange={(e) => setJointSandCoverageSqFt(Math.max(10, parseFloat(e.target.value) || 75))}
                        className="w-28 text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono-numbers"
                      />
                      <span className="text-xs text-slate-500">
                        sq ft / bag (4"×8" with 1/8" joints yields ~75 sq ft; wide joints ~40 sq ft)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Layer 4: Edge Restraints & Anchoring Spikes */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      id={`${compId}-inc-edge`}
                      type="checkbox"
                      checked={includeEdgeRestraints}
                      onChange={(e) => setIncludeEdgeRestraints(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <Label htmlFor={`${compId}-inc-edge`} className="text-xs font-bold text-slate-900 cursor-pointer">
                      Commercial Paver Edge Restraints & Spikes
                    </Label>
                  </div>
                  <span className="text-[11px] text-slate-500">Prevents Border Creep</span>
                </div>

                {includeEdgeRestraints && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
                    <div>
                      <Label className="text-xs text-slate-600">Restraint Section Length</Label>
                      <select
                        value={edgeSectionLengthFt}
                        onChange={(e) => setEdgeSectionLengthFt(parseFloat(e.target.value))}
                        className="mt-1 w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value={7.5}>7.5 ft Commercial Sticks</option>
                        <option value={8.0}>8.0 ft Commercial Sticks</option>
                        <option value={6.0}>6.0 ft Light Duty</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs text-slate-600">Steel Spike Spacing</Label>
                      <select
                        value={spikeSpacingInches}
                        onChange={(e) => setSpikeSpacingInches(parseInt(e.target.value, 10))}
                        className="mt-1 w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value={18}>18 inches (Standard Walkways & Patios)</option>
                        <option value={12}>12 inches (Driveways & Curved Edges)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Layer 5: Geotextile Fabric */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    id={`${compId}-inc-geo`}
                    type="checkbox"
                    checked={includeGeotextile}
                    onChange={(e) => setIncludeGeotextile(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <Label htmlFor={`${compId}-inc-geo`} className="text-xs font-bold text-slate-900 cursor-pointer">
                      Non-Woven Geotextile Separation Fabric
                    </Label>
                    <p className="text-[11px] text-slate-500">
                      Prevents base aggregate from migrating down into soft subsoil (includes 10% overlap).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROCUREMENT & SHOPPING LIST */}
          {activeTab === 'procurement' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Comprehensive Bill of Materials (BOM)
                  </h4>
                  <p className="text-xs text-slate-500">Supplier order quantities with packaging and procurement units</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopySummary}
                    className="text-xs gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    className="text-xs gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Category</th>
                      <th className="px-4 py-2.5">Item Description</th>
                      <th className="px-4 py-2.5 text-right">Quantity</th>
                      <th className="px-4 py-2.5">Unit</th>
                      <th className="px-4 py-2.5">Procurement Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {result.billOfMaterials.map((bom, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {bom.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">{bom.item}</td>
                        <td className="px-4 py-3 text-right font-mono-numbers font-bold text-slate-900">
                          {typeof bom.quantity === 'number' ? formatNumber(bom.quantity, 0) : bom.quantity}
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium">{bom.unit}</td>
                        <td className="px-4 py-3 text-slate-500 text-[11px] leading-relaxed">{bom.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PROJECT BUDGET & QUOTE ESTIMATOR */}
          {activeTab === 'budget' && (
            <div className="space-y-6">
              <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2">
                <DollarSign className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Transparent Project Cost Estimating:</span> Enter your local supplier unit prices below to compute itemized material totals, labor rates, and total installed costs. No prices are required to use the calculator.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Price per Paver Piece ($)</Label>
                  <input
                    type="number"
                    min="0"
                    step="0.05"
                    value={pricePerPaverPiece !== null ? pricePerPaverPiece : ''}
                    onChange={(e) => setPricePerPaverPiece(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g. 0.85"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-numbers bg-white"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Price per Base Ton ($)</Label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={pricePerBaseTon !== null ? pricePerBaseTon : ''}
                    onChange={(e) => setPricePerBaseTon(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g. 35.00"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-numbers bg-white"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Price per Sand Ton ($)</Label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={pricePerSandTon !== null ? pricePerSandTon : ''}
                    onChange={(e) => setPricePerSandTon(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g. 45.00"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-numbers bg-white"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Joint Sand per 50-lb Bag ($)</Label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={pricePerJointSandBag !== null ? pricePerJointSandBag : ''}
                    onChange={(e) => setPricePerJointSandBag(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g. 28.00"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-numbers bg-white"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Edging per Stick ($)</Label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={pricePerEdgingPiece !== null ? pricePerEdgingPiece : ''}
                    onChange={(e) => setPricePerEdgingPiece(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g. 12.50"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-numbers bg-white"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Delivery Fee ($)</Label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={deliveryFee !== null ? deliveryFee : ''}
                    onChange={(e) => setDeliveryFee(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g. 120.00"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-numbers bg-white"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Labor per Sq Ft ($ / optional)</Label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={laborCostPerSqFt !== null ? laborCostPerSqFt : ''}
                    onChange={(e) => setLaborCostPerSqFt(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g. 14.00"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-numbers bg-white"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Equipment Rental ($ / compactor)</Label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={equipmentRentalFee !== null ? equipmentRentalFee : ''}
                    onChange={(e) => setEquipmentRentalFee(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g. 95.00"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-numbers bg-white"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Sales Tax (%)</Label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    step="0.25"
                    value={salesTaxPercent !== null ? salesTaxPercent : ''}
                    onChange={(e) => setSalesTaxPercent(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g. 6.5"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono-numbers bg-white"
                  />
                </div>
              </div>

              {/* Cost Summary Box */}
              {result.hasCostData && (
                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Total Estimated Budget
                    </span>
                    <span className="text-xs text-slate-400">
                      {result.costPerSqFt ? `$${result.costPerSqFt.toFixed(2)} / sq ft` : ''}
                    </span>
                  </div>
                  <div className="text-3xl font-black font-mono-numbers text-white">
                    ${formatNumber(result.grandTotal, 2)}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Materials:</span>
                      ${formatNumber(result.materialSubtotal, 2)}
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Delivery:</span>
                      ${formatNumber(result.deliverySubtotal, 2)}
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Labor:</span>
                      ${formatNumber(result.laborSubtotal, 2)}
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Tax:</span>
                      ${formatNumber(result.taxSubtotal, 2)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Primary Results Dashboard (Bento Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Paver Count & Pallets (Hero Card) */}
        <div className="sm:col-span-2 bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 relative overflow-hidden shadow-md">
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                Total Pavers Required
              </span>
              <span className="text-xs text-slate-400 font-mono-numbers">
                {result.wastePercent}% cutting waste included
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <div className="text-4xl sm:text-5xl font-black tracking-tight font-mono-numbers text-white">
                {formatNumber(result.orderPaverCount, 0)}
              </div>
              <span className="text-base font-bold text-slate-300">pieces</span>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
              <div>
                <span className="text-slate-400">Pallets Needed: </span>
                <span className="font-bold text-white font-mono-numbers">{result.palletsNeeded} pallets</span>
                <span className="text-slate-500 text-[11px]"> (~{result.piecesPerPallet} pcs/pal)</span>
              </div>
              <div>
                <span className="text-slate-400">Total Weight: </span>
                <span className="font-bold text-white font-mono-numbers">{result.totalPaverWeightTons.toFixed(2)} tons</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Surface Area */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Paved Surface Area</span>
            <div className="text-2xl font-black text-slate-900 font-mono-numbers mt-1.5">
              {formatNumber(result.netPavedAreaSqFt, 0)} <span className="text-xs font-normal text-slate-500">sq ft</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono-numbers">
              {result.netPavedAreaSqMeters.toFixed(1)} m² · {result.paversPerSqFt.toFixed(2)} pcs/sq ft
            </p>
          </div>
          <div className="pt-2 text-[11px] text-slate-600 border-t border-slate-100 flex justify-between">
            <span>Theoretical Net:</span>
            <span className="font-mono-numbers font-semibold">{formatNumber(result.theoreticalPaverCount, 0)} pcs</span>
          </div>
        </div>

        {/* Card 3: Base Stone (Tons) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Base Aggregate (#21A)</span>
            <div className="text-2xl font-black text-slate-900 font-mono-numbers mt-1.5">
              {result.baseWeightTons.toFixed(2)} <span className="text-xs font-normal text-slate-500">tons</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono-numbers">
              {result.baseLooseOrderVolumeCuYds.toFixed(2)} loose bulk cu yds ({baseDepthInches}" depth)
            </p>
          </div>
          <div className="pt-2 text-[11px] text-slate-600 border-t border-slate-100 flex justify-between">
            <span>Includes 15% compaction:</span>
            <span className="font-mono-numbers font-semibold">{result.baseCompactedVolumeCuYds.toFixed(2)} yd³ net</span>
          </div>
        </div>

        {/* Card 4: Bedding Sand */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bedding Sand (ASTM C33)</span>
            <div className="text-2xl font-black text-slate-900 font-mono-numbers mt-1.5">
              {result.beddingWeightTons.toFixed(2)} <span className="text-xs font-normal text-slate-500">tons</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono-numbers">
              {result.beddingVolumeCuYds.toFixed(2)} cu yds (or {result.beddingBags50lb} × 50lb bags)
            </p>
          </div>
          <div className="pt-2 text-[11px] text-slate-600 border-t border-slate-100 flex justify-between">
            <span>Uniform screed depth:</span>
            <span className="font-semibold text-emerald-700">1.0 inch</span>
          </div>
        </div>

        {/* Card 5: Polymeric Sand Bags */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Polymeric Joint Sand</span>
            <div className="text-2xl font-black text-slate-900 font-mono-numbers mt-1.5">
              {result.jointSandBags50lb} <span className="text-xs font-normal text-slate-500">bags (50-lb)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Based on ~{result.jointSandEstCoveragePerBagSqFt} sq ft coverage per bag
            </p>
          </div>
          <div className="pt-2 text-[11px] text-slate-600 border-t border-slate-100 flex justify-between">
            <span>Joint gap:</span>
            <span className="font-mono-numbers font-semibold">{jointWidthInches}" width</span>
          </div>
        </div>

        {/* Card 6: Edge Restraint Sticks */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Edge Restraints</span>
            <div className="text-2xl font-black text-slate-900 font-mono-numbers mt-1.5">
              {result.edgeRestraintSectionsNeeded} <span className="text-xs font-normal text-slate-500">sticks</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono-numbers">
              {Math.round(result.edgeRestraintLinearFt)} linear ft exposed perimeter
            </p>
          </div>
          <div className="pt-2 text-[11px] text-slate-600 border-t border-slate-100 flex justify-between">
            <span>Steel Spikes:</span>
            <span className="font-mono-numbers font-semibold">{result.edgeSpikesNeeded} spikes</span>
          </div>
        </div>

        {/* Card 7: Geotextile Fabric */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Geotextile Underlay</span>
            <div className="text-2xl font-black text-slate-900 font-mono-numbers mt-1.5">
              {formatNumber(result.geotextileTotalSqFt, 0)} <span className="text-xs font-normal text-slate-500">sq ft</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Non-woven stabilization fabric</p>
          </div>
          <div className="pt-2 text-[11px] text-slate-600 border-t border-slate-100 flex justify-between">
            <span>Sub-base footprint:</span>
            <span className="font-mono-numbers font-semibold">+{includeBaseShoulder ? '6" shoulder' : '0"'}</span>
          </div>
        </div>
      </div>

      {/* Action Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleSaveProject}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5 shadow-xs"
          >
            {saveSuccess ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{saveSuccess ? 'Saved to Projects' : 'Save Project'}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopySummary}
            className="text-xs gap-1.5 border-slate-300"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Takeoff'}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs gap-1.5 border-slate-300"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print BOM</span>
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-xs text-slate-500 hover:text-slate-900 gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </Button>
      </div>
    </div>
  );
}
