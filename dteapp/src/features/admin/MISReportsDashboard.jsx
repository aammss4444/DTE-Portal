import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  BarChart3, 
  Download, 
  Filter, 
  TrendingUp, 
  FilePieChart, 
  Users, 
  Activity, 
  Building2,
  Calendar,
  Loader2,
  PieChart as PieChartIcon,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button, Select } from '../../components/common/UIComponents';
import { fetchAttendanceReport, fetchBillingReport, fetchPerformanceReport } from './reportSlice';
import { fetchInstitutions } from './institutionSlice';
import { cn } from '../../utils/cn';

const MISReportsDashboard = () => {
  const dispatch = useDispatch();
  const { attendanceData, billingData, performanceData, loading } = useSelector((state) => state.reports);
  const { institutions } = useSelector((state) => state.institutions);

  const [activeReport, setActiveReport] = useState('attendance');
  const [selectedInst, setSelectedInst] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026-2027');

  useEffect(() => {
    if (institutions.length === 0) {
      dispatch(fetchInstitutions({ page: 1, limit: 100 }));
    }
  }, [dispatch, institutions.length]);

  useEffect(() => {
    const params = { institution_id: selectedInst, academic_year: selectedYear };
    if (activeReport === 'attendance') dispatch(fetchAttendanceReport(params));
    if (activeReport === 'billing') dispatch(fetchBillingReport(params));
    if (activeReport === 'performance') dispatch(fetchPerformanceReport(params));
  }, [dispatch, activeReport, selectedInst, selectedYear]);

  const SummaryCard = ({ label, value, trend, icon: Icon, color }) => (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-2xl", color)}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center">
            <TrendingUp size={10} className="mr-1" /> {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{label}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            MIS <span className="text-indigo-600">Analytics</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Comprehensive institutional performance reporting and data visualization.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl font-black border-slate-200 text-slate-500 flex items-center">
            <Download size={18} className="mr-2" />
            EXPORT PDF
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 flex items-center px-8">
            <Download size={18} className="mr-2" />
            EXCEL DATA
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Filter size={28} />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Focus Institution</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-black outline-none focus:border-indigo-500 appearance-none cursor-pointer"
              value={selectedInst}
              onChange={(e) => setSelectedInst(e.target.value)}
            >
              <option value="">All Institutions</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          </div>
          <div className="w-full lg:w-48">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Academic Session</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-black outline-none focus:border-indigo-500 appearance-none cursor-pointer"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2026-2027">2026-2027</option>
              <option value="2025-2026">2025-2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex space-x-1 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {[
          { id: 'attendance', label: 'Attendance Audit', icon: Calendar },
          { id: 'billing', label: 'Financial Audit', icon: BarChart3 },
          { id: 'performance', label: 'Faculty Performance', icon: Activity }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveReport(tab.id)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeReport === tab.id ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
           {loading ? (
             <div className="h-[500px] bg-white border border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center space-y-4">
                <Loader2 size={48} className="animate-spin text-indigo-500" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Synthesizing Analytics...</p>
             </div>
           ) : (
             <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm min-h-[500px]">
                <div className="flex items-center justify-between mb-10">
                   <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight capitalize">{activeReport} Analysis Report</h2>
                      <p className="text-xs font-bold text-slate-400 mt-1">Detailed statistical breakdown for selected parameters.</p>
                   </div>
                   <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl">
                      <FilePieChart size={18} />
                      <span className="text-xs font-black uppercase tracking-widest">Live Sync</span>
                   </div>
                </div>

                {/* Simulated Chart/Table Area */}
                <div className="space-y-6">
                   <div className="h-64 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 flex items-center justify-center">
                      <p className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center">
                         <PieChartIcon size={16} className="mr-2" /> Visualization Engine Active
                      </p>
                   </div>
                   
                   <div className="overflow-hidden border border-slate-100 rounded-2xl">
                      <table className="w-full text-left border-collapse text-xs">
                         <thead className="bg-slate-900 text-white">
                            <tr>
                               <th className="px-6 py-4 font-black uppercase tracking-widest opacity-60">Parameter</th>
                               <th className="px-6 py-4 font-black uppercase tracking-widest opacity-60 text-center">Value</th>
                               <th className="px-6 py-4 font-black uppercase tracking-widest opacity-60 text-right">Health Status</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50 font-bold text-slate-600">
                            {[
                              { p: 'Verification Accuracy', v: '99.4%', s: 'Optimal', c: 'text-emerald-500' },
                              { p: 'System Anomaly Rate', v: '0.2%', s: 'Low', c: 'text-emerald-500' },
                              { p: 'Compliance Score', v: '97.8%', s: 'Optimal', c: 'text-emerald-500' },
                              { p: 'Reporting Latency', v: '4ms', s: 'Exceptional', c: 'text-indigo-500' }
                            ].map((row, i) => (
                              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                 <td className="px-6 py-4">{row.p}</td>
                                 <td className="px-6 py-4 text-center font-black text-slate-900">{row.v}</td>
                                 <td className={cn("px-6 py-4 text-right", row.c)}>{row.s}</td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
           <SummaryCard label="Total Verification" value="9,482" trend="+12.4%" icon={CheckCircle2} color="bg-emerald-500 shadow-emerald-200 shadow-lg" />
           <SummaryCard label="Pending Audits" value="48" icon={AlertCircle} color="bg-rose-500 shadow-rose-200 shadow-lg" />
           <SummaryCard label="Avg. Efficiency" value="96%" trend="+2.1%" icon={Activity} color="bg-indigo-500 shadow-indigo-200 shadow-lg" />
           
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <TrendingUp size={20} className="text-indigo-400" />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-widest">Growth Index</h4>
              </div>
              <p className="text-3xl font-black italic tracking-tighter">11.2%</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 leading-relaxed">
                 Institutional efficiency increased by 11.2% since AI deployment.
              </p>
              <div className="mt-8 pt-8 border-t border-white/10">
                 <button className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors flex items-center">
                    VIEW DETAILED LOGS <Search size={14} className="ml-2" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MISReportsDashboard;
