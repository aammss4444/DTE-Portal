import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { registerCandidate } from '../features/auth/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: ''
  });

  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    const result = await dispatch(registerCandidate(formData));
    if (registerCandidate.fulfilled.match(result)) {
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative z-10"
      >
        <div className="p-6 sm:p-8">
          <div className="text-center mb-5">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
              className="mx-auto w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm mb-3"
            >
              <UserPlus className="text-slate-900" size={20} />
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-extrabold text-slate-900 tracking-tight"
            >
              Candidate Registration
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-1 text-xs text-slate-500 font-medium"
            >
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-slate-900 hover:text-slate-700 transition-colors hover:underline">
                Login here
              </Link>
            </motion.p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            <AnimatePresence>
              {(validationError || error) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-center text-sm font-medium">
                    <AlertCircle size={18} className="mr-2 shrink-0" />
                    {validationError || error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {[
                { name: 'full_name', label: 'Full Name', type: 'text', icon: User, placeholder: 'Enter your full name' },
                { name: 'email', label: 'Email Address', type: 'email', icon: Mail, placeholder: 'name@example.com' },
                { name: 'phone_number', label: 'Phone Number', type: 'text', icon: Phone, placeholder: '10-digit mobile number' },
                { name: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: '••••••••' },
                { name: 'confirmPassword', label: 'Confirm Password', type: 'password', icon: Lock, placeholder: '••••••••' },
              ].map((field) => (
                <motion.div key={field.name} variants={itemVariants} className="relative group">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {field.label}
                  </label>
                  <div className="relative">
                    <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-700 transition-colors" size={16} />
                    <input
                      type={field.type}
                      required
                      value={formData[field.name]}
                      onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400 text-sm"
                      placeholder={field.placeholder}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
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
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <span className="flex items-center">
                    Register as Candidate
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </motion.button>
            </motion.div>
          </form>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 pt-4 border-t border-slate-100"
          >
            <div className="grid grid-cols-2 gap-4 text-center text-[10px] font-semibold text-slate-400">
              <div className="flex flex-col items-center group">
                <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center mb-1 group-hover:bg-slate-100 transition-colors">
                  <CheckCircle size={12} className="text-slate-600" />
                </div>
                <span>Official Registration</span>
              </div>
              <div className="flex flex-col items-center group">
                <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center mb-1 group-hover:bg-slate-100 transition-colors">
                  <Lock size={12} className="text-slate-600" />
                </div>
                <span>Secure Data</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
