import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Newspaper } from 'lucide-react';
import api from '../../services/api';
import { getCachedData, setCachedData } from '../../utils/clientCache';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { optimizeImageUrl } from '../../utils/imageOptimizer';
import SafeImage from '../../components/common/SafeImage';

export default function NewsDetailPage() {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const cached = useMemo(() => getCachedData(`news_${id}`), [id]);
  const [article, setArticle] = useState(cached);
  const [loading, setLoading] = useState(!cached);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchArticle = useCallback(() => {
    api
      .get(`/news/${id}`)
      .then((res) => {
        if (!mountedRef.current) return;
        const data = res.data?.data || null;
        setArticle(data);
        if (data) setCachedData(`news_${id}`, data);
      })
      .catch(() => {
        if (mountedRef.current && !getCachedData(`news_${id}`)) setArticle(null);
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!cached) setLoading(true);
    fetchArticle();
  }, [cached, fetchArticle]);

  useAutoRefresh([`news_${id}`, 'news'], fetchArticle);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-sm text-gray-400">
        {isTa ? 'ஏற்றுகிறது...' : 'Loading article...'}
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-gray-500">{isTa ? 'செய்தி கிடைக்கவில்லை.' : 'News article not found.'}</p>
        <Link to="/news" className="inline-flex items-center gap-2 text-sm text-orange-600 font-semibold">
          <ArrowLeft size={16} /> {isTa ? 'செய்திகள் பக்கத்திற்குத் திரும்பு' : 'Back to News'}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link to="/news" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600">
        <ArrowLeft size={16} /> {isTa ? 'செய்திகள் பக்கத்திற்குத் திரும்பு' : 'Back to News'}
      </Link>

      <article className="bg-white rounded-3xl p-6 sm:p-12 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full font-semibold">
            {isTa ? 'அதிகாரப்பூர்வ செய்தி' : 'Official Press Release'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} />{' '}
            {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
          {isTa ? article.titleTa || article.titleEn : article.titleEn}
        </h1>

        {article.imageUrl ? (
          <SafeImage
            src={optimizeImageUrl(article.imageUrl, { width: 1200 })}
            alt={isTa ? article.titleTa : article.titleEn}
            decoding="async"
            className="w-full max-h-[420px] object-cover rounded-2xl"
            fallback={
              <div className="h-56 bg-gradient-to-tr from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white">
                <Newspaper size={48} className="opacity-70" />
              </div>
            }
          />
        ) : (
          <div className="h-56 bg-gradient-to-tr from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white">
            <Newspaper size={48} className="opacity-70" />
          </div>
        )}

        <div className="prose max-w-none text-gray-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
          {isTa ? article.contentTa || article.contentEn : article.contentEn}
        </div>
      </article>
    </div>
  );
}
