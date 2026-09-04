'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Moon, Sun, Globe, Clock, TrendingUp, Users, Calendar, BarChart3, Zap, ChevronRight, Check } from 'lucide-react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link'; // Naya import link ke liye

export default function LandingPage() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale || 'en'; // Current language fetch karne ke liye

  useEffect(() => setMounted(true), []);

  const switchLanguage = (lang) => {
    const segments = pathname.split('/');
    segments[1] = lang;
    router.push(segments.join('/'));
    setLangOpen(false);
  };

  const features = [
    { icon: Clock, key: 'f1' },
    { icon: Zap, key: 'f2' },
    { icon: Globe, key: 'f3' },
    { icon: Users, key: 'f4' },
    { icon: Calendar, key: 'f5' },
    { icon: BarChart3, key: 'f6' },
  ];

  const stats = [
    { value: '50K+', key: 's1' },
    { value: '2M+', key: 's2' },
    { value: '+340%', key: 's3' },
    { value: '98%', key: 's4' },
  ];

  const plans = [
    {
      key: 'free',
      price: '0',
      features: ['1 compte social', '3 recommandations/jour', 'Analytiques de base'],
      highlighted: false,
    },
    {
      key: 'pro',
      price: '199',
      features: ['5 comptes sociaux', 'Recommandations illimitées', 'IA personnalisée', 'Rapports hebdomadaires', 'Support prioritaire'],
      highlighted: true,
    },
    {
      key: 'agency',
      price: '999',
      features: ['Comptes illimités', 'Multi-clients', 'API access', 'Manager dédié', 'Rapports blancs'],
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--text)' }}>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Clock size={16} color="white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Crono</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm hover:opacity-100 transition-opacity" style={{ color: 'var(--muted)' }}>{t('nav.features')}</a>
            <a href="#pricing" className="text-sm hover:opacity-100 transition-opacity" style={{ color: 'var(--muted)' }}>{t('nav.pricing')}</a>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-80"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
              >
                <Globe size={14} />
                <span className="hidden sm:block">FR</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-10 rounded-xl overflow-hidden shadow-2xl z-50" style={{ background: 'var(--surface)', border: '1px solid var(--border)', minWidth: '120px' }}>
                  {[
                    { code: 'fr', label: 'Français' },
                    { code: 'ar', label: 'العربية' },
                    { code: 'en', label: 'English' },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => switchLanguage(lang.code)}
                      className="w-full px-4 py-2.5 text-sm text-left hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--text)' }}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                {theme === 'dark' ? <Sun size={16} style={{ color: 'var(--muted)' }} /> : <Moon size={16} style={{ color: 'var(--muted)' }} />}
              </button>
            )}

            {/* CTA Updated to Link */}
            <Link
              href={`/${locale}/signup`}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {t('nav.signup')}
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#6366f1' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {t('hero.badge')}
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            {t('hero.title')}
            <br />
            <span className="gradient-text">{t('hero.title2')}</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--muted)' }}>
            {t('hero.description')}
          </p>

          {/* CTAs Updated to Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={`/${locale}/signup`} className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 hover:scale-105 animate-pulse-glow"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {t('hero.cta')}
              <ChevronRight size={18} />
            </Link>
            
            <Link href={`/${locale}/login`} className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-medium transition-all hover:opacity-80"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
              Sign In
            </Link>
          </div>

          {/* Mock Dashboard Preview */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 rounded-2xl blur-3xl opacity-20" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
            <div className="relative glass rounded-2xl p-6 glow">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    <Clock size={16} color="white" />
                  </div>
                  <span className="font-semibold">Crono Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>Live</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl p-4 text-left" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>🇲🇦 Meilleur moment</p>
                  <p className="text-2xl font-bold gradient-text">20:17</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Heure du Maroc</p>
                </div>
                <div className="rounded-xl p-4 text-left" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>📊 Score</p>
                  <p className="text-2xl font-bold text-green-400">94/100</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Excellent</p>
                </div>
                <div className="rounded-xl p-4 text-left" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>📈 Audience active</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>+340%</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>vs moyenne</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.key} className="text-center">
              <p className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</p>
              <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>{t(`stats.${stat.key}`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('features.title')}</h2>
            <p className="text-lg" style={{ color: 'var(--muted)' }}>{t('features.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, key }) => (
              <div key={key} className="glass rounded-2xl p-6 hover:glow transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <Icon size={20} style={{ color: '#6366f1' }} />
                </div>
                <h3 className="font-semibold mb-2">{t(`features.${key}_title`)}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{t(`features.${key}_desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6" style={{ background: 'var(--surface)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('pricing.title')}</h2>
            <p className="text-lg" style={{ color: 'var(--muted)' }}>{t('pricing.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.key}
                className={`rounded-2xl p-6 relative transition-all duration-300 ${plan.highlighted ? 'glow scale-105' : ''}`}
                style={{
                  background: plan.highlighted ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))' : 'var(--background)',
                  border: plan.highlighted ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--border)'
                }}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    Populaire
                  </div>
                )}
                <h3 className="font-bold text-lg mb-2">{t(`pricing.${plan.key}`)}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">{plan.price === '0' ? 'Gratuit' : `${plan.price} MAD`}</span>
                  {plan.price !== '0' && <span style={{ color: 'var(--muted)' }}>{t('pricing.month')}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-green-400 flex-shrink-0" />
                      <span style={{ color: 'var(--muted)' }}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 ${plan.highlighted ? 'text-white' : ''}`}
                  style={plan.highlighted
                    ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }
                    : { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  {t(`pricing.cta_${plan.key === 'free' ? 'free' : plan.key === 'pro' ? 'pro' : 'agency'}`)}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Clock size={12} color="white" />
            </div>
            <span className="font-semibold text-sm">Crono</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            © 2026 Crono. {t('footer.rights')}
          </p>
        </div>
      </footer>

    </div>
  );
}