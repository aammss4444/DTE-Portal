import React, { useState, useRef } from 'react';
import { X, Users, MapPin, Loader2, Camera, ScanFace, CheckCircle2, Upload } from 'lucide-react';
import { Button } from '../../components/common/UIComponents';
import FaceScanner from '../../components/common/FaceScanner';
import attendanceService from '../../services/attendanceService';
import { toast } from 'react-hot-toast';

const LogTeachingHourModal = ({ isOpen, onClose, onSubmit, timetable, logs = [], isSubmitting, faceLocked, user }) => {
  const [formData, setFormData] = useState({
    log_date: new Date().toISOString().split('T')[0],
    lecture_type: 'THEORY',
    timetable_slot_id: '',
    topic_covered: '',
    hours: 1,
    attendance_count: '',
    subject_name: '',
    slot_number: '',
    is_extra: false,
    latitude: null,
    longitude: null
  });

  const [isPinningLocation, setIsPinningLocation] = useState(false);
  const [aiCount, setAiCount] = useState(null);
  const [isCountingFaces, setIsCountingFaces] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [faceDataUrl, setFaceDataUrl] = useState(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyMode, setVerifyMode] = useState('selfie');
  const uploadInputRef = useRef(null);

  if (!isOpen) return null;

  const handleCreateLog = async (e) => {
    e.preventDefault();
    if (!verifyResult?.face_matched) {
      toast.error('Please verify your face before logging teaching hours');
      return;
    }
    
    if (formData.latitude === null) {
      toast.error('Please pin your location before saving');
      return;
    }

    if (!formData.is_extra && !formData.timetable_slot_id) {
      toast.error('Please select a timetable slot');
      return;
    }

    if (formData.is_extra && !formData.subject_name.trim()) {
      toast.error('Please enter the subject name for the extra lecture');
      return;
    }

    const selectedSlot = !formData.is_extra && formData.timetable_slot_id 
      ? timetable.find(s => s.id === formData.timetable_slot_id)
      : null;

    const payload = {
      faculty_credential_id: user?.id,
      lecture_date: formData.log_date,
      slot_number: formData.is_extra ? parseInt(formData.slot_number) : (selectedSlot?.slot_number || 1),
      subject_name: formData.is_extra ? formData.subject_name : (selectedSlot?.subject_name || ''),
      lecture_type: formData.lecture_type,
      topic_covered: formData.topic_covered,
      hours: formData.hours,
      ai_attendance_count: aiCount,
      manual_attendance_count: formData.attendance_count ? parseInt(formData.attendance_count) : null,
      latitude: formData.latitude,
      longitude: formData.longitude,
      is_extra: formData.is_extra,
      face_image_data_url: faceDataUrl
    };

    onSubmit(payload);
  };

  const handleImageCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsCountingFaces(true);
    try {
      const res = await attendanceService.countFaces(file);
      const count = res?.data?.face_count ?? 0;
      setAiCount(count);
      toast.success(`Counted ${count} students`);
    } catch (err) {
      toast.error('Failed to count faces from image');
    } finally {
      setIsCountingFaces(false);
    }
  };

  const handlePinLocation = () => {
    setIsPinningLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          setIsPinningLocation(false);
          toast.success('Location tagged successfully');
        },
        (error) => {
          setIsPinningLocation(false);
          toast.error('Failed to get location: ' + error.message);
        }
      );
    } else {
      setIsPinningLocation(false);
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const doVerify = async (faceDataUrl) => {
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const res = await attendanceService.verifyFace(faceDataUrl);
      setVerifyResult(res.data);
      if (res.data.face_matched) {
        toast.success('Face verified! Identity confirmed.');
        setFaceDataUrl(faceDataUrl);
      } else {
        toast.error('Face did NOT match your locked profile.');
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Verification failed';
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifySelfie = () => {
    setVerifyResult(null);
    setVerifyMode('selfie');
    setIsVerifyModalOpen(true);
  };

  const handleVerifyUpload = () => {
    setVerifyResult(null);
    setVerifyMode('upload');
    if (uploadInputRef.current) uploadInputRef.current.click();
  };

  const handleUploadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      doVerify(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSelfieVerified = (faceDataUrl) => {
    setIsVerifyModalOpen(false);
    doVerify(faceDataUrl);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 rounded-[32px] w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Log Teaching Hour</h3>
          <button onClick={onClose} className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-full transition-colors text-slate-500 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form id="log-form" onSubmit={handleCreateLog} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Basic Details */}
              <div className="space-y-6">
                <div className="bg-slate-50/50 p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <input 
                      type="checkbox" 
                      id="is_extra" 
                      checked={formData.is_extra} 
                      onChange={(e) => setFormData({...formData, is_extra: e.target.checked})}
                      className="accent-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="is_extra" className="text-sm font-bold text-slate-700 cursor-pointer">This is an extra/unscheduled lecture</label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Log Date</label>
                      <input 
                        type="date"
                        required
                        value={formData.log_date}
                        onChange={(e) => setFormData({...formData, log_date: e.target.value})}
                        className="w-full bg-white border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 transition-colors outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Lecture Type</label>
                      <select 
                        value={formData.lecture_type}
                        onChange={(e) => setFormData({...formData, lecture_type: e.target.value})}
                        className="w-full bg-white border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 transition-colors outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                      >
                        <option value="THEORY">Theory</option>
                        <option value="PRACTICAL">Practical</option>
                        <option value="TUTORIAL">Tutorial</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {!formData.is_extra && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Timetable Slot</label>
                        <select 
                          required={!formData.is_extra}
                          value={formData.timetable_slot_id}
                          onChange={(e) => setFormData({...formData, timetable_slot_id: e.target.value})}
                          className="w-full bg-white border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 transition-colors outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                        >
                        <option value="">Select Slot...</option>
                        {timetable.filter(s => {
                          if (!formData.log_date) return true;
                          
                          const isLogged = logs.some(log => 
                            log.lecture_date === formData.log_date && 
                            log.timetable_slot_id === s.id
                          );
                          if (isLogged) return false;

                          const logDayOfWeek = new Date(formData.log_date).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
                          return s.day_of_week === logDayOfWeek || s.slot_date === formData.log_date || s.slot_date === '1900-01-01' || !s.slot_date;
                        }).map(slot => (
                          <option key={slot.id} value={slot.id}>
                            {(slot.start_time || '').substring(0, 5)} - {slot.subject_name || 'Class'} ({slot.lecture_type})
                          </option>
                        ))}
                        </select>
                      </div>
                    )}
                    {formData.is_extra && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Slot Number</label>
                          <select 
                            required={formData.is_extra}
                            value={formData.slot_number}
                            onChange={(e) => setFormData({...formData, slot_number: e.target.value})}
                            className="w-full bg-white border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 transition-colors outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                          >
                            <option value="">Select Slot</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                              <option key={num} value={num}>Slot {num}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Subject Name</label>
                          <input 
                            type="text"
                            required={formData.is_extra}
                            value={formData.subject_name}
                            onChange={(e) => setFormData({...formData, subject_name: e.target.value})}
                            placeholder="Subject"
                            className="w-full bg-white border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 transition-colors outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                      </>
                    )}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Duration (Hrs)</label>
                      <input 
                        type="number"
                        min="0.5"
                        step="0.5"
                        required
                        value={formData.hours}
                        onChange={(e) => setFormData({...formData, hours: parseFloat(e.target.value)})}
                        className="w-full bg-white border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 transition-colors outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Topic Covered</label>
                    <textarea 
                      required
                      value={formData.topic_covered}
                      onChange={(e) => setFormData({...formData, topic_covered: e.target.value})}
                      placeholder="Describe the topics taught in this session..."
                      className="w-full bg-white border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 h-[6.5rem] resize-none transition-colors outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Attendance & Verification */}
              <div className="space-y-6">
                
                {/* Attendance Card */}
                <div className="bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100 rounded-[24px] p-6 shadow-sm space-y-5">
                  <div>
                    <h4 className="text-sm font-bold text-indigo-900 tracking-tight flex items-center gap-2">
                      <Users size={16} className="text-indigo-600" />
                      Student Attendance
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">Capture an image to automatically count students using AI, or enter manually.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest ml-1">AI Capture</label>
                      <div className="relative">
                        <input 
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageCapture}
                          disabled={isCountingFaces}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className={`w-full bg-white border border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition-all ${isCountingFaces ? 'opacity-50' : ''}`}>
                          {isCountingFaces ? <Loader2 size={16} className="text-indigo-500 animate-spin" /> : <Camera size={16} className="text-indigo-500" />}
                          <span className="text-xs font-bold text-indigo-700 truncate">
                            {isCountingFaces ? 'Counting...' : (aiCount !== null ? `AI Count: ${aiCount}` : 'Capture')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Manual Count</label>
                      <input 
                        type="number"
                        min="0"
                        value={formData.attendance_count}
                        onChange={(e) => setFormData({...formData, attendance_count: e.target.value})}
                        placeholder="e.g. 45"
                        className="w-full bg-white border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 transition-colors outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Pin Location UI */}
                <div className="bg-gradient-to-br from-emerald-50/50 to-white border border-emerald-100 rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-700 tracking-tight flex items-center gap-2">
                      <MapPin size={16} className="text-emerald-600" />
                      Location Tagging
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">Pin your location before saving.</p>
                  </div>

                  {formData.latitude !== null ? (
                    <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                      {/* Map-like background pattern */}
                      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
                      <CheckCircle2 size={24} className="text-emerald-600 relative z-10" />
                      <div className="text-center relative z-10">
                        <p className="text-emerald-700 text-xs font-bold tracking-wider uppercase">Location Locked</p>
                        <p className="text-emerald-600 text-[10px] font-mono mt-1">{formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</p>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      type="button"
                      onClick={handlePinLocation}
                      disabled={isPinningLocation}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white border-none py-3.5 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2"
                    >
                      {isPinningLocation ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Acquiring GPS...
                        </>
                      ) : (
                        <>
                          <MapPin size={16} />
                          Pin Current Location
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Face Verification */}
                <div className="bg-slate-50 border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <ScanFace size={16} />
                      Face Verification
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                      {faceLocked 
                        ? 'Verify your identity to authenticate this log.' 
                        : 'You must lock your face profile on the dashboard before you can verify.'}
                    </p>
                  </div>
                  
                  {verifyResult?.face_matched ? (
                    <div className="w-full bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="text-indigo-800 text-sm font-bold">Identity Verified</p>
                        <p className="text-indigo-600 text-[10px]">Liveness Score: {(verifyResult.liveness_score * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        type="button"
                        onClick={handleVerifySelfie}
                        disabled={!faceLocked || isVerifying}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2"
                      >
                        {isVerifying && verifyMode === 'selfie' ? <Loader2 className="animate-spin" size={16} /> : <Camera size={16} />}
                        Take Selfie
                      </Button>
                      
                      <Button 
                        type="button"
                        onClick={handleVerifyUpload}
                        disabled={!faceLocked || isVerifying}
                        className="flex-1 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 border border-slate-200 py-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2"
                      >
                        {isVerifying && verifyMode === 'upload' ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                        Upload Image
                      </Button>
                      <input 
                        type="file" 
                        ref={uploadInputRef} 
                        onChange={handleUploadFile} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                  )}
                  {verifyResult && !verifyResult.face_matched && (
                    <p className="text-rose-500 text-xs font-bold text-center">Verification Failed. Try again.</p>
                  )}
                </div>
                
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <Button type="button" variant="outline" onClick={onClose} className="px-6 py-3 border-slate-200 text-slate-600 hover:bg-slate-50">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !verifyResult?.face_matched || formData.latitude === null}
                className="px-8 py-3 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 font-black tracking-wide"
              >
                {isSubmitting ? 'SAVING...' : 'SAVE LOG ENTRY'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <FaceScanner 
            onLivenessVerified={handleSelfieVerified}
            onCancel={() => setIsVerifyModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default LogTeachingHourModal;
