import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Trophy, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  User,
  ShieldCheck,
  RefreshCw,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { Button } from '../../components/common/UIComponents';
import { fetchRankedList, generateRankings } from './selectionSlice';
import { cn } from '../../utils/cn';

const RankedList = ({ advertisementId, onConfirm, onBack, isConfirming }) => {
  const dispatch = useDispatch();
  const { rankedList, loading } = useSelector((state) => state.selection);

  useEffect(() => {
    if (advertisementId) {
      dispatch(fetchRankedList(advertisementId));
    }
  }, [dispatch, advertisementId]);

  const [remarks, setRemarks] = React.useState('Panel approved the final ranking.');

  const handleConfirmClick = () => {
    onConfirm(remarks);
  };

  const handleRefresh = async () => {
    await dispatch(generateRankings(advertisementId)).unwrap();
    dispatch(fetchRankedList(advertisementId));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            AI-Powered <span className="text-indigo-600">Selection Matrix</span>
            <Sparkles size={20} className="text-amber-400 fill-amber-400" />
          </h2>
          <p className="text-sm text-slate-500 font-medium">Results generated based on academic scores, experience, and interview performance.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={loading} className="p-2 border-slate-200">
            <RefreshCw size={18} className={cn(loading && "animate-spin")} />
          </Button>
          <Button variant="outline" onClick={onBack} className="border-slate-200">
            Back to Marking
          </Button>
          <Button 
            variant="primary"
            onClick={handleConfirmClick} 
            disabled={isConfirming}
            className="shadow-sm disabled:opacity-70 bg-black hover:bg-slate-900 active:scale-[0.98] text-white font-medium border border-slate-800 transition-all"
          >
            {isConfirming ? (
              <RefreshCw size={18} className="mr-2 animate-spin" />
            ) : (
              <ShieldCheck size={18} className="mr-2" />
            )}
            {isConfirming ? 'Confirming...' : 'Lock & Confirm Selection'}
          </Button>
        </div>
      </div>

      {/* Confirmation Remarks Bar */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-4 flex items-center gap-4">
        <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">
           <Award size={20} />
        </div>
        <div className="flex-1">
           <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Confirmation Remarks</p>
           <input 
             type="text" 
             value={remarks}
             onChange={(e) => setRemarks(e.target.value)}
             className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-emerald-900 placeholder:text-emerald-300"
             placeholder="Add final panel remarks here..."
           />
        </div>
      </div>

      {loading && rankedList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-slate-500 font-medium">Recalculating AI rankings...</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-4">
          {rankedList.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 italic font-medium">
              Rank list is currently empty.
            </div>
          ) : (
            rankedList.map((cand, idx) => (
              <div 
                key={cand.application_id}
                className={cn(
                  "relative overflow-hidden p-6 border rounded-[2rem] flex flex-col gap-4 transition-all hover:scale-[1.01]",
                  cand.result_status === 'SELECTED' ? "border-emerald-200 bg-emerald-50/30 ring-1 ring-emerald-100 shadow-sm" : 
                  cand.result_status === 'WAITLISTED' ? "border-amber-200 bg-amber-50/20" : "border-slate-100 bg-white"
                )}
              >
                {/* Status Indicator Bar */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1.5",
                  cand.result_status === 'SELECTED' ? "bg-emerald-500" : 
                  cand.result_status === 'WAITLISTED' ? "bg-amber-400" : "bg-slate-200"
                )} />

                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm transition-transform",
                      idx === 0 ? "bg-amber-400 text-white rotate-3" : 
                      idx === 1 ? "bg-slate-300 text-white -rotate-3" : 
                      idx === 2 ? "bg-orange-300 text-white rotate-2" : "bg-slate-50 text-slate-400"
                    )}>
                      {idx === 0 ? <Trophy size={28} /> : cand.rank}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                         <h3 className="font-bold text-slate-900 text-lg">{cand.candidate_name}</h3>
                         {idx === 0 && <span className="bg-amber-100 text-amber-700 text-[8px] font-bold uppercase px-2 py-0.5 rounded-full tracking-widest">Topper</span>}
                      </div>
                      <div className="text-xs text-slate-500 font-medium flex items-center gap-3">
                         <span>Score: <span className="text-slate-900 font-bold">{cand.final_score}</span></span>
                         <span className="w-1 h-1 bg-slate-300 rounded-full" />
                         <span>APP #{cand.application_id.slice(0,6).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={cn(
                      "px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm",
                      cand.result_status === 'SELECTED' ? "bg-emerald-500 text-white" : 
                      cand.result_status === 'WAITLISTED' ? "bg-amber-400 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      {cand.result_status}
                    </span>
                    {cand.waitlist_position && (
                      <span className="text-[10px] font-bold text-amber-600">Position #{cand.waitlist_position}</span>
                    )}
                  </div>
                </div>

                {/* AI Rationale Section */}
                {(cand.score_breakdown?.reasons?.length > 0 || cand.score_breakdown?.reason) && (
                  <div className="pl-[5.5rem] pr-4">
                    <div className="bg-white/60 rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles size={14} className="text-indigo-500" /> AI Selection Rationale
                      </h4>
                      <ul className="space-y-1.5">
                        {cand.score_breakdown?.reasons && cand.score_breakdown.reasons.length > 0 ? (
                          cand.score_breakdown.reasons.map((r, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                              <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                              <span>{r}</span>
                            </li>
                          ))
                        ) : (
                          <li className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                            <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                            <span>{cand.score_breakdown.reason}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Principal Interview Remarks Section */}
                {cand.remarks && (
                  <div className="pl-[5.5rem] pr-4 pb-4">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <MessageSquare size={14} className="text-indigo-400" /> Principal Interview Notes
                      </h4>
                      <p className="text-sm text-slate-700 italic">"{cand.remarks}"</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RankedList;
