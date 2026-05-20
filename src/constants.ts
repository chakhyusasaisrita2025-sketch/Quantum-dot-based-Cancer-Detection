/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QDMaterial } from './types';

export const CONSTANTS = {
  h: 6.626e-34, // Planck's constant (J*s)
  c: 3.0e8,     // Speed of light (m/s)
  e: 1.602e-19, // Elementary charge (C)
  m0: 9.109e-31, // Electron rest mass (kg)
  eps0: 8.854e-12, // Vacuum permittivity (F/m)
};

export interface MaterialProperties {
  egBulk: number; // eV
  me: number;     // effective mass of electron (relative to m0)
  mh: number;     // effective mass of hole (relative to m0)
  epsR: number;   // relative dielectric constant
}

export const MATERIAL_DATA: Record<QDMaterial, MaterialProperties> = {
  CdSe: {
    egBulk: 1.74,
    me: 0.13,
    mh: 0.45,
    epsR: 10.6,
  },
  CdTe: {
    egBulk: 1.44,
    me: 0.11,
    mh: 0.40,
    epsR: 10.2,
  },
  ZnS: {
    egBulk: 3.68,
    me: 0.34,
    mh: 0.23,
    epsR: 8.9,
  },
  Carbon: {
    egBulk: 2.10, // Typical for carbon dots
    me: 0.20,
    mh: 0.25,
    epsR: 5.0, // Lower dielectric constant for carbon
  },
  CuInS2: {
    egBulk: 1.50,
    me: 0.16,
    mh: 1.30,
    epsR: 10.2,
  },
};

export const RESEARCH_STUDIES: any[] = [
  {
    id: 'ref124',
    ref: '[124] Brazil (2013)',
    material: 'CdTe',
    size: 3.0,
    wavelength: 644,
    target: 'Transformed tissues',
    result: 'Manipulation of QD surface can lead to molecular probes for early cancer detection.',
  },
  {
    id: 'ref128',
    ref: '[128] China (2012)',
    material: 'CdSe',
    size: 4.0,
    wavelength: 590,
    target: 'MDA-MB-231',
    result: 'QDs have different applications in imaging of cancer cells and therapeutic purposes.',
  },
  {
    id: 'ref132',
    ref: '[132] Iran (2013)',
    material: 'CdSe',
    size: 6.0,
    wavelength: 510,
    target: 'SKBR-3',
    result: 'Appropriate wavelength can stimulate QDs to act as agents for early detection of cancer cell growth.',
  },
  {
    id: 'ref136',
    ref: '[136] China (2020)',
    material: 'CuInS2',
    size: 4.0,
    wavelength: 741,
    target: 'SK-BR-3 and MDA-MB-231',
    result: 'NIR-emitting QDs are highly effective for screening cells that have HER-2 overexpression.',
  },
  {
    id: 'ref23',
    ref: '[23] China (2016)',
    material: 'CdSe',
    size: 7.5,
    wavelength: 705,
    target: 'Breast cancer specimens',
    result: 'Combination of QDs and IHC is a factor for early cancer diagnosis and treatment.',
  },
];

export const HER2_CONCENTRATIONS = {
  low: 10000,    // receptors per cell
  medium: 100000,
  high: 1000000,
};

export const RELEASE_K = {
  slow: 0.05,
  medium: 0.15,
  fast: 0.4,
};
