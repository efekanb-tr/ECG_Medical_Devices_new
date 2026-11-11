import React from 'react';
import { ArrowRight, Compass, Cpu, Activity, BookOpen } from 'lucide-react';
import { ScreenId } from './NavigationDrawer';

interface WelcomeScreenProps {
  onStart: () => void;
  onJumpToScreen: (screen: ScreenId) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onJumpToScreen }) => {
  return (
    <section className="min-h-[calc(100vh-65px)] bg-white text-[#09318D] flex flex-col justify-between px-6 py-6 md:py-10">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center">
        {/* Clean unboxed metadata line */}
        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-mono text-[#09318D]/75 mb-3">
          <span>BIOMEDICAL INSTRUMENTATION &amp; DSP</span>
          <span aria-hidden="true">·</span>
          <span>MCSHARRY DIPOLE, ANSI/AAMI EC12 &amp; IEC 60601-2-25</span>
          <span aria-hidden="true">·</span>
          <span>6 INTERACTIVE SCREENS</span>
        </div>

        {/* Minimalist Clinical Hero Header */}
        <h1
          className="text-3xl sm:text-5xl font-bold tracking-tight text-[#09318D] leading-[1.08]"
          style={{ textWrap: 'balance' }}
        >
          Interactive ECG Medical Device Simulator
        </h1>

        <p className="mt-3 text-sm md:text-base text-[#09318D]/85 max-w-3xl leading-relaxed">
          An interactive biomedical engineering educational workbench exploring clinical electrocardiography—from Willem Einthoven’s string galvanometer, Baxter ANSI/AAMI EC12 Ag/AgCl electrodes, Nihon Kohden <code className="font-mono">synECi18</code> 18-lead synthesis, and commercial hardware specs (GE MAC 2000, Welch Allyn ELI 380/WAM, Philips PageWriter TC70) to a live Left-to-Right hospital monitor simulator with WhaleTeq/IEC 60601-2-25 verification tests and 16 IEEE references.
        </p>

        {/* Animated SVG ECG Pulse Line Stage + Assignment Overview */}
        <div className="mt-6 mb-6 rounded-2xl border-2 border-[#09318D]/20 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#09318D]/15 text-xs font-mono text-[#09318D]/80">
            <span>ANIMATED CLINICAL LEAD II SINUS RHYTHM (+60° CARDIAC AXIS)</span>
            <span>CALIBRATION: 25 mm/s · 10 mm/mV · P–Q–R–S–T DIPOLE WAVEFORM</span>
          </div>

          {/* Animated SVG ECG Waveform with Millimeter Calibration Grid */}
          <div className="relative w-full h-36 md:h-40 rounded-xl bg-[#09318D]/[0.02] border border-[#09318D]/15 overflow-hidden flex items-center">
            <svg
              viewBox="0 0 900 160"
              className="w-full h-full block"
              role="img"
              aria-label="Animated SVG Electrocardiogram PQRST Pulse Line"
            >
              <defs>
                <pattern id="welcome-mm-grid" width="18" height="18" patternUnits="userSpaceOnUse">
                  <path
                    d="M 18 0 L 0 0 0 18"
                    fill="none"
                    stroke="#09318D"
                    strokeWidth="0.6"
                    strokeOpacity="0.1"
                  />
                </pattern>
                <pattern id="welcome-major-grid" width="90" height="90" patternUnits="userSpaceOnUse">
                  <rect width="90" height="90" fill="url(#welcome-mm-grid)" />
                  <path
                    d="M 90 0 L 0 0 0 90"
                    fill="none"
                    stroke="#09318D"
                    strokeWidth="1.2"
                    strokeOpacity="0.18"
                  />
                </pattern>
              </defs>

              {/* Grid Background */}
              <rect width="900" height="160" fill="url(#welcome-major-grid)" />

              {/* Isoelectric Baseline (0 mV) */}
              <line
                x1="0"
                y1="105"
                x2="900"
                y2="105"
                stroke="#09318D"
                strokeOpacity="0.22"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />

              {/* 1 mV Standard Calibration Pulse on Left */}
              <path
                d="M 18 105 L 28 105 L 28 35 L 54 35 L 54 105 L 68 105"
                fill="none"
                stroke="#09318D"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text x="18" y="126" fill="#09318D" fontSize="11" fontWeight="700" fontFamily="IBM Plex Mono, monospace">
                1 mV CAL
              </text>

              {/* Soft Pink Accent Shadow Trace */}
              <path
                d="M 80 105 L 125 105 Q 145 80 165 105 L 195 105 L 207 122 L 222 22 L 237 132 L 250 105 L 292 105 Q 322 65 352 105 L 415 105 Q 435 80 455 105 L 485 105 L 497 122 L 512 22 L 527 132 L 540 105 L 582 105 Q 612 65 642 105 L 705 105 Q 725 80 745 105 L 775 105 L 787 122 L 802 22 L 817 132 L 830 105 L 872 105"
                fill="none"
                stroke="#FD91CC"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.7"
              />

              {/* Primary Animated Deep Navy PQRST Waveform */}
              <path
                d="M 80 105 L 125 105 Q 145 80 165 105 L 195 105 L 207 122 L 222 22 L 237 132 L 250 105 L 292 105 Q 322 65 352 105 L 415 105 Q 435 80 455 105 L 485 105 L 497 122 L 512 22 L 527 132 L 540 105 L 582 105 Q 612 65 642 105 L 705 105 Q 725 80 745 105 L 775 105 L 787 122 L 802 22 L 817 132 L 830 105 L 872 105"
                fill="none"
                stroke="#09318D"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1200"
                strokeDashoffset="0"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="1200"
                  to="0"
                  dur="3.6s"
                  repeatCount="indefinite"
                />
              </path>

              {/* Waveform Landmark Annotations on First Complex */}
              <circle cx="145" cy="92" r="4.5" fill="#FD91CC" stroke="#09318D" strokeWidth="1.8" />
              <text x="140" y="78" fill="#09318D" fontSize="11" fontWeight="700" fontFamily="IBM Plex Mono, monospace">P</text>
              <text x="196" y="142" fill="#09318D" fontSize="11" fontWeight="700" fontFamily="IBM Plex Mono, monospace">Q</text>
              <circle cx="222" cy="22" r="5" fill="#FD91CC" stroke="#09318D" strokeWidth="2" />
              <text x="232" y="26" fill="#09318D" fontSize="12" fontWeight="700" fontFamily="IBM Plex Mono, monospace">R (1.35 mV)</text>
              <text x="240" y="144" fill="#09318D" fontSize="11" fontWeight="700" fontFamily="IBM Plex Mono, monospace">S</text>
              <text x="262" y="96" fill="#09318D" fontSize="10" fontWeight="700" fontFamily="IBM Plex Mono, monospace">ST</text>
              <circle cx="322" cy="84" r="4.5" fill="#FD91CC" stroke="#09318D" strokeWidth="1.8" />
              <text x="318" y="70" fill="#09318D" fontSize="11" fontWeight="700" fontFamily="IBM Plex Mono, monospace">T</text>
            </svg>
          </div>

          {/* Assignment Overview Summary Strip */}
          <div className="mt-4 pt-3 border-t border-[#09318D]/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#09318D]/85">
            <div>
              <strong className="text-[#09318D]">1. Biophysical Dipole Engine:</strong> Decoupled{' '}
              <code className="font-mono">class ECGSimulationEngine</code> modeling McSharry 3D Gaussian PQRST waves, Einthoven Leads I/II/III, and Huhta-Webster 50 Hz coupling.
            </div>
            <div>
              <strong className="text-[#09318D]">2. Commercial Hardware &amp; 18-Lead Anatomy:</strong> 9-stage Concept Wheel with exact Baxter EC12 &amp; WhaleTeq data plus 2D 10-electrode + <code className="font-mono">synECi18</code> torso map and OEM spec comparison.
            </div>
            <div>
              <strong className="text-[#09318D]">3. Clinical Verification &amp; 16 IEEE Sources:</strong> Authentic Left-to-Right hospital sweep monitor (<code className="font-mono">#06101E</code>), 12 controls with <code className="font-mono">?</code> tooltips, textbook equations, and 16 IEEE references.
            </div>
          </div>
        </div>

        {/* Primary CTA Action Row */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center gap-3 px-7 py-3.5 rounded-xl bg-[#09318D] text-white font-bold text-sm md:text-base hover:bg-[#09318D]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD91CC] transition-all cursor-pointer shadow-sm whitespace-nowrap shrink-0"
          >
            <span>Let&apos;s Get Started</span>
            <span className="w-7 h-7 rounded-lg bg-[#FD91CC] text-[#09318D] flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => onJumpToScreen(4)}
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-[#09318D]/25 bg-white text-[#09318D] font-semibold text-sm hover:border-[#FD91CC] hover:bg-[#FD91CC]/15 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Jump to Live ECG Simulator (Screen 4)</span>
          </button>
        </div>

        {/* Concise 5-Stage Learning Path Strip */}
        <div className="mt-7 pt-5 border-t border-[#09318D]/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <button
            type="button"
            onClick={() => onJumpToScreen(2)}
            className="text-left group p-3.5 rounded-xl border border-[#09318D]/15 hover:border-[#FD91CC] transition-colors cursor-pointer bg-white"
          >
            <div className="flex items-center justify-between text-xs font-mono text-[#09318D]/65">
              <span>SCREEN 02</span>
              <Compass className="w-4 h-4 text-[#09318D]" />
            </div>
            <h2 className="text-sm font-bold text-[#09318D] mt-2 group-hover:underline">
              9-Card Concept Wheel
            </h2>
            <p className="text-xs text-[#09318D]/75 mt-1 leading-relaxed">
              Baxter EC12, OEM manuals, WhaleTeq tests, keypad &amp; analogies.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onJumpToScreen(3)}
            className="text-left group p-3.5 rounded-xl border border-[#09318D]/15 hover:border-[#FD91CC] transition-colors cursor-pointer bg-white"
          >
            <div className="flex items-center justify-between text-xs font-mono text-[#09318D]/65">
              <span>SCREEN 03</span>
              <Cpu className="w-4 h-4 text-[#09318D]" />
            </div>
            <h2 className="text-sm font-bold text-[#09318D] mt-2 group-hover:underline">
              2D Torso &amp; OEM Specs
            </h2>
            <p className="text-xs text-[#09318D]/75 mt-1 leading-relaxed">
              12-Lead + synECi18 map &amp; 4-brand commercial spec table.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onJumpToScreen(4)}
            className="text-left group p-3.5 rounded-xl border border-[#09318D]/15 hover:border-[#FD91CC] transition-colors cursor-pointer bg-white"
          >
            <div className="flex items-center justify-between text-xs font-mono text-[#09318D]/65">
              <span>SCREEN 04</span>
              <Activity className="w-4 h-4 text-[#09318D]" />
            </div>
            <h2 className="text-sm font-bold text-[#09318D] mt-2 group-hover:underline">
              Live ECG Simulator Lab
            </h2>
            <p className="text-xs text-[#09318D]/75 mt-1 leading-relaxed">
              Left-to-right sweep, 12 controls, de-block switch &amp; 3 tests.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onJumpToScreen(5)}
            className="text-left group p-3.5 rounded-xl border border-[#09318D]/15 hover:border-[#FD91CC] transition-colors cursor-pointer bg-white"
          >
            <div className="flex items-center justify-between text-xs font-mono text-[#09318D]/65">
              <span>SCREEN 05</span>
              <BookOpen className="w-4 h-4 text-[#09318D]" />
            </div>
            <h2 className="text-sm font-bold text-[#09318D] mt-2 group-hover:underline">
              Math Model &amp; Equations
            </h2>
            <p className="text-xs text-[#09318D]/75 mt-1 leading-relaxed">
              HTML/CSS textbook equations, assumptions &amp; IEC failure analysis.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onJumpToScreen(6)}
            className="text-left group p-3.5 rounded-xl border border-[#09318D]/15 hover:border-[#FD91CC] transition-colors cursor-pointer bg-white"
          >
            <div className="flex items-center justify-between text-xs font-mono text-[#09318D]/65">
              <span>SCREEN 06</span>
              <BookOpen className="w-4 h-4 text-[#09318D]" />
            </div>
            <h2 className="text-sm font-bold text-[#09318D] mt-2 group-hover:underline">
              16 IEEE References
            </h2>
            <p className="text-xs text-[#09318D]/75 mt-1 leading-relaxed">
              Dedicated international reference library in IEEE standard format.
            </p>
          </button>
        </div>
      </div>
    </section>
  );
};
