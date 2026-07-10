import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, Star, Award, TrendingUp, AlertTriangle, 
  Search, CheckCircle2, ChevronRight, Save, Zap, Building2, 
  Filter, Info, Shield, ArrowRight, Loader2, RefreshCw
} from 'lucide-react';
import { Button, Input } from '../../components/common/UIComponents';
import { fetchPublishedAds } from '../admin/advertisementSlice';
import { 
  fetchShortlisted, shortlistCandidates, enterMarks, 
  generateRankings, fetchRankedList, confirmSelection 
} from './selectionSlice';
import applicationService from '../../services/applicationService';
import { cn } from '../../utils/cn';
import { toast } from 'react-hot-toast';

import ShortlistCandidates from './ShortlistCandidates';
import ShortlistedTable from './ShortlistedTable';
import MarkEntryForm from './MarkEntryForm';
import RankedList from './RankedList';
import SelectionDashboardView from './SelectionDashboardView';
import { BarChart3 } from 'lucide-react';

const SelectionManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { publishedList: adsRaw = [] } = useSelector((state) => state.ads);
  const ads = Array.isArray(adsRaw) ? adsRaw : [];
  const { shortlisted, rankedList, loading, marking, ranking } = useSelector((state) => state.selection);

  const [selectedAdId, setSelectedAdId] = useState('');
  const [activeStep, setActiveStep] = useState(0); // 0: Select Ad, 1: Overview, 2: Shortlist, 3: Marks, 4: Rankings
  const [marks, setMarks] = useState({}); // { application_id: { subject_knowledge: 0, ... } }
  const [selectedCandidateForMarking, setSelectedCandidateForMarking] = useState(null);
  const [isGeneratingRankings, setIsGeneratingRankings] = useState(false);
  const [serverEventMessage, setServerEventMessage] = useState('');

  const institutionId = user?.institution_id;

  useEffect(() => {
    if (institutionId) {
      dispatch(fetchPublishedAds({ institution_id: institutionId, skip: 0, limit: 100 }));
    }
  }, [dispatch, institutionId]);

  useEffect(() => {
    if (selectedAdId) {
      loadStepData();
    }
  }, [selectedAdId, activeStep]);

  const loadStepData = async () => {
    if (activeStep === 3) {
      dispatch(fetchShortlisted(selectedAdId));
    } else if (activeStep === 4) {
      dispatch(fetchRankedList(selectedAdId));
    }
  };

  const handleSaveMarks = async (appId, candId) => {
    const markData = {
      advertisement_id: selectedAdId,
      application_id: appId,
      candidate_id: candId,
      institution_id: institutionId,
      ...marks[appId]
    };
    await dispatch(enterMarks(markData));
    dispatch(fetchShortlisted(selectedAdId)); // Refresh
  };

  const handleMarkChange = (appId, field, value) => {
    setMarks({
      ...marks,
      [appId]: {
        ...(marks[appId] || { subject_knowledge: 0, teaching_aptitude: 0, communication_skills: 0, overall_impression: 0 }),
        [field]: parseFloat(value) || 0
      }
    });
  };

  const handleGenerateRankings = async () => {
    setIsGeneratingRankings(true);
    setServerEventMessage('Initializing AI connection...');
    
    const events = [
      'Fetching candidate data...',
      'Normalizing qualification scores...',
      'Running AI evaluation models...',
      'Cross-referencing interview marks...',
      'Applying experience weights...',
      'Generating final rankings...'
    ];

    for (let i = 0; i < events.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setServerEventMessage(events[i]);
    }

    await dispatch(generateRankings(selectedAdId));
    setIsGeneratingRankings(false);
    setActiveStep(4);
  };

  const handleConfirm = async (remarks) => {
    try {
      await dispatch(confirmSelection({
        advertisementId: selectedAdId,
        remarks: remarks || 'Selection confirmed'
      })).unwrap();
      navigate('/principal/appointments');
    } catch (err) {
      console.error('Failed to confirm selection', err);
    }
  };

  const steps = [
    { label: 'Select Ad', icon: Search },
    { label: 'Overview', icon: BarChart3 },
    { label: 'Shortlist', icon: UserCheck },
    { label: 'Interview Marks', icon: Award },
    { label: 'AI Ranking', icon: TrendingUp },
  ];

  const selectedAd = ads.find(a => a.id === selectedAdId);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Candidate <span className="text-indigo-600">Selection</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Step 5: Interview scoring and intelligent ranking engine.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl">
          <Shield size={16} className="text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Principal Panel</span>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex justify-between max-w-4xl mx-auto px-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeStep === idx;
          const isCompleted = activeStep > idx;
          return (
            <div key={idx} className="flex flex-col items-center gap-2 relative flex-1">
              {idx !== 0 && (
                <div className={cn("absolute h-[2px] w-full right-1/2 top-5 -translate-y-1/2 -z-10", isCompleted ? "bg-emerald-500" : "bg-slate-200")} />
              )}
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110" : 
                isCompleted ? "bg-emerald-500 text-white" : "bg-white border border-slate-200 text-slate-400"
              )}>
                {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
              </div>
              <span className={cn("text-[10px] font-bold uppercase tracking-widest", isActive ? "text-indigo-600" : "text-slate-400")}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[500px]">
        {/* Step 0: Select Ad */}
        {activeStep === 0 && (
          <div className="p-12 flex flex-col items-center text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6">
              <Search size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Select Advertisement</h2>
            <p className="text-slate-500 mb-8 font-medium">Choose the active advertisement you want to manage the selection process for.</p>
            
            <div className="w-full space-y-4">
              {ads.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-200 rounded-3xl text-slate-400">
                  No active published advertisements found.
                </div>
              ) : (
                ads.map(ad => (
                  <button 
                    key={ad.id}
                    onClick={() => { setSelectedAdId(ad.id); setActiveStep(1); }}
                    className="w-full p-6 border border-slate-200 rounded-3xl hover:border-indigo-600 hover:bg-indigo-50/30 transition-all text-left flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600">{ad.course_name}</div>
                      <div className="text-xs text-slate-500 font-medium">{ad.vacancy_count} Vacancies</div>
                    </div>
                    <ArrowRight className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 1: Dashboard View */}
        {activeStep === 1 && (
          <div className="p-8">
            <SelectionDashboardView 
              advertisementId={selectedAdId}
              onStartSelection={() => setActiveStep(2)}
            />
          </div>
        )}

        {/* Step 2: Shortlisting */}
        {activeStep === 2 && (
          <div className="p-8">
            <ShortlistCandidates 
              advertisementId={selectedAdId} 
              onSuccess={() => setActiveStep(3)}
              onSkip={() => setActiveStep(3)}
            />
          </div>
        )}

        {/* Step 3: Marking */}
        {activeStep === 3 && (
          <div className="p-8">
            {selectedCandidateForMarking ? (
              <MarkEntryForm 
                candidate={selectedCandidateForMarking}
                advertisementId={selectedAdId}
                institutionId={institutionId}
                onCancel={() => setSelectedCandidateForMarking(null)}
                onSuccess={() => setSelectedCandidateForMarking(null)}
              />
            ) : (
              <ShortlistedTable 
                advertisementId={selectedAdId}
                onMarkCandidate={(cand) => setSelectedCandidateForMarking(cand)}
                onGenerateRankings={handleGenerateRankings}
              />
            )}
          </div>
        )}

        {/* Step 4: Rankings */}
        {activeStep === 4 && (
          <div className="p-8">
            <RankedList 
              advertisementId={selectedAdId}
              onConfirm={(remarks) => handleConfirm(remarks)}
              onBack={() => setActiveStep(3)}
              isConfirming={loading}
            />
          </div>
        )}
      </div>

      {/* AI Ranking Loader Modal */}
      {isGeneratingRankings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl p-10 max-w-md w-full flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center animate-pulse">
                <Zap className="text-indigo-600 w-10 h-10 animate-bounce" />
              </div>
              <div className="absolute inset-0 border-4 border-indigo-200 rounded-full border-t-indigo-600 animate-spin" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">Generating AI Rankings</h3>
            <p className="text-slate-500 text-sm mb-6">Please wait while our AI models analyze the candidates...</p>
            
            <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-indigo-500 animate-spin flex-shrink-0" />
              <span className="text-sm font-bold text-slate-700 text-left line-clamp-1 flex-1">
                {serverEventMessage}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectionManagement;
