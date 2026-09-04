'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import { Settings, User, Globe, Hash, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Initial state ekdum safe rakha hai
  const [profile, setProfile] = useState({
    full_name: '',
    target_country: 'MA',
    content_category: 'lifestyle',
    platform: 'instagram'
  });

  // Load User Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push(`/${locale}/login`);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, target_country, content_category, platform')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        // Agar DB se data aaye toh update karo
        if (data) setProfile(prev => ({ ...prev, ...data }));
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, locale]);

  // Save Updated Data
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          target_country: profile.target_country,
          content_category: profile.content_category,
          platform: profile.platform
        })
        .eq('id', session.user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6" style={{ background: 'var(--background)', color: 'var(--text)' }}>
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Settings className="text-indigo-500" /> Account Settings
          </h1>
          <p style={{ color: 'var(--muted)' }}>Manage your profile and target audience preferences.</p>
        </div>

        {/* Settings Form Card */}
        <div className="glass p-8 rounded-3xl border" style={{ borderColor: 'var(--border)' }}>
          
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-500/10 border border-green-500/20 text-green-500' 
                : 'bg-red-500/10 border border-red-500/20 text-red-500'
            }`}>
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                <User size={16} /> Full Name
              </label>
              <input 
                type="text" 
                value={profile?.full_name || ''} 
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-transparent border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Target Country */}
              <div>
                <label className="block text-sm font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                  <Globe size={16} /> Target Country
                </label>
                <select 
                  value={profile?.target_country || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, target_country: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-transparent border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  <option value="MA" className="bg-zinc-900">🇲🇦 Morocco</option>
                  <option value="FR" className="bg-zinc-900">🇫🇷 France</option>
                  <option value="AE" className="bg-zinc-900">🇦🇪 UAE</option>
                  <option value="US" className="bg-zinc-900">🇺🇸 United States</option>
                  <option value="IN" className="bg-zinc-900">🇮🇳 India</option>
                </select>
              </div>

              {/* Content Category */}
              <div>
                <label className="block text-sm font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                  <Hash size={16} /> Content Niche
                </label>
                <select 
                  value={profile?.content_category || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, content_category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-transparent border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  <option value="beauty" className="bg-zinc-900">💄 Beauty & Fashion</option>
                  <option value="tech" className="bg-zinc-900">💻 Tech & Gadgets</option>
                  <option value="comedy" className="bg-zinc-900">🎭 Comedy & Entertainment</option>
                  <option value="education" className="bg-zinc-900">📚 Education</option>
                  <option value="lifestyle" className="bg-zinc-900">✨ Lifestyle & Vlogs</option>
                </select>
              </div>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                Primary Platform
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['instagram', 'tiktok', 'youtube'].map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setProfile(prev => ({ ...prev, platform: plat }))}
                    className={`p-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                      profile?.platform === plat 
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' 
                        : 'border-gray-800 hover:border-gray-600 text-gray-400'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t mt-8" style={{ borderColor: 'var(--border)' }}>
              <button 
                type="submit" 
                disabled={saving}
                className="px-8 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}