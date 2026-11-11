import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, ArrowRight, Lightbulb } from 'lucide-react';
import { KNOWLEDGE_WHEEL_CARDS, KnowledgeWheelCard } from '../data/knowledgeWheelData';

interface RotaryKnowledgeWheelProps {
  onProceedTo3D: () => void;
}

export const RotaryKnowledgeWheel: React.FC<RotaryKnowledgeWheelProps> = ({ onProceedTo3D }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [knobAngleDeg, setKnobAngleDeg] = useState<number>(0);
  const wheelStageRef = useRef<HTMLDivElement | null>(null);
  const lastWheelTimeRef = useRef<number>(0);
  const isDraggingKnobRef = useRef<boolean>(false);
  const knobStartYRef = useRef<number>(0);

  const totalCards = KNOWLEDGE_WHEEL_CARDS.length; // 9 cards
  const activeCard: KnowledgeWheelCard = KNOWLEDGE_WHEEL_CARDS[activeIndex];

  const stepWheel = useCallback(
    (delta: number) => {
      setActiveIndex((prev) => (prev + delta + totalCards) % totalCards);
      setKnobAngleDeg((prev) => prev + delta * (360 / totalCards));
    },
    [totalCards]
  );

  const selectCardIndex = useCallback(
    (targetIdx: number) => {
      const diff = targetIdx - activeIndex;
      setActiveIndex(targetIdx);
      setKnobAngleDeg((prev) => prev + diff * (360 / totalCards));
    },
    [activeIndex, totalCards]
  );

  // Mouse wheel scroll handler on the rotary concept wheel stage
  useEffect(() => {
    const el = wheelStageRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();
      if (now - lastWheelTimeRef.current < 200) return;
      if (Math.abs(e.deltaY) < 6) return;
      lastWheelTimeRef.current = now;
      if (e.deltaY > 0) {
        stepWheel(1);
      } else {
        stepWheel(-1);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [stepWheel]);

  // Keyboard Left/Right navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') stepWheel(1);
      else if (e.key === 'ArrowLeft') stepWheel(-1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stepWheel]);

  // Interactive Rotary Knob drag support
  const handleKnobPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    isDraggingKnobRef.current = true;
    knobStartYRef.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleKnobPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDraggingKnobRef.current) return;
    const dy = knobStartYRef.current - e.clientY;
    if (Math.abs(dy) >= 26) {
      const steps = dy > 0 ? 1 : -1;
      stepWheel(steps);
      knobStartYRef.current = e.clientY;
    }
  };

  const handleKnobPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDraggingKnobRef.current) return;
    isDraggingKnobRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore if not captured
    }
  };

  // Render clean HTML/CSS textbook equation for each card (never raw LaTeX or underscores/carets)
  const renderCardFormattedEquation = (cardId: number) => {
    switch (cardId) {
      case 1:
        return (
          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-mono font-bold text-white">
            <span>
              V<sub>Lead II</sub>(t) = V<sub>Lead I</sub>(t) + V<sub>Lead III</sub>(t)
            </span>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-mono font-bold text-white">
            <span>
              Ag<sub>(s)</sub> + Cl<sup>−</sup>
              <sub>(aq)</sub> ⇄ AgCl<sub>(s)</sub> + e<sup>−</sup>
            </span>
            <span className="text-[#FD91CC] ml-2">
              (E<sub>0</sub> ≈ +222 mV vs. SHE)
            </span>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-mono font-bold text-white">
            <span>
              V<sub>II</sub>(t) = |p(t)| · cos(θ − 60°)
            </span>
            <span>,</span>
            <span className="inline-flex items-center">
              V<sub>WCT</sub> =
              <span className="math-fraction">
                <span className="math-num">
                  Φ<sub>RA</sub> + Φ<sub>LA</sub> + Φ<sub>LL</sub>
                </span>
                <span className="math-den">3</span>
              </span>
            </span>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-bold text-white">
            <span>
              BW<sub>Diagnostic</sub> = [0.05 Hz, 150 Hz]
            </span>
            <span className="text-[#FD91CC]">vs.</span>
            <span>
              BW<sub>Monitor</sub> = [0.50 Hz, 40 Hz]
            </span>
          </div>
        );
      case 5:
        return (
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-bold text-white">
            <span className="inline-flex items-center">
              V<sub>cm,closed</sub> =
              <span className="math-fraction">
                <span className="math-num">
                  V<sub>cm,open</sub>
                </span>
                <span className="math-den">
                  1 + G<sub>RLD</sub>
                </span>
              </span>
            </span>
            <span>,</span>
            <span className="inline-flex items-center">
              1 LSB =
              <span className="math-fraction">
                <span className="math-num">
                  V<sub>ref</sub>
                </span>
                <span className="math-den">
                  2<sup>24</sup>
                </span>
              </span>
            </span>
          </div>
        );
      case 6:
        return (
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-bold text-white">
            <span>
              I<sub>leakage</sub> ≤ 10 µA
            </span>
            <span className="text-[#FD91CC]">|</span>
            <span>
              Z<sub>in</sub> ≥ 10 MΩ
            </span>
            <span className="text-[#FD91CC]">|</span>
            <span>
              V<sub>noise,RTI</sub> ≤ 30 µV<sub>p-p</sub>
            </span>
          </div>
        );
      case 7:
        return (
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-white">
            <span>
              H<sub>total</sub>(z) = H<sub>HP</sub>(z) × H<sub>Notch,50Hz</sub>(z) × H<sub>LP</sub>(z)
            </span>
          </div>
        );
      case 8:
        return (
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono font-bold text-white">
            <span>
              A<sub>50Hz</sub> = V<sub>cm</sub> ×
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
            <span>
              + 10
              <sup>
                −CMRR<sub>dB</sub> / 20
              </sup>
            </span>
            <span>]</span>
          </div>
        );
      case 9:
      default:
        return (
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-bold text-white">
            <span className="inline-flex items-center">
              QTc =
              <span className="math-fraction">
                <span className="math-num">QT</span>
                <span className="math-den">
                  √RR<sub>sec</sub>
                </span>
              </span>
            </span>
            <span className="text-[#FD91CC]">|</span>
            <span className="inline-flex items-center">
              SNR<sub>dB</sub> = 20 · log<sub>10</sub>
              <span className="math-fraction">
                <span className="math-num">
                  RMS(V<sub>clean</sub>)
                </span>
                <span className="math-den">
                  RMS(V<sub>filt</sub> − V<sub>clean</sub>)
                </span>
              </span>
            </span>
          </div>
        );
    }
  };

  // Render technical schematic SVG inside the active card
  const renderCardDiagram = (type: KnowledgeWheelCard['diagramType']) => {
    switch (type) {
      case 'what_is_ecg_history':
        return (
          <svg viewBox="0 0 360 100" className="w-full h-24" role="img" aria-label="PQRST Waveform and Einthoven Triangle">
            <line x1="12" y1="68" x2="215" y2="68" stroke="#09318D" strokeOpacity="0.2" strokeDasharray="3 3" />
            <path
              d="M 15 68 L 42 68 Q 56 48 70 68 L 92 68 L 102 80 L 115 14 L 128 88 L 138 68 L 168 68 Q 188 38 208 68 L 222 68"
              fill="none"
              stroke="#09318D"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="115" cy="14" r="4" fill="#FD91CC" stroke="#09318D" strokeWidth="1.5" />
            <text x="52" y="44" fill="#09318D" fontSize="10" fontWeight="700">P</text>
            <text x="122" y="20" fill="#09318D" fontSize="10" fontWeight="700">R</text>
            <text x="184" y="36" fill="#09318D" fontSize="10" fontWeight="700">T</text>
            {/* Einthoven Triangle on Right */}
            <polygon points="255,20 335,20 295,86" fill="rgba(253,145,204,0.18)" stroke="#09318D" strokeWidth="2" />
            <circle cx="255" cy="20" r="4.5" fill="#09318D" />
            <circle cx="335" cy="20" r="4.5" fill="#09318D" />
            <circle cx="295" cy="86" r="4.5" fill="#FD91CC" stroke="#09318D" strokeWidth="1.5" />
            <text x="235" y="22" fill="#09318D" fontSize="9" fontWeight="700">RA</text>
            <text x="340" y="22" fill="#09318D" fontSize="9" fontWeight="700">LA</text>
            <text x="303" y="92" fill="#09318D" fontSize="9" fontWeight="700">LL</text>
          </svg>
        );
      case 'data_acquisition':
        return (
          <svg viewBox="0 0 360 100" className="w-full h-24" role="img" aria-label="Ag/AgCl Ionic to Electronic Transduction">
            <rect x="14" y="18" width="95" height="64" rx="8" fill="rgba(253,145,204,0.2)" stroke="#09318D" strokeWidth="2" />
            <text x="24" y="42" fill="#09318D" fontSize="10" fontWeight="700">Myocardium</text>
            <text x="24" y="58" fill="#09318D" fontSize="9">Na⁺ / K⁺ Ions</text>
            <text x="24" y="72" fill="#09318D" fontSize="9">~1 mV @ Skin</text>
            <line x1="109" y1="50" x2="135" y2="50" stroke="#09318D" strokeWidth="2.5" />
            <rect x="135" y="18" width="95" height="64" rx="8" fill="#FFFFFF" stroke="#09318D" strokeWidth="2" />
            <text x="145" y="42" fill="#09318D" fontSize="10" fontWeight="700">Ag/AgCl Gel</text>
            <text x="145" y="58" fill="#09318D" fontSize="9">Ag + Cl⁻ ⇄ AgCl + e⁻</text>
            <text x="145" y="72" fill="#09318D" fontSize="9">+220 mV Half-Cell</text>
            <line x1="230" y1="50" x2="255" y2="50" stroke="#09318D" strokeWidth="2.5" />
            <rect x="255" y="18" width="92" height="64" rx="8" fill="#09318D" />
            <text x="265" y="42" fill="#FFFFFF" fontSize="10" fontWeight="700">Lead Wire</text>
            <text x="265" y="58" fill="#FD91CC" fontSize="9">Electron Flow (e⁻)</text>
            <text x="265" y="72" fill="#FFFFFF" fontSize="9">To INA Input</text>
          </svg>
        );
      case 'electrode_placement':
        return (
          <svg viewBox="0 0 360 100" className="w-full h-24" role="img" aria-label="10-Electrode 12-Lead Placement Map">
            <rect x="125" y="10" width="100" height="80" rx="14" fill="rgba(9,49,141,0.05)" stroke="#09318D" strokeWidth="2" />
            <circle cx="105" cy="22" r="6" fill="#DC2626" stroke="#09318D" strokeWidth="1.5" />
            <text x="58" y="26" fill="#09318D" fontSize="10" fontWeight="700">RA (−)</text>
            <circle cx="245" cy="22" r="6" fill="#EAB308" stroke="#09318D" strokeWidth="1.5" />
            <text x="256" y="26" fill="#09318D" fontSize="10" fontWeight="700">LA</text>
            <circle cx="105" cy="82" r="6" fill="#1E293B" />
            <text x="45" y="86" fill="#09318D" fontSize="10" fontWeight="700">RL (GND)</text>
            <circle cx="245" cy="82" r="6" fill="#16A34A" stroke="#09318D" strokeWidth="1.5" />
            <text x="256" y="86" fill="#09318D" fontSize="10" fontWeight="700">LL (+)</text>
            {/* +60 deg Lead II Cardiac Axis Arrow */}
            <line x1="155" y1="28" x2="195" y2="68" stroke="#FD91CC" strokeWidth="3.5" />
            <circle cx="160" cy="40" r="3.2" fill="#FD91CC" stroke="#09318D" />
            <circle cx="176" cy="40" r="3.2" fill="#FD91CC" stroke="#09318D" />
            <circle cx="183" cy="48" r="3.2" fill="#FD91CC" stroke="#09318D" />
            <circle cx="190" cy="55" r="3.2" fill="#FD91CC" stroke="#09318D" />
            <circle cx="199" cy="56" r="3.2" fill="#FD91CC" stroke="#09318D" />
            <circle cx="208" cy="55" r="3.2" fill="#FD91CC" stroke="#09318D" />
            <text x="138" y="78" fill="#09318D" fontSize="9.5" fontWeight="700">Lead II (+60°) &amp; V1–V6</text>
          </svg>
        );
      case 'device_brands':
        return (
          <svg viewBox="0 0 360 100" className="w-full h-24" role="img" aria-label="ECG Device Types and Market Brands">
            <rect x="12" y="14" width="162" height="34" rx="6" fill="#09318D" />
            <text x="20" y="30" fill="#FFFFFF" fontSize="9.5" fontWeight="700">GE HealthCare MAC Series</text>
            <text x="20" y="42" fill="#FD91CC" fontSize="8.5">Resting 12-Lead · Marquette 12SL</text>
            <rect x="186" y="14" width="162" height="34" rx="6" fill="rgba(253,145,204,0.28)" stroke="#09318D" strokeWidth="1.5" />
            <text x="194" y="30" fill="#09318D" fontSize="9.5" fontWeight="700">Philips PageWriter TC70</text>
            <text x="194" y="42" fill="#09318D" fontSize="8.5">Hospital Cart &amp; ICU Telemetry</text>
            <rect x="12" y="54" width="162" height="34" rx="6" fill="#FFFFFF" stroke="#09318D" strokeWidth="1.5" />
            <text x="20" y="70" fill="#09318D" fontSize="9.5" fontWeight="700">Nihon Kohden Cardiofax</text>
            <text x="20" y="82" fill="#09318D" fontSize="8.5">Diagnostic &amp; Stress ECG</text>
            <rect x="186" y="54" width="162" height="34" rx="6" fill="#FFFFFF" stroke="#09318D" strokeWidth="1.5" />
            <text x="194" y="70" fill="#09318D" fontSize="9.5" fontWeight="700">Schiller &amp; Mindray</text>
            <text x="194" y="82" fill="#09318D" fontSize="8.5">CARDIOVIT · BeneHeart · Holter</text>
          </svg>
        );
      case 'internal_components':
        return (
          <svg viewBox="0 0 360 100" className="w-full h-24" role="img" aria-label="Internal Electronic Signal Chain">
            <rect x="8" y="26" width="68" height="48" rx="6" fill="#FFFFFF" stroke="#09318D" strokeWidth="2" />
            <text x="14" y="46" fill="#09318D" fontSize="8.5" fontWeight="700">Defib Clamp</text>
            <text x="14" y="60" fill="#09318D" fontSize="8">TVS + Neon</text>
            <line x1="76" y1="50" x2="92" y2="50" stroke="#09318D" strokeWidth="2" />
            <rect x="92" y="26" width="80" height="48" rx="6" fill="rgba(253,145,204,0.3)" stroke="#09318D" strokeWidth="2" />
            <text x="98" y="46" fill="#09318D" fontSize="8.5" fontWeight="700">INA + RLD</text>
            <text x="98" y="60" fill="#09318D" fontSize="8">AD8232/INA128</text>
            <line x1="172" y1="50" x2="188" y2="50" stroke="#09318D" strokeWidth="2" />
            <rect x="188" y="26" width="76" height="48" rx="6" fill="#FFFFFF" stroke="#09318D" strokeWidth="2" />
            <text x="194" y="46" fill="#09318D" fontSize="8.5" fontWeight="700">Anti-Alias LP</text>
            <text x="194" y="60" fill="#09318D" fontSize="8">Analog Filter</text>
            <line x1="264" y1="50" x2="280" y2="50" stroke="#09318D" strokeWidth="2" />
            <rect x="280" y="26" width="72" height="48" rx="6" fill="#09318D" />
            <text x="286" y="46" fill="#FFFFFF" fontSize="8.5" fontWeight="700">24-Bit ΣΔ</text>
            <text x="286" y="60" fill="#FD91CC" fontSize="8">TI ADS1298</text>
          </svg>
        );
      case 'safety_protocols':
        return (
          <svg viewBox="0 0 360 100" className="w-full h-24" role="img" aria-label="IEC 60601-2-25 Type CF Isolation Barrier">
            <rect x="16" y="20" width="125" height="60" rx="8" fill="#FFFFFF" stroke="#09318D" strokeWidth="2" />
            <text x="26" y="42" fill="#09318D" fontSize="9.5" fontWeight="700">Patient Floating Side</text>
            <text x="26" y="58" fill="#09318D" fontSize="8.5">Type CF · Zin ≥ 10 MΩ</text>
            <text x="26" y="70" fill="#09318D" fontSize="8.5">Leakage ≤ 10 µA</text>
            {/* Optical / Galvanic Isolation Barrier */}
            <line x1="175" y1="10" x2="175" y2="90" stroke="#FD91CC" strokeWidth="4" strokeDasharray="6 4" />
            <line x1="185" y1="10" x2="185" y2="90" stroke="#09318D" strokeWidth="2" strokeDasharray="6 4" />
            <text x="148" y="18" fill="#09318D" fontSize="8.5" fontWeight="700">4 kV ISOLATION</text>
            <rect x="218" y="20" width="125" height="60" rx="8" fill="#09318D" />
            <text x="228" y="42" fill="#FFFFFF" fontSize="9.5" fontWeight="700">Earth-Grounded Side</text>
            <text x="228" y="58" fill="#FD91CC" fontSize="8.5">CPU · Display · Mains</text>
            <text x="228" y="70" fill="#FFFFFF" fontSize="8.5">Noise ≤ 30 µVp-p</text>
          </svg>
        );
      case 'signal_filtering':
        return (
          <svg viewBox="0 0 360 100" className="w-full h-24" role="img" aria-label="ECG Filter Frequency Response">
            <rect x="14" y="22" width="100" height="56" rx="8" fill="#FFFFFF" stroke="#09318D" strokeWidth="2" />
            <text x="22" y="44" fill="#09318D" fontSize="9.5" fontWeight="700">High-Pass (f_HP)</text>
            <text x="22" y="58" fill="#09318D" fontSize="8.5">0.05 Hz Cutoff</text>
            <text x="22" y="70" fill="#09318D" fontSize="8">Blocks 0.25 Hz Drift</text>
            <rect x="130" y="22" width="100" height="56" rx="8" fill="rgba(253,145,204,0.3)" stroke="#09318D" strokeWidth="2" />
            <text x="138" y="44" fill="#09318D" fontSize="9.5" fontWeight="700">50 Hz Notch</text>
            <text x="138" y="58" fill="#09318D" fontSize="8.5">Biquad Q = 8</text>
            <text x="138" y="70" fill="#09318D" fontSize="8">Cuts AC Mains Hum</text>
            <rect x="246" y="22" width="100" height="56" rx="8" fill="#09318D" />
            <text x="254" y="44" fill="#FFFFFF" fontSize="9.5" fontWeight="700">Low-Pass (f_LP)</text>
            <text x="254" y="58" fill="#FD91CC" fontSize="8.5">20 – 150 Hz</text>
            <text x="254" y="70" fill="#FFFFFF" fontSize="8">Cuts EMG Muscle Fuzz</text>
          </svg>
        );
      case 'engineering_limitations':
        return (
          <svg viewBox="0 0 360 100" className="w-full h-24" role="img" aria-label="ST Phase Distortion and Impedance Mismatch">
            <path
              d="M 15 62 Q 95 24 180 62 T 345 54"
              fill="none"
              stroke="#FD91CC"
              strokeWidth="3"
              strokeDasharray="5 3"
            />
            <path
              d="M 15 62 L 55 62 L 70 48 L 85 62 L 120 62 L 132 75 L 146 16 L 160 88 L 175 82 L 220 76 L 255 48 L 285 62 L 345 62"
              fill="none"
              stroke="#09318D"
              strokeWidth="2.5"
            />
            <text x="18" y="22" fill="#09318D" fontSize="9.5" fontWeight="700">ΔZe = 80 kΩ → 1.62 mV Hum</text>
            <text x="175" y="22" fill="#09318D" fontSize="9.5" fontWeight="700">f_HP = 1.5 Hz → ST Depression</text>
            <text x="168" y="95" fill="#09318D" fontSize="9" fontWeight="700">▲ Artificial ST Phase Drop (&gt;0.10 mV)</text>
          </svg>
        );
      case 'simulated_vs_clinical':
      default:
        return (
          <svg viewBox="0 0 360 100" className="w-full h-24" role="img" aria-label="Synthetic ODE vs Clinical MIT-BIH Data">
            <rect x="14" y="18" width="156" height="64" rx="8" fill="#FFFFFF" stroke="#09318D" strokeWidth="2" />
            <text x="24" y="38" fill="#09318D" fontSize="9.5" fontWeight="700">Synthetic McSharry ODE</text>
            <text x="24" y="54" fill="#09318D" fontSize="8.5">Deterministic Gaussian Sum</text>
            <text x="24" y="68" fill="#09318D" fontSize="8.5">Exact Ground-Truth V_clean(t)</text>
            <rect x="190" y="18" width="156" height="64" rx="8" fill="rgba(253,145,204,0.25)" stroke="#09318D" strokeWidth="2" />
            <text x="200" y="38" fill="#09318D" fontSize="9.5" fontWeight="700">Clinical Patient (MIT-BIH)</text>
            <text x="200" y="54" fill="#09318D" fontSize="8.5">Autonomic HRV (±5% RR Jitter)</text>
            <text x="200" y="68" fill="#09318D" fontSize="8.5">Non-Stationary Motion Noise</text>
          </svg>
        );
    }
  };

  return (
    <section className="min-h-[calc(100vh-65px)] bg-white text-[#09318D] px-6 py-5 md:py-6 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full">
        {/* Top Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#09318D]/15">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#09318D]/70">
              <span>SCREEN 02 OF 05</span>
              <span aria-hidden="true">·</span>
              <span>INTERACTIVE CONCEPT WHEEL</span>
              <span aria-hidden="true">·</span>
              <span>CARD {activeCard.stepNumber} / 09</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#09318D] mt-0.5">
              Interactive Biomedical Concept Wheel (9 Stations)
            </h1>
          </div>
          <p className="text-xs text-[#09318D]/75 max-w-md">
            Rotate through all 9 cards using your <strong>mouse scroll wheel</strong> over the wheel or the <strong>ECG Hardware Keypad (PREV, NEXT &amp; Rotary Knob)</strong> on the right. Only the active card is displayed in full detail.
          </p>
        </div>

        {/* Main 3-Column Layout: Left Rotary Concept Wheel | Center Active Detail Card | Right ECG Hardware Keypad */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column (4 cols): 9-Card Rotary Concept Wheel */}
          <div
            ref={wheelStageRef}
            data-testid="rotary-wheel-stage"
            className="lg:col-span-4 flex flex-col items-center justify-between p-5 rounded-2xl border border-[#09318D]/15 bg-white select-none"
          >
            <div className="w-full flex items-center justify-between text-xs font-mono text-[#09318D]/70 pb-2 border-b border-[#09318D]/10">
              <span>INTERACTIVE CONCEPT WHEEL</span>
              <span>STATION {activeCard.stepNumber}/09</span>
            </div>

            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-2">
              {/* Outer Wheel Rim & 9 Spokes */}
              <svg
                viewBox="0 0 320 320"
                className="w-full h-full"
                aria-label="Interactive Concept Wheel Structure"
              >
                <circle
                  cx="160"
                  cy="160"
                  r="128"
                  fill="none"
                  stroke="#09318D"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  strokeOpacity="0.35"
                />
                <circle
                  cx="160"
                  cy="160"
                  r="88"
                  fill="none"
                  stroke="#FD91CC"
                  strokeWidth="1.5"
                  strokeOpacity="0.65"
                />
                {/* 9 Spokes rotating so the active card sits at 0 deg (right-hand focus position) */}
                {KNOWLEDGE_WHEEL_CARDS.map((card, idx) => {
                  const relativeIdx = (idx - activeIndex + totalCards) % totalCards;
                  const angleRad = (relativeIdx * 2 * Math.PI) / totalCards;
                  const x2 = 160 + 128 * Math.cos(angleRad);
                  const y2 = 160 + 128 * Math.sin(angleRad);
                  const isCurrent = idx === activeIndex;
                  return (
                    <line
                      key={card.id}
                      x1="160"
                      y1="160"
                      x2={x2}
                      y2={y2}
                      stroke={isCurrent ? '#FD91CC' : '#09318D'}
                      strokeWidth={isCurrent ? '3.2' : '1.2'}
                      strokeOpacity={isCurrent ? '1' : '0.25'}
                    />
                  );
                })}
              </svg>

              {/* Center Wheel Hub strictly labeled "CONCEPT WHEEL" */}
              <div className="absolute w-24 h-24 rounded-full bg-[#09318D] text-white border-4 border-[#FD91CC] flex flex-col items-center justify-center text-center shadow-md px-1">
                <span className="text-[9px] font-mono tracking-wider text-[#FD91CC] font-bold leading-tight">
                  CONCEPT WHEEL
                </span>
                <span className="text-base font-bold font-mono tabular-nums mt-0.5">
                  {activeCard.stepNumber}/09
                </span>
                <span className="text-[9px] text-white/80 font-mono">ACTIVE HUB</span>
              </div>

              {/* 9 Station Nodes Around the Wheel Perimeter */}
              {KNOWLEDGE_WHEEL_CARDS.map((card, idx) => {
                const relativeIdx = (idx - activeIndex + totalCards) % totalCards;
                const angleRad = (relativeIdx * 2 * Math.PI) / totalCards;
                const radiusPct = 41;
                const leftPct = 50 + radiusPct * Math.cos(angleRad);
                const topPct = 50 + radiusPct * Math.sin(angleRad);
                const isCurrent = idx === activeIndex;
                const shortWord = card.shortWheelLabel.replace(/^\d+\.\s*/, '').split(' ')[0];

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => selectCardIndex(idx)}
                    style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                    aria-label={`Select Concept Card ${card.shortWheelLabel}`}
                    aria-current={isCurrent ? 'step' : undefined}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-xl border text-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      isCurrent
                        ? 'bg-[#09318D] text-white border-[#FD91CC] border-2 scale-105 shadow-md z-20'
                        : 'bg-white text-[#09318D] border-[#09318D]/25 hover:border-[#FD91CC] z-10'
                    }`}
                  >
                    <span className="font-mono font-bold mr-1">{card.stepNumber}</span>
                    <span>{shortWord}</span>
                  </button>
                );
              })}
            </div>

            <div className="w-full pt-2 border-t border-[#09318D]/10 text-center">
              <p className="text-[11px] font-mono text-[#09318D]/70">
                SCROLL MOUSE WHEEL OR CLICK ANY STATION (01–09)
              </p>
            </div>
          </div>

          {/* Center Column (5 cols): Single Active Detailed Info Card with Everyday Analogy Box */}
          <div
            data-testid="active-wheel-card"
            className="lg:col-span-5 rounded-2xl border-2 border-[#09318D] bg-white p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#09318D]/15">
                <span className="text-xs font-mono font-semibold text-[#09318D]">
                  ACTIVE CONCEPT CARD · {activeCard.stepNumber} OF 09
                </span>
                <span className="text-xs font-mono text-[#09318D]/75">
                  {activeCard.shortWheelLabel}
                </span>
              </div>

              <p className="text-[11px] font-medium text-[#09318D]/70 mt-2">{activeCard.kicker}</p>
              <h2 className="text-lg md:text-xl font-bold text-[#09318D] mt-0.5 leading-snug">
                {activeCard.title}
              </h2>
              <p className="text-xs text-[#09318D]/85 mt-1.5 leading-relaxed">
                {activeCard.summary}
              </p>

              {/* Beginner-Friendly "Everyday Analogy" Box (Required on Every Card) */}
              <div
                data-testid="everyday-analogy-box"
                className="mt-3 p-3 rounded-xl bg-[#FD91CC]/20 border border-[#FD91CC] text-[#09318D]"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#09318D]">
                  <Lightbulb className="w-4 h-4 text-[#09318D] shrink-0" />
                  <span>Everyday Analogy</span>
                </div>
                <p className="text-xs text-[#09318D]/90 mt-1 leading-relaxed">
                  {activeCard.everydayAnalogy}
                </p>
              </div>

              {/* Technical Schematic Diagram for Active Card */}
              <div className="mt-2.5 p-2 rounded-xl bg-[#09318D]/[0.03] border border-[#09318D]/15">
                {renderCardDiagram(activeCard.diagramType)}
              </div>

              {/* 3 Key Engineering Metrics (Clean unboxed tabular layout) */}
              <div className="mt-2.5 grid grid-cols-3 gap-2 pt-2 border-t border-[#09318D]/15">
                {activeCard.keyMetrics.map((m) => (
                  <div key={m.label}>
                    <p className="text-[10px] text-[#09318D]/65">{m.label}</p>
                    <p className="text-xs font-mono font-bold text-[#09318D] mt-0.5 tabular-nums">
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Engineering Sub-points */}
              <div className="mt-2.5 space-y-1.5 pt-2 border-t border-[#09318D]/15">
                {activeCard.engineeringPoints.map((pt) => (
                  <div key={pt.heading}>
                    <h3 className="text-xs font-bold text-[#09318D]">{pt.heading}</h3>
                    <p className="text-[11px] text-[#09318D]/80 leading-snug">{pt.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Governing Principle / Textbook-Formatted Equation Box */}
            <div className="mt-3 p-3 rounded-xl bg-[#09318D] text-white">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#FD91CC] mb-1">
                <span>{activeCard.equationOrPrinciple.label}</span>
                <span>PRINCIPLE {activeCard.stepNumber}</span>
              </div>
              {renderCardFormattedEquation(activeCard.id)}
              <p className="text-[11px] text-white/85 mt-1 leading-snug">
                {activeCard.equationOrPrinciple.explanation}
              </p>
            </div>
          </div>

          {/* Right Column (3 cols): Realistic ECG Hardware Keypad (PREV, NEXT, and Rotary Encoder Knob) */}
          <div className="lg:col-span-3 rounded-2xl bg-[#09318D] text-white p-5 border-2 border-[#09318D] shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-white/15">
                <span className="text-xs font-mono tracking-wider text-[#FD91CC]">
                  ECG HARDWARE KEYPAD
                </span>
                <span className="text-xs font-mono text-white/75">9-CARD ROTOR</span>
              </div>

              {/* Simulated Mini LCD Readout on Hardware Keypad */}
              <div className="mt-3 p-3 rounded-xl bg-[#06101E] border border-[#00FF66]/40 text-[#00FF66] font-mono">
                <div className="flex items-center justify-between text-[10px] opacity-80">
                  <span>CONCEPT WHEEL: 0{activeCard.id}/09</span>
                  <span>READY</span>
                </div>
                <p className="text-xs font-bold mt-1 truncate">{activeCard.shortWheelLabel}</p>
                <div className="mt-2 h-1.5 w-full bg-[#09318D]/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00FF66] transition-all duration-200"
                    style={{ width: `${((activeIndex + 1) / totalCards) * 100}%` }}
                  />
                </div>
              </div>

              {/* Tactile PREV & NEXT Hardware Keys */}
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => stepWheel(-1)}
                  aria-label="PREV Card"
                  className="flex flex-col items-center justify-center py-3 px-3 rounded-xl bg-white text-[#09318D] font-bold text-xs hover:bg-[#FD91CC] transition-colors cursor-pointer active:translate-y-0.5 shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5 mb-0.5" />
                  <span className="font-mono tracking-wider">PREV</span>
                </button>

                <button
                  type="button"
                  onClick={() => stepWheel(1)}
                  aria-label="NEXT Card"
                  className="flex flex-col items-center justify-center py-3 px-3 rounded-xl bg-[#FD91CC] text-[#09318D] font-bold text-xs hover:bg-white transition-colors cursor-pointer active:translate-y-0.5 shadow-sm"
                >
                  <ChevronRight className="w-5 h-5 mb-0.5" />
                  <span className="font-mono tracking-wider">NEXT</span>
                </button>
              </div>

              {/* Interactive Tactile Rotary Encoder Knob ("Jog Dial") */}
              <div className="mt-5 flex flex-col items-center">
                <p className="text-[10px] font-mono text-white/80 uppercase tracking-wider mb-2.5">
                  Visual Rotary Encoder Knob
                </p>

                <button
                  type="button"
                  onClick={() => stepWheel(1)}
                  onPointerDown={handleKnobPointerDown}
                  onPointerMove={handleKnobPointerMove}
                  onPointerUp={handleKnobPointerUp}
                  aria-label="Rotate ECG Encoder Knob to Next Card"
                  className="relative w-24 h-24 rounded-full bg-white text-[#09318D] border-4 border-[#FD91CC] shadow-inner flex items-center justify-center cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FD91CC]"
                >
                  <div
                    className="w-16 h-16 rounded-full bg-[#09318D] border-2 border-[#FD91CC] flex items-center justify-center transition-transform duration-200"
                    style={{ transform: `rotate(${knobAngleDeg}deg)` }}
                  >
                    <div className="w-2 h-5 rounded-full bg-[#FD91CC] -translate-y-4" />
                  </div>
                  <RotateCw className="w-4 h-4 text-white absolute pointer-events-none opacity-80" />
                </button>

                <p className="text-[11px] text-white/75 text-center mt-2.5 leading-snug">
                  Click or drag knob vertically to rotate ({activeIndex + 1} of {totalCards} cards).
                </p>
              </div>
            </div>

            {/* Direct Station Number Buttons (1-9) */}
            <div className="mt-4 pt-3 border-t border-white/15">
              <p className="text-[10px] font-mono text-white/75 mb-1.5">DIRECT STATION KEYS (1–9)</p>
              <div className="grid grid-cols-3 gap-1.5">
                {KNOWLEDGE_WHEEL_CARDS.map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectCardIndex(idx)}
                    aria-label={`Station ${c.id}`}
                    className={`py-1.5 rounded-lg font-mono text-xs font-bold transition-colors cursor-pointer ${
                      idx === activeIndex
                        ? 'bg-[#FD91CC] text-[#09318D]'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    0{c.id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Proceed Button to Screen 3 */}
        <div className="mt-5 pt-4 border-t border-[#09318D]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-mono text-[#09318D]/75">
            ACTIVE STATION: <strong className="text-[#09318D]">{activeCard.shortWheelLabel}</strong> · ROTATE THROUGH ALL 9 CONCEPT CARDS
          </div>

          <button
            type="button"
            onClick={onProceedTo3D}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-[#09318D] text-white font-bold text-sm hover:bg-[#09318D]/90 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
          >
            <span>Next: Explore Device &amp; Electrode Placement -&gt;</span>
            <span className="w-6 h-6 rounded-lg bg-[#FD91CC] text-[#09318D] flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
