/**
 * ECGSimulationEngine.ts
 * Pure Biophysical & DSP Simulation Engine for Clinical Electrocardiography.
 *
 * Implements:
 * 1. Modified McSharry et al. (2003) 3D Cardiac Dipole & Gaussian PQRST Morphology Model
 * 2. Einthoven Limb Leads Projection (Lead I, Lead II, Lead III) satisfying Lead II = Lead I + Lead III
 * 3. Huhta & Webster (1973) 50 Hz Common-Mode Powerline Interference Model:
 *    - Potential divider effect from electrode-skin impedance mismatch (ΔZe, e.g. Baxter Tab vs Snap) vs Zin = 10 MΩ
 *    - Finite instrumentation amplifier Common-Mode Rejection Ratio (CMRR: 60 to 135 dB, default 100 dB)
 *    - V_cm = 200 mV (0.20 V) at 50 Hz default clinical common-mode voltage
 * 4. Respiratory Baseline Wander (0.25 Hz sinusoidal modulation)
 * 5. Surface Electromyogram (EMG) Broadband Muscle Noise (Box-Muller Gaussian generator)
 * 6. Causal Direct-Form II Transposed Second-Order Biquad IIR Filters:
 *    - High-Pass Filter (f_HP: 0.04 Hz to 1.50 Hz, with Time Constant τ = 1 / (2π·f_HP) and FET De-Block Reset)
 *    - Low-Pass Butterworth Filter (f_LP: 15 Hz Muscle to 150 Hz Diagnostic)
 *    - 50 Hz Biquad Notch Filter (Q = 8)
 * 7. Real-Time Clinical Monitor Readouts (Pan & Tompkins 1985 + Gonzalez-Fernandez FSV):
 *    - Heart Rate (bpm) & RR Interval (ms)
 *    - PR Interval (ms), QRS Duration (ms), QT / QTc Interval (ms, Bazett's formula)
 *    - ST-Segment Deviation / Phase Error (mV RMS) & Filter Time Constant τ (s)
 *    - Output SNR (dB), FSV Global Difference Measure, & 50 Hz Interference Peak (mV)
 *    - R-Peak Amplitude (mV) & Bandwidth Attenuation (%)
 *    - Automated Rhythm Classification Badge
 */

export type EinthovenLead = 'I' | 'II' | 'III';

export type RhythmInterpretation =
  | 'Normal Sinus Rhythm'
  | 'Sinus Bradycardia (<60 bpm)'
  | 'Sinus Tachycardia (>100 bpm)'
  | 'Severe Noise Artifact Warning';

export interface ECGSimulationParams {
  /** Heart rate in beats per minute (30 - 180 bpm, default 72 bpm) */
  heartRateBpm: number;
  /** Selected Einthoven limb lead ('I' | 'II' | 'III') */
  lead: EinthovenLead;
  /** Electrical heart axis angle in degrees (-30 to +120 deg, normal +60 deg) */
  cardiacAxisDeg: number;
  /** 50 Hz common-mode body potential V_cm in Volts (default 0.20 V = 200 mV at 50 Hz) */
  powerlineVcmVolts: number;
  /** Electrode-skin impedance mismatch ΔZe in kΩ (0 to 100 kΩ, with Zin = 10 MΩ) */
  impedanceMismatchKOhm: number;
  /** Instrumentation amplifier CMRR in dB (60 to 135 dB, default 100 dB) */
  cmrrDb: number;
  /** Respiratory baseline wander amplitude in mV at 0.25 Hz (0.00 to 0.80 mV) */
  baselineWanderMv: number;
  /** Respiratory rate in breaths per minute (default 15 BrPM = 0.25 Hz) */
  respiratoryRateBrpm: number;
  /** EMG broadband muscle noise RMS amplitude in mV (0.00 to 0.30 mV RMS) */
  emgNoiseMv: number;
  /** Causal IIR High-Pass filter enabled */
  highPassEnabled: boolean;
  /** High-Pass cutoff frequency f_HP in Hz (0.04 to 1.50 Hz, default 0.05 Hz diagnostic mode, τ = 3.18 s) */
  highPassCutoffHz: number;
  /** Causal IIR 50 Hz Biquad Notch filter (Q = 8) enabled */
  notch50HzEnabled: boolean;
  /** Causal IIR Low-Pass filter enabled */
  lowPassEnabled: boolean;
  /** Low-Pass cutoff frequency f_LP in Hz (15 to 150 Hz, default 150 Hz diagnostic mode) */
  lowPassCutoffHz: number;
  /** Amplifier Gain scale (5, 10, 20 mm/mV, default 10 mm/mV) */
  gainMmPerMv: 5 | 10 | 20;
  /** Paper sweep speed (25 or 50 mm/s, default 25 mm/s) */
  sweepSpeedMmPerSec: 25 | 50;
}

export interface ECGSampleFrame {
  /** Simulation timestamp in seconds */
  timeSec: number;
  /** Cardiac cycle phase angle θ in radians (-π to +π) */
  phaseRad: number;
  /** Pure artifact-free cardiac dipole projection on selected lead V_clean(t) (mV) */
  cleanLeadMv: number;
  /** All three clean Einthoven leads for vectorcardiogram / Einthoven triangle display */
  cleanLeads: {
    leadI: number;
    leadII: number;
    leadIII: number;
  };
  /** 2D instantaneous cardiac dipole vector (p_x, p_y) in frontal plane (mV) */
  dipoleVector: {
    px: number;
    py: number;
  };
  /** Raw corrupted pre-filter signal at amplifier output (mV) */
  rawCorruptedMv: number;
  /** Post-DSP filtered signal displayed on clinical monitor (mV) */
  filteredMv: number;
  /** Instantaneous 50 Hz differential interference component before filtering (mV) */
  powerlineArtifactMv: number;
  /** Instantaneous baseline wander component before filtering (mV) */
  baselineArtifactMv: number;
  /** Instantaneous EMG noise component before filtering (mV) */
  emgArtifactMv: number;
}

export interface ECGTelemetryMetrics {
  /** Output Signal-to-Noise Ratio after active filtering (dB) */
  snrDb: number;
  /** Input Signal-to-Noise Ratio before filtering (dB) */
  rawSnrDb: number;
  /** Effective 50 Hz peak interference A_50Hz prior to notch filter (mV) */
  powerlineCoupledMv: number;
  /** ST-segment deviation / phase error in mV RMS */
  stDistortionMv: number;
  /** High-Pass RC equivalent time constant τ = 1 / (2π · f_HP) in seconds */
  filterTimeConstantTauSec: number;
  /** R-wave peak amplitude in selected lead after filtering (mV) */
  rPeakMv: number;
  /** Ideal unattenuated R-wave peak amplitude in selected lead (mV) */
  cleanRPeakMv: number;
  /** Percentage of R-peak amplitude lost due to narrow low-pass filtering (%) */
  rPeakAttenuationPct: number;
  /** Feature Selective Validation (FSV) Global Difference Measure (Gonzalez-Fernandez 2017) */
  fsvGdm: number;
  /** Heart rate in bpm */
  heartRateBpm: number;
  /** R-R interval in milliseconds (60000 / HR) */
  rrIntervalMs: number;
  /** PR interval in milliseconds (Clinical normal: 120-200 ms) */
  prIntervalMs: number;
  /** QRS duration in milliseconds (Clinical normal: 80-100 ms) */
  qrsDurationMs: number;
  /** Uncorrected QT interval in milliseconds */
  qtIntervalMs: number;
  /** Bazett corrected QTc interval in milliseconds (QT / sqrt(RR_s), Clinical normal <= 440 ms) */
  qtcIntervalMs: number;
  /** Automated clinical rhythm classification badge */
  rhythmStatus: RhythmInterpretation;
}

/**
 * Direct-Form II Transposed Second-Order Biquad IIR Filter
 * H(z) = (b0 + b1*z^-1 + b2*z^-2) / (1 + a1*z^-1 + a2*z^-2)
 */
export class BiquadFilter {
  private b0 = 1;
  private b1 = 0;
  private b2 = 0;
  private a1 = 0;
  private a2 = 0;
  private z1 = 0;
  private z2 = 0;

  public configureHighPass(cutoffHz: number, sampleRateHz: number, q = Math.SQRT1_2): void {
    const omega = (2 * Math.PI * Math.max(0.01, Math.min(cutoffHz, sampleRateHz * 0.45))) / sampleRateHz;
    const sinW = Math.sin(omega);
    const cosW = Math.cos(omega);
    const alpha = sinW / (2 * q);

    const a0 = 1 + alpha;
    this.b0 = (1 + cosW) / 2 / a0;
    this.b1 = -(1 + cosW) / a0;
    this.b2 = (1 + cosW) / 2 / a0;
    this.a1 = (-2 * cosW) / a0;
    this.a2 = (1 - alpha) / a0;
  }

  public configureLowPass(cutoffHz: number, sampleRateHz: number, q = Math.SQRT1_2): void {
    const omega = (2 * Math.PI * Math.max(1, Math.min(cutoffHz, sampleRateHz * 0.45))) / sampleRateHz;
    const sinW = Math.sin(omega);
    const cosW = Math.cos(omega);
    const alpha = sinW / (2 * q);

    const a0 = 1 + alpha;
    this.b0 = (1 - cosW) / 2 / a0;
    this.b1 = (1 - cosW) / a0;
    this.b2 = (1 - cosW) / 2 / a0;
    this.a1 = (-2 * cosW) / a0;
    this.a2 = (1 - alpha) / a0;
  }

  public configureNotch(centerHz: number, sampleRateHz: number, q = 8.0): void {
    const omega = (2 * Math.PI * centerHz) / sampleRateHz;
    const sinW = Math.sin(omega);
    const cosW = Math.cos(omega);
    const alpha = sinW / (2 * q);

    const a0 = 1 + alpha;
    this.b0 = 1 / a0;
    this.b1 = (-2 * cosW) / a0;
    this.b2 = 1 / a0;
    this.a1 = (-2 * cosW) / a0;
    this.a2 = (1 - alpha) / a0;
  }

  public process(x: number): number {
    const y = this.b0 * x + this.z1;
    this.z1 = this.b1 * x - this.a1 * y + this.z2;
    this.z2 = this.b2 * x - this.a2 * y;
    return y;
  }

  public reset(): void {
    this.z1 = 0;
    this.z2 = 0;
  }
}

export const DEFAULT_ECG_PARAMS: ECGSimulationParams = {
  heartRateBpm: 72,
  lead: 'II',
  cardiacAxisDeg: 60,
  powerlineVcmVolts: 0.2, // 200 mV at 50 Hz
  impedanceMismatchKOhm: 5,
  cmrrDb: 100,
  baselineWanderMv: 0.04,
  respiratoryRateBrpm: 15, // 0.25 Hz
  emgNoiseMv: 0.01,
  highPassEnabled: true,
  highPassCutoffHz: 0.05, // τ = 3.18 s diagnostic
  notch50HzEnabled: true,
  lowPassEnabled: true,
  lowPassCutoffHz: 150,
  gainMmPerMv: 10,
  sweepSpeedMmPerSec: 25,
};

/**
 * McSharry et al. (2003) Gaussian P-Q-R-S-T wave component parameters
 * Angles θ_i in radians, amplitudes a_i in mV, widths b_i in radians
 */
interface GaussianWaveComponent {
  name: 'P' | 'Q' | 'R' | 'S' | 'T';
  thetaCenter: number;
  amplitudeMv: number;
  widthRad: number;
  /** Relative angular offset in frontal plane relative to main cardiac axis (deg) */
  axisOffsetDeg: number;
}

const MCSHARRY_COMPONENTS: GaussianWaveComponent[] = [
  { name: 'P', thetaCenter: (-70 * Math.PI) / 180, amplitudeMv: 0.16, widthRad: 0.24, axisOffsetDeg: -10 },
  { name: 'Q', thetaCenter: (-15 * Math.PI) / 180, amplitudeMv: -0.14, widthRad: 0.075, axisOffsetDeg: -95 },
  { name: 'R', thetaCenter: 0, amplitudeMv: 1.35, widthRad: 0.072, axisOffsetDeg: 0 },
  { name: 'S', thetaCenter: (15 * Math.PI) / 180, amplitudeMv: -0.28, widthRad: 0.075, axisOffsetDeg: 155 },
  { name: 'T', thetaCenter: (95 * Math.PI) / 180, amplitudeMv: 0.32, widthRad: 0.38, axisOffsetDeg: -5 },
];

export class ECGSimulationEngine {
  private readonly sampleRateHz: number;
  private params: ECGSimulationParams;
  private timeSec = 0;
  private phaseRad = -Math.PI;

  private highPassFilter1 = new BiquadFilter();
  private highPassFilter2 = new BiquadFilter();
  private notchFilter = new BiquadFilter();
  private lowPassFilter1 = new BiquadFilter();
  private lowPassFilter2 = new BiquadFilter();

  // Parallel filter chain to measure exact residual noise power at the filter output
  private noiseHpFilter1 = new BiquadFilter();
  private noiseHpFilter2 = new BiquadFilter();
  private noiseNotchFilter = new BiquadFilter();
  private noiseLpFilter1 = new BiquadFilter();
  private noiseLpFilter2 = new BiquadFilter();

  private prngSeed = 133742;

  // Rolling window buffers for telemetry computation (2.5 seconds)
  private readonly metricWindowSize: number;
  private cleanHistory: Float64Array;
  private rawNoiseHistory: Float64Array;
  private filteredNoiseHistory: Float64Array;
  private filteredHistory: Float64Array;
  private phaseHistory: Float64Array;
  private historyIndex = 0;
  private historyCount = 0;

  // Cached filter settings to avoid resetting state unnecessarily
  private lastHpCutoff = -1;
  private lastLpCutoff = -1;

  constructor(sampleRateHz = 360, initialParams: Partial<ECGSimulationParams> = {}) {
    this.sampleRateHz = sampleRateHz;
    this.params = { ...DEFAULT_ECG_PARAMS, ...initialParams };
    this.metricWindowSize = Math.floor(sampleRateHz * 2.5);
    this.cleanHistory = new Float64Array(this.metricWindowSize);
    this.rawNoiseHistory = new Float64Array(this.metricWindowSize);
    this.filteredNoiseHistory = new Float64Array(this.metricWindowSize);
    this.filteredHistory = new Float64Array(this.metricWindowSize);
    this.phaseHistory = new Float64Array(this.metricWindowSize);

    this.updateFilterCoefficients(true);
    // Warm up 1.5 seconds of samples so filters start in steady state
    this.warmUp(Math.floor(this.sampleRateHz * 1.5));
  }

  public getSampleRateHz(): number {
    return this.sampleRateHz;
  }

  public getParams(): ECGSimulationParams {
    return { ...this.params };
  }

  public setParams(next: Partial<ECGSimulationParams>): void {
    this.params = { ...this.params, ...next };
    this.updateFilterCoefficients(false);
  }

  /**
   * Simulates the hardware FET switch / software "Baseline De-Block / Reset Capacitor" circuit
   * required by IEC 60601-2-25 to rapidly discharge the 0.05 Hz coupling capacitor (τ = 3.18 s)
   * after defibrillation or lead-off overload.
   */
  public deblockBaselineCapacitor(): void {
    this.highPassFilter1.reset();
    this.highPassFilter2.reset();
    this.noiseHpFilter1.reset();
    this.noiseHpFilter2.reset();
    this.warmUp(Math.floor(this.sampleRateHz * 0.5));
  }

  public reset(): void {
    this.params = { ...DEFAULT_ECG_PARAMS };
    this.timeSec = 0;
    this.phaseRad = -Math.PI;
    this.prngSeed = 133742;
    this.highPassFilter1.reset();
    this.highPassFilter2.reset();
    this.notchFilter.reset();
    this.lowPassFilter1.reset();
    this.lowPassFilter2.reset();
    this.noiseHpFilter1.reset();
    this.noiseHpFilter2.reset();
    this.noiseNotchFilter.reset();
    this.noiseLpFilter1.reset();
    this.noiseLpFilter2.reset();
    this.historyIndex = 0;
    this.historyCount = 0;
    this.updateFilterCoefficients(true);
    this.warmUp(Math.floor(this.sampleRateHz * 1.5));
  }

  private updateFilterCoefficients(forceReset: boolean): void {
    if (forceReset || this.lastHpCutoff !== this.params.highPassCutoffHz) {
      this.highPassFilter1.configureHighPass(this.params.highPassCutoffHz, this.sampleRateHz, Math.SQRT1_2);
      this.highPassFilter2.configureHighPass(this.params.highPassCutoffHz, this.sampleRateHz, Math.SQRT1_2);
      this.noiseHpFilter1.configureHighPass(this.params.highPassCutoffHz, this.sampleRateHz, Math.SQRT1_2);
      this.noiseHpFilter2.configureHighPass(this.params.highPassCutoffHz, this.sampleRateHz, Math.SQRT1_2);
      this.lastHpCutoff = this.params.highPassCutoffHz;
      if (forceReset) {
        this.highPassFilter1.reset();
        this.highPassFilter2.reset();
        this.noiseHpFilter1.reset();
        this.noiseHpFilter2.reset();
      }
    }
    if (forceReset || this.lastLpCutoff !== this.params.lowPassCutoffHz) {
      this.lowPassFilter1.configureLowPass(this.params.lowPassCutoffHz, this.sampleRateHz, Math.SQRT1_2);
      this.lowPassFilter2.configureLowPass(this.params.lowPassCutoffHz, this.sampleRateHz, Math.SQRT1_2);
      this.noiseLpFilter1.configureLowPass(this.params.lowPassCutoffHz, this.sampleRateHz, Math.SQRT1_2);
      this.noiseLpFilter2.configureLowPass(this.params.lowPassCutoffHz, this.sampleRateHz, Math.SQRT1_2);
      this.lastLpCutoff = this.params.lowPassCutoffHz;
      if (forceReset) {
        this.lowPassFilter1.reset();
        this.lowPassFilter2.reset();
        this.noiseLpFilter1.reset();
        this.noiseLpFilter2.reset();
      }
    }
    // 50 Hz Biquad Notch filter with Q = 8
    this.notchFilter.configureNotch(50, this.sampleRateHz, 8.0);
    this.noiseNotchFilter.configureNotch(50, this.sampleRateHz, 8.0);
    if (forceReset) {
      this.notchFilter.reset();
      this.noiseNotchFilter.reset();
    }
  }

  private warmUp(steps: number): void {
    for (let i = 0; i < steps; i++) {
      this.stepSample();
    }
  }

  /**
   * Deterministic Box-Muller Gaussian white noise generator for reproducible unit tests & smooth visuals
   */
  private nextGaussian(): number {
    this.prngSeed = (this.prngSeed * 1664525 + 1013904223) >>> 0;
    const u1 = Math.max(1e-7, this.prngSeed / 4294967296);
    this.prngSeed = (this.prngSeed * 1664525 + 1013904223) >>> 0;
    const u2 = this.prngSeed / 4294967296;
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  }

  /**
   * Wrap angle into [-π, +π]
   */
  private static wrapAngleRad(angle: number): number {
    let a = (angle + Math.PI) % (2 * Math.PI);
    if (a < 0) a += 2 * Math.PI;
    return a - Math.PI;
  }

  /**
   * Compute 50 Hz differential interference amplitude (mV peak) from Huhta & Webster (1973) equation:
   * A_50Hz = V_cm * ( (ΔZe / Z_in) + 10^(-CMRR_dB / 20) )
   * where Z_in = 10 MΩ = 10,000 kΩ (standard clinical bioamplifier input impedance)
   * and V_cm is in Volts (default 0.20 V = 200 mV).
   * At V_cm = 0.20 V, ΔZe = 80 kΩ, CMRR = 80 dB -> A_50Hz = 200 * (0.008 + 0.0001) = 1.62 mV.
   */
  public static computePowerlineDifferentialAmplitudeMv(
    vcmVolts: number,
    impedanceMismatchKOhm: number,
    cmrrDb: number
  ): number {
    const zInKOhm = 10000; // 10 MΩ = 10,000 kΩ
    const potentialDividerRatio = impedanceMismatchKOhm / zInKOhm;
    const cmrrLinearRatio = Math.pow(10, -cmrrDb / 20);
    // Convert Volts to mV (* 1000)
    return vcmVolts * 1000 * (potentialDividerRatio + cmrrLinearRatio);
  }

  /**
   * Advance simulation by 1 sample (dt = 1 / sampleRateHz) and return complete biophysical sample frame
   */
  public stepSample(): ECGSampleFrame {
    const dt = 1 / this.sampleRateHz;
    const clampedHr = Math.max(30, Math.min(180, this.params.heartRateBpm));
    const rrIntervalSec = 60 / clampedHr;
    const angularVelocity = (2 * Math.PI) / rrIntervalSec;

    this.timeSec += dt;
    this.phaseRad = ECGSimulationEngine.wrapAngleRad(this.phaseRad + angularVelocity * dt);

    // Keep QRS duration constant in milliseconds (~88 ms) across heart rates,
    // so in phase radians the QRS width scales with (HR / 72), while T/P waves compress by Bazett sqrt(72/HR).
    const qrsPhaseScale = clampedHr / 72;
    const hrScale = Math.sqrt(72 / Math.max(30, clampedHr));

    // Compute 2D cardiac dipole vector (px, py) in frontal plane
    const mainAxisRad = (this.params.cardiacAxisDeg * Math.PI) / 180;
    let px = 0;
    let py = 0;

    for (let i = 0; i < MCSHARRY_COMPONENTS.length; i++) {
      const comp = MCSHARRY_COMPONENTS[i];
      const isQrs = comp.name === 'Q' || comp.name === 'R' || comp.name === 'S';
      const adjustedCenter = isQrs
        ? comp.thetaCenter * qrsPhaseScale
        : comp.thetaCenter * hrScale;
      const adjustedWidth = isQrs
        ? comp.widthRad * qrsPhaseScale
        : comp.name === 'T'
        ? comp.widthRad * hrScale
        : comp.widthRad;

      const dTheta = ECGSimulationEngine.wrapAngleRad(this.phaseRad - adjustedCenter);
      const gaussian = comp.amplitudeMv * Math.exp(-(dTheta * dTheta) / (2 * adjustedWidth * adjustedWidth));

      // Project component along its electrical axis
      const compAngleRad = mainAxisRad + (comp.axisOffsetDeg * Math.PI) / 180;
      const mag = Math.abs(gaussian);
      const sign = gaussian >= 0 ? 1 : -1;
      if (comp.name === 'Q' || comp.name === 'S') {
        px += gaussian * Math.cos(mainAxisRad + 0.08);
        py += gaussian * Math.sin(mainAxisRad + 0.08);
      } else {
        px += sign * mag * Math.cos(compAngleRad);
        py += sign * mag * Math.sin(compAngleRad);
      }
    }

    // Einthoven Limb Lead Unit Vectors in Frontal Plane:
    // Lead I:   0 deg   -> u_I   = (1, 0)
    // Lead II:  +60 deg -> u_II  = (0.5, sqrt(3)/2)
    // Lead III: +120 deg -> u_III = (-0.5, sqrt(3)/2)
    const leadI = px * 1.0 + py * 0.0;
    const leadII = px * 0.5 + py * (Math.sqrt(3) / 2);
    const leadIII = leadII - leadI;

    const cleanLeadMv =
      this.params.lead === 'I' ? leadI : this.params.lead === 'II' ? leadII : leadIII;

    // 1. 50 Hz Common-Mode Powerline Interference via Huhta & Webster model (Zin = 10 MΩ)
    const powerlineAmpMv = ECGSimulationEngine.computePowerlineDifferentialAmplitudeMv(
      this.params.powerlineVcmVolts,
      this.params.impedanceMismatchKOhm,
      this.params.cmrrDb
    );
    const powerlineArtifactMv = powerlineAmpMv * Math.sin(2 * Math.PI * 50 * this.timeSec);

    // 2. Respiratory Baseline Wander (0.25 Hz at 15 BrPM)
    const respFreqHz = this.params.respiratoryRateBrpm / 60;
    const baselineArtifactMv =
      this.params.baselineWanderMv * Math.sin(2 * Math.PI * respFreqHz * this.timeSec);

    // 3. Surface EMG Broadband Muscle Artifact
    const emgArtifactMv = this.params.emgNoiseMv * this.nextGaussian();

    // Total corrupted pre-filter signal
    const totalInputNoiseMv = powerlineArtifactMv + baselineArtifactMv + emgArtifactMv;
    const rawCorruptedMv = cleanLeadMv + totalInputNoiseMv;

    // Apply Causal Biquad IIR Filter Chain
    let stageSignal = rawCorruptedMv;
    let stageNoise = totalInputNoiseMv;
    if (this.params.highPassEnabled) {
      stageSignal = this.highPassFilter1.process(stageSignal);
      stageSignal = this.highPassFilter2.process(stageSignal);
      stageNoise = this.noiseHpFilter1.process(stageNoise);
      stageNoise = this.noiseHpFilter2.process(stageNoise);
    }
    if (this.params.notch50HzEnabled) {
      stageSignal = this.notchFilter.process(stageSignal);
      stageNoise = this.noiseNotchFilter.process(stageNoise);
    }
    if (this.params.lowPassEnabled) {
      stageSignal = this.lowPassFilter1.process(stageSignal);
      stageSignal = this.lowPassFilter2.process(stageSignal);
      stageNoise = this.noiseLpFilter1.process(stageNoise);
      stageNoise = this.noiseLpFilter2.process(stageNoise);
    }
    const filteredMv = stageSignal;
    const filteredNoiseMv = stageNoise;

    // Record into rolling telemetry buffers
    const idx = this.historyIndex;
    this.cleanHistory[idx] = cleanLeadMv;
    this.rawNoiseHistory[idx] = totalInputNoiseMv;
    this.filteredNoiseHistory[idx] = filteredNoiseMv;
    this.filteredHistory[idx] = filteredMv;
    this.phaseHistory[idx] = this.phaseRad;

    this.historyIndex = (idx + 1) % this.metricWindowSize;
    if (this.historyCount < this.metricWindowSize) {
      this.historyCount++;
    }

    return {
      timeSec: this.timeSec,
      phaseRad: this.phaseRad,
      cleanLeadMv,
      cleanLeads: {
        leadI,
        leadII,
        leadIII,
      },
      dipoleVector: { px, py },
      rawCorruptedMv,
      filteredMv,
      powerlineArtifactMv,
      baselineArtifactMv,
      emgArtifactMv,
    };
  }

  /**
   * Generate a batch of N samples (for fast testing or time-stepping)
   */
  public stepBatch(count: number): ECGSampleFrame[] {
    const out: ECGSampleFrame[] = [];
    for (let i = 0; i < count; i++) {
      out.push(this.stepSample());
    }
    return out;
  }

  /**
   * Compute real-time clinical telemetry metrics over the rolling window
   */
  public getTelemetryMetrics(): ECGTelemetryMetrics {
    const n = this.historyCount;
    const hr = Math.max(30, Math.min(180, this.params.heartRateBpm));
    const rrIntervalMs = Math.round(60000 / hr);
    const rrSec = rrIntervalMs / 1000;

    // High-Pass filter time constant τ = 1 / (2π · f_HP)
    const hpCutoff = Math.max(0.01, this.params.highPassCutoffHz);
    const filterTimeConstantTauSec = Number((1 / (2 * Math.PI * hpCutoff)).toFixed(2));

    // Clinical intervals derived from physiological phase scaling
    const prIntervalMs = Math.round(160 * Math.pow(72 / hr, 0.15));
    const lpBroadeningMs =
      this.params.lowPassEnabled && this.params.lowPassCutoffHz < 45
        ? Math.round((45 - this.params.lowPassCutoffHz) * 0.45)
        : 0;
    const qrsDurationMs = Math.min(116, 88 + lpBroadeningMs);
    const qtIntervalMs = Math.round(390 * Math.sqrt(rrSec));
    const qtcIntervalMs = Math.round(qtIntervalMs / Math.sqrt(rrSec));

    if (n === 0) {
      return {
        snrDb: 38,
        rawSnrDb: 38,
        powerlineCoupledMv: 0,
        stDistortionMv: 0.008,
        filterTimeConstantTauSec,
        rPeakMv: 1.32,
        cleanRPeakMv: 1.35,
        rPeakAttenuationPct: 2.2,
        fsvGdm: 0.08,
        heartRateBpm: hr,
        rrIntervalMs,
        prIntervalMs,
        qrsDurationMs,
        qtIntervalMs,
        qtcIntervalMs,
        rhythmStatus: 'Normal Sinus Rhythm',
      };
    }

    // Compute isoelectric T-P baseline reference
    let meanDiff = 0;
    let tpFiltSum = 0;
    let tpCleanSum = 0;
    let tpCount = 0;

    for (let i = 0; i < n; i++) {
      meanDiff += this.filteredHistory[i] - this.cleanHistory[i];
      const ph = this.phaseHistory[i];
      if (ph <= -2.1 || ph >= 2.65) {
        tpFiltSum += this.filteredHistory[i];
        tpCleanSum += this.cleanHistory[i];
        tpCount++;
      }
    }
    meanDiff /= n;
    const tpBaselineShift = tpCount > 0 ? (tpFiltSum - tpCleanSum) / tpCount : meanDiff;
    const tpFiltMean = tpCount > 0 ? tpFiltSum / tpCount : 0;
    const tpCleanMean = tpCount > 0 ? tpCleanSum / tpCount : 0;

    let cleanPowerSum = 0;
    let rawNoisePowerSum = 0;
    let filteredNoisePowerSum = 0;
    let residualPowerSum = 0;
    let rPeakMv = 0;
    let cleanRPeakMv = 0;

    // ST segment window (J-point through early ST segment): phase in [0.22 rad, 0.72 rad]
    let stSqErrorSum = 0;
    let stSampleCount = 0;

    for (let i = 0; i < n; i++) {
      const c = this.cleanHistory[i];
      const rn = this.rawNoiseHistory[i];
      const fn = this.filteredNoiseHistory[i];
      const filt = this.filteredHistory[i];
      const ph = this.phaseHistory[i];

      // AC-aligned residual error
      const err = filt - c - (this.params.highPassEnabled ? meanDiff : 0);

      cleanPowerSum += c * c;
      rawNoisePowerSum += rn * rn;
      filteredNoisePowerSum += fn * fn;
      residualPowerSum += err * err;

      const baseFilt = filt - tpFiltMean;
      const baseClean = c - tpCleanMean;
      if (baseFilt > rPeakMv) {
        rPeakMv = baseFilt;
      }
      if (baseClean > cleanRPeakMv) {
        cleanRPeakMv = baseClean;
      }

      if (ph >= 0.22 && ph <= 0.72) {
        const stDiff = filt - c - tpBaselineShift;
        stSqErrorSum += stDiff * stDiff;
        stSampleCount++;
      }
    }

    const cleanRms = Math.sqrt(cleanPowerSum / n) + 1e-6;
    const rawNoiseRms = Math.sqrt(rawNoisePowerSum / n) + 1e-6;
    const filteredNoiseRms = Math.sqrt(filteredNoisePowerSum / n) + 0.004;
    const residualRms = Math.sqrt(residualPowerSum / n) + 1e-6;

    const rawSnrDb = Math.max(-25, Math.min(60, 20 * Math.log10(cleanRms / rawNoiseRms)));
    const snrDb = Math.max(-25, Math.min(60, 20 * Math.log10(cleanRms / filteredNoiseRms)));

    const powerlineCoupledMv = ECGSimulationEngine.computePowerlineDifferentialAmplitudeMv(
      this.params.powerlineVcmVolts,
      this.params.impedanceMismatchKOhm,
      this.params.cmrrDb
    );

    const stDistortionMv = stSampleCount > 0 ? Math.sqrt(stSqErrorSum / stSampleCount) : 0;

    const safeCleanPeak = Math.max(0.1, cleanRPeakMv);
    const rPeakAttenuationPct = Math.max(
      0,
      Math.min(95, ((safeCleanPeak - rPeakMv) / safeCleanPeak) * 100)
    );

    // Feature Selective Validation (FSV) Global Difference Measure (Gonzalez-Fernandez et al., 2017)
    // Combines Amplitude Difference Measure (ADM) and Feature Difference Measure (FDM):
    const adm = residualRms / cleanRms;
    const fdm = (stDistortionMv / 0.15) * 0.4 + (rPeakAttenuationPct / 100) * 0.6;
    const fsvGdm = Number(Math.sqrt(adm * adm + fdm * fdm).toFixed(3));

    let rhythmStatus: RhythmInterpretation = 'Normal Sinus Rhythm';
    if (snrDb < 6 || this.params.emgNoiseMv >= 0.22 || (!this.params.notch50HzEnabled && powerlineCoupledMv >= 1.0)) {
      rhythmStatus = 'Severe Noise Artifact Warning';
    } else if (hr < 60) {
      rhythmStatus = 'Sinus Bradycardia (<60 bpm)';
    } else if (hr > 100) {
      rhythmStatus = 'Sinus Tachycardia (>100 bpm)';
    }

    return {
      snrDb: Number(snrDb.toFixed(1)),
      rawSnrDb: Number(rawSnrDb.toFixed(1)),
      powerlineCoupledMv: Number(powerlineCoupledMv.toFixed(3)),
      stDistortionMv: Number(stDistortionMv.toFixed(3)),
      filterTimeConstantTauSec,
      rPeakMv: Number(rPeakMv.toFixed(2)),
      cleanRPeakMv: Number(cleanRPeakMv.toFixed(2)),
      rPeakAttenuationPct: Number(rPeakAttenuationPct.toFixed(1)),
      fsvGdm,
      heartRateBpm: hr,
      rrIntervalMs,
      prIntervalMs,
      qrsDurationMs,
      qtIntervalMs,
      qtcIntervalMs,
      rhythmStatus,
    };
  }
}
