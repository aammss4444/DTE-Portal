import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calculator, Search, Filter, BookOpen } from 'lucide-react';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/UIComponents';
import { fetchCourses } from './courseSlice';
import { fetchInstitutions } from './institutionSlice';
import { generateRequirements } from './requirementSlice';

const CourseRequirements = () => {
  const dispatch = useDispatch();
  const { user, role } = useSelector((state) => state.auth);
  const { courses = [], loading: coursesLoading } = useSelector((state) => state.courses || {});
  const { institutions = [] } = useSelector((state) => state.institutions || {});
  
  const [selectedInst, setSelectedInst] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResults, setGenerationResults] = useState({});

  useEffect(() => {
    if (role === 'ADMIN') {
      dispatch(fetchInstitutions({ page: 1, limit: 100 }));
    } else if (role === 'PRINCIPAL' && user?.institution_id) {
      setSelectedInst(user.institution_id.toString());
    }
  }, [dispatch, role, user]);

  useEffect(() => {
    if (selectedInst) {
      dispatch(fetchCourses({ page: 1, limit: 100, institutionId: selectedInst }));
    }
  }, [dispatch, selectedInst]);

  const handleGenerateCourse = async (courseId) => {
    setIsGenerating(courseId);
    try {
      const res = await dispatch(generateRequirements({ 
        institution_id: parseInt(selectedInst),
        academic_year: academicYear,
        course_id: courseId
      })).unwrap();
      
      if (res && res.length > 0) {
        setGenerationResults(prev => ({ ...prev, [courseId]: res[0] }));
      }
    } catch (err) {
      alert(err || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Course Name' },
    { key: 'level', label: 'Level' },
    { 
      key: 'actions', 
      label: 'Specific Requirement',
      render: (_, row) => {
        const result = generationResults[row.id];
        return (
          <div className="w-64">
            {result ? (
              <div className="flex items-center space-x-3 bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10 w-full animate-in zoom-in-95 duration-300">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase">Computed Requirement</p>
                  <p className="font-bold text-foreground text-sm">{result.computed_required_count} Faculty Positions</p>
                </div>
                <button 
                  onClick={() => handleGenerateCourse(row.id)}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-500/20 rounded transition-colors"
                  title="Re-calculate"
                  disabled={isGenerating === row.id}
                >
                  <Calculator size={14} className={isGenerating === row.id ? "animate-spin" : ""} />
                </button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={isGenerating === row.id}
                onClick={() => handleGenerateCourse(row.id)}
                className="text-[10px] h-8 w-full border border-dashed transition-all border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/5 hover:border-indigo-500"
              >
                {isGenerating === row.id ? 'Calculating...' : (
                  <>
                    <Calculator size={12} className="mr-1.5" /> 
                    Generate Requirement
                  </>
                )}
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  const filteredCourses = courses.filter(course => 
    course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.level?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center">
            <BookOpen className="mr-2 text-accent" size={24} />
            Specific Course Requirements
          </h1>
          <p className="text-secondary text-sm mt-1">Generate faculty requirements for individual courses.</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="grid md:grid-cols-3 gap-4">
        {role === 'ADMIN' && (
          <div className="flex items-center bg-background rounded-xl border border-border px-3 py-2 shadow-sm">
            <select 
              className="bg-transparent border-none outline-none text-sm w-full text-foreground font-medium cursor-pointer"
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
        
        <div className={`flex items-center bg-background rounded-xl border border-border px-4 py-2 shadow-sm ${role === 'PRINCIPAL' ? 'md:col-span-2' : ''}`}>
          <Search size={18} className="text-secondary mr-2" />
          <input 
            type="text" 
            placeholder="Search courses..." 
            className="bg-transparent border-none outline-none text-sm w-full text-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center bg-background rounded-xl border border-border px-3 py-2 shadow-sm">
          <Filter size={18} className="text-secondary mr-2" />
          <select 
            className="bg-transparent border-none outline-none text-sm w-full text-foreground font-medium cursor-pointer"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          >
            <option value="2026-27">2026-27</option>
            <option value="2025-26">2025-26</option>
          </select>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
        {coursesLoading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-secondary font-medium italic">Loading courses...</p>
          </div>
        ) : !selectedInst ? (
          <div className="p-20 text-center text-secondary italic">Please select an institution to view courses.</div>
        ) : filteredCourses.length > 0 ? (
          <Table 
            columns={columns} 
            data={filteredCourses}
          />
        ) : (
          <div className="p-20 text-center text-secondary italic">No courses found for this institution.</div>
        )}
      </div>
    </div>
  );
};

export default CourseRequirements;
