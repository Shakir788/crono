'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';
import {
  Clock, Sun, Moon, BarChart3, Plus,
  Trash2, TrendingUp, Eye, Heart,
  MessageCircle, Share2, Bookmark, ArrowLeft, Loader2
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function AnalyticsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { locale } = useParams();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    posted_date: '',
    posted_time: '',
    views: '',
    likes: '',
    comments: '',
    shares: '',
    saves: '',
    watch_time: '',
  });

  useEffect(() => {
    setMounted(true);
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push(`/${locale}/login`); return; }

    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('posted_at', { ascending: false });

    setPosts(data || []);
    setLoading(false);
  };

  const calculateScore = (f) => {
    return (
      (parseFloat(f.watch_time) || 0) * 0.30 +
      (parseFloat(f.shares) || 0) * 0.25 +
      (parseFloat(f.views) || 0) * 0.20 +
      (parseFloat(f.likes) || 0) * 0.10 +
      (parseFloat(f.comments) || 0) * 0.10 +
      (parseFloat(f.saves) || 0) * 0.05
    );
  };

  const handleSubmit = async () => {
    if (!form.posted_date || !form.posted_time) {
      setError('Veuillez entrer la date et l\'heure de publication');
      return;
    }
    if (!form.views) {
      setError('Veuillez entrer au moins le nombre de vues');
      return;
    }

    setSaving(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('platform, content_category, target_country')
      .eq('id', user.id)
      .single();

    const posted_at = new Date(`${form.posted_date}T${form.posted_time}`).toISOString();
    const performance_score = calculateScore(form);

    const { error: insertError } = await supabase.from('posts').insert({
      user_id: user.id,
      platform: profile?.platform || 'instagram',
      content_category: profile?.content_category || 'other',
      target_country: profile?.target_country || 'MA',
      posted_at,
      views: parseInt(form.views) || 0,
      likes: parseInt(form.likes) || 0,
      comments: parseInt(form.comments) || 0,
      shares: parseInt(form.shares) || 0,
      saves: parseInt(form.saves) || 0,
      watch_time: parseFloat(form.watch_time) || 0,
      performance_score,
    });

    if (insertError) {
      setError('Erreur lors de l\'ajout. Réessayez.');
      setSaving(false);
      return;
    }

    setSuccess('Post ajouté avec succès !');
    setForm({ posted_date: '', posted_time: '', views: '', likes: '', comments: '', shares: '', saves: '', watch_time: '' });
    setShowForm(false);
    fetchPosts();
    setSaving(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDelete = async (id) => {
    await supabase.from('posts').delete().eq('id', id);
    fetchPosts();
  };

  const getScoreColorClass = (score) => {
    if (score >= 5000) return 'text-emerald-500';
    if (score >= 2000) return 'text-amber-500';
    return 'text-rose-500';
  };

  const InputField = ({ icon: Icon, label, placeholder, value, onChange, type = 'text', hint }) => (
    <div>
      <label className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
        {label}
      </label>
      {hint && <p className="text-[10px] mb-2 text-zinc-400">{hint}</p>}
      <div className="relative group">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:[color-scheme:dark]"
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center relative">
          <div className="absolute inset-0 bg-indigo-500 blur-[50px] opacity-20 rounded-full animate-pulse" />
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30 relative z-10">
            <Clock size={24} color="white" className="animate-spin-slow" />
          </div>
          <p className="text-sm text-zinc-400 font-medium tracking-wide">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500/30 font-sans transition-colors duration-300">
      
      {/* Sleek Glassmorphism Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-white/50 dark:bg-black/20 border-b border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-indigo-500 transition-colors group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 group-hover:bg-indigo-500/10">
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            Retour au Dashboard
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20">
                <Clock size={16} color="white" />
              </div>
              <span className="font-extrabold tracking-tight">Crono</span>
            </div>

            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-transparent dark:border-white/5"
              >
                {theme === 'dark' ? <Sun size={18} className="text-zinc-400 hover:text-white" /> : <Moon size={18} className="text-zinc-600 hover:text-black" />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-16 relative">
        
        {/* Background Ambient Glows */}
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 relative z-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Centre d'Analytics</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              {posts.length > 0 ? `${posts.length} vidéos analysées dans votre base` : 'Ajoutez vos posts pour entrainer l\'algorithme'}
            </p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 active:scale-95"
          >
            <Plus size={18} className={showForm ? 'rotate-45 transition-transform' : 'transition-transform'} />
            Nouveau post
          </button>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="animate-in fade-in slide-in-from-top-4 px-6 py-4 rounded-2xl text-sm font-semibold mb-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-3 relative z-10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {success}
          </div>
        )}

        {/* Add Post Form */}
        {showForm && (
          <div className="animate-in fade-in zoom-in-95 duration-300 rounded-3xl p-8 mb-10 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-xl relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <BarChart3 size={20} className="text-indigo-500" />
              </div>
              <h2 className="text-xl font-bold">Détails de la vidéo</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <InputField icon={Clock} label="Date de publication" type="date" value={form.posted_date} onChange={(v) => setForm({ ...form, posted_date: v })} />
              <InputField icon={Clock} label="Heure de publication" type="time" value={form.posted_time} onChange={(v) => setForm({ ...form, posted_time: v })} />
            </div>

            <div className="h-px w-full bg-black/5 dark:bg-white/10 my-8" />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              <InputField icon={Eye} label="Vues" placeholder="ex: 10000" type="number" value={form.views} onChange={(v) => setForm({ ...form, views: v })} />
              <InputField icon={Heart} label="Likes" placeholder="ex: 500" type="number" value={form.likes} onChange={(v) => setForm({ ...form, likes: v })} />
              <InputField icon={MessageCircle} label="Commentaires" placeholder="ex: 50" type="number" value={form.comments} onChange={(v) => setForm({ ...form, comments: v })} />
              <InputField icon={Share2} label="Partages" placeholder="ex: 100" type="number" value={form.shares} onChange={(v) => setForm({ ...form, shares: v })} />
              <InputField icon={Bookmark} label="Sauvegardes" placeholder="ex: 200" type="number" value={form.saves} onChange={(v) => setForm({ ...form, saves: v })} />
              <InputField icon={TrendingUp} label="Temps de visionnage" placeholder="ex: 8.5" type="number" value={form.watch_time} onChange={(v) => setForm({ ...form, watch_time: v })} hint="(Moyenne en secondes)" />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm font-medium mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row items-center gap-4">
              <button
                onClick={() => { setShowForm(false); setError(''); }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold transition-all bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-transparent dark:border-white/5"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white transition-all bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
                {saving ? 'Analyse en cours...' : 'Analyser ce post'}
              </button>
            </div>
          </div>
        )}

        {/* Posts History List */}
        <div className="relative z-10">
          {posts.length === 0 && !showForm ? (
            <div className="rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-lg border-dashed">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
                <BarChart3 size={28} className="text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Historique vide</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
                Commencez à ajouter vos vidéos publiées pour que Crono puisse prédire vos meilleurs moments.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 rounded-xl text-sm font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                Ajouter mon premier post
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="group rounded-3xl p-6 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-md hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                        <Clock size={20} className="text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-lg font-bold">
                          {new Date(post.posted_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-sm font-medium text-zinc-500">
                          Publié à {new Date(post.posted_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Score Crono</p>
                        <p className={`text-2xl font-black ${getScoreColorClass(post.performance_score)}`}>
                          {Math.round(post.performance_score || 0).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-rose-500/5 hover:bg-rose-500 border border-transparent hover:border-rose-500 group/btn"
                        title="Supprimer ce post"
                      >
                        <Trash2 size={16} className="text-rose-500 group-hover/btn:text-white transition-colors" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {[
                      { icon: Eye, label: 'Vues', value: post.views },
                      { icon: Heart, label: 'Likes', value: post.likes },
                      { icon: MessageCircle, label: 'Comms', value: post.comments },
                      { icon: Share2, label: 'Partages', value: post.shares },
                      { icon: Bookmark, label: 'Saves', value: post.saves },
                      { icon: TrendingUp, label: 'Temps', value: `${post.watch_time || 0}s` },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-2xl p-3 text-center bg-black/5 dark:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-colors">
                        <stat.icon size={16} className="mx-auto mb-2 text-zinc-400" />
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                          {stat.value?.toLocaleString?.() || stat.value || 0}
                        </p>
                        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}