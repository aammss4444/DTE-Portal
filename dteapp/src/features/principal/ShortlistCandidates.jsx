import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  UserCheck, 
  Search, 
  CheckCircle2, 
  Zap, 
  Loader2,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../components/common/UIComponents';
import { shortlistCandidates } from './selectionSlice';
import applicationService from '../../services/applicationService';
import { cn } from '../../utils/cn';

const ShortlistCandidates = ({ advertisementId, onSuccess, onSkip }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [shortlisting, setShortlisting] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (advertisementId) {
      loadCandidates();
    }
  }, [advertisementId]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await applicationService.getApplications({ 
        advertisement_id: advertisementId, 
        status: 'SUBMITTED,UNDER_REVIEW' 
      });
      setCandidates(data.items || []);
    } catch (err) {
      // Error handled by service/interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async () => {
    if (selectedIds.length === 0) return;
    setShortlisting(true);
    try {
      await dispatch(shortlistCandidates({
        advertisementId,
        applicationIds: selectedIds,
        remarks: 'Shortlisted for interviews'
      })).unwrap();
      if (onSuccess) onSuccess();
    } catch (err) {
      // toast handled in slice
    } finally {
      setShortlisting(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(candidates.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const isAllSelected = candidates.length > 0 && selectedIds.length === candidates.length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-500 font-medium">Fetching applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Applied Candidates</h2>
          <p className="text-sm text-slate-500 font-medium">Review and select candidates for the interview phase.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onSkip} className="bg-black text-white border border-slate-800 hover:bg-slate-900 shadow-sm">
            View Marking Table
          </Button>
          <Button 
            disabled={selectedIds.length === 0 || shortlisting} 
            onClick={handleShortlist}
            className="min-w-[200px] shadow-sm"
          >
            {shortlisting ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <Zap size={16} className="mr-2" />
            )}
            Shortlist Selected ({selectedIds.length})
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-100">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <th className="py-4 px-6 w-10 text-center">
                <input 
                  type="checkbox" 
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="py-4 px-6">Candidate Details</th>
              <th className="py-4 px-6">Academic Summary</th>
              <th className="py-4 px-6 text-center">AI Match Score</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {candidates.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-24 text-center">
                   <div className="flex flex-col items-center text-slate-400">
                      <Search size={48} className="mb-4 opacity-20" />
                      <p className="font-medium italic text-lg text-slate-500">All applications processed.</p>
                      <p className="text-sm mt-1 mb-6">Your shortlist is ready. Proceed to interview scoring.</p>
                      <Button onClick={onSkip} className="bg-black text-white border border-slate-800 hover:bg-slate-900 shadow-sm">
                        Proceed to Interview Marks
                        <ArrowRight size={16} className="ml-2" />
                      </Button>
                   </div>
                </td>
              </tr>
            ) : (
              candidates.map(cand => (
                <tr key={cand.id} className="group hover:bg-indigo-50/30 transition-colors">
                  <td className="py-5 px-6 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(cand.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds([...selectedIds, cand.id]);
                        else setSelectedIds(selectedIds.filter(id => id !== cand.id));
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="py-5 px-6">
                    <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{cand.candidate_name}</div>
                    <div className="text-xs text-slate-500 font-medium">{cand.application_number}</div>
                  </td>
                  <td className="py-5 px-6 text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold uppercase tracking-tight">{cand.qualification}</span>
                      <span>{cand.experience_years} Years Experience</span>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                     <div className="flex flex-col items-center gap-1">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={cn(
                            "h-full transition-all duration-1000",
                            cand.ai_confidence_score > 70 ? "bg-emerald-500" : "bg-amber-500"
                          )} style={{ width: `${cand.ai_confidence_score || 0}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{cand.ai_confidence_score || 0}% Fit</span>
                     </div>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center gap-1 ml-auto group/btn">
                      View Profile <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShortlistCandidates;
