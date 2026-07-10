import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, GraduationCap, Building2, ChevronRight, Filter, Info, Edit2, Trash2, AlertTriangle, Save, X, Settings2 } from 'lucide-react';
import { Table } from '../../components/common/Table';
import { Button, Input } from '../../components/common/UIComponents';
import Modal from '../../components/common/Modal';
import { fetchCourses, updateCourse, deleteCourse } from './courseSlice';
import { fetchInstitutions } from './institutionSlice';

const CourseManagement = () => {
  const dispatch = useDispatch();
  const { courses = [], loading: coursesLoading } = useSelector((state) => state.courses || {});
  const { institutions = [], loading: instLoading } = useSelector((state) => state.institutions || {});

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseName, setSelectedCourseName] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Edit State
  const [editingInstance, setEditingInstance] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', level: '' });

  useEffect(() => {
    dispatch(fetchCourses({ page: 1, limit: 100 }));
    dispatch(fetchInstitutions({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Group course instances by name to see unique courses
  const uniqueCourses = (Array.isArray(courses) ? courses : []).reduce((acc, course) => {
    const existing = acc.find(c => c.name === course.name && c.level === course.level);
    if (existing) {
      existing.instances.push(course);
      existing.institutionIds.add(course.institution_id);
    } else {
      acc.push({
        name: course.name,
        level: course.level,
        instances: [course],
        institutionIds: new Set([course.institution_id])
      });
    }
    return acc;
  }, []);

  const filteredCourses = uniqueCourses.filter(course =>
    course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.level?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const institutionMap = (Array.isArray(institutions) ? institutions : []).reduce((acc, inst) => {
    acc[inst.id] = inst;
    return acc;
  }, {});

  const columns = [
    {
      key: 'name',
      label: 'Course Name',
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{val}</span>
          <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">{row.level}</span>
        </div>
      )
    },
    {
      key: 'institutionIds',
      label: 'Institutions',
      render: (ids) => (
        <div className="flex items-center space-x-1">
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent border border-accent/20">
            {ids.size} Institutions
          </span>
        </div>
      )
    }
  ];

  const handleViewInstitutions = (course) => {
    setSelectedCourseName(course);
    setIsDetailsModalOpen(true);
  };

  const handleEditClick = (instance) => {
    setEditingInstance(instance);
    setEditFormData({ name: instance.name, level: instance.level });
  };

  const handleUpdate = async () => {
    try {
      await dispatch(updateCourse({ id: editingInstance.id, data: editFormData })).unwrap();
      setEditingInstance(null);
      setIsDetailsModalOpen(false);
      setSelectedCourseName(null);
    } catch (err) {
      alert(err || 'Failed to update course');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course instance? This action cannot be undone.')) {
      try {
        await dispatch(deleteCourse(id)).unwrap();
        setIsDetailsModalOpen(false);
        setSelectedCourseName(null);
      } catch (err) {
        alert(err || 'Failed to delete course');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background border border-border p-4 rounded-xl shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <GraduationCap size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Course Catalog</h2>
            <p className="text-xs text-secondary font-medium">Manage and view courses across all institutions</p>
          </div>
        </div>

        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
          <input
            type="text"
            placeholder="Search courses or levels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border focus:bg-background focus:border-accent rounded-lg text-sm transition-all outline-none"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-background border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
          <h3 className="font-bold text-foreground flex items-center">
            Available Courses
            <span className="ml-2 px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold text-secondary uppercase">
              {filteredCourses.length} TOTAL
            </span>
          </h3>
          <Button variant="ghost" size="sm" className="text-secondary h-8 px-2">
            <Filter size={14} className="mr-2" /> Filter
          </Button>
        </div>

        {(coursesLoading || instLoading) ? (
          <div className="py-20 text-center text-secondary italic">Loading courses and institutions...</div>
        ) : (
          <Table
            columns={columns}
            data={filteredCourses}
            actions={(row) => (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewInstitutions(row)}
                  className="h-9 w-9 p-0 text-accent hover:bg-accent/10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  title="Configure Course Instances"
                >
                  <Settings2 size={18} />
                </Button>
              </div>
            )}
          />
        )}
      </div>

      {/* Detailed Modal: Show institutions offering the course */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedCourseName(null);
          setEditingInstance(null);
        }}
        title={`Institutions offering ${selectedCourseName?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-accent/5 p-4 rounded-lg border border-accent/10 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-accent uppercase tracking-widest">Global Course Info</p>
              <p className="text-lg font-bold text-foreground">{selectedCourseName?.name}</p>
              <p className="text-xs text-secondary font-medium">{selectedCourseName?.level}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Instance Count</p>
              <p className="text-xl font-bold text-accent">{selectedCourseName?.instances.length}</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {selectedCourseName?.instances.map((instance) => {
              const institution = institutionMap[instance.institution_id];
              const isEditingThis = editingInstance?.id === instance.id;

              return (
                <div key={instance.id} className="group p-4 bg-muted/20 border border-border rounded-xl transition-all hover:bg-muted/40 hover:border-accent/30">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {isEditingThis ? (
                        <div className="space-y-3 mb-2 animate-in fade-in slide-in-from-top-1">
                          <Input
                            label="Course Name"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          />
                          <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-secondary">Level</label>
                            <select
                              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-accent outline-none text-sm"
                              value={editFormData.level}
                              onChange={(e) => setEditFormData({ ...editFormData, level: e.target.value })}
                            >
                              <option value="DIPLOMA">DIPLOMA</option>
                              <option value="UG">UG (Degree)</option>
                              <option value="PG">PG</option>
                              <option value="PHD">PHD</option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2">
                            <Building2 size={16} className="text-accent" />
                            <p className="font-bold text-foreground">{institution?.name || 'Unknown Institution'}</p>
                          </div>
                          <p className="text-xs text-secondary mt-1 ml-6">{institution?.address || 'No address provided'}</p>
                          <div className="mt-3 flex items-center space-x-2 ml-6">
                            <span className="px-2 py-0.5 bg-background border border-border rounded-md text-[10px] font-bold text-secondary uppercase tracking-widest">
                              ID: {instance.id}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      {isEditingThis ? (
                        <>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50 rounded-full" onClick={handleUpdate} title="Save Changes">
                            <Save size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 rounded-full" onClick={() => setEditingInstance(null)} title="Cancel">
                            <X size={16} />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-secondary hover:text-accent hover:bg-accent/10 rounded-full opacity-0 group-hover:opacity-100 transition-all" onClick={() => handleEditClick(instance)} title="Edit Instance">
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-secondary hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all" onClick={() => handleDelete(instance.id)} title="Delete Instance">
                            <Trash2 size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseManagement;
