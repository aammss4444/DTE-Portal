import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  BarChart3, 
  PieChart, 
  Users, 
  UserCheck, 
  Award, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  Shield,
  Loader2,
  RefreshCw,
  FileText,
  X
} from 'lucide-react';
import { fetchDashboard } from './selectionSlice';
import { Button } from '../../components/common/UIComponents';
import { cn } from '../../utils/cn';
import applicationService from '../../services/applicationService';
import selectionService from '../../services/selectionService';

const SelectionDashboardView = ({ advertisementId, onStartSelection }) => {
  const dispatch = useDispatch();
  const { dashboard, loading } = useSelector((state) => state.selection);
  
  const [activeSection, setActiveSection] = React.useState(null);
  const [candidatesList, setCandidatesList] = React.useState([]);
  const [listLoading, setListLoading] = React.useState(false);

  const fetchCandidates = async (section) => {
    setActiveSection(section);
    setListLoading(true);
    try {
      if (section === 'Applications Received') {
        const res = await applicationService.getApplications({ advertisement_id: advertisementId });
        setCandidatesList(res.data || []);
      } else if (section === 'Shortlisted for Interview') {
        const res = await selectionService.getShortlisted(advertisementId);
        setCandidatesList(res.data || []);
      } else if (section === 'Interviews Completed') {
        const res = await selectionService.getShortlisted(advertisementId);
        const completed = (res.data || []).filter(c => c.interview_total !== null && c.interview_total !== undefined);
        setCandidatesList(completed);
      }
    } catch (err) {
      console.error(err);
      setCandidatesList([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (advertisementId) {
      dispatch(fetchDashboard(advertisementId));
    }
  }, [dispatch, advertisementId]);

  if (loading && !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-500 font-medium">Loading advanced dashboard...</p>
      </div>
    );
  }

  if (!dashboard) return null;

  const stats = [
    { label: 'Applications Received', value: dashboard.total_applications, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Applicants', value: dashboard.total_applications, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Shortlisted for Interview', value: dashboard.shortlisted_count, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Interviews Completed', value: dashboard.marked_count, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Selection <span className="text-indigo-600">Intelligence</span></h2>
          <p className="text-sm text-slate-500 font-medium">Real-time oversight of candidates, scores, and ranking integrity.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => dispatch(fetchDashboard(advertisementId))} className="p-2 border-slate-200">
            <RefreshCw size={18} className={cn(loading && "animate-spin")} />
          </Button>
          <Button onClick={onStartSelection} className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm">
            Enter Selection Workflow
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", stat.bg, stat.color)}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Insights */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                   <TrendingUp size={20} className="text-indigo-600" />
                   Selection Funnel
                </h3>
                <span className="text-xs font-medium text-slate-400">Advertisement Lifecycle Status: <span className="text-indigo-600 font-bold uppercase">{dashboard.status}</span></span>
             </div>
             
             {/* Simple Funnel Visualization */}
             <div className="space-y-6">
                {[
                  { label: 'Applications Received', count: dashboard.total_applications, color: 'bg-slate-100', text: 'text-slate-600' },
                  { label: 'Shortlisted for Interview', count: dashboard.shortlisted_count, color: 'bg-indigo-100', text: 'text-indigo-600' },
                  { label: 'Interviews Completed', count: dashboard.marked_count, color: 'bg-emerald-100', text: 'text-emerald-600' },
                ].map((item, idx) => (
                  <div key={idx} className="relative cursor-pointer" onClick={() => fetchCandidates(item.label)}>
                    <div className={cn("h-16 rounded-2xl flex items-center px-8 transition-all hover:scale-[1.01] hover:shadow-md", item.color)}>
                       <div className="flex-1">
                          <span className={cn("text-[10px] font-bold uppercase tracking-widest", item.text)}>{item.label}</span>
                          <p className="text-xl font-bold text-slate-900">{item.count} Candidates</p>
                       </div>
                       <div className="text-slate-400">
                          <ChevronRight size={24} />
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Candidates Modal */}
      {activeSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActiveSection(null)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{activeSection}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  {listLoading ? 'Loading...' : `${candidatesList.length} candidate(s)`}
                </p>
              </div>
              <button onClick={() => setActiveSection(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              {listLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
              ) : candidatesList.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 font-medium">No candidates found in this stage.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {candidatesList.map((c, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                          {c.candidate_name ? c.candidate_name.charAt(0) : c.first_name ? c.first_name.charAt(0) : '?'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{c.candidate_name || `${c.first_name} ${c.last_name}`}</p>
                          <p className="text-xs font-semibold text-slate-500">{c.application_number || c.course_name}</p>
                        </div>
                      </div>
                      {c.interview_total !== undefined && c.interview_total !== null && (
                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Score</span>
                          <p className="font-bold text-emerald-600">{c.interview_total}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const ChevronRight = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

export default SelectionDashboardView;
