import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileText, CheckCircle, Upload, AlertCircle, ArrowRight, X } from 'lucide-react';
import { Button, Input } from '../../components/common/UIComponents';
import { createApplication, uploadDocuments, submitApplication, resetApplicationState, setStep } from './applicationSlice';
import { cn } from '../../utils/cn';

const JobApplicationFlow = ({ advertisementId, advertisementTitle, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { currentApplication, loading, error, success, step } = useSelector((state) => state.application);
  
  const [documentFiles, setDocumentFiles] = useState({
    PHOTO: null,
    SIGNATURE: null,
    AADHAR: null,
    DEGREE_CERTIFICATE: null,
    MARKSHEET: null,
    RESUME: null,
    OTHER: []
  });
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const safeTitle = advertisementTitle?.trim() || 'the selected post';

  useEffect(() => {
    return () => {
      dispatch(resetApplicationState());
    };
  }, [dispatch]);

  const handleInitialApply = (e) => {
    e.preventDefault();
    if (currentApplication?.id) {
      dispatch(setStep(2));
      return;
    }
    dispatch(createApplication({ 
      advertisement_id: advertisementId, 
      cover_letter: "",
      applied_designation: advertisementTitle
    }));
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    
    try {
      // Upload required single files
      const requiredTypes = ['PHOTO', 'SIGNATURE', 'AADHAR', 'DEGREE_CERTIFICATE', 'MARKSHEET', 'RESUME'];
      for (const type of requiredTypes) {
        if (documentFiles[type]) {
          const formData = new FormData();
          formData.append('documents', documentFiles[type]);
          formData.append('document_type', type);
          await dispatch(uploadDocuments({ applicationId: currentApplication.id, formData })).unwrap();
        }
      }

      // Upload additional files
      if (documentFiles.OTHER.length > 0) {
        for (const file of documentFiles.OTHER) {
          const formData = new FormData();
          formData.append('documents', file);
          formData.append('document_type', 'OTHER');
          await dispatch(uploadDocuments({ applicationId: currentApplication.id, formData })).unwrap();
        }
      }

      dispatch(setStep(3));
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    dispatch(submitApplication({ applicationId: currentApplication.id, submissionData: { declaration_accepted: declarationAccepted } }));
  };

  if (success) {
    return (
      <div className="bg-background w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Application Submitted!</h3>
          <p className="text-secondary max-w-sm mx-auto">
            Your application for <strong>{advertisementTitle}</strong> has been successfully submitted. You can track its status in your dashboard.
          </p>
          <div className="flex justify-center">
            <Button variant="accent" className="px-12" onClick={onClose}>Done</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
      {/* Header */}
      <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
        <div>
          <h3 className="text-xl font-bold text-foreground">Apply for Position</h3>
          <p className="text-xs text-secondary mt-1">{safeTitle}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-all text-secondary hover:text-foreground">
          <X size={20} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-8 pt-8">
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0"></div>
          {[
            { s: 1, label: 'Apply', icon: FileText },
            { s: 2, label: 'Documents', icon: Upload },
            { s: 3, label: 'Submit', icon: CheckCircle },
          ].map((item) => (
            <div key={item.s} className="relative z-10 flex flex-col items-center group">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                step >= item.s ? "bg-accent border-accent text-white" : "bg-background border-border text-secondary"
              )}>
                <item.icon size={18} />
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider mt-2 transition-colors",
                step >= item.s ? "text-accent" : "text-secondary"
              )}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-8 pt-0">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center text-red-500 text-sm animate-in slide-in-from-top-2">
            <AlertCircle size={18} className="mr-3 shrink-0" />
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleInitialApply} className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-4">
              <label className="text-sm font-bold text-secondary uppercase tracking-wider block mb-2">Attach Resume / CV</label>
              <div className={cn(
                "w-full p-8 rounded-xl border-2 border-dashed transition-all",
                documentFiles.RESUME ? "border-emerald-500 bg-emerald-50/10" : "border-border bg-muted/20 hover:border-accent"
              )}>
                {!documentFiles.RESUME ? (
                  <div className="relative flex flex-col items-center justify-center text-center">
                    <input 
                      type="file" 
                      accept="application/pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => setDocumentFiles(prev => ({ ...prev, RESUME: e.target.files[0] }))}
                      required
                    />
                    <Upload size={32} className="text-secondary mb-3" />
                    <p className="text-sm font-medium text-foreground">Click or drag PDF here to upload</p>
                    <p className="text-xs text-secondary mt-1">Maximum size: 2MB</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center relative z-20">
                    <CheckCircle size={32} className="text-emerald-500 mb-3" />
                    <span className="text-sm font-medium text-foreground truncate max-w-[80%]">{documentFiles.RESUME.name}</span>
                    <button 
                      type="button"
                      onClick={() => setDocumentFiles(prev => ({ ...prev, RESUME: null }))}
                      className="mt-4 px-4 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full text-xs font-semibold transition-colors"
                    >
                      Remove File
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="primary" className="px-8 py-3 group bg-slate-900 text-white hover:bg-black" disabled={loading || !documentFiles.RESUME}>
                {loading ? 'Processing...' : (
                  <>
                    Next: Upload Documents <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleDocumentUpload} className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'RESUME', label: 'Resume / CV (PDF)', type: 'application/pdf', locked: true },
                { id: 'PHOTO', label: 'Recent Photograph', type: 'image/*' },
                { id: 'SIGNATURE', label: 'Signature Specimen', type: 'image/*' },
                { id: 'AADHAR', label: 'Aadhar Card (PDF/Image)', type: 'application/pdf,image/*' },
                { id: 'DEGREE_CERTIFICATE', label: 'Degree Certificate', type: 'application/pdf,image/*' },
                { id: 'MARKSHEET', label: 'Last Qualifying Marksheet', type: 'application/pdf,image/*' },
              ].map((doc) => (
                <div key={doc.id} className={cn(
                  "relative p-4 border-2 border-dashed rounded-xl transition-all group",
                  documentFiles[doc.id] ? "border-emerald-500 bg-emerald-50/10" : "border-border hover:border-accent bg-muted/5"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{doc.label}</span>
                    {documentFiles[doc.id] && <CheckCircle size={14} className="text-emerald-500" />}
                  </div>
                  
                  {!documentFiles[doc.id] ? (
                    <div className="relative">
                      <input 
                        type="file" 
                        accept={doc.type}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        onChange={(e) => setDocumentFiles(prev => ({ ...prev, [doc.id]: e.target.files[0] }))}
                      />
                      <div className="flex items-center space-x-2 text-secondary py-2">
                        <Upload size={14} />
                        <span className="text-xs">Click to upload</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs font-medium truncate max-w-[120px]">{documentFiles[doc.id].name}</span>
                      {!doc.locked && (
                        <button 
                          type="button"
                          onClick={() => setDocumentFiles(prev => ({ ...prev, [doc.id]: null }))}
                          className="p-1 hover:bg-red-100 text-red-500 rounded-full transition-colors"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Other Documents Slot */}
              <div className="md:col-span-2 p-4 border-2 border-dashed border-border rounded-xl bg-muted/5">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-3">Other Supporting Documents</span>
                <div className="space-y-3">
                  <div className="relative border border-border bg-background p-3 rounded-lg flex items-center justify-center hover:border-accent transition-all cursor-pointer group">
                    <input 
                      type="file" 
                      multiple
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => setDocumentFiles(prev => ({ ...prev, OTHER: [...prev.OTHER, ...Array.from(e.target.files)] }))}
                    />
                    <div className="flex items-center space-x-2 text-secondary">
                      <Upload size={16} />
                      <span className="text-sm">Add more files...</span>
                    </div>
                  </div>
                  
                  {documentFiles.OTHER.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-background rounded border border-border">
                      <span className="text-xs truncate max-w-[200px]">{file.name}</span>
                      <button 
                        type="button"
                        onClick={() => setDocumentFiles(prev => ({ ...prev, OTHER: prev.OTHER.filter((_, i) => i !== idx) }))}
                        className="text-red-500 hover:bg-red-50 p-1 rounded"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button type="button" variant="outline" onClick={() => dispatch(setStep(1))}>Back</Button>
              <Button 
                variant="primary" 
                className="px-8 py-3 group bg-slate-900 text-white hover:bg-black" 
                disabled={loading || !['PHOTO', 'SIGNATURE', 'AADHAR', 'DEGREE_CERTIFICATE', 'MARKSHEET', 'RESUME'].every(k => !!documentFiles[k])}
              >
                {loading ? 'Uploading...' : (
                  <>
                    Next: Final Review <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="p-6 bg-accent/5 rounded-2xl border border-accent/20 space-y-4">
              <h4 className="font-bold text-accent flex items-center">
                <CheckCircle size={18} className="mr-2" /> Final Declaration
              </h4>
              <div className="flex items-start space-x-3">
                <input 
                  type="checkbox" 
                  id="declaration"
                  className="mt-1 w-5 h-5 rounded border-border text-accent focus:ring-accent"
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                />
                <label htmlFor="declaration" className="text-sm text-secondary leading-relaxed cursor-pointer">
                  I hereby declare that all the information provided in this application is true and correct to the best of my knowledge. I understand that any false statement or omission of material facts may result in my disqualification from the selection process or subsequent termination of services.
                </label>
              </div>
            </div>

            <div className="p-6 bg-muted/30 rounded-2xl space-y-4">
              <h4 className="text-sm font-bold text-secondary uppercase tracking-wider">Application Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Position</span>
                  <span className="font-bold">{safeTitle}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Documents Uploaded</span>
                  <span className="font-bold">
                    {Object.values(documentFiles).filter(v => v && !Array.isArray(v)).length + documentFiles.OTHER.length} Files
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button type="button" variant="outline" onClick={() => dispatch(setStep(2))}>Back</Button>
              <Button variant="primary" className="px-12 py-3 bg-[#34c759] hover:bg-[#32d75b] active:scale-[0.98] text-white shadow-sm font-medium border border-[#27a044]/30 transition-all" disabled={loading || !declarationAccepted}>
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default JobApplicationFlow;
