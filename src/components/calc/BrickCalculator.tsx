import React, { useState, useId } from 'react';
import { formatNumber } from '../../lib/calc/units';
import type { BrickUnit } from '../../lib/calc/brick';
import { calculateBricks, BRICK_PRESETS } from '../../lib/calc/brick';
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
  Boxes,
  Lightbulb,
  PlusCircle,
  Trash2,
  DollarSign,
  AlertCircle,
  Layers,
  Ruler,
} from 'lucide-react';

interface OpeningState {
  id: string;
  label: string;
  width: number;
  widthUnit: BrickUnit;
  height: number;
  heightUnit: BrickUnit;
  count: number;
}

interface WallState {
  id: string;
  name: string;
  length: number;
  lengthUnit: BrickUnit;
  height: number;
  heightUnit: BrickUnit;
  wythes: 1 | 2;
  openings: OpeningState[];
}

type TabMode = 'quick' | 'mortar' | 'budget';

const UNIT_OPTIONS: { value: BrickUnit; label: string }[] = [
  { value: 'feet', label: 'ft' },
  { value: 'inches', label: 'in' },
  { value: 'meters', label: 'm' },
  { value: 'centimeters', label: 'cm' },
];

const WASTE_PRESETS = [0, 5, 10, 15];
const JOINT_PRESETS = [
  { label: '3/8" (9.5 mm)', value: 0.375 },
  { label: '10 mm (~0.39")', value: 0.3937 },
  { label: '1/2" (12.7 mm)', value: 0.5 },
];

function makeDefaultWall(id: string, name: string = 'Wall 1'): WallState {
  return {
    id,
    name,
    length: 20,
    lengthUnit: 'feet',
    height: 8,
    heightUnit: 'feet',
    wythes: 1,
    openings: [],
  };
}

export default function BrickCalculator() {
  const [tab, setTab] = useState<TabMode>('quick');
  const [presetId, setPresetId] = useState<string>('us-modular');
  const [walls, setWalls] = useState<WallState[]>([makeDefaultWall('wall-1', 'Main Wall')]);
  const [wastePercent, setWastePercent] = useState<number>(10);
  const [jointThickness, setJointThickness] = useState<number>(0.375);
  const [packSize, setPackSize] = useState<number>(500);

  // Custom brick dimensions
  const [customLength, setCustomLength] = useState<number>(8.0);
  const [customWidth, setCustomWidth] = useState<number>(3.75);
  const [customHeight, setCustomHeight] = useState<number>(2.25);

  // Mortar settings
  const [mortarMixRatio, setMortarMixRatio] = useState<'1:3' | '1:4' | '1:5' | '1:6'>('1:4');
  const [mortarLossPercent, setMortarLossPercent] = useState<number>(10);

  // Budget & Pricing
  const [pricePerBrick, setPricePerBrick] = useState<number | ''>('');
  const [pricePerPremixMortarBag, setPricePerPremixMortarBag] = useState<number | ''>('');
  const [laborCostPerSqFt, setLaborCostPerSqFt] = useState<number | ''>('');
  const [wallTiesCost, setWallTiesCost] = useState<number | ''>('');
  const [deliveryFee, setDeliveryFee] = useState<number | ''>('');
  const [taxPercent, setTaxPercent] = useState<number | ''>('');
  const [contingencyPercent, setContingencyPercent] = useState<number | ''>('');

  const [saveStatus, setSaveStatus] = useState<string>('');

  const toNum = (v: number | ''): number | null => (typeof v === 'number' && v > 0 ? v : null);

  const result = calculateBricks({
    walls: walls.map((w) => ({
      id: w.id,
      name: w.name,
      length: w.length || 0,
      lengthUnit: w.lengthUnit,
      height: w.height || 0,
      heightUnit: w.heightUnit,
      wythes: w.wythes,
      openings: w.openings.map((op) => ({
        id: op.id,
        label: op.label,
        width: op.width || 0,
        widthUnit: op.widthUnit,
        height: op.height || 0,
        heightUnit: op.heightUnit,
        count: op.count || 1,
      })),
    })),
    presetId,
    customDimensions:
      presetId === 'custom'
        ? {
            lengthInches: customLength || 8,
            widthInches: customWidth || 3.75,
            heightInches: customHeight || 2.25,
          }
        : undefined,
    jointThicknessInches: jointThickness,
    wastePercent,
    mortarLossPercent,
    packSize,
    mortarMixRatio,
    pricePerBrick: toNum(pricePerBrick),
    pricePerPremixMortarBag: toNum(pricePerPremixMortarBag),
    laborCostPerSqFt: toNum(laborCostPerSqFt),
    wallTiesCost: toNum(wallTiesCost),
    deliveryFee: toNum(deliveryFee),
    taxPercent: toNum(taxPercent),
    contingencyPercent: toNum(contingencyPercent),
  });

  const handleAddWall = () => {
    if (walls.length >= 6) return;
    const nextIdx = walls.length + 1;
    setWalls([...walls, makeDefaultWall(`wall-${Date.now()}`, `Wall ${nextIdx}`)]);
  };

  const handleRemoveWall = (id: string) => {
    if (walls.length <= 1) return;
    setWalls(walls.filter((w) => w.id !== id));
  };

  const handleUpdateWall = (id: string, field: keyof WallState, value: any) => {
    setWalls(walls.map((w) => (w.id === id ? { ...w, [field]: value } : w)));
  };

  const handleAddOpening = (wallId: string) => {
    setWalls(
      walls.map((w) => {
        if (w.id !== wallId) return w;
        const newOp: OpeningState = {
          id: `op-${Date.now()}`,
          label: `Window / Door ${w.openings.length + 1}`,
          width: 3,
          widthUnit: 'feet',
          height: 4,
          heightUnit: 'feet',
          count: 1,
        };
        return { ...w, openings: [...w.openings, newOp] };
      })
    );
  };

  const handleRemoveOpening = (wallId: string, opId: string) => {
    setWalls(
      walls.map((w) => {
        if (w.id !== wallId) return w;
        return { ...w, openings: w.openings.filter((op) => op.id !== opId) };
      })
    );
  };

  const handleUpdateOpening = (wallId: string, opId: string, field: keyof OpeningState, value: any) => {
    setWalls(
      walls.map((w) => {
        if (w.id !== wallId) return w;
        return {
          ...w,
          openings: w.openings.map((op) => (op.id === opId ? { ...op, [field]: value } : op)),
        };
      })
    );
  };

  const handleReset = () => {
    setPresetId('us-modular');
    setWalls([makeDefaultWall('wall-1', 'Main Wall')]);
    setWastePercent(10);
    setJointThickness(0.375);
    setPackSize(500);
    setMortarMixRatio('1:4');
    setMortarLossPercent(10);
    setPricePerBrick('');
    setPricePerPremixMortarBag('');
    setLaborCostPerSqFt('');
    setWallTiesCost('');
    setDeliveryFee('');
    setTaxPercent('');
    setContingencyPercent('');
    setSaveStatus('');
  };

  const handleSave = () => {
    saveProject({
      id: `brick-project-${Date.now()}`,
      name: `Brickwork Project (${result.orderBricks.toLocaleString()} bricks · ${result.totalNetAreaSqFt.toFixed(0)} sq ft)`,
      projectType: 'brick',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inputs: {
        presetId,
        walls,
        wastePercent,
        jointThickness,
        mortarMixRatio,
      },
      summary: {
        itemCount: result.orderBricks,
        totalCubicYards: result.totalMasonryVolumeCuYd,
        totalCost: result.hasCostData ? result.grandTotal : undefined,
        primaryDescription: `${result.orderBricks.toLocaleString()} bricks (${result.packsNeeded} packs) · ${result.premixMortarBags80lb} bags mortar`,
      },
      billOfMaterials: [
        {
          item: `Bricks (${result.preset.name})`,
          quantity: result.orderBricks,
          unit: 'bricks',
        },
        {
          item: 'Pre-mixed 80-lb Mortar Bags (0.67 cu ft yield)',
          quantity: result.premixMortarBags80lb,
          unit: 'bags',
        },
        {
          item: 'Alternative: Portland Cement (94-lb bags)',
          quantity: result.cementBags94lb,
          unit: 'bags',
        },
        {
          item: 'Alternative: Masonry Sand',
          quantity: result.sandWeightTons.toFixed(2),
          unit: 'tons',
        },
      ],
    });
    setSaveStatus('Brickwork project saved locally!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <Card className="overflow-hidden border-slate-200/90 shadow-sm">
      {/* Header Banner — Warm Terracotta / Masonry Brick theme */}
      <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Brick & Mortar Calculator
              </h2>
              <Badge className="text-[10px] py-0 px-2 bg-rose-600 hover:bg-rose-600 text-white font-bold border-none">
                US & Global Standards
              </Badge>
            </div>
            <p className="text-xs text-slate-300">
              Calculate bricks, mortar volume, cement bags, sand tonnage & project cost
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <Tabs value={tab} onValueChange={(val) => setTab(val as TabMode)}>
          <TabsList className="bg-slate-800 border-slate-700 text-slate-300">
            <TabsTrigger
              value="quick"
              className="data-[state=active]:bg-rose-600 data-[state=active]:text-white font-semibold"
            >
              Quick Brick Count
            </TabsTrigger>
            <TabsTrigger
              value="mortar"
              className="data-[state=active]:bg-rose-600 data-[state=active]:text-white font-semibold"
            >
              Mortar Materials
            </TabsTrigger>
            <TabsTrigger
              value="budget"
              className="data-[state=active]:bg-rose-600 data-[state=active]:text-white font-semibold"
            >
              Project Budget
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Preset Selector Bar */}
      <div className="bg-slate-100/90 px-5 sm:px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Brick Size:
          </span>
          <select
            value={presetId}
            onChange={(e) => {
              setPresetId(e.target.value);
              if (BRICK_PRESETS[e.target.value]) {
                setJointThickness(BRICK_PRESETS[e.target.value].defaultJointInches);
                setPackSize(BRICK_PRESETS[e.target.value].defaultPackSize);
              }
            }}
            className="text-xs font-bold bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 shadow-2xs focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
          >
            <option value="us-modular">🇺🇸 US Modular (7⅝ × 3⅝ × 2¼ in) · ASTM C216</option>
            <option value="us-standard">🇺🇸 US Standard / Common (8 × 3¾ × 2¼ in)</option>
            <option value="us-king">🇺🇸 US King Size (9⅝ × 2⅝ × 2⅝ in)</option>
            <option value="us-queen">🇺🇸 US Queen Size (7⅝ × 2¾ × 2¾ in)</option>
            <option value="uk-standard">🇬🇧 UK Standard (215 × 102.5 × 65 mm) · BS EN 771</option>
            <option value="au-standard">🇦🇺 Australian Standard (230 × 110 × 76 mm) · AS 4455</option>
            <option value="in-modular">🇮🇳 Indian Modular (190 × 90 × 90 mm) · IS 1077</option>
            <option value="in-traditional">🇮🇳 Indian Traditional (9 × 4.5 × 3 in) · IS 2212</option>
            <option value="custom">⚙️ Custom Brick Dimensions...</option>
          </select>
        </div>

        <div className="text-[11px] font-medium text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
          Face Yield: <strong className="text-rose-700 font-mono">{formatNumber(result.bricksPerSqFtSingleWythe, 2)}</strong> bricks / sq ft
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="p-4 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Input Section (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Custom Dimension Fields (if custom preset) */}
          {presetId === 'custom' && (
            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3.5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-950 block">
                Custom Brick Unit Dimensions
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[10px] text-slate-600 block mb-1">Length (in)</Label>
                  <input
                    type="number"
                    min="1"
                    step="0.125"
                    value={customLength}
                    onChange={(e) => setCustomLength(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-slate-600 block mb-1">Width/Depth (in)</Label>
                  <input
                    type="number"
                    min="1"
                    step="0.125"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-slate-600 block mb-1">Height (in)</Label>
                  <input
                    type="number"
                    min="1"
                    step="0.125"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: QUICK BRICK COUNT */}
          {tab === 'quick' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Wall Dimensions & Openings
                  </Label>
                  <p className="text-[11px] text-slate-500">
                    Add multiple walls with window & door deductions
                  </p>
                </div>
                {walls.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddWall}
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Add Wall
                  </button>
                )}
              </div>

              {/* Walls List */}
              {walls.map((w, idx) => (
                <div
                  key={w.id}
                  className="bg-slate-50/90 border border-slate-200 rounded-xl p-3.5 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={w.name}
                      onChange={(e) => handleUpdateWall(w.id, 'name', e.target.value)}
                      className="text-xs font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-rose-500 focus:bg-white px-1 py-0.5 rounded focus:outline-none"
                    />

                    <div className="flex items-center gap-2">
                      <select
                        value={w.wythes}
                        onChange={(e) => handleUpdateWall(w.id, 'wythes', parseInt(e.target.value, 10))}
                        className="text-[11px] font-semibold bg-white border border-slate-300 rounded px-2 py-0.5"
                      >
                        <option value={1}>1 Wythe (Single Skin / Veneer)</option>
                        <option value={2}>2 Wythes (Solid Brick Wall)</option>
                      </select>

                      {walls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveWall(w.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove wall"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[11px] text-slate-600 font-semibold mb-1 block">
                        Length
                      </Label>
                      <div className="flex rounded-lg border border-slate-300 bg-white overflow-hidden shadow-2xs focus-within:ring-2 focus-within:ring-rose-500">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={w.length}
                          onChange={(e) =>
                            handleUpdateWall(w.id, 'length', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none font-mono"
                        />
                        <select
                          value={w.lengthUnit}
                          onChange={(e) =>
                            handleUpdateWall(w.id, 'lengthUnit', e.target.value as BrickUnit)
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
                        Height
                      </Label>
                      <div className="flex rounded-lg border border-slate-300 bg-white overflow-hidden shadow-2xs focus-within:ring-2 focus-within:ring-rose-500">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={w.height}
                          onChange={(e) =>
                            handleUpdateWall(w.id, 'height', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none font-mono"
                        />
                        <select
                          value={w.heightUnit}
                          onChange={(e) =>
                            handleUpdateWall(w.id, 'heightUnit', e.target.value as BrickUnit)
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

                  {/* Openings Deduction in this wall */}
                  <div className="border-t border-slate-200/80 pt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Openings (Windows / Doors)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddOpening(w.id)}
                        className="text-[10px] font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1"
                      >
                        <PlusCircle className="w-3 h-3" />
                        Add Opening
                      </button>
                    </div>

                    {w.openings.map((op) => (
                      <div
                        key={op.id}
                        className="grid grid-cols-12 gap-1.5 items-center bg-white p-2 rounded-lg border border-slate-200 text-xs"
                      >
                        <input
                          type="text"
                          value={op.label}
                          onChange={(e) => handleUpdateOpening(w.id, op.id, 'label', e.target.value)}
                          className="col-span-4 text-[11px] font-medium text-slate-700 border-b border-transparent focus:border-rose-400 focus:outline-none"
                        />
                        <div className="col-span-3 flex border rounded overflow-hidden">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={op.width}
                            onChange={(e) =>
                              handleUpdateOpening(w.id, op.id, 'width', parseFloat(e.target.value) || 0)
                            }
                            className="w-full px-1 text-[11px] font-mono text-center"
                            placeholder="W"
                          />
                          <span className="bg-slate-100 text-[10px] px-1 text-slate-500 border-l flex items-center">
                            ft
                          </span>
                        </div>
                        <div className="col-span-3 flex border rounded overflow-hidden">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={op.height}
                            onChange={(e) =>
                              handleUpdateOpening(w.id, op.id, 'height', parseFloat(e.target.value) || 0)
                            }
                            className="w-full px-1 text-[11px] font-mono text-center"
                            placeholder="H"
                          />
                          <span className="bg-slate-100 text-[10px] px-1 text-slate-500 border-l flex items-center">
                            ft
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveOpening(w.id, op.id)}
                          className="col-span-2 text-slate-400 hover:text-rose-600 p-1 flex justify-center"
                          title="Remove opening"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Mortar Joint & Wastage Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-slate-700">Joint Thickness</Label>
                    <span className="text-[11px] text-slate-500 font-mono">{jointThickness}"</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {JOINT_PRESETS.map((j) => (
                      <button
                        key={j.value}
                        type="button"
                        onClick={() => setJointThickness(j.value)}
                        className={`py-1 text-[10px] font-semibold rounded-md border transition-all ${
                          Math.abs(jointThickness - j.value) < 0.01
                            ? 'bg-rose-600 text-white border-rose-600 font-bold'
                            : 'bg-white text-slate-600 border-slate-300 hover:border-rose-400'
                        }`}
                      >
                        {j.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-slate-700">Cutting & Breakage</Label>
                    <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-[10px] font-mono">
                      +{wastePercent}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {WASTE_PRESETS.map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setWastePercent(pct)}
                        className={`py-1 text-[10px] font-semibold rounded-md border transition-all ${
                          wastePercent === pct
                            ? 'bg-rose-600 text-white border-rose-600 font-bold'
                            : 'bg-white text-slate-600 border-slate-300 hover:border-rose-400'
                        }`}
                      >
                        +{pct}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MORTAR MATERIALS */}
          {tab === 'mortar' && (
            <div className="space-y-4">
              <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200/80 space-y-2">
                <span className="text-xs font-bold text-rose-950 uppercase tracking-wider block">
                  Mortar Proportioning (ASTM C270 / IS 2250)
                </span>
                <p className="text-[11px] text-rose-900 leading-relaxed">
                  Select your mortar mix ratio to compute the exact cement bags and bulk sand tonnage required.
                </p>
              </div>

              <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <Label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Mortar Mix Ratio (Cement : Sand)
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: '1:3', label: '1 : 3 (Type M)', desc: 'High strength, below grade' },
                      { id: '1:4', label: '1 : 4 (Type S)', desc: 'General loadbearing / exterior' },
                      { id: '1:5', label: '1 : 5 (Type N)', desc: 'Residential veneer / standard' },
                      { id: '1:6', label: '1 : 6 (Type O)', desc: 'Interior non-loadbearing' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMortarMixRatio(m.id as any)}
                        className={`p-2.5 text-left rounded-lg border transition-all ${
                          mortarMixRatio === m.id
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-rose-300'
                        }`}
                      >
                        <div className="font-bold text-xs">{m.label}</div>
                        <div
                          className={`text-[10px] mt-0.5 ${
                            mortarMixRatio === m.id ? 'text-rose-100' : 'text-slate-500'
                          }`}
                        >
                          {m.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <Label className="text-[11px] text-slate-600 font-semibold mb-1 block">
                      Mortar Droppage Loss
                    </Label>
                    <select
                      value={mortarLossPercent}
                      onChange={(e) => setMortarLossPercent(parseInt(e.target.value, 10))}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                    >
                      <option value={5}>+5% (skilled crew)</option>
                      <option value={10}>+10% (standard)</option>
                      <option value={15}>+15% (DIY / high wall)</option>
                      <option value={20}>+20% (rough stone/cavity)</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-[11px] text-slate-600 font-semibold mb-1 block">
                      Pack / Pallet Size
                    </Label>
                    <input
                      type="number"
                      value={packSize}
                      onChange={(e) => setPackSize(parseInt(e.target.value, 10) || 500)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                      placeholder="500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROJECT BUDGET */}
          {tab === 'budget' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 text-xs">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Material & Installation Pricing
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] text-slate-600 block mb-1">Price per Brick ($)</Label>
                    <input
                      type="number"
                      step="0.05"
                      placeholder="0.65"
                      value={pricePerBrick}
                      onChange={(e) =>
                        setPricePerBrick(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] text-slate-600 block mb-1">
                      Mortar ($ / 80-lb bag)
                    </Label>
                    <input
                      type="number"
                      step="0.25"
                      placeholder="8.50"
                      value={pricePerPremixMortarBag}
                      onChange={(e) =>
                        setPricePerPremixMortarBag(
                          e.target.value === '' ? '' : parseFloat(e.target.value)
                        )
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] text-slate-600 block mb-1">
                      Masonry Labor ($ / sq ft)
                    </Label>
                    <input
                      type="number"
                      step="0.50"
                      placeholder="8.00"
                      value={laborCostPerSqFt}
                      onChange={(e) =>
                        setLaborCostPerSqFt(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] text-slate-600 block mb-1">Wall Ties / Anchors ($)</Label>
                    <input
                      type="number"
                      step="5"
                      placeholder="45"
                      value={wallTiesCost}
                      onChange={(e) =>
                        setWallTiesCost(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <Label className="text-[10px] text-slate-600 block mb-1">Delivery ($)</Label>
                    <input
                      type="number"
                      placeholder="100"
                      value={deliveryFee}
                      onChange={(e) =>
                        setDeliveryFee(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-slate-600 block mb-1">Tax (%)</Label>
                    <input
                      type="number"
                      placeholder="6"
                      value={taxPercent}
                      onChange={(e) =>
                        setTaxPercent(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-slate-600 block mb-1">Contingency (%)</Label>
                    <input
                      type="number"
                      placeholder="10"
                      value={contingencyPercent}
                      onChange={(e) =>
                        setContingencyPercent(
                          e.target.value === '' ? '' : parseFloat(e.target.value)
                        )
                      }
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
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
              className="flex-1 flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Save Brickwork Project
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
          {/* Hero Brick Order Card */}
          <div className="relative overflow-hidden rounded-2xl border border-rose-300/80 bg-gradient-to-br from-rose-50/70 via-white to-rose-50/30 p-5 sm:p-6 shadow-2xs">
            <div className="absolute top-0 right-0 w-44 h-44 bg-rose-400/15 rounded-full -translate-y-12 translate-x-12 blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-rose-900">
                  Total Bricks to Order
                </span>
                <Badge className="bg-rose-100 text-rose-900 border-rose-300 text-[10px]">
                  +{wastePercent}% cut & breakage margin
                </Badge>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-mono text-4xl sm:text-5xl font-black text-slate-900 tabular-nums tracking-tight leading-none">
                  {result.orderBricks.toLocaleString()}
                </span>
                <span className="text-xl font-bold text-slate-400">bricks</span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-xs text-slate-600 font-mono">
                <span>
                  Net wall count: <strong className="text-slate-800">{result.theoreticalBricks.toLocaleString()}</strong>
                </span>
                <span>•</span>
                <span>
                  Pallets / Cubes: <strong className="text-slate-800">{result.packsNeeded}</strong> ({result.packSize} / pack)
                </span>
              </div>
            </div>
          </div>

          {/* Area & Wythe Metrics Bento */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Net Wall Surface Area
              </span>
              <div className="font-mono text-xl font-bold text-slate-900">
                {formatNumber(result.totalNetAreaSqFt, 1)} <span className="text-xs font-normal text-slate-500">sq ft</span>
              </div>
              {result.totalOpeningsAreaSqFt > 0 && (
                <div className="text-[10px] text-slate-400 mt-1">
                  Deducted {formatNumber(result.totalOpeningsAreaSqFt, 1)} sq ft openings
                </div>
              )}
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Masonry Wall Volume
              </span>
              <div className="font-mono text-xl font-bold text-slate-900">
                {formatNumber(result.totalMasonryVolumeCuYd, 2)} <span className="text-xs font-normal text-slate-500">yd³</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {formatNumber(result.totalMasonryVolumeCuFt, 1)} cubic feet
              </div>
            </div>
          </div>

          {/* Per-Wall Breakdown (if multiple walls) */}
          {result.walls.length > 1 && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Per-Wall Takeoff
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-1.5 px-2">Wall</th>
                      <th className="py-1.5 px-2 text-center">Wythes</th>
                      <th className="py-1.5 px-2 text-right">Net Area</th>
                      <th className="py-1.5 px-2 text-right">Order Bricks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {result.walls.map((w) => (
                      <tr key={w.id}>
                        <td className="py-1.5 px-2 font-sans font-medium text-slate-800">{w.name}</td>
                        <td className="py-1.5 px-2 text-center">{w.wythes}</td>
                        <td className="py-1.5 px-2 text-right">{formatNumber(w.netAreaSqFt, 1)} sq ft</td>
                        <td className="py-1.5 px-2 text-right font-bold text-rose-700">{w.orderBricks.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mortar Materials Card */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Mortar Quantities ({result.cementParts}:{result.sandParts} Mix)
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                +{mortarLossPercent}% waste factor
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-rose-50/70 rounded-lg p-2.5 border border-rose-200">
                <div className="text-[10px] text-rose-900 font-bold uppercase tracking-wider">
                  Pre-Mixed Mortar (Option A)
                </div>
                <div className="font-mono text-xl font-black text-rose-950 mt-0.5">
                  {result.premixMortarBags80lb}{' '}
                  <span className="text-xs font-normal text-rose-800">bags (80-lb)</span>
                </div>
                <div className="text-[9px] text-rose-700 mt-0.5">Quikrete / Sakrete Type N or S</div>
              </div>

              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                <div className="text-[10px] text-slate-700 font-bold uppercase tracking-wider">
                  Bulk Cement & Sand (Option B)
                </div>
                <div className="font-mono text-sm font-bold text-slate-900 mt-1">
                  {result.cementBags94lb} bags <span className="text-[10px] text-slate-500 font-normal">cement</span>
                </div>
                <div className="font-mono text-sm font-bold text-slate-900">
                  {formatNumber(result.sandWeightTons, 2)} tons <span className="text-[10px] text-slate-500 font-normal">({formatNumber(result.sandVolumeCuYd, 2)} yd³ sand)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Educational Note */}
          <div className="p-3.5 rounded-xl text-xs flex gap-3 items-start border bg-rose-50/60 text-rose-950 border-rose-200">
            <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <strong className="block text-slate-900 mb-0.5">Mason's Rule of Thumb:</strong>
              <span className="leading-relaxed text-slate-700">
                For standard US Modular brickwork with 3/8" mortar joints, allow <strong>6.75 to 7.0 bricks per square foot</strong> of single-wythe wall. One 80-lb bag of pre-mixed mortar lays approximately <strong>30 to 35 bricks</strong>.
              </span>
            </div>
          </div>

          {/* Grand Total Cost Dashboard */}
          {result.hasCostData ? (
            <div className="bg-white rounded-2xl p-5 border-2 border-rose-400 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Estimated Project Cost
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
                    <div className="font-mono text-xl font-black text-rose-700">
                      ${formatNumber(result.costPerSqFt, 2)}
                    </div>
                  </div>
                )}
              </div>

              {/* Itemized breakdown table */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                  Cost Breakdown:
                </span>
                <div className="divide-y divide-slate-100 font-mono">
                  {result.brickSubtotal > 0 && (
                    <div className="flex justify-between py-1 text-slate-700">
                      <span>Bricks ({result.orderBricks.toLocaleString()} units)</span>
                      <span className="font-bold">${formatNumber(result.brickSubtotal, 2)}</span>
                    </div>
                  )}
                  {result.mortarSubtotal > 0 && (
                    <div className="flex justify-between py-1 text-slate-700">
                      <span>Mortar Materials</span>
                      <span className="font-bold">${formatNumber(result.mortarSubtotal, 2)}</span>
                    </div>
                  )}
                  {result.laborSubtotal > 0 && (
                    <div className="flex justify-between py-1 text-slate-700">
                      <span>Masonry Labor ({formatNumber(result.totalNetAreaSqFt, 0)} sq ft)</span>
                      <span className="font-bold">${formatNumber(result.laborSubtotal, 2)}</span>
                    </div>
                  )}
                  {result.wallTiesSubtotal > 0 && (
                    <div className="flex justify-between py-1 text-slate-700">
                      <span>Wall Ties & Accessories</span>
                      <span className="font-bold">${formatNumber(result.wallTiesSubtotal, 2)}</span>
                    </div>
                  )}
                  {result.deliverySubtotal > 0 && (
                    <div className="flex justify-between py-1 text-slate-700">
                      <span>Delivery Fee</span>
                      <span className="font-bold">${formatNumber(result.deliverySubtotal, 2)}</span>
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
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 space-y-1">
              <DollarSign className="w-5 h-5 mx-auto text-slate-400" />
              <span className="font-bold text-slate-700 block">Want a Cost Estimate?</span>
              <p>
                Open the <strong>Project Budget</strong> tab to add your local brick, mortar, and labor rates.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
