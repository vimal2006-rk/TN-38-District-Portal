import { useState, useMemo } from 'react';
import { ShieldCheck, Users, Search, HeartHandshake, Scale, Award } from 'lucide-react';

const DISTRICT_LEADERS = [
  {
    no: 1,
    district: 'விருதுநகர் மாவட்டம்',
    president: 'இர்பான் அப்துல்லா, அஷ்ரப் கம்யூனிகேஷன், ராஜபாளையம்',
    secretary: 'சரவணன், சித்ரா மொபைல், ராஜபாளையம்',
    treasurer: 'கணேஷ், லட்சுமி மொபைல்ஸ், வத்திராயிருப்பு',
  },
  {
    no: 2,
    district: 'மதுரை மாவட்டம்',
    president: 'ராஜேஷ், ட்ரிங் மொபைல்',
    secretary: 'ஜோன் ஜெயராஜ், காசேந்திரா மொபைல்',
    treasurer: 'வெங்கடேசன், தனம் மொபைல்',
  },
  {
    no: 3,
    district: 'திண்டுக்கல் மாவட்டம்',
    president: 'அப்பாஸ், கொடைக்கானல்',
    secretary: 'செய்யது, சிட்டி மொபைல், வத்தலகுண்டு',
    treasurer: 'சதீஸ், SSK மொபைல், திண்டுக்கல்',
  },
  {
    no: 4,
    district: 'தூத்துக்குடி மாவட்டம்',
    president: 'மு. ரியாஸ்',
    secretary: 'சி. கருப்பசாமி',
    treasurer: 'மு. கலீல் ரகுமான்',
  },
  {
    no: 5,
    district: 'கடலூர் மாவட்டம்',
    president: 'AKS அருண்குமார்',
    secretary: 'R. சத்தியநாதன்',
    treasurer: 'நிஜந்தன், SVS மொபைல்',
  },
  {
    no: 6,
    district: 'சிவகங்கை மாவட்டம்',
    president: 'முஸ்தபா, ஸ்டார் மொபைல்',
    secretary: 'ஷேக் அப்துல்லா, எஸ் என் ஆர் மொபைல், திருப்பத்தூர்',
    treasurer: 'தமீம் அன்சாரி, சஃபானா மொபைல், சிவகங்கை',
  },
  {
    no: 7,
    district: 'செங்கல்பட்டு மாவட்டம்',
    president: 'மோகன்ராஜ், SMR மொபைல்',
    secretary: 'ராமசந்திரன், G.D செல் பாயிண்ட்',
    treasurer: 'விநாயகம், மகேஸ்வரி மொபைல்',
  },
  {
    no: 8,
    district: 'திருவண்ணாமலை மாவட்டம்',
    president: 'செய்யது ஆசிப், SKN மொபைல்',
    secretary: 'ராகவேந்திரா மொபைல்',
    treasurer: 'சுப்ரீம் சிஸ்டம், ஆரணி',
  },
  {
    no: 9,
    district: 'தென்காசி மாவட்டம்',
    president: 'பீர்முகம்மது, தென்காசி',
    secretary: 'இண்டியன் மொபைல், செங்கோட்டை',
    treasurer: 'சதாம், நமீரா மொபைல், தென்காசி',
  },
  {
    no: 10,
    district: 'கிருஷ்ணகிரி மாவட்டம்',
    president: 'S. மஞ்சுநாத், ஸ்ரீ மகாலட்சுமி மொபைல், போச்சம்பள்ளி',
    secretary: 'M. அரவிந்த், அசோக் மொபைல், காவேரிப்பட்டிணம்',
    treasurer: 'சி. சதீஷ், TN24 மொபைல், பர்கூர்',
  },
  {
    no: 11,
    district: 'பெரம்பலூர் மாவட்டம்',
    president: 'பெ. அருள்குமார், அகரம் சீகூர்',
    secretary: 'விஜயக்குமார், திட்டக்குடி',
    treasurer: 'கரிகரன்',
  },
  {
    no: 12,
    district: 'பாண்டிச்சேரி',
    president: 'கு. மலையாளத்தான், ரோஷிதா மொபைல், பாண்டிச்சேரி',
    secretary: 'A. ஜெயபிரகாஷ், ஜெ.பி. மொபைல், பாண்டிச்சேரி',
    treasurer: 'நியமனம் செய்யப்பட உள்ளது',
  },
  {
    no: 13,
    district: 'சென்னை',
    president: 'இதயத்துல்லா, சென்னை',
    secretary: 'நியமனம் செய்யப்பட உள்ளது',
    treasurer: 'முகமது மன்சூர், போன் 4 யூ, சென்னை',
  },
  {
    no: 14,
    district: 'காஞ்சிபுரம் மாவட்டம்',
    president: 'D.P. சுரேஷ்ராஜா',
    secretary: 'பா. மணிகண்டன், அண்ணாமலையார் மொபைல்',
    treasurer: 'S. தனபால், டார்க் மொபைல்',
  },
  {
    no: 15,
    district: 'சேலம் மாவட்டம்',
    president: 'M. ராஜு, மேத்யூ மொபைல்ஸ், கொளத்தூர், சேலம்',
    secretary: 'க. ராஜமாணிக்கம், ராஜா மொபைல் கேர், சேலம்',
    treasurer: 'C. சண்முகவேல், சிஎம்எஸ் மொபைல், திருமலைகிரி',
  },
  {
    no: 16,
    district: 'தர்மபுரி மாவட்டம்',
    president: 'எம்.பி. முத்து, எம்.பி. மொபைல் பார்க், பாப்பாரப்பட்டி',
    secretary: 'A. இம்ரான், ஐ மொபைல், பாலக்கோடு',
    treasurer: 'S. பர்கத், பெஸ்ட் மொபைல்ஸ், அரூர்',
  },
  {
    no: 17,
    district: 'கள்ளக்குறிச்சி மாவட்டம்',
    president: 'ரபாத்கான்',
    secretary: 'அப்சல்கான், A.K. மொபைல்',
    treasurer: 'ஜி. நித்திஷ்குமார்',
  },
  {
    no: 18,
    district: 'ராணிப்பேட்டை மாவட்டம்',
    president: 'ப. சுகுமாரன், எஸ் எஸ் மொபைல், பாணாவரம் - 632505',
    secretary: 'கா. ஞானப்பிரகாசம், பிரகாஷ் மொபைல்ஸ், பாணாவரம் - 632505',
    treasurer: 'ஆகாஷ் குமார், A.K. மொபைல், ராணிப்பேட்டை',
  },
  {
    no: 19,
    district: 'கோவை மாவட்டம்',
    president: 'வேலாயுதம்',
    secretary: 'விஷ்ணு பாரதி, வீ டெக் மொபைல்',
    treasurer: 'கார்த்திக், டைகர் மொபைல்',
  },
];

const WELFARE_TERMS = [
  'சங்கத்தின் உறுப்பினர்கள் வாழ்வாதாரத்தை உயர்த்துவது.',
  'மொபைல் சேல்ஸ்க்கு தேவையான உதிரி பாகங்கள் சங்க உறுப்பினர்களுக்கு கொள்முதல் விலையில் கிடைக்க செய்வது.',
  'அரசால் கிடைக்கும் கடன் வசதிகளை தகுந்த ஆதாரங்கள் கொடுத்து அதன் பயனை கிடைக்க செய்வது.',
  'சங்கத்தில் உள்ளவர்களுக்கு இடையூறு காலத்தில் நிதி மற்றும் பொருள் உதவி செய்ய ஏற்பாடு செய்வது.',
  'சங்க உறுப்பினர்களான தனிப்பட்ட நபரின் இன்ப துன்பங்களில் கலந்து கொண்டு தேவைப்படும் உதவிகள் செய்வது.',
  'உறுப்பினர்கள் எவருக்கேனும் வறுமை நிலை சூழல் ஏற்பட்டால் அவர்களின் வாழ்வாதாரம் மேம்பட எல்லா வகையிலும் உதவுவது.',
  'உறுப்பினர்களுக்கு அவசரகால உதவிகள் ஏதேனும் தேவைப்பட்டால் சங்கத்தின் சார்பாக செய்து தரப்படும்.',
];

const PERSONAL_PUBLIC_TERMS = [
  'காவல் துறை மற்றும் சட்ட சிக்கல்கள் (மொபைல் வாங்கும் போதும், விற்கும் போதும்) ஏற்படும் பிரச்சினைகளுக்கு சட்டரீதியாக உதவி சரி செய்து தருவது.',
  'சர்வீஸ் நபர்களுக்கு சர்வீஸ்க்கு தேவையான உபகரணங்கள் மற்றும் அதன் உதிரிபாகங்கள் குறைந்த விலையில் வாங்க விற்க ஏற்பாடு செய்வது.',
  'உறுப்பினர்களுக்கு பர்சனலாக ஏதாவது போலீஸ் சார்ந்த பிரச்சனை ஏற்பட்டால் அச்சப்படத் தேவையில்லை. உங்கள் பட்சத்தில் சரியான நியாயம் இருக்கும் பட்சத்தில் சங்கத்தின் சார்பாக போலீஸ் ஸ்டேசனுக்கு சங்கத்தில் இருந்து ஒருவர் வந்து அந்த பிரச்சனைகளை சரிசெய்து அளிப்பார்.',
  'Basic Service course இலவசமாக வழங்குவது.',
  'Software, Hardware டிரெய்னிங் இற்கு குறைந்த செலவில் தெளிவான முறையான டிரெய்னிங் வகுப்புகள் அமைத்து தருவது.',
  'ஏற்கனவே சர்வீஸ் செய்பவர்கள் மேலும் சர்வீஸில் வளர நினைத்தால் அவர்கள் வளர்ச்சிக்கு உதவுவது.',
  'சங்கத்தின் உறுப்பினர்கள் எல்லா மாவட்டங்களிலும் மரம் வளர்க்க ஏற்பாடு செய்தல்.',
];

export default function TermsAndConditionsPage() {
  const [search, setSearch] = useState('');

  const filteredDistricts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DISTRICT_LEADERS;
    return DISTRICT_LEADERS.filter(
      (d) =>
        d.district.toLowerCase().includes(q) ||
        d.president.toLowerCase().includes(q) ||
        d.secretary.toLowerCase().includes(q) ||
        d.treasurer.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="min-h-screen py-10 sm:py-14" style={{ backgroundColor: '#F4F7FC' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div
            className="inline-flex p-3 rounded-2xl shadow-sm"
            style={{ backgroundColor: '#EEF2FF', color: '#09246B' }}
          >
            <ShieldCheck size={30} />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#09246B] leading-snug">
            தமிழ்நாடு மொபைல் சேல்ஸ் அண்ட் சர்வீஸ் அசோசியேசன்
          </h1>
          <p className="text-sm sm:text-base font-bold text-[#F07818]">
            Terms & Conditions • விதிமுறைகள், நலத்திட்டங்கள் மற்றும் மாவட்ட நிர்வாகிகள் பட்டியல்
          </p>
        </div>

        {/* Section 1: Terms & Welfare Benefits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card A: Member Welfare */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="p-2.5 rounded-xl bg-blue-50 text-[#09246B]">
                <HeartHandshake size={22} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#09246B]">
                  1. உறுப்பினர் நலன் மற்றும் வாழ்வாதாரம்
                </h2>
                <p className="text-xs text-gray-500">Member Welfare & Business Support</p>
              </div>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
              {WELFARE_TERMS.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#09246B] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card B: Personal, Legal, Training & Public Welfare */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="p-2.5 rounded-xl bg-orange-50 text-[#F07818]">
                <Scale size={22} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#09246B]">
                  2. பெர்சனல், சட்ட உதவி & பொதுநலம் சார்ந்தவைகள்
                </h2>
                <p className="text-xs text-gray-500">Legal Assistance, Training & Public Welfare</p>
              </div>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
              {PERSONAL_PUBLIC_TERMS.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#F07818] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section 2: District Presidents, Secretaries & Treasurers List */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-5">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-green-50 text-[#16A34A] flex-shrink-0">
                <Users size={22} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#09246B]">
                  அனைத்து மாவட்டங்களின் தலைவர், செயலாளர், பொருளாளர் லிஸ்ட்
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  இதனைத் தொடர்ந்து உங்கள் ஊர்களில் உள்ள நிர்வாகிகள், தலைவர், செயலாளர், பொருளாளர் என ஆலோசனை மேற்கொண்டு இந்த லிஸ்டில் பதிவு செய்து கொள்ளுங்கள்.
                </p>
              </div>
            </div>

            <div className="relative w-full md:w-72 flex-shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="மாவட்டம் / பெயர் தேட..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#09246B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredDistricts.map((d) => (
              <div
                key={d.no}
                className="rounded-2xl border border-gray-200 bg-[#F8FAFC] p-5 space-y-3 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#09246B] text-white">
                    #{d.no}
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#09246B] text-right">
                    {d.district}
                  </h3>
                </div>

                <div className="space-y-2 text-xs leading-relaxed">
                  <div>
                    <span className="font-bold text-[#F07818]">தலைவர்: </span>
                    <span className="text-gray-800 font-medium">{d.president}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#123DAA]">செயலாளர்: </span>
                    <span className="text-gray-800 font-medium">{d.secretary}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#16A34A]">பொருளாளர்: </span>
                    <span className="text-gray-800 font-medium">{d.treasurer}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3 text-xs sm:text-sm text-[#09246B]">
            <Award size={18} className="text-[#F07818] flex-shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">
              20) இதனைத் தொடர்ந்து உங்கள் ஊர்களில் உள்ள நிர்வாகிகள், தலைவர், செயலாளர், பொருளாளர் என உங்களுக்குள் ஆலோசனை மேற்கொண்டு மேலே தந்த லிஸ்டில் பதிவு செய்து கொள்ளுங்கள்.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
