import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  ArrowLeft,
  Languages,
  Loader2,
  FileText
} from 'lucide-react';
import advertisementService from '../services/advertisementService';
import { cn } from '../utils/cn';

const PublicAdView = () => {
  const { token } = useParams();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lang, setLang] = useState('EN'); // EN or MR

  useEffect(() => {
    const fetchAd = async () => {
      try {
        setLoading(true);
        const response = await advertisementService.getPublicAdvertisement(token);
        setAd(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load advertisement');
      } finally {
        setLoading(false);
      }
    };
    fetchAd();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-slate-500 font-medium animate-pulse">Loading Recruitment Details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-xl shadow-slate-200 border border-slate-100 text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <FileText size={40} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Advertisement Not Found</h1>
            <p className="text-slate-500 mt-2">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold hover:bg-slate-800 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <Building2 size={20} />
            </div>
            DTE CHB Portal
          </div>
          <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button 
              onClick={() => setLang('EN')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                lang === 'EN' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Languages size={16} />
              English
            </button>
            <button 
              onClick={() => setLang('MR')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
                lang === 'MR' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              मराठी
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Ad Title Card */}
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl shadow-indigo-100/20 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-40 blur-3xl" />
          
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold tracking-wider uppercase border border-indigo-100">
              <CheckCircle2 size={14} />
              Verified Recruitment
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                {ad.course_name} <br/>
                <span className="text-indigo-600 font-medium text-2xl md:text-3xl">Recruitment (CHB)</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium flex items-center gap-2">
                <Building2 size={20} className="text-slate-400" />
                {ad.institution_name}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vacancies</p>
                <p className="text-xl font-bold text-slate-900">{ad.vacancy_count} Positions</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Start Date</p>
                <p className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Calendar size={18} className="text-green-500" />
                  {new Date(ad.application_start_date).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">End Date</p>
                <p className="text-xl font-bold text-slate-900 flex items-center gap-2 text-red-600">
                  <Calendar size={18} />
                  {new Date(ad.application_end_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ad Content Card */}
        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="bg-slate-900 px-8 py-4 flex items-center justify-between text-white">
            <h2 className="font-bold tracking-wide uppercase text-sm">Official Notification</h2>
            <FileText size={20} className="text-slate-500" />
          </div>
          <div className="p-8 md:p-16">
            <article className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-strong:text-slate-900 prose-li:text-slate-600 font-serif md:text-lg leading-relaxed">
              <div dangerouslySetInnerHTML={{ 
                __html: lang === 'EN' ? ad.content_en : ad.content_mr 
              }} />
            </article>
          </div>
          <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-slate-500 text-sm italic font-medium">
              * This is an AI-enhanced recruitment notice approved by the Directorate of Technical Education.
            </div>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
              Apply Now
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicAdView;
