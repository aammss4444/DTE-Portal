import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ReceiptText, 
  CheckCircle, 
  Loader2, 
  ChevronRight, 
  ChevronLeft,
  Search,
  CheckCircle2,
  XCircle as CloseCircle,
  MessageSquare,
  History,
  Info,
  ListOrdered
} from 'lucide-react';
import { Button } from '../../components/common/UIComponents';
import { Table } from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { 
  fetchBills, 
  fetchBillingSummary,
  approveBill,
  fetchBillDetails,
  fetchBillApprovals,
  resetBillingStatus, 
  setPage 
} from '../admin/billingSlice';
import toast from 'react-hot-toast';

const ROBillingDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { 
    bills, 
    totalBills, 
    summary,
    selectedBill, 
    selectedBillApprovals, 
    page, 
    limit, 
    loading, 
    fetching, 
    success, 
    error 
  } = useSelector((state) => state.billing);

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  const [selectedBillId, setSelectedBillId] = useState(null);

  const [approveData, setApproveData] = useState({
    action: 'APPROVE', // or 'REJECT'
    remarks: ''
  });

  // Fetch data on load
  useEffect(() => {
    dispatch(fetchBills({ 
      page,
      limit
    }));
    dispatch(fetchBillingSummary({}));
  }, [dispatch, page, limit]);

  useEffect(() => {
    if (success) {
      toast.success('Billing action successful!');
      dispatch(fetchBills({ page: 1, limit }));
      dispatch(fetchBillingSummary({}));
      closeModals();
      dispatch(resetBillingStatus());
    }
    if (error) {
      toast.error(error);
      dispatch(resetBillingStatus());
    }
  }, [success, error, dispatch, limit]);
  function closeModals() {
    setIsApproveModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedBillId(null);
    setApproveData({
      action: 'APPROVE',
      remarks: ''
    });
  }

  const handleOpenApproveModal = (billId) => {
    setSelectedBillId(billId);
    setIsApproveModalOpen(true);
  };

  const handleViewDetails = (billId) => {
    setSelectedBillId(billId);
    dispatch(fetchBillDetails(billId));
    dispatch(fetchBillApprovals(billId));
    setIsDetailsModalOpen(true);
  };

  const handleApprove = (e) => {
    e.preventDefault();
    if (!selectedBillId) return;
    dispatch(approveBill({ 
      billId: selectedBillId, 
      action: approveData.action, 
      remarks: approveData.remarks 
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-100 text-slate-600';
      case 'SUBMITTED': return 'bg-blue-100 text-blue-600';
      case 'PRINCIPAL_APPROVED': return 'bg-emerald-100 text-emerald-600';
      case 'RO_APPROVED': return 'bg-teal-100 text-teal-600';
      case 'REJECTED': return 'bg-red-100 text-red-600';
      default: return 'bg-indigo-100 text-indigo-600';
    }
  };

  const columns = [
    { 
      key: 'institution_name', 
      label: 'Institution',
      render: (val) => <span className="font-bold text-slate-900">{val || 'N/A'}</span>
    },
    { 
      key: 'faculty_name', 
      label: 'Faculty',
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700">{row.faculty_name || 'N/A'}</span>
          <span className="text-[10px] text-slate-400 font-medium">{row.academic_year}</span>
        </div>
      )
    },
    { 
      key: 'period', 
      label: 'Period',
      render: (_, row) => (
        <span className="text-xs font-medium text-slate-600">
          {row.period_start} to {row.period_end}
        </span>
      )
    },
    { 
      key: 'total_amount', 
      label: 'Amount',
      render: (val) => <span className="font-bold text-indigo-600">₹{val}</span>
    },
    { 
      key: 'bill_status', 
      label: 'Status',
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(val)}`}>
          {(val || '').replace('_', ' ')}
        </span>
      )
    }
  ];

  const itemColumns = [
    { 
      key: 'lecture_date', 
      label: 'Date',
      render: (val) => <span className="text-xs font-bold text-slate-900">{new Date(val).toLocaleDateString()}</span>
    },
    { key: 'subject_name', label: 'Subject' },
    { key: 'lecture_type', label: 'Type' },
    { 
      key: 'slot_number', 
      label: 'Slot',
      render: (val) => <span className="font-bold text-slate-600">Slot {val}</span>
    },
    { 
      key: 'rate_per_lecture', 
      label: 'Rate',
      render: (val) => <span className="text-xs font-bold text-slate-400">₹{val}/lec</span>
    },
    { 
      key: 'amount', 
      label: 'Total',
      render: (val) => <span className="font-bold text-indigo-600">₹{val}</span>
    }
  ];

  const approvalColumns = [
    { 
      key: 'level', 
      label: 'Level',
      render: (val) => <span className="font-bold text-[10px] uppercase tracking-tighter">{val.replace('_', ' ')}</span>
    },
    { 
      key: 'action', 
      label: 'Action',
      render: (val) => (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter ${val === 'APPROVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
          {val}
        </span>
      )
    },
    { key: 'approver_name', label: 'Approver' },
    { key: 'remarks', label: 'Remarks' },
    { 
      key: 'created_at', 
      label: 'Date',
      render: (val) => <span className="text-[10px] text-slate-400 font-medium">{new Date(val).toLocaleDateString()}</span>
    }
  ];

  const totalPages = Math.ceil(totalBills / limit);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Regional <span className="text-indigo-600">Billing Approvals</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Review and approve honorarium claims from institutes in your region.
          </p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Pending RO Approval</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-amber-500">{summary?.bills_pending_ro || 0}</p>
            <span className="text-[10px] font-bold text-amber-400 uppercase">Claims</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Total Generated</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-emerald-600">{summary?.total_bills_generated || 0}</p>
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Bills</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm border-l-4 border-l-indigo-500 bg-indigo-50/20">
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2">Total Gross Amount</p>
          <div className="flex items-center text-indigo-600">
            <p className="text-3xl font-bold italic tracking-tighter">₹{summary?.total_gross_amount?.toLocaleString() || 0}</p>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col min-h-[500px]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mr-4">
              <ReceiptText size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Regional Claims</h3>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search faculty or institute..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 w-64"
              />
            </div>
          </div>
        </div>

        <div className="flex-1">
          {fetching ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
              <Loader2 size={40} className="animate-spin text-indigo-500" />
              <p className="text-sm font-bold text-slate-400 animate-pulse text-center">Syncing regional billing records...<br/><span className="text-[10px] font-bold uppercase tracking-widest tracking-tighter">Please Wait</span></p>
            </div>
          ) : bills.length > 0 ? (
            <Table 
              columns={columns} 
              data={bills} 
              className="border-none shadow-none"
              actions={(row) => (
                <div className="flex justify-end space-x-2">
                  {row.current_approver_role === 'RO' && (
                    <Button 
                      variant="ghost" 
                      className="p-2 h-auto text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center text-[10px] font-bold uppercase tracking-tighter"
                      onClick={() => handleOpenApproveModal(row.id)}
                    >
                      <CheckCircle size={14} className="mr-1" /> Review
                    </Button>
                  )}

                </div>
              )}
            />
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-10">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-200">
                <ReceiptText size={32} />
              </div>
              <p className="text-slate-400 font-bold">No billing records found</p>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-1">Pending claims will appear here</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => dispatch(setPage(page - 1))}
                disabled={page === 1}
                className="rounded-xl px-3 border-slate-200"
              >
                <ChevronLeft size={18} />
              </Button>
              <div className="flex items-center space-x-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => dispatch(setPage(i + 1))}
                    className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                      page === i + 1 ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'hover:bg-slate-100 text-slate-500'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => dispatch(setPage(page + 1))}
                disabled={page === totalPages}
                className="rounded-xl px-3 border-slate-200"
              >
                <ChevronRight size={18} />
              </Button>
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Page {page} of {totalPages}
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={closeModals}
        title="Bill Details & Audit Trail"
        size="lg"
      >
        {loading && !selectedBill ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 size={40} className="animate-spin text-indigo-500" />
          </div>
        ) : selectedBill && (
          <div className="space-y-8 p-1">
            {/* Bill Info Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Faculty Member</p>
                <p className="text-sm font-bold text-slate-900">
                  {bills.find(b => b.id === selectedBill.id)?.faculty_name || selectedBill.faculty_name || 'N/A'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Claim Period</p>
                <p className="text-sm font-bold text-slate-900">{selectedBill.period_start} - {selectedBill.period_end}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 border-l-4 border-l-indigo-500">
                <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-xl font-bold text-indigo-600">₹{selectedBill.net_amount || 0}</p>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center px-1">
                <ListOrdered size={16} className="text-slate-400 mr-2" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Lecture Breakdown</h4>
              </div>
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm max-h-[300px] overflow-y-auto custom-scrollbar">
                <Table 
                  columns={itemColumns} 
                  data={selectedBill.line_items || []} 
                  className="border-none shadow-none"
                />
                {(selectedBill.line_items || []).length === 0 && (
                  <div className="py-12 text-center flex flex-col items-center">
                    <ReceiptText size={32} className="text-slate-200 mb-3" />
                    <p className="text-xs font-bold text-slate-400">No lecture items found in this bill</p>
                  </div>
                )}
              </div>
            </div>

            {/* Approval Timeline */}
            <div className="space-y-4">
              <div className="flex items-center px-1">
                <History size={16} className="text-slate-400 mr-2" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Approval History</h4>
              </div>
              
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <Table 
                  columns={approvalColumns} 
                  data={selectedBillApprovals} 
                  className="border-none shadow-none"
                />
                {selectedBillApprovals.length === 0 && (
                  <div className="py-12 text-center flex flex-col items-center">
                    <Info size={32} className="text-slate-200 mb-3" />
                    <p className="text-xs font-bold text-slate-400">No approval records yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                onClick={closeModals}
                className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition-all"
              >
                CLOSE
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Approval Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={closeModals}
        title="Review & Approve Bill"
        size="md"
      >
        <form onSubmit={handleApprove} className="space-y-6 p-1">
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Action</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setApproveData({...approveData, action: 'APPROVE'})}
                className={`flex items-center justify-center p-4 rounded-2xl border-2 transition-all ${approveData.action === 'APPROVE' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-100 bg-white text-slate-400 font-bold'}`}
              >
                <CheckCircle2 size={20} className="mr-2" /> APPROVE
              </button>
              <button
                type="button"
                onClick={() => setApproveData({...approveData, action: 'REJECT'})}
                className={`flex items-center justify-center p-4 rounded-2xl border-2 transition-all ${approveData.action === 'REJECT' ? 'border-red-500 bg-red-50 text-red-700 font-bold' : 'border-slate-100 bg-white text-slate-400 font-bold'}`}
              >
                <CloseCircle size={20} className="mr-2" /> REJECT
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center">
              <MessageSquare size={14} className="mr-2 text-indigo-500" /> Remarks (Optional)
            </label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:border-indigo-500 min-h-[120px] transition-all"
              placeholder="Add your comments here..."
              value={approveData.remarks}
              onChange={(e) => setApproveData({...approveData, remarks: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={closeModals}
              className="flex-1 rounded-xl font-bold text-slate-500 border-slate-200 hover:bg-slate-50"
            >
              CANCEL
            </Button>
            <Button 
              disabled={loading}
              className={`flex-[2] text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 ${approveData.action === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'}`}
            >
              {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : `CONFIRM ${approveData.action}`}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ROBillingDashboard;
