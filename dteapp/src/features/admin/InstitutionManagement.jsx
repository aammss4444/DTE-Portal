import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Trash2, Edit, Save, X, Search, BarChart3, ChevronRight, GraduationCap, Calendar, Eye, EyeOff, ClipboardList, Zap, Calculator } from 'lucide-react';
import { Table } from '../../components/common/Table';
import { Button, Input } from '../../components/common/UIComponents';
import Modal from '../../components/common/Modal';
import { fetchInstitutions, createInstitution, updateInstitution, deleteInstitution, addCourse } from './institutionSlice';
import { fetchIntakes, createIntake, updateIntake, deleteIntake } from './intakeSlice';
import { fetchNorms, createNorm, updateNorm, deleteNorm, seedDTEDefaults } from './normSlice';
import { generateRequirements } from './requirementSlice';
import { ROLES } from '../../constants/roles';

const InstitutionManagement = () => {
  const dispatch = useDispatch();
  const { institutions, loading } = useSelector((state) => state.institutions);
  const role = useSelector((state) => state.auth.role);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeConfigTab, setActiveConfigTab] = useState('intake'); // 'intake' or 'norms'
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [expandedNormCourseId, setExpandedNormCourseId] = useState(null);
  const [generationResults, setGenerationResults] = useState({}); // course_id -> requirement_data
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [inlineNewCourse, setInlineNewCourse] = useState({ name: '', level: 'DIPLOMA' });

  const deriveCategory = (name, level) => {
    const src = `${name} ${level}`.toLowerCase();
    if (src.includes('hotel') || src.includes('hmct')) return "HMCT (Hotel Management)";
    if (src.includes('physics') || src.includes('chemistry') || src.includes('math') || src.includes('applied')) return "Non-Engineering (Applied Sciences)";
    if (src.includes('diploma')) return "Engineering & Technology (Diploma)";
    if (src.includes('degree') || src.includes('ug') || src.includes('b.e') || src.includes('btech') || src.includes('engineering') || src.includes('pg'))
      return "Engineering (Degree - B.E./B.Tech)";
    return null;
  };

  const { intakes = [], loading: intakeLoading } = useSelector((state) => state.intakes || {});
  const { norms = [], loading: normLoading } = useSelector((state) => state.norms || {});
  const [selectedInstitutionForCourses, setSelectedInstitutionForCourses] = useState(null);
  const activeInstitution = selectedInstitutionForCourses
    ? (institutions.find(i => i.id === selectedInstitutionForCourses.id) || selectedInstitutionForCourses)
    : null;


  useEffect(() => {
    dispatch(fetchInstitutions({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Fetch intakes & norms when a specific institution is selected
  useEffect(() => {
    if (selectedInstitutionForCourses?.id) {
      dispatch(fetchIntakes({ institutionId: selectedInstitutionForCourses.id, academicYear }));
      dispatch(fetchNorms({ academicYear, institutionId: selectedInstitutionForCourses.id }));
    }
  }, [dispatch, selectedInstitutionForCourses, academicYear]);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    district: '',
    type: 'GOVERNMENT',
    courses: []
  });

  const [newCourse, setNewCourse] = useState({ name: '', level: 'DIPLOMA' });
  const [currentId, setCurrentId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCourse = () => {
    if (newCourse.name.trim()) {
      setFormData(prev => ({
        ...prev,
        courses: [...prev.courses, { ...newCourse }]
      }));
      setNewCourse({ name: '', level: 'DIPLOMA' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentId) {
      dispatch(updateInstitution({ id: currentId, data: formData }));
    } else {
      dispatch(createInstitution(formData));
    }
    resetForm();
  };

  const handleEdit = (institution) => {
    setFormData({
      name: institution.name,
      code: institution.code,
      district: institution.district,
      type: institution.type,
      courses: institution.courses || []
    });
    setCurrentId(institution.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    console.log('[DELETE] handleDelete called with id:', id);
    try {
      const result = await dispatch(deleteInstitution(id)).unwrap();
      console.log('[DELETE] Success result:', result);
      dispatch(fetchInstitutions({ page: 1, limit: 10 }));
      alert('Institution deleted successfully!');
    } catch (err) {
      console.error('[DELETE] Error:', err);
      alert('Failed to delete institution: ' + JSON.stringify(err));
    }
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', district: '', type: 'GOVERNMENT', courses: [] });
    setNewCourse({ name: '', level: 'DIPLOMA' });
    setCurrentId(null);
    setIsEditing(false);
    setIsModalOpen(false);
  };

  const columns = [
    { key: 'name', label: 'Institution Name' },
    { key: 'code', label: 'Code' },
    { key: 'district', label: 'District' },
    {
      key: 'type',
      label: 'Type',
      render: (val) => (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 uppercase">
          {val}
        </span>
      )
    },
    {
      key: 'courses',
      label: 'Courses',
      render: (courses) => (
        <span className="text-xs font-bold text-secondary bg-muted px-2 py-1 rounded-md">
          {courses?.length || 0} Courses
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background border border-border p-4 rounded-xl shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
          <input
            type="text"
            placeholder="Search institutions..."
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border focus:bg-background focus:border-accent rounded-lg text-sm transition-all outline-none"
          />
        </div>
        {role === ROLES.RO && (
          <Button 
            variant="accent" 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center space-x-2 w-full sm:w-auto"
          >
            <Plus size={20} />
            <span>Add Institution</span>
          </Button>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={isEditing ? 'Edit Institution' : 'Add New Institution'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-secondary uppercase tracking-widest border-b border-border pb-1">Basic Information</h4>
            <Input
              label="Institution Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Government Polytechnic, Pune"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Institution Code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g. 1001"
                required
              />
              <Input
                label="District"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="e.g. Pune"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-secondary">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all text-sm"
              >
                <option value="GOVERNMENT">Government</option>
                <option value="AIDED">Aided</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
          </div>

          {/* Courses Section */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-secondary uppercase tracking-widest">Courses Offered</h4>
              <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                {formData.courses.length} ACTIVE
              </span>
            </div>

            {/* Dynamic Course List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {formData.courses.length === 0 ? (
                <div className="col-span-full py-8 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-secondary/40 bg-muted/5">
                  <Plus size={24} className="mb-2 opacity-20" />
                  <p className="text-xs font-medium">No courses added yet</p>
                </div>
              ) : (
                formData.courses.map((course, index) => (
                  <div key={index} className="group flex items-center justify-between bg-muted/40 hover:bg-muted/60 border border-border p-2.5 rounded-xl transition-all">
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-foreground break-words">{course.name}</span>
                      <span className="text-[10px] text-secondary font-semibold uppercase tracking-tight">{course.level}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="p-1.5 h-auto text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      onClick={() => {
                        const newCourses = [...formData.courses];
                        newCourses.splice(index, 1);
                        setFormData(prev => ({ ...prev, courses: newCourses }));
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Add Course Sub-form - Only visible when creating a new institution */}
            {!isEditing && (
              <div className="bg-muted/20 p-4 rounded-2xl border border-border space-y-4 shadow-inner">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="e.g. Computer Engineering"
                      value={newCourse.name}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full h-10 px-4 rounded-lg border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <select
                      value={newCourse.level}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, level: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all text-xs font-bold uppercase"
                    >
                      <option value="DIPLOMA">Diploma</option>
                      <option value="UG">Under Graduate</option>
                      <option value="PG">Post Graduate</option>
                    </select>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCourse}
                  className="w-full py-2.5 h-auto text-xs font-bold uppercase tracking-wider bg-background hover:bg-accent hover:text-white transition-all border-dashed"
                >
                  <Plus size={14} className="mr-2" /> Add Course to List
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-border mt-6">
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" className="flex items-center">
              <Save size={18} className="mr-2" />
              {isEditing ? 'Update Institution' : 'Create Institution'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Courses & Intake Modal */}
      <Modal
        isOpen={!!selectedInstitutionForCourses}
        onClose={() => {
          setSelectedInstitutionForCourses(null);
          setSelectedCourse(null);
          setActiveConfigTab('intake');
        }}
        title={selectedCourse ? `Config: ${selectedCourse.name}` : `Courses: ${activeInstitution?.name}`}
        size="xl"
      >
        {!selectedCourse ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg border border-border">
              <span className="text-sm font-bold text-foreground">Select a course to configure:</span>
              <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-border shadow-sm">
                <Calendar size={14} className="text-secondary" />
                <select
                  className="bg-transparent text-sm font-bold text-foreground outline-none cursor-pointer"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                >
                  <option value="2025-26">2025-26</option>
                  <option value="2026-27">2026-27</option>
                  <option value="2027-28">2027-28</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeInstitution?.courses?.map((course) => {
                const currentIntake = intakes.find(i =>
                  i.course_id === course.id &&
                  i.institution_id === activeInstitution.id &&
                  i.academic_year === academicYear
                );
                const approvedSeats = currentIntake?.approved_seats || 0;
                const derivedCat = deriveCategory(course.name, course.level);
                const courseNorm = norms.find(n => n.course_id === course.id && n.academic_year === academicYear) ||
                  norms.find(n => n.norm_type === 'COURSE_WISE' && n.course_category === derivedCat && n.academic_year === academicYear) ||
                  norms.find(n => n.norm_type === 'GENERAL' && n.academic_year === academicYear);
                const isNormExpanded = expandedNormCourseId === course.id;

                return (
                  <div key={course.id} className="flex flex-col p-4 bg-muted/30 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-all group cursor-default">
                    <div className="flex flex-col mb-3">
                      <span className="font-bold text-foreground line-clamp-1" title={course.name}>{course.name}</span>
                      <span className="text-xs text-secondary font-semibold uppercase tracking-wider">{course.level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Intake & Requirements</span>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-sm font-bold text-foreground">{approvedSeats} Seats</span>
                          {generationResults[course.id] && (
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-md font-bold border border-indigo-200">
                              REQ: {generationResults[course.id].computed_required_count}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">

                        <button
                          onClick={() => setExpandedNormCourseId(isNormExpanded ? null : course.id)}
                          className={`p-2 rounded-lg text-xs font-bold transition-all border ${isNormExpanded
                              ? 'bg-accent/10 text-accent border-accent/30'
                              : courseNorm
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-orange-50 text-orange-500 border-orange-200 hover:bg-orange-100'
                            }`}
                          title={courseNorm ? 'View Norm' : 'No Norm Set'}
                        >
                          {isNormExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <Button
                          variant="accent"
                          onClick={() => setSelectedCourse(course)}
                          className="text-xs px-4 py-2 h-auto transition-all shadow-lg"
                        >
                          <BarChart3 size={14} className="mr-2" /> Config
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Norm Details */}
                    {isNormExpanded && (
                      <div className="mt-3 pt-3 border-t border-border animate-in fade-in slide-in-from-top-2 duration-200">
                        {courseNorm ? (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-background p-2 rounded-lg border border-border">
                              <span className="text-[9px] font-bold text-secondary uppercase tracking-widest block">Category</span>
                              <span className="font-semibold text-foreground">{courseNorm.course_category || '—'}</span>
                            </div>
                            <div className="bg-background p-2 rounded-lg border border-border">
                              <span className="text-[9px] font-bold text-secondary uppercase tracking-widest block">Qualification</span>
                              <span className="font-semibold text-foreground">{courseNorm.min_qualification || '—'}</span>
                            </div>
                            <div className="bg-background p-2 rounded-lg border border-border">
                              <span className="text-[9px] font-bold text-secondary uppercase tracking-widest block">F:S Ratio</span>
                              <span className="font-semibold text-foreground">1:{courseNorm.faculty_student_ratio}</span>
                            </div>
                            <div className="bg-background p-2 rounded-lg border border-border">
                              <span className="text-[9px] font-bold text-secondary uppercase tracking-widest block">Grade</span>
                              <span className="font-semibold text-foreground">{courseNorm.grade_requirement || '—'}</span>
                            </div>
                            <div className="bg-background p-2 rounded-lg border border-border">
                              <span className="text-[9px] font-bold text-secondary uppercase tracking-widest block">Max Age</span>
                              <span className="font-semibold text-foreground">{courseNorm.max_age} yrs</span>
                            </div>
                            <div className="bg-background p-2 rounded-lg border border-border">
                              <span className="text-[9px] font-bold text-secondary uppercase tracking-widest block">Workload</span>
                              <span className="font-semibold text-foreground">{courseNorm.workload_hours_per_week} hrs/wk</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-orange-500 italic flex items-center">
                            <ClipboardList size={14} className="mr-2" />
                            No recruitment norm defined for this course in {academicYear}.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {(!activeInstitution?.courses || activeInstitution.courses.length === 0) && (
              <div className="py-10 text-center text-secondary italic">No courses registered for this institution.</div>
            )}

            {/* Inline Add Course Form */}
            <div className="mt-6 pt-6 border-t border-border">
              {!showAddCourseForm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowAddCourseForm(true)}
                  className="w-full py-4 border-dashed border-2 hover:border-accent hover:text-accent transition-all group"
                >
                  <Plus size={20} className="mr-2 group-hover:scale-110 transition-transform" />
                  <span className="font-bold uppercase tracking-wider text-xs">Add New Course to this Institution</span>
                </Button>
              ) : (
                <div className="bg-muted/30 p-4 rounded-2xl border border-border animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-secondary uppercase tracking-widest">New Course Details</h4>
                    <button onClick={() => setShowAddCourseForm(false)} className="text-secondary hover:text-foreground">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        placeholder="Course Name (e.g. Civil Engineering)"
                        value={inlineNewCourse.name}
                        onChange={(e) => setInlineNewCourse(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all text-sm font-medium"
                      />
                    </div>
                    <div>
                      <select
                        value={inlineNewCourse.level}
                        onChange={(e) => setInlineNewCourse(prev => ({ ...prev, level: e.target.value }))}
                        className="w-full h-11 px-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all text-xs font-bold uppercase"
                      >
                        <option value="DIPLOMA">Diploma</option>
                        <option value="UG">Under Graduate</option>
                        <option value="PG">Post Graduate</option>
                        <option value="D.PHARM">D.Pharm</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="accent"
                      className="flex-1 h-11 shadow-lg shadow-accent/20"
                      onClick={async () => {
                        if (!inlineNewCourse.name.trim()) return;
                        try {
                          await dispatch(addCourse({
                            institutionId: activeInstitution.id,
                            courseData: inlineNewCourse
                          })).unwrap();

                          setInlineNewCourse({ name: '', level: 'DIPLOMA' });
                          setShowAddCourseForm(false);
                          alert('Course added successfully!');
                        } catch (err) {
                          alert(err || 'Failed to add course');
                        }
                      }}
                    >
                      <Plus size={18} className="mr-2" /> Add Course
                    </Button>
                    <Button variant="secondary" className="h-11 px-6" onClick={() => setShowAddCourseForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 min-h-[400px]">
            {/* Header with Course Info and Year Selector */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-accent/5 p-4 rounded-2xl border border-accent/10">
              <div className="flex items-center">
                <div className="p-3 bg-white rounded-xl shadow-sm mr-4 text-accent">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Selected Course</p>
                  <p className="text-lg font-bold text-foreground leading-tight">{selectedCourse.name}</p>
                  <p className="text-xs text-secondary font-medium uppercase tracking-tighter">{selectedCourse.level}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-border shadow-sm">
                <Calendar size={14} className="text-secondary" />
                <select
                  className="bg-transparent text-sm font-bold text-foreground outline-none cursor-pointer"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                >
                  <option value="2025-26">2025-26</option>
                  <option value="2026-27">2026-27</option>
                  <option value="2027-28">2027-28</option>
                </select>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-muted p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveConfigTab('intake')}
                className={`px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeConfigTab === 'intake' ? 'bg-background text-foreground shadow-sm' : 'text-secondary hover:text-foreground'
                  }`}
              >
                Intake Management
              </button>
              <button
                onClick={() => setActiveConfigTab('norms')}
                className={`px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeConfigTab === 'norms' ? 'bg-background text-foreground shadow-sm' : 'text-secondary hover:text-foreground'
                  }`}
              >
                Recruitment Norms
              </button>
            </div>

            {/* Config Content */}
            <div className="mt-4">
              {activeConfigTab === 'intake' ? (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const intakeData = {
                    institution_id: activeInstitution.id,
                    course_id: selectedCourse.id,
                    academic_year: academicYear,
                    approved_seats: parseInt(formData.get('approved_seats')),
                    actual_admitted: parseInt(formData.get('actual_admitted'))
                  };

                  const currentIntake = intakes.find(i =>
                    i.course_id === selectedCourse.id &&
                    i.institution_id === activeInstitution.id &&
                    i.academic_year === academicYear
                  );

                  if (currentIntake) {
                    await dispatch(updateIntake({ id: currentIntake.id, data: intakeData }));
                    alert('Intake configuration updated!');
                  } else {
                    await dispatch(createIntake(intakeData));
                    alert('Intake configuration saved!');
                  }
                  dispatch(fetchIntakes({ institutionId: activeInstitution.id, academicYear }));
                }} className="space-y-6">
                  {(() => {
                    const currentIntake = intakes.find(i =>
                      i.course_id === selectedCourse.id &&
                      i.institution_id === activeInstitution.id &&
                      i.academic_year === academicYear
                    );
                    return (
                      <>
                        <div className="grid grid-cols-2 gap-6">
                          <Input
                            label="Approved Intake Seats"
                            name="approved_seats"
                            type="number"
                            defaultValue={currentIntake?.approved_seats || 60}
                            required
                          />
                          <Input
                            label="Actual Admitted Count"
                            name="actual_admitted"
                            type="number"
                            defaultValue={currentIntake?.actual_admitted || 0}
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                          {currentIntake && (
                            <Button
                              type="button"
                              variant="ghost"
                              className="text-red-500 hover:bg-red-50"
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to delete this intake record?')) {
                                  await dispatch(deleteIntake(currentIntake.id));
                                  dispatch(fetchIntakes({ institutionId: activeInstitution.id, academicYear }));
                                }
                              }}
                            >
                              <Trash2 size={18} className="mr-2" /> Delete Record
                            </Button>
                          )}
                          <Button type="submit" variant="accent" className="px-8 h-12 shadow-lg shadow-accent/20">
                            <Save size={18} className="mr-2" />
                            {currentIntake ? 'Update Intake Record' : 'Save Intake Record'}
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </form>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const normData = {
                    institution_id: activeInstitution.id,
                    course_id: selectedCourse.id,
                    academic_year: academicYear,
                    norm_type: 'COURSE_WISE',
                    course_category: formData.get('course_category'),
                    min_qualification: formData.get('min_qualification'),
                    grade_requirement: formData.get('grade_requirement'),
                    faculty_student_ratio: parseFloat(formData.get('faculty_student_ratio')),
                    max_age: parseInt(formData.get('max_age')),
                    workload_hours_per_week: parseInt(formData.get('workload_hours_per_week'))
                  };

                  const courseSpecificNorm = norms.find(n =>
                    n.course_id === selectedCourse.id &&
                    n.academic_year === academicYear
                  );

                  if (courseSpecificNorm) {
                    await dispatch(updateNorm({ id: courseSpecificNorm.id, data: normData }));
                    alert('Course-specific recruitment norms updated!');
                  } else {
                    await dispatch(createNorm(normData));
                    alert('Course-specific recruitment norms applied!');
                  }
                  dispatch(fetchNorms({ academicYear, institutionId: activeInstitution.id }));
                }} className="space-y-6">
                  {(() => {
                    const courseSpecificNorm = norms.find(n =>
                      n.course_id === selectedCourse.id &&
                      n.academic_year === academicYear
                    );
                    const derivedCat = deriveCategory(selectedCourse.name, selectedCourse.level);
                    const currentNorm = courseSpecificNorm ||
                      norms.find(n => n.norm_type === 'COURSE_WISE' && n.course_category === derivedCat && n.academic_year === academicYear) ||
                      norms.find(n => n.norm_type === 'GENERAL' && n.academic_year === academicYear);
                    return (
                      <>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-500 p-2 rounded-lg">
                              <Zap size={20} className="text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-blue-900 leading-tight">Apply DTE Defaults</p>
                              <p className="text-[10px] font-medium text-blue-600 uppercase tracking-wider">Bulk seed common norms for this year</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            className="bg-white hover:bg-blue-100 text-blue-600 border border-blue-200 text-xs py-1.5 h-auto font-bold shadow-sm"
                            onClick={async () => {
                              if (window.confirm('This will seed the 5 standard DTE course-wise norms for this institution and year. Existing norms for these categories might be updated. Continue?')) {
                                await dispatch(seedDTEDefaults({
                                  institution_id: activeInstitution.id,
                                  academic_year: academicYear,
                                  faculty_student_ratio: 20.0
                                }));
                                alert('DTE default norms seeded successfully!');
                                dispatch(fetchNorms({ academicYear, institutionId: activeInstitution.id }));
                              }
                            }}
                          >
                            Seed Now
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5 md:col-span-2">
                            <label className="block text-sm font-medium text-secondary">Course Category</label>
                            <select
                              name="course_category"
                              required
                              defaultValue={currentNorm?.course_category || 'Engineering & Technology (Diploma)'}
                              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none text-sm"
                            >
                              <option value="Engineering & Technology (Diploma)">Engineering & Technology (Diploma)</option>
                              <option value="Engineering (Degree - B.E./B.Tech)">Engineering (Degree - B.E./B.Tech)</option>
                              <option value="HMCT (Hotel Management)">HMCT (Hotel Management)</option>
                              <option value="Non-Engineering (Applied Sciences)">Non-Engineering (Applied Sciences)</option>
                            </select>
                          </div>
                          <Input
                            label="Min Qualification"
                            name="min_qualification"
                            defaultValue={currentNorm?.min_qualification || "M.E./M.Tech in relevant branch"}
                            required
                          />
                          <Input
                            label="Grade Requirement"
                            name="grade_requirement"
                            defaultValue={currentNorm?.grade_requirement || "First Class"}
                            required
                          />
                          <div className="grid grid-cols-3 gap-4 md:col-span-2">
                            <Input label="F:S Ratio" name="faculty_student_ratio" type="number" step="0.1" defaultValue={currentNorm?.faculty_student_ratio || 20} required />
                            <Input label="Max Age" name="max_age" type="number" defaultValue={currentNorm?.max_age || 38} required />
                            <Input label="Workload(hr/wk)" name="workload_hours_per_week" type="number" defaultValue={currentNorm?.workload_hours_per_week || 1} required />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                          {courseSpecificNorm && (
                            <Button
                              type="button"
                              variant="ghost"
                              className="text-red-500 hover:bg-red-50"
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to remove this course-specific norm? It will fall back to the category default.')) {
                                  await dispatch(deleteNorm(courseSpecificNorm.id));
                                  dispatch(fetchNorms({ academicYear, institutionId: selectedInstitutionForCourses.id }));
                                }
                              }}
                            >
                              <Trash2 size={18} className="mr-2" /> Delete Override
                            </Button>
                          )}
                          <Button type="submit" variant="accent" className="px-8 h-12 shadow-lg shadow-accent/20">
                            <Save size={18} className="mr-2" />
                            {currentNorm ? 'Update Recruitment Norms' : 'Apply Recruitment Norms'}
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </form>
              )}
            </div>

            {/* Back Button */}
            <div className="pt-6 border-t border-border mt-8">
              <Button type="button" variant="ghost" onClick={() => setSelectedCourse(null)} className="text-secondary hover:text-foreground">
                <ChevronRight size={18} className="mr-2 rotate-180" /> Back to Courses List
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Table Section */}
      <div className="bg-background border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="font-bold text-foreground">Registered Institutions</h3>
        </div>
        {loading ? (
          <div className="py-20 text-center text-secondary italic">Updating list...</div>
        ) : (
          <Table
            columns={columns}
            data={institutions}
            actions={(row) => (
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  className="p-2 h-auto text-accent hover:bg-accent/10"
                  onClick={() => setSelectedInstitutionForCourses(row)}
                  title="View Courses & Intake"
                >
                  <BarChart3 size={16} />
                </Button>
                {[ROLES.ADMIN, ROLES.RO].includes(role) && (
                  <>
                    <Button 
                      variant="ghost" 
                      className="p-2 h-auto text-blue-500 hover:bg-blue-500/10"
                      onClick={() => handleEdit(row)}
                      title="Edit Institution"
                    >
                      <Edit size={16} />
                    </Button>
                    <button 
                      type="button"
                      style={{ background: 'none', border: '1px solid red', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: 'red' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('[DELETE CLICK] Button clicked for row:', row.id, row.name);
                        handleDelete(row.id);
                      }}
                      title="Delete Institution"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default InstitutionManagement;
