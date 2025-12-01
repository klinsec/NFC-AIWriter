import React, { useState } from 'react';
import { WriteType, SocialPlatform, WifiConfig } from '../types';
import { writeNfcTag } from '../services/nfcService';
import { Button } from './Button';

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { id: 'instagram', name: 'Instagram', icon: '📸', urlPrefix: 'https://instagram.com/', deepLinkPrefix: 'instagram://user?username=', color: 'from-pink-500 to-purple-600' },
  { id: 'twitter', name: 'X / Twitter', icon: '✖️', urlPrefix: 'https://x.com/', deepLinkPrefix: 'twitter://user?screen_name=', color: 'from-gray-700 to-gray-900' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', urlPrefix: 'https://linkedin.com/in/', deepLinkPrefix: 'linkedin://profile/', color: 'from-blue-600 to-blue-800' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', urlPrefix: 'https://youtube.com/@', deepLinkPrefix: 'vnd.youtube://user/', color: 'from-red-500 to-red-700' },
];

export const WriteView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<WriteType>(WriteType.SOCIAL);
  const [status, setStatus] = useState<'idle' | 'writing' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [isContextError, setIsContextError] = useState(false);

  // Form States
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [socialUser, setSocialUser] = useState('');
  const [selectedSocial, setSelectedSocial] = useState<SocialPlatform>(SOCIAL_PLATFORMS[0]);
  const [useDeepLink, setUseDeepLink] = useState(false);
  const [wifi, setWifi] = useState<WifiConfig>({ ssid: '', password: '', authType: 'WPA' });

  const handleWrite = async () => {
    setStatus('writing');
    setStatusMsg('Acerca tu etiqueta NFC al dispositivo...');
    setIsContextError(false);
    
    try {
      let content = '';

      switch (activeTab) {
        case WriteType.URL:
          content = url;
          break;
        case WriteType.TEXT:
          content = text;
          break;
        case WriteType.SOCIAL:
          // Advanced: Try Deep Link first if selected, otherwise standard Web URL
          content = useDeepLink 
            ? `${selectedSocial.deepLinkPrefix}${socialUser}`
            : `${selectedSocial.urlPrefix}${socialUser}`;
          break;
        case WriteType.WIFI:
          // WIFI:T:WPA;S:mynetwork;P:mypass;;
          content = `WIFI:T:${wifi.authType};S:${wifi.ssid};P:${wifi.password};;`;
          break;
      }

      await writeNfcTag(content);
      setStatus('success');
      setStatusMsg('¡Etiqueta escrita correctamente!');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      setStatus('error');
      if (err.message === 'CONTEXT_ERROR') {
        setStatusMsg('Error de Seguridad: La vista previa bloquea el NFC.');
        setIsContextError(true);
      } else {
        setStatusMsg(String(err.message || err));
      }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Tabs */}
      <div className="flex p-1 bg-slate-800/50 rounded-xl overflow-x-auto no-scrollbar">
        {Object.values(WriteType).filter(t => t !== WriteType.JSON).map((type) => (
          <button
            key={type}
            onClick={() => { setActiveTab(type); setStatus('idle'); setIsContextError(false); }}
            className={`flex-1 min-w-[80px] py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              activeTab === type 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl shadow-xl">
        {/* URL Mode */}
        {activeTab === WriteType.URL && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-300">Enlace Web (HTTPS)</label>
            <input 
              type="url" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ejemplo.com"
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>
        )}

        {/* Text Mode */}
        {activeTab === WriteType.TEXT && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-300">Texto Plano</label>
            <textarea 
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe algo aquí..."
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>
        )}

        {/* Social Mode */}
        {activeTab === WriteType.SOCIAL && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-2">
              {SOCIAL_PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedSocial(platform)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    selectedSocial.id === platform.id
                      ? `bg-gradient-to-br ${platform.color} border-transparent text-white shadow-lg`
                      : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <span className="text-2xl mb-1">{platform.icon}</span>
                  <span className="text-[10px] uppercase font-bold">{platform.name}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Nombre de Usuario</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-slate-500 text-sm pointer-events-none">
                  @
                </span>
                <input 
                  type="text" 
                  value={socialUser}
                  onChange={(e) => setSocialUser(e.target.value)}
                  placeholder="usuario"
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl pl-8 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-slate-900/30 rounded-lg border border-slate-700/50">
              <input 
                type="checkbox"
                id="deepLink"
                checked={useDeepLink}
                onChange={(e) => setUseDeepLink(e.target.checked)}
                className="w-5 h-5 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
              />
              <div className="flex-1">
                <label htmlFor="deepLink" className="text-sm font-medium text-slate-200 cursor-pointer">
                  Forzar apertura en App (Deep Link)
                </label>
                <p className="text-xs text-slate-500">
                  Si se activa, intentará abrir la app directamente. Si no tienes la app, podría fallar.
                </p>
              </div>
            </div>
            
            <div className="text-xs text-center text-slate-500 font-mono bg-slate-950/50 p-2 rounded">
              Preview: {useDeepLink 
                ? `${selectedSocial.deepLinkPrefix}${socialUser || 'usuario'}`
                : `${selectedSocial.urlPrefix}${socialUser || 'usuario'}`
              }
            </div>
          </div>
        )}

        {/* WiFi Mode */}
        {activeTab === WriteType.WIFI && (
          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nombre de Red (SSID)</label>
                <input 
                  type="text" 
                  value={wifi.ssid}
                  onChange={(e) => setWifi({...wifi, ssid: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña</label>
                <input 
                  type="text" 
                  value={wifi.password}
                  onChange={(e) => setWifi({...wifi, password: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Seguridad</label>
                <select
                   value={wifi.authType}
                   onChange={(e) => setWifi({...wifi, authType: e.target.value as any})}
                   className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-200"
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="NONE">Abierta</option>
                </select>
             </div>
          </div>
        )}

        {/* Action Button & Status */}
        <div className="mt-8">
            {status === 'idle' && (
               <Button onClick={handleWrite} className="w-full">
                 Escribir en Etiqueta
               </Button>
            )}
            
            {status === 'writing' && (
              <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 rounded-xl border border-indigo-500/30 animate-pulse">
                <div className="text-4xl mb-4">📡</div>
                <p className="text-indigo-300 font-medium text-center">{statusMsg}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center justify-center p-6 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-emerald-300 font-medium">{statusMsg}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center justify-center p-6 bg-rose-500/10 rounded-xl border border-rose-500/30">
                <div className="text-4xl mb-2">❌</div>
                <p className="text-rose-300 font-medium text-center">{statusMsg}</p>
                
                {isContextError && (
                    <button 
                        onClick={() => window.open(window.location.href, '_blank')}
                        className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold shadow-lg transition-all text-sm"
                    >
                        Abrir en Pestaña Nueva ↗️
                    </button>
                )}

                <Button variant="secondary" onClick={() => setStatus('idle')} className="mt-4 btn-sm">
                  Intentar de nuevo
                </Button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};