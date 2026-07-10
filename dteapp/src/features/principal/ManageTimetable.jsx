import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Search, BookOpen, Plus, Loader2, Save, X, Info
} from 'lucide-react';
import { Button } from '../../components/common/UIComponents';
import { cn } from '../../utils/cn';
import { appointmentService } from '../../services/appointmentService';
import attendanceService from '../../services/attendanceService';

const ManageTimetable = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  
  const [timetable, setTimetable] = useState({});
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [error, setError] = useState(null);

  const [academicYear, setAcademicYear] = useState('2026-27');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day_of_week: 'MONDAY',
    slot_number: 1,
    start_time: '10:00',
    end_time: '11:00',
    subject_name: '',
    lecture_type: 'THEORY',
    class_name: ''
  });
  const [savingSlot, setSavingSlot] = useState(false);

  const LECTURE_TYPES = ['THEORY', 'LAB', 'TUTORIAL'];

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.listPrincipalAppointments({ status: 'ACCEPTED' });
      setAppointments(res.data?.items || []);
    } catch (err) {
      setError(err.response?.data?.detail?.message || 'Failed to fetch faculties');
    } finally {
      setLoading(false);
    }
  };

  const loadTimetable = async (faculty) => {
    setSelectedFaculty(faculty);
    if (!faculty?.faculty_credential_id) return;
    
    try {
      setLoadingTimetable(true);
      const res = await attendanceService.getTimetable(faculty.faculty_credential_id, academicYear);
      const rawData = res?.data || [];
      if (Array.isArray(rawData)) {
        const grouped = {};
        rawData.forEach(slot => {
          const day = slot.day_of_week;
          if (day) {
            const dayStr = day.toUpperCase();
            if (!grouped[dayStr]) grouped[dayStr] = [];
            grouped[dayStr].push(slot);
          }
        });
        setTimetable(grouped);
      } else {
        setTimetable(rawData);
      }
    } catch (err) {
      console.error(err);
      setTimetable({});
    } finally {
      setLoadingTimetable(false);
    }
  };

  const handleAddSlot = async () => {
    try {
      if (!newSlot.subject_name) {
        alert('Please enter subject name');
        return;
      }
      setSavingSlot(true);
      
      const payload = {
        faculty_credential_id: selectedFaculty.faculty_credential_id,
        academic_year: academicYear,
        slots: [{
          ...newSlot,
          slot_number: parseInt(newSlot.slot_number)
        }]
      };

      await attendanceService.createTimetableSlot(payload);
      await loadTimetable(selectedFaculty);
      setShowAddModal(false);
      
      // Reset form
      setNewSlot({
        ...newSlot,
        slot_number: parseInt(newSlot.slot_number) + 1,
        subject_name: ''
      });
    } catch (err) {
      alert(err.response?.data?.detail?.message || 'Failed to save timetable slot');
    } finally {
      setSavingSlot(false);
    }
  };

  const renderSlot = (slot) => (
    <div key={slot.id} className="p-4 border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow relative group">
      <div className="absolute top-4 right-4 flex items-center space-x-2">
         <span className={cn(
            "text-[10px] font-bold px-2 py-1 rounded-full",
            slot.lecture_type === 'THEORY' ? "bg-indigo-50 text-indigo-600" :
            slot.lecture_type === 'LAB' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          )}>
            {slot.lecture_type}
          </span>
      </div>
      <div className="flex items-center space-x-2 mb-2 text-slate-500">
        <Clock size={14} />
        <span className="text-xs font-bold uppercase">{slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)}</span>
      </div>
      <h5 className="font-bold text-slate-900 leading-tight pr-12">{slot.subject_name}</h5>
      {slot.class_name && <p className="text-xs text-slate-500 mt-1 font-medium">{slot.class_name}</p>}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
             <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                <Calendar size={24} className="text-white" />
             </div>
             Manage Timetable
          </h1>
          <p className="text-slate-500 font-medium mt-2">Create and assign schedules for your faculties</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Faculty List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 text-lg">Select Faculty</h3>
            
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search faculty..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
              />
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="animate-spin text-indigo-600" />
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-10 text-slate-500 font-medium text-sm">
                  No faculties found.
                </div>
              ) : (
                appointments.map(app => (
                  <div 
                    key={app.id} 
                    onClick={() => loadTimetable(app)}
                    className={cn(
                      "p-4 rounded-2xl border cursor-pointer transition-all",
                      selectedFaculty?.id === app.id 
                        ? "border-indigo-600 bg-indigo-50/50 shadow-sm" 
                        : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50"
                    )}
                  >
                    <h4 className="font-bold text-slate-900">{app.candidate_name || 'Faculty Member'}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">{app.course}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">
                      Joined: {new Date(app.joining_date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Timetable */}
        <div className="lg:col-span-8">
          {selectedFaculty ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedFaculty.candidate_name || 'Faculty Member'}</h2>
                  <p className="text-sm font-medium text-slate-500">{selectedFaculty.course} • AY {academicYear}</p>
                </div>
                <Button 
                  onClick={() => setShowAddModal(true)}
                  className="rounded-xl h-11 px-6 font-bold"
                >
                  <Plus size={18} className="mr-2" /> Add Slot
                </Button>
              </div>

              <div className="p-6 md:p-8 flex-1 bg-slate-50/30">
                {loadingTimetable ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                    <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
                    <p className="font-medium">Loading timetable...</p>
                  </div>
                ) : Object.keys(timetable).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Calendar className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No Schedule Found</h3>
                    <p className="text-slate-500 font-medium max-w-sm">There are no timetable slots assigned to this faculty for the selected academic year.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map(day => (
                      timetable[day] && timetable[day].length > 0 && (
                        <div key={day}>
                          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-600"></span> 
                            {day}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {timetable[day].map(slot => renderSlot(slot))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl h-full flex flex-col items-center justify-center p-12 text-center min-h-[500px]">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                <BookOpen size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Select a Faculty</h3>
              <p className="text-slate-500 font-medium max-w-md">Choose a faculty member from the list to view and manage their weekly timetable.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Add Timetable Slot</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Day</label>
                  <select 
                    value={newSlot.day_of_week}
                    onChange={e => setNewSlot({...newSlot, day_of_week: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Slot #</label>
                  <input 
                    type="number" min="1" max="8"
                    value={newSlot.slot_number}
                    onChange={e => setNewSlot({...newSlot, slot_number: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Start Time</label>
                  <input 
                    type="time" 
                    value={newSlot.start_time}
                    onChange={e => setNewSlot({...newSlot, start_time: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">End Time</label>
                  <input 
                    type="time" 
                    value={newSlot.end_time}
                    onChange={e => setNewSlot({...newSlot, end_time: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Subject Name</label>
                <input 
                  type="text" placeholder="e.g. Data Structures"
                  value={newSlot.subject_name}
                  onChange={e => setNewSlot({...newSlot, subject_name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Type</label>
                  <select 
                    value={newSlot.lecture_type}
                    onChange={e => setNewSlot({...newSlot, lecture_type: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {LECTURE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Class (Optional)</label>
                  <input 
                    type="text" placeholder="e.g. SY BTech"
                    value={newSlot.class_name}
                    onChange={e => setNewSlot({...newSlot, class_name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="rounded-xl border-slate-200 font-bold">
                Cancel
              </Button>
              <Button onClick={handleAddSlot} disabled={savingSlot} className="rounded-xl font-bold px-6">
                {savingSlot ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />} Save Slot
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTimetable;
