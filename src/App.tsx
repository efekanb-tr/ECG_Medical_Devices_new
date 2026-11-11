/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { NavigationDrawer, ScreenId } from './components/NavigationDrawer';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RotaryKnowledgeWheel } from './components/RotaryKnowledgeWheel';
import { ThreeDeviceExplorer } from './components/ThreeDeviceExplorer';
import { ECGSimulatorScreen } from './components/ECGSimulatorScreen';
import { ScientificModelScreen } from './components/ScientificModelScreen';
import { ReferenceLibraryScreen } from './components/ReferenceLibraryScreen';
import { ECGUIController } from './engine/ECGUIController';

function getInitialScreen(): ScreenId {
  if (typeof window === 'undefined') return 1;
  const params = new URLSearchParams(window.location.search);
  const screenParam = Number(params.get('screen'));
  if (screenParam >= 1 && screenParam <= 6) {
    return screenParam as ScreenId;
  }
  if (params.get('autostart') === '1') {
    return 4;
  }
  return 1;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(getInitialScreen);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const controllerRef = useRef<ECGUIController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = new ECGUIController();
  }

  useEffect(() => {
    document.body.setAttribute('data-screen', String(currentScreen));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentScreen]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#09318D]">
      <NavigationDrawer
        currentScreen={currentScreen}
        onSelectScreen={(s) => setCurrentScreen(s)}
        isOpen={drawerOpen}
        onToggleOpen={(open) => setDrawerOpen(open)}
      />

      <main className="flex-1">
        {currentScreen === 1 && (
          <WelcomeScreen
            onStart={() => setCurrentScreen(2)}
            onJumpToScreen={(s) => setCurrentScreen(s)}
          />
        )}

        {currentScreen === 2 && (
          <RotaryKnowledgeWheel onProceedTo3D={() => setCurrentScreen(3)} />
        )}

        {currentScreen === 3 && (
          <ThreeDeviceExplorer
            onCompleteZoomToSimulator={() => setCurrentScreen(4)}
          />
        )}

        {currentScreen === 4 && (
          <ECGSimulatorScreen
            controller={controllerRef.current}
            onNavigateToVerification={() => setCurrentScreen(5)}
          />
        )}

        {currentScreen === 5 && (
          <ScientificModelScreen
            onBackToSimulator={() => setCurrentScreen(4)}
            onOpenReferenceLibrary={() => setCurrentScreen(6)}
          />
        )}

        {currentScreen === 6 && (
          <ReferenceLibraryScreen
            onBackToEquations={() => setCurrentScreen(5)}
            onBackToSimulator={() => setCurrentScreen(4)}
          />
        )}
      </main>
    </div>
  );
}
