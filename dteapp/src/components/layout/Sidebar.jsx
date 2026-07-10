import { useSelector, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Briefcase,
  GraduationCap,
  BookOpen,
  Calendar,
  LogOut,
  Sparkles,
  ClipboardList,
  School,
  Calculator,
  UserCheck,
  Award,
  UserCircle
} from 'lucide-react';
import { setSidebar } from '../../features/ui/uiSlice';
import { logout } from '../../features/auth/authSlice';
import { ROLES } from '../../constants/roles';
import { cn } from '../../utils/cn';
import logo from '../../assets/logo.gif';

const Sidebar = () => {
  const { isSidebarOpen } = useSelector((state) => state.ui);
  const { role, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const menuItems = {
    [ROLES.ADMIN]: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
      { name: 'Faculty Calculator', icon: Calculator, path: '/admin/ai-assistant' },
      { name: 'User Management', icon: Users, path: '/admin/users' },
      { name: 'Advertisements', icon: FileText, path: '/admin/ads' },
      { name: 'Billing', icon: Briefcase, path: '/admin/billing' },

    ],
    [ROLES.PRINCIPAL]: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/principal/dashboard' },
      { name: 'Faculty', icon: Users, path: '/principal/faculty' },

      { name: 'Vacancy Assessment', icon: UserCheck, path: '/principal/vacancies' },
      { name: 'Applications', icon: FileText, path: '/principal/applications' },
      { name: 'Candidate Selection', icon: Award, path: '/principal/selection' },
      { name: 'Appointments', icon: FileText, path: '/principal/appointments' },
      { name: 'Timetable', icon: Calendar, path: '/principal/timetable' },
      { name: 'Work Logs', icon: ClipboardList, path: '/principal/work-logs' },
      { name: 'Billing', icon: Briefcase, path: '/principal/billing' },
    ],
    [ROLES.RO]: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/ro/dashboard' },
      { name: 'Institutes', icon: Building2, path: '/ro/institutes' },
      { name: 'Courses', icon: GraduationCap, path: '/ro/courses' },
      { name: 'Billing', icon: Briefcase, path: '/ro/billing' },
    ],
    [ROLES.CANDIDATE]: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/candidate/dashboard' },
      { name: 'Job Ads', icon: Briefcase, path: '/candidate/ads' },
      { name: 'Applications', icon: FileText, path: '/candidate/applications' },
      { name: 'Offer Letters', icon: Award, path: '/candidate/offers' },
    ],
    [ROLES.TREASURY]: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/treasury/dashboard' },
    ],
    [ROLES.FACULTY]: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/faculty/dashboard' },
      { name: 'Timetable', icon: Calendar, path: '/faculty/timetable' },
      { name: 'Work Logs', icon: ClipboardList, path: '/faculty/work-logs' },
    ],
  };

  const currentMenuItems = menuItems[role] || [];
  const isExpanded = isSidebarOpen;

  return (
    <aside
      onMouseEnter={() => dispatch(setSidebar(true))}
      onMouseLeave={() => dispatch(setSidebar(false))}
      className={cn(
        "fixed left-0 top-0 h-full bg-slate-50 text-slate-800 transition-all duration-500 ease-in-out z-50 flex flex-col shadow-2xl",
        isExpanded ? "w-64" : "w-20"
      )}
    >
      <div className="p-6 flex items-center h-16 border-b border-slate-200 overflow-hidden">
        <div className="min-w-[32px] flex justify-center">
          <img src={logo} alt="DTE Logo" className="w-8 h-8 object-contain" />
        </div>
        <span className={cn(
          "ml-4 font-bold text-lg tracking-tight transition-all duration-500 whitespace-nowrap",
          isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
        )}>
          DTE Portal
        </span>
      </div>

      <nav className="flex-1 mt-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
        {currentMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center p-3 rounded-lg transition-all duration-300 group overflow-hidden",
              isActive ? "bg-accent text-white shadow-lg" : "hover:bg-slate-200/50 text-slate-600 hover:text-slate-900"
            )}
          >
            <div className="min-w-[24px] flex justify-center">
              <item.icon size={22} />
            </div>
            <span className={cn(
              "ml-4 font-medium whitespace-nowrap transition-all duration-500",
              isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
            )}>
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4 flex items-center justify-between overflow-hidden">
        <div className="flex items-center overflow-hidden">
          <div className="min-w-[32px] flex justify-center shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="User avatar" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium shrink-0">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <UserCircle size={20} />}
              </div>
            )}
          </div>
          <div className={cn(
            "ml-3 flex flex-col transition-all duration-500 whitespace-nowrap",
            isExpanded ? "opacity-100 translate-x-0 w-32" : "opacity-0 -translate-x-4 pointer-events-none w-0"
          )}>
            <span className="text-sm font-medium text-slate-800 truncate">{user?.full_name || 'User'}</span>
            <span className="text-xs text-slate-500 truncate">{user?.role || role}</span>
          </div>
        </div>
        <button 
          onClick={() => dispatch(logout())}
          title="Logout"
          className={cn(
            "p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300 group shrink-0",
            isExpanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none hidden"
          )}
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
