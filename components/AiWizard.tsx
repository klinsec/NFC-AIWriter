import React, { useState } from 'react';
import { Button } from './Button';
import { generateNfcContent } from '../services/geminiService';
import { writeNfcTag } from '../services/nfcService';

export const AiWizard: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: string; content: string; explanation: string } | null>(null);
  const [writeStatus, setWriteStatus] = useState<'idle' | 'writing' | 'success' | 'error'>('idle');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    setWriteStatus('idle');

    try {
      const data = await generateNfcContent(prompt);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert('Error generando contenido con AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleWrite = async () => {
    if (!result) return;
    setWriteStatus('writing');
    try {
      await writeNfcTag(result.content);
      setWriteStatus('success');
      setTimeout(() => setWriteStatus('idle'), 3000);
    } catch (error) {
        console.error(error);
      setWriteStatus('error');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-gradient-to-b from-indigo-900/40 to-slate-900/40 backdrop-blur-xl border border-indigo-500/20 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center mr-3 shadow-lg shadow-purple-500/30">
            <span className="text-xl">✨</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Gemini NFC Wizard</h2>
            <p className="text-xs text-indigo-300">Describe qué quieres que haga tu etiqueta</p>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: 'Crea una etiqueta que conecte al WiFi Casa con clave 1234' o 'Enviar un email a soporte@test.com'"
            rows={3}
            className="w-full bg-slate-950/50 border border-slate-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
          
          <Button 
            onClick={handleGenerate} 
            isLoading={loading} 
            disabled={!prompt}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 border-none"
          >
            {loading ? 'Pensando...' : 'Generar Etiqueta Mágica'}
          </Button>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-slate-950/80 rounded-xl border border-slate-700 animate-fade-in">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Resultado ({result.type})</span>
            </div>
            
            <p className="text-sm text-indigo-200 mb-3 italic">"{result.explanation}"</p>
            
            <div className="bg-slate-900 p-3 rounded-lg font-mono text-xs text-slate-300 break-all border border-slate-800 mb-4">
              {result.content}
            </div>

            {writeStatus === 'idle' && (
              <Button onClick={handleWrite} className="w-full" variant="secondary">
                Escribir Resultado
              </Button>
            )}
             {writeStatus === 'writing' && (
              <p className="text-center text-indigo-400 animate-pulse">Acerca la etiqueta...</p>
            )}
             {writeStatus === 'success' && (
              <p className="text-center text-emerald-400 font-bold">¡Escrito con éxito!</p>
            )}
             {writeStatus === 'error' && (
              <p className="text-center text-rose-400">Error escribiendo. Reintenta.</p>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-6 grid grid-cols-2 gap-3">
        {['WiFi Guest Config', 'Abrir Mapa en NY', 'Llamar a Mamá', 'Tarjeta de contacto'].map(suggestion => (
            <button 
                key={suggestion}
                onClick={() => setPrompt(suggestion)}
                className="text-xs p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
                "{suggestion}"
            </button>
        ))}
      </div>
    </div>
  );
};