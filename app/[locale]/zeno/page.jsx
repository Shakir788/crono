'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';
import { BrainCircuit, ArrowLeft, Loader2, Zap, Sun, Moon, Send, User } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function ZenoPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { locale } = useParams();
  const messagesEndRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Salut mon pote ! 😎 Je suis Zeno. Prêt à faire exploser tes vues aujourd'hui ? Dis-moi ce que tu prépares comme vidéo ou pose-moi une question !" 
    }
  ]);

  useEffect(() => {
    setMounted(true);
    fetchProfile();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new message arrives
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push(`/${locale}/login`); return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) setProfile(data);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          country: profile?.target_country === 'MA' ? 'Maroc' : profile?.target_country,
          category: profile?.content_category,
          platform: profile?.platform,
          audience_age: profile?.audience_age,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Oups, petit bug réseau.");

      setMessages([...newMessages, { role: 'assistant', content: data.text }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: `❌ Erreur: ${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)', color: 'var(--text)' }}>
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--muted)' }}>
            <ArrowLeft size={16} />
            Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
              <BrainCircuit size={14} color="white" />
            </div>
            <span className="font-bold">Zeno AI</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#8b5cf6' }}>
              <Zap size={10} />
              CHAT
            </div>
          </div>

          {mounted && (
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg" style={{ background: 'var(--surface)' }}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
        </div>
      </nav>

      {/* Chat History Area */}
      <main className="flex-1 overflow-y-auto pt-24 pb-32 px-4 md:px-0">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              
              {/* Avatar Section */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 overflow-hidden" 
                   style={{ background: 'var(--surface)', border: msg.role === 'user' ? '1px solid var(--border)' : '1px solid rgba(139,92,246,0.3)' }}>
                {msg.role === 'assistant' ? (
                  <img 
                    src="/zeno_avtar.png" 
                    alt="Zeno AI" 
                    className="w-full h-full object-cover p-0.5"
                  />
                ) : (
                  profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="User" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={16} style={{ color: 'var(--muted)' }} />
                  )
                )}
              </div>

              {/* Message Bubble */}
              <div className={`px-5 py-3.5 rounded-2xl max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                   style={msg.role === 'user' 
                     ? { background: 'var(--text)', color: 'var(--background)' } 
                     : { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mt-1 overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid rgba(139,92,246,0.3)' }}>
                <img 
                  src="/zeno_avtar.png" 
                  alt="Zeno AI" 
                  className="w-full h-full object-cover p-0.5"
                />
              </div>
              <div className="px-5 py-3.5 rounded-2xl rounded-tl-sm flex items-center gap-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <Loader2 size={16} className="animate-spin text-purple-500" />
                <span className="text-sm" style={{ color: 'var(--muted)' }}>Zeno réfléchit...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area (Fixed at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto relative flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Parle avec Zeno..."
            rows={1}
            className="w-full rounded-2xl py-4 pl-5 pr-14 text-sm outline-none resize-none shadow-sm"
            style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="absolute right-2 p-2.5 rounded-xl text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-center text-[10px] mt-2" style={{ color: 'var(--muted)' }}>
          Zeno peut faire des erreurs. Vérifiez toujours les légendes avant de poster.
        </p>
      </div>

    </div>
  );
}