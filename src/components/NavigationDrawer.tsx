import React from 'react';
import { Menu, X, Activity, Disc, Cpu, Sliders, BookOpen, Library, ChevronRight } from 'lucide-react';

export type ScreenId = 1 | 2 | 3 | 4 | 5 | 6;

export interface ScreenNavItem {
  id: ScreenId;
  shortLabel: string;
  fullTitle: string;
  subtitle: string;
}

export const SCREEN_NAV_ITEMS: ScreenNavItem[] = [
  {
    id: 1,
    shortLabel: '1. Welcome',
    fullTitle: 'Welcome Hero',
    subtitle: 'Minimalist clinical header, animated SVG ECG pulse & assignment overview',
  },
  {
    id: 2,
    shortLabel: '2. Concept Wheel',
    fullTitle: 'Interactive Concept Wheel',
    subtitle: '9 detailed rotating cards with exact literature data, keypad & analogies',
  },
  {
    id: 3,
    shortLabel: '3. 2D Hardware & Specs',
    fullTitle: '2D Clinical Hardware, Commercial Specs & 12-Lead Electrode Placement Explorer',
    subtitle: 'Interactive 10-electrode + synECi18 torso map & 4-brand commercial spec table',
  },
  {
    id: 4,
    shortLabel: '4. Live ECG Simulator',
    fullTitle: 'Live Left-to-Right ECG Simulator & IEC 60601-2-25 Verification Lab',
    subtitle: 'Phosphor sweep monitor, 12 controls with ? tooltips, de-block switch & 3 test presets',
  },
  {
    id: 5,
    shortLabel: '5. Math & Equations',
    fullTitle: 'Mathematical Model, Textbook Equations & Simplifying Assumptions',
    subtitle: 'HTML/CSS textbook equations, simplifying assumptions & WhaleTeq/IEC failure modes',
  },
  {
    id: 6,
    shortLabel: '6. IEEE References (16)',
    fullTitle: 'Dedicated International Reference Library (IEEE Standard Format - All 16 Sources)',
    subtitle: 'Complete IEEE bibliography: academic journals, ANSI/AAMI EC12, OEM manuals & IEC 60601',
  },
];

interface NavigationDrawerProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  isOpen: boolean;
  onToggleOpen: (open: boolean) => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  currentScreen,
  onSelectScreen,
  isOpen,
  onToggleOpen,
}) => {
  const getIcon = (id: ScreenId) => {
    switch (id) {
      case 1:
        return <Activity className="w-4 h-4 shrink-0" />;
      case 2:
        return <Disc className="w-4 h-4 shrink-0" />;
      case 3:
        return <Cpu className="w-4 h-4 shrink-0" />;
      case 4:
        return <Sliders className="w-4 h-4 shrink-0" />;
      case 5:
        return <BookOpen className="w-4 h-4 shrink-0" />;
      case 6:
        return <Library className="w-4 h-4 shrink-0" />;
    }
  };

  return (
    <>
      {/* Clean 3-Zone Top Bar with Global 3-Line Hamburger Menu Button (☰) */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-6 px-6 py-3.5 bg-white border-b border-[#09318D]/15">
        {/* Zone 1: Top-left 3-Line Hamburger Menu Button (☰) + Single-line Brand Title */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onToggleOpen(!isOpen)}
            aria-label="Open Navigation Menu"
            aria-expanded={isOpen}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#09318D] text-white hover:bg-[#09318D]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD91CC] transition-colors cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => onSelectScreen(1)}
            className="text-base md:text-lg font-bold tracking-tight text-[#09318D] whitespace-nowrap shrink-0 cursor-pointer text-left"
          >
            Interactive ECG Medical Device Simulator
          </button>
        </div>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        <nav aria-label="Primary Screen Navigation" className="hidden xl:flex items-center gap-5 text-xs font-medium">
          {SCREEN_NAV_ITEMS.map((item) => {
            const active = currentScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectScreen(item.id)}
                className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
                  active
                    ? 'text-[#09318D] font-bold border-[#FD91CC]'
                    : 'text-[#09318D]/70 hover:text-[#09318D] border-transparent'
                }`}
              >
                {item.shortLabel}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action CTA */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => onSelectScreen(currentScreen === 4 ? 6 : 4)}
            className="px-4 py-2 text-xs md:text-sm font-semibold text-[#09318D] bg-[#FD91CC] rounded-lg hover:bg-[#FD91CC]/85 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {currentScreen === 4 ? '16 IEEE References' : 'Open Live Simulator'}
          </button>
        </div>
      </header>

      {/* Slide-Out Navigation Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => onToggleOpen(false)}
            className="fixed inset-0 bg-[#09318D]/40 transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <aside
            aria-label="Global Screen Navigation Drawer"
            className="relative z-10 w-full max-w-md bg-white text-[#09318D] h-full shadow-2xl border-r border-[#09318D]/15 flex flex-col justify-between p-6 overflow-y-auto"
          >
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-[#09318D]/15">
                <div>
                  <p className="text-xs font-mono text-[#09318D]/65">
                    Biomedical Engineering Education Workbench
                  </p>
                  <h2 className="text-lg font-bold text-[#09318D] mt-0.5">All 6 Application Screens</h2>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleOpen(false)}
                  aria-label="Close Navigation Menu"
                  className="w-9 h-9 rounded-lg border border-[#09318D]/20 flex items-center justify-center text-[#09318D] hover:bg-[#09318D] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-5 space-y-2.5">
                {SCREEN_NAV_ITEMS.map((item) => {
                  const isActive = currentScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectScreen(item.id);
                        onToggleOpen(false);
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                        isActive
                          ? 'bg-[#09318D] text-white border-[#09318D]'
                          : 'bg-white text-[#09318D] border-[#09318D]/15 hover:border-[#FD91CC] hover:bg-[#FD91CC]/10'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isActive ? 'bg-[#FD91CC] text-[#09318D]' : 'bg-[#09318D]/10 text-[#09318D]'
                        }`}
                      >
                        {getIcon(item.id)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs opacity-80">Screen {item.id}</span>
                          <ChevronRight className="w-4 h-4 shrink-0 opacity-75" />
                        </div>
                        <p className="font-bold text-sm mt-0.5">{item.fullTitle}</p>
                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            isActive ? 'text-white/85' : 'text-[#09318D]/70'
                          }`}
                        >
                          {item.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-5 border-t border-[#09318D]/15 mt-6">
              <div className="p-3.5 rounded-xl bg-[#09318D]/5 border border-[#09318D]/10">
                <p className="text-xs font-semibold text-[#09318D]">
                  Architecture &amp; Standards Compliance
                </p>
                <p className="text-xs text-[#09318D]/75 mt-1 leading-relaxed">
                  Decoupled <code className="font-mono">ECGSimulationEngine</code> &amp; <code className="font-mono">ECGUIController</code> · IEC 60601-2-25 Type CF · ANSI/AAMI EC12 · 16 IEEE Sources.
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
