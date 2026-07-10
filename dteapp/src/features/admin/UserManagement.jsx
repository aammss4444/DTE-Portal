import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { fetchUsers, removeUser } from '../user/userSlice';
import { cn } from '../../utils/cn';

const UserManagement = () => {
  const { users, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers = users.filter(user => 
    (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.role?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setDeleteLoading(id);
      try {
        const resultAction = await dispatch(removeUser(id));
        if (removeUser.fulfilled.match(resultAction)) {
          alert(resultAction.payload.message || 'User deleted successfully.');
        } else {
          alert(resultAction.payload || 'Failed to delete user.');
        }
      } catch (err) {
        alert('An unexpected error occurred during deletion.');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-secondary font-medium italic">Fetching latest users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-accent outline-none transition-all"
            />
          </div>
          <button
            onClick={() => navigate('/admin/users/add')}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            <span>ADD NEW USER</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 animate-in zoom-in-95">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
          <button 
            onClick={() => dispatch(fetchUsers())}
            className="ml-auto underline font-bold"
          >
            Retry
          </button>
        </div>
      )}

      <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-foreground">{user.full_name || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 text-secondary">{user.email}</td>
                  <td className="px-6 py-4 text-secondary">{user.phone_number || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      user.role === 'ADMIN' ? "bg-indigo-100 text-indigo-600" : 
                      user.role === 'PRINCIPAL' ? "bg-blue-100 text-blue-600" :
                      "bg-emerald-100 text-emerald-600"
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        disabled={deleteLoading === user.id}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deleteLoading === user.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-secondary italic">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-muted/20 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-sm text-secondary">
            Showing <span className="font-semibold text-foreground">1</span> to <span className="font-semibold text-foreground">{filteredUsers.length}</span> of <span className="font-semibold text-foreground">{filteredUsers.length}</span> records
          </p>
          <div className="flex items-center gap-2">
            <button disabled className="p-2 border border-border rounded-lg text-secondary disabled:opacity-50">
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-1">
              <button className="px-3.5 py-1.5 bg-accent text-white rounded-lg font-bold text-sm">1</button>
            </div>
            <button disabled className="p-2 border border-border rounded-lg text-secondary disabled:opacity-50">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
