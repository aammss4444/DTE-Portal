import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FileText, 
  Clock, 
  ExternalLink, 
  Trash2, 
  Loader2,
  CheckCircle,
  XCircle,
  Info,
  X,
  Download,
  Building2,
  Calendar,
  GraduationCap
} from 'lucide-react';
import { Button } from '../../components/common/UIComponents';
import applicationService from '../../services/applicationService';
import { getMyApplications } from './applicationSlice';
import { toast } from 'react-hot-toast';
import { cn } from '../../utils/cn';
import Modal from '../../components/common/Modal';

const MyApplications = () => {
  const dispatch = useDispatch();
  const { myApplications = [], loading, pagination } = useSelector(state => state.application);
  const total = pagination?.total || 0;
  const totalPages = pagination?.total_pages || 1;
  const [page, setPage] = useState(1);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    dispatch(getMyApplications({ skip: (page - 1) * 10, limit: 10 }));
  }, [dispatch, page]);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }

    setIsWithdrawing(true);
    try {
      await applicationService.withdrawApplication(appId);
      toast.success('Application withdrawn successfully');
      dispatch(getMyApplications({ skip: (page - 1) * 10, limit: 10 }));
    } catch (error) {
      const detail = error.response?.data?.detail;
      const message =
        detail?.message ||
        detail?.error ||
        error.response?.data?.message ||
        'Failed to withdraw application';
      toast.error(message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleViewApp = async (app) => {
    setSelectedApp(app);
    setDocsLoading(true);
    setDocuments([]);
    try {
      const response = await applicationService.listDocuments(app.application_id);
      setDocuments(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch documents');
    } finally {
      setDocsLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'SHORTLISTED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'WITHDRAWN':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'UNDER_REVIEW':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-muted text-secondary border-border';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
          <p className="text-secondary text-sm">Track the status of all your teaching position applications.</p>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4 min-h-[400px]">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="text-slate-500 font-medium">Fetching applications...</p>
          </div>
        ) : myApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 p-20 text-center min-h-[400px]">
             <FileText size={64} className="text-slate-300 mb-6" />
             <h3 className="text-2xl font-bold text-slate-900 mb-2">No Applications Yet</h3>
             <p className="text-slate-500 font-medium max-w-md">Your submitted applications will appear here. Keep exploring job ads!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {myApplications.map((app) => (
              <div key={app.application_id} className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between group">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                    <FileText size={32} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">{app.application_number}</p>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">{app.advertisement_name || app.course_name}</h4>
                    <p className="text-sm text-slate-500 font-medium">{app.institution_name} • AY {app.academic_year}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 mt-6 md:mt-0">
                  <span className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border",
                    getStatusStyle(app.status)
                  )}>
                    {app.status}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button 
                      onClick={() => handleViewApp(app)}
                      variant="outline" 
                      className="border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl py-2 px-4 h-10"
                    >
                      <ExternalLink size={16} className="mr-2" /> View
                    </Button>
                    {(app.status === 'DRAFT' || app.status === 'SUBMITTED') && (
                      <Button 
                        variant="ghost" 
                        className="h-10 w-10 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl border-none"
                        onClick={() => handleWithdraw(app.application_id)}
                        disabled={isWithdrawing}
                      >
                        <Trash2 size={18} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && myApplications.length > 0 && (
          <div className="flex items-center justify-between text-sm text-slate-500 font-medium px-2 pt-4">
            <p>Showing {myApplications.length} of {total} applications</p>
            <div className="flex space-x-2">
               <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="h-10 px-4 rounded-xl border-slate-200"
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="h-10 px-4 rounded-xl border-slate-200"
                >
                  Next
                </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Application Drawer / Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-[60] flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedApp(null)}></div>
          <div className="relative w-full max-w-2xl bg-background shadow-2xl h-full overflow-hidden flex flex-col animate-in slide-in-from-right duration-500">
            {/* Drawer Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                  {selectedApp.application_number.split('-').pop().slice(-2)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedApp.application_number}</h3>
                  <p className="text-sm text-secondary">{selectedApp.advertisement_name}</p>
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
                    "inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase border",
                    getStatusStyle(selectedApp.status)
                  )}>
                    {selectedApp.status}
                  </span>
                </div>
              </div>

              <hr className="border-border" />

              {/* Documents Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center">
                    <FileText size={16} className="mr-2 text-indigo-600" /> Uploaded Documents
                  </h4>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{documents.length} Files</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {docsLoading ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted/20 animate-pulse rounded-xl border border-border"></div>
                    ))
                  ) : documents.length === 0 ? (
                    <div className="p-8 text-center text-secondary bg-muted/10 rounded-xl border border-border border-dashed">
                      No documents found for this application.
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <div key={doc.id} className="group p-4 bg-background border border-border rounded-2xl hover:border-indigo-600 transition-all flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center transition-colors">
                            <FileText size={20} />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-foreground uppercase tracking-tight">{doc.document_type}</span>
                            <p className="text-[10px] text-secondary mt-0.5">{doc.file_name} • {(doc.file_size_kb || 0).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-2 h-9 w-9 rounded-full text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                            onClick={() => {
                              const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8080';
                              window.open(`${baseUrl}/${doc.file_path}`, '_blank');
                            }}
                          >
                            <ExternalLink size={16} />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={viewOpen}
        onClose={() => {
          setViewOpen(false);
          setSelectedApp(null);
          setDocuments([]);
        }}
        title="Application Details"
        size="lg"
      >
        {!selectedApp ? null : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-secondary font-semibold">Application Number</p>
                <p className="font-bold">{selectedApp.application_number}</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-semibold">Status</p>
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border mt-1",
                  getStatusStyle(selectedApp.status)
                )}>
                  {selectedApp.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-secondary font-semibold">Post</p>
                <p className="font-medium">{selectedApp.advertisement_name || selectedApp.course_name}</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-semibold">Institution</p>
                <p className="font-medium">{selectedApp.institution_name}</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-semibold">Academic Year</p>
                <p className="font-medium">{selectedApp.academic_year}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-2">Uploaded Documents</h4>
              {docsLoading ? (
                <div className="text-sm text-secondary flex items-center">
                  <Loader2 size={16} className="animate-spin mr-2" /> Loading documents...
                </div>
              ) : documents.length === 0 ? (
                <p className="text-sm text-secondary">No documents uploaded yet.</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-3 border border-border rounded-lg text-sm flex items-center justify-between">
                      <div>
                        <p className="font-medium">{doc.file_name}</p>
                        <p className="text-xs text-secondary">{doc.document_type} • {doc.validation_status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyApplications;
