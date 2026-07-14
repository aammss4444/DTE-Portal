import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Send, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download, 
  Sparkles,
  ChevronRight,
  User,
  Building2,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';
import { Button, Input } from '../../components/common/UIComponents';
import { appointmentService } from '../../services/appointmentService';
import selectionService from '../../services/selectionService';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';
import CandidateProfileModal from '../../components/CandidateProfileModal';

const PrincipalAppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [confirmedCandidates, setConfirmedCandidates] = useState([]);
  const [genLoading, setGenLoading] = useState(false);

  const [formData, setFormData] = useState({
    selection_result_id: '',
    joining_date: '',
    salary_per_lecture: 1500,
    acceptance_deadline: ''
  });

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentService.listPrincipalAppointments();
      setAppointments(response.data.items);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchConfirmedCandidates = async () => {
    try {
      const response = await selectionService.getResults({ 
        status: 'CONFIRMED', 
        result_status: 'SELECTED' 
      });
      setConfirmedCandidates(response.items || []);
    } catch (error) {
      console.error('Failed to fetch candidates');
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchConfirmedCandidates();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenLoading(true);
    try {
      await appointmentService.generateLetter(formData);
      toast.success('Appointment letter generated successfully');
      setShowGenerator(false);
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate letter');
    } finally {
      setGenLoading(false);
    }
  };

  const handlePreview = async (id) => {
    try {
      const response = await appointmentService.getLetter(id);
      setSelectedApp(response.data);
    } catch (error) {
      toast.error('Failed to load letter content');
    }
  };

  const handleSubmitToCandidate = async (id) => {
    if (!window.confirm('Are you sure you want to issue this appointment letter to the candidate? This action cannot be undone.')) {
      return;
    }
    try {
      await appointmentService.submitLetter(id);
      toast.success('Appointment letter issued to candidate successfully!');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to issue appointment letter');
    }
  };

  const handleDeleteLetter = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this appointment letter? This action cannot be undone.')) {
      return;
    }
    try {
      await appointmentService.deleteLetter(id);
      toast.success('Appointment letter deleted successfully!');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete appointment letter');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-100 text-slate-600';
      case 'ISSUED': return 'bg-blue-100 text-blue-600';
      case 'ACCEPTED': return 'bg-emerald-100 text-emerald-600';
      case 'DECLINED': return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Appointment Letters</h1>
          <p className="text-slate-500 font-medium mt-1">Issue and manage employment offers for selected candidates.</p>
        </div>
        <Button 
          variant="accent" 
          onClick={() => setShowGenerator(true)}
          className="rounded-2xl shadow-lg shadow-indigo-200"
        >
          <Plus size={18} className="mr-2" /> New Appointment
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Issued', value: appointments.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Awaiting Response', value: appointments.filter(a => a.status === 'ISSUED').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Accepted', value: appointments.filter(a => a.status === 'ACCEPTED').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Rejected', value: appointments.filter(a => a.status === 'DECLINED').length, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className={cn("p-4 rounded-2xl", stat.bg)}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value.toString().padStart(2, '0')}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main List */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Recent Appointments</h3>
          <Button variant="ghost" size="sm" onClick={fetchAppointments}>Refresh</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Candidate</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Course</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Joining Date</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-8 py-10 text-center text-slate-300">Loading appointments...</td>
                  </tr>
                ))
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <FileText size={48} className="text-slate-100 mb-4" />
                      <p className="text-slate-400 font-medium">No appointment letters found.</p>
                      <p className="text-slate-300 text-xs mt-1">Generate a new letter to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                          {app.candidate_name.charAt(0)}
                        </div>
                        <div 
                          className="cursor-pointer hover:opacity-70 transition-opacity"
                          onClick={() => setSelectedCandidateId(app.candidate_id)}
                        >
                          <p className="font-bold text-slate-900">{app.candidate_name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{app.appointment_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-semibold text-slate-600">{app.course}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        getStatusColor(app.status)
                      )}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-medium text-slate-500">{new Date(app.joining_date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {app.status === 'DRAFT' && (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm h-9 px-4 rounded-xl"
                            onClick={() => handleSubmitToCandidate(app.id)}
                          >
                            <Send size={14} className="mr-2" /> Send
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100"
                          onClick={() => handlePreview(app.id)}
                        >
                          <Eye size={16} className="text-slate-600" />
                        </Button>
                        {app.status === 'DRAFT' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-9 w-9 p-0 rounded-xl hover:bg-red-50"
                            onClick={() => handleDeleteLetter(app.id)}
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setSelectedApp(null)}></div>
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                  <FileText className="text-indigo-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Letter Preview</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedApp.appointment_number}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="ghost" className="rounded-xl">
                  <Download size={18} className="mr-2" /> Download PDF
                </Button>
                <button onClick={() => setSelectedApp(null)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm">
                  <XCircle size={24} className="text-slate-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 bg-slate-100/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* English Version */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">English Version</span>
                  </div>
                  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 min-h-[600px] prose prose-slate max-w-none whitespace-pre-wrap leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: selectedApp.content_en }} />
                  </div>
                </div>

                {/* Marathi Version */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Marathi Version</span>
                  </div>
                  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 min-h-[600px] prose prose-slate max-w-none whitespace-pre-wrap leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: selectedApp.content_mr }} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end space-x-4">
              <Button variant="ghost" onClick={() => setSelectedApp(null)}>Close Preview</Button>
              {selectedApp.status === 'DRAFT' && (
                <Button variant="primary" className="bg-black hover:bg-slate-900 active:scale-[0.98] text-white shadow-sm font-medium border border-slate-800 transition-all px-6 py-2 rounded-xl" onClick={() => {
                  handleSubmitToCandidate(selectedApp.id);
                  setSelectedApp(null);
                }}>
                  Send to Candidate
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Candidate Profile Modal */}
      {selectedCandidateId && (
        <CandidateProfileModal 
          candidateId={selectedCandidateId} 
          onClose={() => setSelectedCandidateId(null)} 
        />
      )}

      {/* Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setShowGenerator(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-4">
                  <Sparkles size={14} className="text-indigo-600" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">AI Assistant</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Generate Appointment</h3>
              </div>
              <button onClick={() => setShowGenerator(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                <XCircle size={24} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="p-10 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Select Confirmed Candidate</label>
                <select 
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  required
                  value={formData.selection_result_id}
                  onChange={(e) => setFormData({...formData, selection_result_id: e.target.value})}
                >
                  <option value="">Choose a candidate...</option>
                  {confirmedCandidates.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.candidate_name} - {c.course_name} (Rank: {c.rank})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Input 
                  label="Proposed Joining Date" 
                  type="date" 
                  required
                  value={formData.joining_date}
                  onChange={(e) => setFormData({...formData, joining_date: e.target.value})}
                />
                <Input 
                  label="Acceptance Deadline" 
                  type="date" 
                  required
                  value={formData.acceptance_deadline}
                  onChange={(e) => setFormData({...formData, acceptance_deadline: e.target.value})}
                />
              </div>

              <Input 
                label="Honorarium per Lecture (₹)" 
                type="number" 
                required
                value={formData.salary_per_lecture}
                onChange={(e) => setFormData({...formData, salary_per_lecture: e.target.value})}
              />

              <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/50">
                <p className="text-xs text-indigo-900 font-medium leading-relaxed">
                  <Sparkles size={14} className="inline mr-2 text-indigo-600" />
                  Our AI will generate a professional appointment letter in both English and Marathi, incorporating institutional norms and DTE guidelines.
                </p>
              </div>

              <Button 
                variant="accent" 
                className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl shadow-slate-900/20 bg-slate-950 text-white hover:bg-slate-900 flex items-center justify-center gap-2 transition-all"
                type="submit"
                disabled={genLoading}
              >
                {genLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  'Generate with AI'
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalAppointmentManagement;
