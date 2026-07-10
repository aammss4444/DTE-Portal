import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Sparkles, Building2, Calendar, AlertTriangle, ShieldCheck, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchInstitutions } from './institutionSlice';
import { validateInstitutionalRequirements } from './requirementSlice';
import { Button } from '../../components/common/UIComponents';

const AIValidationDashboard = () => {
  const dispatch = useDispatch();
  const { user, role } = useSelector((state) => state.auth);
  const { institutions = [], loading: instLoading } = useSelector((state) => state.institutions);
  const { validationResult, validationLoading, error } = useSelector((state) => state.requirements);

  const [selectedInst, setSelectedInst] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [expandedCourseId, setExpandedCourseId] = useState(null);

  useEffect(() => {
    if (role === 'ADMIN') {
      dispatch(fetchInstitutions({ page: 1, limit: 100 }));
    } else if (role === 'PRINCIPAL' && user?.institution_id) {
      setSelectedInst(user.institution_id.toString());
    }
  }, [dispatch, role, user]);

  const handleRunAudit = () => {
    if (!selectedInst) return;
    dispatch(validateInstitutionalRequirements({
      institution_id: parseInt(selectedInst),
      academic_year: academicYear
    }));
  };

  const selectedInstName = institutions.find(i => i.id === parseInt(selectedInst))?.name || 'Your Institution';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-foreground shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-indigo-600">
          <Sparkles size={120} />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-6">
            <Sparkles size={14} className="text-indigo-600" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">Intelligent Auditor</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">
            Institutional <span className="text-indigo-600">AI Audit</span>
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed font-medium">
            Analyze faculty requirements across your entire institution with deep heuristic modeling and normative compliance detection.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-transparent opacity-20"></div>
      </div>

      {/* Control Panel */}
      <div className="bg-background rounded-2xl border border-border shadow-sm p-6 flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
          {role === 'ADMIN' && (
            <div className="flex-1 md:max-w-xs">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 flex items-center">
                <Building2 size={14} className="mr-1.5" /> Select Institution
              </label>
              <select 
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                value={selectedInst}
                onChange={(e) => setSelectedInst(e.target.value)}
              >
                <option value="">Select Institution...</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex-1 md:max-w-[200px]">
            <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 flex items-center">
              <Calendar size={14} className="mr-1.5" /> Academic Year
            </label>
            <select 
              className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            >
              <option value="2026-27">2026-27</option>
              <option value="2025-26">2025-26</option>
            </select>
          </div>
        </div>

        <Button 
          variant="primary" 
          onClick={handleRunAudit}
          disabled={!selectedInst || validationLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-md h-11 px-8 w-full md:w-auto whitespace-nowrap"
        >
          {validationLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
              Running Deep AI Analysis...
            </>
          ) : (
            <>
              <Sparkles size={18} className="mr-2" />
              Run Institutional Audit
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start">
          <AlertTriangle className="mr-3 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold">Audit Failed</h4>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {validationResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* AI Institutional Summary */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-indigo-100/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-indigo-900 flex items-center">
                <Sparkles className="text-indigo-600 mr-2" size={20} />
                AI Executive Summary
              </h2>
              <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full border border-indigo-100 shadow-sm">
                <span className="text-xs font-bold text-secondary uppercase">Confidence</span>
                <span className={`text-sm font-bold ${
                  validationResult.ai_analysis?.confidence_score > 0.8 ? 'text-emerald-600' :
                  validationResult.ai_analysis?.confidence_score > 0.5 ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {Math.round((validationResult.ai_analysis?.confidence_score || 0) * 100)}%
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-indigo-950 font-medium leading-relaxed mb-6">
                {validationResult.ai_analysis?.ai_summary}
              </p>
              
              {validationResult.ai_analysis?.insights?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">Key Insights</h4>
                  <ul className="space-y-2">
                    {validationResult.ai_analysis.insights.map((insight, idx) => (
                      <li key={idx} className="flex items-start text-sm text-indigo-800">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 mr-3 shrink-0"></div>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Course-by-Course Anomalies */}
          <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/20">
              <h2 className="text-lg font-bold text-foreground">Course Anomaly Report</h2>
              <p className="text-sm text-secondary mt-1">Detailed breakdown of issues detected across {selectedInstName}'s courses.</p>
            </div>
            
            <div className="divide-y divide-border">
              {validationResult.requirements?.length > 0 ? (
                validationResult.requirements.map(req => {
                  const hasAnomalies = req.anomalies && req.anomalies.length > 0;
                  const isExpanded = expandedCourseId === req.id;
                  
                  return (
                    <div key={req.id} className={`transition-colors ${hasAnomalies ? 'bg-red-50/30' : 'hover:bg-muted/30'}`}>
                      <div 
                        className="p-5 flex items-center justify-between cursor-pointer"
                        onClick={() => hasAnomalies && setExpandedCourseId(isExpanded ? null : req.id)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            hasAnomalies ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            {hasAnomalies ? <AlertTriangle size={18} /> : <ShieldCheck size={18} />}
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground">Requirement #{req.id}</h4>
                            <p className="text-xs text-secondary font-medium uppercase tracking-wide mt-0.5">
                              Computed Faculty: <span className="text-foreground font-bold">{req.computed_required_count}</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          {hasAnomalies ? (
                            <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-md border border-red-200">
                              {req.anomalies.length} Issues Detected
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-200">
                              Verified OK
                            </span>
                          )}
                          {hasAnomalies && (
                            isExpanded ? <ChevronUp size={20} className="text-secondary" /> : <ChevronDown size={20} className="text-secondary" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Anomalies Detail */}
                      {isExpanded && hasAnomalies && (
                        <div className="px-5 pb-5 pt-0">
                          <div className="pl-14 space-y-3">
                            {req.anomalies.map(anomaly => (
                              <div key={anomaly.id} className="bg-white border border-red-100 rounded-xl p-4 shadow-sm">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                                      anomaly.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                                      anomaly.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                                      'bg-amber-400 text-amber-950'
                                    }`}>
                                      {anomaly.severity}
                                    </span>
                                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">{anomaly.type}</span>
                                  </div>
                                </div>
                                <p className="text-sm font-semibold text-foreground mt-3">{anomaly.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center">
                  <Info size={40} className="mx-auto text-secondary/50 mb-4" />
                  <p className="text-secondary font-medium">No requirement data found for validation.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AIValidationDashboard;
