import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Briefcase, FileText, CheckCircle, Clock, Search, MapPin, User, UserCircle, Loader2, Award, ArrowRight } from 'lucide-react';
import { Table } from '../../components/common/Table';
import { Button, Input } from '../../components/common/UIComponents';
import CandidateProfile from './CandidateProfile';
import JobApplicationFlow from './JobApplicationFlow';
import { fetchPublishedAds } from '../admin/advertisementSlice';
import { getMyApplications } from './applicationSlice';
import { getProfile } from './candidateSlice';
import { cn } from '../../utils/cn';
import { appointmentService } from '../../services/appointmentService';
import AppointmentLetterResponseModal from '../../components/AppointmentLetterResponseModal';
import { toast } from 'react-hot-toast';

const CandidateDashboard = () => {
  const dispatch = useDispatch();
  const { publishedList = [], loading: adsLoading } = useSelector(state => state.ads);
  const { myApplications = [], loading: appsLoading } = useSelector(state => state.application);
  const { profile } = useSelector(state => state.candidate);
  const [activeView, setActiveView] = useState('dashboard');
  const [showApplyFlow, setShowApplyFlow] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    dispatch(fetchPublishedAds({}));
    dispatch(getMyApplications({ skip: 0, limit: 10 }));
    dispatch(getProfile());
    fetchAppointments();
  }, [dispatch]);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.listCandidateAppointments();
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
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

  const loading = adsLoading || appsLoading;
  const profileComplete = !!profile?.is_profile_complete;
  const profileProgress = profileComplete ? 100 : 65;
  
  // Build a map of applied ads to exclude WITHDRAWN ones if we want to allow re-application
  const appliedAdStatusMap = (myApplications || []).reduce((acc, app) => {
    acc[String(app.advertisement_id)] = app.status;
    return acc;
  }, {});

  const allAds = publishedList || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Candidate Portal</h1>
          <p className="text-secondary">Explore teaching opportunities and track your application status.</p>
        </div>
        <div className="flex bg-background border border-border rounded-lg p-1">
          <button 
            onClick={() => setActiveView('dashboard')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all",
              activeView === 'dashboard' ? "bg-muted shadow-sm" : "text-secondary hover:text-foreground"
            )}
          >
            My Dashboard
          </button>
          <button 
            onClick={() => setActiveView('profile')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all",
              activeView === 'profile' ? "bg-muted shadow-sm" : "text-secondary hover:text-foreground"
            )}
          >
            Manage Profile
          </button>
        </div>
      </div>

      {activeView === 'profile' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CandidateProfile />
        </div>
      ) : (
        
        <div className="max-w-6xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-700">Active Job Ads</h3>
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase size={24} />
                </div>
              </div>
              <div>
                <p className="text-4xl font-black text-slate-900">{publishedList.length}</p>
                <p className="text-sm text-slate-500 font-medium mt-1">Total openings available</p>
              </div>
            </div>

            <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-700">Offer Letters</h3>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award size={24} />
                </div>
              </div>
              <div>
                <p className="text-4xl font-black text-slate-900">{appointments.length}</p>
                <p className="text-sm text-slate-500 font-medium mt-1">Offers received</p>
              </div>
            </div>

            <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-700">Applications</h3>
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
              </div>
              <div>
                <p className="text-4xl font-black text-slate-900">{myApplications.length}</p>
                <p className="text-sm text-slate-500 font-medium mt-1">Total applications sent</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between md:col-span-3 relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Manage Your Profile</h3>
                  <p className="text-slate-400 font-medium text-sm">Keep your profile updated to increase chances of selection. Complete profiles perform better.</p>
                </div>
                <Button className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-6 py-2.5 rounded-xl shrink-0 transition-colors" onClick={() => setActiveView('profile')}>
                  Edit Profile
                </Button>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
                <UserCircle size={150} className="text-white" />
              </div>
            </div>
          </div>
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

      {/* Job Application Flow Overlay */}
      {showApplyFlow && selectedAd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <JobApplicationFlow 
            advertisementId={selectedAd.id} 
            advertisementTitle={`Lecturer in ${selectedAd.course_name}`}
            onSuccess={() => {
              dispatch(getMyApplications({ skip: 0, limit: 50 }));
              dispatch(fetchPublishedAds({}));
            }}
            onClose={() => {
              setShowApplyFlow(false);
              setSelectedAd(null);
            }} 
          />
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;
