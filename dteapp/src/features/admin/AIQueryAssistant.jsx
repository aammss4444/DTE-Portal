import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Calculator,
  Building2,
  Calendar,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  Info,
  Shield,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap
} from 'lucide-react';
import { askAIAssistant } from './requirementSlice';
import { fetchInstitutions } from './institutionSlice';
import { fetchCourses } from './courseSlice';
import { cn } from '../../utils/cn';

const FacultyRequirementCalculator = () => {
  const dispatch = useDispatch();
  
  // Guard selectors
  const institutionsState = useSelector((state) => state.institutions);
  const coursesState = useSelector((state) => state.courses);
  const requirementsState = useSelector((state) => state.requirements);

  const institutions = institutionsState?.institutions || [];
  const courses = coursesState?.courses || [];
  const aiLoading = requirementsState?.aiLoading || false;
  const error = requirementsState?.error || null;

  const [selectedInst, setSelectedInst] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [result, setResult] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);

  useEffect(() => {
    dispatch(fetchInstitutions({ page: 1, limit: 100 }));
    dispatch(fetchCourses());
  }, [dispatch]);

  const filteredCourses = Array.isArray(courses) 
    ? courses.filter(c => c.institution_id === parseInt(selectedInst))
    : [];

  const handleCalculate = async () => {
    if (!selectedInst) return;
    const payload = {
      query: 'calculate_faculty_requirements',
      institution_id: parseInt(selectedInst),
      context: {
        academic_year: academicYear,
        ...(selectedCourse && { course_id: parseInt(selectedCourse) })
      }
    };
    const res = await dispatch(askAIAssistant(payload));
    if (askAIAssistant.fulfilled.match(res)) {
      setResult(res.payload);
    }
  };

  const data = result?.data;
  const courseSummaries = data?.courses || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Calculator size={20} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Faculty Requirement <span className="text-indigo-600">Calculator</span>
            </h1>
          </div>
          <p className="text-slate-500 font-medium ml-[52px]">AI-assisted rule validation engine for DTE normative compliance.</p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-end gap-6">
          <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center">
              <Building2 size={12} className="mr-1.5" /> Institution
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              value={selectedInst}
              onChange={(e) => {
                setSelectedInst(e.target.value);
                setSelectedCourse('');
                setResult(null);
              }}
            >
              <option value="">Select Institution...</option>
              {Array.isArray(institutions) && institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name} ({inst.code})</option>
              ))}
            </select>
          </div>

          <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center">
              <GraduationCap size={12} className="mr-1.5" /> Course (Optional — leave blank for all)
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer disabled:opacity-40"
              value={selectedCourse}
              onChange={(e) => { setSelectedCourse(e.target.value); setResult(null); }}
              disabled={!selectedInst}
            >
              <option value="">All Courses</option>
              {Array.isArray(filteredCourses) && filteredCourses.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
              ))}
            </select>
          </div>

          <div className="w-full lg:w-48 space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center">
              <Calendar size={12} className="mr-1.5" /> Academic Year
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              value={academicYear}
              onChange={(e) => { setAcademicYear(e.target.value); setResult(null); }}
            >
              <option value="2026-27">2026-27</option>
              <option value="2025-26">2025-26</option>
            </select>
          </div>

          <button
            onClick={handleCalculate}
            disabled={!selectedInst || aiLoading}
            className={cn(
              "h-[52px] px-10 rounded-2xl font-bold text-sm flex items-center justify-center transition-all duration-300 shrink-0",
              selectedInst && !aiLoading
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 cursor-pointer"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            {aiLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Zap size={18} className="mr-2" />
                Calculate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && data ? (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Courses Analyzed</p>
              <p className="text-4xl font-bold text-slate-900">{courseSummaries.length}</p>
              <p className="text-xs text-slate-400 font-bold mt-1">{data.academic_year}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Students Admitted</p>
              <p className="text-4xl font-bold text-slate-900">{data.total_admitted}</p>
              <p className="text-xs text-slate-400 font-bold mt-1">of {data.total_approved} approved</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2">Faculty Required</p>
              <p className="text-4xl font-bold text-indigo-600">{data.total_required}</p>
              <p className="text-xs text-slate-400 font-bold mt-1">As per DTE norms</p>
            </div>
            <div className={cn(
              "rounded-2xl p-6 shadow-sm border",
              data.anomalies?.length > 0 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"
            )}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-60">Anomalies</p>
              <p className="text-4xl font-bold">{data.anomalies?.length || 0}</p>
              <p className="text-xs font-bold mt-1 opacity-60">
                {data.anomalies?.length > 0 ? 'Review required' : 'All normal'}
              </p>
            </div>
          </div>




          {/* Course-by-Course Breakdown */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <h3 className="text-lg font-bold text-slate-900">Suggested Requirement Summary</h3>
              <span className="text-[10px] font-bold bg-indigo-600 text-white px-3 py-1 rounded-full uppercase tracking-widest">Per-Course Breakdown</span>
            </div>

            <div className="divide-y divide-slate-50">
              {courseSummaries.map((c, idx) => (
                <div key={c.course_id} className="group">
                  <div
                    className="flex items-center px-8 py-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                    onClick={() => setExpandedCourse(expandedCourse === idx ? null : idx)}
                  >
                    <div className="flex-1 flex items-center space-x-4">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold",
                        c.ai_status === 'OK' ? 'bg-emerald-500' : 'bg-amber-500'
                      )}>
                        {c.ai_status === 'OK' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{c.course_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{c.level} • Ratio 1:{c.norm_ratio}</p>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-12 mr-8">
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Admitted</p>
                        <p className="text-lg font-bold text-slate-900">{c.actual_admitted}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-indigo-500 font-bold uppercase">Required</p>
                        <p className="text-lg font-bold text-indigo-600">{c.computed_required}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Existing</p>
                        <p className="text-lg font-bold text-slate-900">{c.existing_faculty}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold uppercase" style={{ color: c.vacancy_gap > 0 ? '#dc2626' : '#16a34a' }}>Gap</p>
                        <p className="text-lg font-bold" style={{ color: c.vacancy_gap > 0 ? '#dc2626' : '#16a34a' }}>{c.vacancy_gap}</p>
                      </div>
                    </div>

                    {expandedCourse === idx ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                  </div>

                  {expandedCourse === idx && (
                    <div className="px-8 pb-6 pt-2 bg-slate-50/30 animate-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-white rounded-xl p-4 border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Approved Seats</p>
                          <p className="text-xl font-bold text-slate-900 mt-1">{c.approved_seats}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Actual Admitted</p>
                          <p className="text-xl font-bold text-slate-900 mt-1">{c.actual_admitted}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-slate-100">
                          <p className="text-[10px] text-indigo-500 font-bold uppercase">Computed Required</p>
                          <p className="text-xl font-bold text-indigo-600 mt-1">{c.computed_required}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Norm Ratio</p>
                          <p className="text-xl font-bold text-slate-900 mt-1">1:{c.norm_ratio}</p>
                        </div>
                      </div>

                      {/* Historical Comparison */}
                      {c.historical && (
                        <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-4 mb-4">
                          <Clock size={16} className="text-slate-400" />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-700">Historical Comparison (Previous Year)</p>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                              Previous Required: <span className="font-bold text-slate-900">{c.historical.previous_required_count}</span>
                              {' | '}Previous Admitted: <span className="font-bold text-slate-900">{c.historical.previous_actual_admitted}</span>
                            </p>
                          </div>
                          {c.computed_required > (c.historical?.previous_required_count || 0) ? (
                            <div className="flex items-center text-amber-600 text-xs font-bold">
                              <TrendingUp size={14} className="mr-1" />
                              +{c.computed_required - c.historical.previous_required_count}
                            </div>
                          ) : (
                            <div className="flex items-center text-emerald-600 text-xs font-bold">
                              <TrendingDown size={14} className="mr-1" />
                              {c.computed_required - (c.historical?.previous_required_count || 0)}
                            </div>
                          )}
                        </div>
                      )}

                      {c.anomaly_count > 0 && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                          <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                          <p className="text-xs font-bold text-amber-800">{c.anomaly_count} anomaly(s) flagged for this course. Review the insights panel below for details.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Insights & Anomalies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AI Insights */}
            <div className="bg-slate-950 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 opacity-5">
                <BarChart3 size={180} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-indigo-500/20 border border-indigo-500/30 rounded-lg flex items-center justify-center">
                    <Info className="text-indigo-400" size={16} />
                  </div>
                  <h3 className="text-base font-bold tracking-tight">AI Engine Insights</h3>
                </div>
                <div className="space-y-3">
                  {(data.insights || []).map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></div>
                      <p className="text-sm font-medium text-slate-300">{insight}</p>
                    </div>
                  ))}
                  {(!data.insights || data.insights.length === 0) && (
                    <p className="text-slate-500 italic text-sm">No additional insights for this calculation.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Flagged Anomalies */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  data.anomalies?.length > 0 ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                )}>
                  {data.anomalies?.length > 0 ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Flagged Variations</h3>
              </div>

              {data.anomalies?.length > 0 ? (
                <div className="space-y-3">
                  {data.anomalies.map((a, idx) => (
                    <div key={idx} className={cn(
                      "p-4 rounded-xl border",
                      a.severity === 'CRITICAL' ? 'bg-red-50 border-red-100' : a.severity === 'HIGH' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{a.type?.replace(/_/g, ' ')}</span>
                        <span className={cn(
                          "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                          a.severity === 'CRITICAL' ? 'bg-red-600 text-white' : a.severity === 'HIGH' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
                        )}>{a.severity}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{a.message}</p>
                      {a.recommendation && <p className="text-xs text-slate-500 font-medium mt-2 italic">→ {a.recommendation}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <CheckCircle2 size={40} className="mx-auto mb-3 text-emerald-400" />
                  <p className="text-sm font-bold text-emerald-600">No Abnormal Variations Detected</p>
                  <p className="text-xs font-medium mt-1 text-slate-400">All courses are within normative thresholds.</p>
                </div>
              )}
            </div>
          </div>

          {/* Directorate Approval Banner */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield size={24} className="text-slate-400" />
              <div>
                <p className="text-sm font-bold text-slate-900">Pending Directorate Approval</p>
                <p className="text-xs text-slate-500 font-medium">This is an AI-generated Suggested Requirement Summary. Final approval remains with the Directorate of Technical Education.</p>
              </div>
            </div>
          </div>
        </div>
      ) : !aiLoading && (
        <div className="h-80 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6">
            <Calculator size={32} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Select an Institution to Begin</h3>
          <p className="text-slate-500 font-medium max-w-md mt-2">
            The AI engine will calculate faculty requirements based on intake data, DTE norms, and historical utilization — flagging any abnormal variations for Directorate review.
          </p>
        </div>
      )}
    </div>
  );
};

export default FacultyRequirementCalculator;
