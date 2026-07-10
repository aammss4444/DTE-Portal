import React, { useState } from 'react';
import { 
  FileText, CheckCircle, XCircle, Download, 
  AlertTriangle, Calendar, Award, Building2, ShieldCheck
} from 'lucide-react';
import { Button } from './common/UIComponents';
import { appointmentService } from '../services/appointmentService';
import { toast } from 'react-hot-toast';
import { cn } from '../utils/cn';

const AppointmentLetterResponseModal = ({ appointment, onClose, onRefresh }) => {
  const [submitting, setSubmitting] = useState(false);
  const [remarks, setRemarks] = useState('');

  const handleResponse = async (action) => {
    if (action === 'DECLINED' && !remarks) {
      toast.error('Please provide a reason for rejection in remarks.');
      return;
    }

    try {
      setSubmitting(true);
      await appointmentService.respondToLetter(appointment.id, {
        action,
        remarks: remarks || (action === 'ACCEPTED' ? 'Accepted the appointment.' : 'Declined the appointment.')
      });
      toast.success(`Appointment ${action.toLowerCase().replace('ed', '')}ed successfully!`);
      onRefresh();
      onClose();
    } catch (error) {
      toast.error('Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
              <FileText size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Appointment Offer</h2>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">{appointment.appointment_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm">
            <XCircle size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-slate-100/30">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Letter Preview */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-200 min-h-[600px] prose prose-slate max-w-none whitespace-pre-wrap leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: appointment.content_en }} />
                <hr className="my-10" />
                <div dangerouslySetInnerHTML={{ __html: appointment.content_mr }} />
              </div>
            </div>

            {/* Sidebar Details & Actions */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Offer Details</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-50 text-slate-400 rounded-xl">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Institution</p>
                      <p className="text-sm font-bold text-slate-700">{appointment.institution_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-50 text-slate-400 rounded-xl">
                      <Award size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Course</p>
                      <p className="text-sm font-bold text-slate-700">{appointment.course_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-50 text-slate-400 rounded-xl">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Joining Date</p>
                      <p className="text-sm font-bold text-slate-700">{new Date(appointment.joining_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50">
                   <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start space-x-3">
                    <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 font-medium leading-relaxed">
                      Please accept or reject this offer before the deadline to ensure your placement.
                    </p>
                  </div>
                </div>
              </div>

              {appointment.status === 'ISSUED' && (
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                  <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Your Response</h4>
                  <textarea 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-200 transition-all min-h-[100px]"
                    placeholder="Enter any remarks or reason for rejection..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="ghost" 
                      className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl"
                      onClick={() => handleResponse('DECLINED')}
                      disabled={submitting}
                    >
                      Reject Offer
                    </Button>
                    <Button 
                      variant="accent" 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-100"
                      onClick={() => handleResponse('ACCEPTED')}
                      disabled={submitting}
                    >
                      Accept Offer
                    </Button>
                  </div>
                </div>
              )}

              {appointment.status !== 'ISSUED' && (
                <div className="space-y-4">
                  <div className={cn(
                    "p-6 rounded-[32px] text-center",
                    appointment.status === 'ACCEPTED' ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                  )}>
                    <div className="flex flex-col items-center">
                      {appointment.status === 'ACCEPTED' ? <CheckCircle className="mb-2" size={32} /> : <XCircle className="mb-2" size={32} />}
                      <p className="font-bold uppercase tracking-widest text-xs">Offer {appointment.status}</p>
                    </div>
                  </div>

                  {appointment.status === 'ACCEPTED' && appointment.credentials && (
                    <div className="bg-indigo-600 p-8 rounded-[32px] text-white shadow-xl shadow-indigo-200 animate-in slide-in-from-bottom-4 duration-700">
                      <h4 className="font-bold uppercase tracking-widest text-xs mb-4 text-indigo-200">Your Faculty Account</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-tighter">Portal Username</p>
                          <p className="text-sm font-bold select-all">{appointment.credentials.username}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-tighter">Temporary Password</p>
                          <p className="text-sm font-bold select-all">
                            {appointment.credentials.password || "Password already used or unavailable. Contact Admin."}
                          </p>
                        </div>
                        <div className="pt-4 border-t border-indigo-500/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-tighter">Faculty Code</p>
                              <p className="text-xs font-bold">{appointment.credentials.faculty_code}</p>
                            </div>
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                              <ShieldCheck size={20} />
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-indigo-200 italic mt-4">
                          Note: You will be required to change this password on your first login as faculty.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <Button variant="ghost" onClick={onClose}>Close Window</Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentLetterResponseModal;
