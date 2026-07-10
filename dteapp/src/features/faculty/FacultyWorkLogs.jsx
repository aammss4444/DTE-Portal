import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLogs, bulkSubmit, createLog, fetchTimetable } from './attendanceSlice';
import { Button } from '../../components/common/UIComponents';
import { Loader2, MoreVertical, ClipboardList, Calendar as CalendarIcon, Filter, Plus, X, Camera, MapPin, ScanFace, CheckCircle2 } from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import { cn } from '../../utils/cn';
import FaceScanner from '../../components/common/FaceScanner';

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
  const [formData, setFormData] = useState({
    faculty_credential_id: user?.id || '',
    timetable_slot_id: '',
    log_date: new Date().toISOString().split('T')[0],
    lecture_type: 'THEORY',
    topic_covered: '',
    hours: 1,
    attendance_count: '',
    ai_attendance_count: '',
    manual_attendance_count: '',
    latitude: null,
    longitude: null,
    is_extra: false
  });
  const [isCountingFaces, setIsCountingFaces] = useState(false);
  const [isTaggingLocation, setIsTaggingLocation] = useState(false);

  // Face verification states
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [faceLocked, setFaceLocked] = useState(!!user?.face_registered);

  const handleTagLocation = () => {
    setIsTaggingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          setIsTaggingLocation(false);
          import('react-hot-toast').then(toast => toast.toast.success('Location tagged successfully'));
        },
        (error) => {
          setIsTaggingLocation(false);
          import('react-hot-toast').then(toast => toast.toast.error('Failed to get location: ' + error.message));
        }
      );
    } else {
      setIsTaggingLocation(false);
      import('react-hot-toast').then(toast => toast.toast.error('Geolocation is not supported by your browser'));
    }
  };

  const handleVerifySelfie = () => {
    setVerifyResult(null);
    setIsVerifyModalOpen(true);
  };

  const handleSelfieVerified = (faceDataUrl) => {
    setIsVerifyModalOpen(false);
    doVerify(faceDataUrl);
  };

  const doVerify = async (faceDataUrl) => {
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const res = await attendanceService.verifyFace(faceDataUrl);
      setVerifyResult(res.data);
      if (res.data.face_matched) {
        import('react-hot-toast').then(t => t.toast.success('Face verified! Identity confirmed.'));
      } else {
        import('react-hot-toast').then(t => t.toast.error('Face did NOT match your locked profile.'));
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Verification failed';
      import('react-hot-toast').then(t => t.toast.error(msg));
    } finally {
      setIsVerifying(false);
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

  const handleCreateLog = async (e) => {
    e.preventDefault();
    const dataToSubmit = { ...formData, faculty_credential_id: user.id };
    if (dataToSubmit.is_extra) {
      dataToSubmit.timetable_slot_id = null;
      dataToSubmit.slot_number = 1; // Default
    } else {
      // Find the slot to get slot_number
      let slot_number = 1;
      const slot = (timetable || []).find(s => s.id === dataToSubmit.timetable_slot_id);
      if (slot) {
        slot_number = slot.slot_number;
        dataToSubmit.subject_name = slot.subject_name;
        dataToSubmit.class_name = slot.class_name;
      }
      dataToSubmit.slot_number = slot_number;
    }
    
    // Map log_date to lecture_date for backend
    dataToSubmit.lecture_date = dataToSubmit.log_date;
    delete dataToSubmit.log_date;
    
    // Handle null coordinates
    dataToSubmit.latitude = dataToSubmit.latitude || 0.0;
    dataToSubmit.longitude = dataToSubmit.longitude || 0.0;

    // Convert empty string counts to null
    dataToSubmit.ai_attendance_count = dataToSubmit.ai_attendance_count ? parseInt(dataToSubmit.ai_attendance_count) : null;
    dataToSubmit.manual_attendance_count = dataToSubmit.manual_attendance_count ? parseInt(dataToSubmit.manual_attendance_count) : null;

    // Set the final attendance_count to manual if provided, otherwise AI.
    dataToSubmit.attendance_count = dataToSubmit.manual_attendance_count || dataToSubmit.ai_attendance_count || null;
    
    const result = await dispatch(createLog(dataToSubmit));
    if (!result.error) {
      setIsModalOpen(false);
      setVerifyResult(null); // Reset for next log
      dispatch(fetchLogs({ month: selectedMonth, academicYear: '2026-27' }));
    }
  };

  const handleImageCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsCountingFaces(true);
    try {
      const response = await attendanceService.countFaces(file);
      if (response.status === 'success') {
        setFormData(prev => ({ 
          ...prev, 
          ai_attendance_count: response.data.face_count 
        }));
        import('react-hot-toast').then(toast => toast.toast.success(`AI counted ${response.data.face_count} students`));
      } else {
        import('react-hot-toast').then(toast => toast.toast.error(response.message || 'Failed to process image'));
      }
    } catch (error) {
      import('react-hot-toast').then(toast => toast.toast.error('Error counting faces'));
    } finally {
      setIsCountingFaces(false);
    }
  };

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
                      <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-white border-transparent">
                        <MoreVertical size={16} className="text-slate-400" />
                      </Button>
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
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-4 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Log Teaching Hour</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateLog} className="p-5 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <input 
                  type="checkbox" 
                  id="is_extra" 
                  checked={formData.is_extra} 
                  onChange={(e) => setFormData({...formData, is_extra: e.target.checked})}
                />
                <label htmlFor="is_extra" className="text-sm font-bold text-slate-700">This is an extra/unscheduled lecture</label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Log Date</label>
                  <input 
                    type="date"
                    required
                    value={formData.log_date}
                    onChange={(e) => setFormData({...formData, log_date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lecture Type</label>
                  <select 
                    value={formData.lecture_type}
                    onChange={(e) => setFormData({...formData, lecture_type: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold"
                  >
                    <option value="THEORY">Theory</option>
                    <option value="LAB">Lab</option>
                    <option value="TUTORIAL">Tutorial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {!formData.is_extra && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Timetable Slot</label>
                    <select 
                      required
                      value={formData.timetable_slot_id}
                      onChange={(e) => setFormData({...formData, timetable_slot_id: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold"
                    >
                    <option value="">Select Slot...</option>
                    {(timetable || []).map(slot => (
                      <option key={slot.id} value={slot.id}>
                        {slot.day_of_week || 'Class'} - {slot.start_time?.substring(0,5)} ({slot.subject_name || 'Class'})
                      </option>
                    ))}
                    </select>
                  </div>
                )}
                {formData.is_extra && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Subject Name</label>
                    <input 
                      type="text"
                      required
                      value={formData.subject_name || ''}
                      onChange={(e) => setFormData({...formData, subject_name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold"
                      placeholder="Subject"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Duration (Hours)</label>
                  <input 
                    type="number"
                    min="0.5"
                    step="0.5"
                    required
                    value={formData.hours}
                    onChange={(e) => setFormData({...formData, hours: parseFloat(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Topic Covered</label>
                <textarea 
                  required
                  value={formData.topic_covered}
                  onChange={(e) => setFormData({...formData, topic_covered: e.target.value})}
                  placeholder="Describe the topics taught in this session..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium h-16"
                />
              </div>

              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-3 space-y-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Student Attendance</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Capture an image to automatically count students using AI, or enter manually.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-1">AI Face Count Capture</label>
                    <div className="relative">
                      <input 
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageCapture}
                        disabled={isCountingFaces}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <div className={`w-full bg-white border border-indigo-200 hover:border-indigo-400 rounded-xl px-4 py-2 flex items-center justify-center gap-2 transition-colors ${isCountingFaces ? 'opacity-50' : ''}`}>
                        {isCountingFaces ? <Loader2 size={16} className="text-indigo-500 animate-spin" /> : <Camera size={16} className="text-indigo-500" />}
                        <span className="text-xs font-bold text-indigo-600">
                          {isCountingFaces ? 'Counting...' : (formData.ai_attendance_count ? `AI Count: ${formData.ai_attendance_count}` : 'Capture Image')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Manual Count</label>
                    <input 
                      type="number"
                      min="0"
                      value={formData.manual_attendance_count}
                      onChange={(e) => setFormData({...formData, manual_attendance_count: e.target.value ? parseInt(e.target.value) : ''})}
                      placeholder="e.g. 45"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Location Tagging</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Please tag your current location before saving.</p>
                  </div>
                  <Button 
                    type="button" 
                    variant={formData.latitude ? "outline" : "primary"}
                    onClick={handleTagLocation}
                    disabled={isTaggingLocation}
                    className="text-xs"
                  >
                    {isTaggingLocation ? <Loader2 className="animate-spin mr-2" size={14} /> : <MapPin size={14} className="mr-2" />}
                    {formData.latitude ? 'Retag Location' : 'Tag Location'}
                  </Button>
                </div>
                {formData.latitude && (
                  <p className="text-xs font-bold text-emerald-600">
                    Location captured: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </p>
                )}
              </div>

              {/* Faculty Face Verification UI */}
              <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Faculty Face Verification</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {faceLocked 
                      ? "Please verify your identity to submit." 
                      : "Lock your profile on dashboard first to verify."}
                  </p>
                </div>
                <Button 
                  type="button"
                  onClick={handleVerifySelfie}
                  disabled={!faceLocked || isVerifying || verifyResult?.face_matched}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all",
                    verifyResult?.face_matched 
                      ? "bg-emerald-100 text-emerald-700 border-none opacity-100 cursor-default" 
                      : "bg-indigo-500 hover:bg-indigo-600 text-white border-none shadow-md shadow-indigo-500/20"
                  )}
                >
                  {isVerifying ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : verifyResult?.face_matched ? (
                    <>
                      <CheckCircle2 size={14} className="mr-1.5" />
                      Verified
                    </>
                  ) : (
                    <>
                      <ScanFace size={14} className="mr-1.5" />
                      Verify Face
                    </>
                  )}
                </Button>
              </div>

              {verifyResult && !verifyResult.face_matched && (
                <div className="text-rose-500 text-xs font-bold text-center mt-2">
                  ❌ Verification Failed — Face does NOT match your locked profile.
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="!bg-black !text-white hover:!bg-slate-800 disabled:opacity-50"
                  disabled={!formData.latitude || !formData.longitude || !verifyResult?.face_matched}
                >
                  Save as Draft
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Face Verify via Selfie Modal */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-lg">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Verify Your Identity</h2>
            <p className="text-slate-300 text-center text-sm mb-6 max-w-md mx-auto">
              Take a selfie to verify your face against the locked profile.
            </p>
            <FaceScanner 
              onLivenessVerified={handleSelfieVerified} 
              onCancel={() => setIsVerifyModalOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyWorkLogs;
