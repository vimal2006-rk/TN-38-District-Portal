import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Users,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  ShoppingBag,
  Wrench,
  Truck,
  TrendingUp,
  BadgeCheck,
  CheckCircle2,
  Store
} from 'lucide-react';
import DistrictCard from '../../components/DistrictCard/DistrictCard';
import { TN_DISTRICTS } from '../../utils/districtsData';
import api from '../../services/api';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const [districts, setDistricts] = useState(TN_DISTRICTS);

  useEffect(() => {
    api.get('/districts')
      .then((res) => {
        if (res.data?.data?.length > 0) {
          setDistricts(res.data.data);
        }
      })
      .catch(() => {
        setDistricts(TN_DISTRICTS);
      });
  }, []);

  const mobileBusinessPoints = [
    {
      num: '01',
      icon: Store,
      titleEn: 'Statewide Mobile Retail & Dealer Directory',
      titleTa: 'மாநில அளவிலான மொபைல் டீலர் அடைவு',
      descEn: 'Unified directory cataloging verified retail showrooms, wholesale stockists, and authorized dealers across every taluk in all 38 districts.',
      descTa: 'தமிழ்நாட்டின் 38 மாவட்டங்களிலும் உள்ள சரிபார்க்கப்பட்ட சில்லறை ஷோரூம்கள், மொத்த விற்பனையாளர்கள் மற்றும் டீலர்களின் முழுமையான அடைவு.'
    },
    {
      num: '02',
      icon: ShoppingBag,
      titleEn: 'Direct Brand & Wholesale Pricing Network',
      titleTa: 'நேரடி பிராண்ட் & மொத்த விலை சலுகைகள்',
      descEn: 'Connect directly with primary distributors for high-margin deals on Android smartphones, iPhones, smartwatches, and bulk accessories.',
      descTa: 'முன்னணி ஸ்மார்ட்போன் பிராண்டுகள் மற்றும் மொத்த உதிரிபாகங்கள் மீது நேரடி டீலர் மொத்த விலை மற்றும் கூடுதல் லாப சலுகைகள்.'
    },
    {
      num: '03',
      icon: Wrench,
      titleEn: '100% Genuine Spare Parts & Display Supply',
      titleTa: 'அசல் உதிரிபாகங்கள் & டிஸ்பிளே விநியோகம்',
      descEn: 'Fast procurement channel for original touch screens (Folder/OG Displays), batteries, IC chips, and technician service equipment.',
      descTa: 'அனைத்து மாடல் போன்களுக்கான அசல் டிஸ்பிளே, பேட்டரி, மதர்போர்ட் பாகங்கள் மற்றும் பழுது நீக்கும் கருவிகள் உடனுக்குடன் பெறலாம்.'
    },
    {
      num: '04',
      icon: MessageCircle,
      titleEn: '38 District B2B WhatsApp Trade Groups',
      titleTa: '38 மாவட்ட B2B வாட்ஸ்அப் வர்த்தக குழுக்கள்',
      descEn: 'Instant daily broadcast of price drops, flash sale allocations, new model arrivals, and inter-dealer stock exchange within your district.',
      descTa: 'உங்கள் மாவட்டத்திற்குள் புதிய மாடல்கள் வருகை, தினசரி விலை மாற்றங்கள் மற்றும் ஸ்டாக் பரிமாற்றங்களுக்கான சிறப்பு வாட்ஸ்அப் குழுக்கள்.'
    },
    {
      num: '05',
      icon: Truck,
      titleEn: 'Inter-District Express Delivery & Bus Logistics',
      titleTa: 'மாவட்டங்களுக்கிடையேயான விரைவு பார்சல் சேவை',
      descEn: 'Rapid courier and parcel tie-ups connecting Chennai, Coimbatore, Madurai, Trichy, and Salem to all 38 district centers within 12-24 hours.',
      descTa: 'சென்னை, கோவை, மதுரை போன்ற முக்கிய நகரங்களிலிருந்து அனைத்து 38 மாவட்ட மையங்களுக்கும் ஒரே நாளில் பார்சல் சென்றடையும் விரைவு சேவை.'
    },
    {
      num: '06',
      icon: BadgeCheck,
      titleEn: 'Verified Merchant Membership & Trade Security',
      titleTa: 'அங்கீகரிக்கப்பட்ட வணிகர் உறுப்பினர் & பாதுகாப்பு',
      descEn: 'Official digital ID card, store verification badge, dealer warranty dispute mediation, and business protection for mobile shop owners.',
      descTa: 'அங்கீகரிக்கப்பட்ட டிஜிட்டல் உறுப்பினர் அட்டை, கடை சரிபார்ப்பு பேட்ஜ் மற்றும் வர்த்தக தகராறுகளுக்கான சட்டரீதியான உதவி பாதுகாப்பு.'
    }
  ];

  return (
    <div className="space-y-16 pb-16" style={{ backgroundColor: '#F4F7FC' }}>

      {/* ── Hero Banner ──────────────────────────────────────────────── */}
      <section
        className="relative text-white py-20 px-4 sm:px-6 lg:px-8 shadow-inner overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #09246B 0%, #123DAA 50%, #2463D4 100%)' }}
      >
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        {/* Logo watermark */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 hidden lg:block">
          <img src="/logo.jpg" alt="" className="w-56 h-56 rounded-full object-cover" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
            <Smartphone size={14} /> தமிழ்நாடு அனைத்து 38 மாவட்ட மொபைல் வர்த்தக கட்டமைப்பு
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            {t('home.heroTitle', 'Tamil Nadu 38 District Organization Portal')}
          </h1>

          <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto font-light">
            {t('home.heroSubtitle', 'Connecting all 38 districts of Tamil Nadu under one centralized digital platform.')}
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/membership"
              className="px-6 py-3 rounded-xl font-bold transition shadow-lg flex items-center gap-2 text-sm sm:text-base"
              style={{ backgroundColor: '#F07818', color: '#fff' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d4660f'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F07818'}
            >
              <span>{t('home.joinNow', 'Join Now / உறுப்பினர் பதிவு')}</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/districts"
              className="px-6 py-3 rounded-xl font-semibold text-white border border-white/30 transition flex items-center gap-2 text-sm sm:text-base hover:bg-white/15"
            >
              <MapPin size={18} />
              <span>{t('home.viewDistricts', 'All 38 Districts')}</span>
            </Link>
            <Link
              to="/whatsapp-groups"
              className="px-6 py-3 rounded-xl font-semibold text-white transition flex items-center gap-2 shadow-md text-sm sm:text-base"
              style={{ backgroundColor: '#16A34A' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#14532d'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#16A34A'}
            >
              <MessageCircle size={18} />
              <span>WhatsApp Groups</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          {[
            { value: '38', label: isTa ? 'மாவட்டங்கள்' : 'Districts', color: '#123DAA' },
            { value: '10,000+', label: isTa ? 'உறுப்பினர்கள்' : 'Members', color: '#123DAA' },
            { value: '38', label: isTa ? 'வாட்ஸ்அப் குழுக்கள்' : 'WhatsApp Groups', color: '#16A34A' },
            { value: '100%', label: isTa ? 'டிஜிட்டல் ஒருங்கிணைப்பு' : 'Connected', color: '#2463D4' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border" style={{ borderColor: '#E2E8F0' }}>
              <div className="font-extrabold text-3xl sm:text-4xl mb-1" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs sm:text-sm font-medium" style={{ color: '#64748B' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mobile Business Section ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border p-6 sm:p-10 shadow-sm space-y-10" style={{ borderColor: '#E2E8F0' }}>

          {/* Section Header */}
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: '#EEF2FF', color: '#123DAA' }}
            >
              <Smartphone size={15} />
              <span>{isTa ? '38 மாவட்ட மொபைல் போன் வணிகக் கட்டமைப்பு' : '38 District Mobile Phone Business Network'}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight" style={{ color: '#172554' }}>
              {isTa
                ? 'தமிழ்நாடு 38 மாவட்ட மொபைல் போன் வணிகம் & தொழில் கூட்டமைப்பு'
                : 'Tamil Nadu 38 District Mobile Phone Business & Trade Network'}
            </h2>

            {/* Definition Box */}
            <div
              className="bg-white border-l-4 p-5 rounded-2xl shadow-sm text-left sm:text-center mt-4"
              style={{ borderLeftColor: '#123DAA', backgroundColor: '#F4F7FC' }}
            >
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: '#123DAA' }}>
                {isTa ? 'அமைப்பின் விளக்கம் (Sample Definition)' : 'Overview & Business Definition'}
              </p>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#172554' }}>
                {isTa
                  ? 'தமிழ்நாட்டின் அனைத்து 38 மாவட்டங்களிலும் உள்ள ஸ்மார்ட்போன் விற்பனையாளர்கள், ஷோரூம் உரிமையாளர்கள், மொத்த வியாபாரிகள், உதிரிபாகங்கள் விநியோகஸ்தர்கள் மற்றும் சர்வீஸ் சென்டர்களை ஒரே குடையின் கீழ் இணைக்கும் மாநில அளவிலான ஒருங்கிணைந்த B2B வர்த்தக தளம். இது மாவட்ட வாரியான உடனடி ஸ்டாக் தகவல்கள், மொத்த விலை நிர்ணயம் மற்றும் நம்பகமான வியாபார ஒத்துழைப்பை வழங்குகிறது.'
                  : 'The Tamil Nadu 38 District Mobile Phone Business Portal is a state-wide unified B2B & retail platform uniting smartphone dealers, showroom owners, wholesale distributors, genuine spare parts suppliers, and certified repair technicians across all 38 districts of Tamil Nadu. It provides direct price transparency, district-wise inventory coordination, and verified trade community backing.'}
              </p>
            </div>
          </div>

          {/* 6 Key Points Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mobileBusinessPoints.map((point) => {
              const Icon = point.icon;
              return (
                <div
                  key={point.num}
                  className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-default"
                  style={{ borderColor: '#E2E8F0' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#123DAA'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                        style={{ backgroundColor: '#EEF2FF', color: '#123DAA' }}
                      >
                        <Icon size={20} />
                      </span>
                      <span className="text-2xl font-black font-mono" style={{ color: '#E2E8F0' }}>
                        {point.num}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold" style={{ color: '#172554' }}>
                        {isTa ? point.titleTa : point.titleEn}
                      </h3>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: '#F07818' }}>
                        {isTa ? point.titleEn : point.titleTa}
                      </p>
                    </div>

                    <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
                      {isTa ? point.descTa : point.descEn}
                    </p>
                  </div>

                  <div className="pt-4 mt-2 border-t flex items-center gap-1.5 text-[11px] font-semibold" style={{ borderColor: '#E2E8F0', color: '#16A34A' }}>
                    <CheckCircle2 size={13} />
                    <span>{isTa ? 'அனைத்து 38 மாவட்டங்களிலும் செயல்படுகிறது' : 'Active across all 38 districts'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Business Registration Strip */}
          <div
            className="rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md"
            style={{ background: 'linear-gradient(135deg, #123DAA, #2463D4)' }}
          >
            <div>
              <h4 className="font-bold text-base sm:text-lg">
                {isTa ? 'உங்கள் மொபைல் கடையை 38 மாவட்ட அமைப்பில் இணைக்க விரும்புகிறீர்களா?' : 'Are you a Mobile Store Owner or Distributor?'}
              </h4>
              <p className="text-xs sm:text-sm text-blue-100 mt-1">
                {isTa ? 'உங்கள் மாவட்ட வாட்ஸ்அப் குழுவில் இணைந்து நேரடி வர்த்தக சலுகைகளைப் பெறுங்கள்.' : 'Register your store today to join your district official B2B trade group.'}
              </p>
            </div>
            <Link
              to="/membership"
              className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap shadow transition"
              style={{ backgroundColor: '#F07818', color: '#fff' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d4660f'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F07818'}
            >
              {isTa ? 'இப்போதே பதிவு செய்க' : 'Register Store Now'}
            </Link>
          </div>

        </div>
      </section>

      {/* ── Featured Districts ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: '#172554' }}>
              {isTa ? 'தமிழ்நாடு மாவட்டங்கள்' : 'Districts of Tamil Nadu'}
            </h2>
            <p className="text-sm mt-1" style={{ color: '#64748B' }}>
              {isTa ? 'அனைத்து 38 மாவட்டங்களின் விவரங்கள் மற்றும் வாட்ஸ்அப் தொடர்புகள்' : 'Browse individual district details, leadership, and WhatsApp links'}
            </p>
          </div>
          <Link
            to="/districts"
            className="font-semibold text-sm hover:underline flex items-center gap-1"
            style={{ color: '#123DAA' }}
          >
            <span>{isTa ? 'அனைத்து மாவட்டங்களையும் காண்க' : 'View all 38 districts'}</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {districts.slice(0, 8).map((d) => (
            <DistrictCard key={d.id || d.slug} district={d} />
          ))}
        </div>
      </section>

      {/* ── Join CTA ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl"
          style={{ background: 'linear-gradient(135deg, #09246B 0%, #123DAA 100%)' }}
        >
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold">
              {isTa ? 'உங்கள் மாவட்ட அமைப்பில் இன்றே இணையுங்கள்!' : 'Join your district organization today!'}
            </h3>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              {isTa
                ? 'தமிழ்நாட்டின் 38 மாவட்டங்களிலும் செயல்படும் அமைப்பில் இணைய ஆன்லைன் விண்ணப்பத்தை உடனே சமர்ப்பியுங்கள்.'
                : 'Connect with administrators, participate in community programs, and access verified district WhatsApp community groups.'}
            </p>
          </div>
          <Link
            to="/membership"
            className="font-bold px-8 py-3.5 rounded-xl shadow transition text-sm sm:text-base whitespace-nowrap"
            style={{ backgroundColor: '#F07818', color: '#fff' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d4660f'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F07818'}
          >
            {isTa ? 'உறுப்பினர் பதிவு செய்க' : 'Register for Membership'}
          </Link>
        </div>
      </section>

    </div>
  );
}
