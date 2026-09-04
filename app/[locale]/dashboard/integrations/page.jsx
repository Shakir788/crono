'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Link as LinkIcon, CheckCircle2, AlertCircle, BrainCircuit, 
  RefreshCw, Activity, ArrowRight, ShieldCheck 
} from 'lucide-react';

export default function IntegrationsPage() {
  const { locale } = useParams();

  // Fake states UI dikhane ke liye (Baad mein ye database se aayenge)
  const [instaStatus, setInstaStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected'
  const [tiktokStatus, setTiktokStatus] = useState('disconnected');

  const handleConnectInsta = () => {
    setInstaStatus('connecting');
    // Fake delay to simulate OAuth redirect
    setTimeout(() => setInstaStatus('connected'), 2000);
  };

  const handleConnectTikTok = () => {
    setTiktokStatus('connecting');
    setTimeout(() => setTiktokStatus('connected'), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6" style={{ background: 'var(--background)', color: 'var(--text)' }}>
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-semibold mb-4">
            <LinkIcon size={12} /> Connexions Sociales
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            Intégrations & Audit <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-500">IA</span>
          </h1>
          <p style={{ color: 'var(--muted)' }} className="text-lg">
            Connectez vos comptes pour permettre à Zeno d'analyser vos posts et de trouver vos points faibles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* INSTAGRAM CARD */}
          <div className="glass p-6 md:p-8 rounded-3xl border relative overflow-hidden group" style={{ borderColor: 'var(--border)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-orange-500/10 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </div>
              
              {instaStatus === 'connected' ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold">
                  <CheckCircle2 size={14} /> Connecté
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-500/10 border border-zinc-500/20 text-zinc-500 text-xs font-bold">
                  <AlertCircle size={14} /> Déconnecté
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold mb-2">Instagram (Meta)</h2>
            <p className="text-sm mb-6 h-10" style={{ color: 'var(--muted)' }}>
              Synchronisez vos Reels et posts pour une analyse de l'engagement et du watch-time.
            </p>

            {instaStatus === 'connected' ? (
              <button 
                onClick={() => setInstaStatus('disconnected')}
                className="w-full py-3 rounded-xl text-sm font-bold border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 transition-colors"
              >
                Déconnecter
              </button>
            ) : (
              <button 
                onClick={handleConnectInsta}
                disabled={instaStatus === 'connecting'}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
              >
                {instaStatus === 'connecting' ? <RefreshCw size={18} className="animate-spin" /> : <LinkIcon size={18} />}
                {instaStatus === 'connecting' ? 'Connexion...' : 'Connecter Instagram'}
              </button>
            )}
          </div>

          {/* TIKTOK CARD */}
          <div className="glass p-6 md:p-8 rounded-3xl border relative overflow-hidden group" style={{ borderColor: 'var(--border)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-black dark:bg-zinc-800 border border-zinc-700">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
              </div>
              
              {tiktokStatus === 'connected' ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold">
                  <CheckCircle2 size={14} /> Connecté
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-500/10 border border-zinc-500/20 text-zinc-500 text-xs font-bold">
                  <AlertCircle size={14} /> Déconnecté
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold mb-2">TikTok</h2>
            <p className="text-sm mb-6 h-10" style={{ color: 'var(--muted)' }}>
              Analysez la puissance de votre hook (3 premières secondes) et les partages.
            </p>

            {tiktokStatus === 'connected' ? (
              <button 
                onClick={() => setTiktokStatus('disconnected')}
                className="w-full py-3 rounded-xl text-sm font-bold border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 transition-colors"
              >
                Déconnecter
              </button>
            ) : (
              <button 
                onClick={handleConnectTikTok}
                disabled={tiktokStatus === 'connecting'}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-black dark:bg-zinc-800 border border-zinc-700 hover:bg-zinc-900 transition-all shadow-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                {tiktokStatus === 'connecting' ? <RefreshCw size={18} className="animate-spin" /> : <LinkIcon size={18} />}
                {tiktokStatus === 'connecting' ? 'Connexion...' : 'Connecter TikTok'}
              </button>
            )}
          </div>
        </div>

        {/* ZENO AUDIT ENGINE BANNER */}
        <div className="mt-8 rounded-3xl p-8 border relative overflow-hidden bg-gradient-to-br from-indigo-50/50 to-white dark:from-[#0a0a0a] dark:to-[#111]" style={{ borderColor: 'var(--border)' }}>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="flex-none w-20 h-20 rounded-3xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 shadow-xl shadow-purple-500/30">
              <BrainCircuit size={40} color="white" />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Audit Automatique par Zeno</h3>
              <p style={{ color: 'var(--muted)' }} className="text-sm mb-4">
                Une fois vos comptes connectés, Zeno scannera vos vidéos chaque jour pour trouver des pistes d'amélioration.
              </p>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-medium">
                <li className="flex items-center gap-2"><Activity size={16} className="text-indigo-500" /> Analyse du Hook (3s)</li>
                <li className="flex items-center gap-2"><Activity size={16} className="text-purple-500" /> Score de Rétention</li>
                <li className="flex items-center gap-2"><Activity size={16} className="text-pink-500" /> Efficacité des Hashtags</li>
                <li className="flex items-center gap-2"><Activity size={16} className="text-blue-500" /> Détection de Tendances</li>
              </ul>
            </div>

            <div className="flex-none w-full md:w-auto">
              <button 
                disabled={instaStatus !== 'connected' && tiktokStatus !== 'connected'}
                className="w-full px-6 py-4 rounded-2xl text-sm font-bold text-white transition-all bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-105 shadow-xl shadow-purple-500/25 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                Lancer un Audit <ArrowRight size={18} />
              </button>
              {(instaStatus !== 'connected' && tiktokStatus !== 'connected') && (
                <p className="text-[10px] text-center mt-2 flex items-center justify-center gap-1" style={{ color: 'var(--muted)' }}>
                  <ShieldCheck size={12} /> Connectez un compte d'abord
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}