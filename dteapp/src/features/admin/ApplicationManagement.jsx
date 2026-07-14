import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Search, 
  Filter, 
  FileText, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ChevronRight,
  User,
  Building2,
  Calendar,
  GraduationCap,
  Sparkles,
  X,
  ExternalLink,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button, Input } from '../../components/common/UIComponents';
import { applicationService } from '../../services/applicationService';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        status: statusFilter === 'ALL' ? undefined : statusFilter
      };
      const response = await applicationService.getApplications(params);
      setApplications(response.data);
      setTotal(response.total);
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (appId) => {
    setDocsLoading(true);
    try {
      const response = await applicationService.listDocuments(appId);
      setDocuments(response.data);
    } catch (error) {
      toast.error('Failed to fetch documents');
    } finally {
      setDocsLoading(false);
    }
  };

  const fetchAISummary = async (appId) => {
    setAiLoading(true);
    try {
      const response = await applicationService.getAISummary(appId);
      setAiSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch AI summary');
    } finally {
      setAiLoading(false);
    }
  };

  const handleReanalyzeAI = async (appId) => {
    setAiLoading(true);
    try {
      await applicationService.analyzeApplicationAI(appId);
      // Wait for 1 second to allow backend to finish parsing the LLM response if needed, although it's synchronous
      await fetchAISummary(appId);
    } catch (error) {
      console.error('Failed to re-run AI scrutiny');
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, statusFilter]);

  const handleViewApp = (app) => {
    setSelectedApp(app);
    setDocuments([]);
    setAiSummary(null);
    fetchDocuments(app.application_id);
    fetchAISummary(app.application_id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-blue-100 text-blue-600';
      case 'APPROVED': return 'bg-emerald-100 text-emerald-600';
      case 'REJECTED': return 'bg-red-100 text-red-600';
      case 'UNDER_REVIEW': return 'bg-amber-100 text-amber-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getValidationIcon = (status) => {
    switch (status) {
      case 'VALID': return <CheckCircle size={14} className="text-emerald-500" />;
      case 'INVALID': return <AlertCircle size={14} className="text-red-500" />;
      case 'SUSPICIOUS': return <AlertCircle size={14} className="text-amber-500" />;
      default: return <Clock size={14} className="text-slate-400" />;
    }
  };

  const handleAction = async (action, remarks = '') => {
    try {
      await applicationService.processAction(selectedApp.application_id, { action, remarks });
      toast.success(`Application ${action === 'APPROVE' ? 'Approved' : 'Rejected'} successfully`);
      setSelectedApp(null);
      fetchApplications();
    } catch (error) {
      toast.error('Failed to process application action');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Application Management</h1>
          <p className="text-secondary text-sm mt-1">Review and manage recruitment applications from all institutes</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', value: total, icon: FileText, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Pending Review', value: applications.filter(a => a.status === 'SUBMITTED').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Verified Documents', value: applications.reduce((acc, a) => acc + (a.valid_documents || 0), 0), icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Flags Raised', value: applications.reduce((acc, a) => acc + (a.invalid_documents || 0), 0), icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-2xl border border-border bg-background shadow-sm flex items-center space-x-4">
            <div className={cn("p-3 rounded-xl", stat.bg)}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Table */}
      <div className="bg-background rounded-3xl border border-border shadow-xl overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
              <input 
                type="text"
                placeholder="Search by candidate or application number..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-accent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <Button variant="outline" onClick={fetchApplications}>Refresh</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30">
                <th className="p-4 text-xs font-bold text-secondary uppercase tracking-widest border-b border-border">Application</th>
                <th className="p-4 text-xs font-bold text-secondary uppercase tracking-widest border-b border-border">Candidate</th>
                <th className="p-4 text-xs font-bold text-secondary uppercase tracking-widest border-b border-border">Institution & Course</th>
                <th className="p-4 text-xs font-bold text-secondary uppercase tracking-widest border-b border-border text-center">Docs Status</th>
                <th className="p-4 text-xs font-bold text-secondary uppercase tracking-widest border-b border-border">Status</th>
                <th className="p-4 text-xs font-bold text-secondary uppercase tracking-widest border-b border-border text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="p-8 text-center text-secondary">Loading applications...</td>
                  </tr>
                ))
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-secondary">No applications found.</td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.application_id} className="hover:bg-muted/10 transition-colors group">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground">{app.application_number}</span>
                        <span className="text-[10px] text-secondary mt-0.5">{app.academic_year}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                          {app.candidate_name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-foreground">{app.candidate_name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col max-w-[250px]">
                        <span className="text-sm font-medium truncate">{app.institution_name}</span>
                        <span className="text-xs text-secondary truncate">{app.course_name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-emerald-500">{app.valid_documents || 0}</span>
                          <CheckCircle size={12} className="text-emerald-500" />
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-red-500">{app.invalid_documents || 0}</span>
                          <AlertCircle size={12} className="text-red-500" />
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-slate-400">{app.pending_documents || 0}</span>
                          <Clock size={12} className="text-slate-400" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        getStatusColor(app.status)
                      )}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleViewApp(app)}
                        className="p-2 hover:bg-accent/10 text-secondary hover:text-accent rounded-lg transition-all"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/10">
          <span className="text-xs text-secondary font-medium">Showing {applications.length} of {total} applications</span>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page * 10 >= total}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* App Detail Drawer / Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedApp(null)}></div>
          <div className="relative w-full max-w-4xl bg-background shadow-2xl rounded-3xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-lg">
                  {selectedApp.application_number.split('-').pop().slice(-2)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedApp.application_number}</h3>
                  <p className="text-sm text-secondary">{selectedApp.candidate_name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-muted rounded-full transition-all text-secondary hover:text-foreground">
                <X size={24} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* App Summary Section */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center">
                    <Building2 size={12} className="mr-2" /> Institution
                  </span>
                  <p className="text-sm font-medium">{selectedApp.institution_name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center">
                    <GraduationCap size={12} className="mr-2" /> Course
                  </span>
                  <p className="text-sm font-medium">{selectedApp.course_name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center">
                    <Calendar size={12} className="mr-2" /> Academic Year
                  </span>
                  <p className="text-sm font-medium">{selectedApp.academic_year}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center">
                    <Clock size={12} className="mr-2" /> Current Status
                  </span>
                  <span className={cn(
                    "inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                    getStatusColor(selectedApp.status)
                  )}>
                    {selectedApp.status}
                  </span>
                </div>
              </div>

              {/* AI Scrutiny Section */}
              <div className="p-6 bg-accent/5 rounded-3xl border border-accent/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-accent uppercase tracking-wider flex items-center">
                    <Sparkles size={16} className="mr-2" /> AI Scrutiny Analysis
                  </h4>
                  {aiSummary && (
                    <div className="flex items-center space-x-2">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        aiSummary.confidence_score >= 80 ? "bg-emerald-100 text-emerald-600" :
                        aiSummary.confidence_score >= 50 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                      )}>
                        {aiSummary.confidence_score}% Confidence
                      </div>
                      <button 
                        onClick={() => handleReanalyzeAI(selectedApp.application_id)}
                        disabled={aiLoading}
                        className="p-1.5 hover:bg-accent/10 rounded-full text-accent transition-colors disabled:opacity-50"
                        title="Re-run AI Analysis"
                      >
                        <RefreshCw size={14} className={cn(aiLoading && "animate-spin")} />
                      </button>
                    </div>
                  )}
                </div>

                {aiLoading ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-accent/10 rounded w-3/4"></div>
                    <div className="h-4 bg-accent/10 rounded w-1/2"></div>
                  </div>
                ) : aiSummary ? (
                  <div className="space-y-3">
                    <p className="text-xs text-secondary leading-relaxed">
                      {aiSummary.scrutiny_summary || "AI analysis complete. Check the issues list below for specific findings."}
                    </p>
                    {aiSummary.mismatches && aiSummary.mismatches.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <h5 className="text-[11px] font-bold text-foreground uppercase tracking-wider">Profile Anomalies</h5>
                        {aiSummary.mismatches.map((issue, idx) => (
                          <div key={`mismatch-${idx}`} className="flex items-start space-x-2 text-[10px] text-red-500 font-medium bg-red-50 p-2 rounded-lg border border-red-100">
                            <AlertCircle size={12} className="mt-0.5 shrink-0" />
                            <span>{issue}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {aiSummary.missing_documents && aiSummary.missing_documents.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <h5 className="text-[11px] font-bold text-foreground uppercase tracking-wider">Missing Documents</h5>
                        {aiSummary.missing_documents.map((docName, idx) => (
                          <div key={`missing-${idx}`} className="flex items-start space-x-2 text-[10px] text-amber-600 font-medium bg-amber-50 p-2 rounded-lg border border-amber-100">
                            <AlertCircle size={12} className="mt-0.5 shrink-0" />
                            <span>Missing required document: {docName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-secondary italic">AI summary is being generated or is unavailable.</p>
                )}
              </div>

              <hr className="border-border" />

              {/* Documents Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center">
                    <FileText size={16} className="mr-2 text-accent" /> Uploaded Documents
                  </h4>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{documents.length} Files Total</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {docsLoading ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted/20 animate-pulse rounded-xl border border-border"></div>
                    ))
                  ) : documents.length === 0 ? (
                    <div className="p-8 text-center text-secondary bg-muted/10 rounded-xl border border-border dashed">
                      No documents found for this application.
                    </div>
                  ) : (
                    documents.map((doc) => {
                      const docAnalysis = aiSummary?.document_analysis?.find(da => da.document_type === doc.document_type);
                      const docIssues = docAnalysis?.issues || [];
                      return (
                      <div key={doc.id} className="group flex flex-col bg-background border border-border rounded-2xl hover:border-accent transition-all overflow-hidden">
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                              doc.validation_status === 'VALID' ? "bg-emerald-100 text-emerald-600" : 
                              doc.validation_status === 'INVALID' ? "bg-red-100 text-red-600" : "bg-muted text-secondary"
                            )}>
                              <FileText size={20} />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-foreground uppercase tracking-tight">{doc.document_type}</span>
                                {getValidationIcon(doc.validation_status)}
                              </div>
                              <p className="text-[10px] text-secondary mt-0.5">{doc.file_name} • {(doc.file_size_kb || 0).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-2 h-9 w-9 rounded-full"
                              onClick={() => {
                                const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8080';
                                window.open(`${baseUrl}/${doc.file_path}`, '_blank');
                              }}
                            >
                              <ExternalLink size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-2 h-9 w-9 rounded-full"
                            >
                              <Download size={16} />
                            </Button>
                          </div>
                        </div>
                        {docIssues.length > 0 && (
                          <div className="bg-red-50/50 px-4 py-3 border-t border-red-100 space-y-2">
                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Document Anomalies Detected:</p>
                            <div className="space-y-1.5">
                              {docIssues.map((issue, idx) => (
                                <div key={idx} className="flex items-start space-x-2 text-[10px] text-red-500">
                                  <AlertCircle size={12} className="mt-0.5 shrink-0" />
                                  <span>{issue}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )})
                  )}
                </div>
              </div>

              {/* Remarks / Action Section */}
              <div className="p-6 bg-accent/5 rounded-3xl border border-accent/20 space-y-4">
                <h4 className="text-sm font-bold text-accent uppercase tracking-wider flex items-center">
                  <CheckCircle size={16} className="mr-2" /> Application Action
                </h4>
                <p className="text-xs text-secondary leading-relaxed">
                  As an administrator, you can review the AI-scrutinized documents and update the status of this application. This will trigger a notification to the candidate.
                </p>
                <div className="flex space-x-3 pt-2">
                  <Button variant="primary" className="flex-1 rounded-xl bg-[#34c759] hover:bg-[#32d75b] active:scale-[0.98] text-white shadow-sm font-medium border border-[#27a044]/30 transition-all" onClick={() => handleAction('APPROVE')}>Approve Application</Button>
                  <Button variant="primary" className="flex-1 rounded-xl bg-[#ff3b30] hover:bg-[#ff453a] active:scale-[0.98] text-white shadow-sm font-medium border border-[#d73127]/30 transition-all" onClick={() => handleAction('REJECT', 'Documents verified but qualification mismatch.')}>Reject</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement;
