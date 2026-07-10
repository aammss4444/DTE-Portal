import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Building2, FileText, Briefcase } from 'lucide-react';
import api from '../../services/api';
import InstitutionManagement from './InstitutionManagement';
import CourseManagement from './CourseManagement';
import NormsIntakeManagement from './NormsIntakeManagement';
import AIValidationDashboard from './AIValidationDashboard';
import { fetchBillingRates } from './billingSlice';
import { Table } from '../../components/common/Table';
import { Input, Button } from '../../components/common/UIComponents';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('institutes');
  const [liveStats, setLiveStats] = useState({
    advertisements: 0,
    vacancies: 0,
    users: 0,
    bills: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/requirements/dashboard/admin-stats');
        if (res.data && res.data.status === 'success') {
          setLiveStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: 'Actual Advertisements', value: liveStats.advertisements, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Vacancy Generated', value: liveStats.vacancies, icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Registered Users', value: liveStats.users, icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Bills Passed', value: liveStats.bills, icon: Briefcase, color: 'text-green-500', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Overview</h1>
        <p className="text-secondary">Manage institutions, courses, recruitment norms, and advertisements.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-background rounded-xl border border-border shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>


      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {['institutes', 'courses', 'requirements', 'advertisements', 'ai_validation', 'rates'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 text-sm font-semibold rounded-md transition-all capitalize ${
              activeTab === tab ? 'bg-background text-foreground shadow-sm' : 'text-secondary hover:text-foreground'
            }`}
          >
            {tab === 'requirements' ? 'Requirements' : 
             tab === 'ai_validation' ? 'AI Validation' : 
             tab === 'rates' ? 'Honorarium Rates' :
             tab.replace('_', ' & ')}
          </button>
        ))}
      </div>

      {/* Content Section */}
      <div>
        {activeTab === 'institutes' && <InstitutionManagement />}
        {activeTab === 'courses' && <CourseManagement />}
        {activeTab === 'requirements' && <NormsIntakeManagement />}
        {activeTab === 'ai_validation' && <AIValidationDashboard />}
        {activeTab === 'rates' && <HonorariumRatesView />}
        
        {activeTab !== 'institutes' && activeTab !== 'courses' && activeTab !== 'requirements' && activeTab !== 'advertisements' && (
          <div className="bg-background border border-border rounded-xl p-20 text-center text-secondary italic">
            Management UI for {activeTab} is coming soon.
          </div>
        )}

        {/* Advertisement Generation UI */}
        {activeTab === 'advertisements' && (
          <div className="bg-background rounded-xl border border-border shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Generate Advertisement</h3>
              <div className="flex items-center bg-muted p-1 rounded-lg">
                <button className="px-3 py-1 text-xs font-semibold bg-background rounded shadow-sm">English</button>
                <button className="px-3 py-1 text-xs font-semibold text-secondary">Marathi</button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input label="Advertisement Title" placeholder="e.g. Recruitment for Faculty Positions 2026" />
                <Input label="Reference Number" placeholder="DTE/RECRUIT/2026/01" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Opening Date" type="date" />
                  <Input label="Closing Date" type="date" />
                </div>
              </div>
              <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center space-y-4 bg-muted/20">
                <FileText className="text-secondary/40" size={48} />
                <div>
                  <p className="font-medium text-secondary">Ad Content Preview</p>
                  <p className="text-xs text-secondary/60 mt-1">Configure parameters to see the generated content.</p>
                </div>
                <Button variant="outline" size="sm">Download PDF Draft</Button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

const HonorariumRatesView = () => {
  const dispatch = useDispatch();
  const { rates, loading } = useSelector((state) => state.billing);
  const { institutions } = useSelector((state) => state.institutions);
  const [instId, setInstId] = useState('1');
  const [year] = useState('2026-2027');

  useEffect(() => {
    if (instId) {
      dispatch(fetchBillingRates({ institution_id: parseInt(instId), academic_year: year }));
    }
  }, [dispatch, instId, year]);

  const columns = [
    { key: 'designation', label: 'Designation' },
    { key: 'lecture_type', label: 'Type' },
    { key: 'rate_per_lecture', label: 'Rate', render: (val) => <span className="font-bold">₹{val}</span> },
    { key: 'effective_from', label: 'Effective From' },
    { key: 'is_active', label: 'Status', render: (val) => <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val ? 'Active' : 'Inactive'}</span> }
  ];

  return (
    <div className="bg-background rounded-xl border border-border shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Institutional Honorarium Rates</h3>
        <select 
          className="bg-muted border border-border rounded-lg px-4 py-2 text-sm font-semibold outline-none"
          value={instId}
          onChange={(e) => setInstId(e.target.value)}
        >
          {institutions.map(inst => (
            <option key={inst.id} value={inst.id}>{inst.name}</option>
          ))}
        </select>
      </div>
      <Table 
        columns={columns}
        data={rates}
        loading={loading}
      />
    </div>
  );
};

export default AdminDashboard;
