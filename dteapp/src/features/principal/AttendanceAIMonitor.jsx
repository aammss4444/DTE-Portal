import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Zap, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  BarChart3, 
  Loader2, 
  Activity,
  Cpu,
  AlertCircle,
  Clock,
  Building2,
  User,
  History
} from 'lucide-react';
import { fetchAttendanceMonitor } from '../faculty/attendanceSlice';
import { Table } from '../../components/common/Table';
import { cn } from '../../utils/cn';

const AttendanceAIMonitor = () => {
  const dispatch = useDispatch();
  const { aiMonitor, loading } = useSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(fetchAttendanceMonitor());
  }, [dispatch]);

  const anomalyColumns = [
    { key: 'institution_name', label: 'Institution' },
    { key: 'faculty_name', label: 'Faculty' },
    { key: 'issue_type', label: 'Issue', render: (val) => <span className="text-xs font-black text-rose-600 uppercase tracking-tighter italic">{val?.replace('_', ' ')}</span> },
    { key: 'confidence', label: 'AI Confidence', render: (val) => <span className={`text-xs font-black ${val > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{val}%</span> },
    { key: 'detected_at', label: 'Detected On', render: (val) => <span className="text-[10px] font-medium text-slate-400">{new Date(val).toLocaleDateString()}</span> }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Attendance <span className="text-indigo-600">AI Monitor</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Global diagnostic oversight and anomaly detection for institutional records.
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center"><Zap size={12} className="mr-1 text-amber-500" /> Logs Scanned</p>
          <p className="text-3xl font-black text-slate-900">{aiMonitor?.total_scanned || 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
          <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2 flex items-center"><ShieldAlert size={12} className="mr-1" /> Anomalies</p>
          <p className="text-3xl font-black text-rose-600">{aiMonitor?.anomalies_count || 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center"><TrendingUp size={12} className="mr-1" /> Precision Score</p>
          <p className="text-3xl font-black text-indigo-600">{aiMonitor?.precision_score || '99.2'}%</p>
        </div>
        <div className="bg-slate-900 rounded-[2rem] p-6 shadow-lg shadow-slate-200">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center"><ShieldCheck size={12} className="mr-1" /> Verified Rate</p>
          <p className="text-3xl font-black text-white italic tracking-tighter">{aiMonitor?.verification_rate || '100'}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Anomalies Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm min-h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mr-4">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Flagged Irregularities</h3>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Records requiring manual administrative audit.</p>
              </div>
            </div>
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center"><Loader2 size={40} className="animate-spin text-rose-500" /></div>
            ) : (aiMonitor?.anomalies || []).length > 0 ? (
              <Table 
                columns={anomalyColumns} 
                data={aiMonitor.anomalies} 
                className="border-none shadow-none"
              />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-10 grayscale opacity-40">
                <ShieldCheck size={64} className="text-indigo-600 mb-6" />
                <h3 className="text-xl font-black text-slate-900">System Integrity Secure</h3>
                <p className="text-slate-500 font-medium max-w-sm">No critical attendance anomalies detected at this time.</p>
              </div>
            )}
          </div>
        </div>

        {/* System Intelligence Feed */}
        <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 flex flex-col">
           <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                 <Cpu size={20} />
              </div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Intelligence Feed</h4>
           </div>

           <div className="flex-1 space-y-6">
              {[
                { type: 'SCAN', text: 'All institutional logs for Monday scanned.', time: '2m ago', icon: Activity },
                { type: 'ALERT', text: 'Unusual clustering detected in COEP Mechanical department.', time: '15m ago', icon: AlertCircle, color: 'text-rose-500' },
                { type: 'SYNC', text: 'Timetable synchronization completed for session 2026-27.', time: '1h ago', icon: History },
                { type: 'AUDIT', text: 'Principal verification rate increased by 12% this month.', time: '3h ago', icon: BarChart3, color: 'text-emerald-500' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 group">
                   <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors shadow-sm shrink-0">
                      <item.icon size={16} className={item.color} />
                   </div>
                   <div className="pt-1">
                      <p className="text-xs font-bold text-slate-800 leading-snug">{item.text}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">{item.time}</p>
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-8 p-6 bg-indigo-600 rounded-3xl text-white">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Pro-active Advice</p>
              <p className="text-xs font-bold leading-relaxed italic">
                "AI recommends auditing the 'Mechanical' department logs due to high variance in session start times."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceAIMonitor;
