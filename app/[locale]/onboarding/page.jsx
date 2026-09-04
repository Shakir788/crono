'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';
import { Clock, Sun, Moon, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

const steps = [
  { id: 1, title: 'Votre pays', subtitle: 'Où êtes-vous basé ?' },
  { id: 2, title: 'Pays cible', subtitle: 'Où est votre audience ?' },
  { id: 3, title: 'Plateforme', subtitle: 'Sur quelle plateforme publiez-vous ?' },
  { id: 4, title: 'Catégorie', subtitle: 'Quel type de contenu créez-vous ?' },
  { id: 5, title: 'Audience', subtitle: 'Décrivez votre audience' },
];

const countries = [
  { code: 'MA', name: 'Maroc', flag: '🇲🇦' },
  { code: 'DZ', name: 'Algérie', flag: '🇩🇿' },
  { code: 'TN', name: 'Tunisie', flag: '🇹🇳' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IN', name: 'Inde', flag: '🇮🇳' },
  { code: 'AE', name: 'Émirats', flag: '🇦🇪' },
  { code: 'SA', name: 'Arabie Saoudite', flag: '🇸🇦' },
  { code: 'EG', name: 'Égypte', flag: '🇪🇬' },
];

const platforms = [
  { code: 'instagram', name: 'Instagram', icon: '📸' },
  { code: 'tiktok', name: 'TikTok', icon: '🎵' },
  { code: 'both', name: 'Les deux', icon: '🚀' },
];

const categories = [
  { code: 'beauty', name: 'Beauté & Mode', icon: '💄' },
  { code: 'food', name: 'Food & Cuisine', icon: '🍕' },
  { code: 'gaming', name: 'Gaming', icon: '🎮' },
  { code: 'comedy', name: 'Comédie', icon: '😂' },
  { code: 'fitness', name: 'Fitness & Sport', icon: '💪' },
  { code: 'travel', name: 'Voyage', icon: '✈️' },
  { code: 'education', name: 'Éducation', icon: '📚' },
  { code: 'music', name: 'Musique', icon: '🎶' },
  { code: 'tech', name: 'Technologie', icon: '💻' },
  { code: 'lifestyle', name: 'Lifestyle', icon: '🌟' },
  { code: 'islamic', name: 'Contenu Islamique', icon: '🕌' },
  { code: 'other', name: 'Autre', icon: '✨' },
];

const ageGroups = [
  { code: '13-17', name: '13 – 17 ans' },
  { code: '18-24', name: '18 – 24 ans' },
  { code: '25-34', name: '25 – 34 ans' },
  { code: '35-44', name: '35 – 44 ans' },
  { code: '45+', name: '45 ans et plus' },
];

const genders = [
  { code: 'female', name: 'Femmes', icon: '👩' },
  { code: 'male', name: 'Hommes', icon: '👨' },
  { code: 'mixed', name: 'Mixte', icon: '👥' },
];

export default function OnboardingPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { locale } = useParams();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState({
    creator_country: '',
    target_country: '',
    platform: '',
    content_category: '',
    audience_age: '',
    audience_gender: '',
  });

  useEffect(() => setMounted(true), []);

  const updateData = (key, value) => setData((prev) => ({ ...prev, [key]: value }));

  const canNext = () => {
    if (step === 1) return data.creator_country !== '';
    if (step === 2) return data.target_country !== '';
    if (step === 3) return data.platform !== '';
    if (step === 4) return data.content_category !== '';
    if (step === 5) return data.audience_age !== '' && data.audience_gender !== '';
    return false;
  };

  const handleFinish = async () => {
    setLoading(true);

    try {
      // 1. Current user nikalo
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Utilisateur non trouvé. Veuillez vous reconnecter.");
      }

      // 2. Profile update karo
      // .update ki jagah .upsert lagayenge aur id bhi bhejenge
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id, // Ye sabse zaroori hai table mein row banane ke liye
          creator_country: data.creator_country,
          target_country: data.target_country,
          platform: data.platform,
          content_category: data.content_category,
          audience_age: data.audience_age,
          audience_gender: data.audience_gender,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // 3. Cache refresh karo aur Dashboard pe bhejo
      router.refresh(); 
      router.push(`/${locale}/dashboard`);

    } catch (err) {
      alert("Erreur lors de la sauvegarde: " + err.message);
      setLoading(false);
    }
  router.push(`/${locale}/dashboard`);
};
  const SelectCard = ({ selected, onClick, children }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left w-full"
      style={{
        background: selected ? 'rgba(99,102,241,0.15)' : 'var(--background)',
        border: selected ? '1px solid rgba(99,102,241,0.5)' : '1px solid var(--border)',
        color: selected ? '#6366f1' : 'var(--text)',
      }}
    >
      {selected && <Check size={14} style={{ color: '#6366f1', flexShrink: 0 }} />}
      {children}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background)' }}>

      {mounted && (
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="fixed top-6 right-6 w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {theme === 'dark'
            ? <Sun size={16} style={{ color: 'var(--muted)' }} />
            : <Moon size={16} style={{ color: 'var(--muted)' }} />}
        </button>
      )}

      <div className="w-full max-w-lg">

        {/* Logo + Progress */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Clock size={16} color="white" />
            </div>
            <span className="font-bold">Crono</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((s) => (
              <div
                key={s.id}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: s.id === step ? '32px' : '8px',
                  background: s.id <= step
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'var(--border)',
                }}
              />
            ))}
          </div>

          <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>
            Étape {step} sur {steps.length}
          </p>
          <h2 className="text-2xl font-bold">{steps[step - 1].title}</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {steps[step - 1].subtitle}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

          {/* Step 1 */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {countries.map((c) => (
                <SelectCard
                  key={c.code}
                  selected={data.creator_country === c.code}
                  onClick={() => updateData('creator_country', c.code)}
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                </SelectCard>
              ))}
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-3">
              {countries.map((c) => (
                <SelectCard
                  key={c.code}
                  selected={data.target_country === c.code}
                  onClick={() => updateData('target_country', c.code)}
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                </SelectCard>
              ))}
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="flex flex-col gap-3">
              {platforms.map((p) => (
                <SelectCard
                  key={p.code}
                  selected={data.platform === p.code}
                  onClick={() => updateData('platform', p.code)}
                >
                  <span className="text-xl">{p.icon}</span>
                  <span>{p.name}</span>
                </SelectCard>
              ))}
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="grid grid-cols-2 gap-3">
              {categories.map((c) => (
                <SelectCard
                  key={c.code}
                  selected={data.content_category === c.code}
                  onClick={() => updateData('content_category', c.code)}
                >
                  <span>{c.icon}</span>
                  <span>{c.name}</span>
                </SelectCard>
              ))}
            </div>
          )}

          {/* Step 5 */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium mb-3" style={{ color: 'var(--text)' }}>
                  Tranche d'âge
                </p>
                <div className="flex flex-col gap-2">
                  {ageGroups.map((a) => (
                    <SelectCard
                      key={a.code}
                      selected={data.audience_age === a.code}
                      onClick={() => updateData('audience_age', a.code)}
                    >
                      {a.name}
                    </SelectCard>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-3" style={{ color: 'var(--text)' }}>
                  Genre
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {genders.map((g) => (
                    <SelectCard
                      key={g.code}
                      selected={data.audience_gender === g.code}
                      onClick={() => updateData('audience_gender', g.code)}
                    >
                      <span>{g.icon}</span>
                      <span>{g.name}</span>
                    </SelectCard>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all hover:opacity-80 disabled:opacity-30"
              style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              <ChevronLeft size={16} />
              Retour
            </button>

            {step < 5 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                Suivant
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={!canNext() || loading}
                className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                {loading ? 'Chargement...' : 'Commencer'}
                <Check size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}