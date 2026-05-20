/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CONSTANTS, MATERIAL_DATA, HER2_CONCENTRATIONS, RELEASE_K } from '../constants';
import { SimulationInputs, SimulationResults } from '../types';

export function calculateSimulation(inputs: SimulationInputs): SimulationResults {
  const { 
    material, size, her2Level, bindingEfficiency, drugCapacity, releaseRate,
    pH, temperature, immuneActivity, offTargetRate
  } = inputs;
  const props = MATERIAL_DATA[material];
  const R = (size / 2) * 1e-9; // radius in meters

  // 1. Band Gap Energy (Brus Equation)
  const term1 = props.egBulk;
  const invMass = (1 / (props.me * CONSTANTS.m0)) + (1 / (props.mh * CONSTANTS.m0));
  const term2 = (Math.pow(CONSTANTS.h, 2) / (8 * Math.pow(R, 2))) * invMass / CONSTANTS.e;
  const term3 = (1.8 * Math.pow(CONSTANTS.e, 2)) / (4 * Math.PI * CONSTANTS.eps0 * props.epsR * R) / CONSTANTS.e;
  
  const bandGap = term1 + term2 - term3;
  const wavelength = (CONSTANTS.h * CONSTANTS.c) / (bandGap * CONSTANTS.e) * 1e9;

  // 1.2. Quantum Yield (Relative to Rhodamine 6G)
  // Q_QD = Q_R * (m_QD / m_R) * (n^2 / n_R^2)
  // Assumptions for simulation:
  // Q_R (Rhodamine 6G) = 0.95
  // n (solvent) = 1.33 (Water/Physiological)
  // n_R (reference solvent) = 1.36 (Ethanol)
  const Q_R = 0.95;
  const n = 1.33;
  const n_R = 1.36;
  // Material-specific slope ratio (m_QD / m_R) - simplified for simulation
  const slopeRatio = material === 'CdSe' ? 0.7 : (material === 'CdTe' ? 0.6 : (material === 'ZnS' ? 0.4 : 0.5));
  const quantumYield = Q_R * slopeRatio * (Math.pow(n, 2) / Math.pow(n_R, 2));

  // 1.5. Intrinsic Toxicity
  // Heavy metal QDs are highly toxic. Carbon and ZnS are biocompatible.
  const intrinsicToxicity = material === 'CdSe' || material === 'CdTe' ? 0.85 : (material === 'ZnS' ? 0.15 : (material === 'CuInS2' ? 0.10 : 0.05));

  // 2. Environmental Effects on Fluorescence (Quenching)
  // pH quenching: lower pH (acidic tumor environment) can quench fluorescence
  // Temp quenching: higher temp increases non-radiative recombination
  const phFactor = Math.max(0.2, 1 - (7.4 - pH) * 0.3);
  const tempFactor = Math.max(0.5, 1 - (temperature - 37) * 0.05);
  const her2Conc = HER2_CONCENTRATIONS[her2Level];
  const efficiency = bindingEfficiency / 100;
  
  // NIR Advantage: Wavelengths > 700nm have less background interference
  const nirBoost = wavelength > 700 ? 1.4 : 1.0;
  const intensity = (her2Conc / 1000000) * efficiency * 100 * phFactor * tempFactor * nirBoost;

  // 3. Immune Response & Clearance
  // Macrophages clear QDs. Opsonization increases with immune activity.
  const clearanceRate = (immuneActivity / 100) * 0.1; // base clearance per hour

  // 4. Off-Target Binding
  // Research suggests high binding efficiency (better surface engineering) reduces off-target binding
  const effectiveOffTargetRate = offTargetRate * (1 - efficiency * 0.5);
  const totalInjected = 10000000; // arbitrary total QDs
  const offTargetBound = totalInjected * (effectiveOffTargetRate / 100);
  const boundQDs = her2Conc * efficiency;
  
  // Size-dependent Internalization: Smaller QDs (2-4 nm) enter cells faster (Ref [21, 22])
  const internalizationRate = size <= 4 ? 0.85 : (size <= 6 ? 0.7 : 0.5);
  const internalizedQDs = boundQDs * internalizationRate;

  // 5. Drug Delivery with pH/Temp sensitivity
  // Many drug delivery systems are pH-sensitive (faster release in acidic lysosomes)
  const phReleaseMultiplier = 1 + (7.4 - pH) * 0.5;
  const tempReleaseMultiplier = 1 + (temperature - 37) * 0.2;
  const baseK = RELEASE_K[releaseRate];
  const k = baseK * phReleaseMultiplier * tempReleaseMultiplier;

  const totalDrugPotential = internalizedQDs * (drugCapacity / 100) * 1000;
  const offTargetToxicityPotential = offTargetBound * (drugCapacity / 100) * 200; // Lower toxicity per QD but still significant

  const timeSeries = Array.from({ length: 48 }, (_, i) => {
    const t = i;
    // Clearance reduces available QDs over time
    const remainingFraction = Math.exp(-clearanceRate * t);
    const currentInternalized = internalizedQDs * remainingFraction;
    const currentOffTarget = offTargetBound * remainingFraction;

    const released = totalDrugPotential * (1 - Math.exp(-k * t)) * remainingFraction;
    const offTargetReleased = offTargetToxicityPotential * (1 - Math.exp(-k * t)) * remainingFraction;

    const rosEffect = currentInternalized * 0.00001;
    const effectiveDose = released + rosEffect;
    const killProb = Math.min(0.99, (Math.pow(effectiveDose, 2) / (Math.pow(effectiveDose, 2) + Math.pow(50000, 2))));
    
    return { 
      time: t, 
      released, 
      offTargetReleased,
      killProb, 
      remainingQDs: remainingFraction * 100,
      cancerBound: currentInternalized,
      healthyBound: currentOffTarget
    };
  });

  const totalDrugReleased = timeSeries[timeSeries.length - 1].released;
  const killProbability = timeSeries[timeSeries.length - 1].killProb;
  const offTargetToxicity = Math.min(1, (offTargetBound * (drugCapacity / 100)) / 500000);

  // 5.5. Clinical Safety & Stability Metrics
  // Safety Score (0-100)
  let sScore = 50; // Base
  if (material === 'Carbon') sScore += 40;
  if (material === 'ZnS') sScore += 10;
  if (material === 'CdSe' || material === 'CdTe') sScore -= 40;
  sScore -= (offTargetRate * 2);
  sScore -= (intrinsicToxicity * 20);
  const safetyScore = Math.max(0, Math.min(100, sScore));

  // Stability Index (0-100)
  let stab = 100;
  stab -= Math.abs(7.4 - pH) * 15;
  stab -= Math.abs(37 - temperature) * 8;
  if (material === 'Carbon') stab += 5; // Carbon dots are exceptionally stable
  const stabilityIndex = Math.max(0, Math.min(100, stab));

  // 6. Series for Graphs
  const wavelengthSeries = Array.from({ length: 20 }, (_, i) => {
    const s = 2 + i * 0.5;
    const r = (s / 2) * 1e-9;
    const t2 = (Math.pow(CONSTANTS.h, 2) / (8 * Math.pow(r, 2))) * invMass / CONSTANTS.e;
    const t3 = (1.8 * Math.pow(CONSTANTS.e, 2)) / (4 * Math.PI * CONSTANTS.eps0 * props.epsR * r) / CONSTANTS.e;
    const bg = props.egBulk + t2 - t3;
    const wl = (CONSTANTS.h * CONSTANTS.c) / (bg * CONSTANTS.e) * 1e9;
    return { size: s, wavelength: wl };
  });

  const intensitySeries = [
    { concentration: 10000, intensity: (10000 / 1000000) * efficiency * 100 * phFactor * tempFactor },
    { concentration: 100000, intensity: (100000 / 1000000) * efficiency * 100 * phFactor * tempFactor },
    { concentration: 500000, intensity: (500000 / 1000000) * efficiency * 100 * phFactor * tempFactor },
    { concentration: 1000000, intensity: (1000000 / 1000000) * efficiency * 100 * phFactor * tempFactor },
    { concentration: 2000000, intensity: (2000000 / 1000000) * efficiency * 100 * phFactor * tempFactor },
  ];

  const killDoseSeries = Array.from({ length: 20 }, (_, i) => {
    const dose = i * 10000;
    const prob = Math.min(0.99, (Math.pow(dose, 2) / (Math.pow(dose, 2) + Math.pow(50000, 2))));
    return { dose, prob };
  });

  const qySeries = Array.from({ length: 20 }, (_, i) => {
    const s = 2 + i * 0.5;
    // QY often increases with size up to a point as surface-to-volume ratio decreases (fewer surface traps)
    const sizeEffect = Math.min(1.2, 0.5 + (s / 10)); 
    const baseQY = Q_R * slopeRatio * (Math.pow(n, 2) / Math.pow(n_R, 2)) * sizeEffect;
    // Apply environmental quenching to the series as well
    const qy = baseQY * phFactor * tempFactor;
    return { size: s, qy: qy * 100 };
  });

  return {
    bandGap,
    wavelength,
    intensity,
    boundQDs,
    internalizedQDs,
    offTargetBound,
    clearanceRate,
    totalDrugReleased,
    killProbability,
    offTargetToxicity,
    intrinsicToxicity,
    quantumYield,
    safetyScore,
    stabilityIndex,
    timeSeries,
    wavelengthSeries,
    intensitySeries,
    killDoseSeries,
    qySeries,
  };
}

export function suggestOptimal(inputs: SimulationInputs) {
  const suggestions = [];
  
  if (inputs.pH > 6.8) {
    suggestions.push("The tumor environment is relatively neutral. Consider using pH-sensitive coatings that trigger drug release at slightly lower pH values (e.g., 6.5) to improve specificity.");
  } else {
    suggestions.push("Acidic tumor environment detected. Ensure QD surface chemistry is stable at low pH to prevent premature quenching.");
  }

  if (inputs.immuneActivity > 50) {
    suggestions.push("High immune activity detected. PEGylation (polyethylene glycol coating) is recommended to reduce opsonization and extend circulation time.");
  }

  if (inputs.offTargetRate > 5) {
    suggestions.push("Significant off-target binding. Consider dual-targeting (e.g., HER2 + EGFR) or using 'stealth' nanoparticles to minimize non-specific interactions.");
  }

  if (inputs.material === 'CdSe' || inputs.material === 'CdTe') {
    suggestions.push("Heavy metal QDs detected. While excellent for imaging, they pose significant toxicity risks. Consider switching to Carbon-based QDs for better biocompatibility.");
  }

  if (inputs.material === 'Carbon' || inputs.material === 'CuInS2') {
    suggestions.push(`${inputs.material} QDs are highly biocompatible and non-toxic, making them ideal for in vivo therapeutic applications.`);
  }

  if (inputs.size <= 4) {
    suggestions.push("Small QD size (≤4nm) promotes faster cellular internalization via endocytosis, enhancing drug delivery speed.");
  } else if (inputs.size >= 7) {
    suggestions.push("Large QD size (≥7nm) is excellent for surface mapping and NIR emission, but may have slower internalization rates.");
  }

  if (inputs.material === 'CdSe' && inputs.size >= 4 && inputs.size <= 6) {
    suggestions.push("QD size and material are well-suited for visible detection.");
  }
  
  return suggestions.join(" ");
}
