import test from 'node:test';
import assert from 'node:assert/strict';
import { ECGSimulationEngine } from './ECGSimulationEngine';
import { ECGUIController } from './ECGUIController';

test('Einthoven Law holds strictly across cardiac cycle (Lead II = Lead I + Lead III)', () => {
  const engine = new ECGSimulationEngine(360, {
    heartRateBpm: 75,
    cardiacAxisDeg: 45,
  });

  const samples = engine.stepBatch(360);
  for (const s of samples) {
    const sum = s.cleanLeads.leadI + s.cleanLeads.leadIII;
    assert.ok(
      Math.abs(s.cleanLeads.leadII - sum) < 1e-12,
      `Expected Lead II (${s.cleanLeads.leadII}) to equal Lead I + Lead III (${sum})`
    );
  }
});

test('Test Scenario 1: Huhta & Webster 50 Hz common-mode coupling produces exact A_50Hz = 1.62 mV at ΔZe = 80 kΩ, CMRR = 80 dB, Zin = 10 MΩ, Vcm = 200 mV', () => {
  const a50Hz = ECGSimulationEngine.computePowerlineDifferentialAmplitudeMv(0.2, 80, 80);
  assert.ok(
    Math.abs(a50Hz - 1.62) < 1e-9,
    `Expected A_50Hz to be 1.62 mV, got ${a50Hz}`
  );

  const controller = new ECGUIController();
  const res = controller.runVerificationScenario('test_1_mains_mismatch');
  assert.equal(res.logEntry.passed, true);
});

test('Test Scenario 2: Aggressive 1.50 Hz High-Pass filter with 0.60 mV baseline wander produces > 0.10 mV ST-segment phase error', () => {
  const controller = new ECGUIController();
  const res = controller.runVerificationScenario('test_2_baseline_st_distortion');
  assert.ok(
    res.telemetry.stDistortionMv > 0.1,
    `Expected ST phase error > 0.10 mV at f_HP = 1.50 Hz, got ${res.telemetry.stDistortionMv} mV`
  );
  assert.equal(res.logEntry.passed, true);
});

test('Test Scenario 3: Tachycardia (120 bpm) & Low-Pass f_LP = 20 Hz yields RR = 500 ms and ~30% R-peak attenuation', () => {
  const controller = new ECGUIController();
  const res = controller.runVerificationScenario('test_3_tachycardia_lp_attenuation');
  assert.equal(res.telemetry.rrIntervalMs, 500);
  assert.ok(
    res.telemetry.rPeakAttenuationPct >= 22 && res.telemetry.rPeakAttenuationPct <= 40,
    `Expected ~30% R-peak attenuation at f_LP = 20 Hz, got ${res.telemetry.rPeakAttenuationPct}%`
  );
  assert.equal(res.logEntry.passed, true);
});

test('ECGUIController resets to clinical default cleanly and supports deblockCapacitor()', () => {
  const controller = new ECGUIController();
  controller.updateParam('heartRateBpm', 135);
  assert.equal(controller.getParams().heartRateBpm, 135);

  const resetParams = controller.resetToDefault();
  assert.equal(resetParams.heartRateBpm, 72);
  assert.equal(resetParams.cmrrDb, 100);
  assert.equal(resetParams.lowPassCutoffHz, 150);

  const telemetry = controller.deblockCapacitor();
  assert.equal(telemetry.filterTimeConstantTauSec, 3.18);
  assert.ok(telemetry.fsvGdm >= 0);
});

