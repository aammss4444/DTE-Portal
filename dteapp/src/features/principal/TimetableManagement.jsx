import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  User, 
  Building2,
  BookOpen,
  ArrowRight,
  Filter,
  CheckCircle2,
  Edit2
} from 'lucide-react';
import { Button, Input, Select } from '../../components/common/UIComponents';
import { fetchTimetable, createTimetable, updateTimetableSlot } from '../faculty/attendanceSlice';
import { getAppointedFaculties } from './facultySlice';
import { fetchCourses } from '../admin/courseSlice';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const LECTURE_TYPES = [
  { value: 'THEORY', label: 'Theory' },
  { value: 'PRACTICAL', label: 'Practical/Lab' },
  { value: 'TUTORIAL', label: 'Tutorial' }
];

const DAYS_OF_WEEK = [
  { label: 'MONDAY', value: 1 },
  { label: 'TUESDAY', value: 2 },
  { label: 'WEDNESDAY', value: 3 },
  { label: 'THURSDAY', value: 4 },
  { label: 'FRIDAY', value: 5 },
  { label: 'SATURDAY', value: 6 },
  { label: 'SUNDAY', value: 0 }
];

const getNextDateForDay = (targetDay) => {
  const today = new Date();
  const currentDay = today.getDay();
  let distance = targetDay - currentDay;
  if (distance < 0) distance += 7;
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + distance);
  // Correct timezone offset for toISOString
  const offset = nextDate.getTimezoneOffset();
  const localDate = new Date(nextDate.getTime() - (offset*60*1000));
  return localDate.toISOString().split('T')[0];
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
};

const TimetableManagement = () => {
  const dispatch = useDispatch();
  const { timetable, loading } = useSelector((state) => state.attendance);
  const { chbFacultyList = [] } = useSelector((state) => state.faculty);
  const { courses } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);

  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026-27');
  const [slots, setSlots] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user?.role === 'PRINCIPAL') {
      if (courses.length === 0) {
        dispatch(fetchCourses({ institutionId: user.institution_id }));
      }
      dispatch(getAppointedFaculties({ 
        course_id: selectedCourse || undefined,
        academic_year: selectedYear
      }));
    }
  }, [dispatch, courses.length, user, selectedCourse, selectedYear]);

  // If faculty, auto-select self
  useEffect(() => {
    if (user?.role === 'FACULTY') {
      // Use faculty_credential_id from user object if available, otherwise fallback
      const credId = user.faculty_credential_id || user.id;
      setSelectedFaculty(credId);
    }
  }, [user]);

  useEffect(() => {
    if (selectedFaculty && selectedYear) {
      dispatch(fetchTimetable({ 
        facultyCredentialId: selectedFaculty, 
        academicYear: selectedYear,
        isMy: user?.role === 'FACULTY'
      }));
    }
  }, [dispatch, selectedFaculty, selectedYear, user?.role]);

  useEffect(() => {
    if (Array.isArray(timetable)) {
      setSlots(timetable.map(s => ({ ...s, id: s.id || Math.random() })));
    }
  }, [timetable]);

  const addSlotForDayOfWeek = (dayValue) => {
    const defaultDate = getNextDateForDay(dayValue);
    const dateSlots = slots.filter(s => s.slot_date === defaultDate);
    const nextSlotNumber = Math.min(dateSlots.length + 1, 8);

    setSlots([...slots, {
      id: Math.random(),
      slot_date: defaultDate,
      slot_number: nextSlotNumber,
      start_time: '09:00',
      end_time: '10:00',
      subject_name: '',
      lecture_type: 'THEORY',
      class_name: '',
      is_active: true,
      isNew: true
    }]);
  };

  const removeSlot = (id) => {
    setSlots(slots.filter(s => s.id !== id));
  };

  const handleSlotChange = (id, field, value) => {
    setSlots(slots.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSaveBulk = async () => {
    if (!selectedFaculty) return toast.error('Select a faculty first');
    
    const payload = {
      faculty_credential_id: selectedFaculty,
      institution_id: user?.institution_id || 1,
      academic_year: selectedYear,
      slots: slots.map(({ id, isNew, day_of_week, day, ...rest }) => {
        const payloadSlot = {
          ...rest,
          slot_date: rest.slot_date
        };
        // Only attach ID if it's not a newly created random ID
        if (!isNew && typeof id === 'string' && id.includes('-')) {
          payloadSlot.id = id;
        }
        return payloadSlot;
      })
    };

    try {
      await dispatch(createTimetable(payload)).unwrap();
      setIsEditing(false);
      dispatch(fetchTimetable({ 
        facultyCredentialId: selectedFaculty, 
        academicYear: selectedYear,
        isMy: user?.role === 'FACULTY'
      }));
    } catch (err) {
      // toast handled in slice
    }
  };

  const handleUpdateSlot = async (slot) => {
    try {
      await dispatch(updateTimetableSlot({ 
        slotId: slot.id, 
        slotData: {
          start_time: slot.start_time,
          end_time: slot.end_time,
          subject_name: slot.subject_name,
          lecture_type: slot.lecture_type,
          class_name: slot.class_name,
          is_active: slot.is_active
        }
      })).unwrap();
    } catch (err) {}
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Timetable <span className="text-indigo-600">Management</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Configure weekly schedules and teaching loads for faculty members.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (selectedFaculty && selectedYear) {
                dispatch(fetchTimetable({ 
                  facultyCredentialId: selectedFaculty, 
                  academicYear: selectedYear,
                  isMy: user?.role === 'FACULTY'
                }));
              }
            }}
            className="h-14 w-14 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
            title="Refresh Timetable"
          >
            <Clock size={20} />
          </button>
          {user?.role === 'PRINCIPAL' && (
            isEditing ? (
              <>
                <Button variant="outline" onClick={() => { setIsEditing(false); dispatch(fetchTimetable({ facultyCredentialId: selectedFaculty, academicYear: selectedYear, isMy: user?.role === 'FACULTY' })); }} className="rounded-2xl font-black border-slate-200">CANCEL</Button>
                <Button onClick={handleSaveBulk} disabled={loading} className="bg-black hover:bg-slate-900 active:scale-[0.98] text-white rounded-2xl font-black shadow-lg shadow-slate-200 flex items-center px-8 transition-all">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="mr-2" />}
                  PUBLISH TIMETABLE
                </Button>
              </>
            ) : (
              <Button onClick={() => { setIsEditing(true); addSlot(); }} className="bg-slate-900 hover:bg-black text-white rounded-2xl font-black shadow-lg shadow-slate-200 flex items-center px-8">
                <Edit2 size={18} className="mr-2" />
                MODIFY SCHEDULE
              </Button>
            )
          )}
        </div>
      </div>

      {/* Selection Area */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {user?.role === 'PRINCIPAL' && (
            <div className="w-full lg:w-64">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Filter By Course</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-black outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setSelectedFaculty(''); // Reset faculty when course changes
                }}
              >
                <option value="">All Courses</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Faculty Member</label>
            <div className="relative">
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-black outline-none focus:border-indigo-500 appearance-none cursor-pointer disabled:opacity-70"
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                disabled={user?.role !== 'PRINCIPAL'}
              >
                <option value="">Select Faculty...</option>
                {user?.role === 'FACULTY' ? (
                  <option value={user.id}>{user.full_name}</option>
                ) : (
                  chbFacultyList
                    .filter(f => f.credentials_issued)
                    .map(f => (
                      <option key={f.id} value={f.faculty_credential_id}>
                        {f.candidate_name} ({f.course})
                      </option>
                    ))
                )}
              </select>
              {user?.role === 'PRINCIPAL' && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Filter size={16} className="text-slate-400" />
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-48">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Academic Session</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-black outline-none focus:border-indigo-500 appearance-none cursor-pointer"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2026-27">2026-27</option>
              <option value="2025-26">2025-26</option>
            </select>
          </div>
        </div>
      </div>

      {selectedFaculty && (
        <div className="space-y-6">
          {user?.role === 'PRINCIPAL' && (
            <div className="flex items-center gap-3 px-2">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <User size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Managing Timetable For</p>
                <h2 className="text-xl font-black text-slate-900">
                  {chbFacultyList.find(f => String(f.faculty_credential_id) === String(selectedFaculty))?.candidate_name || 'Selected Faculty'}
                </h2>
              </div>
            </div>
          )}

          {/* Timetable Grid */}
          <div className="grid grid-cols-1 gap-8">
        {DAYS_OF_WEEK.map(dayObj => {
          const daySlots = slots.filter(s => new Date(s.slot_date).getDay() === dayObj.value);
          
          if (!isEditing && daySlots.length === 0) return null;

          return (
            <div key={dayObj.label} className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm transition-all hover:shadow-md">
              <div className="bg-slate-900 px-8 py-4 flex items-center justify-between">
                 <h3 className="text-white font-black uppercase tracking-[0.1em] text-xs flex items-center">
                   <CalendarIcon size={14} className="mr-2" />
                   {dayObj.label}
                 </h3>
              </div>
              
              <div className="p-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {daySlots.map(slot => (
                     <div key={slot.id} className={cn(
                       "p-6 rounded-3xl border transition-all relative group",
                       slot.is_active ? "bg-slate-50 border-slate-100" : "bg-slate-100/50 border-slate-200 grayscale opacity-60"
                     )}>
                        {isEditing ? (
                          <div className="space-y-4">
                             <Input 
                               type="date" 
                               value={slot.slot_date} 
                               onChange={(e) => handleSlotChange(slot.id, 'slot_date', e.target.value)}
                               className="bg-white"
                             />
                             <div className="flex gap-2">
                                <Input 
                                  type="time" 
                                  value={slot.start_time} 
                                  onChange={(e) => handleSlotChange(slot.id, 'start_time', e.target.value)}
                                  className="bg-white"
                                />
                                <div className="flex items-center text-slate-300"><ArrowRight size={14} /></div>
                                <Input 
                                  type="time" 
                                  value={slot.end_time} 
                                  onChange={(e) => handleSlotChange(slot.id, 'end_time', e.target.value)}
                                  className="bg-white"
                                />
                             </div>
                             <Input 
                              placeholder="Subject Name" 
                              value={slot.subject_name} 
                              onChange={(e) => handleSlotChange(slot.id, 'subject_name', e.target.value)}
                              className="bg-white"
                             />
                             <div className="grid grid-cols-2 gap-2">
                                <select 
                                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                                  value={slot.lecture_type}
                                  onChange={(e) => handleSlotChange(slot.id, 'lecture_type', e.target.value)}
                                >
                                  {LECTURE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                                <Input 
                                  placeholder="Class" 
                                  value={slot.class_name} 
                                  onChange={(e) => handleSlotChange(slot.id, 'class_name', e.target.value)}
                                  className="bg-white text-xs"
                                />
                             </div>
                             <button onClick={() => removeSlot(slot.id)} className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                <Trash2 size={14} />
                             </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between mb-4">
                               <div className="flex flex-col text-indigo-600">
                                 <span className="text-[10px] font-black uppercase text-slate-400 mb-1">{formatDate(slot.slot_date)}</span>
                                 <div className="flex items-center">
                                   <Clock size={14} className="mr-2" />
                                   <span className="text-xs font-black tracking-tighter">{slot.start_time} - {slot.end_time}</span>
                                 </div>
                               </div>
                               <span className={cn(
                                 "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter",
                                 slot.lecture_type === 'THEORY' ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
                               )}>
                                 {slot.lecture_type}
                               </span>
                            </div>
                            <h4 className="text-sm font-black text-slate-900 mb-1">{slot.subject_name || 'No Subject Set'}</h4>
                            <div className="flex items-center text-[10px] font-bold text-slate-400">
                               <Building2 size={12} className="mr-1" /> {slot.class_name || 'TBA'}
                            </div>
                          </>
                        )}
                     </div>
                   ))}
                   {isEditing && (
                      <button
                        onClick={() => addSlotForDayOfWeek(dayObj.value)}
                        className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all min-h-[200px]"
                      >
                        <Plus size={24} className="mb-2" />
                        <span className="font-bold text-sm uppercase tracking-widest">Add Slot</span>
                      </button>
                   )}
                 </div>
              </div>
            </div>
          );
        })}
        {slots.length === 0 && !isEditing && (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center">
             <CalendarIcon size={48} className="text-slate-200 mb-4" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-6">No lectures scheduled</p>
          </div>
        )}
      </div>
        </div>
      )}

      {!selectedFaculty && (
        <div className="py-20 text-center space-y-4">
           <CalendarIcon size={48} className="mx-auto text-slate-200" />
           <p className="text-slate-400 font-bold">Select a faculty member to manage their timetable.</p>
        </div>
      )}
    </div>
  );
};

export default TimetableManagement;
