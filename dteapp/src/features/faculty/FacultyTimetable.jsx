import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BookOpen, Loader2, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchTimetable, fetchLogs } from './attendanceSlice';
import { cn } from '../../utils/cn';

const FacultyTimetable = () => {
  const dispatch = useDispatch();
  const { timetableByDay, logs, loading } = useSelector((state) => state.attendance);
  const { user } = useSelector((state) => state.auth);

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchTimetable({ academicYear: '2026-27' }));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user?.id) {
      // Fetch logs for the current month
      dispatch(fetchLogs({ 
        month: currentDate.getMonth() + 1,
        academicYear: '2026-27'
      }));
    }
  }, [dispatch, user, currentDate]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Helper to check if a slot on a specific date is logged
  const getLogForSlot = (date, slotId) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return logs.find(log => log.lecture_date === dateStr && log.timetable_slot_id === slotId);
  };

  const isToday = (date) => {
    const today = new Date();
    return date === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  };

  const isPast = (date) => {
    const today = new Date();
    const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
    // Return true if cellDate is strictly before today (ignoring time)
    today.setHours(0,0,0,0);
    return cellDate < today;
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Timetable Calendar</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Track your scheduled classes and teaching logs.</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          <button onClick={prevMonth} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm text-slate-600">
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-slate-800 w-32 text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm text-slate-600">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {loading && Object.keys(timetableByDay || {}).length === 0 ? (
        <div className="flex items-center justify-center py-32 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
        </div>
      ) : Object.keys(timetableByDay || {}).length === 0 ? (
        <div className="text-center py-32 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <BookOpen size={64} className="mx-auto text-slate-300 mb-6" />
          <p className="text-slate-500 font-bold text-xl">No timetable assigned yet.</p>
          <p className="text-slate-400 text-sm mt-2">Contact your principal to set up your schedule.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
            {shortDayNames.map(day => (
              <div key={day} className="py-4 text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 bg-slate-100 gap-px">
            {/* Empty cells before month start */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white min-h-[160px] opacity-50" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = i + 1;
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
              
              const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
              const dayOfWeek = dayNames[cellDate.getDay()];
              const slots = timetableByDay[dayOfWeek] || [];
              
              const today = isToday(date);
              const past = isPast(date);

              return (
                <div key={date} className={cn(
                  "bg-white min-h-[160px] p-2 flex flex-col transition-colors",
                  today && "bg-indigo-50/30"
                )}>
                  <div className="flex justify-between items-start p-1 mb-2">
                    <span className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                      today ? "bg-indigo-600 text-white shadow-md" : "text-slate-700"
                    )}>
                      {date}
                    </span>
                    {slots.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                        {slots.length} Classes
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
                    {slots.map(slot => {
                      const log = getLogForSlot(date, slot.id);
                      const isPending = (past || today) && !log;
                      
                      return (
                        <div key={slot.id} className={cn(
                          "p-2.5 rounded-xl border flex flex-col gap-1.5 transition-all",
                          log ? "bg-emerald-50/50 border-emerald-100" : 
                          isPending ? "bg-rose-50/50 border-rose-100 shadow-sm" : 
                          "bg-slate-50 border-slate-100"
                        )}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500">
                              {slot.start_time.substring(0,5)}
                            </span>
                            {log ? (
                              <CheckCircle2 size={12} className="text-emerald-500" />
                            ) : isPending ? (
                              <AlertCircle size={12} className="text-rose-500" />
                            ) : null}
                          </div>
                          <p className={cn(
                            "text-xs font-bold line-clamp-1",
                            log ? "text-emerald-900" : isPending ? "text-rose-900" : "text-slate-700"
                          )}>
                            {slot.subject_name || slot.lecture_type}
                          </p>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                              {slot.class_name || 'Class'}
                            </span>
                            {log && (
                              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">
                                Logged
                              </span>
                            )}
                            {isPending && (
                              <span className="text-[9px] font-bold uppercase tracking-widest text-rose-600">
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            {/* Empty cells after month end to fill grid */}
            {Array.from({ length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7 }).map((_, i) => (
              <div key={`empty-end-${i}`} className="bg-white min-h-[160px] opacity-50" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyTimetable;
