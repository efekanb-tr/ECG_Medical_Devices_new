import React, { useState } from 'react';
import {
  ArrowRight,
  Upload,
  RotateCcw,
  Cpu,
  UserCheck,
  ShieldCheck,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  Table,
} from 'lucide-react';

interface ThreeDeviceExplorerProps {
  onCompleteZoomToSimulator: () => void;
}

export interface ElectrodeSpec {
  id:
    | 'RA'
    | 'LA'
    | 'RL'
    | 'LL'
    | 'V1'
    | 'V2'
    | 'V3'
    | 'V4'
    | 'V5'
    | 'V6'
    | 'V3R'
    | 'V4R'
    | 'V5R'
    | 'V7'
    | 'V8'
    | 'V9';
  code: string;
  fullName: string;
  colorName: string;
  hexColor: string;
  textColor: string;
  isSynthesized?: boolean;
  category:
    | 'Limb Lead (Frontal Plane)'
    | 'Reference / Ground'
    | 'Precordial Chest Lead (Horizontal Plane)'
    | 'synECi18 Right Ventricular Lead (Synthesized)'
    | 'synECi18 Posterior Wall Lead (Synthesized)';
  anatomicalPlacement: string;
  electricalRole: string;
  baxterEc12Specs: string;
  everydayAnalogy: string;
  svgX: number;
  svgY: number;
}

export const TEN_ELECTRODES: ElectrodeSpec[] = [
  {
    id: 'RA',
    code: 'RA',
    fullName: 'Right Arm Electrode',
    colorName: 'Red (IEC) / White (AHA)',
    hexColor: '#DC2626',
    textColor: '#FFFFFF',
    category: 'Limb Lead (Frontal Plane)',
    anatomicalPlacement:
      'Right wrist or right deltoid/infraclavicular fossa (avoiding thick skeletal muscle mass to minimize EMG noise).',
    electricalRole:
      'Negative (−) inverting input for Einthoven Lead I and Lead II, positive (+) pole for augmented lead aVR, and sums into Wilson’s Central Terminal (WCT).',
    baxterEc12Specs:
      'Baxter Tab Ref 108071 (24h Solid Hydrogel): 10 Hz ACZ = 728–806 Ω, DC offset = 0.2–0.52 mV | Baxter Snap Ref 108070 (72h Wet Gel): 10 Hz ACZ = 58–93 Ω, DC offset = 0.2–0.5 mV.',
    everydayAnalogy:
      'Acts like the "North-West" anchor post of Einthoven’s surveying triangle—measuring how far the electrical heartbeat wave travels away from the right shoulder.',
    svgX: 82,
    svgY: 112,
  },
  {
    id: 'LA',
    code: 'LA',
    fullName: 'Left Arm Electrode',
    colorName: 'Yellow (IEC) / Black (AHA)',
    hexColor: '#EAB308',
    textColor: '#09318D',
    category: 'Limb Lead (Frontal Plane)',
    anatomicalPlacement:
      'Left wrist or left deltoid/infraclavicular fossa, symmetric with the Right Arm (RA) electrode.',
    electricalRole:
      'Positive (+) non-inverting input for Lead I (0°), negative (−) inverting input for Lead III (+120°), positive (+) pole for aVL, and sums into Wilson’s Central Terminal.',
    baxterEc12Specs:
      'Mixing a dry Tab (Ref 108071: 728–806 Ω) on LA with a wet Snap (Ref 108070: 58–93 Ω) on RA creates ΔZe impedance mismatch, letting 50 Hz hum bypass amplifier CMRR.',
    everydayAnalogy:
      'Acts like the "North-East" camera post—comparing it against RA measures horizontal left-to-right heart activity (Lead I at 0°).',
    svgX: 318,
    svgY: 112,
  },
  {
    id: 'LL',
    code: 'LL',
    fullName: 'Left Leg Electrode',
    colorName: 'Green (IEC) / Red (AHA)',
    hexColor: '#16A34A',
    textColor: '#FFFFFF',
    category: 'Limb Lead (Frontal Plane)',
    anatomicalPlacement:
      'Left lower ankle (medial/lateral malleolus) or left lower abdominal iliac crest in Mason-Likar monitoring setups.',
    electricalRole:
      'Positive (+) non-inverting input for both Lead II (+60°) and Lead III (+120°), positive (+) pole for inferior lead aVF (+90°), and completes Wilson’s Central Terminal.',
    baxterEc12Specs:
      'Baxter Ref 108071 Tab: Post-defib ACZ = 772 Ω, SDR < 0.6 mV/s, COIIN = 15–18 µV | Baxter Ref 108070 Snap: Post-defib ACZ = 48 Ω, SDR = 0.2–0.3 mV/s, COIIN = 18–20 µV.',
    everydayAnalogy:
      'The "South" apex of Einthoven’s triangle. Because the heart’s main wave travels downward at +60°, LL sees the wave coming head-on, making Lead II the tallest upright trace.',
    svgX: 286,
    svgY: 368,
  },
  {
    id: 'RL',
    code: 'RL',
    fullName: 'Right Leg (Driven Right Leg Reference)',
    colorName: 'Black (IEC) / Green (AHA)',
    hexColor: '#0F172A',
    textColor: '#FFFFFF',
    category: 'Reference / Ground',
    anatomicalPlacement:
      'Right lower ankle or right lower abdominal iliac crest, opposite the Left Leg (LL) electrode.',
    electricalRole:
      'Active Driven Right Leg (RLD) reference output: senses average common-mode voltage (Vcm) on RA/LA/LL, inverts its phase, and drives microampere cancellation current back into the body.',
    baxterEc12Specs:
      'Low contact impedance (Baxter Snap Ref 108070: 58–93 Ω @ 10 Hz) maximizes RLD common-mode loop feedback efficiency while Type CF resistors limit fault current to < 10 µA NC.',
    everydayAnalogy:
      'Like the active noise-canceling speaker inside headphones—it listens to the 50 Hz room hum on your body and plays the exact opposite wave into your right leg.',
    svgX: 114,
    svgY: 368,
  },
  {
    id: 'V1',
    code: 'V1',
    fullName: 'Precordial Chest Lead V1',
    colorName: 'Chest 1 (Red/Pink)',
    hexColor: '#FD91CC',
    textColor: '#09318D',
    category: 'Precordial Chest Lead (Horizontal Plane)',
    anatomicalPlacement:
      '4th intercostal space (between ribs 4 and 5) immediately to the RIGHT of the sternal border.',
    electricalRole:
      'Unipolar chest lead referenced against Wilson’s Central Terminal (WCT). Inspects the right atrium, right ventricle, and anterior interventricular septum (rS complex).',
    baxterEc12Specs:
      'Baxter Resting Tab (Ref 108071, 25×23 mm): 10 Hz ACZ = 728–806 Ω, DC offset = 0.2–0.52 mV, Bias tolerance < 1.0 mV, ISO 10993 biocompatible.',
    everydayAnalogy:
      'A window looking at the heart from the front-right side—because the powerful left ventricle contracts away from V1 toward the left back, V1 sees mostly a downward S-wave.',
    svgX: 178,
    svgY: 176,
  },
  {
    id: 'V2',
    code: 'V2',
    fullName: 'Precordial Chest Lead V2',
    colorName: 'Chest 2 (Yellow/Pink)',
    hexColor: '#FD91CC',
    textColor: '#09318D',
    category: 'Precordial Chest Lead (Horizontal Plane)',
    anatomicalPlacement:
      '4th intercostal space (between ribs 4 and 5) immediately to the LEFT of the sternal border.',
    electricalRole:
      'Unipolar chest lead referenced to WCT. Overlies the interventricular septum and right ventricular outflow tract; reaches −3.2 mV deep S-wave in Suharinto (2020) ECGSIM arrays.',
    baxterEc12Specs:
      'Baxter Resting Tab (Ref 108071): 10 Hz ACZ = 728–806 Ω, COIIN = 15–18 µV | Baxter Snap (Ref 108070): 10 Hz ACZ = 58–93 Ω, COIIN = 18–20 µV.',
    everydayAnalogy:
      'Placed right across the breastbone from V1—together, V1 and V2 act like stereo microphones listening to the muscular dividing wall (septum) of the heart.',
    svgX: 218,
    svgY: 176,
  },
  {
    id: 'V3',
    code: 'V3',
    fullName: 'Precordial Chest Lead V3',
    colorName: 'Chest 3 (Green/Pink)',
    hexColor: '#FD91CC',
    textColor: '#09318D',
    category: 'Precordial Chest Lead (Horizontal Plane)',
    anatomicalPlacement:
      'Placed diagonally midway on a straight line connecting electrode V2 and electrode V4 (over the 5th rib).',
    electricalRole:
      'Unipolar chest lead viewing the anterior wall of the left ventricle. Marks the typical "transition zone" where R-wave and S-wave become roughly equal (isodiphasic RS).',
    baxterEc12Specs:
      'Baxter Resting Tab (Ref 108071, 25×23 mm compact footprint prevents hydrogel bridging between adjacent chest leads V2–V4 on small thoraces).',
    everydayAnalogy:
      'The halfway bridge between the breastbone (V2) and the heart’s tip (V4), capturing the exact spot where the heartbeat wave switches from pointing away to pointing toward the sensor.',
    svgX: 232,
    svgY: 196,
  },
  {
    id: 'V4',
    code: 'V4',
    fullName: 'Precordial Chest Lead V4',
    colorName: 'Chest 4 (Blue/Pink)',
    hexColor: '#FD91CC',
    textColor: '#09318D',
    category: 'Precordial Chest Lead (Horizontal Plane)',
    anatomicalPlacement:
      '5th intercostal space (between ribs 5 and 6) along the left mid-clavicular line (directly below the center of the left collarbone).',
    electricalRole:
      'Unipolar chest lead positioned directly over the anatomical apex of the left ventricle. Records strong positive R-waves and is critical for diagnosing anterior STEMI.',
    baxterEc12Specs:
      'Baxter Ref 108071 Tab: ACZ 728–806 Ω, SDR < 0.6 mV/s | Baxter Ref 108070 Snap: ACZ 58–93 Ω, SDR 0.2–0.3 mV/s.',
    everydayAnalogy:
      'Sits right over the "point" (apex) of the heart where the doctor places a stethoscope—giving a front-row seat to the main pumping chamber.',
    svgX: 248,
    svgY: 214,
  },
  {
    id: 'V5',
    code: 'V5',
    fullName: 'Precordial Chest Lead V5',
    colorName: 'Chest 5 (Orange/Pink)',
    hexColor: '#FD91CC',
    textColor: '#09318D',
    category: 'Precordial Chest Lead (Horizontal Plane)',
    anatomicalPlacement:
      'Horizontal level with V4 (5th intercostal space) along the left anterior axillary line (front fold of the left armpit).',
    electricalRole:
      'Unipolar chest lead inspecting the anterolateral wall of the left ventricle; reaches +1.3 mV maximum positive peak in Suharinto (2020) ECGSIM arrays.',
    baxterEc12Specs:
      'Baxter Ref 108071 Tab: DC Offset 0.2–0.52 mV | Baxter Ref 108070 Snap: DC Offset 0.2–0.5 mV (ANSI/AAMI EC12 limit ≤ 100 mV).',
    everydayAnalogy:
      'Wraps around the left side of the ribcage so clinicians can check whether blood flow to the left outer wall of the heart muscle is healthy.',
    svgX: 266,
    svgY: 212,
  },
  {
    id: 'V6',
    code: 'V6',
    fullName: 'Precordial Chest Lead V6',
    colorName: 'Chest 6 (Violet/Pink)',
    hexColor: '#FD91CC',
    textColor: '#09318D',
    category: 'Precordial Chest Lead (Horizontal Plane)',
    anatomicalPlacement:
      'Horizontal level with V4 and V5 (5th intercostal space) along the left mid-axillary line (directly under the center of the left armpit).',
    electricalRole:
      'Unipolar chest lead viewing the lateral wall of the left ventricle in the horizontal plane, complementing frontal leads I and aVL.',
    baxterEc12Specs:
      'Baxter Ref 108071 Tab (24h Solid Hydrogel) or Ref 108070 Snap (72h Wet Gel, 38 mm Teardrop with Ag/AgCl ABS sensor + stainless steel stud).',
    everydayAnalogy:
      'The far-left side camera directly under the armpit—completing a full 180-degree wrap-around panorama of the left chest from V1 to V6.',
    svgX: 282,
    svgY: 204,
  },
];

export const SYN_ECI18_ELECTRODES: ElectrodeSpec[] = [
  {
    id: 'V3R',
    code: 'V3R',
    fullName: 'Synthesized Right Precordial Lead syn-V3R',
    colorName: 'Nihon Kohden synECi18 (Right Chest)',
    hexColor: '#09318D',
    textColor: '#FD91CC',
    isSynthesized: true,
    category: 'synECi18 Right Ventricular Lead (Synthesized)',
    anatomicalPlacement:
      'Virtual right-chest position: midway between V1 and V4R on the right anterior thorax (mirror image of standard V3).',
    electricalRole:
      'Mathematically synthesized by Nihon Kohden Cardiofax M ECG-3350 (synECi18) from standard 12-lead vectors to detect Right Ventricular Myocardial Infarction (RVMI) without moving physical pads.',
    baxterEc12Specs:
      'Zero additional physical electrodes required! Computed via linear transfer matrix from the 10 standard Ag/AgCl electrodes (RA, LA, LL, RL, V1–V6).',
    everydayAnalogy:
      'A virtual camera computed by software on the right side of the chest—catching right-sided heart attacks that standard left-sided chest leads (V1–V6) look away from.',
    svgX: 162,
    svgY: 196,
  },
  {
    id: 'V4R',
    code: 'V4R',
    fullName: 'Synthesized Right Precordial Lead syn-V4R',
    colorName: 'Nihon Kohden synECi18 (Right Mid-Clavicular)',
    hexColor: '#09318D',
    textColor: '#FD91CC',
    isSynthesized: true,
    category: 'synECi18 Right Ventricular Lead (Synthesized)',
    anatomicalPlacement:
      'Virtual right-chest position: 5th intercostal space along the RIGHT mid-clavicular line (exact mirror image of V4).',
    electricalRole:
      'Gold-standard lead for diagnosing acute Right Ventricular Infarction (ST elevation ≥ 0.1 mV in V4R). Synthesized instantaneously by Nihon Kohden synECi18 from standard 12-lead waveforms.',
    baxterEc12Specs:
      'Synthesized digitally in 10 seconds from standard 12-lead acquisition—eliminating electrode placement delay and ΔZe mismatch from extra physical chest pads.',
    everydayAnalogy:
      'The single most important right-heart camera angle, reconstructed mathematically from the standard 12 leads.',
    svgX: 146,
    svgY: 214,
  },
  {
    id: 'V5R',
    code: 'V5R',
    fullName: 'Synthesized Right Precordial Lead syn-V5R',
    colorName: 'Nihon Kohden synECi18 (Right Anterior Axillary)',
    hexColor: '#09318D',
    textColor: '#FD91CC',
    isSynthesized: true,
    category: 'synECi18 Right Ventricular Lead (Synthesized)',
    anatomicalPlacement:
      'Virtual right-chest position: 5th intercostal space along the RIGHT anterior axillary line (mirror image of V5).',
    electricalRole:
      'Completes the right-ventricular horizontal plane view (syn-V3R, syn-V4R, syn-V5R) in Nihon Kohden Cardiofax M ECG-3350 and Philips DXL 16/18-lead workflows.',
    baxterEc12Specs:
      'Derived from 10-electrode standard 12-lead input with zero extra patient preparation.',
    everydayAnalogy:
      'Wraps the virtual camera array around the far-right ribcage to give a complete 360-degree view of the right ventricle.',
    svgX: 128,
    svgY: 210,
  },
  {
    id: 'V7',
    code: 'V7',
    fullName: 'Synthesized Posterior Wall Lead syn-V7',
    colorName: 'Nihon Kohden synECi18 (Left Posterior Axillary)',
    hexColor: '#09318D',
    textColor: '#FFFFFF',
    isSynthesized: true,
    category: 'synECi18 Posterior Wall Lead (Synthesized)',
    anatomicalPlacement:
      'Virtual posterior back position: 5th intercostal space at the left posterior axillary line (horizontally aligned with V4–V6 around the back).',
    electricalRole:
      'Synthesized by Nihon Kohden synECi18 to inspect the true posterior wall of the left ventricle—detecting posterior STEMI that appears only as subtle reciprocal ST depression in V1–V3.',
    baxterEc12Specs:
      'Avoids rolling a critically ill patient onto their side to stick physical back electrodes (which often detach or suffer motion artifact).',
    everydayAnalogy:
      'A rear-view mirror camera looking at the back wall of the heart without ever having to roll the patient over in bed.',
    svgX: 298,
    svgY: 192,
  },
  {
    id: 'V8',
    code: 'V8',
    fullName: 'Synthesized Posterior Wall Lead syn-V8',
    colorName: 'Nihon Kohden synECi18 (Left Mid-Scapular)',
    hexColor: '#09318D',
    textColor: '#FFFFFF',
    isSynthesized: true,
    category: 'synECi18 Posterior Wall Lead (Synthesized)',
    anatomicalPlacement:
      'Virtual posterior back position: 5th intercostal space at the left mid-scapular line (directly below the tip of the left shoulder blade).',
    electricalRole:
      'Directly views the mid-posterior left ventricular myocardium via synECi18 mathematical lead-vector synthesis.',
    baxterEc12Specs:
      'Mathematically derived from standard 12-lead ECG in Nihon Kohden Cardiofax M ECG-3350.',
    everydayAnalogy:
      'Sits virtually right beneath the left shoulder blade to catch "silent" back-wall heart attacks.',
    svgX: 312,
    svgY: 180,
  },
  {
    id: 'V9',
    code: 'V9',
    fullName: 'Synthesized Posterior Wall Lead syn-V9',
    colorName: 'Nihon Kohden synECi18 (Left Paraspinal)',
    hexColor: '#09318D',
    textColor: '#FFFFFF',
    isSynthesized: true,
    category: 'synECi18 Posterior Wall Lead (Synthesized)',
    anatomicalPlacement:
      'Virtual posterior back position: 5th intercostal space at the left paraspinal border (next to the thoracic spine).',
    electricalRole:
      'Completes the 18-lead synECi18 array (12 standard + V3R–V5R + V7–V9) for comprehensive posterolateral ischemia diagnosis.',
    baxterEc12Specs:
      'Synthesized from standard 10-electrode 12-lead data (Nihon Kohden synECi18 Brochure).',
    everydayAnalogy:
      'The final rear camera right next to the spine, completing the 18-lead surround-sound map of the heart.',
    svgX: 326,
    svgY: 168,
  },
];

export interface CommercialOemRow {
  parameter: string;
  geMac2000: string;
  welchAllynEli380: string;
  philipsTc70: string;
  nihonKohden3350: string;
}

export const COMMERCIAL_OEM_COMPARISON: CommercialOemRow[] = [
  {
    parameter: 'Interpretation & Special Leads',
    geMac2000: 'Marquette 12SL, HookUp Advisor, ACI-TIPI Acute Ischemia',
    welchAllynEli380: 'VERITAS Algorithm, "Best 10" Auto-Capture from 5-min Buffer',
    philipsTc70: 'Philips DXL 16-Lead Algorithm, Critical Values, ST Maps',
    nihonKohden3350: 'ECAPS 12C (200+ Findings, Brugada) + synECi18 (V3R–V5R, V7–V9)',
  },
  {
    parameter: 'Sampling Rate (Acquisition / Analysis / Pace)',
    geMac2000: '16,000 SPS/ch Acq · 500 or 1,000 SPS Analysis · 75,000 SPS Pace',
    welchAllynEli380: '40,000 SPS/ch Pace Detection · 1,000 SPS/ch Analysis & Storage',
    philipsTc70: '8,000 SPS/ch Oversampling · 500 / 1,000 SPS Analysis',
    nihonKohden3350: '8,000 SPS/ch Acquisition · 500 SPS Analysis · Digital Pace Detection',
  },
  {
    parameter: 'ADC Resolution & Dynamic Range',
    geMac2000: '4.88 µV/LSB (@ 500 SPS) · ±5 mV AC Range · ±300 mV DC Offset',
    welchAllynEli380: '20-Bit Sigma-Delta ADC (1.17 µV/LSB) · ±300 mV DC Offset',
    philipsTc70: '1 µV/LSB Resolution · ±300 mV Polarization Offset Tolerance',
    nihonKohden3350: '≤ 1.25 µV/LSB Resolution · ±300 mV DC Offset Tolerance',
  },
  {
    parameter: 'Diagnostic Bandwidth & Filters',
    geMac2000: '0.04–150 Hz (HPF: 0.04 Hz ADS Off / 0.56 Hz ADS On; LPF: 20, 40, 100, 150 Hz)',
    welchAllynEli380: '0.05–300 Hz Full Diagnostic Passband · 50/60 Hz Digital Notch',
    philipsTc70: '0.05–150 Hz Bandwidth · High-Pass Time Constant τ = 3.2 s',
    nihonKohden3350: '0.05–150 Hz Passband · High-Cut 25, 35, 75, 100, 150 Hz · AC 50/60 Hz',
  },
  {
    parameter: 'CMRR, Input Impedance & Safety',
    geMac2000: 'CMRR > 135 dB (Notch ON) · Zin > 10 MΩ @ 10 Hz · Leakage <10 µA NC / <50 µA SFC',
    welchAllynEli380: 'CMRR > 120 dB · Defib-Proof Type CF · Wireless WAM RF Module',
    philipsTc70: 'CMRR ≥ 100–125 dB · Zin > 10 MΩ · Trident 3-in-1 Lead Wires',
    nihonKohden3350: 'CMRR ≥ 103 dB · Zin ≥ 10 MΩ · Defib-Proof Type CF (<10 µA NC)',
  },
  {
    parameter: 'Writer Speeds, Gain & Connectivity',
    geMac2000: '5, 12.5, 25, 50 mm/s · Gain 2.5, 5, 10, 20, 40 mm/mV · MUSE / DICOM / XML',
    welchAllynEli380: '5, 10, 25, 50 mm/s · Gain 2.5, 5, 10, 20 mm/mV · ELI Link / ATO-C Cyber',
    philipsTc70: '5, 12.5, 25, 50 mm/s · Gain 2.5, 5, 10, 20 mm/mV · IntelliSpace ECG',
    nihonKohden3350: '5, 10, 12.5, 25, 50 mm/s · Gain 2.5, 5, 10, 20 mm/mV · polaris.one / Web PDF',
  },
];

export interface HardwareStageSpec {
  id: string;
  stepNum: string;
  shortTitle: string;
  fullTitle: string;
  icOrComponents: string;
  keySpecs: string;
  engineeringRole: string;
  everydayAnalogy: string;
}

export const HARDWARE_SIGNAL_CHAIN: HardwareStageSpec[] = [
  {
    id: 'stage_electrodes',
    stepNum: '01',
    shortTitle: 'Ag/AgCl EC12',
    fullTitle: '1. Ag/AgCl Electrodes (Baxter Ref 108071 Tab vs. Ref 108070 Snap)',
    icOrComponents: 'Baxter Solid Hydrogel Tab (Ref 108071) / Wet-Gel Snap (Ref 108070)',
    keySpecs: 'Tab ACZ: 728–806 Ω · Snap ACZ: 58–93 Ω · DC Offset: 0.2–0.52 mV',
    engineeringRole:
      'Transduces ionic currents (Na⁺, K⁺, Cl⁻) on the skin surface into electronic currents via a reversible Ag/AgCl redox reaction. Mixing dry Tab and wet Snap pads creates ΔZe mismatch.',
    everydayAnalogy:
      'Like a live interpreter at a border crossing—translating the body’s salty ion waves into the copper wire’s electron signals.',
  },
  {
    id: 'stage_defib',
    stepNum: '02',
    shortTitle: 'Defib Protection',
    fullTitle: '2. Defibrillator Surge Protection & Input Clamping',
    icOrComponents: '10–22 kΩ Series Power Resistors + Gas-Discharge Neon Tubes + TVS Diodes',
    keySpecs: 'Clamps 360 J (5,000 V) Defib Shock · Leakage < 10 µA NC / < 50 µA SFC',
    engineeringRole:
      'Protects sensitive silicon amplifier inputs if an emergency defibrillator shock is delivered to the patient’s chest while ECG leads are connected (Gordillo-Roblero et al., 2024).',
    everydayAnalogy:
      'Like a heavy-duty lightning surge protector—if a 5,000 V defibrillator bolt hits, neon tubes and TVS diodes safely divert the surge away from the microchips.',
  },
  {
    id: 'stage_ina_rld',
    stepNum: '03',
    shortTitle: 'INA + RLD Loop',
    fullTitle: '3. Instrumentation Amplifier (INA) & Driven Right Leg (RLD)',
    icOrComponents: 'AD8232 / INA128 (Gain 100–1000×) + Phase-Inverting RLD Op-Amp',
    keySpecs: 'Z_in > 10 MΩ @ 10 Hz · CMRR > 135 dB (GE MAC 2000) · Active Vcm Feedback',
    engineeringRole:
      'Amplifies the ~1 mV differential cardiac voltage while rejecting shared 50 Hz common-mode hum. The RLD loop inverts average common-mode body voltage and drives it back into the Right Leg.',
    everydayAnalogy:
      'A precision balance scale paired with noise-canceling headphones—weighing only the tiny difference between two limbs while actively canceling the 50 Hz room buzz.',
  },
  {
    id: 'stage_filters',
    stepNum: '04',
    shortTitle: 'RC + DSP Filters',
    fullTitle: '4. Hardware Anti-Aliasing & Software Clinical Filter Modes',
    icOrComponents: 'Hardware RC Coupling + Digital Biquad HPF (0.04/0.05/0.67 Hz) & LPF (15–300 Hz)',
    keySpecs: 'Diag: 0.05–150/300 Hz (τ=3.18s) · Monitor: 0.67–40 Hz (τ=0.25s) · ESU: ~15 Hz',
    engineeringRole:
      'Hardware coupling prevents ±300 mV DC electrode offset saturation, while software filters control clinical passbands and automated FET baseline de-blocking after overload (WhaleTeq App Note).',
    everydayAnalogy:
      'A three-stage water purifier: a coarse screen catches big leaves (breathing drift), a carbon trap removes one specific chemical (50 Hz hum), and a fine mesh blocks sand (muscle noise).',
  },
  {
    id: 'stage_adc',
    stepNum: '05',
    shortTitle: '20/24-Bit ΣΔ ADC',
    fullTitle: '5. Oversampling Sigma-Delta ADC & Optical Isolation Barrier',
    icOrComponents: '20-Bit (ELI 380: 1.17 µV/LSB) / 24-Bit TI ADS1298 + Galvanic/Optical Barrier',
    keySpecs: '16,000–40,000 SPS Oversampling · 75,000 SPS Pace (MAC 2000) · Type CF Barrier',
    engineeringRole:
      'Oversamples all ECG channels simultaneously to capture sub-millisecond pacemaker spikes and microvolt cardiac potentials across a Type CF isolation barrier.',
    everydayAnalogy:
      'A high-speed digital scanner that turns smooth analog waves into ultra-precise numbers, then beams them across a glass safety wall using flashes of light.',
  },
  {
    id: 'stage_simulator_dac',
    stepNum: '06',
    shortTitle: '1/1106 Phantom',
    fullTitle: '6. Hardware ECG Simulator Phantom (Suharinto et al., 2020)',
    icOrComponents: 'Microcontroller DAC (ECGSIM Arrays) + 1/1106 Resistor Voltage Divider',
    keySpecs: 'ECGSIM Span: +1.3 mV (V5) to −3.2 mV (V2) = 4.5 mV · Attenuator: 1 / 1106',
    engineeringRole:
      'Generates calibrated synthetic 12-lead ECG signals in hardware by stepping down 0–5 V microcontroller DAC waveforms through a precision 1/1106 resistor divider network (Suharinto et al., 2020).',
    everydayAnalogy:
      'A miniature electronic heart-in-a-box that shrinks 5-volt computer pulses down by 1,106 times so hospital technicians can test ECG carts without a live patient.',
  },
];

export const ThreeDeviceExplorer: React.FC<ThreeDeviceExplorerProps> = ({
  onCompleteZoomToSimulator,
}) => {
  const [selectedElectrodeId, setSelectedElectrodeId] = useState<ElectrodeSpec['id']>('V1');
  const [showSynEci18, setShowSynEci18] = useState<boolean>(true);
  const [selectedStageId, setSelectedStageId] = useState<string>('stage_electrodes');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [uploadedPhotoName, setUploadedPhotoName] = useState<string>('');
  const [isZoomingToScreen4, setIsZoomingToScreen4] = useState<boolean>(false);

  const allDisplayedElectrodes = showSynEci18
    ? [...TEN_ELECTRODES, ...SYN_ECI18_ELECTRODES]
    : TEN_ELECTRODES;

  const activeElectrode =
    [...TEN_ELECTRODES, ...SYN_ECI18_ELECTRODES].find((e) => e.id === selectedElectrodeId) ??
    TEN_ELECTRODES[4];
  const activeStage =
    HARDWARE_SIGNAL_CHAIN.find((s) => s.id === selectedStageId) ?? HARDWARE_SIGNAL_CHAIN[0];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedPhotoUrl(reader.result);
        setUploadedPhotoName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLaunchSimulator = () => {
    if (isZoomingToScreen4) return;
    setIsZoomingToScreen4(true);
    window.setTimeout(() => {
      onCompleteZoomToSimulator();
    }, 420);
  };

  return (
    <section
      className={`min-h-[calc(100vh-65px)] bg-white text-[#09318D] px-6 py-6 md:py-8 transition-all duration-400 origin-center ${
        isZoomingToScreen4 ? 'scale-105 opacity-0' : 'scale-100 opacity-100'
      }`}
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Top Header + Unobstructed "What is Next? -> Launch ECG Simulator" Button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#09318D]/15">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#09318D]/70">
              <span>SCREEN 03 OF 06</span>
              <span aria-hidden="true">·</span>
              <span>2D CLINICAL HARDWARE, COMMERCIAL SPECS &amp; 12/18-LEAD PLACEMENT EXPLORER</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#09318D] mt-1">
              2D Anatomical Torso Map (12-Lead + synECi18) &amp; Commercial Hardware Benchmark
            </h1>
          </div>

          <button
            type="button"
            onClick={handleLaunchSimulator}
            disabled={isZoomingToScreen4}
            className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-[#09318D] text-white font-bold text-sm hover:bg-[#09318D]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD91CC] transition-all cursor-pointer shadow-sm whitespace-nowrap shrink-0 self-start lg:self-auto"
          >
            <span>
              {isZoomingToScreen4
                ? 'Launching ECG Simulator...'
                : 'What is Next? -> Launch ECG Simulator'}
            </span>
            <span className="w-6 h-6 rounded-lg bg-[#FD91CC] text-[#09318D] flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>

        {/* Two Side-by-Side Interactive 2D Panels: Panel A (Torso Map + Baxter EC12 + synECi18) & Panel B (OEM Spec Table + Hardware Signal Chain) */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* =====================================================================
              PANEL A (5 cols): Interactive 2D Human Torso & Limb Map (10 Physical + 6 synECi18)
              ===================================================================== */}
          <div
            data-testid="panel-a-torso-map"
            className="lg:col-span-5 rounded-2xl border-2 border-[#09318D] bg-white p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#09318D]/15">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#09318D]" />
                  <h2 className="text-base font-bold text-[#09318D]">
                    Left Panel · 2D Torso Map &amp; Baxter EC12 Specs
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSynEci18((prev) => !prev)}
                  data-testid="toggle-syneci18-btn"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition-all cursor-pointer ${
                    showSynEci18
                      ? 'bg-[#FD91CC] text-[#09318D] border-[#09318D]'
                      : 'bg-white text-[#09318D] border-[#09318D]/30 hover:border-[#FD91CC]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{showSynEci18 ? 'synECi18 (V3R–V5R, V7–V9): ON' : 'Show synECi18 (+6 Leads)'}</span>
                </button>
              </div>

              <p className="text-xs text-[#09318D]/80 mt-2 leading-relaxed">
                Click any of the <strong>10 physical electrodes</strong> (<code className="font-mono">RA, LA, RL, LL, V1–V6</code>) or the <strong>6 Nihon Kohden <code className="font-mono">synECi18</code> synthesized leads</strong> (<code className="font-mono">V3R–V5R, V7–V9</code>) to inspect placement and Baxter ANSI/AAMI EC12 data.
              </p>

              {/* Quick Electrode Selector Strip (RA, LA, RL, LL, V1-V6 + synECi18) */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {allDisplayedElectrodes.map((el) => {
                  const isSelected = el.id === selectedElectrodeId;
                  return (
                    <button
                      key={el.id}
                      type="button"
                      onClick={() => setSelectedElectrodeId(el.id)}
                      aria-label={`Inspect Electrode ${el.code}`}
                      aria-pressed={isSelected}
                      className={`px-2 py-1 rounded-lg font-mono text-[11px] font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#09318D] text-white border-[#09318D] shadow-sm scale-105'
                          : el.isSynthesized
                          ? 'bg-[#FD91CC]/25 text-[#09318D] border-[#09318D]/40 border-dashed hover:border-[#09318D]'
                          : 'bg-white text-[#09318D] border-[#09318D]/25 hover:border-[#FD91CC]'
                      }`}
                    >
                      {el.isSynthesized ? `syn-${el.code}` : el.code}
                    </button>
                  );
                })}
              </div>

              {/* 2D Medical Illustration SVG of Human Torso, Ribcage, Einthoven Triangle & 10+6 Electrodes */}
              <div className="mt-3 rounded-xl bg-[#09318D]/[0.03] border border-[#09318D]/15 p-2.5 flex items-center justify-center">
                <svg
                  viewBox="0 0 400 410"
                  className="w-full max-w-[375px] h-auto select-none"
                  role="img"
                  aria-label="Interactive 2D Human Torso and 12-Lead plus synECi18 18-Lead ECG Electrode Placement Map"
                >
                  {/* Anatomical Torso Silhouette */}
                  <path
                    d="M 165 25 C 165 10, 235 10, 235 25 L 240 52 L 325 72 C 345 78, 355 105, 345 145 L 325 225 L 298 225 L 308 135 L 285 130 L 285 290 L 302 385 L 265 385 L 245 295 L 155 295 L 135 385 L 98 385 L 115 290 L 115 130 L 92 135 L 102 225 L 75 225 L 55 145 C 45 105, 55 78, 75 72 L 160 52 Z"
                    fill="#FFFFFF"
                    stroke="#09318D"
                    strokeWidth="2.2"
                  />

                  {/* Clavicles & Sternum (Breastbone) */}
                  <path
                    d="M 125 78 Q 165 88 194 84 M 275 78 Q 235 88 206 84"
                    fill="none"
                    stroke="#09318D"
                    strokeWidth="2"
                    strokeOpacity="0.45"
                  />
                  {/* Sternum Centerline */}
                  <rect
                    x="194"
                    y="84"
                    width="12"
                    height="112"
                    rx="5"
                    fill="rgba(9, 49, 141, 0.1)"
                    stroke="#09318D"
                    strokeWidth="1.4"
                    strokeOpacity="0.5"
                  />

                  {/* Anatomical Ribs (1st to 6th Intercostal Reference Arcs) */}
                  {[104, 124, 144, 164, 186, 208].map((ry, idx) => (
                    <g key={ry} opacity="0.32">
                      <path
                        d={`M 194 ${ry} Q 150 ${ry - 4} 130 ${ry + 14}`}
                        fill="none"
                        stroke="#09318D"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <path
                        d={`M 206 ${ry} Q 250 ${ry - 4} 272 ${ry + 14}`}
                        fill="none"
                        stroke="#09318D"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <text
                        x="134"
                        y={ry + 4}
                        fill="#09318D"
                        fontSize="7.5"
                        fontFamily="IBM Plex Mono, monospace"
                        fontWeight="600"
                      >
                        R{idx + 1}
                      </text>
                    </g>
                  ))}

                  {/* Cardiac Silhouette & +60° Mean Electrical Axis Arrow */}
                  <path
                    d="M 195 135 C 182 125, 168 142, 178 165 C 185 185, 212 208, 236 204 C 248 200, 250 170, 232 148 C 220 135, 205 135, 195 135 Z"
                    fill="rgba(253, 145, 204, 0.28)"
                    stroke="#FD91CC"
                    strokeWidth="2"
                  />
                  <line
                    x1="188"
                    y1="142"
                    x2="232"
                    y2="195"
                    stroke="#09318D"
                    strokeWidth="2.2"
                    strokeDasharray="3 2"
                  />
                  <text
                    x="146"
                    y="238"
                    fill="#09318D"
                    fontSize="8.5"
                    fontFamily="IBM Plex Mono, monospace"
                    fontWeight="700"
                  >
                    Heart Axis (+60° // Lead II)
                  </text>

                  {/* Einthoven's Equilateral Triangle Dashed Overlay (RA - LA - LL) */}
                  <polygon
                    points="82,112 318,112 286,368"
                    fill="none"
                    stroke="#09318D"
                    strokeWidth="1.5"
                    strokeDasharray="5 4"
                    strokeOpacity="0.45"
                  />
                  <text x="172" y="104" fill="#09318D" fontSize="9" fontWeight="700" fontFamily="IBM Plex Mono, monospace">
                    Lead I (0°)
                  </text>
                  <text x="108" y="268" fill="#09318D" fontSize="9" fontWeight="700" fontFamily="IBM Plex Mono, monospace">
                    Lead II (+60°)
                  </text>
                  <text x="292" y="255" fill="#09318D" fontSize="9" fontWeight="700" fontFamily="IBM Plex Mono, monospace">
                    Lead III (+120°)
                  </text>

                  {/* Anatomical Orientation Labels */}
                  <text x="18" y="32" fill="#09318D" fontSize="9.5" fontWeight="700" fontFamily="IBM Plex Mono, monospace">
                    PATIENT RIGHT (V3R–V5R)
                  </text>
                  <text x="248" y="32" fill="#09318D" fontSize="9.5" fontWeight="700" fontFamily="IBM Plex Mono, monospace">
                    PATIENT LEFT (V7–V9 Back)
                  </text>

                  {/* Render All Active Electrodes (10 Physical + Optional 6 synECi18) */}
                  {allDisplayedElectrodes.map((el) => {
                    const isSelected = el.id === selectedElectrodeId;
                    const isChest = el.id.startsWith('V');
                    const baseR = el.isSynthesized ? 8.5 : isChest ? 9.5 : 13;
                    const r = isSelected ? baseR + 2.5 : baseR;

                    return (
                      <g
                        key={el.id}
                        onClick={() => setSelectedElectrodeId(el.id)}
                        className="cursor-pointer"
                        role="button"
                        tabIndex={0}
                        aria-label={`Select Electrode ${el.code} (${el.fullName})`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedElectrodeId(el.id);
                          }
                        }}
                      >
                        {isSelected && (
                          <circle
                            cx={el.svgX}
                            cy={el.svgY}
                            r={r + 4.5}
                            fill="none"
                            stroke="#09318D"
                            strokeWidth="2.2"
                          />
                        )}
                        <circle
                          cx={el.svgX}
                          cy={el.svgY}
                          r={r}
                          fill={el.hexColor}
                          stroke={el.isSynthesized ? '#FD91CC' : '#09318D'}
                          strokeWidth={isSelected ? '2.8' : '1.6'}
                          strokeDasharray={el.isSynthesized ? '2.5 1.5' : undefined}
                        />
                        <text
                          x={el.svgX}
                          y={el.svgY + 3}
                          textAnchor="middle"
                          fill={el.textColor}
                          fontSize={el.isSynthesized ? '7' : isChest ? '8' : '9.5'}
                          fontWeight="700"
                          fontFamily="IBM Plex Mono, monospace"
                        >
                          {el.code}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Baxter ANSI/AAMI EC12 Side-by-Side Quick Spec Strip */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-[#09318D]/5 border border-[#09318D]/15">
                  <p className="font-bold text-[#09318D]">
                    Baxter Resting Tab (Ref 108071)
                  </p>
                  <p className="font-mono text-[10px] text-[#09318D]/85 mt-0.5">
                    24h Solid Hydrogel · 25×23 mm · 10 Hz ACZ: <strong>728–806 Ω</strong> (772 Ω post-defib) · DC: 0.2–0.52 mV · SDR &lt; 0.6 mV/s · COIIN: 15–18 µV
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FD91CC]/20 border border-[#FD91CC]">
                  <p className="font-bold text-[#09318D]">
                    Baxter Monitoring Snap (Ref 108070)
                  </p>
                  <p className="font-mono text-[10px] text-[#09318D]/90 mt-0.5">
                    72h Wet Gel · 38 mm Teardrop · 10 Hz ACZ: <strong>58–93 Ω</strong> (48 Ω post-defib) · DC: 0.2–0.5 mV · SDR: 0.2–0.3 mV/s · COIIN: 18–20 µV
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Electrode Detailed Anatomical & Electrical Callout Box */}
            <div
              data-testid="selected-electrode-detail"
              className="mt-3 p-4 rounded-xl bg-[#09318D] text-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/15">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded font-mono text-xs font-bold border border-white/40"
                    style={{
                      backgroundColor: activeElectrode.hexColor,
                      color: activeElectrode.textColor,
                    }}
                  >
                    {activeElectrode.isSynthesized ? `syn-${activeElectrode.code}` : activeElectrode.code}
                  </span>
                  <h3 className="text-sm font-bold text-white">{activeElectrode.fullName}</h3>
                </div>
                <span className="text-[10px] font-mono text-[#FD91CC]">
                  {activeElectrode.category}
                </span>
              </div>

              <div className="mt-2 space-y-1.5 text-xs">
                <p>
                  <strong className="text-[#FD91CC]">Anatomical Placement:</strong>{' '}
                  <span className="text-white/95">{activeElectrode.anatomicalPlacement}</span>
                </p>
                <p>
                  <strong className="text-[#FD91CC]">Electrical Role:</strong>{' '}
                  <span className="text-white/90">{activeElectrode.electricalRole}</span>
                </p>
                <p>
                  <strong className="text-[#FD91CC]">Baxter ANSI/AAMI EC12 / Synthesis Data:</strong>{' '}
                  <span className="text-white/90 font-mono text-[11px]">{activeElectrode.baxterEc12Specs}</span>
                </p>
                <p className="pt-1.5 border-t border-white/15 text-white/90">
                  <strong className="text-[#FD91CC]">Everyday Analogy:</strong>{' '}
                  {activeElectrode.everydayAnalogy}
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================================
              PANEL B (7 cols): Commercial Engineering Spec Comparison Table + 2D Hardware Signal Chain + Photo Upload
              ===================================================================== */}
          <div
            data-testid="panel-b-hardware-chain"
            className="lg:col-span-7 rounded-2xl border-2 border-[#09318D] bg-white p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              {/* Side-by-Side Commercial Engineering Spec Comparison Table */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#09318D]/15">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-[#09318D]" />
                  <h2 className="text-base font-bold text-[#09318D]">
                    Right Panel · Commercial ECG Engineering Spec Comparison Table
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#09318D]/75">
                  4 GLOBAL HOSPITAL OEMs
                </span>
              </div>

              <div className="mt-3 overflow-x-auto rounded-xl border border-[#09318D]/20">
                <table
                  data-testid="commercial-oem-table"
                  className="w-full text-left border-collapse text-[11px]"
                >
                  <thead>
                    <tr className="bg-[#09318D] text-white">
                      <th className="py-2 px-2.5 font-mono uppercase">Engineering Metric</th>
                      <th className="py-2 px-2.5 font-mono uppercase text-[#FD91CC]">
                        GE MAC 2000
                      </th>
                      <th className="py-2 px-2.5 font-mono uppercase">
                        Welch Allyn ELI 380 / WAM
                      </th>
                      <th className="py-2 px-2.5 font-mono uppercase">
                        Philips PageWriter TC70
                      </th>
                      <th className="py-2 px-2.5 font-mono uppercase">
                        Nihon Kohden ECG-3350
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#09318D]/15 text-[#09318D]">
                    {COMMERCIAL_OEM_COMPARISON.map((row) => (
                      <tr key={row.parameter} className="hover:bg-[#09318D]/[0.02]">
                        <td className="py-2 px-2.5 font-bold bg-[#09318D]/[0.03]">
                          {row.parameter}
                        </td>
                        <td className="py-2 px-2.5 font-mono text-[10.5px]">{row.geMac2000}</td>
                        <td className="py-2 px-2.5 font-mono text-[10.5px]">{row.welchAllynEli380}</td>
                        <td className="py-2 px-2.5 font-mono text-[10.5px]">{row.philipsTc70}</td>
                        <td className="py-2 px-2.5 font-mono text-[10.5px]">{row.nihonKohden3350}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Interactive 2D Internal Hardware Signal Chain */}
              <div className="mt-5 pt-4 border-t border-[#09318D]/15">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#09318D]" />
                    <h3 className="text-sm font-bold text-[#09318D]">
                      2D Internal Hardware Signal Chain &amp; 1/1106 Simulator Phantom
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-[#09318D]/70">
                    CLICK STAGE TO INSPECT
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#09318D]/[0.03] border border-[#09318D]/15">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {HARDWARE_SIGNAL_CHAIN.map((stage, idx) => {
                      const isSelected = stage.id === selectedStageId;
                      return (
                        <button
                          key={stage.id}
                          type="button"
                          onClick={() => setSelectedStageId(stage.id)}
                          aria-pressed={isSelected}
                          className={`text-left p-2.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#09318D] text-white border-[#FD91CC] shadow-sm'
                              : 'bg-white text-[#09318D] border-[#09318D]/20 hover:border-[#FD91CC]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className={isSelected ? 'text-[#FD91CC] font-bold' : 'text-[#09318D]/65'}>
                              STAGE 0{idx + 1}
                            </span>
                            {isSelected ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#FD91CC]" />
                            ) : (
                              <span>→</span>
                            )}
                          </div>
                          <p className="text-xs font-bold mt-1">{stage.shortTitle}</p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Hardware Stage Detail Card */}
                  <div
                    data-testid="selected-hardware-stage-detail"
                    className="mt-2.5 p-3.5 rounded-xl border border-[#09318D]/20 bg-white"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-[#09318D]/15">
                      <h4 className="text-xs font-bold text-[#09318D]">{activeStage.fullTitle}</h4>
                      <span className="text-[10.5px] font-mono font-semibold text-[#09318D] bg-[#FD91CC]/30 px-2 py-0.5 rounded">
                        {activeStage.keySpecs}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-[#09318D]/80 mt-1.5">
                      <strong>Components:</strong> {activeStage.icOrComponents}
                    </p>
                    <p className="text-xs text-[#09318D]/85 mt-1 leading-relaxed">
                      {activeStage.engineeringRole}
                    </p>
                    <div className="mt-2 p-2 rounded-lg bg-[#FD91CC]/20 border border-[#FD91CC] flex items-start gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-[#09318D] shrink-0 mt-0.5" />
                      <p className="text-[11px] text-[#09318D] leading-snug">
                        <strong>Everyday Analogy:</strong> {activeStage.everydayAnalogy}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Commercial ECG Device Illustration + Optional Real Photograph Upload */}
            <div className="mt-4 pt-3 border-t border-[#09318D]/15">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-xs font-bold text-[#09318D] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#09318D]" />
                    <span>Commercial ECG Workstation Preview &amp; Local Image Upload Slot</span>
                  </h3>
                  <p className="text-[11px] text-[#09318D]/70">
                    Upload any local ECG hardware photo or inspect the 2D clinical architecture below.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FD91CC] text-[#09318D] font-bold text-xs hover:bg-[#FD91CC]/85 transition-colors cursor-pointer whitespace-nowrap">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload ECG Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      aria-label="Upload Commercial ECG Photograph"
                    />
                  </label>
                  {uploadedPhotoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedPhotoUrl(null);
                        setUploadedPhotoName('');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#09318D]/25 text-xs font-semibold text-[#09318D] hover:bg-[#09318D]/5 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {uploadedPhotoUrl ? (
                <div className="rounded-xl border-2 border-[#09318D] bg-[#09318D]/5 p-3 flex flex-col items-center">
                  <img
                    src={uploadedPhotoUrl}
                    alt={`Uploaded Commercial ECG Device: ${uploadedPhotoName}`}
                    referrerPolicy="no-referrer"
                    className="max-h-36 w-auto object-contain rounded-lg"
                  />
                  <span className="text-[11px] font-mono text-[#09318D] mt-1.5">
                    Displayed Local Photograph: {uploadedPhotoName}
                  </span>
                </div>
              ) : (
                <div className="rounded-xl border border-[#09318D]/20 bg-[#09318D]/[0.02] p-2.5">
                  <svg
                    viewBox="0 0 520 96"
                    className="w-full h-20"
                    role="img"
                    aria-label="2D Commercial 12-Lead Hospital ECG Device Architecture"
                  >
                    <rect x="10" y="12" width="100" height="72" rx="6" fill="#FFF5FA" stroke="#FD91CC" strokeWidth="2" />
                    <path
                      d="M 18 52 L 34 52 L 40 40 L 46 52 L 58 52 L 62 62 L 68 22 L 74 68 L 80 52 L 100 52"
                      fill="none"
                      stroke="#09318D"
                      strokeWidth="2"
                    />
                    <text x="18" y="76" fill="#09318D" fontSize="8" fontWeight="700" fontFamily="IBM Plex Mono, monospace">
                      5/12.5/25/50 mm/s
                    </text>

                    <rect x="124" y="6" width="242" height="84" rx="8" fill="#06101E" stroke="#09318D" strokeWidth="2.5" />
                    <text x="136" y="22" fill="#00FF66" fontSize="8.5" fontWeight="700" fontFamily="IBM Plex Mono, monospace">
                      LEAD II · 72 BPM · 25 mm/s · 10 mm/mV
                    </text>
                    <path
                      d="M 136 58 L 164 58 Q 174 44 184 58 L 200 58 L 206 66 L 214 26 L 222 72 L 230 58 L 254 58 Q 268 40 282 58 L 330 58"
                      fill="none"
                      stroke="#00FF66"
                      strokeWidth="2.2"
                    />
                    <circle cx="330" cy="58" r="3" fill="#00FF66" />
                    <text x="136" y="80" fill="#FD91CC" fontSize="8" fontFamily="IBM Plex Mono, monospace">
                      Type CF (&lt;10 µA NC) · CMRR &gt;135 dB · 20/24-Bit ADC
                    </text>

                    <rect x="380" y="12" width="130" height="72" rx="8" fill="#09318D" />
                    <text x="390" y="32" fill="#FFFFFF" fontSize="9" fontWeight="700">
                      12-Lead + synECi18
                    </text>
                    <text x="390" y="48" fill="#FD91CC" fontSize="8" fontFamily="IBM Plex Mono, monospace">
                      RA·LA·LL·RL + V1–V6
                    </text>
                    <text x="390" y="64" fill="#FFFFFF" fontSize="8" fontFamily="IBM Plex Mono, monospace">
                      syn: V3R–V5R, V7–V9
                    </text>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
