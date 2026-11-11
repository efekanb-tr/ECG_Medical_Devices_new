import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  RotateCcw,
  Play,
  Pause,
  ArrowRight,
  Sliders,
  ShieldAlert,
  Filter,
  CheckCircle2,
  ClipboardCheck,
  Database,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import {
  ECGSampleFrame,
  ECGSimulationEngine,
  ECGSimulationParams,
  ECGTelemetryMetrics,
  EinthovenLead,
} from '../engine/ECGSimulationEngine';
import {
  ControlTooltipMeta,
  ECG_CONTROL_TOOLTIPS,
  ECGUIController,
  VERIFICATION_PRESETS,
  VerificationLogEntry,
  VerificationPresetId,
} from '../engine/ECGUIController';

interface ECGSimulatorScreenProps {
  controller: ECGUIController;
  onNavigateToVerification: () => void;
}

interface HelpTooltipProps {
  meta: ControlTooltipMeta;
}

/**
 * Beginner-Friendly Hover & Click '?' Tooltip Popover with Everyday Analogy placed next to every control
 */
const HelpTooltip: React.FC<HelpTooltipProps> = ({ meta }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label={`Help: ${meta.label}`}
        aria-expanded={open}
        className="w-5 h-5 rounded-full bg-[#FD91CC] text-[#09318D] font-mono text-xs font-bold inline-flex items-center justify-center hover:bg-[#09318D] hover:text-white transition-colors cursor-pointer shrink-0 border border-[#09318D]/25"
      >
        ?
      </button>

      {open && (
        <div
          role="tooltip"
          className="absolute bottom-full right-0 sm:left-1/2 sm:-translate-x-1/2 mb-2.5 w-76 sm:w-84 p-3.5 rounded-xl bg-[#09318D] text-white shadow-xl border-2 border-[#FD91CC] z-50 text-left pointer-events-none"
        >
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/15">
            <span className="text-xs font-bold text-[#FD91CC]">{meta.label}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/15 text-white whitespace-nowrap">
              {meta.unit}
            </span>
          </div>
          <p className="text-xs font-semibold text-white mt-2 leading-snug">{meta.shortRole}</p>
          <p className="text-[11px] text-white/85 mt-1.5 leading-relaxed">
            {meta.beginnerExplanation}
          </p>
          <div className="mt-2 p-2 rounded-lg bg-white/10 border border-[#FD91CC]/40 text-[11px] text-white leading-relaxed">
            <strong className="text-[#FD91CC]">💡 {meta.everydayAnalogy.split(':')[0]}:</strong>
            {meta.everydayAnalogy.includes(':')
              ? meta.everydayAnalogy.substring(meta.everydayAnalogy.indexOf(':') + 1)
              : ` ${meta.everydayAnalogy}`}
          </div>
          <div className="mt-2 pt-1.5 border-t border-white/15 text-[11px] text-[#FD91CC] leading-relaxed">
            <strong>Effect on ECG Signal:</strong> {meta.signalEffect}
          </div>
        </div>
      )}
    </div>
  );
};

export const ECGSimulatorScreen: React.FC<ECGSimulatorScreenProps> = ({
  controller,
  onNavigateToVerification,
}) => {
  const [params, setParams] = useState<ECGSimulationParams>(() => controller.getParams());
  const [activePreset, setActivePreset] = useState<VerificationPresetId | null>(() =>
    controller.getActivePresetId()
  );
  const [telemetry, setTelemetry] = useState<ECGTelemetryMetrics>(() =>
    controller.getTelemetry()
  );
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showCleanReference, setShowCleanReference] = useState<boolean>(true);
  const [verificationLogs, setVerificationLogs] = useState<VerificationLogEntry[]>(() => {
    // Pre-populate initial verification log entries so the table is immediately informative
    const tempCtrl = new ECGUIController();
    return VERIFICATION_PRESETS.map((p) => tempCtrl.runVerificationScenario(p.id).logEntry);
  });

  const monitorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const vectorCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fixed-screen Left-to-Right Phosphor Sweep Buffer (1440 samples = 4.0 seconds at 360 Hz)
  const SWEEP_BUFFER_CAPACITY = 1440;
  const sweepBufferRef = useRef<ECGSampleFrame[]>([]);
  const sweepCursorRef = useRef<number>(0);

  /**
   * Refills the sweep buffer immediately when parameters change so that slider/toggle adjustments
   * update the visible waveform on screen with zero lag while preserving the left-to-right sweep cursor position.
   */
  const refreshSweepBufferImmediate = useCallback(
    (targetParams: ECGSimulationParams) => {
      const previewEngine = new ECGSimulationEngine(360, targetParams);
      const freshSamples = previewEngine.stepBatch(SWEEP_BUFFER_CAPACITY);
      sweepBufferRef.current = freshSamples;
    },
    []
  );

  // Sync local state helper with instant waveform & metric reactivity
  const syncFromController = useCallback(
    (nextParams: ECGSimulationParams) => {
      // Advance main engine by 360 samples so rolling metrics reflect parameter change immediately
      controller.getEngine().stepBatch(360);
      refreshSweepBufferImmediate(nextParams);
      setParams(nextParams);
      setActivePreset(controller.getActivePresetId());
      setTelemetry(controller.getTelemetry());
    },
    [controller, refreshSweepBufferImmediate]
  );

  const handleParamChange = <K extends keyof ECGSimulationParams>(
    key: K,
    value: ECGSimulationParams[K]
  ) => {
    const next = controller.updateParam(key, value);
    syncFromController(next);
  };

  const handleRunVerificationScenario = (presetId: VerificationPresetId) => {
    const { params: nextParams, telemetry: nextTelemetry, logEntry } =
      controller.runVerificationScenario(presetId);
    refreshSweepBufferImmediate(nextParams);
    setParams(nextParams);
    setActivePreset(presetId);
    setTelemetry(nextTelemetry);
    setVerificationLogs((prev) => {
      const filtered = prev.filter((item) => item.id !== presetId);
      return [logEntry, ...filtered];
    });
  };

  const handleReset = () => {
    const next = controller.resetToDefault();
    syncFromController(next);
  };

  const handleDeblockCapacitor = () => {
    const nextTelemetry = controller.deblockCapacitor();
    refreshSweepBufferImmediate(controller.getParams());
    setTelemetry(nextTelemetry);
  };

  // Real-time 360 Hz Left-to-Right Phosphor Sweep Loop on Clinical Dark Screen (#06101E)
  useEffect(() => {
    const engine = controller.getEngine();
    if (sweepBufferRef.current.length === 0) {
      sweepBufferRef.current = engine.stepBatch(SWEEP_BUFFER_CAPACITY);
      sweepCursorRef.current = Math.floor(SWEEP_BUFFER_CAPACITY * 0.68);
      setTelemetry(controller.getTelemetry());
    }

    let animId = 0;
    let lastTimestamp = performance.now();
    let sampleAccumulator = 0;
    let telemetryTimer = 0;

    const renderLoop = (now: number) => {
      const dtSec = Math.min(0.1, Math.max(0.001, (now - lastTimestamp) / 1000));
      lastTimestamp = now;

      const currentParams = controller.getParams();

      // Determine active horizontal sweep capacity based on Sweep Speed (25 mm/s vs 50 mm/s)
      // At 25 mm/s, full screen sweep = 1080 samples (3.0 seconds); at 50 mm/s = 540 samples (1.5 seconds)
      const activeSweepSamples = currentParams.sweepSpeedMmPerSec === 50 ? 540 : 1080;

      if (!isPaused) {
        sampleAccumulator += dtSec * engine.getSampleRateHz();
        const stepsToRun = Math.floor(sampleAccumulator);
        sampleAccumulator -= stepsToRun;

        const buffer = sweepBufferRef.current;
        for (let i = 0; i < stepsToRun; i++) {
          const frame = engine.stepSample();
          const pos = sweepCursorRef.current % activeSweepSamples;
          buffer[pos] = frame;
          sweepCursorRef.current = (pos + 1) % activeSweepSamples;
        }

        telemetryTimer += dtSec;
        if (telemetryTimer >= 0.25) {
          telemetryTimer = 0;
          setTelemetry(controller.getTelemetry());
        }
      }

      // 1. Render Primary Clinical Monitor (#06101E background, #00FF66 phosphor trace, mm grid)
      const canvas = monitorCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const rect = canvas.getBoundingClientRect();
          const targetW = Math.max(320, Math.floor(rect.width * dpr));
          const targetH = Math.max(240, Math.floor(rect.height * dpr));
          if (canvas.width !== targetW || canvas.height !== targetH) {
            canvas.width = targetW;
            canvas.height = targetH;
          }

          const w = canvas.width;
          const h = canvas.height;

          // Strictly #06101E Clinical Dark Screen
          ctx.fillStyle = '#06101E';
          ctx.fillRect(0, 0, w, h);

          // Millimeter Grid Calibration: 1 mm = 5.2px * dpr, 5 mm major square = 26px * dpr
          const mmPx = 5.2 * dpr;
          const majorMmPx = mmPx * 5;

          // Fine 1 mm grid lines
          ctx.strokeStyle = 'rgba(0, 255, 102, 0.08)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let x = 0; x < w; x += mmPx) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
          }
          for (let y = 0; y < h; y += mmPx) {
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
          }
          ctx.stroke();

          // Major 5 mm grid lines
          ctx.strokeStyle = 'rgba(0, 255, 102, 0.22)';
          ctx.lineWidth = 1.2 * dpr;
          ctx.beginPath();
          for (let x = 0; x < w; x += majorMmPx) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
          }
          for (let y = 0; y < h; y += majorMmPx) {
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
          }
          ctx.stroke();

          const midY = h * 0.56;
          // 1 mV height in pixels = gainMmPerMv * mmPx
          const pxPerMv = currentParams.gainMmPerMv * mmPx;

          // Draw 1 mV Standard Calibration Pulse on the far left
          const calStartX = 12 * dpr;
          const calWidth = 5 * mmPx;
          ctx.strokeStyle = '#00FF66';
          ctx.lineWidth = 2 * dpr;
          ctx.beginPath();
          ctx.moveTo(calStartX, midY);
          ctx.lineTo(calStartX + calWidth * 0.15, midY);
          ctx.lineTo(calStartX + calWidth * 0.15, midY - pxPerMv);
          ctx.lineTo(calStartX + calWidth * 0.85, midY - pxPerMv);
          ctx.lineTo(calStartX + calWidth * 0.85, midY);
          ctx.lineTo(calStartX + calWidth, midY);
          ctx.stroke();

          ctx.fillStyle = '#00FF66';
          ctx.font = `600 ${10.5 * dpr}px "IBM Plex Mono", monospace`;
          ctx.fillText('1mV CAL', calStartX, midY + 16 * dpr);

          // Left-to-Right Phosphor Sweep Region
          const traceStartX = calStartX + calWidth + 12 * dpr;
          const traceWidthPx = Math.max(120, w - traceStartX - 14 * dpr);
          const buffer = sweepBufferRef.current;
          const cursor = sweepCursorRef.current % activeSweepSamples;
          const gapSamples = Math.max(18, Math.floor(activeSweepSamples * 0.045));

          // Helper to check if sample index `i` is inside the moving erase gap ahead of `cursor`
          const isInEraseGap = (i: number) => {
            const distAhead = (i - cursor + activeSweepSamples) % activeSweepSamples;
            return distAhead > 0 && distAhead <= gapSamples;
          };

          // Faint Dashed Reference Trace for Ideal Noise-Free Signal V_clean(t)
          if (showCleanReference) {
            ctx.save();
            ctx.strokeStyle = 'rgba(253, 145, 204, 0.58)';
            ctx.lineWidth = 1.6 * dpr;
            ctx.setLineDash([5 * dpr, 4 * dpr]);
            ctx.beginPath();
            let penDownClean = false;
            for (let i = 0; i < activeSweepSamples; i++) {
              if (isInEraseGap(i)) {
                penDownClean = false;
                continue;
              }
              const sample = buffer[i];
              if (!sample) continue;
              const x = traceStartX + (i / activeSweepSamples) * traceWidthPx;
              const y = midY - sample.cleanLeadMv * pxPerMv;
              if (!penDownClean) {
                ctx.moveTo(x, y);
                penDownClean = true;
              } else {
                ctx.lineTo(x, y);
              }
            }
            ctx.stroke();
            ctx.restore();
          }

          // Primary Phosphor-Green (#00FF66) Left-to-Right Sweep Waveform
          ctx.strokeStyle = '#00FF66';
          ctx.lineWidth = 2.4 * dpr;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          let penDown = false;
          for (let i = 0; i < activeSweepSamples; i++) {
            if (isInEraseGap(i)) {
              penDown = false;
              continue;
            }
            const sample = buffer[i];
            if (!sample) continue;
            const x = traceStartX + (i / activeSweepSamples) * traceWidthPx;
            const y = midY - sample.filteredMv * pxPerMv;
            if (!penDown) {
              ctx.moveTo(x, y);
              penDown = true;
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();

          // Draw Moving Erase Bar & Bright Phosphor Sweep Head at `cursor` (moving Left-to-Right!)
          const sweepX = traceStartX + (cursor / activeSweepSamples) * traceWidthPx;
          const gapWidthPx = (gapSamples / activeSweepSamples) * traceWidthPx;

          // Subtle vertical phosphor sweep bar line
          ctx.fillStyle = 'rgba(6, 16, 30, 0.72)';
          if (sweepX + gapWidthPx <= traceStartX + traceWidthPx) {
            ctx.fillRect(sweepX + 2 * dpr, 0, gapWidthPx, h);
          }

          ctx.strokeStyle = 'rgba(0, 255, 102, 0.45)';
          ctx.lineWidth = 1.5 * dpr;
          ctx.beginPath();
          ctx.moveTo(sweepX, 0);
          ctx.lineTo(sweepX, h);
          ctx.stroke();

          const headSample = buffer[cursor];
          if (headSample) {
            const headY = midY - headSample.filteredMv * pxPerMv;
            ctx.fillStyle = '#00FF66';
            ctx.beginPath();
            ctx.arc(sweepX, headY, 4.5 * dpr, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 2. Render Einthoven Triangle & Instantaneous Cardiac Dipole Vector (px, py)
      const vecCanvas = vectorCanvasRef.current;
      if (vecCanvas) {
        const vCtx = vecCanvas.getContext('2d');
        if (vCtx) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const w = 160 * dpr;
          const h = 135 * dpr;
          if (vecCanvas.width !== w || vecCanvas.height !== h) {
            vecCanvas.width = w;
            vecCanvas.height = h;
          }
          vCtx.clearRect(0, 0, w, h);

          const cx = w * 0.5;
          const cy = h * 0.52;
          const r = 46 * dpr;

          const raX = cx - r * 0.866;
          const raY = cy - r * 0.5;
          const laX = cx + r * 0.866;
          const laY = cy - r * 0.5;
          const llX = cx;
          const llY = cy + r;

          vCtx.strokeStyle = 'rgba(0, 255, 102, 0.3)';
          vCtx.lineWidth = 1.5 * dpr;
          vCtx.beginPath();
          vCtx.moveTo(raX, raY);
          vCtx.lineTo(laX, laY);
          vCtx.lineTo(llX, llY);
          vCtx.closePath();
          vCtx.stroke();

          vCtx.fillStyle = '#00FF66';
          vCtx.font = `bold ${9 * dpr}px "IBM Plex Mono", monospace`;
          vCtx.fillText('RA', raX - 16 * dpr, raY + 3 * dpr);
          vCtx.fillText('LA', laX + 4 * dpr, laY + 3 * dpr);
          vCtx.fillText('LL', llX - 6 * dpr, llY + 12 * dpr);

          const buffer = sweepBufferRef.current;
          const latest = buffer[sweepCursorRef.current % activeSweepSamples];
          if (latest) {
            const scale = 28 * dpr;
            const endX = cx + latest.dipoleVector.px * scale;
            const endY = cy + latest.dipoleVector.py * scale;

            vCtx.strokeStyle = '#FD91CC';
            vCtx.lineWidth = 2.4 * dpr;
            vCtx.beginPath();
            vCtx.moveTo(cx, cy);
            vCtx.lineTo(endX, endY);
            vCtx.stroke();

            vCtx.fillStyle = '#FD91CC';
            vCtx.beginPath();
            vCtx.arc(endX, endY, 3.2 * dpr, 0, Math.PI * 2);
            vCtx.fill();
          }
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [controller, isPaused, showCleanReference]);

  const isWarningRhythm = telemetry.rhythmStatus === 'Severe Noise Artifact Warning';

  return (
    <section className="min-h-[calc(100vh-65px)] bg-white text-[#09318D] px-4 sm:px-6 py-6 md:py-8">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Top Module Header & Global Simulator Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#09318D]/15">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#09318D]/70">
              <span>SCREEN 04 OF 06</span>
              <span aria-hidden="true">·</span>
              <span>LEFT-TO-RIGHT PHOSPHOR SWEEP MONITOR (#06101E)</span>
              <span aria-hidden="true">·</span>
              <span>HOVER OR CLICK ? FOR ANALOGY TOOLTIPS</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#09318D] mt-1">
              Live Left-to-Right ECG Simulator &amp; IEC 60601-2-25 Verification Lab
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#09318D]/25 bg-white text-[#09318D] font-bold text-xs hover:border-[#FD91CC] transition-colors cursor-pointer"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              <span>{isPaused ? 'Resume Sweep' : 'Freeze Sweep'}</span>
            </button>

            <div className="inline-flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleDeblockCapacitor}
                data-testid="deblock-capacitor-btn"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border-2 border-[#09318D] bg-white text-[#09318D] font-bold text-xs hover:bg-[#FD91CC]/25 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Baseline De-Block / Reset Capacitor</span>
              </button>
              <HelpTooltip meta={ECG_CONTROL_TOOLTIPS.deblockButton} />
            </div>

            <div className="inline-flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleReset}
                data-testid="reset-clinical-default-btn"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#FD91CC] text-[#09318D] font-bold text-xs hover:bg-[#FD91CC]/85 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Clinical Default</span>
              </button>
              <HelpTooltip meta={ECG_CONTROL_TOOLTIPS.resetButton} />
            </div>

            <button
              type="button"
              onClick={onNavigateToVerification}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#09318D] text-white font-bold text-xs hover:bg-[#09318D]/90 transition-colors cursor-pointer"
            >
              <span>Math Model &amp; Equations (Screen 5)</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FD91CC]" />
            </button>
          </div>
        </div>

        {/* 3 One-Click IEC 60601-2-25 Verification Scenarios ("Run IEC Test 1", "Run IEC Test 2", "Run IEC Test 3") */}
        <div className="rounded-2xl border-2 border-[#09318D]/20 bg-[#09318D]/[0.02] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-[#09318D]" />
              <span className="text-xs font-mono font-bold text-[#09318D] uppercase tracking-wider">
                3 One-Click IEC 60601-2-25 Verification Scenarios (Auto-Configures Sliders &amp; Populates Expected vs. Observed Table)
              </span>
            </div>
            <span className="text-xs text-[#09318D]/75">
              Click &quot;Run IEC Test 1 / 2 / 3&quot; to configure controls &amp; verify telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {VERIFICATION_PRESETS.map((preset, idx) => {
              const isSelected = activePreset === preset.id;
              return (
                <div
                  key={preset.id}
                  className={`p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#09318D] text-white border-[#09318D] shadow-sm'
                      : 'bg-white text-[#09318D] border-[#09318D]/20 hover:border-[#FD91CC]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                      <span className={isSelected ? 'text-[#FD91CC] font-bold' : 'text-[#09318D]/70'}>
                        {preset.badge}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#FD91CC] shrink-0" />}
                    </div>
                    <h2 className="text-xs sm:text-sm font-bold mt-1">{preset.title}</h2>
                    <p
                      className={`text-[11px] mt-1 leading-snug ${
                        isSelected ? 'text-white/85' : 'text-[#09318D]/75'
                      }`}
                    >
                      {preset.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-current/15 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      data-testid={`run-test-${idx + 1}-btn`}
                      onClick={() => handleRunVerificationScenario(preset.id)}
                      className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#FD91CC] text-[#09318D]'
                          : 'bg-[#09318D] text-white hover:bg-[#09318D]/90'
                      }`}
                    >
                      Run IEC Test {idx + 1}
                    </button>

                    {preset.id === 'test_1_mains_mismatch' && isSelected && (
                      <button
                        type="button"
                        onClick={() =>
                          handleParamChange('notch50HzEnabled', !params.notch50HzEnabled)
                        }
                        className="px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-bold bg-white text-[#09318D] hover:bg-[#FD91CC] cursor-pointer"
                      >
                        Notch: {params.notch50HzEnabled ? 'ON (>22dB)' : 'OFF (1.62mV)'}
                      </button>
                    )}

                    {preset.id === 'test_2_baseline_st_distortion' && isSelected && (
                      <div className="flex items-center gap-1">
                        {[0.05, 0.67, 1.5].map((hz) => (
                          <button
                            key={hz}
                            type="button"
                            onClick={() => handleParamChange('highPassCutoffHz', hz)}
                            className={`px-2 py-1 rounded font-mono text-[10px] font-bold cursor-pointer ${
                              Math.abs(params.highPassCutoffHz - hz) < 0.02
                                ? 'bg-[#FD91CC] text-[#09318D]'
                                : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                          >
                            {hz.toFixed(2)}Hz
                          </button>
                        ))}
                      </div>
                    )}

                    {preset.id === 'test_3_tachycardia_lp_attenuation' && isSelected && (
                      <div className="flex items-center gap-1">
                        {[30, 20].map((hz) => (
                          <button
                            key={hz}
                            type="button"
                            onClick={() => handleParamChange('lowPassCutoffHz', hz)}
                            className={`px-2 py-1 rounded font-mono text-[10px] font-bold cursor-pointer ${
                              params.lowPassCutoffHz === hz
                                ? 'bg-[#FD91CC] text-[#09318D]'
                                : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                          >
                            {hz}Hz LPF
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Simulator Grid: Left Clinical Dark Monitor (#06101E) + Right Interactive Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* =====================================================================
              LEFT COLUMN (7 cols): Clinical Monitor (#06101E) + Complete Readouts
              ===================================================================== */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Hospital ECG Monitor Frame (#06101E) */}
            <div className="rounded-2xl bg-[#06101E] border-4 border-[#09318D] p-4 text-[#00FF66] shadow-lg">
              {/* Monitor Top Status & Rhythm Interpretation Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#00FF66]/20 font-mono">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded bg-[#00FF66]/15 text-[#00FF66] font-bold text-xs">
                    LEAD {params.lead}{' '}
                    {params.lead === 'I' ? '(0°)' : params.lead === 'II' ? '(+60°)' : '(+120°)'}
                  </span>
                  <span className="text-xs text-[#00FF66]/90">
                    {params.sweepSpeedMmPerSec} mm/s · {params.gainMmPerMv} mm/mV
                  </span>
                  <span className="text-xs text-[#00FF66]/75 hidden sm:inline">
                    f<sub>HP</sub>:{params.highPassCutoffHz.toFixed(2)}Hz · f<sub>LP</sub>:
                    {params.lowPassCutoffHz}Hz · Notch:{params.notch50HzEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>

                {/* Automated Rhythm Interpretation Badge */}
                <div
                  data-testid="rhythm-interpretation-badge"
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                    isWarningRhythm
                      ? 'bg-[#FD91CC] text-[#09318D]'
                      : 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/40'
                  }`}
                >
                  {isWarningRhythm ? (
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Activity className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{telemetry.rhythmStatus}</span>
                </div>
              </div>

              {/* Left-to-Right Phosphor Sweep Waveform Canvas + Dashed V_clean(t) Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-[11px] font-mono">
                <span className="text-[#00FF66]/80">
                  SWEEP MODE: LEFT-TO-RIGHT HOSPITAL ERASE BAR · GREEN = FILTERED V(t)
                </span>
                <label className="inline-flex items-center gap-2 text-[#FD91CC] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCleanReference}
                    onChange={(e) => setShowCleanReference(e.target.checked)}
                    className="accent-[#FD91CC] rounded cursor-pointer"
                  />
                  <span>
                    Overlay Dashed Reference V<sub>clean</sub>(t)
                  </span>
                </label>
              </div>

              <div className="relative w-full h-64 sm:h-72">
                <canvas
                  ref={monitorCanvasRef}
                  data-testid="ecg-simulator-canvas"
                  className="w-full h-full block rounded-lg"
                  aria-label="Real-Time Left-to-Right Clinical ECG Waveform Display"
                />

                {/* Corner Einthoven Dipole Vector Loop Overlay */}
                <div className="hidden sm:flex flex-col items-center absolute top-2 right-2 bg-[#06101E]/90 border border-[#00FF66]/30 rounded-xl p-2 pointer-events-none">
                  <span className="text-[10px] font-mono text-[#00FF66]/80">
                    EINTHOVEN DIPOLE p(t)
                  </span>
                  <canvas
                    ref={vectorCanvasRef}
                    className="w-32 h-24 block"
                    aria-label="Einthoven Triangle Dipole Vector"
                  />
                </div>
              </div>

              {/* Complete Clinical Monitor Readouts Grid (8 Real-Time Metrics) */}
              <div className="mt-4 pt-3 border-t border-[#00FF66]/20 grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                {/* 1. Heart Rate & RR Interval */}
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-[#00FF66]/25">
                  <div className="flex items-center justify-between text-[10px] text-[#00FF66]/75">
                    <span>HEART RATE &amp; RR</span>
                    <span>60–100 bpm</span>
                  </div>
                  <p
                    data-testid="metric-hr-bpm"
                    className="text-lg font-bold text-[#00FF66] mt-0.5 tabular-nums"
                  >
                    {telemetry.heartRateBpm} <span className="text-xs font-normal">bpm</span>
                  </p>
                  <p className="text-[11px] text-[#FD91CC] mt-0.5 tabular-nums">
                    RR: {telemetry.rrIntervalMs} ms
                  </p>
                </div>

                {/* 2. PR Interval & QRS Duration */}
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-[#00FF66]/25">
                  <div className="flex items-center justify-between text-[10px] text-[#00FF66]/75">
                    <span>PR &amp; QRS INTERVAL</span>
                    <span>AHA NORM</span>
                  </div>
                  <p className="text-sm font-bold text-[#00FF66] mt-1 tabular-nums">
                    PR: {telemetry.prIntervalMs} ms{' '}
                    <span className="text-[10px] font-normal text-[#00FF66]/75">(120–200)</span>
                  </p>
                  <p className="text-sm font-bold text-[#00FF66] mt-0.5 tabular-nums">
                    QRS: {telemetry.qrsDurationMs} ms{' '}
                    <span className="text-[10px] font-normal text-[#00FF66]/75">(80–100)</span>
                  </p>
                </div>

                {/* 3. QT / QTc Interval (Bazett's Formula) */}
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-[#00FF66]/25">
                  <div className="flex items-center justify-between text-[10px] text-[#00FF66]/75">
                    <span>QT / QTc (BAZETT)</span>
                    <span>≤ 440 ms</span>
                  </div>
                  <p className="text-sm font-bold text-[#00FF66] mt-1 tabular-nums">
                    QT: {telemetry.qtIntervalMs} ms
                  </p>
                  <p className="text-sm font-bold text-[#FD91CC] mt-0.5 tabular-nums">
                    QTc: {telemetry.qtcIntervalMs} ms
                  </p>
                </div>

                {/* 4. R-Peak Amplitude & Low-Pass Attenuation */}
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-[#00FF66]/25">
                  <div className="flex items-center justify-between text-[10px] text-[#00FF66]/75">
                    <span>R-PEAK AMPLITUDE</span>
                    <span>BANDWIDTH</span>
                  </div>
                  <p className="text-lg font-bold text-[#00FF66] mt-0.5 tabular-nums">
                    {telemetry.rPeakMv.toFixed(2)} <span className="text-xs font-normal">mV</span>
                  </p>
                  <p className="text-[11px] text-[#FD91CC] mt-0.5 tabular-nums">
                    LP Loss: −{telemetry.rPeakAttenuationPct.toFixed(1)}%
                  </p>
                </div>

                {/* 5. Output SNR (dB) & FSV Global Difference Measure */}
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-[#00FF66]/25 sm:col-span-2">
                  <div className="flex items-center justify-between text-[10px] text-[#00FF66]/75">
                    <span>OUTPUT SNR (dB) &amp; FSV GLOBAL DIFF (GDM)</span>
                    <span>SIGNAL QUALITY</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <p
                      data-testid="metric-snr-db"
                      className="text-lg font-bold text-[#00FF66] tabular-nums"
                    >
                      {telemetry.snrDb.toFixed(1)} dB{' '}
                      <span className="text-xs font-normal text-[#00FF66]/75">
                        (FSV GDM: {telemetry.fsvGdm.toFixed(3)})
                      </span>
                    </p>
                    <span className="text-[11px] font-bold text-[#FD91CC]">
                      50Hz: {telemetry.powerlineCoupledMv.toFixed(2)} mV
                    </span>
                  </div>
                </div>

                {/* 6. ST-Segment Deviation (mV) & Filter Time Constant τ (s) */}
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-[#00FF66]/25 sm:col-span-2">
                  <div className="flex items-center justify-between text-[10px] text-[#00FF66]/75">
                    <span>ST-SEGMENT DEVIATION &amp; TIME CONSTANT τ (s)</span>
                    <span>τ = 1 / (2πf_HP)</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <p
                      data-testid="metric-st-distortion"
                      className="text-lg font-bold text-[#FD91CC] tabular-nums"
                    >
                      {telemetry.stDistortionMv.toFixed(3)} mV{' '}
                      <span
                        data-testid="metric-tau-sec"
                        className="text-xs font-normal text-[#00FF66]"
                      >
                        (τ = {telemetry.filterTimeConstantTauSec.toFixed(2)} s)
                      </span>
                    </p>
                    <span className="text-[11px] font-bold text-[#00FF66]">
                      {telemetry.stDistortionMv > 0.1
                        ? '⚠ CAL20160 ST ERASE/WARP'
                        : '✓ ISOELECTRIC ST FIDELITY'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Verification Test Log Table (Expected vs. Observed Results) */}
            <div className="rounded-2xl border-2 border-[#09318D]/20 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#09318D]/15">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-[#09318D]" />
                  <h2 className="text-sm font-bold text-[#09318D]">
                    Verification Test Scenarios Log (Expected vs. Observed Telemetry)
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#09318D]/70">
                  CLICK &quot;RUN TEST 1 / 2 / 3&quot; ABOVE TO UPDATE
                </span>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#09318D] text-white font-mono text-[11px]">
                      <th className="py-2.5 px-3">Scenario &amp; Inputs</th>
                      <th className="py-2.5 px-3">Expected Theoretical Outcome</th>
                      <th className="py-2.5 px-3">Observed Simulator Output</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#09318D]/15">
                    {verificationLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#09318D]/[0.02]">
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-[#09318D]">{log.testTitle}</p>
                          <p className="font-mono text-[11px] text-[#09318D]/70">
                            {log.configuredInputs}
                          </p>
                        </td>
                        <td className="py-2.5 px-3 text-[#09318D]/85">{log.expectedResult}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-[#09318D]">
                          {log.observedResult}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FD91CC]/30 text-[#09318D]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{log.passed ? 'PASS' : 'CHECK'}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Simulated vs. Clinical Data Comparison Table (PhysioNet MIT-BIH & AHA Standards) */}
            <div className="rounded-2xl border-2 border-[#09318D]/20 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#09318D]/15">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#09318D]" />
                  <h2 className="text-sm font-bold text-[#09318D]">
                    Simulated Values vs. Measured Clinical Reference Data (PhysioNet MIT-BIH &amp; AHA)
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#09318D]/70">
                  LIVE COMPARISON
                </span>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#09318D]/10 text-[#09318D] font-mono text-[11px]">
                      <th className="py-2.5 px-3">Biomedical Parameter</th>
                      <th className="py-2.5 px-3">Live Simulator Output</th>
                      <th className="py-2.5 px-3">Clinical Reference (AHA / MIT-BIH)</th>
                      <th className="py-2.5 px-3">Engineering &amp; Physiological Difference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#09318D]/15">
                    <tr>
                      <td className="py-2 px-3 font-bold">Heart Rate &amp; RR Interval</td>
                      <td className="py-2 px-3 font-mono font-bold tabular-nums">
                        {telemetry.heartRateBpm} bpm ({telemetry.rrIntervalMs} ms)
                      </td>
                      <td className="py-2 px-3 font-mono">60–100 bpm (600–1000 ms)</td>
                      <td className="py-2 px-3 text-[#09318D]/80">
                        Simulator uses deterministic angular velocity ω; real patients show ±5% autonomic HRV.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold">PR / QRS / QTc Intervals</td>
                      <td className="py-2 px-3 font-mono font-bold tabular-nums">
                        {telemetry.prIntervalMs} / {telemetry.qrsDurationMs} / {telemetry.qtcIntervalMs} ms
                      </td>
                      <td className="py-2 px-3 font-mono">PR 120–200 · QRS 80–100 · QTc ≤440 ms</td>
                      <td className="py-2 px-3 text-[#09318D]/80">
                        Bazett scaling reproduces QT shortening in tachycardia; low-pass f<sub>LP</sub>=20Hz widens QRS.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold">Lead II R-Peak Amplitude</td>
                      <td className="py-2 px-3 font-mono font-bold tabular-nums">
                        {telemetry.rPeakMv.toFixed(2)} mV (−{telemetry.rPeakAttenuationPct.toFixed(1)}% loss)
                      </td>
                      <td className="py-2 px-3 font-mono">0.80 – 2.00 mV (MIT-BIH 360 Hz)</td>
                      <td className="py-2 px-3 text-[#09318D]/80">
                        Exact ground-truth V<sub>clean</sub>(t) allows direct measurement of low-pass R-peak clipping.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold">ST-Segment Phase Error</td>
                      <td className="py-2 px-3 font-mono font-bold tabular-nums">
                        {telemetry.stDistortionMv.toFixed(3)} mV RMS
                      </td>
                      <td className="py-2 px-3 font-mono">
                        Isoelectric ≤ 0.05 mV (AHA f<sub>HP</sub> = 0.05 Hz)
                      </td>
                      <td className="py-2 px-3 text-[#09318D]/80">
                        Demonstrates why causal IIR high-pass filters at 1.50 Hz induce false ischemic ST depression.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* =====================================================================
              RIGHT COLUMN (5 cols): 12 Interactive Controls with '?' Tooltips
              ===================================================================== */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Control Group 1: Heart Rate, Lead Selector, Gain & Sweep Speed */}
            <div className="rounded-2xl border-2 border-[#09318D]/20 bg-white p-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#09318D]/15">
                <Sliders className="w-4 h-4 text-[#09318D]" />
                <h2 className="text-sm font-bold text-[#09318D]">
                  1. Cardiac Rhythm, Lead Selector &amp; Monitor Calibration
                </h2>
              </div>

              <div className="mt-4 space-y-4">
                {/* 1. Heart Rate Slider (30 to 180 bpm, default 72 bpm) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <label htmlFor="slider-hr" className="text-xs font-bold text-[#09318D]">
                        1. Heart Rate (30–180 bpm)
                      </label>
                      <HelpTooltip meta={ECG_CONTROL_TOOLTIPS.heartRateBpm} />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#09318D] tabular-nums">
                      {params.heartRateBpm} bpm (RR: {telemetry.rrIntervalMs} ms)
                    </span>
                  </div>
                  <input
                    id="slider-hr"
                    type="range"
                    min={30}
                    max={180}
                    step={1}
                    value={params.heartRateBpm}
                    onChange={(e) => handleParamChange('heartRateBpm', Number(e.target.value))}
                    className="ecg-slider"
                  />
                </div>

                {/* 2. Einthoven Lead Selector (Lead I 0°, Lead II 60°, Lead III 120°) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#09318D]">
                        2. Lead Selector (Einthoven Frontal Plane)
                      </span>
                      <HelpTooltip meta={ECG_CONTROL_TOOLTIPS.lead} />
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#09318D]">
                      Lead {params.lead}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { ld: 'I', label: 'Lead I (0°)' },
                        { ld: 'II', label: 'Lead II (60°)' },
                        { ld: 'III', label: 'Lead III (120°)' },
                      ] as { ld: EinthovenLead; label: string }[]
                    ).map((item) => (
                      <button
                        key={item.ld}
                        type="button"
                        onClick={() => handleParamChange('lead', item.ld)}
                        className={`py-2 px-2 rounded-lg font-mono text-xs font-bold border transition-colors cursor-pointer ${
                          params.lead === item.ld
                            ? 'bg-[#09318D] text-white border-[#09318D]'
                            : 'bg-white text-[#09318D] border-[#09318D]/25 hover:border-[#FD91CC]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Gain (5, 10, 20 mm/mV) & 4. Sweep Speed (25, 50 mm/s) */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#09318D]/10">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#09318D]">3. Gain (mm/mV)</span>
                      <HelpTooltip meta={ECG_CONTROL_TOOLTIPS.gainMmPerMv} />
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {([5, 10, 20] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => handleParamChange('gainMmPerMv', g)}
                          className={`py-1.5 rounded font-mono text-xs font-bold border cursor-pointer ${
                            params.gainMmPerMv === g
                              ? 'bg-[#09318D] text-white border-[#09318D]'
                              : 'bg-white text-[#09318D] border-[#09318D]/20'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#09318D]">4. Sweep Speed</span>
                      <HelpTooltip meta={ECG_CONTROL_TOOLTIPS.sweepSpeedMmPerSec} />
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {([25, 50] as const).map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => handleParamChange('sweepSpeedMmPerSec', spd)}
                          className={`py-1.5 rounded font-mono text-xs font-bold border cursor-pointer ${
                            params.sweepSpeedMmPerSec === spd
                              ? 'bg-[#09318D] text-white border-[#09318D]'
                              : 'bg-white text-[#09318D] border-[#09318D]/20'
                          }`}
                        >
                          {spd} mm/s
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Control Group 2: Electrode Impedance Mismatch, CMRR, Wander & EMG Noise */}
            <div className="rounded-2xl border-2 border-[#09318D]/20 bg-white p-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#09318D]/15">
                <ShieldAlert className="w-4 h-4 text-[#09318D]" />
                <h2 className="text-sm font-bold text-[#09318D]">
                  2. Biophysical Artifacts &amp; Electrode Impedance (Z<sub>in</sub> = 10 MΩ, V<sub>cm</sub> = 200 mV)
                </h2>
              </div>

              <div className="mt-4 space-y-4">
                {/* 5. Electrode Impedance Mismatch ΔZe (0 to 100 kΩ) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <label htmlFor="slider-dze" className="text-xs font-bold text-[#09318D]">
                        5. Electrode Impedance Mismatch (ΔZ<sub>e</sub>)
                      </label>
                      <HelpTooltip meta={ECG_CONTROL_TOOLTIPS.impedanceMismatchKOhm} />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#09318D] tabular-nums">
                      {params.impedanceMismatchKOhm} kΩ
                    </span>
                  </div>
                  <input
                    id="slider-dze"
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={params.impedanceMismatchKOhm}
                    onChange={(e) =>
                      handleParamChange('impedanceMismatchKOhm', Number(e.target.value))
                    }
                    className="ecg-slider"
                  />
                </div>

                {/* 6. Amplifier CMRR (60 to 135 dB, default 100 dB; IEC CMRR test requires AC Notch OFF) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <label htmlFor="slider-cmrr" className="text-xs font-bold text-[#09318D]">
                        6. Amplifier CMRR (60–135 dB · IEC Test: Notch OFF)
                      </label>
                      <HelpTooltip meta={ECG_CONTROL_TOOLTIPS.cmrrDb} />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#09318D] tabular-nums">
                      {params.cmrrDb} dB
                    </span>
                  </div>
                  <input
                    id="slider-cmrr"
                    type="range"
                    min={60}
                    max={135}
                    step={1}
                    value={params.cmrrDb}
                    onChange={(e) => handleParamChange('cmrrDb', Number(e.target.value))}
                    className="ecg-slider"
                  />
                </div>

                {/* 7. Respiratory Baseline Wander (0.25 Hz: 0.00 to 0.80 mV) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <label htmlFor="slider-wander" className="text-xs font-bold text-[#09318D]">
                        7. Respiratory Baseline Wander (0.25 Hz)
                      </label>
                      <HelpTooltip meta={ECG_CONTROL_TOOLTIPS.baselineWanderMv} />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#09318D] tabular-nums">
                      {params.baselineWanderMv.toFixed(2)} mV
                    </span>
                  </div>
                  <input
                    id="slider-wander"
                    type="range"
                    min={0}
                    max={0.8}
                    step={0.02}
                    value={params.baselineWanderMv}
                    onChange={(e) =>
                      handleParamChange('baselineWanderMv', parseFloat(e.target.value))
                    }
                    className="ecg-slider"
                  />
                </div>

                {/* 8. EMG Muscle Artifact (Gaussian noise: 0.00 to 0.30 mV RMS) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <label htmlFor="slider-emg" className="text-xs font-bold text-[#09318D]">
                        8. EMG Muscle Artifact (Gaussian Noise)
                      </label>
                      <HelpTooltip meta={ECG_CONTROL_TOOLTIPS.emgNoiseMv} />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#09318D] tabular-nums">
                      {params.emgNoiseMv.toFixed(2)} mV RMS
                    </span>
                  </div>
                  <input
                    id="slider-emg"
                    type="range"
                    min={0}
                    max={0.3}
                    step={0.01}
                    value={params.emgNoiseMv}
                    onChange={(e) => handleParamChange('emgNoiseMv', parseFloat(e.target.value))}
                    className="ecg-slider"
                  />
                </div>
              </div>
            </div>

            {/* Control Group 3: Signal Conditioning & Biquad Digital Filters */}
            <div className="rounded-2xl border-2 border-[#09318D]/20 bg-white p-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#09318D]/15">
                <Filter className="w-4 h-4 text-[#09318D]" />
                <h2 className="text-sm font-bold text-[#09318D]">
                  3. Signal Conditioning &amp; Causal Biquad Filter Bank
                </h2>
              </div>

              <div className="mt-4 space-y-4">
                {/* 9. High-Pass Cutoff (f_HP: 0.04 to 1.50 Hz, default 0.05 Hz, τ = 3.18 s) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <label htmlFor="slider-fhp" className="text-xs font-bold text-[#09318D]">
                        9. High-Pass Cutoff (f<sub>HP</sub>: 0.04–1.50 Hz)
                      </label>
                      <HelpTooltip meta={ECG_CONTROL_TOOLTIPS.highPassCutoffHz} />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#09318D] tabular-nums">
                      {params.highPassCutoffHz.toFixed(2)} Hz (τ={telemetry.filterTimeConstantTauSec.toFixed(2)}s)
                    </span>
                  </div>
                  <input
                    id="slider-fhp"
                    type="range"
                    min={0.04}
                    max={1.5}
                    step={0.01}
                    value={params.highPassCutoffHz}
                    onChange={(e) => {
                      handleParamChange('highPassEnabled', true);
                      handleParamChange('highPassCutoffHz', parseFloat(e.target.value));
                    }}
                    className="ecg-slider"
                  />
                  <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { hz: 0.04, label: '0.04Hz (MAC)' },
                      { hz: 0.05, label: '0.05Hz (τ=3.18s)' },
                      { hz: 0.67, label: '0.67Hz (τ=0.24s)' },
                      { hz: 1.5, label: '1.50Hz (ST Warp)' },
                    ].map((opt) => (
                      <button
                        key={opt.hz}
                        type="button"
                        onClick={() => {
                          handleParamChange('highPassEnabled', true);
                          handleParamChange('highPassCutoffHz', opt.hz);
                        }}
                        className={`py-1 rounded font-mono text-[10.5px] font-semibold border cursor-pointer ${
                          Math.abs(params.highPassCutoffHz - opt.hz) < 0.015
                            ? 'bg-[#FD91CC] text-[#09318D] border-[#09318D] font-bold'
                            : 'bg-white text-[#09318D] border-[#09318D]/20'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 10. Low-Pass Cutoff (f_LP: 15, 20, 30, 40, 100, 150 Hz) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <label htmlFor="slider-flp" className="text-xs font-bold text-[#09318D]">
                        10. Low-Pass Cutoff (f<sub>LP</sub>: 15–150 Hz)
                      </label>
                      <HelpTooltip meta={ECG_CONTROL_TOOLTIPS.lowPassCutoffHz} />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#09318D] tabular-nums">
                      {params.lowPassCutoffHz} Hz
                    </span>
                  </div>
                  <input
                    id="slider-flp"
                    type="range"
                    min={15}
                    max={150}
                    step={5}
                    value={params.lowPassCutoffHz}
                    onChange={(e) => {
                      handleParamChange('lowPassEnabled', true);
                      handleParamChange('lowPassCutoffHz', Number(e.target.value));
                    }}
                    className="ecg-slider"
                  />
                  <div className="mt-1.5 grid grid-cols-3 sm:grid-cols-6 gap-1">
                    {[
                      { hz: 15, label: '15Hz' },
                      { hz: 20, label: '20Hz' },
                      { hz: 30, label: '30Hz' },
                      { hz: 40, label: '40Hz' },
                      { hz: 100, label: '100Hz' },
                      { hz: 150, label: '150Hz' },
                    ].map((opt) => (
                      <button
                        key={opt.hz}
                        type="button"
                        onClick={() => {
                          handleParamChange('lowPassEnabled', true);
                          handleParamChange('lowPassCutoffHz', opt.hz);
                        }}
                        className={`py-1 rounded font-mono text-[10.5px] font-semibold border cursor-pointer ${
                          params.lowPassCutoffHz === opt.hz
                            ? 'bg-[#FD91CC] text-[#09318D] border-[#09318D] font-bold'
                            : 'bg-white text-[#09318D] border-[#09318D]/20'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 11. 50 Hz Biquad Notch Filter (Q = 8): ON / OFF Toggle */}
                <div className="p-3 rounded-xl bg-[#09318D]/[0.03] border border-[#09318D]/15 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#09318D]">
                      11. 50 Hz Biquad Notch Filter (Q = 8)
                    </span>
                    <HelpTooltip meta={ECG_CONTROL_TOOLTIPS.notch50HzEnabled} />
                  </div>

                  <button
                    type="button"
                    data-testid="toggle-50hz-notch-btn"
                    onClick={() =>
                      handleParamChange('notch50HzEnabled', !params.notch50HzEnabled)
                    }
                    aria-pressed={params.notch50HzEnabled}
                    className={`px-4 py-1.5 rounded-lg font-mono text-xs font-bold cursor-pointer transition-colors ${
                      params.notch50HzEnabled
                        ? 'bg-[#09318D] text-white'
                        : 'bg-[#FD91CC] text-[#09318D] border border-[#09318D]'
                    }`}
                  >
                    {params.notch50HzEnabled ? 'NOTCH ON (50 Hz)' : 'NOTCH OFF'}
                  </button>
                </div>

                {/* 12. Baseline De-Block / Reset Capacitor Switch */}
                <div className="p-3 rounded-xl bg-[#FD91CC]/20 border border-[#FD91CC] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#09318D]">
                      12. Baseline De-Block / Reset Capacitor
                    </span>
                    <HelpTooltip meta={ECG_CONTROL_TOOLTIPS.deblockButton} />
                  </div>

                  <button
                    type="button"
                    onClick={handleDeblockCapacitor}
                    className="px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold bg-[#09318D] text-white hover:bg-[#09318D]/90 cursor-pointer transition-colors"
                  >
                    DE-BLOCK CAPACITOR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
