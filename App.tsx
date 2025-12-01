import React, { useState, useEffect } from 'react';
import { checkNfcSupport } from './services/nfcService';
import { WriteView } from './components/WriteView';
import { ReadView } from './components/ReadView';
import { AiWizard } from './components/AiWizard';
import { AppMode } from './types';

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.WRITE);
  const [supported, setSupported] = useState<boolean>(true);
  const [isIframe, setIsIframe] = useState<boolean>(false);

  useEffect(() => {
    setSupported(checkNfcSupport());
    // Check if running in iframe
    try {
      if (window.self !== window.top) {
        setIsIframe(true);
      }
    } catch (e) {
      setIsIframe(true);
    }
  }, []);

  if (!supported) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-bold text-slate-200">NFC no soportado 😔</h1>
          <p className="text-slate-400">
            Tu navegador actual no soporta Web NFC.
            <br /><br />
            Por favor, utiliza <strong>Google Chrome en Android</strong> y asegúrate de tener el NFC activado en los ajustes de tu sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 flex flex-col bg-slate-900 text-white">
      {/* Iframe Warning Banner - Sticky */}
      {isIframe && (
        <div className="sticky top-0 z-50 bg-amber-600 border-b border-amber-500 px-4 py-3 text-center shadow-lg">
          <p className="text-white text-xs sm:text-sm font-medium flex flex-col sm:flex-row items-center justify-center gap-2">
            <span>⚠️ La vista previa bloquea el acceso al chip NFC.</span>
            <button 
              onClick={() => window.open(window.location.href, '_blank')}
              className="px-3 py-1 bg-white text-amber-700 rounded-full font-bold text-xs hover:bg-amber-50 transition-colors"
            >
              Abrir en Nueva Pestaña ↗️
            </button>
          </p>
        </div>
      )}

      {/* Header */}
      <header className="px-6 pt-8 pb-6 flex justify-between items-center max-w-2xl mx-auto w-full">
        <div>
           <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            NFC Master
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">ADVANCED TAG WRITER</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
           <span className="text-xs">⚡</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 max-w-2xl mx-auto w-full overflow-y-auto">
        {mode === AppMode.WRITE && <WriteView />}
        {mode === AppMode.READ && <ReadView />}
        {mode === AppMode.AI_WIZARD && <AiWizard />}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 py-4 px-6 z-50 safe-area-bottom">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <NavButton 
            active={mode === AppMode.READ} 
            onClick={() => setMode(AppMode.READ)} 
            icon="📡" 
            label="Leer" 
          />
          <NavButton 
            active={mode === AppMode.WRITE} 
            onClick={() => setMode(AppMode.WRITE)} 
            icon="✏️" 
            label="Escribir" 
          />
          <NavButton 
            active={mode === AppMode.AI_WIZARD} 
            onClick={() => setMode(AppMode.AI_WIZARD)} 
            icon="✨" 
            label="AI Magic" 
          />
        </div>
      </nav>
    </div>
  );
}

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center space-y-1 transition-all duration-300 ${active ? 'text-indigo-400 -translate-y-2' : 'text-slate-500 hover:text-slate-300'}`}
  >
    <div className={`p-2 rounded-xl transition-all ${active ? 'bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : ''}`}>
      <span className="text-2xl">{icon}</span>
    </div>
    <span className="text-[10px] font-medium tracking-wide">{label}</span>
  </button>
);