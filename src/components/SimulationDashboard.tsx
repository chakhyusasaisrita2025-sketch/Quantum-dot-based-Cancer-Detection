/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SimulationResults, SimulationInputs } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, ComposedChart
} from 'recharts';
import { Info, Lightbulb, Microscope, ShieldAlert, Target, Activity, Beaker, Zap, BookOpen } from 'lucide-react';
import { suggestOptimal } from '../utils/physics';
import { RESEARCH_STUDIES } from '../constants';
import { motion } from 'motion/react';

interface Props {
  results: SimulationResults;
  inputs: SimulationInputs;
}

const wavelengthToColor = (nm: number): string => {
  if (nm < 440) return '#8b00ff'; // Violet
  if (nm < 485) return '#0000ff'; // Blue
  if (nm < 500) return '#00ffff'; // Cyan
  if (nm < 565) return '#00ff00'; // Green
  if (nm < 590) return '#ffff00'; // Yellow
  if (nm < 625) return '#ff7f00'; // Orange
  if (nm <= 750) return '#ff0000'; // Red
  return '#4a0404'; // NIR
};

const CellImaging = ({ intensity, wavelength, her2Level }: { intensity: number, wavelength: number, her2Level: string }) => {
  const color = wavelengthToColor(wavelength);
  const receptorCount = her2Level === 'high' ? 40 : (her2Level === 'medium' ? 20 : 8);
  
  return (
    <div className="relative w-full h-64 bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(circle, #27272a 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      
      {/* Cancer Cell Body */}
      <motion.div 
        initial={{ scale: 0.9 }}
        animate={{ scale: [0.9, 0.92, 0.9] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-48 h-48 rounded-full bg-zinc-900 border-4 border-zinc-800 flex items-center justify-center shadow-2xl"
      >
        {/* Nucleus */}
        <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-zinc-700 opacity-50" />
        
        {/* Receptors & Fluorescence */}
        {Array.from({ length: receptorCount }).map((_, i) => {
          const angle = (i / receptorCount) * Math.PI * 2;
          const x = Math.cos(angle) * 92;
          const y = Math.sin(angle) * 92;
          
          return (
            <div key={i} className="absolute" style={{ transform: `translate(${x}px, ${y}px)` }}>
              {/* Receptor */}
              <div className="w-2 h-4 bg-zinc-700 rounded-t-full -translate-y-2" />
              
              {/* Fluorescence Glow */}
              <motion.div 
                animate={{ 
                  opacity: [intensity / 100 * 0.3, intensity / 100 * 0.8, intensity / 100 * 0.3],
                  scale: [1, 1.5, 1]
                }}
                transition={{ duration: 2 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full blur-md"
                style={{ backgroundColor: color }}
              />
              <div 
                className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                style={{ backgroundColor: color, opacity: intensity / 100 }}
              />
            </div>
          );
        })}
      </motion.div>

      {/* Label */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Fluorescence Signal</span>
        </div>
        <span className="text-xs font-mono text-zinc-400">λ: {wavelength.toFixed(0)}nm | Int: {intensity.toFixed(1)}%</span>
      </div>
      
      <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
        Microscope View (Simulated)
      </div>
    </div>
  );
};

const InVivoImaging = ({ results, inputs }: { results: SimulationResults, inputs: SimulationInputs }) => {
  const timePoints = [1, 6, 12, 24, 48];
  const color = wavelengthToColor(results.wavelength);

  const MouseIcon = ({ tumorIntensity, systemicIntensity }: { tumorIntensity: number, systemicIntensity: number }) => (
    <div className="relative w-16 h-24 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden border border-zinc-700">
      {/* Systemic Glow */}
      <div 
        className="absolute inset-0 blur-xl opacity-40"
        style={{ backgroundColor: color, transform: `scale(${0.5 + systemicIntensity * 1.5})` }}
      />
      {/* Tumor Site */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-zinc-600 border-dashed" />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full blur-sm"
        style={{ backgroundColor: color, opacity: tumorIntensity }}
      />
      {/* Mouse Shape Details */}
      <div className="absolute top-2 left-2 w-4 h-4 bg-zinc-800 rounded-full -translate-x-2" /> {/* Ear */}
      <div className="absolute top-2 right-2 w-4 h-4 bg-zinc-800 rounded-full translate-x-2" /> {/* Ear */}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-6 gap-2 items-center">
        <div className="text-[10px] font-bold text-zinc-500 uppercase">Time</div>
        {timePoints.map(t => <div key={t} className="text-center text-xs font-mono text-zinc-400">{t}h</div>)}
        
        <div className="text-[10px] font-bold text-emerald-400 uppercase leading-tight">Targeted<br/>QDs</div>
        {timePoints.map(t => {
          const data = results.timeSeries.find(d => d.time === t) || results.timeSeries[0];
          const tumorInt = data.cancerBound / 1000000;
          const systemicInt = data.healthyBound / 1000000;
          return (
            <div key={t} className="flex flex-col items-center gap-1">
              <MouseIcon tumorIntensity={tumorInt} systemicIntensity={systemicInt} />
            </div>
          );
        })}

        <div className="text-[10px] font-bold text-zinc-500 uppercase leading-tight">Free<br/>Dye</div>
        {timePoints.map(t => {
          // Simulate free dye: high initial systemic, rapid clearance, no tumor accumulation
          const systemicInt = Math.exp(-0.2 * t) * 0.8;
          const tumorInt = 0.05 * Math.exp(-0.2 * t);
          return (
            <div key={t} className="flex flex-col items-center gap-1">
              <MouseIcon tumorIntensity={tumorInt} systemicIntensity={systemicInt} />
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Signal Intensity</span>
          </div>
          <div className="h-2 w-32 bg-gradient-to-r from-zinc-900 via-emerald-900 to-rose-900 rounded-full border border-zinc-800" />
        </div>
        <p className="text-[10px] text-zinc-500 italic">
          *Targeted QDs show progressive accumulation in tumor site (dashed circle) compared to rapid clearance of free dye.
        </p>
      </div>
    </div>
  );
};

const HourlyDataBreakdown = ({ timeSeries }: { timeSeries: SimulationResults['timeSeries'] }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="text-emerald-400" size={18} />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Hourly Pharmacokinetic Breakdown</h3>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">0h - 48h Analysis</span>
      </div>
      <div className="max-h-80 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800 text-zinc-500 font-bold uppercase tracking-tighter">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Cancer Bound</th>
              <th className="p-3">Healthy Bound</th>
              <th className="p-3">Released</th>
              <th className="p-3">Kill Prob</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {timeSeries.map((d) => (
              <tr key={d.time} className="hover:bg-zinc-800/30 transition-colors">
                <td className="p-3 font-mono text-zinc-400">{d.time}h</td>
                <td className="p-3 font-mono text-emerald-400/80">{d.cancerBound.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td className="p-3 font-mono text-rose-400/80">{d.healthyBound.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td className="p-3 font-mono text-blue-400/80">{d.released.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td className="p-3 font-mono text-amber-400/80">{(d.killProb * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-zinc-900/50 border-t border-zinc-800 text-[10px] text-zinc-500 italic text-center">
        *Data points represent simulated real-time values based on current environmental and biological parameters.
      </div>
    </div>
  );
};

export const SimulationDashboard: React.FC<Props> = ({ results, inputs }) => {
  const suggestion = suggestOptimal(inputs);
  const matchedStudy = RESEARCH_STUDIES.find(s => s.material === inputs.material && Math.abs(s.size - inputs.size) < 1.0);

  return (
    <div className="flex-1 bg-zinc-950 p-8 overflow-y-auto space-y-8 text-zinc-300">
      {/* Matched Research Study Context */}
      {matchedStudy && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 flex gap-4 items-center animate-in fade-in slide-in-from-top-4 duration-500">
          <BookOpen className="text-emerald-400 shrink-0" size={32} />
          <div>
            <h3 className="text-emerald-400 font-bold flex items-center gap-2">
              Matched Research Study: {matchedStudy.ref}
            </h3>
            <p className="text-sm text-emerald-100/80 mt-1">
              <strong>Target:</strong> {matchedStudy.target} | <strong>Reported Result:</strong> {matchedStudy.result}
            </p>
          </div>
        </div>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Safety Score" value={`${results.safetyScore.toFixed(0)}/100`} sub="Clinical Safety" color={results.safetyScore > 70 ? 'text-emerald-400' : (results.safetyScore > 40 ? 'text-amber-400' : 'text-red-400')} />
        <StatCard label="Stability" value={`${results.stabilityIndex.toFixed(0)}%`} sub="Environmental" color={results.stabilityIndex > 80 ? 'text-emerald-400' : 'text-amber-400'} />
        <StatCard label="Wavelength" value={`${results.wavelength.toFixed(0)} nm`} sub="Emission Color" color="text-emerald-400" />
        <StatCard label="Kill Prob" value={`${(results.killProbability * 100).toFixed(1)}%`} sub="Therapeutic" color="text-rose-400" />
        <StatCard label="Off-Target" value={`${(results.offTargetToxicity * 100).toFixed(1)}%`} sub="Systemic Risk" color="text-amber-400" />
        <StatCard label="Intrinsic Tox" value={`${(results.intrinsicToxicity * 100).toFixed(1)}%`} sub="Material Safety" color={results.intrinsicToxicity > 0.5 ? 'text-red-400' : 'text-emerald-400'} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Microscope View */}
        <ChartContainer title="Cancer Cell Imaging (Fluorescence)" icon={<Microscope size={18} />}>
          <CellImaging 
            intensity={results.intensity} 
            wavelength={results.wavelength} 
            her2Level={inputs.her2Level} 
          />
        </ChartContainer>

        {/* Wavelength vs Size */}
        <ChartContainer title="Wavelength vs QD Size" icon={<Microscope size={18} />}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={results.wavelengthSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="size" label={{ value: 'Size (nm)', position: 'insideBottom', offset: -5, fill: '#71717a' }} stroke="#71717a" />
              <YAxis label={{ value: 'λ (nm)', angle: -90, position: 'insideLeft', fill: '#71717a' }} stroke="#71717a" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Line type="monotone" dataKey="wavelength" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Drug Release vs Time */}
        <ChartContainer title="Drug Release Kinetics" icon={<Activity size={18} />}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={results.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="time" label={{ value: 'Time (h)', position: 'insideBottom', offset: -5, fill: '#71717a' }} stroke="#71717a" />
              <YAxis label={{ value: 'Released', angle: -90, position: 'insideLeft', fill: '#71717a' }} stroke="#71717a" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }}
                itemStyle={{ color: '#f43f5e' }}
              />
              <Area type="monotone" dataKey="released" stroke="#f43f5e" fill="#f43f5e33" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Intensity vs HER2 */}
        <ChartContainer title="Fluorescence Intensity vs HER2" icon={<Target size={18} />}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={results.intensitySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="concentration" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Bar dataKey="intensity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Kill Prob vs Dose */}
        <ChartContainer title="Cell Kill Probability vs Dose" icon={<ShieldAlert size={18} />}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={results.killDoseSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="dose" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }}
                itemStyle={{ color: '#facc15' }}
              />
              <Line type="monotone" dataKey="prob" stroke="#facc15" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Targeting Specificity & Systemic Release */}
        <ChartContainer title="Targeting Specificity & Systemic Release" icon={<ShieldAlert size={18} />}>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={results.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="time" label={{ value: 'Time (h)', position: 'insideBottom', offset: -5, fill: '#71717a' }} stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }}
              />
              <Area type="monotone" dataKey="cancerBound" stackId="1" stroke="#10b981" fill="#10b98133" name="Cancer Bound" />
              <Area type="monotone" dataKey="healthyBound" stackId="1" stroke="#f43f5e" fill="#f43f5e33" name="Healthy Bound" />
              <Line type="monotone" dataKey="released" stroke="#3b82f6" strokeWidth={2} dot={false} name="Targeted Release" />
              <Line type="monotone" dataKey="offTargetReleased" stroke="#facc15" strokeWidth={2} dot={false} name="Systemic Release" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Quantum Yield vs Size */}
        <ChartContainer title="Quantum Yield vs QD Size" icon={<Beaker size={18} />}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={results.qySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="size" label={{ value: 'Size (nm)', position: 'insideBottom', offset: -5, fill: '#71717a' }} stroke="#71717a" />
              <YAxis label={{ value: 'QY (%)', angle: -90, position: 'insideLeft', fill: '#71717a' }} stroke="#71717a" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Line type="monotone" dataKey="qy" stroke="#10b981" strokeWidth={2} dot={false} name="Quantum Yield" />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Clinical Recommendation */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-6">
        <div className="flex items-center gap-3 text-white">
          <Activity className="text-emerald-400" size={24} />
          <h2 className="text-xl font-bold tracking-tight">In Vivo Imaging Time-Series (Simulated)</h2>
        </div>
        <InVivoImaging results={results} inputs={inputs} />
      </div>

      {/* In Vivo Imaging Analysis */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-6">
        <div className="flex items-center gap-3 text-white">
          <Microscope className="text-blue-400" size={24} />
          <h2 className="text-xl font-bold tracking-tight">In Vivo Imaging Analysis</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Comparative Biodistribution</h3>
                <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
                  <p>
                    <strong className="text-zinc-200">Targeted Accumulation:</strong> As seen in the 
                    <span className="text-emerald-400 font-mono mx-1">IR780/GQDs-FA</span> row of the reference data, 
                    functionalized quantum dots exhibit a "Targeting Effect." The signal progressively localizes 
                    within the tumor region (dashed circle) between 6h and 24h.
                  </p>
                  <p>
                    <strong className="text-zinc-200">Free Dye Limitation:</strong> In contrast, the 
                    <span className="text-rose-400 font-mono mx-1">Free IR780</span> control shows rapid systemic 
                    distribution followed by fast renal/hepatic clearance, with minimal tumor retention.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Signal-to-Noise Ratio (SNR)</h3>
                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-300">Targeted SNR (24h)</span>
                    <span className="text-xs font-mono text-emerald-400">High (8.4:1)</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-emerald-500" style={{ width: '85%' }} />
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-300">Free Dye SNR (24h)</span>
                    <span className="text-xs font-mono text-rose-400">Low (1.2:1)</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: '15%' }} />
                  </div>
                </div>
                <p className="text-xs text-zinc-500 italic">
                  *The simulation calculates that your current configuration yields an SNR of 
                  <span className="text-emerald-400 font-bold mx-1">
                    {(results.intensity / (results.offTargetToxicity * 100 + 1)).toFixed(1)}:1
                  </span> 
                  at the target site.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Scientific Takeaways</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-800">
                  <h4 className="text-xs font-bold text-zinc-300 mb-2 uppercase">1. Retention Time</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Conjugated QDs remain at the tumor site for {'>'}48h, providing a wide "surgical window" for 
                    fluorescence-guided resection.
                  </p>
                </div>
                <div className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-800">
                  <h4 className="text-xs font-bold text-zinc-300 mb-2 uppercase">2. Specificity</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    The FA (Folic Acid) or Antibody ligand ensures that the toxic payload is only internalized 
                    by cells overexpressing the target receptor.
                  </p>
                </div>
                <div className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-800">
                  <h4 className="text-xs font-bold text-zinc-300 mb-2 uppercase">3. NIR Penetration</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    The use of NIR-emitting QDs (like IR780 conjugates) allows for imaging through several 
                    centimeters of tissue with minimal interference.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <HourlyDataBreakdown timeSeries={results.timeSeries} />
          </div>
        </div>
      </div>

      {/* Clinical Recommendation */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-6">
        <div className="flex items-center gap-3 text-white">
          <ShieldAlert className="text-emerald-400" size={24} />
          <h2 className="text-xl font-bold tracking-tight">Clinical Optimization Report</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Stability Analysis</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Environmental Stability</span>
                <span className={results.stabilityIndex > 80 ? 'text-emerald-400' : 'text-amber-400'}>{results.stabilityIndex.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${results.stabilityIndex}%` }} />
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {results.stabilityIndex > 80 
                  ? "The system is highly stable under current pH and temperature conditions. Fluorescence quenching is minimal."
                  : "Stability is compromised. Deviations from physiological pH (7.4) or temperature (37°C) are affecting QD surface integrity."}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Safety Verdict</h3>
            <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${results.safetyScore > 70 ? 'bg-emerald-500' : (results.safetyScore > 40 ? 'bg-amber-500' : 'bg-red-500')}`} />
                <span className="font-bold text-white">
                  {results.safetyScore > 70 ? "Clinically Recommended" : (results.safetyScore > 40 ? "Caution Advised" : "High Risk - Not Recommended")}
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {inputs.material === 'Carbon' 
                  ? "Carbon QDs provide the highest safety profile. Combined with current parameters, the systemic risk is well-managed."
                  : "Heavy metal content (Cd) presents a long-term bioaccumulation risk. Switching to Carbon QDs is strongly advised for human trials."}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Practical Data Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DataPoint label="Optimal λ" value={`${results.wavelength.toFixed(0)} nm`} />
            <DataPoint label="Binding Target" value={`${results.boundQDs.toLocaleString()} QDs`} />
            <DataPoint label="pH Window" value={`${(inputs.pH - 0.5).toFixed(1)} - ${(inputs.pH + 0.5).toFixed(1)}`} />
            <DataPoint label="Safe Dose Limit" value={`${(50000 / results.internalizedQDs).toFixed(2)} units/QD`} />
          </div>
        </div>
      </div>

      {/* Mathematical Analysis Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-8">
        <div className="flex items-center gap-3 text-white">
          <Activity className="text-blue-400" size={24} />
          <h2 className="text-xl font-bold tracking-tight">Mathematical Analysis</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Quantum Confinement */}
          <div className="space-y-4">
            <h3 className="text-emerald-400 font-semibold flex items-center gap-2">
              <Zap size={16} /> 1. Quantum Confinement (Brus Equation)
            </h3>
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 font-mono text-xs overflow-x-auto">
              E_QD = E_bulk + [h² / (8R²)] * [1/m_e* + 1/m_h*] - [1.8e² / (4πε₀ε_rR)]
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded text-[10px] font-mono">
              <p className="text-emerald-400 mb-1">// Real-time Calculation ({inputs.material})</p>
              <p>R = {(inputs.size / 2).toFixed(2)} nm</p>
              <p>E_bulk = {results.bandGap.toFixed(2)} eV (Calculated)</p>
              <p>λ_peak = {results.wavelength.toFixed(0)} nm</p>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              <strong>Relevance:</strong> This equation models the size-dependent electronic properties of the nanoparticle. 
              In the simulation, it directly determines the <strong>Emission Wavelength</strong>. As the radius (R) decreases, 
              the confinement energy increases, shifting the emission towards the blue spectrum.
            </p>
            <ul className="text-xs text-zinc-500 space-y-1 grid grid-cols-2 gap-x-4">
              <li><strong>E_QD:</strong> Total energy gap (eV)</li>
              <li><strong>E_bulk:</strong> Bulk band gap energy</li>
              <li><strong>h:</strong> Planck's constant</li>
              <li><strong>R:</strong> Particle radius (nm)</li>
              <li><strong>m_e*, m_h*:</strong> Effective masses</li>
              <li><strong>ε₀, ε_r:</strong> Permittivity constants</li>
              <li><strong>e:</strong> Elementary charge</li>
            </ul>
          </div>

          {/* Cytotoxicity Kinetics */}
          <div className="space-y-4">
            <h3 className="text-rose-400 font-semibold flex items-center gap-2">
              <ShieldAlert size={16} /> 2. Therapeutic Efficacy (Hill Equation)
            </h3>
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 font-mono text-xs overflow-x-auto">
              P_kill = Dⁿ / (Kⁿ + Dⁿ)
            </div>
            <div className="bg-rose-500/5 border border-rose-500/10 p-3 rounded text-[10px] font-mono">
              <p className="text-rose-400 mb-1">// Real-time Calculation</p>
              <p>Effective Dose (D) = {results.totalDrugReleased.toFixed(0)} units</p>
              <p>IC50 (K) = 50,000 units</p>
              <p>P_kill = {(results.killProbability * 100).toFixed(1)}%</p>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              <strong>Relevance:</strong> Used to compute the <strong>Kill Probability</strong>. It represents the 
              pharmacodynamic response of cancer cells to the drug. The sigmoidal shape reflects the threshold 
              effect where a minimum concentration is required to initiate significant apoptosis.
            </p>
            <ul className="text-xs text-zinc-500 space-y-1 grid grid-cols-2 gap-x-4">
              <li><strong>P_kill:</strong> Death probability (0-1)</li>
              <li><strong>D:</strong> Effective drug + ROS dose</li>
              <li><strong>K:</strong> IC50 (Half-maximal dose)</li>
              <li><strong>n:</strong> Hill coefficient (Cooperativity)</li>
            </ul>
          </div>

          {/* Drug Release */}
          <div className="space-y-4">
            <h3 className="text-amber-400 font-semibold flex items-center gap-2">
              <Activity size={16} /> 3. Release & Clearance Kinetics
            </h3>
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 font-mono text-xs overflow-x-auto">
              D(t) = D_total * (1 - e⁻ᵏᵗ) * e⁻ᵞᵗ
            </div>
            <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded text-[10px] font-mono">
              <p className="text-amber-400 mb-1">// Real-time Calculation</p>
              <p>Clearance (γ) = {(results.clearanceRate * 100).toFixed(2)}%/h</p>
              <p>Release Rate (k) = {(results.totalDrugReleased / 50000).toFixed(3)} (Effective)</p>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              <strong>Relevance:</strong> Governs the <strong>Drug Release Curve</strong> and <strong>Clearance</strong>. 
              It models the temporal availability of the drug in the tumor site versus its removal by the 
              immune system (RES), defining the therapeutic window.
            </p>
            <ul className="text-xs text-zinc-500 space-y-1 grid grid-cols-2 gap-x-4">
              <li><strong>D(t):</strong> Cumulative release at time t</li>
              <li><strong>D_total:</strong> Max payload capacity</li>
              <li><strong>k:</strong> Release rate constant</li>
              <li><strong>γ:</strong> Clearance rate constant</li>
              <li><strong>t:</strong> Time (hours)</li>
            </ul>
          </div>

          {/* Environmental Modulation */}
          <div className="space-y-4">
            <h3 className="text-blue-400 font-semibold flex items-center gap-2">
              <Info size={16} /> 4. Environmental Sensitivity
            </h3>
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 font-mono text-xs overflow-x-auto">
              k_eff = k_base * [1 + ΔpH * 0.5] * [1 + ΔT * 0.2]
            </div>
            <div className="bg-blue-500/5 border border-blue-500/10 p-3 rounded text-[10px] font-mono">
              <p className="text-blue-400 mb-1">// Real-time Calculation</p>
              <p>ΔpH (7.4 - {inputs.pH.toFixed(1)}) = {(7.4 - inputs.pH).toFixed(1)}</p>
              <p>ΔT ({inputs.temperature.toFixed(1)} - 37) = {(inputs.temperature - 37).toFixed(1)}</p>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              <strong>Relevance:</strong> Modulates the <strong>Release Rate</strong> based on local conditions. 
              This simulates the "triggered release" mechanism where the acidic and hyperthermic tumor 
              microenvironment accelerates drug delivery compared to healthy tissue.
            </p>
            <ul className="text-xs text-zinc-500 space-y-1 grid grid-cols-2 gap-x-4">
              <li><strong>k_eff:</strong> Adjusted release rate</li>
              <li><strong>k_base:</strong> Baseline release rate</li>
              <li><strong>ΔpH:</strong> Deviation from pH 7.4</li>
              <li><strong>ΔT:</strong> Deviation from 37°C</li>
            </ul>
          </div>

          {/* Quantum Yield */}
          <div className="space-y-4">
            <h3 className="text-emerald-400 font-semibold flex items-center gap-2">
              <Beaker size={16} /> 5. Relative Quantum Yield (QY)
            </h3>
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 font-mono text-xs overflow-x-auto">
              Q_QD = Q_R * (m_QD / m_R) * (n² / n_R²)
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded text-[10px] font-mono">
              <p className="text-emerald-400 mb-1">// Real-time Calculation</p>
              <p>Reference QY (Q_R): 0.95 (Rhodamine 6G)</p>
              <p>Solvent Index (n): 1.33 (Physiological)</p>
              <p>Calculated Q_QD: {(results.quantumYield * 100).toFixed(1)}%</p>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              <strong>Relevance:</strong> Quantifies the efficiency of photon emission. It is a critical parameter for 
              <strong> Detection Sensitivity</strong>. A higher QY ensures that even low concentrations of HER2 
              receptors produce a detectable fluorescent signal above background noise.
            </p>
            <ul className="text-xs text-zinc-500 space-y-1 grid grid-cols-2 gap-x-4">
              <li><strong>Q_QD:</strong> Quantum yield of QD</li>
              <li><strong>Q_R:</strong> Reference quantum yield</li>
              <li><strong>m_QD, m_R:</strong> Fluorescence/Absorption slopes</li>
              <li><strong>n, n_R:</strong> Refractive indices</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Suggestion Box */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 flex gap-4 items-start">
        <Lightbulb className="text-emerald-400 shrink-0" size={24} />
        <div>
          <h3 className="text-emerald-400 font-semibold mb-1">Optimization Suggestion</h3>
          <p className="text-sm text-emerald-100/80 leading-relaxed">{suggestion}</p>
        </div>
      </div>

      {/* Scientific Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8 border-t border-zinc-800">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Info size={18} className="text-blue-400" />
            <h3>Environmental Factors</h3>
          </div>
          <p className="text-sm leading-relaxed text-zinc-400">
            Tumor microenvironments are often acidic (pH 6.5-6.8) and slightly hyperthermic. 
            Low pH can quench QD fluorescence by promoting surface oxidation, but it can also be 
            leveraged for <strong>pH-responsive drug release</strong>. Higher temperatures increase 
            molecular kinetic energy, accelerating drug diffusion and release rates.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <ShieldAlert size={18} className="text-amber-400" />
            <h3>Immune Response & Clearance</h3>
          </div>
          <p className="text-sm leading-relaxed text-zinc-400">
            The Reticuloendothelial System (RES), primarily macrophages in the liver and spleen, 
            recognizes nanoparticles as foreign. High <strong>immune activity</strong> leads to 
            rapid opsonization and clearance, reducing the therapeutic window. PEGylation or 
            zwitterionic coatings can create a "stealth" effect to mitigate this.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Target size={18} className="text-rose-400" />
            <h3>Off-Target Binding Risks</h3>
          </div>
          <p className="text-sm leading-relaxed text-zinc-400">
            Non-specific binding to healthy cells occurs due to electrostatic interactions or 
            low-level expression of target receptors elsewhere. This reduces <strong>specificity</strong> 
            and causes systemic toxicity. Strategies like dual-targeting or pre-targeting 
            can significantly enhance the signal-to-noise ratio in vivo.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Beaker size={18} className="text-emerald-400" />
            <h3>Carbon-Based Quantum Dots</h3>
          </div>
          <p className="text-sm leading-relaxed text-zinc-400">
            Unlike traditional semiconductor QDs (CdSe, CdTe) which contain toxic heavy metals, 
            <strong>Carbon QDs (CQDs)</strong> are made from carbon-rich precursors. They exhibit 
            excellent biocompatibility, low toxicity, and high water solubility. Their fluorescence 
            is highly tunable and they are increasingly preferred for <em>in vivo</em> imaging 
            and drug delivery applications due to their safety profile.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <BookOpen size={18} className="text-emerald-400" />
            <h3>Research Literature Insights</h3>
          </div>
          <div className="text-sm leading-relaxed text-zinc-400 space-y-3">
            <p>
              <strong className="text-zinc-200">NIR Advantage:</strong> Research indicates that larger QDs emitting in the 
              <strong> Near-Infrared (NIR)</strong> spectrum (e.g., Ref [23], [136]) are superior for <em>in vivo</em> 
              imaging due to reduced tissue autofluorescence and deeper penetration.
            </p>
            <p>
              <strong className="text-zinc-200">Size & Internalization:</strong> Smaller QDs (2-4 nm) exhibit faster 
              cellular internalization via endocytosis [21, 22], while larger conjugates (7-10 nm) provide 
              stronger signals for surface-level HER2 mapping.
            </p>
            <p>
              <strong className="text-zinc-200">Surface Engineering:</strong> The use of <strong>scFv antibodies</strong> 
              (Ref [120]) or <strong>PEGylation</strong> (Ref [132]) is critical for reducing non-specific 
              binding and enhancing the signal-to-noise ratio in complex biological environments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, sub, color = 'text-white' }: { label: string, value: string, sub: string, color?: string }) => (
  <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
    <p className={`text-2xl font-mono font-bold ${color}`}>{value}</p>
    <p className="text-[10px] text-zinc-600 mt-1">{sub}</p>
  </div>
);

const DataPoint = ({ label, value }: { label: string, value: string }) => (
  <div className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-800">
    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter mb-1">{label}</p>
    <p className="text-sm font-mono font-bold text-zinc-200">{value}</p>
  </div>
);

const ChartContainer = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
    <div className="flex items-center gap-2 text-zinc-400 font-medium text-sm">
      {icon}
      <span>{title}</span>
    </div>
    {children}
  </div>
);
