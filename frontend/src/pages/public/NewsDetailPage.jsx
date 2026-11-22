import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';

export default function NewsDetailPage() {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link to="/news" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600">
        <ArrowLeft size={16} /> {isTa ? 'செய்திகள் பக்கத்திற்குத் திரும்பு' : 'Back to News'}
      </Link>

      <article className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full font-semibold">
            {isTa ? 'அதிகாரப்பூர்வ செய்தி' : 'Official Press Release'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} /> 2026-11-20
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
          {isTa
            ? 'அனைத்து 38 மாவட்டங்களுக்கான மாநில பொதுக்குழுக் கூட்டம் அறிவிப்பு'
            : 'State Annual General Meeting Announced for All 38 Districts'}
        </h1>

        <div className="h-64 sm:h-80 bg-gradient-to-tr from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white">
          <span className="text-white/80 font-medium">News Image Banner</span>
        </div>

        <div className="prose max-w-none text-gray-600 text-sm sm:text-base leading-relaxed space-y-4">
          <p>
            {isTa
              ? 'தமிழ்நாட்டின் அனைத்து 38 மாவட்ட நிர்வாகிகளும் கலந்து கொள்ளும் மாநில அளவிலான பொதுக்குழுக் கூட்டம் விரைவில் நடைபெற உள்ளது. இக்கூட்டத்தில் அமைப்பின் எதிர்கால வளர்ச்சித் திட்டங்கள், மாவட்ட வாரியான புதிய திட்டங்கள் மற்றும் உறுப்பினர் நலத் திட்டங்கள் குறித்து ஆலோசிக்கப்படும்.'
              : 'The State Executive Committee is pleased to announce the upcoming State Annual General Meeting comprising representatives and leaders from all 38 districts of Tamil Nadu. Key agenda items include future organization expansion, welfare programs, and community initiatives.'}
          </p>
        </div>
      </article>
    </div>
  );
}
