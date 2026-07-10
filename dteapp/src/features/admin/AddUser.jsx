import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, User, Mail, Phone, Shield, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { register } from '../auth/authSlice';
import { addUser } from '../user/userSlice';
import api from '../../services/api';

const AddUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [institutions, setInstitutions] = useState([]);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    role: 'RO',
    institutionId: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await api.get('/requirements/institutions?limit=100');
        setInstitutions(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch institutions:', err);
      }
    };
    fetchInstitutions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      // If role changed from PRINCIPAL, reset institutionId
      if (name === 'role' && value !== 'PRINCIPAL') {
        next.institutionId = '';
      }
      return next;
    });
    
    // Clear messages when user types
    if (successMessage) setSuccessMessage('');
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation for PRINCIPAL
    if (formData.role === 'PRINCIPAL' && !formData.institutionId) {
      setErrorMessage('Please select an institute for the Principal');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Prepare payload exactly as requested
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        role: formData.role,
        password: formData.password,
        institutionId: formData.role === 'PRINCIPAL' ? parseInt(formData.institutionId) : null
      };

      const resultAction = await dispatch(register(payload));
      
      if (register.fulfilled.match(resultAction)) {
        setSuccessMessage('User created successfully!');
        
        // Update local list for UI consistency
        dispatch(addUser({
          id: Date.now(),
          full_name: formData.fullName,
          email: formData.email,
          phone_number: formData.mobile,
          role: formData.role,
          institution_id: payload.institutionId
        }));

        // Reset form
        setFormData({
          fullName: '',
          email: '',
          mobile: '',
          role: 'RO',
          institutionId: '',
          password: '',
          confirmPassword: '',
        });

        // Optional: Navigate back after delay
        setTimeout(() => {
          navigate('/admin/users');
        }, 2000);
      } else {
        setErrorMessage(resultAction.payload || 'Failed to create user');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link 
        to="/admin/users" 
        className="flex items-center gap-2 text-secondary hover:text-accent font-semibold transition-colors group uppercase text-xs tracking-wider"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        BACK TO USER MANAGEMENT
      </Link>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground">Create New User</h1>
        <p className="text-secondary text-sm font-semibold uppercase tracking-wider">ADD A NEW USER TO THE SYSTEM</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">FULL NAME</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-accent transition-colors" size={20} />
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                autoComplete="name"
                placeholder="John Doe"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">EMAIL</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-accent transition-colors" size={20} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all"
                />
              </div>
            </div>

            {/* Mobile */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">MOBILE</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-accent transition-colors" size={20} />
                <input
                  type="tel"
                  name="mobile"
                  required
                  value={formData.mobile}
                  onChange={handleChange}
                  autoComplete="tel"
                  placeholder="9876543210"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">ROLE</label>
            <div className="relative group">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-accent transition-colors" size={20} />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all appearance-none"
              >
                <option value="RO">RO</option>
                <option value="PRINCIPAL">PRINCIPAL</option>
                <option value="TREASURY">TREASURY</option>
                <option value="FACULTY">FACULTY</option>
              </select>
            </div>
          </div>

          {/* Conditional Institute Field for Principal */}
          {formData.role === 'PRINCIPAL' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">SELECT INSTITUTE</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-accent transition-colors" size={20} />
                <select
                  name="institutionId"
                  required
                  value={formData.institutionId}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all appearance-none"
                >
                  <option value="">Select an Institute</option>
                  {institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">PASSWORD</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-accent transition-colors" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-accent transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">CONFIRM PASSWORD</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-accent transition-colors" size={20} />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  placeholder="Repeat new password"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl animate-in fade-in zoom-in-95 duration-300">
            <CheckCircle2 size={20} />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl animate-in fade-in zoom-in-95 duration-300">
            <AlertCircle size={20} />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => navigate('/admin/users')}
            className="px-8 py-3 rounded-xl border border-border font-semibold hover:bg-muted transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center min-w-[160px]"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Create User"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
