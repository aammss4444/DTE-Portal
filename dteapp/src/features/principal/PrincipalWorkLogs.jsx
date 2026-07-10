import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  AlertTriangle,
  Loader2,
  MapPin,
  Activity,
  History
} from 'lucide-react';
import { 
  fetchLogs, 
  verifyLog
} from '../faculty/attendanceSlice';
import { fetchDashboardData } from './principalSlice';
import { getAppointedFaculties } from './facultySlice';
import { Button, Input, Select } from '../../components/common/UIComponents';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

// Haversine formula for distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return Math.round(R * c); // in metres
};

const PrincipalWorkLogs = () => {
  const dispatch = useDispatch();
  const { logs, anomalies, loading } = useSelector((state) => state.attendance);
  const { dashboardData } = useSelector((state) => state.principal);
  const { chbFacultyList } = useSelector((state) => state.faculty);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchLogs({ month: filterMonth, log_status: filterStatus !== 'ALL' ? filterStatus : undefined }));
    // dispatch(fetchAnomalies({ month: filterMonth, is_acknowledged: false }));
    if (!dashboardData) {
      dispatch(fetchDashboardData());
    } else if (dashboardData.stats?.institution_id && chbFacultyList.length === 0) {
      dispatch(getAppointedFaculties({ institution_id: dashboardData.stats.institution_id }));
    }
  }, [dispatch, filterMonth, filterStatus, dashboardData, chbFacultyList.length]);

  const filteredLogs = logs.filter(log => 
    log.faculty_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.subject_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerify = async (logId, action) => {
    if (action === 'REJECT' && !remarks) {
      toast.error('Please provide remarks for rejection', {
        icon: '⚠️',
        className: 'font-black text-xs uppercase tracking-tighter'
      });
      return;
    }
    
    if (window.confirm(`Are you sure you want to ${action.toLowerCase()} this log?`)) {
      try {
        await dispatch(verifyLog({ logId, action, remarks })).unwrap();
        setRemarks('');
        setSelectedLog(null);
        dispatch(fetchLogs({ month: filterMonth, log_status: filterStatus !== 'ALL' ? filterStatus : undefined }));
      } catch (err) {
        // toast already handled in slice
      }
    }
  };

  const statusColors = {
    'SUBMITTED': 'bg-amber-100 text-amber-800',
    'VERIFIED': 'bg-emerald-100 text-emerald-800',
    'REJECTED': 'bg-red-100 text-red-800',
    'FLAGGED': 'bg-rose-100 text-rose-800'
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Work Log <span className="text-indigo-600">Verification</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Review and verify institutional attendance and instructional records manually.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
        <div className="flex flex-wrap gap-6 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Period Selection</label>
            <Select 
              value={filterMonth} 
              onChange={(e) => setFilterMonth(e.target.value)}
              icon={Clock}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>
                  {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Log Status</label>
            <Select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              icon={Activity}
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Pending Verification</option>
              <option value="VERIFIED">Approved Logs</option>
              <option value="REJECTED">Rejected Logs</option>
            </Select>
          </div>
          <div className="flex-none">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search faculty..." 
                  className="pl-11 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500 w-64 transition-all"
                />
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center text-gray-400">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        ) : logs?.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No work logs found for the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-semibold text-gray-500">
                <tr>
                  <th className="px-6 py-4">Faculty</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Topic / Subject</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-center">Distance</th>
                  <th className="px-6 py-4 text-center">Liveness</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {chbFacultyList.find(f => f.faculty_credential_id === log.faculty_credential_id)?.candidate_name || 'Unknown Faculty'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {new Date(log.lecture_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <div className="text-xs text-gray-500 mt-1 font-normal">
                          {log.start_time.slice(0,5)} - {log.end_time.slice(0,5)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{log.subject_name}</div>
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">{log.topic_covered}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{log.class_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {log.lecture_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {(() => {
                          const dist = calculateDistance(
                            log.latitude, 
                            log.longitude, 
                            dashboardData?.stats?.institute_latitude, 
                            dashboardData?.stats?.institute_longitude
                          );
                          if (dist === null) return <span className="text-gray-400 text-xs italic">Unknown</span>;
                          return (
                            <div className={`flex items-center justify-center gap-1.5 font-bold text-xs ${dist > 500 ? 'text-rose-600 bg-rose-50 px-2 py-1 rounded-md' : 'text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md'}`}>
                              <MapPin size={12} />
                              {dist > 1000 ? `${(dist/1000).toFixed(1)} km` : `${dist} m`}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {log.liveness_score != null ? (
                          log.face_verified ? (
                            <div className="flex flex-col items-center">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-700">
                                <CheckCircle size={12} /> Verified
                              </span>
                              <span className="text-[10px] text-gray-500 mt-1 font-medium">Score: {(log.liveness_score * 100).toFixed(0)}%</span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-rose-100 text-rose-700">
                              <XCircle size={12} /> Failed
                            </span>
                          )
                        ) : (
                          <span className="text-gray-400 text-xs italic">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[log.log_status] || 'bg-gray-100 text-gray-800'}`}>
                          {log.log_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        {log.log_status === 'SUBMITTED' && (
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => setSelectedLog(selectedLog === log.id ? null : log.id)}
                          >
                            Review
                          </Button>
                        )}
                        {log.log_status === 'VERIFIED' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                            onClick={() => {
                              const date = new Date(log.lecture_date);
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              const formattedDate = `${year}-${month}-${day}`;

                              navigate('/principal/billing', {
                                state: {
                                  action: 'open_generate_modal',
                                  faculty_credential_id: log.faculty_credential_id,
                                  period_start: formattedDate,
                                  period_end: formattedDate,
                                  academic_year: log.academic_year
                                }
                              });
                            }}
                          >
                            Generate Bill
                          </Button>
                        )}
                      </td>
                    </tr>
                    {selectedLog === log.id && (
                      <tr className="bg-blue-50/30">
                        <td colSpan="8" className="px-6 py-4 border-b border-blue-100">
                          <div className="flex gap-4 items-start">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Remarks (Optional for Verify, Required for Reject)</label>
                              <Input 
                                placeholder="Enter remarks..." 
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-2 mt-6">
                              <Button 
                                variant="outline" 
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => handleVerify(log.id, 'REJECT')}
                              >
                                <XCircle size={16} className="mr-2" />
                                Reject
                              </Button>
                              <Button 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => handleVerify(log.id, 'VERIFY')}
                              >
                                <CheckCircle size={16} className="mr-2" />
                                Verify
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
          </tbody>
        </table>
        {filteredLogs.length === 0 && (
          <div className="py-20 text-center space-y-4">
             <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto">
                <History size={32} />
             </div>
             <p className="text-slate-400 font-bold">No work logs found for the selected period.</p>
          </div>
        )}
      </div>
      )}
      </div>
    </div>
  );
};

export default PrincipalWorkLogs;
