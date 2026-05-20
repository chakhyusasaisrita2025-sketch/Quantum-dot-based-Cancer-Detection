/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { SimulationInputs, SimulationResults } from './types';
import { calculateSimulation } from './utils/physics';
import { SimulationControls } from './components/SimulationControls';
import { SimulationDashboard } from './components/SimulationDashboard';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [inputs, setInputs] = useState<SimulationInputs>({
    material: 'CdSe',
    size: 4.5,
    her2Level: 'medium',
    bindingEfficiency: 85,
    drugCapacity: 60,
    releaseRate: 'medium',
    pH: 7.4,
    temperature: 37.0,
    immuneActivity: 20,
    offTargetRate: 2.0,
  });

  const results = useMemo(() => calculateSimulation(inputs), [inputs]);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Sidebar Controls */}
      <motion.aside 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-80 shrink-0 z-10 shadow-2xl"
      >
        <SimulationControls inputs={inputs} setInputs={setInputs} />
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation / Header */}
        <header className="h-16 border-bottom border-zinc-800 bg-zinc-900/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="font-bold text-zinc-950 text-xl">N</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              NanoHeal <span className="text-zinc-500 font-medium">v1.0</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Simulation Engine
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <span>HER2 Breast Cancer Detection & Therapy</span>
          </div>
        </header>

        {/* Dashboard Content */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={JSON.stringify(inputs)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <SimulationDashboard results={results} inputs={inputs} />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
