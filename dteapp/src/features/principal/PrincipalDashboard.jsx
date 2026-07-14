import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  GraduationCap, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Plus,
  MapPin
} from 'lucide-react';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/UIComponents';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData, setInstituteLocation, fetchFaceUpdateRequests, reviewFaceUpdateRequest } from './principalSlice';
import { Loader2 } from 'lucide-react';
import CandidateProfileModal from '../../components/CandidateProfileModal';
import LocationPickerModal from '../../components/common/LocationPickerModal';

const PrincipalDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { dashboardData, loading, faceUpdateRequests } = useSelector((state) => state.principal);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  React.useEffect(() => {
    dispatch(fetchDashboardData());
    dispatch(fetchFaceUpdateRequests());
  }, [dispatch]);

  const handleSetLocation = () => {
    if (!navigator.geolocation) {
      setIsLocationModalOpen(true);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLocationModalOpen(true);
      },
      (error) => {
        setIsLocationModalOpen(true);
      }
    );
  };

  const handleSaveLocation = async (lat, lng) => {
    const result = await dispatch(setInstituteLocation({
      latitude: lat,
      longitude: lng
    }));
    if (setInstituteLocation.fulfilled.match(result)) {
      import('react-hot-toast').then(toast => toast.toast.success('Institute location updated successfully!'));
    }
  };

  const stats = dashboardData ? [
    { label: 'Total Faculty', value: dashboardData.stats.total_faculty.toString().padStart(2, '0'), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: dashboardData.stats.faculty_trend },
    { label: 'Vacancies Identified', value: dashboardData.stats.vacancies_identified.toString().padStart(2, '0'), icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', trend: dashboardData.stats.vacancy_trend },
    { label: 'Live Applications', value: dashboardData.stats.live_applications.toString().padStart(2, '0'), icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: dashboardData.stats.application_trend },
    { label: 'Interviews', value: dashboardData.stats.scheduled_interviews.toString().padStart(2, '0'), icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-50', trend: dashboardData.stats.interview_trend },
  ] : [
    { label: 'Total Faculty', value: '--', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'Loading...' },
    { label: 'Vacancies Identified', value: '--', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Loading...' },
    { label: 'Live Applications', value: '--', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Loading...' },
    { label: 'Interviews', value: '--', icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-50', trend: 'Loading...' },
  ];

  const applications = dashboardData?.recent_applications || [];

  const columns = [
    { 
      key: 'name', 
      label: 'Candidate',
      render: (val, row) => (
        <div className="flex items-center space-x-3 cursor-pointer group/name" onClick={() => setSelectedCandidateId(row.id)}>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover/name:bg-indigo-100 group-hover/name:text-indigo-600 transition-colors">
            {val.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm group-hover/name:text-indigo-600 transition-colors">{val}</p>
            <p className="text-[10px] text-slate-400 font-medium">{row.id}</p>
          </div>
        </div>
      )
    },
    { key: 'post', label: 'Applied Post' },
    { 
      key: 'score', 
      label: 'Merit Score',
      render: (val) => (
        <div className="flex items-center space-x-2">
          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${val}%` }} />
          </div>
          <span className="font-bold text-slate-700 text-xs">{val}%</span>
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => (
        <span className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
          val === 'Shortlisted' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 
          val === 'Pending' ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 
          'bg-indigo-500 text-white shadow-lg shadow-indigo-100'
        )}>
          {val}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
      )}
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-[40px] bg-slate-950 p-10 text-white shadow-2xl">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-500/20 to-transparent" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest border border-indigo-500/30">
                Principal Portal
              </span>
              <span className="text-slate-500 text-[10px] font-bold">AY 2026-27</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome Back, <span className="text-indigo-400">Principal</span></h1>
            {dashboardData?.stats?.institute_name && (
              <h2 className="text-xl font-medium text-slate-300 mb-4">{dashboardData.stats.institute_name}</h2>
            )}
            <p className="text-slate-400 font-medium max-w-lg leading-relaxed">
              Your institute is currently at 85% staffing compliance. 3 vacancies are identified and pending your confirmation.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            {dashboardData?.stats?.institute_latitude ? (
              <div className="inline-flex items-center px-6 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold backdrop-blur-sm cursor-default" title={`Lat: ${dashboardData.stats.institute_latitude}, Lng: ${dashboardData.stats.institute_longitude}`}>
                <CheckCircle2 size={16} className="mr-2" />
                Location Locked
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleSetLocation}
                className="px-6 rounded-xl border-indigo-500/30 text-indigo-100 hover:bg-indigo-500/20 font-bold backdrop-blur-sm"
              >
                <MapPin size={16} className="mr-2" />
                Set Institute Location
              </Button>
            )}
            <Button 
              variant="primary" 
              onClick={() => navigate('/principal/vacancies')}
              className="h-14 px-8 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold border-none shadow-lg shadow-black/10 transition-colors"
            >
              Assess Vacancies
              <ArrowUpRight size={18} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="group p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110", stat.bg, stat.color)}>
                <stat.icon size={24} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.trend}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Applications Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Merit List Queue</h3>
            </div>
            <Button variant="ghost" className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:bg-indigo-50">
              Full Registry <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
            <Table 
              columns={columns} 
              data={applications}

            />
          </div>
        </div>

        {/* Face Update Requests Table */}
        <div className="lg:col-span-2 space-y-6 mt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Face Update Requests</h3>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
            {(!faceUpdateRequests || faceUpdateRequests.length === 0) ? (
              <div className="p-8 text-center text-slate-400 font-medium italic">
                No pending face update requests.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faculty ID</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reason</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {faceUpdateRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 text-sm font-bold text-slate-900">{req.faculty_credential_id}</td>
                      <td className="px-8 py-5 text-sm text-slate-600 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                      <td className="px-8 py-5 text-sm font-medium text-slate-500">{new Date(req.created_at).toLocaleDateString()}</td>
                      <td className="px-8 py-5 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const remarks = window.prompt("Reason for rejection:");
                            if (remarks) dispatch(reviewFaceUpdateRequest({ requestId: req.id, action: 'REJECT', remarks }));
                          }}
                          className="h-8 px-4 text-[10px] text-rose-600 border-rose-200 hover:bg-rose-50"
                        >
                          Reject
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            if (window.confirm("Approve face update request?")) {
                              dispatch(reviewFaceUpdateRequest({ requestId: req.id, action: 'APPROVE', remarks: 'Approved by Principal' }));
                            }
                          }}
                          className="h-8 px-4 text-[10px] bg-emerald-500 hover:bg-emerald-600 border-none text-white"
                        >
                          Approve
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Actions & Interviews */}
        <div className="space-y-8">

          <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Today's Schedule</h3>
              <Calendar size={18} className="text-slate-400" />
            </div>
            
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="group flex items-start space-x-4 cursor-pointer">
                  <div className="w-12 h-14 rounded-2xl bg-slate-50 flex flex-col items-center justify-center transition-colors group-hover:bg-indigo-50">
                    <span className="text-xs font-bold text-slate-900 leading-none">1{i}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">AM</span>
                  </div>
                  <div className="flex-1 border-b border-slate-50 pb-4 group-hover:border-indigo-100 transition-colors">
                    <p className="font-bold text-sm text-slate-900 group-hover:text-indigo-600">Candidate #{i}04 Interview</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 flex items-center uppercase tracking-wider">
                      <Clock size={12} className="mr-1.5 text-indigo-400" /> Room 102 • Panel A
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="w-full h-12 rounded-2xl text-[10px] font-bold uppercase tracking-widest mt-4 border-slate-200 hover:bg-slate-50">
              Manage Calendar
            </Button>
          </div>
        </div>
      </div>
      {selectedCandidateId && (
        <CandidateProfileModal 
          candidateId={selectedCandidateId} 
          onClose={() => setSelectedCandidateId(null)} 
        />
      )}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSave={handleSaveLocation}
        initialLocation={currentLocation}
      />
    </div>
  );
};

export default PrincipalDashboard;
