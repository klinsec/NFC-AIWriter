import React, { useState, useEffect, useRef } from 'react';
import { scanNfcTag } from '../services/nfcService';
import { Button } from './Button';

export const ReadView: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [log, setLog] = useState<{msg: string, serial: string}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isContextError, setIsContextError] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startScan = async () => {
    setError(null);
    setIsContextError(false);
    setIsScanning(true);
    setLog([]);
    
    abortControllerRef.current = new AbortController();

    await scanNfcTag(
      (msg, serial) => {
        setLog(prev => [{msg, serial}, ...prev]);
        // Optional vibration for feedback
        if (navigator.vibrate) navigator.vibrate(200);
      },
      (err) => {
        if (err === 'CONTEXT_ERROR') {
            setError('La vista previa bloquea el NFC. Abre una pestaña nueva.');
            setIsContextError(true);
        } else {
            setError(err);
        }
        setIsScanning(false);
      },
      abortControllerRef.current.signal
    );
  };

  const stopScan = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => stopScan();
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ${isScanning ? 'bg-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.3)]' : 'bg-slate-800'}`}>
          <span className={`text-5xl transition-transform duration-700 ${isScanning ? 'animate-pulse scale-110' : ''}`}>
            📶
          </span>
        </div>
        <h2 className="text-xl font-semibold">
          {isScanning ? 'Escaneando...' : 'Listo para leer'}
        </h2>
        <p className="text-slate-400 text-sm">
          {isScanning ? 'Acerca una etiqueta a la parte trasera de tu móvil' : 'Pulsa el botón para activar el lector'}
        </p>
      </div>

      <div className="flex justify-center">
        {!isScanning ? (
          <Button onClick={startScan}>Iniciar Escaneo</Button>
        ) : (
          <Button onClick={stopScan} variant="danger">Detener</Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-900/20 border border-rose-500/30 rounded-xl text-rose-300 text-center text-sm flex flex-col items-center">
          <p>{error}</p>
          {isContextError && (
              <button 
                onClick={() => window.open(window.location.href, '_blank')}
                className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-lg font-bold shadow text-xs"
              >
                Abrir Pestaña Nueva ↗️
              </button>
          )}
        </div>
      )}

      {log.length > 0 && (
        <div className="space-y-3 mt-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Historial de Lectura</h3>
          {log.map((entry, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 p-4 rounded-xl animate-fade-in shadow-lg">
              <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-2">
                 <span className="text-xs font-mono text-slate-500">ID: {entry.serial}</span>
                 <span className="text-xs text-emerald-400">Leído hace un momento</span>
              </div>
              <pre className="text-sm text-slate-200 font-mono whitespace-pre-wrap break-all">
                {entry.msg}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};