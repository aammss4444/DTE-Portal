import React, { useState, useEffect } from 'react';
import { Award, FileText, Loader2 } from 'lucide-react';
import { Button } from '../../components/common/UIComponents';
import { appointmentService } from '../../services/appointmentService';
import AppointmentLetterResponseModal from '../../components/AppointmentLetterResponseModal';
import { toast } from 'react-hot-toast';
import { cn } from '../../utils/cn';

const CandidateOffers = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentService.listCandidateAppointments();
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Failed to load offer letters');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAppointment = async (id) => {
    try {
      const response = await appointmentService.getLetter(id);
      setSelectedAppointment(response.data);
    } catch (error) {
      toast.error('Failed to load appointment details');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
             <Award className="mr-3 text-indigo-600" size={32} />
             Offer <span className="text-indigo-600 ml-2">Letters</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            View and respond to your appointment offers.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4 min-h-[400px]">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-slate-500 font-medium">Fetching offer letters...</p>
        </div>
      ) : appointments.length > 0 ? (
        <div className="space-y-6">
          <div className="grid gap-6">
            {appointments.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((app) => (
              <div key={app.id} className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between group">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                    <FileText size={32} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">{app.appointment_number}</p>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">Offer from {app.institution_name}</h4>
                    <p className="text-sm text-slate-500 font-medium">Position: {app.course_name} • Expected Joining: {new Date(app.joining_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 mt-6 md:mt-0">
                  <span className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border",
                    app.status === 'ISSUED' ? "bg-amber-50 text-amber-600 border-amber-100" :
                    app.status === 'ACCEPTED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                    app.status === 'DECLINED' ? "bg-red-50 text-red-600 border-red-100" : "bg-slate-50 text-slate-400 border-slate-100"
                  )}>
                    {app.status === 'ISSUED' ? 'PENDING ACTION' : app.status}
                  </span>
                  <Button className="bg-slate-900 hover:bg-black active:scale-[0.98] text-white rounded-xl py-3 px-6 font-bold shadow-lg shadow-slate-200 transition-all" onClick={() => handleViewAppointment(app.id)}>
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {appointments.length > itemsPerPage && (
            <div className="flex items-center justify-between text-sm text-slate-500 font-medium px-2 pt-4">
              <p>Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, appointments.length)} of {appointments.length} offers</p>
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
                    disabled={page >= Math.ceil(appointments.length / itemsPerPage)}
                    onClick={() => setPage(p => p + 1)}
                    className="h-10 px-4 rounded-xl border-slate-200"
                  >
                    Next
                  </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 p-20 text-center min-h-[400px]">
           <Award size={64} className="text-slate-300 mb-6" />
           <h3 className="text-2xl font-bold text-slate-900 mb-2">No Offer Letters Yet</h3>
           <p className="text-slate-500 font-medium max-w-md">You haven't received any appointment offers. Keep applying and checking back!</p>
        </div>
      )}

      {/* Appointment Response Modal */}
      {selectedAppointment && (
        <AppointmentLetterResponseModal 
          appointment={selectedAppointment} 
          onClose={() => setSelectedAppointment(null)} 
          onRefresh={fetchAppointments}
        />
      )}
    </div>
  );
};

export default CandidateOffers;
