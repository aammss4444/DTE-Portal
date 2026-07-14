import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLogs, bulkSubmit, createLog, fetchTimetable, submitLog } from './attendanceSlice';
import { Button } from '../../components/common/UIComponents';
import { Loader2, MoreVertical, ClipboardList, Calendar as CalendarIcon, Filter, Plus, X, Camera, MapPin, ScanFace, CheckCircle2 } from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import { cn } from '../../utils/cn';
import LogTeachingHourModal from './LogTeachingHourModal';

const FacultyWorkLogs = () => {
  const dispatch = useDispatch();
  const { logs, loading } = useSelector((state) => state.attendance);
  const { user } = useSelector((state) => state.auth);

  const [logPage, setLogPage] = useState(1);
  const logsPerPage = 15;
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { timetable } = useSelector((state) => state.attendance);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  
  const faceLocked = !!user?.face_registered;

  const handleCreateLog = async (payload) => {
    setIsSubmittingLog(true);
    const result = await dispatch(createLog(payload));
    setIsSubmittingLog(false);
    
    if (createLog.fulfilled.match(result)) {
      setIsModalOpen(false);
      dispatch(fetchLogs({ faculty_credential_id: user?.id, month: selectedMonth }));
    }
  };

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchLogs({ 
        month: selectedMonth, 
        academicYear: '2026-27' 
      }));
      dispatch(fetchTimetable({ academicYear: '2026-27' }));
    }
  }, [dispatch, user, selectedMonth, selectedYear]);


  const handleBulkSubmit = () => {
    const draftLogs = logs.filter(l => l.log_status === 'DRAFT').map(l => l.id);
    if (draftLogs.length > 0) {
      dispatch(bulkSubmit(draftLogs));
    }
  };

  const statusColors = {
    'DRAFT': 'bg-slate-100 text-slate-600',
    'SUBMITTED': 'bg-amber-100 text-amber-600',
    'VERIFIED': 'bg-emerald-100 text-emerald-600',
    'REJECTED': 'bg-rose-100 text-rose-600'
  };

  const paginatedLogs = logs.slice((logPage - 1) * logsPerPage, logPage * logsPerPage);
  const totalPages = Math.ceil(logs.length / logsPerPage);

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Work Logs</h2>
        <p className="text-sm font-medium text-slate-500">View and manage your submitted teaching hours.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <CalendarIcon size={16} className="text-slate-400" />
              <select 
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(parseInt(e.target.value));
                  setLogPage(1);
                }}
                className="bg-transparent text-sm font-bold text-slate-700 outline-none"
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Filter size={16} className="text-slate-400" />
              <select 
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(parseInt(e.target.value));
                  setLogPage(1);
                }}
                className="bg-transparent text-sm font-bold text-slate-700 outline-none"
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(true)}
              className="text-[10px] font-bold uppercase tracking-widest px-6"
            >
              <Plus size={14} className="mr-2" />
              Log Lecture
            </Button>
            <Button 
              variant="primary" 
              onClick={handleBulkSubmit}
              disabled={!logs.some(l => l.log_status === 'DRAFT')}
              className="text-[10px] font-bold uppercase tracking-widest px-6"
            >
              Submit All Drafts
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Topic</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Hours</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-32 text-center">
                    <Loader2 className="animate-spin mx-auto text-indigo-500 mb-4" size={32} />
                    <p className="text-sm font-medium text-slate-500">Loading your logs...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-32 text-center">
                    <ClipboardList className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-lg font-bold text-slate-500">No logs found</p>
                    <p className="text-sm font-medium text-slate-400 mt-1">You haven't logged any hours for this period.</p>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-900">{new Date(log.lecture_date).toLocaleDateString()}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{log.lecture_type}</p>
                    </td>
                    <td className="px-8 py-5 max-w-xs">
                      <p className="text-sm font-medium text-slate-700 line-clamp-2">{log.topic_covered}</p>
                      {log.class_name && (
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{log.class_name}</p>
                      )}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                          {log.start_time && log.end_time ? (() => {
                            const [sh, sm] = log.start_time.split(':').map(Number);
                            const [eh, em] = log.end_time.split(':').map(Number);
                            return Math.round(((eh + em/60) - (sh + sm/60)) * 10) / 10;
                          })() : '-'}
                        </span>
                        {(log.ai_attendance_count || log.manual_attendance_count) && (
                          <div className="flex gap-2 text-[9px] font-bold tracking-widest uppercase">
                            {log.ai_attendance_count && <span className="text-indigo-600">AI: {log.ai_attendance_count}</span>}
                            {log.manual_attendance_count && <span className="text-emerald-600">M: {log.manual_attendance_count}</span>}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        statusColors[log.log_status] || 'bg-slate-100 text-slate-600'
                      )}>
                        {log.log_status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {log.log_status === 'DRAFT' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => dispatch(submitLog(log.id))}
                          className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                        >
                          Submit Log
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {!loading && logs.length > 0 && (
          <div className="flex items-center justify-between px-8 py-5 bg-slate-50 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Showing {(logPage - 1) * logsPerPage + 1} to {Math.min(logPage * logsPerPage, logs.length)} of {logs.length}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLogPage(p => Math.max(1, p - 1))}
                disabled={logPage === 1}
                className="text-[10px] font-bold uppercase tracking-widest bg-white"
              >
                Previous
              </Button>
              <Button 
                variant="outline"
                size="sm" 
                onClick={() => setLogPage(p => Math.min(totalPages, p + 1))}
                disabled={logPage === totalPages}
                className="text-[10px] font-bold uppercase tracking-widest bg-white"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Log Modal */}
      <LogTeachingHourModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateLog}
        timetable={timetable}
        logs={logs}
        isSubmitting={isSubmittingLog}
        user={user}
        faceLocked={faceLocked}
      />
    </div>
  );
};

export default FacultyWorkLogs;
