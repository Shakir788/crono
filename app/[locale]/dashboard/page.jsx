'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Clock, TrendingUp, BarChart3, Globe, Zap, 
  ChevronRight, RefreshCw, Activity, BrainCircuit, Database
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const categoryLabels = {
  beauty: 'Beauté & Mode', food: 'Food & Cuisine', gaming: 'Gaming', comedy: 'Comédie', fitness: 'Fitness',
  travel: 'Voyage', education: 'Éducation', music: 'Musique', tech: 'Technologie', lifestyle: 'Lifestyle',
  islamic: 'Islamique', other: 'Autre',
};

const platformLabels = {
  instagram: 'Instagram', tiktok: 'TikTok', both: 'Instagram & TikTok',
};

export default function DashboardPage() {
  const router = useRouter();
  const { locale } = useParams();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isPredictive, setIsPredictive] = useState(true);
  const [bestTime, setBestTime] = useState('20:00');
  const [bestScore, setBestScore] = useState(90);
  const [schedule, setSchedule] = useState([]);
  
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generatePredictiveData = (category) => {
    const categoryPeakHours = { gaming: 21, education: 17, fitness: 18, beauty: 19, food: 12, comedy: 20, music: 21, tech: 18, lifestyle: 19, islamic: 18 };
    const baseHour = categoryPeakHours[category] || 19;

    const newSchedule = days.map((day, index) => {
      let hour = baseHour;
      if (day === 'Sam' || day === 'Dim') hour = baseHour + 1;
      const variance = (index % 3) - 1;
      const finalHour = Math.min(23, Math.max(0, hour + variance));
      
      return { day, time: `${finalHour.toString().padStart(2, '0')}:00`, score: 85 + (index % 10) };
    });

    const best = newSchedule.reduce((prev, curr) => (prev.score > curr.score) ? prev : curr);
    return { bestTime: best.time, bestScore: best.score, schedule: newSchedule };
  };

  const calculateRealData = (postsData, fallbackSchedule) => {
    const scoredPosts = postsData.map(post => {
      const score = (post.watch_time || 0) * 0.30 + (post.shares || 0) * 0.25 + (post.views || 0) * 0.20 + (post.likes || 0) * 0.10 + (post.comments || 0) * 0.10 + (post.saves || 0) * 0.05;
      const date = new Date(post.posted_at);
      return { ...post, score, hour: date.getHours(), dayIndex: date.getDay() };
    });

    const jsDayToOurDay = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };

    const realSchedule = days.map((dayLabel, ourIndex) => {
      const postsForDay = scoredPosts.filter(p => jsDayToOurDay[p.dayIndex] === ourIndex);
      if (postsForDay.length === 0) return fallbackSchedule[ourIndex]; 

      const hours = {};
      postsForDay.forEach(p => {
        if (!hours[p.hour]) hours[p.hour] = { total: 0, count: 0 };
        hours[p.hour].total += p.score;
        hours[p.hour].count += 1;
      });

      let bestHour = 20, bestAvg = 0;
      Object.entries(hours).forEach(([h, val]) => {
        const avg = val.total / val.count;
        if (avg > bestAvg) { bestAvg = avg; bestHour = parseInt(h); }
      });

      return { day: dayLabel, time: `${bestHour.toString().padStart(2, '0')}:00`, score: Math.min(99, Math.round((bestAvg / 1000) * 100) || 80) };
    });

    const allHours = {};
    scoredPosts.forEach(p => {
      if (!allHours[p.hour]) allHours[p.hour] = { total: 0, count: 0 };
      allHours[p.hour].total += p.score;
      allHours[p.hour].count += 1;
    });

    let overallBestHour = 20, overallBestAvg = 0;
    Object.entries(allHours).forEach(([h, val]) => {
      const avg = val.total / val.count;
      if (avg > overallBestAvg) { overallBestAvg = avg; overallBestHour = parseInt(h); }
    });

    return { bestTime: `${overallBestHour.toString().padStart(2, '0')}:00`, bestScore: Math.min(99, Math.round((overallBestAvg / 1000) * 100) || 85), schedule: realSchedule };
  };

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push(`/${locale}/login`); return; }

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profileData?.onboarding_completed) { router.push(`/${locale}/onboarding`); return; }
    
    // 🔥 UPDATED LOGIC: Naam fetch karne ke liye (DB se ya Google Auth se)
    const fullName = profileData?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Créateur';
    const firstName = fullName.split(' ')[0]; // Sirf pehla naam (First Name) nikalne ke liye
    
    setProfile({ ...profileData, firstName });

    const { data: postsData } = await supabase.from('posts').select('*').eq('user_id', user.id).order('posted_at', { ascending: false }).limit(20);

    const predictiveResult = generatePredictiveData(profileData.content_category);

    if (postsData && postsData.length > 0) {
      setPosts(postsData);
      const realResult = calculateRealData(postsData, predictiveResult.schedule);
      setBestTime(realResult.bestTime);
      setBestScore(realResult.bestScore);
      setSchedule(realResult.schedule);
      setIsPredictive(false);
    } else {
      setPosts([]);
      setBestTime(predictiveResult.bestTime);
      setBestScore(predictiveResult.bestScore);
      setSchedule(predictiveResult.schedule);
      setIsPredictive(true);
    }
    setLoading(false);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'from-emerald-400 to-green-500';
    if (score >= 75) return 'from-amber-400 to-orange-500';
    return 'from-rose-400 to-red-500';
  };
  
  const getScoreTextColor = (score) => {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 75) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Bon';
    return 'Faible';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center relative">
          <div className="absolute inset-0 bg-indigo-500 blur-[50px] opacity-20 rounded-full animate-pulse" />
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30 relative z-10">
            <Clock size={24} color="white" className="animate-spin-slow" />
          </div>
          <p className="text-sm text-zinc-400 font-medium tracking-wide">Moteur Crono en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500/30 font-sans transition-colors duration-300">
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-16 relative">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-semibold mb-4">
              <Activity size={12} /> Espace Créateur
            </div>
            {/* 🔥 UPDATED LOGIC: Naam dikhane ke liye */}
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              Bonjour, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">{profile?.firstName || 'Créateur'}</span> 
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">Voici les performances de votre contenu aujourd'hui.</p>
          </div>

          <Link 
            href={`/${locale}/zeno`} 
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white transition-all bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-105 shadow-xl shadow-purple-500/25 border border-purple-400/20"
          >
            <BrainCircuit size={18} />
            Demander à Zeno
          </Link>
        </div>

        {/* Info Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-10 relative z-10">
          {[
            { icon: Globe, label: 'Cible', value: profile?.target_country === 'MA' ? '🇲🇦 Maroc' : profile?.target_country, color: 'text-blue-500' },
            { icon: Zap, label: 'Plateforme', value: platformLabels[profile?.platform] || 'Instagram', color: 'text-amber-500' },
            { icon: TrendingUp, label: 'Catégorie', value: categoryLabels[profile?.content_category] || 'Autre', color: 'text-purple-500' }
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-sm transition-transform hover:scale-105">
              <badge.icon size={14} className={badge.color} />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{badge.label}:</span>
              <span className="text-sm font-semibold">{badge.value}</span>
            </div>
          ))}
        </div>

        {/* Top Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 relative z-10">
          <div className="md:col-span-6 rounded-3xl p-8 relative overflow-hidden group border border-indigo-500/20 bg-gradient-to-br from-indigo-50 dark:from-indigo-950/40 via-white dark:via-[#0a0a0a] to-purple-50 dark:to-purple-950/40 shadow-xl shadow-indigo-500/5 hover:shadow-indigo-500/10 transition-all duration-500">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/30 blur-[60px] rounded-full group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-indigo-500" />
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Meilleur moment</p>
              </div>
              <p className="text-7xl font-extrabold tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                {bestTime}
              </p>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">Heure locale {profile?.target_country === 'MA' ? '🇲🇦' : ''}</p>
              
              <div className={`mt-8 inline-flex items-center gap-3 px-4 py-2 rounded-full border backdrop-blur-sm ${isPredictive ? 'bg-purple-500/10 border-purple-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
                {isPredictive ? (
                  <>
                    <BrainCircuit size={14} className="text-purple-500" />
                    <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">Prédiction IA (0 posts)</span>
                  </>
                ) : (
                  <>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">Basé sur vos données</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-3 rounded-3xl p-6 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-lg hover:bg-white/80 dark:hover:bg-white/10 transition-colors group">
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-6 flex items-center gap-2">
              <BarChart3 size={16} /> Score Global
            </p>
            <p className={`text-6xl font-black tracking-tight mb-2 ${getScoreTextColor(bestScore)}`}>{bestScore}</p>
            <p className={`text-sm font-semibold ${getScoreTextColor(bestScore)} opacity-80`}>{getScoreLabel(bestScore)}</p>
            <div className="mt-6 w-full h-2.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(bestScore)} transition-all duration-1000 ease-out`} style={{ width: `${bestScore}%` }} />
            </div>
          </div>

          <div className="md:col-span-3 rounded-3xl p-6 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-lg flex flex-col justify-between hover:border-indigo-500/30 transition-colors group">
            <div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-6 flex items-center gap-2">
                <Database size={16} /> Volume Analysé
              </p>
              <p className="text-6xl font-black tracking-tight mb-2 text-zinc-900 dark:text-white">{posts.length}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Vidéos traitées</p>
            </div>
            <Link href={`/${locale}/analytics`} className="mt-6 flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-semibold group-hover:bg-indigo-500 group-hover:text-white transition-all">
              Ajouter une vidéo <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Bottom Schedule & Activity Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          <div className="lg:col-span-2 rounded-3xl p-8 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-lg">
            <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold">Calendrier Stratégique</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  {isPredictive ? "Tendances générales de votre audience" : "Vos meilleurs moments de publication"}
                </p>
              </div>
              <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-transparent dark:border-white/5">
                <RefreshCw size={14} className="text-indigo-500" /> Actualiser
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
              {schedule.map((item) => (
                <div key={item.day} className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 border hover:scale-105 cursor-pointer ${item.score >= 90 ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'bg-black/5 dark:bg-white/5 border-transparent hover:border-white/10'}`}>
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">{item.day}</p>
                  <p className="text-lg font-bold mb-3">{item.time}</p>
                  <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden mb-2">
                    <div className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(item.score)}`} style={{ width: `${item.score}%` }} />
                  </div>
                  <p className={`text-xs font-bold ${getScoreTextColor(item.score)}`}>{item.score}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 rounded-3xl p-8 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-lg flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">Activité Récente</h2>
              <Link href={`/${locale}/analytics`} className="text-sm font-semibold text-indigo-500 hover:text-indigo-400 transition-colors">
                Voir tout
              </Link>
            </div>

            {posts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3">
                  <BarChart3 size={20} className="text-indigo-500" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Aucune donnée</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Ajoutez des posts pour analyser</p>
              </div>
            ) : (
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {posts.map((post) => (
                  <div key={post.id} className="group flex items-center justify-between p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Clock size={16} className="text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                          {new Date(post.posted_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-xs text-zinc-500 font-medium">
                          {new Date(post.posted_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black ${getScoreTextColor(post.performance_score || 0)}`}>
                        {Math.round(post.performance_score || 0)}
                      </p>
                      <p className="text-xs text-zinc-500 font-medium tracking-wide">SCORE</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}