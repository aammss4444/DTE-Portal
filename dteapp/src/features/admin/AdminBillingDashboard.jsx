import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  CreditCard, 
  ReceiptText, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Plus, 
  Trash2, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowLeft,
  X,
  Edit,
  Building2,
  Info,
  Activity,
  ShieldCheck,
  Search,
  Eye,
  History,
  FileText,
  Cpu,
  Zap,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  Camera,
  Archive
} from 'lucide-react';
import { Button, Input } from '../../components/common/UIComponents';
import { Table } from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { 
  createBillingRate, 
  updateBillingRate, 
  fetchBillingRates, 
  fetchBills,
  fetchBillDetails,
  fetchBillApprovals,
  fetchAIReadiness,
  createAISnapshot,
  resetBillingStatus, 
  setPage,
  fetchAIMonitor
} from './billingSlice';
import { fetchInstitutions } from './institutionSlice';
import toast from 'react-hot-toast';

// Enum Constants
const DESIGNATIONS = {
  'ASSISTANT_PROFESSOR': 'Assistant Professor',
  'ASSOCIATE_PROFESSOR': 'Associate Professor',
  'PROFESSOR': 'Professor',
  'VISITING_FACULTY': 'Visiting Faculty',
  'GUEST_FACULTY': 'Guest Faculty'
};

const LECTURE_TYPES = {
  'THEORY': 'Theory',
  'LAB': 'Lab',
  'TUTORIAL': 'Tutorial'
};

const AdminBillingDashboard = () => {
  const dispatch = useDispatch();
  const { 
    rates, totalRates, 
    bills, totalBills,
    selectedBill, selectedBillApprovals, selectedBillReadiness,
    aiMonitorData,
    page, limit, loading, fetching, error, success 
  } = useSelector((state) => state.billing);
  const { institutions } = useSelector((state) => state.institutions);

  const [activeTab, setActiveTab] = useState('rates'); 
  const [selectedInstituteId, setSelectedInstituteId] = useState("");
  const [selectedYear, setSelectedYear] = useState("2026-2027");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingRateId, setEditingRateId] = useState(null);
  
  const initialFormState = {
    academic_year: '2026-2027',
    rates: [
      {
        designation: 'ASSISTANT_PROFESSOR',
        lecture_type: 'THEORY',
        rate_per_lecture: 800,
        effective_from: "2025-06-01",
        effective_to: null,
        is_active: true
      }
    ]
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (institutions.length === 0) {
      dispatch(fetchInstitutions({ page: 1, limit: 100 }));
    } else if (!selectedInstituteId && institutions.length > 0) {
      setSelectedInstituteId(institutions[0].id.toString());
    }
  }, [dispatch, institutions, selectedInstituteId]);

  useEffect(() => {
    if (activeTab === 'rates' && selectedInstituteId) {
      dispatch(fetchBillingRates({ 
        page, 
        limit, 
        institution_id: parseInt(selectedInstituteId),
        academic_year: selectedYear
      }));
    } else if (activeTab === 'bills') {
      dispatch(fetchBills({ 
        page, 
        limit, 
        institution_id: selectedInstituteId ? parseInt(selectedInstituteId) : undefined 
      }));
    } else if (activeTab === 'ai-monitor') {
      dispatch(fetchAIMonitor());
    }
  }, [dispatch, selectedInstituteId, selectedYear, page, limit, activeTab]);

  useEffect(() => {
    if (success) {
      toast.success('Operation completed successfully!');
      if (activeTab === 'rates') {
        dispatch(fetchBillingRates({ 
          page: 1, 
          limit, 
          institution_id: parseInt(selectedInstituteId),
          academic_year: selectedYear
        }));
      }
      closeModal();
      dispatch(resetBillingStatus());
    }
    if (error) {
      toast.error(typeof error === 'string' ? error : (error?.message || JSON.stringify(error)));
      dispatch(resetBillingStatus());
    }
  }, [success, error, dispatch, selectedInstituteId, selectedYear, limit, editingRateId, activeTab]);

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDetailsModalOpen(false);
    setEditingRateId(null);
    setFormData(initialFormState);
  };

  const handleEdit = (rate) => {
    setEditingRateId(rate.id);
    setFormData({
      academic_year: rate.academic_year,
      rates: [
        {
          designation: rate.designation,
          lecture_type: rate.lecture_type,
          rate_per_lecture: rate.rate_per_lecture,
          effective_from: rate.effective_from,
          effective_to: rate.effective_to,
          is_active: rate.is_active
        }
      ]
    });
    setIsModalOpen(true);
  };

  const handleViewDetails = (billId) => {
    dispatch(fetchBillDetails(billId));
    dispatch(fetchBillApprovals(billId));
    dispatch(fetchAIReadiness(billId));
    setIsDetailsModalOpen(true);
  };

  const handleSnapshot = (billId) => {
    dispatch(createAISnapshot(billId));
  };

  const handleRateChange = (index, field, value) => {
    const newRates = [...formData.rates];
    if (field === 'is_active') {
      newRates[index][field] = value === 'true';
    } else {
      newRates[index][field] = field === 'rate_per_lecture' ? parseInt(value) || 0 : value;
    }
    setFormData({ ...formData, rates: newRates });
  };

  const addRate = () => {
    if (editingRateId) return; 
    setFormData({
      ...formData,
      rates: [
        ...formData.rates,
        {
          designation: 'ASSISTANT_PROFESSOR',
          lecture_type: 'THEORY',
          rate_per_lecture: 0,
          effective_from: new Date().toISOString().split('T')[0],
          effective_to: null,
          is_active: true
        }
      ]
    });
  };

  const removeRate = (index) => {
    if (formData.rates.length === 1 || editingRateId) return;
    const newRates = formData.rates.filter((_, i) => i !== index);
    setFormData({ ...formData, rates: newRates });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedInstituteId) {
      toast.error('Please select an institute first');
      return;
    }

    const instId = parseInt(selectedInstituteId);

    if (editingRateId) {
      const rateToUpdate = formData.rates[0];
      const payload = {
        institution_id: instId,
        academic_year: formData.academic_year,
        designation: rateToUpdate.designation,
        lecture_type: rateToUpdate.lecture_type,
        rate_per_lecture: parseInt(rateToUpdate.rate_per_lecture) || 0,
        effective_from: rateToUpdate.effective_from,
        effective_to: rateToUpdate.effective_to || null,
        is_active: rateToUpdate.is_active
      };
      dispatch(updateBillingRate({ id: editingRateId, data: payload }));
    } else {
      const cleanedRates = formData.rates.map(rate => ({
        ...rate,
        rate_per_lecture: parseInt(rate.rate_per_lecture) || 0,
        effective_to: rate.effective_to || null
      }));

      const payload = {
        institution_id: instId,
        academic_year: formData.academic_year,
        rates: cleanedRates
      };
      dispatch(createBillingRate(payload));
    }
  };

  const rateColumns = [
    { key: 'academic_year', label: 'Academic Year' },
    { key: 'designation', label: 'Designation', render: (val) => DESIGNATIONS[val] || val },
    { key: 'lecture_type', label: 'Type', render: (val) => LECTURE_TYPES[val] || val },
    { key: 'rate_per_lecture', label: 'Rate (₹)', render: (val) => <span className="font-bold text-indigo-600">₹{val}</span> },
    { key: 'effective_from', label: 'From' },
    { key: 'is_active', label: 'Status', render: (val) => <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${val ? 'bg-slate-50 text-slate-700' : 'bg-slate-100 text-slate-500'}`}>{val ? 'Active' : 'Inactive'}</span> },
  ];

  const billColumns = [
    { key: 'institution_name', label: 'Institution' },
    { key: 'faculty_name', label: 'Faculty' },
    { key: 'academic_year', label: 'Year' },
    { key: 'period', label: 'Period', render: (_, row) => <span className="text-[10px] font-bold text-slate-500">{row.period_start} to {row.period_end}</span> },
    { key: 'total_amount', label: 'Amount', render: (val) => <span className="font-bold text-indigo-600">₹{val}</span> },
    { key: 'bill_status', label: 'Status', render: (val) => <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${val === 'DRAFT' ? 'bg-slate-100 text-slate-600' : val === 'SUBMITTED' ? 'bg-blue-100 text-blue-600' : val.includes('APPROVED') ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>{(val || '').replace('_', ' ')}</span> }
  ];

  const anomalyColumns = [
    { key: 'faculty_name', label: 'Faculty' },
    { key: 'institution_name', label: 'Institution' },
    { key: 'anomaly_type', label: 'Issue', render: (val) => <span className="text-xs font-bold text-red-600 uppercase tracking-tighter italic">{val.replace('_', ' ')}</span> },
    { key: 'confidence', label: 'AI Confidence', render: (val) => <span className={`text-xs font-bold ${val > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{val}%</span> },
    { key: 'created_at', label: 'Detected On', render: (val) => <span className="text-[10px] font-medium text-slate-400">{new Date(val).toLocaleDateString()}</span> }
  ];

  const approvalColumns = [
    { key: 'level', label: 'Level', render: (val) => <span className="font-bold text-[10px] uppercase tracking-tighter">{val.replace('_', ' ')}</span> },
    { key: 'action', label: 'Action', render: (val) => <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter ${val === 'APPROVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>{val}</span> },
    { key: 'approver_name', label: 'Approver' },
    { key: 'remarks', label: 'Remarks' },
    { key: 'created_at', label: 'Date', render: (val) => <span className="text-[10px] text-slate-400 font-medium">{new Date(val).toLocaleDateString()}</span> }
  ];

  const totalPages = Math.ceil((activeTab === 'rates' ? totalRates : totalBills) / limit);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Institutional <span className="text-indigo-600">Billing Control</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Global management of billing rates and claims across all institutes.
          </p>
        </div>
        
        {activeTab === 'rates' && (
          <Button 
            onClick={() => setIsModalOpen(true)}
            disabled={!selectedInstituteId}
            className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-slate-200 flex items-center transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            <Plus size={20} className="mr-2" />
            CREATE RATE
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button 
          onClick={() => { setActiveTab('rates'); dispatch(setPage(1)); }}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'rates' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Rate Management
        </button>
        <button 
          onClick={() => { setActiveTab('bills'); dispatch(setPage(1)); }}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'bills' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Bill Tracking
        </button>
        <button 
          onClick={() => setActiveTab('ai-monitor')}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'ai-monitor' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          AI Monitor
        </button>
      </div>

      {activeTab === 'rates' && (
        <>
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Building2 size={28} />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Target Institution</label>
                <div className="relative">
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:border-indigo-500 transition-all cursor-pointer appearance-none pr-10"
                    value={selectedInstituteId}
                    onChange={(e) => setSelectedInstituteId(e.target.value)}
                  >
                    <option value="">Choose an Institute to manage rates...</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Filter size={16} className="text-slate-400" />
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-48">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Academic Year</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:border-indigo-500 transition-all cursor-pointer appearance-none pr-10"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="2026-2027">2026-2027</option>
                  <option value="2025-2026">2025-2026</option>
                </select>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col min-h-[500px]">
            {fetching ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-4">
                <Loader2 size={40} className="animate-spin text-indigo-500" />
                <p className="text-sm font-bold text-slate-400 animate-pulse text-center">Syncing records...<br/><span className="text-[10px] font-bold uppercase tracking-widest">Please Wait</span></p>
              </div>
            ) : (
              <Table 
                columns={rateColumns} 
                data={rates} 
                actions={(row) => (
                  <Button variant="ghost" onClick={() => handleEdit(row)} title="Edit Rate"><Edit size={18} /></Button>
                )}
              />
            )}
          </div>
        </>
      )}

      {activeTab === 'bills' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col min-h-[600px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mr-4">
                  <FileText size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Global Bill Tracking</h3>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Filter by institute/faculty..." 
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 w-64"
                />
              </div>
            </div>

            <div className="flex-1">
              {fetching ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-4">
                  <Loader2 size={40} className="animate-spin text-indigo-500" />
                </div>
              ) : bills.length > 0 ? (
                <Table 
                  columns={billColumns} 
                  data={bills} 
                  className="border-none shadow-none"
                  actions={(row) => (
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        className="p-2 h-auto text-slate-400 hover:bg-slate-50 rounded-xl"
                        onClick={() => handleViewDetails(row.id)}
                      >
                        <Eye size={18} />
                      </Button>
                    </div>
                  )}
                />
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-10">
                  <ReceiptText size={40} className="text-slate-200 mb-4" />
                  <p className="text-slate-400 font-bold">No bills found in the system</p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => dispatch(setPage(page - 1))} disabled={page === 1} className="rounded-xl px-3 border-slate-200"><ChevronLeft size={18} /></Button>
                  <div className="flex items-center space-x-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button key={i} onClick={() => dispatch(setPage(i + 1))} className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${page === i + 1 ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'hover:bg-slate-100 text-slate-500'}`}>{i + 1}</button>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => dispatch(setPage(page + 1))} disabled={page === totalPages} className="rounded-xl px-3 border-slate-200"><ChevronRight size={18} /></Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'ai-monitor' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
           {/* Summary Stats */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center"><Zap size={12} className="mr-1 text-amber-500" /> Total Scanned</p>
                <p className="text-3xl font-bold text-slate-900">{aiMonitorData?.total_scanned || 0}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-2 flex items-center"><ShieldAlert size={12} className="mr-1" /> Anomalies</p>
                <p className="text-3xl font-bold text-red-600">{aiMonitorData?.anomalies_count || 0}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2 flex items-center"><TrendingUp size={12} className="mr-1" /> Precision</p>
                <p className="text-3xl font-bold text-indigo-600">{aiMonitorData?.precision || '98'}%</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm bg-indigo-50/20 border-indigo-100">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2 flex items-center"><BarChart3 size={12} className="mr-1" /> Verified Rate</p>
                <p className="text-3xl font-bold text-indigo-600 italic tracking-tighter">{aiMonitorData?.verification_rate || '100'}%</p>
              </div>
           </div>

           {/* Anomaly Table */}
           <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm min-h-[500px]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mr-4">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">AI Anomaly Reports</h3>
                    <p className="text-xs font-bold text-slate-400">Claims flagged for manual administrative review.</p>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                {fetching ? (
                  <div className="h-64 flex flex-col items-center justify-center"><Loader2 size={40} className="animate-spin text-red-500" /></div>
                ) : (aiMonitorData?.anomalies || []).length > 0 ? (
                  <Table 
                    columns={anomalyColumns} 
                    data={aiMonitorData.anomalies} 
                    className="border-none shadow-none"
                  />
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-10 grayscale opacity-40">
                    <ShieldCheck size={64} className="text-indigo-600 mb-6" />
                    <h3 className="text-xl font-bold text-slate-900">System Secure</h3>
                    <p className="text-slate-500 font-medium max-w-sm">No anomalies detected by the AI monitor at this time.</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      )}

      {/* Bill Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={closeModal} title="Bill Audit Log" size="lg">
        {loading && !selectedBill ? <div className="h-64 flex items-center justify-center"><Loader2 size={40} className="animate-spin text-indigo-500" /></div> : selectedBill && (
          <div className="space-y-8 p-1">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Institution</p>
                <p className="text-sm font-bold text-slate-900">
                  {bills.find(b => b.id === selectedBill.id)?.institution_name || selectedBill.institution_name || 'N/A'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Faculty</p>
                <p className="text-sm font-bold text-slate-900">
                  {bills.find(b => b.id === selectedBill.id)?.faculty_name || selectedBill.faculty_name || 'N/A'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 border-l-4 border-l-indigo-500 text-indigo-600">
                <p className="text-[9px] font-bold uppercase tracking-widest mb-1">Amount</p>
                <p className="text-xl font-bold">₹{selectedBill.net_amount || 0}</p>
              </div>
              <div className={`rounded-2xl p-4 border flex flex-col justify-center items-center ${selectedBillReadiness?.is_ready ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                <div className="flex items-center mb-1">
                   <Cpu size={14} className="mr-1" />
                   <p className="text-[9px] font-bold uppercase tracking-widest">AI Readiness</p>
                </div>
                <p className="text-xs font-bold uppercase tracking-tighter">{selectedBillReadiness?.is_ready ? 'READY' : 'PENDING'}</p>
              </div>
            </div>
            
            {/* Readiness Details if not ready */}
            {!selectedBillReadiness?.is_ready && selectedBillReadiness?.reasons?.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 animate-in fade-in duration-500">
                <p className="text-[9px] font-bold text-amber-700 uppercase tracking-widest mb-2 flex items-center"><AlertCircle size={12} className="mr-1" /> Missing Prerequisites</p>
                <ul className="space-y-1">
                  {selectedBillReadiness.reasons.map((reason, idx) => (
                    <li key={idx} className="text-[10px] font-bold text-amber-600 flex items-center">
                      <div className="w-1 h-1 bg-amber-400 rounded-full mr-2" /> {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
               <div className="flex items-center px-1 text-slate-400"><History size={16} className="mr-2" /><h4 className="text-xs font-bold uppercase tracking-widest">Approval History</h4></div>
               <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                  <Table columns={approvalColumns} data={selectedBillApprovals} className="border-none shadow-none" />
               </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
               <Button 
                variant="outline" 
                className="rounded-xl font-bold text-indigo-600 border-indigo-100 hover:bg-indigo-50 flex items-center"
                onClick={() => handleSnapshot(selectedBill.id)}
               >
                 <Camera size={16} className="mr-2" /> TAKE SNAPSHOT
               </Button>
               <Button onClick={closeModal} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold">CLOSE</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Rate Form Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingRateId ? "Update Rate" : "Create Rates"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-8 p-1">
           <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center"><Calendar size={14} className="mr-2 text-indigo-500" /> Academic Session</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500" value={formData.academic_year} onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })} disabled={!!editingRateId}>
                <option value="2026-2027">2026-2027</option>
                <option value="2025-2026">2025-2026</option>
              </select>
           </div>
           <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {formData.rates.map((rate, index) => (
                <div key={index} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 relative">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase mb-1">Designation</label>
                      <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold disabled:opacity-50" value={rate.designation} onChange={(e) => handleRateChange(index, 'designation', e.target.value)} disabled={!!editingRateId}>
                        {Object.entries(DESIGNATIONS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase mb-1">Type</label>
                      <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold disabled:opacity-50" value={rate.lecture_type} onChange={(e) => handleRateChange(index, 'lecture_type', e.target.value)} disabled={!!editingRateId}>
                        {Object.entries(LECTURE_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Rate (₹)" type="number" value={rate.rate_per_lecture} onChange={(e) => handleRateChange(index, 'rate_per_lecture', e.target.value)} className="bg-white rounded-xl" />
                    <Input label="Effective From" type="date" value={rate.effective_from} onChange={(e) => handleRateChange(index, 'effective_from', e.target.value)} className="bg-white rounded-xl" disabled={!!editingRateId} />
                  </div>
                </div>
              ))}
           </div>
           <div className="flex gap-3 pt-4">
             <Button type="button" variant="outline" onClick={closeModal} className="flex-1 rounded-xl font-bold">CANCEL</Button>
             <Button disabled={loading} className="flex-[2] bg-slate-900 text-white rounded-xl font-bold">
               {loading ? <Loader2 className="animate-spin" /> : editingRateId ? 'UPDATE RATE' : 'SUBMIT RATES'}
             </Button>
           </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminBillingDashboard;
