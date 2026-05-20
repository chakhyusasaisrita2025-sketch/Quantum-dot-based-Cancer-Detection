/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SimulationInputs, QDMaterial, HER2Level, ReleaseRate } from '../types';
import { Beaker, Target, Zap, Activity, BookOpen } from 'lucide-react';
import { RESEARCH_STUDIES } from '../constants';

interface Props {
  inputs: SimulationInputs;
  setInputs: (inputs: SimulationInputs) => void;
}

export const SimulationControls: React.FC<Props> = ({ inputs, setInputs }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: name === 'size' || name === 'bindingEfficiency' || name === 'drugCapacity' || name === 'pH' || name === 'temperature' || name === 'immuneActivity' || name === 'offTargetRate'
        ? parseFloat(value) 
        : value
    });
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const study = RESEARCH_STUDIES.find(s => s.id === e.target.value);
    if (study) {
      setInputs({
        ...inputs,
        material: study.material,
        size: study.size,
      });
    }
  };

  return (
    <div className="space-y-6 p-6 bg-zinc-900 border-r border-zinc-800 h-full overflow-y-auto text-zinc-300">
      <div className="flex items-center gap-2 mb-8">
        <Beaker className="text-emerald-500" size={24} />
        <h2 className="text-xl font-semibold tracking-tight text-white">Parameters</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 flex items-center gap-2">
            <BookOpen size={14} /> Research Presets
          </label>
          <select
            onChange={handlePresetChange}
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-emerald-400 font-medium"
          >
            <option value="">Manual Configuration</option>
            {RESEARCH_STUDIES.map(study => (
              <option key={study.id} value={study.id}>{study.ref}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 flex items-center gap-2">
            <Zap size={14} /> Material
          </label>
          <select
            name="material"
            value={inputs.material}
            onChange={handleChange}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="CdSe">CdSe (Cadmium Selenide)</option>
            <option value="CdTe">CdTe (Cadmium Telluride)</option>
            <option value="ZnS">ZnS (Zinc Sulfide)</option>
            <option value="Carbon">Carbon QDs (Biocompatible)</option>
            <option value="CuInS2">CuInS2 (NIR Biocompatible)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 flex items-center gap-2">
            <Activity size={14} /> Size (nm): {inputs.size}
          </label>
          <input
            type="range"
            name="size"
            min="2"
            max="10"
            step="0.1"
            value={inputs.size}
            onChange={handleChange}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 flex items-center gap-2">
            <Target size={14} /> HER2 Level
          </label>
          <select
            name="her2Level"
            value={inputs.her2Level}
            onChange={handleChange}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="low">Low (+1)</option>
            <option value="medium">Medium (+2)</option>
            <option value="high">High (+3)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 flex items-center gap-2">
            Binding Efficiency: {inputs.bindingEfficiency}%
          </label>
          <input
            type="range"
            name="bindingEfficiency"
            min="0"
            max="100"
            value={inputs.bindingEfficiency}
            onChange={handleChange}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 flex items-center gap-2">
            Drug Capacity: {inputs.drugCapacity}%
          </label>
          <input
            type="range"
            name="drugCapacity"
            min="0"
            max="100"
            value={inputs.drugCapacity}
            onChange={handleChange}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 flex items-center gap-2">
            Release Rate
          </label>
          <select
            name="releaseRate"
            value={inputs.releaseRate}
            onChange={handleChange}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="slow">Slow (Sustained)</option>
            <option value="medium">Medium</option>
            <option value="fast">Fast (Acute)</option>
          </select>
        </div>

        <div className="pt-4 border-t border-zinc-800 space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Environmental & Biological</h3>
          
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 flex justify-between">
              <span>pH Level</span>
              <span className="text-emerald-400">{inputs.pH.toFixed(1)}</span>
            </label>
            <input
              type="range"
              name="pH"
              min="5.0"
              max="7.4"
              step="0.1"
              value={inputs.pH}
              onChange={handleChange}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 flex justify-between">
              <span>Temperature (°C)</span>
              <span className="text-emerald-400">{inputs.temperature.toFixed(1)}</span>
            </label>
            <input
              type="range"
              name="temperature"
              min="35"
              max="42"
              step="0.5"
              value={inputs.temperature}
              onChange={handleChange}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 flex justify-between">
              <span>Immune Activity</span>
              <span className="text-emerald-400">{inputs.immuneActivity}%</span>
            </label>
            <input
              type="range"
              name="immuneActivity"
              min="0"
              max="100"
              value={inputs.immuneActivity}
              onChange={handleChange}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 flex justify-between">
              <span>Off-Target Rate</span>
              <span className="text-emerald-400">{inputs.offTargetRate}%</span>
            </label>
            <input
              type="range"
              name="offTargetRate"
              min="0"
              max="20"
              step="0.5"
              value={inputs.offTargetRate}
              onChange={handleChange}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-zinc-800">
        <p className="text-[10px] text-zinc-500 leading-relaxed">
          *Simulation based on the Brus equation for quantum confinement and Hill kinetics for cytotoxicity.
        </p>
      </div>
    </div>
  );
};
