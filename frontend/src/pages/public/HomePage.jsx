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
  Store,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import DistrictCard from '../../components/DistrictCard/DistrictCard';
import { TN_DISTRICTS } from '../../utils/districtsData';
import api from '../../services/api';

const HERO_SLIDES = [
  { id: 1, image: '/hero/hero-1.jpg', alt: 'TMSSA Leader 1' },
  { id: 2, image: '/hero/hero-2.jpg', alt: 'TMSSA Leader 2' },
  { id: 3, image: '/hero/hero-3.jpg', alt: 'TMSSA Leader 3' }
];

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const [districts, setDistricts] = useState(TN_DISTRICTS);

  // Hero carousel state
  const [currentSlide, setCurrentSlide] = useState(0);

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

  // Continuous auto-rotation every 5 seconds without stopping on hover
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const renderCarouselBox = (extraClass = '') => (
    <div className={`relative flex flex-col items-center w-full ${extraClass}`}>
      <div className="w-full max-w-[320px] xs:max-w-[350px] sm:max-w-[420px] lg:max-w-[460px] relative rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 bg-gradient-to-b from-white/15 to-white/5 border border-white/20 backdrop-blur-md shadow-2xl overflow-hidden group">
        <div
          className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-60"
          style={{ backgroundColor: '#16A34A' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-60"
          style={{ backgroundColor: '#123DAA' }}
        />

        <div className="relative h-[240px] xs:h-[270px] sm:h-[340px] md:h-[400px] lg:h-[440px] xl:h-[470px] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-inner flex items-center justify-center p-2">
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out ${
                idx === currentSlide
                  ? 'opacity-100 z-10 pointer-events-auto'
                  : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="h-full w-full object-contain filter drop-shadow-md select-none rounded-lg sm:rounded-xl"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>

        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2.5 rounded-full bg-black/50 hover:bg-[#123DAA] text-white border border-white/20 backdrop-blur-md shadow-lg transition-all z-20 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Previous image"
        >
          <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2.5 rounded-full bg-black/50 hover:bg-[#123DAA] text-white border border-white/20 backdrop-blur-md shadow-lg transition-all z-20 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Next image"
        >
          <ChevronRight size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3 sm:mt-4 z-10">
        {HERO_SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 focus:outline-none ${
              idx === currentSlide
                ? 'w-6 sm:w-8 bg-[#F07818] shadow-md'
                : 'w-2 sm:w-2.5 bg-white/40 hover:bg-white/80'
            }`}
            aria-label={`Go to image ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );

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
    <div className="space-y-12 sm:space-y-16 pb-16" style={{ backgroundColor: '#F4F7FC' }}>

      {/* ══════════════════════════════════════════════════════════════════
          HERO SECTION WITH 5-IMAGE AUTO-ROTATING CAROUSEL (5 SECONDS)
          Official Palette: Dark Navy Blue (#09246B), Royal Blue (#123DAA), Green (#16A34A)
      ══════════════════════════════════════════════════════════════════ */}
      <section
        className="relative text-white overflow-hidden shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #06194b 0%, #09246B 38%, #123DAA 72%, #08432a 100%)'
        }}
      >
        {/* Subtle grid pattern & glowing green/blue accents */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#123DAA]/30 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#16A34A]/25 blur-3xl pointer-events-none"></div>

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">

            {/* Left Column (7 Cols on Desktop, Crisp Left-Aligned Text on Mobile) */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
              
              {/* Association Badge with Logo */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white shadow-sm">
                <img
                  src="/logo.jpg"
                  alt="TMSSA Logo"
                  className="h-5 w-5 rounded-full object-cover border border-[#F07818]"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span className="text-xs sm:text-[13px] font-bold tracking-wide">
                  தமிழ்நாடு மாநில தலைமை அமைப்பு
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold text-white shadow-xs"
                  style={{ backgroundColor: '#16A34A' }}
                >
                  Reg: 23/2025
                </span>
              </div>

              {/* Main Headline (Clean, Left-Aligned, Perfectly Structured) */}
              <div className="space-y-1.5">
                <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-normal leading-[1.3] text-white">
                  தமிழ்நாடு மொபைல் சேல்ஸ் அண்டு சர்வீஸ் அசோசியேஷன்
                </h1>
                <p
                  className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-bold tracking-normal leading-snug"
                  style={{ color: '#F07818' }}
                >
                  Tamilnadu Mobile Sales and Service Association
                </p>
              </div>

              {/* Mobile Carousel - Visible ONLY on screens < lg (Directly in user focus!) */}
              <div className="lg:hidden my-2">
                {renderCarouselBox('mx-auto')}
              </div>

              {/* President Message Executive Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 sm:p-5 border-l-4 border-[#F07818] border-t border-r border-b border-white/15 shadow-sm text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-orange-300 flex items-center gap-1.5">
                    <BadgeCheck size={15} className="text-[#F07818]" />
                    <span>{isTa ? 'மாநில தலைவரின் உரை' : "State President's Message"}</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm md:text-base text-blue-50 leading-[1.65] font-normal">
                  {isTa
                    ? 'இந்த சங்கத்தின் தலைவராகப் பொறுப்பேற்று, பல்வேறு மொபைல் கடை உரிமையாளர்களை ஒருங்கிணைத்து, அவர்களின் வளர்ச்சிக்கும் நலனுக்கும் தொடர்ந்து பாடுபட்டு வருகிறார். வணிகர்களின் பிரச்சினைகளுக்குத் தீர்வு காண்பது, அவர்களின் உரிமைகளைப் பாதுகாப்பது மற்றும் அனைவரையும் ஒன்றிணைத்து முன்னேற்றப் பாதையில் அழைத்துச் செல்வது இவரது முக்கிய நோக்கமாகும்.'
                    : 'As the President of the Association, he is committed to bringing mobile shop owners together and supporting their growth and welfare. His primary objectives are to address the challenges faced by business owners, protect their rights, and unite them towards a stronger and more progressive future.'}
                </p>
              </div>

              {/* Association Quick Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-1">
                {[
                  { value: '38', label: isTa ? 'மாவட்டங்கள்' : 'Districts', color: '#60a5fa' },
                  { value: '10,000+', label: isTa ? 'உறுப்பினர்கள்' : 'Members', color: '#4ade80' },
                  { value: '38 B2B', label: isTa ? 'வாட்ஸ்அப்' : 'WhatsApp', color: '#fb923c' },
                  { value: '100%', label: isTa ? 'சரிபார்க்கப்பட்டது' : 'Verified', color: '#ffffff' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-white/15 text-center shadow-xs"
                  >
                    <div className="text-sm xs:text-base sm:text-xl font-black" style={{ color: item.color }}>
                      {item.value}
                    </div>
                    <div className="text-[10px] sm:text-xs text-blue-200 font-medium">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-start gap-2.5 sm:gap-3 pt-1">
                <Link
                  to="/membership"
                  className="px-5 sm:px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm text-white"
                  style={{ backgroundColor: '#F07818' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d4660f')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F07818')}
                >
                  <span>{t('home.joinNow', 'Join Now / உறுப்பினர் பதிவு')}</span>
                  <ArrowRight size={15} />
                </Link>

                <Link
                  to="/whatsapp-groups"
                  className="px-5 sm:px-6 py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 shadow-md text-xs sm:text-sm"
                  style={{ backgroundColor: '#16A34A' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16A34A')}
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp Groups</span>
                </Link>

                <Link
                  to="/districts"
                  className="px-5 sm:px-6 py-3 rounded-xl font-semibold text-white border border-white/30 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm hover:bg-white/15 backdrop-blur-xs"
                >
                  <MapPin size={15} />
                  <span>{t('home.viewDistricts', 'All 38 Districts')}</span>
                </Link>
              </div>

            </div>

            {/* Right Column: Desktop Carousel (Visible ONLY on lg+) */}
            <div className="hidden lg:flex lg:col-span-5 relative flex-col items-center w-full">
              {renderCarouselBox()}
            </div>

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
