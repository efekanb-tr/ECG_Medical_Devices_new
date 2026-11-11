import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Play,
  Cpu,
  Activity,
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  FileText,
} from 'lucide-react';
import { ECGUIController, VERIFICATION_PRESETS, VerificationLogEntry } from '../engine/ECGUIController';

interface ScientificModelScreenProps {
  onBackToSimulator: () => void;
  onOpenReferenceLibrary?: () => void;
}

export const ScientificModelScreen: React.FC<ScientificModelScreenProps> = ({
  onBackToSimulator,
  onOpenReferenceLibrary,
}) => {
  const [reRunCounter, setReRunCounter] = useState(0);

  // Deterministically execute the 3 IEC verification scenarios against ECGSimulationEngine
  const benchmarkLogs: VerificationLogEntry[] = useMemo(() => {
    void reRunCounter;
    const ctrl = new ECGUIController();
    return VERIFICATION_PRESETS.map((preset) => ctrl.runVerificationScenario(preset.id).logEntry);
  }, [reRunCounter]);

  return (
    <section
      data-testid="scientific-model-screen"
      className="min-h-[calc(100vh-65px)] bg-white text-[#09318D] px-6 py-8 md:py-10"
    >
      <div className="max-w-6xl mx-auto w-full space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#09318D]/15">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#09318D]/70">
              <span>SCREEN 05 OF 06</span>
              <span aria-hidden="true">·</span>
              <span>TEXTBOOK EQUATIONS, VARIABLE LEGENDS &amp; TECHNICAL REPORT</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-[#09318D] mt-1">
              Mathematical Model, Textbook Equations &amp; Simplifying Assumptions
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBackToSimulator}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#09318D]/25 bg-white text-[#09318D] font-bold text-xs hover:border-[#FD91CC] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-[#09318D]" />
              <span>Return to Live Simulator</span>
            </button>

            {onOpenReferenceLibrary && (
              <button
                type="button"
                onClick={onOpenReferenceLibrary}
                data-testid="open-screen-6-btn"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#09318D] text-white font-bold text-xs hover:bg-[#09318D]/90 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Screen 6: All 16 IEEE References</span>
                <ArrowRight className="w-4 h-4 text-[#FD91CC]" />
              </button>
            )}
          </div>
        </div>

        {/* =====================================================================
            SECTION 1: 5 VISUAL TEXTBOOK EQUATION CARDS (NO RAW LATEX, WITH VARIABLE LEGENDS & ANALOGIES)
            ===================================================================== */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-[#09318D]" />
            <h2 className="text-xl font-bold text-[#09318D]">
              1. Five Visual Textbook Equation Cards, Variable Legends &amp; Everyday Analogies
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* =================================================================
                EQUATION CARD 1: Modified McSharry et al. (2003) Gaussian Dipole Sum & Einthoven Projections
                ================================================================= */}
            <div
              data-testid="equation-card-1"
              className="rounded-2xl border-2 border-[#09318D]/20 p-6 bg-white flex flex-col justify-between shadow-sm"
            >
              <div>
                <span className="text-xs font-mono font-bold text-[#09318D]/70">
                  EQUATION CARD 01 · MCSHARRY ET AL. (2003) &amp; EINTHOVEN (1912)
                </span>
                <h3 className="text-base font-bold text-[#09318D] mt-1">
                  1. Modified McSharry Gaussian Dipole Sum for V<sub>clean</sub>(t) &amp; Einthoven Lead Projections
                </h3>

                {/* Visual Textbook Equation Box (Light background so border-bottom: 1.5px solid #09318D is crisp) */}
                <div className="mt-4 p-4 rounded-xl bg-[#09318D]/[0.04] border-2 border-[#09318D]/25 text-[#09318D] font-mono text-xs sm:text-sm space-y-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold">
                      V<sub>clean</sub>(t) =
                    </span>
                    <span className="math-sum-group">
                      <span className="text-[10px]">T</span>
                      <span className="text-lg font-bold text-[#09318D]">∑</span>
                      <span className="text-[10px]">i=P</span>
                    </span>
                    <span>
                      a<sub>i</sub> · exp
                    </span>
                    <span>(</span>
                    <span>−</span>
                    <span className="math-fraction">
                      <span className="math-num">
                        (θ(t) − θ<sub>i</sub>)<sup>2</sup>
                      </span>
                      <span className="math-den">
                        2 · b<sub>i</sub>
                        <sup>2</sup>
                      </span>
                    </span>
                    <span>)</span>
                  </div>

                  <div className="pt-2.5 border-t border-[#09318D]/15 flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-bold">
                      V<sub>II</sub>(t) = V<sub>I</sub>(t) + V<sub>III</sub>(t)
                    </span>
                    <span>|</span>
                    <span className="inline-flex items-center">
                      V<sub>II</sub>(t) =
                      <span className="math-fraction">
                        <span className="math-num">1</span>
                        <span className="math-den">2</span>
                      </span>
                      · p<sub>x</sub>(t) +
                      <span className="math-fraction">
                        <span className="math-num">√3</span>
                        <span className="math-den">2</span>
                      </span>
                      · p<sub>y</sub>(t)
                    </span>
                  </div>
                </div>

                {/* Variable Legend */}
                <div className="mt-3 p-3 rounded-xl bg-[#09318D]/[0.02] border border-[#09318D]/15 text-xs space-y-1">
                  <p className="font-bold text-[#09318D]">Variable Legend:</p>
                  <p className="text-[#09318D]/85">
                    • <strong>V<sub>clean</sub>(t)</strong>: Noise-free synthetic cardiac voltage (mV) ·{' '}
                    <strong>i ∈ &#123;P, Q, R, S, T&#125;</strong>: 5 cardiac wave components
                  </p>
                  <p className="text-[#09318D]/85">
                    • <strong>a<sub>i</sub>, θ<sub>i</sub>, b<sub>i</sub></strong>: Gaussian peak amplitude (mV), angular phase center (rad), and angular width (rad)
                  </p>
                  <p className="text-[#09318D]/85">
                    • <strong>θ(t) = ω · t</strong>: Limit-cycle cardiac phase where{' '}
                    <strong>ω = 2π × HR / 60</strong> · <strong>p<sub>x</sub>(t), p<sub>y</sub>(t)</strong>: Frontal dipole vector components
                  </p>
                </div>
              </div>

              {/* Everyday Analogy */}
              <div className="mt-4 p-3 rounded-xl bg-[#FD91CC]/20 border border-[#FD91CC] flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-[#09318D] shrink-0 mt-0.5" />
                <p className="text-xs text-[#09318D] leading-relaxed">
                  <strong>Everyday Analogy:</strong> Imagine a lighthouse beam rotating once per heartbeat around a circular island with 5 sculpted hills (P, Q, R, S, and T). As the beam sweeps over each hill, its shadow on the three surrounding walls (Leads I, II, and III) traces the exact heartbeat waveform.
                </p>
              </div>
            </div>

            {/* =================================================================
                EQUATION CARD 2: 50 Hz Powerline Coupling via Electrode Impedance Mismatch (ΔZe / Zin) and Finite CMRR
                ================================================================= */}
            <div
              data-testid="equation-card-2"
              className="rounded-2xl border-2 border-[#09318D]/20 p-6 bg-white flex flex-col justify-between shadow-sm"
            >
              <div>
                <span className="text-xs font-mono font-bold text-[#09318D]/70">
                  EQUATION CARD 02 · HUHTA &amp; WEBSTER (1973) &amp; ANSI/AAMI EC12
                </span>
                <h3 className="text-base font-bold text-[#09318D] mt-1">
                  2. 50 Hz Powerline Coupling via Electrode Impedance Mismatch (ΔZ<sub>e</sub> / Z<sub>in</sub>) &amp; Finite CMRR
                </h3>

                {/* Visual Textbook Equation Box */}
                <div className="mt-4 p-4 rounded-xl bg-[#09318D]/[0.04] border-2 border-[#09318D]/25 text-[#09318D] font-mono text-xs sm:text-sm space-y-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold">
                      V<sub>50Hz</sub>(t) = V<sub>cm</sub> ×
                    </span>
                    <span>[</span>
                    <span className="math-fraction">
                      <span className="math-num">
                        ΔZ<sub>e</sub>
                      </span>
                      <span className="math-den">
                        Z<sub>in</sub>
                      </span>
                    </span>
                    <span>+</span>
                    <span className="math-fraction">
                      <span className="math-num">1</span>
                      <span className="math-den">
                        10
                        <sup>
                          CMRR<sub>dB</sub> / 20
                        </sup>
                      </span>
                    </span>
                    <span>]</span>
                    <span>× sin(2π · 50 · t)</span>
                  </div>

                  <div className="pt-2.5 border-t border-[#09318D]/15 text-xs">
                    IEC Test 1 Verification: 200 mV × (
                    <span className="math-fraction">
                      <span className="math-num">80 kΩ</span>
                      <span className="math-den">10,000 kΩ</span>
                    </span>
                    +
                    <span className="math-fraction">
                      <span className="math-num">1</span>
                      <span className="math-den">
                        10<sup>80 / 20</sup>
                      </span>
                    </span>
                    ) = <strong>1.62 mV</strong>
                  </div>
                </div>

                {/* Variable Legend */}
                <div className="mt-3 p-3 rounded-xl bg-[#09318D]/[0.02] border border-[#09318D]/15 text-xs space-y-1">
                  <p className="font-bold text-[#09318D]">Variable Legend:</p>
                  <p className="text-[#09318D]/85">
                    • <strong>V<sub>cm</sub></strong>: 50 Hz common-mode body voltage induced by AC mains (200 mV)
                  </p>
                  <p className="text-[#09318D]/85">
                    • <strong>ΔZ<sub>e</sub></strong>: Differential skin-electrode impedance mismatch (0–100 kΩ; e.g. mixing Baxter Tab Ref 108071 [728–806 Ω] with Snap Ref 108070 [58–93 Ω])
                  </p>
                  <p className="text-[#09318D]/85">
                    • <strong>Z<sub>in</sub></strong>: Instrumentation amplifier input impedance (≥ 10 MΩ @ 10 Hz) ·{' '}
                    <strong>CMRR<sub>dB</sub></strong>: Common-Mode Rejection Ratio (60–135 dB)
                  </p>
                </div>
              </div>

              {/* Everyday Analogy */}
              <div className="mt-4 p-3 rounded-xl bg-[#FD91CC]/20 border border-[#FD91CC] flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-[#09318D] shrink-0 mt-0.5" />
                <p className="text-xs text-[#09318D] leading-relaxed">
                  <strong>Everyday Analogy:</strong> Even if you wear 135 dB noise-canceling headphones (CMRR), if one earcup cushion is torn or loose (ΔZ<sub>e</sub> mismatch), loud 50 Hz engine hum leaks straight into one ear and overwhelms the music.
                </p>
              </div>
            </div>

            {/* =================================================================
                EQUATION CARD 3: Single-Pole RC Filter Cutoff & Decibel Voltage Attenuation
                ================================================================= */}
            <div
              data-testid="equation-card-3"
              className="rounded-2xl border-2 border-[#09318D]/20 p-6 bg-white flex flex-col justify-between shadow-sm"
            >
              <div>
                <span className="text-xs font-mono font-bold text-[#09318D]/70">
                  EQUATION CARD 03 · WHALETEQ IEC 60601-2-25 FILTER ATTENUATION MATH
                </span>
                <h3 className="text-base font-bold text-[#09318D] mt-1">
                  3. Single-Pole RC Filter Cutoff f<sub>c</sub> &amp; Decibel Voltage Attenuation
                </h3>

                {/* Visual Textbook Equation Box */}
                <div className="mt-4 p-4 rounded-xl bg-[#09318D]/[0.04] border-2 border-[#09318D]/25 text-[#09318D] font-mono text-xs sm:text-sm space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">
                      f<sub>c</sub> =
                    </span>
                    <span className="math-fraction">
                      <span className="math-num">1</span>
                      <span className="math-den">2π · R · C</span>
                    </span>
                    <span>=</span>
                    <span className="math-fraction">
                      <span className="math-num">1</span>
                      <span className="math-den">2π · τ</span>
                    </span>
                    <span className="ml-2">|</span>
                    <span className="font-bold">
                      Gain<sub>dB</sub> = 20 · log<sub>10</sub>
                    </span>
                    <span>(</span>
                    <span className="math-fraction">
                      <span className="math-num">
                        V<sub>out</sub>
                      </span>
                      <span className="math-den">
                        V<sub>in</sub>
                      </span>
                    </span>
                    <span>)</span>
                  </div>

                  <div className="pt-2.5 border-t border-[#09318D]/15 flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center">
                      |H<sub>LP</sub>(f)| =
                      <span className="math-fraction">
                        <span className="math-num">1</span>
                        <span className="math-den">
                          √(1 + (f / f<sub>c</sub>)<sup>2</sup>)
                        </span>
                      </span>
                    </span>
                    <span>
                      → At f = f<sub>c</sub>: V<sub>out</sub> / V<sub>in</sub> = 0.707 (−3.01 dB)
                    </span>
                  </div>
                </div>

                {/* Variable Legend */}
                <div className="mt-3 p-3 rounded-xl bg-[#09318D]/[0.02] border border-[#09318D]/15 text-xs space-y-1">
                  <p className="font-bold text-[#09318D]">Variable Legend:</p>
                  <p className="text-[#09318D]/85">
                    • <strong>f<sub>c</sub></strong>: −3 dB cutoff frequency (Hz) where output voltage drops to 70.7% of input
                  </p>
                  <p className="text-[#09318D]/85">
                    • <strong>τ = R · C</strong>: Filter time constant in seconds (Diagnostic 0.05 Hz → τ = 3.18 s; Philips TC70 → τ = 3.20 s; Monitor 0.67 Hz → τ = 0.24 s)
                  </p>
                  <p className="text-[#09318D]/85">
                    • <strong>V<sub>out</sub> / V<sub>in</sub></strong>: Voltage transfer ratio (For f<sub>c</sub> = 40 Hz LPF: 20 Hz still loses &gt;10% amplitude, while 100 Hz still passes 37%)
                  </p>
                </div>
              </div>

              {/* Everyday Analogy */}
              <div className="mt-4 p-3 rounded-xl bg-[#FD91CC]/20 border border-[#FD91CC] flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-[#09318D] shrink-0 mt-0.5" />
                <p className="text-xs text-[#09318D] leading-relaxed">
                  <strong>Everyday Analogy:</strong> A single-pole RC filter is like a gradual speed ramp rather than a brick wall—at the posted 40 Hz sign (f<sub>c</sub>), signals are already slowed down to 70.7%, and even slower 20 Hz heartbeats lose over 10% of their height.
                </p>
              </div>
            </div>

            {/* =================================================================
                EQUATION CARD 4: High-Pass Capacitor Step Discharge V_out(t) = V_in(t) - V_c(t) & 300 mVs Impulse
                ================================================================= */}
            <div
              data-testid="equation-card-4"
              className="rounded-2xl border-2 border-[#09318D]/20 p-6 bg-white flex flex-col justify-between shadow-sm"
            >
              <div>
                <span className="text-xs font-mono font-bold text-[#09318D]/70">
                  EQUATION CARD 04 · WHALETEQ CAL20160 &amp; 300 mVs IMPULSE RESPONSE
                </span>
                <h3 className="text-base font-bold text-[#09318D] mt-1">
                  4. High-Pass Capacitor Step Discharge V<sub>out</sub>(t) = V<sub>in</sub>(t) − V<sub>c</sub>(t) &amp; 300 mVs Impulse
                </h3>

                {/* Visual Textbook Equation Box */}
                <div className="mt-4 p-4 rounded-xl bg-[#09318D]/[0.04] border-2 border-[#09318D]/25 text-[#09318D] font-mono text-xs sm:text-sm space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">
                      V<sub>out</sub>(t) = V<sub>in</sub>(t) − V<sub>c</sub>(t)
                    </span>
                    <span>,</span>
                    <span className="inline-flex items-center">
                      V<sub>c</sub>(t) = V<sub>step</sub> ·
                      <span>(</span>
                      1 − exp
                      <span>(</span>
                      −
                      <span className="math-fraction">
                        <span className="math-num">t</span>
                        <span className="math-den">τ</span>
                      </span>
                      <span>)</span>
                      <span>)</span>
                    </span>
                  </div>

                  <div className="pt-2.5 border-t border-[#09318D]/15 text-xs">
                    IEC 300 mVs Impulse (3 mV × 100 ms) @ 0.05 Hz: Overshoot ={' '}
                    <strong>93 μV</strong> (Limit ≤ 100 μV) · Slope ={' '}
                    <strong>291 μV/s</strong> (IEC 2-27 ≤ 300 μV/s; IEC 2-51 ≤ 250 μV/s)
                  </div>
                </div>

                {/* Variable Legend */}
                <div className="mt-3 p-3 rounded-xl bg-[#09318D]/[0.02] border border-[#09318D]/15 text-xs space-y-1">
                  <p className="font-bold text-[#09318D]">Variable Legend:</p>
                  <p className="text-[#09318D]/85">
                    • <strong>V<sub>in</sub>(t)</strong>: True cardiac input potential (e.g., IEC CAL20160 with +0.2 mV flat ST-segment elevation)
                  </p>
                  <p className="text-[#09318D]/85">
                    • <strong>V<sub>c</sub>(t)</strong>: Voltage accumulated across the AC-coupling capacitor during a sustained pulse or ST elevation
                  </p>
                  <p className="text-[#09318D]/85">
                    • <strong>V<sub>out</sub>(t)</strong>: Filtered output voltage—when V<sub>in</sub> returns to 0 mV, the charged capacitor forces V<sub>out</sub> = −V<sub>c</sub>(t) (causing a −0.34 V undershoot at 0.67 Hz)
                  </p>
                </div>
              </div>

              {/* Everyday Analogy */}
              <div className="mt-4 p-3 rounded-xl bg-[#FD91CC]/20 border border-[#FD91CC] flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-[#09318D] shrink-0 mt-0.5" />
                <p className="text-xs text-[#09318D] leading-relaxed">
                  <strong>Everyday Analogy:</strong> A coupling capacitor with a short monitoring time constant (τ = 0.25 s) is like standing on a memory-foam cushion that sinks while you stand on it (erasing the +0.2 mV ST plateau) and leaves a deep footprint crater (−0.34 V undershoot) the moment you step off.
                </p>
              </div>
            </div>

            {/* =================================================================
                EQUATION CARD 5: Pan & Tompkins (1985) QRS Pipeline & Gonzalez-Fernandez (2017) FSV + Suharinto 1/1106
                ================================================================= */}
            <div
              data-testid="equation-card-5"
              className="lg:col-span-2 rounded-2xl border-2 border-[#09318D]/20 p-6 bg-white flex flex-col justify-between shadow-sm"
            >
              <div>
                <span className="text-xs font-mono font-bold text-[#09318D]/70">
                  EQUATION CARD 05 · PAN &amp; TOMPKINS (1985) QRS PIPELINE, GONZALEZ-FERNANDEZ (2017) FSV &amp; SUHARINTO (2020)
                </span>
                <h3 className="text-base font-bold text-[#09318D] mt-1">
                  5. Pan &amp; Tompkins (1985) Real-Time QRS Detection Pipeline &amp; Gonzalez-Fernandez (2017) Function of Spatial Velocity (FSV)
                </h3>

                {/* Visual Textbook Equation Box */}
                <div className="mt-4 p-4 rounded-xl bg-[#09318D]/[0.04] border-2 border-[#09318D]/25 text-[#09318D] font-mono text-xs sm:text-sm space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold">
                      1. Bandpass (5–15 Hz) → 2. Derivative / FSV:
                    </span>
                    <span className="inline-flex items-center">
                      y<sub>d</sub>[n] =
                      <span className="math-fraction">
                        <span className="math-num">
                          −x[n − 2] − 2·x[n − 1] + 2·x[n + 1] + x[n + 2]
                        </span>
                        <span className="math-den">8 · T</span>
                      </span>
                    </span>
                  </div>

                  <div className="pt-2.5 border-t border-[#09318D]/15 flex flex-wrap items-center gap-4">
                    <span className="inline-flex items-center">
                      <strong>3. Squaring:</strong>&nbsp;y<sub>sq</sub>[n] = (y<sub>d</sub>[n])<sup>2</sup>
                    </span>
                    <span>|</span>
                    <span className="inline-flex items-center">
                      <strong>4. Moving Window Integration (MWI):</strong>&nbsp;y<sub>int</sub>[n] =
                      <span className="math-fraction">
                        <span className="math-num">1</span>
                        <span className="math-den">N</span>
                      </span>
                      <span className="math-sum-group">
                        <span className="text-[9px]">N−1</span>
                        <span className="text-base font-bold">∑</span>
                        <span className="text-[9px]">k=0</span>
                      </span>
                      y<sub>sq</sub>[n − k]
                    </span>
                    <span>|</span>
                    <span className="inline-flex items-center">
                      <strong>Suharinto Attenuator:</strong>&nbsp;V<sub>sim</sub> =
                      <span className="math-fraction">
                        <span className="math-num">
                          V<sub>DAC</sub>
                        </span>
                        <span className="math-den">1106</span>
                      </span>
                    </span>
                  </div>
                </div>

                {/* Variable Legend */}
                <div className="mt-3 p-3 rounded-xl bg-[#09318D]/[0.02] border border-[#09318D]/15 text-xs grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="font-bold text-[#09318D]">Variable Legend (Pan-Tompkins &amp; FSV):</p>
                    <p className="text-[#09318D]/85 mt-0.5">
                      • <strong>x[n]</strong>: Bandpass-filtered (5–15 Hz) digitized ECG sequence at sampling period <strong>T = 1 / f<sub>s</sub></strong> (f<sub>s</sub> = 360 Hz)
                    </p>
                    <p className="text-[#09318D]/85 mt-0.5">
                      • <strong>y<sub>d</sub>[n]</strong>: 5-point derivative / Function of Spatial Velocity (FSV, Gonzalez-Fernandez 2017) highlighting steep QRS slopes
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-[#09318D]">Integration &amp; Hardware Phantom:</p>
                    <p className="text-[#09318D]/85 mt-0.5">
                      • <strong>y<sub>sq</sub>[n] = x<sup>2</sup></strong>: Non-linear squaring making all peaks positive and boosting high-slope QRS energy
                    </p>
                    <p className="text-[#09318D]/85 mt-0.5">
                      • <strong>N</strong>: Moving window width (~150 ms = 54 samples @ 360 Hz) · <strong>V<sub>DAC</sub> / 1106</strong>: Suharinto (2020) resistor divider scaling 5 V DAC down to 4.5 mV span
                    </p>
                  </div>
                </div>
              </div>

              {/* Everyday Analogy */}
              <div className="mt-4 p-3 rounded-xl bg-[#FD91CC]/20 border border-[#FD91CC] flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-[#09318D] shrink-0 mt-0.5" />
                <p className="text-xs text-[#09318D] leading-relaxed">
                  <strong>Everyday Analogy:</strong> Pan-Tompkins QRS detection is like finding skyscrapers in a city skyline photo: first you blur out clouds and tiny bushes (5–15 Hz bandpass), then you measure only steep vertical walls (Derivative / FSV), square the numbers so tall walls tower above everything else (x<sup>2</sup>), and smooth each building into one solid block (Moving Window Integration) to count the heartbeats.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            SECTION 2: COMPLETE BIOMEDICAL ENGINEERING TECHNICAL REPORT
            ===================================================================== */}
        <div className="rounded-2xl border-2 border-[#09318D] bg-white p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-[#09318D]/15">
            <FileText className="w-5 h-5 text-[#09318D]" />
            <h2 className="text-xl font-bold text-[#09318D]">
              2. Complete Biomedical Engineering Technical Report &amp; Simplifying Assumptions
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#09318D]/90 leading-relaxed">
            {/* 2.1 Operating Principle */}
            <div className="p-4 rounded-xl bg-[#09318D]/[0.03] border border-[#09318D]/15">
              <h3 className="text-sm font-bold text-[#09318D]">
                2.1 Operating Principle (Biophysical Transduction &amp; DSP)
              </h3>
              <p className="mt-2">
                Clinical electrocardiography measures body-surface potential differences (~0.5 to 5.0 mV) generated by extracellular cardiac depolarization and repolarization waves. Ag/AgCl hydrogel electrodes (Baxter Resting Tab Ref 108071: 10 Hz ACZ 728–806 Ω; Baxter Monitoring Snap Ref 108070: 10 Hz ACZ 58–93 Ω) transduce dermal ionic flux into electron current across a reversible redox half-cell.
              </p>
              <p className="mt-2">
                In <code className="font-mono font-bold">class ECGSimulationEngine</code>, the 3D cardiac vector loop is synthesized at <span className="font-mono">f<sub>s</sub> = 360 Hz</span> using a McSharry et al. (2003) five-Gaussian dipole model projected onto Einthoven’s frontal limb leads (I, II, III) and conditioned by a causal Direct-Form II Transposed Biquad IIR cascade.
              </p>
            </div>

            {/* 2.2 Simplifying Assumptions */}
            <div className="p-4 rounded-xl bg-[#09318D]/[0.03] border border-[#09318D]/15">
              <h3 className="text-sm font-bold text-[#09318D]">
                2.2 Simplifying Mathematical Assumptions
              </h3>
              <ul className="mt-2 space-y-1.5 list-disc list-inside">
                <li>
                  <strong>Homogeneous Torso Volume Conductor:</strong> The human thorax is modeled as a linear, isotropic, purely resistive volume conductor where Burger’s lead vectors align with Einthoven’s equilateral triangle (0°, +60°, +120°).
                </li>
                <li>
                  <strong>Stationary Limit-Cycle Pacemaker:</strong> For any fixed Heart Rate slider setting, the sinoatrial (SA) node angular velocity <span className="font-mono">ω</span> is strictly periodic, omitting beat-to-beat autonomic Heart Rate Variability (HRV) so that filter SNR and FSV metrics can be benchmarked deterministically.
                </li>
                <li>
                  <strong>Additive Superposition of Artifacts:</strong> 50 Hz capacitive coupling, 0.25 Hz respiratory baseline wander, and zero-mean Gaussian EMG muscle noise are modeled as linear additive perturbations prior to the instrumentation amplifier.
                </li>
              </ul>
            </div>

            {/* 2.3 Engineering & WhaleTeq IEC 60601 Limitations */}
            <div className="p-4 rounded-xl bg-[#09318D]/[0.03] border border-[#09318D]/15">
              <h3 className="text-sm font-bold text-[#09318D]">
                2.3 WhaleTeq &amp; IEC 60601-2-25 / 2-27 / 2-47 / 2-51 Filter Limitations
              </h3>
              <ul className="mt-2 space-y-1.5 list-disc list-inside">
                <li>
                  <strong>CAL20160 ST-Segment Erasure:</strong> Applying a 0.67 Hz monitoring high-pass filter (<span className="font-mono">τ = 0.25 s</span>) to <code className="font-mono">CAL20160</code> (+0.2 mV elevated ST) discharges the coupling capacitor (<span className="font-mono">V<sub>out</sub> = V<sub>in</sub> − V<sub>c</sub></span>), erasing the +0.2 mV ST elevation and creating a false −0.34 V undershoot.
                </li>
                <li>
                  <strong>300 mVs Impulse vs. Overload Recovery:</strong> A 0.05 Hz single-pole HPF (<span className="font-mono">τ = 3.18 s</span>) takes 10–15 s to recover after a 1 V overload (requiring a FET de-blocking switch), and on the 300 mVs impulse test yields 93 μV overshoot (limit ≤100 μV) and 291 μV/s slope (passing IEC 60601-2-27 ≤300 μV/s, failing IEC 60601-2-51 ≤250 μV/s).
                </li>
                <li>
                  <strong>CAL20502 Neonatal QRS Loss &amp; ANE20000 Ringing:</strong> Single-pole 40 Hz LPF reduces neonatal QRS peaks by 11.8% (30 Hz LPF loses 20.4%), while high-Q 50/60 Hz notch filters ring on steep QRS edges (<code className="font-mono">ANE20000</code>).
                </li>
              </ul>
            </div>

            {/* 2.4 Control Demonstration Guide */}
            <div className="p-4 rounded-xl bg-[#09318D]/[0.03] border border-[#09318D]/15">
              <h3 className="text-sm font-bold text-[#09318D]">
                2.4 Step-by-Step IEC Verification Guide
              </h3>
              <ul className="mt-2 space-y-1.5 list-disc list-inside">
                <li>
                  <strong>IEC Test 1 (50 Hz Mains Hum, ΔZ<sub>e</sub> Mismatch &amp; CMRR):</strong> Click <em>&quot;Run IEC Test 1&quot;</em> (<span className="font-mono">ΔZ<sub>e</sub> = 80 kΩ, CMRR = 80 dB, Notch OFF</span>). Observe <span className="font-mono">1.62 mV</span> differential artifact, then toggle <em>50 Hz Notch ON</em> to restore SNR (&gt;22 dB).
                </li>
                <li>
                  <strong>IEC Test 2 (WhaleTeq CAL20160 ST Distortion):</strong> Click <em>&quot;Run IEC Test 2&quot;</em> (<span className="font-mono">Wander = 0.50 mV, High-Pass = 0.05 Hz vs 0.67–1.50 Hz</span>). Compare the green filtered trace against the pink dashed <span className="font-mono">V<sub>clean</sub>(t)</span> reference to see post-QRS ST depression (&gt;0.10 mV).
                </li>
                <li>
                  <strong>IEC Test 3 (WhaleTeq CAL20502 Low-Pass Attenuation):</strong> Click <em>&quot;Run IEC Test 3&quot;</em> (<span className="font-mono">HR = 120 bpm, EMG = 0.15 mV, Low-Pass = 30 Hz / 20 Hz</span>). Observe 20.4% to 32.5% R-peak reduction and ~3 ms phase delay.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* =====================================================================
            SECTION 3: QUANTITATIVE ENGINE VERIFICATION MATRIX
            ===================================================================== */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#09318D]" />
              <h2 className="text-xl font-bold text-[#09318D]">
                3. Quantitative IEC 60601-2-25 Verification Suite (Expected vs. Observed Table)
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setReRunCounter((c) => c + 1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FD91CC] text-[#09318D] font-bold text-xs hover:bg-[#FD91CC]/85 transition-colors cursor-pointer self-start"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Re-Run IEC Verification Suite</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border-2 border-[#09318D]/20">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#09318D] text-white font-mono text-xs">
                  <th className="py-3.5 px-4">IEC Verification Scenario &amp; Parameters</th>
                  <th className="py-3.5 px-4">Expected Theoretical Outcome</th>
                  <th className="py-3.5 px-4">Observed Engine Telemetry</th>
                  <th className="py-3.5 px-4">Key Metric</th>
                  <th className="py-3.5 px-4">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#09318D]/15 text-xs">
                {benchmarkLogs.map((row) => (
                  <tr key={row.id} className="bg-white hover:bg-[#09318D]/[0.02]">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#09318D]">{row.testTitle}</p>
                      <p className="font-mono text-[11px] text-[#09318D]/70 mt-0.5">
                        {row.configuredInputs}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-[#09318D]/85">{row.expectedResult}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-[#09318D]">
                      {row.observedResult}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#09318D] whitespace-nowrap">
                      {row.keyMetricBadge}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FD91CC]/30 text-[#09318D]">
                        <CheckCircle2 className="w-4 h-4 text-[#09318D]" />
                        <span>{row.passed ? 'VERIFIED PASS' : 'CHECK'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
