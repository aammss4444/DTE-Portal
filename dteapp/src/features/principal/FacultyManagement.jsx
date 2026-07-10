import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Plus, 
  Search, 
  User, 
  Briefcase, 
  Calendar, 
  GraduationCap, 
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2, 
  AlertCircle,
  Loader2,
  X,
  PlusCircle,
  Trash2,
  Edit,
  Building2,
  BookOpen
} from 'lucide-react';
import api from '../../services/api';
import { cn } from '../../utils/cn';
import { 
  getFaculties, 
  addFaculty, 
  updateFaculty, 
  deleteFaculty 
} from './facultySlice';

const FacultyManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { 
    facultyList: faculties, 
    loading: reduxLoading, 
    totalResults, 
    totalPages 
  } = useSelector((state) => state.faculty);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [modalErrorMessage, setModalErrorMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentFacultyId, setCurrentFacultyId] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [institutions, setInstitutions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);

  const loading = localLoading || reduxLoading;

  const [formData, setFormData] = useState({
    full_name: '',
    designation: '',
    employment_type: 'PERMANENT',
    qualification: '',
    specialization: '',
    date_of_birth: '',
    date_of_joining: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    academic_year: '2026-27',
    institution_id: user?.institution_id || '',
    course_id: '',
    employee_id: '',
    qualifications: [
      { degree: '', specialization: '', university: '', year_of_passing: '', is_highest: true }
    ]
  });

  // Initial Data Fetching for Dropdowns
  useEffect(() => {
    const fetchInstitutions = async () => {
      setLocalLoading(true);
      try {
        const response = await api.get('/requirements/institutions?limit=100');
        let insts = response.data.data || [];
        
        // Restricted view for Principal
        if (user?.role === 'PRINCIPAL' && user?.institution_id) {
          insts = insts.filter(inst => inst.id === user.institution_id);
        }
        
        setInstitutions(insts);
        
        // Auto-select for Principal
        const instId = user?.institution_id || (insts.length > 0 ? insts[0].id : '');
        if (instId) {
          setFormData(prev => ({ ...prev, institution_id: instId }));
        }
      } catch (err) {
        console.error('Failed to fetch institutions:', err);
      } finally {
        setLocalLoading(false);
      }
    };
    fetchInstitutions();
  }, [user]);

  // Sync formData with user profile
  useEffect(() => {
    if (user?.institution_id && !isEditing) {
      setFormData(prev => ({ ...prev, institution_id: user.institution_id }));
    }
  }, [user, isEditing]);

  // Update courses when institution_id changes
  useEffect(() => {
    if (formData.institution_id) {
      const selectedInst = institutions.find(inst => inst.id === parseInt(formData.institution_id));
      if (selectedInst) {
        setCourses(selectedInst.courses || []);
        if (!isEditing && selectedInst.courses?.length > 0) {
          // Keep current course if valid for this inst, else pick first
          const currentCourseValid = selectedInst.courses.some(c => c.id === parseInt(formData.course_id));
          if (!currentCourseValid) {
            setFormData(prev => ({ ...prev, course_id: selectedInst.courses[0].id }));
          }
        }
      }
    } else {
      setCourses([]);
    }
  }, [formData.institution_id, institutions, isEditing, formData.course_id]);

  // Core Data Fetcher using Redux
  const fetchFacultyData = useCallback((explicitParams = {}) => {
    const storedUser = JSON.parse(localStorage.getItem('user_data') || '{}');
    const instId = explicitParams.institution_id || user?.institution_id || storedUser.institution_id || formData.institution_id;
    
    if (!instId) {
      console.warn('Delaying fetch: No institution_id available.');
      return;
    }

    const params = {
      institution_id: instId,
      course_id: explicitParams.course_id || formData.course_id,
      academic_year: explicitParams.academic_year || formData.academic_year,
      page: explicitParams.page || currentPage,
      limit: pageSize
    };

    if (!params.institution_id || !params.course_id || !params.academic_year) {
      console.warn('Delaying fetch: Missing required parameters.', params);
      return;
    }

    console.log('Dispatching getFaculties with:', params);
    dispatch(getFaculties(params));
  }, [dispatch, user, formData, currentPage]);

  // Re-fetch on mount and filter/page changes
  useEffect(() => {
    fetchFacultyData();
  }, [fetchFacultyData]);

  const handleEdit = (faculty) => {
    setIsEditing(true);
    setCurrentFacultyId(faculty.id);
    
    // Support both 'qualifications' and 'qualifications_list' field names
    const quals = faculty.qualifications_list || faculty.qualifications || [];
    
    setFormData({
      full_name: faculty.full_name || '',
      designation: faculty.designation || '',
      employment_type: faculty.employment_type || 'PERMANENT',
      qualification: faculty.qualification || '',
      specialization: faculty.specialization || '',
      date_of_birth: faculty.date_of_birth || '',
      date_of_joining: faculty.date_of_joining || '',
      status: faculty.status || 'ACTIVE',
      academic_year: faculty.academic_year || '2026-27',
      institution_id: faculty.institution_id || '',
      course_id: faculty.course_id || '',
      employee_id: faculty.employee_id || '',
      qualifications: quals.length > 0 
        ? quals.map(q => ({
            degree: q.degree || '',
            specialization: q.specialization || '',
            university: q.university || '',
            year_of_passing: q.year_of_passing || '',
            is_highest: q.is_highest || false
          }))
        : [{ degree: '', specialization: '', university: '', year_of_passing: '', is_highest: true }]
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete faculty "${name}"? This action cannot be undone.`)) {
      try {
        const resultAction = await dispatch(deleteFaculty(id));
        if (deleteFaculty.fulfilled.match(resultAction)) {
          setSuccessMessage(`Faculty "${name}" deleted successfully.`);
          setErrorMessage('');
          fetchFacultyData(); // Re-sync with server
          setTimeout(() => setSuccessMessage(''), 5000);
        } else {
          setErrorMessage(`Delete Failed: ${resultAction.payload}`);
        }
      } catch (err) {
        setErrorMessage('Failed to delete faculty. Please try again.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQualificationChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    let newQuals = [...formData.qualifications];
    
    if (name === 'is_highest' && checked) {
      // Enforce single selection for highest qualification
      newQuals = newQuals.map((q, i) => ({
        ...q,
        is_highest: i === index
      }));
    } else {
      newQuals[index] = { 
        ...newQuals[index], 
        [name]: type === 'checkbox' ? checked : value
      };
    }
    
    // Auto-sync summary fields from the highest qualification
    const highest = newQuals.find(q => q.is_highest);
    setFormData(prev => ({ 
      ...prev, 
      qualifications: newQuals,
      qualification: highest ? highest.degree : prev.qualification,
      specialization: highest ? highest.specialization : prev.specialization
    }));
  };

  const addQualification = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, { degree: '', specialization: '', university: '', year_of_passing: '', is_highest: false }]
    }));
  };

  const removeQualification = (index) => {
    if (formData.qualifications.length === 1) return;
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setModalErrorMessage('');
    setSuccessMessage('');

    try {
      // Construct payload for Full Update (PUT)
      // Including exactly the 9 fields specified in the requirement
      const payload = {
        full_name: formData.full_name || null,
        designation: formData.designation || null,
        employment_type: formData.employment_type || 'PERMANENT',
        qualification: formData.qualification || null,
        specialization: formData.specialization || null,
        status: formData.status || 'ACTIVE',
        date_of_birth: formData.date_of_birth || null,
        date_of_joining: formData.date_of_joining || null,
        academic_year: formData.academic_year || '2026-27',
        qualifications: formData.qualifications.length > 0 
          ? formData.qualifications.map(q => ({
              degree: q.degree || null,
              specialization: q.specialization || null,
              university: q.university || null,
              year_of_passing: q.year_of_passing ? parseInt(q.year_of_passing) : null,
              is_highest: q.is_highest || false
            }))
          : null
      };

      let resultAction;
      if (isEditing) {
        console.log(`PUTing Faculty ${currentFacultyId}...`, payload);
        resultAction = await dispatch(updateFaculty({ id: currentFacultyId, payload }));
      } else {
        // Add required fields for creation
        payload.institution_id = parseInt(formData.institution_id);
        payload.course_id = parseInt(formData.course_id);
        payload.employee_id = formData.employee_id;
        payload.date_of_joining = formData.date_of_joining;
        console.log("POSTing Faculty...", payload);
        resultAction = await dispatch(addFaculty(payload));
      }

      if (addFaculty.fulfilled.match(resultAction) || updateFaculty.fulfilled.match(resultAction)) {
        setSuccessMessage(isEditing ? 'Faculty updated successfully!' : 'Faculty added successfully!');
        setIsModalOpen(false);
        fetchFacultyData(); // Re-fetch to ensure sync with pagination/filters
        setTimeout(() => setSuccessMessage(''), 5000);
        
        // Reset form
        setIsEditing(false);
        setCurrentFacultyId(null);
        setFormData(prev => ({
          ...prev,
          full_name: '',
          designation: '',
          employee_id: '',
          qualifications: [{ degree: '', specialization: '', university: '', year_of_passing: '', is_highest: true }]
        }));
      } else {
        setModalErrorMessage(resultAction.payload || 'Failed to process request.');
      }
    } catch (err) {
      console.error("Faculty Submission Error:", err);
      setModalErrorMessage('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">Faculty Management</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
            <input
              type="text"
              placeholder="Search faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all"
            />
          </div>
          <button
            onClick={() => {
              setModalErrorMessage('');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            <span>ADD FACULTY</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center gap-3 animate-in zoom-in-95">
          <CheckCircle2 size={20} />
          <p className="font-medium">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 animate-in zoom-in-95">
          <AlertCircle size={20} />
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Stats Mini Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Total Faculty</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalResults || faculties.length}</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl">
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Effective Strength</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {faculties.filter(f => f.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-purple-500/5 border border-purple-500/10 p-4 rounded-xl">
          <p className="text-xs font-bold text-purple-500 uppercase tracking-wider">Permanent</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {faculties.filter(f => f.employment_type === 'PERMANENT').length}
          </p>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl">
          <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Contract/Ad-hoc</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {faculties.filter(f => f.employment_type !== 'PERMANENT').length}
          </p>
        </div>
      </div>

      {/* Faculty Table */}

      <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Designation</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Emp. Type</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Joining Date</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-secondary italic">
                    <Loader2 className="animate-spin inline mr-2" size={20} /> Loading faculty...
                  </td>
                </tr>
              ) : faculties.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-secondary italic">
                    No faculty found. Click "ADD FACULTY" to create one.
                  </td>
                </tr>
              ) : (
                faculties.map((f) => (
                  <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-semibold">{f.full_name}</td>
                    <td className="px-6 py-4 text-secondary">{f.designation}</td>
                    <td className="px-6 py-4 text-secondary">{f.employment_type}</td>
                    <td className="px-6 py-4 text-secondary">{f.date_of_joining}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase">
                        {f.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(f)}
                        className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-all"
                        title="Edit Faculty"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(f.id, f.full_name)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete Faculty"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && faculties.length > 0 && (
          <div className="px-6 py-4 bg-muted/20 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-secondary">
              Showing <span className="font-bold text-foreground">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-bold text-foreground">{Math.min(currentPage * pageSize, totalResults)}</span> of <span className="font-bold text-foreground">{totalResults}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-background transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "w-10 h-10 rounded-lg text-sm font-bold transition-all",
                          currentPage === pageNum 
                            ? "bg-primary text-white shadow-lg shadow-primary/20" 
                            : "hover:bg-muted border border-transparent hover:border-border text-secondary"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 || 
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} className="px-1 text-secondary">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-background transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Faculty Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-background w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-border shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <h2 className="text-xl font-bold">Add New Faculty</h2>
                <p className="text-xs text-secondary uppercase font-bold tracking-widest mt-1">ENTER FACULTY DETAILS & QUALIFICATIONS</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {modalErrorMessage && (
              <div className="px-8 pt-4">
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                  <AlertCircle size={20} />
                  <p className="text-sm font-semibold">{modalErrorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  <User size={18} />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">FULL NAME</label>
                    <input
                      type="text"
                      name="full_name"
                      required
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Dr. John Doe"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">DATE OF BIRTH</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      required
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">EMPLOYEE ID / UNIQUE ID</label>
                    <input
                      type="text"
                      name="employee_id"
                      required
                      value={formData.employee_id}
                      onChange={handleChange}
                      placeholder="EMP1001"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">DESIGNATION</label>
                    <input
                      type="text"
                      name="designation"
                      required
                      value={formData.designation}
                      onChange={handleChange}
                      placeholder="Lecturer"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">EMPLOYMENT TYPE</label>
                    <select
                      name="employment_type"
                      value={formData.employment_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all"
                    >
                      <option value="PERMANENT">Full-Time / Permanent</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="VISITING">Visiting</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">STATUS</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>
              </div>


              {/* Work Details Section */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-2 text-primary">
                  <Briefcase size={18} />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Work Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">DATE OF JOINING</label>
                    <input
                      type="date"
                      name="date_of_joining"
                      required
                      value={formData.date_of_joining}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">ACADEMIC YEAR</label>
                    <input
                      type="text"
                      name="academic_year"
                      required
                      value={formData.academic_year}
                      onChange={handleChange}
                      placeholder="2026-27"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">INSTITUTION</label>
                    <select
                      name="institution_id"
                      required
                      value={formData.institution_id}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all disabled:opacity-75 disabled:bg-muted"
                      disabled={user?.role === 'PRINCIPAL' && !!user?.institution_id}
                    >
                      <option value="">Select Institution</option>
                      {institutions.map(inst => (
                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">COURSE</label>
                    <select
                      name="course_id"
                      required
                      value={formData.course_id}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all"
                      disabled={!formData.institution_id}
                    >
                      <option value="">Select Course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Qualifications Section */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <GraduationCap size={18} />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Educational Qualifications</h3>
                  </div>
                  <button
                    type="button"
                    onClick={addQualification}
                    className="text-accent hover:text-accent/80 flex items-center gap-1 text-xs font-bold uppercase transition-colors"
                  >
                    <PlusCircle size={16} />
                    Add More
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.qualifications.map((qual, index) => (
                    <div key={index} className="p-6 bg-muted/30 rounded-2xl border border-border relative group/qual">
                      {formData.qualifications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQualification(index)}
                          className="absolute top-4 right-4 text-red-500 hover:text-red-600 p-1 rounded-md hover:bg-red-500/10 transition-all opacity-0 group-hover/qual:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">DEGREE</label>
                          <input
                            type="text"
                            name="degree"
                            required
                            value={qual.degree}
                            onChange={(e) => handleQualificationChange(index, e)}
                            placeholder="M.Tech"
                            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-accent outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">SPECIALIZATION</label>
                          <input
                            type="text"
                            name="specialization"
                            value={qual.specialization}
                            onChange={(e) => handleQualificationChange(index, e)}
                            placeholder="Computer Science"
                            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-accent outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">UNIVERSITY</label>
                          <input
                            type="text"
                            name="university"
                            value={qual.university}
                            onChange={(e) => handleQualificationChange(index, e)}
                            placeholder="University of Mumbai"
                            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-accent outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">YEAR OF PASSING</label>
                          <input
                            type="text"
                            name="year_of_passing"
                            value={qual.year_of_passing}
                            onChange={(e) => handleQualificationChange(index, e)}
                            placeholder="2020"
                            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-accent outline-none"
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="is_highest"
                          id={`highest-${index}`}
                          checked={qual.is_highest}
                          onChange={(e) => handleQualificationChange(index, e)}
                          className="w-4 h-4 text-accent border-border rounded focus:ring-accent"
                        />
                        <label htmlFor={`highest-${index}`} className="text-xs font-semibold text-secondary">Set as highest qualification</label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-border font-semibold hover:bg-background transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 min-w-[140px] justify-center"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? 'Update Faculty' : 'Save Faculty')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyManagement;
