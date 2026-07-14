import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../features/auth/authSlice';
import { ROLES, DASHBOARD_ROUTES } from '../constants/roles';
import { Info, ArrowRight, Lock, User } from 'lucide-react';
import { cn } from '../utils/cn';
import logo from '../assets/logo.gif';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showTestLogins, setShowTestLogins] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated, role: userRole } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && userRole) {
      const dashboardPath = DASHBOARD_ROUTES[userRole.toUpperCase()] || '/';
      navigate(dashboardPath, { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ username, password }));
  };

  const testAccounts = [
    { name: 'Admin', user: 's.admin@gmail.com', pass: '123456' },
    { name: 'RO', user: 'ro@example.com', pass: '123456' },
    { name: 'Treasury', user: 'treasury@example.com', pass: '123456' },
  ];

  const handleTestLogin = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative z-10"
      >
        <div className="p-6 md:p-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex flex-col items-center mb-5"
          >
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-sm border border-slate-100 mb-3">
              <img src={logo} alt="DTE Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">DTE PORTAL</h1>
            <p className="text-slate-500 mt-1 font-medium text-center text-xs">
              Enter your credentials to access your account
            </p>
          </motion.div>

          {/* Testing Accounts Toggle */}
          <div className="mb-4 flex flex-col items-center">
            <button 
              type="button"
              onClick={() => setShowTestLogins(!showTestLogins)}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest flex items-center transition-colors bg-slate-50 px-3 py-1.5 rounded-full"
            >
              {showTestLogins ? 'Hide Accounts' : 'Show Accounts'}
              <motion.div animate={{ rotate: showTestLogins ? 180 : 0 }} className="ml-1">▼</motion.div>
            </button>
            <AnimatePresence>
              {showTestLogins && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden w-full"
                >
                  <div className="flex flex-wrap justify-center gap-2 mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    {testAccounts.map((acc) => (
                      <button
                        key={acc.name}
                        type="button"
                        onClick={() => handleTestLogin(acc.user, acc.pass)}
                        className="text-[11px] px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100 rounded-md text-slate-600 font-semibold transition-all shadow-sm"
                      >
                        {acc.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="space-y-3"
            >
              <div className="relative group">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-700 transition-colors" size={16} />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400 text-sm"
                    placeholder="Enter your username"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="relative group">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <a href="#" className="text-[10px] text-slate-600 hover:text-slate-900 font-semibold hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-700 transition-colors" size={16} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400 text-sm"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </div>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 mt-2 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center">
                    <Info size={16} className="mr-2 shrink-0" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="pt-1"
            >
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-bold shadow-md hover:shadow-lg hover:bg-slate-800 transition-all disabled:opacity-70 flex items-center justify-center group text-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="flex items-center">
                    Sign In
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </motion.button>
            </motion.div>
          </form>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6 pt-4 border-t border-slate-100 text-center space-y-2.5"
          >
            <p className="text-xs text-slate-500 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-slate-900 font-bold hover:underline transition-colors">
                Register as Candidate
              </Link>
            </p>
            <p className="text-[9px] text-slate-300 uppercase tracking-widest font-extrabold flex items-center justify-center">
              <span className="h-px w-6 bg-slate-100 mr-2"></span>
              OR
              <span className="h-px w-6 bg-slate-100 ml-2"></span>
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Institutional user?{' '}
              <a href="#" className="text-slate-900 font-bold hover:underline transition-colors">Contact Admin</a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
