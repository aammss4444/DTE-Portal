import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Building2, GraduationCap, BookOpen, UserCheck, Plus, Search, Edit2, Trash2, Filter, AlertCircle, Info, Save, X, Calculator, Zap, FileSpreadsheet } from 'lucide-react';
import { Table } from '../../components/common/Table';
import { Button, Input } from '../../components/common/UIComponents';
import Modal from '../../components/common/Modal';
import { fetchInstitutions } from './institutionSlice';
import { fetchCourses } from './courseSlice';
import { fetchIntakes, createIntake, updateIntake, deleteIntake, resetIntakeState } from './intakeSlice';
import { fetchNorms, createNorm, updateNorm, deleteNorm, resetNormState, seedDTEDefaults } from './normSlice';
import { generateRequirements } from './requirementSlice';

const NormsIntakeManagement = () => {
  const dispatch = useDispatch();
  const { institutions = [] } = useSelector((state) => state.institutions || {});
  const { user, role } = useSelector((state) => state.auth);
  const { intakes = [], success: intakeSuccess, error: intakeError } = useSelector((state) => state.intakes || {});
  const { norms = [], success: normSuccess, error: normError } = useSelector((state) => state.norms || {});
  
  const [selectedInst, setSelectedInst] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generationResults, setGenerationResults] = useState({}); // course_id -> requirement_data
  const [isGenerating, setIsGenerating] = useState(false);

  // Modals
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isNormModalOpen, setIsNormModalOpen] = useState(false);
  
  // Active Record for CRUD
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeRecord, setActiveRecord] = useState(null); // For update

  // Form Data
  const [intakeFormData, setIntakeFormData] = useState({ approved_seats: 0, actual_admitted: 0 });
  const [normFormData, setNormFormData] = useState({
    course_category: '',
    min_qualification: '',
    grade_requirement: 'First Class',
    faculty_student_ratio: 20,
    max_age: 38,
    workload_hours_per_week: 1
  });

  useEffect(() => {
    if (role === 'ADMIN') {
      dispatch(fetchInstitutions({ page: 1, limit: 100 }));
    } else if (role === 'PRINCIPAL' && user?.institution_id) {
      setSelectedInst(user.institution_id.toString());
    }
  }, [dispatch, role, user]);

  useEffect(() => {
    if (selectedInst) {
      loadData();
    }
  }, [selectedInst, academicYear]);

  const loadData = async () => {
    setLoading(true);
    try {
      const courseData = await dispatch(fetchCourses({ page: 1, limit: 50, institutionId: selectedInst })).unwrap();
      setCourses(courseData.data);
      dispatch(fetchIntakes({ institutionId: selectedInst, academicYear }));
      dispatch(fetchNorms({ academicYear, institutionId: selectedInst }));
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIntakeClick = (course, existing = null) => {
    setActiveCourse(course);
    if (existing) {
      setActiveRecord(existing);
      setIntakeFormData({ approved_seats: existing.approved_seats, actual_admitted: existing.actual_admitted });
    } else {
      setActiveRecord(null);
      setIntakeFormData({ approved_seats: 0, actual_admitted: 0 });
    }
    setIsIntakeModalOpen(true);
  };

  const handleNormClick = (course, existing = null) => {
    setActiveCourse(course);
    if (existing) {
      setActiveRecord(existing);
      setNormFormData({
        course_category: existing.course_category,
        min_qualification: existing.min_qualification,
        grade_requirement: existing.grade_requirement,
        faculty_student_ratio: existing.faculty_student_ratio,
        max_age: existing.max_age,
        workload_hours_per_week: existing.workload_hours_per_week
      });
    } else {
      setActiveRecord(null);
      // Derive defaults
      let category = '';
      if (course.level.toLowerCase().includes('diploma')) category = 'Engineering & Technology (Diploma)';
      else if (course.level.toLowerCase().includes('degree')) category = 'Engineering (Degree - B.E./B.Tech)';
      
      setNormFormData({
        course_category: category,
        min_qualification: course.level.toLowerCase().includes('diploma') ? 'B.E./B.Tech in relevant course' : 'M.E./M.Tech in relevant course',
        grade_requirement: 'First Class',
        faculty_student_ratio: 20,
        max_age: 38,
        workload_hours_per_week: 18
      });
    }
    setIsNormModalOpen(true);
  };

  const handleIntakeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeRecord) {
        await dispatch(updateIntake({ id: activeRecord.id, data: intakeFormData })).unwrap();
      } else {
        await dispatch(createIntake({ 
          institution_id: parseInt(selectedInst), 
          course_id: activeCourse.id, 
          academic_year: academicYear,
          ...intakeFormData 
        })).unwrap();
      }
      setIsIntakeModalOpen(false);
      dispatch(resetIntakeState());
    } catch (err) {
      alert(err || 'Operation failed');
    }
  };

  const handleNormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeRecord) {
        await dispatch(updateNorm({ id: activeRecord.id, data: normFormData })).unwrap();
      } else {
        await dispatch(createNorm({ 
          institution_id: parseInt(selectedInst), 
          course_id: activeCourse.id, 
          academic_year: academicYear,
          norm_type: 'COURSE_WISE',
          ...normFormData 
        })).unwrap();
      }
      setIsNormModalOpen(false);
      dispatch(resetNormState());
    } catch (err) {
      alert(err || 'Operation failed');
    }
  };

  const handleDeleteIntake = async (id) => {
    if (window.confirm('Delete this intake record?')) {
      await dispatch(deleteIntake(id));
    }
  };

  const handleDeleteNorm = async (id) => {
    if (window.confirm('Delete this norm record?')) {
      await dispatch(deleteNorm(id));
    }
  };

  const handleGenerateAll = async () => {
    if (!selectedInst) return;
    
    // Find all courses that have both an intake and a norm defined
    const validCourses = courses.filter(course => {
      const hasIntake = intakes.some(i => i.course_id === course.id);
      const hasNorm = norms.some(n => n.course_id === course.id);
      return hasIntake && hasNorm;
    });

    if (validCourses.length === 0) {
      alert("No courses have both Intake and Norms defined. Please configure them first.");
      return;
    }

    if (!window.confirm(`Are you sure you want to generate requirements for ${validCourses.length} eligible courses?`)) return;

    setIsGenerating(true);
    try {
      const res = await dispatch(generateRequirements({ 
        institution_id: parseInt(selectedInst),
        academic_year: academicYear
      })).unwrap();
      
      const newResults = {};
      res.forEach(req => {
        const intake = intakes.find(i => i.id === req.intake_id);
        if (intake) {
          newResults[intake.course_id] = req;
        }
      });
      setGenerationResults(prev => ({ ...prev, ...newResults }));
      alert(`Successfully generated requirements for ${res.length} courses.`);
    } catch (err) {
      alert(err || 'Bulk generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Course',
      render: (val, row) => (
        <div>
          <p className="font-bold text-foreground">{val}</p>
          <p className="text-[10px] text-secondary font-bold uppercase">{row.level}</p>
        </div>
      )
    },
    {
      key: 'intake',
      label: 'Intake Configuration',
      render: (_, row) => {
        const intake = intakes.find(i => i.course_name === row.name); // Simple match for demo, ideally use ID join if available in response
        if (intake) {
          return (
            <div className="flex items-center space-x-3 bg-accent/5 p-2 rounded-lg border border-accent/10 group">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-accent uppercase">Approved / Admitted</p>
                <p className="font-bold text-foreground text-sm">{intake.approved_seats} / {intake.actual_admitted}</p>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleIntakeClick(row, intake)} className="p-1 text-accent hover:bg-accent/20 rounded"><Edit2 size={12} /></button>
                <button onClick={() => handleDeleteIntake(intake.id)} className="p-1 text-red-500 hover:bg-red-500/20 rounded"><Trash2 size={12} /></button>
              </div>
            </div>
          );
        }
        return <Button variant="outline" size="sm" onClick={() => handleIntakeClick(row)} className="text-[10px] h-8"><Plus size={12} className="mr-1" /> Configure Intake</Button>;
      }
    },
    {
      key: 'norms',
      label: 'Norms Configuration',
      render: (_, row) => {
        const norm = norms.find(n => n.course_id === row.id);
        if (norm) {
          return (
            <div className="flex items-center space-x-3 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 group">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-emerald-600 uppercase">Ratio / Qualification</p>
                <p className="font-bold text-foreground text-sm">1:{norm.faculty_student_ratio} • {norm.min_qualification}</p>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleNormClick(row, norm)} className="p-1 text-emerald-600 hover:bg-emerald-500/20 rounded"><Edit2 size={12} /></button>
                <button onClick={() => handleDeleteNorm(norm.id)} className="p-1 text-red-500 hover:bg-red-500/20 rounded"><Trash2 size={12} /></button>
              </div>
            </div>
          );
        }
        return <Button variant="outline" size="sm" onClick={() => handleNormClick(row)} className="text-[10px] h-8 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/5"><Plus size={12} className="mr-1" /> Define Norms</Button>;
      }
    },
    {
      key: 'requirements',
      label: 'Faculty Requirement',
      render: (_, row) => {
        const intake = intakes.find(i => i.course_id === row.id);
        const norm = norms.find(n => n.course_id === row.id);
        const result = generationResults[row.id];

        return (
          <div className="flex items-center space-x-3">
            {result ? (
              <div className="flex items-center space-x-3 bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10 w-full animate-in zoom-in-95 duration-300">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase">Computed Requirement</p>
                  <p className="font-bold text-foreground text-sm">{result.computed_required_count} Faculty Positions</p>
                </div>
              </div>
            ) : (
              <span className="text-xs text-secondary italic">
                {!intake || !norm ? 'Data Missing' : 'Pending Generation'}
              </span>
            )}
          </div>
        );
      }
    }
  ];

  const handleBulkGenerate = async () => {
    if (!selectedInst) return;
    setIsGenerating(true);
    try {
      const res = await dispatch(generateRequirements({ 
        institution_id: parseInt(selectedInst),
        academic_year: academicYear
      })).unwrap();
      
      const newResults = {};
      res.forEach(req => {
        const intake = intakes.find(i => i.id === req.intake_id);
        if (intake) {
          newResults[intake.course_id] = req;
        }
      });
      setGenerationResults(prev => ({ ...prev, ...newResults }));
      alert(`Successfully generated requirements for ${res.length} courses.`);
    } catch (err) {
      alert(err || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Step 1: Faculty Requirements</h1>
          <p className="text-secondary text-sm font-medium">Define recruitment norms, student intake, and generate staff requirements for institutional planning.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {selectedInst && (
            <div className="flex space-x-2">

              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateAll}
                disabled={isGenerating}
                className="text-[10px] h-9 bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100"
              >
                <Calculator size={14} className={`mr-1.5 ${isGenerating ? 'animate-pulse' : ''}`} /> 
                {isGenerating ? 'Generating...' : 'Generate All'}
              </Button>
            </div>
          )}

          <div className="flex items-center space-x-4 bg-background p-2 rounded-xl border border-border shadow-sm">
            <div className="flex items-center space-x-2">
            <Filter size={16} className="text-secondary" />
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
          <div className="h-4 w-px bg-border" />
          {role === 'ADMIN' && (
            <div className="flex items-center space-x-2">
              <Building2 size={16} className="text-secondary" />
              <select 
                className="bg-transparent text-sm font-bold text-foreground outline-none cursor-pointer max-w-[200px]"
                value={selectedInst}
                onChange={(e) => setSelectedInst(e.target.value)}
              >
                <option value="">Select Institution</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>
          )}
          {role === 'PRINCIPAL' && user?.institution_id && (
            <div className="flex items-center space-x-2 px-2">
              <Building2 size={16} className="text-accent" />
              <span className="text-sm font-bold text-foreground truncate max-w-[200px]">
                {user.full_name || 'My Institution'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>

      {selectedInst ? (
        <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <GraduationCap size={20} />
              </div>
              <h2 className="font-bold text-foreground">Institutional Courses</h2>
            </div>
            <div className="px-3 py-1 bg-background border border-border rounded-full text-[10px] font-bold text-secondary uppercase tracking-widest">
              {courses.length} Courses Found
            </div>
          </div>
          
          <Table 
            columns={columns} 
            data={courses}
            className="border-none rounded-none"
          />
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center bg-muted/20 border-2 border-dashed border-border rounded-2xl text-secondary space-y-4">
          <div className="p-4 bg-background rounded-full shadow-sm">
            <Building2 size={48} className="opacity-20" />
          </div>
          <p className="font-medium">Please select an institution to manage its norms and intake.</p>
        </div>
      )}

      {/* Intake Modal */}
      <Modal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        title={`${activeRecord ? 'Update' : 'Configure'} Intake: ${activeCourse?.name}`}
      >
        <form onSubmit={handleIntakeSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Approved Seats" 
              type="number"
              value={intakeFormData.approved_seats}
              onChange={(e) => setIntakeFormData({...intakeFormData, approved_seats: parseInt(e.target.value)})}
              required
            />
            <Input 
              label="Actual Admitted" 
              type="number"
              value={intakeFormData.actual_admitted}
              onChange={(e) => setIntakeFormData({...intakeFormData, actual_admitted: parseInt(e.target.value)})}
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsIntakeModalOpen(false)}>Cancel</Button>
            <Button variant="accent" type="submit">Save Configuration</Button>
          </div>
        </form>
      </Modal>

      {/* Norm Modal */}
      <Modal
        isOpen={isNormModalOpen}
        onClose={() => setIsNormModalOpen(false)}
        title={`${activeRecord ? 'Update' : 'Define'} Norms: ${activeCourse?.name}`}
      >
        <form onSubmit={handleNormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <label className="block text-sm font-medium text-secondary">Course Category</label>
              <select 
                className="w-full px-4 py-2 rounded-lg border border-border bg-background outline-none text-sm"
                value={normFormData.course_category}
                onChange={(e) => setNormFormData({...normFormData, course_category: e.target.value})}
                required
              >
                <option value="Engineering & Technology (Diploma)">Engineering & Technology (Diploma)</option>
                <option value="Engineering (Degree - B.E./B.Tech)">Engineering (Degree - B.E./B.Tech)</option>
                <option value="HMCT (Hotel Management)">HMCT (Hotel Management)</option>
                <option value="Non-Engineering (Applied Sciences)">Non-Engineering (Applied Sciences)</option>
              </select>
            </div>
            <Input 
              label="Min Qualification" 
              value={normFormData.min_qualification}
              onChange={(e) => setNormFormData({...normFormData, min_qualification: e.target.value})}
              required
            />
            <Input 
              label="Grade Requirement" 
              value={normFormData.grade_requirement}
              onChange={(e) => setNormFormData({...normFormData, grade_requirement: e.target.value})}
              required
            />
            <Input 
              label="F:S Ratio" 
              type="number"
              step="0.1"
              value={normFormData.faculty_student_ratio}
              onChange={(e) => setNormFormData({...normFormData, faculty_student_ratio: parseFloat(e.target.value)})}
              required
            />
            <Input 
              label="Max Age" 
              type="number"
              value={normFormData.max_age}
              onChange={(e) => setNormFormData({...normFormData, max_age: parseInt(e.target.value)})}
              required
            />
            <Input 
              label="Workload (hrs/wk)" 
              type="number"
              value={normFormData.workload_hours_per_week}
              onChange={(e) => setNormFormData({...normFormData, workload_hours_per_week: parseInt(e.target.value)})}
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsNormModalOpen(false)}>Cancel</Button>
            <Button variant="accent" type="submit">Apply Norms</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NormsIntakeManagement;
