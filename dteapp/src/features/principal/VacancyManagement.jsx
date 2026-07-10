import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Briefcase,
  Building2,
  Calendar,
  AlertTriangle,
  Search,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Users,
  Info,
  Shield,
  Lock,
  Sparkles
} from 'lucide-react';
import { fetchInstitutions } from '../admin/institutionSlice';
import { fetchCourses } from '../admin/courseSlice';
import { fetchVacancyAssessment, clearAssessment, suggestVacancy, confirmVacancy, runAIAnalysis, acknowledgeAnomaly } from '../admin/vacancySlice';
import { Button } from '../../components/common/UIComponents';
import Stepper from '../../components/common/Stepper';
import { cn } from '../../utils/cn';
import { toast } from 'react-hot-toast';

const VacancyManagement = () => {
  const dispatch = useDispatch();
  const { user, role } = useSelector((state) => state.auth);
  const { institutions = [] } = useSelector((state) => state.institutions);
  const { courses = [] } = useSelector((state) => state.courses);
  const { assessment, loading, suggesting, confirming, error } = useSelector((state) => state.vacancy);

  const [selectedCourse, setSelectedCourse] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const unacknowledgedHighAnomalies = assessment?.anomalies?.filter(
    a => a.severity === 'HIGH' && !a.is_acknowledged
  ) || [];

  // Principal's institution is auto-locked
  const institutionId = user?.institution_id;
  const currentInstitution = institutions.find(i => i.id === institutionId);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const steps = [
    { label: 'Intake & Norms', description: 'Step 1: Configuration' },
    { label: 'Gap Analysis', description: 'Step 2: Identification' },
    { label: 'Advertisement', description: 'Step 3: Generation' },
  ];

  useEffect(() => {
    dispatch(fetchInstitutions({ page: 1, limit: 100 }));
    if (institutionId) {
      dispatch(fetchCourses({ institutionId }));
    }
  }, [dispatch, institutionId]);

  const handleLoadAssessment = async () => {
    if (!institutionId || !selectedCourse) return;

    const result = await dispatch(fetchVacancyAssessment({
      institution_id: institutionId,
      course_id: selectedCourse,
      academic_year: academicYear
    }));

    const payloadData = result?.payload?.data;
    const fetchedAssessment = payloadData !== undefined ? payloadData : result?.payload;
    
    const isDraft = fetchVacancyAssessment.fulfilled.match(result) && fetchedAssessment?.status === 'DRAFT';
    const isNotFound = fetchVacancyAssessment.rejected.match(result) ||
      (fetchVacancyAssessment.fulfilled.match(result) && !fetchedAssessment);

    if (isNotFound || isDraft) {
      dispatch(suggestVacancy({
        institution_id: parseInt(institutionId),
        course_id: parseInt(selectedCourse),
        academic_year: academicYear
      }));
    }
  };

  const handleAIAnalysis = () => {
    if (!institutionId || !selectedCourse) return;
    dispatch(runAIAnalysis({
      institution_id: parseInt(institutionId),
      course_id: parseInt(selectedCourse),
      academic_year: academicYear
    }));
  };

  const handleConfirm = async () => {
    if (!assessment) return;

    const instId = assessment.institution_id || parseInt(institutionId);
    const courseId = assessment.course_id || parseInt(selectedCourse);
    const ay = assessment.academic_year || academicYear;
    const vacancyCount = typeof assessment.suggested_vacancy !== 'undefined' ? assessment.suggested_vacancy : 0;

    const result = await dispatch(confirmVacancy({
      institution_id: instId,
      course_id: courseId,
      academic_year: ay,
      data: { confirmed_vacancy: vacancyCount }
    }));

    if (confirmVacancy.fulfilled.match(result)) {
      toast.success('Vacancy confirmed successfully! Ready for Step 3.');
    } else {
      toast.error(result.payload || 'Failed to confirm vacancy');
    }
  };

  const handleAcknowledge = async (anomalyId) => {
    const remarks = window.prompt('Enter remarks for acknowledgement:');
    if (remarks === null) return;

    const result = await dispatch(acknowledgeAnomaly({
      anomaly_id: anomalyId,
      remarks: remarks || 'Acknowledged'
    }));

    if (acknowledgeAnomaly.fulfilled.match(result)) {
      toast.success('Anomaly acknowledged');
    } else {
      toast.error('Failed to acknowledge anomaly');
    }
  };

  const filteredCourses = courses.filter(c => c.institution_id === parseInt(institutionId));

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Stepper */}
      <Stepper steps={steps} currentStep={1} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Vacancy <span className="text-indigo-600">Assessment</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Step 2: Identify and validate hiring needs for your institution.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl">
          <Shield size={16} className="text-indigo-600" />
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Principal Access Only</span>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-end gap-6">
        {/* Institution (Locked) */}
        <div className="flex-1 w-full space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center">
            <Building2 size={12} className="mr-1.5" /> Your Institution
          </label>
          <div className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-600 flex items-center justify-between">
            <span>{currentInstitution?.name || 'Loading...'} {currentInstitution?.code ? `(${currentInstitution.code})` : ''}</span>
            <Lock size={14} className="text-slate-400" />
          </div>
        </div>

        <div className="flex-1 w-full space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center">
            <Briefcase size={12} className="mr-1.5" /> Select Course
          </label>
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer disabled:opacity-50"
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              dispatch(clearAssessment());
            }}
            disabled={!institutionId}
          >
            <option value="">Select Course...</option>
            {filteredCourses.map(course => (
              <option key={course.id} value={course.id}>{course.name} ({course.level})</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-48 space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center">
            <Calendar size={12} className="mr-1.5" /> Academic Year
          </label>
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            value={academicYear}
            onChange={(e) => {
              setAcademicYear(e.target.value);
              dispatch(clearAssessment());
            }}
          >
            <option value="2026-27">2026-27</option>
            <option value="2025-26">2025-26</option>
          </select>
        </div>

        <Button
          variant="primary"
          onClick={handleLoadAssessment}
          disabled={!institutionId || !selectedCourse || loading || suggesting}
          className="h-[52px] px-8 rounded-2xl bg-white text-black hover:bg-slate-100 shadow-lg shadow-black/10 border-none transition-all"
        >
          {loading || suggesting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <div className="flex items-center">
              <Search size={18} className="mr-2" />
              Assess Vacancies
            </div>
          )}
        </Button>
      </div>

      {assessment ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          {/* Main Assessment Stats */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-lg font-bold text-slate-900">Deterministic Gap Analysis</h3>
                <span className="text-[10px] font-bold bg-indigo-600 text-white px-3 py-1 rounded-full uppercase tracking-widest">Live Audit</span>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Required Faculty</p>
                    <div className="flex items-center justify-between">
                      <p className="text-3xl font-bold text-slate-900">{assessment.required_count}</p>
                      <TrendingUp className="text-indigo-500" size={24} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold">Based on 1:{assessment.ratio || 20} Ratio</p>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Strength</p>
                    <div className="flex items-center justify-between">
                      <p className="text-3xl font-bold text-slate-900">{assessment.effective_existing}</p>
                      <Users className="text-slate-400" size={24} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold">{assessment.effective_existing || 0} Effective Staff</p>
                  </div>

                  <div className={cn(
                    "p-6 rounded-2xl border transition-all duration-500",
                    assessment.suggested_vacancy > 0 ? "bg-red-50 border-red-100 text-red-700" : "bg-emerald-50 border-emerald-100 text-emerald-700"
                  )}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">Calculated Vacancies</p>
                    <div className="flex items-center justify-between">
                      <p className="text-3xl font-bold">{assessment.suggested_vacancy}</p>
                      {assessment.suggested_vacancy > 0 ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
                    </div>
                    <p className="text-[10px] mt-2 font-bold opacity-60">
                      {assessment.status === 'CONFIRMED' ? 'Confirmed for Recruitment' : 
                       unacknowledgedHighAnomalies.length > 0 ? 'Action Required: Anomalies' : 'Pending Confirmation'}
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-white">
                    <Info size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-indigo-950">System Recommendation</h4>
                    <p className="text-sm font-medium text-indigo-900/70 mt-1">
                      Based on current admission of {assessment.actual_admitted} students and faculty strength of {assessment.effective_existing}, the system recommends hiring {assessment.suggested_vacancy} additional CHB faculty members.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Anomalies Section */}
            {assessment.anomalies && assessment.anomalies.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-amber-50/30">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center">
                    <AlertTriangle className="text-amber-500 mr-2" size={20} />
                    Data Anomalies Detected
                  </h3>
                  <span className="text-[10px] font-bold bg-amber-500 text-white px-3 py-1 rounded-full uppercase tracking-widest">
                    {assessment.anomalies.filter(a => !a.is_acknowledged).length} Pending
                  </span>
                </div>
                <div className="p-8 space-y-4">
                  {assessment.anomalies.map((anomaly) => (
                    <div key={anomaly.id} className={cn(
                      "p-5 rounded-2xl border flex items-start justify-between gap-4 transition-all",
                      anomaly.is_acknowledged ? "bg-slate-50 border-slate-100 opacity-60" : "bg-amber-50/50 border-amber-100"
                    )}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter",
                            anomaly.severity === 'HIGH' ? "bg-red-500 text-white shadow-sm shadow-red-200" : 
                            anomaly.severity === 'MEDIUM' ? "bg-amber-500 text-white" : "bg-slate-400 text-white"
                          )}>
                            {anomaly.severity}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{anomaly.anomaly_type}</h4>
                        </div>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">{anomaly.description}</p>
                      </div>

                      {!anomaly.is_acknowledged ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAcknowledge(anomaly.id)}
                          className="rounded-xl h-9 px-4 text-[10px] font-bold border-slate-200 hover:bg-white"
                        >
                          Acknowledge
                        </Button>
                      ) : (
                        <div className="flex items-center text-emerald-600 font-bold text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-xl">
                          <CheckCircle2 size={12} className="mr-1.5" />
                          Resolved
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>

          {/* Side Info / Actions */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Course Context</h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                  <span className="text-xs font-bold text-slate-500">Approved Intake</span>
                  <span className="text-sm font-bold text-slate-900">{assessment.approved_seats}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                  <span className="text-xs font-bold text-slate-500">Actual Admitted</span>
                  <span className="text-sm font-bold text-slate-900">{assessment.actual_admitted}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                  <span className="text-xs font-bold text-slate-500">Last Year Vacancy</span>
                  <span className="text-sm font-bold text-slate-900">{assessment.previous_vacancy || 0}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                  <span className="text-xs font-bold text-slate-500">Assessment Status</span>
                  <span className={cn(
                    "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
                    assessment.status === 'CONFIRMED' ? "bg-emerald-100 text-emerald-700" :
                      assessment.status === 'AI_SUGGESTED' ? "bg-indigo-100 text-indigo-700" :
                        "bg-slate-100 text-slate-600"
                  )}>{assessment.status}</span>
                </div>
              </div>

              <div className="mt-10 space-y-4">
                {unacknowledgedHighAnomalies.length > 0 && assessment.status !== 'CONFIRMED' && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-pulse">
                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={14} />
                    <p className="text-[10px] font-bold text-red-700 leading-tight">
                      Attention: {unacknowledgedHighAnomalies.length} High Severity anomalies must be acknowledged before you can confirm and forward this assessment.
                    </p>
                  </div>
                )}
                <Button
                  variant="primary"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={confirming || assessment.status === 'CONFIRMED' || unacknowledgedHighAnomalies.length > 0}
                  className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white flex items-center justify-center font-bold tracking-tight disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {confirming ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : assessment.status === 'CONFIRMED' ? (
                    <div className="flex items-center">
                      <CheckCircle2 size={18} className="mr-2" />
                      Confirmed & Locked
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Confirm & Forward to Admin
                      <ArrowRight size={18} className="ml-2" />
                    </div>
                  )}
                </Button>
                {assessment.status === 'CONFIRMED' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <p className="text-xs font-bold text-emerald-700 text-center">
                      ✓ This assessment is locked and forwarded to Admin for advertisement generation.
                    </p>
                  </div>
                )}
              </div>
            </div>


          </div>
        </div>
      ) : (
        <div className="h-96 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6">
            <Search size={32} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Assessment Loaded</h3>
          <p className="text-slate-500 font-medium max-w-sm mt-2">Select a course above to run the vacancy gap analysis and AI audit for your institution.</p>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={40} className="text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Confirm Vacancy Assessment?</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-10">
                You are about to finalize the vacancy count of <span className="text-indigo-600 font-bold">{assessment?.suggested_vacancy}</span> for this course. This will lock the assessment and allow the Admin to generate the recruitment advertisement.
              </p>

              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 h-14 rounded-2xl border-slate-200 font-bold text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    handleConfirm();
                    setShowConfirmModal(false);
                  }}
                  className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold shadow-lg shadow-slate-200"
                >
                  Confirm & Finalize
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VacancyManagement;
