import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Award, 
  CheckCircle2, 
  Loader2, 
  User,
  GraduationCap,
  Calendar
} from 'lucide-react';
import { fetchShortlisted } from './selectionSlice';
import { Button } from '../../components/common/UIComponents';
import { cn } from '../../utils/cn';
import CandidateProfileModal from '../../components/CandidateProfileModal';

const ShortlistedTable = ({ advertisementId, onMarkCandidate, onGenerateRankings }) => {
  const dispatch = useDispatch();
  const { shortlisted, loading } = useSelector((state) => state.selection);
  const [selectedCandidateId, setSelectedCandidateId] = React.useState(null);

  useEffect(() => {
    if (advertisementId) {
      dispatch(fetchShortlisted(advertisementId));
    }
  }, [dispatch, advertisementId]);

  if (loading && shortlisted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-500 font-medium">Loading shortlisted candidates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Interview Marking</h2>
          <p className="text-sm text-slate-500 font-medium">Record scores for candidates who have completed their interviews.</p>
        </div>
        <Button 
          onClick={onGenerateRankings} 
          className="shadow-sm"
        >
          Generate AI Rankings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shortlisted.length === 0 ? (
          <div className="col-span-full py-20 text-center border border-dashed border-slate-200 rounded-[2rem] text-slate-400">
            No candidates have been shortlisted yet.
          </div>
        ) : (
          shortlisted.map((cand) => {
            const hasMarks = cand.interview_total !== null;
            return (
              <div 
                key={cand.application_id}
                className={cn(
                  "relative group bg-white border border-slate-100 rounded-[2rem] p-6 transition-all hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1",
                  hasMarks ? "bg-emerald-50/20 border-emerald-100" : "bg-white"
                )}
                onClick={() => setSelectedCandidateId(cand.candidate_id)}
              >
                {hasMarks && (
                  <div className="absolute top-4 right-4 text-emerald-500 bg-emerald-100 rounded-full p-1 shadow-sm">
                    <CheckCircle2 size={16} />
                  </div>
                )}

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 line-clamp-1">{cand.candidate_name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cand.application_number}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <GraduationCap size={14} className="text-slate-400" />
                    <span>{cand.qualification}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <Calendar size={14} className="text-slate-400" />
                    <span>{cand.experience_years} Years Experience</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score Status</span>
                    <span className={cn(
                      "text-xs font-bold",
                      hasMarks ? "text-emerald-600" : "text-amber-500"
                    )}>
                      {hasMarks ? `Total: ${cand.interview_total}` : 'Pending Entry'}
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    variant={hasMarks ? "ghost" : "primary"}
                    onClick={() => onMarkCandidate(cand)}
                    className="text-xs px-4 py-2"
                  >
                    {hasMarks ? 'Edit Marks' : 'Enter Marks'}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedCandidateId && (
        <CandidateProfileModal 
          candidateId={selectedCandidateId} 
          onClose={() => setSelectedCandidateId(null)} 
        />
      )}
    </div>
  );
};

export default ShortlistedTable;
