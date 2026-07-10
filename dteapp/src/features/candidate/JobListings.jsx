import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, MapPin, Clock, Briefcase, Filter, ArrowRight, BookOpen, Building2 } from 'lucide-react';
import { fetchPublishedAds } from '../admin/advertisementSlice';
import { getMyApplications } from './applicationSlice';
import { Button, Input } from '../../components/common/UIComponents';
import JobApplicationFlow from './JobApplicationFlow';
import { cn } from '../../utils/cn';

const JobListings = () => {
  const dispatch = useDispatch();
  const { publishedList = [], loading } = useSelector(state => state.ads);
  const { myApplications = [] } = useSelector(state => state.application);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [showApplyFlow, setShowApplyFlow] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);

  useEffect(() => {
    dispatch(fetchPublishedAds({}));
    dispatch(getMyApplications({ skip: 0, limit: 100 }));
  }, [dispatch]);

  const subjects = ['All', ...new Set(publishedList.map(ad => ad.course_name))];
  
  const appliedAdIds = new Set(myApplications.map(app => String(app.advertisement_id)));

  const filteredAds = publishedList.filter(ad => {
    const matchesSearch = ad.course_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         ad.institution_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || ad.course_name === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Explore Opportunities</h1>
          <p className="text-slate-500 font-medium text-sm">Find your next teaching role across Maharashtra's premier institutes.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by subject or college..." 
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filteredAds.map((ad) => {
          const isApplied = appliedAdIds.has(String(ad.id));
          
          return (
            <div key={ad.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BookOpen size={28} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {ad.vacancy_count} Openings
                    </span>
                    {isApplied && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Applied
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                    Lecturer in {ad.course_name}
                  </h3>
                  <p className="text-slate-500 font-bold text-xs mt-2 flex items-center">
                    <Building2 size={14} className="mr-1.5" /> {ad.institution_name}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center text-slate-400 text-xs font-medium">
                    <MapPin size={14} className="mr-1" />
                    <span>Multiple Locations</span>
                  </div>
                  <div className="flex items-center text-slate-400 text-xs font-medium">
                    <Clock size={14} className="mr-1" />
                    <span>Deadline: {new Date(ad.application_end_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button 
                  className={cn(
                    "w-full h-12 rounded-2xl text-sm font-black transition-all group/btn",
                    isApplied ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                  )}
                  disabled={isApplied}
                  onClick={() => {
                    setSelectedAd(ad);
                    setShowApplyFlow(true);
                  }}
                >
                  {isApplied ? 'Already Applied' : (
                    <div className="flex items-center justify-center">
                      Apply Now <ArrowRight size={18} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
              </div>
            </div>
          );
        })}

        {filteredAds.length === 0 && !loading && (
          <div className="col-span-2 py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-black text-slate-700">No matches found</h3>
            <p className="text-slate-500 font-medium">Try adjusting your filters or search keywords.</p>
          </div>
        )}
      </div>

      {showApplyFlow && selectedAd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <JobApplicationFlow 
            advertisementId={selectedAd.id} 
            advertisementTitle={`Lecturer in ${selectedAd.course_name}`}
            onSuccess={() => {
              dispatch(getMyApplications({ skip: 0, limit: 100 }));
              setShowApplyFlow(false);
            }}
            onClose={() => {
              setShowApplyFlow(false);
              setSelectedAd(null);
            }} 
          />
        </div>
      )}
    </div>
  );
};

export default JobListings;
