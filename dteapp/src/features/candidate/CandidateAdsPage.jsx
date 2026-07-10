import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublishedAds } from '../admin/advertisementSlice';
import { Building2, Calendar, Users, ChevronLeft, ChevronRight, Briefcase, MapPin, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '../../components/common/UIComponents';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import JobApplicationFlow from './JobApplicationFlow';
import { getMyApplications } from './applicationSlice';

const CandidateAdsPage = () => {
  const dispatch = useDispatch();
  const { publishedList, totalPublished, loading } = useSelector((state) => state.ads);
  const { myApplications } = useSelector((state) => state.application);
  
  const [page, setPage] = useState(1);
  const [showApplyFlow, setShowApplyFlow] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  
  const limit = 6;
  const totalPages = Math.ceil((totalPublished || 0) / limit);

  useEffect(() => {
    dispatch(fetchPublishedAds({ skip: (page - 1) * limit, limit }));
  }, [dispatch, page]);

  useEffect(() => {
    dispatch(getMyApplications({ skip: 0, limit: 100 }));
  }, [dispatch]);

  const handleApplyClick = (ad) => {
    setSelectedAd(ad);
    setShowApplyFlow(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-8 relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
             <Briefcase className="mr-3 text-indigo-600" size={32} />
             Live Job <span className="text-indigo-600 ml-2">Advertisements</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Browse and apply for current faculty vacancies across institutions.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4 min-h-[400px]">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-slate-500 font-medium">Fetching live opportunities...</p>
        </div>
      ) : publishedList && publishedList.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedList.map((ad) => (
              <div key={ad.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full relative group hover:-translate-y-1">
                {/* Status Badge */}
                <div className="absolute top-6 right-6">
                   <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                     Live
                   </span>
                </div>

                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                   <Building2 size={24} />
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors pr-20">{ad.institution_name}</h3>
                <p className="text-sm font-bold text-slate-500 mb-6">{ad.course_name}</p>
                
                <div className="space-y-4 flex-1">
                  <div className="flex items-center text-slate-600 text-sm">
                    <Users size={16} className="mr-3 text-slate-400" />
                    <span className="font-medium"><span className="font-bold text-slate-900">{ad.vacancy_count}</span> Vacancies</span>
                  </div>
                  <div className="flex items-center text-slate-600 text-sm">
                    <Calendar size={16} className="mr-3 text-slate-400" />
                    <span className="font-medium">Starts: <span className="font-bold text-slate-900">{new Date(ad.application_start_date).toLocaleDateString()}</span></span>
                  </div>
                  <div className="flex items-center text-slate-600 text-sm">
                    <Calendar size={16} className="mr-3 text-slate-400" />
                    <span className="font-medium">Ends: <span className="font-bold text-red-600">{new Date(ad.application_end_date).toLocaleDateString()}</span></span>
                  </div>
                  <div className="flex items-center text-slate-600 text-sm">
                     <MapPin size={16} className="mr-3 text-slate-400" />
                     <span className="font-medium">Academic Year: <span className="font-bold text-slate-900">{ad.academic_year}</span></span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                   {(() => {
                     const existingApplication = myApplications?.find(app => app.advertisement_id === ad.id);
                     if (existingApplication && existingApplication.status !== 'DRAFT') {
                       return (
                         <Button 
                           disabled
                           className="w-full bg-emerald-50 text-emerald-600 rounded-xl py-3 font-bold flex items-center justify-center cursor-not-allowed opacity-100 hover:bg-emerald-50"
                         >
                           <CheckCircle className="mr-2" size={18} /> Applied
                         </Button>
                       );
                     }
                     if (existingApplication?.status === 'DRAFT') {
                       return (
                         <Button 
                           onClick={() => window.location.href = '/candidate/applications'}
                           className="w-full bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl py-3 font-bold flex items-center justify-center transition-colors"
                         >
                           <Briefcase className="mr-2" size={18} /> Resume Draft
                         </Button>
                       );
                     }
                     return (
                       <Button 
                         onClick={() => handleApplyClick(ad)}
                         className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 font-bold flex items-center justify-center transition-colors"
                       >
                          Apply Now <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                       </Button>
                     );
                   })()}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="w-10 h-10 p-0 rounded-xl flex items-center justify-center border-slate-200"
              >
                <ChevronLeft size={18} />
              </Button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setPage(i + 1)} 
                    className={cn(
                      "w-10 h-10 rounded-xl text-sm font-bold transition-all",
                      page === i + 1 
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                        : "hover:bg-slate-100 text-slate-500"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
                className="w-10 h-10 p-0 rounded-xl flex items-center justify-center border-slate-200"
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 p-20 text-center min-h-[400px]">
           <Briefcase size={64} className="text-slate-300 mb-6" />
           <h3 className="text-2xl font-bold text-slate-900 mb-2">No Active Advertisements</h3>
           <p className="text-slate-500 font-medium max-w-md">There are currently no live job advertisements. Please check back later for new opportunities.</p>
        </div>
      )}

      {/* Job Application Flow Overlay */}
      {showApplyFlow && selectedAd && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <JobApplicationFlow 
            advertisementId={selectedAd.id} 
            advertisementTitle={`${selectedAd.course_name} at ${selectedAd.institution_name}`}
            onClose={() => {
              setShowApplyFlow(false);
              setSelectedAd(null);
              dispatch(getMyApplications({ skip: 0, limit: 100 }));
            }} 
          />
        </div>
      )}
    </div>
  );
};

export default CandidateAdsPage;
