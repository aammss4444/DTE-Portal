import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Save, 
  Loader2, 
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Building2
} from 'lucide-react';
import { Button, Select } from '../../components/common/UIComponents';
import { fetchCalendar, upsertCalendar } from '../faculty/attendanceSlice';
import { fetchInstitutions } from './institutionSlice';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const AcademicCalendar = () => {
  const dispatch = useDispatch();
  const { calendar, loading } = useSelector((state) => state.attendance);
  const { institutions } = useSelector((state) => state.institutions);
  const { user } = useSelector((state) => state.auth);

  const [selectedYear, setSelectedYear] = useState('2026-27');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedInst, setSelectedInst] = useState(user?.institution_id || '');
  const [editMode, setEditMode] = useState(false);
  const [localCalendar, setLocalCalendar] = useState([]);

  // Days mapping
  const daysInMonth = (year, month) => new Date(year, month, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month - 1, 1).getDay();

  const currentYear = parseInt(selectedYear.split('-')[0]) + (selectedMonth > 5 ? 0 : 1);

  useEffect(() => {
    if (institutions.length === 0 && user?.role === 'ADMIN') {
      dispatch(fetchInstitutions({ page: 1, limit: 100 }));
    }
  }, [dispatch, institutions.length, user?.role]);

  useEffect(() => {
    if (selectedInst && selectedYear && selectedMonth) {
      dispatch(fetchCalendar({ 
        institutionId: selectedInst, 
        academicYear: selectedYear, 
        month: selectedMonth 
      }));
    }
  }, [dispatch, selectedInst, selectedYear, selectedMonth]);

  useEffect(() => {
    if (calendar) {
      setLocalCalendar(calendar);
    }
  }, [calendar]);

  const handleDayTypeChange = (dateStr, type) => {
    const existingIdx = localCalendar.findIndex(c => c.calendar_date === dateStr);
    const newLocal = [...localCalendar];
    
    if (existingIdx > -1) {
      newLocal[existingIdx] = { ...newLocal[existingIdx], day_type: type };
    } else {
      newLocal.push({ calendar_date: dateStr, day_type: type, description: '' });
    }
    setLocalCalendar(newLocal);
  };

  const handleSave = async () => {
    try {
      await dispatch(upsertCalendar({
        institutionId: selectedInst,
        academicYear: selectedYear,
        entries: localCalendar
      })).unwrap();
      setEditMode(false);
    } catch (err) {
      // toast already handled in slice
    }
  };

  const getDayType = (dateStr) => {
    const entry = localCalendar.find(c => c.calendar_date === dateStr);
    return entry?.day_type || 'WORKING_DAY';
  };

  const renderCalendar = () => {
    const numDays = daysInMonth(currentYear, selectedMonth);
    const firstDay = firstDayOfMonth(currentYear, selectedMonth);
    const days = [];

    // Empty cells for alignment
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-slate-50/50 border border-slate-100" />);
    }

    // Actual days
    for (let d = 1; d <= numDays; d++) {
      const dateStr = `${currentYear}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const type = getDayType(dateStr);
      
      const typeStyles = {
        'WORKING_DAY': 'bg-white border-slate-100',
        'HOLIDAY': 'bg-rose-50 border-rose-100 text-rose-700',
        'VACATION': 'bg-indigo-50 border-indigo-100 text-indigo-700',
        'SUNDAY': 'bg-slate-100 border-slate-200 text-slate-500'
      };

      days.push(
        <div 
          key={d} 
          className={cn(
            "h-24 p-3 border transition-all relative flex flex-col justify-between group",
            typeStyles[type] || typeStyles.WORKING_DAY,
            editMode && "cursor-pointer hover:shadow-md hover:z-10"
          )}
          onClick={() => {
            if (editMode) {
              const nextType = type === 'WORKING_DAY' ? 'HOLIDAY' : type === 'HOLIDAY' ? 'VACATION' : 'WORKING_DAY';
              handleDayTypeChange(dateStr, nextType);
            }
          }}
        >
          <span className="text-sm font-black">{d}</span>
          
          <div className="flex flex-col gap-1">
             {type !== 'WORKING_DAY' && (
               <span className="text-[9px] font-black uppercase tracking-tighter">
                 {type}
               </span>
             )}
             {editMode && (
               <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" title="Working" />
                  <div className="w-2 h-2 rounded-full bg-rose-500" title="Holiday" />
                  <div className="w-2 h-2 rounded-full bg-indigo-500" title="Vacation" />
               </div>
             )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Academic <span className="text-indigo-600">Calendar</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Configure institutional holidays, vacations, and academic sessions.
          </p>
        </div>
        
        <div className="flex gap-3">
          {editMode ? (
            <>
              <Button 
                onClick={() => { setEditMode(false); setLocalCalendar(calendar); }}
                variant="outline"
                className="rounded-2xl font-black border-slate-200 text-slate-500"
              >
                CANCEL
              </Button>
              <Button 
                onClick={handleSave}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 flex items-center px-8"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="mr-2" />}
                SAVE CHANGES
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setEditMode(true)}
              className="bg-slate-900 hover:bg-black text-white rounded-2xl font-black shadow-lg shadow-slate-200 flex items-center px-8"
            >
              <Plus size={20} className="mr-2" />
              SETUP CALENDAR
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Building2 size={28} />
          </div>
          
          <div className="flex-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Institution</label>
            <div className="relative">
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-black outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                value={selectedInst}
                onChange={(e) => setSelectedInst(e.target.value)}
                disabled={user?.role !== 'ADMIN'}
              >
                <option value="">Select Institution...</option>
                {user?.role !== 'ADMIN' ? (
                   <option value={user?.institution_id}>My Institution</option>
                ) : (
                  institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))
                )}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Filter size={16} className="text-slate-400" />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-48">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Session</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-black outline-none focus:border-indigo-500 appearance-none cursor-pointer"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2026-27">2026-27</option>
              <option value="2025-26">2025-26</option>
            </select>
          </div>

          <div className="w-full lg:w-48">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Month</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-black outline-none focus:border-indigo-500 appearance-none cursor-pointer"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>
                  {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Legend & Hint */}
      {editMode && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top-4">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-4 h-4 rounded-md bg-white border border-slate-200" />
                 <span className="text-[10px] font-black uppercase text-slate-500">Working Day</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-4 h-4 rounded-md bg-rose-500 shadow-lg shadow-rose-200" />
                 <span className="text-[10px] font-black uppercase text-rose-600">Holiday</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-4 h-4 rounded-md bg-indigo-500 shadow-lg shadow-indigo-200" />
                 <span className="text-[10px] font-black uppercase text-indigo-600">Vacation</span>
              </div>
           </div>
           <p className="text-xs font-bold text-indigo-900 flex items-center">
             <Info size={14} className="mr-2" />
             Click on a date to toggle its type
           </p>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-1 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-900 text-white p-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest opacity-60">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 min-h-[500px]">
          {renderCalendar()}
        </div>
      </div>

      {!selectedInst && (
        <div className="py-20 text-center space-y-4">
           <CalendarIcon size={48} className="mx-auto text-slate-200" />
           <p className="text-slate-400 font-bold">Select an institution to view the academic calendar.</p>
        </div>
      )}
    </div>
  );
};

export default AcademicCalendar;
