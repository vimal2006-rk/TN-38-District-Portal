import { useState, useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Users, Search, HeartHandshake, Scale, Award } from 'lucide-react';

const DISTRICT_LEADERS = [
  {
    no: 1,
    districtTa: 'விருதுநகர் மாவட்டம்',
    districtEn: 'Virudhunagar District',
    presidentTa: 'இர்பான் அப்துல்லா, அஷ்ரப் கம்யூனிகேஷன், ராஜபாளையம்',
    presidentEn: 'Irfan Abdullah, Ashraf Communication, Rajapalayam',
    secretaryTa: 'சரவணன், சித்ரா மொபைல், ராஜபாளையம்',
    secretaryEn: 'Saravanan, Chithra Mobile, Rajapalayam',
    treasurerTa: 'கணேஷ், லட்சுமி மொபைல்ஸ், வத்திராயிருப்பு',
    treasurerEn: 'Ganesh, Lakshmi Mobiles, Watrap',
  },
  {
    no: 2,
    districtTa: 'மதுரை மாவட்டம்',
    districtEn: 'Madurai District',
    presidentTa: 'ராஜேஷ், ட்ரிங் மொபைல்',
    presidentEn: 'Rajesh, Tring Mobile',
    secretaryTa: 'ஜோன் ஜெயராஜ், காசேந்திரா மொபைல்',
    secretaryEn: 'John Jeyaraj, Kasendra Mobile',
    treasurerTa: 'வெங்கடேசன், தனம் மொபைல்',
    treasurerEn: 'Venkatesan, Dhanam Mobile',
  },
  {
    no: 3,
    districtTa: 'திண்டுக்கல் மாவட்டம்',
    districtEn: 'Dindigul District',
    presidentTa: 'அப்பாஸ், கொடைக்கானல்',
    presidentEn: 'Abbas, Kodaikanal',
    secretaryTa: 'செய்யது, சிட்டி மொபைல், வத்தலகுண்டு',
    secretaryEn: 'Syed, City Mobile, Batlagundu',
    treasurerTa: 'சதீஸ், SSK மொபைல், திண்டுக்கல்',
    treasurerEn: 'Sathish, SSK Mobile, Dindigul',
  },
  {
    no: 4,
    districtTa: 'தூத்துக்குடி மாவட்டம்',
    districtEn: 'Thoothukudi District',
    presidentTa: 'மு. ரியாஸ்',
    presidentEn: 'M. Riyaz',
    secretaryTa: 'சி. கருப்பசாமி',
    secretaryEn: 'C. Karuppasamy',
    treasurerTa: 'மு. கலீல் ரகுமான்',
    treasurerEn: 'M. Kaleel Rahman',
  },
  {
    no: 5,
    districtTa: 'கடலூர் மாவட்டம்',
    districtEn: 'Cuddalore District',
    presidentTa: 'AKS அருண்குமார்',
    presidentEn: 'AKS Arunkumar',
    secretaryTa: 'R. சத்தியநாதன்',
    secretaryEn: 'R. Sathyanathan',
    treasurerTa: 'நிஜந்தன், SVS மொபைல்',
    treasurerEn: 'Nijanthan, SVS Mobile',
  },
  {
    no: 6,
    districtTa: 'சிவகங்கை மாவட்டம்',
    districtEn: 'Sivaganga District',
    presidentTa: 'முஸ்தபா, ஸ்டார் மொபைல்',
    presidentEn: 'Musthafa, Star Mobile',
    secretaryTa: 'ஷேக் அப்துல்லா, எஸ் என் ஆர் மொபைல், திருப்பத்தூர்',
    secretaryEn: 'Sheik Abdullah, SNR Mobile, Tirupathur',
    treasurerTa: 'தமீம் அன்சாரி, சஃபானா மொபைல், சிவகங்கை',
    treasurerEn: 'Thameem Ansari, Safana Mobile, Sivaganga',
  },
  {
    no: 7,
    districtTa: 'செங்கல்பட்டு மாவட்டம்',
    districtEn: 'Chengalpattu District',
    presidentTa: 'மோகன்ராஜ், SMR மொபைல்',
    presidentEn: 'Mohanraj, SMR Mobile',
    secretaryTa: 'ராமசந்திரன், G.D செல் பாயிண்ட்',
    secretaryEn: 'Ramachandran, G.D Cell Point',
    treasurerTa: 'விநாயகம், மகேஸ்வரி மொபைல்',
    treasurerEn: 'Vinayagam, Maheswari Mobile',
  },
  {
    no: 8,
    districtTa: 'திருவண்ணாமலை மாவட்டம்',
    districtEn: 'Tiruvannamalai District',
    presidentTa: 'செய்யது ஆசிப், SKN மொபைல்',
    presidentEn: 'Syed Asif, SKN Mobile',
    secretaryTa: 'ராகவேந்திரா மொபைல்',
    secretaryEn: 'Raghavendra Mobile',
    treasurerTa: 'சுப்ரீம் சிஸ்டம், ஆரணி',
    treasurerEn: 'Supreme System, Arani',
  },
  {
    no: 9,
    districtTa: 'தென்காசி மாவட்டம்',
    districtEn: 'Tenkasi District',
    presidentTa: 'பீர்முகம்மது, தென்காசி',
    presidentEn: 'Peer Mohamed, Tenkasi',
    secretaryTa: 'இண்டியன் மொபைல், செங்கோட்டை',
    secretaryEn: 'Indian Mobile, Shencottah',
    treasurerTa: 'சதாம், நமீரா மொபைல், தென்காசி',
    treasurerEn: 'Satham, Nameera Mobile, Tenkasi',
  },
  {
    no: 10,
    districtTa: 'கிருஷ்ணகிரி மாவட்டம்',
    districtEn: 'Krishnagiri District',
    presidentTa: 'S. மஞ்சுநாத், ஸ்ரீ மகாலட்சுமி மொபைல், போச்சம்பள்ளி',
    presidentEn: 'S. Manjunath, Sri Mahalakshmi Mobile, Pochampalli',
    secretaryTa: 'M. அரவிந்த், அசோக் மொபைல், காவேரிப்பட்டிணம்',
    secretaryEn: 'M. Aravind, Ashok Mobile, Kaveripattinam',
    treasurerTa: 'சி. சதீஷ், TN24 மொபைல், பர்கூர்',
    treasurerEn: 'C. Sathish, TN24 Mobile, Bargur',
  },
  {
    no: 11,
    districtTa: 'பெரம்பலூர் மாவட்டம்',
    districtEn: 'Perambalur District',
    presidentTa: 'பெ. அருள்குமார், அகரம் சீகூர்',
    presidentEn: 'P. Arulkumar, Agaram Sigoor',
    secretaryTa: 'விஜயக்குமார், திட்டக்குடி',
    secretaryEn: 'Vijayakumar, Tittagudi',
    treasurerTa: 'கரிகரன்',
    treasurerEn: 'Karikaran',
  },
  {
    no: 12,
    districtTa: 'பாண்டிச்சேரி',
    districtEn: 'Puducherry',
    presidentTa: 'கு. மலையாளத்தான், ரோஷிதா மொபைல், பாண்டிச்சேரி',
    presidentEn: 'K. Malayalathan, Roshitha Mobile, Puducherry',
    secretaryTa: 'A. ஜெயபிரகாஷ், ஜெ.பி. மொபைல், பாண்டிச்சேரி',
    secretaryEn: 'A. Jayaprakash, J.P. Mobile, Puducherry',
    treasurerTa: 'நியமனம் செய்யப்பட உள்ளது',
    treasurerEn: 'To be appointed',
  },
  {
    no: 13,
    districtTa: 'சென்னை',
    districtEn: 'Chennai',
    presidentTa: 'இதயத்துல்லா, சென்னை',
    presidentEn: 'Idhayathulla, Chennai',
    secretaryTa: 'நியமனம் செய்யப்பட உள்ளது',
    secretaryEn: 'To be appointed',
    treasurerTa: 'முகமது மன்சூர், போன் 4 யூ, சென்னை',
    treasurerEn: 'Mohamed Mansoor, Phone 4 U, Chennai',
  },
  {
    no: 14,
    districtTa: 'காஞ்சிபுரம் மாவட்டம்',
    districtEn: 'Kancheepuram District',
    presidentTa: 'D.P. சுரேஷ்ராஜா',
    presidentEn: 'D.P. Sureshraja',
    secretaryTa: 'பா. மணிகண்டன், அண்ணாமலையார் மொபைல்',
    secretaryEn: 'B. Manikandan, Annamalaiyar Mobile',
    treasurerTa: 'S. தனபால், டார்க் மொபைல்',
    treasurerEn: 'S. Dhanapal, Dark Mobile',
  },
  {
    no: 15,
    districtTa: 'சேலம் மாவட்டம்',
    districtEn: 'Salem District',
    presidentTa: 'M. ராஜு, மேத்யூ மொபைல்ஸ், கொளத்தூர், சேலம்',
    presidentEn: 'M. Raju, Mathew Mobiles, Kolathur, Salem',
    secretaryTa: 'க. ராஜமாணிக்கம், ராஜா மொபைல் கேர், சேலம்',
    secretaryEn: 'K. Rajamanickam, Raja Mobile Care, Salem',
    treasurerTa: 'C. சண்முகவேல், சிஎம்எஸ் மொபைல், திருமலைகிரி',
    treasurerEn: 'C. Shanmugavel, CMS Mobile, Thirumalaigiri',
  },
  {
    no: 16,
    districtTa: 'தர்மபுரி மாவட்டம்',
    districtEn: 'Dharmapuri District',
    presidentTa: 'எம்.பி. முத்து, எம்.பி. மொபைல் பார்க், பாப்பாரப்பட்டி',
    presidentEn: 'M.P. Muthu, M.P. Mobile Park, Papparapatti',
    secretaryTa: 'A. இம்ரான், ஐ மொபைல், பாலக்கோடு',
    secretaryEn: 'A. Imran, I Mobile, Palacode',
    treasurerTa: 'S. பர்கத், பெஸ்ட் மொபைல்ஸ், அரூர்',
    treasurerEn: 'S. Barkath, Best Mobiles, Harur',
  },
  {
    no: 17,
    districtTa: 'கள்ளக்குறிச்சி மாவட்டம்',
    districtEn: 'Kallakurichi District',
    presidentTa: 'ரபாத்கான்',
    presidentEn: 'Rafath Khan',
    secretaryTa: 'அப்சல்கான், A.K. மொபைல்',
    secretaryEn: 'Afsal Khan, A.K. Mobile',
    treasurerTa: 'ஜி. நித்திஷ்குமார்',
    treasurerEn: 'G. Nithishkumar',
  },
  {
    no: 18,
    districtTa: 'ராணிப்பேட்டை மாவட்டம்',
    districtEn: 'Ranipet District',
    presidentTa: 'ப. சுகுமாரன், எஸ் எஸ் மொபைல், பாணாவரம் - 632505',
    presidentEn: 'P. Sugumaran, SS Mobile, Panavaram - 632505',
    secretaryTa: 'கா. ஞானப்பிரகாசம், பிரகாஷ் மொபைல்ஸ், பாணாவரம் - 632505',
    secretaryEn: 'K. Gnanaprakasam, Prakash Mobiles, Panavaram - 632505',
    treasurerTa: 'ஆகாஷ் குமார், A.K. மொபைல், ராணிப்பேட்டை',
    treasurerEn: 'Akash Kumar, A.K. Mobile, Ranipet',
  },
  {
    no: 19,
    districtTa: 'கோவை மாவட்டம்',
    districtEn: 'Coimbatore District',
    presidentTa: 'வேலாயுதம்',
    presidentEn: 'Velayutham',
    secretaryTa: 'விஷ்ணு பாரதி, வீ டெக் மொபைல்',
    secretaryEn: 'Vishnu Bharathi, V Tech Mobile',
    treasurerTa: 'கார்த்திக், டைகர் மொபைல்',
    treasurerEn: 'Karthik, Tiger Mobile',
  },
];

const WELFARE_TERMS = [
  {
    ta: 'சங்கத்தின் உறுப்பினர்கள் வாழ்வாதாரத்தை உயர்த்துவது.',
    en: 'Uplifting the livelihood and economic well-being of all association members.',
  },
  {
    ta: 'மொபைல் சேல்ஸ்க்கு தேவையான உதிரி பாகங்கள் சங்க உறுப்பினர்களுக்கு கொள்முதல் விலையில் கிடைக்க செய்வது.',
    en: 'Ensuring mobile sales spare parts and accessories are available to members at wholesale/purchase prices.',
  },
  {
    ta: 'அரசால் கிடைக்கும் கடன் வசதிகளை தகுந்த ஆதாரங்கள் கொடுத்து அதன் பயனை கிடைக்க செய்வது.',
    en: 'Assisting members with proper documentation to avail government business loans and welfare schemes.',
  },
  {
    ta: 'சங்கத்தில் உள்ளவர்களுக்கு இடையூறு காலத்தில் நிதி மற்றும் பொருள் உதவி செய்ய ஏற்பாடு செய்வது.',
    en: 'Providing financial and material assistance to members during times of hardship.',
  },
  {
    ta: 'சங்க உறுப்பினர்களான தனிப்பட்ட நபரின் இன்ப துன்பங்களில் கலந்து கொண்டு தேவைப்படும் உதவிகள் செய்வது.',
    en: 'Standing by members in both happy and difficult personal moments and offering necessary support.',
  },
  {
    ta: 'உறுப்பினர்கள் எவருக்கேனும் வறுமை நிலை சூழல் ஏற்பட்டால் அவர்களின் வாழ்வாதாரம் மேம்பட எல்லா வகையிலும் உதவுவது.',
    en: 'Extending all-round support to improve the livelihood of any member facing financial distress.',
  },
  {
    ta: 'உறுப்பினர்களுக்கு அவசரகால உதவிகள் ஏதேனும் தேவைப்பட்டால் சங்கத்தின் சார்பாக செய்து தரப்படும்.',
    en: 'Providing emergency assistance on behalf of the association whenever members require urgent help.',
  },
];

const PERSONAL_PUBLIC_TERMS = [
  {
    ta: 'காவல் துறை மற்றும் சட்ட சிக்கல்கள் (மொபைல் வாங்கும் போதும், விற்கும் போதும்) ஏற்படும் பிரச்சினைகளுக்கு சட்டரீதியாக உதவி சரி செய்து தருவது.',
    en: 'Providing legal assistance to resolve police and legal issues arising during buying or selling of mobile phones.',
  },
  {
    ta: 'சர்வீஸ் நபர்களுக்கு சர்வீஸ்க்கு தேவையான உபகரணங்கள் மற்றும் அதன் உதிரிபாகங்கள் குறைந்த விலையில் வாங்க விற்க ஏற்பாடு செய்வது.',
    en: 'Arranging affordable buying and selling of servicing tools and spare parts for mobile service technicians.',
  },
  {
    ta: 'உறுப்பினர்களுக்கு பர்சனலாக ஏதாவது போலீஸ் சார்ந்த பிரச்சனை ஏற்பட்டால் அச்சப்படத் தேவையில்லை. உங்கள் பட்சத்தில் சரியான நியாயம் இருக்கும் பட்சத்தில் சங்கத்தின் சார்பாக போலீஸ் ஸ்டேசனுக்கு சங்கத்தில் இருந்து ஒருவர் வந்து அந்த பிரச்சனைகளை சரிசெய்து அளிப்பார்.',
    en: 'Members need not fear personal police-related issues; when truth and justice are on your side, an association representative will accompany you to the police station and help resolve the matter.',
  },
  {
    ta: 'Basic Service course இலவசமாக வழங்குவது.',
    en: 'Providing Basic Mobile Service training courses free of cost.',
  },
  {
    ta: 'Software, Hardware டிரெய்னிங் இற்கு குறைந்த செலவில் தெளிவான முறையான டிரெய்னிங் வகுப்புகள் அமைத்து தருவது.',
    en: 'Organizing structured, clear Software & Hardware training classes at minimal cost.',
  },
  {
    ta: 'ஏற்கனவே சர்வீஸ் செய்பவர்கள் மேலும் சர்வீஸில் வளர நினைத்தால் அவர்கள் வளர்ச்சிக்கு உதவுவது.',
    en: 'Supporting existing mobile service technicians who wish to upgrade their skills and grow further.',
  },
  {
    ta: 'சங்கத்தின் உறுப்பினர்கள் எல்லா மாவட்டங்களிலும் மரம் வளர்க்க ஏற்பாடு செய்தல்.',
    en: 'Organizing tree-planting initiatives across all districts with association members.',
  },
];

const LeaderCard = memo(function LeaderCard({ d, isTa }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-[#F8FAFC] p-5 space-y-3 hover:shadow-md transition">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#09246B] text-white">
          #{d.no}
        </span>
        <h3 className="text-sm sm:text-base font-extrabold text-[#09246B] text-right">
          {isTa ? d.districtTa : d.districtEn}
        </h3>
      </div>

      <div className="space-y-2 text-xs leading-relaxed">
        <div>
          <span className="font-bold text-[#F07818]">
            {isTa ? 'தலைவர்: ' : 'President: '}
          </span>
          <span className="text-gray-800 font-medium">
            {isTa ? d.presidentTa : d.presidentEn}
          </span>
        </div>
        <div>
          <span className="font-bold text-[#123DAA]">
            {isTa ? 'செயலாளர்: ' : 'Secretary: '}
          </span>
          <span className="text-gray-800 font-medium">
            {isTa ? d.secretaryTa : d.secretaryEn}
          </span>
        </div>
        <div>
          <span className="font-bold text-[#16A34A]">
            {isTa ? 'பொருளாளர்: ' : 'Treasurer: '}
          </span>
          <span className="text-gray-800 font-medium">
            {isTa ? d.treasurerTa : d.treasurerEn}
          </span>
        </div>
      </div>
    </div>
  );
});

export default function TermsAndConditionsPage() {
  const { i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const [activeTab, setActiveTab] = useState('terms');
  const [search, setSearch] = useState('');

  const handleTabTerms = useCallback(() => setActiveTab('terms'), []);
  const handleTabLeaders = useCallback(() => setActiveTab('leaders'), []);
  const handleLangTa = useCallback(() => i18n.changeLanguage('ta'), [i18n]);
  const handleLangEn = useCallback(() => i18n.changeLanguage('en'), [i18n]);
  const handleSearchChange = useCallback((e) => setSearch(e.target.value), []);

  const filteredDistricts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DISTRICT_LEADERS;
    return DISTRICT_LEADERS.filter(
      (d) =>
        d.districtTa.toLowerCase().includes(q) ||
        d.districtEn.toLowerCase().includes(q) ||
        d.presidentTa.toLowerCase().includes(q) ||
        d.presidentEn.toLowerCase().includes(q) ||
        d.secretaryTa.toLowerCase().includes(q) ||
        d.secretaryEn.toLowerCase().includes(q) ||
        d.treasurerTa.toLowerCase().includes(q) ||
        d.treasurerEn.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="min-h-screen py-10 sm:py-14" style={{ backgroundColor: '#F4F7FC' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header + Inline Language Toggle */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div
            className="inline-flex p-3 rounded-2xl shadow-sm"
            style={{ backgroundColor: '#EEF2FF', color: '#09246B' }}
          >
            <ShieldCheck size={30} />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#09246B] leading-snug">
            {isTa
              ? 'தமிழ்நாடு மொபைல் சேல்ஸ் அண்ட் சர்வீஸ் அசோசியேசன்'
              : 'Tamilnadu Mobile Sales and Service Association'}
          </h1>
          <p className="text-sm sm:text-base font-bold text-[#F07818]">
            {isTa
              ? 'விதிமுறைகள், நலத்திட்டங்கள் மற்றும் மாவட்ட நிர்வாகிகள் பட்டியல்'
              : 'Terms & Conditions, Member Welfare Benefits & District Office Bearers'}
          </p>

          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white border border-gray-200 shadow-xs mt-2">
            <button
              type="button"
              onClick={handleLangTa}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                isTa ? 'bg-[#09246B] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              தமிழ்
            </button>
            <button
              type="button"
              onClick={handleLangEn}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                !isTa ? 'bg-[#09246B] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              English
            </button>
          </div>
          {/* Separated Section Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3">
            <button
              type="button"
              onClick={handleTabTerms}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shadow-xs border ${
                activeTab === 'terms'
                  ? 'bg-[#F07818] text-white border-[#F07818] shadow-md'
                  : 'bg-white text-[#09246B] border-gray-200 hover:bg-gray-50'
              }`}
            >
              <ShieldCheck size={16} />
              <span>{isTa ? 'விதிமுறைகள் & நலத்திட்டங்கள்' : 'Terms & Welfare Benefits'}</span>
            </button>
            <button
              type="button"
              onClick={handleTabLeaders}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shadow-xs border ${
                activeTab === 'leaders'
                  ? 'bg-[#F07818] text-white border-[#F07818] shadow-md'
                  : 'bg-white text-[#09246B] border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Users size={16} />
              <span>{isTa ? 'மாவட்ட நிர்வாகிகள் பட்டியல் (19)' : 'District Office Bearers List (19)'}</span>
            </button>
          </div>
        </div>

        {/* Section 1: Terms & Welfare Benefits */}
        {activeTab === 'terms' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card A: Member Welfare */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="p-2.5 rounded-xl bg-blue-50 text-[#09246B]">
                <HeartHandshake size={22} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#09246B]">
                  {isTa ? '1. உறுப்பினர் நலன் மற்றும் வாழ்வாதாரம்' : '1. Member Welfare & Livelihood'}
                </h2>
                <p className="text-xs text-gray-500">
                  {isTa ? 'Member Welfare & Business Support' : 'Association Support for Members'}
                </p>
              </div>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
              {WELFARE_TERMS.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#09246B] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{isTa ? item.ta : item.en}</span>
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
                  {isTa
                    ? '2. பெர்சனல், சட்ட உதவி & பொதுநலம் சார்ந்தவைகள்'
                    : '2. Legal Support, Training & Public Welfare'}
                </h2>
                <p className="text-xs text-gray-500">
                  {isTa ? 'Legal Assistance, Training & Public Welfare' : 'Technical Growth & Social Initiatives'}
                </p>
              </div>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
              {PERSONAL_PUBLIC_TERMS.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#F07818] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{isTa ? item.ta : item.en}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        )}

        {/* Section 2: District Presidents, Secretaries & Treasurers List */}
        {activeTab === 'leaders' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-5">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-green-50 text-[#16A34A] flex-shrink-0">
                <Users size={22} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#09246B]">
                  {isTa
                    ? 'அனைத்து மாவட்டங்களின் தலைவர், செயலாளர், பொருளாளர் லிஸ்ட்'
                    : 'District Presidents, Secretaries & Treasurers Directory'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {isTa
                    ? 'இதனைத் தொடர்ந்து உங்கள் ஊர்களில் உள்ள நிர்வாகிகள், தலைவர், செயலாளர், பொருளாளர் என ஆலோசனை மேற்கொண்டு இந்த லிஸ்டில் பதிவு செய்து கொள்ளுங்கள்.'
                    : 'Other districts may consult locally among office bearers (President, Secretary, Treasurer) and register in this official list.'}
                </p>
              </div>
            </div>

            <div className="relative w-full md:w-72 flex-shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder={isTa ? 'மாவட்டம் / பெயர் தேட...' : 'Search district or leader name...'}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#09246B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredDistricts.map((d) => (
              <LeaderCard key={d.no} d={d} isTa={isTa} />
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3 text-xs sm:text-sm text-[#09246B]">
            <Award size={18} className="text-[#F07818] flex-shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">
              {isTa
                ? '20) இதனைத் தொடர்ந்து உங்கள் ஊர்களில் உள்ள நிர்வாகிகள், தலைவர், செயலாளர், பொருளாளர் என உங்களுக்குள் ஆலோசனை மேற்கொண்டு மேலே தந்த லிஸ்டில் பதிவு செய்து கொள்ளுங்கள்.'
                : '20) Remaining districts are encouraged to consult with local office bearers (President, Secretary, Treasurer) and register their district committee in this official directory.'}
            </p>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
