/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type QDMaterial = 'CdSe' | 'CdTe' | 'ZnS' | 'Carbon' | 'CuInS2';
export type HER2Level = 'low' | 'medium' | 'high';
export type ReleaseRate = 'slow' | 'medium' | 'fast';

export interface ResearchStudy {
  id: string;
  ref: string;
  material: QDMaterial;
  size: number;
  wavelength: number;
  target: string;
  result: string;
}

export interface SimulationInputs {
  material: QDMaterial;
  size: number; // in nm
  her2Level: HER2Level;
  bindingEfficiency: number; // 0-100
  drugCapacity: number; // 0-100
  releaseRate: ReleaseRate;
  // New parameters
  pH: number; // 5.0 - 7.4
  temperature: number; // 35 - 42 C
  immuneActivity: number; // 0-100 (Macrophage activity)
  offTargetRate: number; // 0-20%
}

export interface SimulationResults {
  bandGap: number; // eV
  wavelength: number; // nm
  intensity: number; // arbitrary units
  boundQDs: number; // estimated count
  internalizedQDs: number;
  offTargetBound: number;
  clearanceRate: number; // % per hour
  totalDrugReleased: number;
  killProbability: number;
  offTargetToxicity: number; // 0-1
  intrinsicToxicity: number; // 0-1 (based on material)
  quantumYield: number; // 0-1
  safetyScore: number; // 0-100
  stabilityIndex: number; // 0-100
  timeSeries: {
    time: number;
    released: number;
    offTargetReleased: number;
    killProb: number;
    remainingQDs: number;
    cancerBound: number;
    healthyBound: number;
  }[];
  wavelengthSeries: {
    size: number;
    wavelength: number;
  }[];
  intensitySeries: {
    concentration: number;
    intensity: number;
  }[];
  killDoseSeries: {
    dose: number;
    prob: number;
  }[];
  qySeries: {
    size: number;
    qy: number;
  }[];
}
