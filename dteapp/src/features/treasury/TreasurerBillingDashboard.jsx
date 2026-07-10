import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  Eye, 
  Loader2, 
  Building2,
  FileText,
  Search,
  Banknote,
  ShieldCheck,
  History,
  ArrowUpRight
} from 'lucide-react';
import { Button, Input, Select } from '../../components/common/UIComponents';
import { Table } from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { 
  fetchBills, 
  fetchBillDetails, 
  fetchBillApprovals, 
  approveBill,
  resetBillingStatus 
} from '../admin/billingSlice';
import { fetchInstitutions } from '../admin/institutionSlice';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const TreasurerBillingDashboard = () => {
  const dispatch = useDispatch();
  const { bills, selectedBill, selectedBillApprovals, selectedBillReadiness, loading, fetching, success, error } = useSelector((state) => state.billing);
  const { institutions } = useSelector((state) => state.institutions);

  const [filterInst, setFilterInst] = useState('');
  const [filterStatus, setFilterStatus] = useState('RO_APPROVED');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (institutions.length === 0) {
      dispatch(fetchInstitutions({ page: 1, limit: 100 }));
    }
  }, [dispatch, institutions.length]);

  useEffect(() => {
    dispatch(fetchBills({ 
      institution_id: filterInst || undefined, 
      bill_status: filterStatus !== 'ALL' ? filterStatus : undefined 
    }));
  }, [dispatch, filterInst, filterStatus]);

  useEffect(() => {
    if (success) {
      toast.success('Disbursement processed successfully');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDetailsModalOpen(false);
      setRemarks('');
      dispatch(resetBillingStatus());
      dispatch(fetchBills({ institution_id: filterInst || undefined, bill_status: filterStatus !== 'ALL' ? filterStatus : undefined }));
    }
    if (error) {
      toast.error(typeof error === 'string' ? error : (error?.message || JSON.stringify(error)));
      dispatch(resetBillingStatus());
    }
  }, [success, error, dispatch, filterInst, filterStatus]);

  const handleViewDetails = (billId) => {
    dispatch(fetchBillDetails(billId));
    dispatch(fetchBillApprovals(billId));
    setIsDetailsModalOpen(true);
  };

  const handleAction = (action) => {
    if (action === 'REJECT' && !remarks) {
      return toast.error('Please provide remarks for rejection');
    }
    if (window.confirm(`Are you sure you want to ${action === 'APPROVE' ? 'disburse' : 'reject'} this bill?`)) {
      dispatch(approveBill({ billId: selectedBill.id, action, remarks }));
    }
  };

  const columns = [
    { key: 'id', label: 'Bill ID', render: (val) => <span className="text-[10px] font-black text-slate-400">#{val.substring(0, 8)}</span> },
    { key: 'institution_name', label: 'Institution' },
    { key: 'faculty_name', label: 'Faculty' },
    { key: 'total_amount', label: 'Disbursement Amount', render: (val) => <span className="font-black text-emerald-600 italic">₹{val}</span> },
    { key: 'bill_status', label: 'Status', render: (val) => (
      <span className={cn(
        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
        val === 'RO_APPROVED' ? "bg-indigo-100 text-indigo-600" : 
        val === 'TREASURY_PROCESSED' ? "bg-emerald-100 text-emerald-600" : 
        val === 'REJECTED' ? "bg-rose-100 text-rose-600" :
        "bg-slate-100 text-slate-500"
      )}>
        {val?.replace('_', ' ')}
      </span>
    )}
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Treasury <span className="text-emerald-600">Disbursement</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Finalize and authorize financial disbursements for verified institutional claims.
          </p>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center"><Banknote size={12} className="mr-1 text-emerald-500" /> Pending Payout</p>
           <p className="text-2xl font-black text-slate-900">₹4.2L</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center"><ShieldCheck size={12} className="mr-1" /> Approved Today</p>
           <p className="text-2xl font-black text-indigo-600">₹1.8L</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center"><History size={12} className="mr-1" /> Total Paid</p>
           <p className="text-2xl font-black text-slate-900">₹28.4L</p>
        </div>
        <div className="bg-emerald-600 rounded-[2rem] p-6 shadow-lg shadow-emerald-200 text-white">
           <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60 flex items-center"><ArrowUpRight size={12} className="mr-1" /> Liquidity Status</p>
           <p className="text-2xl font-black italic">OPTIMAL</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
        <div className="flex flex-wrap gap-6 items-end">
          <div className="flex-1 min-w-[250px]">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Target Institution</label>
             <select 
               className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-black outline-none focus:border-emerald-500 cursor-pointer appearance-none"
               value={filterInst}
               onChange={(e) => setFilterInst(e.target.value)}
             >
               <option value="">All Institutional Claims</option>
               {institutions.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
             </select>
          </div>
          <div className="flex-1 min-w-[200px]">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Payout Status</label>
             <select 
               className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-black outline-none focus:border-emerald-500 cursor-pointer appearance-none"
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
             >
                 <option value="RO_APPROVED">Awaiting Disbursement</option>
                 <option value="TREASURY_PROCESSED">Completed Payouts</option>
                 <option value="REJECTED">Rejected by Treasury</option>
                <option value="ALL">All Financial Records</option>
             </select>
          </div>
          <div className="flex-none">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Search payout ID..." className="pl-11 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 w-64" />
             </div>
          </div>
        </div>
      </div>

      {/* Disbursement Table */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-1 shadow-sm overflow-hidden">
        {fetching ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-4">
             <Loader2 size={48} className="animate-spin text-emerald-500" />
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Treasury Records...</p>
          </div>
        ) : (
          <Table 
            columns={columns} 
            data={bills} 
            actions={(row) => (
              <Button variant="ghost" onClick={() => handleViewDetails(row.id)} className={cn(
                "font-black text-[10px] uppercase tracking-widest",
                row.bill_status === 'RO_APPROVED' ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-50"
              )}>
                <Eye size={16} className="mr-2" /> {row.bill_status === 'RO_APPROVED' ? 'DISBURSE' : 'VIEW'}
              </Button>
            )}
          />
        )}
      </div>

      {/* Disbursement Modal */}
      <Modal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        title="Disbursement Authorization"
        size="lg"
      >
        {selectedBill && (
          <div className="space-y-8 p-1">
             {/* Payout Details */}
             <div className="bg-emerald-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-emerald-200">
                <div className="relative z-10">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Total Payable Amount</p>
                   <h2 className="text-5xl font-black italic tracking-tighter">₹{selectedBill.total_amount}</h2>
                   <div className="mt-8 flex items-center gap-6">
                      <div>
                         <p className="text-[9px] font-black uppercase opacity-60">Recipient</p>
                         <p className="font-bold text-sm">{selectedBill.faculty_name}</p>
                      </div>
                      <div>
                         <p className="text-[9px] font-black uppercase opacity-60">Institute</p>
                         <p className="font-bold text-sm">{selectedBill.institution_name}</p>
                      </div>
                   </div>
                </div>
                 <Banknote size={120} className="absolute -right-10 -bottom-10 text-white opacity-10 rotate-12" />
                 
              </div>

             {/* Verification History */}
             <div className="space-y-4">
                <div className="flex items-center gap-2 ml-1">
                   <ShieldCheck size={16} className="text-emerald-500" />
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pre-Disbursement Audit History</h4>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-4">
                    {Array.isArray(selectedBillApprovals) && selectedBillApprovals.map((app, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                         <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={12} />
                         </div>
                         <div className="flex-1">
                            <p className="text-xs font-bold text-slate-900">{(app.approver_role || app.level || '').replace('_', ' ')} Verified</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{app.remarks || 'Standard endorsement applied.'}</p>
                         </div>
                      </div>
                    ))}
                </div>
             </div>

             {/* Treasury Action */}
              {selectedBill.bill_status === 'RO_APPROVED' && (
               <div className="space-y-6">
                  <textarea 
                    className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-emerald-500 min-h-[100px] shadow-sm"
                    placeholder="Provide disbursement remarks or transaction ID reference..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />

                  <div className="flex gap-4">
                     <Button 
                       onClick={() => handleAction('REJECT')}
                       disabled={loading}
                       className="bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest px-8 py-4 transition-all"
                     >
                       REJECT
                     </Button>
                     <Button 
                       onClick={() => handleAction('APPROVE')}
                       disabled={loading}
                       className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest py-4 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center"
                     >
                       {loading ? <Loader2 className="animate-spin" /> : <Banknote size={18} className="mr-2" />}
                       AUTHORIZE DISBURSEMENT
                     </Button>
                  </div>
               </div>
             )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TreasurerBillingDashboard;
